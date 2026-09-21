// ==============================================
// profile-core.js v5 — الجزء 1/3
// ProfileState + Bootstrap + Drill-down + Identity
// ==============================================
// ⚠️ هذا ملف مؤقت — الجزءان 2 و 3 يُضافان لاحقاً
//    (E3: صفحات الإعدادات + الزوار + الإحصائيات + الأزرار الديناميكية)
// ==============================================

/* ══════════════════════════════════════════════ */
/* ProfileState — الحالة الموحّدة                  */
/* ══════════════════════════════════════════════ */
const ProfileState = {
    mode: 'owner',           // 'owner' | 'visitor'
    me: null,                // المستخدم الحالي (المشاهد)
    subject: null,           // صاحب البروفايل
    isAdminVisitor: false,
    collapsed: false,
    lastUserHash: '',
    localLockUntil: 0,
    settingsHistory: [],     // stack للـ drill-down
    poetry: {
        text: '',
        bg: null,
        attachment: null
    },
    likes: { isLiked: false, count: 0 },
    friends: { state: 'off', count: 0 },
    blocked: { isBlocked: false }
};

/* ══════════════════════════════════════════════ */
/* أدوات مساعدة                                    */
/* ══════════════════════════════════════════════ */
function _getUser() {
    try {
        return JSON.parse(
            localStorage.getItem(QAMAR.STORAGE_KEYS.CURRENT_USER) ||
            localStorage.getItem(QAMAR.STORAGE_KEYS.USER) ||
            'null'
        );
    } catch (e) { return null; }
}

function _getRankLevel(rank) {
    return (typeof getRankLevel === 'function') ? getRankLevel(rank) : (QAMAR.getRankLevel(rank) || 0);
}

function _toast(msg) {
    if (typeof showToast === 'function') showToast('fa-info-circle', msg);
    else console.log('[profile]', msg);
}

function _isOwner() {
    return ProfileState.mode === 'owner';
}

function _isVisitor() {
    return ProfileState.mode === 'visitor';
}

function _isAdminUser() {
    const u = ProfileState.me;
    if (!u) return false;
    const lvl = u.rankLevel || _getRankLevel(u.rank);
    return lvl >= 65;
}

function _isKing() {
    return ProfileState.me && ProfileState.me.rank === 'King';
}

function _userHash(u) {
    if (!u) return '';
    try {
        return JSON.stringify({
            n: u.name,
            b: u.bio,
            a: u.avatar,
            c: u.cover,
            r: u.rank,
            nc: u.nameColor,
            ng: u.nameGradient,
            nbc: u.nameBgColor,
            nbg: u.nameBgGradient,
            af: u.avatarFrame,
            pg: u.profileGlow,
            pbt: u.profileBgType,
            pbv: u.profileBgValue,
            mu: u.musicURL,
            p: u.poetry,
            pb: u.poetryBg,
            pa: u.poetryAttachment,
            co: u.country,
            fa: u.family,
            ij: u.isJailed,
            ju: u.jailUntil,
            ib: u.isBanned,
            bu: u.bannedUntil,
            iv: u.invisible
        });
    } catch (e) { return ''; }
}

/* ══════════════════════════════════════════════ */
/* Open App Modal (v5 — signature جديدة)          */
/* ══════════════════════════════════════════════ */
/**
 * @param {Object} opts
 *   @param {string}   opts.title
 *   @param {string}   [opts.text]
 *   @param {string}   [opts.html]         — HTML content (يستبدل text)
 *   @param {string}   [opts.type]         — 'input' | 'select' | null
 *   @param {Array}    [opts.options]      — لـ select
 *   @param {string}   [opts.value]        — القيمة الحالية
 *   @param {Function} [opts.onSave]       — (value) => {} — إن وُجد، يظهر زر "موافق"
 *   @param {string}   [opts.okLabel]
 *   @param {string}   [opts.cancelLabel]
 *   @param {boolean}  [opts.hideOk]       — لإخفاء زر "موافق" (HTML فقط)
 */
