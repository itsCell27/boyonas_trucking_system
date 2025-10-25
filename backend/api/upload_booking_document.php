<?php
require_once 'cors.php';
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized. Please log in."]);
    exit();
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
    exit();
}

try {
    // Validate required fields
    if (!isset($_POST['booking_id']) || !isset($_POST['document_type'])) {
        throw new Exception("Missing required fields: booking_id and document_type are required.");
    }

    if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("File upload error. Please select a valid file.");
    }

    $bookingId = intval($_POST['booking_id']);
    $documentType = trim($_POST['document_type']);
    $assignmentId = isset($_POST['assignment_id']) ? intval($_POST['assignment_id']) : null;
    $uploadedBy = $_SESSION['user_id'];

    // Validate document type
    $allowedTypes = ['Delivery Receipt', 'Cargo Photo', 'Waybill', 'Invoice', 'Packing List', 'Other'];
    if (!in_array($documentType, $allowedTypes)) {
        throw new Exception("Invalid document type.");
    }

    // Verify booking exists
    $stmt = $conn->prepare("SELECT booking_id FROM bookings WHERE booking_id = ?");
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    if (!$stmt->get_result()->fetch_assoc()) {
        throw new Exception("Booking not found.");
    }
    $stmt->close();

    // If assignment_id is provided, verify it exists and belongs to the booking
    if ($assignmentId !== null) {
        $stmt = $conn->prepare("SELECT assignment_id FROM assignments WHERE assignment_id = ? AND booking_id = ?");
        $stmt->bind_param("ii", $assignmentId, $bookingId);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            throw new Exception("Assignment not found or doesn't belong to this booking.");
        }
        $stmt->close();
    }

    // Validate file
    $file = $_FILES['document'];
    $allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedMimeTypes)) {
        throw new Exception("Invalid file type. Only JPG, PNG, and PDF files are allowed.");
    }

    if ($file['size'] > $maxFileSize) {
        throw new Exception("File size exceeds 5MB limit.");
    }

    // Create upload directory if it doesn't exist
    $uploadDir = UPLOAD_ROOT . BOOKING_DOCS_DIR;
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $sanitizedType = strtolower(str_replace(' ', '_', $documentType));
    $uniqueId = uniqid('', true);
    $newFileName = "booking_{$bookingId}_{$sanitizedType}_{$uniqueId}.{$fileExtension}";
    $filePath = $uploadDir . $newFileName;
    $dbFilePath = '../private_uploads/documents/booking_documents/' . $newFileName;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception("Failed to save uploaded file.");
    }

    // Insert document record into database
    $stmt = $conn->prepare(
        "INSERT INTO documents (assignment_id, document_type, file_path, uploaded_by) 
         VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param("issi", $assignmentId, $documentType, $dbFilePath, $uploadedBy);
    
    if (!$stmt->execute()) {
        // If database insert fails, delete the uploaded file
        unlink($filePath);
        throw new Exception("Failed to save document record: " . $stmt->error);
    }

    $documentId = $conn->insert_id;
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Document uploaded successfully.",
        "document_id" => $documentId,
        "file_path" => $dbFilePath
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>