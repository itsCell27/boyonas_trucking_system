<?php
// Database-based rate limiter (best for InfinityFree)

require_once 'db.php';

// Check if this IP or email has exceeded attempts
function checkRateLimit($email, $maxAttempts = 5, $windowSeconds = 300) {
    global $conn;

    $ip = $_SERVER['REMOTE_ADDR'];
    $windowStart = date('Y-m-d H:i:s', time() - $windowSeconds);

    $stmt = $conn->prepare("
        SELECT COUNT(*) AS attempts 
        FROM login_attempts 
        WHERE attempt_time > ? 
        AND (ip_address = ? OR email = ?)
    ");

    $stmt->bind_param("sss", $windowStart, $ip, $email);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    return (int)$result['attempts'];
}

// Record a failed login attempt
function recordFailedAttempt($email) {
    global $conn;

    $ip = $_SERVER['REMOTE_ADDR'];
    $now = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("
        INSERT INTO login_attempts (ip_address, email, attempt_time)
        VALUES (?, ?, ?)
    ");

    $stmt->bind_param("sss", $ip, $email, $now);
    $stmt->execute();
}

// Clear attempts on successful login
function clearRateLimit($email) {
    global $conn;

    $ip = $_SERVER['REMOTE_ADDR'];

    $stmt = $conn->prepare("
        DELETE FROM login_attempts 
        WHERE ip_address = ? OR email = ?
    ");

    $stmt->bind_param("ss", $ip, $email);
    $stmt->execute();
}
