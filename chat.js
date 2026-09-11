// ==============================================
// قمر الشام - منطق الشات الرئيسي (v5)
// Qamar Al Sham - Main Chat Logic v5
// ==============================================

const ChatState = {
    currentRoom: 'general',
    messagesListener: null,
    privateMessagesListener: null,
    notificationsListener: null,
    privateChatsListener: null,
    presenceListener: null,
    currentPrivateChat: null,
    minimizedChat: null,
    replyingTo: null,
    unreadCount: 0,
    unreadPrivate: 0,
    privateChatsCache: {},
    lastMessageTime: 0,
    lastPrivateMessageTime: 0,
    seenMessages: new Set(),
    seenPrivateMessages: new Set(),
    invisibleMode: false,
    isInitialized: false
};

const usersCache = {};
const usersWatchers = {};

// ==============================================
// الأصوات
// ==============================================

function playBirdSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        [0, 0.15, 0.3].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const baseFreq = 2000 + (i * 300);
            osc.frequency.setValueAtTime(baseFreq, now + delay);
            osc.frequency.linearRampToValueAtTime(baseFreq + 800, now + delay + 0.05);
            osc.frequency.linearRampToValueAtTime(baseFreq - 300, now + delay + 0.1);
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.13);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.15);
        });
    } catch(e) {}
}

function playPrivateMsgSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        [0, 0.12].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + (i * 200), now + delay);
            osc.frequency.linearRampToValueAtTime(1200 + (i * 200), now + delay + 0.08);
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.12);
        });
    } catch(e) {}
}

// ==============================================
// التهيئة
// ==============================================

async function initChat() {
    if (ChatState.isInitialized) return;

    const user = getCurrentUser();
    if (!user) return;

    if (typeof auth !== 'undefined' && auth && !auth.currentUser) {
        console.log('⏳ Waiting for auth...');
        await new Promise((resolve) => {
            let resolved = false;
            const unsub = auth.onAuthStateChanged(() => {
                if (resolved) return;
                resolved = true;
                try { unsub(); } catch(e) {}
                resolve();
            });
            setTimeout(() => {
                if (resolved) return;
                resolved = true;
                try { unsub(); } catch(e) {}
                resolve();
            }, 5000);
        });
    }

    ChatState.isInitialized = true;

    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'none';

    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.style.display = 'flex';

    const savedBg = localStorage.getItem(QAMAR.STORAGE_KEYS.BACKGROUND);
    if (savedBg) changeBackground(savedBg);

    if (typeof generateStars === 'function') generateStars();

    buildRoomsList();
    buildBackgroundsList();

    if (!user.isGuest) {
        const upgradeBtn = document.getElementById('upgrade-nav-btn');
        if (upgradeBtn) upgradeBtn.style.display = 'none';
    }

    if (user.rank === 'King' || user.rank === 'Queen') {
        const invisibleBtn = document.getElementById('invisible-btn');
        if (invisibleBtn) invisibleBtn.style.display = 'flex';

        const adminSettings = document.getElementById('admin-settings');
        if (adminSettings) adminSettings.style.display = 'block';
    }

    addSystemMessage(`👑 مرحباً ${user.name} — رتبتك: ${getRankBadge(user.rank)} ${user.rank}`);

    startMessagesListener();
    startNotificationsListener();
    startPrivateChatsListener();
    startPresenceHeartbeat();
    startInvisibleListener();

    watchUser(user.uid);

    if (typeof initBots === 'function') {
        try { initBots(); } catch(e) { console.warn('Bots error:', e); }
    }

    if (typeof hakawatiWelcomeUser === 'function') {
        setTimeout(() => {
            hakawatiWelcomeUser(user).catch(e => console.warn('Welcome error:', e));
        }, 2000);
    }

    console.log('✅ Chat v5 initialized');
}

// ==============================================
// قائمة الغرف
// ==============================================

function buildRoomsList() {
    const list = document.getElementById('rooms-list');
    if (!list) return;
    list.innerHTML = '';

    const user = getCurrentUser();
    if (!user) return;

    const visibleRooms = QAMAR.getVisibleRooms(user);

    Object.values(visibleRooms).forEach(room => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.setAttribute('data-room-id', room.id);

        const icon = document.createElement('span');
        icon.textContent = room.icon;

        const name = document.createElement('span');
        name.textContent = room.name;

        item.appendChild(icon);
        item.appendChild(name);

        if (room.id === ChatState.currentRoom) {
            item.classList.add('active');
        }

        item.onclick = () => switchRoom(room.id, `${room.name} ${room.icon}`, item);
        list.appendChild(item);
    });
}

function buildBackgroundsList() {
    const list = document.getElementById('bg-options');
    if (!list) return;
    list.innerHTML = '';

    QAMAR.BACKGROUNDS.forEach(bg => {
        const btn = document.createElement('button');
        btn.className = 'btn-outline';
        btn.style.cssText = 'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;';
        btn.textContent = bg.id;
        btn.onclick = () => changeBackground(bg.id);
        list.appendChild(btn);
    });
}

function changeBackground(bgId) {
    const container = document.getElementById('chat-container');
    const bg = QAMAR.BACKGROUNDS.find(b => b.id === bgId);
    if (bg && container) {
        QAMAR.BACKGROUNDS.forEach(b => container.classList.remove(b.class));
        container.classList.add(bg.class);
        localStorage.setItem(QAMAR.STORAGE_KEYS.BACKGROUND, bgId);
    }
}

// ==============================================
// تبديل الغرفة
// ==============================================

function switchRoom(roomId, roomTitle, element) {
    const user = getCurrentUser();

    if (!QAMAR.isRoomVisible(roomId, user)) {
        showToast('fa-lock', '🔒 هذه الغرفة غير متاحة لك');
        return;
    }

    if (ChatState.messagesListener) {
        ChatState.messagesListener.off();
        ChatState.messagesListener = null;
    }

    ChatState.seenMessages.clear();
    ChatState.currentRoom = roomId;

    const titleEl = document.getElementById('room-title');
    if (titleEl) titleEl.textContent = roomTitle;

    document.querySelectorAll('.sidebar-item[data-room-id]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-room-id') === roomId);
    });

    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) messagesContainer.innerHTML = '';

    addSystemMessage(`📢 تم فتح ${roomTitle}`);

    updateMicsUI();

    startMessagesListener();
    closeAllPanels();

    setTimeout(() => watchAllVisibleSenders(), 500);

    if (typeof onRoomChanged === 'function') {
        onRoomChanged(roomId);
    }
}

// ==============================================
// مستمع الرسائل
// ==============================================

