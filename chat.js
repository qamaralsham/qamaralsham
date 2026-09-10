// ==============================================
// قمر الشام - منطق الشات الرئيسي (v1)
// Qamar Al Sham - Main Chat Logic v1
// ==============================================
// هذا الملف يعتمد على:
//   - config.js (QAMAR)
//   - ranks.js (RANKS, getRank, can, isHigherRank)
//   - utils.js (escapeHtml, formatTime, buildMentionHTML, إلخ)
//   - auth.js (getCurrentUser, isGuest, isKing, إلخ)
// ==============================================

// ==============================================
// 1. الحالة العامة (State)
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
    
    lastMessageTime: 0,        // للـ Rate Limiting
    lastPrivateMessageTime: 0,
    
    seenMessages: new Set(),   // ← منع تكرار الرسائل (الأهم!)
    seenPrivateMessages: new Set(),
    
    invisibleMode: false,
    isInitialized: false
};

// ==============================================
// 2. الأصوات (Sounds)
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
    } catch(e) { /* تجاهل */ }
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
    } catch(e) { /* تجاهل */ }
}

// ==============================================
// 3. التهيئة (Init)
// ==============================================

function initChat() {
    if (ChatState.isInitialized) {
        console.warn('⚠️ Chat already initialized');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        console.warn('⚠️ No user — cannot init chat');
        return;
    }
    
    ChatState.isInitialized = true;
    
    // إخفاء شاشة الدخول
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'none';
    
    // إظهار الشات
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.style.display = 'flex';
    
    // الخلفية
    const savedBg = localStorage.getItem(QAMAR.STORAGE_KEYS.BACKGROUND);
    if (savedBg) changeBackground(savedBg);
    
    // النجوم
    if (typeof generateStars === 'function') generateStars();
    
    // بناء القوائم
    buildRoomsList();
    buildBackgroundsList();
    
    // إخفاء زر الترقية للعضو
    if (!user.isGuest) {
        const upgradeBtn = document.getElementById('upgrade-nav-btn');
        if (upgradeBtn) upgradeBtn.style.display = 'none';
    }
    
    // رسالة ترحيب
    addSystemMessage(`👑 مرحباً ${user.name} — رتبتك: ${getRankBadge(user.rank)} ${user.rank}`);
    
    // بدء المستمعين
    startMessagesListener();
    startNotificationsListener();
    startPrivateChatsListener();
    startPresenceHeartbeat();
    
    // تهيئة البوتات (إن وجدت)
    if (typeof initBots === 'function') {
        try { initBots(); } catch(e) { console.warn('Bots error:', e); }
    }
    
    // الاستماع لحالة التخفي
    startInvisibleListener();
    
    console.log('✅ Chat initialized');
}

// ==============================================
// 4. بناء قائمة الغرف
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
        icon.innerText = room.icon;
        
        const name = document.createElement('span');
        name.innerText = room.name;
        
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
        btn.innerText = bg.id;
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
// 5. تبديل الغرفة
// ==============================================

function switchRoom(roomId, roomTitle, element) {
    const user = getCurrentUser();
    
    if (!QAMAR.isRoomVisible(roomId, user)) {
        showToast('fa-lock', '🔒 هذه الغرفة غير متاحة لك');
        return;
    }
    
    // إلغاء المستمع القديم
    if (ChatState.messagesListener) {
        ChatState.messagesListener.off();
        ChatState.messagesListener = null;
    }
    
    // تصفير الرسائل المرئية (مهم جداً!)
    ChatState.seenMessages.clear();
    
    ChatState.currentRoom = roomId;
    
    const titleEl = document.getElementById('room-title');
    if (titleEl) titleEl.innerText = roomTitle;
    
    // تحديث قائمة الغرف
    document.querySelectorAll('.sidebar-item[data-room-id]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-room-id') === roomId);
    });
    
    // مسح الرسائل
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) messagesContainer.innerHTML = '';
    
    addSystemMessage(`📢 تم فتح ${roomTitle}`);
    
    // تحديث المايكات
    updateMicsUI();
    
    startMessagesListener();
    closeAllPanels();
}

