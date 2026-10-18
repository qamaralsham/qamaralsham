// ==============================================
// join-watcher.js v1 — شاشة انتظار/رفض + استماع
// ==============================================

(function () {
    'use strict';
    if (window.__joinWatcherV1) return;
    window.__joinWatcherV1 = true;

    var W = {
        allowedRef: null,
        pendingRef: null,
        intervalId: null,
        uid: null,
        onApprovedCb: null,
        onRejectedCb: null
    };

    /* ═══ CSS ═══ */
    (function injectCSS() {
        if (document.getElementById('jw-css')) return;
        var s = document.createElement('style');
        s.id = 'jw-css';
        s.textContent = `
#jw-overlay {
    position: fixed; inset: 0;
    background: linear-gradient(180deg, #050508 0%, #0a0616 50%, #050508 100%);
    z-index: 999999; display: none;
    flex-direction: column; justify-content: center; align-items: center;
    direction: rtl; font-family: Cairo, sans-serif;
    padding: 20px; text-align: center; color: #fff;
}
#jw-overlay.active { display: flex; }
#jw-card {
    background: #0a0616;
    border: 2px solid #ffd700;
    border-radius: 20px; padding: 32px 24px;
    max-width: 420px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.2);
}
#jw-card.rejected { border-color: #ff4444; box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,68,68,0.3); }
#jw-card.unauthorized { border-color: #ff9800; }
#jw-icon { font-size: 72px; line-height: 1; margin-bottom: 20px; animation: jwPulse 2s ease-in-out infinite; }
@keyframes jwPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
#jw-card.rejected #jw-icon, #jw-card.unauthorized #jw-icon { animation: none; }
#jw-title { color: #ffd700; font-size: 22px; font-weight: 900; margin-bottom: 12px; text-shadow: 0 0 20px rgba(255,215,0,0.5); }
#jw-card.rejected #jw-title { color: #ff6666; }
#jw-card.unauthorized #jw-title { color: #ff9800; }
#jw-desc { color: #aaa; font-size: 14px; line-height: 1.8; margin-bottom: 24px; }
#jw-desc .em { color: #84cc16; font-weight: 900; }
#jw-loader {
    width: 48px; height: 48px;
    border: 4px solid rgba(255,215,0,0.15);
    border-top-color: #ffd700; border-radius: 50%;
    animation: jwSpin 1s linear infinite;
    margin: 0 auto 20px;
}
@keyframes jwSpin { to { transform: rotate(360deg); } }
#jw-status {
    color: #888; font-size: 12px; font-weight: 700;
    padding: 10px; background: rgba(0,0,0,0.4);
    border-radius: 8px; margin-bottom: 16px;
    min-height: 40px; display: flex; align-items: center; justify-content: center;
}
#jw-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
#jw-actions button {
    padding: 10px 20px; border-radius: 10px; border: none;
    font-family: inherit; font-size: 13px; font-weight: 900;
    cursor: pointer; transition: all 0.15s;
}
#jw-actions button:active { transform: scale(0.96); }
#jw-check { background: linear-gradient(135deg, #ffd700, #d4af37); color: #000; }
#jw-logout { background: rgba(255,68,68,0.2); color: #ff8888; border: 1px solid rgba(255,68,68,0.4); }
        `;
        document.head.appendChild(s);
    })();

    function getMe() {
        try { if (typeof getCurrentUser === 'function') { var u = getCurrentUser(); if (u && u.uid) return u; } } catch (e) {}
        try { return JSON.parse(localStorage.getItem('qamar_current_user') || 'null'); } catch (e) { return null; }
    }

    function esc(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function ensureOverlay() {
        var ov = document.getElementById('jw-overlay');
        if (ov) return ov;
        ov = document.createElement('div');
        ov.id = 'jw-overlay';
        ov.innerHTML =
            '<div id="jw-card">' +
                '<div id="jw-icon">⏳</div>' +
                '<div id="jw-title">بانتظار الموافقة</div>' +
                '<div id="jw-desc"></div>' +
                '<div id="jw-loader"></div>' +
                '<div id="jw-status">⏳ يتحقق تلقائياً...</div>' +
                '<div id="jw-actions">' +
                    '<button type="button" id="jw-check">🔄 تحديث</button>' +
                    '<button type="button" id="jw-logout">🚪 خروج</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(ov);
        ov.querySelector('#jw-check').onclick = function () { manualCheck(); };
        ov.querySelector('#jw-logout').onclick = doLogout;
        return ov;
    }

    /* ═══ إخفاء الشاشات الأخرى ═══ */
    function hideOtherScreens() {
        var login = document.getElementById('login-screen');
        if (login) login.style.display = 'none';
        var chat = document.getElementById('chat-container');
        if (chat) chat.style.display = 'none';
    }

    /* ═══ شاشة الانتظار ═══ */
    function showWaiting(me) {
        if (!me || !me.uid) return;
        var ov = ensureOverlay();
        var card = ov.querySelector('#jw-card');
        card.classList.remove('rejected', 'unauthorized');

        ov.querySelector('#jw-icon').textContent = '⏳';
        ov.querySelector('#jw-title').textContent = 'بانتظار الموافقة';
        ov.querySelector('#jw-desc').innerHTML =
            'أهلاً <span class="em">' + esc(me.name || '—') + '</span><br>' +
            'طلبك قيد المراجعة من إدارة المنصة.<br>' +
            'سيتم إشعارك فور الموافقة.';
        ov.querySelector('#jw-status').textContent = '⏳ يتحقق تلقائياً كل 15 ثانية...';

        ov.classList.add('active');
        hideOtherScreens();

        W.uid = me.uid;
        startListening(me.uid);
    }

    /* ═══ شاشة الرفض ═══ */
    function showRejected(reason) {
        var ov = ensureOverlay();
        var card = ov.querySelector('#jw-card');
        card.classList.add('rejected');
        card.classList.remove('unauthorized');

        ov.querySelector('#jw-icon').textContent = '🚫';
        ov.querySelector('#jw-title').textContent = 'تم رفض الطلب';
        ov.querySelector('#jw-desc').innerHTML =
            'عذراً، تم رفض طلب الانضمام.' +
            (reason ? '<br><br><span style="color:#ff9999;">السبب: ' + esc(reason) + '</span>' : '') +
            '<br><br>يمكنك التواصل مع الإدارة.';
        ov.querySelector('#jw-loader').style.display = 'none';
        ov.querySelector('#jw-status').textContent = '🚫 مرفوض';

        ov.classList.add('active');
        hideOtherScreens();
        stopListening();
    }

    /* ═══ شاشة غير مصرح ═══ */
    function showUnauthorized() {
        var ov = ensureOverlay();
        var card = ov.querySelector('#jw-card');
        card.classList.add('unauthorized');
        card.classList.remove('rejected');

        ov.querySelector('#jw-icon').textContent = '🔒';
        ov.querySelector('#jw-title').textContent = 'غير مصرح';
        ov.querySelector('#jw-desc').innerHTML =
            'لا يوجد طلب انضمام لهذا الحساب.<br>' +
            'تواصل مع الإدارة للحصول على صلاحية الدخول.';
        ov.querySelector('#jw-loader').style.display = 'none';
        ov.querySelector('#jw-status').textContent = '🔒 محظور';

        ov.classList.add('active');
        hideOtherScreens();
        stopListening();
    }

    /* ═══ onApproved ═══ */
    function onApproved() {
        stopListening();
        var ov = document.getElementById('jw-overlay');
        if (ov) {
            ov.querySelector('#jw-icon').textContent = '✅';
            ov.querySelector('#jw-title').textContent = 'تمت الموافقة!';
            ov.querySelector('#jw-desc').innerHTML = 'مرحباً بك في قمر الشام 🌙<br>جاري الدخول...';
            ov.querySelector('#jw-loader').style.display = 'block';
            ov.querySelector('#jw-status').textContent = '✅ مرحباً';
        }
        setTimeout(function () {
            var ov2 = document.getElementById('jw-overlay');
            if (ov2) ov2.classList.remove('active');
            if (typeof W.onApprovedCb === 'function') {
                try { W.onApprovedCb(); } catch (e) { console.warn(e); }
            } else if (typeof window.initChat === 'function' && !window.initChat.__joinOriginal) {
                try { window.initChat(); } catch (e) {}
            } else {
                location.reload();
            }
        }, 1500);
    }

    /* ═══ الاستماع ═══ */
    function startListening(uid) {
        stopListening();
        if (!uid || typeof db === 'undefined' || !db) return;
        W.uid = uid;

        try {
            W.allowedRef = db.ref('config/allowedUids/' + uid);
            W.allowedRef.on('value', function (s) {
                if (s.exists() && s.val() === true) onApproved();
            });
        } catch (e) { console.warn('allowedRef:', e); }

        try {
            W.pendingRef = db.ref('pending_users/' + uid);
            W.pendingRef.on('value', function (s) {
                var v = s.val();
                if (!v) {
                    // الطلب حُذف — تحقق من allowedUids بعد لحظة
                    setTimeout(function () {
                        db.ref('config/allowedUids/' + uid).once('value').then(function (s2) {
                            if (!(s2.exists() && s2.val() === true)) showRejected('حُذف الطلب');
                        }).catch(function () {});
                    }, 1500);
                    return;
                }
                if (v.status === 'rejected') showRejected(v.rejectionReason || '');
                else if (v.status === 'approved') onApproved();
            });
        } catch (e) { console.warn('pendingRef:', e); }

        W.intervalId = setInterval(manualCheck, 15000);
    }

    function stopListening() {
        if (W.allowedRef) { try { W.allowedRef.off(); } catch (e) {} W.allowedRef = null; }
        if (W.pendingRef) { try { W.pendingRef.off(); } catch (e) {} W.pendingRef = null; }
        if (W.intervalId) { clearInterval(W.intervalId); W.intervalId = null; }
    }

    async function manualCheck() {
        if (!W.uid) return;
        var statusEl = document.getElementById('jw-status');
        if (statusEl) statusEl.textContent = '🔄 جاري الفحص...';
        try {
            var status = await JoinQueue.checkStatus(W.uid);
            if (status === 'approved') {
                if (statusEl) statusEl.textContent = '✅ تمت الموافقة!';
                onApproved();
                return;
            }
            if (status === 'rejected') {
                var p = await JoinQueue.get(W.uid);
                showRejected(p ? p.rejectionReason : '');
                return;
            }
            if (status === 'none') {
                showUnauthorized();
                return;
            }
            if (statusEl) statusEl.textContent = '⏳ لا تزال قيد المراجعة';
        } catch (e) {
            if (statusEl) statusEl.textContent = '⚠️ ' + e.message;
        }
    }

    async function doLogout() {
        if (!confirm('تسجيل الخروج؟')) return;
        stopListening();
        try {
            if (typeof logout === 'function') await logout();
            else if (typeof auth !== 'undefined' && auth && auth.currentUser) await auth.signOut();
        } catch (e) {}
        try {
            ['qamar_current_user', 'qamar_user', 'qamar_guest'].forEach(function (k) {
                localStorage.removeItem(k);
            });
        } catch (e) {}
        location.reload();
    }

    function hide() {
        stopListening();
        var ov = document.getElementById('jw-overlay');
        if (ov) ov.classList.remove('active');
    }

    window.JoinWatcher = {
        showWaiting: showWaiting,
        showRejected: showRejected,
        showUnauthorized: showUnauthorized,
        startListening: startListening,
        stopListening: stopListening,
        hide: hide,
        setOnApproved: function (cb) { W.onApprovedCb = cb; },
        version: 1
    };

    console.log('📦 join-watcher.js v1 loaded');
})();
