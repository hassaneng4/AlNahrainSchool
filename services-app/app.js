// App Logic
// DATA
const servicesData = {
    'electric': [
        { id: 101, name: 'إصلاح أعطال كهرباء عامة', price: 25000 },
        { id: 102, name: 'تركيب لمبات وإنارة', price: 15000 },
        { id: 103, name: 'تمديدات كهربائية جديدة', price: 150000 },
        { id: 104, name: 'تركيب مروحة سقف', price: 20000 },
        { id: 105, name: 'فحص شورت كهربائي', price: 35000 }
    ],
    'plumbing': [
        { id: 201, name: 'تصليح تسريب مياه', price: 25000 },
        { id: 202, name: 'فتح انسداد مجاري', price: 40000 },
        { id: 203, name: 'تركيب سخان مياه', price: 30000 },
        { id: 204, name: 'تركيب فلاتر مياه', price: 15000 },
        { id: 205, name: 'تأسيس حمام كامل', price: 250000 }
    ],
    'cooling': [
        { id: 301, name: 'غسيل مكيف سبليت', price: 15000 },
        { id: 302, name: 'تعبئة فريون (غاز)', price: 45000 },
        { id: 303, name: 'صيانة عدم تبريد', price: 25000 },
        { id: 304, name: 'نقل مكيف (فك وتركيب)', price: 75000 }
    ],
    'carpentry': [
        { id: 401, name: 'إصلاح أبواب خشبية', price: 25000 },
        { id: 402, name: 'تركيب كالون (قفل) باب', price: 15000 },
        { id: 403, name: 'تفصيل دولاب حسب الطلب', price: 150000 },
        { id: 404, name: 'صيانة أسرة وغرف نوم', price: 35000 }
    ],
    'smithery': [
        { id: 501, name: 'لحام أبواب حديدية', price: 30000 },
        { id: 502, name: 'تصليح شبابيك حديد', price: 25000 },
        { id: 503, name: 'تركيب مظلات', price: 100000 }
    ],
    'paint': [
        { id: 601, name: 'صبغ غرفة واحدة', price: 75000 },
        { id: 602, name: 'صبغ شقة كاملة', price: 350000 },
        { id: 603, name: 'معالجة رطوبة الجدران', price: 50000 }
    ],
    'cleaning': [
        { id: 701, name: 'تنظيف منازل (يومي)', price: 40000 },
        { id: 702, name: 'غسيل سجاد وموكيت', price: 5000 },
        { id: 703, name: 'تنظيف خزانات مياه', price: 60000 },
        { id: 704, name: 'مكافحة حشرات وقوارض', price: 50000 }
    ],
    'pest': [
        { id: 801, name: 'رش مبيدات حشرية (شقة)', price: 40000 },
        { id: 802, name: 'مكافحة النمل الأبيض', price: 100000 }
    ],
    'moving': [
        { id: 901, name: 'نقل عفش (سيارة صغيرة)', price: 50000 },
        { id: 902, name: 'نقل عفش (دينا كبيرة)', price: 150000 },
        { id: 903, name: 'فك وتركيب أثاث', price: 75000 }
    ],
    'network': [
        { id: 1001, name: 'تمديد كابلات إنترنت', price: 15000 },
        { id: 1002, name: 'برمجة راوتر / تقوية شبكة', price: 10000 },
        { id: 1003, name: 'تركيب كاميرات مراقبة', price: 35000 }
    ],
    'garden': [
        { id: 1101, name: 'تنسيق حدائق', price: 100000 },
        { id: 1102, name: 'قص أشجار وتنظيف', price: 50000 }
    ],
    'appliances': [
        { id: 1201, name: 'تصليح غسالة ملابس', price: 25000 },
        { id: 1202, name: 'تصليح ثلاجة', price: 35000 },
        { id: 1203, name: 'تصليح طباخ (غاز)', price: 15000 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Timeout
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            // Removed auto checkLocation to keep initial view clean
        }, 500);
    }, 2000);

    // Init Date Scroll
    initDateScroll();

    // Init Cities
    initCities();
});

// LOCATION LOGIC
const iraqCities = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
    'كركوك', 'الأنبار', 'ديالى', 'بابل', 'واسط', 'ميسان',
    'ذي قار', 'القادسية', 'المثنى', 'دهوك', 'السليمانية', 'صلاح الدين'
];

function initCities() {
    const grid = document.getElementById('cities-grid');
    if (!grid) return;
    grid.innerHTML = '';
    iraqCities.forEach(city => {
        const btn = document.createElement('button');
        btn.innerText = city;
        btn.style.cssText = `
            padding: 10px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
        `;
        btn.onclick = () => setLocation(city);
        grid.appendChild(btn);
    });
}

function openLocationModal() {
    document.getElementById('location-modal').classList.add('open');
}

function setLocation(city) {
    localStorage.setItem('user_city', city);
    document.getElementById('current-location-text').innerHTML = `${city} <i class="fas fa-map-marker-alt"></i> (تغيير)`;
    document.getElementById('location-modal').classList.remove('open');
}

