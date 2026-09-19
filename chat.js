// ==============================================
// chat.js v3.0 — أزرار قبول/رفض الصداقة
// ==============================================

const ChatState = {
    currentRoom: localStorage.getItem('qamar_last_room') || 'general',
    messagesListener: null, privateMessagesListener: null,
    notificationsListener: null, privateChatsListener: null, presenceListener: null,
    currentPrivateChat: null, minimizedChat: null, replyingTo: null,
    unreadCount: 0, unreadPrivate: 0, privateChatsCache: {},
    lastMessageTime: 0, lastPrivateMessageTime: 0,
    seenMessages: new Set(), seenPrivateMessages: new Set(),
    invisibleMode: false, isInitialized: false,
    _lastSentText: null, _lastSentAt: 0, blockedUsers: {},
    listeners: {},
    presenceInterval: null,
    _lastCodeLookup: 0,
    _punishmentCheckInterval: null,
    _friendRequestsCache: {}
};

function safeColor(c) {
    if (!c || typeof c !== 'string') return null;
    const s = c.trim();
    return /^#[0-9a-fA-F]{3,8}$|^rgb\([\d\s,.%]+\)$|^rgba\([\d\s,.%]+\)$|^hsl\([\d\s,.%]+\)$|^hsla\([\d\s,.%]+\)$/.test(s) ? s : null;
}
function safeGradient(g) {
    if (!Array.isArray(g) || g.length < 2) return null;
    const a = safeColor(g[0]);
    const b = safeColor(g[1]);
    return (a && b) ? [a, b] : null;
}

