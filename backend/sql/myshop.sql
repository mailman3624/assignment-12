CREATE DATABASE IF NOT EXISTS myshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myshop;

DROP TABLE IF EXISTS rating;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS type;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE type (
    typeId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE menu (
    menuId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    isBestSeller BOOLEAN NOT NULL DEFAULT FALSE,
    typeId INT DEFAULT 1,
    INDEX type_idx (typeId),
    CONSTRAINT fk_menu_type FOREIGN KEY (typeId) REFERENCES type(typeId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE rating (
    ratingId INT AUTO_INCREMENT PRIMARY KEY,
    menuId INT NOT NULL,
    userId INT NULL,
    score DOUBLE NOT NULL,
    INDEX rating_menu_idx (menuId),
    INDEX rating_user_idx (userId),
    CONSTRAINT fk_rating_menu FOREIGN KEY (menuId) REFERENCES menu(menuId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rating_user FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO type (name) VALUES
('Bakery'),
('Beverage'),
('Dessert'),
('Main Dish');

INSERT INTO menu (menuId, name, price, isBestSeller, typeId) VALUES
(1, 'cake', 35, TRUE, 1),
(2, 'bread', 25, FALSE, 1),
(3, 'milk', 15, TRUE, 2),
(4, 'donut', 45, FALSE, 1),
(5, 'cookie', 55, TRUE, 3);

INSERT INTO rating (menuId, score) VALUES
(1, 3.5),
(2, 4.5),
(3, 3.8),
(4, 4.2),
(5, 3.1);
