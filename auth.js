// ==============================================
// قمر الشام - نظام الدخول والمصادقة (v8.7)
// Qamar Al Sham - Auth v8.7
// ==============================================
// ✅ v8.7 (فوق v8.6):
//   1. login: حفظ placeholder في currentUser مباشرة بعد signIn
//      → يمنع startAuthListener من إعادة جلب users/$uid
//   2. _loginTempUid/_loginTempAt: بوابة أمان إضافية
//   3. registerGuest: placeholder لمنع جلب غير ضروري
//   4. النتيجة: الملك يُجلب مرة واحدة بدل مرتين (5MB → 10MB وفّرنا 50%)
// ==============================================
// ✅ v8.6 (محفوظ):
//   1. registerGuest: reserveName + ensureUniqueCode بالتوازي
//   2. registerMember: نفس التحسين
//   3. login: users/$uid + config/king_uid بالتوازي
//   4. cleanup ذكي عند الفشل (بدون تسريب)
// ==============================================
// ✅ v8.5 (محفوظ):
//   1. saveSession: يستبعد base64 الكبيرة (music/cover/video/attachment)
//   2. saveSession: fallback تلقائي لنسخة مبسطة عند QuotaExceeded
// ==============================================
// ✅ v8.4 (محفوظ):
//   1. رسائل خطأ دقيقة (permission vs taken)
//   2. buildNewUserData — builder موحّد
//   3. identityUpdatedAt عند الإنشاء
//   4. QAMAR.DEFAULT_BIO + حقول جديدة
//   5. privacy defaults
//   6. logout يمسح كل مفاتيح الهوية
//   7. استخدام QAMAR.STORAGE_KEYS
//   8. waitForAuth أطول قليلاً
// ==============================================

let currentUser = null;
let isUserGuest = false;
let _authReady = false;
let _authUnsubscribe = null;

/* ⭐ v8.7: بوابة لمنع double-fetch */
let _loginTempUid = null;
let _loginTempAt = 0;

/* ══════════════════════════════════════════════ */
/* انتظار Firebase                                */
/* ══════════════════════════════════════════════ */
async function waitForAuth(timeoutMs = 8000) {
    if (typeof auth !== 'undefined' && auth) return true;
    const attempts = Math.floor(timeoutMs / 200);
    for (let i = 0; i < attempts; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (typeof auth !== 'undefined' && auth) return true;
    }
    return false;
}

/* ══════════════════════════════════════════════ */
/* بناء كود المستخدم                              */
/* ══════════════════════════════════════════════ */
function buildUserCode(name, uid) {
    if (typeof generateUserCode === 'function') {
        return generateUserCode(name, uid);
    }
    // fallback بسيط
    let prefix = 'U' + Math.floor(Math.random() * 9 + 1);
    const clean = (name || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length >= 2) prefix = clean.substring(0, 2);
    else if (clean.length === 1) prefix = clean + 'X';
    let hash = 5381;
    const source = String(uid || (Math.random().toString(36) + Date.now()));
    for (let i = 0; i < source.length; i++) {
        hash = ((hash * 33) ^ source.charCodeAt(i)) >>> 0;
    }
    const h = hash.toString(36).toUpperCase().padStart(3, '0').slice(-3);
    return prefix + '·' + h;
}

/* ══════════════════════════════════════════════ */
/* ⭐ Reserve دوال — ترجع {ok, reason}             */
/* ══════════════════════════════════════════════ */
/* reason values:
 *   'ok'         — نجح
 *   'taken'      — الاسم محجوز (transaction aborted)
 *   'permission' — فشل Firebase Rules
 *   'network'    — مشكلة شبكة
 * ══════════════════════════════════════════════ */

async function reserveUserCode(code, uid) {
    try {
        const result = await db.ref('user_codes/' + code).transaction(current => {
            if (current === null) return uid;
            if (current === uid) return uid;
            return undefined; // abort
        });
        if (result.committed === true) return { ok: true, reason: 'ok' };
        return { ok: false, reason: 'taken' };
    } catch (e) {
        console.warn('Reserve code error:', e);
        if (e && e.code === 'PERMISSION_DENIED') return { ok: false, reason: 'permission' };
        return { ok: false, reason: 'network' };
    }
}

