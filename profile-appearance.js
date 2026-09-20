// ==============================================
// profile-appearance.js v11 — Modal موحد
// ==============================================

var NameBgState = {
    enabled: false,
    direction: 'diagonal',
    colors: ['#ff006e', '#8338ec', '#3a86ff'],
    positions: [0, 50, 100]
};

/* ══════════════════════════════════════════════ */
/* تطبيق كل التأثيرات                            */
/* ══════════════════════════════════════════════ */
function applyAllNameStyles() {
    var el = document.getElementById('profile-username');
    if (!el) return;

    var user = (typeof targetUser !== 'undefined' && targetUser) 
             ? targetUser 
             : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : {});

    // استخدم NameEffects
    if (window.NameEffects && typeof window.NameEffects.apply === 'function') {
        window.NameEffects.apply(el, {
            nameColor: user.nameColor,
            nameGradient: user.nameGradient,
            nameBgGradient: user.nameBgGradient,
            nameGlow: user.nameGlow,
            nameShape: user.nameShape,
            nameFrame: user.nameFrame,
            color: user.color || '#ffd700'
        });

        if (!el.classList.contains('name-color-active') &&
            !el.classList.contains('name-gradient-active') &&
            !el.className.includes('nf-')) {
            el.style.color = user.color || '#ffd700';
        }
    }
}

/* ══════════════════════════════════════════════ */
/* Modal موحد لتخصيص الاسم                        */
/* ══════════════════════════════════════════════ */
var _currentNameTab = 'color';

function openNameCustomizeModal(tab) {
    _currentNameTab = tab || 'color';

    var modal = document.getElementById('name-customize-modal');
    if (!modal) return;

    // ربط التبويبات
    modal.querySelectorAll('#name-customize-tabs .modal-tab').forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-pick') === _currentNameTab);
        t.onclick = function () {
            _currentNameTab = t.getAttribute('data-pick');
            renderNameCustomizeContent();
            modal.querySelectorAll('#name-customize-tabs .modal-tab').forEach(function (x) {
                x.classList.toggle('active', x.getAttribute('data-pick') === _currentNameTab);
            });
        };
    });

    // معاينة
    updateNamePreview();

    renderNameCustomizeContent();
    modal.classList.add('active');
}

function updateNamePreview() {
    var preview = document.getElementById('name-preview-el');
    if (!preview) return;
    var user = (typeof targetUser !== 'undefined' && targetUser) 
             ? targetUser 
             : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : {});
    preview.textContent = user.name || 'اسمك هنا';

    // تطبيق التأثيرات على المعاينة
    if (window.NameEffects && typeof window.NameEffects.apply === 'function') {
        window.NameEffects.apply(preview, {
            nameColor: user.nameColor,
            nameGradient: user.nameGradient,
            nameBgGradient: user.nameBgGradient,
            nameGlow: user.nameGlow,
            nameShape: user.nameShape,
            nameFrame: user.nameFrame,
            color: user.color || '#ffd700'
        });
    }
}

