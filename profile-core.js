// ==============================================
// profile-core.js v3.0 — تبويب الأوامر الكامل + الحالة اليومية
// ==============================================
// ✅ v3.0 (الجديد):
//   1. تبويب الأوامر يظهر في visitor فقط (لكل الرتب)
//   2. قسم "إجراءات على [الاسم]" (فك منع/طرد/حظر/سجن)
//   3. قسم "أوامر جديدة" (حسب الرتبة)
//   4. زر ⚔️ موحّد للجميع (يفتح قائمة)
//   5. زر 🚪 مغادرة الغرفة في تبويب المعلومات
//   6. زر 🗑️ حذف الحساب (24 ساعة للأعضاء، فوري للزوار)
//   7. ربط تبويب "📸 حالتي" بـ Stories.renderMyTab
//   8. تنظيف الحذف المعلق عند فتح البروفايل (للملك)
// ==============================================

let currentUser = null, targetUser = null, viewMode = 'owner';
let bgType = 'color', bgValue = '#050508', musicURL = null, musicPlaying = false;
let nameColor = null, nameGradient = null, nameFrame = null, nameShape = null, nameGlow = 'none';
let nameSize = 20;
let frameInset = -8;
let _localLockUntil = 0;
let _lastUserHash = '';
let _iLiked = false;

const IMGBB = '80fd32c4ef79b5f25fbcf0893547de4f';
const FRAMES = [];

const COLORS = ['#ffffff','#000000','#ffd700','#ff8c00','#ff69b4','#ff1493','#e0115f','#ff4757','#ff0000','#ff6347','#ff4500','#ffa500','#feca57','#ffff00','#adff2f','#39ff14','#00cc00','#00ff88','#2ecc71','#00b894','#00f3ff','#00bfff','#00bcd4','#1e90ff','#3498db','#0066ff','#0000ff','#8a2be2','#a855f7','#7c3aed','#6c5ce7','#9b59b6','#ff00ff','#da70d6','#e84393','#c0c0c0','#808080','#696969','#8b4513','#ff006e'];

const GRADS = [['#ffd700','#ff8c00'],['#ff69b4','#ff1493'],['#00f3ff','#0066ff'],['#39ff14','#00cc00'],['#a855f7','#7c3aed'],['#e0115f','#ff4757'],['#feca57','#ff9f43'],['#00b894','#0984e3'],['#fd79a8','#e84393'],['#6c5ce7','#a29bfe'],['#74b9ff','#0984e3'],['#55efc4','#00b894'],['#ffeaa7','#fdcb6e'],['#e17055','#d35400'],['#81ecec','#00cec9'],['#fab1a0','#e17055'],['#ffffff','#cccccc'],['#000000','#333333'],['#ffd700','#ff006e'],['#00ff88','#0066ff'],['#ff0055','#ffd700'],['#8b00ff','#ff006e'],['#00f3ff','#ff00ff'],['#ffcc00','#ff6699'],['#00ffcc','#0066ff'],['#ff66cc','#9900ff'],['#ffaa00','#ff0000'],['#00ccff','#6600ff'],['#ff8c00','#ff1493'],['#c0c0c0','#ffd700']];

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

function _revealProfile() {
    var p = document.getElementById('profile-container');
    if (!p) return;
    p.style.transition = 'opacity 0.18s ease-in';
    p.style.opacity = '1';
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
    loadSaved();
    loadProfile();
    initTabs();
    initPriv();
    initMain();
    loadPoetry();

    if (typeof renderFrames === 'function') renderFrames();

    if (viewMode === 'visitor' && urlUid && typeof db !== 'undefined' && db) {
        db.ref('users/' + urlUid).on('value', s => {
            const f = s.val();
            if (!f) return;
            const h = _userHash(f);
            if (h === _lastUserHash) return;
            _lastUserHash = h;
            targetUser = f;
            localStorage.setItem('profile_target_data_' + urlUid, JSON.stringify(f));
            if (Date.now() > _localLockUntil) loadProfile();
            // ⭐ v3: تحديث تبويب الأوامر بعد وصول البيانات
            if (document.getElementById('commands-tab') && document.getElementById('commands-tab').classList.contains('active')) {
                renderCommandsTab();
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
            if (!f) return;
            const h = _userHash(f);
            if (h === _lastUserHash) return;
            _lastUserHash = h;
            targetUser = f;
            currentUser = Object.assign({}, currentUser, f);
            if (Date.now() > _localLockUntil) loadProfile();
        });
        setTimeout(() => {
            db.ref('users/' + currentUser.uid + '/visitors').limitToLast(50).on('value', s => renderList('visitors-container', s.val(), 'time'));
            db.ref('users/' + currentUser.uid + '/likes').limitToLast(50).on('value', s => renderList('likes-container', s.val(), 'time'));
            db.ref('users/' + currentUser.uid + '/blocked').on('value', s => renderList('blocked-container', s.val(), null, true));
        }, 500);
    }

    setTimeout(loadFriends, 800);
    setTimeout(loadPoints, 800);

    // ⭐ v3: تنظيف المعلقين + فحص حذفي
    setTimeout(_checkMyDeletionStatus, 1200);
    if (viewMode === 'owner' && currentUser && currentUser.uid && typeof db !== 'undefined' && db) {
        setTimeout(_cleanupPendingDeletions, 2500);
    }

    setTimeout(_revealProfile, 180);

    console.log('Profile loaded | Mode:', viewMode);
});

function _userHash(u) {
    if (!u) return '';
    try {
        return JSON.stringify({
            n: u.name, b: u.bio, a: u.avatar, c: u.cover, r: u.rank,
            nc: u.nameColor, ng: u.nameGradient, ngl: u.nameGlow,
            af: u.avatarFrame, nbg: u.nameBgGradient, bg: u.profileBgValue,
            ij: u.isJailed, ju: u.jailUntil, ib: u.isBanned, bu: u.bannedUntil,
            mw: u.muteInRoom, dp: u.deletionScheduled
        });
    } catch(e) { return ''; }
}

