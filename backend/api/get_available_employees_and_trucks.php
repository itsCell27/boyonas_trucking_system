<?php
// CORS and session setup
require_once 'cors.php';

include 'db.php';

$response = array();

// Fetch available employees
$sql_employees = "SELECT * FROM employees WHERE status = 'Idle'";
$result_employees = $conn->query($sql_employees);

$employees = array();
if ($result_employees->num_rows > 0) {
    while($row = $result_employees->fetch_assoc()) {
        $employees[] = $row;
    }
}

// Fetch available trucks
$sql_trucks = "SELECT * FROM trucks WHERE operational_status = 'Available'";
$result_trucks = $conn->query($sql_trucks);

$trucks = array();
if ($result_trucks->num_rows > 0) {
    while($row = $result_trucks->fetch_assoc()) {
        $trucks[] = $row;
    }
}

$response['employees'] = $employees;
$response['trucks'] = $trucks;

echo json_encode($response);

$conn->close();
?>