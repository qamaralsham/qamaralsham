// ==============================================
// قمر الشام - دوال مساعدة
// Qamar Al Sham - Utilities
// ==============================================

// ====== الإشعارات ======

/**
 * إظهار إشعار منبثق
 */
function showToast(icon, message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(15,15,20,0.95);
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 12px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1100;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        animation: toastIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ====== التنسيق ======

/**
 * تنسيق الوقت
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
}

/**
 * تنسيق التاريخ
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ====== التحقق ======

/**
 * هل النص رابط؟
 */
function isLink(text) {
    return /(https?:\/\/|www\.|\.com)/i.test(text);
}

/**
 * هل الإيميل صحيح؟
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ====== نجوم الخلفية ======

/**
 * توليد نجوم متساقطة
 */
function generateStars() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    starfield.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = (Math.random() * 5) + 's';
        starfield.appendChild(star);
    }
}

// ====== Avatar ======

/**
 * توليد صورة افتراضية
 */
function getDefaultAvatar(name, bgColor = 'random', textColor = 'fff') {
    const encoded = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${encoded}&background=${bgColor}&color=${textColor}`;
}

// ====== الاهتزاز ======

/**
 * اهتزاز الجهاز (للموبايل)
 */
function vibrate(ms = 50) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// ====== الأنيميشن ======

// إضافة animation للإشعارات
if (!document.getElementById('qamar-animations')) {
    const style = document.createElement('style');
    style.id = 'qamar-animations';
    style.innerHTML = `
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInSlide {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

console.log('📦 Utils loaded');