async function reserveName(name, uid) {
    try {
        const result = await db.ref('user_names/' + name).transaction(current => {
            if (current === null) return uid;
            if (current === uid) return uid;
            return undefined;
        });
        if (result.committed === true) return { ok: true, reason: 'ok' };
        return { ok: false, reason: 'taken' };
    } catch (e) {
        console.warn('Reserve name error:', e);
        if (e && e.code === 'PERMISSION_DENIED') return { ok: false, reason: 'permission' };
        return { ok: false, reason: 'network' };
    }
}

/**
 * ⭐ v8.4: يبحث عن كود فريد.
 * @returns {{code: string|null, error: string|null}}
 */
async function ensureUniqueCode(name, uid) {
    let userCode = buildUserCode(name, uid);
    let res = await reserveUserCode(userCode, uid);

    if (res.ok) return { code: userCode, error: null };
    if (res.reason === 'permission' || res.reason === 'network') {
        return { code: null, error: res.reason };
    }

    // الاسم مشغول → جرّب مع لاحقات
    for (let attempt = 0; attempt < 5; attempt++) {
        const suffix = Math.floor(Math.random() * 9999);
        userCode = buildUserCode(name + suffix, uid);
        res = await reserveUserCode(userCode, uid);
        if (res.ok) return { code: userCode, error: null };
        if (res.reason === 'permission' || res.reason === 'network') {
            return { code: null, error: res.reason };
        }
    }
    return { code: null, error: 'taken' };
}

/* ══════════════════════════════════════════════ */
/* ⭐ v8.6: cleanup موحّد عند الفشل                 */
/* ══════════════════════════════════════════════ */
async function _cleanupReservations(name, code) {
    const promises = [];
    if (name) promises.push(db.ref('user_names/' + name).remove().catch(function () {}));
    if (code) promises.push(db.ref('user_codes/' + code).remove().catch(function () {}));
    if (promises.length > 0) {
        try { await Promise.all(promises); } catch (e) {}
    }
}

/* ══════════════════════════════════════════════ */
/* ⭐ v8.4: builder موحّد لحقول المستخدم الجديد    */
/* ══════════════════════════════════════════════ */
function buildNewUserData(opts) {
    const {
        uid,
        name,
        code,
        age,
        gender,
        email,
        isGuest,
        now
    } = opts;

    const rank = 'User';
    const avatarBg = isGuest ? '555' : 'random';

    return {
        // ── أساسي ──
        uid: uid,
        name: name,
        code: code,
        age: age,
        gender: gender,
        email: email || null,

        // ── الرتبة ──
        rank: rank,
        rankLevel: QAMAR.getRankLevel(rank),
        queenOrder: null,
        isGuest: !!isGuest,

        // ── الهوية المرئية ──
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=' + avatarBg + '&color=fff',
        cover: null,
        bio: (typeof QAMAR !== 'undefined' && QAMAR.DEFAULT_BIO) ? QAMAR.DEFAULT_BIO : '❋ نجوم الشام ❋',
        color: isGuest ? '#95a5a6' : '#ffffff',
        nameColor: null,
        nameGradient: null,
        nameBgColor: null,
        nameBgGradient: null,
        avatarFrame: null,

        // ── البروفايل ──
        profileGlow: null,
        profileBgType: null,
        profileBgValue: null,
        musicURL: null,
        poetry: '',
        poetryBg: null,
        poetryAttachment: null,

        // ── الخصوصية ──
        country: '',
        family: '',
        privacy: {
            email: 'public',
            age: 'public',
            gender: 'public',
            messages: 'public',
            friends: 'public'
        },

        // ── التواقيت ──
        createdAt: now,
        lastSeen: now,
        identityUpdatedAt: now
    };
}

