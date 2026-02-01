<?php
require_once "cors.php";
require_once "db.php";

// Get last 7 days
$sqlVolume = "
    SELECT 
        DATE(date_created) AS day,
        service_type,
        COUNT(*) AS count
    FROM bookings
    WHERE DATE(date_created) >= CURDATE() - INTERVAL 7 DAY
      AND status = 'Completed'
    GROUP BY DATE(date_created), service_type
    ORDER BY day ASC
";

$volumeResult = $conn->query($sqlVolume);
$volumeData = [];

while ($row = $volumeResult->fetch_assoc()) {
    $day = $row['day'];

    if (!isset($volumeData[$day])) {
        $volumeData[$day] = [
            "date" => $day,
            "Partnership" => 0,
            "LipatBahay" => 0,
            "Total" => 0
        ];
    }

    $volumeData[$day][$row['service_type']] = intval($row['count']);
    $volumeData[$day]["Total"] += intval($row['count']);
}

// Revenue query
$paidOnly = isset($_GET['paidOnly']) && $_GET['paidOnly'] === 'true';

$sqlRevenue = "
    SELECT 
        DATE(date_generated) AS day,
        service_type,
        SUM(subtotal_amount) AS total
    FROM soa
    WHERE DATE(date_generated) >= CURDATE() - INTERVAL 7 DAY
";

if ($paidOnly) {
    $sqlRevenue .= " AND status = 'Paid' ";
}

$sqlRevenue .= "
    GROUP BY DATE(date_generated), service_type
    ORDER BY day ASC
";

$revResult = $conn->query($sqlRevenue);
$revenueData = [];

while ($row = $revResult->fetch_assoc()) {
    $day = $row['day'];

    if (!isset($revenueData[$day])) {
        $revenueData[$day] = [
            "date" => $day,
            "Partnership" => 0,
            "LipatBahay" => 0
        ];
    }

    $revenueData[$day][$row['service_type']] = floatval($row['total']);
}

echo json_encode([
    "success" => true,
    "dailyVolume" => array_values($volumeData),
    "dailyRevenue" => array_values($revenueData)
]);
