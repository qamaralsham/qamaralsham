// ==============================================
// profile-core.js v2.1 — كامل + قفل الوميض
// ==============================================

let currentUser = null, targetUser = null, viewMode = 'owner';
let bgType = 'color', bgValue = '#050508', musicURL = null, musicPlaying = false;
let nameColor = null, nameGradient = null, nameFrame = null, nameShape = null, nameGlow = 'none';
let nameSize = 20;
let frameInset = -8;
let _localLockUntil = 0;

const IMGBB = '80fd32c4ef79b5f25fbcf0893547de4f';
const FRAMES = [];

const COLORS = ['#ffffff','#000000','#ffd700','#ff8c00','#ff69b4','#ff1493','#e0115f','#ff4757','#ff0000','#ff6347','#ff4500','#ffa500','#feca57','#ffff00','#adff2f','#39ff14','#00cc00','#00ff88','#2ecc71','#00b894','#00f3ff','#00bfff','#00bcd4','#1e90ff','#3498db','#0066ff','#0000ff','#8a2be2','#a855f7','#7c3aed','#6c5ce7','#9b59b6','#ff00ff','#da70d6','#e84393','#c0c0c0','#808080','#696969','#8b4513','#ff006e'];

const GRADS = [['#ffd700','#ff8c00'],['#ff69b4','#ff1493'],['#00f3ff','#0066ff'],['#39ff14','#00cc00'],['#a855f7','#7c3aed'],['#e0115f','#ff4757'],['#feca57','#ff9f43'],['#00b894','#0984e3'],['#fd79a8','#e84393'],['#6c5ce7','#a29bfe'],['#74b9ff','#0984e3'],['#55efc4','#00b894'],['#ffeaa7','#fdcb6e'],['#e17055','#d35400'],['#81ecec','#00cec9'],['#fab1a0','#e17055'],['#ffffff','#cccccc'],['#000000','#333333'],['#ffd700','#ff006e'],['#00ff88','#0066ff'],['#ff0055','#ffd700'],['#8b00ff','#ff006e'],['#00f3ff','#ff00ff'],['#ffcc00','#ff6699'],['#00ffcc','#0066ff'],['#ff66cc','#9900ff'],['#ffaa00','#ff0000'],['#00ccff','#6600ff'],['#ff8c00','#ff1493'],['#c0c0c0','#ffd700']];

const FRAMES_LIST = [
    {id:'nf-rainbow'},{id:'nf-fire'},{id:'nf-smoke'},{id:'nf-fog'},
    {id:'nf-waves'},{id:'nf-galaxy'},{id:'nf-stars'},{id:'nf-snow'},
    {id:'nf-sunset'},{id:'nf-neon'},{id:'nf-gold'},{id:'nf-diamond'},
    {id:'nf-ocean'},{id:'nf-blood'},{id:'nf-forest'},{id:'nf-ruby'},
    {id:'nf-emerald'},{id:'nf-sapphire'},{id:'nf-lava'},{id:'nf-aurora'},
    {id:'nf-cyber'},{id:'nf-lightning'},{id:'nf-sparkle'},{id:'nf-butterflies'},
    {id:'nf-clouds'},{id:'nf-water'},{id:'nf-waterfall'},{id:'nf-streams'},
    {id:'nf-blossom'},{id:'nf-leaves'},{id:'nf-hearts'},{id:'nf-sun'},
    {id:'nf-crystal'},{id:'nf-magic'},{id:'nf-royal'},{id:'nf-rainbowstraight'},
    {id:'nf-rainbowtext'},{id:'nf-starstext'},{id:'nf-watertext'},{id:'nf-firetext'},
    {id:'nf-icetext'},{id:'nf-goldtext'},{id:'nf-fogtext'},{id:'nf-smoketext'},
    {id:'nf-spiral-rainbow'},{id:'nf-spiral-fire'},{id:'nf-spiral-gold'},
    {id:'nf-spiral-ocean'},{id:'nf-spiral-purple'},{id:'nf-spiral-neon'},
    {id:'nf-spiral-candy'},{id:'nf-spiral-galaxy'},{id:'nf-spiral-emerald'},
    {id:'nf-spiral-ruby'}
];

const SHAPES = [
    {id:'name-capsule', name:'كبسولة'},
    {id:'name-pill', name:'حبة'},
    {id:'name-rounded', name:'مستدير'},
    {id:'name-ellipse', name:'بيضاوي'},
    {id:'name-square', name:'مربع'}
];

const GLOWS = [
    {id:'none', name:'بدون'},
    {id:'soft', name:'خفيف'},
    {id:'medium', name:'متوسط'},
    {id:'strong', name:'قوي'}
];

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || 'null');
    } catch(e) { return null; }
}

function rankBadge(r) {
    const b = {King:'👑',Queen:'👸','Master Owner':'🌟','Room Owner':'🛡️','Grand Owner':'💎',Owner:'🏆','Super Admin':'🎖️',Admin:'🛠️',Premium:'💠',User:'👤'};
    return b[r] || '👤';
}

function toast(m) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(15,15,20,0.95);border:1px solid #ffd700;border-radius:12px;padding:12px 20px;color:#fff;font-size:13px;font-weight:600;z-index:10000;font-family:Cairo,sans-serif;max-width:80vw';
    t.innerText = m;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function openModal(id) { const m = document.getElementById(id); if(m) m.classList.add('active'); }