/* ══════════════════════════════════════════════ */
/* Register Guest — ⭐ v8.7 مع placeholder         */
/* ══════════════════════════════════════════════ */
async function registerGuest(name, age, gender) {
    if (!name || name.trim().length < 2)
        return { success: false, error: 'الرجاء إدخال اسم صحيح (حرفين على الأقل)' };
    if (!age || parseInt(age) < 13 || parseInt(age) > 120)
        return { success: false, error: 'الرجاء إدخال عمر صحيح (13 - 120)' };
    if (!gender || !['male', 'female'].includes(gender))
        return { success: false, error: 'الرجاء اختيار الجنس' };

    const trimmedName = name.trim();

    try {
        const ok = await waitForAuth(8000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const credential = await auth.signInAnonymously();
        const uid = credential.user.uid;
        const now = Date.now();

        // ⭐ v8.7: placeholder لمنع startAuthListener من الجلب
        _loginTempUid = uid;
        _loginTempAt = Date.now();
        currentUser = {
            uid: uid,
            name: trimmedName,
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            isGuest: true
        };

        // ⭐ v8.6: reserveName + ensureUniqueCode بالتوازي
        const [nameRes, codeRes] = await Promise.all([
            reserveName(trimmedName, uid),
            ensureUniqueCode(trimmedName, uid)
        ]);

        // فحص الاسم
        if (!nameRes.ok) {
            try { await auth.signOut(); } catch (e) {}
            currentUser = null;
            if (codeRes.code) await _cleanupReservations(null, codeRes.code);
            if (nameRes.reason === 'taken') {
                return { success: false, error: 'الاسم محجوز — اختر اسمًا آخر' };
            }
            return { success: false, error: 'فشل الاتصال — حاول مرة ثانية' };
        }

        // فحص الكود
        if (codeRes.error) {
            try { await auth.signOut(); } catch (e) {}
            currentUser = null;
            await _cleanupReservations(trimmedName, null);
            if (codeRes.error === 'taken') {
                return { success: false, error: 'تعذّر إنشاء كود فريد — حاول مرة ثانية' };
            }
            return { success: false, error: 'فشل الاتصال — حاول مرة ثانية' };
        }

        const userData = buildNewUserData({
            uid: uid,
            name: trimmedName,
            code: codeRes.code,
            age: parseInt(age),
            gender: gender,
            email: null,
            isGuest: true,
            now: now
        });

        await Promise.all([
            db.ref('users/' + uid).set(userData),
            db.ref('user_presence/' + uid).set({ state: 'online', lastChanged: now })
        ]);

        currentUser = userData;
        isUserGuest = true;
        saveSession(currentUser, true);

        console.log('✅ Guest registered:', trimmedName, '→', uid, '| Code:', codeRes.code);
        return { success: true, user: currentUser };

    } catch (e) {
        console.error('❌ registerGuest error:', e);
        currentUser = null;
        if (e.code === 'PERMISSION_DENIED' || (e.message && e.message.includes('permission')))
            return { success: false, error: 'فشل الاتصال، حاول مرة ثانية' };
        return { success: false, error: 'حدث خطأ: ' + (e.message || '') };
    }
}

/* ══════════════════════════════════════════════ */
/* Register Member — ⭐ v8.6 مع parallel          */
/* ══════════════════════════════════════════════ */
async function registerMember(name, age, gender, email, password) {
    if (!name || name.trim().length < 2)
        return { success: false, error: 'الرجاء إدخال اسم صحيح' };
    if (!age || parseInt(age) < 13 || parseInt(age) > 120)
        return { success: false, error: 'الرجاء إدخال عمر صحيح' };
    if (!email || !email.includes('@'))
        return { success: false, error: 'الرجاء إدخال إيميل صحيح' };
    if (!password || password.length < 6)
        return { success: false, error: 'كلمة السر لازم 6 أحرف على الأقل' };

    const trimmedName = name.trim();

    try {
        const ok = await waitForAuth(8000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        // ⭐ v8.7: placeholder
        _loginTempUid = firebaseUser.uid;
        _loginTempAt = Date.now();
        currentUser = {
            uid: firebaseUser.uid,
            email: email,
            name: trimmedName,
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            isGuest: false
        };

        // ⭐ v8.6: parallel
        const [nameRes, codeRes] = await Promise.all([
            reserveName(trimmedName, firebaseUser.uid),
            ensureUniqueCode(trimmedName, firebaseUser.uid)
        ]);

        if (!nameRes.ok) {
            try { await firebaseUser.delete(); } catch (e) {}
            currentUser = null;
            if (codeRes.code) await _cleanupReservations(null, codeRes.code);
            if (nameRes.reason === 'taken') {
                return { success: false, error: 'الاسم محجوز — اختر اسمًا آخر' };
            }
            return { success: false, error: 'فشل الاتصال — حاول مرة ثانية' };
        }

        if (codeRes.error) {
            try { await firebaseUser.delete(); } catch (e) {}
            currentUser = null;
            await _cleanupReservations(trimmedName, null);
            if (codeRes.error === 'taken') {
                return { success: false, error: 'تعذّر إنشاء كود فريد — حاول مرة ثانية' };
            }
            return { success: false, error: 'فشل الاتصال — حاول مرة ثانية' };
        }

        const userData = buildNewUserData({
            uid: firebaseUser.uid,
            name: trimmedName,
            code: codeRes.code,
            age: parseInt(age),
            gender: gender,
            email: email,
            isGuest: false,
            now: now
        });

        await Promise.all([
            db.ref('users/' + firebaseUser.uid).set(userData),
            db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
        ]);

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member registered:', trimmedName, '| Code:', codeRes.code);
        return { success: true, user: currentUser };

    } catch (error) {
        console.error('❌ Register error:', error);
        currentUser = null;
        let errorMsg = 'فشل التسجيل';
        if (error.code === 'auth/email-already-in-use') errorMsg = 'الإيميل مستخدم بالفعل';
        else if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
        else if (error.code === 'auth/weak-password') errorMsg = 'كلمة السر ضعيفة';
        else if (error.code === 'PERMISSION_DENIED') errorMsg = 'فشل الاتصال، حاول مرة ثانية';
        return { success: false, error: errorMsg };
    }
}

/* ══════════════════════════════════════════════ */
/* Login — ⭐ v8.7: placeholder يمنع double-fetch  */
/* ══════════════════════════════════════════════ */
async function login(email, password) {
    if (!email || !password) return { success: false, error: 'الرجاء إدخال الإيميل وكلمة السر' };

    try {
        const ok = await waitForAuth(8000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        // ⭐⭐⭐ v8.7: الحل الأساسي لمشكلة الملك
        // نحفظ placeholder في currentUser مباشرة بعد signIn
        // → startAuthListener يشوف نفس uid → يتخطى الجلب
        // النتيجة: الملك يُجلب مرة واحدة بدل مرتين
        _loginTempUid = firebaseUser.uid;
        _loginTempAt = Date.now();
        currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: email.split('@')[0],
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            queenOrder: null,
            isGuest: false
        };

        // بيانات افتراضية (لو ما لقينا سجل في users)
        let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: email.split('@')[0],
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            queenOrder: null,
            isGuest: false,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0]) + '&background=random&color=fff',
            bio: (typeof QAMAR !== 'undefined' && QAMAR.DEFAULT_BIO) ? QAMAR.DEFAULT_BIO : '❋ نجوم الشام ❋',
            color: '#ffffff',
            lastSeen: now,
            createdAt: now,
            identityUpdatedAt: now
        };

        if (typeof db !== 'undefined' && db) {
            // ⭐ v8.6: users + config/king_uid بالتوازي
            const [snapshot, kingSnap] = await Promise.all([
                db.ref('users/' + firebaseUser.uid).once('value'),
                db.ref('config/king_uid').once('value').catch(function () { return null; })
            ]);

            const kingUid = kingSnap ? kingSnap.val() : null;

            if (snapshot.exists()) {
                userData = Object.assign({}, userData, snapshot.val());
                userData.rankLevel = QAMAR.getRankLevel(userData.rank);

                // ✅ ضمان queenOrder للملكات
                if (userData.rank === 'Queen' && !userData.queenOrder) {
                    userData.queenOrder = 1;
                    db.ref('users/' + firebaseUser.uid + '/queenOrder').set(1).catch(function () {});
                }

                // ✅ ضمان كود
                if (!userData.code) {
                    const codeRes = await ensureUniqueCode(userData.name, firebaseUser.uid);
                    if (codeRes.code) {
                        userData.code = codeRes.code;
                        db.ref('users/' + firebaseUser.uid + '/code').set(codeRes.code).catch(function () {});
                    }
                }

                // ✅ ضمان الحقول الجديدة (ترحيل ناعم)
                const patch = {};
                if (userData.country === undefined) patch.country = '';
                if (userData.family === undefined) patch.family = '';
                if (userData.identityUpdatedAt === undefined) patch.identityUpdatedAt = userData.createdAt || now;
                if (userData.poetry === undefined) patch.poetry = '';
                if (userData.nameBgColor === undefined) patch.nameBgColor = null;
                if (Object.keys(patch).length > 0) {
                    Object.assign(userData, patch);
                    db.ref('users/' + firebaseUser.uid).update(patch).catch(function () {});
                }

                // ✅ فحص الملك (kingUid من الـ parallel read)
                if (kingUid && firebaseUser.uid === kingUid && userData.rank !== 'King') {
                    userData.rank = 'King';
                    userData.rankLevel = 100;
                    db.ref('users/' + firebaseUser.uid + '/rank').set('King').catch(function () {});
                    db.ref('users/' + firebaseUser.uid + '/rankLevel').set(100).catch(function () {});
                }

                // update lastSeen + presence
                Promise.all([
                    db.ref('users/' + firebaseUser.uid + '/lastSeen').set(now),
                    db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
                ]).catch(function () {});

            } else {
                // ── سجل جديد ──
                const codeRes = await ensureUniqueCode(userData.name, firebaseUser.uid);
                if (codeRes.code) userData.code = codeRes.code;
                await reserveName(userData.name, firebaseUser.uid);

                userData = Object.assign({}, buildNewUserData({
                    uid: firebaseUser.uid,
                    name: userData.name,
                    code: codeRes.code || buildUserCode(userData.name, firebaseUser.uid),
                    age: 0,
                    gender: '',
                    email: firebaseUser.email,
                    isGuest: false,
                    now: now
                }));

                await Promise.all([
                    db.ref('users/' + firebaseUser.uid).set(userData),
                    db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
                ]);
            }
        }

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member logged in:', userData.name, '| Rank:', userData.rank, '| QueenOrder:', userData.queenOrder || '-');
        return { success: true, user: currentUser };

    } catch (error) {
        console.error('❌ Login error:', error);
        currentUser = null;
        let errorMsg = 'فشل تسجيل الدخول';
        if (error.code === 'auth/user-not-found') errorMsg = 'الإيميل غير مسجل';
        else if (error.code === 'auth/wrong-password') errorMsg = 'كلمة السر خاطئة';
        else if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
        else if (error.code === 'auth/too-many-requests') errorMsg = 'محاولات كثيرة، حاول لاحقاً';
        else if (error.code === 'auth/invalid-credential') errorMsg = 'بيانات الدخول غير صحيحة';
        return { success: false, error: errorMsg };
    }
}

