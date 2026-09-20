// ==============================================
// room-picker.js v3 — شاشة اختيار الغرف
// ==============================================
// ✅ v3 (إصلاح حاسم):
//   • استخدام window.ChatState بدل ChatState المباشر
//   • cleanupAllListeners قبل إعادة التهيئة
//   • ضمان استدعاء initChat الأصلي
// ==============================================

(function () {
    'use strict';
    if (window.__roomPickerV3) return;
    window.__roomPickerV3 = true;

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

.rp-arrow {
    color: #ffd700;
    font-size: 18px;
    flex-shrink: 0;
    transition: transform 0.15s;
}
.rp-item:hover .rp-arrow {
    transform: translateX(-4px);
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
        return (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
    }

    /* ⭐ الحصول على ChatState بأمان */
    function getChatState() {
        return window.ChatState || null;
    }

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function(c) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
        });
    }
    function escapeAttr(s) { return escapeHtml(s); }

    /* ⭐ بناء واجهة الغرف */
    function buildList() {
        var listEl = document.getElementById('rp-list');
        if (!listEl) return;
        var me = getMe();
        if (!me) return;
        if (typeof window.QAMAR === 'undefined' || !window.QAMAR.ROOMS) return;

        listEl.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-size:12px;">⏳ جاري تحميل الغرف...</div>';

        var visible = (typeof window.QAMAR.getVisibleRooms === 'function')
            ? window.QAMAR.getVisibleRooms(me)
            : window.QAMAR.ROOMS;

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

            var iconHtml = room.icon || '🚪';
            if (room.iconImage) {
                iconHtml = '<img src="' + escapeAttr(room.iconImage) + '" alt="">';
            }

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

        loadPresenceCounts(roomIds);
    }

    function loadPresenceCounts(roomIds) {
        if (typeof window.db === 'undefined' || !window.db) return;
        window.db.ref('user_presence').once('value').then(function(snap) {
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

    /* ⭐⭐⭐ اختيار غرفة — v3 */
    function pickRoom(roomId) {
        var me = getMe();
        if (!me) {
            console.warn('🚪 pickRoom: no user');
            return;
        }
        if (typeof window.QAMAR === 'undefined' || !window.QAMAR.isRoomVisible(roomId, me)) {
            if (typeof window.showToast === 'function') window.showToast('fa-lock', '🔒 غير متاحة');
            return;
        }

        console.log('🚪 pickRoom:', roomId);

        // حفظ
        try {
            localStorage.setItem(STORAGE_KEY, '1');
            localStorage.setItem(LAST_ROOM_KEY, roomId);
        } catch(e) {}

        // ⭐⭐⭐ إغلاق كل المستمعين القديمة
        if (typeof window.cleanupAllListeners === 'function') {
            try { window.cleanupAllListeners(); } catch(e) { console.warn('cleanup err:', e); }
        }

        // ⭐⭐⭐ إعادة ضبط ChatState — باستخدام window.ChatState!
        var cs = getChatState();
        if (cs) {
            cs.isInitialized = false;
            cs.currentRoom = roomId;
            cs.messagesListener = null;
            cs.presenceInterval = null;
            cs.privateChatsListener = null;
            cs.notificationsListener = null;
            cs.privateMessagesListener = null;
            if (cs.seenMessages && cs.seenMessages.clear) cs.seenMessages.clear();
            console.log('🚪 ChatState reset | isInitialized = false');
        } else {
            console.warn('🚪 window.ChatState NOT FOUND — cannot reset!');
        }

        // إخفاء الشاشة
        hidePicker();

        // إخفاء شاشة الدخول
        var ls = document.getElementById('login-screen');
        if (ls) ls.style.display = 'none';

        // إخفاء الشات (لإعادة التهيئة النظيفة)
        var cc = document.getElementById('chat-container');
        if (cc) cc.style.display = 'none';

        // مسح الرسائل
        var messagesEl = document.getElementById('messages');
        if (messagesEl) messagesEl.innerHTML = '';

        // ⭐ استدعاء initChat الأصلي
        setTimeout(function() {
            if (_origInitChat) {
                console.log('🚪 calling _origInitChat...');
                try {
                    _origInitChat.call(window);
                    console.log('🚪 _origInitChat done');
                } catch(err) {
                    console.error('🚪 _origInitChat failed:', err);
                }
            } else if (typeof window.initChat === 'function') {
                console.log('🚪 calling window.initChat (fallback)...');
                try {
                    window.initChat();
                } catch(err) {
                    console.error('🚪 window.initChat failed:', err);
                }
            } else {
                console.error('🚪 NO initChat available!');
            }

            // ضمان ظهور chat-container
            setTimeout(function() {
                var cc2 = document.getElementById('chat-container');
                if (cc2 && cc2.style.display === 'none') {
                    console.log('🚪 forcing chat-container display');
                    cc2.style.display = 'flex';
                }
            }, 150);
        }, 100);
    }

    /* ⭐ عرض الشاشة */
    function showPicker() {
        if (_pickerActive) return;
        _pickerActive = true;

        var me = getMe();
        if (!me) {
            console.warn('🚪 showPicker: no user');
            return;
        }

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

        var nameEl = document.getElementById('rp-user-name');
        if (nameEl) nameEl.textContent = me.name || 'زائر';

        var logoutBtn = document.getElementById('rp-logout');
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                if (!confirm('تسجيل خروج؟')) return;
                if (typeof window.handleLogout === 'function') {
                    window.handleLogout();
                } else if (typeof window.logout === 'function') {
                    window.logout().then(function() { location.reload(); });
                }
            };
        }

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

    /* ⭐⭐⭐ Patch فوري لـ initChat */
    function patchInitChatNow() {
        if (typeof window.initChat !== 'function') {
            var wait = setInterval(function() {
                if (typeof window.initChat === 'function') {
                    clearInterval(wait);
                    patchInitChatNow();
                }
            }, 20);
            setTimeout(function() { clearInterval(wait); }, 5000);
            return;
        }
        if (window.__roomPickerPatchedInitChat) return;
        window.__roomPickerPatchedInitChat = true;

        _origInitChat = window.initChat;
        window.initChat = function() {
            var done = false;
            try { done = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e) {}

            if (!done) {
                showPicker();
                return;
            }
            return _origInitChat.apply(this, arguments);
        };

        console.log('🚪 Room picker: initChat patched (v3)');
    }

    /* ⭐ إعادة العرض */
    window.showRoomPicker = function() {
        console.log('🚪 showRoomPicker() called');
        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
        
        // ⭐ إغلاق كل المستمعين
        if (typeof window.cleanupAllListeners === 'function') {
            try { window.cleanupAllListeners(); } catch(e) {}
        }
        
        // ⭐ إعادة ضبط ChatState
        var cs = getChatState();
        if (cs) {
            cs.isInitialized = false;
            console.log('🚪 showRoomPicker: ChatState.isInitialized = false');
        } else {
            console.warn('🚪 showRoomPicker: window.ChatState NOT FOUND');
        }
        
        showPicker();
    };

    /* ⭐ Patch فوري */
    patchInitChatNow();

    console.log('🚪 room-picker.js v3 loaded');
})();
