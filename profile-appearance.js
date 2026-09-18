// ==============================================
// profile-appearance.js v8 — كامل
// ==============================================

/* ══════════════════════════════════════════════ */
(function injectCSS() {
    if (document.getElementById('name-bg-styles')) return;
    var s = document.createElement('style');
    s.id = 'name-bg-styles';
    s.textContent = `

@keyframes nfSlide {
    0%   { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}
@keyframes nfMoveFast {
    0%   { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}

/* ⭐ الاسم — بنية أساسية */
.username.name-has-effects {
    position: relative !important;
    display: inline-block !important;
    isolation: isolate !important;
    z-index: 1 !important;
    padding: 2px 14px !important;
    border-radius: 999px !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    line-height: 1.35 !important;
    font-weight: 900 !important;
}

/* السحابة */
.username.name-bg-active::before {
    content: '' !important;
    position: absolute !important;
    inset: -4px -6px !important;
    border-radius: 999px !important;
    background: var(--name-bg-gradient, transparent) !important;
    filter: blur(8px) !important;
    -webkit-filter: blur(8px) !important;
    opacity: 0.9 !important;
    z-index: -1 !important;
    pointer-events: none !important;
}

/* التوهج */
.username.glow-soft { text-shadow: 0 0 6px var(--name-glow-color, #ffffff), 0 2px 6px rgba(0,0,0,0.9) !important; }
.username.glow-medium { text-shadow: 0 0 10px var(--name-glow-color, #ffffff), 0 0 18px var(--name-glow-color, #ffffff), 0 2px 6px rgba(0,0,0,0.9) !important; }
.username.glow-strong { text-shadow: 0 0 14px var(--name-glow-color, #ffffff), 0 0 25px var(--name-glow-color, #ffffff), 0 0 40px var(--name-glow-color, #ffffff), 0 2px 6px rgba(0,0,0,0.9) !important; }

.username.glow-soft.name-bg-active,
.username.glow-medium.name-bg-active,
.username.glow-strong.name-bg-active {
    text-shadow: 0 1px 3px rgba(0,0,0,0.9) !important;
}
.username.glow-soft.name-bg-active::before { box-shadow: 0 0 12px var(--name-glow-color, #ffffff) !important; }
.username.glow-medium.name-bg-active::before { box-shadow: 0 0 20px var(--name-glow-color, #ffffff), 0 0 35px var(--name-glow-color, #ffffff) !important; }
.username.glow-strong.name-bg-active::before { box-shadow: 0 0 25px var(--name-glow-color, #ffffff), 0 0 45px var(--name-glow-color, #ffffff), 0 0 70px var(--name-glow-color, #ffffff) !important; }

/* التدرج النصي */
.username.text-gradient {
    background-size: 300% 100% !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
    animation: nfMoveFast 1.5s linear infinite !important;
}

/* Modal */
#name-bg-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    justify-content: center; align-items: center;
    z-index: 99999; padding: 15px; direction: rtl;
}
#name-bg-modal.active { display: flex; }
#name-bg-modal .bg-modal-box {
    background: #f4f4f5;
    border-radius: 18px; padding: 18px;
    width: 100%; max-width: 420px; max-height: 92vh;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'Cairo', sans-serif; color: #111; direction: rtl;
}
#name-bg-modal .bg-modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 8px; border-bottom: 1px solid #ddd;
}
#name-bg-modal .bg-modal-header h3 { color:#111; font-size:16px; font-weight:900; margin:0; }
#name-bg-modal .bg-modal-close { background:none; border:none; font-size:22px; cursor:pointer; color:#666; padding:4px 8px; line-height:1; }
#name-bg-modal .bg-preview {
    background: #1a1a20; border-radius: 12px; padding: 16px;
    display: flex; justify-content: center; align-items: center;
    min-height: 70px; border: 2px solid #ddd;
}
#name-bg-modal .bg-preview-name {
    font-size: 18px; font-weight: 900; padding: 3px 14px;
    border-radius: 999px; display: inline-block; color: #fff;
    text-shadow: 0 2px 6px rgba(0,0,0,0.9); position: relative;
}
#name-bg-modal .bg-colors { display: flex; justify-content: space-around; gap: 12px; padding: 8px 0; }
#name-bg-modal .bg-color-wrap {
    position: relative; width: 60px; height: 60px; border-radius: 50%;
    overflow: hidden; cursor: pointer; border: 3px solid #ddd;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
#name-bg-modal .bg-color-wrap input[type="color"] {
    position: absolute; inset: -10px; width: 120%; height: 120%;
    border: none; cursor: pointer; background: none; padding: 0;
}
#name-bg-modal .bg-color-wrap input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
#name-bg-modal .bg-color-wrap input[type="color"]::-webkit-color-swatch { border: none; }
#name-bg-modal .bg-directions { display: flex; gap: 8px; justify-content: center; }
#name-bg-modal .bg-dir-btn {
    flex: 1; padding: 10px; background: #fff;
    border: 2px solid #3b82f6; color: #3b82f6;
    border-radius: 10px; font-weight: 900; font-size: 13px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
}
#name-bg-modal .bg-dir-btn.active { background: #3b82f6; color: #fff; }
#name-bg-modal .bg-slider-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
#name-bg-modal .bg-slider-row label { color: #333; font-size: 13px; font-weight: 700; min-width: 140px; text-align: right; }
#name-bg-modal .bg-slider-row input[type="range"] { flex: 1; accent-color: #3b82f6; cursor: pointer; }
#name-bg-modal .bg-actions { display: flex; gap: 8px; padding-top: 8px; }
#name-bg-modal .bg-apply-btn { flex: 1; padding: 12px; background: #84cc16; color: #fff; border: none; border-radius: 10px; font-weight: 900; font-size: 14px; cursor: pointer; font-family: 'Cairo', sans-serif; }
#name-bg-modal .bg-remove-btn { padding: 12px 18px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-weight: 900; font-size: 14px; cursor: pointer; font-family: 'Cairo', sans-serif; }
#name-bg-modal .bg-presets { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding-top: 6px; }
#name-bg-modal .bg-preset { aspect-ratio: 1; border-radius: 8px; cursor: pointer; border: 2px solid #ddd; }
#name-bg-modal .bg-preset:hover { transform: scale(1.08); border-color: #3b82f6; }
    `;
    document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════ */
var NameBgState = {
    enabled: false,
    direction: 'diagonal',
    colors: ['#ff006e', '#8338ec', '#3a86ff'],
    positions: [0, 50, 100]
};

function buildGradientCSS(state) {
    var angle = 90;
    if (state.direction === 'vertical') angle = 180;
    else if (state.direction === 'diagonal') angle = 135;
    var c = state.colors, p = state.positions;
    return 'linear-gradient(' + angle + 'deg, ' + c[0] + ' ' + p[0] + '%, ' + c[1] + ' ' + p[1] + '%, ' + c[2] + ' ' + p[2] + '%)';
}

/* ═══ التطبيق الكامل — جميع الميزات معاً ═══ */
function applyAllNameStyles() {
    var el = document.getElementById('profile-username');
    if (!el) return;

    // 1. نظّف كل الكلاسات
    var toRemove = [];
    el.classList.forEach(function (c) {
        if (c.indexOf('nf-') === 0 || c.indexOf('name-') === 0 ||
            c === 'glow-soft' || c === 'glow-medium' || c === 'glow-strong' ||
            c === 'text-gradient') toRemove.push(c);
    });
    toRemove.forEach(function (c) { el.classList.remove(c); });

    // 2. نظّف كل الستايلات
    el.style.cssText = '';

    var hasBg = NameBgState.enabled;
    var hasGradient = nameGradient && nameGradient.length >= 2;
    var hasColor = !!nameColor;
    var hasGlow = nameGlow && nameGlow !== 'none';

    // 3. الخلفية
    if (hasBg) {
        el.classList.add('name-has-effects', 'name-bg-active');
        el.style.setProperty('--name-bg-gradient', buildGradientCSS(NameBgState));
    }

    // 4. التدرج أو اللون
    if (hasGradient) {
        el.classList.add('text-gradient');
        el.style.backgroundImage = 'linear-gradient(90deg, ' + nameGradient[0] + ', ' + nameGradient[1] + ', ' + nameGradient[0] + ')';
        el.style.backgroundSize = '300% 100%';
        el.style.webkitBackgroundClip = 'text';
        el.style.backgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
        el.style.color = 'transparent';
    } else if (hasColor) {
        el.style.color = nameColor;
        el.style.webkitTextFillColor = nameColor;
    } else if (hasBg) {
        el.style.color = '#ffffff';
        el.style.webkitTextFillColor = '#ffffff';
    }

    // 5. التوهج
    if (hasGlow) {
        var glowColor = hasColor ? nameColor : (hasGradient ? nameGradient[0] : '#ffffff');
        el.style.setProperty('--name-glow-color', glowColor);
        if (nameGlow === 'soft') el.classList.add('glow-soft');
        else if (nameGlow === 'medium') el.classList.add('glow-medium');
        else if (nameGlow === 'strong') el.classList.add('glow-strong');
    }

    // 6. الحجم
    if (typeof nameSize !== 'undefined' && nameSize) {
        el.style.fontSize = nameSize + 'px';
    }
}

/* ═══ تطبيق الخلفية على الشات ═══ */
function applyNameBgToUsernameEl(un, g) {
    if (!un) return;
    if (!g || g.enabled === false) {
        un.classList.remove('name-has-effects', 'name-bg-active');
        un.style.removeProperty('--name-bg-gradient');
        return;
    }
    var angle = 90;
    if (g.direction === 'vertical') angle = 180;
    else if (g.direction === 'diagonal') angle = 135;
    var colors = g.colors || ['#ff006e','#8338ec','#3a86ff'];
    var pos = g.positions || [0,50,100];
    var grad = 'linear-gradient(' + angle + 'deg, ' + colors[0] + ' ' + pos[0] + '%, ' + colors[1] + ' ' + pos[1] + '%, ' + colors[2] + ' ' + pos[2] + '%)';
    un.classList.add('name-has-effects', 'name-bg-active');
    un.style.setProperty('--name-bg-gradient', grad);
}

var _nameBgCache = {};
var _nameBgFetching = {};

function applyNameBgToChatMessages() {
    if (typeof db === 'undefined' || !db) return;
    var msgs = document.querySelectorAll('#messages .message:not(.system)');
    msgs.forEach(function (msgEl) {
        var un = msgEl.querySelector('.message-username');
        if (!un) return;
        if (un.classList.contains('name-bg-active')) return;
        var uid = msgEl.getAttribute('data-sender-uid');
        if (!uid || uid.indexOf('bot_') === 0) return;
        if (_nameBgCache[uid] !== undefined) {
            applyNameBgToUsernameEl(un, _nameBgCache[uid]);
            return;
        }
        if (_nameBgFetching[uid]) return;
        _nameBgFetching[uid] = true;
        db.ref('users/' + uid + '/nameBgGradient').once('value').then(function (s) {
            var g = s.val();
            _nameBgCache[uid] = g;
            _nameBgFetching[uid] = false;
            if (g && g.enabled !== false) {
                document.querySelectorAll('#messages .message[data-sender-uid="' + uid + '"] .message-username').forEach(function (el) {
                    applyNameBgToUsernameEl(el, g);
                });
            }
        }).catch(function () {
            _nameBgFetching[uid] = false;
        });
    });
}

(function setupChatObserver() {
    if (window.__nameBgObserverInstalled) return;
    window.__nameBgObserverInstalled = true;
    function install() {
        var container = document.getElementById('messages');
        if (!container) { setTimeout(install, 2000); return; }
        new MutationObserver(function () { applyNameBgToChatMessages(); })
            .observe(container, { childList: true, subtree: false });
        setTimeout(applyNameBgToChatMessages, 1500);
        setInterval(applyNameBgToChatMessages, 3000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    else install();
})();

/* ═══ دوال التوافق ═══ */
function applyNameColor() { applyAllNameStyles(); }
function applyNameGradient() { applyAllNameStyles(); }
function applyNameGlow() { applyAllNameStyles(); }
function applyNameBg() { applyAllNameStyles(); }
function applyNameFrame() {}
function applyNameShape() {}
function clearNameStyles() { var el = document.getElementById('profile-username'); if (el) el.style.cssText = ''; }
function reapplyShapeFrame() {}
function updateShapeLbl() {}
function updateGlowLbl() {
    var b = document.getElementById('btn-name-glow');
    if (b) { var f = GLOWS.find(function (x) { return x.id === nameGlow; }); b.innerText = f ? f.name : 'تغيير'; }
}

/* ═══ توهج البروفايل ═══ */
function applyGlow(c) {
    var p = document.getElementById('profile-container');
    if (!p) return;
    if (!c) { p.classList.remove('glow-active'); p.style.removeProperty('--glow-color'); }
    else { p.style.setProperty('--glow-color', c); p.classList.add('glow-active'); }
}

function applyBg() {
    var layer = document.getElementById('profile-bg-layer');
    if (!layer) return;
    layer.innerHTML = '';
    layer.style.backgroundImage = '';
    layer.style.background = '';
    if (bgType === 'color') layer.style.background = bgValue || '#050508';
    else if (bgType === 'image') layer.style.backgroundImage = 'url(' + bgValue + ')';
    else if (bgType === 'video') {
        var v = document.createElement('video');
        v.src = bgValue; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
        layer.appendChild(v);
    }
}

/* ═══ Presets ═══ */
var PRESETS = [
    ['#ff006e', '#8338ec', '#3a86ff'], ['#f72585', '#b5179e', '#7209b7'],
    ['#ff4d00', '#ff8800', '#ffcc00'], ['#00f5d4', '#00bbf9', '#0077b6'],
    ['#06ffa5', '#00cc66', '#009944'], ['#ffd700', '#ff8c00', '#8b0000'],
    ['#a855f7', '#ec4899', '#f43f5e'], ['#0ea5e9', '#06b6d4', '#14b8a6'],
    ['#f59e0b', '#ef4444', '#b91c1c'], ['#1e293b', '#334155', '#475569'],
    ['#ffffff', '#cccccc', '#808080'], ['#000000', '#333333', '#666666']
];

function setColor(i, v) { NameBgState.colors[i] = v; updatePreview(); }
function setPosition(i, v) { NameBgState.positions[i] = parseInt(v); updatePreview(); }
function setDirection(dir) {
    NameBgState.direction = dir;
    document.querySelectorAll('#name-bg-modal .bg-dir-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-dir') === dir);
    });
    updatePreview();
}

function updatePreview() {
    var p = document.getElementById('name-bg-preview-name');
    if (!p) return;
    var nm = (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : 'اسمك هنا';
    p.textContent = nm;
    if (NameBgState.enabled) {
        var g = buildGradientCSS(NameBgState);
        p.style.background = g;
        p.style.backgroundImage = g;
    } else {
        p.style.background = 'rgba(255,255,255,0.08)';
        p.style.backgroundImage = '';
    }
    for (var i = 0; i < 3; i++) {
        var inp = document.getElementById('bg-color-' + i);
        if (inp) inp.value = NameBgState.colors[i];
        var sl = document.getElementById('bg-slider-' + i);
        if (sl) sl.value = NameBgState.positions[i];
    }
}

function createNameBgModal() {
    if (document.getElementById('name-bg-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'name-bg-modal';
    modal.innerHTML =
        '<div class="bg-modal-box">' +
            '<div class="bg-modal-header">' +
                '<h3>🎨 خلفية الاسم</h3>' +
                '<button class="bg-modal-close" onclick="closeNameBgModal()">✕</button>' +
            '</div>' +
            '<div class="bg-preview"><span class="bg-preview-name" id="name-bg-preview-name">اسمك هنا</span></div>' +
            '<div class="bg-colors">' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[0] + '"><input type="color" id="bg-color-0" value="' + NameBgState.colors[0] + '"></div>' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[1] + '"><input type="color" id="bg-color-1" value="' + NameBgState.colors[1] + '"></div>' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[2] + '"><input type="color" id="bg-color-2" value="' + NameBgState.colors[2] + '"></div>' +
            '</div>' +
            '<div class="bg-directions">' +
                '<button class="bg-dir-btn" data-dir="vertical" onclick="setDirection(\'vertical\')">عمودي</button>' +
                '<button class="bg-dir-btn" data-dir="horizontal" onclick="setDirection(\'horizontal\')">أفقي</button>' +
                '<button class="bg-dir-btn active" data-dir="diagonal" onclick="setDirection(\'diagonal\')">مختلط</button>' +
            '</div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-0" min="0" max="100" value="' + NameBgState.positions[0] + '"><label>اتجاه اللون الأول :</label></div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-1" min="0" max="100" value="' + NameBgState.positions[1] + '"><label>اتجاه اللون الثاني :</label></div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-2" min="0" max="100" value="' + NameBgState.positions[2] + '"><label>اتجاه اللون الثالث :</label></div>' +
            '<div class="bg-actions">' +
                '<button class="bg-remove-btn" onclick="removeNameBg()">🗑️</button>' +
                '<button class="bg-apply-btn" onclick="applyAndSaveNameBg()">✓ تغيير خلفية الاسم</button>' +
            '</div>' +
            '<div class="bg-presets" id="bg-presets-grid"></div>' +
        '</div>';
    document.body.appendChild(modal);

    for (var i = 0; i < 3; i++) {
        (function (idx) {
            var inp = document.getElementById('bg-color-' + idx);
            if (inp) inp.addEventListener('input', function () {
                setColor(idx, this.value);
                this.parentElement.style.background = this.value;
            });
            var sl = document.getElementById('bg-slider-' + idx);
            if (sl) sl.addEventListener('input', function () { setPosition(idx, this.value); });
        })(i);
    }

    var pg = document.getElementById('bg-presets-grid');
    PRESETS.forEach(function (p) {
        var b = document.createElement('div');
        b.className = 'bg-preset';
        b.style.background = 'linear-gradient(135deg, ' + p[0] + ', ' + p[1] + ', ' + p[2] + ')';
        b.onclick = function () {
            NameBgState.colors = p.slice();
            for (var k = 0; k < 3; k++) {
                var inp = document.getElementById('bg-color-' + k);
                if (inp) { inp.value = p[k]; inp.parentElement.style.background = p[k]; }
            }
            updatePreview();
        };
        pg.appendChild(b);
    });

    modal.addEventListener('click', function (e) { if (e.target === modal) closeNameBgModal(); });
}

function openNameBgModal() {
    createNameBgModal();
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.nameBgGradient) {
        var g = currentUser.nameBgGradient;
        NameBgState.enabled = g.enabled !== false;
        NameBgState.direction = g.direction || 'diagonal';
        NameBgState.colors = (g.colors && g.colors.length === 3) ? g.colors.slice() : ['#ff006e', '#8338ec', '#3a86ff'];
        NameBgState.positions = (g.positions && g.positions.length === 3) ? g.positions.slice() : [0, 50, 100];
    } else {
        NameBgState.enabled = true;
    }
    document.querySelectorAll('#name-bg-modal .bg-dir-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-dir') === NameBgState.direction);
    });
    for (var i = 0; i < 3; i++) {
        var inp = document.getElementById('bg-color-' + i);
        if (inp) { inp.value = NameBgState.colors[i]; inp.parentElement.style.background = NameBgState.colors[i]; }
        var sl = document.getElementById('bg-slider-' + i);
        if (sl) sl.value = NameBgState.positions[i];
    }
    updatePreview();
    document.getElementById('name-bg-modal').classList.add('active');
}

