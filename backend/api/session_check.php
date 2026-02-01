<?php
require_once 'cors.php';

header('Content-Type: application/json; charset=utf-8');
session_start();

if (isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => true,
        'user' => [
            'user_id'   => $_SESSION['user_id'],
            'role_id'   => $_SESSION['role_id'] ?? null,
            'role_name' => $_SESSION['role_name'] ?? null,
            'name'      => $_SESSION['name'] ?? null
        ]
    ]);
    
} else {
    echo json_encode(['success' => false]);
}
