-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               5.7.39-log - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table businessplatformdb.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Categories_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.categories: ~1 rows (approximately)
INSERT INTO `categories` (`Id`, `Name`, `Description`, `CreatedBy`, `CreatedAt`, `UpdatedBy`, `UpdatedAt`, `IsActive`) VALUES
	('e2bcce34-7e45-40ac-aa81-94fb2e96c60b', 'Electronics & Gadgets', 'Updated Description', NULL, '2026-07-14 09:52:39.322306', NULL, '2026-07-14 09:56:59.235168', 1);

-- Dumping structure for table businessplatformdb.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `PostalCode` varchar(20) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `UpdatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Customers_Email` (`Email`),
  UNIQUE KEY `IX_Customers_PhoneNumber` (`PhoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.customers: ~1 rows (approximately)
INSERT INTO `customers` (`Id`, `FirstName`, `LastName`, `Email`, `PhoneNumber`, `Address`, `City`, `State`, `PostalCode`, `IsActive`, `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`) VALUES
	('7c28829d-792c-4d60-bec8-971e90c9877d', 'Ritik', 'Guleria', 'ritik@example.com', '9876543210', 'New Address', 'Shimla', 'Himachal Pradesh', '171002', 1, '2026-07-26 10:12:06.959102', '2026-07-26 10:12:54.454028', NULL, NULL);

-- Dumping structure for table businessplatformdb.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `UserId` char(36) CHARACTER SET ascii NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `DateOfBirth` datetime(6) DEFAULT NULL,
  `IsMarried` tinyint(1) NOT NULL,
  `Address` varchar(300) DEFAULT NULL,
  `JoiningDate` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Employees_UserId` (`UserId`),
  CONSTRAINT `FK_Employees_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.employees: ~0 rows (approximately)

-- Dumping structure for table businessplatformdb.inventories
CREATE TABLE IF NOT EXISTS `inventories` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `ProductId` char(36) CHARACTER SET ascii NOT NULL,
  `QuantityInStock` int(11) NOT NULL DEFAULT '0',
  `MinimumStock` int(11) NOT NULL DEFAULT '0',
  `MaximumStock` int(11) NOT NULL DEFAULT '0',
  `ReorderLevel` int(11) NOT NULL DEFAULT '0',
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Inventories_ProductId` (`ProductId`),
  CONSTRAINT `FK_Inventories_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.inventories: ~1 rows (approximately)
INSERT INTO `inventories` (`Id`, `ProductId`, `QuantityInStock`, `MinimumStock`, `MaximumStock`, `ReorderLevel`, `CreatedBy`, `CreatedAt`, `UpdatedBy`, `UpdatedAt`, `IsActive`) VALUES
	('2a1bd24c-97f3-4cae-8ea8-2142b51d0819', '61e5133f-b7fd-4af4-b913-ce623c3a975b', 93, 10, 50, 20, NULL, '2026-07-26 08:05:44.195118', NULL, '2026-08-15 19:38:20.914090', 1);

-- Dumping structure for table businessplatformdb.modules
CREATE TABLE IF NOT EXISTS `modules` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.modules: ~2 rows (approximately)
INSERT INTO `modules` (`Id`, `Name`, `Description`) VALUES
	('a1b2c3d4-1111-4444-8888-123456789001', 'Product', 'Product management module'),
	('a1b2c3d4-1111-4444-8888-123456789002', 'Sales', 'Sales management module');

-- Dumping structure for table businessplatformdb.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `SaleId` char(36) CHARACTER SET ascii NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Method` int(11) NOT NULL,
  `Status` int(11) NOT NULL,
  `TransactionReference` varchar(150) DEFAULT NULL,
  `PaymentDate` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Payments_SaleId` (`SaleId`),
  CONSTRAINT `FK_Payments_Sales_SaleId` FOREIGN KEY (`SaleId`) REFERENCES `sales` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.payments: ~1 rows (approximately)
INSERT INTO `payments` (`Id`, `SaleId`, `Amount`, `Method`, `Status`, `TransactionReference`, `PaymentDate`) VALUES
	('3d6e6bfa-c9b3-4ddc-a535-a47700fb1792', '4c0ecaf9-2bfb-4105-a8e7-8c2e33fca1c4', 1400.00, 3, 2, 'UPI123456', '2026-08-15 19:38:20.914155');

-- Dumping structure for table businessplatformdb.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Name` varchar(100) NOT NULL,
  `ModuleId` char(36) CHARACTER SET ascii NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Permissions_ModuleId` (`ModuleId`),
  CONSTRAINT `FK_Permissions_Modules_ModuleId` FOREIGN KEY (`ModuleId`) REFERENCES `modules` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.permissions: ~4 rows (approximately)
INSERT INTO `permissions` (`Id`, `Name`, `ModuleId`) VALUES
	('11111111-aaaa-4444-bbbb-000000000001', 'product.read', 'a1b2c3d4-1111-4444-8888-123456789001'),
	('11111111-aaaa-4444-bbbb-000000000002', 'product.write', 'a1b2c3d4-1111-4444-8888-123456789001'),
	('11111111-aaaa-4444-bbbb-000000000003', 'product.delete', 'a1b2c3d4-1111-4444-8888-123456789001'),
	('11111111-aaaa-4444-bbbb-000000000004', 'sales.read', 'a1b2c3d4-1111-4444-8888-123456789002');

-- Dumping structure for table businessplatformdb.products
CREATE TABLE IF NOT EXISTS `products` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Name` varchar(150) NOT NULL,
  `SKU` varchar(50) NOT NULL,
  `Barcode` varchar(100) DEFAULT NULL,
  `Description` varchar(1000) DEFAULT NULL,
  `CategoryId` char(36) CHARACTER SET ascii NOT NULL,
  `CostPrice` decimal(18,2) NOT NULL,
  `SellingPrice` decimal(18,2) NOT NULL,
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Products_SKU` (`SKU`),
  KEY `IX_Products_CategoryId` (`CategoryId`),
  CONSTRAINT `FK_Products_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.products: ~1 rows (approximately)
INSERT INTO `products` (`Id`, `Name`, `SKU`, `Barcode`, `Description`, `CategoryId`, `CostPrice`, `SellingPrice`, `CreatedBy`, `CreatedAt`, `UpdatedBy`, `UpdatedAt`, `IsActive`) VALUES
	('61e5133f-b7fd-4af4-b913-ce623c3a975b', 'a1', 'dfdfe', 'dffd332', 'dffdsffdfdfsfdfdd', 'e2bcce34-7e45-40ac-aa81-94fb2e96c60b', 120.00, 1400.00, NULL, '2026-07-26 08:05:44.145647', NULL, NULL, 1);

-- Dumping structure for table businessplatformdb.refreshtokens
CREATE TABLE IF NOT EXISTS `refreshtokens` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Token` longtext NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `IsRevoked` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UserId` char(36) CHARACTER SET ascii NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_RefreshTokens_UserId` (`UserId`),
  CONSTRAINT `FK_RefreshTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.refreshtokens: ~9 rows (approximately)
INSERT INTO `refreshtokens` (`Id`, `Token`, `ExpiresAt`, `IsRevoked`, `CreatedAt`, `UserId`) VALUES
	('2bec4e7e-13f7-4618-8298-753564ffa5e1', 'ec9ca36a-37d5-44e3-801f-b794957cf77f', '2026-09-03 08:13:20.824552', 1, '2026-08-27 08:13:20.824553', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('69add6f1-2779-435f-959c-5e58dc600efb', 'bb318a38-d388-4fbb-b836-4a5660c9a840', '2026-09-09 12:14:45.194115', 0, '2026-09-02 12:14:45.194148', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('6bb99bc1-36d3-4e08-ae0d-8081db72324e', '62ec154e-204e-45da-8b22-2e4089316c48', '2026-09-03 08:09:06.767603', 1, '2026-08-27 08:09:06.767604', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('721ee7ba-e41f-4a4f-a58e-a212bdd3e3b4', '9a255069-2bd6-4c8d-947a-70904f32d0d7', '2026-09-10 09:14:48.009942', 0, '2026-09-03 09:14:48.009943', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('a16073bd-66d7-470b-94b6-3d9a13c51ace', '04a89aca-5fc1-48ae-ac69-57764f3b9229', '2026-09-03 08:02:51.537766', 0, '2026-08-27 08:02:51.537766', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('aaea7de6-2752-4075-83b5-c9ca0e56cbf5', '33b58acd-a01d-437a-8f52-b27c27b6c285', '2026-09-10 09:07:19.892243', 0, '2026-09-03 09:07:19.892278', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('b361e0e0-6121-4d6f-ba9f-7a43dc7259de', '7d32a387-7983-4e45-8d46-00460ace41e3', '2026-09-03 08:07:14.030820', 0, '2026-08-27 08:07:14.030853', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('cde15965-6300-40a2-8448-46bdcd6149c9', 'a40a7b48-751f-4688-9ae1-48ebad2380cb', '2026-09-10 09:16:21.562254', 0, '2026-09-03 09:16:21.562254', 'ad9e307a-1a23-473b-a501-9b39a49205d1'),
	('dee5bc70-4d97-4e33-a04e-41dbeef60145', '0323ff8d-0016-45c8-8ac6-16d74f3589cd', '2026-09-03 08:26:04.575936', 0, '2026-08-27 08:26:04.575972', 'ad9e307a-1a23-473b-a501-9b39a49205d1');

-- Dumping structure for table businessplatformdb.rolepermissions
CREATE TABLE IF NOT EXISTS `rolepermissions` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `RoleId` char(36) CHARACTER SET ascii NOT NULL,
  `PermissionId` char(36) CHARACTER SET ascii NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_RolePermissions_PermissionId` (`PermissionId`),
  KEY `IX_RolePermissions_RoleId` (`RoleId`),
  CONSTRAINT `FK_RolePermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `permissions` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_RolePermissions_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.rolepermissions: ~6 rows (approximately)
INSERT INTO `rolepermissions` (`Id`, `RoleId`, `PermissionId`) VALUES
	('c5e0e03f-6bb9-11f1-b372-84699368342a', '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '11111111-aaaa-4444-bbbb-000000000001'),
	('c5e0e682-6bb9-11f1-b372-84699368342a', '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '11111111-aaaa-4444-bbbb-000000000002'),
	('c5e0e75c-6bb9-11f1-b372-84699368342a', '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '11111111-aaaa-4444-bbbb-000000000003'),
	('c5e0e829-6bb9-11f1-b372-84699368342a', '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '11111111-aaaa-4444-bbbb-000000000004'),
	('d23e823c-6bb9-11f1-b372-84699368342a', '52a4e9d3-8b77-45b0-9c21-7e6f4a2d8b90', '11111111-aaaa-4444-bbbb-000000000001'),
	('d23e845a-6bb9-11f1-b372-84699368342a', '52a4e9d3-8b77-45b0-9c21-7e6f4a2d8b90', '11111111-aaaa-4444-bbbb-000000000004');

-- Dumping structure for table businessplatformdb.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.roles: ~3 rows (approximately)
INSERT INTO `roles` (`Id`, `Name`, `Description`) VALUES
	('398f5dfb-2176-4ae6-ae43-9eb8da29ac9d', 'Manager', 'Main head '),
	('52a4e9d3-8b77-45b0-9c21-7e6f4a2d8b90', 'Employee', 'Normal employee access'),
	('8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', 'Admin', 'Full system access');

-- Dumping structure for table businessplatformdb.saleitems
CREATE TABLE IF NOT EXISTS `saleitems` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `SaleId` char(36) CHARACTER SET ascii NOT NULL,
  `ProductId` char(36) CHARACTER SET ascii NOT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  `Discount` decimal(18,2) NOT NULL,
  `Tax` decimal(18,2) NOT NULL,
  `Total` decimal(18,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_SaleItems_ProductId` (`ProductId`),
  KEY `IX_SaleItems_SaleId` (`SaleId`),
  CONSTRAINT `FK_SaleItems_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`),
  CONSTRAINT `FK_SaleItems_Sales_SaleId` FOREIGN KEY (`SaleId`) REFERENCES `sales` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.saleitems: ~1 rows (approximately)
INSERT INTO `saleitems` (`Id`, `SaleId`, `ProductId`, `Quantity`, `UnitPrice`, `Discount`, `Tax`, `Total`) VALUES
	('0e507aaf-f9f0-4ff0-88bf-9e3bc7bae09b', '4c0ecaf9-2bfb-4105-a8e7-8c2e33fca1c4', '61e5133f-b7fd-4af4-b913-ce623c3a975b', 2, 1400.00, 50.00, 0.00, 2750.00);

-- Dumping structure for table businessplatformdb.salereturnitems
CREATE TABLE IF NOT EXISTS `salereturnitems` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `SaleReturnId` char(36) CHARACTER SET ascii NOT NULL,
  `ProductId` char(36) CHARACTER SET ascii NOT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  `Total` decimal(18,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_SaleReturnItems_ProductId` (`ProductId`),
  KEY `IX_SaleReturnItems_SaleReturnId` (`SaleReturnId`),
  CONSTRAINT `FK_SaleReturnItems_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`),
  CONSTRAINT `FK_SaleReturnItems_SaleReturns_SaleReturnId` FOREIGN KEY (`SaleReturnId`) REFERENCES `salereturns` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.salereturnitems: ~0 rows (approximately)

-- Dumping structure for table businessplatformdb.salereturns
CREATE TABLE IF NOT EXISTS `salereturns` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `SaleId` char(36) CHARACTER SET ascii NOT NULL,
  `ReturnNumber` varchar(50) NOT NULL,
  `ReturnDate` datetime(6) NOT NULL,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` int(11) NOT NULL,
  `Reason` varchar(500) DEFAULT NULL,
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_SaleReturns_ReturnNumber` (`ReturnNumber`),
  KEY `IX_SaleReturns_SaleId` (`SaleId`),
  CONSTRAINT `FK_SaleReturns_Sales_SaleId` FOREIGN KEY (`SaleId`) REFERENCES `sales` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.salereturns: ~0 rows (approximately)

-- Dumping structure for table businessplatformdb.sales
CREATE TABLE IF NOT EXISTS `sales` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `InvoiceNumber` varchar(50) NOT NULL,
  `CustomerId` char(36) CHARACTER SET ascii NOT NULL,
  `SaleDate` datetime(6) NOT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `Discount` decimal(18,2) NOT NULL,
  `Tax` decimal(18,2) NOT NULL,
  `GrandTotal` decimal(18,2) NOT NULL,
  `PaymentStatus` int(11) NOT NULL,
  `Remarks` varchar(500) DEFAULT NULL,
  `CreatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `UpdatedBy` char(36) CHARACTER SET ascii DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `Status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Sales_InvoiceNumber` (`InvoiceNumber`),
  KEY `IX_Sales_CustomerId` (`CustomerId`),
  CONSTRAINT `FK_Sales_Customers_CustomerId` FOREIGN KEY (`CustomerId`) REFERENCES `customers` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.sales: ~1 rows (approximately)
INSERT INTO `sales` (`Id`, `InvoiceNumber`, `CustomerId`, `SaleDate`, `SubTotal`, `Discount`, `Tax`, `GrandTotal`, `PaymentStatus`, `Remarks`, `CreatedBy`, `UpdatedBy`, `CreatedAt`, `UpdatedAt`, `Status`) VALUES
	('4c0ecaf9-2bfb-4105-a8e7-8c2e33fca1c4', 'INV-20260815193820-80FCBD', '7c28829d-792c-4d60-bec8-971e90c9877d', '2026-08-15 19:38:20.910511', 2750.00, 100.00, 180.00, 2830.00, 3, 'Regular customer', NULL, NULL, '2026-08-15 19:38:20.910512', NULL, 0);

-- Dumping structure for table businessplatformdb.users
CREATE TABLE IF NOT EXISTS `users` (
  `Id` char(36) CHARACTER SET ascii NOT NULL,
  `UserName` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `PasswordHash` longtext NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `RoleId` char(36) CHARACTER SET ascii NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Users_RoleId` (`RoleId`),
  CONSTRAINT `FK_Users_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.users: ~2 rows (approximately)
INSERT INTO `users` (`Id`, `UserName`, `Email`, `PasswordHash`, `IsActive`, `RoleId`, `CreatedAt`) VALUES
	('ad9e307a-1a23-473b-a501-9b39a49205d1', 'admin_test', 'admin.test@businessplatform.com', '$2a$11$E9Sztw2HKw3FN7yha6zpVurs1fqy78F3GeP9hDGgN74BJjEtPdr/O', 1, '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '2026-08-22 11:17:24.166409'),
	('d9c27d4e-3dec-4265-b73a-0efb4a91193f', 'admin', 'admin@business.com', '$2a$11$yWkTVXuN8ehEJCbqyRaD2OXmyuCuIuwqIy2szyF13i30pb1O/LwsK', 1, '8f3c7d91-4b26-4f62-9e88-6c2a3d1f5b72', '2026-06-19 07:19:43.855072');

-- Dumping structure for table businessplatformdb.__efmigrationshistory
CREATE TABLE IF NOT EXISTS `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table businessplatformdb.__efmigrationshistory: ~8 rows (approximately)
INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
	('20260618075758_InitialCreate', '8.0.26'),
	('20260619075055_AddRefreshToken', '8.0.26'),
	('20260619084258_FixRefreshTokenConfiguration', '8.0.26'),
	('20260714092255_AddProductModule', '8.0.26'),
	('20260726095027_AddCustomer', '8.0.26'),
	('20260727185753_AddSalesModule', '8.0.26'),
	('20260819114306_AddSaleStatus', '8.0.26'),
	('20260819183532_AddSaleReturns', '8.0.26');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
