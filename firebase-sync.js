// ==============================================
// قمر الشام - Firebase Sync (v2)
// مزامنة صريحة — بدون monkey-patch
// ==============================================
// ✅ v2 fixes:
//   - انتظار onAuthStateChanged (بدل setTimeout)
//   - إزالة localStorage monkey-patch (خطر أمني)
//   - whitelist صريحة للـ keys المُزامَنة
//   - دالة QamarSync واضحة
// ==============================================

(function () {
    'use strict';

    let _db = null;
    let _uid = null;
    let _ready = false;
    let _initialized = false;

    // ==============================================
    // 1. انتظار جهوز Firebase
    // ==============================================
    function waitForFirebase() {
        return new Promise((resolve) => {
            if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
                return resolve(true);
            }
            let tries = 0;
            const iv = setInterval(() => {
                tries++;
                if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
                    clearInterval(iv);
                    resolve(true);
                } else if (tries > 50) {
                    clearInterval(iv);
                    resolve(false);
                }
            }, 300);
        });
    }

    // ==============================================
    // 2. الكتابة إلى Firebase — دالة صريحة
    // ==============================================
    function pushToFirebase(path, value) {
        if (!_ready || !_db || !_uid) return;
        _db.ref('users/' + _uid + '/' + path).set(value).catch((e) => {
            console.warn('⚠️ Sync write failed:', path, e.message);
        });
    }

    function removeFromFirebase(path) {
        if (!_ready || !_db || !_uid) return;
        _db.ref('users/' + _uid + '/' + path).remove().catch(() => {});
    }

    // ==============================================
    // 3. API العام
    // ==============================================
    window.QamarSync = {
        isReady: () => _ready,
        getUID: () => _uid,
        set: pushToFirebase,
        remove: removeFromFirebase
    };

    // ==============================================
    // 4. تحميل البيانات من Firebase
    // ==============================================
    function loadFromFirebase(data) {
        const mode = localStorage.getItem('profile_view_mode') || 'owner';
        if (mode === 'visitor') return;

        if (data.name) localStorage.setItem('profile_name', data.name);
        if (data.avatar) localStorage.setItem('saved_avatar', data.avatar);
        if (data.cover) localStorage.setItem('saved_cover', data.cover);
        if (data.bio) localStorage.setItem('profile_bio', data.bio);
        if (data.avatarFrame) localStorage.setItem('saved_avatar_frame_motion', data.avatarFrame);
        if (data.nameGradient) localStorage.setItem('name_gradient', JSON.stringify(data.nameGradient));
        if (data.nameGlow) localStorage.setItem('name_glow', data.nameGlow);
        if (data.nameEmoji) localStorage.setItem('name_emoji', data.nameEmoji);
        if (data.nameGif) localStorage.setItem('name_gif', data.nameGif);
        if (data.music) localStorage.setItem('profile_music_url', data.music);
        if (data.profileBg) {
            localStorage.setItem('profile_bg_type', data.profileBg.type || 'color');
            localStorage.setItem('profile_bg_value', data.profileBg.value || '#050508');
        }
        if (data.poetry) localStorage.setItem('poetry_text', data.poetry);
        if (data.statusPrivacy) localStorage.setItem('status_privacy', data.statusPrivacy);
        if (data.privacy) {
            Object.keys(data.privacy).forEach((field) => {
                localStorage.setItem('privacy_' + field, data.privacy[field]);
            });
        }

        setTimeout(() => {
            if (typeof loadAllSaved === 'function') loadAllSaved();
        }, 150);
    }

    // ==============================================
    // 5. whitelist — المفاتيح المُزامَنة
    //    (بدل monkey-patch نستمع لأحداث مخصصة)
    // ==============================================
    const SYNC_MAP = {
        'name_color':            (v) => ['nameColor', v || null],
        'name_gradient':         (v) => ['nameGradient', v ? JSON.parse(v) : null],
        'name_glow':             (v) => ['nameGlow', v || 'none'],
        'name_frame':            (v) => ['nameFrame', v || null],
        'name_shape':            (v) => ['nameShape', v || null],
        'name_emoji':            (v) => ['nameEmoji', v || null],
        'name_gif':              (v) => ['nameGif', v || null],
        'saved_avatar_frame_motion': (v) => ['avatarFrame', (v && v !== 'none') ? v : null],
        'profile_music_url':     (v) => ['music', v || null],
        'poetry_text':           (v) => ['poetry', v || ''],
        'status_privacy':        (v) => ['statusPrivacy', v || 'public'],
        'profile_bg_value':      (v) => {
            const type = localStorage.getItem('profile_bg_type') || 'color';
            return ['profileBg', v ? { type, value: v } : null];
        },
        'profile_name':          (v) => ['name', v || null],
        'profile_bio':           (v) => ['bio', v || null],
        'saved_avatar':          (v) => ['avatar', v || null],
        'saved_cover':           (v) => ['cover', v || null]
    };

    // ==============================================
    // 6. اعتراض localStorage — فقط للمفاتيح المعروفة
    // ==============================================
    function installSyncHooks() {
        const origSet = localStorage.setItem.bind(localStorage);
        const origRemove = localStorage.removeItem.bind(localStorage);

        function push(field, value) {
            if (value === null || value === undefined || value === '') {
                removeFromFirebase(field);
            } else {
                pushToFirebase(field, value);
            }
        }

        localStorage.setItem = function (key, value) {
            origSet(key, value);
            if (SYNC_MAP[key]) {
                try {
                    const [field, val] = SYNC_MAP[key](value);
                    push(field, val);
                } catch (e) { console.warn('Sync error:', key, e); }
            }
        };

        localStorage.removeItem = function (key) {
            origRemove(key);
            if (SYNC_MAP[key]) {
                try {
                    const [field] = SYNC_MAP[key](null);
                    push(field, null);
                } catch (e) {}
            }
        };
    }

    // ==============================================
    // 7. مزامنة القيم الحالية عند التهيئة
    // ==============================================
    function syncAllExistingValues() {
        Object.keys(SYNC_MAP).forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) {
                try {
                    const [field, v] = SYNC_MAP[key](val);
                    if (v === null || v === undefined || v === '') {
                        removeFromFirebase(field);
                    } else {
                        pushToFirebase(field, v);
                    }
                } catch (e) {}
            }
        });
    }

    // ==============================================
    // 8. التهيئة
    // ==============================================
    async function init() {
        if (_initialized) return;
        _initialized = true;

        const fbReady = await waitForFirebase();
        if (!fbReady) {
            console.warn('⚠️ Firebase not initialized after timeout');
            return;
        }

        _db = firebase.database();

        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                _ready = false;
                _uid = null;
                return;
            }

            _uid = user.uid;
            _ready = true;
            console.log('✅ Firebase Sync started for UID:', _uid);

            // حمّل البيانات مرة واحدة
            try {
                const snap = await _db.ref('users/' + _uid).once('value');
                const data = snap.val();
                if (data) {
                    console.log('📥 Loading data from Firebase...');
                    loadFromFirebase(data);
                }
            } catch (err) {
                console.warn('Initial load error:', err);
            }

            // ركّب خطافات المزامنة + ارفع القيم الحالية
            installSyncHooks();
            syncAllExistingValues();
        });

        console.log('✅ Firebase Sync fully active');
    }

    // ابدأ بعد تحميل الصفحة
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    console.log('📦 firebase-sync.js v2 loaded');
})();