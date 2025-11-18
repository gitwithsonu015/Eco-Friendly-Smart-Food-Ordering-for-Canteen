const db = require('../../database/db');

class Order {
    // Get all orders
    static getAll(callback) {
        const query = `
            SELECT o.*, m.name as menu_item_name, m.price as menu_item_price
            FROM orders o
            LEFT JOIN menus m ON o.menu_item_id = m.id
            ORDER BY o.created_at DESC
        `;
        db.all(query, [], callback);
    }

    // Get order by ID
    static getById(id, callback) {
        const query = `
            SELECT o.*, m.name as menu_item_name, m.price as menu_item_price
            FROM orders o
            LEFT JOIN menus m ON o.menu_item_id = m.id
            WHERE o.id = ?
        `;
        db.get(query, [id], callback);
    }

    // Get orders by student ID
    static getByStudentId(studentId, callback) {
        const query = `
            SELECT o.*, m.name as menu_item_name, m.price as menu_item_price
            FROM orders o
            LEFT JOIN menus m ON o.menu_item_id = m.id
            WHERE o.student_id = ?
            ORDER BY o.created_at DESC
        `;
        db.all(query, [studentId], callback);
    }

    // Create new order
    static create(orderData, callback) {
        const { student_id, student_name, menu_item_id, quantity, pickup_time } = orderData;

        // Get menu item price
        db.get('SELECT price FROM menus WHERE id = ?', [menu_item_id], (err, menu) => {
            if (err) return callback(err);

            const total_price = menu.price * quantity;

            db.run(
                'INSERT INTO orders (student_id, student_name, menu_item_id, quantity, total_price, pickup_time) VALUES (?, ?, ?, ?, ?, ?)',
                [student_id, student_name, menu_item_id, quantity, total_price, pickup_time],
                function(err) {
                    callback(err, { id: this.lastID, ...orderData, total_price });
                }
            );
        });
    }

    // Update order status
    static updateStatus(id, status, callback) {
        db.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id],
            callback
        );
    }

    // Delete order
    static delete(id, callback) {
        db.run('DELETE FROM orders WHERE id = ?', [id], callback);
    }
}

module.exports = Order;
