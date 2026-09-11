// ==============================================
// قمر الشام - نظام الدخول والمصادقة (v5 - كامل، محسّن وسريع)
// Qamar Al Sham - Auth v5 (Complete, Fast & Non-blocking)
// ==============================================

let currentUser = null;
let isUserGuest = false;
let _authReady = false;

// ==============================================
// 1. تسجيل زائر (سريع + آمن)
// ==============================================
async function registerGuest(name, age, gender) {
    if (!name || name.trim().length < 2) {
        return { success: false, error: 'الرجاء إدخال اسم صحيح (حرفين على الأقل)' };
    }
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
        return { success: false, error: 'الرجاء إدخال عمر صحيح (13 - 120)' };
    }
    if (!gender || !['male', 'female'].includes(gender)) {
        return { success: false, error: 'الرجاء اختيار الجنس' };
    }

    const trimmedName = name.trim();

    try {
        // ⭐ انتظار auth حتى 5 ثوان
if (typeof auth === 'undefined' || !auth) {
    for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (typeof auth !== 'undefined' && auth) break;
    }
}
if (typeof auth === 'undefined' || !auth) {
    return { success: false, error: 'Firebase Auth غير متاح — أعد المحاولة' };
}

        const credential = await auth.signInAnonymously();
        const uid = credential.user.uid;
        const now = Date.now();

        const userData = {
            uid: uid,
            name: trimmedName,
            age: parseInt(age),
            gender: gender,
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            isGuest: true,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=555&color=fff`,
            color: '#95a5a6',
            createdAt: now,
            lastSeen: now
        };

        await Promise.all([
            db.ref('users/' + uid).set(userData),
            db.ref('user_names/' + trimmedName).set(uid),
            db.ref('user_presence/' + uid).set({
                state: 'online',
                lastChanged: now
            })
        ]);

        currentUser = userData;
        isUserGuest = true;
        saveSession(currentUser, true);

        console.log('✅ Guest registered (fast):', trimmedName, '→', uid);
        return { success: true, user: currentUser };

    } catch (e) {
        console.error('❌ registerGuest error:', e);
        if (e.code === 'PERMISSION_DENIED' || (e.message && e.message.includes('permission'))) {
            return { success: false, error: 'فشل الاتصال، حاول مرة ثانية' };
        }
        return { success: false, error: 'حدث خطأ: ' + (e.message || '') };
    }
}

// ==============================================
// 2. تسجيل عضو جديد (سريع)
// ==============================================
async function registerMember(name, age, gender, email, password) {
    if (!name || name.trim().length < 2) {
        return { success: false, error: 'الرجاء إدخال اسم صحيح' };
    }
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
        return { success: false, error: 'الرجاء إدخال عمر صحيح' };
    }
    if (!email || !email.includes('@')) {
        return { success: false, error: 'الرجاء إدخال إيميل صحيح' };
    }
    if (!password || password.length < 6) {
        return { success: false, error: 'كلمة السر لازم 6 أحرف على الأقل' };
    }

    const trimmedName = name.trim();

    try {
        typeof auth === 'undefined' 

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        const rank = 'User';
        const userData = {
            uid: firebaseUser.uid,
            name: trimmedName,
            age: parseInt(age),
            gender: gender,
            email: email,
            rank: rank,
            rankLevel: QAMAR.getRankLevel(rank),
            isGuest: false,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=random&color=fff`,
            color: '#ffffff',
            createdAt: now,
            lastSeen: now
        };

        await Promise.all([
            db.ref('users/' + firebaseUser.uid).set(userData),
            db.ref('user_names/' + trimmedName).set(firebaseUser.uid),
            db.ref('user_presence/' + firebaseUser.uid).set({
                state: 'online',
                lastChanged: now
            })
        ]);

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member registered (fast):', trimmedName);
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