// ==============================================
// 6. المستمع للرسائل العامة (المُصلَّح!)
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
        // 🔴 منع التكرار (الأهم!)
        if (ChatState.seenMessages.has(snap.key)) return;
        ChatState.seenMessages.add(snap.key);
        
        const msg = snap.val();
        if (!msg) return;
        
        const user = getCurrentUser();
        if (!user) return;
        
        // لا تعرض رسائل نفسي (لأنها تُعرض محلياً عند الإرسال)
        if (msg.senderUid === user.uid) return;

// ⭐ أضف هذه الأسطر الثلاثة:
if (typeof processIncomingMessage === 'function') {
    processIncomingMessage(msg).catch(e => console.warn('Bot error:', e));
}

displayMessage(msg, snap.key);
        
        // صوت + إشعار للمنشن
        if (msg.mentions && msg.mentions.includes(user.name)) {
            playBirdSound();
        }
    });
    
    ref.on('child_changed', (snap) => {
        // تحديث رسالة معدّلة/محذوفة
        const msg = snap.val();
        const el = document.querySelector(`[data-msg-id="${snap.key}"]`);
        if (el && msg) {
            if (msg.deleted) {
                el.classList.add('deleted');
                const textEl = el.querySelector('.message-text');
                if (textEl) textEl.innerText = '🚫 رسالة محذوفة';
            } else if (msg.edited) {
                const textEl = el.querySelector('.message-text');
                if (textEl) textEl.innerText = msg.text;
            }
        }
    });
    
    ref.on('child_removed', (snap) => {
        const el = document.querySelector(`[data-msg-id="${snap.key}"]`);
        if (el) el.remove();
    });
}

// ==============================================
// 7. عرض الرسالة (آمن ضد XSS!)
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
    
    // تمييز المنشن
    const isMentioned = msg.mentions && msg.mentions.includes(user?.name);
    if (isMentioned) msgEl.classList.add('highlighted');
    
    // ====== الأفاتار ======
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'message-avatar-wrapper';
    
    const avatarImg = document.createElement('img');
    avatarImg.className = 'message-avatar';
    avatarImg.src = msg.senderAvatar || getDefaultAvatar(msg.senderName);
    avatarImg.alt = msg.senderName;
    avatarImg.loading = 'lazy';
    avatarImg.onerror = () => { avatarImg.src = getDefaultAvatar(msg.senderName); };
    avatarImg.onclick = () => openUserProfile(msg.senderUid, msg.senderName);
    avatarWrapper.appendChild(avatarImg);
    
    // إطار الأفاتار
    if (msg.senderFrame && msg.senderFrame !== 'none' && typeof getFrameStyleById === 'function') {
        const frameData = getFrameStyleById(msg.senderFrame);
        if (frameData) {
            const frameEl = document.createElement('div');
            frameEl.className = 'message-avatar-frame';
            frameEl.style.cssText = frameData.style;
            avatarWrapper.appendChild(frameEl);
        }
    }
    
    // ====== المحتوى ======
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // ====== الهيدر ======
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const username = document.createElement('div');
    username.className = 'message-username';
    
    // الاسم + الإيموجي + البوت
    let displayName = msg.senderName || 'مجهول';
    if (msg.senderEmoji) displayName += ' ' + msg.senderEmoji;
    if (isBot) displayName += ' 🤖';
    username.textContent = displayName;
    
    // تدرج الاسم
    if (msg.senderGradient && msg.senderGradient.length >= 2) {
        username.style.background = `linear-gradient(90deg, ${msg.senderGradient[0]}, ${msg.senderGradient[1]}, ${msg.senderGradient[0]})`;
        username.style.backgroundSize = '200% 200%';
        username.style.webkitBackgroundClip = 'text';
        username.style.backgroundClip = 'text';
        username.style.webkitTextFillColor = 'transparent';
        username.style.animation = 'nameGradientMove 3s linear infinite';
    } else {
        username.style.color = msg.senderColor || '#ffd700';
    }
    
    // التوهج
    if (msg.senderGlow) {
        if (msg.senderGlow === 'soft') username.style.filter = 'drop-shadow(0 0 8px currentColor)';
        else if (msg.senderGlow === 'medium') username.style.filter = 'drop-shadow(0 0 15px currentColor)';
        else if (msg.senderGlow === 'strong') username.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
    }
    
    username.onclick = () => insertMention(msg.senderName);
    
    // الوقت
    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(msg.time);
    
    // زر الخيارات
    const optBtn = document.createElement('button');
    optBtn.className = 'message-options-btn';
    optBtn.textContent = '⋮';
    optBtn.onclick = (e) => {
        e.stopPropagation();
        showMessageMenu(msgEl, msg.senderName, msg.text, msgId);
    };
    
    header.appendChild(username);
    header.appendChild(timeEl);
    header.appendChild(optBtn);
    
    // ====== النص ======
    const msgText = document.createElement('div');
    msgText.className = 'message-text';
    
    if (msg.deleted) {
        msgText.innerText = '🚫 رسالة محذوفة';
        msgEl.classList.add('deleted');
    } else if (msg.mentions && msg.mentions.length > 0) {
        // بناء المنشن بأمان
        const frag = buildMentionHTML(msg.text, msg.mentions, insertMention);
        msgText.appendChild(frag);
    } else {
        msgText.textContent = msg.text || '';
    }
    
    content.appendChild(header);
    content.appendChild(msgText);
    
    // ====== المرفقات ======
    if (msg.attachment && !msg.deleted) {
        const attachmentEl = buildAttachmentElement(msg.attachment);
        if (attachmentEl) content.appendChild(attachmentEl);
    }
    
    // ====== الرد (Reply) ======
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
    
    // ====== التفاعلات ======
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
    
    // إضافة للقائمة
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

