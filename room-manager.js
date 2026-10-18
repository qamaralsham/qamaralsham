// room-manager.js v1
(function () {
    'use strict';
    if (window.__roomManagerV1) return;
    window.__roomManagerV1 = true;

    function getMe() { try { return JSON.parse(localStorage.getItem('qamar_current_user') || 'null'); } catch (e) { return null; } }
    function myLevel() { var u = getMe(); return u ? (u.rankLevel || QAMAR.getRankLevel(u.rank)) : 0; }
    function esc(s) { return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
    function toast(icon, msg) { if (typeof showToast === 'function') showToast(icon, msg); }

    var currentRoomId = null;

    // 1. حقن الزر في الإعدادات وإزالة الخلفيات المعطلة
    function injectSettingsBtn() {
        var settingsContent = document.querySelector('#settings-sidebar .sidebar-content');
        if (!settingsContent) return;
        if (document.getElementById('rm-settings-btn')) return;

        // إخفاء خيارات الخلفيات القديمة
        var bgTitle = settingsContent.querySelector('h4');
        var bgOptions = document.getElementById('bg-options');
        if (bgTitle && bgTitle.innerText.includes('خلفيات')) bgTitle.style.display = 'none';
        if (bgOptions) bgOptions.style.display = 'none';

        var btn = document.createElement('button');
        btn.id = 'rm-settings-btn';
        btn.className = 'btn-outline';
        btn.style.cssText = 'width:100%; padding:12px; margin-bottom:10px; border-color:#a855f7; color:#c084fc; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(168,85,247,0.1); border-radius:10px;';
        btn.innerHTML = '⚙️ إدارة الغرف';
        btn.onclick = openManager;
        
        var adminSettings = document.getElementById('admin-settings');
        if (adminSettings) settingsContent.insertBefore(btn, adminSettings);
        else settingsContent.appendChild(btn);
    }

    // 2. شاشة قائمة الغرف
    function ensureListModal() {
        var m = document.getElementById('rm-modal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'rm-modal';
        m.innerHTML = `<div class="rm-box">
            <div class="rm-head"><h3>⚙️ إدارة الغرف</h3><button class="rm-close" onclick="document.getElementById('rm-modal').style.display='none'">✕</button></div>
            <div class="rm-body" id="rm-list-body"></div>
        </div>`;
        document.body.appendChild(m);
        return m;
    }

    function openManager() {
        var m = ensureListModal();
        m.style.display = 'flex';
        renderRoomList();
    }

    async function renderRoomList() {
        var body = document.getElementById('rm-list-body');
        body.innerHTML = '<div style="text-align:center;color:#c084fc;padding:20px;">⏳ جاري التحميل...</div>';
        try {
            var snap = await db.ref('room_settings').once('value');
            var settings = snap.val() || {};
            body.innerHTML = '';
            
            Object.values(QAMAR.ROOMS).forEach(function(r) {
                if (r.id === 'jail' || r.id === 'bot_training') return;
                var s = settings[r.id] || {};
                if (s.isDeleted) return;

                var el = document.createElement('div');
                el.className = 'rm-room-item';
                el.innerHTML = `
                    <div class="rm-room-icon">${s.icon || r.icon}</div>
                    <div class="rm-room-info">
                        <div class="rm-room-name">${esc(s.name || r.name)}</div>
                        <div class="rm-room-meta">${s.isMuted ? '<span style="color:#ff4444;">🔇 مكتوم</span>' : '🟢 نشط'}</div>
                    </div>
                    <div style="color:#c084fc; font-size:20px;">◀</div>
                `;
                el.onclick = () => openDetails(r.id);
                body.appendChild(el);
            });
        } catch(e) { body.innerHTML = '<div style="color:#ff6666;text-align:center;">⚠️ خطأ في التحميل</div>'; }
    }

    // 3. شاشة تفاصيل الغرفة
    function ensureDetailsModal() {
        var m = document.getElementById('rm-details-modal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'rm-details-modal';
        m.innerHTML = `<div class="rm-box">
            <div class="rm-head">
                <div style="display:flex;align-items:center;">
                    <button class="rm-back-btn" onclick="document.getElementById('rm-details-modal').style.display='none'">➔</button>
                    <h3 id="rm-det-title">إدارة الغرفة</h3>
                </div>
                <button class="rm-close" onclick="document.getElementById('rm-details-modal').style.display='none'">✕</button>
            </div>
            <div class="rm-body" id="rm-det-body"></div>
        </div>`;
        document.body.appendChild(m);
        return m;
    }

    async function openDetails(roomId) {
        currentRoomId = roomId;
        var m = ensureDetailsModal();
        m.style.display = 'flex';
        document.getElementById('rm-det-title').textContent = 'إدارة: ' + (QAMAR.ROOMS[roomId].name);
        await renderDetails();
    }

    async function renderDetails() {
        var body = document.getElementById('rm-det-body');
        body.innerHTML = '<div style="text-align:center;color:#c084fc;padding:20px;">⏳ جاري التحميل...</div>';
        var me = getMe();
        var lvl = myLevel();
        
        try {
            var snap = await db.ref('room_settings/' + currentRoomId).once('value');
            var s = snap.val() || {};
            
            var isKing = lvl >= 100;
            var isMaster = lvl >= 90;
            var isGrandMan = s.grandManagers && s.grandManagers[me.uid];
            var isRoomMan = s.roomManagers && s.roomManagers[me.uid];
            
            var canEdit = isKing || isMaster || isGrandMan || isRoomMan;
            var canPurgeMute = isKing || isMaster || isGrandMan || isRoomMan;
            var canDelete = isKing;
            var canManageManagers = isKing || isMaster || isRoomMan;

            if (!canEdit && !canManageManagers) {
                body.innerHTML = '<div style="color:#ff6666;text-align:center;padding:30px;">🔒 لا تملك صلاحية إدارة هذه الغرفة.</div>';
                return;
            }

            var html = '<div class="rm-actions-grid">';
            if (canEdit) html += `<button class="rm-action-btn rm-btn-edit" onclick="window.__rmEdit()">✏️ تعديل البيانات</button>`;
            if (canPurgeMute) {
                html += `<button class="rm-action-btn rm-btn-mute ${s.isMuted?'active':''}" onclick="window.__rmMute()">${s.isMuted?'🔊 فك الكتم':'🔇 كتم الروم'}</button>`;
                html += `<button class="rm-action-btn rm-btn-purge" onclick="window.__rmPurge()">🗑️ مسح الرسائل</button>`;
            }
            if (canDelete) html += `<button class="rm-action-btn rm-btn-delete" onclick="window.__rmDelete()">❌ حذف الغرفة</button>`;
            html += '</div>';

            if (canManageManagers) {
                html += `<div class="rm-section-title">👑 إدارة المسؤولين</div>`;
                html += `<button class="rm-btn-submit" style="margin-bottom:12px;" onclick="window.__rmManageManagers()">➕ إضافة / إزالة مسؤولين</button>`;
            }

            body.innerHTML = html;

            // ربط الدوال
            window.__rmEdit = () => editRoom(s);
            window.__rmMute = () => toggleMute(s);
            window.__rmPurge = () => purgeRoom();
            window.__rmDelete = () => deleteRoom();
            window.__rmManageManagers = () => openManagersModal(s);

        } catch(e) { body.innerHTML = '<div style="color:#ff6666;text-align:center;">⚠️ خطأ</div>'; }
    }

    // 4. دوال الأزرار
    async function editRoom(s) {
        var newName = prompt('اسم الغرفة:', s.name || QAMAR.ROOMS[currentRoomId].name);
        if (newName === null) return;
        var newIcon = prompt('أيقونة الغرفة:', s.icon || QAMAR.ROOMS[currentRoomId].icon);
        if (newIcon === null) return;
        var newBg = prompt('رابط صورة الخلفية (اتركه فارغاً للإزالة):', s.bgValue || '');
        if (newBg === null) return;

        if (!confirm('هل أنت متأكد من حفظ التعديلات؟')) return;
        try {
            await db.ref('room_settings/' + currentRoomId).update({
                name: newName.trim(), icon: newIcon.trim(), bgType: newBg ? 'image' : null, bgValue: newBg || null
            });
            toast('fa-check', '✅ تم الحفظ');
            QAMAR.ROOMS[currentRoomId].name = newName;
            QAMAR.ROOMS[currentRoomId].icon = newIcon;
            if (typeof buildRoomsList === 'function') buildRoomsList();
            renderDetails();
        } catch(e) { toast('fa-times', '⚠️ فشل'); }
    }

    async function toggleMute(s) {
        if (!confirm('تغيير حالة الكتم للغرفة؟')) return;
        try {
            await db.ref('room_settings/' + currentRoomId).update({ isMuted: !s.isMuted });
            toast('fa-check', '✅ تم التغيير');
            renderDetails();
        } catch(e) { toast('fa-times', '⚠️ فشل'); }
    }

    async function purgeRoom() {
        if (!confirm('⚠️ هل أنت متأكد من مسح كل رسائل هذه الغرفة؟ لا يمكن التراجع!')) return;
        try {
            await db.ref('room_messages/' + currentRoomId).remove();
            toast('fa-check', '✅ تم المسح');
        } catch(e) { toast('fa-times', '⚠️ فشل'); }
    }

    async function deleteRoom() {
        if (!confirm('⚠️ هل أنت متأكد من حذف الغرفة نهائياً؟ سيتم طرد الجميع منها!')) return;
        try {
            await db.ref('room_settings/' + currentRoomId).update({ isDeleted: true });
            await db.ref('room_messages/' + currentRoomId).remove();
            toast('fa-check', '✅ تم حذف الغرفة');
            document.getElementById('rm-details-modal').style.display = 'none';
            renderRoomList();
        } catch(e) { toast('fa-times', '⚠️ فشل'); }
    }

    // 5. إدارة المسؤولين (Search)
    function ensureManagersModal() {
        var m = document.getElementById('rm-managers-modal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'rm-managers-modal';
        m.innerHTML = `<div class="rm-box">
            <div class="rm-head">
                <h3>👑 المسؤولون</h3>
                <button class="rm-close" onclick="document.getElementById('rm-managers-modal').style.display='none'">✕</button>
            </div>
            <div class="rm-body" id="rm-mng-body"></div>
        </div>`;
        document.body.appendChild(m);
        return m;
    }

    function openManagersModal(s) {
        var m = ensureManagersModal();
        m.style.display = 'flex';
        document.getElementById('rm-mng-body').innerHTML = `
            <div class="rm-section-title">🔍 إضافة مسؤول جديد (بالاسم أو UID)</div>
            <div class="rm-search-bar">
                <input type="text" id="rm-search-input" class="rm-search-input" placeholder="ابحث هنا...">
                <button class="rm-search-btn" onclick="window.__rmSearch()">بحث</button>
            </div>
            <div id="rm-search-results" style="margin-bottom:20px;"></div>
            <div id="rm-current-managers"></div>
        `;
        
        window.__rmSearch = async function() {
            var q = document.getElementById('rm-search-input').value.trim().toLowerCase();
            if (!q) return;
            var resBox = document.getElementById('rm-search-results');
            resBox.innerHTML = '<div style="color:#c084fc;text-align:center;padding:10px;">⏳</div>';
            
            try {
                var snap = await db.ref('users').once('value');
                var users = snap.val() || {};
                var results = [];
                Object.keys(users).forEach(uid => {
                    var u = users[uid];
                    if (u.name && u.name.toLowerCase().includes(q) || uid === q || u.code === q) results.push({uid, ...u});
                });

                resBox.innerHTML = '';
                if (results.length === 0) resBox.innerHTML = '<div style="color:#666;text-align:center;">لا نتائج</div>';
                
                results.slice(0, 5).forEach(u => {
                    var div = document.createElement('div');
                    div.className = 'rm-search-result';
                    div.innerHTML = `
                        <img src="${u.avatar || 'https://ui-avatars.com/api/?name=U'}">
                        <div class="rm-sr-info"><div class="rm-sr-name">${esc(u.name)}</div><div class="rm-sr-code">${esc(u.code || u.uid)}</div></div>
                        <button class="rm-add-btn" onclick="window.__rmAddUser('${u.uid}', '${esc(u.name)}', 'grand')">➕ جراند</button>
                        <button class="rm-add-btn" style="background:#3b82f6;" onclick="window.__rmAddUser('${u.uid}', '${esc(u.name)}', 'room')">➕ روم</button>
                    `;
                    resBox.appendChild(div);
                });
            } catch(e) { resBox.innerHTML = 'خطأ في البحث'; }
        };

        window.__rmAddUser = async function(uid, name, type) {
            var isGrand = type === 'grand';
            var path = isGrand ? 'grandManagers' : 'roomManagers';
            
            var currentSnap = await db.ref('room_settings/' + currentRoomId + '/' + path).once('value');
            var currentList = currentSnap.val() || {};
            var count = Object.keys(currentList).length;
            
            var max = isGrand ? 4 : 2;
            if (count >= max) { alert('⚠️ وصلت للحد الأقصى (' + max + ')'); return; }
            if (currentList[uid]) { alert('⚠️ هذا المستخدم مضاف مسبقاً'); return; }

            if (!confirm('هل تريد إضافة ' + name + ' كمسؤول؟')) return;
            await db.ref('room_settings/' + currentRoomId + '/' + path + '/' + uid).set(true);
            toast('fa-check', '✅ تمت الإضافة');
            renderManagersList();
        };

        async function renderManagersList() {
            var snap = await db.ref('room_settings/' + currentRoomId).once('value');
            var data = snap.val() || {};
            var grand = data.grandManagers || {};
            var room = data.roomManagers || {};
            
            var html = '<div class="rm-section-title">👑 الجراند مانيجر (' + Object.keys(grand).length + '/4)</div>';
            Object.keys(grand).forEach(uid => {
                html += `<div class="rm-manager-row"><span class="rm-manager-name">${uid}</span><button class="rm-manager-remove" onclick="window.__rmRemoveUser('${uid}', 'grand')">إزالة</button></div>`;
            });

            html += '<div class="rm-section-title" style="margin-top:20px;">🛡️ الروم مانيجر (' + Object.keys(room).length + '/2)</div>';
            Object.keys(room).forEach(uid => {
                html += `<div class="rm-manager-row"><span class="rm-manager-name">${uid}</span><button class="rm-manager-remove" onclick="window.__rmRemoveUser('${uid}', 'room')">إزالة</button></div>`;
            });

            document.getElementById('rm-current-managers').innerHTML = html;
        }

        window.__rmRemoveUser = async function(uid, type) {
            if (!confirm('هل أنت متأكد من إزالة هذا المسؤول؟ سيعود لرتبته العادية.')) return;
            var path = type === 'grand' ? 'grandManagers' : 'roomManagers';
            await db.ref('room_settings/' + currentRoomId + '/' + path + '/' + uid).remove();
            toast('fa-check', '✅ تمت الإزالة');
            renderManagersList();
        };

        renderManagersList();
    }

    // 6. الطرد الفوري عند حذف الغرفة
    function watchDeletedRooms() {
        db.ref('room_settings').on('value', snap => {
            var settings = snap.val() || {};
            var myRoom = (typeof ChatState !== 'undefined' && ChatState.currentRoom) || 'general';
            if (settings[myRoom] && settings[myRoom].isDeleted) {
                if (typeof showRoomPicker === 'function') {
                    showRoomPicker();
                }
            }
        });
    }

    setInterval(function() {
        if (typeof getCurrentUser === 'function' && getCurrentUser()) {
            injectSettingsBtn();
        }
    }, 2000);

    watchDeletedRooms();
    console.log('✅ room-manager.js v1 loaded');
})();