/* ⭐ v3: فحص حالة الحذف الخاصة بي */
async function _checkMyDeletionStatus() {
    if (!currentUser || !currentUser.uid || typeof db === 'undefined' || !db) return;
    try {
        var snap = await db.ref('users/' + currentUser.uid + '/deletionScheduled').once('value');
        var d = snap.val();
        if (d && d.willDeleteAt) {
            if (Date.now() >= d.willDeleteAt) {
                // نفّذ الحذف
                await _executeAccountDeletion(currentUser.uid);
            } else {
                _renderDeletionPendingUI(d);
            }
        }
    } catch(e) { console.warn('checkMyDeletionStatus:', e); }
}

/* ⭐ v3: الملك ينظّف المعلقين */
async function _cleanupPendingDeletions() {
    try {
        var snap = await db.ref('users').limitToLast(500).once('value');
        var all = snap.val() || {};
        var now = Date.now();
        var pending = [];
        Object.keys(all).forEach(function(uid) {
            var u = all[uid];
            if (u && u.deletionScheduled && u.deletionScheduled.willDeleteAt && u.deletionScheduled.willDeleteAt <= now) {
                pending.push(uid);
            }
        });
        if (pending.length === 0) return;
        console.log('🧹 Cleanup: ' + pending.length + ' pending deletions');
        for (var i = 0; i < pending.length; i++) {
            await _executeAccountDeletion(pending[i]);
        }
    } catch(e) { console.warn('cleanup:', e); }
}

async function _executeAccountDeletion(uid) {
    try {
        var snap = await db.ref('users/' + uid).once('value');
        var u = snap.val() || {};
        var name = u.name;
        var code = u.code;

        await Promise.all([
            db.ref('users/' + uid).remove(),
            db.ref('user_presence/' + uid).remove(),
            name ? db.ref('user_names/' + name).remove().catch(function(){}) : Promise.resolve(),
            code ? db.ref('user_codes/' + code).remove().catch(function(){}) : Promise.resolve(),
            db.ref('user_private_chats/' + uid).remove().catch(function(){}),
            db.ref('user_notifications/' + uid).remove().catch(function(){}),
            db.ref('stories/' + uid).remove().catch(function(){})
        ]);
        console.log('✅ Deleted user:', uid);
    } catch(e) { console.warn('executeDeletion:', e); }
}

/* ⭐ v3: عرض حالة الحذف المعلق */
function _renderDeletionPendingUI(d) {
    var infoTab = document.getElementById('info-tab');
    if (!infoTab) return;
    var existing = document.getElementById('deletion-pending-banner');
    if (existing) existing.remove();

    var b = document.createElement('div');
    b.id = 'deletion-pending-banner';
    var remaining = Math.ceil((d.willDeleteAt - Date.now()) / 3600000);
    b.style.cssText = 'background:linear-gradient(135deg,rgba(255,68,68,0.2),rgba(255,0,0,0.1));border:2px solid #ff4444;border-radius:12px;padding:12px;margin-bottom:12px;text-align:center;';
    b.innerHTML =
        '<div style="color:#ff7777;font-weight:900;font-size:13px;margin-bottom:6px;">⚠️ حسابك مجدول للحذف</div>' +
        '<div style="color:#fff;font-size:11px;margin-bottom:10px;">سيُحذف بعد ' + remaining + ' ساعة</div>' +
        '<button id="cancel-deletion-btn" type="button" style="padding:8px 20px;background:#84cc16;color:#fff;border:none;border-radius:8px;font-family:inherit;font-weight:900;font-size:12px;cursor:pointer;">❌ إلغاء الحذف</button>';
    infoTab.insertBefore(b, infoTab.firstChild);

    setTimeout(function() {
        var cb = document.getElementById('cancel-deletion-btn');
        if (cb) cb.onclick = _cancelMyDeletion;
    }, 50);
}

async function _cancelMyDeletion() {
    if (!currentUser || !currentUser.uid) return;
    if (!confirm('إلغاء حذف الحساب؟')) return;
    try {
        await db.ref('users/' + currentUser.uid + '/deletionScheduled').remove();
        try {
            localStorage.removeItem('qamar_deletion_scheduled');
        } catch(e) {}
        toast('✅ تم إلغاء الحذف');
        var b = document.getElementById('deletion-pending-banner');
        if (b) b.remove();
        // إعادة زر الحذف
        var acts = document.getElementById('info-actions-section');
        if (acts) acts.remove();
        _renderInfoActions();
    } catch(e) {
        toast('⚠️ فشل: ' + e.message);
    }
}

/* ═══════════════════════════════════════════ */
/* Load Friends (شبكة 68×68)                   */
/* ═══════════════════════════════════════════ */
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

        var list = [];
        Object.keys(friends).forEach(function(uid) {
            var f = friends[uid] || {};
            if (f.status && f.status !== 'accepted') return;
            list.push({
                uid: uid,
                name: f.name || 'مجهول',
                avatar: f.avatar || '',
                time: f.time || 0
            });
        });

        if (list.length === 0) {
            container.innerHTML = '<div class="empty">لا يوجد أصدقاء بعد</div>';
            return;
        }

        container.innerHTML = '';

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:8px;padding:8px 4px;';

        list.sort(function(a, b) { return (b.time || 0) - (a.time || 0); });

        list.slice(0, 200).forEach(function(f) {
            grid.appendChild(_buildFriendTile(f));
        });

        container.appendChild(grid);
    } catch(e) {
        console.warn('Friends error:', e);
        container.innerHTML = '<div class="empty">تعذر تحميل الأصدقاء</div>';
    }
}

