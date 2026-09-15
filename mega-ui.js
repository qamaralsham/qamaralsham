// ==============================================
// قمر الشام — إصلاحات UI (v1)
// إغلاق تلقائي للنوافذ عند اللمس في الخارج
// ==============================================

(function () {
    'use strict';
    if (window.__megaUIReady) return;
    window.__megaUIReady = true;

    // ══════════════════════════════════════════════
    // 1. دالة إغلاق موحّدة لكل النوافذ
    // ══════════════════════════════════════════════
    function closeAllPopups(except) {
        document.querySelectorAll('.message-menu.open, .emoji-bar.open')
            .forEach(el => {
                if (except && el.contains(except)) return;
                el.remove();
            });
    }

    // ══════════════════════════════════════════════
    // 2. عند الضغط في أي مكان فارغ → إغلاق
    // ══════════════════════════════════════════════
    document.addEventListener('click', function (e) {
        // تجاهل إذا الضغط داخل قائمة مفتوحة
        if (e.target.closest('.message-menu, .emoji-bar')) return;
        // تجاهل إذا الضغط على زر الفتح (⋮)
        if (e.target.closest('.message-options-btn')) return;

        closeAllPopups();
    }, true);

    // ══════════════════════════════════════════════
    // 3. عند لمس الـ overlay → إغلاق كل شيء
    // ══════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function () {
        const ov = document.getElementById('overlay');
        if (ov) {
            ov.addEventListener('click', function () {
                closeAllPopups();
                if (typeof closeAllPanels === 'function') closeAllPanels();
            });
        }
    });

    // ══════════════════════════════════════════════
    // 4. ESC يغلق كل شيء
    // ══════════════════════════════════════════════
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllPopups();
            if (typeof closeAllPanels === 'function') closeAllPanels();
        }
    });

    // ══════════════════════════════════════════════
    // 5. عند التمرير في الرسائل → إغلاق القوائم
    // ══════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function () {
        const msgs = document.getElementById('messages');
        if (msgs) {
            msgs.addEventListener('scroll', function () {
                closeAllPopups();
            }, { passive: true });
        }
    });

    console.log('✅ mega-ui.js loaded — unified popup closing');
})();
