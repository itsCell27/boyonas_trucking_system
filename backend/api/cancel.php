<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = isset($data['booking_id']) ? intval($data['booking_id']) : null;

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    exit;
}

// Check booking exists and current status
$stmt = $conn->prepare("SELECT status FROM bookings WHERE booking_id = ?");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$res = $stmt->get_result();

if (!$res || $res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit;
}

$row = $res->fetch_assoc();
$current_status = $row['status'];

// Don't cancel if already cancelled or completed
if ($current_status === 'Cancelled') {
    echo json_encode(["success" => false, "message" => "Booking already cancelled"]);
    exit;
}
if ($current_status === 'Completed') {
    echo json_encode(["success" => false, "message" => "Cannot cancel a completed booking"]);
    exit;
}

// Perform update
$upd = $conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?");
$upd->bind_param("i", $booking_id);
if ($upd->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}
