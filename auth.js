// ==============================================
// قمر الشام - نظام الدخول والمصادقة
// Qamar Al Sham - Authentication System
// ==============================================

// ====== متغيرات عامة ======
let currentUser = null;   // المستخدم الحالي (عضو أو زائر)
let isUserGuest = false;  // هل المستخدم زائر؟

// ==============================================
// 1. تبديل تبويبات الدخول (عضو / زائر)
// ==============================================
function switchLoginTab(tab, event) {
    // إخفاء كل التبويبات
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // إظهار التبويب المطلوب
    const targetTab = document.getElementById('login-' + tab);
    if (targetTab) targetTab.style.display = 'flex';

    // تمييز الزر النشط
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    console.log('🔄 Tab switched to:', tab);
}

// ==============================================
// 2. دخول العضو (عبر Firebase Auth)
// ==============================================
async function memberLogin() {
    const emailEl = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');

    if (!emailEl || !passwordEl) {
        alert('⚠️ حدث خطأ في تحميل الحقول');
        return;
    }

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    // التحقق من المدخلات
    if (!email || !password) {
        alert('⚠️ الرجاء إدخال الإيميل وكلمة السر');
        return;
    }

    try {
        // إذا Firebase Auth متاح
        if (typeof auth !== 'undefined' && auth) {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // جلب بيانات المستخدم من Realtime Database
            let userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || email.split('@')[0],
                rank: 'User',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`
            };

            // محاولة جلب البيانات من قاعدة البيانات
            if (typeof db !== 'undefined' && db) {
                try {
                    const snapshot = await db.ref('users/' + user.uid).once('value');
                    if (snapshot.exists()) {
                        userData = { ...userData, ...snapshot.val() };
                    }
                } catch (dbError) {
                    console.warn('⚠️ لا يمكن جلب البيانات من DB:', dbError);
                }
            }

            // إذا كان الملك
            if (email === QAMAR.KING_EMAIL) {
                userData.rank = 'King';
                userData.name = QAMAR.KING_NAME;
                userData.avatar = `https://ui-avatars.com/api/?name=Emad&background=ffd700&color=000`;
            }

            // حفظ الجلسة
            currentUser = userData;
            isUserGuest = false;
            saveSession(currentUser, false);

            // إغلاق شاشة الدخول
            closeLoginScreen();
            console.log('✅ Member logged in:', userData.name);

        } else {
            // وضع تجريبي (بدون Firebase)
            console.log('⚠️ Firebase غير متاح - وضع تجريبي');
            const isKing = email === QAMAR.KING_EMAIL;
            currentUser = {
                email: email,
                name: isKing ? QAMAR.KING_NAME : email.split('@')[0],
                rank: isKing ? 'King' : 'User',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`
            };
            isUserGuest = false;
            saveSession(currentUser, false);
            closeLoginScreen();
        }

    } catch (error) {
        console.error('❌ Login error:', error);
        let errorMsg = '⚠️ فشل تسجيل الدخول';
        if (error.code === 'auth/user-not-found') errorMsg = '⚠️ الإيميل غير مسجل';
        else if (error.code === 'auth/wrong-password') errorMsg = '⚠️ كلمة السر خاطئة';
        else if (error.code === 'auth/invalid-email') errorMsg = '⚠️ الإيميل غير صحيح';
        else if (error.code === 'auth/too-many-requests') errorMsg = '⚠️ محاولات كثيرة، حاول لاحقاً';
        alert(errorMsg);
    }
}

// ==============================================
// 3. دخول الزائر (بدون Firebase)
// ==============================================
function guestLogin() {
    const nameEl = document.getElementById('guest-name');
    const ageEl = document.getElementById('guest-age');
    const genderEl = document.getElementById('guest-gender');

    if (!nameEl || !ageEl || !genderEl) {
        alert('⚠️ حدث خطأ في تحميل الحقول');
        return;
    }

    const name = nameEl.value.trim();
    const age = ageEl.value.trim();
    const gender = genderEl.value;

    // التحقق من المدخلات
    if (!name) {
        alert('⚠️ الرجاء إدخال الاسم');
        return;
    }
    if (!age || age < 13) {
        alert('⚠️ الرجاء إدخال عمر صحيح (13 سنة على الأقل)');
        return;
    }
    if (!gender) {
        alert('⚠️ الرجاء اختيار الجنس');
        return;
    }

    // إنشاء بيانات الزائر
    currentUser = {
        name: name,
        age: parseInt(age),
        gender: gender,
        rank: 'Guest',
        isGuest: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=555&color=fff`
    };
    isUserGuest = true;

    // حفظ الجلسة
    saveSession(currentUser, true);

    // إغلاق شاشة الدخول
    closeLoginScreen();
    console.log('✅ Guest logged in:', name);
}

// ==============================================
// 4. حفظ الجلسة في localStorage
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
// 5. استرجاع الجلسة عند إعادة التحميل
// ==============================================
function loadSession() {
    try {
        // جرب العضو أولاً
        const userStr = localStorage.getItem(QAMAR.STORAGE_KEYS.USER);
        if (userStr) {
            currentUser = JSON.parse(userStr);
            isUserGuest = false;
            console.log('✅ Loaded user session:', currentUser.name);
            return currentUser;
        }

        // جرب الزائر
        const guestStr = localStorage.getItem(QAMAR.STORAGE_KEYS.GUEST);
        if (guestStr) {
            currentUser = JSON.parse(guestStr);
            isUserGuest = true;
            console.log('✅ Loaded guest session:', currentUser.name);
            return currentUser;
        }

        return null;
    } catch (e) {
        console.error('❌ Load session error:', e);
        return null;
    }
}

// ==============================================
// 6. إغلاق شاشة الدخول وفتح الشات
// ==============================================
function closeLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const chatContainer = document.getElementById('chat-container');

    if (loginScreen) loginScreen.style.display = 'none';
    if (chatContainer) chatContainer.style.display = 'flex';

    // تحديث البروفايل
    if (typeof updateProfileUI === 'function') {
        updateProfileUI();
    }

    // تحديث اسم المستخدم في الشات
    if (typeof initChatUI === 'function') {
        initChatUI();
    }

    console.log('🚪 Login screen closed');
}

