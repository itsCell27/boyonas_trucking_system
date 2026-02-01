<?php
require_once 'cors.php';
require_once 'db.php';

// SQL JOIN to gather all needed fields
$sql = "
SELECT 
    sl.status_log_id,
    sl.assignment_id,
    sl.booking_id,
    sl.status,
    sl.remarks,
    sl.timestamp,

    b.dr_number,
    b.partner_name,
    b.customer_name,
    b.service_type,
    b.route_from,
    b.route_to,
    b.phone_number,

    a.truck_id,
    a.driver_id,

    t.plate_number,
    e.full_name AS driver_name

FROM status_logs sl
LEFT JOIN bookings b ON sl.booking_id = b.booking_id
LEFT JOIN assignments a ON sl.assignment_id = a.assignment_id
LEFT JOIN trucks t ON a.truck_id = t.truck_id
LEFT JOIN employees e ON a.driver_id = e.employee_id

ORDER BY sl.timestamp DESC
LIMIT 200
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Database query failed.",
        "error" => $conn->error
    ]);
    exit;
}

$logs = [];

while ($row = $result->fetch_assoc()) {

    // determine customer field
    $customer = $row["partner_name"] ?: $row["customer_name"];

    // create ID display (fallback using booking id)
    $displayId = $row["dr_number"] 
        ? $row["dr_number"] 
        : "BK-" . $row["booking_id"];

    // ============================
    // TIME AGO CALCULATION
    // ============================
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

    // ============================

    $logs[] = [
        "status_log_id" => intval($row["status_log_id"]),
        "booking_id" => intval($row["booking_id"]),
        "assignment_id" => $row["assignment_id"] ? intval($row["assignment_id"]) : null,

        "id" => $displayId,
        "customer" => $customer,
        "serviceType" => $row["service_type"],
        "status" => $row["status"],
        "remarks" => $row["remarks"],
        "timestamp" => $row["timestamp"],

        "timeAgo" => $label,   // <-- NEW FIELD ADDED

        "origin" => $row["route_from"],
        "destination" => $row["route_to"],

        "driver" => $row["driver_name"],
        "plateNumber" => $row["plate_number"],

        "contact" => $row["phone_number"]
    ];
}

echo json_encode([
    "success" => true,
    "logs" => $logs
]);
