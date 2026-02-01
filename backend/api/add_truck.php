    <?php
    // add_truck.php
    require_once 'cors.php';
    require_once 'db.php';

    header('Content-Type: application/json');

    // Ensure request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // Helper: ensure upload directory exists
    function ensure_dir($path) {
        if (!is_dir($path)) {
            if (!mkdir($path, 0755, true) && !is_dir($path)) {
                throw new Exception("Failed to create directory: $path");
            }
        }
    }

    // Helper: safe filename
    function unique_filename($dir, $original) {
        $ext = pathinfo($original, PATHINFO_EXTENSION);
        $base = pathinfo($original, PATHINFO_FILENAME);
        $base = preg_replace('/[^A-Za-z0-9_\-]/', '_', $base);
        $uniq = $base . '_' . time() . '_' . bin2hex(random_bytes(4));
        return $uniq . ($ext ? '.' . $ext : '');
    }

    // Read form fields (multipart/form-data)
    $plate_number = isset($_POST['plate_number']) ? trim($_POST['plate_number']) : '';
    $model = isset($_POST['model']) ? trim($_POST['model']) : '';
    $capacity = isset($_POST['capacity']) ? trim($_POST['capacity']) : '';
    $year = isset($_POST['year']) ? trim($_POST['year']) : '';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'Okay to Use';
    $or_expiry_date = isset($_POST['or_expiry_date']) ? trim($_POST['or_expiry_date']) : null;
    $cr_expiry_date = isset($_POST['cr_expiry_date']) ? trim($_POST['cr_expiry_date']) : null;
    $remarks = isset($_POST['remarks']) ? trim($_POST['remarks']) : '';

    // Basic validation
    if ($plate_number === '' || $model === '' || $capacity === '' || $year === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    try {
        // 1) check unique plate_number
        $checkStmt = $conn->prepare("SELECT truck_id FROM trucks WHERE plate_number = ?");
        $checkStmt->bind_param("s", $plate_number);
        $checkStmt->execute();
        $checkStmt->store_result();
        if ($checkStmt->num_rows > 0) {
            $checkStmt->close();
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Plate number already exists']);
            exit;
        }
        $checkStmt->close();

        // Prepare upload dirs (relative to this file)
        $baseImagesDir = __DIR__ . '/../private_uploads/images/truck_images/';
        $baseDocsDir = __DIR__ . '/../private_uploads/documents/truck_documents/';

        ensure_dir($baseImagesDir);
        ensure_dir($baseDocsDir);

        // Begin transaction
        $conn->begin_transaction();

        // Handle optional image upload
        $image_path_db = null;
        if (!empty($_FILES['image']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
            $img = $_FILES['image'];
            // validate MIME type minimally
            $allowedImageTypes = ['image/jpeg','image/png','image/gif','image/webp'];
            if (!in_array(mime_content_type($img['tmp_name']), $allowedImageTypes, true)) {
                throw new Exception("Invalid image file type.");
            }
            $imageFilename = unique_filename($baseImagesDir, $img['name']);
            $dest = $baseImagesDir . $imageFilename;
            if (!move_uploaded_file($img['tmp_name'], $dest)) {
                throw new Exception("Failed to move uploaded image.");
            }
            // store path relative to project (same style as SQL dump)
            $image_path_db = "../private_uploads/images/truck_images/" . $imageFilename;
        }

        // Insert truck with temporary document_status (we will compute after doc uploads)
        $initial_document_status = 'Valid'; // default - will update if any expired
        $insertTruck = $conn->prepare("
            INSERT INTO trucks (plate_number, model, capacity, year, operational_status, document_status, status, image_path, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        if ($insertTruck === false) throw new Exception("Prepare failed: " . $conn->error);

        // operational_status default: Available
        $operational_status = 'Available';
        $insertTruck->bind_param(
            "ssissssss",
            $plate_number,
            $model,
            $capacity,
            $year,
            $operational_status,
            $initial_document_status,
            $status,
            $image_path_db,
            $remarks
        );

        if (!$insertTruck->execute()) {
            throw new Exception("Failed to insert truck: " . $insertTruck->error);
        }

        $truck_id = $conn->insert_id;
        $insertTruck->close();

        // We'll track whether any doc is expired
        $anyExpired = false;

        // Helper to process a document file and insert into truck_documents
        $processDocument = function($fileFieldName, $expiryDateField, $docType) use (
            $conn, $baseDocsDir, $truck_id, &$anyExpired
        ) {
            if (empty($_FILES[$fileFieldName]) || !is_uploaded_file($_FILES[$fileFieldName]['tmp_name'])) {
                return null;
            }
            $file = $_FILES[$fileFieldName];

            // Minimal MIME validation - allow common doc types + images
            $allowed = [
                'application/pdf','application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg','image/png','image/gif','image/webp'
            ];
            $mime = mime_content_type($file['tmp_name']);
            if (!in_array($mime, $allowed, true)) {
                throw new Exception("Invalid document file type for {$docType}.");
            }

            $filename = unique_filename($baseDocsDir, $file['name']);
            $dest = $baseDocsDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                throw new Exception("Failed to move uploaded document ({$docType}).");
            }

            // expiry date from corresponding form field
            $expiry_date = isset($_POST[$expiryDateField]) && $_POST[$expiryDateField] !== '' ? $_POST[$expiryDateField] : null;

            // Validate expiry date (YYYY-MM-DD)
            $expiry_sql_date = null;
            $status = 'Valid';
            if ($expiry_date) {
                $d = date_create_from_format('Y-m-d', $expiry_date);
                if (!$d) {
                    throw new Exception("Invalid expiry date for {$docType}.");
                }
                $expiry_sql_date = $d->format('Y-m-d');

                // Compare to today
                $today = new DateTimeImmutable('today');
                $exp = new DateTimeImmutable($expiry_sql_date);
                if ($exp < $today) {
                    $status = 'Expired';
                    $anyExpired = true;
                }
            }

            // Insert truck_documents row
            $file_path_db = "../private_uploads/documents/truck_documents/" . $filename;
            $ins = $conn->prepare("
                INSERT INTO truck_documents (truck_id, document_type, file_path, expiry_date, status)
                VALUES (?, ?, ?, ?, ?)
            ");
            if ($ins === false) throw new Exception("Prepare failed: " . $conn->error);

            // if expiry_sql_date is null set NULL param
            if ($expiry_sql_date === null) {
                $nullExpiry = null;
                $ins->bind_param("issss", $truck_id, $docType, $file_path_db, $nullExpiry, $status);
            } else {
                $ins->bind_param("issss", $truck_id, $docType, $file_path_db, $expiry_sql_date, $status);
            }

            if (!$ins->execute()) {
                throw new Exception("Failed to insert truck document: " . $ins->error);
            }
            $ins->close();

            return $file_path_db;
        };

        // Process OR document (field names: or_document, or_expiry_date)
        $or_path = $processDocument('or_document', 'or_expiry_date', 'OR');

        // Process CR document
        $cr_path = $processDocument('cr_document', 'cr_expiry_date', 'CR');

        // If any document marked expired, update trucks.document_status = 'Expired'
        if ($anyExpired) {
            // Document expired → Truck should not be used
            $u = $conn->prepare("
                UPDATE trucks 
                SET document_status = 'Expired',
                    operational_status = 'Maintenance'
                WHERE truck_id = ?
            ");
        } else {
            // All documents valid
            $u = $conn->prepare("
                UPDATE trucks 
                SET document_status = 'Valid',
                    operational_status = 'Available'
                WHERE truck_id = ?
            ");
        }

        $u->bind_param("i", $truck_id);
        if (!$u->execute()) {
            throw new Exception("Failed to update truck status flags: " . $u->error);
        }
        $u->close();


        // Commit and respond
        $conn->commit();

        echo json_encode([
            'success' => true,
            'truck_id' => $truck_id,
            'message' => 'Truck added successfully',
            'document_status' => $anyExpired ? 'Expired' : 'Valid'
        ]);
        exit;

    } catch (Exception $e) {

        // Always safe to call rollback; mysqli will ignore it if no transaction
        $conn->rollback();

        http_response_code(500);
        error_log("add_truck.php error: " . $e->getMessage());

        echo json_encode([
            'success' => false,
            'error' => 'Server error: ' . $e->getMessage()
        ]);
        exit;
    }

