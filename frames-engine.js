// ==============================================
// Frames Engine v5 - مع دعم الشات
// ==============================================

window.FRAMES = window.FRAMES || [];

const ALL_FRAMES = [
    { id: "f1", file: "frame1.png", name: "الفضي الملكي",       animation: "royal-glow",     rank: "User" },
    { id: "f2", file: "frame2.png", name: "الأجنحة الوردية",    animation: "wing-flutter",   rank: "User" },
    { id: "f3", file: "frame3.png", name: "النار الحية",         animation: "none",           rank: "User" },
    { id: "f4", file: "frame4.png", name: "نجوم النار",          animation: "flame-flicker",  rank: "Owner" },
    { id: "f5", file: "frame5.png", name: "وردة ذهبية",          animation: "royal-glow",     rank: "User" },
    { id: "f6", file: "frame6.png", name: "إكليل الغار",         animation: "royal-glow",     rank: "Owner" },
    { id: "f7", file: "frame7.png", name: "النجوم الحمراء",      animation: "celestial-spin", rank: "Premium" },
    { id: "f8", file: "frame8.png", name: "الجناح الأسود",       animation: "wing-flutter",   rank: "Premium" }
];

let CURRENT_FRAME_ID = localStorage.getItem('saved_avatar_frame_motion') || null;

// ══════════════════════════════════════════════
// تطبيق إطار على أي عنصر (بروفايل أو شات)
// ══════════════════════════════════════════════
function applyFrameTo(box, frameId) {
    if (!box) return;
    box.querySelectorAll('.qf').forEach(e => e.remove());
    if (!frameId || frameId === 'none') {
        if (box.id === 'avatar-box') {
            localStorage.setItem('saved_avatar_frame_motion', '');
            CURRENT_FRAME_ID = null;
        }
        return;
    }
    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;
    const el = document.createElement('div');
    el.className = 'qf ' + (frame.animation && frame.animation !== 'none' ? frame.animation : '');
    el.setAttribute('data-frame-id', frameId);
    const img = document.createElement('img');
    img.src = frame.file;
    img.alt = frame.name;
    img.loading = 'lazy';
    el.appendChild(img);
    box.appendChild(el);
    if (box.id === 'avatar-box') {
        localStorage.setItem('saved_avatar_frame_motion', frameId);
        CURRENT_FRAME_ID = frameId;
    }
}

// ══════════════════════════════════════════════
// تطبيق إطار على رسالة في الشات
// ══════════════════════════════════════════════
function applyFrameToMessage(wrapper, frameId) {
    if (!wrapper) return;
    wrapper.querySelectorAll('.qf').forEach(e => e.remove());

    if (!frameId || frameId === 'none') return;

    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;

    const el = document.createElement('div');
    el.className = 'qf';
    el.setAttribute('data-frame-id', frameId);
    el.style.cssText = 'position:absolute;inset:-25%;pointer-events:none;z-index:20;display:flex;align-items:center;justify-content:center;';
    const img = document.createElement('img');
    img.src = frame.file;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    el.appendChild(img);
    wrapper.appendChild(el);
}

// ══════════════════════════════════════════════
// عرض شبكة الإطارات في البروفايل
// ══════════════════════════════════════════════
function renderFramesGrid(container) {
    if (!container) return;
    container.innerHTML = '';

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
// Override للدوال القديمة + بعد تحميل كل الملفات
// ══════════════════════════════════════════════
window.addEventListener('load', function () {

    // Override renderFrames
    window.renderFrames = function () {
        const c = document.getElementById('frames-container');
        if (c) renderFramesGrid(c);
    };

    // ⭐ Override applyFrameToWrapper (chat.js) عشان يستخدم النظام الجديد
    var _origApplyToWrapper = window.applyFrameToWrapper;
    window.applyFrameToWrapper = function (wrapper, frameId) {
        if (!wrapper) return;
        // نظّف القديم
        wrapper.querySelectorAll('.qf, .dynamic-frame-wrapper, .qcf, .avatar-frame, .qamar-frame').forEach(e => e.remove());
        if (!frameId || frameId === 'none') return;
        applyFrameToMessage(wrapper, frameId);
    };

    // Override applyAvatarFrame عشان يستخدم النظام الجديد في البروفايل
    window.applyAvatarFrame = function (fid) {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, fid);
    };

    // زر إطار الأفاتار
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

    // طبّق الإطار المحفوظ على البروفايل (لو في profile.html)
    const saved = localStorage.getItem('saved_avatar_frame_motion');
    if (saved && saved !== 'none' && saved !== '') {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, saved);
    }

    // ⭐⭐⭐ تطبيق الإطارات على الرسائل الموجودة مسبقاً في الشات
    setTimeout(applyFramesToExistingMessages, 2000);
});

// ══════════════════════════════════════════════
// ⭐⭐⭐ Observer: تطبيق الإطارات على الرسائل الجديدة
// ══════════════════════════════════════════════
function applyFramesToExistingMessages() {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    if (typeof db === 'undefined' || !db) return;

    const currentRoom = (typeof ChatState !== 'undefined' && ChatState.currentRoom) ? ChatState.currentRoom : 'general';

    // اجلب بيانات كل المستخدمين اللي عندهم إطار
    db.ref('room_messages/' + currentRoom).limitToLast(50).once('value').then(snap => {
        const messages = snap.val() || {};
        Object.keys(messages).forEach(msgId => {
            const msg = messages[msgId];
            if (!msg || !msg.senderFrame || msg.senderFrame === 'none') return;
            const msgEl = document.querySelector('[data-msg-id="' + msgId + '"]');
            if (!msgEl) return;
            const wrapper = msgEl.querySelector('.message-avatar-wrapper');
            if (!wrapper) return;
            if (wrapper.querySelector('.qf')) return;
            applyFrameToMessage(wrapper, msg.senderFrame);
        });
    }).catch(e => console.warn('Frame apply error:', e));
}

// ⭐ Observer للرسائل الجديدة
document.addEventListener('DOMContentLoaded', function () {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                if (!node.classList || !node.classList.contains('message')) return;
                if (node.classList.contains('system')) return;

                var wrapper = node.querySelector('.message-avatar-wrapper');
                if (!wrapper) return;
                if (wrapper.querySelector('.qf')) return;

                var msgId = node.getAttribute('data-msg-id');
                if (!msgId) return;

                var senderUid = node.getAttribute('data-sender-uid');
                if (!senderUid) return;

                // اجلب بيانات المرسل من Firebase (ممكن ياخذ جزء من الثانية)
                if (typeof db === 'undefined' || !db) return;
                db.ref('users/' + senderUid + '/avatarFrame').once('value').then(function (s) {
                    var frame = s.val();
                    if (frame && frame !== 'none' && !wrapper.querySelector('.qf')) {
                        applyFrameToMessage(wrapper, frame);
                    }
                }).catch(function () {});
            });
        });
    });

    var messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        observer.observe(messagesContainer, { childList: true, subtree: false });
    }
});

// ══════════════════════════════════════════════
// تصدير
// ══════════════════════════════════════════════
window.applyFrameTo = applyFrameTo;
window.applyFrameToMessage = applyFrameToMessage;
window.renderFramesGrid = renderFramesGrid;
window.ALL_FRAMES = ALL_FRAMES;

console.log('✅ frames-engine.js v5 loaded — شات + بروفايل');