function playBirdSound(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const now=ctx.currentTime;[0,0.15,0.3].forEach((d,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';const b=2000+(i*300);o.frequency.setValueAtTime(b,now+d);o.frequency.linearRampToValueAtTime(b+800,now+d+0.05);o.frequency.linearRampToValueAtTime(b-300,now+d+0.1);g.gain.setValueAtTime(0,now+d);g.gain.linearRampToValueAtTime(0.3,now+d+0.02);g.gain.exponentialRampToValueAtTime(0.01,now+d+0.13);o.connect(g);g.connect(ctx.destination);o.start(now+d);o.stop(now+d+0.15)})}catch(e){}}
function playPrivateMsgSound(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const now=ctx.currentTime;[0,0.12].forEach((d,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(800+(i*200),now+d);o.frequency.linearRampToValueAtTime(1200+(i*200),now+d+0.08);g.gain.setValueAtTime(0,now+d);g.gain.linearRampToValueAtTime(0.25,now+d+0.02);g.gain.exponentialRampToValueAtTime(0.01,now+d+0.1);o.connect(g);g.connect(ctx.destination);o.start(now+d);o.stop(now+d+0.12)})}catch(e){}}

function cleanupAllListeners() {
    try {
        Object.values(ChatState.listeners).forEach(ref => {
            if (ref && typeof ref.off === 'function') {
                try { ref.off(); } catch (e) {}
            }
        });
        ChatState.listeners = {};

        if (ChatState.messagesListener) { try { ChatState.messagesListener.off(); } catch(e){} ChatState.messagesListener = null; }
        if (ChatState.privateMessagesListener) { try { ChatState.privateMessagesListener.off(); } catch(e){} ChatState.privateMessagesListener = null; }
        if (ChatState.notificationsListener) { try { ChatState.notificationsListener.off(); } catch(e){} ChatState.notificationsListener = null; }
        if (ChatState.privateChatsListener) { try { ChatState.privateChatsListener.off(); } catch(e){} ChatState.privateChatsListener = null; }
        if (ChatState.presenceListener) { try { ChatState.presenceListener.off(); } catch(e){} ChatState.presenceListener = null; }

        if (ChatState.presenceInterval) {
            clearInterval(ChatState.presenceInterval);
            ChatState.presenceInterval = null;
        }
        if (ChatState._punishmentCheckInterval) {
            clearInterval(ChatState._punishmentCheckInterval);
            ChatState._punishmentCheckInterval = null;
        }
        if(typeof RoomAlerts!=='undefined'&&RoomAlerts.close){try{RoomAlerts.close()}catch(e){}}
        console.log('🧹 All listeners cleaned up');
    } catch (e) {
        console.warn('cleanupAllListeners error:', e);
    }
}

async function applyRoomSettings() {
    if (typeof db === 'undefined' || !db) return;
    try {
        const snap = await db.ref('room_settings').once('value');
        const settings = snap.val() || {};
        Object.keys(settings).forEach(roomId => {
            if (QAMAR.ROOMS[roomId]) {
                if (settings[roomId].name) QAMAR.ROOMS[roomId].name = settings[roomId].name;
                if (settings[roomId].icon) QAMAR.ROOMS[roomId].icon = settings[roomId].icon;
                QAMAR.ROOMS[roomId].bgType = settings[roomId].bgType || null;
                QAMAR.ROOMS[roomId].bgValue = settings[roomId].bgValue || null;
                QAMAR.ROOMS[roomId].bgImage = settings[roomId].bgImage || null;
                QAMAR.ROOMS[roomId].iconImage = settings[roomId].iconImage || null;
            }
        });
    } catch (e) { console.warn('applyRoomSettings error:', e.message); }
}

function applyRoomBackground(roomId) {
    const container = document.getElementById('messages');
    if (!container) return;

    container.style.removeProperty('background');
    container.style.removeProperty('background-image');
    container.style.removeProperty('background-color');
    container.style.removeProperty('background-size');
    container.style.removeProperty('background-position');
    container.style.removeProperty('background-repeat');

    if (!roomId || typeof QAMAR === 'undefined' || !QAMAR.ROOMS || !QAMAR.ROOMS[roomId]) return;

    if (typeof db !== 'undefined' && db) {
        db.ref('room_settings/' + roomId).once('value').then(s => {
            var c = s.val() || {};
            var bgType = c.bgType, bgValue = c.bgValue, bgImage = c.bgImage;
            if (bgType === 'custom' && bgImage) {
                container.style.setProperty('background-image', 'url("' + bgImage + '")', 'important');
                container.style.setProperty('background-size', 'cover', 'important');
                container.style.setProperty('background-position', 'center', 'important');
            } else if (bgType === 'image' && bgValue && /^https?:\/\//i.test(bgValue)) {
                container.style.setProperty('background-image', 'url("' + bgValue + '")', 'important');
                container.style.setProperty('background-size', 'cover', 'important');
                container.style.setProperty('background-position', 'center', 'important');
            } else if (bgType === 'color' && bgValue) {
                var col = safeColor(bgValue);
                if (col) container.style.setProperty('background', col, 'important');
            } else if (bgType === 'gradient' && bgValue) {
                if (/linear-gradient|radial-gradient/i.test(bgValue) && !/[<>]/.test(bgValue)) {
                    container.style.setProperty('background', bgValue, 'important');
                }
            }
        }).catch(function () {});
    }
}

window.applyRoomSettings = applyRoomSettings;
window.applyRoomBackground = applyRoomBackground;

function startPunishmentWatcher() {
    const user = getCurrentUser();
    if (!user || !user.uid) return;

    const check = async () => {
        try {
            const snap = await db.ref('users/' + user.uid).once('value');
            const d = snap.val();
            if (!d) return;
            const now = Date.now();

            if (d.isBanned === true && d.bannedUntil && now >= d.bannedUntil) {
                await db.ref('users/' + user.uid).update({ isBanned: false, bannedUntil: 0 });
                return;
            }
            if (d.isJailed === true && d.jailUntil && now >= d.jailUntil) {
                await db.ref('users/' + user.uid).update({ isJailed: false, jailUntil: 0, jailReleasedAt: now });
                return;
            }
            if (d.isBanned === true && d.bannedUntil && now < d.bannedUntil) {
                const remaining = Math.ceil((d.bannedUntil - now) / 60000);
                cleanupAllListeners();
                if (typeof showToast === 'function') showToast('fa-ban', '🚪 أنت محظور — ' + remaining + ' دقيقة');
                try { if (typeof logout === 'function') logout(); } catch (e) {}
                setTimeout(() => location.reload(), 2500);
            }
        } catch (e) { console.warn('punishment check error:', e); }
    };

    check();
    ChatState._punishmentCheckInterval = setInterval(check, 60000);
}

function initChat(){
    if(ChatState.isInitialized)return;
    const user=getCurrentUser();
    if(!user)return;
    ChatState.isInitialized=true;
    const ls=document.getElementById('login-screen');if(ls)ls.style.display='none';
    const cc=document.getElementById('chat-container');if(cc)cc.style.display='flex';
    const sb=localStorage.getItem(QAMAR.STORAGE_KEYS.BACKGROUND);if(sb)changeBackground(sb);
    if(typeof generateStars==='function')generateStars();
    buildBackgroundsList();
    buildRoomsList();
    if(typeof applyRoomSettings==='function'){
        applyRoomSettings().then(function(){buildRoomsList();});
    }
    if(!user.isGuest){const ub=document.getElementById('upgrade-nav-btn');if(ub)ub.style.display='none'}
    addSystemMessage('👑 مرحباً '+user.name+' — رتبتك: '+getRankBadge(user.rank)+' '+user.rank);
    if(ChatState.currentRoom!=='general'){
        const room=QAMAR.ROOMS[ChatState.currentRoom];
        if(room){
            const titleEl=document.getElementById('room-title');
            if(titleEl)titleEl.innerText=room.name+' '+room.icon;
        }
    }
    startMessagesListener();startNotificationsListener();startPrivateChatsListener();
    startPresenceHeartbeat();startBlockedListener();
    if(typeof initBots==='function'){try{initBots()}catch(e){console.warn('Bots error:',e)}}
    startInvisibleListener();startUserDataListener();
    startPunishmentWatcher();
    if(typeof applyRoomBackground==='function'){applyRoomBackground(ChatState.currentRoom);}
    console.log('✅ Chat initialized | Room:', ChatState.currentRoom);
}

function startBlockedListener(){
    const user=getCurrentUser();if(!user||!user.uid||!db)return;
    const ref = db.ref('users/'+user.uid+'/blocked');
    ref.on('value',s=>{
        ChatState.blockedUsers=s.val()||{};
        Object.keys(ChatState.blockedUsers).forEach(uid=>{
            document.querySelectorAll('[data-sender-uid="'+uid+'"]').forEach(el=>el.remove());
        });
    });
    ChatState.listeners.blockedRef = ref;
}
function isBlocked(uid){if(!uid)return false;const b=ChatState.blockedUsers[uid];return b===true||(b&&b.time)}

function buildRoomsList(){
    const list=document.getElementById('rooms-list');if(!list)return;list.innerHTML='';
    const user=getCurrentUser();if(!user)return;
    const visible=QAMAR.getVisibleRooms(user);
    Object.values(visible).forEach(room=>{
        const item=document.createElement('div');item.className='sidebar-item';item.setAttribute('data-room-id',room.id);
        const i=document.createElement('span');i.innerText=room.icon;
        const n=document.createElement('span');n.innerText=room.name;
        item.appendChild(i);item.appendChild(n);
        if(room.id===ChatState.currentRoom)item.classList.add('active');
        item.onclick=()=>switchRoom(room.id,room.name+' '+room.icon);
        list.appendChild(item);
    });
}
function buildBackgroundsList(){
    const list=document.getElementById('bg-options');if(!list)return;list.innerHTML='';
    QAMAR.BACKGROUNDS.forEach(bg=>{
        const btn=document.createElement('button');btn.className='btn-outline';
        btn.style.cssText='padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;';
        btn.innerText=bg.id;btn.onclick=()=>changeBackground(bg.id);list.appendChild(btn);
    });
}
function changeBackground(bgId){
    const c=document.getElementById('chat-container');const bg=QAMAR.BACKGROUNDS.find(b=>b.id===bgId);
    if(bg&&c){QAMAR.BACKGROUNDS.forEach(b=>c.classList.remove(b.class));c.classList.add(bg.class);localStorage.setItem(QAMAR.STORAGE_KEYS.BACKGROUND,bgId)}
}

function switchRoom(roomId,roomTitle){
    const user=getCurrentUser();
    if(!QAMAR.isRoomVisible(roomId,user)){showToast('fa-lock','🔒 غير متاحة');return}
    if(ChatState.messagesListener){ChatState.messagesListener.off();ChatState.messagesListener=null}
    ChatState.currentRoom=roomId;
    localStorage.setItem('qamar_last_room', roomId);
    const t=document.getElementById('room-title');if(t)t.innerText=roomTitle;
    document.querySelectorAll('.sidebar-item[data-room-id]').forEach(el=>el.classList.toggle('active',el.getAttribute('data-room-id')===roomId));
    const mc=document.getElementById('messages');if(mc)mc.innerHTML='';
    ChatState.seenMessages.clear();
    addSystemMessage('📢 تم فتح '+roomTitle);
    updateMicsUI();startMessagesListener();
    if(typeof applyRoomBackground==='function'){applyRoomBackground(roomId);}
    if(typeof RoomAlerts!=='undefined'&&RoomAlerts.onRoomChanged){try{RoomAlerts.onRoomChanged()}catch(e){}}
    if(typeof onRoomChanged==='function'){try{onRoomChanged(roomId)}catch(e){}}
    closeAllPanels();
}

function startMessagesListener(){
    if(!db)return;
    if(ChatState.messagesListener)ChatState.messagesListener.off();
    const roomId=ChatState.currentRoom;
    const ref=db.ref('room_messages/'+roomId).limitToLast(30);
    ChatState.messagesListener=ref;
    ref.on('child_added',s=>{
        const msg=s.val();if(!msg)return;
        const user=getCurrentUser();if(!user)return;
        if(msg.senderUid&&isBlocked(msg.senderUid))return;
        const key=roomId+'_'+s.key;
        if(!ChatState.seenMessages.has(key)){ChatState.seenMessages.add(key);displayMessage(msg,s.key);if(msg.mentions&&msg.mentions.includes(user.name))playBirdSound()}
        if(typeof processIncomingMessage==='function'){try{processIncomingMessage(Object.assign({},msg,{_key:key})).catch(e=>console.warn(e))}catch(e){}}
    });
    ref.on('child_changed',s=>{
        const msg=s.val();const el=document.querySelector('[data-msg-id="'+s.key+'"]');
        if(el&&msg){
            if(msg.deleted){el.classList.add('deleted');const t=el.querySelector('.message-text');if(t)t.innerText='🚫 رسالة محذوفة'}
            else if(msg.edited){const t=el.querySelector('.message-text');if(t)t.innerText=msg.text}
        }
    });
    ref.on('child_removed',s=>{const el=document.querySelector('[data-msg-id="'+s.key+'"]');if(el)el.remove()});
}

function applyFrameToWrapper(wrapper,frameId){
    if(!frameId||frameId==='none')return;
    wrapper.querySelectorAll('.dynamic-frame-wrapper,.qcf,.avatar-frame,.qamar-frame,.qf').forEach(el=>el.remove());
    wrapper.style.position='relative';
    if(typeof applyFrameToMessage==='function'){
        applyFrameToMessage(wrapper,frameId);
        return;
    }
}

function extractCodeFromText(text){
    if(!text)return null;
    const m=text.match(/([A-Z0-9]{2,3})·([A-Z0-9]{3,4})/);
    return m?m[0]:null;
}

function buildUserCodeBadge(code){
    const badge=document.createElement('span');
    badge.className='user-code-badge';
    badge.innerHTML='🔑 '+code;
    badge.title='اضغط لعرض البروفايل';
    badge.onclick=async(e)=>{
        e.stopPropagation();
        await openProfileByCode(code);
    };
    return badge;
}

async function openProfileByCode(code){
    if(!code)return;
    const now = Date.now();
    if (now - ChatState._lastCodeLookup < 3000) {
        showToast('fa-clock','⏳ انتظر قليلاً');
        return;
    }
    ChatState._lastCodeLookup = now;
    try{
        const s=await db.ref('user_codes/'+code).once('value');
        const uid=s.val();
        if(uid){
            const ns=await db.ref('users/'+uid+'/name').once('value');
            const name=ns.val()||'عضو';
            openUserProfile(uid,name);
        }else{
            showToast('fa-user','⚠️ كود غير معروف');
        }
    }catch(e){showToast('fa-exclamation-circle','⚠️ خطأ')}
}

function displayMessage(msg,msgId){
    const container=document.getElementById('messages');if(!container)return;
    const user=getCurrentUser();
    const isBot=msg.isBot===true;
    const msgEl=document.createElement('div');
    msgEl.className='message'+(isBot?' bot':'');
    msgEl.setAttribute('data-msg-id',msgId);
    msgEl.setAttribute('data-sender',msg.senderName||'');
    msgEl.setAttribute('data-sender-uid',msg.senderUid||'');
    if(msg.mentions&&msg.mentions.includes(user?user.name:''))msgEl.classList.add('highlighted');

    const aw=document.createElement('div');aw.className='message-avatar-wrapper';
    const ai=document.createElement('img');ai.className='message-avatar';
    let url=msg.senderAvatar;
    if(!msg.isBot && msg.senderUid===(user?user.uid:'')&&user&&user.avatar)url=user.avatar;
    ai.src=url||getDefaultAvatar(msg.senderName);
    ai.alt=msg.senderName;ai.loading='lazy';
    ai.onerror=()=>{ai.src=getDefaultAvatar(msg.senderName)};
    ai.onclick=()=>{ if(msg.isBot) return; if(msg.senderUid) openUserProfile(msg.senderUid,msg.senderName); };
    aw.appendChild(ai);
    if(msg.senderFrame&&msg.senderFrame!=='none')applyFrameToWrapper(aw,msg.senderFrame);

    const content=document.createElement('div');content.className='message-content';
    const header=document.createElement('div');header.className='message-header';

    const username=document.createElement('div');username.className='message-username';
    let dn=msg.senderName||'مجهول';
    if(isBot)dn+=' 🤖';
    username.textContent=dn;

    applyUsernameStyle(username,msg);

    if(!isBot) username.onclick=()=>insertMention(msg.senderName);

    const timeEl=document.createElement('span');timeEl.className='message-time';timeEl.textContent=formatTime(msg.time);
    const optBtn=document.createElement('button');optBtn.className='message-options-btn';optBtn.textContent='⋮';
    optBtn.onclick=(e)=>{e.stopPropagation();showMessageMenu(msgEl,msg.senderName,msg.text,msgId)};
    header.appendChild(username);header.appendChild(timeEl);header.appendChild(optBtn);

    const msgText=document.createElement('div');msgText.className='message-text';
    if(msg.deleted){msgText.innerText='🚫 رسالة محذوفة';msgEl.classList.add('deleted')}
    else if(msg.mentions&&msg.mentions.length>0){msgText.appendChild(buildMentionHTML(msg.text,msg.mentions,insertMention))}
    else{
        const codeInText=extractCodeFromText(msg.text||'');
        if(codeInText&&!isBot){
            const cleanText=(msg.text||'').replace(codeInText,'').trim();
            if(cleanText){
                const tn=document.createElement('div');
                tn.textContent=cleanText;
                tn.style.marginBottom='4px';
                msgText.appendChild(tn);
            }
            const btn=document.createElement('button');
            btn.type='button';
            btn.className='profile-visit-btn';
            btn.innerHTML='👤 زيارة بروفايل';
            btn.onclick=(e)=>{
                e.stopPropagation();
                openProfileByCode(codeInText);
            };
            msgText.appendChild(btn);
        }else{
            msgText.textContent=msg.text||'';
        }
    }
    content.appendChild(header);content.appendChild(msgText);

    if(msg.attachment&&!msg.deleted){const a=buildAttachmentElement(msg.attachment);if(a)content.appendChild(a)}

    if(msg.replyTo){
        const q=document.createElement('div');q.className='reply-quote';
        const n=document.createElement('div');n.className='reply-name';n.textContent='↩ '+(msg.replyTo.senderName||'');
        const t=document.createElement('div');t.className='reply-text';t.textContent=truncate(msg.replyTo.text||'',80);
        q.appendChild(n);q.appendChild(t);
        q.onclick=()=>{const o=document.querySelector('[data-msg-id="'+msg.replyTo.id+'"]');if(o){o.scrollIntoView({behavior:'smooth',block:'center'});o.classList.add('highlighted');setTimeout(()=>o.classList.remove('highlighted'),3000)}};
        content.appendChild(q);
    }

    const reactions=document.createElement('div');reactions.className='message-reactions';
    if(msg.reactions){
        Object.entries(msg.reactions).forEach(([e,u])=>{
            const b=document.createElement('span');b.className='reaction-badge';
            if(Array.isArray(u)&&user&&u.includes(user.uid))b.classList.add('mine');
            b.textContent=e+' '+(Array.isArray(u)?u.length:0);
            b.onclick=()=>toggleReaction(msgId,e);
            reactions.appendChild(b);
        });
    }
    content.appendChild(reactions);

    msgEl.appendChild(aw);msgEl.appendChild(content);
    container.appendChild(msgEl);
    container.scrollTop=container.scrollHeight;
}

function applyUsernameStyle(username,msg){
    username.classList.remove('name-capsule','name-pill','name-rounded','name-ellipse','name-square');
    username.classList.forEach(c=>{if(c.startsWith('nf-'))username.classList.remove(c)});
    username.style.cssText = '';

    if(msg.senderNameFrame&&/^nf-[a-z0-9-]+$/.test(msg.senderNameFrame)){
        username.classList.add('nf',msg.senderNameFrame);
        username.style.color='#fff';
        username.style.textShadow='0 1px 4px rgba(0,0,0,0.95)';
    }
    else{
        const safeGrad = safeGradient(msg.senderNameGradient);
        if(safeGrad){
            username.style.background='linear-gradient(90deg,'+safeGrad[0]+','+safeGrad[1]+','+safeGrad[0]+','+safeGrad[1]+','+safeGrad[0]+')';
            username.style.backgroundSize='300% 100%';
            username.style.webkitBackgroundClip='text';
            username.style.backgroundClip='text';
            username.style.webkitTextFillColor='transparent';
            username.style.animation='nfMoveFast 1.5s linear infinite';
            username.style.color='';
        }
        else{
            const safeC = safeColor(msg.senderNameColor);
            if(safeC){
                username.style.color=safeC;
                username.style.textShadow='0 2px 8px rgba(0,0,0,0.95)';
            }
            else{
                username.style.color=safeColor(msg.senderColor)||'#ffd700';
            }
        }
    }

    if(msg.senderNameShape&&/^name-(capsule|pill|rounded|ellipse|square)$/.test(msg.senderNameShape))
        username.classList.add(msg.senderNameShape);

    if(msg.senderNameGlow){
        if(msg.senderNameGlow==='soft')username.style.filter='drop-shadow(0 0 8px currentColor)';
        else if(msg.senderNameGlow==='medium')username.style.filter='drop-shadow(0 0 15px currentColor)';
        else if(msg.senderNameGlow==='strong')username.style.filter='drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
    }

    if(msg.senderNameBgGradient && typeof applyNameBgToUsernameEl === 'function'){
        applyNameBgToUsernameEl(username, msg.senderNameBgGradient);
    }
}

function buildAttachmentElement(att){
    if(!att||!att.url)return null;
    const w=document.createElement('div');w.className='message-attachment';
    const t=att.type,u=att.url;
    if(t==='image'||t==='gif'){const i=document.createElement('img');i.src=u;i.alt='صورة';i.loading='lazy';i.onclick=()=>window.open(u,'_blank');w.appendChild(i)}
    else if(t==='audio'){const a=document.createElement('audio');a.controls=true;a.src=u;w.appendChild(a)}
    else if(t==='video'){const v=document.createElement('video');v.controls=true;v.src=u;w.appendChild(v)}
    else return null;
    return w;
}

async function sendMessage(){
    const input=document.getElementById('message-input');if(!input)return;
    const text=input.value.trim();let user=getCurrentUser();
    if(!text||!user)return;

    if (user.isBanned && user.bannedUntil && Date.now() < user.bannedUntil) {
        var mins = Math.ceil((user.bannedUntil - Date.now()) / 60000);
        showToast('fa-ban', '🚪 أنت محظور — ' + mins + ' دقيقة');
        return;
    }
    if (user.isJailed && user.jailUntil && Date.now() < user.jailUntil) {
        var jmins = Math.ceil((user.jailUntil - Date.now()) / 60000);
        showToast('fa-lock', '⛓️ أنت في السجن — ' + jmins + ' دقيقة');
        return;
    }

    const nc=Date.now();
    if(ChatState._lastSentText===text&&(nc-(ChatState._lastSentAt||0))<1500)return;
    ChatState._lastSentText=text;ChatState._lastSentAt=nc;

    const now=Date.now();
    if(now-ChatState.lastMessageTime<QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS){
        const r=Math.ceil((QAMAR.RATE_LIMIT.MESSAGE_INTERVAL_MS-(now-ChatState.lastMessageTime))/1000);
        showToast('fa-hourglass-half','⏳ انتظر '+r+' ثانية');return;
    }
    if(text.length>QAMAR.RATE_LIMIT.MAX_MESSAGE_LENGTH){showToast('fa-exclamation-triangle','⚠️ طويلة');return}
    if(isLink(text)){showToast('fa-ban','🚫 يحظر الروابط');return}

    ChatState.lastMessageTime=now;

    if(text.startsWith('!')&&typeof handleBotCommand==='function'){handleBotCommand(text);input.value='';return}

    const mentions=extractMentions(text);

    const messageData={
        senderUid:user.uid,
        senderName:user.name,
        senderCode:user.code||null,
        senderAvatar:user.avatar||'',
        senderColor:user.color||'#ffd700',
        senderRank:user.rank,
        senderFrame:user.avatarFrame||'none',
        senderNameColor:user.nameColor||user.nameBgColor||null,
        senderNameGradient:user.nameGradient||null,
        senderNameFrame:user.nameFrame||null,
        senderNameShape:user.nameShape||null,
        senderNameGlow:user.nameGlow||null,
        senderNameBgGradient:user.nameBgGradient||null,
        text:text,
        mentions:mentions,
        replyTo:ChatState.replyingTo,
        time:firebase.database.ServerValue.TIMESTAMP,
        edited:false,
        deleted:false
    };

    const msgRef=db.ref('room_messages/'+ChatState.currentRoom).push();
    const key=ChatState.currentRoom+'_'+msgRef.key;
    ChatState.seenMessages.add(key);
    msgRef.set(messageData).catch(err=>{console.error('Send error:',err);showToast('fa-exclamation-circle','⚠️ فشل الإرسال')});
    const lm=Object.assign({},messageData,{time:Date.now()});
    displayMessage(lm,msgRef.key);
    if(mentions.length>0)notifyMentions(mentions,text);
    cancelReply();input.value='';input.focus();
}

function notifyMentions(mentions,text){
    const user=getCurrentUser();if(!user)return;
    mentions.forEach(async name=>{
        if(name===user.name)return;
        try{
            const s=await db.ref('user_names/'+name).once('value');
            const uid=s.val();
            if(uid)db.ref('user_notifications/'+uid).push({fromUid:user.uid,fromName:user.name,fromAvatar:user.avatar||'',type:'mention',roomId:ChatState.currentRoom,preview:truncate(text,80),time:firebase.database.ServerValue.TIMESTAMP,read:false});
        }catch(e){}
    });
}

function handleKeyPress(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}

function startReply(sender,text,msgId){
    ChatState.replyingTo={id:msgId,senderName:sender,text:truncate(text,100)};
    const n=document.getElementById('reply-name'),t=document.getElementById('reply-text-preview'),p=document.getElementById('reply-preview');
    if(n)n.textContent=sender;
    if(t)t.textContent=truncate(text,60);
    if(p)p.classList.add('show');
    const i=document.getElementById('message-input');if(i)i.focus();
    closeAllMenus();
}
function cancelReply(){ChatState.replyingTo=null;const p=document.getElementById('reply-preview');if(p)p.classList.remove('show')}
function insertMention(name){
    const i=document.getElementById('message-input');if(!i)return;
    const v=i.value,sp=v.length>0&&!v.endsWith(' ')?' ':'';
    i.value=v+sp+'@'+name+' ';i.focus();closeAllMenus();
}

function showMessageMenu(msgEl,sender,text,msgId){
    closeAllMenus();
    const user=getCurrentUser();if(!user)return;
    const isOwner=sender===user.name;
    const canDelete=isOwner||can(user,'canDeleteAnyMessage');
    const menu=document.createElement('div');menu.className='message-menu open';

    const r=document.createElement('div');r.className='message-menu-item';r.textContent='😊 تفاعل';
    r.onclick=()=>{menu.remove();showEmojiBar(msgEl,msgId)};menu.appendChild(r);

    const rp=document.createElement('div');rp.className='message-menu-item';rp.textContent='💬 رد';
    rp.onclick=()=>startReply(sender,text,msgId);menu.appendChild(rp);

    if(isOwner&&msgId){const e=document.createElement('div');e.className='message-menu-item';e.textContent='✏️ تعديل';e.onclick=()=>editMessage(msgEl,msgId);menu.appendChild(e)}
    if(canDelete&&msgId){const d=document.createElement('div');d.className='message-menu-item danger';d.textContent='🗑️ حذف';d.onclick=()=>deleteMessage(msgEl,msgId);menu.appendChild(d)}

    const c=msgEl.querySelector('.message-content');if(c)c.appendChild(menu);
    setTimeout(()=>{const h=e=>{if(!menu.contains(e.target)){menu.remove();document.removeEventListener('click',h)}};document.addEventListener('click',h)},100);
}
function showEmojiBar(msgEl,msgId){
    closeAllMenus();
    const bar=document.createElement('div');bar.className='emoji-bar open';
    ['👍','❤️','😂','😮','😢'].forEach(e=>{const s=document.createElement('span');s.className='emoji-quick';s.textContent=e;s.onclick=()=>{toggleReaction(msgId,e);bar.remove()};bar.appendChild(s)});
    const p=document.createElement('button');p.className='emoji-plus';p.textContent='+';p.onclick=()=>{const c=prompt('🎨 إيموجي:','🎉');if(c){toggleReaction(msgId,c);bar.remove()}};bar.appendChild(p);
    const c=msgEl.querySelector('.message-content');if(c)c.appendChild(bar);
}
function closeAllMenus(){document.querySelectorAll('.message-menu,.emoji-bar').forEach(e=>e.remove())}

async function toggleReaction(msgId,emoji){
    const user=getCurrentUser();if(!user||!msgId)return;
    try{
        const ref=db.ref('room_messages/'+ChatState.currentRoom+'/'+msgId+'/reactions/'+emoji);
        const s=await ref.once('value');const u=s.val()||[];
        const i=Array.isArray(u)?u.indexOf(user.uid):-1;
        if(i>=0){u.splice(i,1);if(u.length===0)await ref.remove();else await ref.set(u)}
        else{const nu=Array.isArray(u)?u.concat([user.uid]):[user.uid];await ref.set(nu)}
    }catch(e){}
    closeAllMenus();
}

async function editMessage(msgEl,msgId){
    const t=msgEl.querySelector('.message-text');if(!t)return;
    const cur=t.innerText,nt=prompt('✏️ تعديل:',cur);
    if(nt&&nt.trim()&&nt!==cur){try{await db.ref('room_messages/'+ChatState.currentRoom+'/'+msgId).update({text:nt.trim(),edited:true})}catch(e){showToast('fa-exclamation-circle','⚠️ فشل')}}
    closeAllMenus();
}
async function deleteMessage(msgEl,msgId){
    if(!msgId)return;if(!confirm('🗑️ حذف؟'))return;
    try{await db.ref('room_messages/'+ChatState.currentRoom+'/'+msgId).update({deleted:true,text:''})}catch(e){showToast('fa-exclamation-circle','⚠️ فشل')}
    closeAllMenus();
}

function togglePrivateMessages(){
    const s=document.getElementById('pm-sidebar');if(!s)return;
    const o=s.classList.toggle('open');
    ['rooms-sidebar','notif-sidebar','settings-sidebar'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('open')});
    const ov=document.getElementById('overlay');if(ov)ov.classList.toggle('show',o);
    if(o){loadPrivateChatsList();ChatState.unreadPrivate=0;updatePMBadge()}
}
function startPrivateChatsListener(){
    const user=getCurrentUser();if(!user||!user.uid)return;
    if(ChatState.privateChatsListener)ChatState.privateChatsListener.off();
    const ref=db.ref('user_private_chats/'+user.uid);
    ChatState.privateChatsListener=ref;
    ref.on('value',s=>{
        const c=s.val()||{};ChatState.privateChatsCache=c;
        let u=0;Object.values(c).forEach(ch=>{u+=ch.unread||0});
        ChatState.unreadPrivate=u;updatePMBadge();
    });
}
function loadPrivateChatsList(){
    const list=document.getElementById('pm-list');if(!list)return;list.innerHTML='';
    const c=Object.values(ChatState.privateChatsCache||{});
    if(c.length===0){const e=document.createElement('div');e.style.cssText='text-align:center;color:var(--text-dim);font-size:12px;padding:20px;';e.textContent='لا محادثات';list.appendChild(e);return}
    c.sort((a,b)=>(b.lastTime||0)-(a.lastTime||0));
    c.forEach(ch=>{
        const i=document.createElement('div');i.className='sidebar-item';
        const img=document.createElement('img');img.src=ch.otherAvatar||getDefaultAvatar(ch.otherName);
        img.style.cssText='width:36px;height:36px;border-radius:50%;border:2px solid var(--gold);object-fit:cover;';
        const inf=document.createElement('div');inf.style.cssText='flex:1;min-width:0;';
        const n=document.createElement('div');n.style.cssText='color:#fff;font-weight:900;font-size:13px;';n.textContent=ch.otherName||'مستخدم';
        const l=document.createElement('div');l.style.cssText='color:var(--text-dim);font-size:11px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';l.textContent=ch.lastMessage||'';
        inf.appendChild(n);inf.appendChild(l);i.appendChild(img);i.appendChild(inf);
        if(ch.unread>0){const b=document.createElement('span');b.style.cssText='background:#ff4444;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:10px;display:flex;justify-content:center;align-items:center;padding:0 4px;font-weight:900;';b.textContent=ch.unread>9?'9+':ch.unread;i.appendChild(b)}
        i.onclick=()=>{closeAllPanels();openPrivateChatWith(ch.otherUid,ch.otherName,ch.otherAvatar)};
        list.appendChild(i);
    });
}
function updatePMBadge(){const b=document.getElementById('pm-badge');if(!b)return;if(ChatState.unreadPrivate>0){b.textContent=ChatState.unreadPrivate>9?'9+':ChatState.unreadPrivate;b.style.display='flex'}else b.style.display='none'}
function openPrivateChatWith(uid,name,av){
    const user=getCurrentUser();if(!user||!user.uid){showToast('fa-user','سجّل دخول');return}
    if(uid===user.uid)return;
    if (isBlocked(uid)) { showToast('fa-ban', '🚫 هذا المستخدم محظور'); return; }
    ChatState.currentPrivateChat={otherUid:uid,otherName:name||'مستخدم',otherAvatar:av||getDefaultAvatar(name)};
    const a=document.getElementById('pc-avatar'),n=document.getElementById('pc-name'),st=document.getElementById('pc-status'),m=document.getElementById('private-chat-modal');
    if(a)a.src=ChatState.currentPrivateChat.otherAvatar;
    if(n)n.textContent=ChatState.currentPrivateChat.otherName;
    if(st)st.textContent='نشط';
    if(m)m.classList.add('open');
    const min=document.getElementById('minimized-chat-avatar');if(min)min.classList.remove('show');
    ChatState.minimizedChat=null;
    ChatState.seenPrivateMessages.clear();loadPrivateMessages();
}
function loadPrivateMessages(){
    if(!ChatState.currentPrivateChat)return;
    if(ChatState.privateMessagesListener)ChatState.privateMessagesListener.off();
    const user=getCurrentUser();const c=document.getElementById('pc-messages');if(c)c.innerHTML='';
    const o=ChatState.currentPrivateChat.otherUid;
    const ref=db.ref('user_private_messages/'+user.uid+'/'+o).limitToLast(50);
    ChatState.privateMessagesListener=ref;
    ref.on('child_added',s=>{
        if(ChatState.seenPrivateMessages.has(s.key))return;
        ChatState.seenPrivateMessages.add(s.key);
        const m=s.val();if(!m)return;
        const isSent=m.fromUid===user.uid;
        displayPrivateMsg(m,isSent);
        if(!isSent&&!m.read){
            db.ref('user_private_messages/'+user.uid+'/'+o+'/'+s.key+'/read').set(true).catch(()=>{});
            db.ref('user_private_chats/'+user.uid+'/'+o+'/unread').transaction(c=>{if(c===null||c===undefined)return 0;return Math.max(0,c-1)});
        }
    });
}
function displayPrivateMsg(msg,isSent){
    const c=document.getElementById('pc-messages');if(!c)return;
    const e=document.createElement('div');e.className='pc-msg '+(isSent?'sent':'received');
    if(msg.deleted){e.textContent='🚫 محذوفة';e.style.opacity='0.5';e.style.fontStyle='italic'}else e.appendChild(document.createTextNode(msg.text||''));
    const t=document.createElement('div');t.className='pc-msg-time';t.textContent=formatTime(msg.time);
    e.appendChild(t);c.appendChild(e);c.scrollTop=c.scrollHeight;
}

async function sendPrivateMsg(){
    const i=document.getElementById('pc-input');if(!i)return;
    const text=i.value.trim();if(!text||!ChatState.currentPrivateChat)return;
    const user=getCurrentUser();if(!user||!user.uid)return;
    const now=Date.now();
    if(now-ChatState.lastPrivateMessageTime<QAMAR.RATE_LIMIT.PRIVATE_MESSAGE_INTERVAL_MS){const r=Math.ceil((QAMAR.RATE_LIMIT.PRIVATE_MESSAGE_INTERVAL_MS-(now-ChatState.lastPrivateMessageTime))/1000);showToast('fa-hourglass-half','⏳ '+r+'ث');return}
    ChatState.lastPrivateMessageTime=now;
    const o=ChatState.currentPrivateChat.otherUid;
    const ts=firebase.database.ServerValue.TIMESTAMP;
    const md={fromUid:user.uid,toUid:o,text:text,time:ts,read:false,deleted:false};

    const msgKey = db.ref('user_private_messages/'+user.uid+'/'+o).push().key;

    try{
        await Promise.all([
            db.ref('user_private_messages/'+user.uid+'/'+o+'/'+msgKey).set(Object.assign({},md,{read:true})),
            db.ref('user_private_messages/'+o+'/'+user.uid+'/'+msgKey).set(md),
            db.ref('user_private_chats/'+user.uid+'/'+o).update({otherUid:o,otherName:ChatState.currentPrivateChat.otherName,otherAvatar:ChatState.currentPrivateChat.otherAvatar,lastMessage:truncate(text,50),lastTime:Date.now()}),
            db.ref('user_private_chats/'+o+'/'+user.uid).update({otherUid:user.uid,otherName:user.name,otherAvatar:user.avatar||'',lastMessage:truncate(text,50),lastTime:Date.now()})
        ]);
        db.ref('user_private_chats/'+o+'/'+user.uid+'/unread').transaction(c=>(c||0)+1);
        ChatState.seenPrivateMessages.add(msgKey);
        db.ref('user_notifications/'+o).push({fromUid:user.uid,fromName:user.name,fromAvatar:user.avatar||'',type:'private',preview:truncate(text,80),time:firebase.database.ServerValue.TIMESTAMP,read:false});
        i.value='';i.focus();
    }catch(e){showToast('fa-exclamation-circle','⚠️ فشل')}
}

function toggleNotifications(){
    const s=document.getElementById('notif-sidebar');if(!s)return;
    const o=s.classList.toggle('open');
    ['rooms-sidebar','settings-sidebar','pm-sidebar'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('open')});
    const ov=document.getElementById('overlay');if(ov)ov.classList.toggle('show',o);
    if(o){loadNotifications();ChatState.unreadCount=0;updateNotifBadge();markAllNotificationsRead()}
}
function startNotificationsListener(){
    const user=getCurrentUser();if(!user||!user.uid)return;
    if(ChatState.notificationsListener)ChatState.notificationsListener.off();
    const ref=db.ref('user_notifications/'+user.uid).limitToLast(20);
    ChatState.notificationsListener=ref;
    ref.on('child_added',s=>{
        const n=s.val();if(!n)return;
        const age=Date.now()-(n.time||0);
        if(age<30000&&!n.read){
            if(n.type==='mention'){playBirdSound();showToast('fa-bell','🔔 '+n.fromName+' أشار إليك')}
            else if(n.type==='private')playPrivateMsgSound();
            ChatState.unreadCount++;updateNotifBadge();
        }
    });
}
function loadNotifications(){
    const user=getCurrentUser();if(!user||!user.uid)return;
    const list=document.getElementById('notif-list');if(!list)return;list.innerHTML='';
    db.ref('user_notifications/'+user.uid).limitToLast(50).once('value',s=>{
        const arr=[];s.forEach(c=>arr.push(Object.assign({id:c.key},c.val())));arr.reverse();
        if(arr.length===0){const e=document.createElement('div');e.style.cssText='text-align:center;color:var(--text-dim);font-size:12px;padding:20px;';e.textContent='لا إشعارات';list.appendChild(e);return}
        arr.forEach(n=>{
            var el = buildNotificationElement(n);
            el.dataset.notifId = n.id;
            list.appendChild(el);
        });
    });
}
/* ⭐⭐⭐ buildNotificationElement — مع أزرار قبول/رفض الصداقة */
function buildNotificationElement(n){
    const i=document.createElement('div');i.className='notif-item';if(!n.read)i.classList.add('unread');
    const img=document.createElement('img');img.src=n.fromAvatar||getDefaultAvatar(n.fromName);img.style.cssText='width:32px;height:32px;border-radius:50%;border:1px solid var(--gold);flex-shrink:0;';
    const inf=document.createElement('div');inf.style.cssText='flex:1;min-width:0;';
    const nm=document.createElement('div');nm.style.cssText='color:var(--gold);font-weight:900;font-size:12px;';nm.textContent=n.fromName||'';
    const t=document.createElement('div');t.style.cssText='color:var(--text-dim);font-size:11px;margin-top:2px;word-break:break-word;';
    if(n.type==='mention'){const r=QAMAR.ROOMS[n.roomId];t.textContent='📢 أشار في '+(r?r.name:n.roomId)}
    else if(n.type==='private')t.textContent='💬 '+(n.preview||'رسالة');
    else if(n.type==='friend_request')t.textContent='➕ طلب صداقة';
    else if(n.type==='friend_accepted')t.textContent='✅ '+(n.preview||'قبل صداقتك');
    else if(n.type==='like')t.textContent='❤️ '+(n.preview||'أعجب بك');
    else if(n.type==='poke')t.textContent='👋 '+(n.preview||'نكزك');
    else t.textContent=n.preview||'';

    const tm=document.createElement('div');tm.style.cssText='color:#666;font-size:10px;margin-top:2px;';tm.textContent=formatTime(n.time);

    inf.appendChild(nm);inf.appendChild(t);inf.appendChild(tm);

    // ⭐⭐ أزرار قبول/رفض الصداقة
    var acceptBtn = null, rejectBtn = null;
    if (n.type === 'friend_request' && n.fromUid) {
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:6px;margin-top:8px;';

        acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.textContent = '✅ قبول';
        acceptBtn.style.cssText = 'flex:1;padding:6px 10px;background:#84cc16;color:#fff;border:none;border-radius:8px;font-family:Cairo,sans-serif;font-weight:900;font-size:11px;cursor:pointer;';
        acceptBtn.onclick = function (e) {
            e.stopPropagation();
            var me = getCurrentUser();
            if (me && me.uid) {
                acceptFriendRequest(me.uid, n.fromUid, n.fromName, n.fromAvatar, i, acceptBtn, rejectBtn);
            }
        };

        rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.textContent = '❌ رفض';
        rejectBtn.style.cssText = 'flex:1;padding:6px 10px;background:rgba(255,68,68,0.85);color:#fff;border:none;border-radius:8px;font-family:Cairo,sans-serif;font-weight:900;font-size:11px;cursor:pointer;';
        rejectBtn.onclick = function (e) {
            e.stopPropagation();
            var me = getCurrentUser();
            if (me && me.uid) {
                rejectFriendRequest(me.uid, n.fromUid, i, acceptBtn, rejectBtn);
            }
        };

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        inf.appendChild(actions);
    }

    i.appendChild(img);i.appendChild(inf);

    // ⭐ عند الضغط على الإشعار (باستثناء الأزرار)
    i.onclick=(e)=>{
        if (e.target.closest('button')) return;
        if(n.type==='mention'&&n.roomId&&QAMAR.ROOMS[n.roomId]){const r=QAMAR.ROOMS[n.roomId];switchRoom(n.roomId,r.name+' '+r.icon)}
        else if(n.type==='private'&&n.fromUid)openPrivateChatWith(n.fromUid,n.fromName,n.fromAvatar);
        else if((n.type==='like'||n.type==='poke'||n.type==='friend_request'||n.type==='friend_accepted')&&n.fromUid)openUserProfile(n.fromUid,n.fromName);
        closeAllPanels();
    };
    return i;
}

