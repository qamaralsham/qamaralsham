// ==============================================
// join-admin-boot.js v1 — تحميل نظام الملك
// ==============================================

(function () {
    'use strict';
    if (window.__joinAdminBootV1) return;
    window.__joinAdminBootV1 = true;

    function init() {
        if (!window.JoinAdminListener || !window.JoinAdminActions || !window.JoinAdminUI) {
            console.error('👑 join-admin-boot: components missing — تحقق من ترتيب السكربتات');
            return;
        }

        var attempts = 0;
        var t = setInterval(function () {
            attempts++;
            var me = null;
            try { me = (typeof getCurrentUser === 'function') ? getCurrentUser() : null; } catch (e) {}
            if (me && me.uid && me.rank === 'King' && typeof db !== 'undefined' && db) {
                clearInterval(t);
                JoinAdminListener.start();
                JoinAdminUI.setup();
                console.log('👑 join-admin-boot: ready');
            }
            if (attempts >= 60) clearInterval(t);
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('📦 join-admin-boot.js v1 loaded');
})();
