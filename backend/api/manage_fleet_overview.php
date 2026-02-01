<?php
if (!extension_loaded('mysqli')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'The mysqli extension is not enabled in your PHP configuration.',
    ]);
    exit;
}

require_once 'config.php';

// CORS and session setup
header("Access-Control-Allow-Origin: " . FRONTEND_ORIGIN);
header('Content-Type: application/json');
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

try {
    require_once 'db.php';

    $sql = "SELECT truck_id, plate_number, model, capacity, year, operational_status, document_status, image_path, remarks FROM trucks";
    $result = $conn->query($sql);

    if ($result === false) {
        throw new Exception("Error in SQL query: " . $conn->error);
    }

    $trucks = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $trucks[] = $row;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $trucks,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}
?>