/* ⭐⭐⭐ قبول طلب صداقة */
async function acceptFriendRequest(myUid, fromUid, fromName, fromAvatar, notifEl, acceptBtn, rejectBtn) {
    if (!myUid || !fromUid) return;

    if (acceptBtn) { acceptBtn.disabled = true; acceptBtn.textContent = '⏳'; }
    if (rejectBtn) rejectBtn.disabled = true;

    try {
        const now = Date.now();
        const myData = getCurrentUser() || {};

        await Promise.all([
            db.ref('users/' + myUid + '/friends/' + fromUid).set({
                status: 'accepted',
                time: now,
                name: fromName || 'صديق',
                avatar: fromAvatar || ''
            }),
            db.ref('users/' + fromUid + '/friends/' + myUid).set({
                status: 'accepted',
                time: now,
                name: myData.name || 'صديق',
                avatar: myData.avatar || ''
            })
        ]);

        try {
            await db.ref('user_notifications/' + fromUid).push({
                fromUid: myUid,
                fromName: myData.name || 'صديق',
                fromAvatar: myData.avatar || '',
                type: 'friend_accepted',
                icon: '✅',
                preview: 'قبل صداقتك',
                time: Date.now(),
                read: false
            });
        } catch(e) { console.warn('send friend_accepted notif failed:', e); }

        if (notifEl && notifEl.dataset && notifEl.dataset.notifId) {
            db.ref('user_notifications/' + myUid + '/' + notifEl.dataset.notifId).remove().catch(()=>{});
        }

        if (acceptBtn) { acceptBtn.textContent = '✅ تم'; acceptBtn.style.background = '#65a30d'; }
        if (rejectBtn) rejectBtn.style.display = 'none';

        if (typeof showToast === 'function') showToast('fa-check', '✅ تمت الصداقة');
    } catch(e) {
        console.error('[acceptFriendRequest] فشل:', e);
        if (typeof showToast === 'function') showToast('fa-times', '⚠️ فشل القبول');
        if (acceptBtn) { acceptBtn.disabled = false; acceptBtn.textContent = '✅ قبول'; }
        if (rejectBtn) rejectBtn.disabled = false;
    }
}