function closeModal(id) { const m = document.getElementById(id); if(m) m.classList.remove('active'); }

function timeAgo(ts) {
    if (!ts) return '—';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'الآن';
    const m = Math.floor(s / 60);
    if (m < 60) return 'قبل ' + m + ' دقيقة';
    const h = Math.floor(m / 60);
    if (h < 24) return 'قبل ' + h + ' ساعة';
    const d = Math.floor(h / 24);
    if (d < 30) return 'قبل ' + d + ' يوم';
    return new Date(ts).toLocaleDateString('ar');
}

function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal')) e.target.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(location.search);
    const urlUid = params.get('uid');
    const isOwner = params.get('owner');
    currentUser = getUser();

    if (isOwner || !urlUid) {
        viewMode = 'owner';
        targetUser = currentUser;
    } else {
        viewMode = 'visitor';
        targetUser = null;
        try {
            const c = localStorage.getItem('profile_target_data_' + urlUid);
            if (c) targetUser = JSON.parse(c);
        } catch(e) {}
        if (!targetUser && typeof db !== 'undefined' && db) {
            try {
                const s = await db.ref('users/' + urlUid).once('value');
                targetUser = s.val();
                if (targetUser) localStorage.setItem('profile_target_data_' + urlUid, JSON.stringify(targetUser));
            } catch(e) {}
        }
        if (!targetUser) targetUser = {uid:urlUid, name:'مستخدم', rank:'User'};
        if (currentUser && currentUser.uid && currentUser.uid !== urlUid && typeof db !== 'undefined' && db) {
            db.ref('users/' + urlUid + '/visitors/' + currentUser.uid).set({
                time: Date.now(),
                name: currentUser.name || 'زائر',
                avatar: currentUser.avatar || ''
            }).catch(() => {});
        }
    }

    document.body.classList.add(viewMode + '-mode');
    applyMode();
    loadProfile();
    loadSaved();
    initTabs();
    initPriv();
    initMain();
    loadPoetry();

    if (typeof renderFrames === 'function') renderFrames();

    if (viewMode === 'visitor' && urlUid && typeof db !== 'undefined' && db) {
        db.ref('users/' + urlUid).on('value', s => {
            const f = s.val();
            if (f) {
                targetUser = f;
                localStorage.setItem('profile_target_data_' + urlUid, JSON.stringify(f));
                if (Date.now() > _localLockUntil) loadProfile();
            }
        });
        db.ref('user_presence/' + urlUid).on('value', s => {
            const p = s.val() || {};
            const dot = document.getElementById('status-dot');
            if (dot) {
                if (p.state === 'online') { dot.className = 'status-dot online'; dot.title = 'متصل'; }
                else { dot.className = 'status-dot offline'; dot.title = 'غير متصل'; }
            }
        });
    }

    if (viewMode === 'owner' && currentUser && currentUser.uid && typeof db !== 'undefined' && db) {
        db.ref('users/' + currentUser.uid).on('value', s => {
            const f = s.val();
            if (f) {
                targetUser = f;
                currentUser = Object.assign({}, currentUser, f);
                if (Date.now() > _localLockUntil) loadProfile();
            }
        });
        db.ref('users/' + currentUser.uid + '/visitors').limitToLast(50).on('value', s => renderList('visitors-container', s.val(), 'time'));
        db.ref('users/' + currentUser.uid + '/likes').limitToLast(50).on('value', s => renderList('likes-container', s.val(), 'time'));
        db.ref('users/' + currentUser.uid + '/blocked').on('value', s => renderList('blocked-container', s.val(), null, true));
    }

    loadFriends();
    loadPoints();
    console.log('Profile loaded | Mode:', viewMode);
});

async function loadFriends() {
    const container = document.getElementById('friends-container');
    if (!container) return;
    if (typeof db === 'undefined' || !db) { container.innerHTML = '<div class="empty">Firebase غير متاح</div>'; return; }
    if (!targetUser || !targetUser.uid) { container.innerHTML = '<div class="empty">لا يوجد مستخدم</div>'; return; }
    if (viewMode === 'visitor') {
        const p = (targetUser.privacy) || {};
        const pf = p.friends || 'public';
        if (pf === 'private') {
            container.innerHTML = '<div class="friend-priv-msg"><i class="fas fa-lock"></i>قائمة الأصدقاء خاصة، لا يمكنك رؤيتها</div>';
            return;
        }
    }
    try {
        const snap = await db.ref('users/' + targetUser.uid + '/friends').once('value');
        const friends = snap.val() || {};
        const list = Object.values(friends);
        if (list.length === 0) { container.innerHTML = '<div class="empty">لا يوجد أصدقاء بعد</div>'; return; }
        container.innerHTML = '';
        list.sort((a,b) => (b.time||0) - (a.time||0));
        for (const f of list.slice(0, 50)) {
            if (!f.uid) continue;
            let points = 0;
            try {
                const ps = await db.ref('bot_data/quiz/scores/' + f.uid).once('value');
                points = ps.val() || 0;
            } catch(e) {}
            const giftsCount = Object.keys(f.gifts||{}).length;
            renderFriendCard(container, f, points, giftsCount);
        }
    } catch(e) {
        console.warn('Friends error:', e);
        container.innerHTML = '<div class="empty">تعذر تحميل الأصدقاء</div>';
    }
}

