<?php
// CORS and session setup
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();
require_once 'db.php';

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Function to generate a random password
function generate_password($length = 12) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&()_+-=[]{}";
    return substr(str_shuffle($chars), 0, $length);
}

// Get POST data
$full_name = $_POST['full_name'] ?? '';
$email = $_POST['email'] ?? '';
$position = $_POST['position'] ?? '';
$contact_number = $_POST['contact_number'] ?? '';
$status = $_POST['status'] ?? 'Idle';
$license_info = $_POST['license_info'] ?? '';
$date_started = $_POST['date_started'] ?? '';
$emergency_contact_name = $_POST['emergency_contact_name'] ?? '';
$emergency_contact_number = $_POST['emergency_contact_number'] ?? '';
$employee_code = $_POST['employee_code'] ?? '';
$nbi_expiry_date = $_POST['nbi_expiry_date'] ?? '';
$police_expiry_date = $_POST['police_expiry_date'] ?? '';

// Validate required fields
if (empty($full_name) || empty($email) || empty($position) || empty($contact_number) || empty($date_started) || empty($emergency_contact_name) || empty($emergency_contact_number) || empty($employee_code)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Calculate years on team
$date_started_obj = new DateTime($date_started);
$current_date_obj = new DateTime();
$interval = $current_date_obj->diff($date_started_obj);
$years_on_team = $interval->y;

// Generate and hash password
$password = generate_password();
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Start transaction
$conn->begin_transaction();

try {
    // Insert into users table
    $role_id = ($position === 'Driver') ? 2 : 3; // 2 for Driver, 3 for Helper
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role_id, contact) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssis", $full_name, $email, $hashed_password, $role_id, $contact_number);
    $stmt->execute();
    $user_id = $stmt->insert_id;

    // Insert into employees table
    $stmt = $conn->prepare("INSERT INTO employees (user_id, full_name, position, contact_number, status, license_info, date_started, years_on_team, emergency_contact_name, emergency_contact_number, employee_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssisss", $user_id, $full_name, $position, $contact_number, $status, $license_info, $date_started, $years_on_team, $emergency_contact_name, $emergency_contact_number, $employee_code);
    $stmt->execute();
    $employee_id = $stmt->insert_id;

    // Handle file uploads and insert into employee_documents
    $doc_upload_dir = '../uploads/documents/employee_documents/';
    if (!is_dir($doc_upload_dir)) {
        mkdir($doc_upload_dir, 0777, true);
    }

    function handle_employee_document_upload($file_key, $employee_id, $doc_type, $expiry_date, $conn, $upload_dir) {
        if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$file_key];
            $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $unique_filename = uniqid($doc_type . '_doc_', true) . '.' . $file_extension;
            $file_path = $upload_dir . $unique_filename;

            if (move_uploaded_file($file['tmp_name'], $file_path)) {
                if (!$expiry_date) {
                    throw new Exception("Expiry date is required for {$doc_type} document");
                }

                $stmt = $conn->prepare("INSERT INTO employee_documents (employee_id, document_type, file_path, expiry_date) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("isss", $employee_id, $doc_type, $file_path, $expiry_date);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception("Failed to move uploaded file for {$doc_type}");
            }
        }
    }

    handle_employee_document_upload('nbi_clearance', $employee_id, 'NBI Clearance', $nbi_expiry_date, $conn, $doc_upload_dir);
    handle_employee_document_upload('police_clearance', $employee_id, 'Police Clearance', $police_expiry_date, $conn, $doc_upload_dir);

    // Commit transaction
    $conn->commit();

    // Send email with password
    require_once 'email_password.php';
    send_password_email($email, $password);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Rollback transaction
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>