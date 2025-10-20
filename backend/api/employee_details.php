<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

if (!isset($_GET['employee_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Employee ID is required']);
    exit;
}

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Employee ID is required']);
    exit;
}

$employee_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : 0;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

$employee_details = [];

try {
    // Get employee details
    $stmt = $conn->prepare("SELECT * FROM employees WHERE employee_id = ?");
    $stmt->bind_param("i", $employee_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $employee_details = $result->fetch_assoc();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        exit;
    }
    $stmt->close();

    // Get employee account info
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $employee_details = $result->fetch_assoc();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        exit;
    }
    $stmt->close();

    // Get employee documents
    $stmt = $conn->prepare("SELECT * FROM employee_documents WHERE employee_id = ?");
    $stmt->bind_param("i", $employee_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = $row;
    }
    $stmt->close();

    $employee_details['documents'] = $documents;

    echo json_encode($employee_details);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>