async function loadPoints() {
    const ptRow = document.getElementById('info-points-row');
    const ptVal = document.getElementById('info-points-value');
    const lvlRow = document.getElementById('info-level-row');
    const lvlVal = document.getElementById('info-level-value');
    if (!ptRow && !lvlRow) return;
    if (!targetUser || !targetUser.uid) return;
    if (typeof db === 'undefined' || !db) return;

    try {
        const s = await db.ref('bot_data/quiz/scores/' + targetUser.uid).once('value');
        const pts = s.val() || 0;
        const lvl = Math.floor(pts / 100) + 1;
        if (ptRow && ptVal) { ptVal.innerText = pts + ' نقطة'; ptRow.style.display = ''; }
        if (lvlRow && lvlVal) { lvlVal.innerText = 'المستوى ' + lvl; lvlRow.style.display = ''; }
    } catch(e) {
        if (ptRow) ptRow.style.display = 'none';
        if (lvlRow) lvlRow.style.display = 'none';
    }
}

function renderFriendCard(container, f, points, giftsCount) {
    const card = document.createElement('div');
    card.className = 'friend-card';
    const img = document.createElement('img');
    img.className = 'friend-avatar';
    img.src = f.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(f.name||'User') + '&background=555&color=fff');
    const info = document.createElement('div');
    info.className = 'friend-info';
    const nm = document.createElement('div');
    nm.className = 'friend-name';
    nm.textContent = f.name || 'مجهول';
    const rk = document.createElement('div');
    rk.className = 'friend-rank';
    rk.textContent = rankBadge(f.rank) + ' ' + (f.rank || 'User');
    const stats = document.createElement('div');
    stats.className = 'friend-stats';
    const level = Math.floor(points/100) + 1;
    stats.innerHTML = '<span class="stat-pill">⭐ مستوى ' + level + '</span><span class="stat-pill point">🎯 ' + points + ' نقطة</span><span class="stat-pill gift">🎁 ' + giftsCount + ' هدية</span>';
    info.appendChild(nm); info.appendChild(rk); info.appendChild(stats);
    card.appendChild(img); card.appendChild(info);
    card.onclick = () => { if (!f.uid) return; location.href = location.origin + location.pathname + '?uid=' + f.uid; };
    container.appendChild(card);
}

function renderList(cid, data, sortField, isBlocked) {
    const c = document.getElementById(cid);
    if (!c) return;
    c.innerHTML = '';
    if (!data || !Object.keys(data).length) {
        c.innerHTML = '<div class="empty">لا يوجد</div>';
        return;
    }
    let items = Object.entries(data).map(([uid, v]) => ({uid, ...v}));
    if (sortField) items.sort((a,b) => (b[sortField]||0) - (a[sortField]||0));
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'user-item';
        const img = document.createElement('img');
        img.src = item.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(item.name||'User') + '&background=555&color=fff');
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
            e.stopPropagation();
            location.href = location.origin + location.pathname + '?uid=' + item.uid;
        };
        const info = document.createElement('div');
        info.className = 'user-item-info';
        const nm = document.createElement('div');
        nm.className = 'user-item-nm';
        nm.textContent = item.name || 'مجهول';
        const sub = document.createElement('div');
        sub.className = 'user-item-sub';
        if (item.time) {
            const d = Date.now() - item.time;
            const m = Math.floor(d/60000);
            sub.textContent = m < 1 ? 'الآن' : 'قبل ' + m + ' دقيقة';
        }
        if (isBlocked) sub.textContent = 'محظور';
        info.appendChild(nm); info.appendChild(sub);
        el.appendChild(img); el.appendChild(info);
        if (isBlocked) {
            const b = document.createElement('button');
            b.textContent = 'إلغاء';
            b.style.cssText = 'background:#ff4444;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:11px;cursor:pointer;font-weight:bold';
            b.onclick = e => {
                e.stopPropagation();
                if (db && currentUser) db.ref('users/' + currentUser.uid + '/blocked/' + item.uid).remove();
                toast('✅ تم');
            };
            el.appendChild(b);
        }
        c.appendChild(el);
    });
}

function applyMode() {
    const o = document.querySelectorAll('.owner-only');
    const v = document.querySelectorAll('.visitor-only');
    if (viewMode === 'visitor') {
        o.forEach(e => e.style.display = 'none');
        v.forEach(e => e.style.display = '');
    } else {
        o.forEach(e => e.style.display = '');
        v.forEach(e => e.style.display = 'none');
    }
}

function canView(field) {
    if (viewMode === 'owner') return true;
    const p = (targetUser && targetUser.privacy) || {};
    const val = p[field] || 'public';
    return val === 'public';
}