function renderNameCustomizeContent() {
    var grid = document.getElementById('name-customize-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var user = (typeof targetUser !== 'undefined' && targetUser) 
             ? targetUser 
             : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : {});

    if (_currentNameTab === 'color') {
        // شبكة ألوان
        (typeof COLORS !== 'undefined' ? COLORS : []).forEach(function (c) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            if (user.nameColor === c) d.classList.add('selected');
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = c;
            p.innerText = user.name || 'اسمك';
            d.appendChild(p);
            d.onclick = function () {
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameColor = c;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameColor = c;
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameGradient = null;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameGradient = null;
                applyAllNameStyles();
                updateNamePreview();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
            };
            grid.appendChild(d);
        });
    } else if (_currentNameTab === 'gradient') {
        (typeof GRADS !== 'undefined' ? GRADS : []).forEach(function (g) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.background = 'linear-gradient(90deg,' + g[0] + ',' + g[1] + ',' + g[0] + ')';
            p.style.backgroundSize = '200% 200%';
            p.style.webkitBackgroundClip = 'text';
            p.style.backgroundClip = 'text';
            p.style.webkitTextFillColor = 'transparent';
            p.innerText = user.name || 'اسمك';
            d.appendChild(p);
            d.onclick = function () {
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameGradient = g;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameGradient = g;
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameColor = null;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameColor = null;
                applyAllNameStyles();
                updateNamePreview();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
            };
            grid.appendChild(d);
        });
    } else if (_currentNameTab === 'bg') {
        // ألوان جاهزة للخلفية
        var presets = [
            ['#ff006e', '#8338ec', '#3a86ff'],
            ['#f72585', '#b5179e', '#7209b7'],
            ['#ff4d00', '#ff8800', '#ffcc00'],
            ['#00f5d4', '#00bbf9', '#0077b6'],
            ['#06ffa5', '#00cc66', '#009944'],
            ['#ffd700', '#ff8c00', '#8b0000'],
            ['#a855f7', '#ec4899', '#f43f5e'],
            ['#0ea5e9', '#06b6d4', '#14b8a6'],
            ['#f59e0b', '#ef4444', '#b91c1c'],
            ['#1e293b', '#334155', '#475569'],
            ['#ffffff', '#cccccc', '#808080'],
            ['#000000', '#333333', '#666666']
        ];
        presets.forEach(function (p) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            var pEl = document.createElement('div');
            pEl.className = 'picker-prev';
            pEl.style.background = 'linear-gradient(135deg, ' + p[0] + ', ' + p[1] + ', ' + p[2] + ')';
            pEl.style.color = '#fff';
            pEl.innerText = user.name || 'اسمك';
            pEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
            d.appendChild(pEl);
            d.onclick = function () {
                var g = { enabled: true, direction: 'diagonal', colors: p, positions: [0, 50, 100] };
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameBgGradient = g;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameBgGradient = g;
                applyAllNameStyles();
                updateNamePreview();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
            };
            grid.appendChild(d);
        });

        // زر إزالة
        var removeBtn = document.createElement('div');
        removeBtn.className = 'picker-item';
        removeBtn.style.gridColumn = '1 / -1';
        removeBtn.innerHTML = '<div style="color:#ff7777;font-weight:900;font-size:13px;">🗑️ إزالة الخلفية</div>';
        removeBtn.onclick = function () {
            if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameBgGradient = null;
            if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameBgGradient = null;
            applyAllNameStyles();
            updateNamePreview();
            if (typeof saveToChat === 'function') saveToChat();
            if (typeof toast === 'function') toast('✅ تم');
        };
        grid.appendChild(removeBtn);
    } else if (_currentNameTab === 'glow') {
        var glows = [
            { id: 'none', name: 'بدون' },
            { id: 'soft', name: 'خفيف' },
            { id: 'medium', name: 'متوسط' },
            { id: 'strong', name: 'قوي' }
        ];
        glows.forEach(function (g) {
            var d = document.createElement('div');
            d.className = 'picker-item';
            if (user.nameGlow === g.id || (!user.nameGlow && g.id === 'none')) d.classList.add('selected');
            var p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = '#ffd700';
            p.innerText = user.name || 'اسمك';
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
                if (typeof currentUser !== 'undefined' && currentUser) currentUser.nameGlow = g.id === 'none' ? null : g.id;
                if (typeof targetUser !== 'undefined' && targetUser) targetUser.nameGlow = g.id === 'none' ? null : g.id;
                applyAllNameStyles();
                updateNamePreview();
                if (typeof saveToChat === 'function') saveToChat();
                if (typeof toast === 'function') toast('✅ تم');
            };
            grid.appendChild(d);
        });
    }
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
    else if (bgType === 'image') {
        layer.style.backgroundImage = 'url("' + bgValue + '")';
        layer.style.backgroundSize = 'contain';
        layer.style.backgroundPosition = 'center center';
        layer.style.backgroundRepeat = 'no-repeat';
        layer.style.background = 'url("' + bgValue + '") center center / contain no-repeat #050508';
    }
    else if (bgType === 'video') {
        var v = document.createElement('video');
        v.src = bgValue;
        v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
        v.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#050508;position:absolute;inset:0;';
        layer.appendChild(v);
    }
}

