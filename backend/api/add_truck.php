<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$plate_number = $_POST['plate_number'] ?? null;
$model = $_POST['model'] ?? null;
$capacity = $_POST['capacity'] ?? null;
$year = $_POST['year'] ?? null;
$operational_status = $_POST['operational_status'] ?? 'Available';
$document_status = $_POST['document_status'] ?? 'Valid';
$status = $_POST['status'] ?? 'Okay to Use';
$remarks = $_POST['remarks'] ?? null;

if (!$plate_number || !$model || !$capacity || !$year) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required truck data']);
    exit;
}

$conn->begin_transaction();

try {
    $image_path = null;
    $image_upload_dir = '../uploads/images/';
    $doc_upload_dir = '../uploads/documents/';

    if (!is_dir($image_upload_dir)) {
        mkdir($image_upload_dir, 0777, true);
    }
    if (!is_dir($doc_upload_dir)) {
        mkdir($doc_upload_dir, 0777, true);
    }

    // if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    //     $image_path = $image_upload_dir . basename($_FILES['image']['name']);
    //     if (!move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
    //         throw new Exception('Failed to move uploaded image');
    //     }
    // }

    // ===== UPDATED: Generate unique filename for truck image =====
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // Extract file extension from original filename
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        // Generate unique filename to prevent conflicts
        $unique_filename = uniqid('truck_img_', true) . '.' . $file_extension;
        $image_path = $image_upload_dir . $unique_filename;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
            throw new Exception('Failed to move uploaded image');
        }
    }

    $stmt = $conn->prepare("INSERT INTO trucks (plate_number, model, capacity, year, operational_status, document_status, status, remarks, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssissssss", $plate_number, $model, $capacity, $year, $operational_status, $document_status, $status, $remarks, $image_path);
    $stmt->execute();
    $truck_id = $stmt->insert_id;
    $stmt->close();

    function handle_upload($file_key, $truck_id, $doc_type, $conn, $upload_dir) {
        if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$file_key];
            //$file_path = $upload_dir . basename($file['name']);

            // ===== UPDATED: Generate unique filename for documents =====
            // Extract file extension from original filename
            $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            // Generate unique filename with document type prefix (e.g., OR_doc_xxxxx.pdf)
            $unique_filename = uniqid($doc_type . '_doc_', true) . '.' . $file_extension;
            $file_path = $upload_dir . $unique_filename;

            if (move_uploaded_file($file['tmp_name'], $file_path)) {
                //$expiry_date = $_POST[$doc_type . '_expiry_date'] ?? null;

                // Fixed: Use lowercase for expiry date key to match frontend
                $expiry_date_key = strtolower($doc_type) . '_expiry_date';
                $expiry_date = $_POST[$expiry_date_key] ?? null;
                
                if (!$expiry_date) {
                    throw new Exception("Expiry date is required for {$doc_type} document");
                }

                $doc_status = 'Valid';
                if ($expiry_date && new DateTime($expiry_date) < new DateTime()) {
                    $doc_status = 'Expired';
                }

                $stmt = $conn->prepare("INSERT INTO truck_documents (truck_id, document_type, file_path, expiry_date, status) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("issss", $truck_id, $doc_type, $file_path, $expiry_date, $doc_status);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception("Failed to move uploaded file for {$doc_type}");
            }
        }
    }

    handle_upload('or_document', $truck_id, 'OR', $conn, $doc_upload_dir);
    handle_upload('cr_document', $truck_id, 'CR', $conn, $doc_upload_dir);

    $conn->commit();
    echo json_encode(['success' => 'Truck added successfully', 'truck_id' => $truck_id]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
