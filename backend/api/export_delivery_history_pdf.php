<?php
require_once 'cors.php';
require_once 'db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Mpdf\Mpdf;

// Load the delivery history SQL
$sql = "
    SELECT 
        b.booking_id,
        b.service_type,
        b.dr_number,
        b.partner_name,
        b.customer_name,
        b.phone_number,
        b.route_from,
        b.route_to,

        (
            SELECT sl.timestamp
            FROM status_logs sl
            WHERE sl.booking_id = b.booking_id
              AND sl.status = b.status
            ORDER BY sl.timestamp DESC
            LIMIT 1
        ) AS log_ts,

        b.scheduled_start AS booking_scheduled_start,
        b.deadline,
        b.status AS booking_status,
        b.service_rate,
        b.category,

        a.assignment_id,
        a.current_status AS assignment_status,
        a.assigned_date,

        t.plate_number,
        t.model AS truck_model,

        e.full_name AS driver_name,

        sd.amount AS soa_amount
    FROM bookings b
    LEFT JOIN assignments a ON a.booking_id = b.booking_id
    LEFT JOIN trucks t ON a.truck_id = t.truck_id
    LEFT JOIN employees e ON a.driver_id = e.employee_id
    LEFT JOIN (
        SELECT booking_id, amount
        FROM soa_detail
        GROUP BY booking_id
    ) sd ON sd.booking_id = b.booking_id

    ORDER BY COALESCE(
        (
            SELECT sl.timestamp
            FROM status_logs sl
            WHERE sl.booking_id = b.booking_id
              AND sl.status = b.status
            ORDER BY sl.timestamp DESC
            LIMIT 1
        ),
        b.scheduled_start
    ) DESC, b.booking_id DESC
";

$result = $conn->query($sql);

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['scheduled_start'] = $row['log_ts'] ?? $row['booking_scheduled_start'];
    $rows[] = $row;
}

$mpdf = new Mpdf([
    'format' => 'A4',
    'margin_left' => 10,
    'margin_right' => 10,
    'margin_top' => 15,
    'margin_bottom' => 15,
]);

$html = "
<style>
body { font-family: sans-serif; font-size: 10px; }
h2 { text-align:center; margin-bottom:10px; }
table { width:100%; border-collapse: collapse; }
th, td { border:1px solid #ccc; padding:6px; font-size:10px; }
th { background:#f5f5f5; }
</style>

<h2>Delivery History Report</h2>

<table>
<thead>
<tr>
    <th>DR #</th>
    <th>Service</th>
    <th>Customer / Partner</th>
    <th>Route</th>
    <th>Driver</th>
    <th>Truck</th>
    <th>Date</th>
    <th>Status</th>
    <th>Revenue</th>
</tr>
</thead>
<tbody>
";

foreach ($rows as $r) {
    $service = $r["service_type"];
    $customer = $service === "Partnership" ? $r["partner_name"] : $r["customer_name"];
    $route = ($r["route_from"] ?? "N/A") . " → " . ($r["route_to"] ?? "N/A");
    $driver = $r["driver_name"] ?? "Unassigned";
    $truck = $r["plate_number"] ?? "Unassigned";
    $date = date("M d, Y h:i A", strtotime($r["scheduled_start"]));
    $status = $r["booking_status"];

    $revenue = $r["soa_amount"] !== null 
        ? "₱" . number_format($r["soa_amount"], 2)
        : "N/A";

    $html .= "
    <tr>
        <td>{$r['dr_number']}</td>
        <td>{$service}</td>
        <td>{$customer}</td>
        <td>{$route}</td>
        <td>{$driver}</td>
        <td>{$truck}</td>
        <td>{$date}</td>
        <td>{$status}</td>
        <td>{$revenue}</td>
    </tr>";
}

$html .= "</tbody></table>";

$mpdf->WriteHTML($html);
$mpdf->Output("Delivery_History.pdf", "D");
exit;