function openAppModal(opts) {
    opts = opts || {};
    const m = document.getElementById('app-modal');
    if (!m) return;

    const titleEl = document.getElementById('modal-title');
    const textEl = document.getElementById('modal-text');
    const dyn = document.getElementById('modal-dyn');
    const okBtn = document.getElementById('modal-ok');
    const cancelBtn = document.getElementById('modal-cancel');

    if (titleEl) titleEl.textContent = opts.title || 'تنبيه';
    if (textEl) {
        textEl.textContent = opts.text || '';
        textEl.style.display = opts.text ? 'block' : 'none';
    }
    if (dyn) dyn.innerHTML = '';

    // HTML content
    if (opts.html && dyn) {
        dyn.innerHTML = opts.html;
    }
    // Input
    else if (opts.type === 'input' && dyn) {
        const i = document.createElement('input');
        i.type = 'text';
        i.id = 'modal-input-val';
        i.value = opts.value || '';
        dyn.appendChild(i);
    }
    // Select
    else if (opts.type === 'select' && dyn) {
        const s = document.createElement('select');
        s.id = 'modal-select-val';
        (opts.options || []).forEach(o => {
            const op = document.createElement('option');
            op.value = (typeof o === 'object') ? o.value : o;
            op.textContent = (typeof o === 'object') ? o.label : o;
            if (op.value === opts.value) op.selected = true;
            s.appendChild(op);
        });
        dyn.appendChild(s);
    }

    m.classList.add('active');

    // Ok button
    if (opts.hideOk) {
        okBtn.style.display = 'none';
        cancelBtn.textContent = opts.cancelLabel || 'إغلاق';
        cancelBtn.style.width = '100%';
    } else {
        okBtn.style.display = '';
        cancelBtn.style.width = '';
        okBtn.textContent = opts.okLabel || 'موافق';
        cancelBtn.textContent = opts.cancelLabel || 'إلغاء';

        okBtn.onclick = function () {
            let v = '';
            if (opts.type === 'input') {
                const i = document.getElementById('modal-input-val');
                if (i) v = i.value;
            } else if (opts.type === 'select') {
                const s = document.getElementById('modal-select-val');
                if (s) v = s.value;
            }
            if (typeof opts.onSave === 'function') opts.onSave(v);
            m.classList.remove('active');
        };
    }

    cancelBtn.onclick = function () {
        m.classList.remove('active');
    };

    // إغلاق عند النقر خارج الصندوق
    m.onclick = function (e) {
        if (e.target === m) m.classList.remove('active');
    };
}

window.openAppModal = openAppModal;

/* ══════════════════════════════════════════════ */
/* Bootstrap                                       */
/* ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 profile-core.js v5 booting...');

    const params = new URLSearchParams(location.search);
    const urlUid = params.get('uid');
    const isOwnerParam = params.get('owner');

    ProfileState.me = _getUser();

    // ⭐ حدد الوضع
    if (isOwnerParam === '1' || (!urlUid && ProfileState.me)) {
        ProfileState.mode = 'owner';
        ProfileState.subject = ProfileState.me;
    } else if (urlUid) {
        ProfileState.mode = 'visitor';
        ProfileState.subject = null; // سيُحمّل من Firebase
    } else {
        // No user, no urlUid → رسالة خطأ
        document.body.innerHTML =
            '<div style="padding:40px;text-align:center;color:#fff;font-family:Cairo,sans-serif;">' +
            '⚠️ لا يوجد مستخدم — افتح من التطبيق' +
            '</div>';
        return;
    }

    document.body.classList.add(ProfileState.mode + '-mode');

    // ⭐ حدد هل المشاهد admin visitor
    ProfileState.isAdminVisitor = _isVisitor() && _isAdminUser();

    // ⭐ owner: subject = me
    if (_isOwner() && ProfileState.me) {
        ProfileState.subject = ProfileState.me;
        // اقرأ من cache
        _loadSubjectFromCache();
    }

    // ⭐ visitor: load subject from cache أو Firebase
    if (_isVisitor() && urlUid) {
        _loadSubjectFromCache(urlUid);
    }

    // ⭐ اربط الأحداث
    _bindCoverButtons();
    _bindSettingsNavigation();
    _bindLikesFriendsBlocked(); // في E3
    _bindImagesUploads(); // في E3
    _bindMusic(); // في E3
    _bindPoetry(); // في E3
    _bindPrivacy(); // في E3
    _bindDangerActions(); // في E3

    // ⭐ ابنِ التبويبات
    renderTabsForMode();

    // ⭐ حمّل من Firebase
    if (_isVisitor() && urlUid) {
        await _loadVisitorSubject(urlUid);
    } else if (_isOwner() && ProfileState.me) {
        await _loadOwnerSubject();
    }

    // ⭐ طبّق الهوية على الـ DOM
    applyIdentityToDOM();

    // ⭐ ربط listeners التغييرات
    _startSubjectListener();

    // ⭐ كشف الواجهة
    setTimeout(function () {
        const p = document.getElementById('profile-container');
        if (p) {
            p.style.transition = 'opacity 0.15s ease-in';
            p.style.opacity = '1';
        }
    }, 200);

    // ⭐ trigger الأولي
    setTimeout(function () {
        if (typeof renderHomeStats === 'function') renderHomeStats();
        if (typeof renderMomentsTab === 'function') renderMomentsTab();
        if (typeof renderFriendsTab === 'function') renderFriendsTab();
    }, 400);

    console.log('✅ profile-core.js v5 ready | Mode:', ProfileState.mode);
});

/* ══════════════════════════════════════════════ */
/* Load Subject                                    */
/* ══════════════════════════════════════════════ */
function _loadSubjectFromCache(uid) {
    try {
        const key = uid ? ('profile_target_data_' + uid) : QAMAR.STORAGE_KEYS.CURRENT_USER;
        const raw = localStorage.getItem(key);
        if (raw) {
            ProfileState.subject = JSON.parse(raw);
            console.log('📦 subject loaded from cache');
        }
    } catch (e) {
        console.warn('cache load failed:', e);
    }
}