function checkLocation() {
    const city = localStorage.getItem('user_city');
    if (!city) {
        setTimeout(() => openLocationModal(), 500);
    } else {
        document.getElementById('current-location-text').innerHTML = `${city} <i class="fas fa-map-marker-alt"></i> (تغيير)`;
    }
}

// NAVIGATION
function switchView(viewName) {
    // Hide all sub-views
    document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));

    // Show specific view
    if (viewName === 'subscriptions') {
        document.getElementById('view-subscriptions').classList.add('active');
    }
}

function openCategory(catId) {
    const titleMap = {
        'electric': 'خدمات الكهرباء',
        'plumbing': 'خدمات السباكة',
        'cooling': 'خدمات التكييف والتبريد',
        'carpentry': 'خدمات النجارة',
        'smithery': 'خدمات الحدادة',
        'paint': 'أعمال الدهان',
        'cleaning': 'خدمات التنظيف',
        'pest': 'مكافحة الحشرات',
        'moving': 'نقل عفش',
        'network': 'الشبكات والإنترنت',
        'garden': 'تنسيق الحدائق',
        'appliances': 'صيانة الأجهزة المنزلية'
    };

    document.getElementById('cat-title').innerText = titleMap[catId] || 'الخدمات';

    // Render Services
    const list = document.getElementById('cat-services-list');
    list.innerHTML = '';

    const items = servicesData[catId] || [];
    if (items.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">سيتم توفير هذه الخدمة قريباً...</p>';
    } else {
        items.forEach(s => {
            const el = document.createElement('div');
            el.className = 'service-list-item';
            el.onclick = () => openBooking(s);
            el.innerHTML = `
                <div class="srv-details">
                    <h4>${s.name}</h4>
                    <span>${s.price.toLocaleString()} د.ع</span>
                    <div style="font-size:0.7rem; color:green; margin-top:2px;">
                        <i class="fas fa-shield-alt"></i> ضمان 30 يوم
                    </div>
                </div>
                <div class="srv-add-btn"><i class="fas fa-plus"></i></div>
            `;
            list.appendChild(el);
        });
    }

    document.getElementById('view-category').classList.add('active');
}

function openAI() {
    alert('محاكاة: جاري تحليل الصورة بالذكاء الاصطناعي...\n\nالنتيجة المقترحة:\nيبدو أن هناك تسريب في صنبور المياه.\nالتكلفة التقديرية: 25,000 د.ع\nالوقت المتوقع: 45 دقيقة');
}

function goHome() {
    document.getElementById('view-category').classList.remove('active');
    document.getElementById('view-subscriptions').classList.remove('active');
}

// BOOKING
let currentService = null;

function openBooking(service) {
    currentService = service;
    document.getElementById('book-service-name').innerText = service.name;
    document.getElementById('book-service-price').innerText = service.price.toLocaleString() + ' د.ع';
    document.getElementById('booking-modal').classList.add('open');
}

function closeBooking() {
    document.getElementById('booking-modal').classList.remove('open');
}

function initDateScroll() {
    const container = document.getElementById('date-scroll');
    const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    let today = new Date();

    for (let i = 0; i < 10; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() + i);

        const el = document.createElement('div');
        el.className = `date-item ${i === 0 ? 'active' : ''}`;
        el.onclick = () => {
            document.querySelectorAll('.date-item').forEach(x => x.classList.remove('active'));
            el.classList.add('active');
        };
        el.innerHTML = `
            <span class="d-day">${days[d.getDay()]}</span>
            <span class="d-num">${d.getDate()}</span>
        `;
        container.appendChild(el);
    }
}

function selectTime(btn) {
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function confirmBooking() {
    // Basic validation visual
    const time = document.querySelector('.time-slot.active');
    if (!time) return alert('يرجى اختيار الوقت');

    alert(`تم حجز خدمة: ${currentService.name}\nالسعر: ${currentService.price} د.ع\nشكراً لاستخدامك خدماتي!`);
    closeBooking();
    goHome();
}

// TECH REGISTRATION
function showTechRegister() {
    document.getElementById('view-tech-register').classList.add('active');
}

function closeTechRegister() {
    document.getElementById('view-tech-register').classList.remove('active');
}

function submitTechRegister() {
    // Collect data (Mock)
    const inputs = document.querySelectorAll('#view-tech-register input, #view-tech-register select');
    let valid = true;
    inputs.forEach(i => { if (!i.value) valid = false; });

    if (!valid) return alert('يرجى تعبئة جميع الحقول');

    // Simulate API call
    const btn = document.querySelector('#view-tech-register button');
    const originalText = btn.innerText;
    btn.innerText = 'جاري الإرسال...';
    btn.disabled = true;

    setTimeout(() => {
        alert('تم استلام طلبك بنجاح!\nسيتصل بك فريق التوظيف قريباً لمقابلة العمل وتفعيل حسابك.');
        btn.innerText = originalText;
        btn.disabled = false;
        closeTechRegister();
    }, 1500);
}

// Navigation Handler (Visual only for prototype)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});
