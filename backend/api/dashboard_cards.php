<?php
require 'cors.php';
require_once 'db.php';

$truck_details = [];

try {
    // Get Trucks
    $sql = "SELECT truck_id, operational_status FROM trucks";
    $result = $conn->query($sql);
    while ($row = $result->fetch_assoc()) {
        $truck_details[] = $row;
    }
    echo json_encode($truck_details);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>