/* ══════════════════════════════════════════════ */
/* Modal خلفية البروفايل                          */
/* ══════════════════════════════════════════════ */
function openProfileBgModal() {
    var modal = document.getElementById('profile-bg-modal');
    if (!modal) return;

    modal.querySelectorAll('#bg-type-tabs .modal-tab').forEach(function (t) {
        t.onclick = function () {
            modal.querySelectorAll('#bg-type-tabs .modal-tab').forEach(function (x) { x.classList.remove('active'); });
            t.classList.add('active');
            renderBgContent(t.getAttribute('data-bg'));
        };
    });

    renderBgContent('color');
    modal.classList.add('active');
}

function renderBgContent(type) {
    var area = document.getElementById('bg-content-area');
    if (!area) return;
    area.innerHTML = '';

    if (type === 'color') {
        // ⭐ منتقي لون فعلي
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:10px;';

        var inputWrap = document.createElement('div');
        inputWrap.style.cssText = 'display:flex;align-items:center;gap:12px;justify-content:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;';
        var input = document.createElement('input');
        input.type = 'color';
        input.value = bgType === 'color' ? (bgValue || '#050508') : '#050508';
        input.style.cssText = 'width:80px;height:60px;border:2px solid #ffd700;border-radius:10px;background:transparent;cursor:pointer;';
        var code = document.createElement('div');
        code.style.cssText = 'color:#fff;font-family:monospace;font-size:14px;font-weight:900;';
        code.textContent = input.value;
        input.oninput = function () { code.textContent = this.value; };
        inputWrap.appendChild(input);
        inputWrap.appendChild(code);
        wrap.appendChild(inputWrap);

        // عينات سريعة
        var quick = document.createElement('div');
        quick.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:6px;';
        ['#050508','#0a0518','#1a0e2e','#4a148c','#8b0000','#000000',
         '#d4af37','#ffd700','#ff006e','#00f5d4','#84cc16','#3b82f6'].forEach(function (c) {
            var b = document.createElement('div');
            b.style.cssText = 'aspect-ratio:1;border-radius:6px;cursor:pointer;border:2px solid rgba(255,215,0,0.3);background:' + c;
            b.onclick = function () {
                input.value = c;
                code.textContent = c;
            };
            quick.appendChild(b);
        });
        wrap.appendChild(quick);

        var saveBtn = document.createElement('button');
        saveBtn.textContent = '✓ حفظ';
        saveBtn.style.cssText = 'padding:12px;background:#84cc16;color:#fff;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;';
        saveBtn.onclick = function () {
            bgType = 'color';
            bgValue = input.value;
            localStorage.setItem('profile_bg_type', 'color');
            localStorage.setItem('profile_bg_value', bgValue);
            applyBg();
            if (typeof saveToChat === 'function') saveToChat();
            if (typeof toast === 'function') toast('✅ تم');
            closeModal('profile-bg-modal');
        };
        wrap.appendChild(saveBtn);
        area.appendChild(wrap);
    } else if (type === 'image') {
        var wrap2 = document.createElement('div');
        wrap2.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:10px;';
        var uploadBtn = document.createElement('button');
        uploadBtn.textContent = '📤 اختيار صورة من الجهاز';
        uploadBtn.style.cssText = 'padding:16px;background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;';
        uploadBtn.onclick = function () {
            var inp = document.getElementById('profile-bg-input');
            if (inp) {
                inp.setAttribute('accept', 'image/*');
                inp.click();
            }
        };
        wrap2.appendChild(uploadBtn);

        var urlInput = document.createElement('input');
        urlInput.type = 'url';
        urlInput.placeholder = 'أو الصق رابط صورة...';
        urlInput.style.cssText = 'padding:12px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:10px;color:#fff;font-family:inherit;text-align:right;';
        wrap2.appendChild(urlInput);

        var saveBtn2 = document.createElement('button');
        saveBtn2.textContent = '✓ حفظ الرابط';
        saveBtn2.style.cssText = 'padding:12px;background:#84cc16;color:#fff;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;';
        saveBtn2.onclick = function () {
            var u = urlInput.value.trim();
            if (!u) return;
            bgType = 'image';
            bgValue = u;
            localStorage.setItem('profile_bg_type', 'image');
            localStorage.setItem('profile_bg_value', u);
            applyBg();
            if (typeof saveToChat === 'function') saveToChat();
            if (typeof toast === 'function') toast('✅ تم');
            closeModal('profile-bg-modal');
        };
        wrap2.appendChild(saveBtn2);
        area.appendChild(wrap2);
    } else if (type === 'video') {
        var wrap3 = document.createElement('div');
        wrap3.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:10px;';
        var uploadBtn2 = document.createElement('button');
        uploadBtn2.textContent = '📤 اختيار فيديو من الجهاز';
        uploadBtn2.style.cssText = 'padding:16px;background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;';
        uploadBtn2.onclick = function () {
            var inp = document.getElementById('profile-bg-input');
            if (inp) {
                inp.setAttribute('accept', 'video/*');
                inp.click();
            }
        };
        wrap3.appendChild(uploadBtn2);
        var note = document.createElement('div');
        note.style.cssText = 'color:#888;font-size:11px;text-align:center;padding:8px;';
        note.textContent = '⚠️ الفيديو من الجهاز فقط (حجم صغير)';
        wrap3.appendChild(note);
        area.appendChild(wrap3);
    }
}

