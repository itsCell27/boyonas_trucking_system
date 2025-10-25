<?php
// CORS and session setup
require_once 'cors.php';

if (!extension_loaded('mysqli')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'The mysqli extension is not enabled in your PHP configuration.',
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
if (empty($data['dr_number']) || empty($data['partner_name']) || empty($data['route_from']) || 
    empty($data['route_to']) || empty($data['scheduled_start']) || empty($data['deadline']) || 
    !isset($data['estimated_weight']) || empty($data['category']) || empty($data['status']) || 
    empty($data['created_by'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$dr_number = $data['dr_number'];

// Check for uniqueness of dr_number
try {
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error during uniqueness check: ' . $e->getMessage(),
    ]);
    exit;
}

// Insert into database
try {
    $stmt = $conn->prepare("INSERT INTO bookings (service_type, dr_number, partner_name, route_from, route_to, scheduled_start, deadline, estimated_weight, category, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssdssi", $data['service_type'], $data['dr_number'], $data['partner_name'], $data['route_from'], $data['route_to'], $data['scheduled_start'], $data['deadline'], $data['estimated_weight'], $data['category'], $data['status'], $data['created_by']);

    if ($stmt->execute()) {
        $booking_id = $stmt->insert_id;
        echo json_encode([
            'success' => true, 
            'booking_id' => $booking_id,
            'id' => $booking_id  // keeping 'id' for backwards compatibility
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $stmt->error]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>