// ==============================================
// 7. تسجيل الخروج
// ==============================================
async function logout() {
    try {
        // إذا Firebase Auth متاح
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            await auth.signOut();
        }
    } catch (e) {
        console.warn('⚠️ Sign out error:', e);
    }

    // مسح الجلسة
    localStorage.removeItem(QAMAR.STORAGE_KEYS.USER);
    localStorage.removeItem(QAMAR.STORAGE_KEYS.GUEST);

    // إعادة تحميل الصفحة
    location.reload();
}

// ==============================================
// 8. التحقق إذا المستخدم هو الملك
// ==============================================
function isKing() {
    if (!currentUser) return false;
    return currentUser.rank === 'King' || currentUser.email === QAMAR.KING_EMAIL;
}

// ==============================================
// 9. إرجاع بيانات المستخدم الحالي
// ==============================================
function getCurrentUser() {
    return currentUser;
}

// ==============================================
// 10. التحقق إذا المستخدم زائر
// ==============================================
function isGuest() {
    return isUserGuest === true;
}

// ==============================================
// 11. التحقق إذا المستخدم مسجل (عضو)
// ==============================================
function isMember() {
    return !isUserGuest && currentUser !== null;
}

// ==============================================
// 12. التحقق من الصلاحيات حسب الرتبة
// ==============================================
function hasPermission(permission) {
    if (!currentUser) return false;
    if (typeof ranksDB === 'undefined') return false;
    const rank = ranksDB[currentUser.rank];
    if (!rank) return false;
    return rank.permissions && rank.permissions.includes(permission);
}

// ==============================================
// 13. تفعيل زر Enter في شاشة الدخول
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    // تفعيل Enter في تبويب العضو
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') memberLogin();
        });
    }

    // تفعيل Enter في تبويب الزائر
    const guestGender = document.getElementById('guest-gender');
    if (guestGender) {
        guestGender.addEventListener('change', () => {
            // لا شيء
        });
    }

    console.log('📦 Auth.js loaded');
});
