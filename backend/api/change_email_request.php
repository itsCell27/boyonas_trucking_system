<?php
require_once 'db.php';
require_once 'cors.php';
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

session_start();

if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$password = $data['password'] ?? '';
$newEmail = strtolower(trim($data['new_email'] ?? ''));

if (!$password || !$newEmail) {
  http_response_code(400);
  echo json_encode(["error" => "Missing fields"]);
  exit;
}

/* Fetch current user */
$stmt = $conn->prepare("SELECT email, password FROM users WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
  http_response_code(401);
  echo json_encode(["error" => "Invalid password"]);
  exit;
}

/* Prevent duplicate email */
$check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$check->bind_param("s", $newEmail);
$check->execute();
if ($check->get_result()->num_rows > 0) {
  http_response_code(409);
  echo json_encode(["error" => "Email already in use"]);
  exit;
}

/* Generate token */
$token = bin2hex(random_bytes(32));
$hashedToken = hash('sha256', $token);
$expires = date('Y-m-d H:i:s', time() + 3600);

/* Save pending change */
$update = $conn->prepare("
  UPDATE users
  SET pending_email = ?, email_change_token = ?, email_change_expires = ?
  WHERE user_id = ?
");
$update->bind_param("sssi", $newEmail, $hashedToken, $expires, $_SESSION['user_id']);
$update->execute();

/* Send email */
$mail = new PHPMailer(true);
try {
  // Server settings
  $mail->isSMTP();
  $mail->Host       = $_ENV['SMTP_HOST'];
  $mail->SMTPAuth   = true;
  $mail->Username   = $_ENV['SMTP_USERNAME'];
  $mail->Password   = $_ENV['SMTP_PASSWORD'];
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port       = $_ENV['SMTP_PORT'];

  // Recipients
  $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
  $mail->addAddress($newEmail);

  // Content
  $mail->isHTML(true);
  $mail->addEmbeddedImage(
    'assets/truck_logo.png' ?? null,
    'logo'
  );

  $confirmLink = FRONTEND_ORIGIN . "/confirm_email_change?token=$token";

  $mail->Subject = 'Confirm Your Email Change - ' . $_ENV['SMTP_FROM_NAME'];
  $mail->Body = '
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="cid:logo" alt="' . $_ENV['SMTP_FROM_NAME'] . ' Logo" width="80">
      <p style="font-weight: bold; margin: 0;">
        ' . $_ENV['SMTP_FROM_NAME'] . '
      </p>
    </div>

    <p>Dear User,</p>

    <p>
      We received a request to change the email address associated with your
      <strong>' . $_ENV['SMTP_FROM_NAME'] . '</strong> account.
    </p>

    <p>
      To confirm this change, please click the button below:
    </p>

    <p style="text-align: center; margin: 25px 0;">
      <a href="' . $confirmLink . '"
         style="
           background-color: #0f172a;
           color: #ffffff;
           padding: 12px 20px;
           text-decoration: none;
           border-radius: 6px;
           font-weight: bold;
           display: inline-block;
         ">
        Confirm Email Change
      </a>
    </p>

    <p>
      This confirmation link will expire in <strong>1 hour</strong>.
      If you did not request this change, please ignore this email.
    </p>

    <p>
      For security reasons, no changes will be made unless this link is confirmed.
    </p>

    <p>Best regards,</p>
    <p>The ' . $_ENV['SMTP_FROM_NAME'] . ' Team</p>
  ';

  $mail->AltBody = '
    Dear User,

    We received a request to change the email address associated with your
    ' . $_ENV['SMTP_FROM_NAME'] . ' account.

    To confirm this change, please open the link below:

    ' . $confirmLink . '

    This link will expire in 1 hour.
    If you did not request this change, you may safely ignore this email.

    Best regards,
    The ' . $_ENV['SMTP_FROM_NAME'] . ' Team
  ';

  $mail->send();
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => "Email could not be sent"]);
  exit;
}

echo json_encode(["success" => true]);
