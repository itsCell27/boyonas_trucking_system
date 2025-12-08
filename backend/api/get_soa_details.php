<?php
require_once "db.php"; 
header("Content-Type: application/json");

if (!isset($_GET["soa_id"])) {
    echo json_encode(["success" => false, "message" => "Missing soa_id"]);
    exit;
}

$soa_id = intval($_GET["soa_id"]);

// ==========================
// MAIN SOA HEADER
// ==========================
$sql1 = "
    SELECT 
        s.*, 
        u.name AS generated_by_name
    FROM soa s
    LEFT JOIN users u ON s.generated_by = u.user_id
    WHERE s.soa_id = ?
";

$stmt = $conn->prepare($sql1);
$stmt->bind_param("i", $soa_id);
$stmt->execute();
$soa = $stmt->get_result()->fetch_assoc();

if (!$soa) {
    echo json_encode(["success" => false, "message" => "SOA not found"]);
    exit;
}

// ==========================
// FETCH SOA DETAIL ROWS
// ==========================
$sql2 = "
    SELECT 
        sd.soa_detail_id,
        sd.assignment_id,
        sd.dr_number,
        sd.route,
        sd.plate_number,
        sd.delivery_date,
        sd.amount
    FROM soa_detail sd
    WHERE sd.soa_id = ?
";

$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("i", $soa_id);
$stmt2->execute();
$details = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "success" => true,
    "soa" => $soa,
    "details" => $details
]);