async function _loadOwnerSubject() {
    if (!ProfileState.me || !ProfileState.me.uid) return;
    if (typeof db === 'undefined' || !db) return;

    try {
        const snap = await db.ref('users/' + ProfileState.me.uid).once('value');
        const remote = snap.val();
        if (!remote) return;

        // ⭐ merge: Firebase + cache (بقاعدة identityUpdatedAt)
        ProfileState.subject = _mergeIdentity(ProfileState.me, remote);

        // ⭐ حدّث session
        ProfileState.me = Object.assign({}, ProfileState.me, remote);
        if (typeof saveSession === 'function') {
            saveSession(ProfileState.me, ProfileState.me.isGuest === true);
        }
    } catch (e) {
        console.warn('load owner subject failed:', e);
    }
}

async function _loadVisitorSubject(uid) {
    if (!uid) return;
    if (typeof db === 'undefined' || !db) return;

    try {
        const snap = await db.ref('users/' + uid).once('value');
        const remote = snap.val();

        if (!remote) {
            _toast('⚠️ المستخدم غير موجود');
            ProfileState.subject = { uid: uid, name: 'مستخدم', rank: 'User' };
            return;
        }

        ProfileState.subject = remote;

        // cache
        try {
            localStorage.setItem('profile_target_data_' + uid, JSON.stringify(remote));
        } catch (e) {}

        // تسجيل الزيارة
        if (ProfileState.me && ProfileState.me.uid && ProfileState.me.uid !== uid) {
            db.ref('users/' + uid + '/visitors/' + ProfileState.me.uid).set({
                time: Date.now(),
                name: ProfileState.me.name || 'زائر',
                avatar: ProfileState.me.avatar || ''
            }).catch(function () {});
        }

        // فحص الحالة (likes/friends/blocked)
        if (typeof checkVisitorStatus === 'function') {
            await checkVisitorStatus();
        }
    } catch (e) {
        console.warn('load visitor subject failed:', e);
    }
}

/* ══════════════════════════════════════════════ */
/* Merge Identity (Firebase vs cache)              */
/* ══════════════════════════════════════════════ */
function _mergeIdentity(cachedUser, remoteUser) {
    if (!cachedUser) return remoteUser;
    if (!remoteUser) return cachedUser;

    const cachedAt = cachedUser.identityUpdatedAt || 0;
    const remoteAt = remoteUser.identityUpdatedAt || 0;

    // Firebase أحدث → يفوز
    if (remoteAt >= cachedAt) return remoteUser;

    // cache أحدث → رفع لـ Firebase
    const fields = (QAMAR.IDENTITY_FIELDS || []);
    const patch = {};
    fields.forEach(function (k) {
        if (cachedUser[k] !== undefined) patch[k] = cachedUser[k];
    });
    patch.identityUpdatedAt = cachedAt;

    if (typeof db !== 'undefined' && db) {
        db.ref('users/' + cachedUser.uid).update(patch).catch(function () {});
    }

    return Object.assign({}, remoteUser, patch);
}

