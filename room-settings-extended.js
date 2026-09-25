// ==============================================
// room-settings-extended.js v1 — إعدادات الغرف الكاملة
// ==============================================
// ✅ v1:
//   1. Override على زر ✏️ في تبويب الغرف
//   2. Dialog موسّع فيه كل الإعدادات
//   3. رفع صور (أيقونة + خلفية)
//   4. تحكم كامل: الاسم، الأيقونة، الخلفية، الألوان، الترحيب، المايكات
// ==============================================

(function () {
    'use strict';
    if (window.__roomSettingsExtendedV1) return;
    window.__roomSettingsExtendedV1 = true;

    function getMe() {
        try { if (typeof getCurrentUser === 'function') return getCurrentUser(); } catch (e) {}
        try {
            return JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || 'null');
        } catch (e) { return null; }
    }
    function myLevel() {
        var u = getMe(); if (!u) return 0;
        return (typeof getRankLevel === 'function') ? getRankLevel(u.rank) : (u.rankLevel || 0);
    }
    function toast(icon, msg) {
        if (typeof showToast === 'function') showToast(icon, msg);
        else console.log('[RoomSettings]', icon, msg);
    }
    function esc(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    /* ══════════════════════════════════════════════ */
    /* CSS                                            */
    /* ══════════════════════════════════════════════ */
    (function injectCSS() {
        if (document.getElementById('room-settings-ext-css')) return;
        var s = document.createElement('style');
        s.id = 'room-settings-ext-css';
        s.textContent = `
#rse-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.9);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9999999;
    display: none;
    justify-content: center;
    align-items: center;
    padding: 12px;
    direction: rtl;
    font-family: Cairo, sans-serif;
}
#rse-overlay.active { display: flex; }
#rse-box {
    background: #0a0616;
    border: 2px solid #ffd700;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.35);
}
#rse-header {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,215,0,0.25);
    background: linear-gradient(135deg, rgba(255,215,0,0.12), rgba(0,0,0,0.4));
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
#rse-header h3 {
    color: #ffd700;
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 8px;
}
#rse-close {
    background: rgba(255,68,68,0.2);
    border: 1px solid rgba(255,68,68,0.5);
    color: #ff7777;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    font-weight: 900;
    padding: 0;
}
#rse-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,215,0,0.4) transparent;
}
#rse-body::-webkit-scrollbar { width: 5px; }
#rse-body::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.4); border-radius: 5px; }
.rse-group {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,215,0,0.15);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
}
.rse-group-title {
    color: #ffd700;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px dashed rgba(255,215,0,0.2);
}
.rse-field { margin-bottom: 10px; }
.rse-field:last-child { margin-bottom: 0; }
.rse-field label {
    display: block;
    color: #ccc;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 4px;
}
.rse-field input[type="text"],
.rse-field input[type="number"],
.rse-field textarea,
.rse-field select {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,215,0,0.3);
    border-radius: 10px;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    outline: none;
    text-align: right;
    box-sizing: border-box;
}
.rse-field input:focus,
.rse-field textarea:focus,
.rse-field select:focus {
    border-color: #ffd700;
    background: rgba(255,255,255,0.09);
}
.rse-field textarea { min-height: 70px; resize: vertical; line-height: 1.5; }
.rse-field input[type="color"] {
    width: 100%;
    height: 42px;
    border: 2px solid rgba(255,215,0,0.3);
    border-radius: 10px;
    cursor: pointer;
    background: transparent;
    padding: 2px;
    box-sizing: border-box;
}
.rse-field select option { background: #110724; color: #fff; }
.rse-preview {
    padding: 10px;
    border: 1px dashed rgba(255,215,0,0.3);
    border-radius: 10px;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,0,0,0.3);
}
.rse-preview .rse-prev-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    background: rgba(255,215,0,0.1);
    border: 1px solid rgba(255,215,0,0.3);
    overflow: hidden;
    flex-shrink: 0;
}
.rse-preview .rse-prev-icon img { width: 100%; height: 100%; object-fit: cover; }
.rse-preview .rse-prev-name { font-weight: 900; font-size: 13px; }
.rse-img-preview {
    margin-top: 6px;
    width: 100%;
    height: 90px;
    border-radius: 10px;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,215,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}
.rse-img-preview img { width: 100%; height: 100%; object-fit: cover; }
.rse-img-preview .empty { color: #666; font-size: 11px; }
.rse-img-clear {
    position: absolute;
    top: 4px; right: 4px;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: rgba(255,68,68,0.85);
    border: 2px solid #050508;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    display: none;
    align-items: center;
    justify-content: center;
}
.rse-img-preview.has-img .rse-img-clear { display: flex; }
.rse-upload-btn {
    margin-top: 6px;
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.1));
    border: 1px solid rgba(59,130,246,0.5);
    color: #93c5fd;
    border-radius: 10px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
}
#rse-actions {
    padding: 12px;
    border-top: 1px solid rgba(255,215,0,0.2);
    background: rgba(0,0,0,0.4);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
#rse-actions button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
}
#rse-save { background: linear-gradient(135deg, #84cc16, #65a30d); color: #fff; }
#rse-save:disabled { opacity: 0.6; cursor: wait; }
#rse-cancel {
    background: rgba(255,255,255,0.08);
    color: #fff;
    border: 1px solid rgba(255,215,0,0.2);
}
        `;
        document.head.appendChild(s);
    })();

    /* ══════════════════════════════════════════════ */
    /* Open Extended Editor                           */
    /* ══════════════════════════════════════════════ */
    function openExtendedRoomEditor(rid) {
        if (myLevel() < 80) {
            toast('fa-lock', '🔒 Grand Owner+ فقط');
            return;
        }
        var room = (typeof QAMAR !== 'undefined' && QAMAR.ROOMS) ? QAMAR.ROOMS[rid] : null;
        if (!room) {
            toast('fa-times', '⚠️ غرفة غير معروفة');
            return;
        }

        db.ref('room_settings/' + rid).once('value').then(function (s) {
            var c = s.val() || {};
            _showEditor(rid, room, c);
        }).catch(function (e) {
            console.error('openExtendedRoomEditor error:', e);
            _showEditor(rid, room, {});
        });
    }

    function _showEditor(rid, room, c) {
        var ov = document.getElementById('rse-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'rse-overlay';
            ov.innerHTML =
                '<div id="rse-box">' +
                    '<div id="rse-header">' +
                        '<h3>⚙️ إعدادات الغرفة</h3>' +
                        '<button id="rse-close" type="button">✕</button>' +
                    '</div>' +
                    '<div id="rse-body"></div>' +
                    '<div id="rse-actions">' +
                        '<button id="rse-cancel" type="button">إلغاء</button>' +
                        '<button id="rse-save" type="button">💾 حفظ</button>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(ov);
            ov.addEventListener('click', function (e) { if (e.target === ov) closeEditor(); });
            document.getElementById('rse-close').onclick = closeEditor;
            document.getElementById('rse-cancel').onclick = closeEditor;
        }

        var state = {
            rid: rid,
            room: room,
            name: c.name || room.name || '',
            icon: c.icon || room.icon || '🚪',
            iconImage: c.iconImage || null,
            bgType: c.bgType || 'none',
            bgValue: c.bgValue || '#050508',
            bgImage: c.bgImage || null,
            nameColor: c.nameColor || '#ffffff',
            fontColor: c.fontColor || '#ffffff',
            fontSize: c.fontSize || null,
            welcomeText: (c.welcome && c.welcome.text) || '🌟 أهلاً وسهلاً بك {name}\nفي {room}',
            welcomeEnabled: !(c.welcome && c.welcome.enabled === false),
            micCount: (typeof c.micCount === 'number') ? c.micCount : (room.micCount || 4),
            allowMic: (typeof c.allowMic === 'boolean') ? c.allowMic : (room.allowMic !== false),
            maxUsers: (typeof c.maxUsers === 'number') ? c.maxUsers : (room.maxUsers || 0),
            visibleTo: c.visibleTo || room.visibleTo || 'all'
        };

        var body = document.getElementById('rse-body');
        body.innerHTML = _buildBodyHTML(state);
        _bindEvents(state);

        ov.classList.add('active');
    }

    function closeEditor() {
        var ov = document.getElementById('rse-overlay');
        if (ov) ov.classList.remove('active');
    }

    /* ══════════════════════════════════════════════ */
    /* Body Builder                                   */
    /* ══════════════════════════════════════════════ */
    function _buildBodyHTML(state) {
        var visibleToOpts = [
            { v: 'all', l: '🌍 الكل' },
            { v: 'royal', l: '👑 الملك والملكات' },
            { v: 'owner+', l: '🛡️ Owner+' },
            { v: 'grandowner+', l: '💎 Grand Owner+' },
            { v: 'king', l: '👑 الملك فقط' },
            { v: 'jailed', l: '🚔 المسجونون فقط' }
        ];
        var vOpts = '';
        visibleToOpts.forEach(function (o) {
            vOpts += '<option value="' + o.v + '"' + (state.visibleTo === o.v ? ' selected' : '') + '>' + o.l + '</option>';
        });

        var h = '';

        /* ── 1. الهوية ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">🎨 الهوية</div>';
        h += '<div class="rse-preview">';
        h += '<div class="rse-prev-icon" id="rse-prev-icon">';
        if (state.iconImage) h += '<img src="' + esc(state.iconImage) + '">';
        else h += '<span>' + esc(state.icon) + '</span>';
        h += '</div>';
        h += '<div class="rse-prev-name" id="rse-prev-name" style="color:' + esc(state.nameColor) + ';">' + esc(state.name) + '</div>';
        h += '</div>';
        h += '<div class="rse-field" style="margin-top:10px;">';
        h += '<label>الاسم (30 حرف):</label>';
        h += '<input type="text" id="rse-name" maxlength="30" value="' + esc(state.name) + '">';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>الأيقونة (إيموجي):</label>';
        h += '<input type="text" id="rse-icon" maxlength="4" value="' + esc(state.icon) + '">';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>أو صورة الأيقونة:</label>';
        h += '<div class="rse-img-preview' + (state.iconImage ? ' has-img' : '') + '" id="rse-icon-prev">';
        if (state.iconImage) h += '<img src="' + esc(state.iconImage) + '">';
        else h += '<div class="empty">لا صورة</div>';
        h += '<button type="button" class="rse-img-clear" data-clear="icon">✕</button>';
        h += '</div>';
        h += '<button type="button" class="rse-upload-btn" data-upload="icon">📤 رفع صورة الأيقونة</button>';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>لون الاسم في القائمة:</label>';
        h += '<input type="color" id="rse-name-color" value="' + esc(state.nameColor || '#ffffff') + '">';
        h += '</div>';
        h += '</div>';

        /* ── 2. الخلفية ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">🖼️ الخلفية</div>';
        h += '<div class="rse-field">';
        h += '<label>نوع الخلفية:</label>';
        h += '<select id="rse-bg-type">';
        h += '<option value="none"' + (state.bgType === 'none' || !state.bgType ? ' selected' : '') + '>بدون (افتراضي)</option>';
        h += '<option value="color"' + (state.bgType === 'color' ? ' selected' : '') + '>لون</option>';
        h += '<option value="image"' + (state.bgType === 'image' ? ' selected' : '') + '>صورة</option>';
        h += '</select>';
        h += '</div>';
        h += '<div class="rse-field" id="rse-bg-color-field" style="display:' + (state.bgType === 'color' ? 'block' : 'none') + ';">';
        h += '<label>لون الخلفية:</label>';
        h += '<input type="color" id="rse-bg-color" value="' + esc(state.bgValue || '#050508') + '">';
        h += '</div>';
        h += '<div class="rse-field" id="rse-bg-image-field" style="display:' + (state.bgType === 'image' ? 'block' : 'none') + ';">';
        h += '<label>صورة الخلفية:</label>';
        h += '<div class="rse-img-preview' + (state.bgImage ? ' has-img' : '') + '" id="rse-bg-prev">';
        if (state.bgImage) h += '<img src="' + esc(state.bgImage) + '">';
        else h += '<div class="empty">لا صورة</div>';
        h += '<button type="button" class="rse-img-clear" data-clear="bg">✕</button>';
        h += '</div>';
        h += '<button type="button" class="rse-upload-btn" data-upload="bg">📤 رفع صورة الخلفية</button>';
        h += '</div>';
        h += '</div>';

        /* ── 3. الخط ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">📝 خط الشات</div>';
        h += '<div class="rse-field">';
        h += '<label>لون الخط في الشات:</label>';
        h += '<input type="color" id="rse-font-color" value="' + esc(state.fontColor || '#ffffff') + '">';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>حجم الخط (12-28):</label>';
        h += '<input type="number" id="rse-font-size" min="12" max="28" value="' + (state.fontSize || 16) + '">';
        h += '</div>';
        h += '</div>';

        /* ── 4. الترحيب ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">🚪 رسالة الترحيب</div>';
        h += '<div class="rse-field">';
        h += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">';
        h += '<input type="checkbox" id="rse-welcome-enabled"' + (state.welcomeEnabled ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:#84cc16;">';
        h += '<span style="color:#fff;font-size:13px;font-weight:700;">تفعيل الترحيب</span>';
        h += '</label>';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>نص الترحيب (100 حرف):</label>';
        h += '<textarea id="rse-welcome-text" maxlength="100">' + esc(state.welcomeText) + '</textarea>';
        h += '<div style="color:#888;font-size:10px;margin-top:4px;">{name} = اسم العضو · {room} = اسم الغرفة</div>';
        h += '</div>';
        h += '</div>';

        /* ── 5. المايكات ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">🎙️ المايكات</div>';
        h += '<div class="rse-field">';
        h += '<label>عدد المايكات:</label>';
        h += '<input type="number" id="rse-mic-count" min="0" max="8" value="' + state.micCount + '">';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">';
        h += '<input type="checkbox" id="rse-mic-allow"' + (state.allowMic ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:#84cc16;">';
        h += '<span style="color:#fff;font-size:13px;font-weight:700;">السماح باستخدام المايك</span>';
        h += '</label>';
        h += '</div>';
        h += '</div>';

        /* ── 6. الحدود والرؤية ── */
        h += '<div class="rse-group">';
        h += '<div class="rse-group-title">👥 الحدود والرؤية</div>';
        h += '<div class="rse-field">';
        h += '<label>الحد الأقصى للمستخدمين (0 = بلا حد):</label>';
        h += '<input type="number" id="rse-max-users" min="0" max="500" value="' + state.maxUsers + '">';
        h += '</div>';
        h += '<div class="rse-field">';
        h += '<label>من يرى هذه الغرفة:</label>';
        h += '<select id="rse-visible-to">' + vOpts + '</select>';
        h += '</div>';
        h += '</div>';

        return h;
    }

    /* ══════════════════════════════════════════════ */
    /* Events Binding                                 */
    /* ══════════════════════════════════════════════ */
    function _bindEvents(state) {
        var body = document.getElementById('rse-body');

        function _updatePreview() {
            var nameEl = document.getElementById('rse-prev-name');
            var iconEl = document.getElementById('rse-prev-icon');
            if (nameEl) {
                nameEl.textContent = state.name;
                nameEl.style.color = state.nameColor;
            }
            if (iconEl) {
                if (state.iconImage) iconEl.innerHTML = '<img src="' + esc(state.iconImage) + '">';
                else iconEl.innerHTML = '<span>' + esc(state.icon) + '</span>';
            }
        }

        var nameInp = body.querySelector('#rse-name');
        if (nameInp) nameInp.oninput = function () { state.name = this.value.trim(); _updatePreview(); };

        var iconInp = body.querySelector('#rse-icon');
        if (iconInp) iconInp.oninput = function () { state.icon = this.value.trim() || '🚪'; _updatePreview(); };

        var nameColor = body.querySelector('#rse-name-color');
        if (nameColor) nameColor.oninput = function () { state.nameColor = this.value; _updatePreview(); };

        var bgType = body.querySelector('#rse-bg-type');
        if (bgType) bgType.onchange = function () {
            state.bgType = this.value;
            var cField = document.getElementById('rse-bg-color-field');
            var iField = document.getElementById('rse-bg-image-field');
            if (cField) cField.style.display = (this.value === 'color') ? 'block' : 'none';
            if (iField) iField.style.display = (this.value === 'image') ? 'block' : 'none';
        };

        var bgColor = body.querySelector('#rse-bg-color');
        if (bgColor) bgColor.oninput = function () { state.bgValue = this.value; };

        var fontColor = body.querySelector('#rse-font-color');
        if (fontColor) fontColor.oninput = function () { state.fontColor = this.value; };

        var fontSize = body.querySelector('#rse-font-size');
        if (fontSize) fontSize.oninput = function () {
            var n = parseInt(this.value);
            state.fontSize = (isNaN(n) || n < 12 || n > 28) ? null : n;
        };

        var welEnabled = body.querySelector('#rse-welcome-enabled');
        if (welEnabled) welEnabled.onchange = function () { state.welcomeEnabled = this.checked; };

        var welText = body.querySelector('#rse-welcome-text');
        if (welText) welText.oninput = function () { state.welcomeText = this.value; };

        var micCount = body.querySelector('#rse-mic-count');
        if (micCount) micCount.oninput = function () {
            var n = parseInt(this.value);
            state.micCount = (isNaN(n) || n < 0) ? 0 : Math.min(n, 8);
        };

        var micAllow = body.querySelector('#rse-mic-allow');
        if (micAllow) micAllow.onchange = function () { state.allowMic = this.checked; };

        var maxUsers = body.querySelector('#rse-max-users');
        if (maxUsers) maxUsers.oninput = function () {
            var n = parseInt(this.value);
            state.maxUsers = (isNaN(n) || n < 0) ? 0 : Math.min(n, 500);
        };

        var visibleTo = body.querySelector('#rse-visible-to');
        if (visibleTo) visibleTo.onchange = function () { state.visibleTo = this.value; };

        /* رفع الصور */
        body.querySelectorAll('[data-upload]').forEach(function (btn) {
            btn.onclick = function () {
                var type = btn.getAttribute('data-upload');
                _pickImage(function (url) {
                    if (type === 'icon') {
                        state.iconImage = url;
                        var iconPrev = document.getElementById('rse-icon-prev');
                        if (iconPrev) {
                            iconPrev.classList.add('has-img');
                            iconPrev.innerHTML = '<img src="' + esc(url) + '"><button type="button" class="rse-img-clear" data-clear="icon">✕</button>';
                        }
                        _updatePreview();
                    } else if (type === 'bg') {
                        state.bgImage = url;
                        state.bgType = 'image';
                        var bgSel = document.getElementById('rse-bg-type');
                        if (bgSel) bgSel.value = 'image';
                        var cField2 = document.getElementById('rse-bg-color-field');
                        var iField2 = document.getElementById('rse-bg-image-field');
                        if (cField2) cField2.style.display = 'none';
                        if (iField2) iField2.style.display = 'block';
                        var bgPrev = document.getElementById('rse-bg-prev');
                        if (bgPrev) {
                            bgPrev.classList.add('has-img');
                            bgPrev.innerHTML = '<img src="' + esc(url) + '"><button type="button" class="rse-img-clear" data-clear="bg">✕</button>';
                        }
                    }
                    _rebindClearButtons(state);
                });
            };
        });

        _rebindClearButtons(state);

        /* حفظ */
        var saveBtn = document.getElementById('rse-save');
        if (saveBtn) saveBtn.onclick = function () { _save(state, this); };
    }

    function _rebindClearButtons(state) {
        document.querySelectorAll('[data-clear]').forEach(function (btn) {
            if (btn.__bound) return;
            btn.__bound = true;
            btn.onclick = function (e) {
                e.stopPropagation();
                var type = btn.getAttribute('data-clear');
                if (type === 'icon') {
                    state.iconImage = null;
                    var iconPrev = document.getElementById('rse-icon-prev');
                    if (iconPrev) {
                        iconPrev.classList.remove('has-img');
                        iconPrev.innerHTML = '<div class="empty">لا صورة</div><button type="button" class="rse-img-clear" data-clear="icon">✕</button>';
                    }
                } else if (type === 'bg') {
                    state.bgImage = null;
                    var bgPrev = document.getElementById('rse-bg-prev');
                    if (bgPrev) {
                        bgPrev.classList.remove('has-img');
                        bgPrev.innerHTML = '<div class="empty">لا صورة</div><button type="button" class="rse-img-clear" data-clear="bg">✕</button>';
                    }
                }
            };
        });
    }

    function _pickImage(callback) {
        var inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.style.display = 'none';
        inp.onchange = async function () {
            var f = this.files && this.files[0];
            if (!f) return;
            if (f.size / (1024 * 1024) > 5) {
                toast('fa-exclamation-triangle', '⚠️ الحد الأقصى 5MB');
                return;
            }
            if (!window.UploadService || typeof window.UploadService.upload !== 'function') {
                toast('fa-times', '⚠️ UploadService غير محمّل');
                return;
            }
            toast('fa-spinner', '⏳ جاري الرفع...');
            try {
                var url = await window.UploadService.upload(f);
                if (url) {
                    callback(url);
                    toast('fa-check', '✅ تم الرفع');
                }
            } catch (e) {
                toast('fa-times', '⚠️ فشل: ' + e.message);
            }
        };
        document.body.appendChild(inp);
        inp.click();
        setTimeout(function () { try { inp.remove(); } catch (e) {} }, 60000);
    }

    /* ══════════════════════════════════════════════ */
    /* Save                                           */
    /* ══════════════════════════════════════════════ */
    async function _save(state, btn) {
        if (btn) { btn.disabled = true; btn.textContent = '⏳ جاري الحفظ...'; }
        try {
            var me = getMe() || {};
            var payload = {
                name: state.name || state.room.name,
                icon: state.icon || '🚪',
                iconImage: state.iconImage || null,
                bgType: state.bgType || 'none',
                bgValue: state.bgType === 'color' ? state.bgValue : null,
                bgImage: state.bgType === 'image' ? state.bgImage : null,
                nameColor: state.nameColor || null,
                fontColor: state.fontColor || null,
                fontSize: state.fontSize || null,
                welcome: {
                    text: state.welcomeText || '',
                    enabled: state.welcomeEnabled !== false
                },
                micCount: state.micCount,
                allowMic: state.allowMic,
                maxUsers: state.maxUsers,
                visibleTo: state.visibleTo,
                updatedAt: Date.now(),
                updatedBy: me.uid || null
            };

            await db.ref('room_settings/' + state.rid).update(payload);

            /* تحديث QAMAR.ROOMS */
            if (typeof QAMAR !== 'undefined' && QAMAR.ROOMS && QAMAR.ROOMS[state.rid]) {
                QAMAR.ROOMS[state.rid].name = payload.name;
                QAMAR.ROOMS[state.rid].icon = payload.icon;
                QAMAR.ROOMS[state.rid].iconImage = payload.iconImage;
                QAMAR.ROOMS[state.rid].micCount = payload.micCount;
                QAMAR.ROOMS[state.rid].allowMic = payload.allowMic;
                QAMAR.ROOMS[state.rid].visibleTo = payload.visibleTo;
            }

            /* تحديث قائمة الغرف */
            if (typeof buildRoomsList === 'function') buildRoomsList();
            /* تحديث غرفة الملك */
            if (window.KingRoom && typeof window.KingRoom.reload === 'function') {
                try { window.KingRoom.reload(); } catch (e) {}
            }

            /* log */
            try {
                db.ref('audit_log').push({
                    type: 'edit_room',
                    byUid: me.uid,
                    byName: me.name || 'admin',
                    roomId: state.rid,
                    at: firebase.database.ServerValue.TIMESTAMP
                }).catch(function () {});
            } catch (e) {}

            toast('fa-check', '✅ تم حفظ الإعدادات');
            closeEditor();

        } catch (e) {
            console.error('save room settings error:', e);
            toast('fa-times', '⚠️ فشل: ' + e.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '💾 حفظ'; }
        }
    }

    /* ══════════════════════════════════════════════ */
    /* Override editRoom                              */
    /* ══════════════════════════════════════════════ */
    function _hookEditRoom() {
        var attempts = 0;
        var t = setInterval(function () {
            attempts++;
            /* نراقب فتح تبويب الغرف ونضغط على ✏️ */
            var krView = document.getElementById('king-room-view');
            if (!krView || !krView.classList.contains('active')) {
                if (attempts >= 100) clearInterval(t);
                return;
            }

            /* نستبدل onclick للأزرار */
            var editBtns = krView.querySelectorAll('.kr-icon-btn[data-r]');
            editBtns.forEach(function (b) {
                if (b.__rseHooked) return;
                b.__rseHooked = true;
                var rid = b.getAttribute('data-r');
                b.onclick = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    openExtendedRoomEditor(rid);
                };
            });

            if (attempts >= 200) clearInterval(t);
        }, 500);
    }

    /* ══════════════════════════════════════════════ */
    /* Public API                                     */
    /* ══════════════════════════════════════════════ */
    window.RoomSettingsExtended = {
        open: openExtendedRoomEditor,
        close: closeEditor,
        version: 1
    };

    /* ══════════════════════════════════════════════ */
    /* Init                                           */
    /* ══════════════════════════════════════════════ */
    function init() {
        _hookEditRoom();
        setInterval(_hookEditRoom, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    console.log('✅ room-settings-extended.js v1 loaded');
})();