function loadProfile() {
    if (!targetUser) return;
    const _displayName = (viewMode === 'owner' && currentUser && currentUser.name) ? currentUser.name : (targetUser.name || 'مستخدم');
    const u = document.getElementById('profile-username');
    if (u) {
        u.dataset.name = _displayName;
        // إن كان الاسم داخل بنية معقدة (nf-*) لا نستبدل النص
        if (!u.querySelector('span[data-name-inner]') && !u.classList.contains('name-has-effects')) {
            // فقط إن لم يكن هناك تأثيرات
            if (u.children.length === 0) {
                u.innerText = _displayName;
            } else {
                u.dataset.name = _displayName;
            }
        } else {
            u.dataset.name = _displayName;
        }
    }
    const b = document.getElementById('profile-bio'); if (b) b.innerText = targetUser.bio || ('@' + (targetUser.name || 'user'));
    const r = document.getElementById('role-text'); if (r) r.innerText = rankBadge(targetUser.rank) + ' ' + (targetUser.rank || 'User');
    if (targetUser.avatar) { const a = document.getElementById('profile-avatar-img'); if (a) a.src = targetUser.avatar; }
    if (targetUser.cover) { const c = document.getElementById('profile-cover-img'); if (c) c.src = targetUser.cover; }
    if (targetUser.profileBgValue) {
        const layer = document.getElementById('profile-bg-layer');
        if (layer) {
            layer.innerHTML = '';
            layer.style.backgroundImage = '';
            layer.style.background = '';
            if (targetUser.profileBgType === 'color') layer.style.background = targetUser.profileBgValue;
            else if (targetUser.profileBgType === 'image') layer.style.backgroundImage = 'url(' + targetUser.profileBgValue + ')';
        }
    }
    const un = document.getElementById('profile-username-id');
    if (un) {
        const uu = targetUser.username || '@' + (targetUser.name || 'user').replace(/\s+/g, '_');
        un.innerText = uu.startsWith('@') ? uu : '@' + uu;
    }
    const codeEl = document.getElementById('info-code-value');
    if (codeEl) codeEl.innerText = targetUser.code || '—';

    if (targetUser.nameColor && typeof applyNameColor === 'function') { nameColor = targetUser.nameColor; applyNameColor(); }
    if (targetUser.nameGradient && typeof applyNameGradient === 'function') { nameGradient = targetUser.nameGradient; applyNameGradient(); }
    if (targetUser.nameShape && typeof applyNameShape === 'function') { nameShape = targetUser.nameShape; applyNameShape(); }
    if (targetUser.nameGlow && typeof applyNameGlow === 'function') { nameGlow = targetUser.nameGlow; applyNameGlow(); if (typeof updateGlowLbl === 'function') updateGlowLbl(); }

    if (targetUser.avatarFrame && typeof applyAvatarFrame === 'function') {
        if (Date.now() > _localLockUntil) {
            applyAvatarFrame(targetUser.avatarFrame);
        }
    }

    if (targetUser.nameBgGradient && typeof NameBgState !== 'undefined' && typeof applyNameBg === 'function') {
        const g = targetUser.nameBgGradient;
        NameBgState.enabled = g.enabled !== false;
        NameBgState.direction = g.direction || 'diagonal';
        NameBgState.colors = (g.colors && g.colors.length === 3) ? g.colors.slice() : NameBgState.colors;
        NameBgState.positions = (g.positions && g.positions.length === 3) ? g.positions.slice() : NameBgState.positions;
        applyNameBg();
    }

    const er = document.getElementById('info-email-row'), ev = document.getElementById('info-email-value');
    if (er && ev) {
        if (viewMode === 'owner' && targetUser.email) {
            ev.innerText = targetUser.email;
            er.style.display = '';
        } else {
            ev.innerText = '—';
            er.style.display = 'none';
        }
    }

    const ageRow = document.getElementById('info-age-row'), ageVal = document.getElementById('info-age-value');
    if (ageRow && ageVal) { if (canView('age') && targetUser.age) { ageVal.innerText = targetUser.age + ' سنة'; ageRow.style.display = ''; } else ageRow.style.display = 'none'; }

    const genRow = document.getElementById('info-gender-row'), genVal = document.getElementById('info-gender-value');
    if (genRow && genVal) { if (canView('gender') && targetUser.gender) { genVal.innerText = targetUser.gender === 'male' ? 'ذكر' : 'أنثى'; genRow.style.display = ''; } else genRow.style.display = 'none'; }

    const joinRow = document.getElementById('info-join-row'), joinVal = document.getElementById('info-join-value');
    if (joinRow && joinVal) { if (targetUser.createdAt) { joinVal.innerText = formatDate(targetUser.createdAt); joinRow.style.display = ''; } else joinRow.style.display = 'none'; }

    const lsRow = document.getElementById('info-lastseen-row'), lsVal = document.getElementById('info-lastseen-value');
    if (lsRow && lsVal) { if (targetUser.lastSeen) { lsVal.innerText = timeAgo(targetUser.lastSeen); lsRow.style.display = ''; } else lsRow.style.display = 'none'; }

    const ctRow = document.getElementById('info-country-row'), ctVal = document.getElementById('info-country-value');
    if (ctRow && ctVal) { if (targetUser.country || targetUser.city) { ctVal.innerText = [targetUser.country, targetUser.city].filter(x => x).join(' - '); ctRow.style.display = ''; } else ctRow.style.display = 'none'; }

    if (targetUser.musicURL) {
        musicURL = targetUser.musicURL;
        const mb = document.getElementById('music-btn-mini');
        if (mb) mb.style.display = 'flex';
        const p = document.getElementById('music-player');
        if (p) p.src = musicURL;
    } else {
        const mbb = document.getElementById('music-btn-mini');
        if (mbb) mbb.style.display = 'none';
    }
}

