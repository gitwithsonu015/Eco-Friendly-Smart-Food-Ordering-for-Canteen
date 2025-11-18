const db = require('../../database/db');

class Menu {
    // Get all menu items
    static getAll(callback) {
        db.all('SELECT * FROM menus WHERE available = 1 ORDER BY category, name', [], callback);
    }

    // Get menu item by ID
    static getById(id, callback) {
        db.get('SELECT * FROM menus WHERE id = ?', [id], callback);
    }

    // Add new menu item
    static create(menuData, callback) {
        const { name, description, price, category } = menuData;
        db.run(
            'INSERT INTO menus (name, description, price, category) VALUES (?, ?, ?, ?)',
            [name, description, price, category],
            function(err) {
                callback(err, { id: this.lastID, ...menuData });
            }
        );
    }

    // Update menu item
    static update(id, menuData, callback) {
        const { name, description, price, category, available } = menuData;
        db.run(
            'UPDATE menus SET name = ?, description = ?, price = ?, category = ?, available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, price, category, available, id],
            callback
        );
    }

    // Delete menu item
    static delete(id, callback) {
        db.run('DELETE FROM menus WHERE id = ?', [id], callback);
    }

    // Get menu items by category
    static getByCategory(category, callback) {
        db.all('SELECT * FROM menus WHERE category = ? AND available = 1 ORDER BY name', [category], callback);
    }
}

module.exports = Menu;
