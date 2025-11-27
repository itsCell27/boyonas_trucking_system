<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header("Content-Type: application/json");

// Helper function using mysqli
function getStats($dateCondition)
{
    global $conn;

    // Total routes
    $sql = "
        SELECT COUNT(*) AS total 
        FROM bookings 
        WHERE DATE(scheduled_start) = $dateCondition
        AND service_type = 'Partnership'
    ";
    $result = $conn->query($sql);
    $total = ($result) ? $result->fetch_assoc()['total'] : 0;

    // Completed
    $sql = "
        SELECT COUNT(*) AS completed
        FROM bookings
        WHERE DATE(scheduled_start) = $dateCondition
        AND status = 'Completed'
        AND service_type = 'Partnership'
    ";
    $result = $conn->query($sql);
    $completed = ($result) ? $result->fetch_assoc()['completed'] : 0;

    // Ongoing = Assigned but not completed
    $sql = "
        SELECT COUNT(*) AS ongoing
        FROM bookings
        WHERE DATE(scheduled_start) = $dateCondition
        AND status = 'Assigned'
        AND service_type = 'Partnership'
    ";
    $result = $conn->query($sql);
    $ongoing = ($result) ? $result->fetch_assoc()['ongoing'] : 0;

    return [
        "total" => (int)$total,
        "completed" => (int)$completed,
        "ongoing" => (int)$ongoing
    ];
}

// Routes today
$today = getStats("CURDATE()");

// Routes yesterday
$yesterday = getStats("CURDATE() - INTERVAL 1 DAY");

// Routes tomorrow: partners
$sql = "
    SELECT partner_name, COUNT(*) AS count
    FROM bookings
    WHERE DATE(scheduled_start) = CURDATE() + INTERVAL 1 DAY
    AND service_type = 'Partnership'
    GROUP BY partner_name
";
$result = $conn->query($sql);
$tomorrowPartners = ($result) ? $result->fetch_all(MYSQLI_ASSOC) : [];

// Routes tomorrow: total
$sql = "
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE DATE(scheduled_start) = CURDATE() + INTERVAL 1 DAY
    AND service_type = 'Partnership'
";
$result = $conn->query($sql);
$tomorrowTotal = ($result) ? (int)$result->fetch_assoc()['total'] : 0;

$response = [
    "routes_today" => $today,
    "routes_yesterday" => $yesterday,
    "routes_tomorrow" => [
        "total" => $tomorrowTotal,
        "by_partner" => $tomorrowPartners
    ]
];

echo json_encode($response);
exit;

?>