// ==============================================
// قمر الشام — إطارات CSS (v1)
// 18 إطار بدون ملفات خارجية
// ==============================================

(function injectCSS() {
    if (document.getElementById('qamar-css-frames')) return;

    const style = document.createElement('style');
    style.id = 'qamar-css-frames';
    style.textContent = `
.qcf {
    position: absolute;
    inset: -18%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 15;
    box-sizing: border-box;
}

.qcf::before,
.qcf::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-sizing: border-box;
}

@keyframes qcf-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes qcf-rotate-rev {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
}

@keyframes qcf-pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.04); }
}

@keyframes qcf-glow {
    0%, 100% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.4) saturate(1.3); }
}

@keyframes qcf-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
}

.qcf--neon-rotate::before {
    background: conic-gradient(from 0deg, #00f2fe, #ff007f, #00f2fe, #ff007f, #00f2fe);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 6px #00f2fe) drop-shadow(0 0 12px #ff007f);
}
.qcf--neon-rotate::after {
    inset: -8%;
    background: radial-gradient(circle, transparent 60%, rgba(255,0,127,0.25) 70%, transparent 80%);
    animation: qcf-pulse 2s ease-in-out infinite;
}

.qcf--royal-gold::before {
    background: conic-gradient(from 0deg, #ffd700, #ff8c00, #ffec8b, #b8860b, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 6s linear infinite;
    filter: drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 18px rgba(255,140,0,0.6));
}
.qcf--royal-gold::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,215,0,0.35) 72%, transparent 82%);
    animation: qcf-glow 3s ease-in-out infinite;
}

.qcf--fire::before {
    background: conic-gradient(from 0deg, #ff4500, #ffcc00, #ff0055, #ff4500, #ffcc00);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 2s linear infinite;
    filter: drop-shadow(0 0 10px #ff4500) drop-shadow(0 0 20px #ffcc00);
}
.qcf--fire::after {
    background: radial-gradient(circle, transparent 60%, rgba(255,69,0,0.5) 70%, transparent 85%);
    animation: qcf-pulse 1.2s ease-in-out infinite;
    mix-blend-mode: screen;
}

.qcf--ice::before {
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #caf0f8, #ffffff, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 15px #ffffff);
}
.qcf--ice::after {
    background: radial-gradient(circle, transparent 62%, rgba(144,224,239,0.3) 72%, transparent 82%);
    animation: qcf-glow 2.5s ease-in-out infinite;
}

.qcf--rainbow::before {
    background: conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
}
.qcf--rainbow::after {
    inset: -6%;
    background: radial-gradient(circle, transparent 65%, rgba(255,255,255,0.15) 75%, transparent 85%);
}

.qcf--rose::before {
    background: conic-gradient(from 0deg, #ff69b4, #ff1493, #ffb6c1, #ff69b4);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #ff69b4) drop-shadow(0 0 16px rgba(255,20,147,0.6));
}
.qcf--rose::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,105,180,0.35) 72%, transparent 82%);
    animation: qcf-breathe 2s ease-in-out infinite;
}

.qcf--emerald::before {
    background: conic-gradient(from 0deg, #00ff88, #00cc66, #aaffdd, #00ff88);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #00ff88);
}
.qcf--emerald::after {
    background: radial-gradient(circle, transparent 62%, rgba(0,255,136,0.3) 72%, transparent 82%);
    animation: qcf-glow 2.5s ease-in-out infinite;
}

.qcf--royal-purple::before {
    background: conic-gradient(from 0deg, #a855f7, #7c3aed, #c084fc, #a855f7);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 10px #a855f7) drop-shadow(0 0 20px rgba(124,58,237,0.5));
}
.qcf--royal-purple::after {
    background: radial-gradient(circle, transparent 62%, rgba(168,85,247,0.35) 72%, transparent 82%);
    animation: qcf-pulse 2.5s ease-in-out infinite;
}

.qcf--silver::before {
    background: conic-gradient(from 0deg, #ffffff, #c0c0c0, #ffffff, #e8e8e8, #ffffff);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(192,192,192,0.6));
}

.qcf--dark-red::before {
    background: conic-gradient(from 0deg, #000000, #ff0000, #000000, #cc0000, #000000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 10px #ff0000);
}
.qcf--dark-red::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,0,0,0.3) 72%, transparent 82%);
    animation: qcf-pulse 1.5s ease-in-out infinite;
}

.qcf--bronze::before {
    background: conic-gradient(from 0deg, #cd7f32, #a0522d, #daa520, #cd7f32);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 6s linear infinite;
    filter: drop-shadow(0 0 8px #cd7f32);
}

.qcf--diamond::before {
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 16px #ffffff);
}
.qcf--diamond::after {
    inset: -6%;
    background: 
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 1px, transparent 2px),
        radial-gradient(circle at 80% 30%, rgba(255,255,255,0.6) 1px, transparent 2px),
        radial-gradient(circle at 30% 80%, rgba(255,255,255,0.7) 1px, transparent 2px);
    animation: qcf-pulse 1.5s ease-in-out infinite;
}

.qcf--toxic::before {
    background: conic-gradient(from 0deg, #39ff14, #00ff00, #ccff00, #39ff14);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 10px #39ff14) drop-shadow(0 0 20px rgba(0,255,0,0.5));
}
.qcf--toxic::after {
    background: radial-gradient(circle, transparent 62%, rgba(57,255,20,0.3) 72%, transparent 82%);
    animation: qcf-pulse 1.2s ease-in-out infinite;
}

.qcf--galaxy::before {
    background: conic-gradient(from 0deg, #1a2a6c, #b21f1f, #fdbb2d, #1a2a6c, #b21f1f);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 8s linear infinite;
    filter: drop-shadow(0 0 12px rgba(178,31,31,0.7));
}
.qcf--galaxy::after {
    background: radial-gradient(circle, transparent 62%, rgba(26,42,108,0.5) 72%, transparent 85%);
    animation: qcf-glow 4s ease-in-out infinite;
}

.qcf--dual-neon::before {
    background: conic-gradient(from 0deg, #00f2fe, #00f2fe, transparent, transparent);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 8px #00f2fe);
}
.qcf--dual-neon::after {
    inset: 8%;
    background: conic-gradient(from 180deg, #ff007f, #ff007f, transparent, transparent);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate-rev 3s linear infinite;
    filter: drop-shadow(0 0 8px #ff007f);
}

.qcf--heart::before {
    background: conic-gradient(from 0deg, #ff1493, #ff69b4, #ff1493);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    filter: drop-shadow(0 0 10px #ff1493) drop-shadow(0 0 20px #ff69b4);
    animation: qcf-heart-beat 1.2s ease-in-out infinite;
}
@keyframes qcf-heart-beat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.08); }
    30% { transform: scale(1); }
    45% { transform: scale(1.05); }
    60% { transform: scale(1); }
}

.qcf--golden-serpent::before {
    background: conic-gradient(from 0deg, #ffd700, transparent 30%, #ffd700, transparent 70%, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 1.5s linear infinite;
    filter: drop-shadow(0 0 12px #ffd700) drop-shadow(0 0 24px rgba(255,140,0,0.7));
}

.qcf--blue-flame::before {
    background: conic-gradient(from 0deg, #0080ff, #00f2fe, #4facfe, #0080ff);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 2s linear infinite;
    filter: drop-shadow(0 0 10px #00f2fe) drop-shadow(0 0 20px #0080ff);
}
.qcf--blue-flame::after {
    background: radial-gradient(circle, transparent 60%, rgba(0,128,255,0.4) 70%, transparent 85%);
    animation: qcf-pulse 1.3s ease-in-out infinite;
    mix-blend-mode: screen;
}

@media (max-width: 480px) {
    .qcf--galaxy::before { animation-duration: 12s; }
    .qcf--rainbow::before { animation-duration: 6s; }
}
    `;
    document.head.appendChild(style);
    console.log('✅ CSS Frames styles injected');
})();