function _buildFriendTile(f) {
    var tile = document.createElement('div');
    tile.style.cssText = 'position:relative;width:68px;height:68px;border-radius:10px;overflow:hidden;cursor:pointer;border:1px solid rgba(212,175,55,0.4);background:#111;transition:transform .15s ease;';

    tile.addEventListener('mouseenter', function () { tile.style.transform = 'scale(1.05)'; });
    tile.addEventListener('mouseleave', function () { tile.style.transform = 'scale(1)'; });

    var img = document.createElement('img');
    img.src = f.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(f.name || 'User') + '&background=555&color=fff');
    img.alt = f.name || '';
    img.loading = 'lazy';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = function () { this.src = 'https://ui-avatars.com/api/?name=U&background=555&color=fff'; };

    var nameOverlay = document.createElement('div');
    nameOverlay.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%);padding:12px 3px 3px 3px;text-align:center;';

    var name = document.createElement('div');
    name.textContent = f.name || '—';
    name.style.cssText = 'font-size:9px;color:#fff;font-weight:900;font-family:Cairo,sans-serif;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,0.9);';

    nameOverlay.appendChild(name);
    tile.appendChild(img);
    tile.appendChild(nameOverlay);

    tile.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!f.uid) return;
        location.href = location.origin + location.pathname + '?uid=' + encodeURIComponent(f.uid);
    });

    return tile;
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
        const currentText = u.textContent;
        const hasStructure = u.querySelector('*');
        if (currentText !== _displayName && !hasStructure) {
            u.innerText = _displayName;
        }
    }
    const b = document.getElementById('profile-bio');
    if (b) {
        const bio = targetUser.bio || ('@' + (targetUser.name || 'user'));
        if (b.textContent !== bio) b.innerText = bio;
    }
    const r = document.getElementById('role-text');
    if (r) {
        const rk = rankBadge(targetUser.rank) + ' ' + (targetUser.rank || 'User');
        if (r.textContent !== rk) r.innerText = rk;
    }
    if (targetUser.avatar) {
        const a = document.getElementById('profile-avatar-img');
        if (a && a.getAttribute('src') !== targetUser.avatar) a.src = targetUser.avatar;
    }
    if (targetUser.cover) {
        const c = document.getElementById('profile-cover-img');
        if (c && c.getAttribute('src') !== targetUser.cover) c.src = targetUser.cover;
    }

    const layer = document.getElementById('profile-bg-layer');
    if (layer) {
        let bgT = targetUser.profileBgType;
        let bgV = targetUser.profileBgValue;
        if (!bgV) {
            bgT = localStorage.getItem('profile_bg_type') || 'color';
            bgV = localStorage.getItem('profile_bg_value');
        }
        const key = bgT + '|' + (bgV || '').substring(0, 100);
        if (layer.dataset.curBg !== key && bgV) {
            layer.dataset.curBg = key;
            layer.innerHTML = '';
            layer.style.backgroundImage = '';
            layer.style.background = '';
            if (bgT === 'color') {
                layer.style.background = bgV;
            } else if (bgT === 'image') {
                layer.style.backgroundImage = 'url("' + bgV + '")';
                layer.style.backgroundSize = 'cover';
                layer.style.backgroundPosition = 'center';
            } else if (bgT === 'video') {
                const v = document.createElement('video');
                v.src = bgV;
                v.autoplay = true;
                v.loop = true;
                v.muted = true;
                v.playsInline = true;
                v.setAttribute('playsinline', '');
                v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
                layer.appendChild(v);
            }
        }
    }

    const un = document.getElementById('profile-username-id');
    if (un) {
        const uu = targetUser.username || '@' + (targetUser.name || 'user').replace(/\s+/g, '_');
        const txt = uu.startsWith('@') ? uu : '@' + uu;
        if (un.innerText !== txt) un.innerText = txt;
    }
    const codeEl = document.getElementById('info-code-value');
    if (codeEl) {
        const cv = targetUser.code || '—';
        if (codeEl.innerText !== cv) codeEl.innerText = cv;
    }

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
        if (p && p.getAttribute('src') !== musicURL) p.src = musicURL;
    } else {
        const mbb = document.getElementById('music-btn-mini');
        if (mbb) mbb.style.display = 'none';
    }

    // ⭐ v3: قسم الإجراءات في تبويب المعلومات (owner فقط)
    if (viewMode === 'owner') {
        _renderInfoActions();
    }
}

/* ⭐ v3: قسم الإجراءات في تبويب المعلومات */
function _renderInfoActions() {
    var infoTab = document.getElementById('info-tab');
    if (!infoTab) return;
    if (document.getElementById('info-actions-section')) return;

    var section = document.createElement('div');
    section.id = 'info-actions-section';
    section.style.cssText = 'margin-top:20px;padding-top:16px;border-top:1px dashed rgba(212,175,55,0.3);';

    var h = '<h3 style="color:#ffd700;font-size:13px;font-weight:900;margin-bottom:10px;">⚡ الإجراءات</h3>';

    // زر مغادرة الغرفة
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">';
    h += '<span style="color:#ffab91;font-weight:700;font-size:13px;">🚪 مغادرة الغرفة</span>';
    h += '<button class="profile-action-btn" id="action-leave-room" type="button" style="padding:8px 16px;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);color:#ffd700;border-radius:8px;font-family:inherit;font-weight:900;font-size:12px;cursor:pointer;">مغادرة</button>';
    h += '</div>';

    // زر حذف الحساب
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">';
    h += '<span style="color:#ff7777;font-weight:700;font-size:13px;">🗑️ حذف الحساب</span>';
    h += '<button class="profile-action-btn" id="action-delete-account" type="button" style="padding:8px 16px;background:rgba(255,68,68,0.15);border:1px solid rgba(255,68,68,0.5);color:#ff7777;border-radius:8px;font-family:inherit;font-weight:900;font-size:12px;cursor:pointer;">حذف</button>';
    h += '</div>';

    section.innerHTML = h;
    infoTab.appendChild(section);

    setTimeout(function() {
        var leaveBtn = document.getElementById('action-leave-room');
        if (leaveBtn) leaveBtn.onclick = _actionLeaveRoom;
        var delBtn = document.getElementById('action-delete-account');
        if (delBtn) delBtn.onclick = _actionDeleteAccount;
    }, 50);
}

function _actionLeaveRoom() {
    if (!confirm('مغادرة الغرفة الحالية؟')) return;
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ action: 'leaveRoom' }, '*');
        }
        // إغلاق البروفايل
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ action: 'closeProfile' }, '*');
        }
        toast('✅ جاري المغادرة...');
    } catch(e) {
        toast('⚠️ فشل');
    }
}

