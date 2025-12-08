-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 08, 2025 at 06:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trucking_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `assignment_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `truck_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `helper_id` int(11) DEFAULT NULL,
  `assigned_date` datetime DEFAULT current_timestamp(),
  `current_status` enum('Pending','OTW to SOC','OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete','Cancelled') DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`assignment_id`, `booking_id`, `truck_id`, `driver_id`, `helper_id`, `assigned_date`, `current_status`, `remarks`) VALUES
(3, 3, 2, 7, NULL, '2025-12-03 17:03:58', 'Cancelled', ''),
(4, 4, 2, 7, NULL, '2025-12-05 09:08:50', 'Cancelled', ''),
(5, 7, 2, 7, NULL, '2025-12-05 12:33:54', 'Cancelled', ''),
(6, 6, 3, 7, NULL, '2025-12-08 09:45:52', 'Completed', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `service_type` enum('Partnership','LipatBahay') NOT NULL,
  `dr_number` varchar(255) DEFAULT NULL,
  `partner_name` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `route_from` varchar(255) DEFAULT NULL,
  `route_to` varchar(255) DEFAULT NULL,
  `scheduled_start` datetime DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `estimated_weight` decimal(10,2) DEFAULT NULL,
  `service_rate` decimal(12,2) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `status` enum('Pending Assignment','Assigned','Completed','Cancelled','Ongoing') DEFAULT 'Pending Assignment',
  `date_created` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `service_type`, `dr_number`, `partner_name`, `customer_name`, `phone_number`, `route_from`, `route_to`, `scheduled_start`, `deadline`, `estimated_weight`, `service_rate`, `category`, `status`, `date_created`, `created_by`) VALUES
(3, 'Partnership', 'DEL-001', 'SPX Express', NULL, NULL, 'SOC Warehouse - Quezon City', 'Client Site - Makati', '2025-12-03 17:02:00', '2025-12-04 17:02:00', 2500.00, NULL, 'Appliances', 'Cancelled', '2025-12-03 17:02:55', 1),
(4, 'Partnership', 'DEL-002', 'SPX Express', NULL, NULL, 'SOC Warehouse - Quezon City', 'Client Site - Makati', '2025-12-05 09:07:00', '2025-12-06 09:07:00', 3400.00, NULL, 'Appliances', 'Cancelled', '2025-12-05 09:08:14', 1),
(5, 'LipatBahay', 'LB-001', NULL, 'Juan Dela Cruz', '092921845', 'Caloocan ph5', 'Tungko Bulucan', '2025-12-05 10:20:00', '2025-12-06 10:20:00', 2500.00, 3500.00, NULL, 'Cancelled', '2025-12-05 10:21:34', 1),
(6, 'LipatBahay', 'LB-002', NULL, 'Fred', '09783652', 'Ph7 Caloocan', 'SM fairview lagro', '2025-12-06 11:19:00', '2025-12-20 11:19:00', 2000.00, 4000.00, NULL, 'Completed', '2025-12-05 11:20:39', 1),
(7, 'LipatBahay', 'LB-003', NULL, 'Juan Dela Cruz', '09783652', 'SOC Warehouse - Quezon City', 'Tungko Bulucan', '2025-12-05 11:26:00', '2025-12-13 11:26:00', 3000.00, 5000.00, NULL, 'Cancelled', '2025-12-05 11:27:18', 1),
(8, 'Partnership', 'DEL-003', 'SPX Express', NULL, NULL, 'Ph7 Caloocan', 'Tungko Bulucan', '2025-12-07 11:39:00', '2025-12-20 11:39:00', 500.00, NULL, 'Furniture', 'Pending Assignment', '2025-12-05 11:39:14', 1),
(9, 'Partnership', 'DEL-004', 'SPX Express', NULL, NULL, 'Caloocan ph5', 'Client Site - Bulucan', '2025-12-10 11:39:00', '2025-12-27 11:39:00', 3450.00, NULL, 'Construction Materials', 'Pending Assignment', '2025-12-05 11:40:02', 1);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `assignment_id` int(11) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `document_type` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT current_timestamp(),
  `uploaded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`document_id`, `assignment_id`, `booking_id`, `document_type`, `file_path`, `date_uploaded`, `uploaded_by`) VALUES
(6, NULL, 7, 'Other', '../private_uploads/documents/booking_documents/booking_7_other_693260a2919fe2.06064800.png', '2025-12-05 12:33:38', 1),
(7, 6, 6, 'proof_of_delivery', '../private_uploads/documents/booking_documents/booking_6_asm_6_1e40b563efae.jpg', '2025-12-09 00:37:23', 9);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `status` enum('Deployed','Idle','On Leave','Pending Assignment') NOT NULL,
  `license_info` varchar(255) DEFAULT NULL,
  `date_started` date NOT NULL,
  `years_on_team` int(15) NOT NULL,
  `emergency_contact_name` varchar(255) NOT NULL,
  `emergency_contact_number` varchar(255) NOT NULL,
  `employee_code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `user_id`, `full_name`, `position`, `contact_number`, `status`, `license_info`, `date_started`, `years_on_team`, `emergency_contact_name`, `emergency_contact_number`, `employee_code`) VALUES
