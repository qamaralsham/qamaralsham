// ==============================================
// قمر الشام — الزجاج + السيراميك + إصلاحات UI
// Qamar UI v1
// ==============================================
// ✅ يُحمَّل تلقائياً من css-frames.js
// ✅ لا يحتاج أي تعديل على ملفات أخرى
// ==============================================

(function () {
    'use strict';
    if (document.getElementById('qamar-ui-mega')) return;

    const CSS = `

/* ══════════════════════════════════════════════
   1️⃣ الزجاج الشفاف 100%
   ══════════════════════════════════════════════ */
.header,
.input-area,
.bottom-nav,
.mics-bar,
.mics-toggle-btn,
.sidebar,
.floating-toolbar,
.private-chat-modal,
.private-chat-header,
.private-chat-input,
.message-menu,
.emoji-bar,
.toast-notification {
    background-color: rgba(10, 10, 20, 0.28) !important;
    backdrop-filter: blur(18px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(18px) saturate(160%) !important;
    border-color: rgba(255, 215, 0, 0.32) !important;
    will-change: backdrop-filter;
}
.sidebar {
    background-color: rgba(10, 10, 18, 0.55) !important;
    backdrop-filter: blur(28px) saturate(170%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(170%) !important;
}
.private-chat-modal {
    background-color: rgba(10, 10, 18, 0.65) !important;
    backdrop-filter: blur(30px) saturate(170%) !important;
    -webkit-backdrop-filter: blur(30px) saturate(170%) !important;
}
.message-menu,
.emoji-bar {
    background-color: rgba(12, 12, 22, 0.82) !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    border: 1px solid rgba(255, 215, 0, 0.4) !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 215, 0, 0.15) !important;
}

/* ══════════════════════════════════════════════
   2️⃣ السيراميك 3D
   ══════════════════════════════════════════════ */
.sidebar-item,
.notif-item,
.header-btn,
.nav-item,
.tool-btn,
.mic-btn,
.private-chat-actions button {
    background: rgba(255, 255, 255, 0.07) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow:
        inset 0 3px 6px rgba(255, 255, 255, 0.4),
        inset 0 -4px 8px rgba(0, 0, 0, 0.6),
        0 8px 16px rgba(0, 0, 0, 0.45),
        0 2px 4px rgba(0, 0, 0, 0.25) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
.sidebar-item:active,
.notif-item:active,
.header-btn:active,
.nav-item:active,
.tool-btn:active,
.mic-btn:active,
.private-chat-actions button:active {
    transform: translateY(2px) scale(0.97) !important;
    box-shadow:
        inset 0 3px 6px rgba(255, 255, 255, 0.28),
        inset 0 -2px 6px rgba(0, 0, 0, 0.75),
        0 3px 6px rgba(0, 0, 0, 0.55) !important;
}
.sidebar-item.active,
.mic-btn.active {
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.42), rgba(212, 175, 55, 0.2)) !important;
    border-color: rgba(255, 215, 0, 0.9) !important;
    color: #fff !important;
    box-shadow:
        inset 0 3px 6px rgba(255, 255, 255, 0.55),
        inset 0 -4px 8px rgba(0, 0, 0, 0.6),
        0 8px 16px rgba(255, 215, 0, 0.4),
        0 0 24px rgba(255, 215, 0, 0.55) !important;
}
.message {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 14px !important;
    padding: 8px 10px !important;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        0 2px 6px rgba(0, 0, 0, 0.35) !important;
    transition: box-shadow 0.2s ease !important;
    overflow: visible !important;
}
.message:hover {
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 6px 18px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(255, 215, 0, 0.15) !important;
}
.message.system {
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.14), rgba(212, 175, 55, 0.06)) !important;
    border: 1px solid rgba(255, 215, 0, 0.4) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.25),
        inset 0 -2px 6px rgba(0, 0, 0, 0.55),
        0 4px 12px rgba(0, 0, 0, 0.45),
        0 0 20px rgba(255, 215, 0, 0.2) !important;
}

/* ══════════════════════════════════════════════
   3️⃣ قائمة الرسالة
   ══════════════════════════════════════════════ */
.message-content { position: relative !important; }
.message-menu {
    position: absolute !important;
    top: 100% !important;
    right: 0 !important;
    left: auto !important;
    margin-top: 6px !important;
    min-width: 150px !important;
    padding: 6px !important;
    border-radius: 12px !important;
    z-index: 99999 !important;
    flex-direction: column !important;
    gap: 2px !important;
}
.message-menu.open {
    display: flex !important;
    animation: qMenuPop 0.18s ease-out !important;
}
@keyframes qMenuPop {
    from { opacity: 0; transform: translateY(-6px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}
.message-menu-item {
    padding: 9px 12px !important;
    font-size: 12.5px !important;
    border-radius: 8px !important;
    gap: 8px !important;
    white-space: nowrap !important;
}
.message-menu-item:hover,
.message-menu-item:active {
    background: rgba(255, 215, 0, 0.18) !important;
    color: #ffd700 !important;
    transform: translateX(-2px);
}

/* ══════════════════════════════════════════════
   4️⃣ شريط الإيموجي
   ══════════════════════════════════════════════ */
.emoji-bar {
    position: absolute !important;
    top: 100% !important;
    right: 0 !important;
    left: auto !important;
    margin-top: 6px !important;
    padding: 8px 12px !important;
    border-radius: 18px !important;
    gap: 10px !important;
    z-index: 99999 !important;
    align-items: center !important;
}
.emoji-bar.open {
    display: flex !important;
    animation: qMenuPop 0.18s ease-out !important;
}
.emoji-quick {
    font-size: 22px !important;
    transition: transform 0.15s ease !important;
}
.emoji-quick:hover,
.emoji-quick:active {
    transform: scale(1.35) !important;
}

/* ══════════════════════════════════════════════
   5️⃣ شريط الأدوات العائم
   ══════════════════════════════════════════════ */
.floating-toolbar {
    position: absolute !important;
    bottom: calc(100% + 12px) !important;
    left: 12px !important;
    right: 12px !important;
    top: auto !important;
    padding: 12px !important;
    border-radius: 20px !important;
    display: none !important;
    justify-content: space-around !important;
    gap: 10px !important;
    z-index: 250 !important;
    box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.85),
        0 0 30px rgba(255, 215, 0, 0.18) !important;
}
.floating-toolbar.open {
    display: flex !important;
    animation: qToolbarSlide 0.22s cubic-bezier(0.22, 1, 0.36, 1) !important;
}
@keyframes qToolbarSlide {
    from { opacity: 0; transform: translateY(14px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ══════════════════════════════════════════════
   6️⃣ الإطارات الحية لا تُقطع
   ══════════════════════════════════════════════ */
.message-avatar-wrapper,
.message {
    overflow: visible !important;
}
.message-avatar-wrapper { z-index: 20; }
.message-username {
    position: relative;
    z-index: 5;
}

/* ══════════════════════════════════════════════
   7️⃣ السايدبار
   ══════════════════════════════════════════════ */
.sidebar {
    width: 60vw !important;
    min-width: 250px !important;
    max-width: 340px !important;
}
@media (max-width: 480px) {
    .sidebar {
        width: 72vw !important;
        max-width: none !important;
    }
}

/* ══════════════════════════════════════════════
   8️⃣ النوافذ المنبثقة
   ══════════════════════════════════════════════ */
.modal-content,
.modal-c,
.upgrade-content,
.bot-profile-content {
    background: rgba(15, 15, 25, 0.85) !important;
    backdrop-filter: blur(30px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
    border: 1px solid rgba(255, 215, 0, 0.5) !important;
    box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        0 20px 60px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(255, 215, 0, 0.25) !important;
    animation: qModalPop 0.28s cubic-bezier(0.22, 1, 0.36, 1) !important;
}
@keyframes qModalPop {
    from { opacity: 0; transform: scale(0.92) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ══════════════════════════════════════════════
   9️⃣ Toast
   ══════════════════════════════════════════════ */
.toast-notification {
    box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.2),
        0 12px 40px rgba(0, 0, 0, 0.7),
        0 0 25px rgba(255, 215, 0, 0.2) !important;
    border-radius: 14px !important;
}

/* ══════════════════════════════════════════════
   🔟 زر الإرسال
   ══════════════════════════════════════════════ */
.send-btn {
    box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.55),
        inset 0 -3px 6px rgba(0, 0, 0, 0.4),
        0 6px 14px rgba(0, 0, 0, 0.5),
        0 0 22px rgba(255, 215, 0, 0.5) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
.send-btn:active {
    transform: scale(0.94) !important;
    box-shadow:
        inset 0 3px 6px rgba(0, 0, 0, 0.5),
        0 2px 6px rgba(0, 0, 0, 0.6) !important;
}
`;

    const style = document.createElement('style');
    style.id = 'qamar-ui-mega';
    style.textContent = CSS;
    document.head.appendChild(style);

    // ══════════════════════════════════════════════
    // إغلاق موحّد لكل القوائم المنبثقة
    // ══════════════════════════════════════════════
    function closeAllPopups(except) {
        document.querySelectorAll('.message-menu.open, .emoji-bar.open').forEach(el => {
            if (except && el.contains(except)) return;
            el.remove();
        });
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.message-menu, .emoji-bar')) return;
        if (e.target.closest('.message-options-btn')) return;
        closeAllPopups();
    }, true);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllPopups();
            if (typeof closeAllPanels === 'function') closeAllPanels();
        }
    });

    window.addEventListener('DOMContentLoaded', function () {
        const ov = document.getElementById('overlay');
        if (ov) ov.addEventListener('click', function () {
            closeAllPopups();
        });
        const msgs = document.getElementById('messages');
        if (msgs) msgs.addEventListener('scroll', function () {
            closeAllPopups();
        }, { passive: true });
    });

    window.closeAllPopups = closeAllPopups;
    console.log('✅ qamar-ui.js loaded — glass + ceramic + popup fix');
})();