// ==============================================
// 8. بناء المرفقات
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
// 9. إرسال رسالة (مع Rate Limiting)
// ==============================================

function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const text = input.value.trim();
    const user = getCurrentUser();
    
    if (!text || !user) return;
    
    // Rate Limiting (5 ثواني)
    const now = Date.now();
    if (now - ChatState.lastMessageTime < QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS) {
        const remaining = Math.ceil((QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS - (now - ChatState.lastMessageTime)) / 1000);
        showToast('fa-hourglass-half', `⏳ انتظر ${remaining} ثانية`);
        return;
    }
    
    // حد الطول
    if (text.length > QAMAR.RATE_LIMIT.MAX_MESSAGE_LENGTH) {
        showToast('fa-exclamation-triangle', '⚠️ الرسالة طويلة جداً');
        return;
    }
    
    // منع الروابط
    if (isLink(text)) {
        showToast('fa-ban', '🚫 يحظر نشر الروابط');
        return;
    }
    
    ChatState.lastMessageTime = now;
    
    // أمر بوت
    if (text.startsWith('!') && typeof handleBotCommand === 'function') {
        handleBotCommand(text);
        input.value = '';
        return;
    }
    
    // استخراج المنشن
    const mentions = extractMentions(text);
    
    // كائن الرسالة (متوافق مع القواعد الجديدة)
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
    
    // إرسال إلى Firebase
    const msgRef = db.ref(`room_messages/${ChatState.currentRoom}`).push();
    msgRef.set(messageData).catch(err => {
        console.error('Send error:', err);
        showToast('fa-exclamation-circle', '⚠️ فشل الإرسال');
    });
    
    // ⚠️ مهم: نضيف الرسالة لقائمة seenMessages لمنع تكرارها
    ChatState.seenMessages.add(msgRef.key);
    
    // عرض محلياً فوراً
    const localMsg = { ...messageData, time: Date.now() };
    displayMessage(localMsg, msgRef.key);
    
    // إشعار المنشن
    if (mentions.length > 0) {
        notifyMentions(mentions, text);
    }
    
    // تنظيف
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
            // نبحث عن uid الشخص المنشن
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
// 10. الرد (Reply)
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
// 11. المنشن
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
// 12. قائمة الرسالة (Message Menu)
// ==============================================

