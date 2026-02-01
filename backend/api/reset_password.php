<?php
require_once 'cors.php';
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');
$new_password = $input['new_password'] ?? '';

// Validate password requirements
function validatePassword($password) {
    $errors = [];
    
    // Minimum 8 characters
    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters';
    }
    
    // At least one uppercase letter
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    
    // At least one lowercase letter
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    
    // At least one digit
    if (!preg_match('/\d/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }
    
    // At least one special character
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>\/?\\\\|`~]/', $password)) {
        $errors[] = 'Password must contain at least one special character';
    }
    
    return $errors;
}

// Validate password
$passwordErrors = validatePassword($new_password);
if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Password does not meet requirements',
        'details' => $passwordErrors
    ]);
    exit;
}

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['error' => 'Token is required']);
    exit;
}

// Verify token
$stmt = $conn->prepare("SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1");
$stmt->bind_param('s', $token);
$stmt->execute();
$res = $stmt->get_result();
$reset = $res->fetch_assoc();

if (!$reset) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

// Update user password
$hash = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$stmt->bind_param('si', $hash, $reset['user_id']);
$stmt->execute();

// Mark token as used
$stmt = $conn->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
$stmt->bind_param('i', $reset['id']);
$stmt->execute();

echo json_encode(['status' => 'ok', 'message' => 'Password updated successfully']);
$conn->close();
?>