function closeNameBgModal() {
    var m = document.getElementById('name-bg-modal');
    if (m) m.classList.remove('active');
}

function applyAndSaveNameBg() {
    NameBgState.enabled = true;
    applyAllNameStyles();
    if (typeof currentUser !== 'undefined' && currentUser) {
        currentUser.nameBgGradient = {
            enabled: true,
            direction: NameBgState.direction,
            colors: NameBgState.colors.slice(),
            positions: NameBgState.positions.slice()
        };
    }
    try {
        var stored = JSON.parse(localStorage.getItem('qamar_current_user') || '{}');
        stored.nameBgGradient = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.nameBgGradient : null;
        localStorage.setItem('qamar_current_user', JSON.stringify(stored));
        localStorage.setItem('qamar_user', JSON.stringify(stored));
    } catch (e) {}
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.uid && typeof db !== 'undefined' && db) {
        db.ref('users/' + currentUser.uid + '/nameBgGradient').set(currentUser.nameBgGradient).catch(function () {});
    }
    if (typeof saveToChat === 'function') saveToChat();
    if (typeof toast === 'function') toast('✅ تم تطبيق خلفية الاسم');
    closeNameBgModal();
}

function removeNameBg() {
    NameBgState.enabled = false;
    if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameBgGradient = null;
    applyAllNameStyles();
    try {
        var stored = JSON.parse(localStorage.getItem('qamar_current_user') || '{}');
        stored.nameBgGradient = null;
        localStorage.setItem('qamar_current_user', JSON.stringify(stored));
        localStorage.setItem('qamar_user', JSON.stringify(stored));
    } catch (e) {}
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.uid && typeof db !== 'undefined' && db) {
        db.ref('users/' + currentUser.uid + '/nameBgGradient').remove().catch(function () {});
    }
    if (typeof saveToChat === 'function') saveToChat();
    if (typeof toast === 'function') toast('✅ تم إزالة الخلفية');
    closeNameBgModal();
}

