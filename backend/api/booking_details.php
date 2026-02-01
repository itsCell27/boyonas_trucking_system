<?php
require_once 'cors.php';
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized. Please log in."]);
    exit();
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
    exit();
}

try {
    // Validate required parameter
    if (!isset($_GET['booking_id'])) {
        throw new Exception("Missing required parameter: booking_id");
    }

    $bookingId = intval($_GET['booking_id']);

    // Fetch booking details
    $bookingQuery = "
        SELECT 
            b.booking_id,
            b.service_type,
            b.dr_number,
            b.partner_name,
            b.customer_name,
            b.phone_number,
            b.route_from,
            b.route_to,
            b.scheduled_start,
            b.deadline,
            b.estimated_weight,
            b.service_rate,
            b.category,
            b.status,
            b.date_created,
            b.created_by,
            u.name as created_by_name
        FROM bookings b
        LEFT JOIN users u ON b.created_by = u.user_id
        WHERE b.booking_id = ?
    ";
    
    $stmt = $conn->prepare($bookingQuery);
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $bookingResult = $stmt->get_result();
    
    if ($bookingResult->num_rows === 0) {
        throw new Exception("Booking not found.");
    }
    
    $booking = $bookingResult->fetch_assoc();
    $stmt->close();

    // Fetch assignment details if exists
    $assignment = null;
    $assignmentQuery = "
        SELECT 
            a.assignment_id,
            a.booking_id,
            a.truck_id,
            a.driver_id,
            a.helper_id,
            a.assigned_date,
            a.current_status,
            a.remarks,
            t.plate_number,
            t.model as truck_model,
            t.capacity as truck_capacity,
            d.full_name as driver_name,
            d.employee_code as driver_code,
            d.contact_number as driver_contact,
            h.full_name as helper_name,
            h.employee_code as helper_code,
            h.contact_number as helper_contact
        FROM assignments a
        LEFT JOIN trucks t ON a.truck_id = t.truck_id
        LEFT JOIN employees d ON a.driver_id = d.employee_id
        LEFT JOIN employees h ON a.helper_id = h.employee_id
        WHERE a.booking_id = ?
    ";
    
    $stmt = $conn->prepare($assignmentQuery);
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $assignmentResult = $stmt->get_result();
    
    if ($assignmentResult->num_rows > 0) {
        $assignment = $assignmentResult->fetch_assoc();
    }
    $stmt->close();

    // Fetch documents using booking_id (NOT assignment_id)
    $documents = [];

    $documentsQuery = "
        SELECT 
            d.document_id,
            d.booking_id,
            d.document_type,
            d.file_path,
            d.date_uploaded,
            d.uploaded_by,
            u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.user_id
        WHERE d.booking_id = ?
        ORDER BY d.date_uploaded DESC
    ";

    $stmt = $conn->prepare($documentsQuery);
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $documentsResult = $stmt->get_result();

    while ($row = $documentsResult->fetch_assoc()) {
        $documents[] = $row;
    }

    $stmt->close();


    // Fetch status logs if assignment exists
    $statusLogs = [];
    if ($assignment) {
        $statusLogsQuery = "
            SELECT 
                sl.status_log_id,
                sl.assignment_id,
                sl.status,
                sl.remarks,
                sl.timestamp,
                sl.updated_by,
                u.name as updated_by_name
            FROM status_logs sl
            LEFT JOIN users u ON sl.updated_by = u.user_id
            WHERE sl.assignment_id = ?
            ORDER BY sl.timestamp DESC
        ";
        
        $stmt = $conn->prepare($statusLogsQuery);
        $stmt->bind_param("i", $assignment['assignment_id']);
        $stmt->execute();
        $statusLogsResult = $stmt->get_result();
        
        while ($row = $statusLogsResult->fetch_assoc()) {
            $statusLogs[] = $row;
        }
        $stmt->close();
    }

    // Return all data
    echo json_encode([
        "success" => true,
        "booking" => $booking,
        "assignment" => $assignment,
        "documents" => $documents,
        "status_logs" => $statusLogs
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>