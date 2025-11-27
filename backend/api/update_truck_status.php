<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$truck_id = $data['truck_id'] ?? null;
$status = $data['operational_status'] ?? null;

if (!$truck_id || !$status) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$stmt = $conn->prepare("UPDATE trucks SET operational_status = ? WHERE truck_id = ?");
$stmt->bind_param("si", $status, $truck_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}
