// ==============================================
// chat-fixes.js v7 — keyboard + room bg + glass class
// ==============================================
// ✅ v7:
//   1. حذف زر تبديل الزجاج (انتقل إلى king-room)
//   2. الزجاج مُعرّف في qamar-glass.css (link)
//   3. الإبقاء على كل الوظائف الحيوية
// ==============================================

(function () {
    'use strict';
    if (window.__chatFixesV7) return;
    window.__chatFixesV7 = true;

    var STYLE_KEY = 'qamar_sidebar_style';
    var currentStyle = localStorage.getItem(STYLE_KEY) || 'classic';

    /* ═══ CSS الأساسي (بدون الزجاج — الزجاج في qamar-glass.css) ═══ */
    (function injectCSS() {
        var old = document.getElementById('chat-fixes-css');
        if (old) old.remove();
        var s = document.createElement('style');
        s.id = 'chat-fixes-css';
        s.textContent = [
            /* ═══ Keyboard — إخفاء الشرائط عند فتح الكيبورد ═══ */
            'body.keyboard-open .bottom-nav,',
            'body.keyboard-open .floating-toolbar { display: none !important; }',

            /* ═══ زر الإبلاغات — إلغاء نبض الملف الأصلي (نستخدم نبض CSS من styles.css) ═══ */
            '#ra-send-btn { animation: none !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.35) !important; }'

            /* ملاحظة: كل CSS الزجاج (body.sidebar-glass) الآن في qamar-glass.css */
        ].join('\n');
        document.head.appendChild(s);
    })();

    /* ═══ Style: قراءة فقط من localStorage (التبديل يتم من غرفة الملك) ═══ */
    function applyStyle(style) {
        document.body.classList.toggle('sidebar-glass', style === 'glass');
        document.body.classList.toggle('sidebar-classic', style === 'classic');
        localStorage.setItem(STYLE_KEY, style);
        currentStyle = style;
    }

    /* ═══ Keyboard handlers ═══ */
    function checkActiveInputs() {
        var a = document.activeElement;
        var m = document.getElementById('message-input');
        var p = document.getElementById('pc-input');
        if (a !== m && a !== p) document.body.classList.remove('keyboard-open');
    }
    function setupKeyboardHandlers() {
        var input = document.getElementById('message-input');
        var pcInput = document.getElementById('pc-input');
        function onFocus() { document.body.classList.add('keyboard-open'); }
        function onBlur() { setTimeout(checkActiveInputs, 100); }
        if (input && !input.__kbfix) { input.__kbfix = true; input.addEventListener('focus', onFocus); input.addEventListener('blur', onBlur); }
        if (pcInput && !pcInput.__kbfix) { pcInput.__kbfix = true; pcInput.addEventListener('focus', onFocus); pcInput.addEventListener('blur', onBlur); }
        if (window.visualViewport && !window.__vvListener) {
            window.__vvListener = true;
            var initialHeight = window.visualViewport.height;
            window.visualViewport.addEventListener('resize', function () {
                var k = initialHeight - window.visualViewport.height;
                if (k > 150) document.body.classList.add('keyboard-open');
                else document.body.classList.remove('keyboard-open');
            });
            window.addEventListener('orientationchange', function () {
                setTimeout(function () { initialHeight = window.visualViewport.height; }, 300);
            });
        }
    }

    /* ═══ Mics — إعادة الرسم إن فشل ═══ */
    function ensureMicsRendered() {
        var attempts = 0;
        var t = setInterval(function () {
            attempts++;
            var c = document.querySelector('#mics-bar .mics');
            if (c && c.children.length > 0) { clearInterval(t); return; }
            var u = getCurrentUser();
            if (u && u.rank && typeof updateMicsUI === 'function') { try { updateMicsUI(); } catch (e) {} }
            if (attempts >= 20) clearInterval(t);
        }, 500);
    }

    /* ═══════════════════════════════════════════ */
    /* ⭐⭐ OVERRIDE: applyRoomBackground           */
    /* (يبقى — مهم لتحميل خلفيات الغرف)            */
    /* ═══════════════════════════════════════════ */
    function applyRoomBgNew(roomId) {
        var container = document.getElementById('messages');
        if (!container) return;

        // تنظيف
        container.style.removeProperty('background');
        container.style.removeProperty('background-image');
        container.style.removeProperty('background-color');
        container.style.removeProperty('background-size');
        container.style.removeProperty('background-position');
        container.style.removeProperty('background-repeat');

        if (!roomId) return;

        // اقرأ من Firebase مباشرة
        db.ref('room_settings/' + roomId).once('value').then(function (s) {
            var c = s.val() || {};
            var bgType = c.bgType;
            var bgValue = c.bgValue;
            var bgImage = c.bgImage;

            // 1. صورة من الجهاز
            if (bgType === 'custom' && bgImage) {
                container.style.setProperty('background-image', 'url("' + bgImage + '")', 'important');
                container.style.setProperty('background-size', 'cover', 'important');
                container.style.setProperty('background-position', 'center', 'important');
                container.style.setProperty('background-repeat', 'no-repeat', 'important');
                return;
            }
            // 2. صورة URL
            if (bgType === 'image' && bgValue) {
                if (/^https?:\/\//i.test(bgValue)) {
                    container.style.setProperty('background-image', 'url("' + bgValue + '")', 'important');
                    container.style.setProperty('background-size', 'cover', 'important');
                    container.style.setProperty('background-position', 'center', 'important');
                    container.style.setProperty('background-repeat', 'no-repeat', 'important');
                }
                return;
            }
            // 3. لون
            if (bgType === 'color' && bgValue) {
                container.style.setProperty('background', bgValue, 'important');
                return;
            }
            // 4. تدرج
            if (bgType === 'gradient' && bgValue) {
                if (/linear-gradient|radial-gradient/i.test(bgValue) && !/[<>]/.test(bgValue)) {
                    container.style.setProperty('background', bgValue, 'important');
                }
            }
            // 5. لو كان bgImage بدون bgType
            if (!bgType && bgImage) {
                container.style.setProperty('background-image', 'url("' + bgImage + '")', 'important');
                container.style.setProperty('background-size', 'cover', 'important');
                container.style.setProperty('background-position', 'center', 'important');
            }
        }).catch(function (e) { console.warn('applyRoomBg error:', e); });
    }

    // ⭐ استبدال الدالة القديمة
    window.applyRoomBackground = applyRoomBgNew;

    /* ═══ تطبيق إعدادات الغرف على السيدبار ═══ */
    function applyRoomImage(roomId, settings) {
        var el = document.querySelector('.sidebar-item[data-room-id="' + roomId + '"]');
        if (!el) return;
        var spans = el.querySelectorAll('span');
        if (spans.length < 2) return;
        var iconSpan = spans[0];
        var nameSpan = spans[1];

        if (settings.iconImage) {
            if (!iconSpan.querySelector('img')) {
                iconSpan.innerHTML = '';
                var img = document.createElement('img');
                img.src = settings.iconImage;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                iconSpan.appendChild(img);
            } else {
                iconSpan.querySelector('img').src = settings.iconImage;
            }
        } else {
            iconSpan.textContent = settings.icon || '🚪';
        }

        if (settings.name) nameSpan.textContent = settings.name;

        // ⭐ لون اسم الغرفة
        if (settings.nameColor) {
            nameSpan.style.color = settings.nameColor;
        } else {
            nameSpan.style.color = '';
        }

        if (typeof QAMAR !== 'undefined' && QAMAR.ROOMS && QAMAR.ROOMS[roomId]) {
            if (settings.name) QAMAR.ROOMS[roomId].name = settings.name;
            if (settings.icon) QAMAR.ROOMS[roomId].icon = settings.icon;
            if (settings.iconImage) QAMAR.ROOMS[roomId].iconImage = settings.iconImage;
            else delete QAMAR.ROOMS[roomId].iconImage;
            if (settings.bgImage) QAMAR.ROOMS[roomId].bgImage = settings.bgImage;
            if (settings.bgType) QAMAR.ROOMS[roomId].bgType = settings.bgType;
            if (settings.bgValue) QAMAR.ROOMS[roomId].bgValue = settings.bgValue;
            if (settings.nameColor) QAMAR.ROOMS[roomId].nameColor = settings.nameColor;
            if (settings.fontColor) QAMAR.ROOMS[roomId].fontColor = settings.fontColor;
            if (settings.fontSize) QAMAR.ROOMS[roomId].fontSize = settings.fontSize;
        }
    }

    /* ═══ watchRoomSettings — يحدّث السيدبار + الخلفية الحالية + الخط ═══ */
    function watchRoomSettings() {
        if (typeof db === 'undefined' || !db) { setTimeout(watchRoomSettings, 1500); return; }
        db.ref('room_settings').on('value', function (s) {
            var settings = s.val() || {};
            Object.keys(settings).forEach(function (rid) {
                applyRoomImage(rid, settings[rid]);
            });
            // ⭐ طبّق الخلفية على الغرفة الحالية
            if (typeof ChatState !== 'undefined' && ChatState.currentRoom) {
                applyRoomBgNew(ChatState.currentRoom);
                // ⭐ طبّق الخط
                var currentSettings = settings[ChatState.currentRoom] || {};
                if (typeof applyRoomFont === 'function') {
                    applyRoomFont(currentSettings);
                }
            }
        });
    }

    /* ═══ متابعة تغيير الغرفة — تطبيق الخلفية + الخط ═══ */
    function watchRoomChange() {
        if (typeof ChatState === 'undefined') { setTimeout(watchRoomChange, 800); return; }
        var lastRoom = null;
        var iv = setInterval(function () {
            if (ChatState.currentRoom && ChatState.currentRoom !== lastRoom) {
                lastRoom = ChatState.currentRoom;
                setTimeout(function () { applyRoomBgNew(ChatState.currentRoom); }, 150);
            }
        }, 500);
    }

    /* ═══ Init ═══ */
    function init() {
        // نقرأ النمط الحالي ونطبّقه على body (التبديل من غرفة الملك)
        applyStyle(currentStyle);

        var t = setInterval(function () {
            if (document.getElementById('message-input') && typeof getCurrentUser === 'function' && getCurrentUser()) {
                clearInterval(t);
                setupKeyboardHandlers();
                ensureMicsRendered();
                watchRoomSettings();
                watchRoomChange();
                // تطبيق فوري للخلفية الحالية
                if (typeof ChatState !== 'undefined' && ChatState.currentRoom) {
                    setTimeout(function () { applyRoomBgNew(ChatState.currentRoom); }, 400);
                }
                console.log('✅ chat-fixes.js v7: ready');
            }
        }, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    // ⭐ تصدير applyStyle (يستطيع king-room استدعاءه إن احتاج)
    window.applySidebarStyle = applyStyle;

    console.log('✅ chat-fixes.js v7 loaded — glass moved to qamar-glass.css');
})();