/* ══════════════════════════════════════════════ */
/* Subject Listener                                */
/* ══════════════════════════════════════════════ */
function _startSubjectListener() {
    if (typeof db === 'undefined' || !db) return;
    const subj = ProfileState.subject;
    if (!subj || !subj.uid) return;

    db.ref('users/' + subj.uid).on('value', function (snap) {
        const remote = snap.val();
        if (!remote) return;

        const newHash = _userHash(remote);
        if (newHash === ProfileState.lastUserHash) return;
        ProfileState.lastUserHash = newHash;

        // تحديث subject
        if (Date.now() > ProfileState.localLockUntil) {
            ProfileState.subject = Object.assign({}, ProfileState.subject, remote);
        }

        // cache
        try {
            if (_isVisitor()) {
                localStorage.setItem('profile_target_data_' + subj.uid, JSON.stringify(remote));
            } else {
                localStorage.setItem(QAMAR.STORAGE_KEYS.CURRENT_USER, JSON.stringify(ProfileState.subject));
            }
        } catch (e) {}

        // إعادة التطبيق
        applyIdentityToDOM();
    });

    // Presence listener (visitor only — status dot)
    if (_isVisitor()) {
        db.ref('user_presence/' + subj.uid).on('value', function (snap) {
            const p = snap.val() || {};
            const dot = document.getElementById('status-dot');
            if (!dot) return;
            if (p.state === 'online') {
                dot.className = 'status-dot online';
                dot.title = 'متصل';
            } else {
                dot.className = 'status-dot offline';
                dot.title = 'غير متصل';
            }
        });
    }
}

/* ══════════════════════════════════════════════ */
/* applyIdentityToDOM — الدالة الرئيسية           */
/* ══════════════════════════════════════════════ */
function applyIdentityToDOM() {
    const subj = ProfileState.subject;
    if (!subj) return;

    // ⭐ 1. الاسم
    const nameEl = document.getElementById('profile-username');
    if (nameEl) {
        const displayName = subj.name || 'مستخدم';
        nameEl.textContent = displayName;
        nameEl.setAttribute('data-name', displayName);
        nameEl.setAttribute('data-text', displayName);

        if (window.NameEffects && typeof window.NameEffects.apply === 'function') {
            window.NameEffects.apply(nameEl, {
                nameColor: subj.nameColor || null,
                nameGradient: subj.nameGradient || null,
                nameBgColor: subj.nameBgColor || null,
                nameBgGradient: subj.nameBgGradient || null,
                color: subj.color || '#ffd700'
            });
        } else {
            // fallback
            nameEl.style.color = subj.color || '#ffd700';
        }
    }

    // ⭐ 2. البايو
    const bioEl = document.getElementById('profile-bio');
    if (bioEl) {
        bioEl.textContent = subj.bio || (QAMAR.DEFAULT_BIO || '❋ نجوم الشام ❋');
    }

    // ⭐ 3. الرتبة
    const roleEl = document.getElementById('role-text');
    if (roleEl) {
        const badge = (typeof getRankBadge === 'function') ? getRankBadge(subj.rank) : '👤';
        roleEl.textContent = badge + ' ' + (subj.rank || 'User');
    }

    // ⭐ 4. الغلاف
    _applyCover(subj);

    // ⭐ 5. الأفاتار + الإطار
    _applyAvatar(subj);

    // ⭐ 6. خلفية البروفايل
    _applyProfileBackground(subj);

    // ⭐ 7. توهج البروفايل
    _applyProfileGlow(subj);

    // ⭐ 8. زر الموسيقى (visitor only)
    _applyMusicButton(subj);

    // ⭐ 9. الشعر
    if (typeof renderPoetry === 'function') renderPoetry();

    // ⭐ 10. أزرار الزيارة (visitor)
    if (_isVisitor() && typeof updateVisitorButtons === 'function') {
        updateVisitorButtons();
    }

    // ⭐ 11. زر admin actions
    const adminBtn = document.getElementById('btn-admin-actions');
    if (adminBtn) {
        adminBtn.style.display = ProfileState.isAdminVisitor ? 'flex' : 'none';
    }

    // ⭐ 12. زر الطي (visitor only)
    // (CSS يتولى — body.visitor-mode)
}

