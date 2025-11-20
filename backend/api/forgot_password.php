<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once 'cors.php';
require 'db.php';
require __DIR__ . '/../vendor/autoload.php';

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Find user
$stmt = $conn->prepare("SELECT user_id, name FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'No account found for this email']);
    exit;
}

// Delete old reset tokens
$conn->query("DELETE FROM password_resets WHERE user_id = {$user['user_id']}");

// Create new token and expiration
$token = bin2hex(random_bytes(32));
$expires_at = date('Y-m-d H:i:s', time() + 900); // 15 minutes

$stmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param('iss', $user['user_id'], $token, $expires_at);
$stmt->execute();

// Construct reset link (frontend URL)
$resetLink = $_ENV['FRONTEND_ORIGIN'] . '/reset_password?token=' . urlencode($token);

// Send email
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
    $mail->addAddress($email);

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'Password Reset Request';

    // Theme colors (hex equivalents to your theme)
    // primary: blue, accent: orange, background: light, foreground: dark
    $bg      = '#F8FAFC'; // light background
    $cardBg  = '#FFFFFF'; // card white
    $text    = '#0F1724'; // dark foreground
    $muted   = '#6B7280'; // muted text
    $primary = '#2563EB'; // blue (CTA)
    $accent  = '#FB923C'; // orange accent
    $danger  = '#EF4444'; // destructive/red
    $border  = '#E6E9EE'; // subtle border

    $userNameSafe = htmlspecialchars($user['name'], ENT_QUOTES | ENT_HTML5);
    $resetLinkSafe = htmlspecialchars($resetLink, ENT_QUOTES | ENT_HTML5);
    $company = htmlspecialchars($_ENV['SMTP_FROM_NAME'], ENT_QUOTES | ENT_HTML5);
    $expiresMinutes = 15; // keep in sync with server logic

    $mail->Body = <<<HTML
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Password Reset</title>
    </head>
    <body style="margin:0;padding:0;background:{$bg};font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;color:{$text};">
    <!-- Preheader : hidden text shown in inbox preview -->
    <div style="display:none;max-height:0px;overflow:hidden;mso-hide:all;font-size:1px;color:{$bg};line-height:1px;opacity:0;">Reset your password — the link expires in {$expiresMinutes} minutes.</div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:{$bg};padding:20px 16px;">
        <tr>
        <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;border:1px solid {$border};border-radius:12px;background:{$cardBg};overflow:hidden;">
            <!-- Header -->
            <tr>
                <td style="padding:22px 28px;border-bottom:1px solid {$border};">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:44px;height:44px;border-radius:10px;background:{$primary};display:inline-block;text-align:center;line-height:44px;font-weight:600;color:#fff;font-size:18px;">
                    <!-- Logo fallback: first letter -->
                    {$company[0]}
                    </div>
                    <div style="font-size:16px;font-weight:600;color:{$text};">{$company}</div>
                </div>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding:28px;">
                <h1 style="margin:0 0 12px 0;font-size:20px;color:{$text};">Password Reset Requested</h1>
                <p style="margin:0 0 18px 0;color:{$muted};font-size:15px;line-height:1.5;">
                    Hello <strong style="color:{$text};">{$userNameSafe}</strong>,
                </p>

                <p style="margin:0 0 22px 0;color:{$muted};font-size:15px;line-height:1.5;">
                    We received a request to reset the password for your account. Click the button below to set a new password. The link will expire in <strong>{$expiresMinutes} minutes</strong> and can only be used once.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;">
                    <tr>
                    <td align="center">
                        <a href="{$resetLinkSafe}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 22px;border-radius:8px;background:{$primary};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 6px 18px rgba(37,99,235,0.12);">
                        Reset Password
                        </a>
                    </td>
                    </tr>
                </table>

                <p style="margin:0 0 12px 0;color:{$muted};font-size:13px;line-height:1.4;">
                    If the button doesn't work, paste this link into your browser:
                </p>
                <p style="word-break:break-all;margin:0 0 22px 0;font-size:13px;">
                    <a href="{$resetLinkSafe}" target="_blank" rel="noopener" style="color:{$primary};text-decoration:underline;">{$resetLinkSafe}</a>
                </p>

                <div style="padding:14px;border-radius:8px;background:#F1F5F9;border:1px solid {$border};color:{$muted};font-size:13px;">
                    <strong style="color:{$text};display:block;margin-bottom:6px;">Security tip</strong>
                    If you didn't request a password reset, please ignore this email or contact support if you think an unauthorized attempt was made.
                </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding:18px 28px;border-top:1px solid {$border};background:{$cardBg};">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                    <td style="font-size:13px;color:{$muted};">
                        &copy; {$company} — If you need help, reply to this email.
                    </td>
                    <td align="right" style="font-size:13px;color:{$muted};">
                        <a href="#" style="color:{$accent};text-decoration:none;">Manage my account</a>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>
    </body>
    </html>
    HTML;

    // Plain-text fallback
    $mail->AltBody = "Hello {$userNameSafe},\n\nWe received a request to reset your password. Use the link below to reset it (expires in {$expiresMinutes} minutes):\n\n{$resetLinkSafe}\n\nIf you didn't request a password reset, ignore this message.\n\n— {$company}";

    $mail->send();
    echo json_encode(['status' => 'ok', 'message' => 'Password reset email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Email could not be sent', 'details' => $mail->ErrorInfo]);
}

$conn->close();
?>