/* ⭐⭐⭐ رفض طلب صداقة */
async function rejectFriendRequest(myUid, fromUid, notifEl, acceptBtn, rejectBtn) {
    if (!myUid || !fromUid) return;

    if (acceptBtn) acceptBtn.disabled = true;
    if (rejectBtn) { rejectBtn.disabled = true; rejectBtn.textContent = '⏳'; }

    try {
        if (notifEl && notifEl.dataset && notifEl.dataset.notifId) {
            await db.ref('user_notifications/' + myUid + '/' + notifEl.dataset.notifId).remove();
        }

        if (notifEl) {
            notifEl.style.opacity = '0.4';
            if (acceptBtn) acceptBtn.style.display = 'none';
            if (rejectBtn) { rejectBtn.textContent = '❌ مرفوض'; rejectBtn.style.background = '#666'; }
        }

        if (typeof showToast === 'function') showToast('fa-times', '❌ تم الرفض');
    } catch(e) {
        console.error('[rejectFriendRequest] فشل:', e);
        if (acceptBtn) acceptBtn.disabled = false;
        if (rejectBtn) { rejectBtn.disabled = false; rejectBtn.textContent = '❌ رفض'; }
    }
}

window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;

function updateNotifBadge(){const b=document.getElementById('notif-badge');if(!b)return;if(ChatState.unreadCount>0){b.textContent=ChatState.unreadCount>9?'9+':ChatState.unreadCount;b.style.display='flex'}else b.style.display='none'}
function markAllNotificationsRead(){
    const user=getCurrentUser();if(!user||!user.uid)return;
    db.ref('user_notifications/'+user.uid).limitToLast(50).once('value',s=>{
        const u={};s.forEach(c=>{if(!c.val().read)u[c.key+'/read']=true});
        if(Object.keys(u).length>0)db.ref('user_notifications/'+user.uid).update(u);
    });
}

