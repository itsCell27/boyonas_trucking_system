<?php
require_once 'cors.php';
header("Content-Type: application/json");

require_once 'db.php';

// Get highest capacity from ALL trucks
$sql = "
    SELECT CAST(capacity AS UNSIGNED) AS capacity
    FROM trucks
    ORDER BY CAST(capacity AS UNSIGNED) DESC
    LIMIT 1
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB query failed']);
    exit;
}

if ($row = $result->fetch_assoc()) {
    $max_capacity = (int)$row['capacity'];
    echo json_encode(['success' => true, 'max_capacity' => $max_capacity]);
} else {
    echo json_encode(['success' => true, 'max_capacity' => 0]);
}