/* ══════════════════════════════════════════════ */
/* Apply Cover                                     */
/* ══════════════════════════════════════════════ */
function _applyCover(subj) {
    const img = document.getElementById('profile-cover-img');
    const video = document.getElementById('profile-cover-video');
    if (!img || !video) return;

    const cover = subj.cover;
    if (!cover) {
        img.style.display = 'none';
        video.style.display = 'none';
        video.pause && video.pause();
        video.removeAttribute('src');
        return;
    }

    const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(cover) ||
                    (subj.coverType === 'video');

    if (isVideo) {
        img.style.display = 'none';
        video.style.display = 'block';
        if (video.src !== cover) {
            video.src = cover;
            video.load();
            video.play().catch(function () {});
        }
    } else {
        video.style.display = 'none';
        video.pause && video.pause();
        img.style.display = 'block';
        if (img.src !== cover) img.src = cover;
    }
}

/* ══════════════════════════════════════════════ */
/* Apply Avatar + Frame                            */
/* ══════════════════════════════════════════════ */
function _applyAvatar(subj) {
    const img = document.getElementById('profile-avatar-img');
    if (img) {
        const src = subj.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(subj.name || 'User') + '&background=555&color=fff';
        if (img.src !== src) img.src = src;
    }

    // ⭐ إطار الأفاتار
    const box = document.getElementById('avatar-box');
    if (!box) return;

    if (typeof applyAvatarFrameFromUser === 'function') {
        applyAvatarFrameFromUser(box, {
            avatarFrame: subj.avatarFrame || null,
            rank: subj.rank,
            rankLevel: subj.rankLevel || _getRankLevel(subj.rank)
        });
    }
}

/* ══════════════════════════════════════════════ */
/* Apply Profile Background                        */
/* ══════════════════════════════════════════════ */
function _applyProfileBackground(subj) {
    const layer = document.getElementById('profile-bg-layer');
    if (!layer) return;

    const type = subj.profileBgType;
    const value = subj.profileBgValue;

    // نظّف
    layer.innerHTML = '';
    layer.style.backgroundImage = '';
    layer.style.background = '';

    if (!type || !value) return;

    if (type === 'color') {
        layer.style.background = value;
    } else if (type === 'image') {
        layer.style.backgroundImage = 'url("' + value + '")';
        layer.style.backgroundSize = 'cover';
        layer.style.backgroundPosition = 'center';
    } else if (type === 'video') {
        const v = document.createElement('video');
        v.src = value;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.autoplay = true;
        layer.appendChild(v);
        v.play().catch(function () {});
    }
}

/* ══════════════════════════════════════════════ */
/* Apply Profile Glow                              */
/* ══════════════════════════════════════════════ */
function _applyProfileGlow(subj) {
    const container = document.getElementById('profile-container');
    if (!container) return;

    if (subj.profileGlow) {
        container.style.setProperty('--glow-color', subj.profileGlow);
        container.classList.add('glow-active');
    } else {
        container.style.removeProperty('--glow-color');
        container.classList.remove('glow-active');
    }
}

/* ══════════════════════════════════════════════ */
/* Music Button (visitor)                          */
/* ══════════════════════════════════════════════ */
function _applyMusicButton(subj) {
    const btn = document.getElementById('music-btn-mini');
    const player = document.getElementById('music-player');
    if (!btn || !player) return;

    if (!subj.musicURL) {
        btn.style.display = 'none';
        player.pause && player.pause();
        player.removeAttribute('src');
        return;
    }

    // visitor only
    if (!_isVisitor()) {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = 'flex';

    if (player.src !== subj.musicURL) {
        player.src = subj.musicURL;
        player.load();
    }

    if (!btn.__setup) {
        btn.__setup = true;
        btn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (player.paused) {
                player.play().then(function () {
                    btn.classList.add('playing');
                    const ic = btn.querySelector('i');
                    if (ic) ic.className = 'fas fa-pause';
                }).catch(function () {
                    _toast('⚠️ تعذر تشغيل الموسيقى');
                });
            } else {
                player.pause();
                btn.classList.remove('playing');
                const ic = btn.querySelector('i');
                if (ic) ic.className = 'fas fa-play';
            }
        };
    }
}

