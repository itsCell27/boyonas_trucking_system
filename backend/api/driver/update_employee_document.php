<?php
require_once '../config.php';

// CORS
header("Access-Control-Allow-Origin: " . FRONTEND_ORIGIN);
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();
require_once '../db.php';

/* ---------------- AUTH ---------------- */
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

/* ---------------- INPUT ---------------- */
$document_id = $_POST['document_id'] ?? null;
$expiry_date = $_POST['expiry_date'] ?? null;

if (empty($document_id) || empty($expiry_date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Document ID and expiry date are required']);
    exit;
}

/* ---------------- VERIFY OWNERSHIP ---------------- */
$stmt = $conn->prepare("
    SELECT ed.document_id, ed.file_path, e.employee_id
    FROM employee_documents ed
    JOIN employees e ON ed.employee_id = e.employee_id
    WHERE ed.document_id = ? AND e.user_id = ?
    LIMIT 1
");
$stmt->bind_param("ii", $document_id, $_SESSION['user_id']);
$stmt->execute();
$doc = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$doc) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access to document']);
    exit;
}

/* ---------------- FILE VALIDATION SETUP ---------------- */
$allowed_mime_types = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
];

$allowed_extensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

$upload_dir = UPLOAD_ROOT . EMPLOYEE_DOCS_DIR;
$upload_dir_only = '../' . UPLOAD_ROOT . EMPLOYEE_DOCS_DIR; // do not save in the db
if (!is_dir($upload_dir_only)) {
    mkdir($upload_dir_only, 0777, true);
}

$new_file_path = null;

/* ---------------- HANDLE FILE (OPTIONAL) ---------------- */
if (isset($_FILES['document']) && $_FILES['document']['error'] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'File upload error']);
        exit;
    }

    $file = $_FILES['document'];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $detected_mime = $finfo->file($file['tmp_name']);
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($detected_mime, $allowed_mime_types, true) ||
        !in_array($extension, $allowed_extensions, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type']);
        exit;
    }

    $original_name = pathinfo($file['name'], PATHINFO_FILENAME);
    $unique_name = uniqid($original_name . '_', true) . '.' . $extension;
    $new_file_path = $upload_dir . $unique_name;
    $new_file_path_only = $upload_dir_only . $unique_name; // do not save in the db, use only for moving file

    if (!move_uploaded_file($file['tmp_name'], $new_file_path_only)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
        exit;
    }

    // delete old file
    $old_file_full_path = '../' . UPLOAD_ROOT . $doc['file_path'];

    if (!empty($doc['file_path']) && file_exists($old_file_full_path)) {
        unlink($old_file_full_path);
    }
}

/* ---------------- UPDATE DATABASE ---------------- */
if ($new_file_path) {
    $stmt = $conn->prepare("
        UPDATE employee_documents
        SET file_path = ?, expiry_date = ?
        WHERE document_id = ?
    ");
    $stmt->bind_param("ssi", $new_file_path, $expiry_date, $document_id);
} else {
    $stmt = $conn->prepare("
        UPDATE employee_documents
        SET expiry_date = ?
        WHERE document_id = ?
    ");
    $stmt->bind_param("si", $expiry_date, $document_id);
}

$stmt->execute();
$stmt->close();

echo json_encode(['success' => true]);
$conn->close();
