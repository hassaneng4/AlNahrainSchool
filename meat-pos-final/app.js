
const defaultData = {
    products: [
        { id: 1, name: "لحم حاشي بلدي", price: 18000, category: "meat", img: "images/meat.png", stock: 100 },
        { id: 2, name: "لحم نعيمي", price: 22000, category: "meat", img: "images/meat.png", stock: 50 },
        { id: 3, name: "لحم عجل طازج", price: 16000, category: "meat", img: "images/meat.png", stock: 30 },
        { id: 4, name: "دجاج البودي", price: 4500, category: "chicken", img: "images/chicken.png", stock: 200 },
        { id: 5, name: "دجاج الريان", price: 5000, category: "chicken", img: "images/chicken.png", stock: 150 },
        { id: 6, name: "دجاج البوادي", price: 4750, category: "chicken", img: "images/chicken.png", stock: 180 },
        { id: 7, name: "سمك مسكوف", price: 9000, category: "fish", img: "images/fish.png", stock: 40 },
        { id: 8, name: "ألبان (لبنة/روب)", price: 3000, category: "dairy", img: "images/dairy.png", stock: 50 },
        { id: 9, name: "مخللات مشكلة", price: 2000, category: "pantry", img: "https://placehold.co/200x150?text=Pickles", stock: 60 },
        { id: 10, name: "زيت زيتون (1 لتر)", price: 12000, category: "pantry", img: "https://placehold.co/200x150?text=Olive+Oil", stock: 30 }
    ],
    customers: [
        { id: 101, name: "علي احمد", phone: "07701234567", vip: true, totalSpent: 250000 },
        { id: 102, name: "محمد كريم", phone: "07901234567", vip: false, totalSpent: 45000 }
    ],
    transactions: [],
    settings: {
        shopName: "لحوم اليسر",
        address: "بغداد - الكرادة",
        phone: "07700000000",
        footer: "شكراً لزيارتكم - ألف عافية"
    }
};

const DB_VERSION = 'alyusr_v13';
let state = { products: [], customers: [], transactions: [], settings: {} };
let cart = [];
let mode = 'sale';
let editTargetId = null;

// SOUNDS
const beepCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(type = 'normal') {
    if (beepCtx.state === 'suspended') beepCtx.resume();
    const osc = beepCtx.createOscillator();
    const gain = beepCtx.createGain();
    osc.connect(gain);
    gain.connect(beepCtx.destination);

    if (type === 'success') {
        osc.frequency.value = 800; osc.type = 'sine'; gain.gain.setValueAtTime(0.1, beepCtx.currentTime); osc.start(); osc.stop(beepCtx.currentTime + 0.15);
        setTimeout(() => {
            const o2 = beepCtx.createOscillator(); const g2 = beepCtx.createGain(); o2.connect(g2); g2.connect(beepCtx.destination);
            o2.frequency.value = 1200; g2.gain.value = 0.1; o2.start(); o2.stop(beepCtx.currentTime + 0.2);
        }, 150);
    } else {
        osc.frequency.value = 400; osc.type = 'square'; gain.gain.setValueAtTime(0.05, beepCtx.currentTime); osc.start(); osc.stop(beepCtx.currentTime + 0.1);
    }
}

function init() {
    // Check Auth
    if (sessionStorage.getItem('auth') !== 'true') {
        document.getElementById('login-view').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-user').focus();
    } else {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    }

    const raw = localStorage.getItem(DB_VERSION);
    if (raw) {
        try { state = JSON.parse(raw); if (!state.settings) state.settings = defaultData.settings; } catch (e) { state = defaultData; }
    } else { state = defaultData; save(); }
    renderFor('all'); renderInventory(); renderCustomers(); renderReports(); loadSettingsUI();
}

function doLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    // Simple Hardcoded Auth
    if (u === 'admin' && p === 'admin') {
        sessionStorage.setItem('auth', 'true');
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        playBeep('success');
    } else {
        document.getElementById('login-error').style.display = 'block';
        playBeep('error');
    }
}

