// ==============================================
// name-effects.js v4 — gradient متكرر + خلفية متحركة
// ==============================================
// ✅ v4:
//   1. gradient متكرر (الحركة تظهر موجة)
//   2. خلفية التدرج تتحرك (has-bg-gradient)
//   3. دعم كامل للوضع الشفاف
// ==============================================

(function () {
    'use strict';
    if (window.__nameEffectsV4) return;
    window.__nameEffectsV4 = true;

    function _isValidColor(c) {
        if (!c || typeof c !== 'string') return false;
        return /^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/.test(c.trim());
    }

    function _isValidGradient(g) {
        if (!Array.isArray(g) || g.length < 2) return false;
        return _isValidColor(g[0]) && _isValidColor(g[1]);
    }

    // ⭐ v4: تدرج متكرر — الحركة تظهر موجة واضحة
    function _buildGradient(colors) {
        if (!_isValidGradient(colors)) return '';
        if (colors.length === 2) {
            return 'repeating-linear-gradient(90deg, ' +
                colors[0] + ' 0%, ' +
                colors[1] + ' 50%, ' +
                colors[0] + ' 100%)';
        }
        const stops = colors.map(function (c, i) {
            const pct = (i / (colors.length - 1)) * 100;
            return c + ' ' + pct.toFixed(1) + '%';
        });
        return 'linear-gradient(90deg, ' + stops.join(', ') + ')';
    }

    function _buildNameBg(bgColor, bgGradient) {
        if (Array.isArray(bgGradient) && bgGradient.length >= 2) {
            return _buildGradient(bgGradient);
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

    function apply(el, params) {
        if (!el) return;
        params = params || {};

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

        if (!hasBg && !hasGradient && !hasColor) {
            el.style.color = fallbackColor;
            return;
        }

        if (hasBg && !hasGradient && !hasColor) {
            _applyBg(el, nameBgColor, nameBgGrad);
            el.style.color = fallbackColor;
            return;
        }

        if (hasColor && !hasGradient) {
            if (hasBg) _applyBg(el, nameBgColor, nameBgGrad);
            el.style.setProperty('--name-color', nameColor);
            el.style.color = nameColor;
            return;
        }

        if (hasGradient) {
            if (hasBg) _applyBg(el, nameBgColor, nameBgGrad);

            const baseColor = hasColor ? nameColor : fallbackColor;
            el.style.setProperty('--name-color', baseColor);
            el.style.color = baseColor;

            el.classList.add('has-gradient');

            if (!params.skipDataText) {
                const currentText = el.dataset.name || el.textContent || '';
                el.setAttribute('data-text', currentText);
            } else {
                el.setAttribute('data-text', '');
            }

            const gradStr = _buildGradient(nameGradient);
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
            'name-styled',
            'has-bg',
            'has-bg-gradient',
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

    function clear(el) {
        if (!el) return;
        _cleanClasses(el);
        _cleanVars(el);
    }

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

    function previewTemplate(text, params, extraClass) {
        const el = document.createElement('div');
        el.className = 'name-grid-item' + (extraClass ? ' ' + extraClass : '');
        el.dataset.previewName = text || '';
        const inner = document.createElement('span');
        inner.className = 'name-styled';
        inner.textContent = text || '';
        inner.setAttribute('data-text', text || '');
        el.appendChild(inner);
        apply(inner, params);
        return el;
    }

    window.NameEffects = {
        apply: apply,
        clear: clear,
        applyDefaultAvatarFrame: applyDefaultAvatarFrame,
        clearDefaultAvatarFrame: clearDefaultAvatarFrame,
        previewTemplate: previewTemplate,
        buildGradient: _buildGradient,
        isValidColor: _isValidColor,
        isValidGradient: _isValidGradient
    };

    console.log('✅ name-effects.js v4 loaded — repeating gradient + animated bg');
})();