// ==============================================
// 3. تسجيل دخول عضو (سريع)
// ==============================================
async function login(email, password) {
    if (!email || !password) {
        return { success: false, error: 'الرجاء إدخال الإيميل وكلمة السر' };
    }

    try {
        if (typeof auth === 'undefined' || !auth) {
            return { success: false, error: 'Firebase Auth غير متاح' };
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        const now = Date.now();

        let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: email.split('@')[0],
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            isGuest: false,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`,
            color: '#ffffff',
            lastSeen: now
        };

        if (typeof db !== 'undefined' && db) {
            const snapshot = await db.ref('users/' + firebaseUser.uid).once('value');

            if (snapshot.exists()) {
                userData = { ...userData, ...snapshot.val() };
                userData.rankLevel = QAMAR.getRankLevel(userData.rank);

                Promise.all([
                    db.ref('users/' + firebaseUser.uid + '/lastSeen').set(now),
                    db.ref('user_presence/' + firebaseUser.uid).set({
                        state: 'online',
                        lastChanged: now
                    })
                ]).catch(() => {});
            } else {
                await Promise.all([
                    db.ref('users/' + firebaseUser.uid).set(userData),
                    db.ref('user_names/' + userData.name).set(firebaseUser.uid),
                    db.ref('user_presence/' + firebaseUser.uid).set({
                        state: 'online',
                        lastChanged: now
                    })
                ]);
            }
        }

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member logged in (fast):', userData.name, '| Rank:', userData.rank);
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

// ==============================================
// 4. حفظ الجلسة
// ==============================================
function saveSession(user, isGuestFlag) {
    try {
        const json = JSON.stringify(user);
        localStorage.setItem(QAMAR.STORAGE_KEYS.USER, json);
        localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, json);

        if (isGuestFlag) {
            localStorage.setItem(QAMAR.STORAGE_KEYS.GUEST, json);
        } else {
            localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST);
        }
    } catch (e) {
        console.error('❌ Save session error:', e);
    }
}

// ==============================================
// 5. استرجاع الجلسة
// ==============================================
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

// ==============================================
// 6. تسجيل الخروج
// ==============================================
async function logout() {
    try {
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            if (typeof db !== 'undefined' && db && currentUser?.uid) {
                db.ref('user_presence/' + currentUser.uid).set({
                    state: 'offline',
                    lastChanged: Date.now()
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

// ==============================================
// 7. دوال مساعدة
// ==============================================
function getCurrentUser() {
    if (!currentUser) loadSession();
    return currentUser;
}

function isKing() {
    if (!currentUser) return false;
    return currentUser.rank === 'King';
}

function isQueen() {
    if (!currentUser) return false;
    return currentUser.rank === 'Queen';
}

function isRoyal() {
    return isKing() || isQueen();
}

function isGuest() {
    return isUserGuest === true;
}

function isMember() {
    return !isUserGuest && currentUser !== null;
}

function isHigherThan(rank) {
    if (!currentUser) return false;
    return QAMAR.isHigherRank(currentUser.rank, rank);
}

function isHigherOrEqualThan(rank) {
    let u = getCurrentUser();
    if (!u) return false;
    return QAMAR.isHigherOrEqual(u.rank, rank);
}

// ==============================================
// 8. مراقبة حالة المصادقة (تعمل في الخلفية - بدون تعطيل الإقلاع)
// ==============================================
if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged((firebaseUser) => {
        _authReady = true;
        if (firebaseUser) {
            if (!currentUser || currentUser.uid !== firebaseUser.uid) {
                db.ref('users/' + firebaseUser.uid).once('value')
                    .then((snap) => {
                        if (snap.exists()) {
                            currentUser = snap.val();
                            currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank);
                            isUserGuest = currentUser.isGuest === true;
                            saveSession(currentUser, isUserGuest);
                            console.log('🔄 Auth state restored instantly:', currentUser.name);
                        }
                    })
                    .catch((e) => {
                        console.warn('⚠️ Background user fetch failed:', e);
                    });
            }
        }
    });
}

// ==============================================
// 9. تحميل الجلسة الفوري
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    loadSession();
    console.log('📦 Auth.js v5 loaded — Fast & Non-blocking ⚡');
});
