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

// Get counts for today, yesterday, and tomorrow
$countQuery = "
    SELECT
        SUM(CASE WHEN DATE(date_created) = CURDATE() THEN 1 ELSE 0 END) AS today_count,
        SUM(CASE WHEN DATE(date_created) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS yesterday_count,
        SUM(CASE WHEN DATE(date_created) = CURDATE() + INTERVAL 1 DAY THEN 1 ELSE 0 END) AS tomorrow_count
    FROM bookings
    WHERE service_type = 'Partnership'
";

$countResult = $conn->query($countQuery);
$counts = $countResult->fetch_assoc();

// Return as JSON
echo json_encode([
    "counts" => $counts,
]);

$conn->close();

?>