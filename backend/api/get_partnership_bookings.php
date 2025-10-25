<?php
if (!extension_loaded('mysqli')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'The mysqli extension is not enabled in your PHP configuration.',
    ]);
    exit;
}

require_once 'config.php';

// CORS and session setup
header("Access-Control-Allow-Origin: " . FRONTEND_ORIGIN);
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

session_start();
require_once 'db.php';

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {

    // Get single booking by ID
    if (isset($_GET['booking_id'])) {
        $id = intval($_GET['booking_id']);
        $stmt = $conn->prepare("SELECT * FROM bookings WHERE booking_id =?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode($result->fetch_assoc());
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Truck not found']);
        }
    } else {
        // Get all bookings
        $sql = "SELECT * FROM bookings WHERE service_type = 'Partnership' ORDER BY booking_id DESC";
        $result = $conn->query($sql);
        
        $trucks = [];
        while ($row = $result->fetch_assoc()) {
            $trucks[] = $row;
        }
        
        echo json_encode($trucks);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}

$conn->close();
$stmt->close();
?>