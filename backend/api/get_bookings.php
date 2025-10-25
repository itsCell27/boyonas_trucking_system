<?php
require_once 'cors.php';
require_once 'db.php';

// Inputs
$service_type = $_GET['service_type'] ?? 'Partnership';
$status = $_GET['status'] ?? '';

$sql = "SELECT booking_id, service_type, dr_number, partner_name, route_from, route_to,
               scheduled_start, deadline, estimated_weight, category, status, date_created, created_by
        FROM bookings
        WHERE service_type = ?";
$params = [$service_type];
$types = "s";

if ($status !== "") {
    $sql .= " AND status = ?";
    $params[] = $status;
    $types .= "s";
}
$sql .= " ORDER BY date_created DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$out = [];
while ($row = $result->fetch_assoc()) { $out[] = $row; }
$stmt->close();

echo json_encode($out);
$conn->close();
?>