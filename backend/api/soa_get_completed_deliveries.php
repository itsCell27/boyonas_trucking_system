<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

$service_type = $_GET['service_type'] ?? '';
$party_name   = $_GET['party_name'] ?? '';
$date_from    = $_GET['date_from'] ?? '';
$date_to      = $_GET['date_to'] ?? '';

if (!in_array($service_type, ['Partnership', 'LipatBahay'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid service_type']);
    exit;
}
if ($party_name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing party_name']);
    exit;
}
if ($date_from === '' || $date_to === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing date range']);
    exit;
}

try {
    $sql = "
        SELECT 
            a.assignment_id,
            b.booking_id,
            b.dr_number,
            CONCAT(b.route_from, ' → ', b.route_to) AS route,
            t.plate_number,
            DATE(a.assigned_date) AS delivery_date,
            COALESCE(b.service_rate, 0) AS default_amount
        FROM assignments a
        INNER JOIN bookings b ON a.booking_id = b.booking_id
        INNER JOIN trucks t ON a.truck_id = t.truck_id
        LEFT JOIN soa_detail sd ON sd.assignment_id = a.assignment_id
        WHERE b.service_type = ?
          AND b.status = 'Completed'
          AND a.current_status = 'Completed'
          AND sd.soa_detail_id IS NULL
          AND DATE(a.assigned_date) BETWEEN ? AND ?
    ";

    if ($service_type === 'Partnership') {
        $sql .= " AND b.partner_name = ?";
    } else {
        $sql .= " AND b.customer_name = ?";
    }

    $sql .= " ORDER BY a.assigned_date ASC";

    $stmt = $conn->prepare($sql);

    if ($service_type === 'Partnership') {
        $stmt->bind_param('ssss', $service_type, $date_from, $date_to, $party_name);
    } else {
        $stmt->bind_param('ssss', $service_type, $date_from, $date_to, $party_name);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>