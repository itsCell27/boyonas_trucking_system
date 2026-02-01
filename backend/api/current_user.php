<?php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

/* 1. Check login */
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not authenticated"
    ]);
    exit;
}

/* 2. Fetch user */
$stmt = $conn->prepare("
    SELECT name, email 
    FROM users 
    WHERE user_id = ?
    LIMIT 1
");

$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();

$user = $stmt->get_result()->fetch_assoc();

/* 3. Return response */
if ($user) {
    echo json_encode([
        "success" => true,
        "user" => $user
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
}
