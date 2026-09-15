// ==============================================
// Frames Engine - محرك الإطارات
// ==============================================

let ALL_FRAMES = [];
let CURRENT_FRAME_ID = null;

async function loadFramesConfig() {
    try {
        const res = await fetch('frames-config.json?v=' + Date.now());
        const data = await res.json();
        ALL_FRAMES = data.frames || [];
        console.log('✅ Loaded ' + ALL_FRAMES.length + ' frames');
        return ALL_FRAMES;
    } catch (e) {
        console.warn('❌ Frame config error:', e);
        return [];
    }
}

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
    img.loading = 'lazy';

    el.appendChild(img);
    box.appendChild(el);

    localStorage.setItem('saved_avatar_frame_motion', frameId);
    CURRENT_FRAME_ID = frameId;
}

function renderFramesGrid(container) {
    if (!container) return;
    container.innerHTML = '';

    // خيار "بدون"
    const noneCard = document.createElement('div');
    noneCard.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px;text-align:center;cursor:pointer';
    if (!CURRENT_FRAME_ID) noneCard.style.borderColor = '#ffd700';
    noneCard.innerHTML = '<div style="width:60px;height:60px;margin:0 auto;background:#1a0e2e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#888;font-size:22px">✕</div><div style="font-size:10px;color:#ffd700;margin-top:6px">بدون</div>';
    noneCard.onclick = () => {
        applyFrameTo(document.getElementById('avatar-box'), 'none');
        if (typeof saveToChat === 'function') saveToChat();
        if (typeof toast === 'function') toast('✅ تم');
        renderFramesGrid(container);
    };
    container.appendChild(noneCard);

    // الإطارات
    ALL_FRAMES.forEach(f => {
        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px;text-align:center;cursor:pointer;transition:0.2s';
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

// غلاف للدالة القديمة عشان تشتغل مع النظام الجديد
window.renderFrames = function () {
    const c = document.getElementById('frames-container');
    if (c) renderFramesGrid(c);
};

window.applyAvatarFrame = function (fid) {
    const box = document.getElementById('avatar-box');
    if (box) applyFrameTo(box, fid);
};

// تحميل الإطارات تلقائياً
document.addEventListener('DOMContentLoaded', async () => {
    await loadFramesConfig();
    const saved = localStorage.getItem('saved_avatar_frame_motion');
    if (saved && saved !== 'none') {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, saved);
    }
});

window.loadFramesConfig = loadFramesConfig;
window.applyFrameTo = applyFrameTo;
window.renderFramesGrid = renderFramesGrid;

console.log('✅ frames-engine.js loaded');
