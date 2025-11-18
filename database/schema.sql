-- Database schema for Eco-Friendly Smart Food Ordering for Canteens

-- Menu items table
CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    student_name TEXT,
    menu_item_id INTEGER,
    quantity INTEGER DEFAULT 1,
    total_price REAL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, ready, completed
    pickup_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menus(id)
);

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    token_number TEXT UNIQUE NOT NULL,
    qr_code TEXT,
    status TEXT DEFAULT 'active', -- active, used, expired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Analytics table for waste tracking
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER,
    date DATE,
    ordered_quantity INTEGER DEFAULT 0,
    prepared_quantity INTEGER DEFAULT 0,
    wasted_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menus(id)
);

-- Insert sample menu data
INSERT OR IGNORE INTO menus (name, description, price, category) VALUES
('Vegetable Biryani', 'Rice dish with mixed vegetables', 50.0, 'Main Course'),
('Chicken Curry', 'Spicy chicken curry with rice', 70.0, 'Main Course'),
('Paneer Tikka', 'Grilled paneer with spices', 60.0, 'Appetizer'),
('Dal Tadka', 'Lentil curry with spices', 40.0, 'Main Course'),
('Mixed Salad', 'Fresh vegetable salad', 30.0, 'Side Dish'),
('Fruit Juice', 'Fresh orange juice', 25.0, 'Beverage');
