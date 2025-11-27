<?php
require_once 'cors.php';
require_once 'db.php';
header("Content-Type: application/json");

// 1. Active Trucks
$sql_active = "
    SELECT 
        SUM(CASE WHEN operational_status = 'On Delivery' THEN 1 ELSE 0 END) AS active_trucks,
        COUNT(*) AS total_trucks
    FROM trucks
";
$res1 = $conn->query($sql_active);
$trucks = $res1->fetch_assoc();

// 2. Employees
$sql_emp = "
    SELECT 
        COUNT(*) AS total_employees,
        SUM(CASE WHEN position IN ('Driver','Helper') THEN 1 ELSE 0 END) AS drivers_and_helpers
    FROM employees
";
$res2 = $conn->query($sql_emp);
$employees = $res2->fetch_assoc();

// 3. Today’s Deliveries
$sql_today = "
    SELECT 
        COUNT(*) AS todays_deliveries,
        SUM(CASE WHEN status = 'Pending Assignment' THEN 1 ELSE 0 END) AS pending
    FROM bookings
    WHERE DATE(scheduled_start) = CURDATE()
";
$res3 = $conn->query($sql_today);
$deliveries = $res3->fetch_assoc();

// Final Output
echo json_encode([
    "success" => true,
    "data" => [
        "active_trucks" => (int)$trucks["active_trucks"],
        "total_trucks" => (int)$trucks["total_trucks"],
        "total_employees" => (int)$employees["total_employees"],
        "drivers_and_helpers" => (int)$employees["drivers_and_helpers"],
        "todays_deliveries" => (int)$deliveries["todays_deliveries"],
        "pending_deliveries" => (int)$deliveries["pending"]
    ]
]);

$conn->close();
?>
