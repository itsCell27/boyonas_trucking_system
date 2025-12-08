<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Optional: protect the endpoint
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

try {
    $sql = "
        SELECT 
            b.booking_id,
            b.service_type,
            b.dr_number,
            b.partner_name,
            b.customer_name,
            b.phone_number,
            b.route_from,
            b.route_to,
            b.scheduled_start,
            b.deadline,
            b.status AS booking_status,
            b.service_rate,
            b.category,

            a.assignment_id,
            a.current_status AS assignment_status,
            a.assigned_date,

            t.plate_number,
            t.model AS truck_model,

            e.full_name AS driver_name
        FROM bookings b
        LEFT JOIN assignments a ON a.booking_id = b.booking_id
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        LEFT JOIN employees e ON a.driver_id = e.employee_id
        ORDER BY b.scheduled_start DESC, b.booking_id DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Database error: " . $conn->error);
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $rows
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
