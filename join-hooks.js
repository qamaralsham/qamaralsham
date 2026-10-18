// ==============================================
// join-hooks.js v1 — تغليف دوال auth + initChat
// ==============================================

(function () {
    'use strict';
    if (window.__joinHooksV1) return;
    window.__joinHooksV1 = true;

    var H = {
        hooked: false,
        origInitChat: null,
        origRegisterGuest: null,
        origRegisterMember: null
    };

    async function wrappedRegisterGuest(name, age, gender) {
        if (!H.origRegisterGuest) return { success: false, error: 'registerGuest غير محمّل' };

        if (!name || name.trim().length < 2) return { success: false, error: 'اسم غير صحيح' };
        if (!age || parseInt(age) < 13 || parseInt(age) > 120) return { success: false, error: 'عمر غير صحيح' };
        if (!gender) return { success: false, error: 'اختر الجنس' };

        var trimmedName = name.trim();

        try {
            var ok = await waitForAuth(8000);
            if (!ok) return { success: false, error: 'Firebase لم يجهز' };

            var credential = await auth.signInAnonymously();
            var uid = credential.user.uid;
            var now = Date.now();

            await JoinQueue.create({
                uid: uid, name: trimmedName, code: '',
                age: parseInt(age), gender: gender, email: null,
                avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmedName) + '&background=555&color=fff',
                isGuest: true, now: now
            });

            var nameRes = await reserveName(trimmedName, uid);
            var codeRes = await ensureUniqueCode(trimmedName, uid);

            if (!nameRes.ok) {
                try { await auth.signOut(); } catch (e) {}
                await JoinQueue.remove(uid);
                return { success: false, error: nameRes.reason === 'taken' ? 'الاسم محجوز' : 'فشل الاتصال' };
            }
            if (codeRes.error) {
                try { await auth.signOut(); } catch (e) {}
                await JoinQueue.remove(uid);
                return { success: false, error: 'تعذّر إنشاء كود' };
            }

            var userData = buildNewUserData({
                uid: uid, name: trimmedName, code: codeRes.code,
                age: parseInt(age), gender: gender, email: null,
                isGuest: true, now: now
            });

            await db.ref('pending_users/' + uid).update({
                code: codeRes.code,
                avatar: userData.avatar
            });

            await db.ref('users/' + uid).set(userData);
            await db.ref('user_presence/' + uid).set({ state: 'online', lastChanged: now }).catch(function(){});

            if (typeof currentUser !== 'undefined') currentUser = userData;
            if (typeof isUserGuest !== 'undefined') isUserGuest = true;
            if (typeof saveSession === 'function') saveSession(userData, true);

            return { success: true, user: userData, pending: true };

        } catch (e) {
            try { await auth.signOut(); } catch (err) {}
            return { success: false, error: 'حدث خطأ: ' + (e.message || '') };
        }
    }

    async function wrappedRegisterMember(name, age, gender, email, password) {
        if (!H.origRegisterMember) return { success: false, error: 'registerMember غير محمّل' };

        if (!name || name.trim().length < 2) return { success: false, error: 'اسم غير صحيح' };
        if (!age || parseInt(age) < 13 || parseInt(age) > 120) return { success: false, error: 'عمر غير صحيح' };
        if (!email || !email.includes('@')) return { success: false, error: 'إيميل غير صحيح' };
        if (!password || password.length < 6) return { success: false, error: 'كلمة السر 6 أحرف' };

        var trimmedName = name.trim();

        try {
            var ok = await waitForAuth(8000);
            if (!ok) return { success: false, error: 'Firebase لم يجهز' };

            var cred = await auth.createUserWithEmailAndPassword(email, password);
            var uid = cred.user.uid;
            var now = Date.now();

            await JoinQueue.create({
                uid: uid, name: trimmedName, code: '',
                age: parseInt(age), gender: gender, email: email,
                avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmedName) + '&background=random&color=fff',
                isGuest: false, now: now
            });

            var nameRes = await reserveName(trimmedName, uid);
            var codeRes = await ensureUniqueCode(trimmedName, uid);

            if (!nameRes.ok) {
                try { await cred.user.delete(); } catch (e) {}
                await JoinQueue.remove(uid);
                return { success: false, error: nameRes.reason === 'taken' ? 'الاسم محجوز' : 'فشل الاتصال' };
            }
            if (codeRes.error) {
                try { await cred.user.delete(); } catch (e) {}
                await JoinQueue.remove(uid);
                return { success: false, error: 'تعذّر إنشاء كود' };
            }

            var userData = buildNewUserData({
                uid: uid, name: trimmedName, code: codeRes.code,
                age: parseInt(age), gender: gender, email: email,
                isGuest: false, now: now
            });

            await db.ref('pending_users/' + uid).update({
                code: codeRes.code,
                avatar: userData.avatar
            });

            await db.ref('users/' + uid).set(userData);
            await db.ref('user_presence/' + uid).set({ state: 'online', lastChanged: now }).catch(function(){});

            if (typeof currentUser !== 'undefined') currentUser = userData;
            if (typeof isUserGuest !== 'undefined') isUserGuest = false;
            if (typeof saveSession === 'function') saveSession(userData, false);

            return { success: true, user: userData, pending: true };

        } catch (e) {
            var msg = 'فشل التسجيل';
            if (e.code === 'auth/email-already-in-use') msg = 'الإيميل مستخدم';
            else if (e.code === 'auth/invalid-email') msg = 'إيميل غير صحيح';
            else if (e.code === 'auth/weak-password') msg = 'كلمة سر ضعيفة';
            return { success: false, error: msg };
        }
    }

    // ⭐ هنا التعديل: الملك والإدارة يتجاوزون الفحص
    async function wrappedInitChat() {
        var me = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!me || !me.uid) {
            if (H.origInitChat) return H.origInitChat.apply(this, arguments);
            return;
        }

        var lvl = me.rankLevel || (typeof getRankLevel === 'function' ? getRankLevel(me.rank) : 0);
        
        // تخطي الفحص للملك والمشرفين (90+)
        if (me.rank === 'King' || lvl >= 90) {
            return H.origInitChat ? H.origInitChat.apply(this, arguments) : undefined;
        }

        try {
            var status = await JoinQueue.checkStatus(me.uid);

            if (status === 'approved') {
                return H.origInitChat ? H.origInitChat.apply(this, arguments) : undefined;
            }
            if (status === 'pending') {
                JoinWatcher.showWaiting(me);
                return;
            }
            if (status === 'rejected') {
                var p = await JoinQueue.get(me.uid);
                JoinWatcher.showRejected(p ? p.rejectionReason : '');
                return;
            }
            if (status === 'none') {
                JoinWatcher.showUnauthorized();
                return;
            }
            return H.origInitChat ? H.origInitChat.apply(this, arguments) : undefined;
        } catch (e) {
            return H.origInitChat ? H.origInitChat.apply(this, arguments) : undefined;
        }
    }

    function doHook() {
        if (H.hooked) return true;
        var ready = true;

        if (typeof window.registerGuest === 'function' && !window.registerGuest.__joinHooked) {
            H.origRegisterGuest = window.registerGuest;
            window.registerGuest = wrappedRegisterGuest;
            window.registerGuest.__joinHooked = true;
        } else if (!window.registerGuest) {
            ready = false;
        }

        if (typeof window.registerMember === 'function' && !window.registerMember.__joinHooked) {
            H.origRegisterMember = window.registerMember;
            window.registerMember = wrappedRegisterMember;
            window.registerMember.__joinHooked = true;
        } else if (!window.registerMember) {
            ready = false;
        }

        if (typeof window.initChat === 'function' && !window.initChat.__joinHooked) {
            H.origInitChat = window.initChat;
            window.initChat = wrappedInitChat;
            window.initChat.__joinHooked = true;
            window.initChat.__joinOriginal = true;
        } else if (!window.initChat) {
            ready = false;
        }

        if (ready) {
            H.hooked = true;
            console.log('🚪 join-hooks: all wrapped');
            return true;
        }
        return false;
    }

    window.JoinHooks = {
        install: doHook,
        version: 1
    };

    console.log('📦 join-hooks.js v1 loaded');
})();