function startPresenceHeartbeat(){
    const user=getCurrentUser();if(!user||!user.uid)return;
    const ref=db.ref('user_presence/'+user.uid);
    const setOn=()=>ref.set({state:'online',lastChanged:Date.now(),room:ChatState.currentRoom}).catch(()=>{});
    const setOff=()=>ref.set({state:'offline',lastChanged:Date.now(),room:ChatState.currentRoom}).catch(()=>{});
    setOn();
    ChatState.presenceInterval = setInterval(setOn,30000);
    window.addEventListener('beforeunload',setOff);
    ref.onDisconnect().set({state:'offline',lastChanged:Date.now()});
}

function startInvisibleListener(){
    const u=getCurrentUser();if(!u||!u.uid)return;
    const ref = db.ref('users/'+u.uid+'/invisible');
    ref.on('value',s=>{ChatState.invisibleMode=s.val()===true});
    ChatState.listeners.invisibleRef = ref;
}
async function toggleInvisible(){
    const u=getCurrentUser();if(!u||!u.uid)return;
    if(!can(u,'canInvisible')){showToast('fa-lock','🔒 للملك/الملكة');return}
    const nv=!ChatState.invisibleMode;
    try{await db.ref('users/'+u.uid+'/invisible').set(nv);ChatState.invisibleMode=nv;showToast('fa-eye-slash',nv?'👻 مُفعَّل':'👁️ مُعطَّل')}catch(e){showToast('fa-exclamation-circle','⚠️ فشل')}
}

