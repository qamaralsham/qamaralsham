// ==============================================
// pm-monitor.js v1 — مراقبة الرسائل الخاصة للملك
// ==============================================
// ✅ يظهر زر 💬 في غرفة الملك — للملك فقط
// ✅ الملكة لا ترى الزر أبداً
// ✅ الملك يرى كل الرسائل حتى المحذوفة
// ✅ يحذف محادثة كاملة
// ✅ بدون أي إشعار للعضو
// ==============================================

(function () {
    'use strict';
    if (window.__pmMonitorV1) return;
    window.__pmMonitorV1 = true;

    function getMe() {
        try {
            return JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || 'null');
        } catch(e) { return null; }
    }

    function isKingOnly() {
        var u = getMe();
        return u && u.rank === 'King';
    }

    function esc(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function(c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function timeAgo(ts) {
        if (!ts) return '';
        var s = Math.floor((Date.now() - ts) / 1000);
        if (s < 60) return 'الآن';
        var m = Math.floor(s / 60); if (m < 60) return 'قبل ' + m + 'د';
        var h = Math.floor(m / 60); if (h < 24) return 'قبل ' + h + 'س';
        return 'قبل ' + Math.floor(h/24) + 'ي';
    }

    var PM = { currentMember: null, currentOther: null };

    /* ════════ زر في هيدر غرفة الملك ════════ */
    function injectButton() {
        if (!isKingOnly()) return;
        var header = document.getElementById('kr-header');
        if (!header) return;
        if (document.getElementById('kr-pm-monitor-btn')) return;

        var btn = document.createElement('button');
        btn.id = 'kr-pm-monitor-btn';
        btn.type = 'button';
        btn.textContent = '💬 المحادثات';
        btn.style.cssText = 'background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;padding:8px 14px;border-radius:10px;font-family:inherit;font-weight:900;font-size:12px;cursor:pointer;margin-right:8px;box-shadow:0 4px 12px rgba(168,85,247,0.4);';
        btn.onclick = openMonitor;

        var exitBtn = document.getElementById('kr-exit-btn');
        if (exitBtn && exitBtn.parentNode) {
            exitBtn.parentNode.insertBefore(btn, exitBtn);
        } else {
            header.appendChild(btn);
        }
        console.log('✅ PM Monitor button injected');
    }

    setInterval(function() {
        var krView = document.getElementById('king-room-view');
        if (krView && krView.classList.contains('active')) {
            injectButton();
        }
    }, 500);

    /* ════════ Modal ════════ */
    function ensureModal() {
        var m = document.getElementById('pm-monitor-modal');
        if (m) return m;

        m = document.createElement('div');
        m.id = 'pm-monitor-modal';
        m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999999;display:none;justify-content:center;align-items:center;direction:rtl;font-family:Cairo,sans-serif;padding:10px;';
        m.innerHTML =
            '<div style="background:#0a0616;border:2px solid #a855f7;border-radius:18px;width:100%;max-width:520px;height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 40px rgba(168,85,247,0.4);">' +
                '<div style="padding:14px;border-bottom:1px solid rgba(168,85,247,0.3);display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1));flex-shrink:0;">' +
                    '<h3 style="color:#c084fc;margin:0;font-size:15px;font-weight:900;">💬 مراقبة المحادثات</h3>' +
                    '<button id="pm-monitor-close" type="button" style="background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.5);color:#ff7777;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;font-weight:900;padding:0;">✕</button>' +
                '</div>' +
                '<div style="padding:10px;border-bottom:1px solid rgba(168,85,247,0.2);flex-shrink:0;">' +
                    '<input type="text" id="pm-monitor-search" placeholder="🔍 بحث بالاسم أو الكود..." style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(168,85,247,0.4);border-radius:10px;color:#fff;font-family:inherit;font-size:13px;outline:none;text-align:right;box-sizing:border-box;">' +
                '</div>' +
                '<div id="pm-monitor-body" style="flex:1;overflow-y:auto;padding:10px;scrollbar-width:thin;scrollbar-color:rgba(168,85,247,0.4) transparent;"></div>' +
            '</div>';
        document.body.appendChild(m);

        m.querySelector('#pm-monitor-close').onclick = closeMonitor;
        m.addEventListener('click', function(e) { if (e.target === m) closeMonitor(); });

        var searchInp = m.querySelector('#pm-monitor-search');
        searchInp.oninput = function() { renderMembersList(this.value.trim()); };

        return m;
    }

    async function openMonitor() {
        if (!isKingOnly()) { if (typeof showToast === 'function') showToast('fa-lock', 'للملك فقط'); return; }
        var m = ensureModal();
        m.style.display = 'flex';
        PM.currentMember = null;
        PM.currentOther = null;
        await renderMembersList('');
    }

    function closeMonitor() {
        var m = document.getElementById('pm-monitor-modal');
        if (m) m.style.display = 'none';
        PM.currentMember = null;
        PM.currentOther = null;
    }

    /* ════════ قائمة الأعضاء ════════ */
    async function renderMembersList(query) {
        var body = document.getElementById('pm-monitor-body');
        if (!body) return;
        body.innerHTML = '<div style="text-align:center;color:#c084fc;padding:30px;font-size:13px;">⏳ جاري التحميل...</div>';

        try {
            var snap = await db.ref('users').limitToLast(500).once('value');
            var all = snap.val() || {};
            var users = Object.keys(all).map(function(uid) {
                var u = all[uid] || {};
                u.uid = uid;
                return u;
            });

            if (query) {
                var q = query.toLowerCase();
                users = users.filter(function(u) {
                    var name = (u.name || '').toLowerCase();
                    var code = (u.code || '').toLowerCase();
                    return name.indexOf(q) !== -1 || code.indexOf(q) !== -1;
                });
            }

            users.sort(function(a, b) { return (b.lastSeen || 0) - (a.lastSeen || 0); });

            body.innerHTML = '';

            var count = document.createElement('div');
            count.style.cssText = 'text-align:center;color:#a855f7;font-size:11px;font-weight:900;padding:6px 0 10px;';
            count.textContent = '👥 ' + users.length + ' عضو';
            body.appendChild(count);

            if (users.length === 0) {
                body.innerHTML += '<div style="text-align:center;color:#666;padding:30px;font-size:12px;">لا يوجد أعضاء</div>';
                return;
            }

            users.forEach(function(u) {
                var row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.2);border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;';
                row.onmouseover = function() { this.style.background = 'rgba(168,85,247,0.15)'; };
                row.onmouseout = function() { this.style.background = 'rgba(168,85,247,0.06)'; };

                var av = document.createElement('img');
                av.src = u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'U') + '&background=333&color=fff';
                av.style.cssText = 'width:38px;height:38px;border-radius:50%;border:2px solid #a855f7;object-fit:cover;flex-shrink:0;';
                av.onerror = function() { this.src = 'https://ui-avatars.com/api/?name=U&background=333&color=fff'; };

                var info = document.createElement('div');
                info.style.cssText = 'flex:1;min-width:0;';
                info.innerHTML = '<div style="color:#fff;font-weight:900;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(u.name || 'مجهول') + '</div>' +
                                 '<div style="color:#888;font-size:10px;margin-top:2px;">' + esc(u.code || '—') + (u.rank ? ' · ' + esc(u.rank) : '') + '</div>';

                row.appendChild(av);
                row.appendChild(info);
                row.onclick = function() { showMemberConversations(u); };
                body.appendChild(row);
            });

        } catch(e) {
            console.error('PM monitor error:', e);
            body.innerHTML = '<div style="text-align:center;color:#ff6666;padding:30px;font-size:12px;">⚠️ فشل التحميل: ' + esc(e.message) + '</div>';
        }
    }

    /* ════════ محادثات عضو ════════ */
    async function showMemberConversations(member) {
        PM.currentMember = member;
        var body = document.getElementById('pm-monitor-body');
        if (!body) return;
        body.innerHTML = '<div style="text-align:center;color:#c084fc;padding:30px;font-size:13px;">⏳ جاري تحميل...</div>';

        try {
            var snap = await db.ref('user_private_messages/' + member.uid).once('value');
            var data = snap.val() || {};

            body.innerHTML = '';

            var backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.textContent = '← رجوع للأعضاء';
            backBtn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:8px 14px;border-radius:8px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;margin-bottom:12px;';
            backBtn.onclick = function() { renderMembersList(''); };
            body.appendChild(backBtn);

            var header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;background:rgba(168,85,247,0.1);border-radius:10px;margin-bottom:12px;';
            header.innerHTML =
                '<img src="' + esc(member.avatar || 'https://ui-avatars.com/api/?name=U&background=333&color=fff') + '" style="width:42px;height:42px;border-radius:50%;border:2px solid #a855f7;object-fit:cover;">' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="color:#fff;font-weight:900;font-size:14px;">' + esc(member.name || 'مجهول') + '</div>' +
                    '<div style="color:#a855f7;font-size:10px;margin-top:2px;">📨 محادثاته الخاصة</div>' +
                '</div>';
            body.appendChild(header);

            var others = Object.keys(data);
            if (others.length === 0) {
                var e = document.createElement('div');
                e.style.cssText = 'text-align:center;color:#666;padding:30px;font-size:12px;';
                e.textContent = 'لا توجد محادثات لهذا العضو';
                body.appendChild(e);
                return;
            }

            for (var i = 0; i < others.length; i++) {
                var otherUid = others[i];
                var msgs = data[otherUid] || {};
                var msgCount = Object.keys(msgs).length;

                var lastTime = 0;
                var lastText = '';
                Object.keys(msgs).forEach(function(k) {
                    var m = msgs[k];
                    if ((m.time || 0) > lastTime) {
                        lastTime = m.time || 0;
                        lastText = m.deleted ? '🗑️ محذوفة' : (m.text || '📎 مرفق');
                    }
                });

                var otherName = 'مجهول';
                var otherAvatar = 'https://ui-avatars.com/api/?name=U&background=333&color=fff';
                try {
                    var uSnap = await db.ref('users/' + otherUid + '/name').once('value');
                    otherName = uSnap.val() || 'مجهول';
                    var avSnap = await db.ref('users/' + otherUid + '/avatar').once('value');
                    otherAvatar = avSnap.val() || otherAvatar;
                } catch(e) {}

                var conv = document.createElement('div');
                conv.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(168,85,247,0.15);border-radius:10px;margin-bottom:8px;cursor:pointer;';

                conv.innerHTML =
                    '<img src="' + esc(otherAvatar) + '" style="width:36px;height:36px;border-radius:50%;border:2px solid #a855f7;object-fit:cover;flex-shrink:0;" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=333&color=fff\'">' +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="color:#fff;font-weight:900;font-size:12px;">' + esc(otherName) + '</div>' +
                        '<div style="color:#888;font-size:10px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(lastText) + '</div>' +
                    '</div>' +
                    '<div style="text-align:left;flex-shrink:0;">' +
                        '<div style="color:#c084fc;font-size:10px;font-weight:900;">' + msgCount + ' رسالة</div>' +
                        '<div style="color:#666;font-size:9px;margin-top:2px;">' + timeAgo(lastTime) + '</div>' +
                    '</div>';

                (function(uid, name, av) {
                    conv.onclick = function() { showConversationMessages(member.uid, member.name, uid, name, av); };
                })(otherUid, otherName, otherAvatar);

                body.appendChild(conv);
            }

        } catch(e) {
            console.error('showMemberConversations error:', e);
            body.innerHTML = '<div style="text-align:center;color:#ff6666;padding:30px;font-size:12px;">⚠️ ' + esc(e.message) + '</div>';
        }
    }

    /* ════════ رسائل محادثة كاملة ════════ */
    async function showConversationMessages(memberUid, memberName, otherUid, otherName, otherAvatar) {
        PM.currentOther = { uid: otherUid, name: otherName };
        var body = document.getElementById('pm-monitor-body');
        if (!body) return;
        body.innerHTML = '<div style="text-align:center;color:#c084fc;padding:30px;font-size:13px;">⏳ جاري التحميل...</div>';

        try {
            var snap = await db.ref('user_private_messages/' + memberUid + '/' + otherUid).once('value');
            var msgs = snap.val() || {};

            var arr = Object.keys(msgs).map(function(k) { var m = msgs[k]; m._key = k; return m; })
                .sort(function(a, b) { return (a.time || 0) - (b.time || 0); });

            body.innerHTML = '';

            var backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.textContent = '← رجوع للمحادثات';
            backBtn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid rgba(168,85,247,0.3);color:#c084fc;padding:8px 14px;border-radius:8px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;margin-bottom:12px;';
            backBtn.onclick = function() { showMemberConversations(PM.currentMember); };
            body.appendChild(backBtn);

            var h = document.createElement('div');
            h.style.cssText = 'background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1));padding:12px;border-radius:10px;margin-bottom:12px;text-align:center;';
            h.innerHTML =
                '<div style="color:#fff;font-weight:900;font-size:13px;">' + esc(memberName) + ' ↔ ' + esc(otherName) + '</div>' +
                '<div style="color:#c084fc;font-size:10px;margin-top:4px;">📨 ' + arr.length + ' رسالة</div>';
            body.appendChild(h);

            var delAllBtn = document.createElement('button');
            delAllBtn.type = 'button';
            delAllBtn.textContent = '🗑️ حذف كل المحادثة';
            delAllBtn.style.cssText = 'width:100%;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.5);color:#ff7777;padding:10px;border-radius:10px;font-family:inherit;font-weight:900;font-size:12px;cursor:pointer;margin-bottom:12px;';
            delAllBtn.onclick = async function() {
                if (!confirm('حذف كل محادثات ' + memberName + ' مع ' + otherName + '؟\nلا يمكن التراجع.')) return;
                try {
                    await Promise.all([
                        db.ref('user_private_messages/' + memberUid + '/' + otherUid).remove(),
                        db.ref('user_private_messages/' + otherUid + '/' + memberUid).remove(),
                        db.ref('user_private_chats/' + memberUid + '/' + otherUid).remove().catch(function(){}),
                        db.ref('user_private_chats/' + otherUid + '/' + memberUid).remove().catch(function(){})
                    ]);
                    if (typeof showToast === 'function') showToast('fa-check', '✅ تم الحذف');
                    showMemberConversations(PM.currentMember);
                } catch(e) {
                    alert('فشل: ' + e.message);
                }
            };
            body.appendChild(delAllBtn);

            if (arr.length === 0) {
                var empty = document.createElement('div');
                empty.style.cssText = 'text-align:center;color:#666;padding:20px;font-size:12px;';
                empty.textContent = 'لا توجد رسائل';
                body.appendChild(empty);
                return;
            }

            arr.forEach(function(m) {
                var isDeleted = m.deleted === true;
                var text = isDeleted ? (m.originalText || m.text || '🗑️ [محتوى محذوف]') : m.text;
                var fromMember = m.fromUid === memberUid;

                var msgEl = document.createElement('div');
                msgEl.style.cssText = 'padding:10px 12px;border-radius:10px;margin-bottom:8px;max-width:88%;' +
                    (isDeleted 
                        ? 'background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#ffcccc;' 
                        : (fromMember 
                            ? 'background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;margin-left:auto;'
                            : 'background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.1);'));

                msgEl.innerHTML =
                    '<div style="font-size:9px;opacity:0.75;margin-bottom:4px;font-weight:900;">' +
                        (isDeleted ? '🗑️ ' : '') +
                        esc(fromMember ? memberName : otherName) +
                        ' · ' + new Date(m.time || 0).toLocaleString('ar-EG') +
                    '</div>' +
                    '<div style="font-size:12px;word-break:break-word;line-height:1.5;">' + esc(text || '') + '</div>' +
                    (isDeleted ? '<div style="font-size:9px;color:#ff8888;margin-top:4px;font-weight:900;">⚠️ محذوفة</div>' : '');

                body.appendChild(msgEl);
            });

        } catch(e) {
            console.error('showConversationMessages error:', e);
            body.innerHTML = '<div style="text-align:center;color:#ff6666;padding:30px;font-size:12px;">⚠️ ' + esc(e.message) + '</div>';
        }
    }

    window.PmMonitor = {
        open: openMonitor,
        close: closeMonitor
    };

    console.log('📨 pm-monitor.js v1 loaded — King only, silent');
})();
