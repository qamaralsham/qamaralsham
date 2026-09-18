// ==============================================
// frames-engine.js v9 — كامل
// ==============================================

const FRAMES_REPO = 'qamaralsham/qamaralsham';
const FRAMES_FOLDER = 'frames/';
const FRAMES_EXTS = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'apng'];
const FRAMES_CACHE_TTL = 24 * 60 * 60 * 1000;
const FRAMES_CACHE_KEY = 'qamar_frames_cache_v1';
const ANIM_CYCLE = ['royal-glow', 'wing-flutter', 'flame-flicker', 'celestial-spin', 'none'];

const FRAMES_OVERRIDES = {
    // "frame1.png": { name: "الفضي الملكي", animation: "royal-glow", rank: "User" },
};

const FALLBACK_FRAMES = [
    { id: "f1", file: "frame1.png", name: "إطار 1", animation: "royal-glow", rank: "User" },
    { id: "f2", file: "frame2.png", name: "إطار 2", animation: "wing-flutter", rank: "User" },
    { id: "f3", file: "frame3.png", name: "إطار 3", animation: "flame-flicker", rank: "User" },
    { id: "f4", file: "frame4.png", name: "إطار 4", animation: "celestial-spin", rank: "User" },
    { id: "f5", file: "frame5.png", name: "إطار 5", animation: "none", rank: "User" },
    { id: "f6", file: "frame6.png", name: "إطار 6", animation: "royal-glow", rank: "User" },
    { id: "f7", file: "frame7.png", name: "إطار 7", animation: "wing-flutter", rank: "User" },
    { id: "f8", file: "frame8.png", name: "إطار 8", animation: "none", rank: "User" }
];

let ALL_FRAMES = FALLBACK_FRAMES.slice();
let _refreshing = false;

function buildFrameSrc(file) {
    if (/^(https?:|\/)/i.test(file)) return file;
    return FRAMES_FOLDER + file;
}

function naturalSort(a, b) {
    var na = a.match(/\d+/g);
    var nb = b.match(/\d+/g);
    if (na && nb) {
        for (var i = 0; i < Math.max(na.length, nb.length); i++) {
            var va = parseInt(na[i] || 0);
            var vb = parseInt(nb[i] || 0);
            if (va !== vb) return va - vb;
        }
    }
    return a.localeCompare(b);
}

function extractNum(filename) {
    var m = filename.match(/\d+/);
    return m ? parseInt(m[0]) : 0;
}

function buildFrameFromFile(fileObj, index) {
    var name = fileObj.name;
    var ext = (name.split('.').pop() || '').toLowerCase();
    var isAnimated = (ext === 'gif' || ext === 'webp' || ext === 'apng');
    var num = extractNum(name);
    var id = 'f' + (num || (index + 1));
    var override = FRAMES_OVERRIDES[name] || {};

    return {
        id: override.id || id,
        file: name,
        name: override.name || ('إطار ' + (num || (index + 1))),
        animation: override.animation || (isAnimated ? 'none' : ANIM_CYCLE[index % ANIM_CYCLE.length]),
        rank: override.rank || 'User'
    };
}

async function fetchFramesFromGitHub() {
    var url = 'https://api.github.com/repos/' + FRAMES_REPO + '/contents/' + FRAMES_FOLDER;
    try {
        var res = await fetch(url + '?t=' + Date.now());
        if (res.status === 403 || res.status === 429) {
            console.warn('⚠️ GitHub API rate-limited');
            return null;
        }
        if (!res.ok) {
            console.warn('⚠️ GitHub API error:', res.status);
            return null;
        }
        var data = await res.json();
        if (!Array.isArray(data)) return null;

        var files = data.filter(function (f) {
            if (f.type !== 'file') return false;
            if (f.name.charAt(0) === '.') return false;
            var ext = (f.name.split('.').pop() || '').toLowerCase();
            if (FRAMES_EXTS.indexOf(ext) === -1) return false;
            if (!/^frame/i.test(f.name)) return false;
            return true;
        });

        files.sort(function (a, b) { return naturalSort(a.name, b.name); });
        return files.map(buildFrameFromFile);
    } catch (e) {
        console.warn('⚠️ fetch failed:', e.message);
        return null;
    }
}

