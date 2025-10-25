<?php
require_once 'config.php';

// CORS and session setup
header("Access-Control-Allow-Origin: " . FRONTEND_ORIGIN);
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
require_once 'db.php';

if (!isset($_GET['truck_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Truck ID is required']);
    exit;
}

$truck_id = $_GET['truck_id'];

$truck_details = [];

try {
    // Get truck details
    $stmt = $conn->prepare("SELECT * FROM trucks WHERE truck_id = ?");
    $stmt->bind_param("i", $truck_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $truck_details = $result->fetch_assoc();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Truck not found']);
        exit;
    }
    $stmt->close();

    // Get truck documents
    $stmt = $conn->prepare("SELECT * FROM truck_documents WHERE truck_id = ?");
    $stmt->bind_param("i", $truck_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = $row;
    }
    $stmt->close();

    $truck_details['documents'] = $documents;

    echo json_encode($truck_details);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>