function doLogout() {
    sessionStorage.removeItem('auth');
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').style.display = 'none';
    window.location.reload();
}

function save() { localStorage.setItem(DB_VERSION, JSON.stringify(state)); renderInventory(); renderReports(); renderCustomers(); }
function fmt(n) { return n.toLocaleString('en-US'); }

// SHORTCUTS
document.addEventListener('keydown', (e) => {
    if (e.key === 'F9') { checkout(); e.preventDefault(); }
    if (e.key === 'F2') { document.getElementById('cust-name-input').focus(); e.preventDefault(); }
    if (e.key === 'F3') { document.getElementById('product-search').focus(); e.preventDefault(); }
    if (e.key === 'Delete' && e.shiftKey) { clearCart(); e.preventDefault(); }
});

function setMode(m) {
    mode = m; document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); document.getElementById('mode-' + m).classList.add('active');
    const header = document.getElementById('cart-header-bg');
    if (header) { if (m === 'return') header.classList.add('return-mode'); else header.classList.remove('return-mode'); }
    updateCartUI();
}
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active')); document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    const navs = ['pos', 'reports', 'inventory', 'customers', 'settings']; const idx = navs.indexOf(viewId);
    if (idx > -1) document.querySelectorAll('.nav-btn')[idx].classList.add('active');
}
function filterProducts(cat, btn) { document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderFor(cat); }
function searchProducts(query) {
    const grid = document.getElementById('grid'); grid.innerHTML = '';
    const term = query.toLowerCase();
    const items = state.products.filter(p => p.name.toLowerCase().includes(term) || p.id == term); // Search by Name OR ID
    if (items.length === 0) { grid.innerHTML = '<p style="text-align:center;width:100%;color:#888;">لا توجد منتجات مطابقة</p>'; return; }
    renderItems(items);
}

function renderFor(cat) {
    const items = cat === 'all' ? state.products : state.products.filter(p => p.category === cat);
    renderItems(items);
}

function renderItems(items) {
    const grid = document.getElementById('grid'); grid.innerHTML = '';
    if (items.length === 0) { grid.innerHTML = '<p style="text-align:center;width:100%;color:#888;">لا توجد منتجات</p>'; return; }
    items.forEach(p => {
        const el = document.createElement('div'); el.className = 'product-card'; el.onclick = () => addToCart(p.id);
        el.innerHTML = `<div class="card-img-box"><img src="${p.img}" onerror="this.src='https://placehold.co/200x150?text=No+Image'"></div><div class="card-info"><h3>${p.name}</h3><span>${fmt(p.price)}</span></div>`;
        grid.appendChild(el);
    });
}

// CART & ADD
function addToCart(id) {
    const p = state.products.find(i => i.id === id);
    if (mode === 'sale' && p.stock <= 0) return alert('نفذت الكمية!');
    playBeep('normal'); // BEEP
    const exist = cart.find(c => c.id === id);
    if (exist) exist.qty++; else cart.push({ ...p, qty: 1 });
    updateCartUI();
}
function changeQty(id, delta) {
    const item = cart.find(c => c.id === id); if (!item) return; item.qty += delta; if (item.qty <= 0) cart = cart.filter(c => c.id !== id); updateCartUI();
}
function clearCart() { cart = []; document.getElementById('cust-name-input').value = ''; document.getElementById('discount-input').value = 0; updateCartUI(); }
function updateCartUI() {
    const body = document.getElementById('cart-body'); body.innerHTML = ''; let subTotal = 0;
    cart.forEach(item => {
        subTotal += item.price * item.qty;
        const row = document.createElement('div'); row.className = 'cart-item';
        row.innerHTML = `<div class="ci-name">${item.name}</div><div class="ci-qty"><button onclick="changeQty(${item.id}, -.5)" class="qty-mini">-</button> ${item.qty} <button onclick="changeQty(${item.id}, .5)" class="qty-mini">+</button></div><div class="ci-price">${fmt(item.price * item.qty)}</div><div class="ci-del"><button class="btn-del-mini" onclick="changeQty(${item.id}, -1000)">x</button></div>`;
        body.appendChild(row);
    });

    // Discount Logic
    let discount = parseFloat(document.getElementById('discount-input').value) || 0;
    let finalTotal = subTotal - discount;
    if (finalTotal < 0) finalTotal = 0;

    document.getElementById('total-display').innerText = (mode === 'return' ? '- ' : '') + fmt(finalTotal);
}

