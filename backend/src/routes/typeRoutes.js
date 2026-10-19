const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');

// Route search (put before /:id)
router.get('/search', typeController.searchTypes);

// Routes CRUD
router.get('/', typeController.getTypes);           // getAll (+ ?keyword=)
router.get('/:id', typeController.getTypeById);     // getById
router.post('/', typeController.createType);        // Create
router.put('/:id', typeController.updateType);      // Update
router.delete('/:id', typeController.deleteType);   // Delete

module.exports = router;
