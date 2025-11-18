const db = require('../../database/db');
const crypto = require('crypto');

class Token {
    // Generate unique token number
    static generateTokenNumber() {
        return 'TK' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    // Get all tokens
    static getAll(callback) {
        const query = `
            SELECT t.*, o.student_name, o.status as order_status
            FROM tokens t
            LEFT JOIN orders o ON t.order_id = o.id
            ORDER BY t.created_at DESC
        `;
        db.all(query, [], callback);
    }

    // Get token by ID
    static getById(id, callback) {
        const query = `
            SELECT t.*, o.student_name, o.status as order_status
            FROM tokens t
            LEFT JOIN orders o ON t.order_id = o.id
            WHERE t.id = ?
        `;
        db.get(query, [id], callback);
    }

    // Get token by token number
    static getByTokenNumber(tokenNumber, callback) {
        const query = `
            SELECT t.*, o.student_name, o.status as order_status
            FROM tokens t
            LEFT JOIN orders o ON t.order_id = o.id
            WHERE t.token_number = ?
        `;
        db.get(query, [tokenNumber], callback);
    }

    // Get tokens by order ID
    static getByOrderId(orderId, callback) {
        db.all('SELECT * FROM tokens WHERE order_id = ? ORDER BY created_at DESC', [orderId], callback);
    }

    // Create new token for order
    static create(orderId, callback) {
        const tokenNumber = this.generateTokenNumber();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2); // Token expires in 2 hours

        db.run(
            'INSERT INTO tokens (order_id, token_number, expires_at) VALUES (?, ?, ?)',
            [orderId, tokenNumber, expiresAt.toISOString()],
            function(err) {
                callback(err, {
                    id: this.lastID,
                    order_id: orderId,
                    token_number: tokenNumber,
                    expires_at: expiresAt.toISOString()
                });
            }
        );
    }

    // Update token status
    static updateStatus(id, status, callback) {
        db.run(
            'UPDATE tokens SET status = ? WHERE id = ?',
            [status, id],
            callback
        );
    }

    // Mark token as used
    static markAsUsed(tokenNumber, callback) {
        db.run(
            'UPDATE tokens SET status = "used" WHERE token_number = ?',
            [tokenNumber],
            callback
        );
    }

    // Delete token
    static delete(id, callback) {
        db.run('DELETE FROM tokens WHERE id = ?', [id], callback);
    }
}

module.exports = Token;