/* ══════════════════════════════════════════════ */
/* الجلسة — Save / Load                           */
/* ══════════════════════════════════════════════ */

/* ⭐ v8.5: نسخة خفيفة للحفظ عند فشل quota */
function _buildMinimalSession(user) {
    if (!user) return null;
    return {
        uid: user.uid,
        name: user.name,
        code: user.code,
        rank: user.rank,
        rankLevel: user.rankLevel,
        queenOrder: user.queenOrder,
        isGuest: user.isGuest,
        avatar: user.avatar,
        color: user.color,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        email: user.email,
        createdAt: user.createdAt,
        lastSeen: user.lastSeen,
        identityUpdatedAt: user.identityUpdatedAt,
        isBanned: user.isBanned,
        bannedUntil: user.bannedUntil,
        isJailed: user.isJailed,
        jailUntil: user.jailUntil,
        invisible: user.invisible,
        warnings: user.warnings,
        jailCount: user.jailCount
    };
}

/* ⭐ v8.5: يستبعد base64 الكبيرة قبل الحفظ */
function _stripHeavyFields(user) {
    if (!user) return user;
    var light = {};
    Object.keys(user).forEach(function (k) {
        var v = user[k];
        // تجاهل أي data: URL أطول من 30 ألف حرف (base64 ثقيل)
        if (typeof v === 'string' && v.length > 30000 && v.indexOf('data:') === 0) {
            return; // skip
        }
        light[k] = v;
    });
    return light;
}

