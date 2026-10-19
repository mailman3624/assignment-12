const express = require('express');
const cors = require('cors');
const authenRoutes = require('../routes/authen');
const menuRoutes = require('./routes/menuRoutes');
const typeRoutes = require('./routes/typeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Mounting
app.use('/authen', authenRoutes);
app.use('/api/authen', authenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/menu', menuRoutes);
app.use('/api/type', typeRoutes);
app.use('/type', typeRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
