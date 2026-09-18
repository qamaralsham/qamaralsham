/* ==============================================
   profile-appearance-patch.js v1
   يُحمَّل بعد profile-appearance.js
   يُصلح 5 مشاكل بدون تعديل الأصل:
     1) خلفية الاسم (كبسولة حقيقية بدل blur)
     2) التوهج (filter بدل text-shadow — يعمل مع التدرج)
     3) التدرج لا يُلغي التوهج
     4) البايو يظهر دائماً
     5) الحجم لا يزيح الرتبة (مع CSS patch)
   ============================================== */

(function () {
    'use strict';
    if (window.__profileAppearancePatchV1) return;
    window.__profileAppearancePatchV1 = true;

    /* ═══════════════════════════════════════════ */
    /* 1) استبدال applyAllNameStyles              */
    /* ═══════════════════════════════════════════ */
    var _origApplyAll = window.applyAllNameStyles;

    window.applyAllNameStyles = function () {
        var el = document.getElementById('profile-username');
        if (!el) return;

        // احفظ النص
        var currentName = el.getAttribute('data-name') || el.textContent || 'مستخدم';
        el.setAttribute('data-name', currentName);

        // 1) نظّف الكلاسات
        var toRemove = [];
        el.classList.forEach(function (c) {
            if (c.indexOf('nf-') === 0 || c.indexOf('name-') === 0 ||
                c === 'glow-soft' || c === 'glow-medium' || c === 'glow-strong' ||
                c === 'text-gradient' || c === 'name-has-effects' ||
                c === 'name-bg-active') {
                toRemove.push(c);
            }
        });
        toRemove.forEach(function (c) { el.classList.remove(c); });

        // 2) نظّف الـ styles
        el.style.cssText = '';
        el.textContent = currentName;

        // 3) اقرأ الحالة
        var hasBg = typeof nameBgGradient !== 'undefined' && nameBgGradient &&
                    typeof NameBgState !== 'undefined' && NameBgState.enabled;
        var hasGradient = typeof nameGradient !== 'undefined' && nameGradient && nameGradient.length >= 2;
        var hasColor = typeof nameColor !== 'undefined' && !!nameColor;
        var hasGlow = typeof nameGlow !== 'undefined' && nameGlow && nameGlow !== 'none';

        // 4) خلفية الاسم — كبسولة حقيقية
        if (hasBg) {
            var g = NameBgState;
            var angle = 90;
            if (g.direction === 'vertical') angle = 180;
            else if (g.direction === 'diagonal') angle = 135;

            var bgGrad = 'linear-gradient(' + angle + 'deg, ' +
                g.colors[0] + ' ' + g.positions[0] + '%, ' +
                g.colors[1] + ' ' + g.positions[1] + '%, ' +
                g.colors[2] + ' ' + g.positions[2] + '%)';

            el.style.background = bgGrad;
            el.style.backgroundImage = bgGrad;
            el.style.padding = '4px 16px';
            el.style.borderRadius = '999px';
            el.style.display = 'inline-block';
            el.classList.add('name-bg-active');
        }

        // 5) التدرج النصي أو اللون
        if (hasGradient && !hasBg) {
            // بدون خلفية → استخدم background-clip: text
            el.style.backgroundImage = 'linear-gradient(90deg, ' +
                nameGradient[0] + ', ' + nameGradient[1] + ', ' + nameGradient[0] + ')';
            el.style.backgroundSize = '300% 100%';
            el.style.webkitBackgroundClip = 'text';
            el.style.backgroundClip = 'text';
            el.style.webkitTextFillColor = 'transparent';
            el.style.color = 'transparent';
            el.classList.add('text-gradient');
            el.style.animation = 'nfMoveFast 1.5s linear infinite';
        } else if (hasGradient && hasBg) {
            // مع الخلفية → التدرج لا يعمل، النص أبيض
            el.style.color = '#ffffff';
            el.style.webkitTextFillColor = '#ffffff';
        } else if (hasColor) {
            el.style.color = nameColor;
            el.style.webkitTextFillColor = nameColor;
        } else if (hasBg) {
            el.style.color = '#ffffff';
            el.style.webkitTextFillColor = '#ffffff';
        }

        // 6) التوهج عبر filter (يعمل مع التدرج والخلفية)
        if (hasGlow) {
            var glowColor = hasColor ? nameColor : (hasGradient ? nameGradient[0] : '#ffd700');
            var glowSize = 6, glowIntensity = 1;
            if (nameGlow === 'soft') { glowSize = 6; glowIntensity = 1; }
            else if (nameGlow === 'medium') { glowSize = 12; glowIntensity = 2; }
            else if (nameGlow === 'strong') { glowSize = 20; glowIntensity = 3; }

            var filters = [];
            for (var i = 0; i < glowIntensity; i++) {
                filters.push('drop-shadow(0 0 ' + (glowSize + i * 4) + 'px ' + glowColor + ')');
            }
            el.style.filter = filters.join(' ');
        }

        // 7) الحجم
        if (typeof nameSize !== 'undefined' && nameSize) {
            el.style.fontSize = nameSize + 'px';
        }

        // 8) البايو — استرجاع من localStorage إن كان فارغاً
        var bioEl = document.getElementById('profile-bio');
        if (bioEl) {
            var bioText = (bioEl.textContent || '').trim();
            if (!bioText || bioText === '@user' || bioText === '—') {
                var stored = localStorage.getItem('profile_bio');
                if (stored) bioEl.textContent = stored;
            }
        }
    };

    /* ═══════════════════════════════════════════ */
    /* 2) استبدال applyNameBgToUsernameEl (للشات) */
    /* ═══════════════════════════════════════════ */
    window.applyNameBgToUsernameEl = function (un, g) {
        if (!un) return;

        if (!g || g.enabled === false) {
            un.style.removeProperty('background');
            un.style.removeProperty('background-image');
            un.style.removeProperty('padding');
            un.style.removeProperty('border-radius');
            un.classList.remove('name-bg-active');
            return;
        }

        // ألغِ أي تدرج نصي (تعارض)
        un.style.webkitBackgroundClip = '';
        un.style.backgroundClip = '';
        un.style.webkitTextFillColor = '';
        un.style.animation = 'none';
        un.style.color = '#ffffff';

        var angle = 90;
        if (g.direction === 'vertical') angle = 180;
        else if (g.direction === 'diagonal') angle = 135;

        var colors = g.colors || ['#ff006e', '#8338ec', '#3a86ff'];
        var pos = g.positions || [0, 50, 100];
        var grad = 'linear-gradient(' + angle + 'deg, ' +
            colors[0] + ' ' + pos[0] + '%, ' +
            colors[1] + ' ' + pos[1] + '%, ' +
            colors[2] + ' ' + pos[2] + '%)';

        un.style.background = grad;
        un.style.backgroundImage = grad;
        un.style.padding = '2px 12px';
        un.style.borderRadius = '999px';
        un.style.display = 'inline-block';
        un.classList.add('name-bg-active');
    };

    /* ═══════════════════════════════════════════ */
    /* 3) مراقبة تغيير الاسم (data-name)         */
    /* ═══════════════════════════════════════════ */
    function observeNameChanges() {
        var el = document.getElementById('profile-username');
        if (!el) { setTimeout(observeNameChanges, 1000); return; }

        var lastText = el.getAttribute('data-name') || el.textContent;
        new MutationObserver(function () {
            var newText = el.getAttribute('data-name') || el.textContent;
            if (newText !== lastText && newText) {
                lastText = newText;
                try { window.applyAllNameStyles(); } catch (e) {}
            }
        }).observe(el, {
            attributes: true,
            attributeFilter: ['data-name'],
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    /* ═══════════════════════════════════════════ */
    /* 4) تشغيل تلقائي                            */
    /* ═══════════════════════════════════════════ */
    function boot() {
        try {
            if (typeof window.applyAllNameStyles === 'function') {
                window.applyAllNameStyles();
            }
        } catch (e) { console.warn('[Patch] apply error:', e); }

        observeNameChanges();
        console.log('✅ profile-appearance-patch.js v1 loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(boot, 800);
        });
    } else {
        setTimeout(boot, 800);
    }
})();