const CSS_FRAMES_DATA = {
    css_neon_rotate:     { id: 'css_neon_rotate',     name: 'نيون دوّار',    cssClass: 'neon-rotate',     category: 'rare',      minRank: 'Owner',        price: 500 },
    css_royal_gold:      { id: 'css_royal_gold',      name: 'ذهبي ملكي',    cssClass: 'royal-gold',      category: 'legendary', minRank: 'Owner',        price: 5000 },
    css_fire:            { id: 'css_fire',            name: 'نار ملتهبة',   cssClass: 'fire',            category: 'epic',      minRank: 'Owner',        price: 2000 },
    css_ice:             { id: 'css_ice',             name: 'جليد',          cssClass: 'ice',             category: 'rare',      minRank: 'Owner',        price: 800 },
    css_rainbow:         { id: 'css_rainbow',         name: 'قوس قزح',      cssClass: 'rainbow',         category: 'epic',      minRank: 'Owner',        price: 1500 },
    css_rose:            { id: 'css_rose',            name: 'وردي رومانسي', cssClass: 'rose',            category: 'rare',      minRank: 'Owner',        price: 600 },
    css_emerald:         { id: 'css_emerald',         name: 'زمردي',         cssClass: 'emerald',         category: 'rare',      minRank: 'Owner',        price: 900 },
    css_royal_purple:    { id: 'css_royal_purple',    name: 'بنفسجي ملكي',  cssClass: 'royal-purple',    category: 'epic',      minRank: 'Owner',        price: 1800 },
    css_silver:          { id: 'css_silver',          name: 'فضي لامع',      cssClass: 'silver',          category: 'common',    minRank: 'User',         price: 300 },
    css_dark_red:        { id: 'css_dark_red',        name: 'أسود-أحمر',    cssClass: 'dark-red',        category: 'epic',      minRank: 'Owner',        price: 2500 },
    css_bronze:          { id: 'css_bronze',          name: 'برونزي',        cssClass: 'bronze',          category: 'common',    minRank: 'User',         price: 400 },
    css_diamond:         { id: 'css_diamond',         name: 'ألماس متلألئ',  cssClass: 'diamond',         category: 'legendary', minRank: 'Master Owner', price: 8000 },
    css_toxic:           { id: 'css_toxic',           name: 'أخضر سام',      cssClass: 'toxic',           category: 'epic',      minRank: 'Owner',        price: 1700 },
    css_galaxy:          { id: 'css_galaxy',          name: 'جالاكسي',       cssClass: 'galaxy',          category: 'legendary', minRank: 'Master Owner', price: 7000 },
    css_dual_neon:       { id: 'css_dual_neon',       name: 'نيون مزدوج',    cssClass: 'dual-neon',       category: 'epic',      minRank: 'Owner',        price: 2200 },
    css_heart:           { id: 'css_heart',           name: 'نبض القلب',     cssClass: 'heart',           category: 'rare',      minRank: 'Owner',        price: 700 },
    css_golden_serpent:  { id: 'css_golden_serpent',  name: 'الثعبان الذهبي', cssClass: 'golden-serpent',  category: 'legendary', minRank: 'Master Owner', price: 6000 },
    css_blue_flame:      { id: 'css_blue_flame',      name: 'لهب أزرق',      cssClass: 'blue-flame',      category: 'epic',      minRank: 'Owner',        price: 1900 }
};

function applyCSSFrame(container, frameId) {
    if (!container) return;
    container.querySelectorAll('.qcf').forEach(el => el.remove());

    const frame = CSS_FRAMES_DATA[frameId];
    if (!frame) return;

    const el = document.createElement('div');
    el.className = 'qcf qcf--' + frame.cssClass;
    el.setAttribute('data-frame-id', frameId);
    container.appendChild(el);
}

window.CSS_FRAMES_DATA = CSS_FRAMES_DATA;
window.applyCSSFrame = applyCSSFrame;

console.log('✅ css-frames.js loaded — ' + Object.keys(CSS_FRAMES_DATA).length + ' frames');