function startMessagesListener() {
    if (!db) return;

    if (ChatState.messagesListener) {
        ChatState.messagesListener.off();
    }

    const roomId = ChatState.currentRoom;
    const ref = db.ref(`room_messages/${roomId}`).limitToLast(100);
    ChatState.messagesListener = ref;

    ref.on('child_added', (snap) => {
        if (ChatState.seenMessages.has(snap.key)) return;
        ChatState.seenMessages.add(snap.key);

        const msg = snap.val();
        if (!msg) return;

        const user = getCurrentUser();
        if (!user) return;

        if (typeof processIncomingMessage === 'function') {
            processIncomingMessage(msg).catch(e => console.warn('Bot error:', e));
        }

        displayMessage(msg, snap.key);

        if (msg.mentions && msg.mentions.includes(user.name)) {
            playBirdSound();
        }
    });

    ref.on('child_changed', (snap) => {
        const msg = snap.val();
        const el = document.querySelector(`[data-msg-id="${snap.key}"]`);
        if (el && msg) {
            if (msg.deleted) {
                el.classList.add('deleted');
                const textEl = el.querySelector('.message-text');
                if (textEl) textEl.textContent = '🚫 رسالة محذوفة';
            } else if (msg.edited) {
                const textEl = el.querySelector('.message-text');
                if (textEl) textEl.textContent = msg.text;
            }
        }
    });

    ref.on('child_removed', (snap) => {
        const el = document.querySelector(`[data-msg-id="${snap.key}"]`);
        if (el) el.remove();
    });
}

// ==============================================
// عرض الرسالة — ⭐ الزر inline في نهاية النص
// ==============================================

function displayMessage(msg, msgId) {
    const container = document.getElementById('messages');
    if (!container) return;

    const user = getCurrentUser();
    const isBot = msg.isBot === true;

    const msgEl = document.createElement('div');
    msgEl.className = 'message' + (isBot ? ' bot' : '');
    msgEl.setAttribute('data-msg-id', msgId);
    msgEl.setAttribute('data-sender', msg.senderName);
    msgEl.setAttribute('data-sender-uid', msg.senderUid || '');

    const isMentioned = msg.mentions && msg.mentions.includes(user?.name);
    if (isMentioned) msgEl.classList.add('highlighted');

    // ===== الأفاتار =====
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'message-avatar-wrapper';

    const avatarImg = document.createElement('img');
    avatarImg.className = 'message-avatar';
    avatarImg.src = msg.senderAvatar || getDefaultAvatar(msg.senderName);
    avatarImg.alt = msg.senderName;
    avatarImg.loading = 'lazy';
    avatarImg.onerror = () => { avatarImg.src = getDefaultAvatar(msg.senderName); };

    avatarImg.onclick = () => {
        if (isBot || (msg.senderUid && msg.senderUid.startsWith('bot_'))) {
            openBotProfile(msg.senderUid);
        } else {
            openUserProfile(msg.senderUid, msg.senderName);
        }
    };
    avatarWrapper.appendChild(avatarImg);

    const content = document.createElement('div');
    content.className = 'message-content';

    const header = document.createElement('div');
    header.className = 'message-header';

    const username = document.createElement('div');
    username.className = 'message-username';

    let displayName = msg.senderName || 'مجهول';
    if (msg.senderEmoji) displayName += ' ' + msg.senderEmoji;
    username.textContent = displayName;

    if (msg.senderGradient && Array.isArray(msg.senderGradient) && msg.senderGradient.length >= 2) {
        username.style.background = `linear-gradient(90deg, ${msg.senderGradient[0]}, ${msg.senderGradient[1]}, ${msg.senderGradient[0]})`;
        username.style.backgroundSize = '200% 200%';
        username.style.webkitBackgroundClip = 'text';
        username.style.backgroundClip = 'text';
        username.style.webkitTextFillColor = 'transparent';
        username.style.animation = 'nameGradientMove 3s linear infinite';
    } else {
        username.style.color = msg.senderColor || '#ffd700';
    }

    if (msg.senderGlow && msg.senderGlow !== 'none') {
        if (msg.senderGlow === 'soft') username.style.filter = 'drop-shadow(0 0 8px currentColor)';
        else if (msg.senderGlow === 'medium') username.style.filter = 'drop-shadow(0 0 15px currentColor)';
        else if (msg.senderGlow === 'strong') username.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
    }

    if (!isBot) {
        username.onclick = () => insertMention(msg.senderName);
    }

    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(msg.time);

    const optBtn = document.createElement('button');
    optBtn.className = 'message-options-btn';
    optBtn.textContent = '⋮';
    optBtn.onclick = (e) => {
        e.stopPropagation();
        if (isBot) return;
        showMessageMenu(msgEl, msg.senderName, msg.text, msgId);
    };

    header.appendChild(username);
    header.appendChild(timeEl);
    // ⚠️ لا نضيف الزر هنا — سيُضاف بعد النص

    // ===== النص + الزر inline =====
    const msgText = document.createElement('div');
    msgText.className = 'message-text';

    if (msg.deleted) {
        msgText.textContent = '🚫 رسالة محذوفة';
        msgEl.classList.add('deleted');
    } else {
        if (msg.mentions && msg.mentions.length > 0) {
            const frag = buildMentionHTML(msg.text, msg.mentions, insertMention);
            msgText.appendChild(frag);
        } else {
            msgText.textContent = msg.text || '';
        }

        // ⭐ الزر inline بعد النص مباشرة
        if (!isBot) {
            msgText.appendChild(document.createTextNode('\u00A0')); // مسافة
            msgText.appendChild(optBtn);
        }
    }

    content.appendChild(header);
    content.appendChild(msgText);

    // ===== المرفقات =====
    if (msg.attachment && !msg.deleted) {
        const attachmentEl = buildAttachmentElement(msg.attachment);
        if (attachmentEl) content.appendChild(attachmentEl);
    }

    // ===== الرد =====
    if (msg.replyTo) {
        const quote = document.createElement('div');
        quote.className = 'reply-quote';

        const nameEl = document.createElement('div');
        nameEl.className = 'reply-name';
        nameEl.textContent = '↩ ' + (msg.replyTo.senderName || '');

        const textEl = document.createElement('div');
        textEl.className = 'reply-text';
        textEl.textContent = truncate(msg.replyTo.text || '', 80);

        quote.appendChild(nameEl);
        quote.appendChild(textEl);

        quote.onclick = () => {
            const original = document.querySelector(`[data-msg-id="${msg.replyTo.id}"]`);
            if (original) {
                original.scrollIntoView({ behavior: 'smooth', block: 'center' });
                original.classList.add('highlighted');
                setTimeout(() => original.classList.remove('highlighted'), 3000);
            }
        };

        content.appendChild(quote);
    }

    // ===== التفاعلات =====
    const reactions = document.createElement('div');
    reactions.className = 'message-reactions';
    if (msg.reactions) {
        Object.entries(msg.reactions).forEach(([emoji, uids]) => {
            const badge = document.createElement('span');
            badge.className = 'reaction-badge';
            if (Array.isArray(uids) && uids.includes(user?.uid)) {
                badge.classList.add('mine');
            }
            badge.textContent = `${emoji} ${Array.isArray(uids) ? uids.length : 0}`;
            badge.onclick = () => toggleReaction(msgId, emoji);
            reactions.appendChild(badge);
        });
    }
    content.appendChild(reactions);

    msgEl.appendChild(avatarWrapper);
    msgEl.appendChild(content);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;

    if (msg.senderUid && !msg.senderUid.startsWith('bot_')) {
        watchUser(msg.senderUid);
    }
}

