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
    // Use a correlated subquery to pull the latest status_logs.timestamp for this booking
    // where the status matches the booking status. If none is found, fall back to b.scheduled_start.
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

            (
                SELECT sl.timestamp
                FROM status_logs sl
                WHERE sl.booking_id = b.booking_id
                AND sl.status = b.status
                ORDER BY sl.timestamp DESC
                LIMIT 1
            ) AS log_ts,

            b.scheduled_start AS booking_scheduled_start,
            b.deadline,
            b.status AS booking_status,
            b.service_rate,
            b.category,

            a.assignment_id,
            a.current_status AS assignment_status,
            a.assigned_date,

            t.plate_number,
            t.model AS truck_model,

            e.full_name AS driver_name,

            sd.amount AS soa_amount  -- 🔥 NEW: revenue from soa_detail

        FROM bookings b
        LEFT JOIN assignments a ON a.booking_id = b.booking_id
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        LEFT JOIN employees e ON a.driver_id = e.employee_id

        LEFT JOIN (
            SELECT booking_id, amount
            FROM soa_detail
            GROUP BY booking_id
        ) sd ON sd.booking_id = b.booking_id

        ORDER BY COALESCE(
            (
                SELECT sl.timestamp 
                FROM status_logs sl 
                WHERE sl.booking_id = b.booking_id 
                AND sl.status = b.status 
                ORDER BY sl.timestamp DESC 
                LIMIT 1
            ),
            b.scheduled_start
        ) DESC, b.booking_id DESC
    ";


    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Database error: " . $conn->error);
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        // If log_ts exists, use it as scheduled_start; otherwise use booking_scheduled_start
        $scheduled_start_final = $row['log_ts'] ?? $row['booking_scheduled_start'];
        // normalize key name so front-end can keep using 'scheduled_start'
        $row['scheduled_start'] = $scheduled_start_final;
        // optionally remove intermediate fields if you don't want to expose them
        unset($row['log_ts']);
        unset($row['booking_scheduled_start']);

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
