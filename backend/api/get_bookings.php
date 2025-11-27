<?php
require_once 'cors.php';
require_once 'db.php';

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inputs
$service_type = $_GET['service_type'] ?? 'Partnership';
$status = $_GET['status'] ?? '';

$sql = "SELECT 
            b.booking_id, 
            b.service_type, 
            b.dr_number, 
            b.partner_name, 
            b.route_from, 
            b.route_to,
            b.scheduled_start, 
            b.deadline, 
            b.estimated_weight, 
            b.category, 
            b.status, 
            b.date_created, 
            b.created_by
        FROM bookings b
        WHERE b.service_type = ?";

$params = [$service_type];
$types = "s";

if ($status !== "") {
    $sql .= " AND b.status = ?";
    $params[] = $status;
    $types .= "s";
}

$sql .= " ORDER BY b.date_created DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Database prepare error: " . $conn->error]);
    exit();
}

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$out = [];

while ($row = $result->fetch_assoc()) {
    $booking_id = $row['booking_id'];

    // Fetch ALL documents for this booking
    $docs_stmt = $conn->prepare("
        SELECT document_id, document_type, file_path, date_uploaded, uploaded_by
        FROM documents
        WHERE booking_id = ?
        ORDER BY date_uploaded DESC
    ");
    
    if (!$docs_stmt) {
        error_log("Document query prepare error for booking_id {$booking_id}: " . $conn->error);
        $row['documents'] = [];
        $out[] = $row;
        continue;
    }
    
    $docs_stmt->bind_param("i", $booking_id);
    $docs_stmt->execute();
    $docs_result = $docs_stmt->get_result();

    $documents = [];
    while ($doc = $docs_result->fetch_assoc()) {
        $documents[] = $doc;
    }
    $docs_stmt->close();

    // If no documents found, return NULL
    $row['documents'] = empty($documents) ? null : $documents;
    $row['document_count'] = count($documents); // Added for debugging

    $out[] = $row;
}

$stmt->close();
$conn->close();

// Added header to ensure JSON response
header('Content-Type: application/json');
echo json_encode($out);
?>