<?php
require_once 'config.php';

session_start();
session_unset();
session_destroy();


header("Access-Control-Allow-Origin: " . FRONTEND_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");

echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>