// HOLD / RESTORE
let heldOrder = null;
function toggleHold() {
    if (heldOrder) {
        if (cart.length > 0 && !confirm("استبدال السلة الحالية بالمعلقة؟")) return;
        cart = heldOrder.cart;
        document.getElementById('cust-name-input').value = heldOrder.name;
        heldOrder = null; updateCartUI(); alert("تم الاسترجاع");
        document.getElementById('btn-hold-text').innerText = "تعليق";
        document.querySelector('.btn-hold').style.background = "#F59E0B";
    } else {
        if (cart.length === 0) return alert("السلة فارغة");
        heldOrder = { cart: [...cart], name: document.getElementById('cust-name-input').value };
        cart = []; updateCartUI(); document.getElementById('cust-name-input').value = ""; alert("تم التعليق");
        document.getElementById('btn-hold-text').innerText = "استرجاع";
        document.querySelector('.btn-hold').style.background = "#EF4444";
    }
}

// CHECKOUT
function checkout() {
    if (cart.length === 0) return alert('السلة فارغة!');
    playBeep('success');
    const nameIn = document.getElementById('cust-name-input').value.trim(); const custName = nameIn || "زبون عام";

    let subTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let discount = parseFloat(document.getElementById('discount-input').value) || 0;
    let finalTotal = subTotal - discount;
    if (finalTotal < 0) finalTotal = 0;

    if (mode === 'return') finalTotal = -finalTotal;

    const trans = {
        id: Math.floor(Math.random() * 900000) + 100000,
        date: new Date().toISOString(),
        items: [...cart],
        subTotal: subTotal,
        discount: discount,
        total: finalTotal,
        custName: custName,
        type: mode
    };
    state.transactions.push(trans);

    cart.forEach(cItem => {
        const prod = state.products.find(p => p.id === cItem.id);
        if (prod) { if (mode === 'sale') prod.stock -= cItem.qty; else prod.stock += cItem.qty; }
    });

    const existingCust = state.customers.find(c => c.name === custName);
    if (existingCust) existingCust.totalSpent += finalTotal;

    save(); printReceipt(trans); clearCart(); if (mode === 'return') setMode('sale');
}

function printReceipt(trans) {
    const s = state.settings || defaultData.settings;
    const typeLabel = trans.type === 'return' ? '(استرجاع)' : '';
    const dateObj = new Date(trans.date);
    const dateStr = dateObj.toLocaleDateString('en-GB');
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let itemsHTML = '';
    trans.items.forEach(i => {
        itemsHTML += `<tr><td style="text-align:right">${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${fmt(i.price * i.qty)}</td></tr>`;
    });

    const html = `
        <div class="receipt-header">
            <div class="receipt-logo">${s.shopName}</div>
            <div style="font-size:0.9rem">${s.address}</div>
            <div style="font-size:0.9rem">${s.phone}</div>
            ${typeLabel ? `<h3 style="margin:5px 0;background:black;color:white">${typeLabel}</h3>` : ''}
        </div>
        <div class="receipt-info">وصل: #${trans.id}<br>التاريخ: ${dateStr} | ${timeStr}<br>العميل: ${trans.custName || 'زبون عام'}</div>
        <table class="receipt-table"><thead><tr><th style="width:50%">الصنف</th><th style="width:20%">العدد</th><th style="width:30%">المجموع</th></tr></thead><tbody>${itemsHTML}</tbody></table>
        
        <div class="receipt-total-box">
            ${trans.discount > 0 ? `<div style="text-align:right; font-size:0.9rem; margin-bottom:5px;">المجموع: ${fmt(trans.subTotal || trans.total)}</div>` : ''}
            ${trans.discount > 0 ? `<div style="text-align:right; font-size:0.9rem; margin-bottom:5px;">خصم: -${fmt(trans.discount)}</div>` : ''}
            <h2 style="margin:0; font-size:1.5rem">الصافي: ${fmt(trans.total)}</h2><small>د.ع</small>
        </div>
        
        <div class="receipt-footer"><div class="barcode-sim"></div><p>${s.footer}</p><p style="margin-top:10px; font-weight:bold;">شكراً لزيارتكم</p></div>
    `;

    document.getElementById('receipt-print').innerHTML = html;
    window.print();
}

