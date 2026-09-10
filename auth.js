// ==============================================
// قمر الشام - نظام الدخول والمصادقة (محدّث)
// Qamar Al Sham - Authentication System v2
// ==============================================

// ====== متغيرات عامة ======
let currentUser = null;
let isUserGuest = false;

// ==============================================
// 1. تسجيل زائر جديد
// ==============================================
function registerGuest(name, age, gender) {
    // التحقق من المدخلات
    if (!name || name.length < 2) {
        return { success: false, error: 'الرجاء إدخال اسم صحيح (حرفين على الأقل)' };
    }
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
        return { success: false, error: 'الرجاء إدخال عمر صحيح (13 - 120)' };
    }
    if (!gender || !['male', 'female'].includes(gender)) {
        return { success: false, error: 'الرجاء اختيار الجنس' };
    }

    // إنشاء بيانات الزائر
    currentUser = {
        name: name,
        age: parseInt(age),
        gender: gender,
        rank: 'Guest',
        isGuest: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=555&color=fff`,
        color: '#95a5a6'
    };
    isUserGuest = true;

    // حفظ في localStorage
    saveSession(currentUser, true);

    console.log('✅ Guest registered:', name);
    return { success: true, user: currentUser };
}

// ==============================================
// 2. تسجيل عضو جديد
// ==============================================
async function registerMember(name, age, gender, email, password) {
    // التحقق من المدخلات
    if (!name || name.length < 2) {
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

    try {
        // إذا Firebase متاح
        if (typeof auth !== 'undefined' && auth) {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const firebaseUser = userCredential.user;

            // تحديد الرتبة
            let rank = 'User';
            if (email === QAMAR.KING_EMAIL) rank = 'King';

            // بيانات المستخدم
            const userData = {
                uid: firebaseUser.uid,
                name: name,
                age: parseInt(age),
                gender: gender,
                email: email,
                rank: rank,
                isGuest: false,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                color: rank === 'King' ? '#ffd700' : '#ffffff',
                createdAt: Date.now()
            };

            // حفظ في Firebase Database
            if (typeof db !== 'undefined' && db) {
                await db.ref('users/' + firebaseUser.uid).set(userData);
            }

            currentUser = userData;
            isUserGuest = false;
            saveSession(currentUser, false);

            console.log('✅ Member registered:', name);
            return { success: true, user: currentUser };

        } else {
            // وضع تجريبي (بدون Firebase)
            const rank = email === QAMAR.KING_EMAIL ? 'King' : 'User';
            currentUser = {
                name: name,
                age: parseInt(age),
                gender: gender,
                email: email,
                rank: rank,
                isGuest: false,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                color: rank === 'King' ? '#ffd700' : '#ffffff'
            };
            isUserGuest = false;
            saveSession(currentUser, false);
            console.log('⚠️ Register (demo mode):', name);
            return { success: true, user: currentUser };
        }

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
        // إذا Firebase متاح
        if (typeof auth !== 'undefined' && auth) {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const firebaseUser = userCredential.user;

            // جلب بيانات المستخدم من Database
            let userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || email.split('@')[0],
                rank: 'User',
                isGuest: false,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`,
                color: '#ffffff'
            };

            if (typeof db !== 'undefined' && db) {
                try {
                    const snapshot = await db.ref('users/' + firebaseUser.uid).once('value');
                    if (snapshot.exists()) {
                        userData = { ...userData, ...snapshot.val() };
                    }
                } catch (dbError) {
                    console.warn('⚠️ DB fetch failed:', dbError);
                }
            }

            // إذا كان الملك
            if (email === QAMAR.KING_EMAIL) {
                userData.rank = 'King';
                userData.name = QAMAR.KING_NAME;
                userData.color = '#ffd700';
                userData.avatar = `https://ui-avatars.com/api/?name=Emad&background=ffd700&color=000`;
            }

            currentUser = userData;
            isUserGuest = false;
            saveSession(currentUser, false);

            console.log('✅ Member logged in:', userData.name);
            return { success: true, user: currentUser };

        } else {
            // وضع تجريبي
            const isKing = email === QAMAR.KING_EMAIL;
            currentUser = {
                email: email,
                name: isKing ? QAMAR.KING_NAME : email.split('@')[0],
                rank: isKing ? 'King' : 'User',
                isGuest: false,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`,
                color: isKing ? '#ffd700' : '#ffffff'
            };
            isUserGuest = false;
            saveSession(currentUser, false);
            console.log('⚠️ Login (demo mode):', currentUser.name);
            return { success: true, user: currentUser };
        }

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
function saveSession(user, isGuest) {
    try {
        if (isGuest) {
            localStorage.setItem(QAMAR.STORAGE_KEYS.GUEST, JSON.stringify(user));
            localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
        } else {
            localStorage.setItem(QAMAR.STORAGE_KEYS.USER, JSON.stringify(user));
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
        const userStr = localStorage.getItem(QAMAR.STORAGE_KEYS.USER);
        if (userStr) {
            currentUser = JSON.parse(userStr);
            isUserGuest = false;
            return currentUser;
        }

        const guestStr = localStorage.getItem(QAMAR.STORAGE_KEYS.GUEST);
        if (guestStr) {
            currentUser = JSON.parse(guestStr);
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
            await auth.signOut();
        }
    } catch (e) {
        console.warn('⚠️ Sign out error:', e);
    }

    localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
    localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST);
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
    return currentUser.rank === 'King' || currentUser.email === QAMAR.KING_EMAIL;
}

function isGuest() {
    return isUserGuest === true;
}

function isMember() {
    return !isUserGuest && currentUser !== null;
}

// ==============================================
// 8. تحميل الجلسة عند بدء الصفحة
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    loadSession();
    console.log('📦 Auth.js v2 loaded');
});
