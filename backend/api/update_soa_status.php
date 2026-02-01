<?php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json');
session_start();

// Must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = intval($_SESSION['user_id']);

// Read JSON body
$body = json_decode(file_get_contents('php://input'), true);
$soa_id = isset($body['soa_id']) ? intval($body['soa_id']) : 0;
$new_status = isset($body['status']) ? trim($body['status']) : '';

// Allowed statuses
$allowed = ['Paid', 'Not Yet Paid'];

if ($soa_id <= 0 || !in_array($new_status, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit;
}

// Fetch current SOA status
$stmt = $conn->prepare("SELECT status FROM soa WHERE soa_id = ?");
$stmt->bind_param("i", $soa_id);
$stmt->execute();
$stmt->bind_result($current_status);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'SOA not found']);
    exit;
}
$stmt->close();

// If same status, no update needed
if ($current_status === $new_status) {
    echo json_encode([
        'success' => true,
        'message' => 'Status unchanged',
        'status' => $new_status
    ]);
    exit;
}

$conn->begin_transaction();

try {
    // Update SOA status & payment_date
    if ($new_status === 'Paid') {
        $update = $conn->prepare("UPDATE soa SET status = ?, payment_date = NOW() WHERE soa_id = ?");
        $update->bind_param("si", $new_status, $soa_id);
    } else {
        // Not Yet Paid → clear payment date
        $update = $conn->prepare("UPDATE soa SET status = ?, payment_date = NULL WHERE soa_id = ?");
        $update->bind_param("si", $new_status, $soa_id);
    }

    if (!$update->execute()) {
        throw new Exception("Update failed: " . $update->error);
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully',
        'new_status' => $new_status
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
