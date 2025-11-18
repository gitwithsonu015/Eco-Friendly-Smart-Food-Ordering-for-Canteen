const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Token = require('../models/token');

// GET /api/orders - Get all orders
router.get('/', (req, res) => {
    Order.getAll((err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ orders: rows });
    });
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Order.getById(id, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ order: row });
    });
});

// GET /api/orders/student/:studentId - Get orders by student ID
router.get('/student/:studentId', (req, res) => {
    const { studentId } = req.params;
    Order.getByStudentId(studentId, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ orders: rows });
    });
});

// POST /api/orders - Create new order
router.post('/', (req, res) => {
    const { student_id, student_name, menu_item_id, quantity, pickup_time } = req.body;

    if (!student_id || !student_name || !menu_item_id || !quantity) {
        return res.status(400).json({ error: 'Student ID, name, menu item ID, and quantity are required' });
    }

    Order.create(req.body, (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Generate token for the order
        Token.create(order.id, (tokenErr, token) => {
            if (tokenErr) {
                console.error('Error creating token:', tokenErr);
                // Still return order even if token creation fails
                return res.status(201).json({ order, token: null });
            }
            res.status(201).json({ order, token });
        });
    });
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    Order.updateStatus(id, status, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Order status updated successfully' });
    });
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    Order.delete(id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Order deleted successfully' });
    });
});

module.exports = router;
