const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabaseIfNeeded() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const dbName = process.env.DB_NAME || 'myshop';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.query(`USE \`${dbName}\`;`);

        // Create tables if they do not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user (
                userId INT AUTO_INCREMENT PRIMARY KEY,
                userName VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(50) NOT NULL,
                password VARCHAR(100) NOT NULL,
                role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
            );

            CREATE TABLE IF NOT EXISTS type (
                typeId INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS menu (
                menuId INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price INT NOT NULL,
                isBestSeller BOOLEAN NOT NULL DEFAULT FALSE,
                typeId INT DEFAULT 1,
                INDEX type_idx (typeId),
                CONSTRAINT fk_menu_type FOREIGN KEY (typeId) REFERENCES type(typeId) ON DELETE RESTRICT ON UPDATE CASCADE
            );

            CREATE TABLE IF NOT EXISTS rating (
                ratingId INT AUTO_INCREMENT PRIMARY KEY,
                menuId INT NOT NULL,
                userId INT NULL,
                score DOUBLE NOT NULL,
                INDEX rating_menu_idx (menuId),
                INDEX rating_user_idx (userId),
                CONSTRAINT fk_rating_menu FOREIGN KEY (menuId) REFERENCES menu(menuId) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_rating_user FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE SET NULL ON UPDATE CASCADE
            );
        `);

        const [types] = await connection.query('SELECT COUNT(*) AS cnt FROM type');
        if (types[0].cnt === 0) {
            await connection.query(`
                INSERT INTO type (name) VALUES
                ('Bakery'),
                ('Beverage'),
                ('Dessert'),
                ('Main Dish');
            `);
        }

        const [menus] = await connection.query('SELECT COUNT(*) AS cnt FROM menu');
        if (menus[0].cnt === 0) {
            await connection.query(`
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
            `);
        }

        const [users] = await connection.query('SELECT COUNT(*) AS cnt FROM user');
        if (users[0].cnt === 0) {
            const defaultPassword = await bcrypt.hash('1234', 10);
            const seedUsers = [
                ['John, Doe', 'John@gmail.com', defaultPassword, 'admin'],
                ['Ann', 'Ann@gmail.com', defaultPassword, 'user'],
                ['Bob', 'Bob@gmail.com', defaultPassword, 'user'],
                ['Cate', 'Cate@gmail.com', defaultPassword, 'user'],
                ['Danny', 'Danny@gmail.com', defaultPassword, 'user'],
            ];
            for (const [userName, email, password, role] of seedUsers) {
                await connection.execute(
                    'INSERT INTO user (userName, email, password, role) VALUES (?, ?, ?, ?)',
                    [userName, email, password, role]
                );
            }
        }
    } catch (err) {
        console.warn('Database auto-init warning:', err.message);
    } finally {
        if (connection) {
            await connection.end().catch(() => {});
        }
    }
}

module.exports = initDatabaseIfNeeded;
