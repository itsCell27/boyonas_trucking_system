<?php
require_once 'cors.php';
require_once 'db.php';

// ================================
// 1) Total Deliveries Today (In Progress)
// ================================
$q1 = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'In Progress'
");

$totalDeliveriesToday = $q1->fetch_assoc()['total'] ?? 0;


// ================================
// 2) Completed Deliveries Today
//    Based on latest status_logs entries
// ================================
$today = date('Y-m-d');

$q2 = $conn->query("
    SELECT COUNT(*) AS total
    FROM status_logs
    WHERE status = 'Completed'
    AND DATE(timestamp) = '$today'
");

$completedToday = $q2->fetch_assoc()['total'] ?? 0;


// ================================
// 3) Pending Deliveries
//    Bookings that are NOT completed or cancelled
// ================================
$q3 = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status NOT IN ('Completed','Cancelled')
");

$pendingDeliveries = $q3->fetch_assoc()['total'] ?? 0;


// ================================
// 4) Trucks deployed (operational_status = 'On Delivery')
// ================================
$q4 = $conn->query("
    SELECT COUNT(*) AS total
    FROM trucks
    WHERE operational_status = 'On Delivery'
");

$trucksDeployed = $q4->fetch_assoc()['total'] ?? 0;


// ================================
// 5) Total trucks
// ================================
$q5 = $conn->query("SELECT COUNT(*) AS total FROM trucks");
$totalTrucks = $q5->fetch_assoc()['total'] ?? 0;


// ================================
// OUTPUT JSON
// ================================

echo json_encode([
    "success" => true,
    "summary" => [
        "total_deliveries_today" => $totalDeliveriesToday,
        "completed_today"        => $completedToday,
        "pending_deliveries"     => $pendingDeliveries,
        "trucks_deployed"        => $trucksDeployed,
        "total_trucks"           => $totalTrucks,
    ]
]);