// ==============================================
// المرفقات
// ==============================================

function buildAttachmentElement(attachment) {
    if (!attachment || !attachment.url) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'message-attachment';

    const type = attachment.type;
    const url = attachment.url;

    if (type === 'image' || type === 'gif') {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'صورة';
        img.loading = 'lazy';
        img.onclick = () => window.open(url, '_blank');
        wrapper.appendChild(img);
    } else if (type === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;
        wrapper.appendChild(audio);
    } else if (type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.src = url;
        wrapper.appendChild(video);
    } else {
        return null;
    }

    return wrapper;
}

// ==============================================
// إرسال رسالة
// ==============================================

function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input) return;

    const text = input.value.trim();
    const user = getCurrentUser();

    if (!text || !user) return;

    const now = Date.now();
    if (now - ChatState.lastMessageTime < QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS) {
        const remaining = Math.ceil((QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS - (now - ChatState.lastMessageTime)) / 1000);
        showToast('fa-hourglass-half', `⏳ انتظر ${remaining} ثانية`);
        return;
    }

    if (text.length > QAMAR.RATE_LIMIT.MAX_MESSAGE_LENGTH) {
        showToast('fa-exclamation-triangle', '⚠️ الرسالة طويلة جداً');
        return;
    }

    if (isLink(text)) {
        showToast('fa-ban', '🚫 يحظر نشر الروابط');
        return;
    }

    ChatState.lastMessageTime = now;

    if (text.startsWith('!') && typeof handleBotCommand === 'function') {
        handleBotCommand(text);
        input.value = '';
        return;
    }

    const mentions = extractMentions(text);

    const messageData = {
        senderUid: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        senderColor: user.color || '#ffd700',
        senderRank: user.rank,
        senderFrame: user.avatarFrame || 'none',
        senderGradient: user.nameGradient || null,
        senderGlow: user.nameGlow || null,
        senderEmoji: user.nameEmoji || null,
        text: text,
        mentions: mentions,
        replyTo: ChatState.replyingTo,
        time: firebase.database.ServerValue.TIMESTAMP,
        edited: false,
        deleted: false
    };

    const msgRef = db.ref(`room_messages/${ChatState.currentRoom}`).push();
    msgRef.set(messageData).catch(err => {
        console.error('Send error:', err);
        showToast('fa-exclamation-circle', '⚠️ فشل الإرسال');
    });

    if (mentions.length > 0) {
        notifyMentions(mentions, text);
    }

    cancelReply();
    input.value = '';
    input.focus();
}

