const express = require('express');
const router = express.Router();
const Token = require('../models/token');

// GET /api/tokens - Get all tokens
router.get('/', (req, res) => {
    Token.getAll((err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tokens: rows });
    });
});

// GET /api/tokens/:id - Get token by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Token.getById(id, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.json({ token: row });
    });
});

// GET /api/tokens/number/:tokenNumber - Get token by token number
router.get('/number/:tokenNumber', (req, res) => {
    const { tokenNumber } = req.params;
    Token.getByTokenNumber(tokenNumber, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.json({ token: row });
    });
});

// GET /api/tokens/order/:orderId - Get tokens by order ID
router.get('/order/:orderId', (req, res) => {
    const { orderId } = req.params;
    Token.getByOrderId(orderId, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tokens: rows });
    });
});

// POST /api/tokens - Create new token for order
router.post('/', (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    Token.create(order_id, (err, token) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ token });
    });
});

// PUT /api/tokens/:id/status - Update token status
router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    Token.updateStatus(id, status, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Token status updated successfully' });
    });
});

// PUT /api/tokens/use/:tokenNumber - Mark token as used
router.put('/use/:tokenNumber', (req, res) => {
    const { tokenNumber } = req.params;

    Token.markAsUsed(tokenNumber, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Token marked as used successfully' });
    });
});

// DELETE /api/tokens/:id - Delete token
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    Token.delete(id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Token deleted successfully' });
    });
});

module.exports = router;
