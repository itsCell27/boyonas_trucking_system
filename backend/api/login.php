<?php
require_once 'cors.php';
require_once 'db.php';
require_once 'rate_limiter.php';

header('Content-Type: application/json; charset=utf-8');

// SESSION COOKIE CONFIG
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

$email = trim($data->email ?? '');
$password = $data->password ?? '';

// 1. RATE LIMIT CHECK
$attempts = checkRateLimit($email, 5, 300);

if ($attempts >= 5) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many attempts. Please try again later.",
        "retry_after" => 300
    ]);
    exit;
}

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

// 2. CHECK USER
$stmt = $conn->prepare("
    SELECT user_id, name, email, password, role_id 
    FROM users 
    WHERE email = ?
");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    recordFailedAttempt($email); // 3. RECORD FAILED
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    exit;
}

// 4. SUCCESS — CLEAR RATE LIMIT
clearRateLimit($email);

// 5. SET SESSION
session_regenerate_id(true);
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['role_id'] = $user['role_id'];
$_SESSION['name'] = $user['name'];

// Remove sensitive info
unset($user['password']);

echo json_encode(["success" => true, "user" => $user]);
