<?php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$truck_id      = $_POST["truck_id"] ?? null;
$plate_number  = trim($_POST["plate_number"] ?? "");
$model         = trim($_POST["model"] ?? "");
$capacity      = trim($_POST["capacity"] ?? "");
$year          = trim($_POST["year"] ?? "");

if (!$truck_id || !$plate_number || !$model || !$capacity || !$year) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

try {
    // prevent duplicate plate number
    $check = $conn->prepare("SELECT truck_id FROM trucks WHERE plate_number = ? AND truck_id != ?");
    $check->bind_param("si", $plate_number, $truck_id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Plate number already exists"]);
        exit;
    }
    $check->close();

    // update truck info
    $stmt = $conn->prepare("
        UPDATE trucks
        SET plate_number = ?, model = ?, capacity = ?, year = ?
        WHERE truck_id = ?
    ");

    $stmt->bind_param("sssii", $plate_number, $model, $capacity, $year, $truck_id);

    if (!$stmt->execute()) {
        throw new Exception("Failed to update truck: " . $stmt->error);
    }

    echo json_encode(["success" => true, "message" => "Truck updated successfully"]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
}
