<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

function send_password_email($email, $password) {
    $mail = new PHPMailer(true);

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USERNAME'];
        $mail->Password   = $_ENV['SMTP_PASSWORD'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $_ENV['SMTP_PORT'];

        //Recipients
        $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->addEmbeddedImage(
            'assets/truck_logo.png' ?? null, 
            'logo' // CID name
        );
        $mail->Subject = 'Welcome to ' . $_ENV['SMTP_FROM_NAME'];
        $mail->Body    = '
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:logo" alt="' . $_ENV['SMTP_FROM_NAME'] . ' Logo" width="80">
                <p style="font-weight: bold; margin: 0;">
                    Boyonas Trucking System
                </p>
            </div>
            <p>Dear New Employee,</p>
            <p>Welcome to ' . $_ENV['SMTP_FROM_NAME'] . '! We are excited to have you on our team.</p>
            <p>Your account has been created, and you can now log in to our system using the following credentials:</p>
            <ul>
                <li><strong>Username:</strong> ' . $email . '</li>
                <li><strong>Temporary Password:</strong> ' . $password . '</li>
            </ul>
            <p>For security reasons, we recommend that you change your temporary password upon your first login.</p>
            <p>If you have any questions or need assistance, please do not hesitate to contact our support team.</p>
            <p>Best regards,</p>
            <p>The ' . $_ENV['SMTP_FROM_NAME'] . ' Team</p>
        ';
        $mail->AltBody = '
            Dear New Employee,

            Welcome to ' . $_ENV['SMTP_FROM_NAME'] . '! We are excited to have you on our team.

            Your account has been created, and you can now log in to our system using the following credentials:

            Username: ' . $email . '
            Temporary Password: ' . $password . '

            For security reasons, we require that you change your temporary password upon your first login. You will be prompted to do so automatically.

            If you have any questions or need assistance, please do not hesitate to contact our support team.

            Best regards,
            The ' . $_ENV['SMTP_FROM_NAME'] . ' Team
        ';

        $mail->send();
    } catch (Exception $e) {
        // You can log the error for debugging purposes
        // error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}
?>