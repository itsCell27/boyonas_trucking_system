<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header("Content-Type: application/json");

// Helper function (mysqli)
function getStats($dateCondition)
{
    global $conn;

    // Total routes (LipatBahay)
    $sql = "
        SELECT COUNT(*) AS total 
        FROM bookings 
        WHERE DATE(scheduled_start) = $dateCondition
        AND service_type = 'LipatBahay'
    ";
    $result = $conn->query($sql);
    $total = ($result) ? (int)$result->fetch_assoc()['total'] : 0;

    // Completed
    $sql = "
        SELECT COUNT(*) AS completed
        FROM bookings
        WHERE DATE(scheduled_start) = $dateCondition
        AND status = 'Completed'
        AND service_type = 'LipatBahay'
    ";
    $result = $conn->query($sql);
    $completed = ($result) ? (int)$result->fetch_assoc()['completed'] : 0;

    // Ongoing (Assigned but not completed)
    $sql = "
        SELECT COUNT(*) AS ongoing
        FROM bookings
        WHERE DATE(scheduled_start) = $dateCondition
        AND status = 'Assigned'
        AND service_type = 'LipatBahay'
    ";
    $result = $conn->query($sql);
    $ongoing = ($result) ? (int)$result->fetch_assoc()['ongoing'] : 0;

    return [
        "total" => $total,
        "completed" => $completed,
        "ongoing" => $ongoing
    ];
}

// Today
$today = getStats("CURDATE()");

// Yesterday
$yesterday = getStats("CURDATE() - INTERVAL 1 DAY");

// Tomorrow: group by CUSTOMER instead of partner_name
$sql = "
    SELECT customer_name, COUNT(*) AS count
    FROM bookings
    WHERE DATE(scheduled_start) = CURDATE() + INTERVAL 1 DAY
    AND service_type = 'LipatBahay'
    GROUP BY customer_name
";
$result = $conn->query($sql);
$tomorrowCustomers = ($result) ? $result->fetch_all(MYSQLI_ASSOC) : [];

// Tomorrow: total
$sql = "
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE DATE(scheduled_start) = CURDATE() + INTERVAL 1 DAY
    AND service_type = 'LipatBahay'
";
$result = $conn->query($sql);
$tomorrowTotal = ($result) ? (int)$result->fetch_assoc()['total'] : 0;

// Final response
$response = [
    "routes_today" => $today,
    "routes_yesterday" => $yesterday,
    "routes_tomorrow" => [
        "total" => $tomorrowTotal,
        "by_customer" => $tomorrowCustomers
    ]
];

echo json_encode($response);
exit;
?>