/* ══════════════════════════════════════════════ */
/* initCover + initAvatar                        */
/* ══════════════════════════════════════════════ */
function initCover() {
    var ci = document.getElementById('cover-file-input');
    var cc = document.getElementById('btn-change-cover');
    var rc = document.getElementById('btn-remove-cover');
    var cimg = document.getElementById('profile-cover-img');
    if (cc && ci) cc.onclick = function () { ci.click(); };
    if (ci) ci.onchange = async function (e) {
        var f = e.target.files[0]; if (!f) return;
        var u = await uploadLoad(f, 5);
        if (u) {
            if (cimg) { cimg.src = u; cimg.style.display = 'block'; }
            localStorage.setItem('saved_cover', u);
            if (typeof saveToChat === 'function') saveToChat();
        }
    };
    if (rc && cimg) rc.onclick = function () {
        cimg.src = '';
        cimg.style.display = 'none';
        localStorage.removeItem('saved_cover');
        if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/cover').remove().catch(function () {});
        if (typeof saveToChat === 'function') saveToChat();
        if (typeof toast === 'function') toast('✅ تم');
    };
}

function initAvatar() {
    var ai = document.getElementById('avatar-file-input');
    var ca = document.getElementById('btn-change-avatar');
    var ra = document.getElementById('btn-remove-avatar');
    var aimg = document.getElementById('profile-avatar-img');
    if (ca && ai) ca.onclick = function () { ai.click(); };
    if (ai) ai.onchange = async function (e) {
        var f = e.target.files[0]; if (!f) return;
        var u = await uploadLoad(f, 5);
        if (u) {
            if (aimg) aimg.src = u;
            localStorage.setItem('saved_avatar', u);
            if (typeof saveToChat === 'function') saveToChat();
        }
    };
    if (ra && aimg) ra.onclick = function () {
        aimg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent((currentUser && currentUser.name) || 'User') + '&background=555&color=fff';
        localStorage.removeItem('saved_avatar');
        if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/avatar').remove().catch(function () {});
        if (typeof saveToChat === 'function') saveToChat();
        if (typeof toast === 'function') toast('✅ تم');
    };
}

