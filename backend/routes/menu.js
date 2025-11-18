const express = require('express');
const router = express.Router();
const Menu = require('../models/menu');

// GET /api/menu - Get all menu items
router.get('/', (req, res) => {
    Menu.getAll((err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ menus: rows });
    });
});

// GET /api/menu/:id - Get menu item by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Menu.getById(id, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ menu: row });
    });
});

// GET /api/menu/category/:category - Get menu items by category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    Menu.getByCategory(category, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ menus: rows });
    });
});

// POST /api/menu - Create new menu item
router.post('/', (req, res) => {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    Menu.create(req.body, (err, menu) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ menu });
    });
});

// PUT /api/menu/:id - Update menu item
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    Menu.update(id, req.body, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Menu item updated successfully' });
    });
});

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    Menu.delete(id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Menu item deleted successfully' });
    });
});

module.exports = router;
