// ==============================================
// قمر الشام - نظام الدخول والمصادقة (v8.2)
// Qamar Al Sham - Auth v8.2 (User Code)
// ==============================================
// ✅ v8.2 fixes:
//   1. توحيد generateUserCode (يستخدم utils.js)
//   2. إعادة تسمية isKing/isQueen/isRoyal → iAmKing/iAmQueen/iAmRoyal
//   3. transaction() على user_names (منع سباق الأسماء)
//   4. stopAuthListener() للتنظيف
// ==============================================

let currentUser = null;
let isUserGuest = false;
let _authReady = false;
let _authUnsubscribe = null;

async function waitForAuth(timeoutMs = 5000) {
    if (typeof auth !== 'undefined' && auth) return true;
    const attempts = Math.floor(timeoutMs / 200);
    for (let i = 0; i < attempts; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (typeof auth !== 'undefined' && auth) return true;
    }
    return false;
}

function buildUserCode(name, uid) {
    if (typeof generateUserCode === 'function') {
        return generateUserCode(name, uid);
    }
    let prefix = 'U' + Math.floor(Math.random() * 9 + 1);
    const clean = (name || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length >= 2) prefix = clean.substring(0, 2);
    else if (clean.length === 1) prefix = clean + 'X';
    let hash = 5381;
    for (let i = 0; i < uid.length; i++) hash = ((hash * 33) ^ uid.charCodeAt(i)) >>> 0;
    const h = hash.toString(36).toUpperCase().padStart(3, '0').slice(-3);
    return prefix + '·' + h;
}

async function reserveUserCode(code, uid) {
    try {
        const result = await db.ref('user_codes/' + code).transaction(current => {
            if (current === null) return uid;
            if (current === uid) return uid;
            return undefined;
        });
        return result.committed === true;
    } catch (e) {
        console.warn('Reserve code error:', e);
        return false;
    }
}

async function reserveName(name, uid) {
    try {
        const result = await db.ref('user_names/' + name).transaction(current => {
            if (current === null) return uid;
            if (current === uid) return uid;
            return undefined;
        });
        return result.committed === true;
    } catch (e) {
        console.warn('Reserve name error:', e);
        return false;
    }
}

async function ensureUniqueCode(name, uid) {
    let userCode = buildUserCode(name, uid);
    let reserved = await reserveUserCode(userCode, uid);
    if (reserved) return userCode;

    for (let attempt = 0; attempt < 5; attempt++) {
        const suffix = Math.floor(Math.random() * 9999);
        userCode = buildUserCode(name + suffix, uid);
        reserved = await reserveUserCode(userCode, uid);
        if (reserved) return userCode;
    }
    return userCode;
}

async function registerGuest(name, age, gender) {
    if (!name || name.trim().length < 2)
        return { success: false, error: 'الرجاء إدخال اسم صحيح (حرفين على الأقل)' };
    if (!age || parseInt(age) < 13 || parseInt(age) > 120)
        return { success: false, error: 'الرجاء إدخال عمر صحيح (13 - 120)' };
    if (!gender || !['male', 'female'].includes(gender))
        return { success: false, error: 'الرجاء اختيار الجنس' };

    const trimmedName = name.trim();

    try {
        const ok = await waitForAuth(5000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const credential = await auth.signInAnonymously();
        const uid = credential.user.uid;
        const now = Date.now();

        const nameOk = await reserveName(trimmedName, uid);
        if (!nameOk) {
            try { await auth.signOut(); } catch (e) {}
            return { success: false, error: 'الاسم محجوز — اختر اسمًا آخر' };
        }

        const userCode = await ensureUniqueCode(trimmedName, uid);

        const userData = {
            uid, name: trimmedName, code: userCode,
            age: parseInt(age), gender,
            rank: 'User', rankLevel: QAMAR.getRankLevel('User'),
            isGuest: true,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmedName) + '&background=555&color=fff',
            color: '#95a5a6',
            createdAt: now, lastSeen: now
        };

        await Promise.all([
            db.ref('users/' + uid).set(userData),
            db.ref('user_presence/' + uid).set({ state: 'online', lastChanged: now })
        ]);

        currentUser = userData;
        isUserGuest = true;
        saveSession(currentUser, true);

        console.log('✅ Guest registered:', trimmedName, '→', uid, '| Code:', userCode);
        return { success: true, user: currentUser };

    } catch (e) {
        console.error('❌ registerGuest error:', e);
        if (e.code === 'PERMISSION_DENIED' || (e.message && e.message.includes('permission')))
            return { success: false, error: 'فشل الاتصال، حاول مرة ثانية' };
        return { success: false, error: 'حدث خطأ: ' + (e.message || '') };
    }
}

