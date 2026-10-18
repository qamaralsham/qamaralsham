// ==============================================
// join-boot.js v1 — تحميل النظام + ربط callbacks
// ==============================================

(function () {
    'use strict';
    if (window.__joinBootV1) return;
    window.__joinBootV1 = true;

    function init() {
        // 1. تحقق من توفر المكونات
        if (!window.JoinQueue) {
            console.error('🚪 join-boot: JoinQueue missing — تحقق من ترتيب السكربتات');
            return;
        }
        if (!window.JoinWatcher) {
            console.error('🚪 join-boot: JoinWatcher missing');
            return;
        }
        if (!window.JoinHooks) {
            console.error('🚪 join-boot: JoinHooks missing');
            return;
        }

        // 2. اربط onApproved
        JoinWatcher.setOnApproved(function () {
            // بعد الموافقة: أعد استدعاء initChat الأصلي
            var original = null;
            if (window.initChat && window.initChat.__joinOriginal) {
                // initChat الحالي هو المُغلّف — نحتاج الأصلي
                // سنستخدم trick: نضع علامة
                original = window.__joinOriginalInitChat;
            }

            // نستدعي reload — أبسط وأأمن
            // لأنه بعد الموافقة الحالة تغيّرت وربما listeners قديمة مشغولة
            console.log('🚪 join: approved → reloading');
            setTimeout(function () { location.reload(); }, 500);
        });

        // 3. غلّف الدوال
        var attempts = 0;
        var t = setInterval(function () {
            attempts++;
            if (JoinHooks.install()) {
                clearInterval(t);
                console.log('🚪 join-boot: hooks installed (attempt ' + attempts + ')');
            }
            if (attempts >= 60) {
                clearInterval(t);
                console.warn('🚪 join-boot: timeout waiting for register/initChat');
            }
        }, 250);

        console.log('🚪 join-boot.js v1 ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('📦 join-boot.js v1 loaded');
})();
