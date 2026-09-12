// ==============================================
// قمر الشام — بيانات الإطارات (v1)
// ==============================================

const FRAMES_DATA = {
    // ═══ الإطار الحالي (اللي أرسلته) ═══
    metal_wings: {
        id: 'metal_wings',
        name: 'الأجنحة المعدنية',
        category: 'rare',        // common | rare | epic | legendary
        minRank: 'Owner',        // الرتبة المطلوبة
        price: 1500,             // سعر النقاط
        url: 'https://i.ibb.co/VcX7TfvC/st-128401-1786669813-fc0002c6.gif',
        size: 'large',           // small | medium | large
        offset: 0                // إزاحة عمودية
    },

    // ═══ إطارات جاهزة (روابط للاستبدال لاحقاً) ═══
    // لما تلاقي روابط جديدة، بس عدّل الحقول "url"

    fire_red: {
        id: 'fire_red',
        name: 'اللهب الأحمر',
        category: 'epic',
        minRank: 'Owner',
        price: 3000,
        url: '',                 // ← حط الرابط هنا لاحقاً
        size: 'medium',
        offset: 0
    },

    butterflies_gold: {
        id: 'butterflies_gold',
        name: 'الفراشات الذهبية',
        category: 'legendary',
        minRank: 'Master Owner',
        price: 10000,
        url: '',
        size: 'large',
        offset: -5
    }
};

// ═══ الفئات ═══
const FRAME_CATEGORIES = {
    common:    { name: 'عادي',    color: '#95a5a6', icon: '⚪' },
    rare:      { name: 'نادر',     color: '#3498db', icon: '🔵' },
    epic:      { name: 'ملحمي',   color: '#9b59b6', icon: '🟣' },
    legendary: { name: 'أسطوري', color: '#ffd700', icon: '🟡' }
};

// ═══ دالة مساعدة ═══
function getFrameData(id) {
    return FRAMES_DATA[id] || null;
}

function getFramesByCategory(cat) {
    return Object.values(FRAMES_DATA).filter(f => f.category === cat && f.url);
}

window.FRAMES_DATA = FRAMES_DATA;
window.FRAME_CATEGORIES = FRAME_CATEGORIES;
window.getFrameData = getFrameData;
window.getFramesByCategory = getFramesByCategory;
