<?php
require_once 'cors.php';
require_once 'db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Mpdf\Mpdf;

// Validate SOA ID
$soa_id = $_GET['soa_id'] ?? 0;
if ($soa_id <= 0) {
    http_response_code(400);
    echo "Invalid SOA ID";
    exit;
}

/* ----------------------------------------------------
   FETCH SOA HEADER INFORMATION
---------------------------------------------------- */
$h = $conn->prepare("
    SELECT 
        s.*, 
        u.name AS generated_by,
        CASE 
            WHEN s.service_type = 'Partnership' THEN b.partner_name 
            ELSE b.customer_name 
        END AS party_name
    FROM soa s
    LEFT JOIN soa_detail sd ON sd.soa_id = s.soa_id
    LEFT JOIN bookings b ON b.booking_id = sd.booking_id
    LEFT JOIN users u ON u.user_id = s.generated_by
    WHERE s.soa_id = ?
    GROUP BY s.soa_id
");

$h->bind_param("i", $soa_id);
$h->execute();
$header = $h->get_result()->fetch_assoc();
$h->close();

if (!$header) {
    http_response_code(404);
    echo "SOA not found";
    exit;
}

/* ----------------------------------------------------
   FETCH SOA DETAILS
---------------------------------------------------- */
$d = $conn->prepare("
    SELECT dr_number, route, plate_number, delivery_date, amount 
    FROM soa_detail WHERE soa_id = ?
");

$d->bind_param("i", $soa_id);
$d->execute();
$details = $d->get_result();
$d->close();

/* ----------------------------------------------------
   INITIALIZE MPDF + WATERMARK
---------------------------------------------------- */
$mpdf = new Mpdf([
    'format' => 'A4',
    'margin_left' => 12,
    'margin_right' => 12,
    'margin_top' => 20,
    'margin_bottom' => 20,
]);

$watermarkText = strtoupper($header["status"]);
$mpdf->SetWatermarkText($watermarkText, 0.2);
$mpdf->showWatermarkText = true;

/* ----------------------------------------------------
   LOAD LOGO SAFELY (imageVars bypasses .htaccess)
---------------------------------------------------- */
$logoPath = __DIR__ . '/assets/truck_logo.png';

if (file_exists($logoPath)) {
    $mpdf->imageVars['logo'] = file_get_contents($logoPath);
} else {
    $mpdf->imageVars['logo'] = null; // fail-safe: no logo
}

/* ----------------------------------------------------
   BUILD PDF HTML
---------------------------------------------------- */
$html = "
<style>
    body { font-family: sans-serif; font-size: 11px; }

    .header-title {
        text-align:center;
        font-size:22px;
        font-weight:bold;
        margin-top:5px;
    }

    .sub-title {
        text-align:center;
        font-size:13px;
        margin-bottom:20px;
    }

    .bill-section {
        margin-top: 10px;
        font-size: 12px;
    }

    table {
        width:100%;
        border-collapse: collapse;
        margin-top: 12px;
    }

    th {
        background: #f0f0f0;
        padding: 6px;
        border-bottom: 1px solid #ccc;
        font-size: 11px;
    }

    td {
        padding: 6px;
        border-bottom: 1px solid #eee;
        font-size: 11px;
    }

    .totals {
        margin-top: 20px;
        font-size: 12px;
    }

    .total-line {
        display:flex;
        justify-content:space-between;
        padding: 3px 0;
    }

    .total-main {
        font-size:16px;
        font-weight:bold;
        border-top:1px solid #000;
        margin-top:10px;
        padding-top:5px;
    }
</style>

<div style='text-align:center; margin-bottom:10px;'>
    <img src='var:logo' height='60' />
</div>

<div class='header-title'>BOYONAS TRUCKING SERVICE</div>
<div class='sub-title'>Statement of Account</div>

<div class='bill-section'>
    <strong>Bill To:</strong><br>
    <span style='font-size:14px;'>{$header['party_name']}</span>
</div>

<p style='margin-top: 10px;'>
    <strong>SOA #:</strong> {$header['soa_number']}<br>
    <strong>Period:</strong> {$header['date_from']} → {$header['date_to']}<br>
    <strong>Generated:</strong> {$header['date_generated']}
</p>

<h4 style='margin-top:18px; margin-bottom:6px;'>Service Details</h4>

<table>
<thead>
<tr>
    <th>DR #</th>
    <th>Route</th>
    <th>Plate #</th>
    <th>Date</th>
    <th style='text-align:right;'>Amount</th>
</tr>
</thead>
<tbody>
";

/* ----------------------------------------------------
   LOOP THROUGH SERVICE DETAILS
---------------------------------------------------- */
while ($row = $details->fetch_assoc()) {
    $html .= "
    <tr>
        <td>{$row['dr_number']}</td>
        <td>{$row['route']}</td>
        <td>{$row['plate_number']}</td>
        <td>{$row['delivery_date']}</td>
        <td style='text-align:right;'>₱" . number_format($row['amount'], 2) . "</td>
    </tr>";
}

$html .= "
</tbody>
</table>

<div class='totals'>
    <div class='total-line'><span>Subtotal:</span> <span>₱" . number_format($header['subtotal_amount'], 2) . "</span></div>
    <div class='total-line'><span>Tax ({$header['tax_percentage']}%):</span> <span>₱" . number_format($header['tax_amount'], 2) . "</span></div>

    <div class='total-line total-main'>
        <span>Total Amount:</span> 
        <span>₱" . number_format($header['total_amount'], 2) . "</span>
    </div>
</div>
";

/* ----------------------------------------------------
   OUTPUT PDF
---------------------------------------------------- */
$mpdf->WriteHTML($html);
$mpdf->Output($header['soa_number'] . ".pdf", "D");
exit;
