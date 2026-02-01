<?php
require_once 'cors.php';
require_once 'db.php';

header("Content-Type: application/json");

$sql = "
    SELECT 
        truck_id,
        plate_number,
        operational_status
    FROM trucks
    ORDER BY truck_id DESC
";

$result = $conn->query($sql);

$trucks = [];

while ($row = $result->fetch_assoc()) {
    $trucks[] = [
        "plate_number" => $row["plate_number"],
        "operational_status" => $row["operational_status"]
    ];
}

echo json_encode($trucks);

$conn->close();
