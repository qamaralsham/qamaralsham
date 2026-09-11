// ==============================================
// قمر الشام - chat.js (نسخة نظيفة v1)
// ==============================================

const ChatState = {
    currentRoom: 'general',
    messagesListener: null,
    seenMessages: new Set(),
    isInitialized: false,
    lastMessageTime: 0,
    replyingTo: null
};

async function initChat() {
    console.log('🚀 initChat called');
    
    if (ChatState.isInitialized) return;
    ChatState.isInitialized = true;
    
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ لا يوجد مستخدم');
        return;
    }
    
    // إخفاء شاشة الدخول
    const ls = document.getElementById('login-screen');
    if (ls) ls.style.display = 'none';
    
    // إظهار الشات
    const cc = document.getElementById('chat-container');
    if (cc) cc.style.display = 'flex';
    
    addSystemMessage('👑 مرحباً ' + user.name);
    
    // بدء الاستماع للرسائل
    startMessagesListener();
}

function startMessagesListener() {
    if (!db) return;
    
    if (ChatState.messagesListener) {
        ChatState.messagesListener.off();
    }
    
    const ref = db.ref('room_messages/' + ChatState.currentRoom).limitToLast(20);
    ChatState.messagesListener = ref;
    
    ref.on('child_added', (snap) => {
        if (ChatState.seenMessages.has(snap.key)) return;
        ChatState.seenMessages.add(snap.key);
        
        const msg = snap.val();
        if (!msg) return;
        
        displayMessage(msg, snap.key);
    });
}

function displayMessage(msg, msgId) {
    const container = document.getElementById('messages');
    if (!container) return;
    
    const msgEl = document.createElement('div');
    msgEl.className = 'message';
    msgEl.setAttribute('data-msg-id', msgId);
    
    const username = document.createElement('div');
    username.className = 'message-username';
    username.textContent = msg.senderName || 'مجهول';
    if (msg.senderColor) username.style.color = msg.senderColor;
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = msg.text || '';
    
    msgEl.appendChild(username);
    msgEl.appendChild(text);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const text = input.value.trim();
    const user = getCurrentUser();
    if (!text || !user) return;
    
    const now = Date.now();
    if (now - ChatState.lastMessageTime < 5000) {
        alert('⏳ انتظر 5 ثواني');
        return;
    }
    ChatState.lastMessageTime = now;
    
    const msgRef = db.ref('room_messages/' + ChatState.currentRoom).push();
    msgRef.set({
        senderUid: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        senderColor: user.color || '#ffd700',
        text: text,
        time: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = '';
    }).catch(e => {
        alert('⚠️ فشل الإرسال: ' + e.message);
    });
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

function addSystemMessage(text) {
    const container = document.getElementById('messages');
    if (!container) return;
    
    const msg = document.createElement('div');
    msg.className = 'message system';
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function closeAllPanels() {
    ['rooms-sidebar', 'settings-sidebar', 'notif-sidebar', 'pm-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('show');
}

function toggleRooms() {
    const sidebar = document.getElementById('rooms-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function toggleSettings() {
    const sidebar = document.getElementById('settings-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function handleLogout() {
    if (confirm('هل تريد الخروج؟')) {
        localStorage.clear();
        location.reload();
    }
}

// ⭐ التصدير
window.ChatState = ChatState;
window.initChat = initChat;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.closeAllPanels = closeAllPanels;
window.toggleRooms = toggleRooms;
window.toggleSettings = toggleSettings;
window.handleLogout = handleLogout;

console.log('✅ chat.js v1 loaded');