function loadSettingsUI() {
    if (!state.settings) state.settings = defaultData.settings;
    document.getElementById('set-shop-name').value = state.settings.shopName || "";
    document.getElementById('set-address').value = state.settings.address || "";
    document.getElementById('set-phone').value = state.settings.phone || "";
    document.getElementById('set-footer').value = state.settings.footer || "";
}
function saveSettingsUI() {
    state.settings.shopName = document.getElementById('set-shop-name').value;
    state.settings.address = document.getElementById('set-address').value;
    state.settings.phone = document.getElementById('set-phone').value;
    state.settings.footer = document.getElementById('set-footer').value;
    save(); alert("تم الحفظ!");
}
// Backup/Restore same as before...
function backupData() { const d = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state)); const a = document.createElement('a'); a.href = d; a.download = "alyusr_backup.json"; document.body.appendChild(a); a.click(); a.remove(); }
function restoreData(input) { const f = input.files[0]; if (!f) return; const r = new FileReader(); r.onload = (e) => { if (confirm("استبدال؟")) { state = JSON.parse(e.target.result); save(); window.location.reload(); } }; r.readAsText(f); }
function hardReset() { if (prompt("حذف الكل؟ اكتب 'حذف'") === "حذف") { state = defaultData; save(); window.location.reload(); } }

