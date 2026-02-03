<?php
require_once 'cors.php';
require_once 'db.php';

session_start();
header('Content-Type: application/json');

// Must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$current_password = $input['current_password'] ?? '';
$new_password = $input['new_password'] ?? '';

function validatePassword($password) {
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters';
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }

    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }

    if (!preg_match('/\d/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }

    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>\/?\\\\|`~]/', $password)) {
        $errors[] = 'Password must contain at least one special character';
    }

    return $errors;
}

// Validate inputs
if (empty($current_password) || empty($new_password)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

// Validate new password rules
$passwordErrors = validatePassword($new_password);
if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Password does not meet requirements',
        'details' => $passwordErrors
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch current password hash
$stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Verify current password
if (!password_verify($current_password, $user['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Current password is incorrect']);
    exit;
}

// Prevent reusing the same password
if (password_verify($new_password, $user['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'New password must be different from current password']);
    exit;
}

// Update password
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$stmt->bind_param('si', $new_hash, $user_id);
$stmt->execute();

echo json_encode([
    'status' => 'ok',
    'message' => 'Password changed successfully'
]);

$conn->close();
?>
