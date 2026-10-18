// ==============================================
// join-admin-listener.js v1 — استماع pending_users
// ==============================================

(function () {
    'use strict';
    if (window.__joinAdminListenerV1) return;
    window.__joinAdminListenerV1 = true;

    var L = {
        ref: null,
        list: [],
        onUpdate: null,
        initialized: false
    };

    function isKing() {
        try {
            var u = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
            if (!u) return false;
            return u.rank === 'King';
        } catch (e) { return false; }
    }

    function start() {
        if (L.initialized) return;
        if (!isKing()) return;
        if (typeof db === 'undefined' || !db) { setTimeout(start, 1500); return; }

        L.initialized = true;
        L.ref = db.ref('pending_users');

        L.ref.on('value', function (snap) {
            var data = snap.val() || {};
            var list = Object.keys(data).map(function (k) {
                var v = data[k] || {};
                v._uid = k;
                return v;
            }).filter(function (x) {
                return x.status === 'pending';
            }).sort(function (a, b) {
                return (a.createdAt || 0) - (b.createdAt || 0);
            });

            var wasEmpty = L.list.length === 0;
            var oldCount = L.list.length;
            L.list = list;

            if (typeof L.onUpdate === 'function') {
                try { L.onUpdate(list); } catch (e) { console.warn(e); }
            }

            // إشعار صوتي عند طلب جديد
            if (list.length > oldCount && oldCount > 0) {
                var newest = list[list.length - 1];
                if (newest && typeof window.__joinAdminOnNew === 'function') {
                    try { window.__joinAdminOnNew(newest); } catch (e) {}
                }
            }
        });

        console.log('👑 join-admin-listener: started');
    }

    function stop() {
        if (L.ref) { try { L.ref.off(); } catch (e) {} L.ref = null; }
        L.initialized = false;
        L.list = [];
    }

    window.JoinAdminListener = {
        start: start,
        stop: stop,
        getList: function () { return L.list.slice(); },
        setOnUpdate: function (cb) { L.onUpdate = cb; },
        version: 1
    };

    // auto-start
    var t = setInterval(function () {
        if (isKing() && typeof db !== 'undefined' && db) {
            clearInterval(t);
            start();
        }
    }, 1000);
    setTimeout(function () { clearInterval(t); }, 60000);

    console.log('📦 join-admin-listener.js v1 loaded');
})();
