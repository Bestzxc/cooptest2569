-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Mar 29, 2026 at 04:56 PM
-- Server version: 8.0.45
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fleet_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `result` enum('SUCCESS','FAIL') NOT NULL,
  `detail` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `resource_type`, `resource_id`, `ip_address`, `result`, `detail`, `created_at`) VALUES
('007b1265-c4ca-4b5a-93dd-75d8ed421a6d', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '63cf5e2e-3c8f-4e0f-ad51-c733e81be21f', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:06'),
('01e6300b-a08e-4629-8de5-912e3a43ee3c', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '786577bb-64b6-4d55-8df6-42fbd887e8af', '::1', 'SUCCESS', NULL, '2026-03-29 15:55:32'),
('03d2974a-4fae-439f-98b2-816c05f6dd9a', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '89f7f88e-5c35-4283-8a23-52c9e9945904', '::1', 'SUCCESS', NULL, '2026-03-29 12:56:35'),
('0baefb7a-1af6-4409-a2cf-b8014a389afa', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_VEHICLE', 'vehicle', '8d224365-b6eb-4515-ac0b-9e78afd6c0c8', '::1', 'SUCCESS', NULL, '2026-03-28 17:19:25'),
('0de9d822-e095-477c-8a8c-96a5dc941b5f', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '591ca1bd-19a1-4081-959d-d09a507049ac', '::1', 'SUCCESS', NULL, '2026-03-29 13:19:59'),
('1118d500-faea-47bb-8a4f-40e696d9f8e1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 17:15:55'),
('1adda04e-4968-4a1d-8b9e-9b49acdcc0f3', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '89f7f88e-5c35-4283-8a23-52c9e9945904', '::1', 'SUCCESS', NULL, '2026-03-29 12:53:13'),
('1bb6691c-df02-4266-af64-9927e314aa1c', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', '867c87cf-8f21-4c32-b348-530964c45a52', '::1', 'SUCCESS', NULL, '2026-03-29 15:51:45'),
('2003cd11-8696-4793-b28b-cad803d19815', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '591ca1bd-19a1-4081-959d-d09a507049ac', '::1', 'SUCCESS', NULL, '2026-03-29 13:19:51'),
('20e98c2c-6c60-4d04-847b-d8b700e60da6', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', 'fe6df2c8-0711-423e-8797-925a88ab30d9', '::1', 'SUCCESS', NULL, '2026-03-29 15:58:53'),
('24205663-ec25-4cef-982c-4275586b7cda', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_VEHICLE', 'vehicle', 'cdf8c395-dc90-4581-a836-00e764098a2e', '::1', 'SUCCESS', NULL, '2026-03-29 07:58:59'),
('292e4055-c16a-454c-9355-3e044a31900a', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', 'f1e8f091-8424-4631-a1b0-624aa69ec62a', '::1', 'SUCCESS', NULL, '2026-03-29 12:15:36'),
('2a1aa09d-4927-41a9-8211-3df3b934a0d1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'e5ad390d-5d3f-42eb-8774-d36386a5056d', '::1', 'SUCCESS', NULL, '2026-03-29 15:55:28'),
('2aebfbea-c348-415e-9a7a-c21a75a7215a', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', '9177c6b1-1766-40c7-b62f-fa2862c9e6ac', '::1', 'SUCCESS', NULL, '2026-03-29 13:19:38'),
('2e98fe49-c024-4d86-9780-2dff8fc0c6f0', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'fc5be8a9-68ed-4f0e-a859-9035c23f2c88', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:10'),
('31f558a5-bcaf-464e-b133-c179c255e0a7', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '7b481fa5-dc6a-43e7-998a-cc30d7a9df3b', '::1', 'SUCCESS', NULL, '2026-03-29 13:03:24'),
('32156c5b-606d-4db0-8de1-13c2f74028c4', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', 'a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', '::1', 'SUCCESS', NULL, '2026-03-29 16:17:20'),
('3b7e3b12-5dd8-482a-84f5-548d185849e7', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '5cd38fef-574e-4130-a24f-9ac322cf5ba8', '::1', 'SUCCESS', NULL, '2026-03-29 08:16:35'),
('3f265800-6c23-487a-85b9-9d808f8a7f21', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'ad954725-1f5d-4787-bc84-f6ad46245884', '::1', 'SUCCESS', NULL, '2026-03-29 12:22:26'),
('42fe5e8c-4e3f-4c05-9a85-a0a9bcd6bfa5', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', 'fe6df2c8-0711-423e-8797-925a88ab30d9', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:14'),
('43debd85-efc9-4442-aa81-f8cc1a4ed8b2', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'DELETE_TRIP', 'trip', '2927a812-1ddc-47bc-986c-e4a3c0df1b11', '::1', 'SUCCESS', NULL, '2026-03-29 12:48:46'),
('4933d86b-90bc-497d-8e7a-b922457354db', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '0d755715-6388-4a1d-96c1-ce19f69afada', '::1', 'SUCCESS', NULL, '2026-03-28 17:23:12'),
('4a27998a-a472-4eb6-8e1e-21f36bbe5da3', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_VEHICLE', 'vehicle', 'eeea6a6f-0cd9-4e1f-88b4-10890636bc3c', '::1', 'SUCCESS', NULL, '2026-03-29 13:29:02'),
('4ac15991-35f9-4ad5-81c4-7f8353521447', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 15:49:24'),
('4c07eb3a-fd75-40a4-b446-7406f0269178', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 19:52:14'),
('4f115b63-793f-437d-9e20-0f59782c617c', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 14:29:21'),
('567c80ed-b89d-416d-87c8-96f2d84efd0b', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'eb1df027-36dd-4a1d-bc02-099ff8fc5e93', '::1', 'SUCCESS', NULL, '2026-03-29 15:49:26'),
('582c63ea-8980-4084-b8f8-7406ada49bc7', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'e5ad390d-5d3f-42eb-8774-d36386a5056d', '::1', 'SUCCESS', NULL, '2026-03-29 15:55:29'),
('585c07fb-3e5f-4560-9991-a10234885d82', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '4919ed6a-3486-451c-b001-64d731cd07e0', '::1', 'SUCCESS', NULL, '2026-03-29 16:17:40'),
('593aaf6f-540c-4268-b50b-8da9dca7456f', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 23:39:40'),
('5b230d5d-e266-49c1-9018-daed7ed1f8c8', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 10:27:58'),
('5fe09479-21df-4acd-8984-b7cf10906934', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 13:32:25'),
('6584d58d-54f5-410e-821b-6192174f60e1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', '634e09f0-78ff-4366-b560-70be818d5d39', '::1', 'SUCCESS', NULL, '2026-03-29 12:56:20'),
('7078fca9-8192-4460-8f92-7ec48a1493a4', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '31c6671a-1b1b-4ded-97d6-a3245bf8ae66', '::1', 'SUCCESS', NULL, '2026-03-29 12:08:24'),
('7c1015c7-1d5e-4d1a-8322-5c07961e04b9', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'ad954725-1f5d-4787-bc84-f6ad46245884', '::1', 'SUCCESS', NULL, '2026-03-29 12:22:25'),
('7e588ae7-2808-44e4-88be-9e978c9539d1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 11:13:31'),
('8845be8c-29df-4afb-8a0c-cb2f971382a0', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', '9177c6b1-1766-40c7-b62f-fa2862c9e6ac', '::1', 'SUCCESS', NULL, '2026-03-29 13:20:00'),
('8ab6096a-8fc6-4740-9933-7b7eae8c3c06', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '0d755715-6388-4a1d-96c1-ce19f69afada', '::1', 'SUCCESS', NULL, '2026-03-29 10:29:16'),
('8d57f5fd-cd8a-445e-9e9a-a7de3a27c9d3', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', '6498b953-8733-49ac-8d40-23b937901904', '::1', 'SUCCESS', NULL, '2026-03-28 17:19:44'),
('913774ee-6b7c-47f1-866d-81d9de026752', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', '2927a812-1ddc-47bc-986c-e4a3c0df1b11', '::1', 'SUCCESS', NULL, '2026-03-28 23:05:27'),
('9371d97f-fdf0-4a1a-9b7e-f1cd04115bbb', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '9663dc59-501a-4ee7-a9cc-da8b739f830d', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:11'),
('939c3938-f391-401f-8dab-d28288699e48', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'fc5be8a9-68ed-4f0e-a859-9035c23f2c88', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:07'),
('954bd20c-08f5-491d-bf0c-bedb9873f4a1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'cccdc90c-9a2a-40d4-9a6e-8afa992f1c1e', '::1', 'SUCCESS', NULL, '2026-03-29 12:22:30'),
('960d1dfc-dfd9-4ff6-a09b-b64fa5da6bb1', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '5cd38fef-574e-4130-a24f-9ac322cf5ba8', '::1', 'SUCCESS', NULL, '2026-03-29 08:16:33'),
('99985da7-8719-42d5-97b0-bb19f32467c6', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'cccdc90c-9a2a-40d4-9a6e-8afa992f1c1e', '::1', 'SUCCESS', NULL, '2026-03-29 07:36:24'),
('a65a4da7-34c5-4bd2-b12c-452bcaedf90b', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '9663dc59-501a-4ee7-a9cc-da8b739f830d', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:14'),
('a9386653-e622-44fe-ac14-6deb362af220', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 11:34:35'),
('abd96235-d5d2-45d3-b1e4-21fee8ad83d3', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '786577bb-64b6-4d55-8df6-42fbd887e8af', '::1', 'SUCCESS', NULL, '2026-03-29 15:55:34'),
('add1d367-316b-46e8-85b5-98ca0b870761', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '4919ed6a-3486-451c-b001-64d731cd07e0', '::1', 'SUCCESS', NULL, '2026-03-29 16:17:58'),
('b15401ed-d37c-4080-9205-560801148cb0', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', 'e165973c-caac-4414-a0a0-99276831dc81', '::1', 'SUCCESS', NULL, '2026-03-29 12:56:46'),
('b283e561-3d70-44f8-b1a6-57918f0039de', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', '867c87cf-8f21-4c32-b348-530964c45a52', '::1', 'SUCCESS', NULL, '2026-03-29 15:55:35'),
('b703c196-0227-4ece-b0b0-bb195907dcb6', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-28 17:39:46'),
('bb3093fb-63da-4cfe-9a3a-61b0baf6bd01', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '63cf5e2e-3c8f-4e0f-ad51-c733e81be21f', '::1', 'SUCCESS', NULL, '2026-03-29 15:59:09'),
('bb9c431d-ef27-43e0-9b38-403f4e022623', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '0d755715-6388-4a1d-96c1-ce19f69afada', '::1', 'SUCCESS', NULL, '2026-03-29 10:28:13'),
('bec2b665-ea5e-4a6b-9e02-a9a4c0d71590', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 10:05:08'),
('c182d42e-b540-41c3-823a-ec28e337d175', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'eb1df027-36dd-4a1d-bc02-099ff8fc5e93', '::1', 'SUCCESS', NULL, '2026-03-29 15:49:40'),
('cd9b690d-fb97-4390-8d7f-78e565934f77', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'DELETE_TRIP', 'trip', '6498b953-8733-49ac-8d40-23b937901904', '::1', 'SUCCESS', NULL, '2026-03-29 12:48:38'),
('d0929c35-6526-4577-b484-e673ec835a9c', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '7b481fa5-dc6a-43e7-998a-cc30d7a9df3b', '::1', 'SUCCESS', NULL, '2026-03-29 13:03:17'),
('d523e3cc-7d4f-432e-a6f5-1c7bd666e406', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_VEHICLE', 'vehicle', '9a3013a0-9c06-4089-9da9-9f9560702d24', '::1', 'SUCCESS', NULL, '2026-03-29 07:47:24'),
('df01718f-a137-4a6c-ad2c-bdd26b8af2ee', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 11:12:56'),
('e29d00e3-ff11-4a21-b16f-23c587385361', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', 'e165973c-caac-4414-a0a0-99276831dc81', '::1', 'SUCCESS', NULL, '2026-03-29 12:52:28'),
('e4386b4a-875f-4939-a9ad-e2c754a37efb', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '4d5dc21e-c90c-4633-a438-c1f355791ebe', '::1', 'SUCCESS', NULL, '2026-03-29 12:22:41'),
('ed1b40e2-3b2a-474f-901f-2be4bb33d5c2', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'd834179e-f80c-4c2e-835d-494d743d7f97', '::1', 'SUCCESS', NULL, '2026-03-29 12:08:35'),
('ef816e0d-20b6-4de6-9421-4ca1531205cc', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '0d755715-6388-4a1d-96c1-ce19f69afada', '::1', 'SUCCESS', NULL, '2026-03-29 08:16:18'),
('f21f404d-bb5e-4fb5-ba40-b6979a0ea528', '4f3bb52c-5306-4796-bea8-b14c0b06465c', 'LOGIN', 'auth', NULL, '::1', 'SUCCESS', NULL, '2026-03-29 16:40:24'),
('f4abd6c5-abbb-4c9d-a8b2-c5d316529e7c', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', 'a2edbf91-75ad-4c07-b212-d3e91eef5c17', '::1', 'SUCCESS', NULL, '2026-03-29 16:18:02'),
('f7aa291d-6345-4bc0-990c-356dff66e0f2', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'COMPLETE_TRIP', 'trip', '634e09f0-78ff-4366-b560-70be818d5d39', '::1', 'SUCCESS', NULL, '2026-03-29 15:49:40'),
('fbd96dd2-61db-45fa-8991-9762cc0ca6ac', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'CREATE_TRIP', 'trip', 'f1e8f091-8424-4631-a1b0-624aa69ec62a', '::1', 'SUCCESS', NULL, '2026-03-29 12:07:43'),
('fe54d63b-f389-4c62-906b-10871a6a769f', '7fd90783-2aaa-11f1-9905-facdc64b3050', 'UPDATE_CHECKPOINT', 'checkpoint', '0d755715-6388-4a1d-96c1-ce19f69afada', '::1', 'SUCCESS', NULL, '2026-03-28 19:52:50');

-- --------------------------------------------------------

--
-- Table structure for table `checkpoints`
--

CREATE TABLE `checkpoints` (
  `id` varchar(36) NOT NULL,
  `trip_id` varchar(36) NOT NULL,
  `sequence` tinyint NOT NULL,
  `status` enum('PENDING','ARRIVED','DEPARTED','SKIPPED') NOT NULL DEFAULT 'PENDING',
  `location_name` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `purpose` enum('FUEL','REST','DELIVERY','PICKUP','INSPECTION') DEFAULT NULL,
  `notes` text,
  `arrived_at` datetime DEFAULT NULL,
  `departed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `checkpoints`
--

INSERT INTO `checkpoints` (`id`, `trip_id`, `sequence`, `status`, `location_name`, `latitude`, `longitude`, `purpose`, `notes`, `arrived_at`, `departed_at`, `created_at`) VALUES
('31c6671a-1b1b-4ded-97d6-a3245bf8ae66', 'f1e8f091-8424-4631-a1b0-624aa69ec62a', 1, 'ARRIVED', 'กรุงเทพฯ', NULL, NULL, 'FUEL', NULL, '2026-03-29 12:08:24', NULL, '2026-03-29 12:07:43'),
('33a6b969-0178-4ce8-93d0-9b318ea101c6', 'a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', 3, 'PENDING', 'ตาก', NULL, NULL, 'FUEL', NULL, NULL, NULL, '2026-03-29 16:17:20'),
('4919ed6a-3486-451c-b001-64d731cd07e0', 'a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', 1, 'DEPARTED', 'สิงห์บุรี', NULL, NULL, 'FUEL', NULL, '2026-03-29 16:17:40', '2026-03-29 16:17:58', '2026-03-29 16:17:20'),
('4b5e05c0-c91f-47cc-9a1b-685f6a76d97b', 'e165973c-caac-4414-a0a0-99276831dc81', 2, 'PENDING', 'สุพรรณบุรี', NULL, NULL, 'FUEL', NULL, NULL, NULL, '2026-03-29 12:52:28'),
('4d4867d5-897e-4bce-91cf-e5dff16702e1', 'a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', 4, 'PENDING', 'เชียงใหม่', NULL, NULL, 'DELIVERY', NULL, NULL, NULL, '2026-03-29 16:17:20'),
('591ca1bd-19a1-4081-959d-d09a507049ac', '9177c6b1-1766-40c7-b62f-fa2862c9e6ac', 1, 'DEPARTED', 'ขอนแก่น', NULL, NULL, 'DELIVERY', NULL, '2026-03-29 13:19:51', '2026-03-29 13:19:59', '2026-03-29 13:19:38'),
('63cf5e2e-3c8f-4e0f-ad51-c733e81be21f', 'fe6df2c8-0711-423e-8797-925a88ab30d9', 1, 'DEPARTED', 'กระบี่', NULL, NULL, 'PICKUP', NULL, '2026-03-29 15:59:06', '2026-03-29 15:59:09', '2026-03-29 15:58:53'),
('7676c382-61b1-4281-b230-bc85d54c758e', 'e165973c-caac-4414-a0a0-99276831dc81', 3, 'PENDING', 'นครปฐม', NULL, NULL, 'DELIVERY', NULL, NULL, NULL, '2026-03-29 12:52:28'),
('786577bb-64b6-4d55-8df6-42fbd887e8af', '867c87cf-8f21-4c32-b348-530964c45a52', 2, 'DEPARTED', 'ระยอง', NULL, NULL, 'DELIVERY', NULL, '2026-03-29 15:55:32', '2026-03-29 15:55:34', '2026-03-29 15:51:45'),
('7b481fa5-dc6a-43e7-998a-cc30d7a9df3b', '634e09f0-78ff-4366-b560-70be818d5d39', 1, 'DEPARTED', 'นครปฐม', NULL, NULL, 'FUEL', NULL, '2026-03-29 13:03:17', '2026-03-29 13:03:24', '2026-03-29 12:56:20'),
('89f7f88e-5c35-4283-8a23-52c9e9945904', 'e165973c-caac-4414-a0a0-99276831dc81', 1, 'DEPARTED', 'กาญจนบุรี', NULL, NULL, 'PICKUP', NULL, '2026-03-29 12:53:13', '2026-03-29 12:56:35', '2026-03-29 12:52:28'),
('9663dc59-501a-4ee7-a9cc-da8b739f830d', 'fe6df2c8-0711-423e-8797-925a88ab30d9', 3, 'DEPARTED', 'กาญจนบุรี', NULL, NULL, 'DELIVERY', NULL, '2026-03-29 15:59:11', '2026-03-29 15:59:14', '2026-03-29 15:58:53'),
('a2edbf91-75ad-4c07-b212-d3e91eef5c17', 'a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', 2, 'ARRIVED', 'นครสวรรค์', NULL, NULL, 'REST', NULL, '2026-03-29 16:18:02', NULL, '2026-03-29 16:17:20'),
('d834179e-f80c-4c2e-835d-494d743d7f97', 'f1e8f091-8424-4631-a1b0-624aa69ec62a', 2, 'ARRIVED', 'ปทุมธานี', NULL, NULL, 'DELIVERY', NULL, '2026-03-29 12:08:35', NULL, '2026-03-29 12:07:43'),
('e5ad390d-5d3f-42eb-8774-d36386a5056d', '867c87cf-8f21-4c32-b348-530964c45a52', 1, 'DEPARTED', 'ระยอง', NULL, NULL, 'FUEL', NULL, '2026-03-29 15:55:28', '2026-03-29 15:55:29', '2026-03-29 15:51:45'),
('eb1df027-36dd-4a1d-bc02-099ff8fc5e93', '634e09f0-78ff-4366-b560-70be818d5d39', 2, 'DEPARTED', 'กาญจนบุรี', NULL, NULL, 'DELIVERY', NULL, '2026-03-29 15:49:26', '2026-03-29 15:49:40', '2026-03-29 12:56:20'),
('fc5be8a9-68ed-4f0e-a859-9035c23f2c88', 'fe6df2c8-0711-423e-8797-925a88ab30d9', 2, 'DEPARTED', 'ประจวบคีรีขันธ์', NULL, NULL, 'FUEL', NULL, '2026-03-29 15:59:07', '2026-03-29 15:59:10', '2026-03-29 15:58:53');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `license_expires_at` date NOT NULL,
  `phone` varchar(20) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `license_number`, `license_expires_at`, `phone`, `status`, `created_at`, `updated_at`) VALUES
('03824175-3bbe-4789-ba08-d107fd18677e', 'วิชัย สุขสม', 'D-3456789', '2026-12-01', '083-456-7890', 'ACTIVE', '2026-03-29 07:38:50', '2026-03-29 07:38:50'),
('63da8ceb-43dc-4829-ad6d-abb6c0c05c0a', 'สมชาย ใจดี', 'D-1234567', '2027-12-31', '081-234-5678', 'ACTIVE', '2026-03-28 14:43:46', '2026-03-28 14:43:46'),
('89748ed0-8201-40e2-913c-f91a9f9b5e35', 'แดง สีใส', 'D-1585476', '2026-04-18', '068-789-9634', 'ACTIVE', '2026-03-29 13:44:53', '2026-03-29 13:44:53'),
('93cf093c-df8f-4760-8243-1150d6a68793', 'มาลี รักไทย', 'D-4567890', '2026-12-01', '084-567-8901', 'ACTIVE', '2026-03-29 07:53:41', '2026-03-29 07:53:41'),
('b82353b5-7139-4cd8-9ba7-f20131e28bf8', 'สุดารัตน์ พงษ์ดี', 'D-2345678', '2026-08-20', '082-345-6789', 'ACTIVE', '2026-03-29 07:38:12', '2026-03-29 07:38:12');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance`
--

CREATE TABLE `maintenance` (
  `id` varchar(36) NOT NULL,
  `vehicle_id` varchar(36) NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
  `type` enum('OIL_CHANGE','TIRE','BRAKE','ENGINE','INSPECTION','REPAIR') NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `mileage_at_service` int DEFAULT NULL,
  `technician` varchar(100) DEFAULT NULL,
  `cost_thb` decimal(10,2) DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `maintenance`
--

INSERT INTO `maintenance` (`id`, `vehicle_id`, `status`, `type`, `scheduled_at`, `completed_at`, `mileage_at_service`, `technician`, `cost_thb`, `notes`, `created_at`, `updated_at`) VALUES
('5a86a67c-38a0-4638-8a45-55ee58dc6a69', '8d224365-b6eb-4515-ac0b-9e78afd6c0c8', 'SCHEDULED', 'OIL_CHANGE', '2026-03-29 13:20:00', NULL, 51080, NULL, NULL, 'Auto-created: mileage เกิน next_service_km', '2026-03-29 13:20:00', '2026-03-29 13:20:00'),
('a1fe8a9d-2afb-11f1-8fcb-4a9502c903a1', '8d224365-b6eb-4515-ac0b-9e78afd6c0c8', 'SCHEDULED', 'OIL_CHANGE', '2026-03-23 23:12:46', NULL, NULL, 'ช่างสมชาย', NULL, 'เปลี่ยนถ่ายน้ำมันเครื่อง', '2026-03-28 23:12:46', '2026-03-28 23:12:46');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_parts`
--

CREATE TABLE `maintenance_parts` (
  `id` varchar(36) NOT NULL,
  `maintenance_id` varchar(36) NOT NULL,
  `part_name` varchar(100) NOT NULL,
  `part_number` varchar(50) DEFAULT NULL,
  `quantity` tinyint NOT NULL DEFAULT '1',
  `cost_thb` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` varchar(36) NOT NULL,
  `vehicle_id` varchar(36) NOT NULL,
  `driver_id` varchar(36) NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `origin` varchar(100) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `cargo_type` enum('GENERAL','FRAGILE','HAZARDOUS','REFRIGERATED') DEFAULT NULL,
  `cargo_weight_kg` decimal(8,2) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `vehicle_id`, `driver_id`, `status`, `origin`, `destination`, `distance_km`, `cargo_type`, `cargo_weight_kg`, `started_at`, `ended_at`, `created_at`, `updated_at`) VALUES
('634e09f0-78ff-4366-b560-70be818d5d39', 'cdf8c395-dc90-4581-a836-00e764098a2e', '93cf093c-df8f-4760-8243-1150d6a68793', 'COMPLETED', 'กรุงเทพฯ', 'กาญจนบุรี', 250.00, 'GENERAL', 68.00, '2026-03-29 12:56:20', '2026-03-29 15:49:40', '2026-03-29 12:56:20', '2026-03-29 15:49:40'),
('867c87cf-8f21-4c32-b348-530964c45a52', '9a3013a0-9c06-4089-9da9-9f9560702d24', '89748ed0-8201-40e2-913c-f91a9f9b5e35', 'COMPLETED', 'จันทบุรี', 'ระยอง', 120.00, 'GENERAL', 80.00, '2026-03-29 15:51:45', '2026-03-29 15:55:35', '2026-03-29 15:51:45', '2026-03-29 15:55:35'),
('9177c6b1-1766-40c7-b62f-fa2862c9e6ac', '8d224365-b6eb-4515-ac0b-9e78afd6c0c8', '93cf093c-df8f-4760-8243-1150d6a68793', 'COMPLETED', 'กรุงเทพฯ', 'ขอนแก่น', 80.00, 'FRAGILE', 30.00, '2026-03-29 13:19:38', '2026-03-29 13:20:00', '2026-03-29 13:19:38', '2026-03-29 13:20:00'),
('a18d351a-1d5e-4587-bb6d-e1e9e5ab4f28', '9a3013a0-9c06-4089-9da9-9f9560702d24', '03824175-3bbe-4789-ba08-d107fd18677e', 'IN_PROGRESS', 'กรุงเทพฯ', 'เชียงใหม่', 700.00, 'GENERAL', 96.00, '2026-03-29 16:17:20', NULL, '2026-03-29 16:17:20', '2026-03-29 16:17:20'),
('e165973c-caac-4414-a0a0-99276831dc81', '9a3013a0-9c06-4089-9da9-9f9560702d24', '93cf093c-df8f-4760-8243-1150d6a68793', 'COMPLETED', 'กาญจนบุรี', 'นครปฐม', 120.00, 'REFRIGERATED', 56.00, '2026-03-29 12:52:28', '2026-03-29 12:56:46', '2026-03-29 12:52:28', '2026-03-29 12:56:46'),
('f1e8f091-8424-4631-a1b0-624aa69ec62a', 'cdf8c395-dc90-4581-a836-00e764098a2e', '03824175-3bbe-4789-ba08-d107fd18677e', 'COMPLETED', 'กรุงเทพฯ', 'ปทุมธานี', 50.00, 'GENERAL', 20.00, '2026-03-29 12:07:43', '2026-03-29 12:15:36', '2026-03-29 12:07:43', '2026-03-29 12:15:36'),
('fe6df2c8-0711-423e-8797-925a88ab30d9', 'cdf8c395-dc90-4581-a836-00e764098a2e', '93cf093c-df8f-4760-8243-1150d6a68793', 'COMPLETED', 'กระบี่', 'กาญจนบุรี', 205.00, 'REFRIGERATED', 80.00, '2026-03-29 15:58:53', '2026-03-29 15:59:14', '2026-03-29 15:58:53', '2026-03-29 15:59:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('DISPATCHER','ADMIN') NOT NULL DEFAULT 'DISPATCHER',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `created_at`) VALUES
('4f3bb52c-5306-4796-bea8-b14c0b06465c', 'dispatcher1', '$2b$10$P7gQfOD5Gp.Fa8P7Fwl2Ae56RN0.NXwxIYJCjBsWLTJRRmcEfhy/C', 'DISPATCHER', '2026-03-29 16:38:13'),
('7fd90783-2aaa-11f1-9905-facdc64b3050', 'admin', '$2b$10$HRnAqLj5vudnYWdYs77leeoXFd4Ynahe6GMR3bgUK01zXRFc84WXy', 'ADMIN', '2026-03-28 13:32:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` varchar(36) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `type` enum('TRUCK','VAN','MOTORCYCLE','PICKUP') NOT NULL,
  `status` enum('ACTIVE','IDLE','MAINTENANCE','RETIRED') NOT NULL DEFAULT 'IDLE',
  `driver_id` varchar(36) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `year` smallint DEFAULT NULL,
  `fuel_type` enum('DIESEL','GASOLINE','ELECTRIC','HYBRID') DEFAULT NULL,
  `mileage_km` int NOT NULL DEFAULT '0',
  `last_service_km` int DEFAULT NULL,
  `next_service_km` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `license_plate`, `type`, `status`, `driver_id`, `brand`, `model`, `year`, `fuel_type`, `mileage_km`, `last_service_km`, `next_service_km`, `created_at`, `updated_at`) VALUES
('8d224365-b6eb-4515-ac0b-9e78afd6c0c8', 'กข-1234', 'TRUCK', 'MAINTENANCE', '63da8ceb-43dc-4829-ad6d-abb6c0c05c0a', 'Isuzu', 'D-Max', 2020, 'DIESEL', 51080, 40000, 50000, '2026-03-28 17:19:25', '2026-03-29 13:20:00'),
('9a3013a0-9c06-4089-9da9-9f9560702d24', 'กค-5678', 'VAN', 'ACTIVE', NULL, 'Toyota', 'Hiace', 2021, 'DIESEL', 28740, 25000, 35000, '2026-03-29 07:47:24', '2026-03-29 16:17:20'),
('cdf8c395-dc90-4581-a836-00e764098a2e', 'ขค-3456', 'MOTORCYCLE', 'IDLE', NULL, 'Honda', 'Wave 125', 2022, 'GASOLINE', 15705, 10000, 20000, '2026-03-29 07:58:59', '2026-03-29 15:59:14'),
('eeea6a6f-0cd9-4e1f-88b4-10890636bc3c', 'กท-2568', 'VAN', 'MAINTENANCE', NULL, 'Toyota', 'Altis', 2021, 'DIESEL', 40000, 15000, 39000, '2026-03-29 13:29:02', '2026-03-29 13:36:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_created` (`created_at`);

--
-- Indexes for table `checkpoints`
--
ALTER TABLE `checkpoints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_trip_sequence` (`trip_id`,`sequence`),
  ADD KEY `idx_checkpoints_trip` (`trip_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`);

--
-- Indexes for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_maintenance_vehicle` (`vehicle_id`),
  ADD KEY `idx_maintenance_status` (`status`),
  ADD KEY `idx_maintenance_scheduled` (`scheduled_at`);

--
-- Indexes for table `maintenance_parts`
--
ALTER TABLE `maintenance_parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintenance_id` (`maintenance_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `idx_trips_vehicle` (`vehicle_id`),
  ADD KEY `idx_trips_status` (`status`),
  ADD KEY `idx_trips_started` (`started_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `idx_vehicles_status` (`status`),
  ADD KEY `idx_vehicles_driver` (`driver_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `checkpoints`
--
ALTER TABLE `checkpoints`
  ADD CONSTRAINT `checkpoints_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`);

--
-- Constraints for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `maintenance_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `maintenance_parts`
--
ALTER TABLE `maintenance_parts`
  ADD CONSTRAINT `maintenance_parts_ibfk_1` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance` (`id`);

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