/* ⭐ v8.5: saveSession مُحصّن ضد QuotaExceeded */
function saveSession(user, isGuestFlag) {
    if (!user) {
        currentUser = null;
        isUserGuest = false;
        return;
    }

    try {
        // 1. استبعد base64 الكبيرة
        var lightUser = _stripHeavyFields(user);
        var json = JSON.stringify(lightUser);

        // 2. جرّب الحفظ
        try {
            localStorage.setItem(QAMAR.STORAGE_KEYS.USER, json);
            localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, json);
        } catch (quotaErr) {
            // 3. Quota exceeded → احفظ نسخة مبسطة
            console.warn('⚠️ localStorage quota exceeded — saving minimal session');
            var minimal = _buildMinimalSession(user);
            var minJson = JSON.stringify(minimal);
            try {
                localStorage.setItem(QAMAR.STORAGE_KEYS.USER, minJson);
                localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, minJson);
                console.log('✅ Minimal session saved (quota recovery)');
            } catch (e2) {
                console.error('❌ Even minimal save failed:', e2);
                // 4. مسح القديم وأعد المحاولة مرة أخيرة
                try {
                    localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
                    localStorage.removeItem(QAMAR.STORAGE_KEYS.CURRENT_USER);
                    localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, minJson);
                    console.log('✅ Session saved after cleanup');
                } catch (e3) {
                    console.error('❌ Final save attempt failed:', e3);
                }
            }
        }

        // 5. Guest flag
        if (isGuestFlag) {
            try {
                localStorage.setItem(QAMAR.STORAGE_KEYS.GUEST, JSON.stringify(_buildMinimalSession(user)));
            } catch (e) {}
        } else {
            try { localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST); } catch (e) {}
        }

        // 6. identityUpdatedAt
        if (user.identityUpdatedAt) {
            try {
                localStorage.setItem(QAMAR.STORAGE_KEYS.IDENTITY_UPDATED_AT, String(user.identityUpdatedAt));
            } catch (e) {}
        }

        // 7. حدّث الذاكرة (القيمة الكاملة، لا المبسطة)
        currentUser = user;
        isUserGuest = isGuestFlag;

    } catch (e) {
        console.error('❌ Save session error:', e);
    }
}

