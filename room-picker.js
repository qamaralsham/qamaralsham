// ==============================================
// room-picker.js v1 — شاشة اختيار الغرف
// ==============================================
// ✅ الميزات:
//   • تظهر بعد التسجيل (مرة واحدة)
//   • قائمة عمودية بالغرف المتاحة حسب الرتبة
//   • عدد المتواجدين في كل غرفة (live)
//   • حفظ آخر غرفة → دخول مباشر في المرات التالية
//   • عند "مغادرة الغرفة" → العودة للشاشة
//   • عند الطرد من غرفة → العودة للشاشة
// ==============================================

(function () {
    'use strict';
    if (window.__roomPickerV1) return;
    window.__roomPickerV1 = true;

    var STORAGE_KEY = 'qamar_room_picker_done';
    var LAST_ROOM_KEY = 'qamar_last_room';

    /* CSS */
    (function injectCSS() {
        if (document.getElementById('room-picker-css')) return;
        var s = document.createElement('style');
        s.id = 'room-picker-css';
        s.textContent = `
#room-picker-screen {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at top, rgba(212,175,55,0.10) 0%, transparent 55%),
                radial-gradient(ellipse at bottom, rgba(100,50,150,0.15) 0%, transparent 55%),
                linear-gradient(to bottom, #050508, #0a0a15);
    z-index: 490;
    display: none;
    flex-direction: column;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    overflow-y: auto;
}
#room-picker-screen.active { display: flex; }

#rp-header {
    padding: 24px 20px 12px;
    text-align: center;
    flex-shrink: 0;
}
#rp-header h2 {
    color: #ffd700;
    font-size: 22px;
    font-weight: 900;
    margin: 0 0 6px;
    text-shadow: 0 2px 12px rgba(255,215,0,0.4);
}
#rp-header .rp-user {
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
}
#rp-header .rp-user-name {
    color: #ffd700;
    font-weight: 900;
}
#rp-header .rp-hint {
    color: #888;
    font-size: 12px;
    margin-top: 8px;
}

#rp-list {
    flex: 1;
    padding: 12px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.rp-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,215,0,0.25);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    overflow: hidden;
}

.rp-item::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.10), transparent);
    transition: left 0.5s ease;
    pointer-events: none;
}
.rp-item:hover::before { left: 100%; }

.rp-item:hover {
    background: rgba(255,215,0,0.10);
    border-color: #ffd700;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,215,0,0.15);
}

.rp-item:active {
    transform: scale(0.98);
}

.rp-item.locked {
    opacity: 0.4;
    cursor: not-allowed;
}
.rp-item.locked:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,215,0,0.25);
    transform: none;
    box-shadow: none;
}
.rp-item.locked::before { display: none; }

.rp-icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: rgba(255,215,0,0.10);
    border: 1px solid rgba(255,215,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    overflow: hidden;
}
.rp-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.rp-info {
    flex: 1;
    min-width: 0;
}
.rp-name {
    color: #fff;
    font-size: 15px;
    font-weight: 900;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.rp-name.color-custom { /* يُملأ من JS */ }
.rp-meta {
    color: #888;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.rp-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #84cc16;
    font-weight: 700;
}
.rp-count.empty { color: #666; }
.rp-lock {
    color: #ff6666;
    font-weight: 700;
}

.rp-arrow {
    color: #ffd700;
    font-size: 18px;
    flex-shrink: 0;
    transition: transform 0.15s;
}
.rp-item:hover .rp-arrow {
    transform: translateX(-4px);
}
.rp-item.locked .rp-arrow {
    display: none;
}

#rp-footer {
    padding: 12px 20px 20px;
    text-align: center;
    flex-shrink: 0;
}
#rp-logout {
    background: transparent;
    border: 1px solid rgba(255,68,68,0.4);
    color: #ff7777;
    padding: 10px 24px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.15s;
}
#rp-logout:hover {
    background: rgba(255,68,68,0.15);
}
        `;
        document.head.appendChild(s);
    })();

    var _origInitChat = null;
    var _pickerActive = false;

    function getMe() {
        return (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    }

    /* ⭐ بناء واجهة الغرف */
    function buildList() {
        var listEl = document.getElementById('rp-list');
        if (!listEl) return;
        var me = getMe();
        if (!me) return;
        if (typeof QAMAR === 'undefined' || !QAMAR.ROOMS) return;

        listEl.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:12px;">⏳ جاري تحميل الغرف...</div>';

        var visible = (typeof QAMAR.getVisibleRooms === 'function')
            ? QAMAR.getVisibleRooms(me)
            : QAMAR.ROOMS;

        // فلترة: لا نعرض bot_training, jail
        var roomIds = Object.keys(visible).filter(function(rid) {
            return rid !== 'bot_training' && rid !== 'jail';
        });

        if (roomIds.length === 0) {
            listEl.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:12px;">لا توجد غرف متاحة</div>';
            return;
        }

        listEl.innerHTML = '';

        roomIds.forEach(function(rid) {
            var room = visible[rid];
            var item = document.createElement('div');
            item.className = 'rp-item';
            item.setAttribute('data-room-id', rid);

            // أيقونة
            var iconHtml = room.icon || '🚪';
            if (room.iconImage) {
                iconHtml = '<img src="' + escapeAttr(room.iconImage) + '" alt="">';
            }

            // عدد المتواجدين (سيُحدَّث لاحقاً)
            var countHtml = '<span class="rp-count" data-count-for="' + escapeAttr(rid) + '">👥 ...</span>';

            var nameStyle = '';
            if (room.nameColor && /^#[0-9a-f]{3,8}$/i.test(room.nameColor)) {
                nameStyle = 'style="color:' + room.nameColor + ';"';
            }

            item.innerHTML =
                '<div class="rp-icon">' + iconHtml + '</div>' +
                '<div class="rp-info">' +
                    '<div class="rp-name" ' + nameStyle + '>' + escapeHtml(room.name || rid) + '</div>' +
                    '<div class="rp-meta">' + countHtml + '</div>' +
                '</div>' +
                '<div class="rp-arrow">◀</div>';

            item.onclick = function() { pickRoom(rid); };

            listEl.appendChild(item);
        });

        // تحميل عدد المتواجدين
        loadPresenceCounts(roomIds);
    }

    /* ⭐ جلب عدد المتواجدين */
    function loadPresenceCounts(roomIds) {
        if (typeof db === 'undefined' || !db) return;
        db.ref('user_presence').once('value').then(function(snap) {
            var data = snap.val() || {};
            var now = Date.now();
            var counts = {};
            roomIds.forEach(function(rid) { counts[rid] = 0; });

            Object.keys(data).forEach(function(uid) {
                var p = data[uid];
                if (!p || p.state !== 'online') return;
                if ((now - (p.lastChanged || 0)) >= 120000) return;
                if (p.room && counts[p.room] !== undefined) {
                    counts[p.room]++;
                }
            });

            roomIds.forEach(function(rid) {
                var el = document.querySelector('[data-count-for="' + rid + '"]');
                if (!el) return;
                if (counts[rid] > 0) {
                    el.textContent = '👥 ' + counts[rid];
                    el.classList.remove('empty');
                } else {
                    el.textContent = '👥 0';
                    el.classList.add('empty');
                }
            });
        }).catch(function() {});
    }

    /* ⭐ اختيار غرفة */
    function pickRoom(roomId) {
        var me = getMe();
        if (!me) return;
        if (typeof QAMAR === 'undefined' || !QAMAR.isRoomVisible(roomId, me)) {
            if (typeof showToast === 'function') showToast('fa-lock', '🔒 غير متاحة');
            return;
        }

        // حفظ
        try {
            localStorage.setItem(STORAGE_KEY, '1');
            localStorage.setItem(LAST_ROOM_KEY, roomId);
        } catch(e) {}

        // تحديث ChatState
        if (typeof ChatState !== 'undefined') {
            ChatState.currentRoom = roomId;
        }

        // إغلاق الشاشة
        hidePicker();

        // تشغيل الشات
        if (_origInitChat) {
            _origInitChat.call(window);
        }
    }

    /* ⭐ عرض الشاشة */
    function showPicker() {
        if (_pickerActive) return;
        _pickerActive = true;

        var me = getMe();
        if (!me) return;

        var screen = document.getElementById('room-picker-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'room-picker-screen';
            screen.innerHTML =
                '<div id="rp-header">' +
                    '<h2>🌙 قمر الشام</h2>' +
                    '<div class="rp-user">أهلاً <span class="rp-user-name" id="rp-user-name"></span></div>' +
                    '<div class="rp-hint">اختر غرفة للدخول</div>' +
                '</div>' +
                '<div id="rp-list"></div>' +
                '<div id="rp-footer">' +
                    '<button type="button" id="rp-logout">🚪 تسجيل خروج</button>' +
                '</div>';
            document.body.appendChild(screen);
        }

        // اسم المستخدم
        var nameEl = document.getElementById('rp-user-name');
        if (nameEl) nameEl.textContent = me.name || 'زائر';

        // زر تسجيل الخروج
        var logoutBtn = document.getElementById('rp-logout');
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                if (!confirm('تسجيل خروج؟')) return;
                if (typeof handleLogout === 'function') {
                    handleLogout();
                } else if (typeof logout === 'function') {
                    logout().then(function() { location.reload(); });
                }
            };
        }

        // إخفاء شاشة الدخول + الشات
        var ls = document.getElementById('login-screen');
        if (ls) ls.style.display = 'none';
        var cc = document.getElementById('chat-container');
        if (cc) cc.style.display = 'none';

        buildList();

        screen.classList.add('active');
        console.log('🚪 Room picker: shown');
    }

    /* ⭐ إخفاء الشاشة */
    function hidePicker() {
        _pickerActive = false;
        var screen = document.getElementById('room-picker-screen');
        if (screen) screen.classList.remove('active');
        console.log('🚪 Room picker: hidden');
    }

    /* ⭐ Override initChat — يمنع الدخول بدون اختيار */
    function patchInitChat() {
        if (typeof window.initChat !== 'function') {
            setTimeout(patchInitChat, 200);
            return;
        }
        if (window.__roomPickerPatchedInitChat) return;
        window.__roomPickerPatchedInitChat = true;

        _origInitChat = window.initChat;
        window.initChat = function() {
            // إذا مرت المرة الأولى ولم يختر بعد → اعرض الشاشة
            var done = false;
            try { done = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e) {}

            if (!done) {
                showPicker();
                return;
            }
            // مرّت → دخول عادي
            return _origInitChat.apply(this, arguments);
        };

        console.log('🚪 Room picker: initChat patched');
    }

    /* ⭐ إعادة العرض (عند مغادرة الغرفة أو الطرد) */
    window.showRoomPicker = function() {
        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
        showPicker();
    };

    /* ⭐ Helpers */
    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function(c) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
        });
    }
    function escapeAttr(s) { return escapeHtml(s); }

    /* ⭐ Init */
    function init() {
        var t = setInterval(function() {
            if (typeof getCurrentUser === 'function' && getCurrentUser() && typeof db !== 'undefined' && db) {
                clearInterval(t);
                patchInitChat();
            }
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    console.log('🚪 room-picker.js v1 loaded');
})();
