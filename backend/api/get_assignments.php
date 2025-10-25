<?php
require_once 'cors.php';
require_once 'db.php';

$sql = "SELECT a.assignment_id, a.booking_id, a.truck_id, a.driver_id, a.helper_id,
               a.assigned_date, a.current_status, a.remarks,
               b.dr_number, b.partner_name, b.route_from, b.route_to, b.scheduled_start,
               t.plate_number, t.model,
               d.full_name AS driver_name,
               h.full_name AS helper_name
        FROM assignments a
        JOIN bookings b ON b.booking_id = a.booking_id
        JOIN trucks t ON t.truck_id = a.truck_id
        JOIN employees d ON d.employee_id = a.driver_id
        LEFT JOIN employees h ON h.employee_id = a.helper_id
        ORDER BY a.assigned_date DESC";

$res = $conn->query($sql);
$out = [];
while ($row = $res->fetch_assoc()) { $out[] = $row; }
echo json_encode($out);
$conn->close();
?>