function showMessageMenu(msgEl, sender, text, msgId) {
    closeAllMenus();
    
    const user = getCurrentUser();
    if (!user) return;
    
    const isOwner = sender === user.name;
    const canDelete = isOwner || can(user, 'canDeleteAnyMessage');
    
    const menu = document.createElement('div');
    menu.className = 'message-menu open';
    
    // تفاعل
    const reactItem = document.createElement('div');
    reactItem.className = 'message-menu-item';
    reactItem.textContent = '😊 تفاعل';
    reactItem.onclick = () => { menu.remove(); showEmojiBar(msgEl, msgId); };
    menu.appendChild(reactItem);
    
    // رد
    const replyItem = document.createElement('div');
    replyItem.className = 'message-menu-item';
    replyItem.textContent = '💬 رد';
    replyItem.onclick = () => startReply(sender, text, msgId);
    menu.appendChild(replyItem);
    
    // تعديل (لصاحب الرسالة فقط)
    if (isOwner && msgId) {
        const editItem = document.createElement('div');
        editItem.className = 'message-menu-item';
        editItem.textContent = '✏️ تعديل';
        editItem.onclick = () => editMessage(msgEl, msgId);
        menu.appendChild(editItem);
    }
    
    // حذف
    if (canDelete && msgId) {
        const delItem = document.createElement('div');
        delItem.className = 'message-menu-item danger';
        delItem.textContent = '🗑️ حذف';
        delItem.onclick = () => deleteMessage(msgEl, msgId);
        menu.appendChild(delItem);
    }
    
    const content = msgEl.querySelector('.message-content');
    if (content) content.appendChild(menu);
    
    // إغلاق عند النقر خارج
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

function showEmojiBar(msgEl, msgId) {
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
    
    const content = msgEl.querySelector('.message-content');
    if (content) content.appendChild(bar);
}

function closeAllMenus() {
    document.querySelectorAll('.message-menu, .emoji-bar').forEach(el => el.remove());
}

// ==============================================
// 13. التفاعلات (Reactions)
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

// ==============================================
// 14. التعديل والحذف
// ==============================================

async function editMessage(msgEl, msgId) {
    const msgText = msgEl.querySelector('.message-text');
    if (!msgText) return;
    
    const currentText = msgText.innerText;
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
}

// ==============================================
// 15. الرسائل الخاصة
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
        
        // احسب غير المقروء
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
    
    // تصفير الرسائل المرئية
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
        
        // تعليم كمقروء
        if (!isSent && !msg.read) {
            db.ref(`user_private_messages/${user.uid}/${otherUid}/${snap.key}/read`).set(true).catch(() => {});
            
            // تحديث فهرس المحادثات
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
        // 🔴 آمن ضد XSS
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
    
    // Rate Limiting
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
        // 1. أرسل للمرسل (نسخته)
        const myMsgRef = db.ref(`user_private_messages/${user.uid}/${otherUid}`).push();
        await myMsgRef.set({ ...messageData, read: true });
        
        // 2. أرسل للمستقبل (نسخته)
        const theirMsgRef = db.ref(`user_private_messages/${otherUid}/${user.uid}`).push();
        await theirMsgRef.set(messageData);
        
        // 3. أرشيف الملك
        const chatId = [user.uid, otherUid].sort().join('_');
        const archiveRef = db.ref(`king_archive/${chatId}`).push();
        await archiveRef.set({
            fromUid: user.uid,
            toUid: otherUid,
            text: text,
            time: Date.now(),
            deleted: false
        });
        
        // 4. تحديث فهرس المحادثة عندي
        await db.ref(`user_private_chats/${user.uid}/${otherUid}`).update({
            otherUid: otherUid,
            otherName: ChatState.currentPrivateChat.otherName,
            otherAvatar: ChatState.currentPrivateChat.otherAvatar,
            lastMessage: truncate(text, 50),
            lastTime: Date.now()
        });
        
        // 5. تحديث فهرس المحادثة عنده
        await db.ref(`user_private_chats/${otherUid}/${user.uid}`).update({
            otherUid: user.uid,
            otherName: user.name,
            otherAvatar: user.avatar || '',
            lastMessage: truncate(text, 50),
            lastTime: Date.now()
        });
        
        // زيادة عداد غير المقروء عنده
        db.ref(`user_private_chats/${otherUid}/${user.uid}/unread`).transaction(c => (c || 0) + 1);
        
        // تعليم كمقروء عندي (seen)
        ChatState.seenPrivateMessages.add(myMsgRef.key);
        
        // إشعار
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
// 16. الإشعارات
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
            
            // إظهار إشعار سريع
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
// 17. الحضور (Presence)
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
    
    // تعيين الحالة أول مرة
    setOnline();
    
    // heartbeat كل 30 ثانية
    setInterval(setOnline, 30000);
    
    // عند إغلاق الصفحة
    window.addEventListener('beforeunload', setOffline);
    
    // Firebase onDisconnect
    presenceRef.onDisconnect().set({
        state: 'offline',
        lastChanged: Date.now()
    });
    
    // listener للمستخدمين الحاضرين
    if (ChatState.presenceListener) ChatState.presenceListener.off();
    ChatState.presenceListener = db.ref('user_presence').limitToLast(100);
    ChatState.presenceListener.on('value', () => {
        // TODO: تحديث قائمة المتواجدين
    });
}

// ==============================================
// 18. التخفي (Invisible)
// ==============================================

function startInvisibleListener() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;
    
    db.ref(`users/${user.uid}/invisible`).on('value', (snap) => {
        ChatState.invisibleMode = snap.val() === true;
    });
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
        showToast('fa-eye-slash', newValue ? '👻 التخفي مُفعَّل' : '👁️ التخفي مُعطَّل');
    } catch(e) {
        showToast('fa-exclamation-circle', '⚠️ فشل');
    }
}

