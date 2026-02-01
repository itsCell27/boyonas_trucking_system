<?php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

/* Check login */
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not authenticated"
    ]);
    exit;
}

/* Read JSON input */
$input = json_decode(file_get_contents('php://input'), true);

/* Validate input */
if (!isset($input['name']) || trim($input['name']) === ''){
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Name is required"
    ]);
    exit;
} 

$userId = $_SESSION['user_id'];
$fullName = trim($input['name']);

$sql = "UPDATE users SET name = ? WHERE user_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("si", $fullName, $userId);
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Name updated successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update name: " . $stmt->error
    ]);
}

?>