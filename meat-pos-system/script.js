
// --- Data Initializer ---
const defaultProducts = [
    { id: 1, name: "لحم حاشي بلدي", price: 18000, category: "meat", image: "images/meat.png" },
    { id: 2, name: "لحم نعيمي", price: 22000, category: "meat", image: "images/meat.png" },
    { id: 3, name: "لحم عجل طازج", price: 16000, category: "meat", image: "images/meat.png" },
    { id: 4, name: "دجاج كامل (900غ)", price: 4500, category: "chicken", image: "images/chicken.png" },
    { id: 5, name: "صدور دجاج", price: 7500, category: "chicken", image: "images/chicken.png" },
    { id: 6, name: "سمك هامور", price: 25000, category: "fish", image: "images/fish.png" },
    { id: 7, name: "سمك شعري", price: 12000, category: "fish", image: "images/fish.png" },
    { id: 8, name: "روبيان وسط", price: 15000, category: "fish", image: "images/fish.png" }
];

// --- State Management ---
// Using v3 to ensure we ignore any broken previous state
const STORAGE_KEY = 'pos_products_v3';
let products = [];
let cart = [];
let editingProductId = null;

function initData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            products = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Storage error", e);
    }

    // Safety fallback
    if (!products || products.length === 0) {
        products = [...defaultProducts]; // Copy defaults
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- DOM Elements ---
const grid = document.getElementById('products-grid');
const cartContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');

// --- Helper Functions ---
function formatMoney(amount) {
    return amount.toLocaleString('en-US') + ' د.ع';
}

// --- Core Logic ---
function renderProducts(filter = 'all') {
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">لا توجد منتجات</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // Add onerror fallback for image
        const imgPath = product.image || 'images/meat.png'; // Fallback

        card.onclick = (e) => {
            if (!e.target.closest('.edit-btn')) {
                addToCart(product.id);
            }
        };

        card.innerHTML = `
            <button class="edit-btn" onclick="openEditModal(${product.id})"><i class="fas fa-pen"></i></button>
            <div class="img-wrapper">
                <img src="${imgPath}" class="product-img" onerror="this.style.display='none'">
            </div>
            <div class="product-info">
                <span class="product-name">${product.name}</span>
                <span class="product-price">${formatMoney(product.price)} / كجم</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.weight += 1;
    } else {
        cart.push({ ...product, weight: 1 });
    }
    renderCart();
}

function updateWeight(productId, newWeight) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        let val = parseFloat(newWeight);
        if (isNaN(val) || val <= 0) {
            removeFromCart(productId);
        } else {
            item.weight = val;
            renderCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function renderCart() {
    if (!cartContainer) return;
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-msg">
                <i class="fas fa-shopping-basket"></i>
                <p>ابدأ بمسح المنتجات</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.weight;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-meta">${formatMoney(item.price)} x ${item.weight} كجم</div>
                </div>
                <div class="item-right">
                    <div class="item-total">${formatMoney(itemTotal)}</div>
                    <div class="item-actions">
                        <button class="qty-btn" onclick="updateWeight(${item.id}, ${item.weight - 0.5})">-</button>
                        <button class="qty-btn" onclick="updateWeight(${item.id}, ${item.weight + 0.5})">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(div);
        });
    }

    if (totalPriceEl) totalPriceEl.innerText = formatMoney(total);
}

// --- Filtering ---
function filterCategory(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(cat === 'meat' ? 'لحوم' : cat === 'chicken' ? 'دواجن' : cat === 'fish' ? 'أسماك' : 'الكل')) {
            btn.classList.add('active');
        }
    });
    // Fallback UI update
    renderProducts(cat);
}

// --- Modal & Pricing ---
function openEditModal(productId) {
    editingProductId = productId;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('edit-modal');
    modal.classList.add('active');
    document.getElementById('modal-product-name').innerText = product.name;
    document.getElementById('new-price-input').value = product.price;
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

function saveNewPrice() {
    const input = document.getElementById('new-price-input');
    const newPrice = parseFloat(input.value);

    if (newPrice && newPrice > 0 && editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            product.price = newPrice;
            saveData();
            renderProducts();
            renderCart();
            closeModal();
        }
    }
}

// --- Printing ---
function printReceipt() {
    if (cart.length === 0) return alert("الفاتورة فارغة!");

    const tbody = document.getElementById('print-items');
    tbody.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.weight;
        total += itemTotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.weight}</td>
                <td>${formatMoney(itemTotal)}</td>
            </tr>
        `;
    });

    document.getElementById('print-total').innerText = formatMoney(total);
    document.getElementById('print-date').innerText = new Date().toLocaleDateString('ar-IQ');
    document.getElementById('print-order-id').innerText = '#' + Math.floor(Math.random() * 10000);

    const customer = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;

    document.getElementById('print-customer-name').innerText = customer || "زبون عام";
    document.getElementById('print-customer-phone').innerText = phone || "";

    window.print();
}

// --- Boot ---
window.onload = function () {
    initData();
    renderProducts();
};
