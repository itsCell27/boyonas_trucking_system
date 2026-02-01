<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'config.php';

header('Content-Type: application/json');

// Ensure request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$truck_id = isset($_POST['truck_id']) ? intval($_POST['truck_id']) : 0;
if ($truck_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid truck_id']);
    exit;
}

// NEW: prevent empty upload (no OR + no CR)
$noOR = !isset($_FILES['or_document']) || $_FILES['or_document']['error'] === UPLOAD_ERR_NO_FILE;
$noCR = !isset($_FILES['cr_document']) || $_FILES['cr_document']['error'] === UPLOAD_ERR_NO_FILE;

if ($noOR && $noCR) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please upload at least one document (OR or CR)'
    ]);
    exit;
}

// Convenience shortcuts
$filesystemDocsDir = UPLOAD_ROOT . TRUCK_DOCUMENTS_DIR;  
$dbDocsPrefix      = TRUCK_DOCUMENTS_DIR;

if (!is_dir($filesystemDocsDir)) {
    mkdir($filesystemDocsDir, 0755, true);
}

// Helper to generate unique filenames
function unique_filename($dir, $original) {
    $ext = pathinfo($original, PATHINFO_EXTENSION);
    $base = pathinfo($original, PATHINFO_FILENAME);
    $base = preg_replace('/[^A-Za-z0-9_\-]/', '_', $base);
    return $base . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
}

try {
    $conn->begin_transaction();
    $anyExpired = false;

    /**
     * Processes OR or CR document update
     */
    $processDoc = function($type, $fileField, $expiryField) use (
        $conn, $truck_id, $filesystemDocsDir, $dbDocsPrefix, &$anyExpired
    ) {
        $hasUpload = isset($_FILES[$fileField]) && is_uploaded_file($_FILES[$fileField]['tmp_name']);
        $expiryInput = isset($_POST[$expiryField]) ? trim($_POST[$expiryField]) : null;
        if ($expiryInput === '') $expiryInput = null;

        // Require expiry date if uploading a new file
        if ($hasUpload && !$expiryInput) {
            throw new Exception("Expiry date is required when uploading a $type document.");
        }

        // If no change at all, skip
        if (!$hasUpload && !$expiryInput) return;

        // Fetch existing document
        $stmt = $conn->prepare("SELECT document_id, file_path FROM truck_documents WHERE truck_id = ? AND document_type = ?");
        $stmt->bind_param("is", $truck_id, $type);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $existingDocId = $existing['document_id'] ?? null;
        $existingPath  = $existing['file_path'] ?? null;

        // If uploading new file → delete old file and DB row
        if ($hasUpload) {
            if ($existingPath) {
                $abs = UPLOAD_ROOT . $existingPath;
                if (is_file($abs)) @unlink($abs);
            }
            if ($existingDocId) {
                $del = $conn->prepare("DELETE FROM truck_documents WHERE document_id = ?");
                $del->bind_param("i", $existingDocId);
                $del->execute();
                $del->close();
            }
        }

        // Expiry & status
        $expirySql = null;
        $docStatus = 'Valid';

        if ($expiryInput) {
            $d = DateTime::createFromFormat('Y-m-d', $expiryInput);
            if (!$d) throw new Exception("Invalid expiry date for $type");

            $expirySql = $d->format('Y-m-d');

            $today = new DateTimeImmutable('today');
            $exp   = new DateTimeImmutable($expirySql);

            if ($exp < $today) {
                $docStatus = 'Expired';
                $anyExpired = true;
            }
        }

        // If file uploaded, store it
        $dbFilePath = null;
        if ($hasUpload) {
            $file = $_FILES[$fileField];
            $allowed = [
                'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
            ];

            $mime = mime_content_type($file['tmp_name']);
            if (!in_array($mime, $allowed)) {
                throw new Exception("Invalid file type for $type");
            }

            $filename = unique_filename($filesystemDocsDir, $file['name']);
            $dest = $filesystemDocsDir . $filename;

            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                throw new Exception("Failed to store $type document");
            }

            $dbFilePath = "../private_uploads/documents/truck_documents/" . $filename;
        }

        // Insert new row
        $ins = $conn->prepare("
            INSERT INTO truck_documents (truck_id, document_type, file_path, expiry_date, status)
            VALUES (?, ?, ?, ?, ?)
        ");
        $ins->bind_param(
            "issss",
            $truck_id,
            $type,
            $dbFilePath,
            $expirySql,
            $docStatus
        );
        $ins->execute();
        $ins->close();
    };


    // Process OR + CR
    $processDoc('OR', 'or_document', 'or_expiry_date');
    $processDoc('CR', 'cr_document', 'cr_expiry_date');

    // Update truck status
    if ($anyExpired) {
        $u = $conn->prepare("UPDATE trucks SET document_status='Expired', operational_status='Maintenance' WHERE truck_id=?");
    } else {
        $u = $conn->prepare("UPDATE trucks SET document_status='Valid', operational_status='Available' WHERE truck_id=?");
    }
    $u->bind_param("i", $truck_id);
    $u->execute();
    $u->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'expired' => $anyExpired
    ]);
    exit;

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    error_log("update_truck_documents.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}
