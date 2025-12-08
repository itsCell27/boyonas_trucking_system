<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$generated_by = $_SESSION['user_id'];

$body = json_decode(file_get_contents('php://input'), true);

$service_type = $body['service_type'] ?? '';
$party_name   = $body['party_name'] ?? '';
$date_from    = $body['date_from'] ?? '';
$date_to      = $body['date_to'] ?? '';
$deliveries   = $body['deliveries'] ?? [];
$remarks      = $body['remarks'] ?? '';

if (!in_array($service_type, ['Partnership', 'LipatBahay'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid service_type']);
    exit;
}
if (!$date_from || !$date_to || empty($deliveries)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->begin_transaction();

    // Compute total amount
    $total_amount = 0;
    foreach ($deliveries as $row) {
        $total_amount += floatval($row['amount'] ?? 0);
    }

    // Insert into soa (status defaults to "Not Yet Paid")
    $status = 'Not Yet Paid';

        $stmt = $conn->prepare("
        INSERT INTO soa (service_type, date_from, date_to, total_amount, status, remarks, generated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        'sssdssi',
        $service_type,
        $date_from,
        $date_to,
        $total_amount,
        $status,
        $remarks,
        $generated_by
    );
    $stmt->execute();

    $soa_id = $conn->insert_id;

    // Insert SOA details
    $detailStmt = $conn->prepare("
        INSERT INTO soa_detail (soa_id, assignment_id, dr_number, route, plate_number, delivery_date, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($deliveries as $row) {
        $assignment_id = (int) $row['assignment_id'];
        $dr_number     = $row['dr_number'];
        $route         = $row['route'];
        $plate_number  = $row['plate_number'];
        $delivery_date = $row['delivery_date']; // 'YYYY-MM-DD'
        $amount        = floatval($row['amount']);

        $detailStmt->bind_param(
            'iissssd',
            $soa_id,
            $assignment_id,
            $dr_number,
            $route,
            $plate_number,
            $delivery_date,
            $amount
        );
        $detailStmt->execute();
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'soa_id'  => $soa_id,
        'total_amount' => $total_amount
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

?>