function initTabs() {
    const items = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-c');
    items.forEach(it => it.addEventListener('click', function() {
        const t = this.getAttribute('data-target');
        items.forEach(x => x.classList.remove('active'));
        contents.forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const tc = document.getElementById(t);
        if (tc) tc.classList.add('active');
    }));
}

function initPriv() {
    document.querySelectorAll('.priv-sel').forEach(s => {
        const f = s.getAttribute('data-field');
        s.value = localStorage.getItem('privacy_' + f) || 'public';
        s.addEventListener('change', function() {
            const ff = this.getAttribute('data-field');
            localStorage.setItem('privacy_' + ff, this.value);
            if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/privacy/' + ff).set(this.value).catch(() => {});
            toast('✅ تم');
        });
    });
}

function loadSaved() {
    try {
        if (localStorage.getItem('profile_name')) {
            const el = document.getElementById('profile-username');
            if (el) { el.dataset.name = localStorage.getItem('profile_name'); el.innerText = localStorage.getItem('profile_name'); }
        }
        if (localStorage.getItem('profile_bio')) { const el = document.getElementById('profile-bio'); if (el) el.innerText = localStorage.getItem('profile_bio'); }
        if (localStorage.getItem('saved_avatar')) { const el = document.getElementById('profile-avatar-img'); if (el) el.src = localStorage.getItem('saved_avatar'); }
        if (localStorage.getItem('saved_cover')) { const el = document.getElementById('profile-cover-img'); if (el) el.src = localStorage.getItem('saved_cover'); }

        const sz = localStorage.getItem('name_size');
        if (sz) { nameSize = parseInt(sz); const el = document.getElementById('profile-username'); if (el) el.style.fontSize = nameSize + 'px'; }

        const fi = localStorage.getItem('frame_inset');
        if (fi) { frameInset = parseInt(fi); document.documentElement.style.setProperty('--frame-inset', frameInset + '%'); }

        const sf = localStorage.getItem('saved_avatar_frame_motion');
        if (sf && typeof applyAvatarFrame === 'function') {
            applyAvatarFrame(sf);
        }
        if (localStorage.getItem('profile_bg_value')) { bgType = localStorage.getItem('profile_bg_type') || 'color'; bgValue = localStorage.getItem('profile_bg_value'); if (typeof applyBg === 'function') applyBg(); }
        if (localStorage.getItem('name_color') && typeof applyNameColor === 'function') { nameColor = localStorage.getItem('name_color'); applyNameColor(); }
        if (localStorage.getItem('name_gradient') && typeof applyNameGradient === 'function') { nameGradient = JSON.parse(localStorage.getItem('name_gradient')); applyNameGradient(); }
        if (localStorage.getItem('name_glow') && typeof applyNameGlow === 'function') { nameGlow = localStorage.getItem('name_glow'); applyNameGlow(); if (typeof updateGlowLbl === 'function') updateGlowLbl(); }
        if (localStorage.getItem('profile_music_url')) {
            musicURL = localStorage.getItem('profile_music_url');
            const p = document.getElementById('music-player');
            if (p) p.src = musicURL;
            const mb = document.getElementById('music-btn-mini');
            if (mb) mb.style.display = 'flex';
        }
    } catch(e) { console.warn(e); }
}

function loadPoetry() {
    const s = localStorage.getItem('poetry_text') || '';
    const i = document.getElementById('poetry-input');
    const d = document.getElementById('poetry-display');
    if (i && viewMode === 'owner') {
        i.value = s;
        i.addEventListener('input', function() {
            localStorage.setItem('poetry_text', this.value);
            if (d) d.innerText = this.value;
            if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/poetry').set(this.value).catch(() => {});
        });
    }
    if (viewMode === 'visitor') {
        const poetry = (targetUser && targetUser.poetry) || '';
        if (poetry && canView('messages')) { if (d) d.innerText = poetry; }
    } else {
        if (d) d.innerText = s;
    }
}

async function uploadIB(file, maxMB) {
    const mb = file.size / (1024*1024);
    if (mb > maxMB) { toast('⚠️ الملف كبير'); return null; }
    try {
        const fd = new FormData();
        fd.append('key', IMGBB);
        fd.append('image', file);
        const r = await fetch('https://api.imgbb.com/1/upload', {method:'POST', body:fd});
        const d = await r.json();
        if (d.success && d.data && d.data.url) return d.data.url;
        toast('⚠️ فشل');
        return null;
    } catch(e) { toast('⚠️ خطأ في الرفع'); return null; }
}

async function uploadLoad(file, maxMB) {
    toast('⏳ جاري الرفع...');
    const u = await uploadIB(file, maxMB);
    if (u) toast('✅ تم');
    return u;
}

