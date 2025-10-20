-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 20, 2025 at 09:08 AM
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
  `current_status` enum('Pending','OTW to SOC','OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete') DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `service_type` enum('Partnership','LipatBahay') NOT NULL,
  `dr_number` varchar(50) DEFAULT NULL,
  `partner_name` varchar(100) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `route_from` varchar(255) DEFAULT NULL,
  `route_to` varchar(255) DEFAULT NULL,
  `scheduled_start` datetime DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `estimated_weight` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('Pending Assignment','Assigned','Completed','Cancelled') DEFAULT 'Pending Assignment',
  `date_created` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_assignment`
--

CREATE TABLE `delivery_assignment` (
  `assignment_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `truck_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `helper_id` int(11) DEFAULT NULL,
  `assigned_date` datetime NOT NULL DEFAULT current_timestamp(),
  `current_status` enum('Pending','OTW to SOC','Loading','OTW to Destination','Unloading','Completed','Incomplete') NOT NULL,
  `remarks` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_document`
--

CREATE TABLE `delivery_document` (
  `document_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `document_type` enum('Delivery Receipt','Cargo Photo','Other') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `date_uploaded` datetime NOT NULL DEFAULT current_timestamp(),
  `uploaded_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_status_log`
--

CREATE TABLE `delivery_status_log` (
  `status_log_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `status` enum('OTW to SOC','Loading','OTW to Destination','Unloading','Completed','Incomplete') NOT NULL,
  `remarks` int(255) DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `assignment_id` int(11) DEFAULT NULL,
  `document_type` enum('Delivery Receipt','Cargo Photo','Other') DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT current_timestamp(),
  `uploaded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `lipat_bahay_assignment`
--

CREATE TABLE `lipat_bahay_assignment` (
  `assigment_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `truck_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `helper_id` int(11) DEFAULT NULL,
  `assigned_date` datetime NOT NULL DEFAULT current_timestamp(),
  `current_status` enum('Pending','OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lipat_bahay_booking`
--

CREATE TABLE `lipat_bahay_booking` (
  `booking_id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `from_address` varchar(255) NOT NULL,
  `to_address` varchar(255) NOT NULL,
  `scheduled_start` datetime NOT NULL,
  `deadline` datetime NOT NULL,
  `estimated_weight` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `status` enum('Pending Assignment','Assigned','Completed','Cancelled') NOT NULL,
  `date_created` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lipat_bahay_document`
--

CREATE TABLE `lipat_bahay_document` (
  `document_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `document_type` enum('Delivery Receipt','Cargo Photo','Other') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `date_uploaded` datetime NOT NULL DEFAULT current_timestamp(),
  `uploaded_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lipat_bahay_status_log`
--

CREATE TABLE `lipat_bahay_status_log` (
  `status_log_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `status` enum('OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partnership_booking`
--

CREATE TABLE `partnership_booking` (
  `booking_id` int(11) NOT NULL,
  `dr_number` varchar(255) NOT NULL,
  `partner_name` varchar(255) NOT NULL,
  `route_from` varchar(255) NOT NULL,
  `route_to` varchar(255) NOT NULL,
  `scheduled_start` datetime NOT NULL,
  `deadline` datetime NOT NULL,
  `estimated_weight` decimal(10,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `date_created` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `service_type` enum('Partnership','Lipat Bahay','','') NOT NULL,
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
  `status` enum('OTW to SOC','OTW to Pickup','Loading','OTW to Destination','Unloading','Completed','Incomplete') DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Admin Cell', 'lero.edceljohnlorenz.m@gmail.com', '$2y$10$EJSYdBweoM1MmZ89zAvoperKen2RYvVLRI.kvCzsIIM56TXoX7dm.', 1, '09914942839');

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
-- Indexes for table `delivery_assignment`
--
ALTER TABLE `delivery_assignment`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `fk_delivery_truck` (`truck_id`),
  ADD KEY `delivery_driver_fk` (`driver_id`),
  ADD KEY `delivery_helper_fk` (`helper_id`),
  ADD KEY `delivery_partnership_booking_fk` (`booking_id`);

--
-- Indexes for table `delivery_document`
--
ALTER TABLE `delivery_document`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `delivery_assignment_document_fk` (`assignment_id`),
  ADD KEY `uploaded_document_by_users_fk` (`uploaded_by`);

--
-- Indexes for table `delivery_status_log`
--
ALTER TABLE `delivery_status_log`
  ADD PRIMARY KEY (`status_log_id`),
  ADD KEY `delivery_assignment_status_log_fk` (`assignment_id`),
  ADD KEY `updated_by_users_fk` (`updated_by`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

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
-- Indexes for table `lipat_bahay_assignment`
--
ALTER TABLE `lipat_bahay_assignment`
  ADD PRIMARY KEY (`assigment_id`),
  ADD KEY `lipat_bahay_booking_to_assignment_fk` (`booking_id`),
  ADD KEY `lipat_bahay_assignment_truck_fk` (`truck_id`),
  ADD KEY `lipat_bahay_assignment_driver_fk` (`driver_id`),
  ADD KEY `lipat_bahay_assignment_helper_fk` (`helper_id`);

--
-- Indexes for table `lipat_bahay_booking`
--
ALTER TABLE `lipat_bahay_booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `lipat_bahay_booking_created_by_users_fk` (`created_by`);

--
-- Indexes for table `lipat_bahay_document`
--
ALTER TABLE `lipat_bahay_document`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `lipat_bahay_document_assignment_fk` (`assignment_id`),
  ADD KEY `lipat_bahay_document_uploaded_by_users_fk` (`uploaded_by`);

--
-- Indexes for table `lipat_bahay_status_log`
--
ALTER TABLE `lipat_bahay_status_log`
  ADD PRIMARY KEY (`status_log_id`),
  ADD KEY `lipat_bahay_status_log_assignment_fk` (`assignment_id`),
  ADD KEY `lipat_bahay_status_log_updated_by_users_fk` (`updated_by`);

--
-- Indexes for table `partnership_booking`
--
ALTER TABLE `partnership_booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `fk_partnership_created_by` (`created_by`);

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
  ADD KEY `updated_by` (`updated_by`);

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
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_assignment`
--
ALTER TABLE `delivery_assignment`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_document`
--
ALTER TABLE `delivery_document`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_status_log`
--
ALTER TABLE `delivery_status_log`
  MODIFY `status_log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lipat_bahay_assignment`
--
ALTER TABLE `lipat_bahay_assignment`
  MODIFY `assigment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lipat_bahay_booking`
--
ALTER TABLE `lipat_bahay_booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lipat_bahay_document`
--
ALTER TABLE `lipat_bahay_document`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lipat_bahay_status_log`
--
ALTER TABLE `lipat_bahay_status_log`
  MODIFY `status_log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partnership_booking`
--
ALTER TABLE `partnership_booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `status_log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trucks`
--
ALTER TABLE `trucks`
  MODIFY `truck_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `truck_documents`
--
ALTER TABLE `truck_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Constraints for table `delivery_assignment`
--
ALTER TABLE `delivery_assignment`
  ADD CONSTRAINT `delivery_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `delivery_helper_fk` FOREIGN KEY (`helper_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `delivery_partnership_booking_fk` FOREIGN KEY (`booking_id`) REFERENCES `partnership_booking` (`booking_id`),
  ADD CONSTRAINT `fk_delivery_truck` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`);

--
-- Constraints for table `delivery_document`
--
ALTER TABLE `delivery_document`
  ADD CONSTRAINT `delivery_assignment_document_fk` FOREIGN KEY (`assignment_id`) REFERENCES `delivery_assignment` (`assignment_id`),
  ADD CONSTRAINT `uploaded_document_by_users_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `delivery_status_log`
--
ALTER TABLE `delivery_status_log`
  ADD CONSTRAINT `delivery_assignment_status_log_fk` FOREIGN KEY (`assignment_id`) REFERENCES `delivery_assignment` (`assignment_id`),
  ADD CONSTRAINT `updated_by_users_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`);

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
-- Constraints for table `lipat_bahay_assignment`
--
ALTER TABLE `lipat_bahay_assignment`
  ADD CONSTRAINT `lipat_bahay_assignment_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `lipat_bahay_assignment_helper_fk` FOREIGN KEY (`helper_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `lipat_bahay_assignment_truck_fk` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`),
  ADD CONSTRAINT `lipat_bahay_booking_to_assignment_fk` FOREIGN KEY (`booking_id`) REFERENCES `lipat_bahay_booking` (`booking_id`);

--
-- Constraints for table `lipat_bahay_booking`
--
ALTER TABLE `lipat_bahay_booking`
  ADD CONSTRAINT `lipat_bahay_booking_created_by_users_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `lipat_bahay_document`
--
ALTER TABLE `lipat_bahay_document`
  ADD CONSTRAINT `lipat_bahay_document_assignment_fk` FOREIGN KEY (`assignment_id`) REFERENCES `lipat_bahay_assignment` (`assigment_id`),
  ADD CONSTRAINT `lipat_bahay_document_uploaded_by_users_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `lipat_bahay_status_log`
--
ALTER TABLE `lipat_bahay_status_log`
  ADD CONSTRAINT `lipat_bahay_status_log_assignment_fk` FOREIGN KEY (`assignment_id`) REFERENCES `lipat_bahay_assignment` (`assigment_id`),
  ADD CONSTRAINT `lipat_bahay_status_log_updated_by_users_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `partnership_booking`
--
ALTER TABLE `partnership_booking`
  ADD CONSTRAINT `fk_partnership_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

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
  ADD CONSTRAINT `status_logs_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

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