function updateMicsUI(){
    const mb=document.getElementById('mics-bar');if(!mb)return;
    const r=QAMAR.ROOMS[ChatState.currentRoom];if(!r)return;
    const mc=mb.querySelector('.mics');if(!mc)return;mc.innerHTML='';
    const u=getCurrentUser();const count=r.micCount||0;const canUse=u&&can(u,'canUseMic');
    if(count===0){mb.classList.add('hidden');return}
    mb.classList.remove('hidden');
    for(let i=0;i<count;i++){
        const b=document.createElement('button');b.className='mic-btn';b.setAttribute('data-mic',i);
        if(!canUse)b.disabled=true;
        const ic=document.createElement('i');ic.className='fas fa-microphone';b.appendChild(ic);
        b.onclick=()=>toggleMic(i);mc.appendChild(b);
    }
}
function toggleMic(i){
    const u=getCurrentUser();if(!u)return;
    if(!can(u,'canUseMic')){showToast('fa-lock','🔒 لا تستطيع');return}
    const b=document.querySelector('.mic-btn[data-mic="'+i+'"]');if(!b)return;
    const a=b.classList.toggle('active');const ic=b.querySelector('i');if(ic)ic.className=a?'fas fa-user':'fas fa-microphone';
}

function toggleMicsBar(){
    const m=document.getElementById('mics-bar');
    const t=document.getElementById('mics-toggle-btn');
    if(m)m.classList.toggle('hidden');
    if(t){
        t.classList.toggle('collapsed');
        const ic = t.querySelector('i');
        if(ic) ic.className = (m && m.classList.contains('hidden')) ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
}

function toggleRooms(){
    const s=document.getElementById('rooms-sidebar');if(!s)return;
    const o=s.classList.toggle('open');
    ['notif-sidebar','settings-sidebar','pm-sidebar'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('open')});
    const ov=document.getElementById('overlay');if(ov)ov.classList.toggle('show',o);
}
function toggleSettings(){
    const s=document.getElementById('settings-sidebar');if(!s)return;
    const o=s.classList.toggle('open');
    ['rooms-sidebar','notif-sidebar','pm-sidebar'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('open')});
    const ov=document.getElementById('overlay');if(ov)ov.classList.toggle('show',o);
}
function closeAllPanels(){
    ['rooms-sidebar','settings-sidebar','notif-sidebar','pm-sidebar','users-sidebar'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('open')});
    const ov=document.getElementById('overlay');if(ov)ov.classList.remove('show');
}