/* ⭐⭐⭐ قفل الوميض */
function saveToChat() {
    if (!currentUser) return;
    _localLockUntil = Date.now() + 2500;
    const existing = JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || '{}');
    const fv = localStorage.getItem('saved_avatar_frame_motion');
    const u = Object.assign({}, existing, {
        uid: currentUser.uid,
        name: currentUser.name || existing.name || 'مستخدم',
        bio: localStorage.getItem('profile_bio') || existing.bio || '',
        cover: localStorage.getItem('saved_cover') || existing.cover || '',
        avatar: localStorage.getItem('saved_avatar') || existing.avatar || '',
        nameColor: nameColor || null,
        nameGradient: nameGradient || null,
        nameFrame: nameFrame || null,
        nameShape: nameShape || null,
        nameGlow: (nameGlow && nameGlow !== 'none') ? nameGlow : null,
        nameBgGradient: (typeof NameBgState !== 'undefined' && NameBgState.enabled) ? {
            enabled: true,
            direction: NameBgState.direction,
            colors: NameBgState.colors.slice(),
            positions: NameBgState.positions.slice()
        } : null,
        avatarFrame: (fv && fv !== 'none' && fv !== '') ? fv : null,
        poetry: localStorage.getItem('poetry_text') || existing.poetry || '',
        profileBgType: bgType,
        profileBgValue: bgValue,
        musicURL: musicURL || null,
        color: existing.color || '#ffffff'
    });
    localStorage.setItem('qamar_current_user', JSON.stringify(u));
    localStorage.setItem('qamar_user', JSON.stringify(u));
    if (currentUser.uid && typeof db !== 'undefined' && db) {
        db.ref('users/' + currentUser.uid).update({
            name: u.name, bio: u.bio, cover: u.cover, avatar: u.avatar,
            nameColor: u.nameColor, nameGradient: u.nameGradient,
            nameFrame: u.nameFrame, nameShape: u.nameShape, nameGlow: u.nameGlow,
            nameBgGradient: u.nameBgGradient,
            avatarFrame: u.avatarFrame, poetry: u.poetry,
            profileBgType: u.profileBgType, profileBgValue: u.profileBgValue,
            musicURL: u.musicURL
        }).catch(() => {});
    }
    if (window.parent && window.parent !== window) {
        try { window.parent.postMessage({action:'userDataUpdated', userData:u}, '*'); } catch(e) {}
    }
}

function initCover() {
    const ci = document.getElementById('cover-file-input');
    const cc = document.getElementById('btn-change-cover');
    const rc = document.getElementById('btn-remove-cover');
    const cimg = document.getElementById('profile-cover-img');
    if (cc && ci && viewMode === 'owner') cc.onclick = () => ci.click();
    if (ci && viewMode === 'owner') ci.onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        const u = await uploadLoad(f, 5);
        if (u) { if (cimg) { cimg.src = u; cimg.style.display = 'block'; } localStorage.setItem('saved_cover', u); saveToChat(); }
    };
    if (rc && cimg && viewMode === 'owner') rc.onclick = () => {
        cimg.src = ''; cimg.style.display = 'none';
        localStorage.removeItem('saved_cover');
        if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/cover').remove().catch(() => {});
        saveToChat(); toast('✅ تم');
    };
}

function initAvatar() {
    const ai = document.getElementById('avatar-file-input');
    const ca = document.getElementById('btn-change-avatar');
    const ra = document.getElementById('btn-remove-avatar');
    const aimg = document.getElementById('profile-avatar-img');
    if (ca && ai && viewMode === 'owner') ca.onclick = () => ai.click();
    if (ai && viewMode === 'owner') ai.onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        const u = await uploadLoad(f, 5);
        if (u) { if (aimg) aimg.src = u; localStorage.setItem('saved_avatar', u); saveToChat(); }
    };
    if (ra && aimg && viewMode === 'owner') ra.onclick = () => {
        aimg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent((currentUser && currentUser.name) || 'User') + '&background=555&color=fff';
        localStorage.removeItem('saved_avatar');
        if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/avatar').remove().catch(() => {});
        saveToChat(); toast('✅ تم');
    };
}

function initMain() {
    const c = document.getElementById('btn-close');
    if (c) c.onclick = () => {
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({action:'closeProfile'}, '*');
            }
        } catch(e) {}
    };

    const eu = document.getElementById('btn-edit-username');
    if (eu && viewMode === 'owner') eu.onclick = () => {
        openAppModal('تعديل الاسم', 'الاسم الجديد:', 'input', [], getCleanName(), v => {
            if (v.trim()) {
                if (currentUser) currentUser.name = v.trim();
                const el = document.getElementById('profile-username');
                if (el) { el.dataset.name = v.trim(); el.innerText = v.trim(); }
                localStorage.setItem('profile_name', v.trim());
                try { localStorage.setItem('qamar_current_user', JSON.stringify(currentUser)); } catch(e) {}
                try { localStorage.setItem('qamar_user', JSON.stringify(currentUser)); } catch(e) {}
                if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/name').set(v.trim()).catch(() => {});
                saveToChat();
                toast('✅ تم');
            }
        });
    };

    const eb = document.getElementById('btn-edit-bio');
    if (eb && viewMode === 'owner') eb.onclick = () => {
        const bioEl = document.getElementById('profile-bio');
        openAppModal('تعديل البايو', 'البايو:', 'input', [], bioEl ? bioEl.innerText : '', v => {
            if (v.trim()) {
                if (bioEl) bioEl.innerText = v;
                localStorage.setItem('profile_bio', v);
                if (currentUser && currentUser.uid && db) db.ref('users/' + currentUser.uid + '/bio').set(v).catch(() => {});
                saveToChat(); toast('✅ تم');
            }
        });
    };

    initCover();
    initAvatar();

    const vb = document.getElementById('btn-visitor-view');
    if (vb && viewMode === 'owner') vb.onclick = () => {
        if (!currentUser || !currentUser.uid) return;
        localStorage.setItem('profile_target_data_' + currentUser.uid, JSON.stringify(currentUser));
        location.href = 'profile.html?uid=' + currentUser.uid;
    };

    initVisitor();
    if (typeof initAppearance === 'function') initAppearance();
    initCommands();
    initInfo();
    initMusic();
    initSearch();
}

