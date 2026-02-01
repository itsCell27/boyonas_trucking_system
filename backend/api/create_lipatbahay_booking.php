<?php
// CORS and session setup
require_once 'cors.php';

if (!extension_loaded('mysqli')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'The mysqli extension is not enabled.',
    ]);
    exit;
}

session_start();
require_once 'db.php';

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    empty($data['dr_number']) ||
    empty($data['customer_name']) ||
    empty($data['phone_number']) ||
    empty($data['route_from']) ||
    empty($data['route_to']) ||
    empty($data['scheduled_start']) ||
    empty($data['deadline']) ||
    !isset($data['estimated_weight']) ||
    !isset($data['service_rate']) ||   // REQUIRED
    empty($data['status']) ||
    empty($data['created_by'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$dr_number   = $data['dr_number'];
$created_by  = (int)$data['created_by'];
$service_type = 'LipatBahay';

// Check DR uniqueness
$stmt_check = $conn->prepare("SELECT COUNT(*) FROM bookings WHERE dr_number = ?");
$stmt_check->bind_param("s", $dr_number);
$stmt_check->execute();
$stmt_check->bind_result($count);
$stmt_check->fetch();
$stmt_check->close();

if ($count > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'DR Number already exists']);
    exit;
}

// Insert booking
try {
    $stmt = $conn->prepare("
        INSERT INTO bookings 
        (
            service_type,
            dr_number,
            customer_name,
            phone_number,
            route_from,
            route_to,
            scheduled_start,
            deadline,
            estimated_weight,
            service_rate,
            status,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    // Correct bind_param signature:
    // service_type (s)
    // dr_number (s)
    // customer_name (s)
    // phone_number (s)
    // route_from (s)
    // route_to (s)
    // scheduled_start (s)
    // deadline (s)
    // estimated_weight (d)
    // service_rate (d)
    // status (s)
    // created_by (i)

    $stmt->bind_param(
        "ssssssssddsi",
        $service_type,
        $data['dr_number'],
        $data['customer_name'],
        $data['phone_number'],
        $data['route_from'],
        $data['route_to'],
        $data['scheduled_start'],
        $data['deadline'],
        $data['estimated_weight'],
        $data['service_rate'],
        $data['status'],
        $created_by
    );

    if ($stmt->execute()) {
        $booking_id = $stmt->insert_id;
        $stmt->close();

        // Insert Status Log
        $log_stmt = $conn->prepare("
            INSERT INTO status_logs (booking_id, status, remarks, updated_by)
            VALUES (?, 'Scheduled', 'Booking successfully created', ?)
        ");
        $log_stmt->bind_param("ii", $booking_id, $created_by);
        $log_stmt->execute();
        $log_stmt->close();

        echo json_encode([
            'success'    => true,
            'booking_id' => $booking_id,
            'id'         => $booking_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $stmt->error]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database exception: ' . $e->getMessage()]);
}

$conn->close();
?>
