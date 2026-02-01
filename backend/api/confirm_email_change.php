<?php
require_once 'db.php';
require_once 'cors.php';
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Load .env file
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? '';

if (!$token) {
  http_response_code(400);
  echo json_encode(["error" => "Missing token"]);
  exit;
}

/* Hash token to match DB */
$hashedToken = hash('sha256', $token);

/* Find valid email change request */
$stmt = $conn->prepare("
  SELECT user_id, pending_email
  FROM users
  WHERE email_change_token = ?
    AND email_change_expires > NOW()
    AND pending_email IS NOT NULL
  LIMIT 1
");
$stmt->bind_param("s", $hashedToken);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid or expired token"]);
  exit;
}

$user = $result->fetch_assoc();

/* Apply email change atomically */
$conn->begin_transaction();

try {
  $update = $conn->prepare("
    UPDATE users
    SET
      email = pending_email,
      pending_email = NULL,
      email_change_token = NULL,
      email_change_expires = NULL
    WHERE user_id = ?
  ");
  $update->bind_param("i", $user['user_id']);
  $update->execute();

  $conn->commit();

  echo json_encode(["success" => true]);
} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(["error" => "Failed to update email"]);
}