function getCleanName() {
    const el = document.getElementById('profile-username');
    return el ? (el.dataset.name || el.innerText) : '';
}

function initMusic() {
    const mb = document.getElementById('music-btn-mini');
    const p = document.getElementById('music-player');
    if (!mb || !p) return;
    mb.onclick = () => {
        if (musicPlaying) {
            p.pause(); musicPlaying = false;
            mb.innerHTML = '<i class="fas fa-play"></i>';
            mb.classList.remove('playing');
        } else {
            p.play().then(() => {
                musicPlaying = true;
                mb.innerHTML = '<i class="fas fa-pause"></i>';
                mb.classList.add('playing');
            }).catch(() => toast('تعذر تشغيل الموسيقى'));
        }
    };
}

function initVisitor() {
    if (viewMode !== 'visitor') return;
    const h = document.getElementById('btn-heart');
    if (h) h.onclick = async () => {
        h.style.transform = 'scale(1.4)';
        setTimeout(() => h.style.transform = '', 300);
        if (targetUser && targetUser.uid && currentUser && currentUser.uid) {
            if (db) await db.ref('users/' + targetUser.uid + '/likes/' + currentUser.uid).set({
                time: Date.now(), name: currentUser.name || 'زائر', avatar: currentUser.avatar || ''
            }).catch(() => {});
            await sendNotif(targetUser.uid, 'like', '❤️', 'أعجب بك');
        }
        toast('❤️ تم');
    };
    const m = document.getElementById('btn-mail');
    if (m) m.onclick = () => {
        const p = (targetUser && targetUser.privacy && targetUser.privacy.messages) || 'public';
        if (p === 'private') { toast('🔒 خاصة'); return; }
        if (targetUser && targetUser.uid) openChat(targetUser.uid, targetUser.name);
    };
    const b = document.getElementById('btn-block');
    if (b) b.onclick = () => {
        if (!currentUser || !targetUser) return;
        if (!confirm('حظر هذا المستخدم؟')) return;
        if (db) db.ref('users/' + currentUser.uid + '/blocked/' + targetUser.uid).set({
            time: Date.now(), name: targetUser.name || 'مجهول', avatar: targetUser.avatar || ''
        }).then(() => {
            toast('🚫 تم');
            setTimeout(() => { try { window.parent.postMessage({action:'closeProfile'}, '*'); } catch(e) {} }, 800);
        });
    };
    const af = document.getElementById('btn-add-friend');
    if (af) af.onclick = async () => {
        if (targetUser && targetUser.uid) await sendNotif(targetUser.uid, 'friend_request', '➕', 'طلب صداقة');
        toast('➕ تم');
    };
    const pk = document.getElementById('btn-poke');
    if (pk) pk.onclick = async () => {
        if (targetUser && targetUser.uid) await sendNotif(targetUser.uid, 'poke', '👋', 'نكزك');
        toast('👋 تم');
    };

    const cmd = document.getElementById('btn-admin-actions');
    if (cmd && currentUser && (currentUser.rank === 'King' || currentUser.rank === 'Queen')) {
        cmd.style.display = 'flex';
        cmd.onclick = () => {
            if (typeof window.parent !== 'undefined' && window.parent !== window) {
                window.parent.postMessage({
                    action: 'openUserActions',
                    targetUid: targetUser.uid,
                    targetName: targetUser.name
                }, '*');
            }
        };
    }
}

function initCommands() {
    if (viewMode !== 'owner') return;
    const g = document.getElementById('btn-gift');
    if (g) g.onclick = () => toast('🎁 قريباً');
}

function initInfo() {
    const ci = document.getElementById('btn-copy-id');
    if (ci) ci.onclick = () => {
        const el = document.getElementById('profile-username-id');
        if (el) navigator.clipboard.writeText(el.innerText).then(() => toast('✅ تم النسخ'));
    };
    const cc = document.getElementById('btn-copy-code');
    if (cc) cc.onclick = async () => {
        const code = (targetUser && targetUser.code) || (currentUser && currentUser.code);
        if (!code || code === '—') { toast('⚠️ لا يوجد كود'); return; }
        try {
            await navigator.clipboard.writeText(code);
            toast('✅ الكود: ' + code);
        } catch(e) { toast('الكود: ' + code); }
    };
}

function initSearch() {
    const btn = document.getElementById('search-btn');
    const inp = document.getElementById('search-input');
    if (btn) btn.onclick = doSearch;
    if (inp) inp.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
}