/* ══════════════════════════════════════════════ */
/* Cover buttons (close + collapse)                */
/* ══════════════════════════════════════════════ */
function _bindCoverButtons() {
    const closeBtn = document.getElementById('btn-close');
    if (closeBtn) {
        closeBtn.onclick = function () {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ action: 'closeProfile' }, '*');
                }
            } catch (e) {}
        };
    }

    const collapseBtn = document.getElementById('btn-collapse-info');
    if (collapseBtn) {
        collapseBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            ProfileState.collapsed = !ProfileState.collapsed;
            document.body.classList.toggle('visitor-collapsed', ProfileState.collapsed);
        };
    }
}

/* ══════════════════════════════════════════════ */
/* Tabs — Render + Switch                          */
/* ══════════════════════════════════════════════ */
function renderTabsForMode() {
    const tabsBar = document.getElementById('tabsBar');
    if (!tabsBar) return;

    let html = '';
    html += '<button class="tab active" data-tab="home"><i class="fas fa-home"></i><span>الرئيسية</span></button>';
    html += '<button class="tab" data-tab="moments"><i class="fas fa-camera"></i><span>لحظات</span></button>';
    html += '<button class="tab" data-tab="friends"><i class="fas fa-users"></i><span>أصدقاء</span></button>';

    if (_isOwner()) {
        html += '<button class="tab" data-tab="settings"><i class="fas fa-cog"></i><span>إعدادات</span></button>';
    } else if (ProfileState.isAdminVisitor) {
        html += '<button class="tab" data-tab="admin"><i class="fas fa-crosshairs"></i><span>أوامر</span></button>';
    }

    tabsBar.innerHTML = html;

    tabsBar.querySelectorAll('.tab').forEach(function (t) {
        t.onclick = function () {
            switchTab(t.getAttribute('data-tab'));
        };
    });
}

function switchTab(tabName) {
    const tabsBar = document.getElementById('tabsBar');
    if (tabsBar) {
        tabsBar.querySelectorAll('.tab').forEach(function (t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
        });
    }

    document.querySelectorAll('.tab-content').forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-content') === tabName);
    });

    const scrollBox = document.getElementById('scroll-box');
    if (scrollBox) scrollBox.scrollTop = 0;

    // ⭐ عند التبديل
    if (tabName === 'moments' && typeof renderMomentsTab === 'function') renderMomentsTab();
    if (tabName === 'friends' && typeof renderFriendsTab === 'function') renderFriendsTab();
    if (tabName === 'settings') _resetSettingsPage();
    if (tabName === 'admin' && typeof renderAdminTab === 'function') renderAdminTab();
}

window.switchTab = switchTab;

/* ══════════════════════════════════════════════ */
/* Drill-down — Navigation                         */
/* ══════════════════════════════════════════════ */
function _resetSettingsPage() {
    ProfileState.settingsHistory = ['main'];
    _showSettingsPage('main', false);
}

function _showSettingsPage(pageId, pushHistory) {
    // اخفِ الكل
    document.querySelectorAll('.settings-page').forEach(function (p) {
        p.classList.remove('active');
    });

    // اظهر المطلوب
    const target = document.querySelector('.settings-page[data-page="' + pageId + '"]');
    if (target) target.classList.add('active');

    // history
    if (pushHistory !== false) {
        ProfileState.settingsHistory.push(pageId);
    }

    // trigger specific render
    _renderSettingsPage(pageId);

    // scroll to top
    const scrollBox = document.getElementById('scroll-box');
    if (scrollBox) scrollBox.scrollTop = 0;
}

function _goBackSettings() {
    const stack = ProfileState.settingsHistory;
    if (stack.length <= 1) {
        _showSettingsPage('main', false);
        stack.length = 0;
        stack.push('main');
        return;
    }
    stack.pop();
    const prev = stack[stack.length - 1];
    _showSettingsPage(prev, false);
}

