<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

$service_type = $_GET['service_type'] ?? '';

if (!in_array($service_type, ['Partnership', 'LipatBahay'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid service_type']);
    exit;
}

try {
    if ($service_type === 'Partnership') {
        $sql = "
            SELECT DISTINCT b.partner_name AS name
            FROM bookings b
            WHERE b.service_type = 'Partnership'
              AND b.status = 'Completed'
              AND b.partner_name IS NOT NULL
            ORDER BY b.partner_name
        ";
    } else {
        $sql = "
            SELECT DISTINCT b.customer_name AS name
            FROM bookings b
            WHERE b.service_type = 'LipatBahay'
              AND b.status = 'Completed'
              AND b.customer_name IS NOT NULL
            ORDER BY b.customer_name
        ";
    }

    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row['name'];
    }

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>