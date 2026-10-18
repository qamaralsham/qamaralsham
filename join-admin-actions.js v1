// ==============================================
// join-admin-actions.js v1 — قبول/رفض + استيراد
// ==============================================

(function () {
    'use strict';
    if (window.__joinAdminActionsV1) return;
    window.__joinAdminActionsV1 = true;

    function getMe() {
        try { if (typeof getCurrentUser === 'function') { var u = getCurrentUser(); if (u && u.uid) return u; } } catch (e) {}
        return null;
    }

    function isKing() {
        var u = getMe();
        return !!(u && u.rank === 'King');
    }

    function toast(icon, msg) {
        if (typeof showToast === 'function') showToast(icon, msg);
        else console.log('[join-admin]', msg);
    }

    function logAudit(type, data) {
        try {
            var me = getMe() || {};
            db.ref('audit_log').push(Object.assign({
                type: type,
                byUid: me.uid,
                byName: me.name,
                at: firebase.database.ServerValue.TIMESTAMP
            }, data || {})).catch(function () {});
        } catch (e) {}
    }

    /* ═══ Approve ═══ */
    async function approve(uid) {
        if (!isKing()) { toast('fa-lock', '👑 للملك فقط'); return false; }
        if (!uid) return false;

        try {
            var pendingSnap = await db.ref('pending_users/' + uid).once('value');
            var p = pendingSnap.val();
            var name = p ? p.name : '';

            // 1. أضف إلى allowedUids
            await db.ref('config/allowedUids/' + uid).set(true);

            // 2. حدّث الحالة
            await db.ref('pending_users/' + uid).update({
                status: 'approved',
                approvedAt: Date.now(),
                approvedBy: (getMe() || {}).uid
            });

            // 3. احذف بعد 3 ثواني (نترك الزائر يرى الموافقة)
            setTimeout(function () {
                db.ref('pending_users/' + uid).remove().catch(function () {});
            }, 3000);

            logAudit('join_approved', {
                targetUid: uid,
                targetName: name
            });

            toast('fa-check', '✅ موافقة: ' + name);
            return true;
        } catch (e) {
            console.error('approve error:', e);
            toast('fa-times', '⚠️ فشل: ' + e.message);
            return false;
        }
    }

    /* ═══ Reject ═══ */
    async function reject(uid, reason) {
        if (!isKing()) { toast('fa-lock', '👑 للملك فقط'); return false; }
        if (!uid) return false;

        try {
            var pendingSnap = await db.ref('pending_users/' + uid).once('value');
            var p = pendingSnap.val();
            var name = p ? p.name : '';
            var code = p ? p.code : '';

            // 1. حدّث الحالة (الزائر يرى الرفض فوراً)
            await db.ref('pending_users/' + uid).update({
                status: 'rejected',
                rejectedAt: Date.now(),
                rejectedBy: (getMe() || {}).uid,
                rejectionReason: reason || ''
            });

            // 2. احذف بيانات المستخدم
            await db.ref('users/' + uid).remove().catch(function () {});

            // 3. احذف الاسم والكود المحجوزين
            if (name) db.ref('user_names/' + name).remove().catch(function () {});
            if (code) db.ref('user_codes/' + code).remove().catch(function () {});

            // 4. احذف pending بعد 8 ثواني (وقت كافٍ للزائر ليقرأ)
            setTimeout(function () {
                db.ref('pending_users/' + uid).remove().catch(function () {});
            }, 8000);

            logAudit('join_rejected', {
                targetUid: uid,
                targetName: name,
                reason: reason || ''
            });

            toast('fa-check', '🚫 رفض: ' + name);
            return true;
        } catch (e) {
            console.error('reject error:', e);
            toast('fa-times', '⚠️ فشل: ' + e.message);
            return false;
        }
    }

    /* ═══ Bootstrap: استيراد الأعضاء القدامى ═══ */
    async function importExisting() {
        if (!isKing()) { toast('fa-lock', '👑 للملك فقط'); return false; }

        if (!confirm(
            '📥 استيراد الأعضاء القدامى\n\n' +
            'سيتم إضافة كل مستخدمي `users` (المسجلين قبل تفعيل النظام) إلى قائمة المعتمدين.\n\n' +
            '⚠️ سيستثني:\n' +
            '• من عنده pending_users\n' +
            '• البوتات\n\n' +
            'هل تريد المتابعة؟'
        )) return false;

        toast('fa-spinner', '⏳ جاري الاستيراد...');
        try {
            var usersSnap = await db.ref('users').once('value');
            var allUsers = usersSnap.val() || {};

            var pendingSnap = await db.ref('pending_users').once('value');
            var pendings = pendingSnap.val() || {};

            var toAdd = [];
            Object.keys(allUsers).forEach(function (uid) {
                if (uid.indexOf('bot_') === 0) return; // بوت
                if (pendings[uid]) return; // عنده طلب
                toAdd.push(uid);
            });

            if (toAdd.length === 0) {
                toast('fa-info-circle', 'لا يوجد أعضاء للاستيراد');
                return false;
            }

            if (!confirm('سيتم اعتماد ' + toAdd.length + ' عضواً. متابعة؟')) return false;

            var updates = {};
            toAdd.forEach(function (uid) { updates[uid] = true; });
            await db.ref('config/allowedUids').update(updates);

            logAudit('join_bulk_import', { count: toAdd.length });
            toast('fa-check', '✅ تم اعتماد ' + toAdd.length + ' عضواً');
            return true;
        } catch (e) {
            console.error('import error:', e);
            toast('fa-times', '⚠️ فشل: ' + e.message);
            return false;
        }
    }

    /* ═══ إضافة يدوية بـ UID ═══ */
    async function addByUid(uid) {
        if (!isKing()) { toast('fa-lock', '👑 للملك فقط'); return false; }
        if (!uid) return false;
        try {
            await db.ref('config/allowedUids/' + uid).set(true);
            toast('fa-check', '✅ تم الاعتماد');
            logAudit('join_manual_add', { targetUid: uid });
            return true;
        } catch (e) {
            toast('fa-times', '⚠️ فشل');
            return false;
        }
    }

    /* ═══ إزالة صلاحية ═══ */
    async function revoke(uid) {
        if (!isKing()) { toast('fa-lock', '👑 للملك فقط'); return false; }
        if (!uid) return false;
        try {
            await db.ref('config/allowedUids/' + uid).remove();
            toast('fa-check', '✅ تم السحب');
            logAudit('join_revoked', { targetUid: uid });
            return true;
        } catch (e) {
            toast('fa-times', '⚠️ فشل');
            return false;
        }
    }

    window.JoinAdminActions = {
        approve: approve,
        reject: reject,
        importExisting: importExisting,
        addByUid: addByUid,
        revoke: revoke,
        version: 1
    };

    console.log('📦 join-admin-actions.js v1 loaded');
})();