/* ══════════════════════════════════════════════ */
/* initAppearance                                */
/* ══════════════════════════════════════════════ */
function initAppearance() {
    if (typeof viewMode === 'undefined' || viewMode !== 'owner') return;

    // ⭐ زر موحد لتخصيص الاسم
    var bcn = document.getElementById('btn-customize-name');
    if (bcn) bcn.onclick = function () { openNameCustomizeModal('color'); };

    // حجم الإطار فقط
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
    if (bb) bb.onclick = function () { openProfileBgModal(); };

    // استقبال ملف الخلفية
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
                closeModal('profile-bg-modal');
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
            closeModal('profile-bg-modal');
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

    // أزرار الغلاف والأفاتار
    initCover();
    initAvatar();

    // زر مغادرة الغرفة
    var lrb = document.getElementById('btn-leave-room');
    if (lrb) lrb.onclick = function () {
        if (!confirm('مغادرة الغرفة؟')) return;
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ action: 'leaveRoom' }, '*');
            }
        } catch(e) {}
        try { window.parent.postMessage({ action: 'closeProfile' }, '*'); } catch(e) {}
    };

    // حذف الحساب
    var dab = document.getElementById('btn-delete-account');
    if (dab) dab.onclick = function () {
        if (!confirm('⚠️ حذف الحساب نهائياً؟')) return;
        var email = prompt('اكتب إيميلك للتأكيد:');
        if (!email) return;
        if (typeof logout === 'function') logout().then(function() { location.reload(); });
    };
}

/* ══════════════════════════════════════════════ */
/* زر تبديل الوضع (مالك/زائر)                     */
/* ══════════════════════════════════════════════ */
function setupModeToggle() {
    var btn = document.getElementById('btn-mode-toggle');
    if (!btn) return;
    if (btn.__setup) return;
    btn.__setup = true;

    btn.onclick = function () {
        if (typeof viewMode === 'undefined') return;
        if (viewMode === 'owner') {
            // التبديل لوضع الزائر
            var uid = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.uid : null;
            if (!uid) return;
            if (typeof currentUser !== 'undefined' && currentUser) {
                localStorage.setItem('profile_target_data_' + uid, JSON.stringify(currentUser));
            }
            location.href = 'profile.html?uid=' + uid;
        } else {
            // عودة للمالك
            location.href = 'profile.html?owner=1';
        }
    };
}

/* ══════════════════════════════════════════════ */
/* زر الطي (وضع الزائر)                          */
/* ══════════════════════════════════════════════ */
function setupCollapseToggle() {
    var btn = document.getElementById('btn-collapse-info');
    if (!btn) return;
    if (btn.__setup) return;
    btn.__setup = true;

    btn.onclick = function () {
        var isCollapsed = document.body.classList.toggle('visitor-collapsed');
        btn.textContent = isCollapsed ? '👁️' : '👁️‍🗨️';
        btn.title = isCollapsed ? 'إظهار المعلومات' : 'طي المعلومات';
    };
}

/* ══════════════════════════════════════════════ */
/* Exports                                       */
/* ══════════════════════════════════════════════ */
window.applyAllNameStyles = applyAllNameStyles;
window.applyGlow = applyGlow;
window.applyBg = applyBg;
window.initAppearance = initAppearance;
window.openNameCustomizeModal = openNameCustomizeModal;
window.openProfileBgModal = openProfileBgModal;
window.setupModeToggle = setupModeToggle;
window.setupCollapseToggle = setupCollapseToggle;
window.NameBgState = NameBgState;

console.log('✅ profile-appearance.js v11 loaded');
