// ==============================================
// name-effects.js v1 — نظام 3 طبقات للاسم
// ==============================================
// ✅ v1:
//   1. NameEffects.apply(el, params)
//   2. NameEffects.applyDefaultAvatarFrame(box, rank, level)
//   3. NameEffects.clear(el)
//   4. NameEffects.previewTemplate(text)
//   5. إدارة data-text تلقائياً (للتدرج المتحرك)
//   6. توهج تلقائي 1px (من CSS عبر --name-bg-glow)
//   7. لا يستخدم localStorage — مسؤولية profile-core.js
// ==============================================

(function () {
    'use strict';
    if (window.__nameEffectsV1) return;
    window.__nameEffectsV1 = true;

    /* ══════════════════════════════════════════════ */
    /* أدوات مساعدة                                    */
    /* ══════════════════════════════════════════════ */

    function _escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function _isValidColor(c) {
        if (!c || typeof c !== 'string') return false;
        return /^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/.test(c.trim());
    }

    function _isValidGradient(g) {
        if (!Array.isArray(g) || g.length < 2) return false;
        return _isValidColor(g[0]) && _isValidColor(g[1]);
    }

    /**
     * ⭐ يبني string CSS للتدرج.
     * @param {Array<string>} colors - مصفوفة ألوان (2 على الأقل)
     * @returns {string} gradient string
     */
    function _buildGradient(colors) {
        if (!_isValidGradient(colors)) return '';
        const stops = colors.map(function (c, i) {
            const pct = (i / (colors.length - 1)) * 100;
            return c + ' ' + pct.toFixed(1) + '%';
        });
        return 'linear-gradient(90deg, ' + stops.join(', ') + ')';
    }

    /**
     * ⭐ يبني خلفية الاسم (color أو gradient).
     * يعيد string جاهز للـ CSS var.
     */
    function _buildNameBg(bgColor, bgGradient) {
        // 1. تدرج الخلفية (الأولوية)
        if (Array.isArray(bgGradient) && bgGradient.length >= 2) {
            return _buildGradient(bgGradient);
        }
        // 2. لون الخلفية
        if (_isValidColor(bgColor)) {
            return bgColor;
        }
        return '';
    }

    /**
     * ⭐ يستخرج اللون الأساسي من خلفية الاسم (لحساب التوهج).
     */
    function _extractBgGlowColor(bgColor, bgGradient) {
        if (Array.isArray(bgGradient) && bgGradient.length >= 2 && _isValidColor(bgGradient[0])) {
            return bgGradient[0];
        }
        if (_isValidColor(bgColor)) return bgColor;
        return 'transparent';
    }

    /**
     * ⭐ يجلب الحجم الافتراضي (26px من CSS).
     */
    function _getFallbackColor(params) {
        if (params && _isValidColor(params.color)) return params.color;
        return '#ffd700';
    }

    /* ══════════════════════════════════════════════ */
    /* التطبيق الرئيسي                                */
    /* ══════════════════════════════════════════════ */

    /**
     * يطبّق التأثيرات الكاملة على عنصر اسم.
     *
     * @param {HTMLElement} el — عنصر الاسم (username)
     * @param {Object} params — التأثيرات:
     *   @param {string}  [params.nameColor]         — لون النص
     *   @param {Array}   [params.nameGradient]      — تدرج النص [color1, color2]
     *   @param {string}  [params.nameBgColor]       — لون الخلفية
     *   @param {Array}   [params.nameBgGradient]    — تدرج الخلفية
     *   @param {string}  [params.color]             — لون احتياطي (user.color)
     *   @param {boolean} [params.skipDataText]      — لا تُضف data-text (لأداء)
     */
    function apply(el, params) {
        if (!el) return;
        params = params || {};

        // 1. نظّف أولاً
        _cleanClasses(el);
        _cleanVars(el);

        // 2. الفئة الأساسية دائماً
        el.classList.add('name-styled');

        // 3. اقرأ القيم
        const nameColor    = params.nameColor    || null;
        const nameGradient = params.nameGradient || null;
        const nameBgColor  = params.nameBgColor  || null;
        const nameBgGrad   = params.nameBgGradient || null;
        const fallbackColor = _getFallbackColor(params);

        // 4. هل في خلفية؟ (لون أو تدرج)
        const hasBg = (!!nameBgColor && _isValidColor(nameBgColor)) ||
                      (Array.isArray(nameBgGrad) && nameBgGrad.length >= 2);

        // 5. هل في تدرج نص؟
        const hasGradient = Array.isArray(nameGradient) && nameGradient.length >= 2
                            && _isValidColor(nameGradient[0]) && _isValidColor(nameGradient[1]);

        // 6. هل في لون نص؟
        const hasColor = !!nameColor && _isValidColor(nameColor);

        // ═══════════════════════════════════════════
        // الحالة 1: لا شي — لون احتياطي فقط
        // ═══════════════════════════════════════════
        if (!hasBg && !hasGradient && !hasColor) {
            el.style.color = fallbackColor;
            return;
        }

        // ═══════════════════════════════════════════
        // الحالة 2: خلفية فقط
        // ═══════════════════════════════════════════
        if (hasBg && !hasGradient && !hasColor) {
            _applyBg(el, nameBgColor, nameBgGrad);
            el.style.color = fallbackColor;
            return;
        }

        // ═══════════════════════════════════════════
        // الحالة 3: لون نص فقط (بدون تدرج)
        // ═══════════════════════════════════════════
        if (hasColor && !hasGradient) {
            if (hasBg) _applyBg(el, nameBgColor, nameBgGrad);
            el.style.setProperty('--name-color', nameColor);
            el.style.color = nameColor;
            return;
        }

        // ═══════════════════════════════════════════
        // الحالة 4: تدرج نص (مع/بدون خلفية، مع/بدون لون أساسي)
        // ═══════════════════════════════════════════
        if (hasGradient) {
            // الخلفية (اختيارية)
            if (hasBg) _applyBg(el, nameBgColor, nameBgGrad);

            // لون أساسي احتياطي (يظهر خلف التدرج الشفاف)
            const baseColor = hasColor ? nameColor : fallbackColor;
            el.style.setProperty('--name-color', baseColor);
            el.style.color = baseColor;

            // التدرج فوقه (الطبقة 3)
            el.classList.add('has-gradient');

            // ⭐ data-text مطلوب للتدرج (يُستخدم كـ content)
            if (!params.skipDataText) {
                const currentText = el.dataset.name || el.textContent || '';
                el.setAttribute('data-text', currentText);
            } else {
                el.setAttribute('data-text', '');
            }

            // gradient string
            const gradStr = _buildGradient(nameGradient);
            if (gradStr) {
                el.style.setProperty('--name-gradient', gradStr);
            }
            return;
        }
    }

    /* ══════════════════════════════════════════════ */
    /* مساعد: تطبيق الخلفية                          */
    /* ══════════════════════════════════════════════ */
    function _applyBg(el, bgColor, bgGrad) {
        const bgValue = _buildNameBg(bgColor, bgGrad);
        if (!bgValue) return;

        el.classList.add('has-bg');
        el.style.setProperty('--name-bg', bgValue);

        // توهج 1px تلقائي — نفس لون الخلفية
        const glowColor = _extractBgGlowColor(bgColor, bgGrad);
        if (glowColor !== 'transparent') {
            el.style.setProperty('--name-bg-glow', glowColor);
        }
    }

    /* ══════════════════════════════════════════════ */
    /* مساعد: تنظيف                                   */
    /* ══════════════════════════════════════════════ */
    function _cleanClasses(el) {
        el.classList.remove(
            'name-styled',
            'has-bg',
            'has-gradient',
            'name-color-only',
            'name-gradient-only'
        );
    }

    function _cleanVars(el) {
        el.style.removeProperty('--name-color');
        el.style.removeProperty('--name-bg');
        el.style.removeProperty('--name-bg-glow');
        el.style.removeProperty('--name-gradient');
        el.style.removeProperty('--name-gradient-opacity');
        el.style.color = '';
        el.removeAttribute('data-text');
    }

    /**
     * إزالة كل التأثيرات.
     */
    function clear(el) {
        if (!el) return;
        _cleanClasses(el);
        _cleanVars(el);
    }

    /* ══════════════════════════════════════════════ */
    /* الإطار الافتراضي للأفاتار                      */
    /* ══════════════════════════════════════════════ */

    /**
     * يطبّق الإطار الافتراضي حسب الرتبة.
     * @param {HTMLElement} box — عنصر .avatar-box
     * @param {string} rank — رتبة المستخدم (King/Queen/...)
     * @param {number} level — (اختياري) rankLevel
     */
    function applyDefaultAvatarFrame(box, rank, level) {
        if (!box) return;

        // نظّف الإطارات الافتراضية السابقة
        box.classList.remove(
            'default-frame-gold',
            'default-frame-pink',
            'default-frame-silver',
            'default-frame-gray'
        );

        // ⭐ لا تُطبّق الإطار الافتراضي لو في إطار مخصص (.qf)
        if (box.querySelector('.qf')) return;

        // اقرأ الخريطة من QAMAR
        const map = (typeof QAMAR !== 'undefined' && QAMAR.DEFAULT_AVATAR_FRAMES)
            ? QAMAR.DEFAULT_AVATAR_FRAMES
            : null;

        if (!map) return;

        const frameType = map[rank] || 'gray';
        if (frameType && frameType !== 'none') {
            box.classList.add('default-frame-' + frameType);
        }
    }

    /**
     * إزالة الإطار الافتراضي.
     */
    function clearDefaultAvatarFrame(box) {
        if (!box) return;
        box.classList.remove(
            'default-frame-gold',
            'default-frame-pink',
            'default-frame-silver',
            'default-frame-gray'
        );
    }

    /* ══════════════════════════════════════════════ */
    /* معاينات الاسم (Drill-down)                     */
    /* ══════════════════════════════════════════════ */

    /**
     * يبني HTML لمعاينة اسم داخل عنصر قابل للنقر.
     *
     * @param {string} text — نص الاسم (اسم صاحب البروفايل)
     * @param {Object} params — نفس params apply
     * @param {string} [extraClass] — فئة إضافية
     * @returns {HTMLElement}
     */
    function previewTemplate(text, params, extraClass) {
        const el = document.createElement('div');
        el.className = 'name-grid-item' + (extraClass ? ' ' + extraClass : '');
        el.dataset.previewName = text || '';

        const inner = document.createElement('span');
        inner.className = 'name-styled';
        inner.textContent = text || '';
        inner.setAttribute('data-text', text || '');
        el.appendChild(inner);

        // طبّق التأثيرات
        apply(inner, params);

        return el;
    }

    /* ══════════════════════════════════════════════ */
    /* تصدير                                          */
    /* ══════════════════════════════════════════════ */

    window.NameEffects = {
        apply: apply,
        clear: clear,
        applyDefaultAvatarFrame: applyDefaultAvatarFrame,
        clearDefaultAvatarFrame: clearDefaultAvatarFrame,
        previewTemplate: previewTemplate,
        // أدوات قد تُستخدم خارجياً
        buildGradient: _buildGradient,
        isValidColor: _isValidColor,
        isValidGradient: _isValidGradient
    };

    console.log('✅ name-effects.js v1 loaded — 3-layer system + default frames');
})();
