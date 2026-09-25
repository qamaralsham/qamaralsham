// ==============================================
// guardian-hide-king-fix.js v1
// ==============================================
// ✅ v1:
//   1. الملك/الملكة/95+ لا يُخفى عنهم شيء
//   2. الرسائل المخفية تظهر لهم بشكل مميز
// ==============================================

(function () {
    'use strict';
    if (window.__guardianHideKingFixV1) return;
    window.__guardianHideKingFixV1 = true;

    function getMe() {
        try { if (typeof getCurrentUser === 'function') return getCurrentUser(); } catch (e) {}
        try {
            return JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || 'null');
        } catch (e) { return null; }
    }

    function canSeeHidden() {
        var u = getMe();
        if (!u) return false;
        var lvl = u.rankLevel || (typeof getRankLevel === 'function' ? getRankLevel(u.rank) : 0);
        return u.rank === 'King' || u.rank === 'Queen' || lvl >= 95;
    }

    /* 1. إخفاء أي رسالة مخفية بشكل خاطئ عن الملك */
    function _restoreForKing() {
        if (!canSeeHidden()) return;

        var hiddenEls = document.querySelectorAll('.hidden-by-guardian');
        hiddenEls.forEach(function (el) {
            el.style.display = '';
            el.classList.remove('hidden-by-guardian');
            /* علامة بصرية للملك بأن الرسالة أُخفيت */
            if (!el.querySelector('.king-see-badge')) {
                var badge = document.createElement('div');
                badge.className = 'king-see-badge';
                badge.style.cssText = 'position:absolute;top:4px;left:4px;background:rgba(255,215,0,0.9);color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:8px;z-index:10;';
                badge.textContent = '👑 لك فقط';
                el.style.position = 'relative';
                el.appendChild(badge);
            }
        });
    }

    /* كل 500ms — يمنع guardian-hide من إخفاء الرسائل عن الملك */
    setInterval(_restoreForKing, 500);

    /* 2. Override hideMessageEl */
    var attempts = 0;
    var t = setInterval(function () {
        attempts++;
        /* الوصول لـ hideMessageEl داخلي صعب — لكن نستخدم WeakSet-like */
        /* بدلاً من ذلك، نراقب DOM ونعيد الإظهار */
        if (canSeeHidden()) {
            var hidden = document.querySelectorAll('.hidden-by-guardian');
            if (hidden.length > 0) _restoreForKing();
        }
        if (attempts >= 60) clearInterval(t);
    }, 250);

    /* 3. MutationObserver — إذا أُخفيت رسالة جديدة، يُعاد فوراً للملك */
    document.addEventListener('DOMContentLoaded', function () {
        var messages = document.getElementById('messages');
        if (!messages) {
            setTimeout(arguments.callee, 1000);
            return;
        }

        new MutationObserver(function (muts) {
            if (!canSeeHidden()) return;
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1 && node.classList.contains('hidden-by-guardian')) {
                        setTimeout(_restoreForKing, 50);
                    }
                });
            });
            /* أيضاً نراقب أي تغيير في display */
            if (messages.querySelectorAll('.hidden-by-guardian').length > 0) {
                setTimeout(_restoreForKing, 30);
            }
        }).observe(messages, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });

    console.log('✅ guardian-hide-king-fix.js v1 loaded — الملك يرى كل شيء');
})();
