<?php
require_once 'cors.php';
require_once 'rate_limiter.php';
require 'db.php';

// Rate limit: 5 attempts per 5 minutes (300 seconds)
rateLimit('login', 5, 300);

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->email) && isset($data->password)) {
        $email = $conn->real_escape_string($data->email);
        $plain_password = $data->password;

        $sql = "SELECT u.user_id, u.name, u.email, u.password, u.contact, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($plain_password, $user['password'])) {
                unset($user['password']); // Do not send the hashed password to the frontend
                $_SESSION['user_id'] = $user['user_id'];
                echo json_encode(["success" => true, "user" => $user]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid email or password"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Email and password are required"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>