function _renderSettingsPage(pageId) {
    switch (pageId) {
        case 'name-color':
            if (typeof renderNameColorPicker === 'function') renderNameColorPicker();
            break;
        case 'name-gradient':
            if (typeof renderNameGradientPicker === 'function') renderNameGradientPicker();
            break;
        case 'name-bg-color':
            if (typeof renderNameBgColorPicker === 'function') renderNameBgColorPicker();
            break;
        case 'name-bg-gradient':
            if (typeof renderNameBgGradientPicker === 'function') renderNameBgGradientPicker();
            break;
        case 'avatar-page':
            if (typeof renderAvatarPage === 'function') renderAvatarPage();
            break;
        case 'cover-page':
            if (typeof renderCoverPage === 'function') renderCoverPage();
            break;
        case 'frame-page':
            if (typeof renderFramePage === 'function') renderFramePage();
            break;
        case 'glow-page':
            if (typeof renderGlowPage === 'function') renderGlowPage();
            break;
        case 'profile-bg-page':
            if (typeof renderProfileBgPage === 'function') renderProfileBgPage();
            break;
        case 'music':
            if (typeof renderMusicPage === 'function') renderMusicPage();
            break;
        case 'poetry':
            if (typeof renderPoetryPage === 'function') renderPoetryPage();
            break;
        case 'privacy':
            if (typeof renderPrivacyPage === 'function') renderPrivacyPage();
            break;
        case 'room':
            if (typeof renderRoomPage === 'function') renderRoomPage();
            break;
        case 'danger':
            // static HTML
            break;
    }
}

function _bindSettingsNavigation() {
    // open page buttons
    document.querySelectorAll('[data-open-page]').forEach(function (btn) {
        btn.onclick = function () {
            const pageId = btn.getAttribute('data-open-page');
            _showSettingsPage(pageId);
        };
    });

    // back buttons
    document.querySelectorAll('[data-back]').forEach(function (btn) {
        btn.onclick = function () {
            _goBackSettings();
        };
    });
}

/* ══════════════════════════════════════════════ */
/* Placeholders — تُبنى في E3                      */
/* ══════════════════════════════════════════════ */
/* الدوال التالية تُستدعى من bootstrap لكن تُنفَّذ في E3:
 *   _bindLikesFriendsBlocked
 *   _bindImagesUploads
 *   _bindMusic
 *   _bindPoetry
 *   _bindPrivacy
 *   _bindDangerActions
 *   checkVisitorStatus
 *   updateVisitorButtons
 *   renderPoetry
 *   renderHomeStats
 *   renderMomentsTab
 *   renderFriendsTab
 *   renderAdminTab
 *   renderNameColorPicker
 *   renderNameGradientPicker
 *   renderNameBgColorPicker
 *   renderNameBgGradientPicker
 *   renderAvatarPage
 *   renderCoverPage
 *   renderFramePage
 *   renderGlowPage
 *   renderProfileBgPage
 *   renderMusicPage
 *   renderPoetryPage
 *   renderPrivacyPage
 *   renderRoomPage
 */

// ⭐ stubs — تُستبدل في E3
if (typeof window._bindLikesFriendsBlocked !== 'function') {
    window._bindLikesFriendsBlocked = function () {};
}
if (typeof window._bindImagesUploads !== 'function') {
    window._bindImagesUploads = function () {};
}
if (typeof window._bindMusic !== 'function') {
    window._bindMusic = function () {};
}
if (typeof window._bindPoetry !== 'function') {
    window._bindPoetry = function () {};
}
if (typeof window._bindPrivacy !== 'function') {
    window._bindPrivacy = function () {};
}
if (typeof window._bindDangerActions !== 'function') {
    window._bindDangerActions = function () {};
}

/* ══════════════════════════════════════════════ */
/* Exports                                         */
/* ══════════════════════════════════════════════ */
window.ProfileState = ProfileState;
window.applyIdentityToDOM = applyIdentityToDOM;
window.openAppModal = openAppModal;

console.log('✅ profile-core.js v5 [part 1/3] loaded — bootstrap + drill-down + identity ready');
