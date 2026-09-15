// ==============================================
// Frames Engine v3 - مع override صحيح
// ==============================================

const ALL_FRAMES = [
    { id: "f1", file: "frame1.png", name: "الفضي الملكي",    animation: "royal-glow",     rank: "User" },
    { id: "f2", file: "frame2.png", name: "الأجنحة الوردية", animation: "wing-flutter",   rank: "User" },
    { id: "f3", file: "frame3.png", name: "الياقوت الأزرق",  animation: "wing-flutter",   rank: "Owner" },
    { id: "f4", file: "frame4.png", name: "نجوم النار",      animation: "flame-flicker",  rank: "Owner" },
    { id: "f5", file: "frame5.png", name: "وردة ذهبية",      animation: "royal-glow",     rank: "User" },
    { id: "f6", file: "frame6.png", name: "إكليل الغار",     animation: "royal-glow",     rank: "Owner" },
    { id: "f7", file: "frame7.png", name: "النجوم الحمراء",  animation: "celestial-spin", rank: "Premium" },
    { id: "f8", file: "frame8.png", name: "الجناح الأسود",   animation: "wing-flutter",   rank: "Premium" }
];

let CURRENT_FRAME_ID = localStorage.getItem('saved_avatar_frame_motion') || null;

function applyFrameTo(box, frameId) {
    if (!box) return;
    box.querySelectorAll('.qf').forEach(e => e.remove());
    if (!frameId || frameId === 'none') {
        localStorage.setItem('saved_avatar_frame_motion', '');
        CURRENT_FRAME_ID = null;
        return;
    }
    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;
    const el = document.createElement('div');
    el.className = 'qf ' + (frame.animation || '');
    el.setAttribute('data-frame-id', frameId);
    const img = document.createElement('img');
    img.src = frame.file;
    img.alt = frame.name;
    el.appendChild(img);
    box.appendChild(el);
    localStorage.setItem('saved_avatar_frame_motion', frameId);
    CURRENT_FRAME_ID = frameId;
}

function renderFramesGrid(container) {
    if (!container) return;
    container.innerHTML = '';

    // زر "بدون"
    const noneCard = document.createElement('div');
    noneCard.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px;text-align:center;cursor:pointer';
    if (!CURRENT_FRAME_ID) noneCard.style.borderColor = '#ffd700';
    noneCard.innerHTML = '<div style="width:60px;height:60px;margin:0 auto;background:#1a0e2e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#888;font-size:22px">✕</div><div style="font-size:10px;color:#ffd700;margin-top:6px">بدون</div>';
    noneCard.onclick = () => {
        applyFrameTo(document.getElementById('avatar-box'), 'none');
        if (typeof saveToChat === 'function') saveToChat();
        if (typeof toast === 'function') toast('✅ تم الإلغاء');
        renderFramesGrid(container);
    };
    container.appendChild(noneCard);

    // الإطارات الثمانية
    ALL_FRAMES.forEach(f => {
        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px;text-align:center;cursor:pointer';
        if (CURRENT_FRAME_ID === f.id) card.style.borderColor = '#ffd700';

        const preview = document.createElement('div');
        preview.style.cssText = 'position:relative;width:60px;height:60px;margin:0 auto';

        const av = document.createElement('img');
        av.src = 'https://ui-avatars.com/api/?name=U&background=333&color=fff';
        av.style.cssText = 'position:absolute;top:15%;left:15%;width:70%;height:70%;border-radius:50%';
        preview.appendChild(av);

        const fimg = document.createElement('img');
        fimg.src = f.file;
        fimg.style.cssText = 'position:absolute;top:-15%;left:-15%;width:130%;height:130%;object-fit:contain;pointer-events:none';
        preview.appendChild(fimg);

        const name = document.createElement('div');
        name.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
        name.textContent = f.name;

        card.appendChild(preview);
        card.appendChild(name);

        card.onclick = () => {
            applyFrameTo(document.getElementById('avatar-box'), f.id);
            if (typeof saveToChat === 'function') saveToChat();
            if (typeof toast === 'function') toast('✅ ' + f.name);
            renderFramesGrid(container);
        };

        container.appendChild(card);
    });
}

// ══════════════════════════════════════════════
// override كل شيء بعد ما الصفحة تحمّل بالكامل
// ══════════════════════════════════════════════
window.addEventListener('load', function () {
    console.log('🎨 Frames Engine: overriding button handlers');

    // اجبر كل دالة renderFrames على النسخة الجديدة
    window.renderFrames = function () {
        const c = document.getElementById('frames-container');
        if (c) renderFramesGrid(c);
    };

    // override زر إطار الأفاتار
    const fb = document.getElementById('avatar-frame-motion');
    if (fb) {
        fb.onclick = null;
        fb.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = document.getElementById('frames-modal');
            if (modal) modal.classList.add('active');
            const c = document.getElementById('frames-container');
            if (c) renderFramesGrid(c);
        });
    }

    // طبّق الإطار المحفوظ
    const saved = localStorage.getItem('saved_avatar_frame_motion');
    if (saved && saved !== 'none' && saved !== '') {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, saved);
    }

    // إذا كان المودال مفتوح، اعرض الإطارات
    const modal = document.getElementById('frames-modal');
    if (modal && modal.classList.contains('active')) {
        const c = document.getElementById('frames-container');
        if (c) renderFramesGrid(c);
    }
});

window.applyAvatarFrame = function (fid) {
    const box = document.getElementById('avatar-box');
    if (box) applyFrameTo(box, fid);
};

window.applyFrameTo = applyFrameTo;
window.renderFramesGrid = renderFramesGrid;
window.ALL_FRAMES = ALL_FRAMES;

console.log('✅ frames-engine.js v3 loaded');
