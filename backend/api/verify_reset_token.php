<?php
require_once 'cors.php';
require 'db.php';

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'Token is required']);
    exit;
}

// Check if token exists and is not expired or used
$stmt = $conn->prepare("
    SELECT id, user_id, expires_at, used 
    FROM password_resets 
    WHERE token = ? 
    LIMIT 1
");
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();
$reset = $result->fetch_assoc();

if (!$reset) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'Invalid reset token']);
    exit;
}

// Check if already used
if ($reset['used'] == 1) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'This reset link has already been used']);
    exit;
}

// Check if expired
$now = new DateTime();
$expiresAt = new DateTime($reset['expires_at']);

if ($now > $expiresAt) {
    http_response_code(400);
    echo json_encode(['valid' => false, 'error' => 'This reset link has expired']);
    exit;
}

// Token is valid
echo json_encode(['valid' => true, 'message' => 'Token is valid']);
$conn->close();
?>