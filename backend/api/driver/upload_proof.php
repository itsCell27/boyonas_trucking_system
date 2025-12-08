<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
session_start();

header('Content-Type: application/json');

function respond_error($msg, $code = 400)
{
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $msg]);
    exit;
}

function log_error_detail($msg)
{
    $logDir = __DIR__ . '/../../logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
    @file_put_contents($logDir . '/upload_proof.log', "[" . date('Y-m-d H:i:s') . "] $msg\n", FILE_APPEND);
}

try {

    if (!isset($_SESSION['user_id'])) {
        respond_error("Unauthorized", 401);
    }

    $userId = (int)$_SESSION['user_id'];
    $assignmentId = (int)($_POST['assignment_id'] ?? 0);
    $notes = trim($_POST['notes'] ?? "");

    if ($assignmentId <= 0) {
        respond_error("assignment_id required");
    }

    // Validate assignment
    $stmt = $conn->prepare("SELECT booking_id, current_status FROM assignments WHERE assignment_id = ? LIMIT 1");
    $stmt->bind_param("i", $assignmentId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) respond_error("Assignment not found", 404);
    if (in_array($row["current_status"], ["Completed", "Incomplete", "Cancelled"], true)) {
        respond_error("Cannot upload proof for final status");
    }

    $bookingId = $row["booking_id"];

    // Must have file
    if (empty($_FILES['proof'])) {
        respond_error("No file uploaded");
    }

    $file = $_FILES['proof'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond_error("File upload error");
    }

    // Allowed types
    $ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];
    $ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
    $MAX_SIZE = 8 * 1024 * 1024; // 8MB

    $name = $file['name'];
    $tmp = $file['tmp_name'];
    $size = $file['size'];
    $mime = mime_content_type($tmp);

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

    if (!in_array($ext, $ALLOWED_EXT)) {
        respond_error("Invalid file type. Only JPG, JPEG, PNG, PDF allowed.");
    }

    if (!in_array($mime, $ALLOWED_MIME)) {
        respond_error("Invalid MIME type.");
    }

    if ($size > $MAX_SIZE) {
        respond_error("File exceeds 8MB limit.");
    }

    // Prepare directory
    $uploadRoot = rtrim(UPLOAD_ROOT, '/\\') . '/';
    $folder = trim(BOOKING_DOCS_DIR, '/\\') . '/';
    $up_folder = '../';
    $uploadDir = $up_folder . $uploadRoot . $folder; // for uploading the file only
    $without_up = $uploadRoot . $folder;             // filepath that will be save to db

    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            respond_error("Failed to create upload directory", 500);
        }
    }

    // Safe file name
    $safeName = "booking_{$bookingId}_asm_{$assignmentId}_" . bin2hex(random_bytes(6)) . ".$ext";
    $dest = $uploadDir . $safeName; // for uploading the file only

    if (!move_uploaded_file($tmp, $dest)) {
        respond_error("Failed to move uploaded file");
    }

    $dest_realpath = $without_up . $safeName; // filepath that will be save to db

    // Insert document
    $insert = $conn->prepare("
        INSERT INTO documents (assignment_id, booking_id, document_type, file_path, uploaded_by, date_uploaded)
        VALUES (?, ?, 'proof_of_delivery', ?, ?, NOW())
    ");
    $insert->bind_param("iisi", $assignmentId, $bookingId, $dest_realpath, $userId);
    $ok = $insert->execute();
    $insert->close();

    if (!$ok) {
        @unlink($dest);
        respond_error("Failed to save document");
    }

    // Save notes if provided
    $notes_saved = false;
    if (!empty($notes)) {
        $update = $conn->prepare("UPDATE assignments SET remarks = ? WHERE assignment_id = ?");
        $update->bind_param("si", $notes, $assignmentId);
        $notes_saved = $update->execute();
        $update->close();
    } else {
        $update = $conn->prepare("UPDATE assignments SET remarks = NULL WHERE assignment_id = ?");
        $update->bind_param("i", $assignmentId);
        $notes_saved = $update->execute();
        $update->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "File uploaded successfully",
        "file" => $safeName,
        "notes_saved" => $notes_saved
    ]);
    exit;

} catch (Throwable $e) {
    log_error_detail("Exception: " . $e->getMessage());
    respond_error("Server error: " . $e->getMessage(), 500);
}
