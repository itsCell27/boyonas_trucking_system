<?php
require_once 'cors.php';
require_once 'db.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Unauthorized']);
  exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
  exit;
}

$booking_id = intval($input['booking_id'] ?? 0);
$truck_id = intval($input['truck_id'] ?? 0);
$driver_id = intval($input['driver_id'] ?? 0);
$helper_id = isset($input['helper_id']) && $input['helper_id'] !== null ? intval($input['helper_id']) : null;
$remarks = $input['remarks'] ?? "";

if (!$booking_id || !$truck_id || !$driver_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'booking_id, truck_id, and driver_id are required']);
  exit;
}

$conn->begin_transaction();

try {

  // 1. Check booking exists + is assignable
  $stmt = $conn->prepare("SELECT status FROM bookings WHERE booking_id = ?");
  $stmt->bind_param("i", $booking_id);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    throw new Exception("Booking not found");
  }

  $booking = $result->fetch_assoc();
  if ($booking['status'] !== 'Pending Assignment') {
    throw new Exception("Booking is already assigned or not available for assignment");
  }
  $stmt->close();

  // 2. Verify truck is available (status column removed)
  $stmt = $conn->prepare("SELECT operational_status FROM trucks WHERE truck_id = ?");
  $stmt->bind_param("i", $truck_id);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    throw new Exception("Truck not found");
  }

  $truck = $result->fetch_assoc();
  if ($truck['operational_status'] !== 'Available') {
    throw new Exception("Truck is not available (Status: {$truck['operational_status']})");
  }
  $stmt->close();

  // 3. Verify driver is available
  $stmt = $conn->prepare("SELECT status, position FROM employees WHERE employee_id = ?");
  $stmt->bind_param("i", $driver_id);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    throw new Exception("Driver not found");
  }

  $driver = $result->fetch_assoc();
  if ($driver['position'] !== 'Driver') {
    throw new Exception("Selected employee is not a driver");
  }
  if ($driver['status'] !== 'Idle') {
    throw new Exception("Driver is not available (Status: {$driver['status']})");
  }
  $stmt->close();

  // 4. Verify helper is available (optional)
  if ($helper_id) {
    $stmt = $conn->prepare("SELECT status, position FROM employees WHERE employee_id = ?");
    $stmt->bind_param("i", $helper_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
      throw new Exception("Helper not found");
    }

    $helper = $result->fetch_assoc();
    if ($helper['position'] !== 'Helper') {
      throw new Exception("Selected employee is not a helper");
    }
    if ($helper['status'] !== 'Idle') {
      throw new Exception("Helper is not available (Status: {$helper['status']})");
    }
    $stmt->close();
  }

  // 5. Insert assignment
  $status = 'Pending';
  $stmt = $conn->prepare("
      INSERT INTO assignments (booking_id, truck_id, driver_id, helper_id, current_status, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
  ");
  $stmt->bind_param("iiiiss", $booking_id, $truck_id, $driver_id, $helper_id, $status, $remarks);
  $stmt->execute();
  $assignment_id = $stmt->insert_id;
  $stmt->close();

  // 6. Update booking status
  $stmt = $conn->prepare("UPDATE bookings SET status = 'Assigned' WHERE booking_id = ?");
  $stmt->bind_param("i", $booking_id);
  $stmt->execute();
  $stmt->close();

  // 7. Update truck operational status
  $stmt = $conn->prepare("UPDATE trucks SET operational_status = 'On Delivery' WHERE truck_id = ?");
  $stmt->bind_param("i", $truck_id);
  $stmt->execute();
  $stmt->close();

  // 8. Update driver / helper status
  $stmt = $conn->prepare("UPDATE employees SET status = 'Deployed' WHERE employee_id = ?");
  $stmt->bind_param("i", $driver_id);
  $stmt->execute();
  $stmt->close();

  if ($helper_id) {
    $stmt = $conn->prepare("UPDATE employees SET status = 'Deployed' WHERE employee_id = ?");
    $stmt->bind_param("i", $helper_id);
    $stmt->execute();
    $stmt->close();
  }

  // 9. Log assignment (Assigned)
  $log_status = 'Assigned';
  $log_remarks = 'Assignment created';
  $user_id = $_SESSION['user_id'];

  $stmt = $conn->prepare("
      INSERT INTO status_logs (assignment_id, booking_id, status, remarks, updated_by)
      VALUES (?, ?, ?, ?, ?)
  ");
  $stmt->bind_param("iissi", $assignment_id, $booking_id, $log_status, $log_remarks, $user_id);
  $stmt->execute();
  $stmt->close();

  // Commit
  $conn->commit();

  echo json_encode([
    'success' => true,
    'assignment_id' => $assignment_id,
    'message' => 'Assignment created successfully'
  ]);

} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
