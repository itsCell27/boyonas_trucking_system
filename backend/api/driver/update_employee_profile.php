<?php
require_once '../cors.php';
require_once '../db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data['full_name'] ?? '');
$contact = trim($data['contact_number'] ?? '');
$emergency_name = trim($data['emergency_contact_name'] ?? '');
$emergency_contact = trim($data['emergency_contact_number'] ?? '');
$license = trim($data['license_info'] ?? null);

/* VALIDATION */
if ($full_name === '') {
    echo json_encode(["success" => false, "message" => "Full name required"]);
    exit;
}

if (!preg_match('/^09\d{9}$/', $contact)) {
    echo json_encode(["success" => false, "message" => "Invalid contact number"]);
    exit;
}

if ($emergency_name === '' || !preg_match('/^09\d{9}$/', $emergency_contact)) {
    echo json_encode(["success" => false, "message" => "Invalid emergency contact"]);
    exit;
}

/* UPDATE — user owns this employee record */
$stmt = $conn->prepare("
    UPDATE employees
    SET full_name = ?, contact_number = ?, emergency_contact_name = ?, emergency_contact_number = ?, license_info = ?
    WHERE user_id = ?
");

$stmt->bind_param(
    "sssssi",
    $full_name,
    $contact,
    $emergency_name,
    $emergency_contact,
    $license,
    $_SESSION['user_id']
);

$stmt->execute();

echo json_encode(["success" => true]);