function _actionDeleteAccount() {
    if (!currentUser || !currentUser.uid) { toast('⚠️ لا يوجد مستخدم'); return; }
    var isGuest = currentUser.isGuest === true || !currentUser.email;

    if (isGuest) {
        // زائر → تأكيد بالاسم + حذف فوري
        var confirmName = prompt('⚠️ اكتب اسمك للتأكيد:\n"' + (currentUser.name || '') + '"');
        if (confirmName !== currentUser.name) {
            if (confirmName !== null) toast('❌ الاسم غير متطابق');
            return;
        }
        if (!confirm('تأكيد نهائي: حذف حسابك فوراً؟')) return;
        _executeAccountDeletion(currentUser.uid).then(function() {
            toast('✅ تم حذف الحساب');
            try {
                if (typeof logout === 'function') logout();
            } catch(e) {}
            setTimeout(function() {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ action: 'closeProfile' }, '*');
                }
                try { location.href = 'index.html'; } catch(e) {}
            }, 1200);
        });
        return;
    }

    // عضو → إيميل + 24 ساعة
    var confirmEmail = prompt('⚠️ اكتب إيميلك للتأكيد:');
    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== (currentUser.email || '').toLowerCase()) {
        if (confirmEmail !== null) toast('❌ الإيميل غير متطابق');
        return;
    }
    if (!confirm('سيُجدول حذف حسابك بعد 24 ساعة. متابعة؟')) return;

    var willDeleteAt = Date.now() + 24 * 60 * 60 * 1000;
    db.ref('users/' + currentUser.uid + '/deletionScheduled').set({
        scheduledAt: Date.now(),
        willDeleteAt: willDeleteAt,
        email: currentUser.email,
        type: 'member'
    }).then(function() {
        try {
            localStorage.setItem('qamar_deletion_scheduled', JSON.stringify({
                willDeleteAt: willDeleteAt,
                uid: currentUser.uid
            }));
        } catch(e) {}
        toast('✅ سيُحذف حسابك بعد 24 ساعة');
        _renderDeletionPendingUI({ willDeleteAt: willDeleteAt });
    }).catch(function(e) {
        toast('⚠️ فشل: ' + e.message);
    });
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

        // ⭐ v3: عند تفعيل تبويب معين
        if (t === 'commands-tab') renderCommandsTab();
        if (t === 'story-tab') {
            var stc = document.getElementById('story-tab-content');
            if (stc && window.Stories && typeof window.Stories.renderMyTab === 'function') {
                window.Stories.renderMyTab(stc);
            }
        }
    }));
}