function loadSession() {
    try {
        let userStr = localStorage.getItem(QAMAR.STORAGE_KEYS.CURRENT_USER)
                   || localStorage.getItem(QAMAR.STORAGE_KEYS.USER);
        if (userStr) {
            currentUser = JSON.parse(userStr);
            if (currentUser && !currentUser.rankLevel) {
                currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank || 'User');
            }
            if (currentUser && currentUser.rank === 'Queen' && !currentUser.queenOrder) {
                currentUser.queenOrder = 1;
            }
            isUserGuest = currentUser.isGuest === true;
            return currentUser;
        }
        const guestStr = localStorage.getItem(QAMAR.STORAGE_KEYS.GUEST);
        if (guestStr) {
            currentUser = JSON.parse(guestStr);
            if (currentUser && !currentUser.rankLevel) {
                currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank || 'User');
            }
            isUserGuest = true;
            return currentUser;
        }
        return null;
    } catch (e) {
        console.error('❌ Load session error:', e);
        // ⭐ v8.5: لو البيانات تالفة، احذفها ونظّف
        try {
            localStorage.removeItem(QAMAR.STORAGE_KEYS.CURRENT_USER);
            localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
        } catch (e2) {}
        return null;
    }
}

/* ══════════════════════════════════════════════ */
/* Logout — يمسح كل شيء                           */
/* ══════════════════════════════════════════════ */
async function logout() {
    try {
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            if (typeof db !== 'undefined' && db && currentUser && currentUser.uid) {
                db.ref('user_presence/' + currentUser.uid).set({
                    state: 'offline',
                    lastChanged: Date.now()
                }).catch(function () {});
            }
            await auth.signOut();
        }
    } catch (e) {
        console.warn('⚠️ Sign out error:', e);
    }

    // ⭐ v8.4: مسح شامل لكل مفاتيح الهوية
    const K = QAMAR.STORAGE_KEYS;
    const toRemove = [
        K.USER, K.GUEST, K.CURRENT_USER,
        K.IDENTITY_UPDATED_AT,
        K.ROOM_PICKER_DONE,
        K.SAVED_AVATAR, K.SAVED_COVER, K.AVATAR_FRAME,
        K.PROFILE_BG_TYPE, K.PROFILE_BG_VALUE,
        K.NAME_COLOR, K.NAME_GRADIENT,
        K.NAME_BG_COLOR, K.NAME_BG_GRADIENT,
        K.PROFILE_GLOW, K.PROFILE_NAME, K.PROFILE_BIO,
        K.POETRY_TEXT, K.MUSIC_URL
    ];
    toRemove.forEach(function (key) {
        try { localStorage.removeItem(key); } catch (e) {}
    });

    currentUser = null;
    isUserGuest = false;
    _loginTempUid = null;
    _loginTempAt = 0;
    console.log('👋 Logged out — identity cache cleared');
}