function notifyMentions(mentions, text) {
    const user = getCurrentUser();
    if (!user) return;

    mentions.forEach(async (name) => {
        if (name === user.name) return;

        try {
            const nameSnap = await db.ref('user_names/' + name).once('value');
            const targetUid = nameSnap.val();

            if (targetUid) {
                const notifRef = db.ref(`user_notifications/${targetUid}`).push();
                notifRef.set({
                    fromUid: user.uid,
                    fromName: user.name,
                    fromAvatar: user.avatar || '',
                    type: 'mention',
                    roomId: ChatState.currentRoom,
                    preview: truncate(text, 80),
                    time: firebase.database.ServerValue.TIMESTAMP,
                    read: false
                });
            }
        } catch(e) {
            console.warn('Notify mention error:', e);
        }
    });
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// ==============================================
// الرد
// ==============================================

function startReply(sender, text, msgId) {
    ChatState.replyingTo = {
        id: msgId,
        senderName: sender,
        text: truncate(text, 100)
    };

    const nameEl = document.getElementById('reply-name');
    const textEl = document.getElementById('reply-text-preview');
    const preview = document.getElementById('reply-preview');

    if (nameEl) nameEl.textContent = sender;
    if (textEl) textEl.textContent = truncate(text, 60);
    if (preview) preview.classList.add('show');

    const input = document.getElementById('message-input');
    if (input) input.focus();

    closeAllMenus();
}

function cancelReply() {
    ChatState.replyingTo = null;
    const preview = document.getElementById('reply-preview');
    if (preview) preview.classList.remove('show');
}

// ==============================================
// المنشن
// ==============================================

function insertMention(name) {
    const input = document.getElementById('message-input');
    if (!input) return;

    const currentValue = input.value;
    const spaceNeeded = currentValue.length > 0 && !currentValue.endsWith(' ') ? ' ' : '';
    input.value = currentValue + spaceNeeded + '@' + name + ' ';
    input.focus();

    closeAllMenus();
}

// ==============================================
// قائمة الرسالة — موضع دقيق تحت الزر
// ==============================================

function showMessageMenu(msgEl, sender, text, msgId) {
    closeAllMenus();

    const user = getCurrentUser();
    if (!user) return;

    const isOwner = sender === user.name;
    const canDelete = isOwner || can(user, 'canDeleteAnyMessage');

    const btn = msgEl.querySelector('.message-options-btn');
    if (!btn) return;

    const menu = document.createElement('div');
    menu.className = 'message-menu open';

    // تفاعل
    const reactItem = document.createElement('div');
    reactItem.className = 'message-menu-item';
    reactItem.textContent = '😊 تفاعل';
    reactItem.onclick = (e) => {
        e.stopPropagation();
        menu.remove();
        showEmojiBar(msgEl, msgId, btn);
    };
    menu.appendChild(reactItem);

    // رد
    const replyItem = document.createElement('div');
    replyItem.className = 'message-menu-item';
    replyItem.textContent = '💬 رد';
    replyItem.onclick = (e) => {
        e.stopPropagation();
        startReply(sender, text, msgId);
    };
    menu.appendChild(replyItem);

    // تعديل
    if (isOwner && msgId) {
        const editItem = document.createElement('div');
        editItem.className = 'message-menu-item';
        editItem.textContent = '✏️ تعديل';
        editItem.onclick = (e) => {
            e.stopPropagation();
            editMessage(msgEl, msgId);
        };
        menu.appendChild(editItem);
    }

    // حذف
    if (canDelete && msgId) {
        const delItem = document.createElement('div');
        delItem.className = 'message-menu-item danger';
        delItem.textContent = '🗑️ حذف';
        delItem.onclick = (e) => {
            e.stopPropagation();
            deleteMessage(msgEl, msgId);
        };
        menu.appendChild(delItem);
    }

    // ⭐ أضف للـ body لحساب الحجم
    document.body.appendChild(menu);

    const btnRect = btn.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // موضع: أسفل الزر مباشرة، محاذاة لمركز الزر
    let top = btnRect.bottom + 6;
    let left = btnRect.left + (btnRect.width / 2) - (menuRect.width / 2);

    // منع الخروج من الشاشة
    if (left + menuRect.width > window.innerWidth - 10) {
        left = window.innerWidth - menuRect.width - 10;
    }
    if (left < 10) left = 10;

    // إذا القائمة ستخرج أسفل الشاشة → افتحها فوق الزر
    if (top + menuRect.height > window.innerHeight - 10) {
        top = btnRect.top - menuRect.height - 6;
        if (top < 10) top = 10;
    }

    menu.style.position = 'fixed';
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';
    menu.style.zIndex = '9999';

    setTimeout(() => {
        const closeHandler = (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

function showEmojiBar(msgEl, msgId, btn) {
    closeAllMenus();

    const bar = document.createElement('div');
    bar.className = 'emoji-bar open';

    ['👍', '❤️', '😂', '😮', '😢'].forEach(emoji => {
        const span = document.createElement('span');
        span.className = 'emoji-quick';
        span.textContent = emoji;
        span.onclick = () => {
            toggleReaction(msgId, emoji);
            bar.remove();
        };
        bar.appendChild(span);
    });

    const plus = document.createElement('button');
    plus.className = 'emoji-plus';
    plus.textContent = '+';
    plus.onclick = () => {
        const custom = prompt('🎨 اكتب إيموجي:', '🎉');
        if (custom) {
            toggleReaction(msgId, custom);
            bar.remove();
        }
    };
    bar.appendChild(plus);

    document.body.appendChild(bar);

    const btnRect = btn.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();

    let top = btnRect.bottom + 6;
    let left = btnRect.left + (btnRect.width / 2) - (barRect.width / 2);

    if (left + barRect.width > window.innerWidth - 10) {
        left = window.innerWidth - barRect.width - 10;
    }
    if (left < 10) left = 10;

    if (top + barRect.height > window.innerHeight - 10) {
        top = btnRect.top - barRect.height - 6;
        if (top < 10) top = 10;
    }

    bar.style.position = 'fixed';
    bar.style.top = top + 'px';
    bar.style.left = left + 'px';
    bar.style.right = 'auto';
    bar.style.bottom = 'auto';
    bar.style.zIndex = '9999';

    setTimeout(() => {
        const closeHandler = (e) => {
            if (!bar.contains(e.target)) {
                bar.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

function closeAllMenus() {
    document.querySelectorAll('.message-menu, .emoji-bar').forEach(el => el.remove());
}

// ==============================================
// التفاعلات
// ==============================================

async function toggleReaction(msgId, emoji) {
    const user = getCurrentUser();
    if (!user || !msgId) return;

    try {
        const ref = db.ref(`room_messages/${ChatState.currentRoom}/${msgId}/reactions/${emoji}`);
        const snap = await ref.once('value');
        const uids = snap.val() || [];

        const index = Array.isArray(uids) ? uids.indexOf(user.uid) : -1;

        if (index >= 0) {
            uids.splice(index, 1);
            if (uids.length === 0) {
                await ref.remove();
            } else {
                await ref.set(uids);
            }
        } else {
            const newUids = Array.isArray(uids) ? [...uids, user.uid] : [user.uid];
            await ref.set(newUids);
        }
    } catch(e) {
        console.warn('Reaction error:', e);
    }

    closeAllMenus();
}

async function editMessage(msgEl, msgId) {
    const msgText = msgEl.querySelector('.message-text');
    if (!msgText) return;

    const currentText = msgText.textContent.replace('⋮', '').trim();
    const newText = prompt('✏️ تعديل الرسالة:', currentText);

    if (newText && newText.trim() && newText !== currentText) {
        try {
            await db.ref(`room_messages/${ChatState.currentRoom}/${msgId}`).update({
                text: newText.trim(),
                edited: true
            });
        } catch(e) {
            showToast('fa-exclamation-circle', '⚠️ فشل التعديل');
        }
    }

    closeAllMenus();
}

async function deleteMessage(msgEl, msgId) {
    if (!msgId) return;
    if (!confirm('🗑️ حذف الرسالة؟')) return;

    try {
        await db.ref(`room_messages/${ChatState.currentRoom}/${msgId}`).update({
            deleted: true,
            text: ''
        });
    } catch(e) {
        showToast('fa-exclamation-circle', '⚠️ فشل الحذف');
    }

    closeAllMenus();
}// ==============================================
// الرسائل الخاصة
// ==============================================

function togglePrivateMessages() {
    const sidebar = document.getElementById('pm-sidebar');
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('open');

    ['rooms-sidebar', 'notif-sidebar', 'settings-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('show', isOpen);

    if (isOpen) {
        loadPrivateChatsList();
        ChatState.unreadPrivate = 0;
        updatePMBadge();
    }
}

function startPrivateChatsListener() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    if (ChatState.privateChatsListener) {
        ChatState.privateChatsListener.off();
    }

    const ref = db.ref(`user_private_chats/${user.uid}`);
    ChatState.privateChatsListener = ref;

    ref.on('value', (snap) => {
        const chats = snap.val() || {};
        ChatState.privateChatsCache = chats;

        let unreadCount = 0;
        Object.values(chats).forEach(chat => {
            unreadCount += chat.unread || 0;
        });

        ChatState.unreadPrivate = unreadCount;
        updatePMBadge();
    });
}

function loadPrivateChatsList() {
    const list = document.getElementById('pm-list');
    if (!list) return;
    list.innerHTML = '';

    const chats = Object.values(ChatState.privateChatsCache || {});

    if (chats.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:var(--text-dim);font-size:12px;padding:20px;';
        empty.textContent = 'لا توجد محادثات';
        list.appendChild(empty);
        return;
    }

    chats.sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';

        const img = document.createElement('img');
        img.src = chat.otherAvatar || getDefaultAvatar(chat.otherName);
        img.style.cssText = 'width:36px;height:36px;border-radius:50%;border:2px solid var(--gold);object-fit:cover;';

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;';

        const name = document.createElement('div');
        name.style.cssText = 'color:#fff;font-weight:900;font-size:13px;';
        name.textContent = chat.otherName || 'مستخدم';

        const last = document.createElement('div');
        last.style.cssText = 'color:var(--text-dim);font-size:11px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        last.textContent = chat.lastMessage || '';

        info.appendChild(name);
        info.appendChild(last);

        item.appendChild(img);
        item.appendChild(info);

        if (chat.unread > 0) {
            const badge = document.createElement('span');
            badge.style.cssText = 'background:#ff4444;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:10px;display:flex;justify-content:center;align-items:center;padding:0 4px;font-weight:900;';
            badge.textContent = chat.unread > 9 ? '9+' : chat.unread;
            item.appendChild(badge);
        }

        item.onclick = () => {
            closeAllPanels();
            openPrivateChatWith(chat.otherUid, chat.otherName, chat.otherAvatar);
        };

        list.appendChild(item);
    });
}

function updatePMBadge() {
    const badge = document.getElementById('pm-badge');
    if (!badge) return;

    if (ChatState.unreadPrivate > 0) {
        badge.textContent = ChatState.unreadPrivate > 9 ? '9+' : ChatState.unreadPrivate;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function openPrivateChatWith(otherUid, otherName, otherAvatar) {
    const user = getCurrentUser();
    if (!user || !user.uid) {
        showToast('fa-user', 'يجب تسجيل الدخول');
        return;
    }

    if (otherUid === user.uid) return;

    ChatState.currentPrivateChat = {
        otherUid: otherUid,
        otherName: otherName || 'مستخدم',
        otherAvatar: otherAvatar || getDefaultAvatar(otherName)
    };

    const avatarEl = document.getElementById('pc-avatar');
    const nameEl = document.getElementById('pc-name');
    const statusEl = document.getElementById('pc-status');
    const modal = document.getElementById('private-chat-modal');

    if (avatarEl) avatarEl.src = ChatState.currentPrivateChat.otherAvatar;
    if (nameEl) nameEl.textContent = ChatState.currentPrivateChat.otherName;
    if (statusEl) statusEl.textContent = 'نشط';
    if (modal) modal.classList.add('open');

    const minimized = document.getElementById('minimized-chat-avatar');
    if (minimized) minimized.classList.remove('show');
    ChatState.minimizedChat = null;

    ChatState.seenPrivateMessages.clear();

    loadPrivateMessages();
}

function loadPrivateMessages() {
    if (!ChatState.currentPrivateChat) return;

    if (ChatState.privateMessagesListener) {
        ChatState.privateMessagesListener.off();
    }

    const user = getCurrentUser();
    const container = document.getElementById('pc-messages');
    if (container) container.innerHTML = '';

    const otherUid = ChatState.currentPrivateChat.otherUid;
    const ref = db.ref(`user_private_messages/${user.uid}/${otherUid}`).limitToLast(50);
    ChatState.privateMessagesListener = ref;

    ref.on('child_added', (snap) => {
        if (ChatState.seenPrivateMessages.has(snap.key)) return;
        ChatState.seenPrivateMessages.add(snap.key);

        const msg = snap.val();
        if (!msg) return;

        const isSent = msg.fromUid === user.uid;
        displayPrivateMsg(msg, isSent);

        if (!isSent && !msg.read) {
            db.ref(`user_private_messages/${user.uid}/${otherUid}/${snap.key}/read`).set(true).catch(() => {});

            db.ref(`user_private_chats/${user.uid}/${otherUid}/unread`).transaction(count => {
                return Math.max(0, (count || 1) - 1);
            });
        }
    });
}

function displayPrivateMsg(msg, isSent) {
    const container = document.getElementById('pc-messages');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'pc-msg ' + (isSent ? 'sent' : 'received');

    if (msg.deleted) {
        msgEl.textContent = '🚫 رسالة محذوفة';
        msgEl.style.opacity = '0.5';
        msgEl.style.fontStyle = 'italic';
    } else {
        const textNode = document.createTextNode(msg.text || '');
        msgEl.appendChild(textNode);
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'pc-msg-time';
    timeEl.textContent = formatTime(msg.time);
    msgEl.appendChild(timeEl);

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

async function sendPrivateMsg() {
    const input = document.getElementById('pc-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text || !ChatState.currentPrivateChat) return;

    const user = getCurrentUser();
    if (!user || !user.uid) return;

    const now = Date.now();
    if (now - ChatState.lastPrivateMessageTime < QAMAR.RATE_LIMIT.PRIVATE_MESSAGE_INTERVAL_MS) {
        const remaining = Math.ceil((QAMAR.RATE_LIMIT.PRIVATE_MESSAGE_INTERVAL_MS - (now - ChatState.lastPrivateMessageTime)) / 1000);
        showToast('fa-hourglass-half', `⏳ انتظر ${remaining} ثانية`);
        return;
    }

    if (text.length > QAMAR.RATE_LIMIT.MAX_MESSAGE_LENGTH) {
        showToast('fa-exclamation-triangle', '⚠️ الرسالة طويلة جداً');
        return;
    }

    ChatState.lastPrivateMessageTime = now;

    const otherUid = ChatState.currentPrivateChat.otherUid;
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    const messageData = {
        fromUid: user.uid,
        toUid: otherUid,
        text: text,
        time: timestamp,
        read: false,
        deleted: false
    };

    try {
        const myMsgRef = db.ref(`user_private_messages/${user.uid}/${otherUid}`).push();
        await myMsgRef.set({ ...messageData, read: true });

        const theirMsgRef = db.ref(`user_private_messages/${otherUid}/${user.uid}`).push();
        await theirMsgRef.set(messageData);

        const chatId = [user.uid, otherUid].sort().join('_');
        const archiveRef = db.ref(`king_archive/${chatId}`).push();
        await archiveRef.set({
            fromUid: user.uid,
            toUid: otherUid,
            text: text,
            time: Date.now(),
            deleted: false
        });

        await db.ref(`user_private_chats/${user.uid}/${otherUid}`).update({
            otherUid: otherUid,
            otherName: ChatState.currentPrivateChat.otherName,
            otherAvatar: ChatState.currentPrivateChat.otherAvatar,
            lastMessage: truncate(text, 50),
            lastTime: Date.now()
        });

        await db.ref(`user_private_chats/${otherUid}/${user.uid}`).update({
            otherUid: user.uid,
            otherName: user.name,
            otherAvatar: user.avatar || '',
            lastMessage: truncate(text, 50),
            lastTime: Date.now()
        });

        db.ref(`user_private_chats/${otherUid}/${user.uid}/unread`).transaction(c => (c || 0) + 1);

        ChatState.seenPrivateMessages.add(myMsgRef.key);

        const notifRef = db.ref(`user_notifications/${otherUid}`).push();
        notifRef.set({
            fromUid: user.uid,
            fromName: user.name,
            fromAvatar: user.avatar || '',
            type: 'private',
            preview: truncate(text, 80),
            time: firebase.database.ServerValue.TIMESTAMP,
            read: false
        });

        input.value = '';
        input.focus();
    } catch(e) {
        console.error('Private send error:', e);
        showToast('fa-exclamation-circle', '⚠️ فشل الإرسال');
    }
}

// ==============================================
// الإشعارات
// ==============================================

function toggleNotifications() {
    const sidebar = document.getElementById('notif-sidebar');
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('open');

    ['rooms-sidebar', 'settings-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('show', isOpen);

    if (isOpen) {
        loadNotifications();
        ChatState.unreadCount = 0;
        updateNotifBadge();
        markAllNotificationsRead();
    }
}

function startNotificationsListener() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    if (ChatState.notificationsListener) {
        ChatState.notificationsListener.off();
    }

    const ref = db.ref(`user_notifications/${user.uid}`).limitToLast(20);
    ChatState.notificationsListener = ref;

    ref.on('child_added', (snap) => {
        const notif = snap.val();
        if (!notif) return;

        const age = Date.now() - (notif.time || 0);
        const isRecent = age < 30000;

        if (isRecent && !notif.read) {
            if (notif.type === 'mention') {
                playBirdSound();
            } else if (notif.type === 'private') {
                playPrivateMsgSound();
            }

            if (notif.type === 'mention') {
                showToast('fa-bell', `🔔 ${notif.fromName} أشار إليك`);
            }

            ChatState.unreadCount++;
            updateNotifBadge();
        }
    });
}

function loadNotifications() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    const list = document.getElementById('notif-list');
    if (!list) return;
    list.innerHTML = '';

    db.ref(`user_notifications/${user.uid}`).limitToLast(50).once('value', (snap) => {
        const notifs = [];
        snap.forEach(child => {
            notifs.push({ id: child.key, ...child.val() });
        });
        notifs.reverse();

        if (notifs.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'text-align:center;color:var(--text-dim);font-size:12px;padding:20px;';
            empty.textContent = 'لا توجد إشعارات';
            list.appendChild(empty);
            return;
        }

        notifs.forEach(notif => {
            list.appendChild(buildNotificationElement(notif));
        });
    });
}

function buildNotificationElement(notif) {
    const item = document.createElement('div');
    item.className = 'notif-item';
    if (!notif.read) item.classList.add('unread');

    const img = document.createElement('img');
    img.src = notif.fromAvatar || getDefaultAvatar(notif.fromName);
    img.style.cssText = 'width:32px;height:32px;border-radius:50%;border:1px solid var(--gold);flex-shrink:0;';

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';

    const name = document.createElement('div');
    name.style.cssText = 'color:var(--gold);font-weight:900;font-size:12px;';
    name.textContent = notif.fromName || '';

    const text = document.createElement('div');
    text.style.cssText = 'color:var(--text-dim);font-size:11px;margin-top:2px;word-break:break-word;';

    if (notif.type === 'mention') {
        const room = QAMAR.ROOMS[notif.roomId];
        text.textContent = `📢 أشار إليك في ${room ? room.name : notif.roomId}`;
    } else if (notif.type === 'private') {
        text.textContent = `💬 ${notif.preview || 'رسالة جديدة'}`;
    } else {
        text.textContent = notif.preview || '';
    }

    const time = document.createElement('div');
    time.style.cssText = 'color:#666;font-size:10px;margin-top:2px;';
    time.textContent = formatTime(notif.time);

    info.appendChild(name);
    info.appendChild(text);
    info.appendChild(time);

    item.appendChild(img);
    item.appendChild(info);

    item.onclick = () => {
        if (notif.type === 'mention' && notif.roomId && QAMAR.ROOMS[notif.roomId]) {
            const room = QAMAR.ROOMS[notif.roomId];
            switchRoom(notif.roomId, `${room.name} ${room.icon}`);
        } else if (notif.type === 'private' && notif.fromUid) {
            openPrivateChatWith(notif.fromUid, notif.fromName, notif.fromAvatar);
        }
        closeAllPanels();
    };

    return item;
}

function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    if (ChatState.unreadCount > 0) {
        badge.textContent = ChatState.unreadCount > 9 ? '9+' : ChatState.unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function markAllNotificationsRead() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    db.ref(`user_notifications/${user.uid}`).once('value', (snap) => {
        const updates = {};
        snap.forEach(child => {
            if (!child.val().read) {
                updates[`${child.key}/read`] = true;
            }
        });
        if (Object.keys(updates).length > 0) {
            db.ref(`user_notifications/${user.uid}`).update(updates);
        }
    });
}

// ==============================================
// الحضور
// ==============================================

function startPresenceHeartbeat() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    const presenceRef = db.ref(`user_presence/${user.uid}`);

    const setOnline = () => {
        presenceRef.set({
            state: 'online',
            lastChanged: Date.now()
        }).catch(() => {});
    };

    const setOffline = () => {
        presenceRef.set({
            state: 'offline',
            lastChanged: Date.now()
        }).catch(() => {});
    };

    setOnline();
    setInterval(setOnline, 30000);
    window.addEventListener('beforeunload', setOffline);

    presenceRef.onDisconnect().set({
        state: 'offline',
        lastChanged: Date.now()
    });

    if (ChatState.presenceListener) ChatState.presenceListener.off();
    ChatState.presenceListener = db.ref('user_presence').limitToLast(100);
    ChatState.presenceListener.on('value', () => {
        // TODO: تحديث قائمة المتواجدين
    });
}

// ==============================================
// التخفي
// ==============================================

function startInvisibleListener() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    db.ref(`users/${user.uid}/invisible`).on('value', (snap) => {
        ChatState.invisibleMode = snap.val() === true;
        updateInvisibleBtn();
    });
}

function updateInvisibleBtn() {
    const btn = document.getElementById('invisible-btn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = ChatState.invisibleMode ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    btn.style.background = ChatState.invisibleMode
        ? 'rgba(150, 100, 200, 0.3)'
        : '';
}

async function toggleInvisible() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    if (!can(user, 'canInvisible')) {
        showToast('fa-lock', '🔒 هذه الميزة للملك/الملكة فقط');
        return;
    }

    const newValue = !ChatState.invisibleMode;

    try {
        await db.ref(`users/${user.uid}/invisible`).set(newValue);
        ChatState.invisibleMode = newValue;
        updateInvisibleBtn();
        showToast('fa-eye-slash', newValue ? '👻 التخفي مُفعَّل' : '👁️ التخفي مُعطَّل');
    } catch(e) {
        showToast('fa-exclamation-circle', '⚠️ فشل');
    }
}

// ==============================================
// المايكات
// ==============================================

function updateMicsUI() {
    const micsBar = document.getElementById('mics-bar');
    if (!micsBar) return;

    const room = QAMAR.ROOMS[ChatState.currentRoom];
    if (!room) return;

    const micsContainer = micsBar.querySelector('.mics');
    if (!micsContainer) return;
    micsContainer.innerHTML = '';

    const user = getCurrentUser();
    const micCount = room.micCount || 0;
    const canUse = user && can(user, 'canUseMic');

    if (micCount === 0) {
        micsBar.classList.add('hidden');
        return;
    }
    micsBar.classList.remove('hidden');

    for (let i = 0; i < micCount; i++) {
        const btn = document.createElement('button');
        btn.className = 'mic-btn';
        btn.setAttribute('data-mic', i);
        if (!canUse) btn.disabled = true;

        const icon = document.createElement('i');
        icon.className = 'fas fa-microphone';
        btn.appendChild(icon);

        btn.onclick = () => toggleMic(i);
        micsContainer.appendChild(btn);
    }
}

function toggleMic(index) {
    const user = getCurrentUser();
    if (!user) return;

    if (!can(user, 'canUseMic')) {
        showToast('fa-lock', '🔒 لا تستطيع استخدام المايك');
        return;
    }

    const btn = document.querySelector(`.mic-btn[data-mic="${index}"]`);
    if (!btn) return;

    const isActive = btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isActive ? 'fas fa-user' : 'fas fa-microphone';
    }
}

function toggleMicsBar() {
    const micsBar = document.getElementById('mics-bar');
    const toggleBtn = document.getElementById('mics-toggle-btn');

    if (micsBar) micsBar.classList.toggle('hidden');
    if (toggleBtn) toggleBtn.classList.toggle('hidden');
}

// ==============================================
// القوائم الجانبية
// ==============================================

function toggleRooms() {
    const sidebar = document.getElementById('rooms-sidebar');
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('open');
    ['notif-sidebar', 'settings-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('show', isOpen);
}

function toggleSettings() {
    const sidebar = document.getElementById('settings-sidebar');
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('open');
    ['rooms-sidebar', 'notif-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.toggle('show', isOpen);
}

function closeAllPanels() {
    ['rooms-sidebar', 'settings-sidebar', 'notif-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('show');
}// ==============================================
// أدوات مساعدة
// ==============================================

function addSystemMessage(text) {
    const container = document.getElementById('messages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = 'message system';
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function openUserProfile(uid, name) {
    if (uid && uid.startsWith('bot_')) {
        openBotProfile(uid);
        return;
    }

    const user = getCurrentUser();
    if (!user) return;

    if (uid === user.uid) {
        openProfile();
        return;
    }

    if (!uid) {
        showToast('fa-user', 'لا يمكن فتح البروفايل');
        return;
    }

    localStorage.setItem('profile_target_uid', uid);
    localStorage.setItem('profile_target_name', name);
    localStorage.setItem('profile_view_mode', 'visitor');

    db.ref('users/' + uid).once('value').then(snap => {
        const data = snap.val();
        if (data) {
            localStorage.setItem('qamar_view_user', JSON.stringify(data));
            localStorage.setItem('profile_target_data', JSON.stringify(data));
        } else {
            const guestData = { uid: uid, name: name, rank: 'User', isGuest: true };
            localStorage.setItem('qamar_view_user', JSON.stringify(guestData));
            localStorage.setItem('profile_target_data', JSON.stringify(guestData));
        }
    }).catch(e => {
        console.warn('openUserProfile: fetch failed', e);
    });

    const frame = document.getElementById('profile-frame-container');
    if (frame) frame.style.display = 'block';
}

function openProfile() {
    const user = getCurrentUser();
    if (!user) return;

    localStorage.setItem('profile_view_mode', 'owner');
    localStorage.setItem('profile_target_uid', user.uid);
    localStorage.setItem('qamar_profile_user', JSON.stringify(user));
    localStorage.setItem('qamar_current_user', JSON.stringify(user));
    localStorage.setItem('profile_target_data', JSON.stringify(user));

    const frame = document.getElementById('profile-frame-container');
    if (frame) frame.style.display = 'block';
}

function closeProfileFrame() {
    const frame = document.getElementById('profile-frame-container');
    if (frame) frame.style.display = 'none';

    const iframe = document.getElementById('profile-iframe');
    if (iframe) iframe.src = iframe.src;
}

function toggleToolbar() {
    const toolbar = document.getElementById('floating-toolbar');
    const btn = document.getElementById('plus-btn');
    if (toolbar) toolbar.classList.toggle('open');
    if (btn) btn.classList.toggle('active');
}

function rollDice() {
    addSystemMessage(`🎲 النرد: ${Math.floor(Math.random() * 6) + 1}`);
    toggleToolbar();
}

function searchYouTube() {
    const q = prompt('🔍 ابحث في يوتيوب:');
    if (q) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
    toggleToolbar();
}

function insertEmoji() {
    const input = document.getElementById('message-input');
    if (input) {
        input.value += '😊';
        input.focus();
    }
}

function showOnlineUsers() {
    closeAllPanels();
    showToast('fa-users', '👥 قريباً');
}

function showStore() {
    closeAllPanels();
    showToast('fa-store', '🛒 قريباً');
}

function openUpgradeModal() {
    const user = getCurrentUser();
    if (!user || !user.isGuest) {
        showToast('fa-check', '✅ أنت عضو بالفعل');
        return;
    }
    const modal = document.getElementById('upgrade-modal');
    if (modal) modal.classList.add('active');
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgrade-modal');
    if (modal) modal.classList.remove('active');
}

async function handleLogout() {
    if (!confirm('هل أنت متأكد من الخروج؟')) return;

    if (ChatState.messagesListener) ChatState.messagesListener.off();
    if (ChatState.privateMessagesListener) ChatState.privateMessagesListener.off();
    if (ChatState.notificationsListener) ChatState.notificationsListener.off();
    if (ChatState.privateChatsListener) ChatState.privateChatsListener.off();
    if (ChatState.presenceListener) ChatState.presenceListener.off();

    await logout();
    location.reload();
}

function openBotTraining() {
    const user = getCurrentUser();
    if (!user || (user.rank !== 'King' && user.rank !== 'Queen')) {
        showToast('fa-lock', '🔒 للملك/الملكة فقط');
        return;
    }
    closeAllPanels();
    if (typeof switchRoom === 'function') {
        switchRoom('bot_training', '🤖 تدريب البوت');
    }
}

// ==============================================
// بروفايل البوت
// ==============================================

function openBotProfile(botUid) {
    const botId = (botUid || '').replace('bot_', '');

    const botData = Object.values(QAMAR.BOTS).find(b => b.id === botId);

    if (!botData) {
        showToast('fa-robot', '🤖 بوت');
        return;
    }

    const modal = document.getElementById('bot-profile-modal');
    const avatar = document.getElementById('bp-avatar');
    const name = document.getElementById('bp-name');
    const desc = document.getElementById('bp-desc');

    if (avatar) avatar.textContent = botData.icon || '🤖';
    if (name) name.textContent = botData.name || 'بوت';
    if (desc) desc.textContent = botData.description || '';
    if (modal) modal.classList.add('active');
}

function closeBotProfile() {
    const modal = document.getElementById('bot-profile-modal');
    if (modal) modal.classList.remove('active');
}

// ==============================================
// مراقبة بروفايلات الأعضاء
// ==============================================

function watchUser(uid) {
    if (!uid) return;
    if (uid.startsWith('bot_')) return;
    if (usersWatchers[uid]) return;

    usersWatchers[uid] = true;

    const ref = db.ref('users/' + uid);
    ref.on('value', (snap) => {
        const data = snap.val();
        if (data) {
            usersCache[uid] = data;
            updateMessagesByUid(uid, data);

            const me = getCurrentUser();
            if (me && me.uid === uid) {
                const merged = { ...me, ...data };
                currentUser = merged;
                saveSession(currentUser, currentUser.isGuest);
            }
        }
    });
}

function updateMessagesByUid(uid, data) {
    if (!data) return;

    document.querySelectorAll(`.message[data-sender-uid="${uid}"]`).forEach(msgEl => {
        const avatarImg = msgEl.querySelector('.message-avatar');
        if (avatarImg && data.avatar) {
            avatarImg.src = data.avatar;
        }

        const username = msgEl.querySelector('.message-username');
        if (!username) return;

        let displayName = data.name || 'مجهول';
        if (data.nameEmoji) displayName += ' ' + data.nameEmoji;

        username.textContent = displayName;

        username.removeAttribute('style');

        if (data.nameGradient && Array.isArray(data.nameGradient) && data.nameGradient.length >= 2) {
            username.style.background = `linear-gradient(90deg, ${data.nameGradient[0]}, ${data.nameGradient[1]}, ${data.nameGradient[0]})`;
            username.style.backgroundSize = '200% 200%';
            username.style.webkitBackgroundClip = 'text';
            username.style.backgroundClip = 'text';
            username.style.webkitTextFillColor = 'transparent';
            username.style.animation = 'nameGradientMove 3s linear infinite';
        } else {
            username.style.color = data.color || '#ffd700';
        }

        if (data.nameGlow && data.nameGlow !== 'none') {
            if (data.nameGlow === 'soft') {
                username.style.filter = 'drop-shadow(0 0 8px currentColor)';
            } else if (data.nameGlow === 'medium') {
                username.style.filter = 'drop-shadow(0 0 15px currentColor)';
            } else if (data.nameGlow === 'strong') {
                username.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
            }
        }
    });
}

function watchAllVisibleSenders() {
    document.querySelectorAll('.message[data-sender-uid]').forEach(msgEl => {
        const uid = msgEl.getAttribute('data-sender-uid');
        if (uid && !uid.startsWith('bot_')) {
            watchUser(uid);
        }
    });
}

// ==============================================
// الأحداث العامة
// ==============================================

window.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        setTimeout(() => {
            if (typeof initChat === 'function') initChat();
        }, 100);
    }

    setTimeout(() => {
        const u = getCurrentUser();
        if (u && (u.rank === 'King' || u.rank === 'Queen')) {
            const btn = document.getElementById('invisible-btn');
            if (btn) btn.style.display = 'flex';

            const adminSettings = document.getElementById('admin-settings');
            if (adminSettings) adminSettings.style.display = 'block';
        }
    }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', closeAllPanels);
});

document.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.getElementById('pc-minimize');
    const closeBtn = document.getElementById('pc-close');

    if (minimizeBtn) {
        minimizeBtn.onclick = () => {
            if (!ChatState.currentPrivateChat) return;
            ChatState.minimizedChat = { ...ChatState.currentPrivateChat };

            const modal = document.getElementById('private-chat-modal');
            if (modal) modal.classList.remove('open');

            const mcaImg = document.getElementById('mca-img');
            if (mcaImg) mcaImg.src = ChatState.currentPrivateChat.otherAvatar;

            const minimized = document.getElementById('minimized-chat-avatar');
            if (minimized) minimized.classList.add('show');

            const badge = document.getElementById('mca-badge');
            if (badge) badge.style.display = 'none';
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (ChatState.privateMessagesListener) {
                ChatState.privateMessagesListener.off();
                ChatState.privateMessagesListener = null;
            }

            const modal = document.getElementById('private-chat-modal');
            if (modal) modal.classList.remove('open');

            ChatState.currentPrivateChat = null;
            ChatState.minimizedChat = null;

            const minimized = document.getElementById('minimized-chat-avatar');
            if (minimized) minimized.classList.remove('show');
        };
    }
});

function restorePrivateChat() {
    if (!ChatState.minimizedChat) return;
    const c = ChatState.minimizedChat;
    openPrivateChatWith(c.otherUid, c.otherName, c.otherAvatar);
}

window.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'openPrivateChat') {
        openPrivateChatWith(e.data.uid, e.data.name, e.data.avatar || '');
    }
    if (e.data && e.data.action === 'closeProfile') {
        closeProfileFrame();
    }
    if (e.data && e.data.action === 'profileUpdated') {
        if (e.data.uid) {
            db.ref('users/' + e.data.uid).once('value').then(snap => {
                const data = snap.val();
                if (data) {
                    updateMessagesByUid(e.data.uid, data);
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', closeAllMenus, { passive: true });
    }
});

// ==============================================
// تصدير للاستخدام العام
// ==============================================

window.ChatState = ChatState;
window.initChat = initChat;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.switchRoom = switchRoom;
window.toggleMic = toggleMic;
window.toggleMicsBar = toggleMicsBar;
window.toggleRooms = toggleRooms;
window.toggleSettings = toggleSettings;
window.toggleNotifications = toggleNotifications;
window.togglePrivateMessages = togglePrivateMessages;
window.closeAllPanels = closeAllPanels;
window.startReply = startReply;
window.cancelReply = cancelReply;
window.insertMention = insertMention;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
window.toggleReaction = toggleReaction;
window.sendPrivateMsg = sendPrivateMsg;
window.restorePrivateChat = restorePrivateChat;
window.openUserProfile = openUserProfile;
window.openProfile = openProfile;
window.closeProfileFrame = closeProfileFrame;
window.toggleToolbar = toggleToolbar;
window.rollDice = rollDice;
window.searchYouTube = searchYouTube;
window.insertEmoji = insertEmoji;
window.showOnlineUsers = showOnlineUsers;
window.showStore = showStore;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.handleLogout = handleLogout;
window.toggleInvisible = toggleInvisible;
window.changeBackground = changeBackground;
window.openBotProfile = openBotProfile;
window.closeBotProfile = closeBotProfile;
window.openBotTraining = openBotTraining;
window.closeAllMenus = closeAllMenus;
window.watchUser = watchUser;
window.watchAllVisibleSenders = watchAllVisibleSenders;

console.log('✅ chat.js v5 loaded — زر خيارات inline + قوائم محسّنة ⚡');د