(7, 9, 'Luke Man', 'Driver', '09928334', 'Deployed', 'D83738343', '2022-02-23', 3, 'Hector Vi', '0973736363', 'DRV-003'),
(8, 10, 'Luke Man', 'Helper', '0932873232', 'On Leave', '', '2025-10-24', 0, 'Fred Ger', '09373837245', 'HLP-006');

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `document_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `date_uploaded` datetime NOT NULL DEFAULT current_timestamp(),
  `expiry_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`document_id`, `employee_id`, `document_type`, `file_path`, `date_uploaded`, `expiry_date`) VALUES
(13, 7, 'NBI Clearance', '../private_uploads/documents/employee_documents/nbi_68f9af1b2ae698.23932632.png', '2025-10-23 12:29:15', '2025-10-30'),
(14, 7, 'Police Clearance', '../private_uploads/documents/employee_documents/police_68f9af1b2b39f2.20485283.png', '2025-10-23 12:29:15', '2024-01-01'),
(15, 8, 'NBI Clearance', '../private_uploads/documents/employee_documents/nbi_68fb60b3bf62e2.83475922.png', '2025-10-24 19:19:15', '2025-10-24'),
(16, 8, 'Police Clearance', '../private_uploads/documents/employee_documents/police_68fb60b3bfe718.54714729.png', '2025-10-24 19:19:15', '2025-10-23');

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `attempt_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used`) VALUES
(12, 1, 'd4680bbf37defaba233104f4e42df8cbbb3997e5a69ec655f57f0063ffa6b20c', '2025-11-27 10:02:56', 0);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'driver'),
(3, 'helper');

-- --------------------------------------------------------

--
-- Table structure for table `soa`
--

