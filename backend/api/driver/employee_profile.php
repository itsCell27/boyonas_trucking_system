<?php
require_once '../cors.php';
require_once '../db.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

/* -------------------------------------------------
   1. AUTH CHECK
-------------------------------------------------- */
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not authenticated"
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

/* -------------------------------------------------
   2. FETCH EMPLOYEE RECORD
-------------------------------------------------- */
$stmt = $conn->prepare("
    SELECT 
        employee_id,
        full_name,
        position,
        contact_number,
        status,
        license_info,
        date_started,
        years_on_team,
        emergency_contact_name,
        emergency_contact_number,
        employee_code,
        employment_status,
        date_ended
    FROM employees
    WHERE user_id = ?
    LIMIT 1
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$employee = $stmt->get_result()->fetch_assoc();

if (!$employee) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Employee record not found"
    ]);
    exit;
}

/* -------------------------------------------------
   3. FETCH EMPLOYEE DOCUMENTS
-------------------------------------------------- */
$stmt = $conn->prepare("
    SELECT 
        document_id,
        document_type,
        file_path,
        date_uploaded,
        expiry_date
    FROM employee_documents
    WHERE employee_id = ?
    ORDER BY document_type ASC
");
$stmt->bind_param("i", $employee['employee_id']);
$stmt->execute();
$documents = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

/* -------------------------------------------------
   4. RESPONSE
-------------------------------------------------- */
echo json_encode([
    "success"   => true,
    "employee"  => $employee,
    "documents" => $documents
]);

$conn->close();
