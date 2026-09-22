// ==============================================
// user-data-optimizer.js v1
// ==============================================
// ✅ الهدف:
//   1. يقلل جلب users/$uid من 5-20MB إلى ~2KB
//   2. يستمع فقط للحقول التي تحتاجها UI
//   3. يستبعد: musicURL, profileBgValue, cover, poetryBg, poetryAttachment
//   4. لا يلمس chat.js — override نظيف
// ==============================================

(function () {
    'use strict';
    if (window.__userDataOptimizerV1) return;
    window.__userDataOptimizerV1 = true;

    /* ══════════════════════════════════════════════ */
    /* الحقول التي نحتاجها فقط لتحديث UI              */
    /* كل ما ليس هنا → لا يُجلب → أداء أفضل بكثير     */
    /* ══════════════════════════════════════════════ */
    const UI_FIELDS = [
        'name',
        'avatar',
        'avatarFrame',
        'nameColor',
        'nameGradient',
        'nameBgColor',
        'nameBgGradient',
        'cinemaTextStyle',
        'cinemaBgStyle',
        'profileGlow',
        'isBanned',
        'bannedUntil',
        'isJailed',
        'jailUntil'
    ];

    let _fieldState = {};
    let _debounceTimer = null;
    let _myListeners = [];
    let _active = false;

    function _handleFieldChange(field, value) {
        _fieldState[field] = value;
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(_flush, 150);
    }

    function _flush() {
        const u = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!u || !u.uid) return;

        try {
            // 1. حدّث session
            const raw = localStorage.getItem(QAMAR.STORAGE_KEYS.CURRENT_USER)
                     || localStorage.getItem(QAMAR.STORAGE_KEYS.USER);
            const c = raw ? JSON.parse(raw) : {};
            const up = Object.assign({}, c, _fieldState);
            if (typeof saveSession === 'function') {
                saveSession(up, up.isGuest === true);
            }

            // 2. حدّث UI (نفس دوال chat.js الأصلية)
            if (typeof window.refreshAvatarsInMessages === 'function') {
                window.refreshAvatarsInMessages(_fieldState.avatarFrame);
            }
            if (typeof window.refreshNameStylesInMessages === 'function') {
                window.refreshNameStylesInMessages(_fieldState);
            }
        } catch (e) {
            console.warn('user-data-optimizer flush failed:', e);
        }
    }

    function _stopOriginalListener() {
        // إيقاف listener الأصلي من chat.js (لو مشغّل)
        try {
            if (window.ChatState && ChatState.listeners && ChatState.listeners.userDataRef) {
                ChatState.listeners.userDataRef.off();
                delete ChatState.listeners.userDataRef;
            }
        } catch (e) {}
    }

    function _stopMyListeners() {
        _myListeners.forEach(function (ref) {
            try { ref.off(); } catch (e) {}
        });
        _myListeners = [];
        _active = false;
    }

    function _startFieldListeners() {
        const u = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!u || !u.uid) {
            console.warn('⚠️ user-data-optimizer: no user yet');
            return false;
        }
        if (typeof db === 'undefined' || !db) {
            console.warn('⚠️ user-data-optimizer: db not ready');
            return false;
        }

        // 1. أوقف الأصلي (يمنع جلب 5-20MB)
        _stopOriginalListener();

        // 2. نظّف listeners قديمة لو موجودة
        _stopMyListeners();

        // 3. ابدأ listeners على 14 حقل فقط
        const basePath = 'users/' + u.uid + '/';

        UI_FIELDS.forEach(function (field) {
            const ref = db.ref(basePath + field);
            ref.on('value', function (s) {
                _handleFieldChange(field, s.val());
            }, function (err) {
                // تجاهل أخطاء الصلاحيات بصمت
                console.warn('optimizer listener ' + field + ':', err.message);
            });
            _myListeners.push(ref);

            // سجّل في ChatState.listeners للتنظيف العام
            if (window.ChatState && ChatState.listeners) {
                ChatState.listeners['opt_' + field] = ref;
            }
        });

        _active = true;
        console.log('✅ user-data-optimizer: ' + UI_FIELDS.length + ' field listeners active');
        console.log('📊 يستبعد: musicURL, profileBgValue, cover, poetryBg, poetryAttachment');
        return true;
    }

    /* ══════════════════════════════════════════════ */
    /* Override نظيف لـ startUserDataListener         */
    /* ══════════════════════════════════════════════ */
    const _origStart = window.startUserDataListener;

    window.startUserDataListener = function () {
        // جرّب المحسّن أولاً
        if (_startFieldListeners()) {
            return;
        }
        // Fallback: شغّل الأصلي فقط إذا فشلنا
        console.warn('⚠️ optimizer: falling back to original (user/db not ready)');
        if (typeof _origStart === 'function') {
            try { _origStart(); } catch (e) {
                console.error('Original startUserDataListener failed:', e);
            }
        } else {
            // أعِد المحاولة بعد لحظة
            setTimeout(function () {
                if (_startFieldListeners()) return;
                if (typeof _origStart === 'function') {
                    try { _origStart(); } catch (e) {}
                }
            }, 500);
        }
    };

    /* ══════════════════════════════════════════════ */
    /* تنظيف عند cleanupAllListeners                 */
    /* ══════════════════════════════════════════════ */
    const _origCleanup = window.cleanupAllListeners;
    window.cleanupAllListeners = function () {
        _stopMyListeners();
        _fieldState = {};
        if (typeof _origCleanup === 'function') {
            try { _origCleanup(); } catch (e) {}
        }
    };

    /* ══════════════════════════════════════════════ */
    /* Init                                           */
    /* ══════════════════════════════════════════════ */
    function init() {
        var attempts = 0;
        var t = setInterval(function () {
            attempts++;
            if (typeof getCurrentUser === 'function' &&
                getCurrentUser() &&
                typeof db !== 'undefined' && db) {
                clearInterval(t);
                console.log('✅ user-data-optimizer.js ready');
            }
            if (attempts >= 40) clearInterval(t);
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('📦 user-data-optimizer.js v1 loaded — 5-20MB → 2KB for King');
})();
