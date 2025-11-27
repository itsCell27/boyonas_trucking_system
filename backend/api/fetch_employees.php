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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// -------------------------------
// GET SINGLE EMPLOYEE
// -------------------------------
if (isset($_GET['employee_id'])) {
    $id = intval($_GET['employee_id']);

    $sql = "
        SELECT 
            e.*,
            u.email,

            -- Latest assignment fields
            la.assignment_id,
            la.booking_id,
            la.truck_id,
            la.driver_id,
            la.helper_id,
            la.assigned_date,
            la.current_status,
            la.dr_number,
            la.plate_number

        FROM employees e
        INNER JOIN users u ON u.user_id = e.user_id

        LEFT JOIN (
            SELECT 
                a.*,
                b.dr_number,
                t.plate_number
            FROM assignments a
            LEFT JOIN bookings b ON a.booking_id = b.booking_id
            LEFT JOIN trucks t ON a.truck_id = t.truck_id
            ORDER BY a.assigned_date DESC
            LIMIT 1
        ) AS la
        ON (la.driver_id = e.employee_id OR la.helper_id = e.employee_id)

        WHERE e.employee_id = ?
        LIMIT 1;
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        exit;
    }

    $row = $result->fetch_assoc();

    // Build latest assignment object
    $row['latest_assignment'] = $row['assignment_id'] ? [
        "assignment_id" => $row['assignment_id'],
        "booking_id" => $row['booking_id'],
        "truck_id" => $row['truck_id'],
        "driver_id" => $row['driver_id'],
        "helper_id" => $row['helper_id'],
        "assigned_date" => $row['assigned_date'],
        "current_status" => $row['current_status'],
        "dr_number" => $row['dr_number'],
        "plate_number" => $row['plate_number']
    ] : null;

    unset(
        $row['assignment_id'],
        $row['booking_id'],
        $row['truck_id'],
        $row['driver_id'],
        $row['helper_id'],
        $row['assigned_date'],
        $row['current_status'],
        $row['dr_number'],
        $row['plate_number']
    );

    echo json_encode($row);
    exit;
}

// -------------------------------
// GET ALL EMPLOYEES (SUPER OPTIMIZED)
// -------------------------------
$sql = "
    SELECT 
        e.*,
        u.email,

        -- Latest assignment fields
        la.assignment_id,
        la.booking_id,
        la.truck_id,
        la.driver_id,
        la.helper_id,
        la.assigned_date,
        la.current_status,
        la.dr_number,
        la.plate_number

    FROM employees e
    INNER JOIN users u ON u.user_id = e.user_id

    LEFT JOIN (
        SELECT 
            a.*,
            b.dr_number,
            t.plate_number
        FROM assignments a
        LEFT JOIN bookings b ON a.booking_id = b.booking_id
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        ORDER BY a.assigned_date DESC
        LIMIT 1
    ) AS la
    ON (la.driver_id = e.employee_id OR la.helper_id = e.employee_id)

    ORDER BY e.full_name ASC;
";

$result = $conn->query($sql);

$employees = [];

while ($row = $result->fetch_assoc()) {

    $row['latest_assignment'] = $row['assignment_id'] ? [
        "assignment_id" => $row['assignment_id'],
        "booking_id" => $row['booking_id'],
        "truck_id" => $row['truck_id'],
        "driver_id" => $row['driver_id'],
        "helper_id" => $row['helper_id'],
        "assigned_date" => $row['assigned_date'],
        "current_status" => $row['current_status'],
        "dr_number" => $row['dr_number'],
        "plate_number" => $row['plate_number']
    ] : null;

    unset(
        $row['assignment_id'],
        $row['booking_id'],
        $row['truck_id'],
        $row['driver_id'],
        $row['helper_id'],
        $row['assigned_date'],
        $row['current_status'],
        $row['dr_number'],
        $row['plate_number']
    );

    $employees[] = $row;
}

echo json_encode($employees);
$conn->close();
?>
