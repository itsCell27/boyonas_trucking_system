<?php
require_once "cors.php";
require_once "db.php"; 

header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if connection exists
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Database connection failed: " . ($conn->connect_error ?? "Connection not established"));
    }

    $sql = "
        SELECT 
            s.soa_id,
            s.soa_number,
            s.service_type,
            s.date_from,
            s.date_to,
            s.subtotal_amount,
            s.tax_percentage,
            s.tax_amount,
            s.total_amount,
            s.status,
            DATE_FORMAT(s.date_generated, '%Y-%m-%d %H:%i') AS date_generated,
            u.name AS generated_by,

            -- NEW: Identify either partner or customer name
            CASE 
                WHEN s.service_type = 'Partnership' THEN b.partner_name
                ELSE b.customer_name
            END AS party_name

        FROM soa s
        LEFT JOIN users u ON s.generated_by = u.user_id

        -- One SOA has many soa_detail rows
        LEFT JOIN soa_detail sd ON sd.soa_id = s.soa_id
        
        -- Each soa_detail links to a booking
        LEFT JOIN bookings b ON b.booking_id = sd.booking_id

        GROUP BY s.soa_id
        ORDER BY s.soa_id DESC
    ";


    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $records = [];
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }

    echo json_encode([
        "success" => true,
        "records" => $records,
        "count" => count($records)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>