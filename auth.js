// ==============================================
// قمر الشام - نظام الدخول والمصادقة (v4)
// ==============================================

// ====== متغيرات عامة ======
let currentUser = null;
let isUserGuest = false;
let _authReady = false;

// ==============================================
// 0. أدوات مساعدة داخلية
// ==============================================

async function isNameAvailable(name) {
    try {
        if (typeof db === 'undefined' || !db) return true;
        const snap = await db.ref('user_names/' + name).once('value');
        return !snap.exists();
    } catch (e) {
        console.warn('⚠️ Name check failed:', e);
        return true;
    }
}

async function claimName(name, uid) {
    try {
        if (typeof db === 'undefined' || !db) return;
        await db.ref('user_names/' + name).set(uid);
    } catch (e) {
        console.warn('⚠️ Claim name failed:', e);
    }
}

// ==============================================
// 1. تسجيل زائر جديد (Anonymous Auth)
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
    const available = await isNameAvailable(trimmedName);
    if (!available) {
        return { success: false, error: 'هذا الاسم مستخدم، اختر اسماً آخر' };
    }

    try {
        if (typeof auth === 'undefined' || !auth) {
            return { success: false, error: 'Firebase Auth غير متاح' };
        }

        // ⭐ تسجيل مجهول في Firebase Auth
        const credential = await auth.signInAnonymously();
        const uid = credential.user.uid;

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
            createdAt: Date.now(),
            lastSeen: Date.now()
        };

        if (typeof db !== 'undefined' && db) {
            await db.ref('users/' + uid).set(userData);
            await claimName(trimmedName, uid);
            await db.ref('user_notifications/' + uid).set({});
            await db.ref('user_private_chats/' + uid).set({});
            await db.ref('user_presence/' + uid).set({
                state: 'online',
                lastChanged: Date.now()
            });
        }

        currentUser = userData;
        isUserGuest = true;
        saveSession(currentUser, true);

        console.log('✅ Guest registered:', trimmedName, '→', uid);
        return { success: true, user: currentUser };

    } catch (e) {
        console.error('❌ registerGuest error:', e);
        return { success: false, error: 'حدث خطأ: ' + (e.message || '') };
    }
}

// ==============================================
// 2. تسجيل عضو جديد
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
        if (typeof auth === 'undefined' || !auth) {
            return { success: false, error: 'Firebase Auth غير متاح' };
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;

        const available = await isNameAvailable(trimmedName);
        if (!available) {
            await firebaseUser.delete();
            return { success: false, error: 'هذا الاسم مستخدم، اختر اسماً آخر' };
        }

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
            createdAt: Date.now(),
            lastSeen: Date.now()
        };

        if (typeof db !== 'undefined' && db) {
            await db.ref('users/' + firebaseUser.uid).set(userData);
            await claimName(trimmedName, firebaseUser.uid);
            await db.ref('user_notifications/' + firebaseUser.uid).set({});
            await db.ref('user_private_chats/' + firebaseUser.uid).set({});
            await db.ref('user_presence/' + firebaseUser.uid).set({
                state: 'online',
                lastChanged: Date.now()
            });
        }

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member registered:', trimmedName);
        return { success: true, user: currentUser };

    } catch (error) {
        console.error('❌ Register error:', error);
        let errorMsg = 'فشل التسجيل';
        if (error.code === 'auth/email-already-in-use') errorMsg = 'الإيميل مستخدم بالفعل';
        else if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
        else if (error.code === 'auth/weak-password') errorMsg = 'كلمة السر ضعيفة';
        return { success: false, error: errorMsg };
    }
}

// ==============================================
// 3. تسجيل دخول عضو
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

        let userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: email.split('@')[0],
            rank: 'User',
            rankLevel: QAMAR.getRankLevel('User'),
            isGuest: false,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`,
            color: '#ffffff',
            lastSeen: Date.now()
        };

        if (typeof db !== 'undefined' && db) {
            const snapshot = await db.ref('users/' + firebaseUser.uid).once('value');
            if (snapshot.exists()) {
                userData = { ...userData, ...snapshot.val() };
                userData.rankLevel = QAMAR.getRankLevel(userData.rank);
            } else {
                await db.ref('users/' + firebaseUser.uid).set(userData);
                await claimName(userData.name, firebaseUser.uid);
            }

            await db.ref('users/' + firebaseUser.uid + '/lastSeen').set(Date.now());
            await db.ref('user_presence/' + firebaseUser.uid).set({
                state: 'online',
                lastChanged: Date.now()
            });
        }

        currentUser = userData;
        isUserGuest = false;
        saveSession(currentUser, false);

        console.log('✅ Member logged in:', userData.name, '| Rank:', userData.rank);
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
        console.log('💾 Session saved');
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
                try {
                    await db.ref('user_presence/' + currentUser.uid).set({
                        state: 'offline',
                        lastChanged: Date.now()
                    });
                } catch (e) {}
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
    if (!currentUser) return false;
    return QAMAR.isHigherOrEqual(currentUser.rank, rank);
}

// ==============================================
// 8. مراقبة حالة المصادقة
// ==============================================
if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged(async (firebaseUser) => {
        _authReady = true;
        if (firebaseUser) {
            if (!currentUser || currentUser.uid !== firebaseUser.uid) {
                try {
                    const snap = await db.ref('users/' + firebaseUser.uid).once('value');
                    if (snap.exists()) {
                        currentUser = snap.val();
                        currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank);
                        isUserGuest = currentUser.isGuest === true;
                        saveSession(currentUser, isUserGuest);
                        console.log('🔄 Auth state restored:', currentUser.name);
                    }
                } catch (e) {
                    console.warn('⚠️ Auth restore failed:', e);
                }
            }
        }
    });
}

// ==============================================
// 9. تحميل الجلسة
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    loadSession();
    console.log('📦 Auth.js v4 loaded');
});
