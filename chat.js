// ==============================================
// قمر الشام - chat.js v2 (متوسطة - تعمل)
// ==============================================

const ChatState = {
    currentRoom: 'general',
    messagesListener: null,
    seenMessages: new Set(),
    isInitialized: false,
    lastMessageTime: 0,
    replyingTo: null
};

const usersCache = {};
const usersCacheTTL = {};

// ⭐ أدوات
function toArray(val) {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') {
        return Object.keys(val).sort((a, b) => parseInt(a) - parseInt(b)).map(k => val[k]);
    }
    return null;
}

// ==============================================
// التهيئة
// ==============================================
async function initChat() {
    console.log('🚀 initChat called');
    
    if (ChatState.isInitialized) return;
    ChatState.isInitialized = true;
    
    const user = getCurrentUser();
    if (!user) return;
    
    // إخفاء الدخول + إظهار الشات
    const ls = document.getElementById('login-screen');
    if (ls) ls.style.display = 'none';
    
    const cc = document.getElementById('chat-container');
    if (cc) cc.style.display = 'flex';
    
    // النجوم
    if (typeof generateStars === 'function') generateStars();
    
    // بناء القوائم
    buildRoomsList();
    buildBackgroundsList();
    
    // إظهار زر التخفي للملك/الملكة
    if (user.rank === 'King' || user.rank === 'Queen') {
        const btn = document.getElementById('invisible-btn');
        if (btn) btn.style.display = 'flex';
        const adm = document.getElementById('admin-settings');
        if (adm) adm.style.display = 'block';
    }
    
    // إخفاء زر العضوية للأعضاء
    if (!user.isGuest) {
        const up = document.getElementById('upgrade-nav-btn');
        if (up) up.style.display = 'none';
    }
    
    addSystemMessage('👑 مرحباً ' + user.name);
    
    // بدء الاستماع
    startMessagesListener();
    updateMicsUI();
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
    
    const visible = QAMAR.getVisibleRooms(user);
    
    Object.values(visible).forEach(room => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.setAttribute('data-room-id', room.id);
        item.textContent = room.icon + ' ' + room.name;
        
        if (room.id === ChatState.currentRoom) item.classList.add('active');
        
        item.onclick = () => switchRoom(room.id, room.name + ' ' + room.icon);
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
function switchRoom(roomId, roomTitle) {
    const user = getCurrentUser();
    if (!QAMAR.isRoomVisible(roomId, user)) {
        showToast('fa-lock', '🔒 غير متاح');
        return;
    }
    
    if (ChatState.messagesListener) ChatState.messagesListener.off();
    
    ChatState.seenMessages.clear();
    ChatState.currentRoom = roomId;
    
    const t = document.getElementById('room-title');
    if (t) t.textContent = roomTitle;
    
    document.querySelectorAll('.sidebar-item[data-room-id]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-room-id') === roomId);
    });
    
    const mc = document.getElementById('messages');
    if (mc) mc.innerHTML = '';
    
    addSystemMessage('📢 ' + roomTitle);
    updateMicsUI();
    startMessagesListener();
    closeAllPanels();
}

// ==============================================
// مستمع الرسائل
// ==============================================
function startMessagesListener() {
    if (!db) return;
    
    if (ChatState.messagesListener) ChatState.messagesListener.off();
    
    const ref = db.ref('room_messages/' + ChatState.currentRoom).limitToLast(50);
    ChatState.messagesListener = ref;
    
    ref.on('child_added', (snap) => {
        if (ChatState.seenMessages.has(snap.key)) return;
        ChatState.seenMessages.add(snap.key);
        
        const msg = snap.val();
        if (!msg) return;
        
        displayMessage(msg, snap.key);
    });
    
    ref.on('child_changed', (snap) => {
        const msg = snap.val();
        const el = document.querySelector('[data-msg-id="' + snap.key + '"]');
        if (el && msg && msg.deleted) {
            el.style.opacity = '0.5';
            const t = el.querySelector('.message-text');
            if (t) t.textContent = '🚫 رسالة محذوفة';
        }
    });
    
    ref.on('child_removed', (snap) => {
        const el = document.querySelector('[data-msg-id="' + snap.key + '"]');
        if (el) el.remove();
    });
}

