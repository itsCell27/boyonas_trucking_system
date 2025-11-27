<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$employee_id = $data['employee_id'] ?? null;
$status = $data['status'] ?? null;

if (!$employee_id || !$status) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

$stmt = $conn->prepare("UPDATE employees SET status = ? WHERE employee_id = ?");
$stmt->bind_param("si", $status, $employee_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
