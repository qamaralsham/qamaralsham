// ==============================================
// join-queue.js v1 — إنشاء/حذف طلب انضمام
// ==============================================

(function () {
    'use strict';
    if (window.__joinQueueV1) return;
    window.__joinQueueV1 = true;

    /**
     * كتابة طلب معلّق في pending_users/$uid
     * @param {Object} userData — {uid, name, code, age, gender, email, avatar, isGuest, now}
     * @returns {Promise<boolean>}
     */
    async function createPending(userData) {
        if (!userData || !userData.uid) return false;
        try {
            await db.ref('pending_users/' + userData.uid).set({
                uid: userData.uid,
                name: userData.name || 'مجهول',
                code: userData.code || '',
                age: userData.age || 0,
                gender: userData.gender || '',
                email: userData.email || null,
                avatar: userData.avatar || '',
                isGuest: !!userData.isGuest,
                createdAt: userData.now || Date.now(),
                status: 'pending',
                source: userData.isGuest ? 'guest' : 'member'
            });
            console.log('🚪 pending_users: created for', userData.uid.substring(0, 8));
            return true;
        } catch (e) {
            console.warn('join-queue: createPending failed:', e);
            return false;
        }
    }

    /**
     * قراءة طلب معلّق
     */
    async function getPending(uid) {
        if (!uid) return null;
        try {
            var s = await db.ref('pending_users/' + uid).once('value');
            return s.val();
        } catch (e) {
            return null;
        }
    }

    /**
     * حذف طلب (بعد الموافقة أو الرفض)
     */
    async function removePending(uid) {
        if (!uid) return;
        try {
            await db.ref('pending_users/' + uid).remove();
        } catch (e) {}
    }

    /**
     * التحقق من حالة المستخدم:
     * - 'approved' → في allowedUids
     * - 'pending' → في pending_users بـ status pending
     * - 'rejected' → في pending_users بـ status rejected
     * - 'none' → لا شيء (غير مصرح)
     */
    async function checkStatus(uid) {
        if (!uid) return 'none';
        try {
            var allowedSnap = await db.ref('config/allowedUids/' + uid).once('value');
            if (allowedSnap.exists() && allowedSnap.val() === true) return 'approved';

            var pendingSnap = await db.ref('pending_users/' + uid).once('value');
            var p = pendingSnap.val();
            if (p) {
                if (p.status === 'rejected') return 'rejected';
                if (p.status === 'approved') return 'approved';
                return 'pending';
            }
            return 'none';
        } catch (e) {
            console.warn('join-queue: checkStatus failed:', e);
            return 'unknown';
        }
    }

    window.JoinQueue = {
        create: createPending,
        get: getPending,
        remove: removePending,
        checkStatus: checkStatus,
        version: 1
    };

    console.log('📦 join-queue.js v1 loaded');
})();