/* ⭐ v3: عرض تبويب الأوامر */
function renderCommandsTab() {
    var container = document.getElementById('commands-tab-content');
    if (!container) return;

    // يظهر فقط في وضع الزيارة
    if (viewMode !== 'visitor') {
        container.innerHTML = '<div class="empty">هذا التبويب متاح فقط عند زيارة بروفايل شخص آخر</div>';
        return;
    }

    if (!currentUser) { container.innerHTML = '<div class="empty">سجّل دخول</div>'; return; }
    if (!targetUser || !targetUser.uid) { container.innerHTML = '<div class="empty">لا يوجد هدف</div>'; return; }

    var me = currentUser;
    var tg = targetUser;
    var myLvl = me.rankLevel || (typeof getRankLevel === 'function' ? getRankLevel(me.rank) : 0);
    var tgLvl = tg.rankLevel || (typeof getRankLevel === 'function' ? getRankLevel(tg.rank) : 0);
    var now = Date.now();

    var h = '';

    /* ─── قسم 1: إجراءات على [الاسم] (فك العقوبات) ─── */
    var hasAnyActive = false;
    var activeActions = '';

    // فك المنع من الكتابة
    if (tg.muteInRoom && tg.muteUntil > now) {
        hasAnyActive = true;
        activeActions += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
            '<span style="color:#ffbb66;font-size:12px;font-weight:700;">🔇 ممنوع من الكتابة</span>' +
            '<button class="cmd-btn" data-cmd="unmute" type="button" style="padding:6px 14px;background:#84cc16;color:#fff;border:none;border-radius:6px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;">🔊 فك</button>' +
            '</div>';
    }
    // فك السجن
    if (tg.isJailed && tg.jailUntil > now) {
        hasAnyActive = true;
        activeActions += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
            '<span style="color:#ffbb66;font-size:12px;font-weight:700;">⛓️ مسجون</span>' +
            '<button class="cmd-btn" data-cmd="unjail" type="button" style="padding:6px 14px;background:#84cc16;color:#fff;border:none;border-radius:6px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;">🔓 فك</button>' +
            '</div>';
    }
    // فك الحظر
    if (tg.isBanned && tg.bannedUntil > now) {
        hasAnyActive = true;
        activeActions += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
            '<span style="color:#ff7777;font-size:12px;font-weight:700;">🚫 محظور</span>' +
            '<button class="cmd-btn" data-cmd="unban" type="button" style="padding:6px 14px;background:#84cc16;color:#fff;border:none;border-radius:6px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;">🔓 فك</button>' +
            '</div>';
    }
    // فك الطرد من الروم (نفحص)
    if (typeof db !== 'undefined' && db) {
        db.ref('room_kicks').once('value').then(function(snap) {
            var all = snap.val() || {};
            var kickedFrom = [];
            Object.keys(all).forEach(function(rid) {
                if (all[rid] && all[rid][tg.uid]) kickedFrom.push(rid);
            });
            if (kickedFrom.length > 0) {
                var existing = document.getElementById('cmd-kicked-info');
                if (existing) existing.remove();
                var kd = document.createElement('div');
                kd.id = 'cmd-kicked-info';
                kd.style.cssText = 'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);';
                kd.innerHTML = '<div style="color:#ffbb66;font-size:12px;font-weight:700;margin-bottom:6px;">🚪 مطرود من: ' + kickedFrom.join('، ') + '</div>' +
                    '<button class="cmd-btn" data-cmd="unkick" data-rooms="' + kickedFrom.join(',') + '" type="button" style="padding:6px 14px;background:#84cc16;color:#fff;border:none;border-radius:6px;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;">🔓 فك الطرد من كل الرومات</button>';
                var sect2 = document.getElementById('cmd-section-active');
                if (sect2) sect2.appendChild(kd);
                var kb = kd.querySelector('[data-cmd="unkick"]');
                if (kb) kb.onclick = function() { _cmdUnkick(this.getAttribute('data-rooms')); };
            }
        });
    }

    if (hasAnyActive) {
        h += '<div style="background:rgba(255,68,68,0.06);border:1px solid rgba(255,68,68,0.3);border-radius:12px;padding:12px;margin-bottom:14px;">';
        h += '<div style="color:#ff9999;font-size:13px;font-weight:900;margin-bottom:8px;">⚡ إجراءات سارية على ' + (tg.name || '') + '</div>';
        h += '<div id="cmd-section-active">' + activeActions + '</div>';
        h += '</div>';
    }

    /* ─── قسم 2: الأوامر الجديدة ─── */
    h += '<div style="color:#ffd700;font-size:13px;font-weight:900;margin-bottom:10px;">📋 الأوامر المتاحة</div>';
    h += '<div style="display:flex;flex-direction:column;gap:6px;" id="cmd-new-list">';

    // 🎁 إرسال هدية (الكل)
    h += '<button class="cmd-new-btn" data-new="gift" type="button">🎁 إرسال هدية</button>';

    // 📞 مكالمة صوتية (الكل) — مؤجل
    h += '<button class="cmd-new-btn" data-new="call" type="button" style="opacity:0.6;">📞 مكالمة صوتية (قريباً)</button>';

    // 🚨 إبلاغ (الكل)
    h += '<button class="cmd-new-btn" data-new="report" type="button">🚨 إبلاغ عن المستخدم</button>';

    // ⭐ إهداء نقاط (Owner+ = 75+)
    if (myLvl >= 75) {
        h += '<button class="cmd-new-btn" data-new="points" type="button">⭐ إهداء نقاط</button>';
    }

    // 🔇 منع كتابة في الروم (Grand Owner+ = 80+)
    if (myLvl >= 80) {
        h += '<button class="cmd-new-btn" data-new="mute" type="button">🔇 منع كتابة في الروم</button>';
    }

    // 🚪 طرد من الروم (Grand Owner+ = 80+)
    if (myLvl >= 80) {
        h += '<button class="cmd-new-btn" data-new="kick_room" type="button">🚪 طرد من الروم</button>';
    }

    // ⏸️ حظر مؤقت (Master Owner+ = 90+)
    if (myLvl >= 90) {
        h += '<button class="cmd-new-btn" data-new="tempban" type="button">⏸️ حظر مؤقت</button>';
    }

    // ⏱️ طرد مؤقت (Master Owner+ = 90+)
    if (myLvl >= 90) {
        h += '<button class="cmd-new-btn" data-new="tempkick" type="button">⏱️ طرد مؤقت</button>';
    }

    // 🚫 طرد دائم (Master Owner+ = 90+)
    if (myLvl >= 90) {
        h += '<button class="cmd-new-btn" data-new="permkick" type="button" style="color:#ff7777;">🚫 طرد دائم</button>';
    }

    // ⛓️ سجن (Admin+ = 65+)
    if (myLvl >= 65) {
        h += '<button class="cmd-new-btn" data-new="jail" type="button">⛓️ سجن</button>';
    }

    // 🎖️ ترقية (حسب الصلاحية)
    var canP = (typeof canPromoteTo === 'function') ? canPromoteTo(me, tg, 'Room Owner') : false;
    if (canP) {
        h += '<button class="cmd-new-btn" data-new="promote" type="button">🎖️ ترقية</button>';
    }

    // 📉 تخفيض (Master Owner+ = 90+)
    var canD = (typeof canDemoteUser === 'function') ? canDemoteUser(me, tg) : false;
    if (canD && myLvl >= 90) {
        h += '<button class="cmd-new-btn" data-new="demote" type="button">📉 تخفيض الرتبة</button>';
    }

    // ⚔️ أوامر إدارية (King/Queen فقط)
    if (me.rank === 'King' || me.rank === 'Queen') {
        h += '<button class="cmd-new-btn" data-new="admin" type="button" style="background:linear-gradient(135deg,#8b0000,#d4af37);color:#fff;">⚔️ أوامر إدارية متقدمة</button>';
    }

    h += '</div>';

    container.innerHTML = h;

    // ستايل الأزرار الجديدة (inject)
    if (!document.getElementById('cmd-new-styles')) {
        var st = document.createElement('style');
        st.id = 'cmd-new-styles';
        st.textContent = `
.cmd-new-btn {
    padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(212,175,55,0.3);
    border-radius: 10px;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    text-align: right;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 8px;
}
.cmd-new-btn:hover {
    background: rgba(212,175,55,0.15);
    border-color: #ffd700;
}
.cmd-new-btn:active { transform: scale(0.98); }
        `;
        document.head.appendChild(st);
    }

    // ربط الأحداث
    container.querySelectorAll('[data-cmd]').forEach(function(btn) {
        btn.onclick = function() { _cmdUnblock(btn.getAttribute('data-cmd'), btn); };
    });
    container.querySelectorAll('[data-new]').forEach(function(btn) {
        btn.onclick = function() { _cmdNew(btn.getAttribute('data-new')); };
    });
}

