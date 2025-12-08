<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

session_start(); // REQUIRED for updated_by in status_logs

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = isset($data['booking_id']) ? intval($data['booking_id']) : null;

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    exit;
}

// Check booking exists and current status
$stmt = $conn->prepare("SELECT status FROM bookings WHERE booking_id = ?");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$res = $stmt->get_result();

if (!$res || $res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit;
}

$row = $res->fetch_assoc();
$current_status = $row['status'];

// Don't cancel if already cancelled or completed
if ($current_status === 'Cancelled') {
    echo json_encode(["success" => false, "message" => "Booking already cancelled"]);
    exit;
}
if ($current_status === 'Completed') {
    echo json_encode(["success" => false, "message" => "Cannot cancel a completed booking"]);
    exit;
}

$conn->begin_transaction();

try {

    // Get assigned truck, driver, and helper from assignments table
    $assignStmt = $conn->prepare("
        SELECT assignment_id, truck_id, driver_id, helper_id 
        FROM assignments 
        WHERE booking_id = ?
    ");
    $assignStmt->bind_param("i", $booking_id);
    $assignStmt->execute();
    $assignRes = $assignStmt->get_result();

    $assignment_id = null;
    $truck_id = null;
    $driver_id = null;
    $helper_id = null;

    if ($assignRes && $assignRes->num_rows > 0) {
        $assign = $assignRes->fetch_assoc();
        $assignment_id = $assign['assignment_id']; // NEWLY USED BELOW
        $truck_id = $assign['truck_id'];
        $driver_id = $assign['driver_id'];
        $helper_id = $assign['helper_id'];
    }

    // Cancel the booking
    $upd = $conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?");
    $upd->bind_param("i", $booking_id);
    if (!$upd->execute()) {
        throw new Exception("Failed to update booking");
    }

    // Update truck status to Available
    if (!empty($truck_id)) {
        $truckUpd = $conn->prepare("UPDATE trucks SET operational_status = 'Available' WHERE truck_id = ?");
        $truckUpd->bind_param("i", $truck_id);
        if (!$truckUpd->execute()) {
            throw new Exception("Failed to update truck status");
        }
    }

    // Update driver status to Idle
    if (!empty($driver_id)) {
        $driverUpd = $conn->prepare("UPDATE employees SET status = 'Idle' WHERE employee_id = ?");
        $driverUpd->bind_param("i", $driver_id);
        if (!$driverUpd->execute()) {
            throw new Exception("Failed to update driver status");
        }
    }

    // Update helper status to Idle (ONLY if helper exists)
    if (!empty($helper_id)) {
        $helperUpd = $conn->prepare("UPDATE employees SET status = 'Idle' WHERE employee_id = ?");
        $helperUpd->bind_param("i", $helper_id);
        if (!$helperUpd->execute()) {
            throw new Exception("Failed to update helper status");
        }
    }

    // Mark the assignment as Cancelled (if an assignment exists)
    if (!empty($assignment_id)) {
        $assignStatusUpd = $conn->prepare("
            UPDATE assignments 
            SET current_status = 'Cancelled' 
            WHERE assignment_id = ?
        ");
        $assignStatusUpd->bind_param("i", $assignment_id);
        $assignStatusUpd->execute();
    }

    /* ADDED SECTION — INSERT STATUS LOG FOR CANCELLATION */

    $updated_by = $_SESSION['user_id'] ?? null; // The user who cancelled the booking

    $logStmt = $conn->prepare("
        INSERT INTO status_logs (assignment_id, booking_id, status, remarks, updated_by)
        VALUES (?, ?, 'Cancelled', 'Booking was successfully cancelled', ?)
    ");
    $logStmt->bind_param("iii", $assignment_id, $booking_id, $updated_by);
    $logStmt->execute();
    $logStmt->close();

    /* END OF NEW STATUS LOG SECTION */

    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Transaction failed",
        "error" => $e->getMessage()
    ]);
}
?>
