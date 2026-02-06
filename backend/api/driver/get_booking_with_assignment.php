<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

function respond_error($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function log_error_detail($msg)
{
    $logDir = __DIR__ . '/../../logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    @file_put_contents(
        $logDir . '/get_booking_with_assignment.log',
        "[" . date('Y-m-d H:i:s') . "] " . $msg . PHP_EOL,
        FILE_APPEND
    );
}

try {

    if (!isset($_SESSION['user_id'])) {
        respond_error('Unauthorized', 401);
    }

    $assignmentId = isset($_GET['assignment_id']) ? (int)$_GET['assignment_id'] : 0;
    if ($assignmentId <= 0) {
        respond_error('assignment_id required');
    }

    // ==============================
    // FETCH ASSIGNMENT
    // ==============================
    $stmt = $conn->prepare("SELECT * FROM assignments WHERE assignment_id = ? LIMIT 1");
    if (!$stmt) {
        log_error_detail("Prepare failed (assignment): " . $conn->error);
        respond_error('Server error', 500);
    }
    $stmt->bind_param("i", $assignmentId);
    $stmt->execute();
    $assignment = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$assignment) {
        respond_error('Assignment not found', 404);
    }

    // ==============================
    // FETCH BOOKING
    // ==============================
    $booking = null;
    if (!empty($assignment['booking_id'])) {

        $bstmt = $conn->prepare("SELECT * FROM bookings WHERE booking_id = ? LIMIT 1");
        if ($bstmt) {
            $bstmt->bind_param("i", $assignment['booking_id']);
            $bstmt->execute();
            $booking = $bstmt->get_result()->fetch_assoc();
            $bstmt->close();
        } else {
            log_error_detail("Prepare failed (booking): " . $conn->error);
        }
    }

    // ==============================
    // FETCH TRUCK
    // ==============================
    $truck = null;

    if (!empty($assignment['truck_id'])) {
        $tstmt = $conn->prepare("SELECT * FROM trucks WHERE truck_id = ? LIMIT 1");
        if ($tstmt) {
            $tstmt->bind_param("i", $assignment['truck_id']);
            $tstmt->execute();
            $truck = $tstmt->get_result()->fetch_assoc();
            $tstmt->close();
        } else {
            log_error_detail("Prepare failed (truck): " . $conn->error);
        }
    }

    // ==============================
    // FETCH DRIVER
    // ==============================
    $driver = null;

    if (!empty($assignment['driver_id'])) {
        $dstmt = $conn->prepare("SELECT * FROM employees WHERE employee_id = ? LIMIT 1");
        if ($dstmt) {
            $dstmt->bind_param("i", $assignment['driver_id']);
            $dstmt->execute();
            $driver = $dstmt->get_result()->fetch_assoc();
            $dstmt->close();
        } else {
            log_error_detail("Prepare failed (driver): " . $conn->error);
        }
    }

    // ==============================
    // FETCH HELPER
    // ==============================
    $helper = null;

    if (!empty($assignment['helper_id'])) {
        $hstmt = $conn->prepare("SELECT * FROM employees WHERE employee_id = ? LIMIT 1");
        if ($hstmt) {
            $hstmt->bind_param("i", $assignment['helper_id']);
            $hstmt->execute();
            $helper = $hstmt->get_result()->fetch_assoc();
            $hstmt->close();
        } else {
            log_error_detail("Prepare failed (helper): " . $conn->error);
        }
    }

    // ==============================
    // FETCH DOCUMENTS (FIXED!)
    // ==============================
    $docs = [];

    $dstmt = $conn->prepare("
        SELECT 
            document_id, assignment_id, booking_id, document_type, file_path,
            uploaded_by, date_uploaded
        FROM documents 
        WHERE assignment_id = ? 
        ORDER BY date_uploaded ASC
    ");

    if ($dstmt) {
        $dstmt->bind_param("i", $assignmentId);
        $dstmt->execute();
        $result = $dstmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $docs[] = $row;
        }

        $dstmt->close();
    } else {
        log_error_detail("Prepare failed (documents): " . $conn->error);
    }

    // ==============================
    // SUCCESS RESPONSE
    // ==============================
    echo json_encode([
        'success' => true,
        'assignment' => $assignment,
        'booking' => $booking,
        'truck' => $truck,
        'driver' => $driver,
        'helper' => $helper,
        'documents' => $docs
    ]);
    exit;

} catch (Throwable $e) {

    log_error_detail("Exception: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
    respond_error('Server error', 500);
}
