<?php
require_once 'cors.php';
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
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

$employee_id = intval($_GET['employee_id']);
$user_id = intval($_GET['user_id']);

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
        $user_details = $result->fetch_assoc();
        $employee_details = array_merge($employee_details, $user_details);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found for employee']);
        exit;
    }
    $stmt->close();

    // -----------------------------------------------------------------------------------
    // NEW: Get latest assignment (1 only) sorted by assigned_date (ignores current_status)
    // -----------------------------------------------------------------------------------
    $assignmentQuery = "
        SELECT 
            a.assignment_id,
            a.booking_id,
            a.truck_id,
            a.driver_id,
            a.helper_id,
            a.assigned_date,
            a.current_status,
            b.dr_number,
            t.plate_number
        FROM assignments a
        LEFT JOIN bookings b ON a.booking_id = b.booking_id
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        WHERE a.driver_id = ? OR a.helper_id = ?
        ORDER BY a.assigned_date DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($assignmentQuery);
    $stmt->bind_param("ii", $employee_id, $employee_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $latest_assignment = $result->fetch_assoc();
    } else {
        $latest_assignment = null;
    }
    $stmt->close();

    // Add it to output
    $employee_details['latest_assignment'] = $latest_assignment;

    // -----------------------------------------------------------------------------------
    // Get employee documents
    // -----------------------------------------------------------------------------------
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
