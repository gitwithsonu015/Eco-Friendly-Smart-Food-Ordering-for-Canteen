// Eco-Friendly Canteen App JavaScript

const API_BASE = 'http://localhost:3000/api';

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');

    // Load page-specific data
    switch(pageName) {
        case 'menu':
            loadMenu();
            break;
        case 'order':
            loadMenuForOrder();
            loadOrderHistory();
            break;
        case 'dashboard':
            loadAnalytics();
            break;
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.className = `toast bg-${type}`;

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showToast('Error: ' + error.message, 'danger');
        throw error;
    }
}

// Menu functions
async function loadMenu() {
    try {
        const data = await apiRequest('/menu');
        displayMenu(data.menus);
    } catch (error) {
        console.error('Failed to load menu:', error);
    }
}

function displayMenu(menus) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    if (menus.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">No menu items available</div></div>';
        return;
    }

    menus.forEach(menu => {
        const menuCard = `
            <div class="col-md-4 mb-4">
                <div class="card menu-card menu-item">
                    <div class="card-body">
                        <h5 class="card-title">${menu.name}</h5>
                        <p class="card-text">${menu.description || 'No description available'}</p>
                        <div class="menu-price">₹${menu.price}</div>
                        <small class="text-muted">${menu.category}</small>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', menuCard);
    });
}

// Order functions
async function loadMenuForOrder() {
    try {
        const data = await apiRequest('/menu');
        const select = document.getElementById('menu-item');
        select.innerHTML = '<option value="">Select a menu item</option>';

        data.menus.forEach(menu => {
            const option = document.createElement('option');
            option.value = menu.id;
            option.textContent = `${menu.name} - ₹${menu.price}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load menu for order:', error);
    }
}

async function loadOrderHistory() {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    try {
        const data = await apiRequest(`/orders/student/${studentId}`);
        displayOrderHistory(data.orders);
    } catch (error) {
        console.error('Failed to load order history:', error);
    }
}

function displayOrderHistory(orders) {
    const container = document.getElementById('order-history');
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No orders found</div>';
        return;
    }

    orders.slice(0, 5).forEach(order => {
        const orderItem = `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${order.menu_item_name}</h6>
                    <small class="text-muted">${new Date(order.created_at).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Quantity: ${order.quantity} | Total: ₹${order.total_price}</p>
                <small class="status-badge status-${order.status}">${order.status}</small>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', orderItem);
    });
}

// Order form submission
document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        student_id: document.getElementById('student-id').value,
        student_name: document.getElementById('student-name').value,
        menu_item_id: parseInt(document.getElementById('menu-item').value),
        quantity: parseInt(document.getElementById('quantity').value),
        pickup_time: document.getElementById('pickup-time').value
    };

    try {
        const data = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        showToast('Order placed successfully! Token: ' + data.token.token_number, 'success');

        // Store student ID for future use
        localStorage.setItem('studentId', formData.student_id);

        // Reset form
        e.target.reset();

        // Reload order history
        loadOrderHistory();

    } catch (error) {
        console.error('Failed to place order:', error);
    }
});

// Token functions
async function checkToken() {
    const tokenNumber = document.getElementById('token-number').value.trim();
    if (!tokenNumber) {
        showToast('Please enter a token number', 'warning');
        return;
    }

    try {
        const data = await apiRequest(`/tokens/number/${tokenNumber}`);
        displayToken(data.token);
    } catch (error) {
        console.error('Failed to check token:', error);
        document.getElementById('token-display').classList.add('d-none');
    }
}

function displayToken(token) {
    const container = document.getElementById('token-display');
    const details = document.getElementById('token-details');

    details.innerHTML = `
        <div class="token-card p-4 mb-3">
            <div class="token-number mb-3">${token.token_number}</div>
            <div class="mb-2">Order ID: ${token.order_id}</div>
            <div class="mb-2">Student: ${token.student_name}</div>
            <div class="mb-2">Expires: ${new Date(token.expires_at).toLocaleString()}</div>
            <div class="status-badge token-status-${token.status}">${token.status}</div>
        </div>
        <div class="text-center">
            <small class="text-muted">Show this token at the canteen counter</small>
        </div>
    `;

    container.classList.remove('d-none');
}

// Analytics functions
async function loadAnalytics() {
    try {
        const summaryData = await apiRequest('/analytics/summary');
        const wasteData = await apiRequest('/analytics/waste');

        displayAnalyticsSummary(summaryData.summary);
        displayWasteChart(wasteData.analytics);
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

function displayAnalyticsSummary(summary) {
    const container = document.getElementById('waste-summary');

    if (!summary) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">No analytics data available</div></div>';
        return;
    }

    container.innerHTML = `
        <div class="col-md-3">
            <div class="analytics-card">
                <div class="stat-number">${summary.total_ordered || 0}</div>
                <div class="stat-label">Total Ordered</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-card">
                <div class="stat-number">${summary.total_prepared || 0}</div>
                <div class="stat-label">Total Prepared</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-card">
                <div class="stat-number">${summary.total_wasted || 0}</div>
                <div class="stat-label">Total Wasted</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-card">
                <div class="stat-number ${getWasteClass(summary.avg_waste_percentage)}">${summary.avg_waste_percentage || 0}%</div>
                <div class="stat-label">Avg Waste %</div>
            </div>
        </div>
    `;
}

function displayWasteChart(analytics) {
    const ctx = document.getElementById('wasteChart').getContext('2d');

    const labels = analytics.map(item => item.menu_item + ' (' + item.date + ')');
    const wasteData = analytics.map(item => item.waste_percentage);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Waste Percentage (%)',
                data: wasteData,
                backgroundColor: wasteData.map(percentage => getWasteColor(percentage)),
                borderColor: wasteData.map(percentage => getWasteColor(percentage)),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function getWasteClass(percentage) {
    if (percentage > 30) return 'waste-high';
    if (percentage > 15) return 'waste-medium';
    return 'waste-low';
}

function getWasteColor(percentage) {
    if (percentage > 30) return '#dc3545';
    if (percentage > 15) return '#ffc107';
    return '#28a745';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showPage('home');

    // Set default pickup time to next hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    document.getElementById('pickup-time').value = now.toISOString().slice(0, 16);
});
