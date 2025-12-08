<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
session_start();

header('Content-Type: application/json');

function respond_error($msg, $code = 400)
{
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $msg]);
    exit;
}

function log_error_detail($msg)
{
    $logDir = __DIR__ . '/../../logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    @file_put_contents(
        $logDir . '/update_status.log',
        "[" . date('Y-m-d H:i:s') . "] " . $msg . PHP_EOL,
        FILE_APPEND
    );
}

try {

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond_error("Invalid method", 405);
    }

    if (!isset($_SESSION['user_id'])) {
        respond_error("Unauthorized", 401);
    }

    $raw = json_decode(file_get_contents("php://input"), true);
    $assignmentId = (int)($raw["assignment_id"] ?? 0);
    $newStatus = trim($raw["new_status"] ?? "");

    if ($assignmentId <= 0 || $newStatus === "") {
        respond_error("assignment_id and new_status are required");
    }

    // allowed statuses
    $allowed = [
        "Pending","OTW to SOC","OTW to Pickup","Loading","OTW to Destination",
        "Unloading","Completed","Incomplete","Cancelled"
    ];

    if (!in_array($newStatus, $allowed, true)) {
        respond_error("Invalid status");
    }

    // Fetch assignment
    $stmt = $conn->prepare("SELECT * FROM assignments WHERE assignment_id = ? LIMIT 1");
    $stmt->bind_param("i", $assignmentId);
    $stmt->execute();
    $assignment = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$assignment) {
        respond_error("Assignment not found", 404);
    }

    $userId = (int)$_SESSION["user_id"];

    // Fetch employee_id
    $empStmt = $conn->prepare("SELECT employee_id FROM employees WHERE user_id = ? LIMIT 1");
    $empStmt->bind_param("i", $userId);
    $empStmt->execute();
    $empRow = $empStmt->get_result()->fetch_assoc();
    $empStmt->close();

    if (!$empRow) {
        respond_error("Employee record not found", 403);
    }

    $driverEmployeeId = (int)$empRow["employee_id"];

    if ($assignment["driver_id"] !== $driverEmployeeId) {
        respond_error("You are not the assigned driver", 403);
    }

    // Final statuses cannot change
    if (in_array($assignment["current_status"], ["Completed","Incomplete","Cancelled"], true)) {
        respond_error("Assignment is already final");
    }

    // Fetch booking for step rules
    $bstmt = $conn->prepare("SELECT service_type FROM bookings WHERE booking_id = ? LIMIT 1");
    $bstmt->bind_param("i", $assignment["booking_id"]);
    $bstmt->execute();
    $brow = $bstmt->get_result()->fetch_assoc();
    $bstmt->close();

    $serviceType = strtolower($brow["service_type"] ?? "");
    // FIX 2: Fixed service type detection - LipatBahay is always pickup-based
    $initialStep = ($serviceType === "lipatbahay") ? "OTW to Pickup" : "OTW to SOC";

    $steps = [$initialStep, "Loading", "OTW to Destination", "Unloading", "Completed"];
    $currentIndex = array_search($assignment["current_status"], $steps, true);
    $targetIndex = array_search($newStatus, $steps, true);

    // Enforce correct progression
    if ($assignment["current_status"] === "Pending") {
        if ($newStatus !== $initialStep) {
            respond_error("Must start at: $initialStep");
        }
    } else {
        if ($currentIndex !== false && $targetIndex !== false) {
            if ($targetIndex !== $currentIndex + 1) {
                respond_error("Invalid status progression");
            }
        }
    }

    // ✅ FIX 3: Require proof for ALL non-initial status updates (except Pending -> first step)
    if ($assignment["current_status"] !== "Pending" && $newStatus !== "Cancelled" && $newStatus !== "Incomplete") {
        $docStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM documents WHERE assignment_id = ? AND document_type = 'proof_of_delivery'");
        $docStmt->bind_param("i", $assignmentId);
        $docStmt->execute();
        $cntRow = $docStmt->get_result()->fetch_assoc();
        $docStmt->close();

        if (($cntRow["cnt"] ?? 0) < 1) {
            respond_error("Proof required before updating status");
        }
    }

    // "Completed" requires proof (double-check)
    if ($newStatus === "Completed") {
        $docStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM documents WHERE assignment_id = ? AND document_type = 'proof_of_delivery'");
        $docStmt->bind_param("i", $assignmentId);
        $docStmt->execute();
        $cntRow = $docStmt->get_result()->fetch_assoc();
        $docStmt->close();

        if (($cntRow["cnt"] ?? 0) < 1) {
            respond_error("Proof required before completing delivery");
        }
    }

    // Start transaction for atomicity
    $conn->begin_transaction();

    $booking_status_before = "Ongoing";
    $booking_status_after = "Completed";

    try {
        if ($newStatus == "OTW to Pickup" || $newStatus == "OTW to SOC") {
            $update_booking_status = $conn->prepare("UPDATE bookings SET status = ? WHERE booking_id = ?");
            $update_booking_status->bind_param("si", $booking_status_before, $assignment["booking_id"]);
            $update_booking_status->execute();
            $update_booking_status->close();
        }

        if ($newStatus == "Completed") {
            $update_booking_status_after = $conn->prepare("UPDATE bookings SET status = ? WHERE booking_id = ?");
            $update_booking_status_after->bind_param("si", $booking_status_after, $assignment["booking_id"]);
            $update_booking_status_after->execute();
            $update_booking_status_after->close();
        }

        // Perform update
        $upd = $conn->prepare("UPDATE assignments SET current_status = ?, assigned_date = assigned_date WHERE assignment_id = ?");
        $upd->bind_param("si", $newStatus, $assignmentId);
        $upd->execute();
        $upd->close();

        // FIX 4: Insert status_log entry
        $logStmt = $conn->prepare("
            INSERT INTO status_logs (assignment_id, booking_id, status, remarks, timestamp, updated_by)
            VALUES (?, ?, ?, '', NOW(), ?)
        ");
        $logStmt->bind_param("iisi", $assignmentId, $assignment["booking_id"], $newStatus, $userId);
        $logStmt->execute();
        $logStmt->close();

        // Commit transaction
        $conn->commit();

        echo json_encode([
            "success" => true,
            "assignment_id" => $assignmentId,
            "new_status" => $newStatus
        ]);
        exit;

    } catch (Exception $e) {
        $conn->rollback();
        log_error_detail("Transaction failed: " . $e->getMessage());
        respond_error("Failed to update status", 500);
    }

} catch (Throwable $e) {
    log_error_detail("Exception: " . $e->getMessage());
    respond_error("Server error: " . $e->getMessage(), 500);
}