function addSystemMessage(text){
    const c=document.getElementById('messages');if(!c)return;
    const m=document.createElement('div');m.className='message system';m.textContent=text;
    c.appendChild(m);c.scrollTop=c.scrollHeight;
}

function openUserProfile(uid,name){
    const user=getCurrentUser();if(!user)return;
    if(uid===user.uid){openProfile();return}
    if(!uid){showToast('fa-user','لا يمكن');return}
    localStorage.setItem('profile_target_uid',uid);
    localStorage.setItem('profile_target_name',name);
    localStorage.setItem('profile_view_mode','visitor');
    const i=document.getElementById('profile-iframe');
    if(i)i.src='profile.html?uid='+encodeURIComponent(uid)+'&t='+Date.now();
    const f=document.getElementById('profile-frame-container');
    if(f){f.style.display='block';const rb=f.querySelector('.close-btn');if(rb)rb.style.display='none'}
}
function openProfile(){
    const user=getCurrentUser();if(!user)return;
    localStorage.setItem('profile_view_mode','owner');
    localStorage.setItem('profile_target_uid',user.uid);
    const i=document.getElementById('profile-iframe');
    if(i)i.src='profile.html?owner=1&t='+Date.now();
    const f=document.getElementById('profile-frame-container');
    if(f){f.style.display='block';const rb=f.querySelector('.close-btn');if(rb)rb.style.display='none'}
}
function closeProfileFrame(){
    const f=document.getElementById('profile-frame-container');if(f)f.style.display='none';
    const i=document.getElementById('profile-iframe');if(i)i.src='about:blank';
}

