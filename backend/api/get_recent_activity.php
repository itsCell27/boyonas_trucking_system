<?php
require_once 'cors.php';
session_start();
require_once 'db.php';

// Optional: protect endpoint
/*
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
*/

header("Content-Type: application/json");

$query = "
    SELECT 
        sl.status_log_id,
        sl.status,
        sl.timestamp,
        sl.remarks,
        
        b.dr_number AS deliveryID,
        b.service_type,
        b.partner_name AS client,
        CONCAT(b.route_from, ' → ', b.route_to) AS route,

        t.plate_number AS vehiclePlate,
        e.full_name AS driver,

        u.name AS updated_by

    FROM status_logs sl
    INNER JOIN bookings b ON sl.booking_id = b.booking_id
    LEFT JOIN assignments a ON sl.assignment_id = a.assignment_id
    LEFT JOIN trucks t ON a.truck_id = t.truck_id
    LEFT JOIN employees e ON a.driver_id = e.employee_id
    LEFT JOIN users u ON sl.updated_by = u.user_id

    ORDER BY sl.timestamp DESC
    LIMIT 5
";

$result = $conn->query($query);

$activity = [];

while ($row = $result->fetch_assoc()) {

    // Convert timestamp → "time ago" format for frontend
    $timeAgo = time() - strtotime($row['timestamp']);
    if ($timeAgo < 60) {
        $label = "$timeAgo seconds ago";
    }
    elseif ($timeAgo < 3600) {
        $minutes = floor($timeAgo / 60);
        $label = $minutes == 1 ? "1 minute ago" : "$minutes minutes ago";
    }
    elseif ($timeAgo < 86400) {
        $hours = floor($timeAgo / 3600);
        $label = $hours == 1 ? "1 hour ago" : "$hours hours ago";
    }
    else {
        $days = floor($timeAgo / 86400);
        $label = $days == 1 ? "1 day ago" : "$days days ago";
    }


    $activity[] = [
        "deliveryID" => $row["deliveryID"],
        "serviceType" => $row["service_type"],
        "route" => $row["route"],
        "vehiclePlate" => $row["vehiclePlate"] ?? "No Vehicle Assigned",
        "driver" => $row["driver"] ?? "No Driver Assigned",
        "client" => $row["client"] ?? "Unknown Client",
        "status" => $row["status"],
        "time" => $label
    ];
}

echo json_encode($activity);
$conn->close();
?>