function loadFromCache() {
    try {
        var cached = JSON.parse(localStorage.getItem(FRAMES_CACHE_KEY) || 'null');
        if (!cached) return null;
        if (Date.now() - cached.at > FRAMES_CACHE_TTL) return null;
        if (!Array.isArray(cached.frames) || cached.frames.length === 0) return null;
        return cached.frames;
    } catch (e) { return null; }
}

function saveToCache(frames) {
    try {
        localStorage.setItem(FRAMES_CACHE_KEY, JSON.stringify({
            frames: frames,
            at: Date.now()
        }));
    } catch (e) {}
}

async function initFrames() {
    var cached = loadFromCache();
    if (cached) {
        ALL_FRAMES = cached;
        console.log('📦 إطارات من الذاكرة: ' + cached.length);
    }

    var fresh = await fetchFramesFromGitHub();
    if (fresh && fresh.length > 0) {
        ALL_FRAMES = fresh;
        saveToCache(fresh);
        console.log('🔄 إطارات محدّثة من GitHub: ' + fresh.length);
        var c = document.getElementById('frames-container');
        if (c && c.children.length > 0) renderFramesGrid(c);
    } else if (!cached) {
        ALL_FRAMES = FALLBACK_FRAMES.slice();
        console.log('📌 استخدام القائمة الاحتياطية');
    }
}

/* ⭐⭐ التحديث اليدوي */
window.reloadFrames = async function () {
    if (_refreshing) return;
    _refreshing = true;

    var btn = document.getElementById('frames-refresh-btn');
    if (btn) btn.textContent = '⏳';

    try {
        localStorage.removeItem(FRAMES_CACHE_KEY);
        var fresh = await fetchFramesFromGitHub();
        if (fresh && fresh.length > 0) {
            ALL_FRAMES = fresh;
            saveToCache(fresh);
            var c = document.getElementById('frames-container');
            if (c) renderFramesGrid(c);
            if (typeof toast === 'function') toast('✅ تم تحديث القائمة (' + fresh.length + ' إطار)');
        } else {
            if (typeof toast === 'function') toast('⚠️ فشل التحديث — جرب بعد دقيقة');
        }
    } catch (e) {
        if (typeof toast === 'function') toast('⚠️ خطأ في التحديث');
    }

    _refreshing = false;
    if (btn) btn.textContent = '🔄';
};

function applyFrameTo(box, frameId) {
    if (!box) return;
    box.querySelectorAll('.qf').forEach(e => e.remove());
    if (!frameId || frameId === 'none') {
        if (box.id === 'avatar-box') {
            localStorage.setItem('saved_avatar_frame_motion', '');
        }
        return;
    }
    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;
    const el = document.createElement('div');
    el.className = 'qf ' + (frame.animation && frame.animation !== 'none' ? frame.animation : '');
    el.setAttribute('data-frame-id', frameId);
    const img = document.createElement('img');
    img.src = buildFrameSrc(frame.file);
    img.alt = frame.name;
    img.loading = 'lazy';
    img.onerror = () => el.remove();
    el.appendChild(img);
    box.appendChild(el);
    if (box.id === 'avatar-box') {
        localStorage.setItem('saved_avatar_frame_motion', frameId);
    }
}

function applyFrameToMessage(wrapper, frameId) {
    if (!wrapper) return;
    wrapper.querySelectorAll('.qf').forEach(e => e.remove());
    if (!frameId || frameId === 'none') return;
    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;
    const el = document.createElement('div');
    el.className = 'qf ' + (frame.animation && frame.animation !== 'none' ? frame.animation : '');
    el.setAttribute('data-frame-id', frameId);
    el.style.cssText = 'position:absolute;inset:var(--frame-inset,-8%);pointer-events:none;z-index:20;display:flex;align-items:center;justify-content:center;';
    const img = document.createElement('img');
    img.src = buildFrameSrc(frame.file);
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    img.onerror = () => el.remove();
    el.appendChild(img);
    wrapper.appendChild(el);
}

