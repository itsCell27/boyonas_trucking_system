<?php
require_once "cors.php";
require_once "db.php";

header("Content-Type: application/json");

$soa_id = $_GET['soa_id'] ?? null;

if (!$soa_id) {
    echo json_encode(["success" => false, "message" => "Missing soa_id"]);
    exit;
}

try {
    // Get SOA header
    $soa_sql = "
        SELECT 
            soa.*,
            u.name AS generated_by,
            CASE 
                WHEN soa.service_type = 'Partnership' THEN b.partner_name
                ELSE b.customer_name
            END AS party_name
        FROM soa
        LEFT JOIN users u ON soa.generated_by = u.user_id
        LEFT JOIN soa_detail sd ON sd.soa_id = soa.soa_id
        LEFT JOIN bookings b ON b.booking_id = sd.booking_id
        WHERE soa.soa_id = ?
        GROUP BY soa.soa_id
    ";

    $stmt = $conn->prepare($soa_sql);
    $stmt->bind_param("i", $soa_id);
    $stmt->execute();
    $soa = $stmt->get_result()->fetch_assoc();

    if (!$soa) {
        echo json_encode(["success" => false, "message" => "SOA not found"]);
        exit;
    }

    // Get SOA detail rows
    $detail_sql = "
        SELECT sd.*, b.route_from, b.route_to
        FROM soa_detail sd
        LEFT JOIN bookings b ON b.booking_id = sd.booking_id
        WHERE sd.soa_id = ?
    ";

    $stmt = $conn->prepare($detail_sql);
    $stmt->bind_param("i", $soa_id);
    $stmt->execute();
    $details = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        "success" => true,
        "soa" => $soa,
        "details" => array_map(function ($d) {
            $d["route"] = $d["route_from"] . " → " . $d["route_to"];
            return $d;
        }, $details)
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
