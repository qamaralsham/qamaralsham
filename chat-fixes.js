// ==============================================
// chat-fixes.js v6 — applyRoomBackground override
// ==============================================

(function () {
    'use strict';
    if (window.__chatFixesV6) return;
    window.__chatFixesV6 = true;

    var STYLE_KEY = 'qamar_sidebar_style';
    var currentStyle = localStorage.getItem(STYLE_KEY) || 'classic';

    /* ═══ CSS ═══ */
    (function injectCSS() {
        var old = document.getElementById('chat-fixes-css');
        if (old) old.remove();
        var s = document.createElement('style');
        s.id = 'chat-fixes-css';
        s.textContent = [
            'body.keyboard-open .bottom-nav,',
            'body.keyboard-open .floating-toolbar { display: none !important; }',
            '#ra-send-btn { animation: none !important; box-shadow: 0 0 8px rgba(255, 215, 0, 0.35) !important; }',

            'body.sidebar-glass .sidebar-content { padding: 10px !important; gap: 0 !important; display: flex !important; flex-direction: column !important; }',
            'body.sidebar-glass .sidebar-content .sidebar-item {',
            '    width: 100% !important; height: 65px !important; min-height: 65px !important;',
            '    margin: 0 !important; padding: 0 16px !important; border-radius: 0 !important;',
            '    display: flex !important; align-items: center !important; gap: 14px !important;',
            '    position: relative !important; box-sizing: border-box !important;',
            '    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.18) 100%) !important;',
            '    backdrop-filter: blur(14px) saturate(150%) !important;',
            '    -webkit-backdrop-filter: blur(14px) saturate(150%) !important;',
            '    border: 1px solid rgba(255,215,0,0.20) !important;',
            '    border-top: none !important; border-bottom: 1px solid rgba(255,215,0,0.10) !important;',
            '    box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.35) !important;',
            '    font-size: 14px !important; font-weight: 800 !important; color: #fff !important;',
            '    cursor: pointer !important; overflow: hidden !important;',
            '}',
            'body.sidebar-glass .sidebar-content .sidebar-item:first-child { border-top: 1px solid rgba(255,215,0,0.20) !important; border-radius: 16px 16px 0 0 !important; }',
            'body.sidebar-glass .sidebar-content .sidebar-item:last-child { border-bottom: 1px solid rgba(255,215,0,0.20) !important; border-radius: 0 0 16px 16px !important; }',
            'body.sidebar-glass .sidebar-content .sidebar-item:only-child { border-radius: 16px !important; border-top: 1px solid rgba(255,215,0,0.20) !important; border-bottom: 1px solid rgba(255,215,0,0.20) !important; }',
            'body.sidebar-glass .sidebar-content .sidebar-item > span:first-child {',
            '    font-size: 22px !important; flex-shrink: 0 !important;',
            '    display: inline-flex !important; align-items: center !important; justify-content: center !important;',
            '    width: 38px !important; height: 38px !important;',
            '    border-radius: 10px !important;',
            '    background: rgba(255,215,0,0.06) !important; border: 1px solid rgba(255,215,0,0.12) !important;',
            '    overflow: hidden !important;',
            '}',
            'body.sidebar-glass .sidebar-content .sidebar-item > span:last-child { flex: 1 !important; font-weight: 800 !important; font-size: 14px !important; color: #fff !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }',
            'body.sidebar-glass .sidebar-content .sidebar-item.active {',
            '    background: linear-gradient(135deg, rgba(255,215,0,0.28) 0%, rgba(255,215,0,0.12) 50%, rgba(0,0,0,0.15) 100%) !important;',
            '    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(255,215,0,0.35) !important;',
            '    color: #ffd700 !important; font-weight: 900 !important;',
            '}',
            'body.sidebar-glass .sidebar-content .sidebar-item.active > span:first-child { background: rgba(255,215,0,0.2) !important; border-color: rgba(255,215,0,0.5) !important; }',

            '#sidebar-style-toggle {',
            '    width: 100%; padding: 12px; margin-top: 12px;',
            '    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05));',
            '    border: 1px solid rgba(255,215,0,0.4); border-radius: 10px;',
            '    color: #ffd700; font-family: inherit; font-size: 13px; font-weight: 900;',
            '    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;',
            '}',
            '#sidebar-style-toggle:active { transform: scale(0.97); }'
        ].join('\n');
        document.head.appendChild(s);
    })();

    /* ═══ Style toggle ═══ */
    function applyStyle(style) {
        document.body.classList.toggle('sidebar-glass', style === 'glass');
        document.body.classList.toggle('sidebar-classic', style === 'classic');
        localStorage.setItem(STYLE_KEY, style);
        currentStyle = style;
        var btn = document.getElementById('sidebar-style-toggle');
        if (btn) {
            btn.querySelector('.st-label').textContent = style === 'glass' ? 'التبديل إلى: كلاسيكي' : 'التبديل إلى: زجاجي';
            btn.querySelector('.st-icon').textContent = style === 'glass' ? '◻️' : '💎';
        }
    }
    function toggleStyle() {
        applyStyle(currentStyle === 'glass' ? 'classic' : 'glass');
        if (typeof showToast === 'function') showToast('fa-check', currentStyle === 'glass' ? '💎 الشكل الزجاجي' : '◻️ الشكل الكلاسيكي');
    }
    function addStyleToggleButton() {
        var sc = document.querySelector('#settings-sidebar .sidebar-content');
        if (!sc) return false;
        if (document.getElementById('sidebar-style-toggle')) return true;
        var btn = document.createElement('button');
        btn.id = 'sidebar-style-toggle';
        btn.type = 'button';
        btn.innerHTML = '<span class="st-icon">' + (currentStyle === 'glass' ? '◻️' : '💎') + '</span><span class="st-label">' + (currentStyle === 'glass' ? 'التبديل إلى: كلاسيكي' : 'التبديل إلى: زجاجي') + '</span>';
        btn.onclick = toggleStyle;
        sc.appendChild(btn);
        return true;
    }

    /* ═══ Keyboard ═══ */
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

    /* ═══ Mics ═══ */
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

        if (typeof QAMAR !== 'undefined' && QAMAR.ROOMS && QAMAR.ROOMS[roomId]) {
            if (settings.name) QAMAR.ROOMS[roomId].name = settings.name;
            if (settings.icon) QAMAR.ROOMS[roomId].icon = settings.icon;
            if (settings.iconImage) QAMAR.ROOMS[roomId].iconImage = settings.iconImage;
            else delete QAMAR.ROOMS[roomId].iconImage;
            if (settings.bgImage) QAMAR.ROOMS[roomId].bgImage = settings.bgImage;
            if (settings.bgType) QAMAR.ROOMS[roomId].bgType = settings.bgType;
            if (settings.bgValue) QAMAR.ROOMS[roomId].bgValue = settings.bgValue;
        }
    }

    /* ═══ watchRoomSettings — يحدّث السيدبار + الخلفية الحالية ═══ */
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
            }
        });
    }

    /* ═══ متابعة تغيير الغرفة — تطبيق الخلفية ═══ */
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
        applyStyle(currentStyle);

        var t = setInterval(function () {
            if (document.getElementById('message-input') && typeof getCurrentUser === 'function' && getCurrentUser()) {
                clearInterval(t);
                setupKeyboardHandlers();
                ensureMicsRendered();
                watchRoomSettings();
                watchRoomChange();
                addStyleToggleButton();
                // تطبيق فوري للخلفية الحالية
                if (typeof ChatState !== 'undefined' && ChatState.currentRoom) {
                    setTimeout(function () { applyRoomBgNew(ChatState.currentRoom); }, 400);
                }
                console.log('✅ chat-fixes.js v6: ready');
            }
        }, 400);

        var attempts = 0;
        var bt = setInterval(function () {
            attempts++;
            if (addStyleToggleButton() || attempts >= 20) clearInterval(bt);
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    console.log('✅ chat-fixes.js v6 loaded');
})();
