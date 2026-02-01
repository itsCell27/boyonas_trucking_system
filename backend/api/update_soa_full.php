<?php
// backend/api/update_soa_full.php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = intval($_SESSION['user_id']);

// Optional: admin check (role_id = 1). Change if your admin id differs.
$roleStmt = $conn->prepare("SELECT role_id FROM users WHERE user_id = ?");
$roleStmt->bind_param("i", $user_id);
$roleStmt->execute();
$roleStmt->bind_result($role_id);
$roleStmt->fetch();
$roleStmt->close();

if (intval($role_id) !== 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only admins can edit SOA.']);
    exit;
}

// Read JSON body
$body = json_decode(file_get_contents('php://input'), true);
$soa_id = isset($body['soa_id']) ? intval($body['soa_id']) : 0;
$tax_percentage = isset($body['tax_percentage']) ? floatval($body['tax_percentage']) : null;
$details = isset($body['details']) && is_array($body['details']) ? $body['details'] : [];

if ($soa_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid soa_id']);
    exit;
}

// Check SOA exists and not Paid
$check = $conn->prepare("SELECT status FROM soa WHERE soa_id = ?");
$check->bind_param("i", $soa_id);
$check->execute();
$check->bind_result($current_status);
if (!$check->fetch()) {
    $check->close();
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'SOA not found']);
    exit;
}
$check->close();

if ($current_status === 'Paid') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Cannot edit a Paid SOA']);
    exit;
}

// Basic validation of details
foreach ($details as $d) {
    if (!isset($d['soa_detail_id']) || !isset($d['amount'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Detail rows must include soa_detail_id and amount']);
        exit;
    }
    if (!is_numeric($d['amount']) || floatval($d['amount']) < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Amounts must be non-negative numbers']);
        exit;
    }
}

$conn->begin_transaction();

try {
    // Update each provided soa_detail amount
    $updateStmt = $conn->prepare("UPDATE soa_detail SET amount = ? WHERE soa_detail_id = ? AND soa_id = ?");
    if ($updateStmt === false) throw new Exception("Prepare failed: " . $conn->error);

    foreach ($details as $d) {
        $amt = round(floatval($d['amount']), 2);
        $sdid = intval($d['soa_detail_id']);
        $updateStmt->bind_param("dii", $amt, $sdid, $soa_id);
        if (!$updateStmt->execute()) {
            throw new Exception("Failed to update soa_detail_id {$sdid}: " . $updateStmt->error);
        }
    }
    $updateStmt->close();

    // Recalculate subtotal from soa_detail rows for this SOA
    $sumStmt = $conn->prepare("SELECT COALESCE(SUM(amount),0) FROM soa_detail WHERE soa_id = ?");
    $sumStmt->bind_param("i", $soa_id);
    $sumStmt->execute();
    $sumStmt->bind_result($new_subtotal);
    $sumStmt->fetch();
    $sumStmt->close();

    $new_subtotal = round(floatval($new_subtotal), 2);
    $new_tax_percentage = ($tax_percentage !== null) ? round(floatval($tax_percentage), 2) : 0.00;
    $new_tax_amount = round($new_subtotal * ($new_tax_percentage / 100), 2);
    $new_total_amount = round($new_subtotal + $new_tax_amount, 2);

    // Update soa table
    $u = $conn->prepare("
        UPDATE soa
        SET subtotal_amount = ?, tax_percentage = ?, tax_amount = ?, total_amount = ?
        WHERE soa_id = ?
    ");
    $u->bind_param("ddddi", $new_subtotal, $new_tax_percentage, $new_tax_amount, $new_total_amount, $soa_id);
    if (!$u->execute()) {
        throw new Exception("Failed to update soa: " . $u->error);
    }
    $u->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'SOA updated',
        'soa' => [
            'soa_id' => $soa_id,
            'subtotal_amount' => $new_subtotal,
            'tax_percentage' => $new_tax_percentage,
            'tax_amount' => $new_tax_amount,
            'total_amount' => $new_total_amount
        ]
    ]);
    exit;

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    error_log("update_soa_full error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}
