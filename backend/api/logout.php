<?php
require_once 'cors.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

// Clear session variables
$_SESSION = [];

// Delete the session cookie properly
if (ini_get("session.use_cookies")) {

    $params = session_get_cookie_params();

    // Delete cookie using SAME attributes used when creating the session
    setcookie(
        session_name(),
        '',
        time() - 3600,
        $params['path'],
        $params['domain'],
        $params['secure'],     // Secure = true if https
        $params['httponly']    // HttpOnly = true
    );
}

// Destroy session
session_destroy();

echo json_encode(['success' => true]);
exit;