/* ⭐ v3: تنفيذ أوامر الفك */
async function _cmdUnblock(cmd, btn) {
    if (!targetUser || !currentUser) return;
    if (!confirm('تنفيذ هذا الإجراء؟')) return;
    if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
    try {
        if (cmd === 'unmute') {
            await db.ref('users/' + targetUser.uid).update({ muteInRoom: null, muteUntil: 0, muteRoom: null });
            toast('🔊 تم فك المنع');
        } else if (cmd === 'unjail') {
            await db.ref('users/' + targetUser.uid).update({ isJailed: false, jailUntil: 0, jailReleasedAt: Date.now() });
            toast('🔓 تم فك السجن');
        } else if (cmd === 'unban') {
            await db.ref('users/' + targetUser.uid).update({ isBanned: false, bannedUntil: 0, permanentBan: false });
            toast('🔓 تم فك الحظر');
        }
        // سجل
        try {
            db.ref('audit_log').push({
                type: 'unblock_' + cmd,
                byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
        } catch(e) {}
        setTimeout(function() { renderCommandsTab(); }, 400);
    } catch(e) {
        toast('⚠️ فشل: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = '🔓 فك'; }
    }
}

async function _cmdUnkick(roomsStr) {
    if (!roomsStr || !currentUser) return;
    var rooms = roomsStr.split(',');
    try {
        for (var i = 0; i < rooms.length; i++) {
            await db.ref('room_kicks/' + rooms[i] + '/' + targetUser.uid).remove();
        }
        toast('🔓 تم فك الطرد');
        setTimeout(function() { renderCommandsTab(); }, 400);
    } catch(e) {
        toast('⚠️ فشل: ' + e.message);
    }
}

/* ⭐ v3: تنفيذ الأوامر الجديدة */
async function _cmdNew(cmd) {
    if (!targetUser || !currentUser) return;

    if (cmd === 'gift') { toast('🎁 قريباً'); return; }
    if (cmd === 'call') { toast('📞 قريباً — يحتاج منصة صوتية'); return; }
    if (cmd === 'report') {
        _cmdReportUser();
        return;
    }
    if (cmd === 'points') {
        _cmdGivePoints();
        return;
    }
    if (cmd === 'mute') {
        _cmdMuteInRoom();
        return;
    }
    if (cmd === 'kick_room') {
        _cmdKickFromRoom();
        return;
    }
    if (cmd === 'tempban') {
        _cmdTempBan();
        return;
    }
    if (cmd === 'tempkick') {
        _cmdTempKick();
        return;
    }
    if (cmd === 'permkick') {
        _cmdPermKick();
        return;
    }
    if (cmd === 'jail') {
        _cmdJail();
        return;
    }
    if (cmd === 'promote') {
        _cmdPromote();
        return;
    }
    if (cmd === 'demote') {
        _cmdDemote();
        return;
    }
    if (cmd === 'admin') {
        _cmdAdminAdvanced();
        return;
    }
}

function _cmdReportUser() {
    if (!targetUser) return;
    var reasons = [
        { id: 'abuse', name: '🚫 محتوى مسيء' },
        { id: 'promo', name: '📢 ترويج / إعلان' },
        { id: 'adult', name: '🔞 محتوى غير لائق' },
        { id: 'harass', name: '💢 تحرش / إزعاج' },
        { id: 'other', name: '❓ سبب آخر' }
    ];
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:8px;">اختر سبب الإبلاغ:</label>';
    h += '<div style="display:flex;flex-direction:column;gap:6px;">';
    reasons.forEach(function(r) {
        h += '<button type="button" class="cmd-reason-btn" data-r="' + r.id + '" style="padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(212,175,55,0.3);border-radius:8px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;text-align:right;cursor:pointer;">' + r.name + '</button>';
    });
    h += '</div>';
    openAppModal('🚨 إبلاغ عن ' + (targetUser.name || ''), '', h, function() {
        // إغلاق فقط
    }, null, 'modal-close-only');

    setTimeout(function() {
        document.querySelectorAll('.cmd-reason-btn').forEach(function(b) {
            b.onclick = async function() {
                var reason = this.getAttribute('data-r');
                closeModal('app-modal');
                try {
                    var hourAgo = Date.now() - 3600000;
                    var ex = await db.ref('reports').orderByChild('time').startAt(hourAgo).once('value');
                    var data = ex.val() || {};
                    var dup = Object.values(data).some(function(r) {
                        return r.reporterUid === currentUser.uid && r.targetUid === targetUser.uid;
                    });
                    if (dup) { toast('⏳ أبلغت عنه مؤخراً'); return; }
                    await db.ref('reports').push({
                        reporterUid: currentUser.uid,
                        reporterName: currentUser.name || 'زائر',
                        reporterAvatar: currentUser.avatar || '',
                        targetUid: targetUser.uid,
                        targetName: targetUser.name || '',
                        targetAvatar: targetUser.avatar || '',
                        reason: reason,
                        messageText: '',
                        roomId: 'profile',
                        isPrivate: false,
                        time: Date.now(),
                        status: 'pending'
                    });
                    toast('✅ تم الإبلاغ');
                } catch(e) {
                    toast('⚠️ فشل: ' + e.message);
                }
            };
        });
    }, 100);
}

function _cmdGivePoints() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">عدد النقاط:</label>';
    h += '<input type="number" id="cmd-pts-input" min="1" max="10000" value="100" style="width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;">';
    openAppModal('⭐ إهداء نقاط', '', h, async function() {
        var amt = parseInt(document.getElementById('cmd-pts-input').value);
        if (!amt || amt < 1 || amt > 10000) { toast('⚠️ رقم غير صحيح'); return; }
        try {
            await db.ref('bot_data/quiz/scores/' + targetUser.uid).transaction(function(c) { return (c || 0) + amt; });
            db.ref('audit_log').push({
                type: 'give_points', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, amount: amt,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('⭐ أُهدي ' + amt + ' نقطة');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdMuteInRoom() {
    var roomId = (typeof ChatState !== 'undefined' && ChatState.currentRoom) || 'general';
    var roomName = (QAMAR.ROOMS[roomId] && QAMAR.ROOMS[roomId].name) || roomId;
    openAppModal('🔇 منع كتابة', 'هل تريد منع ' + (targetUser.name || '') + ' من الكتابة في ' + roomName + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                muteInRoom: true,
                muteRoom: roomId,
                muteUntil: 0  // حتى فك يدوي
            });
            db.ref('audit_log').push({
                type: 'mute_room', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, roomId: roomId,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('🔇 تم المنع');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdKickFromRoom() {
    var roomId = (typeof ChatState !== 'undefined' && ChatState.currentRoom) || 'general';
    var roomName = (QAMAR.ROOMS[roomId] && QAMAR.ROOMS[roomId].name) || roomId;
    openAppModal('🚪 طرد من الروم', 'طرد ' + (targetUser.name || '') + ' من ' + roomName + '؟', '', async function() {
        try {
            await db.ref('room_kicks/' + roomId + '/' + targetUser.uid).set({
                by: currentUser.uid, byName: currentUser.name, at: Date.now()
            });
            db.ref('audit_log').push({
                type: 'kick_room', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, roomId: roomId,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('🚪 تم الطرد من الروم');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdTempBan() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">المدة:</label>';
    h += '<select id="cmd-tb-dur" style="width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;">';
    h += '<option value="60">ساعة</option><option value="360">6 ساعات</option><option value="1440" selected>يوم</option><option value="10080">أسبوع</option>';
    h += '</select>';
    openAppModal('⏸️ حظر مؤقت', '', h, async function() {
        var mins = parseInt(document.getElementById('cmd-tb-dur').value);
        try {
            await db.ref('users/' + targetUser.uid).update({
                isBanned: true,
                bannedUntil: Date.now() + mins * 60000,
                banReason: 'إجراء إداري'
            });
            db.ref('audit_log').push({
                type: 'temp_ban', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, minutes: mins,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('⏸️ تم الحظر المؤقت');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdTempKick() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">المدة:</label>';
    h += '<select id="cmd-tk-dur" style="width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;">';
    h += '<option value="60">ساعة</option><option value="360">6 ساعات</option><option value="1440" selected>يوم</option><option value="10080">أسبوع</option>';
    h += '</select>';
    openAppModal('⏱️ طرد مؤقت', '', h, async function() {
        var mins = parseInt(document.getElementById('cmd-tk-dur').value);
        try {
            await db.ref('users/' + targetUser.uid).update({
                isBanned: true,
                bannedUntil: Date.now() + mins * 60000,
                banReason: 'طرد مؤقت',
                tempKick: true
            });
            db.ref('audit_log').push({
                type: 'temp_kick', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, minutes: mins,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('⏱️ تم الطرد المؤقت');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdPermKick() {
    openAppModal('🚫 طرد دائم', '⚠️ سيتم طرد ' + (targetUser.name || '') + ' نهائياً. متابعة؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                isBanned: true,
                bannedUntil: Date.now() + 365 * 24 * 60 * 60 * 1000,
                banReason: 'طرد دائم',
                permanentBan: true
            });
            db.ref('audit_log').push({
                type: 'perm_kick', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('🚫 تم الطرد الدائم');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdJail() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">المدة (1-120 دقيقة):</label>';
    h += '<input type="number" id="cmd-jail-min" min="1" max="120" value="5" style="width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;">';
    openAppModal('⛓️ سجن', '', h, async function() {
        var mins = parseInt(document.getElementById('cmd-jail-min').value);
        if (!mins || mins < 1 || mins > 120) { toast('⚠️ رقم غير صحيح'); return; }
        try {
            await db.ref('users/' + targetUser.uid).update({
                isJailed: true,
                jailUntil: Date.now() + mins * 60000,
                jailReason: 'إجراء إداري'
            });
            db.ref('audit_log').push({
                type: 'jail', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, minutes: mins,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('⛓️ تم السجن');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdPromote() {
    var me = currentUser;
    var all = ['User', 'Premium', 'Admin', 'Super Admin', 'Owner', 'Grand Owner', 'Room Owner', 'Master Owner'];
    if (me.rank === 'King') all.push('Queen');
    var opts = all.filter(function(r) {
        return typeof canPromoteTo === 'function' && canPromoteTo(me, targetUser, r);
    });
    if (!opts.length) { toast('⚠️ لا يمكنك الترقية'); return; }
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">الرتبة الجديدة:</label>';
    h += '<select id="cmd-promote-r" style="width:100%;padding:10px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;">';
    opts.forEach(function(r) {
        h += '<option value="' + r + '">' + rankBadge(r) + ' ' + r + '</option>';
    });
    h += '</select>';
    openAppModal('🎖️ ترقية', 'الحالية: ' + targetUser.rank, h, async function() {
        var newRank = document.getElementById('cmd-promote-r').value;
        var lvl = (typeof getRankLevel === 'function') ? getRankLevel(newRank) : 50;
        try {
            await db.ref('users/' + targetUser.uid).update({ rank: newRank, rankLevel: lvl });
            db.ref('audit_log').push({
                type: 'promote', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                fromRank: targetUser.rank, toRank: newRank,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('✅ تمت الترقية');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdDemote() {
    openAppModal('📉 تخفيض الرتبة', 'سيُنزل ' + (targetUser.name || '') + ' إلى User.', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({ rank: 'User', rankLevel: 50, queenOrder: null });
            db.ref('audit_log').push({
                type: 'demote', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                fromRank: targetUser.rank, toRank: 'User',
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('✅ تم التخفيض');
            setTimeout(function() { renderCommandsTab(); }, 400);
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _cmdAdminAdvanced() {
    // نرسل رسالة للأب (index.html) لفتح أدوات الملك
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                action: 'openUserActions',
                targetUid: targetUser.uid,
                targetName: targetUser.name
            }, '*');
        }
    } catch(e) {
        toast('⚠️ فشل');
    }
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
        if (localStorage.getItem('profile_bg_value')) {
            bgType = localStorage.getItem('profile_bg_type') || 'color';
            bgValue = localStorage.getItem('profile_bg_value');
            if (typeof applyBg === 'function') applyBg();
        }
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

function saveToChat() {
    if (!currentUser) return;
    _localLockUntil = Date.now() + 10000;
    const existing = JSON.parse(localStorage.getItem('qamar_current_user') || localStorage.getItem('qamar_user') || '{}');
    const fv = localStorage.getItem('saved_avatar_frame_motion');

    const isVideo = bgType === 'video';
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
        profileBgValue: isVideo ? null : bgValue,
        musicURL: musicURL || null,
        color: existing.color || '#ffffff'
    });
    localStorage.setItem('qamar_current_user', JSON.stringify(u));
    localStorage.setItem('qamar_user', JSON.stringify(u));
    if (currentUser.uid && typeof db !== 'undefined' && db) {
        const firebaseData = {
            name: u.name, bio: u.bio, cover: u.cover, avatar: u.avatar,
            nameColor: u.nameColor, nameGradient: u.nameGradient,
            nameFrame: u.nameFrame, nameShape: u.nameShape, nameGlow: u.nameGlow,
            nameBgGradient: u.nameBgGradient,
            avatarFrame: u.avatarFrame, poetry: u.poetry,
            profileBgType: u.profileBgType, profileBgValue: u.profileBgValue,
            musicURL: u.musicURL
        };
        db.ref('users/' + currentUser.uid).update(firebaseData).catch(() => {});
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

function _updateHeartUI() {
    const h = document.getElementById('btn-heart');
    if (!h) return;
    if (_iLiked) {
        h.textContent = '💔';
        h.title = 'إلغاء الإعجاب';
        h.style.filter = 'grayscale(0.4)';
    } else {
        h.textContent = '❤️';
        h.title = 'إعجاب';
        h.style.filter = '';
    }
}

async function _checkIfILiked() {
    _iLiked = false;
    if (viewMode !== 'visitor') return;
    if (!currentUser || !currentUser.uid) return;
    if (!targetUser || !targetUser.uid) return;
    if (!db) return;
    try {
        const s = await db.ref('users/' + targetUser.uid + '/likes/' + currentUser.uid).once('value');
        _iLiked = s.exists();
    } catch(e) { _iLiked = false; }
    _updateHeartUI();
}

async function _toggleLike(btn) {
    if (!targetUser || !targetUser.uid || !currentUser || !currentUser.uid) return;

    if (btn) {
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => btn.style.transform = '', 300);
    }

    if (!_iLiked) {
        try {
            await db.ref('users/' + targetUser.uid + '/likes/' + currentUser.uid).set({
                time: Date.now(),
                name: currentUser.name || 'زائر',
                avatar: currentUser.avatar || ''
            });
            _iLiked = true;
            _updateHeartUI();
            await sendNotif(targetUser.uid, 'like', '❤️', 'أعجب بك');
            toast('❤️ تم الإعجاب');
        } catch(e) {
            console.warn('[toggleLike] فشل الإعجاب:', e);
            toast('⚠️ فشل الإعجاب');
            _iLiked = false;
            _updateHeartUI();
        }
    } else {
        try {
            await db.ref('users/' + targetUser.uid + '/likes/' + currentUser.uid).remove();
            _iLiked = false;
            _updateHeartUI();
            toast('💔 أُلغي الإعجاب');
        } catch(e) {
            console.warn('[toggleLike] فشل الإلغاء:', e);
            toast('⚠️ فشل الإلغاء');
            _iLiked = true;
            _updateHeartUI();
        }
    }
}

function initVisitor() {
    if (viewMode !== 'visitor') return;

    const h = document.getElementById('btn-heart');
    if (h) {
        h.onclick = () => _toggleLike(h);
        _checkIfILiked();
    }

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

    // ⭐ v3: زر ⚔️ متاح للجميع في visitor mode
    const cmd = document.getElementById('btn-admin-actions');
    if (cmd) {
        cmd.style.display = 'flex';
        cmd.onclick = () => {
            // يفتح تبويب الأوامر
            var tabs = document.querySelectorAll('.tab');
            tabs.forEach(function(t) {
                if (t.getAttribute('data-target') === 'commands-tab') {
                    t.click();
                }
            });
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
    if (!targetUid) return;
    if (typeof db === 'undefined' || !db) return;
    var payload = {
        fromUid: (currentUser && currentUser.uid) || '',
        fromName: (currentUser && currentUser.name) || 'زائر',
        fromAvatar: (currentUser && currentUser.avatar) || '',
        type: type || 'unknown',
        icon: icon || '🔔',
        preview: title || '',
        time: Date.now(),
        read: false
    };
    try {
        await db.ref('user_notifications/' + targetUid).push(payload);
    } catch (e) {
        console.error('[sendNotif] فشل:', e);
    }
}

function openChat(uid, name) {
    window.parent.postMessage({action:'openPrivateChat', uid:uid, name:name}, '*');
    if (window.parent === window) {
        localStorage.setItem('open_chat_uid', uid);
        localStorage.setItem('open_chat_name', name);
        location.href = 'index.html?chat=' + uid;
    }
}

/* ⭐ v3: openAppModal — دعم أوضاع متعددة */
function openAppModal(title, text, typeOrHtml, options, currentVal, onSave) {
    const m = document.getElementById('app-modal');
    if (!m) return;
    document.getElementById('modal-title').innerText = title;
    const textEl = document.getElementById('modal-text');
    textEl.innerText = text || '';
    const c = document.getElementById('modal-dyn');
    c.innerHTML = '';

    // إذا كان typeOrHtml يحتوي HTML (يبدأ بـ <)
    if (typeof typeOrHtml === 'string' && typeOrHtml.trim().startsWith('<')) {
        c.innerHTML = typeOrHtml;
    } else if (typeOrHtml === 'input') {
        const i = document.createElement('input');
        i.type = 'text';
        i.id = 'modal-input-val';
        i.value = currentVal || '';
        c.appendChild(i);
    } else if (typeOrHtml === 'select') {
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
        if (typeOrHtml === 'input') {
            const i = document.getElementById('modal-input-val');
            if (i) v = i.value;
        } else if (typeOrHtml === 'select') {
            const s = document.getElementById('modal-select-val');
            if (s) v = s.value;
        }
        if (typeof onSave === 'function') onSave(v);
        m.classList.remove('active');
    };
    document.getElementById('modal-cancel').onclick = () => m.classList.remove('active');

    // ⭐ v3: إذا كان "modal-close-only" → زر OK يغلق فقط
    if (onSave === 'modal-close-only') {
        document.getElementById('modal-ok').textContent = 'حسناً';
        document.getElementById('modal-ok').onclick = () => m.classList.remove('active');
        document.getElementById('modal-cancel').style.display = 'none';
    } else {
        document.getElementById('modal-ok').textContent = 'موافق';
        document.getElementById('modal-cancel').style.display = '';
    }
}

console.log('✅ profile-core.js v3.0 loaded — commands tab + stories + info actions');