function renderReports() {
    const today = new Date().toISOString().split('T')[0];
    const daySum = state.transactions.filter(t => t.date.startsWith(today)).reduce((a, b) => a + b.total, 0);
    const monthSum = state.transactions.filter(t => t.date.startsWith(today.substring(0, 7))).reduce((a, b) => a + b.total, 0);
    document.getElementById('today-total').innerText = fmt(daySum);
    document.getElementById('month-total').innerText = fmt(monthSum);
    document.getElementById('today-count').innerText = state.transactions.filter(t => t.date.startsWith(today)).length;

    // Top Products Calculation
    const productStats = {};
    state.transactions.forEach(t => {
        if (t.type === 'sale') {
            t.items.forEach(i => {
                if (!productStats[i.name]) productStats[i.name] = 0;
                productStats[i.name] += i.qty;
            });
        }
    });

    const sortedProducts = Object.entries(productStats).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const topGrid = document.getElementById('top-products-grid');
    if (topGrid) {
        topGrid.innerHTML = '';
        if (sortedProducts.length === 0) topGrid.innerHTML = '<p style="color:#888;">لا توجد بيانات كافية</p>';
        sortedProducts.forEach(([name, qty]) => {
            topGrid.innerHTML += `<div class="stat-card" style="padding:15px; text-align:center;"><h4>${name}</h4><h2 style="color:var(--primary)">${qty}</h2><small>مباع</small></div>`;
        });
    }

    const tb = document.getElementById('transactions-list'); tb.innerHTML = '';
    state.transactions.slice().reverse().slice(0, 10).forEach(t => { const typeStr = t.type === 'return' ? '<span style="color:red">(استرجاع)</span>' : ''; tb.innerHTML += `<tr><td>#${t.id}</td><td>${new Date(t.date).toLocaleTimeString()}</td><td>${t.custName} ${typeStr}</td><td>${fmt(t.total)}</td></tr>`; });

    // Low Stock Alert
    const low = state.products.filter(p => p.stock < 10);
    const alertBox = document.getElementById('low-stock-box');
    if (low.length > 0 && alertBox) {
        alertBox.classList.add('visible');
        document.getElementById('low-stock-list').innerHTML = low.map(p => `<li>⚠️ <b>${p.name}</b>: باقي ${p.stock}</li>`).join('');
    } else if (alertBox) { alertBox.classList.remove('visible'); }
}
function renderInventory() {
    const tb = document.getElementById('inventory-list'); tb.innerHTML = '';
    state.products.forEach(p => {
        let es = ''; if (p.expDate) { const df = Math.ceil((new Date(p.expDate) - new Date()) / (864e5)); es = df < 0 ? '<span style="color:red">منتهي</span>' : (df < 7 ? `<span style="color:orange">${df} يوم</span>` : '<span style="color:green">صالح</span>'); } else es = '-';
        tb.innerHTML += `<tr><td><img src="${p.img}" width="30"></td><td>${p.name}</td><td>${fmt(p.price)}</td><td style="color:${p.stock < 10 ? 'red' : 'green'}"><b>${p.stock}</b></td><td>${es}</td><td><button onclick="openStockModal(${p.id})">تعديل</button></td></tr>`;
    });
}
// Render Cust/Search same...
function renderCustomers() { const tb = document.getElementById('customers-list'); tb.innerHTML = ''; state.customers.forEach(c => { tb.innerHTML += `<tr><td>${c.name}</td><td>${c.phone}</td><td>${fmt(c.totalSpent)}</td><td>${c.vip ? 'VIP' : '-'}</td><td><button onclick="delCustomer(${c.id})" style="color:red">x</button></td></tr>`; }); }
function searchCustomer(q) {
    const l = document.getElementById('cust-list'); l.innerHTML = '';
    if (q.length < 1) { l.style.display = 'none'; return; }
    const m = state.customers.filter(c => c.name.includes(q) || c.phone.includes(q)); // Search Name OR Phone
    if (m.length === 0) { l.style.display = 'none'; return; }
    l.style.display = 'block';
    m.forEach(c => {
        const d = document.createElement('div'); d.className = 'dropdown-item'; d.innerText = c.name + ' (' + c.phone + ')';
        d.onclick = () => {
            document.getElementById('cust-name-input').value = c.name;
            document.getElementById('cust-phone-input').value = c.phone;
            l.style.display = 'none';
        };
        l.appendChild(d);
    });
}
function toggleCustSearch() { const l = document.getElementById('cust-list'); l.style.display = l.style.display === 'block' ? 'none' : 'block'; }
function openStockModal(id) { editTargetId = id; const p = state.products.find(i => i.id === id); document.getElementById('stock-modal').classList.add('open'); document.getElementById('stock-name-display').innerText = p.name; document.getElementById('edit-price').value = p.price; document.getElementById('edit-stock').value = p.stock; document.getElementById('edit-prod-date').value = p.prodDate || ''; document.getElementById('edit-exp-date').value = p.expDate || ''; }
function closeStockModal() { document.getElementById('stock-modal').classList.remove('open'); }
function saveStockChanges() { const p = state.products.find(i => i.id === editTargetId); if (p) { p.price = parseFloat(document.getElementById('edit-price').value); p.stock = parseFloat(document.getElementById('edit-stock').value); p.prodDate = document.getElementById('edit-prod-date').value; p.expDate = document.getElementById('edit-exp-date').value; save(); closeStockModal(); } }
function openCustModal() { document.getElementById('cust-modal').classList.add('open'); }
function closeCustModal() { document.getElementById('cust-modal').classList.remove('open'); }
function addNewCustomer() { const n = document.getElementById('new-cust-name').value; if (n) { state.customers.push({ id: Date.now(), name: n, phone: document.getElementById('new-cust-phone').value, vip: document.getElementById('new-cust-vip').checked, totalSpent: 0 }); save(); closeCustModal(); } }
function delCustomer(id) { if (confirm('حذف؟')) { state.customers = state.customers.filter(c => c.id !== id); save(); } }

init();
