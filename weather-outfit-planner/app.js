
const weatherData = {
    sunny: {
        temp: "28°",
        condition: "مشمس",
        advice: "الجو دافئ، مثالي للألوان الفاتحة! ☀️",
        outfits: [
            {
                top: "تيشيرت قطني أبيض Oversized",
                bottom: "تنورة ماكسي موردة",
                shoes: "صندل صيفي مريح",
                image: "sunny_outfit_1.jpg" // We will implement image loading logic later or use placeholders
            },
            {
                top: "بلوزة كتان بيج",
                bottom: "بنطال قماش واسع بني فاتح",
                shoes: "سنيكرز أبيض",
                image: "sunny_outfit_2.jpg"
            }
        ],
        themeColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
    },
    rainy: {
        temp: "15°",
        condition: "مطر",
        advice: "لا تنسي المظلة! ارتدي شيئاً دافئاً 🌧️",
        outfits: [
            {
                top: "هودي رمادي ثقيل",
                bottom: "بنطال جينز غامق",
                shoes: "بوت مقاوم للماء",
                image: "rainy_outfit_1.jpg"
            }
        ],
        themeColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
};

let currentState = 'sunny';

function refreshOutfit() {
    const btn = document.querySelector('.refresh-btn');
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => { btn.style.transform = 'none'; }, 500);

    // Toggle for demo purposes
    currentState = currentState === 'sunny' ? 'rainy' : 'sunny';
    updateUI(currentState);
}

function updateUI(stateKey) {
    const data = weatherData[stateKey];
    const outfit = data.outfits[0]; // Simple selection for now

    // Update Weather Header
    document.getElementById('current-temp').innerText = data.temp;
    document.getElementById('weather-text').innerText = data.condition;
    document.querySelector('.weather-advice').innerText = data.advice;
    document.getElementById('weather-header').style.background = data.themeColor;

    // Update Icon
    const icon = document.getElementById('weather-icon');
    icon.className = stateKey === 'sunny' ? 'fas fa-sun' : 'fas fa-cloud-showers-heavy';

    // Update Outfit Text
    document.getElementById('top-desc').innerText = outfit.top;
    document.getElementById('bottom-desc').innerText = outfit.bottom;
    document.getElementById('shoes-desc').innerText = outfit.shoes;

    // TODO: Update Image src here once we have assets
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    updateUI('sunny');
});
