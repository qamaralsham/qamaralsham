// ==============================================
// profile-appearance.js v9 — مبني على NameEffects
// ==============================================
// ✅ v9:
//   1. إزالة CSS المكرر (نُقل إلى name-effects.css)
//   2. استخدام NameEffects.apply بدل التكرار
//   3. الاحتفاظ بجميع النوافذ (ألوان/تدرجات/توهج/خلفية مخصصة)
//   4. توافق كامل مع profile-core.js v4
// ==============================================

/* ══════════════════════════════════════════════ */
/* NameBgState — لاختيار خلفية الاسم المخصصة      */
/* ══════════════════════════════════════════════ */
var NameBgState = {
    enabled: false,
    direction: 'diagonal',
    colors: ['#ff006e', '#8338ec', '#3a86ff'],
    positions: [0, 50, 100]
};

/* ══════════════════════════════════════════════ */
/* CSS للنوافذ (name-bg modal فقط)               */
/* ══════════════════════════════════════════════ */
(function injectModalCSS() {
    if (document.getElementById('name-bg-modal-css')) return;
    var s = document.createElement('style');
    s.id = 'name-bg-modal-css';
    s.textContent = `
#name-bg-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.88);
    display: none;
    justify-content: center; align-items: center;
    z-index: 99999; padding: 15px; direction: rtl;
}
#name-bg-modal.active { display: flex; }
#name-bg-modal .bg-modal-box {
    background: #110724;
    border: 2px solid #ffd700;
    border-radius: 18px; padding: 18px;
    width: 100%; max-width: 420px; max-height: 92vh;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'Cairo', sans-serif; color: #fff;
    scrollbar-width: none;
}
#name-bg-modal .bg-modal-box::-webkit-scrollbar { display: none; }
#name-bg-modal .bg-modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 8px; border-bottom: 1px solid rgba(255,215,0,0.2);
}
#name-bg-modal .bg-modal-header h3 { color: #ffd700; font-size: 16px; font-weight: 900; margin: 0; }
#name-bg-modal .bg-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #888; padding: 4px 8px; }
#name-bg-modal .bg-preview {
    background: #1a1a20; border-radius: 12px; padding: 16px;
    display: flex; justify-content: center; align-items: center;
    min-height: 70px; border: 2px solid rgba(255,215,0,0.2);
}
#name-bg-modal .bg-preview-name {
    font-size: 18px; font-weight: 900; padding: 3px 14px;
    border-radius: 999px; display: inline-block; color: #fff;
    text-shadow: 0 2px 6px rgba(0,0,0,0.9); position: relative;
}
#name-bg-modal .bg-colors { display: flex; justify-content: space-around; gap: 12px; padding: 8px 0; }
#name-bg-modal .bg-color-wrap {
    position: relative; width: 60px; height: 60px; border-radius: 50%;
    overflow: hidden; cursor: pointer; border: 3px solid rgba(255,215,0,0.3);
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}
#name-bg-modal .bg-color-wrap input[type="color"] {
    position: absolute; inset: -10px; width: 120%; height: 120%;
    border: none; cursor: pointer; background: none; padding: 0;
}
#name-bg-modal .bg-color-wrap input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
#name-bg-modal .bg-color-wrap input[type="color"]::-webkit-color-swatch { border: none; }
#name-bg-modal .bg-directions { display: flex; gap: 8px; justify-content: center; }
#name-bg-modal .bg-dir-btn {
    flex: 1; padding: 10px; background: rgba(255,255,255,0.06);
    border: 2px solid #3b82f6; color: #3b82f6;
    border-radius: 10px; font-weight: 900; font-size: 13px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
}
#name-bg-modal .bg-dir-btn.active { background: #3b82f6; color: #fff; }
#name-bg-modal .bg-slider-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
#name-bg-modal .bg-slider-row label { color: #ccc; font-size: 12px; font-weight: 700; min-width: 140px; text-align: right; }
#name-bg-modal .bg-slider-row input[type="range"] { flex: 1; accent-color: #ffd700; cursor: pointer; }
#name-bg-modal .bg-actions { display: flex; gap: 8px; padding-top: 8px; }
#name-bg-modal .bg-apply-btn {
    flex: 1; padding: 12px; background: #84cc16; color: #fff;
    border: none; border-radius: 10px; font-weight: 900; font-size: 14px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
}
#name-bg-modal .bg-remove-btn {
    padding: 12px 18px; background: #ef4444; color: #fff;
    border: none; border-radius: 10px; font-weight: 900; font-size: 14px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
}
#name-bg-modal .bg-presets { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding-top: 6px; }
#name-bg-modal .bg-preset {
    aspect-ratio: 1; border-radius: 8px; cursor: pointer;
    border: 2px solid rgba(255,215,0,0.2);
    transition: transform 0.15s, border-color 0.15s;
}
#name-bg-modal .bg-preset:hover { transform: scale(1.08); border-color: #ffd700; }
    `;
    document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════ */
/* تطبيق كل التأثيرات — v9 (يستخدم NameEffects)  */
/* ══════════════════════════════════════════════ */
function applyAllNameStyles() {
    var el = document.getElementById('profile-username');
    if (!el) return;

    // استخدم NameEffects المركزي
    if (window.NameEffects && typeof window.NameEffects.apply === 'function') {
        window.NameEffects.apply(el, {
            nameColor: (typeof nameColor !== 'undefined' ? nameColor : null),
            nameGradient: (typeof nameGradient !== 'undefined' ? nameGradient : null),
            nameBgGradient: (typeof NameBgState !== 'undefined' && NameBgState.enabled) ? {
                enabled: true,
                direction: NameBgState.direction,
                colors: NameBgState.colors.slice(),
                positions: NameBgState.positions.slice()
            } : null,
            nameGlow: (typeof nameGlow !== 'undefined' ? nameGlow : 'none'),
            nameShape: (typeof nameShape !== 'undefined' ? nameShape : null),
            nameFrame: (typeof nameFrame !== 'undefined' ? nameFrame : null),
            color: (typeof currentUser !== 'undefined' && currentUser && currentUser.color) || '#ffd700'
        });

        // fallback للّون الافتراضي إذا لم يطبَّق أي تأثير
        if (!el.classList.contains('name-color-active') &&
            !el.classList.contains('name-gradient-active') &&
            !el.className.includes('nf-')) {
            el.style.color = (typeof currentUser !== 'undefined' && currentUser && currentUser.color) || '#ffd700';
        }
    } else {
        // fallback كامل (لو NameEffects ما تحمّل)
        _applyNameStylesFallback(el);
    }

    // تطبيق حجم الاسم
    if (typeof nameSize !== 'undefined' && nameSize) {
        el.style.fontSize = nameSize + 'px';
    }
}

/* ══════════════════════════════════════════════ */
/* Fallback: تطبيق يدوي                           */
/* ══════════════════════════════════════════════ */
function _applyNameStylesFallback(el) {
    if (!el) return;

    // نظف
    var toRemove = [];
    el.classList.forEach(function (c) {
        if (c.indexOf('nf-') === 0 || c.indexOf('name-') === 0 ||
            c === 'glow-soft' || c === 'glow-medium' || c === 'glow-strong' ||
            c === 'text-gradient') toRemove.push(c);
    });
    toRemove.forEach(function (c) { el.classList.remove(c); });
    el.style.cssText = '';

    var hasBg = (typeof NameBgState !== 'undefined' && NameBgState.enabled);
    var hasGradient = (typeof nameGradient !== 'undefined' && nameGradient && nameGradient.length >= 2);
    var hasColor = (typeof nameColor !== 'undefined' && !!nameColor);
    var hasGlow = (typeof nameGlow !== 'undefined' && nameGlow && nameGlow !== 'none');

    // الخلفية
    if (hasBg) {
        el.classList.add('name-has-effects', 'name-bg-active');
        var angle = 90;
        if (NameBgState.direction === 'vertical') angle = 180;
        else if (NameBgState.direction === 'diagonal') angle = 135;
        var c = NameBgState.colors, p = NameBgState.positions;
        var grad = 'linear-gradient(' + angle + 'deg, ' +
            c[0] + ' ' + p[0] + '%, ' +
            c[1] + ' ' + p[1] + '%, ' +
            c[2] + ' ' + p[2] + '%)';
        el.style.setProperty('--name-bg', grad);
    }

    // التدرج أو اللون
    if (hasGradient) {
        el.classList.add('name-gradient-active');
        el.style.setProperty('--name-gradient', 'linear-gradient(90deg, ' + nameGradient[0] + ', ' + nameGradient[1] + ', ' + nameGradient[0] + ')');
    } else if (hasColor) {
        el.classList.add('name-color-active');
        el.style.setProperty('--name-color', nameColor);
    } else if (hasBg) {
        el.classList.add('name-color-active');
        el.style.setProperty('--name-color', '#ffffff');
    }

    // التوهج
    if (hasGlow) {
        var glowColor = hasColor ? nameColor : (hasGradient ? nameGradient[0] : '#ffffff');
        el.style.setProperty('--name-glow-color', glowColor);
        el.classList.add('name-glow-' + nameGlow);
    }
}

/* ══════════════════════════════════════════════ */
/* التوافق القديم                                  */
/* ══════════════════════════════════════════════ */
function applyNameColor() { applyAllNameStyles(); }
function applyNameGradient() { applyAllNameStyles(); }
function applyNameGlow() { applyAllNameStyles(); }
function applyNameBg() { applyAllNameStyles(); }
function applyNameFrame() {}
function applyNameShape() {}
function clearNameStyles() {
    var el = document.getElementById('profile-username');
    if (el) el.style.cssText = '';
}
function reapplyShapeFrame() {}
function updateShapeLbl() {}

function updateGlowLbl() {
    var b = document.getElementById('btn-name-glow');
    if (b && typeof GLOWS !== 'undefined') {
        var f = GLOWS.find(function (x) { return x.id === nameGlow; });
        b.innerText = f ? f.name : 'تغيير';
    }
}

/* ══════════════════════════════════════════════ */
/* خلفية الاسم المخصصة — Modal                    */
/* ══════════════════════════════════════════════ */
var PRESETS = [
    ['#ff006e', '#8338ec', '#3a86ff'], ['#f72585', '#b5179e', '#7209b7'],
    ['#ff4d00', '#ff8800', '#ffcc00'], ['#00f5d4', '#00bbf9', '#0077b6'],
    ['#06ffa5', '#00cc66', '#009944'], ['#ffd700', '#ff8c00', '#8b0000'],
    ['#a855f7', '#ec4899', '#f43f5e'], ['#0ea5e9', '#06b6d4', '#14b8a6'],
    ['#f59e0b', '#ef4444', '#b91c1c'], ['#1e293b', '#334155', '#475569'],
    ['#ffffff', '#cccccc', '#808080'], ['#000000', '#333333', '#666666']
];

function buildGradientCSS(state) {
    var angle = 90;
    if (state.direction === 'vertical') angle = 180;
    else if (state.direction === 'diagonal') angle = 135;
    var c = state.colors, p = state.positions;
    return 'linear-gradient(' + angle + 'deg, ' + c[0] + ' ' + p[0] + '%, ' + c[1] + ' ' + p[1] + '%, ' + c[2] + ' ' + p[2] + '%)';
}

function setColor(i, v) {
    NameBgState.colors[i] = v;
    updatePreview();
}
function setPosition(i, v) {
    NameBgState.positions[i] = parseInt(v);
    updatePreview();
}
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
                '<button class="bg-modal-close" onclick="closeNameBgModal()" type="button">✕</button>' +
            '</div>' +
            '<div class="bg-preview"><span class="bg-preview-name" id="name-bg-preview-name">اسمك هنا</span></div>' +
            '<div class="bg-colors">' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[0] + '"><input type="color" id="bg-color-0" value="' + NameBgState.colors[0] + '"></div>' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[1] + '"><input type="color" id="bg-color-1" value="' + NameBgState.colors[1] + '"></div>' +
                '<div class="bg-color-wrap" style="background:' + NameBgState.colors[2] + '"><input type="color" id="bg-color-2" value="' + NameBgState.colors[2] + '"></div>' +
            '</div>' +
            '<div class="bg-directions">' +
                '<button class="bg-dir-btn" data-dir="vertical" onclick="setDirection(\'vertical\')" type="button">عمودي</button>' +
                '<button class="bg-dir-btn" data-dir="horizontal" onclick="setDirection(\'horizontal\')" type="button">أفقي</button>' +
                '<button class="bg-dir-btn active" data-dir="diagonal" onclick="setDirection(\'diagonal\')" type="button">مختلط</button>' +
            '</div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-0" min="0" max="100" value="' + NameBgState.positions[0] + '"><label>اتجاه اللون الأول :</label></div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-1" min="0" max="100" value="' + NameBgState.positions[1] + '"><label>اتجاه اللون الثاني :</label></div>' +
            '<div class="bg-slider-row"><input type="range" id="bg-slider-2" min="0" max="100" value="' + NameBgState.positions[2] + '"><label>اتجاه اللون الثالث :</label></div>' +
            '<div class="bg-actions">' +
                '<button class="bg-remove-btn" onclick="removeNameBg()" type="button">🗑️</button>' +
                '<button class="bg-apply-btn" onclick="applyAndSaveNameBg()" type="button">✓ تغيير خلفية الاسم</button>' +
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

/* ══════════════════════════════════════════════ */
/* openNamePicker — اختيار اللون/التدرج/التوهج   */
/* ══════════════════════════════════════════════ */
function openNamePicker(tab) {
    if (tab === 'shape') { openNameBgModal(); return; }
    if (tab === 'frame') return;

    document.querySelectorAll('#name-tabs .modal-tab').forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-pick') === tab);
        t.onclick = function () { openNamePicker(t.getAttribute('data-pick')); };
    });

    var grid = document.getElementById('name-picker-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var realName = (typeof viewMode !== 'undefined' && viewMode === 'owner' && typeof currentUser !== 'undefined' && currentUser && currentUser.name)
        ? currentUser.name
        : ((typeof targetUser !== 'undefined' && targetUser && targetUser.name) || 'مستخدم');

    if (tab === 'color') {
        COLORS.forEach(function (c) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            if (typeof nameColor !== 'undefined' && nameColor === c) d.classList.add('selected');
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = c;
            p.innerText = realName;
            d.appendChild(p);
            d.onclick = function () {
                nameColor = c;
                nameGradient = null;
                localStorage.setItem('name_color', c);
                localStorage.removeItem('name_gradient');
                applyAllNameStyles();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    } else if (tab === 'gradient') {
        GRADS.forEach(function (g) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.background = 'linear-gradient(90deg,' + g[0] + ',' + g[1] + ',' + g[0] + ')';
            p.style.backgroundSize = '200% 200%';
            p.style.webkitBackgroundClip = 'text';
            p.style.backgroundClip = 'text';
            p.style.webkitTextFillColor = 'transparent';
            p.innerText = realName;
            d.appendChild(p);
            d.onclick = function () {
                nameGradient = g;
                nameColor = null;
                localStorage.setItem('name_gradient', JSON.stringify(g));
                localStorage.removeItem('name_color');
                applyAllNameStyles();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    } else if (tab === 'glow') {
        GLOWS.forEach(function (g) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            if (typeof nameGlow !== 'undefined' && nameGlow === g.id) d.classList.add('selected');
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = '#ffd700';
            p.innerText = realName;
            if (g.id === 'soft') p.style.textShadow = '0 0 4px #ffd700';
            else if (g.id === 'medium') p.style.textShadow = '0 0 6px #ffd700, 0 0 12px #ffd700';
            else if (g.id === 'strong') p.style.textShadow = '0 0 8px #ffd700, 0 0 16px #ffd700, 0 0 24px #ffd700';
            d.appendChild(p);
            var lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            lbl.textContent = g.name;
            d.style.flexDirection = 'column';
            d.appendChild(lbl);
            d.onclick = function () {
                nameGlow = g.id;
                localStorage.setItem('name_glow', g.id);
                applyAllNameStyles();
                updateGlowLbl();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }

    openModal('name-picker-modal');
}

/* ══════════════════════════════════════════════ */
/* توهج البروفايل                                 */
/* ══════════════════════════════════════════════ */
function applyGlow(c) {
    var p = document.getElementById('profile-container');
    if (!p) return;
    if (!c) {
        p.classList.remove('glow-active');
        p.style.removeProperty('--glow-color');
    } else {
        p.style.setProperty('--glow-color', c);
        p.classList.add('glow-active');
    }
}

/* ══════════════════════════════════════════════ */
/* خلفية البروفايل                                */
/* ══════════════════════════════════════════════ */
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
        v.src = bgValue;
        v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
        layer.appendChild(v);
    }
}

/* ══════════════════════════════════════════════ */
/* initAppearance — ربط الأزرار                   */
/* ══════════════════════════════════════════════ */
function initAppearance() {
    if (typeof viewMode === 'undefined' || viewMode !== 'owner') return;

    // أزرار الاسم
    var bc = document.getElementById('btn-name-color');
    if (bc) bc.onclick = function () { openNamePicker('color'); };

    var bg = document.getElementById('btn-name-gradient');
    if (bg) bg.onclick = function () { openNamePicker('gradient'); };

    var bnf = document.getElementById('btn-name-shape') || document.getElementById('btn-name-bg');
    if (bnf) bnf.onclick = function () { openNameBgModal(); };

    var bgl = document.getElementById('btn-name-glow');
    if (bgl) bgl.onclick = function () { openNamePicker('glow'); };

    // حجم الاسم
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

    // حجم الإطار
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

    // توهج البروفايل
    var pgb = document.getElementById('btn-profile-glow');
    if (pgb) pgb.onclick = function () {
        var g = document.getElementById('profile-glow-grid');
        if (!g) return;
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
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
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

    // خلفية البروفايل
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
                if (typeof saveToChat === 'function') saveToChat();
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
                applyBg();
                if (typeof saveToChat === 'function') saveToChat();
            };
            r.readAsDataURL(f);
            return;
        }
        var u = await uploadLoad(f, 5);
        if (u) {
            bgValue = u; bgType = 'image';
            localStorage.setItem('profile_bg_type', 'image');
            localStorage.setItem('profile_bg_value', u);
            applyBg();
            if (typeof saveToChat === 'function') saveToChat();
        }
    };

    // الموسيقى
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
            if (typeof saveToChat === 'function') saveToChat();
            if (typeof toast === 'function') toast('✅ تم تعيين الموسيقى');
        };
        r.readAsDataURL(f);
    };

    // إطار الأفاتار
    var fb = document.getElementById('avatar-frame-motion');
    if (fb) fb.onclick = function () {
        var modal = document.getElementById('frames-modal');
        if (modal) modal.classList.add('active');
        if (typeof renderFramesGrid === 'function') {
            renderFramesGrid(document.getElementById('frames-container'));
        }
    };
}

/* ══════════════════════════════════════════════ */
/* عند التحميل — تطبيق التأثيرات المحفوظة          */
/* ══════════════════════════════════════════════ */
window.addEventListener('load', function () {
    setTimeout(function () {
        // اقرأ خلفية الاسم من currentUser
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

/* ══════════════════════════════════════════════ */
/* تصدير                                         */
/* ══════════════════════════════════════════════ */
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
window.applyNameColor = applyNameColor;
window.applyNameGradient = applyNameGradient;
window.applyNameGlow = applyNameGlow;
window.applyNameBg = applyNameBg;
window.updateGlowLbl = updateGlowLbl;
window.applyGlow = applyGlow;
window.applyBg = applyBg;
window.openNamePicker = openNamePicker;
window.initAppearance = initAppearance;

console.log('✅ profile-appearance.js v9 loaded — built on NameEffects');
