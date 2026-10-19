const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Route search (put before /:id)
router.get('/search', menuController.searchMenus);

// Routes CRUD & Rating
router.get('/', menuController.getMenus);           // getAll (+ ?keyword=)
router.get('/:id', menuController.getMenuById);     // getById
router.post('/', menuController.createMenu);        // Create
router.put('/:id', menuController.updateMenu);      // Update
router.delete('/:id', menuController.deleteMenu);   // Delete
router.post('/:id/rate', menuController.rateMenu);  // Rate menu
router.put('/:id/rate', menuController.rateMenu);   // Rate menu (PUT alias)

module.exports = router;
