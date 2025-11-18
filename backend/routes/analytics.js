const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// GET /api/analytics/waste - Get waste analytics data
router.get('/waste', (req, res) => {
    const query = `
        SELECT
            m.name as menu_item,
            a.date,
            a.ordered_quantity,
            a.prepared_quantity,
            a.wasted_quantity,
            ROUND((a.wasted_quantity * 1.0 / a.prepared_quantity) * 100, 2) as waste_percentage
        FROM analytics a
        LEFT JOIN menus m ON a.menu_item_id = m.id
        ORDER BY a.date DESC, m.name
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ analytics: rows });
    });
});

// GET /api/analytics/summary - Get analytics summary
router.get('/summary', (req, res) => {
    const query = `
        SELECT
            SUM(ordered_quantity) as total_ordered,
            SUM(prepared_quantity) as total_prepared,
            SUM(wasted_quantity) as total_wasted,
            ROUND(AVG((wasted_quantity * 1.0 / prepared_quantity) * 100), 2) as avg_waste_percentage
        FROM analytics
        WHERE prepared_quantity > 0
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ summary: row });
    });
});

// POST /api/analytics/record - Record analytics data
router.post('/record', (req, res) => {
    const { menu_item_id, date, ordered_quantity, prepared_quantity, wasted_quantity } = req.body;

    if (!menu_item_id || !date) {
        return res.status(400).json({ error: 'Menu item ID and date are required' });
    }

    // Check if record already exists for this date and menu item
    db.get('SELECT id FROM analytics WHERE menu_item_id = ? AND date = ?', [menu_item_id, date], (err, existing) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existing) {
            // Update existing record
            db.run(
                'UPDATE analytics SET ordered_quantity = ?, prepared_quantity = ?, wasted_quantity = ? WHERE id = ?',
                [ordered_quantity || 0, prepared_quantity || 0, wasted_quantity || 0, existing.id],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: updateErr.message });
                    }
                    res.json({ message: 'Analytics record updated successfully' });
                }
            );
        } else {
            // Insert new record
            db.run(
                'INSERT INTO analytics (menu_item_id, date, ordered_quantity, prepared_quantity, wasted_quantity) VALUES (?, ?, ?, ?, ?)',
                [menu_item_id, date, ordered_quantity || 0, prepared_quantity || 0, wasted_quantity || 0],
                (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({ error: insertErr.message });
                    }
                    res.json({ message: 'Analytics record created successfully' });
                }
            );
        }
    });
});

// GET /api/analytics/menu/:menuItemId - Get analytics for specific menu item
router.get('/menu/:menuItemId', (req, res) => {
    const { menuItemId } = req.params;
    const query = `
        SELECT * FROM analytics
        WHERE menu_item_id = ?
        ORDER BY date DESC
    `;

    db.all(query, [menuItemId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ analytics: rows });
    });
});

module.exports = router;