/* ═══ التهيئة ═══ */
function initAppearance() {
    if (typeof viewMode === 'undefined' || viewMode !== 'owner') return;

    var shapeLink = document.getElementById('btn-name-shape');
    if (shapeLink) {
        var row = shapeLink.closest('.row');
        if (row) row.innerHTML = '<span class="row-lb">خلفية الاسم</span><span class="row-vl"><span class="link" id="btn-name-bg">تغيير</span></span>';
    }

    var bc = document.getElementById('btn-name-color');
    if (bc) bc.onclick = function () { openNamePicker('color'); };
    var bg = document.getElementById('btn-name-gradient');
    if (bg) bg.onclick = function () { openNamePicker('gradient'); };
    var bnf = document.getElementById('btn-name-bg');
    if (bnf) bnf.onclick = function () { openNameBgModal(); };
    var bgl = document.getElementById('btn-name-glow');
    if (bgl) bgl.onclick = function () { openNamePicker('glow'); };

    /* حجم الاسم */
    var sizeSlider = document.getElementById('name-size-slider');
    if (sizeSlider) {
        sizeSlider.value = (typeof nameSize !== 'undefined') ? nameSize : 20;
        sizeSlider.oninput = function () {
            nameSize = parseInt(this.value);
            localStorage.setItem('name_size', nameSize);
            var el = document.getElementById('profile-username');
            if (el) el.style.fontSize = nameSize + 'px';
            var lbl = document.getElementById('name-size-label');
            if (lbl) lbl.innerText = nameSize + 'px';
        };
        var lbl = document.getElementById('name-size-label');
        if (lbl) lbl.innerText = ((typeof nameSize !== 'undefined') ? nameSize : 20) + 'px';
    }

    /* حجم الإطار */
    var frameSlider = document.getElementById('frame-size-slider');
    if (frameSlider) {
        frameSlider.value = (typeof frameInset !== 'undefined') ? frameInset : -8;
        frameSlider.oninput = function () {
            frameInset = parseInt(this.value);
            localStorage.setItem('frame_inset', frameInset);
            document.documentElement.style.setProperty('--frame-inset', frameInset + '%');
            var lbl = document.getElementById('frame-size-label');
            if (lbl) lbl.innerText = frameInset + '%';
        };
        var flbl = document.getElementById('frame-size-label');
        if (flbl) flbl.innerText = ((typeof frameInset !== 'undefined') ? frameInset : -8) + '%';
    }

    var pgb = document.getElementById('btn-profile-glow');
    if (pgb) pgb.onclick = function () {
        var g = document.getElementById('profile-glow-grid');
        g.innerHTML = '';
        ['#ffd700','#ff69b4','#00f3ff','#39ff14','#a855f7','#ff0066','#ffffff','#ff4444','#ff8c00','#00ff88','#8b00ff','#feca57'].forEach(function (c) {
            var b = document.createElement('div');
            b.className = 'color-box';
            b.style.background = c;
            b.onclick = function () {
                applyGlow(c);
                localStorage.setItem('profile_glow', c);
                if (pgb) pgb.innerText = 'تغيير';
                closeModal('profile-glow-modal');
                saveToChat();
                toast('✅ تم');
            };
            g.appendChild(b);
        });
        openModal('profile-glow-modal');
    };

    var gob = document.getElementById('glow-off-btn');
    if (gob) gob.onclick = function () {
        applyGlow(null);
        localStorage.removeItem('profile_glow');
        if (pgb) pgb.innerText = 'تغيير';
        closeModal('profile-glow-modal');
    };

    var bb = document.getElementById('btn-profile-bg');
    if (bb) bb.onclick = function () {
        openAppModal('تغيير خلفية البروفايل', 'اختر النوع:', 'select', ['لون','صورة','فيديو'], 'لون', function (v) {
            if (v === 'صورة' || v === 'فيديو') {
                var inp = document.getElementById('profile-bg-input');
                if (inp) inp.click();
            } else {
                bgType = 'color'; bgValue = '#050508';
                localStorage.setItem('profile_bg_type', 'color');
                localStorage.setItem('profile_bg_value', '#050508');
                applyBg();
                saveToChat();
            }
        });
    };

    var bi = document.getElementById('profile-bg-input');
    if (bi) bi.onchange = async function (e) {
        var f = e.target.files[0];
        if (!f) return;
        if (f.type.indexOf('video/') === 0) {
            var r = new FileReader();
            r.onload = function (ev) {
                bgValue = ev.target.result; bgType = 'video';
                localStorage.setItem('profile_bg_type', 'video');
                localStorage.setItem('profile_bg_value', bgValue);
                applyBg(); saveToChat();
            };
            r.readAsDataURL(f);
            return;
        }
        var u = await uploadLoad(f, 5);
        if (u) {
            bgValue = u; bgType = 'image';
            localStorage.setItem('profile_bg_type', 'image');
            localStorage.setItem('profile_bg_value', u);
            applyBg(); saveToChat();
        }
    };

    var mb = document.getElementById('btn-profile-music');
    var mi = document.getElementById('music-file-input');
    if (mb && mi) mb.onclick = function () { mi.click(); };
    if (mi) mi.onchange = function (e) {
        var f = e.target.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function (ev) {
            musicURL = ev.target.result;
            localStorage.setItem('profile_music_url', musicURL);
            var p = document.getElementById('music-player');
            if (p) p.src = musicURL;
            var mbb = document.getElementById('music-btn-mini');
            if (mbb) mbb.style.display = 'flex';
            saveToChat();
            toast('✅ تم تعيين الموسيقى');
        };
        r.readAsDataURL(f);
    };

    var fb = document.getElementById('avatar-frame-motion');
    if (fb) fb.onclick = function () {
        var modal = document.getElementById('frames-modal');
        if (modal) modal.classList.add('active');
        if (typeof renderFramesGrid === 'function') {
            renderFramesGrid(document.getElementById('frames-container'));
        }
    };
}