function ensureRefreshButton() {
    var modal = document.getElementById('frames-modal');
    if (!modal) return;
    if (document.getElementById('frames-refresh-btn')) return;

    var box = modal.querySelector('.modal-c');
    if (!box) return;

    var btn = document.createElement('button');
    btn.id = 'frames-refresh-btn';
    btn.type = 'button';
    btn.textContent = '🔄';
    btn.title = 'تحديث قائمة الإطارات';
    btn.style.cssText = 'position:absolute;top:10px;left:10px;background:rgba(255,215,0,0.15);border:1px solid rgba(255,215,0,0.4);color:#ffd700;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;font-weight:900;z-index:5;';
    btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.reloadFrames();
    };

    box.style.position = 'relative';
    box.appendChild(btn);
}

function renderFramesGrid(container) {
    if (!container) return;
    container.innerHTML = '';

    ensureRefreshButton();

    if (!ALL_FRAMES || ALL_FRAMES.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;padding:20px;font-size:12px;">⏳ جاري تحميل الإطارات...</div>';
        return;
    }

    const currentId = localStorage.getItem('saved_avatar_frame_motion') || null;

    const noneCard = document.createElement('div');
    noneCard.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px;text-align:center;cursor:pointer';
    if (!currentId || currentId === '') noneCard.style.borderColor = '#ffd700';
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
        if (currentId === f.id) card.style.borderColor = '#ffd700';

        const preview = document.createElement('div');
        preview.style.cssText = 'position:relative;width:60px;height:60px;margin:0 auto';

        const av = document.createElement('img');
        av.src = 'https://ui-avatars.com/api/?name=U&background=333&color=fff';
        av.style.cssText = 'position:absolute;top:15%;left:15%;width:70%;height:70%;border-radius:50%';
        preview.appendChild(av);

        const fimg = document.createElement('img');
        fimg.src = buildFrameSrc(f.file);
        fimg.style.cssText = 'position:absolute;top:-15%;left:-15%;width:130%;height:130%;object-fit:contain;pointer-events:none';
        fimg.onerror = () => { fimg.style.display = 'none'; };
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

window.addEventListener('load', function () {
    initFrames();

    window.renderFrames = function () {
        const c = document.getElementById('frames-container');
        if (c) renderFramesGrid(c);
    };

    window.applyFrameToWrapper = function (wrapper, frameId) {
        if (!wrapper) return;
        wrapper.querySelectorAll('.qf, .dynamic-frame-wrapper, .qcf, .avatar-frame, .qamar-frame').forEach(e => e.remove());
        if (!frameId || frameId === 'none') return;
        applyFrameToMessage(wrapper, frameId);
    };

    window.applyAvatarFrame = function (fid) {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, fid);
    };

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

    const saved = localStorage.getItem('saved_avatar_frame_motion');
    if (saved && saved !== 'none' && saved !== '') {
        const box = document.getElementById('avatar-box');
        if (box) applyFrameTo(box, saved);
    }

    setTimeout(applyFramesToExistingMessages, 2000);
});

function applyFramesToExistingMessages() {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    if (typeof db === 'undefined' || !db) return;

    const currentRoom = (typeof ChatState !== 'undefined' && ChatState.currentRoom) ? ChatState.currentRoom : 'general';

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
                if (senderUid.indexOf('bot_') === 0) return;

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
        observer.observe(messagesContainer, { childList: true, subtree: true });
    }
});

window.applyFrameTo = applyFrameTo;
window.applyFrameToMessage = applyFrameToMessage;
window.renderFramesGrid = renderFramesGrid;
window.getFrames = function () { return ALL_FRAMES; };

console.log('✅ frames-engine.js v9 loaded — AUTO-discovery + refresh button');ك
