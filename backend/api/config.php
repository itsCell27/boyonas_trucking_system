<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$uploadRoot = $_ENV['UPLOAD_ROOT'];
$employeeDocsDir = $_ENV['EMPLOYEE_DOCS_DIR'];
$truckImagesDir = $_ENV['TRUCK_IMGS_FOLDER'];
$truckDocumentsDir = $_ENV['TRUCK_DOCS_FOLDER'];

$bookingDocsDir = $_ENV['BOOKING_DOCS_FOLDER'];

$frontendOrigin = $_ENV['FRONTEND_ORIGIN'];

define('UPLOAD_ROOT', $uploadRoot);
define('EMPLOYEE_DOCS_DIR', $employeeDocsDir);
define('TRUCK_IMAGES_DIR', $truckImagesDir);
define('TRUCK_DOCUMENTS_DIR', $truckDocumentsDir);

define('BOOKING_DOCS_DIR', $bookingDocsDir);

define('FRONTEND_ORIGIN', $frontendOrigin);


