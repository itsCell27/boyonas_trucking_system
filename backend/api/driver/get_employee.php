<?php
require_once '../cors.php';
require_once '../db.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

function respond_error($msg, $code = 400)
{
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $msg]);
    exit;
}

try {

    if (!isset($_SESSION['user_id'])) {
        respond_error("Unauthorized", 401);
    }

    $userId = (int)$_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT * FROM employees WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();
    $employee = $res->fetch_assoc();
    $stmt->close();

    if (!$employee) {
        respond_error("Employee not found", 404);
    }

    echo json_encode(["success" => true, "employee" => $employee]);
    exit;

} catch (Throwable $e) {
    respond_error("Server error", 500);
}