// ==============================================
// عرض الرسالة
// ==============================================
function displayMessage(msg, msgId) {
    const container = document.getElementById('messages');
    if (!container) return;
    
    const user = getCurrentUser();
    const isBot = msg.isBot === true;
    
    const msgEl = document.createElement('div');
    msgEl.className = 'message' + (isBot ? ' bot' : '');
    msgEl.setAttribute('data-msg-id', msgId);
    msgEl.setAttribute('data-sender-uid', msg.senderUid || '');
    
    // الصورة
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'message-avatar-wrapper';
    
    const avatarImg = document.createElement('img');
    avatarImg.className = 'message-avatar';
    let avatarSrc = msg.senderAvatar || getDefaultAvatar(msg.senderName);
    if (avatarSrc.length > 500 && !avatarSrc.startsWith('http')) {
        avatarSrc = getDefaultAvatar(msg.senderName);
    }
    avatarImg.src = avatarSrc;
    avatarImg.alt = msg.senderName;
    avatarImg.loading = 'lazy';
    avatarImg.onerror = () => { avatarImg.src = getDefaultAvatar(msg.senderName); };
    avatarWrapper.appendChild(avatarImg);
    
    // المحتوى
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const username = document.createElement('div');
    username.className = 'message-username';
    username.textContent = msg.senderName || 'مجهول';
    
    // التدرج
    const gradient = toArray(msg.senderGradient);
    if (gradient && gradient.length >= 2) {
        username.style.background = 'linear-gradient(90deg,' + gradient[0] + ',' + gradient[1] + ',' + gradient[0] + ')';
        username.style.backgroundSize = '200% 200%';
        username.style.webkitBackgroundClip = 'text';
        username.style.backgroundClip = 'text';
        username.style.webkitTextFillColor = 'transparent';
        username.style.animation = 'nameGradientMove 3s linear infinite';
    } else {
        username.style.color = msg.senderColor || '#ffd700';
    }
    
    // التوهج
    if (msg.senderGlow === 'soft') username.style.filter = 'drop-shadow(0 0 8px currentColor)';
    else if (msg.senderGlow === 'medium') username.style.filter = 'drop-shadow(0 0 15px currentColor)';
    else if (msg.senderGlow === 'strong') username.style.filter = 'drop-shadow(0 0 25px currentColor)';
    
    // الشكل
    if (msg.senderShape && msg.senderShape !== 'none') {
        if (msg.senderShape === 'capsule') {
            username.style.padding = '4px 14px';
            username.style.borderRadius = '30px';
        } else if (msg.senderShape === 'cloud') {
            username.style.padding = '6px 18px';
            username.style.borderRadius = '60% 40% 50% 50% / 50% 60% 40% 50%';
        } else if (msg.senderShape === 'wave') {
            username.style.padding = '6px 16px';
            username.style.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
        }
        username.style.boxShadow = 'inset 0 0 0 100px rgba(0,0,0,0.5)';
    }
    
    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(msg.time);
    
    header.appendChild(username);
    header.appendChild(timeEl);
    
    // النص
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = msg.text || '';
    
    content.appendChild(header);
    content.appendChild(text);
    
    msgEl.appendChild(avatarWrapper);
    msgEl.appendChild(content);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
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
        const r = Math.ceil((QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS - (now - ChatState.lastMessageTime)) / 1000);
        showToast('fa-hourglass-half', '⏳ انتظر ' + r + ' ث');
        return;
    }
    
    if (text.length > QAMAR.RATE_LIMIT.MAX_MESSAGE_LENGTH) {
        showToast('fa-exclamation-triangle', '⚠️ طويلة جداً');
        return;
    }
    
    if (isLink(text)) {
        showToast('fa-ban', '🚫 لا روابط');
        return;
    }
    
    ChatState.lastMessageTime = now;
    
    let avatarToSave = user.avatar || '';
    if (avatarToSave.length > 500 && !avatarToSave.startsWith('http')) {
        avatarToSave = getDefaultAvatar(user.name);
    }
    
    const ref = db.ref('room_messages/' + ChatState.currentRoom).push();
    ref.set({
        senderUid: user.uid,
        senderName: user.name,
        senderAvatar: avatarToSave,
        senderColor: user.color || '#ffd700',
        senderRank: user.rank,
        senderGradient: user.nameGradient || null,
        senderGlow: user.nameGlow || null,
        senderEmoji: user.nameEmoji || null,
        senderShape: user.nameShape || 'none',
        text: text,
        mentions: [],
        replyTo: null,
        time: firebase.database.ServerValue.TIMESTAMP,
        edited: false,
        deleted: false
    }).then(() => {
        input.value = '';
        input.focus();
    }).catch(e => {
        showToast('fa-exclamation-circle', '⚠️ فشل الإرسال');
        console.error(e);
    });
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// ==============================================
// المايكات UI
// ==============================================
function updateMicsUI() {
    const bar = document.getElementById('mics-bar');
    if (!bar) return;
    
    const room = QAMAR.ROOMS[ChatState.currentRoom];
    if (!room) return;
    
    const mc = bar.querySelector('.mics');
    if (!mc) return;
    mc.innerHTML = '';
    
    const user = getCurrentUser();
    const count = room.micCount || 0;
    const canUse = user && can(user, 'canUseMic');
    
    if (count === 0) {
        bar.classList.add('hidden');
        return;
    }
    bar.classList.remove('hidden');
    
    for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        btn.className = 'mic-btn';
        btn.setAttribute('data-mic', i);
        if (!canUse) btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.onclick = () => toggleMic(i);
        mc.appendChild(btn);
    }
}

