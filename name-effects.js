// ==============================================
// name-effects.js v6 — 9 أنماط سينمائية
// ==============================================
// ✅ v6:
//   1. applyCinemaStyle(el, styleId, target) — جديد
//   2. splitToChars / unsplit — تلقائي
//   3. multicolor + sugar: تقسيم حروف + ألوان
//   4. باقي الأنماط: CSS فقط
//   5. النص والخلفية مستقلان
//   6. الأنماط القديمة (nameColor/nameGradient...) كما هي
// ==============================================

(function () {
    'use strict';
    if (window.__nameEffectsV6) return;
    window.__nameEffectsV6 = true;

    /* ══════════════════════════════════════════════ */
    /* Colors لـ sugar                                */
    /* ══════════════════════════════════════════════ */
    const SUGAR_COLORS = [
        '#ff0000', '#ffd700', '#00ff88', '#00f3ff', '#a855f7',
        '#ff0080', '#ff8c00', '#39ff14', '#00bfff', '#ff69b4'
    ];

    const CINEMA_TEXT_STYLES = [
        'multicolor', 'spiral', 'nebula', 'storm',
        'fireworks', 'sugar', 'snow', 'volcano', 'waves'
    ];

    const SPLIT_STYLES = ['multicolor', 'sugar'];

    /* ══════════════════════════════════════════════ */
    /* Helpers                                        */
    /* ══════════════════════════════════════════════ */
    function _isValidColor(c) {
        if (!c || typeof c !== 'string') return false;
        return /^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/.test(c.trim());
    }

    function _isValidGradient(g) {
        if (!Array.isArray(g) || g.length < 2) return false;
        return _isValidColor(g[0]) && _isValidColor(g[1]);
    }

    function _gradientHash(grad) {
        if (!Array.isArray(grad)) return 0;
        let h = 0;
        for (let i = 0; i < grad.length; i++) {
            const c = grad[i];
            for (let k = 0; k < c.length; k++) {
                h = ((h * 31) + c.charCodeAt(k)) >>> 0;
            }
        }
        return h;
    }

    function _buildGradient(colors, hashSeed) {
        if (!_isValidGradient(colors)) return '';
        const ANGLES = [90, 135, 45, 120, 60, 150, 30, 180, 75, 105, 15, 165];
        const seed = (typeof hashSeed === 'number') ? hashSeed : 0;
        const angle = ANGLES[seed % ANGLES.length];
        const dir = angle + 'deg';

        if (colors.length === 2) {
            return 'repeating-linear-gradient(' + dir + ', ' +
                colors[0] + ' 0%, ' +
                colors[1] + ' 50%, ' +
                colors[0] + ' 100%)';
        }
        const stops = colors.map(function (c, i) {
            const pct = (i / (colors.length - 1)) * 100;
            return c + ' ' + pct.toFixed(1) + '%';
        });
        return 'linear-gradient(' + dir + ', ' + stops.join(', ') + ')';
    }

    function _buildNameBg(bgColor, bgGradient) {
        if (Array.isArray(bgGradient) && bgGradient.length >= 2) {
            return _buildGradient(bgGradient, _gradientHash(bgGradient));
        }
        if (_isValidColor(bgColor)) return bgColor;
        return '';
    }

    function _extractBgGlowColor(bgColor, bgGradient) {
        if (Array.isArray(bgGradient) && bgGradient.length >= 2 && _isValidColor(bgGradient[0])) {
            return bgGradient[0];
        }
        if (_isValidColor(bgColor)) return bgColor;
        return 'transparent';
    }

    function _getFallbackColor(params) {
        if (params && _isValidColor(params.color)) return params.color;
        return '#ffd700';
    }

    /* ══════════════════════════════════════════════ */
    /* Split / Unsplit                                */
    /* ══════════════════════════════════════════════ */
    function _isSplit(el) {
        return el.classList.contains('cinema-split') ||
               el.classList.contains('cinema-split-bg');
    }

    function _splitToChars(el, styleId, target) {
        // احفظ النص الأصلي
        const originalText = el.dataset.name || el.textContent || '';
        el.dataset.originalText = originalText;

        // امسح ثم أعد البناء
        el.innerHTML = '';

        for (let i = 0; i < originalText.length; i++) {
            const ch = originalText[i];
            const span = document.createElement('span');
            span.className = 'nc';
            span.setAttribute('data-ci', i);

            // النص (space → nbsp)
            span.textContent = (ch === ' ') ? '\u00A0' : ch;

            // ⭐ لون خاص لكل حرف (sugar)
            if (styleId === 'sugar') {
                const color = SUGAR_COLORS[i % SUGAR_COLORS.length];
                if (target === 'text') {
                    span.style.setProperty('--sugar-color', color);
                } else {
                    // خلفية: نفس اللون بـ alpha
                    const rgba = _hexToRgba(color, 0.4);
                    span.style.setProperty('--sugar-bg-color', rgba);
                }
            }

            el.appendChild(span);
        }
    }

    function _hexToRgba(hex, alpha) {
        if (!hex || hex.charAt(0) !== '#') return 'rgba(255,255,255,' + alpha + ')';
        let h = hex.substring(1);
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function _maybeUnsplit(el) {
        // لو لا نص ولا خلفية تحتاج تقسيم — أعد النص الأصلي
        const textStyle = el.getAttribute('data-cinema-text');
        const bgStyle = el.getAttribute('data-cinema-bg');

        const textNeedsSplit = SPLIT_STYLES.indexOf(textStyle) !== -1;
        const bgNeedsSplit = SPLIT_STYLES.indexOf(bgStyle) !== -1;

        if (textNeedsSplit || bgNeedsSplit) return; // لا تزل

        // أرجع النص الأصلي
        if (el.dataset.originalText !== undefined) {
            const original = el.dataset.originalText;
            el.innerHTML = '';
            el.textContent = original;
            delete el.dataset.originalText;
        }
    }

    /* ══════════════════════════════════════════════ */
    /* applyCinemaStyle — النمط السينمائي             */
    /* ══════════════════════════════════════════════ */
    /**
     * @param {HTMLElement} el
     * @param {string} styleId — اسم النمط أو '' للإزالة
     * @param {string} target — 'text' أو 'bg'
     */
    function applyCinemaStyle(el, styleId, target) {
        if (!el) return;
        target = target || 'text';

        const attrName = (target === 'text') ? 'data-cinema-text' : 'data-cinema-bg';
        const splitClass = (target === 'text') ? 'cinema-split' : 'cinema-split-bg';

        // 1. احذف النمط الحالي
        el.removeAttribute(attrName);
        el.classList.remove(splitClass);

        // 2. احذف الأنماط المتعارضة من النظام القديم
        if (target === 'text') {
            el.classList.remove('has-gradient');
            el.style.removeProperty('--name-gradient');
        } else {
            el.classList.remove('has-bg', 'has-bg-gradient');
            el.style.removeProperty('--name-bg');
            el.style.removeProperty('--name-bg-glow');
        }

        // 3. لو styleId فارغ — نظّف وأعد
        if (!styleId) {
            _maybeUnsplit(el);
            return;
        }

        // 4. تحقق من صحة styleId
        if (CINEMA_TEXT_STYLES.indexOf(styleId) === -1) {
            console.warn('Unknown cinema style:', styleId);
            return;
        }

        // 5. طبّق النمط
        el.setAttribute(attrName, styleId);

        // 6. لو يحتاج تقسيم — قسّم
        const needsSplit = SPLIT_STYLES.indexOf(styleId) !== -1;
        if (needsSplit) {
            // لو ما كان مقسّماً — قسّم
            if (!_isSplit(el)) {
                _splitToChars(el, styleId, target);
            } else {
                // مقسّم مسبقاً — طبّق الألوان فقط
                _applyColorsToExistingChars(el, styleId, target);
            }
            el.classList.add(splitClass);
        } else {
            // لا يحتاج تقسيم
            _maybeUnsplit(el);
        }
    }

    function _applyColorsToExistingChars(el, styleId, target) {
        const spans = el.querySelectorAll('.nc');
        spans.forEach(function (span, i) {
            if (styleId === 'sugar') {
                const color = SUGAR_COLORS[i % SUGAR_COLORS.length];
                if (target === 'text') {
                    span.style.setProperty('--sugar-color', color);
                } else {
                    span.style.setProperty('--sugar-bg-color', _hexToRgba(color, 0.4));
                }
            }
        });
    }

    /* ══════════════════════════════════════════════ */
    /* apply — النمط القديم                           */
    /* ══════════════════════════════════════════════ */
    function apply(el, params) {
        if (!el) return;
        params = params || {};

        // لو في نمط سينمائي — لا نلمس
        // (النمطان مستقلان — يمكن الجمع)

        _cleanClasses(el);
        _cleanVars(el);

        el.classList.add('name-styled');

        const nameColor    = params.nameColor    || null;
        const nameGradient = params.nameGradient || null;
        const nameBgColor  = params.nameBgColor  || null;
        const nameBgGrad   = params.nameBgGradient || null;
        const fallbackColor = _getFallbackColor(params);

        const hasBg = (!!nameBgColor && _isValidColor(nameBgColor)) ||
                      (Array.isArray(nameBgGrad) && nameBgGrad.length >= 2);

        const hasGradient = Array.isArray(nameGradient) && nameGradient.length >= 2
                            && _isValidColor(nameGradient[0]) && _isValidColor(nameGradient[1]);

        const hasColor = !!nameColor && _isValidColor(nameColor);

        // ⭐ لو في نمط سينمائي على النص — لا تطبق gradient
        const hasCinemaText = !!el.getAttribute('data-cinema-text');

        // ⭐ لو في نمط سينمائي على الخلفية — لا تطبق bg عادي
        const hasCinemaBg = !!el.getAttribute('data-cinema-bg');

        if (!hasBg && !hasGradient && !hasColor) {
            if (!hasCinemaText) el.style.color = fallbackColor;
            return;
        }

        if (hasBg && !hasGradient && !hasColor) {
            if (!hasCinemaBg) _applyBg(el, nameBgColor, nameBgGrad);
            if (!hasCinemaText) el.style.color = fallbackColor;
            return;
        }

        if (hasColor && !hasGradient) {
            if (hasBg && !hasCinemaBg) _applyBg(el, nameBgColor, nameBgGrad);
            if (!hasCinemaText) {
                el.style.setProperty('--name-color', nameColor);
                el.style.color = nameColor;
            }
            return;
        }

        if (hasGradient && !hasCinemaText) {
            if (hasBg && !hasCinemaBg) _applyBg(el, nameBgColor, nameBgGrad);

            const baseColor = hasColor ? nameColor : fallbackColor;
            el.style.setProperty('--name-color', baseColor);
            el.style.color = baseColor;

            el.classList.add('has-gradient');

            if (!params.skipDataText) {
                const currentText = el.dataset.name || el.textContent || '';
                el.setAttribute('data-text', currentText);
            }

            const gradStr = _buildGradient(nameGradient, _gradientHash(nameGradient));
            if (gradStr) {
                el.style.setProperty('--name-gradient', gradStr);
            }
            return;
        }
    }

    function _applyBg(el, bgColor, bgGrad) {
        const bgValue = _buildNameBg(bgColor, bgGrad);
        if (!bgValue) return;

        el.classList.add('has-bg');

        if (Array.isArray(bgGrad) && bgGrad.length >= 2) {
            el.classList.add('has-bg-gradient');
        }

        el.style.setProperty('--name-bg', bgValue);

        const glowColor = _extractBgGlowColor(bgColor, bgGrad);
        if (glowColor !== 'transparent') {
            el.style.setProperty('--name-bg-glow', glowColor);
        }
    }

    function _cleanClasses(el) {
        el.classList.remove(
            'has-bg',
            'has-bg-gradient',
            'has-gradient',
            'name-color-only',
            'name-gradient-only'
        );
        if (!el.classList.contains('name-styled')) {
            el.classList.add('name-styled');
        }
    }

    function _cleanVars(el) {
        el.style.removeProperty('--name-color');
        el.style.removeProperty('--name-bg');
        el.style.removeProperty('--name-bg-glow');
        el.style.removeProperty('--name-gradient');
        el.style.removeProperty('--name-gradient-opacity');
        // لا نمسح data-cinema-* هنا (النمط السينمائي مسؤول)
        if (!el.getAttribute('data-cinema-text') && !el.getAttribute('data-cinema-bg')) {
            el.style.color = '';
        }
    }

    function clear(el) {
        if (!el) return;
        _cleanClasses(el);
        _cleanVars(el);
        el.removeAttribute('data-cinema-text');
        el.removeAttribute('data-cinema-bg');
        el.classList.remove('cinema-split', 'cinema-split-bg');
        _maybeUnsplit(el);
    }

    /* ══════════════════════════════════════════════ */
    /* الإطار الافتراضي للأفاتار                      */
    /* ══════════════════════════════════════════════ */
    function applyDefaultAvatarFrame(box, rank, level) {
        if (!box) return;
        box.classList.remove(
            'default-frame-gold',
            'default-frame-pink',
            'default-frame-silver',
            'default-frame-gray'
        );
        if (box.querySelector('.qf')) return;
        const map = (typeof QAMAR !== 'undefined' && QAMAR.DEFAULT_AVATAR_FRAMES)
            ? QAMAR.DEFAULT_AVATAR_FRAMES : null;
        if (!map) return;
        const frameType = map[rank] || 'gray';
        if (frameType && frameType !== 'none') {
            box.classList.add('default-frame-' + frameType);
        }
    }

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
    /* Preview Template                                */
    /* ══════════════════════════════════════════════ */
    function previewTemplate(text, params, extraClass) {
        const el = document.createElement('div');
        el.className = 'name-grid-item' + (extraClass ? ' ' + extraClass : '');
        el.dataset.previewName = text || '';
        const inner = document.createElement('span');
        inner.className = 'name-styled';
        inner.textContent = text || '';
        inner.setAttribute('data-name', text || '');
        inner.setAttribute('data-text', text || '');
        el.appendChild(inner);
        apply(inner, params);
        return el;
    }

    /* ══════════════════════════════════════════════ */
    /* تصدير                                          */
    /* ══════════════════════════════════════════════ */
    window.NameEffects = {
        apply: apply,
        applyCinemaStyle: applyCinemaStyle,
        clear: clear,
        applyDefaultAvatarFrame: applyDefaultAvatarFrame,
        clearDefaultAvatarFrame: clearDefaultAvatarFrame,
        previewTemplate: previewTemplate,
        buildGradient: _buildGradient,
        isValidColor: _isValidColor,
        isValidGradient: _isValidGradient,
        CINEMA_TEXT_STYLES: CINEMA_TEXT_STYLES,
        SUGAR_COLORS: SUGAR_COLORS
    };

    console.log('✅ name-effects.js v6 loaded — 9 cinema styles');
})();