CREATE TABLE `soa` (
  `soa_id` int(11) NOT NULL,
  `service_type` enum('Partnership','LipatBahay') NOT NULL,
  `date_from` date NOT NULL,
  `date_to` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('Not Yet Paid','Paid','Cancelled') NOT NULL,
  `payment_date` datetime DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `date_generated` datetime NOT NULL DEFAULT current_timestamp(),
  `generated_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `soa_detail`
--

CREATE TABLE `soa_detail` (
  `soa_detail_id` int(11) NOT NULL,
  `soa_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `dr_number` varchar(255) NOT NULL,
  `route` varchar(255) NOT NULL,
  `plate_number` varchar(255) NOT NULL,
  `delivery_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `status_logs`
--

CREATE TABLE `status_logs` (
  `status_log_id` int(11) NOT NULL,
  `assignment_id` int(11) DEFAULT NULL,
  `booking_id` int(11) NOT NULL,
  `status` enum('OTW to SOC','OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete','Scheduled','Assigned','Cancelled') DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_logs`
--

INSERT INTO `status_logs` (`status_log_id`, `assignment_id`, `booking_id`, `status`, `remarks`, `timestamp`, `updated_by`) VALUES
(3, NULL, 3, 'Scheduled', 'Booking successfully created', '2025-12-03 17:02:55', 1),
(4, 3, 3, 'Assigned', 'Assignment created', '2025-12-03 17:03:58', 1),
(5, NULL, 4, 'Scheduled', 'Booking successfully created', '2025-12-05 09:08:14', 1),
(6, 4, 4, 'Assigned', 'Assignment created', '2025-12-05 09:08:50', 1),
(7, NULL, 5, 'Scheduled', 'Booking successfully created', '2025-12-05 10:21:34', 1),
(8, NULL, 6, 'Scheduled', 'Booking successfully created', '2025-12-05 11:20:39', 1),
(9, NULL, 7, 'Scheduled', 'Booking successfully created', '2025-12-05 11:27:18', 1),
(10, NULL, 8, 'Scheduled', 'Booking successfully created', '2025-12-05 11:39:14', 1),
(11, NULL, 9, 'Scheduled', 'Booking successfully created', '2025-12-05 11:40:02', 1),
(12, 5, 7, 'Assigned', 'Assignment created', '2025-12-05 12:33:54', 1),
(13, 5, 7, 'Cancelled', 'Booking was successfully cancelled', '2025-12-05 13:25:08', 1),
(14, 6, 6, 'Assigned', 'Assignment created', '2025-12-08 09:45:52', 1),
(15, 5, 7, 'OTW to SOC', '', '2025-12-08 09:57:40', 9),
(16, 5, 7, 'Loading', '', '2025-12-08 09:57:42', 9),
(17, 6, 6, 'OTW to SOC', '', '2025-12-08 12:51:39', 9),
(18, 6, 6, 'Loading', '', '2025-12-08 13:28:24', 9),
(19, 6, 6, 'OTW to SOC', '', '2025-12-08 13:28:28', 9),
(20, 6, 6, 'Loading', '', '2025-12-08 13:28:31', 9),
(21, 6, 6, 'Completed', '', '2025-12-09 01:00:59', 9);

-- --------------------------------------------------------

--
-- Table structure for table `trucks`
--

CREATE TABLE `trucks` (
  `truck_id` int(11) NOT NULL,
  `plate_number` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `capacity` varchar(255) NOT NULL,
  `year` year(4) NOT NULL,
  `operational_status` enum('Available','On Delivery','Maintenance') NOT NULL,
  `document_status` enum('Valid','Expired') NOT NULL,
  `status` enum('Okay to Use','Not Okay to Use') NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trucks`
--

INSERT INTO `trucks` (`truck_id`, `plate_number`, `model`, `capacity`, `year`, `operational_status`, `document_status`, `status`, `image_path`, `remarks`) VALUES
(2, 'GHB-987', 'Isuzu Forward', '3456', '2021', 'Available', 'Valid', 'Okay to Use', '../private_uploads/images/truck_images/truck_img_68f9adff0254f4.22206762.png', ''),
(3, 'FGR', 'Isuzu Canter', '2345', '2021', 'On Delivery', 'Valid', 'Okay to Use', '../private_uploads/images/truck_images/truck_img_68fb603a30f840.59246679.png', '');

-- --------------------------------------------------------

--
-- Table structure for table `truck_documents`
--

CREATE TABLE `truck_documents` (
  `document_id` int(11) NOT NULL,
  `truck_id` int(11) NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `date_uploaded` datetime NOT NULL DEFAULT current_timestamp(),
  `expiry_date` date NOT NULL,
  `status` enum('Valid','Expired') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `truck_documents`
--

INSERT INTO `truck_documents` (`document_id`, `truck_id`, `document_type`, `file_path`, `date_uploaded`, `expiry_date`, `status`) VALUES
(3, 2, 'OR', '../private_uploads/documents/truck_documents/OR_doc_68f9adff029cf9.27357136.png', '2025-10-23 12:24:31', '2021-12-26', 'Expired'),
(4, 2, 'CR', '../private_uploads/documents/truck_documents/CR_doc_68f9adff02cc66.81619076.png', '2025-10-23 12:24:31', '2026-03-28', 'Valid'),
(5, 3, 'OR', '../private_uploads/documents/truck_documents/OR_doc_68fb603a3186e4.67783678.png', '2025-10-24 19:17:14', '2025-10-08', 'Expired'),
(6, 3, 'CR', '../private_uploads/documents/truck_documents/CR_doc_68fb603a3213e0.90401604.png', '2025-10-24 19:17:14', '2026-08-24', 'Valid');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `contact` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role_id`, `contact`) VALUES
(1, 'Admin Cell', 'lero.edceljohnlorenz.m@gmail.com', '$2y$10$NpweGQh8p9/4sOtt2oIuEOoDH3Hwxq0qU.edcl8AKZxmFjdWwL2BO', 1, '09914942839'),
(9, 'Luke Man', 'lukeman2700@gmail.com', '$2y$10$q80jdGnOuE3wd8reomy3o.kANuC1NUSPP8AN/5y2dg8zeOBgf2rvC', 2, '09928334'),
(10, 'Luke Man', 'emlero1573qc@student.fatima.edu.ph', '$2y$10$/GfDurN0S2k337vFq4Kcpu0IPc3s73NK/rkZ3D4.1DJOTzJR5Wyem', 3, '0932873232');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `truck_id` (`truck_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `helper_id` (`helper_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD UNIQUE KEY `dr_number` (`dr_number`),
  ADD KEY `bookings_created_by_users_fk` (`created_by`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `documents_ibfk_3` (`booking_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD KEY `users_fk` (`user_id`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `employees_fk` (`employee_id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `password_resets_to_users_fk` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `soa`
--
ALTER TABLE `soa`
  ADD PRIMARY KEY (`soa_id`),
  ADD KEY `soa_generated_by_users` (`generated_by`);

--
-- Indexes for table `soa_detail`
--
ALTER TABLE `soa_detail`
  ADD PRIMARY KEY (`soa_detail_id`);

--
-- Indexes for table `status_logs`
--
ALTER TABLE `status_logs`
  ADD PRIMARY KEY (`status_log_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `status_logs_ibfk_3` (`booking_id`);

--
-- Indexes for table `trucks`
--
ALTER TABLE `trucks`
  ADD PRIMARY KEY (`truck_id`);

--
-- Indexes for table `truck_documents`
--
ALTER TABLE `truck_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `trucks_fk` (`truck_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `roles_fk` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `soa`
--
ALTER TABLE `soa`
  MODIFY `soa_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `soa_detail`
--
ALTER TABLE `soa_detail`
  MODIFY `soa_detail_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `status_logs`
--
ALTER TABLE `status_logs`
  MODIFY `status_log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `trucks`
--
ALTER TABLE `trucks`
  MODIFY `truck_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `truck_documents`
--
ALTER TABLE `truck_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`),
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`helper_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_created_by_users_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `users_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `employees_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_to_users_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `soa`
--
ALTER TABLE `soa`
  ADD CONSTRAINT `soa_generated_by_users` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `status_logs`
--
ALTER TABLE `status_logs`
  ADD CONSTRAINT `status_logs_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  ADD CONSTRAINT `status_logs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `status_logs_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`);

--
-- Constraints for table `truck_documents`
--
ALTER TABLE `truck_documents`
  ADD CONSTRAINT `trucks_fk` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `roles_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
