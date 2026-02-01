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
            b.booking_id,
            b.dr_number,
            CONCAT(b.route_from, ' → ', b.route_to) AS route,
            t.plate_number,

            -- Completed delivery date from status_logs
            (
                SELECT DATE(sl.timestamp)
                FROM status_logs sl
                WHERE sl.booking_id = b.booking_id
                  AND sl.status = 'Completed'
                ORDER BY sl.timestamp DESC
                LIMIT 1
            ) AS delivery_date,

            COALESCE(b.service_rate, 0) AS default_amount

        FROM bookings b
        LEFT JOIN assignments a 
               ON a.booking_id = b.booking_id 
              AND a.current_status = 'Completed'
        INNER JOIN trucks t 
               ON a.truck_id = t.truck_id

        -- Prevent bookings that already exist in SOA details
        LEFT JOIN soa_detail sd 
               ON sd.booking_id = b.booking_id

        WHERE b.service_type = ?
          AND b.status = 'Completed'
          AND sd.soa_detail_id IS NULL       -- booking not yet billed
          AND (
                SELECT DATE(sl.timestamp)
                FROM status_logs sl
                WHERE sl.booking_id = b.booking_id
                  AND sl.status = 'Completed'
                ORDER BY sl.timestamp DESC
                LIMIT 1
              ) BETWEEN ? AND ?
    ";

    if ($service_type === 'Partnership') {
        $sql .= " AND b.partner_name = ?";
    } else {
        $sql .= " AND b.customer_name = ?";
    }

    $sql .= " ORDER BY delivery_date ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssss', $service_type, $date_from, $date_to, $party_name);
    $stmt->execute();

    $res = $stmt->get_result();
    $rows = [];

    while ($row = $res->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rows]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