async function registerMember(name, age, gender, email, password) {
    if (!name || name.trim().length < 2) return { success: false, error: 'الرجاء إدخال اسم صحيح' };
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) return { success: false, error: 'الرجاء إدخال عمر صحيح' };
    if (!email || !email.includes('@')) return { success: false, error: 'الرجاء إدخال إيميل صحيح' };
    if (!password || password.length < 6) return { success: false, error: 'كلمة السر لازم 6 أحرف على الأقل' };

    const trimmedName = name.trim();

    try {
        const ok = await waitForAuth(5000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        const nameOk = await reserveName(trimmedName, firebaseUser.uid);
        if (!nameOk) {
            try { await firebaseUser.delete(); } catch (e) {}
            return { success: false, error: 'الاسم محجوز — اختر اسمًا آخر' };
        }

        const userCode = await ensureUniqueCode(trimmedName, firebaseUser.uid);
        const rank = 'User';

        const userData = {
            uid: firebaseUser.uid, name: trimmedName, code: userCode,
            age: parseInt(age), gender, email,
            rank, rankLevel: QAMAR.getRankLevel(rank),
            isGuest: false,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmedName) + '&background=random&color=fff',
            color: '#ffffff',
            createdAt: now, lastSeen: now
        };

        await Promise.all([
            db.ref('users/' + firebaseUser.uid).set(userData),
            db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
        ]);

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member registered:', trimmedName, '| Code:', userCode);
        return { success: true, user: currentUser };

    } catch (error) {
        console.error('❌ Register error:', error);
        let errorMsg = 'فشل التسجيل';
        if (error.code === 'auth/email-already-in-use') errorMsg = 'الإيميل مستخدم بالفعل';
        else if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
        else if (error.code === 'auth/weak-password') errorMsg = 'كلمة السر ضعيفة';
        else if (error.code === 'PERMISSION_DENIED') errorMsg = 'فشل الاتصال، حاول مرة ثانية';
        return { success: false, error: errorMsg };
    }
}

