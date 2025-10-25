<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Only POST method allowed']);
    exit;
}

$assignment_id = intval($_POST['assignment_id'] ?? 0);
$document_type = $_POST['document_type'] ?? 'Other';
$uploaded_by = intval($_POST['uploaded_by'] ?? 0);

if (!$assignment_id || !$uploaded_by || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
$fileType = mime_content_type($_FILES['file']['tmp_name']);
if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, and PDF allowed']);
    exit;
}

// Get paths from .env via config.php
$root = rtrim($_ENV['UPLOAD_ROOT'], '/') . '/';
$subDir = $_ENV['BOOKING_DOCS_DIR'];
$targetDir = $root . $subDir;

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Generate safe filename
$filename = time() . "_" . basename($_FILES['file']['name']);
$filepath = $targetDir . $filename;

// Move uploaded file
if (!move_uploaded_file($_FILES['file']['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    exit;
}

// Store relative path
$relativePath = $subDir . $filename;

// Save to database
$stmt = $conn->prepare("INSERT INTO documents (assignment_id, document_type, file_path, uploaded_by) VALUES (?, ?, ?, ?)");
$stmt->bind_param("issi", $assignment_id, $document_type, $relativePath, $uploaded_by);
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'file_path' => $relativePath,
        'document_id' => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to insert record']);
}
$stmt->close();
$conn->close();
?>