/* ═══ اختيار الاسم ═══ */
function openNamePicker(tab) {
    if (tab === 'shape') { openNameBgModal(); return; }
    if (tab === 'frame') return;

    document.querySelectorAll('#name-tabs .modal-tab').forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-pick') === tab);
        t.onclick = function () { openNamePicker(t.getAttribute('data-pick')); };
    });
    var grid = document.getElementById('name-picker-grid');
    grid.innerHTML = '';
    var realName = (typeof viewMode !== 'undefined' && viewMode === 'owner' && typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : ((typeof targetUser !== 'undefined' && targetUser && targetUser.name) || 'مستخدم');

    if (tab === 'color') {
        COLORS.forEach(function (c) {
            var d = document.createElement('div'); d.className = 'picker-item';
            if (nameColor === c) d.classList.add('selected');
            var p = document.createElement('div'); p.className = 'picker-prev';
            p.style.color = c; p.innerText = realName; d.appendChild(p);
            d.onclick = function () {
                nameColor = c; nameGradient = null;
                localStorage.setItem('name_color', c);
                localStorage.removeItem('name_gradient');
                applyAllNameStyles(); saveToChat();
                toast('✅ تم'); closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    } else if (tab === 'gradient') {
        GRADS.forEach(function (g) {
            var d = document.createElement('div'); d.className = 'picker-item';
            var p = document.createElement('div'); p.className = 'picker-prev';
            p.style.background = 'linear-gradient(90deg,' + g[0] + ',' + g[1] + ',' + g[0] + ')';
            p.style.backgroundSize = '200% 200%';
            p.style.webkitBackgroundClip = 'text';
            p.style.backgroundClip = 'text';
            p.style.webkitTextFillColor = 'transparent';
            p.style.animation = 'nfSlide 3s linear infinite';
            p.innerText = realName; d.appendChild(p);
            d.onclick = function () {
                nameGradient = g; nameColor = null;
                localStorage.setItem('name_gradient', JSON.stringify(g));
                localStorage.removeItem('name_color');
                applyAllNameStyles(); saveToChat();
                toast('✅ تم'); closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    } else if (tab === 'glow') {
        GLOWS.forEach(function (g) {
            var d = document.createElement('div'); d.className = 'picker-item';
            if (nameGlow === g.id) d.classList.add('selected');
            var p = document.createElement('div'); p.className = 'picker-prev';
            p.style.color = '#ffd700'; p.innerText = realName;
            if (g.id === 'soft') p.style.textShadow = '0 0 6px #ffd700';
            else if (g.id === 'medium') p.style.textShadow = '0 0 10px #ffd700, 0 0 18px #ffd700';
            else if (g.id === 'strong') p.style.textShadow = '0 0 14px #ffd700, 0 0 25px #ffd700, 0 0 40px #ffd700';
            d.appendChild(p);
            var lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            lbl.textContent = g.name;
            d.style.flexDirection = 'column';
            d.appendChild(lbl);
            d.onclick = function () {
                nameGlow = g.id;
                localStorage.setItem('name_glow', g.id);
                applyAllNameStyles(); updateGlowLbl(); saveToChat();
                toast('✅ تم'); closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    openModal('name-picker-modal');
}

/* ═══ عند البدء ═══ */
window.addEventListener('load', function () {
    setTimeout(function () {
        if (typeof currentUser !== 'undefined' && currentUser && currentUser.nameBgGradient) {
            var g = currentUser.nameBgGradient;
            NameBgState.enabled = g.enabled !== false;
            NameBgState.direction = g.direction || 'diagonal';
            NameBgState.colors = (g.colors && g.colors.length === 3) ? g.colors.slice() : NameBgState.colors;
            NameBgState.positions = (g.positions && g.positions.length === 3) ? g.positions.slice() : NameBgState.positions;
        }
        applyAllNameStyles();
    }, 600);
});

/* ═══ تصدير ═══ */
window.openNameBgModal = openNameBgModal;
window.closeNameBgModal = closeNameBgModal;
window.applyAndSaveNameBg = applyAndSaveNameBg;
window.removeNameBg = removeNameBg;
window.setColor = setColor;
window.setPosition = setPosition;
window.setDirection = setDirection;
window.updatePreview = updatePreview;
window.NameBgState = NameBgState;
window.applyAllNameStyles = applyAllNameStyles;
window.applyNameBgToChatMessages = applyNameBgToChatMessages;
window.applyNameBgToUsernameEl = applyNameBgToUsernameEl;

console.log('✅ profile-appearance.js v8 loaded');
