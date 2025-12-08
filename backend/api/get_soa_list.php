<?php
require_once "db.php"; 

header("Content-Type: application/json");

$sql = "
    SELECT 
        s.soa_id,
        s.service_type,
        s.date_from,
        s.date_to,
        s.total_amount,
        s.status,
        s.date_generated,
        u.name AS generated_by
    FROM soa s
    LEFT JOIN users u ON s.generated_by = u.user_id
    ORDER BY s.soa_id DESC
";

$result = $conn->query($sql);

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}

echo json_encode([
    "success" => true,
    "records" => $records
]);