function toggleToolbar(){const t=document.getElementById('floating-toolbar'),b=document.getElementById('plus-btn');if(t)t.classList.toggle('open');if(b)b.classList.toggle('active')}
function rollDice(){addSystemMessage('🎲 '+(Math.floor(Math.random()*6)+1));toggleToolbar()}
function searchYouTube(){const q=prompt('🔍 يوتيوب:');if(q)window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q),'_blank');toggleToolbar()}
function insertEmoji(){const i=document.getElementById('message-input');if(i){i.value+='😊';i.focus()}}
function showOnlineUsers(){closeAllPanels();showToast('fa-users','👥 قريباً')}
function showStore(){closeAllPanels();showToast('fa-store','🛒 قريباً')}
function openUpgradeModal(){const u=getCurrentUser();if(!u||!u.isGuest){showToast('fa-check','✅ أنت عضو');return}const m=document.getElementById('upgrade-modal');if(m)m.classList.add('active')}
function closeUpgradeModal(){const m=document.getElementById('upgrade-modal');if(m)m.classList.remove('active')}

async function handleLogout(){
    if(!confirm('تأكيد الخروج؟'))return;
    cleanupAllListeners();
    await logout();
    location.reload();
}

window.addEventListener('DOMContentLoaded',()=>{const u=getCurrentUser();if(u)setTimeout(()=>{if(typeof initChat==='function')initChat()},100)});
document.addEventListener('DOMContentLoaded',()=>{const o=document.getElementById('overlay');if(o)o.addEventListener('click',closeAllPanels)});
document.addEventListener('DOMContentLoaded',()=>{
    const mn=document.getElementById('pc-minimize'),cn=document.getElementById('pc-close');
    if(mn)mn.onclick=()=>{if(!ChatState.currentPrivateChat)return;ChatState.minimizedChat=Object.assign({},ChatState.currentPrivateChat);const m=document.getElementById('private-chat-modal');if(m)m.classList.remove('open');const mi=document.getElementById('mca-img');if(mi)mi.src=ChatState.currentPrivateChat.otherAvatar;const mv=document.getElementById('minimized-chat-avatar');if(mv)mv.classList.add('show')};
    if(cn)cn.onclick=()=>{if(ChatState.privateMessagesListener){ChatState.privateMessagesListener.off();ChatState.privateMessagesListener=null}const m=document.getElementById('private-chat-modal');if(m)m.classList.remove('open');ChatState.currentPrivateChat=null;ChatState.minimizedChat=null;const mv=document.getElementById('minimized-chat-avatar');if(mv)mv.classList.remove('show')};
});
function restorePrivateChat(){if(!ChatState.minimizedChat)return;const c=ChatState.minimizedChat;openPrivateChatWith(c.otherUid,c.otherName,c.otherAvatar)}

window.addEventListener('message',e=>{
    if(e.data&&e.data.action==='openPrivateChat')openPrivateChatWith(e.data.uid,e.data.name,e.data.avatar||'');
    if(e.data&&e.data.action==='closeProfile')closeProfileFrame();
    if(e.data&&e.data.action==='openUserProfile'&&e.data.uid)openUserProfile(e.data.uid,e.data.name);
    if(e.data&&e.data.action==='userDataUpdated'&&e.data.userData){
        const u=e.data.userData;
        if(typeof saveSession==='function')saveSession(u,u.isGuest===true);
        if(u.avatarFrame!==undefined)refreshAvatarsInMessages(u.avatarFrame);
        refreshNameStylesInMessages(u);
    }
});

function refreshAvatarsInMessages(newFrame){
    const u=getCurrentUser();if(!u||!u.uid)return;
    document.querySelectorAll('[data-sender-uid="'+u.uid+'"] .message-avatar-wrapper').forEach(w=>{
        w.querySelectorAll('.dynamic-frame-wrapper,.qcf,.avatar-frame,.qamar-frame,.qf').forEach(e=>e.remove());
        if(newFrame&&newFrame!=='none')applyFrameToWrapper(w,newFrame);
    });
}

function refreshNameStylesInMessages(userData){
    const u=getCurrentUser();if(!u||!u.uid)return;
    document.querySelectorAll('[data-sender-uid="'+u.uid+'"]').forEach(msgEl=>{
        const un=msgEl.querySelector('.message-username');
        if(!un)return;
        un.textContent=userData.name||u.name||'مجهول';
        applyUsernameStyle(un,{
            senderColor:userData.color||'#ffd700',
            senderNameColor:userData.nameColor||userData.nameBgColor||null,
            senderNameGradient:userData.nameGradient||null,
            senderNameFrame:userData.nameFrame||null,
            senderNameShape:userData.nameShape||null,
            senderNameGlow:userData.nameGlow||null,
            senderNameBgGradient:userData.nameBgGradient||null
        });
    });
}

window.refreshAvatarsInMessages=refreshAvatarsInMessages;
window.refreshNameStylesInMessages=refreshNameStylesInMessages;

function startUserDataListener(){
    const u=getCurrentUser();if(!u||!u.uid)return;
    let lastRelevant = '';
    const ref = db.ref('users/'+u.uid);
    ref.on('value',s=>{
        const d=s.val();if(!d)return;
        const relevant = JSON.stringify({
            name: d.name, avatar: d.avatar, avatarFrame: d.avatarFrame,
            nameColor: d.nameColor, nameGradient: d.nameGradient,
            nameFrame: d.nameFrame, nameShape: d.nameShape, nameGlow: d.nameGlow,
            nameBgGradient: d.nameBgGradient,
            isBanned: d.isBanned, bannedUntil: d.bannedUntil,
            isJailed: d.isJailed, jailUntil: d.jailUntil
        });
        if (relevant === lastRelevant) return;
        lastRelevant = relevant;

        const c=JSON.parse(localStorage.getItem('qamar_current_user')||'{}');
        const up=Object.assign({},c,d);
        if(typeof saveSession==='function')saveSession(up,up.isGuest===true);
        refreshAvatarsInMessages(d.avatarFrame);
        refreshNameStylesInMessages(d);
    });
    ChatState.listeners.userDataRef = ref;
}
window.startUserDataListener=startUserDataListener;

window.ChatState=ChatState;
window.initChat=initChat;
window.sendMessage=sendMessage;
window.handleKeyPress=handleKeyPress;
window.switchRoom=switchRoom;
window.toggleMic=toggleMic;
window.toggleMicsBar=toggleMicsBar;
window.toggleRooms=toggleRooms;
window.toggleSettings=toggleSettings;
window.toggleNotifications=toggleNotifications;
window.togglePrivateMessages=togglePrivateMessages;
window.closeAllPanels=closeAllPanels;
window.startReply=startReply;
window.cancelReply=cancelReply;
window.insertMention=insertMention;
window.editMessage=editMessage;
window.deleteMessage=deleteMessage;
window.toggleReaction=toggleReaction;
window.sendPrivateMsg=sendPrivateMsg;
window.restorePrivateChat=restorePrivateChat;
window.openUserProfile=openUserProfile;
window.openProfile=openProfile;
window.closeProfileFrame=closeProfileFrame;
window.toggleToolbar=toggleToolbar;
window.rollDice=rollDice;
window.searchYouTube=searchYouTube;
window.insertEmoji=insertEmoji;
window.showOnlineUsers=showOnlineUsers;
window.showStore=showStore;
window.openUpgradeModal=openUpgradeModal;
window.closeUpgradeModal=closeUpgradeModal;
window.handleLogout=handleLogout;
window.toggleInvisible=toggleInvisible;
window.changeBackground=changeBackground;
window.applyFrameToWrapper=applyFrameToWrapper;
window.openProfileByCode=openProfileByCode;
window.cleanupAllListeners=cleanupAllListeners;
window.startPunishmentWatcher=startPunishmentWatcher;
window.applyRoomSettings=applyRoomSettings;
window.applyRoomBackground=applyRoomBackground;
window.buildRoomsList=buildRoomsList;

console.log('✅ chat.js v3.0 loaded — friend request accept/reject');
