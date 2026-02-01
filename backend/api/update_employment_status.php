<?php
require_once 'cors.php';
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION CHECK
|--------------------------------------------------------------------------
| Only logged-in admins should be allowed to change employment status
*/
if (!isset($_SESSION['user_id'], $_SESSION['role_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// restrict to admin role only
if ((int)$_SESSION['role_id'] !== 1) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/
$data = json_decode(file_get_contents("php://input"), true);

$employee_id = $data['employee_id'] ?? null;
$user_id     = $data['user_id'] ?? null;
$new_status  = $data['employment_status'] ?? null;

$allowedStatuses = ['Active', 'Resigned', 'Terminated'];

if (!$employee_id || !$user_id || !in_array($new_status, $allowedStatuses, true)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid input data"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| FETCH CURRENT EMPLOYEE STATE
|--------------------------------------------------------------------------
*/
$stmt = $conn->prepare("
    SELECT employment_status
    FROM employees
    WHERE employee_id = ?
    LIMIT 1
");
$stmt->bind_param("i", $employee_id);
$stmt->execute();
$result = $stmt->get_result();
$employee = $result->fetch_assoc();

if (!$employee) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Employee not found"
    ]);
    exit;
}

// Prevent duplicate updates
if ($employee['employment_status'] === $new_status) {
    echo json_encode([
        "success" => true,
        "message" => "No changes required"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| TRANSACTION
|--------------------------------------------------------------------------
*/
$conn->begin_transaction();

try {
    /*
    | Update employees table
    */
    if ($new_status === 'Active') {
        // Rehire logic
        $stmt = $conn->prepare("
            UPDATE employees
            SET employment_status = 'Active',
                date_ended = NULL
            WHERE employee_id = ?
        ");
        $stmt->bind_param("i", $employee_id);
        $stmt->execute();

        // Enable login
        $stmt = $conn->prepare("
            UPDATE users
            SET is_active = 1
            WHERE user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

    } else {
        // Resigned or Terminated
        $stmt = $conn->prepare("
            UPDATE employees
            SET employment_status = ?,
                date_ended = CURDATE(),
                status = 'Idle'
            WHERE employee_id = ?
        ");
        $stmt->bind_param("si", $new_status, $employee_id);
        $stmt->execute();

        // Disable login
        $stmt = $conn->prepare("
            UPDATE users
            SET is_active = 0
            WHERE user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Employment status updated successfully"
    ]);

} catch (Throwable $e) {
    $conn->rollback();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update employment status"
    ]);
}
