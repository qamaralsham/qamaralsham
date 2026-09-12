// ==============================================
// قمر الشام — بيانات الإطارات (v2)
// ==============================================

const FRAMES_DATA = {};

const FRAME_CATEGORIES = {
    common:    { name: 'عادي',    color: '#95a5a6', icon: '⚪' },
    rare:      { name: 'نادر',     color: '#3498db', icon: '🔵' },
    epic:      { name: 'ملحمي',   color: '#9b59b6', icon: '🟣' },
    legendary: { name: 'أسطوري', color: '#ffd700', icon: '🟡' }
};

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

console.log('✅ frames-data.js loaded — 0 external frames');