/* ══════════════════════════════════════════════ */
/* Helpers                                        */
/* ══════════════════════════════════════════════ */
function getCurrentUser() {
    if (!currentUser) loadSession();
    return currentUser;
}

function iAmKing() {
    if (!currentUser) return false;
    return currentUser.rank === 'King';
}
function iAmQueen() {
    if (!currentUser) return false;
    return currentUser.rank === 'Queen';
}
function iAmRoyal() {
    return iAmKing() || iAmQueen();
}

function isGuest() { return isUserGuest === true; }
function isMember() { return !isUserGuest && currentUser !== null; }

function isHigherThan(rank) {
    if (!currentUser) return false;
    return QAMAR.isHigherRank(currentUser.rank, rank);
}
function isHigherOrEqualThan(rank) {
    const u = getCurrentUser();
    if (!u) return false;
    return QAMAR.isHigherOrEqual(u.rank, rank);
}

/* ══════════════════════════════════════════════ */
/* Auth Listener — ⭐ v8.7 مع بوابة double-fetch   */
/* ══════════════════════════════════════════════ */
async function startAuthListener() {
    const ok = await waitForAuth(10000);
    if (!ok) {
        console.warn('⚠️ auth not available for listener');
        return;
    }

    _authUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        _authReady = true;
        if (firebaseUser) {
            // ⭐⭐⭐ v8.7: تجاوز لو login() جلب البيانات للتو
            if (_loginTempUid === firebaseUser.uid && (Date.now() - _loginTempAt) < 5000) {
                console.log('⏭️ Auth-listener: skipping refetch (recent login)');
                return;
            }
            // ⭐ v8.4: تجاوز لو currentUser محدَّث
            if (!currentUser || currentUser.uid !== firebaseUser.uid) {
                try {
                    // ⭐ v8.6: users + config/king_uid بالتوازي
                    const [snap, kingSnap] = await Promise.all([
                        db.ref('users/' + firebaseUser.uid).once('value'),
                        db.ref('config/king_uid').once('value').catch(function () { return null; })
                    ]);

                    if (snap.exists()) {
                        currentUser = snap.val();
                        currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank);
                        isUserGuest = currentUser.isGuest === true;

                        if (currentUser.rank === 'Queen' && !currentUser.queenOrder) {
                            currentUser.queenOrder = 1;
                            db.ref('users/' + firebaseUser.uid + '/queenOrder').set(1).catch(function () {});
                        }

                        if (!currentUser.code) {
                            const codeRes = await ensureUniqueCode(currentUser.name, firebaseUser.uid);
                            if (codeRes.code) {
                                currentUser.code = codeRes.code;
                                db.ref('users/' + firebaseUser.uid + '/code').set(codeRes.code).catch(function () {});
                            }
                        }

                        const kingUid = kingSnap ? kingSnap.val() : null;
                        if (kingUid && firebaseUser.uid === kingUid && currentUser.rank !== 'King') {
                            currentUser.rank = 'King';
                            currentUser.rankLevel = 100;
                            db.ref('users/' + firebaseUser.uid + '/rank').set('King').catch(function () {});
                            db.ref('users/' + firebaseUser.uid + '/rankLevel').set(100).catch(function () {});
                        }

                        saveSession(currentUser, isUserGuest);
                        console.log('🔄 Auth restored:', currentUser.name, '| Rank:', currentUser.rank);
                    }
                } catch (e) {
                    console.warn('⚠️ Fetch user failed:', e);
                }
            }
        }
    });

    console.log('✅ Auth listener started');
}

function stopAuthListener() {
    if (_authUnsubscribe) {
        try { _authUnsubscribe(); } catch (e) {}
        _authUnsubscribe = null;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadSession();
    startAuthListener();
    console.log('📦 Auth.js v8.7 loaded — king login +50% faster');
});