function toggleMic(i) {
    const user = getCurrentUser();
    if (!can(user, 'canUseMic')) {
        showToast('fa-lock', '🔒 غير مسموح');
        return;
    }
    const btn = document.querySelector('.mic-btn[data-mic="' + i + '"]');
    if (!btn) return;
    const active = btn.classList.toggle('active');
    btn.innerHTML = active ? '<i class="fas fa-user"></i>' : '<i class="fas fa-microphone"></i>';
}

function toggleMicsBar() {
    const b = document.getElementById('mics-bar');
    const t = document.getElementById('mics-toggle-btn');
    if (b) b.classList.toggle('hidden');
    if (t) t.classList.toggle('hidden');
}

// ==============================================
// القوائم
// ==============================================
function toggleRooms() {
    const s = document.getElementById('rooms-sidebar');
    if (!s) return;
    const open = s.classList.toggle('open');
    ['notif-sidebar', 'settings-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.toggle('show', open);
}

function toggleSettings() {
    const s = document.getElementById('settings-sidebar');
    if (!s) return;
    const open = s.classList.toggle('open');
    ['rooms-sidebar', 'notif-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.toggle('show', open);
}

function toggleNotifications() {
    const s = document.getElementById('notif-sidebar');
    if (!s) return;
    const open = s.classList.toggle('open');
    ['rooms-sidebar', 'settings-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.toggle('show', open);
}

function togglePrivateMessages() {
    const s = document.getElementById('pm-sidebar');
    if (!s) return;
    const open = s.classList.toggle('open');
    ['rooms-sidebar', 'notif-sidebar', 'settings-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.toggle('show', open);
}

function closeAllPanels() {
    ['rooms-sidebar', 'settings-sidebar', 'notif-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('show');
}

// ==============================================
// أدوات
// ==============================================
function addSystemMessage(text) {
    const c = document.getElementById('messages');
    if (!c) return;
    const m = document.createElement('div');
    m.className = 'message system';
    m.textContent = text;
    c.appendChild(m);
    c.scrollTop = c.scrollHeight;
}

function handleLogout() {
    if (confirm('خروج؟')) {
        localStorage.clear();
        location.reload();
    }
}

function openProfile() {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem('profile_view_mode', 'owner');
    localStorage.setItem('profile_target_data', JSON.stringify(user));
    localStorage.setItem('qamar_current_user', JSON.stringify(user));
    const f = document.getElementById('profile-frame-container');
    if (f) f.style.display = 'block';
}

function closeProfileFrame() {
    const f = document.getElementById('profile-frame-container');
    if (f) f.style.display = 'none';
    const ifr = document.getElementById('profile-iframe');
    if (ifr) ifr.src = ifr.src;
}

function openUpgradeModal() {
    const m = document.getElementById('upgrade-modal');
    if (m) m.classList.add('active');
}
function closeUpgradeModal() {
    const m = document.getElementById('upgrade-modal');
    if (m) m.classList.remove('active');
}

function rollDice() {
    addSystemMessage('🎲 النرد: ' + (Math.floor(Math.random() * 6) + 1));
}

function searchYouTube() {
    const q = prompt('ابحث في يوتيوب:');
    if (q) window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), '_blank');
}

function insertEmoji() {
    const i = document.getElementById('message-input');
    if (i) { i.value += '😊'; i.focus(); }
}

function showOnlineUsers() { showToast('fa-users', '👥 قريباً'); }
function showStore() { showToast('fa-store', '🛒 قريباً'); }
function toggleToolbar() {
    const t = document.getElementById('floating-toolbar');
    if (t) t.classList.toggle('open');
}
function openBotProfile(uid) { showToast('fa-robot', '🤖 بوت'); }
function closeBotProfile() {
    const m = document.getElementById('bot-profile-modal');
    if (m) m.classList.remove('active');
}
function openBotTraining() {
    switchRoom('bot_training', '🤖 تدريب البوت');
}
function toggleInvisible() { showToast('fa-eye-slash', '👻 قريباً'); }
function toggleInvisible() { showToast('fa-eye-slash', '👻'); }

// ==============================================
// الأحداث
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    const u = getCurrentUser();
    if (u) setTimeout(() => initChat(), 100);
});

// إغلاق القوائم عند النقر خارجها
document.addEventListener('click', (e) => {
    if (e.target.id === 'overlay') closeAllPanels();
});

// ==============================================
// التصدير
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
window.openProfile = openProfile;
window.closeProfileFrame = closeProfileFrame;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.rollDice = rollDice;
window.searchYouTube = searchYouTube;
window.insertEmoji = insertEmoji;
window.showOnlineUsers = showOnlineUsers;
window.showStore = showStore;
window.toggleToolbar = toggleToolbar;
window.openBotProfile = openBotProfile;
window.closeBotProfile = closeBotProfile;
window.openBotTraining = openBotTraining;
window.toggleInvisible = toggleInvisible;
window.handleLogout = handleLogout;
window.changeBackground = changeBackground;
window.toArray = toArray;

console.log('✅ chat.js v2 loaded');
