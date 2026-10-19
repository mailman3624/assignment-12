const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/prisma');

// Register
router.post('/register', async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // get duplicate username or email user
        const getUser = await prisma.user.findMany({
            where: {
                OR: [
                    { userName: userName },
                    { email: email }
                ]
            }
        });

        if (getUser.length > 0) {
            return res.status(409).json({ message: "Duplicate Username or Email" });
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    userName: userName,
                    email: email,
                    password: hashPassword,
                    role: 'user'
                }
            });
            return res.status(201).json({ message: 'User created successfully', user: newUser });
        }
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        let getUser = await prisma.user.findMany({
            where: { userName: userName }
        });

        // Allow 'admin' or 'John' convenience login for 'John, Doe'
        if (getUser.length === 0 && (userName === 'admin' || userName === 'John')) {
            getUser = await prisma.user.findMany({
                where: { userName: 'John, Doe' }
            });
        }

        if (getUser.length === 0) {
            return res.status(404).json({ message: "Unknown Username" });
        } else {
            const isMatch = await bcrypt.compare(password, getUser[0].password);
            if (!isMatch) {
                return res.status(404).json({ message: "Password Incorrect" });
            } else {
                const token = jwt.sign(
                    {
                        userId: getUser[0].userId,
                        userName: getUser[0].userName,
                        role: getUser[0].role
                    },
                    process.env.JWT_KEY || 'jwt-secret-key',
                    { expiresIn: '1h' }
                );
                return res.status(200).json({
                    message: "Login Success",
                    token: token,
                    user: {
                        userId: getUser[0].userId,
                        userName: getUser[0].userName,
                        email: getUser[0].email,
                        role: getUser[0].role
                    }
                });
            }
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: "no token provide" });
        }
        const token = authHeader.split(' ')[1];
        if (!token || token === "null" || token === "undefined") {
            return res.status(403).json({ message: "no token provide" });
        } else {
            const decode = jwt.verify(token, process.env.JWT_KEY || 'jwt-secret-key');
            req.userId = decode.userId;
            req.userName = decode.userName;
            next();
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Protected Home route
router.get('/home', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const getUser = await prisma.user.findMany({
            where: userId ? { userId: Number(userId) } : { userName: req.userName },
        });
        if (getUser.length === 0) {
            return res.status(404).json({ message: "User not exist" });
        }
        return res.status(200).json({ user: getUser });
    } catch (err) {
        return res.status(500).json({ message: "server error" });
    }
});

// Get all users (for Admin mode User management)
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                userId: true,
                userName: true,
                email: true,
                role: true
            },
            orderBy: {
                userName: 'asc'
            }
        });
        return res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ message: "server error" });
    }
});

// Update user role (for Admin mode User management)
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ message: "Invalid role" });
        }

        const isNumericId = !isNaN(Number(id));
        const updatedUser = await prisma.user.update({
            where: isNumericId ? { userId: Number(id) } : { userName: id },
            data: { role },
            select: {
                userId: true,
                userName: true,
                email: true,
                role: true
            }
        });
        return res.status(200).json({ message: "Role updated successfully", user: updatedUser });
    } catch (err) {
        console.error('Error updating user role:', err);
        return res.status(500).json({ message: "server error" });
    }
});

module.exports = router;
