-- MySQL database initialization script for SwiggyLite
-- Run this script against your MySQL instance before running the .NET API

CREATE DATABASE IF NOT EXISTS `swiggy_lite` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `swiggy_lite`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurants table
CREATE TABLE IF NOT EXISTS `restaurants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500),
    `image_url` VARCHAR(255) NOT NULL,
    `cuisine` VARCHAR(100) NOT NULL,
    `area` VARCHAR(100),
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `timings` VARCHAR(50),
    `is_delivery` TINYINT(1) NOT NULL DEFAULT 1,
    `delivery_time_minutes` INT NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu categories table
CREATE TABLE IF NOT EXISTS `menu_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `restaurant_id` INT NOT NULL,
    CONSTRAINT `fk_menu_categories_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu items table
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500),
    `price` DECIMAL(10,2) NOT NULL,
    `image_url` VARCHAR(255),
    `category` VARCHAR(50) NOT NULL,
    `spicy_level` VARCHAR(50),
    `size` VARCHAR(50),
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `menu_category_id` INT NOT NULL,
    `restaurant_id` INT NOT NULL,
    CONSTRAINT `fk_menu_items_category` FOREIGN KEY (`menu_category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_menu_items_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart items table
CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `menu_item_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cart_items_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT,
    UNIQUE KEY `uq_cart_user_item` (`user_id`, `menu_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `restaurant_id` INT NOT NULL,
    `delivery_address` VARCHAR(200) NOT NULL,
    `instructions` VARCHAR(50),
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `total_amount` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME,
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_orders_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `menu_item_id` INT NOT NULL,
    `item_name` VARCHAR(150) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data (optional - can be run after schema creation)
-- Insert sample users (password is BCrypt hashed 'Password123!')
-- INSERT INTO `users` (`email`, `password_hash`, `full_name`, `phone`, `is_admin`) VALUES
-- ('test@example.com', '$2a$11$...', 'Test User', '+1234567890', 0);
