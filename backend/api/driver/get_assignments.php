<?php
require_once '../cors.php';
require_once '../db.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

function respond_error($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function log_error_detail($msg)
{
    $logDir = __DIR__ . '/../../logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
    @file_put_contents($logDir . '/get_assignments.log',
        "[" . date('Y-m-d H:i:s') . "] " . $msg . PHP_EOL,
        FILE_APPEND);
}

try {

    if (!isset($_SESSION['user_id'])) {
        respond_error("Unauthorized", 401);
    }

    $userId = (int)$_SESSION['user_id'];

    // Fetch employee_id
    $empStmt = $conn->prepare("SELECT employee_id FROM employees WHERE user_id = ? LIMIT 1");
    if (!$empStmt) {
        log_error_detail("Prepare failed (employees): " . $conn->error);
        respond_error("Server error", 500);
    }
    $empStmt->bind_param("i", $userId);
    $empStmt->execute();
    $empRes = $empStmt->get_result();
    $emp = $empRes->fetch_assoc();
    $empStmt->close();

    if (!$emp) {
        respond_error("Employee not found", 404);
    }

    $employeeId = (int)$emp['employee_id'];
    $type = $_GET['type'] ?? 'all';

    // Main query
    $sqlBase = "
        SELECT 
            a.assignment_id, a.booking_id, a.truck_id, a.driver_id, a.helper_id,
            a.assigned_date, a.current_status, a.remarks,
            b.booking_id AS b_booking_id, b.service_type, b.dr_number,
            b.partner_name, b.customer_name, b.route_from, b.route_to,
            b.scheduled_start, b.deadline, b.estimated_weight, b.category, b.status AS booking_status,
            t.truck_id, t.plate_number, t.model,
            h.full_name AS helper_name,
            CASE
                WHEN a.current_status = 'Pending' THEN 1
                WHEN a.current_status IN ('OTW to SOC','OTW to Pickup') THEN 2
                WHEN a.current_status = 'Loading' THEN 3
                WHEN a.current_status = 'OTW to Destination' THEN 4
                WHEN a.current_status = 'Unloading' THEN 5
                WHEN a.current_status = 'Completed' THEN 6
                WHEN a.current_status = 'Incomplete' THEN 7
                WHEN a.current_status = 'Cancelled' THEN 8
                ELSE 9
            END AS status_order
        FROM assignments a
        LEFT JOIN bookings b ON a.booking_id = b.booking_id
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        LEFT JOIN employees h ON a.helper_id = h.employee_id
        WHERE a.driver_id = ?
    ";

    if ($type === "pending") {
        $sql = $sqlBase . " AND a.current_status = 'Pending' ORDER BY status_order, a.assigned_date DESC";
    } elseif ($type === "current") {
        $sql = $sqlBase . " AND a.current_status NOT IN ('Pending','Completed','Incomplete','Cancelled') ORDER BY status_order, a.assigned_date DESC";
    } elseif ($type === "history") {
        $sql = $sqlBase . " AND a.current_status IN ('Completed','Incomplete','Cancelled') ORDER BY status_order, a.assigned_date DESC";
    } else {
        $sql = $sqlBase . " ORDER BY status_order, a.assigned_date DESC";
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        log_error_detail("Prepare failed (main query): " . $conn->error);
        respond_error("Server error", 500);
    }

    $stmt->bind_param("i", $employeeId);
    $stmt->execute();
    $res = $stmt->get_result();

    $assignments = [];
    while ($row = $res->fetch_assoc()) {
        $row['helper_name'] = $row['helper_name'] ?? "None";
        $assignments[] = $row;
    }
    $stmt->close();

    echo json_encode(['success' => true, 'assignments' => $assignments]);
    exit;

} catch (Throwable $e) {
    log_error_detail("Exception: " . $e->getMessage());
    respond_error("Server error", 500);
}
