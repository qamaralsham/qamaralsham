// ==============================================
// profile-core.js v4.0 — NameEffects + Default Frame + Tabs جديدة
// ==============================================
// ✅ v4.0:
//   1. دمج NameEffects المركزي
//   2. الإطار الافتراضي حسب الرتبة (ذهبي/وردي/فضي/رمادي)
//   3. منطق التبويبات الجديد (يتبدل حسب الوضع)
//   4. تبويب 📸 حالتي مربوط بـ Stories
//   5. تبويب ⚔️ أوامر (Visitor Admin+)
//   6. تبويب ⚙️ إعدادات (Owner only)
//   7. زر الموسيقى للزوار
//   8. زر الطي للزوار
//   9. إزالة prompt() — استخدام openAppModal
// ==============================================

let currentUser = null, targetUser = null, viewMode = 'owner';
let bgType = 'color', bgValue = '#050508', musicURL = null, musicPlaying = false;
let nameColor = null, nameGradient = null, nameFrame = null, nameShape = null, nameGlow = 'none';
let nameSize = 20;
let frameInset = -8;
let _localLockUntil = 0;
let _lastUserHash = '';
let _iLiked = false;
let _isVisitorCollapsed = false;

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

function getRankLevel(rank) {
    const levels = {King:100, Queen:95, 'Master Owner':90, 'Room Owner':85, 'Grand Owner':80, Owner:75, 'Super Admin':70, Admin:65, Premium:60, User:50};
    return levels[rank] || 50;
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

/* ══════════════════════════════════════════════ */
/* ⭐ v4: الموسيقى — من الرابط المخصص             */
/* ══════════════════════════════════════════════ */
function setupMusicToggle() {
    var btn = document.getElementById('music-btn-mini');
    var player = document.getElementById('music-player');
    if (!btn || !player) return;
    if (btn.__setup) return;
    btn.__setup = true;

    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!musicURL) {
            toast('⚠️ لا توجد موسيقى');
            return;
        }
        if (musicPlaying) {
            player.pause();
            musicPlaying = false;
            btn.innerHTML = '<i class="fas fa-play"></i>';
            btn.classList.remove('playing');
        } else {
            player.play().then(function() {
                musicPlaying = true;
                btn.innerHTML = '<i class="fas fa-pause"></i>';
                btn.classList.add('playing');
            }).catch(function() {
                toast('⚠️ تعذر تشغيل الموسيقى');
            });
        }
    };
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: زر الطي (وضع الزائر فقط)                 */
/* ══════════════════════════════════════════════ */
function setupCollapseToggle() {
    var btn = document.getElementById('btn-collapse-info');
    if (!btn) return;
    if (btn.__setup) return;
    btn.__setup = true;

    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        _isVisitorCollapsed = !_isVisitorCollapsed;
        document.body.classList.toggle('visitor-collapsed', _isVisitorCollapsed);
        var icon = btn.querySelector('i');
        if (icon) {
            icon.className = _isVisitorCollapsed ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
        btn.title = _isVisitorCollapsed ? 'إظهار المعلومات' : 'طي المعلومات';
    };
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: منطق التبويبات الجديد                     */
/* ══════════════════════════════════════════════ */
function _isAdmin() {
    if (!currentUser) return false;
    var lvl = currentUser.rankLevel || getRankLevel(currentUser.rank);
    return lvl >= 65;
}

function _isOwnerLevel() {
    if (!currentUser) return false;
    var lvl = currentUser.rankLevel || getRankLevel(currentUser.rank);
    return lvl >= 75;
}

function renderTabsForMode() {
    var tabsBar = document.getElementById('tabsBar');
    if (!tabsBar) return;

    var isVisitor = viewMode === 'visitor';
    var isAdminVisitor = isVisitor && _isAdmin();

    var html = '';

    // 🏠 الرئيسية (دائماً)
    html += '<button class="tab active" data-tab="home"><i class="fas fa-home"></i><span>الرئيسية</span></button>';

    // 📸 لحظات (دائماً)
    html += '<button class="tab" data-tab="moments"><i class="fas fa-camera"></i><span>لحظات</span></button>';

    // 👥 أصدقاء (دائماً)
    html += '<button class="tab" data-tab="friends"><i class="fas fa-users"></i><span>أصدقاء</span></button>';

    // ⚙️ إعدادات (Owner فقط)
    if (!isVisitor) {
        html += '<button class="tab" data-tab="settings"><i class="fas fa-cog"></i><span>إعدادات</span></button>';
    }

    // ⚔️ أوامر (Visitor Admin+ فقط)
    if (isAdminVisitor) {
        html += '<button class="tab" data-tab="admin"><i class="fas fa-crosshairs"></i><span>أوامر</span></button>';
    }

    tabsBar.innerHTML = html;

    // ربط الأحداث
    tabsBar.querySelectorAll('.tab').forEach(function(t) {
        t.onclick = function() {
            var tabName = t.getAttribute('data-tab');
            switchTab(tabName);
        };
    });
}

function switchTab(tabName) {
    var tabsBar = document.getElementById('tabsBar');
    if (tabsBar) {
        tabsBar.querySelectorAll('.tab').forEach(function(t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
        });
    }
    document.querySelectorAll('.tab-content').forEach(function(c) {
        c.classList.toggle('active', c.getAttribute('data-content') === tabName);
    });

    // ننفذ منطق عند التبويب
    if (tabName === 'settings') renderSettingsTab();
    if (tabName === 'admin') renderAdminTab();
    if (tabName === 'moments') renderMomentsTab();
    if (tabName === 'friends') renderFriendsTab();
}

window.switchTab = switchTab;

/* ══════════════════════════════════════════════ */
/* ⭐ v4: عرض تبويب الإعدادات                      */
/* ══════════════════════════════════════════════ */
function renderSettingsTab() {
    // يُبنى في HTML — لا حاجة لإعادة البناء
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: عرض تبويب الأوامر (Visitor Admin+)      */
/* ══════════════════════════════════════════════ */
function renderAdminTab() {
    var container = document.querySelector('.tab-content[data-content="admin"] .section');
    if (!container) return;

    if (!currentUser || !targetUser) return;
    if (currentUser.uid === targetUser.uid) {
        container.innerHTML = '<div class="empty">لا يمكن تنفيذ أوامر على نفسك</div>';
        return;
    }

    var meLvl = currentUser.rankLevel || getRankLevel(currentUser.rank);
    var tgLvl = targetUser.rankLevel || getRankLevel(targetUser.rank);

    var canWarn = meLvl >= 65;
    var canJail = meLvl >= 75 && meLvl > tgLvl;
    var canKick = meLvl >= 80 && meLvl > tgLvl;
    var canMute = meLvl >= 80 && meLvl > tgLvl;
    var canBan = meLvl >= 90 && meLvl > tgLvl;
    var canPoints = meLvl >= 75;

    var h = '';

    // 💬 التواصل
    h += '<div class="action-category">';
    h += '<div class="action-category-title">💬 التواصل</div>';
    h += '<button class="action-btn" data-action="message"><i class="fas fa-comment"></i> إرسال رسالة</button>';
    h += '<button class="action-btn" data-action="report"><i class="fas fa-flag"></i> إبلاغ عن المستخدم</button>';
    h += '<button class="action-btn" data-action="gift"><i class="fas fa-gift"></i> إرسال هدية</button>';
    h += '</div>';

    // 🎖️ الترقية والمكافآت
    if (canPoints || meLvl >= 90) {
        h += '<div class="action-category">';
        h += '<div class="action-category-title">🎖️ الترقية والمكافآت</div>';
        if (canPoints) {
            h += '<button class="action-btn" data-action="points"><i class="fas fa-star"></i> إهداء نقاط</button>';
        }
        if (meLvl >= 90) {
            h += '<button class="action-btn" data-action="promote"><i class="fas fa-arrow-up"></i> ترقية الرتبة</button>';
        }
        h += '</div>';
    }

    // 🛡️ العقوبات
    if (canWarn || canMute || canKick || canJail) {
        h += '<div class="action-category">';
        h += '<div class="action-category-title">🛡️ العقوبات</div>';
        if (canWarn) h += '<button class="action-btn warning" data-action="warn"><i class="fas fa-exclamation-triangle"></i> تحذير</button>';
        if (canMute) h += '<button class="action-btn warning" data-action="mute"><i class="fas fa-microphone-slash"></i> منع الكتابة في الروم</button>';
        if (canKick) h += '<button class="action-btn warning" data-action="kick"><i class="fas fa-door-closed"></i> طرد من الغرفة</button>';
        if (canJail) h += '<button class="action-btn danger" data-action="jail"><i class="fas fa-lock"></i> سجن مؤقت</button>';
        h += '</div>';
    }

    // ⛔ الحظر
    if (canBan) {
        h += '<div class="action-category">';
        h += '<div class="action-category-title">⛔ الحظر</div>';
        h += '<button class="action-btn danger" data-action="ban-temp"><i class="fas fa-ban"></i> حظر مؤقت</button>';
        if (meLvl >= 95 || currentUser.rank === 'King' || currentUser.rank === 'Queen') {
            h += '<button class="action-btn danger" data-action="ban-perm"><i class="fas fa-times-circle"></i> حظر دائم</button>';
        }
        h += '</div>';
    }

    // 🔓 فك العقوبات (إذا كان هناك عقوبة سارية)
    var hasPunishment = (targetUser.isBanned && targetUser.bannedUntil > Date.now()) ||
                       (targetUser.isJailed && targetUser.jailUntil > Date.now()) ||
                       (targetUser.muteInRoom && targetUser.muteRoom);

    if (hasPunishment && meLvl >= 90) {
        h += '<div class="action-category">';
        h += '<div class="action-category-title">🔓 فك العقوبات</div>';
        if (targetUser.isBanned && targetUser.bannedUntil > Date.now()) {
            h += '<button class="action-btn" data-action="unban"><i class="fas fa-unlock"></i> فك الحظر</button>';
        }
        if (targetUser.isJailed && targetUser.jailUntil > Date.now()) {
            h += '<button class="action-btn" data-action="unjail"><i class="fas fa-unlock-alt"></i> فك السجن</button>';
        }
        if (targetUser.muteInRoom && targetUser.muteRoom) {
            h += '<button class="action-btn" data-action="unmute"><i class="fas fa-volume-up"></i> فك المنع</button>';
        }
        h += '</div>';
    }

    // ⚔️ متقدم (King only)
    if (currentUser.rank === 'King') {
        h += '<div class="action-category">';
        h += '<div class="action-category-title">⚔️ متقدم</div>';
        h += '<button class="action-btn" data-action="editProfile"><i class="fas fa-user-edit"></i> تعديل البروفايل</button>';
        h += '<button class="action-btn danger" data-action="deleteAccount"><i class="fas fa-user-times"></i> حذف الحساب</button>';
        h += '</div>';
    }

    container.innerHTML = h;

    // ربط الأحداث
    container.querySelectorAll('[data-action]').forEach(function(btn) {
        btn.onclick = function() {
            _executeAdminAction(btn.getAttribute('data-action'));
        };
    });
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: تنفيذ الأوامر                            */
/* ══════════════════════════════════════════════ */
async function _executeAdminAction(action) {
    if (!currentUser || !targetUser) return;

    switch (action) {
        case 'message':
            // فتح الخاص
            if (typeof window.parent !== 'undefined' && window.parent !== window) {
                window.parent.postMessage({ action: 'openPrivateChat', uid: targetUser.uid, name: targetUser.name }, '*');
            }
            break;

        case 'report':
            _askReportReason();
            break;

        case 'gift':
            toast('🎁 قريباً');
            break;

        case 'points':
            _askPoints();
            break;

        case 'promote':
            _askPromote();
            break;

        case 'warn':
            _doWarn();
            break;

        case 'mute':
            _doMute();
            break;

        case 'kick':
            _doKick();
            break;

        case 'jail':
            _askJail();
            break;

        case 'ban-temp':
            _askBan(false);
            break;

        case 'ban-perm':
            _askBan(true);
            break;

        case 'unban':
            _doUnban();
            break;

        case 'unjail':
            _doUnjail();
            break;

        case 'unmute':
            _doUnmute();
            break;

        case 'editProfile':
            toast('🖼️ قريباً');
            break;

        case 'deleteAccount':
            _askDeleteAccount();
            break;
    }
}

/* ════════ تقرير ════════ */
function _askReportReason() {
    var reasons = [
        { id: 'abuse', name: '🚫 محتوى مسيء' },
        { id: 'promo', name: '📢 ترويج / إعلان' },
        { id: 'adult', name: '🔞 محتوى غير لائق' },
        { id: 'harass', name: '💢 تحرش / إزعاج' },
        { id: 'other', name: '❓ سبب آخر' }
    ];

    var h = '<div style="display:flex;flex-direction:column;gap:8px;">';
    reasons.forEach(function(r) {
        h += '<button type="button" class="report-reason-btn" data-r="' + r.id + '" style="padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(212,175,55,0.3);border-radius:10px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;text-align:right;cursor:pointer;">' + r.name + '</button>';
    });
    h += '</div>';

    openAppModal('🚨 إبلاغ عن ' + (targetUser.name || ''), '', h, function() {}, null, true);

    setTimeout(function() {
        document.querySelectorAll('.report-reason-btn').forEach(function(b) {
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
                    toast('⚠️ فشل');
                }
            };
        });
    }, 100);
}

/* ════════ النقاط ════════ */
function _askPoints() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:8px;">عدد النقاط (1-10000):</label>';
    h += '<input type="number" id="cmd-pts-input" min="1" max="10000" value="100" style="width:100%;padding:12px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;box-sizing:border-box;">';

    openAppModal('⭐ إهداء نقاط', 'إلى: ' + (targetUser.name || ''), h, async function() {
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

/* ════════ الترقية ════════ */
function _askPromote() {
    var all = ['User', 'Premium', 'Admin', 'Super Admin', 'Owner', 'Grand Owner', 'Room Owner', 'Master Owner'];
    var opts = all.filter(function(r) {
        return getRankLevel(r) < getRankLevel(currentUser.rank);
    });
    if (currentUser.rank === 'King') opts.push('Queen');

    if (!opts.length) { toast('⚠️ لا يمكنك الترقية'); return; }

    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:8px;">الرتبة الجديدة:</label>';
    h += '<select id="cmd-promote-r" style="width:100%;padding:12px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;box-sizing:border-box;">';
    opts.forEach(function(r) {
        h += '<option value="' + r + '">' + rankBadge(r) + ' ' + r + '</option>';
    });
    h += '</select>';

    openAppModal('🎖️ ترقية', 'الحالية: ' + (targetUser.rank || 'User'), h, async function() {
        var newRank = document.getElementById('cmd-promote-r').value;
        var lvl = getRankLevel(newRank);
        try {
            await db.ref('users/' + targetUser.uid).update({ rank: newRank, rankLevel: lvl });
            db.ref('audit_log').push({
                type: 'promote', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                fromRank: targetUser.rank, toRank: newRank,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('✅ تمت الترقية');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ التحذير ════════ */
function _doWarn() {
    openAppModal('⚠️ تحذير', 'تحذير ' + (targetUser.name || '') + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid + '/warnings').transaction(function(c) { return (c || 0) + 1; });
            db.ref('audit_log').push({
                type: 'warn', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('✅ تم التحذير');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ منع الكتابة ════════ */
function _doMute() {
    var roomId = (typeof parent !== 'undefined' && parent.ChatState && parent.ChatState.currentRoom) || 'general';
    var roomName = (typeof QAMAR !== 'undefined' && QAMAR.ROOMS && QAMAR.ROOMS[roomId]) ? QAMAR.ROOMS[roomId].name : roomId;

    openAppModal('🔇 منع كتابة', 'منع ' + (targetUser.name || '') + ' من الكتابة في ' + roomName + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                muteInRoom: true,
                muteRoom: roomId,
                muteUntil: 0
            });
            db.ref('audit_log').push({
                type: 'mute_room', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, roomId: roomId,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('🔇 تم المنع');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ الطرد من الغرفة ════════ */
function _doKick() {
    var roomId = (typeof parent !== 'undefined' && parent.ChatState && parent.ChatState.currentRoom) || 'general';
    var roomName = (typeof QAMAR !== 'undefined' && QAMAR.ROOMS && QAMAR.ROOMS[roomId]) ? QAMAR.ROOMS[roomId].name : roomId;

    openAppModal('🚪 طرد من الغرفة', 'طرد ' + (targetUser.name || '') + ' من ' + roomName + '؟', '', async function() {
        try {
            await db.ref('room_kicks/' + roomId + '/' + targetUser.uid).set({
                by: currentUser.uid, byName: currentUser.name, at: Date.now()
            });
            db.ref('audit_log').push({
                type: 'kick_room', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: targetUser.uid, targetName: targetUser.name, roomId: roomId,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});
            toast('🚪 تم الطرد');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ السجن ════════ */
function _askJail() {
    var h = '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:8px;">المدة (1-120 دقيقة):</label>';
    h += '<input type="number" id="cmd-jail-min" min="1" max="120" value="5" style="width:100%;padding:12px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;box-sizing:border-box;">';

    openAppModal('⛓️ سجن', 'سجن ' + (targetUser.name || '') + '؟', h, async function() {
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
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ الحظر ════════ */
function _askBan(isPermanent) {
    var h = '';
    if (isPermanent) {
        h += '<div style="color:#ff8888;font-size:13px;text-align:center;line-height:1.6;padding:8px;background:rgba(255,68,68,0.15);border-radius:8px;">⚠️ حظر دائم لـ <b>' + (targetUser.name || '') + '</b></div>';
    } else {
        h += '<label style="display:block;color:#ffd700;font-size:12px;font-weight:900;margin-bottom:8px;">المدة:</label>';
        h += '<select id="cmd-ban-dur" style="width:100%;padding:12px;background:rgba(255,255,255,0.08);border:1px solid #ffd700;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;text-align:center;outline:none;box-sizing:border-box;">';
        h += '<option value="60">ساعة</option><option value="360">6 ساعات</option><option value="1440" selected>يوم</option><option value="10080">أسبوع</option>';
        h += '</select>';
    }

    openAppModal(isPermanent ? '🚫 حظر دائم' : '⏸️ حظر مؤقت', '', h, async function() {
        try {
            if (isPermanent) {
                await db.ref('users/' + targetUser.uid).update({
                    isBanned: true,
                    bannedUntil: Date.now() + 365 * 24 * 60 * 60 * 1000,
                    banReason: 'حظر دائم',
                    permanentBan: true
                });
                db.ref('audit_log').push({
                    type: 'perm_ban', byUid: currentUser.uid, byName: currentUser.name,
                    targetUid: targetUser.uid, targetName: targetUser.name,
                    at: firebase.database.ServerValue.TIMESTAMP
                }).catch(function(){});
                toast('🚫 تم الحظر الدائم');
            } else {
                var mins = parseInt(document.getElementById('cmd-ban-dur').value);
                await db.ref('users/' + targetUser.uid).update({
                    isBanned: true,
                    bannedUntil: Date.now() + mins * 60000,
                    banReason: 'حظر مؤقت'
                });
                db.ref('audit_log').push({
                    type: 'temp_ban', byUid: currentUser.uid, byName: currentUser.name,
                    targetUid: targetUser.uid, targetName: targetUser.name, minutes: mins,
                    at: firebase.database.ServerValue.TIMESTAMP
                }).catch(function(){});
                toast('⏸️ تم الحظر المؤقت');
            }
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ فك الحظر ════════ */
function _doUnban() {
    openAppModal('🔓 فك الحظر', 'فك الحظر عن ' + (targetUser.name || '') + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                isBanned: false, bannedUntil: 0, permanentBan: false
            });
            toast('🔓 تم فك الحظر');
            renderAdminTab();
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _doUnjail() {
    openAppModal('🔓 فك السجن', 'فك السجن عن ' + (targetUser.name || '') + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                isJailed: false, jailUntil: 0, jailReleasedAt: Date.now()
            });
            toast('🔓 تم فك السجن');
            renderAdminTab();
        } catch(e) { toast('⚠️ فشل'); }
    });
}

function _doUnmute() {
    openAppModal('🔊 فك المنع', 'فك منع الكتابة عن ' + (targetUser.name || '') + '؟', '', async function() {
        try {
            await db.ref('users/' + targetUser.uid).update({
                muteInRoom: false, muteRoom: null, muteUntil: 0
            });
            toast('🔊 تم فك المنع');
            renderAdminTab();
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ════════ حذف الحساب ════════ */
function _askDeleteAccount() {
    openAppModal('🗑️ حذف الحساب', '⚠️ سيتم حذف حساب ' + (targetUser.name || '') + ' نهائياً. متابعة؟', '', async function() {
        try {
            var uid = targetUser.uid;
            var name = targetUser.name;
            var code = targetUser.code;

            await Promise.all([
                db.ref('users/' + uid).remove(),
                db.ref('user_presence/' + uid).remove(),
                name ? db.ref('user_names/' + name).remove().catch(function(){}) : Promise.resolve(),
                code ? db.ref('user_codes/' + code).remove().catch(function(){}) : Promise.resolve()
            ]);

            db.ref('audit_log').push({
                type: 'delete_account', byUid: currentUser.uid, byName: currentUser.name,
                targetUid: uid, targetName: name,
                at: firebase.database.ServerValue.TIMESTAMP
            }).catch(function(){});

            toast('🗑️ تم الحذف');
        } catch(e) { toast('⚠️ فشل'); }
    });
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: عرض تبويب اللحظات                        */
/* ══════════════════════════════════════════════ */
async function renderMomentsTab() {
    var grid = document.querySelector('.tab-content[data-content="moments"] .moments-grid');
    if (!grid) return;

    if (!targetUser || !targetUser.uid) return;

    // امسح القديم (مع إبقاء زر الإضافة)
    var addBtn = grid.querySelector('.moment-tile.add');
    grid.innerHTML = '';
    if (viewMode === 'owner' && addBtn) grid.appendChild(addBtn);

    try {
        var snap = await db.ref('stories/' + targetUser.uid).once('value');
        var data = snap.val() || {};
        var now = Date.now();
        var stories = Object.keys(data).map(function(k) { var s = data[k]; s._id = k; return s; })
            .filter(function(s) { return (s.expiresAt || 0) > now; })
            .sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

        if (!stories.length) {
            var empty = document.createElement('div');
            empty.style.cssText = 'grid-column:1/-1;text-align:center;color:#888;padding:20px;font-size:12px;';
            empty.textContent = 'لا توجد لحظات';
            grid.appendChild(empty);
            return;
        }

        stories.forEach(function(st) {
            var tile = document.createElement('div');
            tile.className = 'moment-tile';
            var icon = st.type === 'image' && st.imageUrl ? '🖼️' : '📝';
            var preview = st.text ? st.text.substring(0, 20) : (st.type === 'image' ? 'صورة' : '');
            tile.innerHTML =
                '<div class="moment-tile-icon">' + icon + '</div>' +
                '<div class="moment-tile-name">' + preview + '</div>';
            tile.onclick = function() {
                if (typeof window.parent !== 'undefined' && window.parent !== window) {
                    window.parent.postMessage({ action: 'openStory', uid: targetUser.uid }, '*');
                }
            };
            grid.appendChild(tile);
        });
    } catch(e) {
        console.warn('renderMomentsTab error:', e);
    }
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: عرض تبويب الأصدقاء                        */
/* ══════════════════════════════════════════════ */
async function renderFriendsTab() {
    var grid = document.querySelector('.tab-content[data-content="friends"] .friends-grid');
    if (!grid || !targetUser || !targetUser.uid) return;

    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;padding:20px;font-size:12px;">⏳ جاري التحميل...</div>';

    try {
        var snap = await db.ref('users/' + targetUser.uid + '/friends').once('value');
        var friends = snap.val() || {};
        var list = [];
        Object.keys(friends).forEach(function(uid) {
            var f = friends[uid] || {};
            if (f.status && f.status !== 'accepted') return;
            list.push({ uid: uid, name: f.name || 'مجهول', avatar: f.avatar || '' });
        });

        if (!list.length) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;padding:20px;font-size:12px;">لا يوجد أصدقاء</div>';
            return;
        }

        grid.innerHTML = '';
        list.forEach(function(f) {
            var card = document.createElement('div');
            card.className = 'friend-card';
            var initial = (f.name || 'U').substring(0, 1);
            card.innerHTML =
                '<div class="friend-avatar">' + initial + '</div>' +
                '<span class="friend-name">' + f.name + '</span>';
            card.onclick = function() {
                if (typeof window.parent !== 'undefined' && window.parent !== window) {
                    window.parent.postMessage({ action: 'openUserProfile', uid: f.uid, name: f.name }, '*');
                }
            };
            grid.appendChild(card);
        });
    } catch(e) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#ff6666;padding:20px;font-size:12px;">⚠️ فشل التحميل</div>';
    }
}

/* ══════════════════════════════════════════════ */
/* ⭐ v4: الإطار الافتراضي للأفاتار                 */
/* ══════════════════════════════════════════════ */
function applyDefaultAvatarFrameToProfile() {
    var box = document.getElementById('avatar-box');
    if (!box || !targetUser) return;

    // إذا فيه إطار مخصص → اتركه للـ frames-engine
    if (box.querySelector('.qf')) return;

    // استخدم NameEffects إن متوفر
    if (window.NameEffects && typeof window.NameEffects.applyDefaultAvatarFrame === 'function') {
        window.NameEffects.applyDefaultAvatarFrame(
            box,
            targetUser.rank,
            targetUser.rankLevel || getRankLevel(targetUser.rank)
        );
    }
}

/* ══════════════════════════════════════════════ */
/* التهيئة                                      */
/* ══════════════════════════════════════════════ */
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
    initMain();
    loadPoetry();

    // v4: بناء التبويبات حسب الوضع
    renderTabsForMode();

    // v4: زر الموسيقى
    setupMusicToggle();

    // v4: زر الطي
    setupCollapseToggle();

    if (typeof renderFrames === 'function') renderFrames();

    // v4: الإطار الافتراضي
    setTimeout(applyDefaultAvatarFrameToProfile, 300);

    // v4: ملء محتوى التبويبات الأولية
    setTimeout(function() {
        renderMomentsTab();
        renderFriendsTab();
    }, 500);

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
            // v4: إعادة بناء تبويب الأوامر عند تغيير البيانات
            if (document.querySelector('.tab-content[data-content="admin"]') &&
                document.querySelector('.tab-content[data-content="admin"]').classList.contains('active')) {
                renderAdminTab();
            }
            // v4: تحديث الإطار الافتراضي
            setTimeout(applyDefaultAvatarFrameToProfile, 100);
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
            setTimeout(applyDefaultAvatarFrameToProfile, 100);
        });
    }

    setTimeout(_revealProfile, 180);

    console.log('✅ profile-core.js v4.0 loaded | Mode:', viewMode);
});

function _userHash(u) {
    if (!u) return '';
    try {
        return JSON.stringify({
            n: u.name, b: u.bio, a: u.avatar, c: u.cover, r: u.rank,
            nc: u.nameColor, ng: u.nameGradient, ngl: u.nameGlow,
            af: u.avatarFrame, nbg: u.nameBgGradient, bg: u.profileBgValue,
            ij: u.isJailed, ju: u.jailUntil, ib: u.isBanned, bu: u.bannedUntil
        });
    } catch(e) { return ''; }
}

/* ══════════════════════════════════════════════ */
/* applyMode                                     */
/* ══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════ */
/* loadProfile — v4                              */
/* ══════════════════════════════════════════════ */
function loadProfile() {
    if (!targetUser) return;

    const _displayName = (viewMode === 'owner' && currentUser && currentUser.name) ? currentUser.name : (targetUser.name || 'مستخدم');
    const u = document.getElementById('profile-username');
    if (u) {
        u.dataset.name = _displayName;
        u.textContent = _displayName;

        // v4: تطبيق التأثيرات عبر NameEffects
        setTimeout(function() {
            if (window.NameEffects && typeof window.NameEffects.apply === 'function') {
                window.NameEffects.apply(u, {
                    nameColor: targetUser.nameColor,
                    nameGradient: targetUser.nameGradient,
                    nameBgGradient: targetUser.nameBgGradient,
                    nameGlow: targetUser.nameGlow,
                    nameShape: targetUser.nameShape,
                    nameFrame: targetUser.nameFrame,
                    senderColor: targetUser.color
                });
                // fallback
                if (!u.classList.contains('name-color-active') &&
                    !u.classList.contains('name-gradient-active') &&
                    !u.className.includes('nf-')) {
                    u.style.color = targetUser.color || '#ffd700';
                }
            } else {
                // fallback كامل
                _applyNameEffectsFallback(u, targetUser);
            }
        }, 50);
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

    // v4: الموسيقى
    if (targetUser.musicURL) {
        musicURL = targetUser.musicURL;
        const mb = document.getElementById('music-btn-mini');
        if (mb) mb.style.display = viewMode === 'visitor' ? 'flex' : 'none';
        const p = document.getElementById('music-player');
        if (p && p.getAttribute('src') !== musicURL) p.src = musicURL;
    } else {
        const mbb = document.getElementById('music-btn-mini');
        if (mbb) mbb.style.display = 'none';
    }

    // باقي الحقول
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
}

/* ══════════════════════════════════════════════ */
/* Fallback: تطبيق التأثيرات يدوياً (لو NameEffects ما تحمّل) */
/* ══════════════════════════════════════════════ */
function _applyNameEffectsFallback(el, data) {
    if (!el) return;
    // نظف
    var kept = [];
    el.className.split(/\s+/).forEach(function(c) {
        if (!c) return;
        if (c.indexOf('name-') === 0) return;
        if (c.indexOf('nf-') === 0) return;
        if (c === 'nf' || c === 'text-gradient') return;
        kept.push(c);
    });
    el.className = kept.join(' ');
    el.style.cssText = '';

    // الإطار
    if (data.nameFrame && /^nf-[a-z0-9-]+$/i.test(data.nameFrame)) {
        el.classList.add('nf', data.nameFrame);
    }

    // الشكل
    if (data.nameShape && ['capsule', 'pill', 'rounded', 'ellipse', 'square'].indexOf(data.nameShape) !== -1) {
        el.classList.add('name-shape-' + data.nameShape);
    }

    // التدرج أو اللون
    var safeC = data.nameColor && /^#[0-9a-f]{3,8}$/i.test(data.nameColor) ? data.nameColor : null;
    var grad = Array.isArray(data.nameGradient) && data.nameGradient.length >= 2 ? data.nameGradient : null;

    if (grad) {
        el.classList.add('name-gradient-active');
        el.style.setProperty('--name-gradient', 'linear-gradient(90deg, ' + grad[0] + ', ' + grad[1] + ', ' + grad[0] + ')');
    } else if (safeC) {
        el.classList.add('name-color-active');
        el.style.setProperty('--name-color', safeC);
    } else {
        el.style.color = data.color || '#ffd700';
    }

    // التوهج
    if (data.nameGlow && ['soft','medium','strong'].indexOf(data.nameGlow) !== -1) {
        el.classList.add('name-glow-' + data.nameGlow);
        el.style.setProperty('--name-glow-color', safeC || (grad && grad[0]) || '#ffd700');
    }
}

/* ══════════════════════════════════════════════ */
/* باقي الدوال القديمة                           */
/* ══════════════════════════════════════════════ */
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
                if (el) { el.dataset.name = v.trim(); el.textContent = v.trim(); }
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

    const vb = document.getElementById('btn-visitor-view');
    if (vb && viewMode === 'owner') vb.onclick = () => {
        if (!currentUser || !currentUser.uid) return;
        localStorage.setItem('profile_target_data_' + currentUser.uid, JSON.stringify(currentUser));
        location.href = 'profile.html?uid=' + currentUser.uid;
    };

    if (typeof initAppearance === 'function') initAppearance();
    initVisitor();
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
        if (targetUser && targetUser.uid) {
            if (typeof window.parent !== 'undefined' && window.parent !== window) {
                window.parent.postMessage({ action: 'openPrivateChat', uid: targetUser.uid, name: targetUser.name }, '*');
            }
        }
    };

    const b = document.getElementById('btn-block');
    if (b) b.onclick = () => {
        if (!currentUser || !targetUser) return;
        openAppModal('🚫 حظر', 'حظر هذا المستخدم؟', '', function() {
            if (db) db.ref('users/' + currentUser.uid + '/blocked/' + targetUser.uid).set({
                time: Date.now(), name: targetUser.name || 'مجهول', avatar: targetUser.avatar || ''
            }).then(() => {
                toast('🚫 تم');
                setTimeout(() => { try { window.parent.postMessage({action:'closeProfile'}, '*'); } catch(e) {} }, 800);
            });
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
    if (cmd) {
        cmd.style.display = _isAdmin() ? 'flex' : 'none';
        cmd.onclick = function() {
            switchTab('admin');
            var tabs = document.getElementById('tabsBar');
            if (tabs) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    }
}

function getCleanName() {
    const el = document.getElementById('profile-username');
    return el ? (el.dataset.name || el.innerText) : '';
}

function _updateHeartUI() {
    const h = document.getElementById('btn-heart');
    if (!h) return;
    if (_iLiked) {
        h.textContent = '💔';
        h.title = 'إلغاء الإعجاب';
    } else {
        h.textContent = '❤️';
        h.title = 'إعجاب';
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
            toast('⚠️ فشل');
            _iLiked = false;
            _updateHeartUI();
        }
    } else {
        try {
            await db.ref('users/' + targetUser.uid + '/likes/' + currentUser.uid).remove();
            _iLiked = false;
            _updateHeartUI();
            toast('💔 ألغي الإعجاب');
        } catch(e) {
            toast('⚠️ فشل');
        }
    }
}

function loadSaved() {
    try {
        if (localStorage.getItem('profile_name')) {
            const el = document.getElementById('profile-username');
            if (el) { el.dataset.name = localStorage.getItem('profile_name'); }
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
    } catch (e) {}
}

/* ══════════════════════════════════════════════ */
/* openAppModal — محدّث                            */
/* ══════════════════════════════════════════════ */
function openAppModal(title, text, typeOrHtml, options, currentVal, onSave, isHtmlMode) {
    const m = document.getElementById('app-modal');
    if (!m) return;
    document.getElementById('modal-title').innerText = title;
    const textEl = document.getElementById('modal-text');
    if (textEl) textEl.innerText = text || '';
    const c = document.getElementById('modal-dyn');
    c.innerHTML = '';

    // إذا كان HTML
    if (isHtmlMode === true && typeof typeOrHtml === 'string') {
        c.innerHTML = typeOrHtml;
    } else if (typeof typeOrHtml === 'string' && typeOrHtml.trim().startsWith('<')) {
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

    const okBtn = document.getElementById('modal-ok');
    const cancelBtn = document.getElementById('modal-cancel');

    okBtn.style.display = '';
    cancelBtn.style.display = '';
    okBtn.textContent = 'موافق';

    okBtn.onclick = function() {
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
    cancelBtn.onclick = () => m.classList.remove('active');

    // وضع "HTML فقط"
    if (isHtmlMode === true) {
        okBtn.style.display = 'none';
        cancelBtn.textContent = 'إلغاء';
        cancelBtn.style.width = '100%';
        cancelBtn.style.marginTop = '8px';
    } else {
        cancelBtn.textContent = 'إلغاء';
        cancelBtn.style.width = '';
        cancelBtn.style.marginTop = '';
    }
}

console.log('✅ profile-core.js v4.0 loaded — NameEffects + Default Frame + New Tabs');
