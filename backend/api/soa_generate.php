<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$generated_by = $_SESSION['user_id'];
$body = json_decode(file_get_contents('php://input'), true);

$service_type   = $body['service_type'] ?? '';
$party_name     = $body['party_name'] ?? '';
$date_from      = $body['date_from'] ?? '';
$date_to        = $body['date_to'] ?? '';
$deliveries     = $body['deliveries'] ?? [];
$remarks        = $body['remarks'] ?? '';
$tax_percentage = isset($body['tax_percentage']) ? floatval($body['tax_percentage']) : 0.00;

if (!in_array($service_type, ['Partnership', 'LipatBahay'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid service_type']);
    exit;
}

if (!$date_from || !$date_to || empty($deliveries)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Validate
foreach ($deliveries as $i => $d) {
    if (empty($d['booking_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing booking_id for delivery index {$i}"]);
        exit;
    }
    if (!isset($d['amount']) || floatval($d['amount']) <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Invalid amount at delivery index {$i}"]);
        exit;
    }
}

function generateCode($length = 6) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $maxIndex = strlen($characters) - 1;
    $code = '';

    for ($i = 0; $i < $length; $i++) {
        $code .= $characters[random_int(0, $maxIndex)];
    }

    return $code;
}

/**
 * Generate a unique SOA code (SOA-XXXXXX). Uses mysqli connection ($conn).
 * Returns the unique code string on success, or false on failure.
 */
function generateUniqueSoaCode(mysqli $conn) {
    // Defensive: make sure $count is always defined
    $count = 1;

    // Prepare the statement once (better performance)
    $stmt = $conn->prepare("SELECT COUNT(*) FROM soa WHERE soa_number = ?");
    if ($stmt === false) {
        // Log/handle error as needed
        error_log("Prepare failed: " . $conn->error);
        return false;
    }

    while ($count > 0) {
        $soa_code = "SOA-" . generateCode();

        // Bind, execute and fetch the count
        if (!$stmt->bind_param("s", $soa_code)) {
            error_log("bind_param failed: " . $stmt->error);
            $stmt->close();
            return false;
        }

        if (!$stmt->execute()) {
            error_log("execute failed: " . $stmt->error);
            $stmt->close();
            return false;
        }

        if (!$stmt->bind_result($count)) {
            error_log("bind_result failed: " . $stmt->error);
            $stmt->close();
            return false;
        }

        // fetch() will populate $count
        $stmt->fetch();

        // Important: reset result metadata so the next execute works reliably
        $stmt->reset();

        // If $count is 0, loop will exit and $soa_code is unique
    }

    $stmt->close();
    return $soa_code;
}

$unique_soa_code = generateUniqueSoaCode($conn);

try {
    $conn->begin_transaction();

    // COMPUTE SUBTOTAL
    $subtotal = 0.0;
    foreach ($deliveries as $row) {
        $subtotal += floatval($row['amount']);
    }

    // COMPUTE TAX
    $tax_amount = round($subtotal * ($tax_percentage / 100), 2);

    // COMPUTE TOTAL
    $total_amount = round($subtotal + $tax_amount, 2);

    $status = "Not Yet Paid";

    // INSERT SOA (MATCHES SQL STRUCTURE)
    $stmt = $conn->prepare("
        INSERT INTO soa 
        (soa_number, service_type, date_from, date_to, total_amount, status, remarks, generated_by, subtotal_amount, tax_percentage, tax_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "ssssdssiddd",
        $unique_soa_code, 
        $service_type,
        $date_from,
        $date_to,
        $total_amount,
        $status,
        $remarks,
        $generated_by,
        $subtotal,
        $tax_percentage,
        $tax_amount
    );

    $stmt->execute();
    $soa_id = $conn->insert_id;

    // INSERT DETAILS
    $detailStmt = $conn->prepare("
        INSERT INTO soa_detail (soa_id, booking_id, dr_number, route, plate_number, delivery_date, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($deliveries as $row) {
        $detailStmt->bind_param(
            "iissssd",
            $soa_id,
            $row['booking_id'],
            $row['dr_number'],
            $row['route'],
            $row['plate_number'],
            $row['delivery_date'],
            $row['amount']
        );
        $detailStmt->execute();
    }

    $conn->commit();

    echo json_encode([
        "success"        => true,
        "soa_id"         => $soa_id,
        "subtotal"       => $subtotal,
        "tax_percentage" => $tax_percentage,
        "tax_amount"     => $tax_amount,
        "total_amount"   => $total_amount
    ]);

} catch (Exception $e) {

    $conn->rollback();
    error_log("SOA Generation Error: " . $e->getMessage()); // Log to PHP error log
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>