async function login(email, password) {
    if (!email || !password) return { success: false, error: 'الرجاء إدخال الإيميل وكلمة السر' };

    try {
        const ok = await waitForAuth(5000);
        if (!ok) return { success: false, error: 'Firebase لم يجهز بعد — انتظر ثوانٍ وأعد المحاولة' };

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        let userData = {
            uid: firebaseUser.uid, email: firebaseUser.email,
            name: email.split('@')[0],
            rank: 'User', rankLevel: QAMAR.getRankLevel('User'),
            isGuest: false,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0]) + '&background=random&color=fff',
            color: '#ffffff',
            lastSeen: now
        };

        if (typeof db !== 'undefined' && db) {
            const snapshot = await db.ref('users/' + firebaseUser.uid).once('value');

            if (snapshot.exists()) {
                userData = { ...userData, ...snapshot.val() };
                userData.rankLevel = QAMAR.getRankLevel(userData.rank);

                if (!userData.code) {
                    const newCode = await ensureUniqueCode(userData.name, firebaseUser.uid);
                    userData.code = newCode;
                    db.ref('users/' + firebaseUser.uid + '/code').set(newCode).catch(() => {});
                }

                try {
                    const kingSnap = await db.ref('config/king_uid').once('value');
                    const kingUid = kingSnap.val();
                    if (kingUid && firebaseUser.uid === kingUid && userData.rank !== 'King') {
                        userData.rank = 'King';
                        userData.rankLevel = 100;
                        await db.ref('users/' + firebaseUser.uid + '/rank').set('King');
                        await db.ref('users/' + firebaseUser.uid + '/rankLevel').set(100);
                    }
                } catch (e) { console.warn('King check error:', e); }

                Promise.all([
                    db.ref('users/' + firebaseUser.uid + '/lastSeen').set(now),
                    db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
                ]).catch(() => {});

            } else {
                const userCode = await ensureUniqueCode(userData.name, firebaseUser.uid);
                await reserveName(userData.name, firebaseUser.uid);
                userData.code = userCode;
                userData.createdAt = now;

                await Promise.all([
                    db.ref('users/' + firebaseUser.uid).set(userData),
                    db.ref('user_presence/' + firebaseUser.uid).set({ state: 'online', lastChanged: now })
                ]);
            }
        }

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member logged in:', userData.name, '| Rank:', userData.rank, '| Code:', userData.code);
        return { success: true, user: currentUser };

    } catch (error) {
        console.error('❌ Login error:', error);
        let errorMsg = 'فشل تسجيل الدخول';
        if (error.code === 'auth/user-not-found') errorMsg = 'الإيميل غير مسجل';
        else if (error.code === 'auth/wrong-password') errorMsg = 'كلمة السر خاطئة';
        else if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
        else if (error.code === 'auth/too-many-requests') errorMsg = 'محاولات كثيرة، حاول لاحقاً';
        else if (error.code === 'auth/invalid-credential') errorMsg = 'بيانات الدخول غير صحيحة';
        return { success: false, error: errorMsg };
    }
}

function saveSession(user, isGuestFlag) {
    try {
        const json = JSON.stringify(user);
        localStorage.setItem(QAMAR.STORAGE_KEYS.USER, json);
        localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, json);
        if (isGuestFlag) localStorage.setItem(QAMAR.STORAGE_KEYS.GUEST, json);
        else localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST);
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
        return null;
    }
}

async function logout() {
    try {
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            if (typeof db !== 'undefined' && db && currentUser?.uid) {
                db.ref('user_presence/' + currentUser.uid).set({
                    state: 'offline', lastChanged: Date.now()
                }).catch(() => {});
            }
            await auth.signOut();
        }
    } catch (e) {
        console.warn('⚠️ Sign out error:', e);
    }

    localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
    localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST);
    localStorage.removeItem(QAMAR.STORAGE_KEYS.CURRENT_USER);

    currentUser = null;
    isUserGuest = false;
    console.log('👋 Logged out');
}

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

async function startAuthListener() {
    const ok = await waitForAuth(10000);
    if (!ok) {
        console.warn('⚠️ auth not available for listener');
        return;
    }

    _authUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        _authReady = true;
        if (firebaseUser) {
            if (!currentUser || currentUser.uid !== firebaseUser.uid) {
                try {
                    const snap = await db.ref('users/' + firebaseUser.uid).once('value');
                    if (snap.exists()) {
                        currentUser = snap.val();
                        currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank);
                        isUserGuest = currentUser.isGuest === true;

                        if (!currentUser.code) {
                            const newCode = await ensureUniqueCode(currentUser.name, firebaseUser.uid);
                            currentUser.code = newCode;
                            db.ref('users/' + firebaseUser.uid + '/code').set(newCode).catch(() => {});
                        }

                        try {
                            const kingSnap = await db.ref('config/king_uid').once('value');
                            const kingUid = kingSnap.val();
                            if (kingUid && firebaseUser.uid === kingUid && currentUser.rank !== 'King') {
                                currentUser.rank = 'King';
                                currentUser.rankLevel = 100;
                                await db.ref('users/' + firebaseUser.uid + '/rank').set('King');
                                await db.ref('users/' + firebaseUser.uid + '/rankLevel').set(100);
                            }
                        } catch (e) { console.warn('King check failed:', e); }

                        saveSession(currentUser, isUserGuest);
                        console.log('🔄 Auth restored:', currentUser.name, '| Rank:', currentUser.rank, '| Code:', currentUser.code);
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
    console.log('📦 Auth.js v8.2 loaded — User Code 🔑');
});