async function doSearch() {
    const inp = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!inp || !results) return;
    const query = inp.value.trim();
    results.innerHTML = '';
    if (!query) { toast('⚠️ اكتب شي للبحث'); return; }
    if (typeof db === 'undefined' || !db) { toast('⚠️ Firebase غير متاح'); return; }

    const codeMatch = query.match(/([A-Za-z0-9]{2,3})·([A-Za-z0-9]{3,4})/);
    if (codeMatch) {
        results.innerHTML = '<div class="search-loading">⏳ جاري البحث...</div>';
        try {
            const code = codeMatch[0].toUpperCase();
            const s = await db.ref('user_codes/' + code).once('value');
            const uid = s.val();
            if (uid) {
                const us = await db.ref('users/' + uid).once('value');
                const u = us.val();
                if (u) { results.innerHTML = ''; renderSearchResult(u); return; }
            }
            results.innerHTML = '<div class="search-empty">لا نتائج بهذا الكود</div>';
            return;
        } catch(e) { results.innerHTML = '<div class="search-empty">خطأ في البحث</div>'; return; }
    }

    results.innerHTML = '<div class="search-loading">⏳ جاري البحث...</div>';
    try {
        const nameSnap = await db.ref('user_names/' + query).once('value');
        const uid = nameSnap.val();
        if (uid) {
            const userSnap = await db.ref('users/' + uid).once('value');
            const u = userSnap.val();
            if (u) { renderSearchResult(u); return; }
        }
        const allSnap = await db.ref('users').limitToLast(300).once('value');
        const all = allSnap.val() || {};
        const q = query.toLowerCase().replace(/\s+/g, '');
        const matches = [];
        Object.values(all).forEach(u => {
            if (!u || !u.name) return;
            const n = u.name.toLowerCase().replace(/\s+/g, '');
            if (n.includes(q)) matches.push(u);
        });
        if (matches.length === 0) {
            results.innerHTML = '<div class="search-empty">لا نتائج لـ "' + query + '"<br><br>جرّب:<br>• الاسم الكامل<br>• أو كود العضو</div>';
            return;
        }
        results.innerHTML = '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">وُجد ' + matches.length + ' نتيجة:</div>';
        matches.slice(0, 20).forEach(u => renderSearchResult(u));
    } catch(e) {
        console.error('Search error:', e);
        results.innerHTML = '<div class="search-empty">خطأ في البحث</div>';
    }
}

function renderSearchResult(u) {
    const results = document.getElementById('search-results');
    const el = document.createElement('div');
    el.className = 'search-result';
    const img = document.createElement('img');
    img.src = u.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name||'User') + '&background=555&color=fff');
    const info = document.createElement('div');
    info.className = 'search-result-info';
    const nm = document.createElement('div');
    nm.className = 'search-result-name';
    nm.textContent = u.name || 'مجهول';
    const rk = document.createElement('div');
    rk.className = 'search-result-rank';
    rk.textContent = rankBadge(u.rank) + ' ' + (u.rank || 'User');
    info.appendChild(nm); info.appendChild(rk);
    el.appendChild(img); el.appendChild(info);
    el.onclick = () => {
        if (!u.uid) { toast('⚠️ غير معروف'); return; }
        location.href = location.origin + location.pathname + '?uid=' + u.uid;
    };
    results.appendChild(el);
}

async function sendNotif(targetUid, type, icon, title) {
    if (typeof db === 'undefined' || !db || !targetUid) return;
    try {
        await db.ref('user_notifications/' + targetUid).push({
            fromUid: (currentUser && currentUser.uid) || '',
            fromName: (currentUser && currentUser.name) || 'زائر',
            fromAvatar: (currentUser && currentUser.avatar) || '',
            type: type, icon: icon, preview: title,
            time: firebase.database.ServerValue.TIMESTAMP,
            read: false
        });
    } catch(e) {}
}

function openChat(uid, name) {
    window.parent.postMessage({action:'openPrivateChat', uid:uid, name:name}, '*');
    if (window.parent === window) {
        localStorage.setItem('open_chat_uid', uid);
        localStorage.setItem('open_chat_name', name);
        location.href = 'index.html?chat=' + uid;
    }
}

function openAppModal(title, text, type, options, currentVal, onSave) {
    const m = document.getElementById('app-modal');
    if (!m) return;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerText = text;
    const c = document.getElementById('modal-dyn');
    c.innerHTML = '';
    if (type === 'input') {
        const i = document.createElement('input');
        i.type = 'text';
        i.id = 'modal-input-val';
        i.value = currentVal || '';
        c.appendChild(i);
    } else if (type === 'select') {
        const s = document.createElement('select');
        s.id = 'modal-select-val';
        (options || []).forEach(o => {
            const op = document.createElement('option');
            op.value = o; op.innerText = o;
            if (o === currentVal) op.selected = true;
            s.appendChild(op);
        });
        c.appendChild(s);
    }
    m.classList.add('active');
    document.getElementById('modal-ok').onclick = function() {
        let v = '';
        if (type === 'input') {
            const i = document.getElementById('modal-input-val');
            if (i) v = i.value;
        } else if (type === 'select') {
            const s = document.getElementById('modal-select-val');
            if (s) v = s.value;
        }
        if (onSave) onSave(v);
        m.classList.remove('active');
    };
    document.getElementById('modal-cancel').onclick = () => m.classList.remove('active');
}

console.log('✅ profile-core.js v2.1 loaded — anti-flash lock');