// ==============================================
// 19. المايكات (UI فقط الآن)
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
    
    // إذا الغرفة بدون مايكات — اخف الشريط
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
    
    // TODO: إضافة منطق المايك في Firebase لاحقاً
}

function toggleMicsBar() {
    const micsBar = document.getElementById('mics-bar');
    const toggleBtn = document.getElementById('mics-toggle-btn');
    
    if (micsBar) micsBar.classList.toggle('hidden');
    if (toggleBtn) toggleBtn.classList.toggle('hidden');
}

// ==============================================
// 20. القوائم الجانبية
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
}

// ==============================================
// 21. أدوات مساعدة
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
    
    // نفتح profile.html مع تمرير uid
    localStorage.setItem('profile_target_uid', uid);
    localStorage.setItem('profile_target_name', name);
    localStorage.setItem('profile_view_mode', 'visitor');
    
    const frame = document.getElementById('profile-frame-container');
    if (frame) frame.style.display = 'block';
}

function openProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    localStorage.setItem('profile_view_mode', 'owner');
    localStorage.setItem('profile_target_uid', user.uid);
    
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
    
    // تنظيف المستمعين
    if (ChatState.messagesListener) ChatState.messagesListener.off();
    if (ChatState.privateMessagesListener) ChatState.privateMessagesListener.off();
    if (ChatState.notificationsListener) ChatState.notificationsListener.off();
    if (ChatState.privateChatsListener) ChatState.privateChatsListener.off();
    if (ChatState.presenceListener) ChatState.presenceListener.off();
    
    await logout();
    location.reload();
}

// ==============================================
// 22. الأحداث العامة
// ==============================================

// تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        // تأخير بسيط للتأكد من تحميل الملفات
        setTimeout(() => {
            if (typeof initChat === 'function') initChat();
        }, 100);
    }
});

// النقر على overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', closeAllPanels);
});

// أزرار الخاص
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

// استقبال رسائل من profile.html (iframe)
window.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'openPrivateChat') {
        openPrivateChatWith(e.data.uid, e.data.name, e.data.avatar || '');
    }
    if (e.data && e.data.action === 'closeProfile') {
        closeProfileFrame();
    }
});

// عند تغيير حجم الشاشة (للمايكات)
window.addEventListener('resize', () => {
    // nothing for now
});

// ==============================================
// 23. تصدير للاستخدام العام
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

console.log('✅ chat.js v1 loaded');
