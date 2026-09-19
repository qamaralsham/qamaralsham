// ==============================================
// قمر الشام — خاص محسّن (v6)
// القائمة في نص الشاشة + إشعارات للطرف الآخر
// ==============================================

(function () {
    'use strict';
    if (window.__pmEnhancedV6) return;
    window.__pmEnhancedV6 = true;

    var IMGBB_KEY = '80fd32c4ef79b5f25fbcf0893547de4f';
    var PM = { replyingTo: null, lastSendAt: 0, openMenu: null };

    /* CSS */
    (function injectCSS() {
        if (document.getElementById('pm-enhanced-css')) return;
        var s = document.createElement('style');
        s.id = 'pm-enhanced-css';
        s.textContent = `
.pm-plus-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,215,0,0.35);
    color: #ffd700;
    cursor: pointer;
    font-size: 15px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
}
.pm-toolbar {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 10px;
    display: none;
    gap: 8px;
    padding: 10px;
    background: rgba(15,15,25,0.97);
    border: 1px solid rgba(255,215,0,0.5);
    border-radius: 15px;
    z-index: 100;
}
.pm-toolbar.open { display: flex; }
.pm-toolbar button {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,215,0,0.35);
    color: #ffd700;
    cursor: pointer;
    font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
}
.pm-reply-preview {
    display: none;
    padding: 8px 34px 8px 12px;
    background: rgba(255,215,0,0.1);
    border-top: 1px solid rgba(255,215,0,0.3);
    border-right: 3px solid #ffd700;
    font-size: 12px;
    position: relative;
}
.pm-reply-preview.show { display: block; }
.pm-reply-preview .pm-reply-name { color: #ffd700; font-weight: 900; margin-bottom: 3px; font-size: 11px; }
.pm-reply-preview .pm-reply-text { color: #aaa; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pm-reply-preview .pm-reply-close { position: absolute; top: 6px; left: 10px; cursor: pointer; color: #ff6666; font-weight: 900; font-size: 14px; }

.pc-msg { position: relative !important; }
.pc-msg.sent { padding-left: 24px !important; padding-right: 4px !important; }
.pc-msg.received { padding-left: 4px !important; padding-right: 24px !important; }

.pc-msg-reply {
    padding: 4px 8px;
    border-right: 3px solid #ffd700;
    background: rgba(0,0,0,0.35);
    border-radius: 6px;
    font-size: 11px;
    margin-bottom: 4px;
    cursor: pointer;
}
.pc-msg-reply .rname { color: #ffd700; font-weight: 900; display: block; font-size: 10px; }
.pc-msg-reply .rtext { color: #aaa; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pc-msg-attachment img,
.pc-msg-attachment video { max-width: 100%; max-height: 220px; border-radius: 10px; display: block; margin-top: 6px; cursor: pointer; }
.pc-msg-attachment audio { width: 100%; max-width: 220px; margin-top: 6px; }
.pc-msg-reactions { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.pc-reaction {
    background: rgba(255,215,0,0.18);
    border: 1px solid rgba(255,215,0,0.4);
    border-radius: 12px;
    padding: 1px 8px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
}
.pc-reaction.mine { background: rgba(255,215,0,0.5); border-color: #ffd700; }

.pc-msg-menu-btn {
    position: absolute !important;
    top: 4px !important;
    width: 20px !important;
    height: 20px !important;
    border-radius: 50% !important;
    background: rgba(0,0,0,0.6) !important;
    border: 1px solid rgba(255,255,255,0.25) !important;
    color: #fff !important;
    cursor: pointer !important;
    font-size: 12px !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    opacity: 0.6 !important;
    padding: 0 !important;
    line-height: 1 !important;
    z-index: 5 !important;
}
.pc-msg-menu-btn:active { opacity: 1 !important; }
.pc-msg.sent .pc-msg-menu-btn { left: 2px !important; right: auto !important; }
.pc-msg.received .pc-msg-menu-btn { right: 2px !important; left: auto !important; }

.pc-msg-menu {
    position: fixed !important;
    background: rgba(15,15,25,0.98) !important;
    border: 1px solid rgba(255,215,0,0.6) !important;
    border-radius: 12px !important;
    padding: 5px !important;
    z-index: 999999 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
    min-width: 150px !important;
    max-width: 200px !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.95) !important;
}
.pc-msg-menu-item {
    padding: 11px 14px !important;
    border-radius: 7px !important;
    color: #fff !important;
    font-size: 13px !important;
    cursor: pointer !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    white-space: nowrap !important;
    justify-content: flex-start !important;
}
.pc-msg-menu-item:active { background: rgba(255,215,0,0.25) !important; color: #ffd700 !important; }
.pc-msg-menu-item.danger { color: #ff7777 !important; }

.pc-emoji-bar {
    position: fixed !important;
    background: rgba(15,15,25,0.98) !important;
    border: 1px solid rgba(255,215,0,0.55) !important;
    border-radius: 15px !important;
    padding: 8px 12px !important;
    display: flex !important;
    gap: 10px !important;
    z-index: 999999 !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.95) !important;
}
.pc-emoji-bar span { font-size: 24px !important; cursor: pointer !important; }
        `;
        document.head.appendChild(s);
    })();

    function enhanceModal() {
        var modal = document.getElementById('private-chat-modal');
        if (!modal) return false;
        var inputArea = modal.querySelector('.private-chat-input');
        if (!inputArea) return false;

        if (!modal.querySelector('.pm-reply-preview')) {
            var prev = document.createElement('div');
            prev.className = 'pm-reply-preview';
            prev.id = 'pm-reply-preview';
            prev.innerHTML =
                '<span class="pm-reply-close" onclick="pmCancelReply()">✕</span>' +
                '<div class="pm-reply-name" id="pm-reply-name"></div>' +
                '<div class="pm-reply-text" id="pm-reply-text"></div>';
            inputArea.parentNode.insertBefore(prev, inputArea);
        }

        if (!modal.querySelector('.pm-toolbar')) {
            var tb = document.createElement('div');
            tb.className = 'pm-toolbar';
            tb.id = 'pm-toolbar';
            tb.innerHTML =
                '<button onclick="pmPickImage()" title="صورة"><i class="fas fa-image"></i></button>' +
                '<button onclick="pmPickVideo()" title="فيديو"><i class="fas fa-video"></i></button>' +
                '<button onclick="pmPickAudio()" title="صوت"><i class="fas fa-microphone"></i></button>' +
                '<button onclick="pmInsertEmoji()" title="إيموجي"><i class="fas fa-smile"></i></button>' +
                '<button onclick="pmDeleteAllMessages()" title="حذف الكل" style="background:rgba(255,68,68,0.2);color:#ff6666;"><i class="fas fa-trash"></i></button>';
            inputArea.parentNode.insertBefore(tb, inputArea);
        }

        if (!inputArea.querySelector('.pm-plus-btn')) {
            var plus = document.createElement('button');
            plus.className = 'pm-plus-btn';
            plus.innerHTML = '<i class="fas fa-plus"></i>';
            plus.onclick = function (e) { e.preventDefault(); pmToggleToolbar(); };
            inputArea.insertBefore(plus, inputArea.firstChild);
        }

        ['image', 'video', 'audio'].forEach(function (t) {
            var id = 'pm-file-' + t;
            if (document.getElementById(id)) return;
            var fi = document.createElement('input');
            fi.type = 'file';
            fi.id = id;
            fi.accept = t + '/*';
            fi.style.display = 'none';
            fi.onchange = function () { pmHandleFile(this.files[0], t); this.value = ''; };
            document.body.appendChild(fi);
        });

        return true;
    }

    window.displayPrivateMsg = function (msg, isSent) {
        var c = document.getElementById('pc-messages');
        if (!c) return;

        var e = document.createElement('div');
        e.className = 'pc-msg ' + (isSent ? 'sent' : 'received');
        e.setAttribute('data-pm-msg', msg._key || '');

        if (msg.replyTo) {
            var rq = document.createElement('div');
            rq.className = 'pc-msg-reply';
            var rn = document.createElement('div');
            rn.className = 'rname';
            rn.textContent = '↩ ' + (msg.replyTo.senderName || '');
            var rt = document.createElement('div');
            rt.className = 'rtext';
            rt.textContent = msg.replyTo.text || '';
            rq.appendChild(rn);
            rq.appendChild(rt);
            rq.onclick = function () {
                var target = document.querySelector('[data-pm-msg="' + msg.replyTo.id + '"]');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.style.background = 'rgba(255,215,0,0.2)';
                    setTimeout(function () { target.style.background = ''; }, 1500);
                }
            };
            e.appendChild(rq);
        }

        if (msg.deleted) {
            var dt = document.createElement('div');
            dt.textContent = '🚫 محذوفة';
            dt.style.opacity = '0.5';
            dt.style.fontStyle = 'italic';
            e.appendChild(dt);
        } else if (msg.text) {
            var tt = document.createElement('div');
            tt.textContent = msg.text;
            e.appendChild(tt);
        }

        if (msg.attachment && msg.attachment.url && !msg.deleted) {
            var att = document.createElement('div');
            att.className = 'pc-msg-attachment';
            if (msg.attachment.type === 'image') {
                var im = document.createElement('img');
                im.src = msg.attachment.url;
                im.loading = 'lazy';
                im.onclick = function () { window.open(msg.attachment.url, '_blank'); };
                att.appendChild(im);
            } else if (msg.attachment.type === 'video') {
                var vi = document.createElement('video');
                vi.src = msg.attachment.url;
                vi.controls = true;
                att.appendChild(vi);
            } else if (msg.attachment.type === 'audio') {
                var au = document.createElement('audio');
                au.src = msg.attachment.url;
                au.controls = true;
                att.appendChild(au);
            }
            e.appendChild(att);
        }

        if (msg.reactions && Object.keys(msg.reactions).length > 0) {
            var rc = document.createElement('div');
            rc.className = 'pc-msg-reactions';
            var u = getCurrentUser();
            Object.keys(msg.reactions).forEach(function (emoji) {
                var uids = msg.reactions[emoji] || [];
                if (!Array.isArray(uids)) uids = Object.values(uids);
                var b = document.createElement('span');
                b.className = 'pc-reaction';
                if (u && uids.indexOf(u.uid) !== -1) b.classList.add('mine');
                b.textContent = emoji + ' ' + uids.length;
                b.onclick = (function (k, em) { return function () { pmToggleReaction(k, em); }; })(msg._key, emoji);
                rc.appendChild(b);
            });
            e.appendChild(rc);
        }

        var tm = document.createElement('div');
        tm.className = 'pc-msg-time';
        tm.textContent = formatTime(msg.time);
        e.appendChild(tm);

        var mb = document.createElement('button');
        mb.className = 'pc-msg-menu-btn';
        mb.textContent = '⋮';
        mb.onclick = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            pmShowMenu(e, msg, isSent);
        };
        e.appendChild(mb);

        c.appendChild(e);
        c.scrollTop = c.scrollHeight;
    };

    window.loadPrivateMessages = function () {
        if (!ChatState.currentPrivateChat) return;
        if (ChatState.privateMessagesListener) {
            try { ChatState.privateMessagesListener.off(); } catch (e) {}
            ChatState.privateMessagesListener = null;
        }
        var user = getCurrentUser();
        if (!user) return;
        var c = document.getElementById('pc-messages');
        if (c) c.innerHTML = '';

        var o = ChatState.currentPrivateChat.otherUid;
        var ref = db.ref('user_private_messages/' + user.uid + '/' + o).limitToLast(50);
        ChatState.privateMessagesListener = ref;

        ref.on('child_added', function (s) {
            var msg = s.val();
            if (!msg) return;
            msg._key = s.key;
            if (ChatState.seenPrivateMessages.has(s.key)) return;
            ChatState.seenPrivateMessages.add(s.key);
            var isSent = msg.fromUid === user.uid;
            displayPrivateMsg(msg, isSent);
            if (!isSent && !msg.read) {
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + s.key + '/read').set(true).catch(function () {});
                db.ref('user_private_chats/' + user.uid + '/' + o + '/unread').transaction(function (c) {
                    if (c === null || c === undefined) return 0;
                    return Math.max(0, c - 1);
                });
            }
        });

        ref.on('child_changed', function (s) {
            var msg = s.val();
            if (!msg) return;
            msg._key = s.key;
            var old = document.querySelector('[data-pm-msg="' + s.key + '"]');
            if (old) old.remove();
            displayPrivateMsg(msg, msg.fromUid === user.uid);
        });

        ref.on('child_removed', function (s) {
            var el = document.querySelector('[data-pm-msg="' + s.key + '"]');
            if (el) el.remove();
        });
    };

    window.pmStartReply = function (msgId, senderName, text) {
        PM.replyingTo = { id: msgId, name: senderName, text: text };
        var p = document.getElementById('pm-reply-preview');
        var n = document.getElementById('pm-reply-name');
        var t = document.getElementById('pm-reply-text');
        if (p) p.classList.add('show');
        if (n) n.textContent = '↩ ' + senderName;
        if (t) t.textContent = (text || '').substring(0, 60);
        pmCloseAllMenus();
        pmCloseToolbar();
        var inp = document.getElementById('pc-input');
        if (inp) inp.focus();
    };

    window.pmCancelReply = function () {
        PM.replyingTo = null;
        var p = document.getElementById('pm-reply-preview');
        if (p) p.classList.remove('show');
    };

    function positionPopover(popover) {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var popW = popover.offsetWidth || 160;
        var popH = popover.offsetHeight || 180;

        var left = (vw - popW) / 2;
        if (left < 8) left = 8;

        var top = (vh - popH) / 2;
        if (top < 8) top = 8;

        popover.style.position = 'fixed';
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        popover.style.right = 'auto';
        popover.style.bottom = 'auto';
    }

    window.pmShowMenu = function (msgEl, msg, isSent) {
        pmCloseAllMenus();
        var menu = document.createElement('div');
        menu.className = 'pc-msg-menu';

        var react = document.createElement('div');
        react.className = 'pc-msg-menu-item';
        react.textContent = '😊 تفاعل';
        react.onclick = function (e) {
            e.stopPropagation();
            menu.remove();
            pmShowEmojiBar(msgEl, msg._key);
        };
        menu.appendChild(react);

        var reply = document.createElement('div');
        reply.className = 'pc-msg-menu-item';
        reply.textContent = '💬 رد';
        reply.onclick = function (e) {
            e.stopPropagation();
            var sender = isSent ? (getCurrentUser().name || 'أنا') : ChatState.currentPrivateChat.otherName;
            pmStartReply(msg._key, sender, msg.text || '📎 مرفق');
        };
        menu.appendChild(reply);

        if (isSent && !msg.deleted && !msg.attachment) {
            var ed = document.createElement('div');
            ed.className = 'pc-msg-menu-item';
            ed.textContent = '✏️ تعديل';
            ed.onclick = function (e) {
                e.stopPropagation();
                menu.remove();
                pmEditMessage(msg._key, msg.text);
            };
            menu.appendChild(ed);
        }

        if (isSent && !msg.deleted) {
            var dl = document.createElement('div');
            dl.className = 'pc-msg-menu-item danger';
            dl.textContent = '🗑️ حذف';
            dl.onclick = function (e) {
                e.stopPropagation();
                menu.remove();
                pmDeleteMessage(msg._key);
            };
            menu.appendChild(dl);
        }

        menu.style.visibility = 'hidden';
        document.body.appendChild(menu);

        positionPopover(menu);
        menu.style.visibility = '';

        PM.openMenu = menu;

        setTimeout(function () {
            var h = function (ev) {
                if (PM.openMenu && !PM.openMenu.contains(ev.target)) {
                    if (PM.openMenu.parentNode) PM.openMenu.parentNode.removeChild(PM.openMenu);
                    PM.openMenu = null;
                    document.removeEventListener('click', h);
                }
            };
            document.addEventListener('click', h);
        }, 50);
    };

    window.pmShowEmojiBar = function (msgEl, msgKey) {
        pmCloseAllMenus();
        var bar = document.createElement('div');
        bar.className = 'pc-emoji-bar';
        ['👍', '❤️', '😂', '😮', '😢', '🔥'].forEach(function (em) {
            var s = document.createElement('span');
            s.textContent = em;
            s.onclick = function () { pmToggleReaction(msgKey, em); bar.remove(); };
            bar.appendChild(s);
        });
        bar.style.visibility = 'hidden';
        document.body.appendChild(bar);
        positionPopover(bar);
        bar.style.visibility = '';
        PM.openMenu = bar;
    };

    window.pmToggleReaction = async function (msgKey, emoji) {
        var user = getCurrentUser();
        if (!user || !msgKey || !ChatState.currentPrivateChat) return;
        var o = ChatState.currentPrivateChat.otherUid;
        try {
            var ref = db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey + '/reactions/' + emoji);
            var s = await ref.once('value');
            var uids = s.val() || [];
            if (!Array.isArray(uids)) uids = Object.values(uids);
            var i = uids.indexOf(user.uid);
            var newList = (i >= 0) ? uids.filter(function (x) { return x !== user.uid; }) : uids.concat([user.uid]);
            var val = newList.length > 0 ? newList : null;
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey + '/reactions/' + emoji).set(val),
                db.ref('user_private_messages/' + o + '/' + user.uid + '/' + msgKey + '/reactions/' + emoji).set(val)
            ]);
        } catch (e) {}
        pmCloseAllMenus();
    };

    window.pmEditMessage = async function (msgKey, oldText) {
        var nt = prompt('✏️ تعديل:', oldText || '');
        if (nt === null) return;
        nt = nt.trim();
        if (!nt || nt === oldText) return;
        var user = getCurrentUser();
        if (!user || !ChatState.currentPrivateChat) return;
        var o = ChatState.currentPrivateChat.otherUid;
        try {
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey).update({ text: nt, edited: true }),
                db.ref('user_private_messages/' + o + '/' + user.uid + '/' + msgKey).update({ text: nt, edited: true })
            ]);
            if (typeof showToast === 'function') showToast('fa-check', '✅ تم');
        } catch (e) { if (typeof showToast === 'function') showToast('fa-times', '⚠️ فشل'); }
    };

    window.pmDeleteMessage = async function (msgKey) {
        if (!confirm('🗑️ حذف هذه الرسالة؟')) return;
        var user = getCurrentUser();
        if (!user || !ChatState.currentPrivateChat) return;
        var o = ChatState.currentPrivateChat.otherUid;
        try {
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey).update({ deleted: true, text: '' }),
                db.ref('user_private_messages/' + o + '/' + user.uid + '/' + msgKey).update({ deleted: true, text: '' })
            ]);
        } catch (e) {}
    };

    window.pmDeleteAllMessages = async function () {
        if (!confirm('🗑️ حذف كل رسائل هذه المحادثة؟')) return;
        var user = getCurrentUser();
        if (!user || !ChatState.currentPrivateChat) return;
        var o = ChatState.currentPrivateChat.otherUid;
        try {
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o).remove(),
                db.ref('user_private_messages/' + o + '/' + user.uid).remove(),
                db.ref('user_private_chats/' + user.uid + '/' + o).remove(),
                db.ref('user_private_chats/' + o + '/' + user.uid).remove()
            ]);
            if (typeof showToast === 'function') showToast('fa-check', '✅ تم');
            var c = document.getElementById('pc-messages');
            if (c) c.innerHTML = '';
            setTimeout(function () {
                var m = document.getElementById('private-chat-modal');
                if (m) m.classList.remove('open');
                ChatState.currentPrivateChat = null;
            }, 800);
        } catch (e) {}
        pmCloseToolbar();
    };

    window.pmToggleToolbar = function () {
        var t = document.getElementById('pm-toolbar');
        if (t) t.classList.toggle('open');
    };
    window.pmCloseToolbar = function () {
        var t = document.getElementById('pm-toolbar');
        if (t) t.classList.remove('open');
    };
    window.pmPickImage = function () { var i = document.getElementById('pm-file-image'); if (i) i.click(); };
    window.pmPickVideo = function () { var i = document.getElementById('pm-file-video'); if (i) i.click(); };
    window.pmPickAudio = function () { var i = document.getElementById('pm-file-audio'); if (i) i.click(); };

    /* ⭐⭐⭐ دالة مساعدة: إرسال إشعار خاص للطرف الآخر */
    function _notifyPrivateRecipient(recipientUid, senderUser, previewText) {
        if (!recipientUid || !senderUser || !senderUser.uid) return;
        db.ref('user_notifications/' + recipientUid).push({
            fromUid: senderUser.uid,
            fromName: senderUser.name || 'مستخدم',
            fromAvatar: senderUser.avatar || '',
            type: 'private',
            preview: previewText || '',
            time: Date.now(),
            read: false
        }).catch(function (e) { console.warn('notif push failed:', e); });
    }

    window.pmHandleFile = async function (file, type) {
        if (!file) return;
        var maxMb = type === 'video' ? 20 : 5;
        if (file.size / (1024 * 1024) > maxMb) {
            if (typeof showToast === 'function') showToast('fa-exclamation-triangle', '⚠️ الحد ' + maxMb + 'MB');
            return;
        }
        if (typeof showToast === 'function') showToast('fa-spinner', '⏳ جاري الرفع...');
        try {
            var fd = new FormData();
            fd.append('key', IMGBB_KEY);
            fd.append('image', file);
            var r = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
            var d = await r.json();
            if (d.success && d.data && d.data.url) {
                if (typeof showToast === 'function') showToast('fa-check', '✅ تم');
                pmSendWithAttachment(type, d.data.url, file.name);
            }
        } catch (e) {
            if (typeof showToast === 'function') showToast('fa-times', '⚠️ فشل');
        }
    };

    async function pmSendWithAttachment(type, url, name) {
        var user = getCurrentUser();
        if (!user || !ChatState.currentPrivateChat) return;
        var o = ChatState.currentPrivateChat.otherUid;
        var ts = firebase.database.ServerValue.TIMESTAMP;
        var md = {
            fromUid: user.uid, toUid: o, text: '', time: ts, read: false, deleted: false,
            attachment: { type: type, url: url, name: name }
        };
        if (PM.replyingTo) {
            md.replyTo = { id: PM.replyingTo.id, senderName: PM.replyingTo.name, text: (PM.replyingTo.text || '').substring(0, 100) };
        }
        var msgKey = db.ref('user_private_messages/' + user.uid + '/' + o).push().key;
        var previewText = type === 'image' ? '🖼️ صورة' : type === 'video' ? '🎥 فيديو' : '🎵 صوت';
        try {
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey).set(Object.assign({}, md, { read: true })),
                db.ref('user_private_messages/' + o + '/' + user.uid + '/' + msgKey).set(md),
                db.ref('user_private_chats/' + user.uid + '/' + o).update({ otherUid: o, otherName: ChatState.currentPrivateChat.otherName, otherAvatar: ChatState.currentPrivateChat.otherAvatar, lastMessage: previewText, lastTime: Date.now() }),
                db.ref('user_private_chats/' + o + '/' + user.uid).update({ otherUid: user.uid, otherName: user.name, otherAvatar: user.avatar || '', lastMessage: previewText, lastTime: Date.now() })
            ]);
            db.ref('user_private_chats/' + o + '/' + user.uid + '/unread').transaction(function (c) { return (c || 0) + 1; });
            ChatState.seenPrivateMessages.add(msgKey);

            // ⭐⭐⭐ إرسال إشعار للطرف الآخر
            _notifyPrivateRecipient(o, user, previewText);

            pmCancelReply();
            pmCloseToolbar();
        } catch (e) {}
    }

    window.sendPrivateMsg = async function () {
        var i = document.getElementById('pc-input');
        if (!i) return;
        var text = i.value.trim();
        if (!text || !ChatState.currentPrivateChat) return;
        var user = getCurrentUser();
        if (!user || !user.uid) return;
        var now = Date.now();
        if (now - PM.lastSendAt < 2000) return;
        PM.lastSendAt = now;
        var o = ChatState.currentPrivateChat.otherUid;
        var ts = firebase.database.ServerValue.TIMESTAMP;
        var md = { fromUid: user.uid, toUid: o, text: text, time: ts, read: false, deleted: false };
        if (PM.replyingTo) {
            md.replyTo = { id: PM.replyingTo.id, senderName: PM.replyingTo.name, text: (PM.replyingTo.text || '').substring(0, 100) };
        }
        var msgKey = db.ref('user_private_messages/' + user.uid + '/' + o).push().key;
        var previewText = truncate(text, 50);
        try {
            await Promise.all([
                db.ref('user_private_messages/' + user.uid + '/' + o + '/' + msgKey).set(Object.assign({}, md, { read: true })),
                db.ref('user_private_messages/' + o + '/' + user.uid + '/' + msgKey).set(md),
                db.ref('user_private_chats/' + user.uid + '/' + o).update({ otherUid: o, otherName: ChatState.currentPrivateChat.otherName, otherAvatar: ChatState.currentPrivateChat.otherAvatar, lastMessage: previewText, lastTime: Date.now() }),
                db.ref('user_private_chats/' + o + '/' + user.uid).update({ otherUid: user.uid, otherName: user.name, otherAvatar: user.avatar || '', lastMessage: previewText, lastTime: Date.now() })
            ]);
            db.ref('user_private_chats/' + o + '/' + user.uid + '/unread').transaction(function (c) { return (c || 0) + 1; });
            ChatState.seenPrivateMessages.add(msgKey);

            // ⭐⭐⭐ إرسال إشعار للطرف الآخر — هذا كان مفقوداً في v5
            _notifyPrivateRecipient(o, user, previewText);

            i.value = '';
            i.focus();
            pmCancelReply();
        } catch (e) {}
    };

    function pmCloseAllMenus() {
        if (PM.openMenu && PM.openMenu.parentNode) PM.openMenu.parentNode.removeChild(PM.openMenu);
        PM.openMenu = null;
        document.querySelectorAll('.pc-msg-menu, .pc-emoji-bar').forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    }
    window.pmCloseAllMenus = pmCloseAllMenus;

    function installPMObserver() {
        var modal = document.getElementById('private-chat-modal');
        if (!modal) { setTimeout(installPMObserver, 1000); return; }
        enhanceModal();
        var obs = new MutationObserver(function () {
            if (modal.classList.contains('open')) {
                enhanceModal();
                setTimeout(function () { loadPrivateMessages(); }, 100);
            } else {
                pmCloseToolbar();
                pmCancelReply();
                pmCloseAllMenus();
            }
        });
        obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installPMObserver);
    } else {
        installPMObserver();
    }

    console.log('✅ pm-enhanced.js v6 loaded — notifications restored');
})();
