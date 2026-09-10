// ==============================================
// قمر الشام - نظام الدخول والمصادقة (محدّث v3)
// Qamar Al Sham - Authentication System v3
// ==============================================

// ====== متغيرات عامة ======
let currentUser = null;
let isUserGuest = false;
let _authReady = false;

// ==============================================
// 0. أدوات مساعدة داخلية
// ==============================================

/**
 * توليد UID محلي للزوار (يُخزَّن في Firebase)
 * نستخدم بادئة guest_ لتمييزه
 */
function generateGuestUid(name) {
    const cleanName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
    const random = Math.random().toString(36).substring(2, 10);
    return 'guest_' + cleanName + '_' + random;
}

/**
 * التحقق من توفر اسم (غير مستخدم)
 */
async function isNameAvailable(name) {
    try {
        if (typeof db === 'undefined' || !db) return true;
        const snap = await db.ref('user_names/' + name).once('value');
        return !snap.exists();
    } catch (e) {
        console.warn('⚠️ Name check failed:', e);
        return true; // نسمح بالمرور لو فشل الفحص
    }
}

/**
 * تسجيل الاسم في user_names (لمنع التكرار لاحقاً)
 */
async function claimName(name, uid) {
    try {
        if (typeof db === 'undefined' || !db) return;
        await db.ref('user_names/' + name).set(uid);
    } catch (e) {
        console.warn('⚠️ Claim name failed:', e);
    }
}

/**
 * إطلاق الاسم من user_names (عند تغيير الاسم أو الحذف)
 */
async function releaseName(name) {
    try {
        if (typeof db === 'undefined' || !db) return;
        await db.ref('user_names/' + name).remove();
    } catch (e) {
        console.warn('⚠️ Release name failed:', e);
    }
}

// ==============================================
// 1. تسجيل زائر جديد
// ==============================================
async function registerGuest(name, age, gender) {
    // التحقق
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

    // التحقق من توفر الاسم
    const available = await isNameAvailable(trimmedName);
    if (!available) {
        return { success: false, error: 'هذا الاسم مستخدم، اختر اسماً آخر' };
    }

    try {
        // توليد UID
        const uid = generateGuestUid(trimmedName);

        // بيانات الزائر — الرتبة الفعلية: User (وليس Guest)
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

        // حفظ في Firebase
        if (typeof db !== 'undefined' && db) {
            try {
                // 1) بيانات المستخدم
                await db.ref('users/' + uid).set(userData);
                // 2) تسجيل الاسم
                await claimName(trimmedName, uid);
                // 3) تهيئة الإشعارات (فارغة)
                await db.ref('user_notifications/' + uid).set({});
                // 4) تهيئة المحادثات الخاصة (فارغة)
                await db.ref('user_private_chats/' + uid).set({});
                // 5) الحضور
                await db.ref('user_presence/' + uid).set({
                    state: 'online',
                    lastChanged: Date.now()
                });
            } catch (fbError) {
                console.error('❌ Firebase save failed:', fbError);
                return { success: false, error: 'فشل الحفظ في Firebase: ' + (fbError.message || '') };
            }
        }

        currentUser = userData;
        isUserGuest = true;
        saveSession(currentUser, true);

        console.log('✅ Guest registered:', trimmedName, '→', uid);
        return { success: true, user: currentUser };

    } catch (e) {
        console.error('❌ registerGuest error:', e);
        return { success: false, error: 'حدث خطأ غير متوقع' };
    }
}

// ==============================================
// 2. تسجيل عضو جديد
// ==============================================
async function registerMember(name, age, gender, email, password) {
    // التحقق
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

        // 1) إنشاء حساب في Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;

        // 2) التحقق من توفر الاسم
        const available = await isNameAvailable(trimmedName);
        if (!available) {
            // نتراجع — لكن الحساب أُنشئ بالفعل. نسمح بالاسم مع لاحقة
            console.warn('⚠️ Name taken, keeping account');
            await firebaseUser.delete(); // حذف الحساب
            return { success: false, error: 'هذا الاسم مستخدم، اختر اسماً آخر' };
        }

        // 3) تحديد الرتبة (User افتراضياً)
        //    ملاحظة: الملك يُحدَّد يدوياً في Firebase Console (تعديل users/{uid}/rank → King)
        const rank = 'User';

        // 4) بيانات المستخدم
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

        // 5) حفظ في Firebase Database
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

        // جلب بيانات المستخدم من Database
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
                // تأكد من rankLevel
                userData.rankLevel = QAMAR.getRankLevel(userData.rank);
            } else {
                // مستخدم موجود في Auth لكن ليس في Database → ننشئه
                await db.ref('users/' + firebaseUser.uid).set(userData);
                await claimName(userData.name, firebaseUser.uid);
            }

            // تحديث lastSeen
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
        // نخزّن في المفتاحين دائماً — بعض الملفات القديمة تعتمد على أحدهما
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
        // أولوية: current_user → user → guest
        let userStr = localStorage.getItem(QAMAR.STORAGE_KEYS.CURRENT_USER)
                   || localStorage.getItem(QAMAR.STORAGE_KEYS.USER);

        if (userStr) {
            currentUser = JSON.parse(userStr);
            // ضمان rankLevel
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
            // تحديث الحضور إلى offline
            if (typeof db !== 'undefined' && db && currentUser?.uid) {
                try {
                    await db.ref('user_presence/' + currentUser.uid).set({
                        state: 'offline',
                        lastChanged: Date.now()
                    });
                } catch (e) { /* تجاهل */ }
            }
            await auth.signOut();
        }
    } catch (e) {
        console.warn('⚠️ Sign out error:', e);
    }

    // مسح كل الجلسات
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

/**
 * هل رتبة المستخدم الحالي أعلى من رتبة معينة؟
 */
function isHigherThan(rank) {
    if (!currentUser) return false;
    return QAMAR.isHigherRank(currentUser.rank, rank);
}

/**
 * هل رتبة المستخدم الحالي أعلى أو تساوي رتبة معينة؟
 */
function isHigherOrEqualThan(rank) {
    if (!currentUser) return false;
    return QAMAR.isHigherOrEqual(currentUser.rank, rank);
}

// ==============================================
// 8. مراقبة حالة المصادقة (للمستخدمين المسجّلين)
// ==============================================
if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged(async (firebaseUser) => {
        _authReady = true;
        if (firebaseUser) {
            // مستخدم مسجّل دخول في Firebase
            if (!currentUser || currentUser.uid !== firebaseUser.uid) {
                // جلب البيانات
                try {
                    const snap = await db.ref('users/' + firebaseUser.uid).once('value');
                    if (snap.exists()) {
                        currentUser = snap.val();
                        currentUser.rankLevel = QAMAR.getRankLevel(currentUser.rank);
                        isUserGuest = false;
                        saveSession(currentUser, false);
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
// 9. تحميل الجلسة عند بدء الصفحة
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    loadSession();
    console.log('📦 Auth.js v3 loaded');
});
