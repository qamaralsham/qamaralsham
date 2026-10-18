// ==============================================
// join-admin-ui.js v1 — زر header + قائمة الطلبات
// ==============================================

(function () {
    'use strict';
    if (window.__joinAdminUiV1) return;
    window.__joinAdminUiV1 = true;

    var U = { modal: null, audioCtx: null };

    function getMe() {
        try { if (typeof getCurrentUser === 'function') { var u = getCurrentUser(); if (u && u.uid) return u; } } catch (e) {}
        return null;
    }

    function isKing() {
        var u = getMe();
        return !!(u && u.rank === 'King');
    }

    function esc(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function toast(icon, msg) {
        if (typeof showToast === 'function') showToast(icon, msg);
    }

    /* ═══ CSS ═══ */
    (function injectCSS() {
        if (document.getElementById('jau-css')) return;
        var s = document.createElement('style');
        s.id = 'jau-css';
        s.textContent = `
#jau-btn { position: relative; }
#jau-btn .jau-badge {
    position: absolute; top: -5px; right: -5px;
    background: #ff4444; color: #fff;
    border-radius: 50%; min-width: 18px; height: 18px;
    font-size: 10px; font-weight: 900;
    display: none; justify-content: center; align-items: center;
    padding: 0 4px; border: 2px solid var(--bg-dark);
    animation: jauBadge 1.5s ease-in-out infinite;
}
#jau-btn .jau-badge.show { display: flex; }
@keyframes jauBadge { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

#jau-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.92);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    z-index: 9999999; display: none;
    justify-content: center; align-items: center;
    padding: 12px; direction: rtl; font-family: Cairo, sans-serif;
}
#jau-modal.active { display: flex; }

#jau-box {
    background: #0a0616; border: 2px solid #ffd700;
    border-radius: 18px; width: 100%; max-width: 520px;
    max-height: 90vh; display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.3);
}
#jau-head {
    padding: 14px 16px; border-bottom: 1px solid rgba(255,215,0,0.3);
    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(0,0,0,0.4));
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
}
#jau-head h3 { color: #ffd700; margin: 0; font-size: 15px; font-weight: 900; display: flex; align-items: center; gap: 8px; }
#jau-close {
    background: rgba(255,68,68,0.2); border: 1px solid rgba(255,68,68,0.5);
    color: #ff7777; width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; font-size: 14px; font-weight: 900; padding: 0;
}
#jau-stats {
    padding: 8px 16px; border-bottom: 1px solid rgba(255,215,0,0.15);
    display: flex; gap: 12px; justify-content: center;
    font-size: 11px; font-weight: 900; background: rgba(0,0,0,0.3);
    flex-shrink: 0;
}
#jau-stats .count-pending { color: #ffd700; }
#jau-body {
    flex: 1; overflow-y: auto; padding: 12px;
    scrollbar-width: thin; scrollbar-color: rgba(255,215,0,0.4) transparent;
}
#jau-body::-webkit-scrollbar { width: 5px; }
#jau-body::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.4); border-radius: 5px; }

.jau-item {
    display: flex; align-items: center; gap: 10px;
    padding: 12px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,215,0,0.2); border-radius: 12px;
    margin-bottom: 10px; flex-wrap: wrap;
}
.jau-item img {
    width: 48px; height: 48px; border-radius: 50%;
    border: 2px solid #ffd700; object-fit: cover;
    flex-shrink: 0; background: #333;
}
.jau-info { flex: 1; min-width: 150px; }
.jau-name { color: #fff; font-weight: 900; font-size: 14px; margin-bottom: 3px; }
.jau-code { color: #ffd700; font-size: 11px; font-weight: 900; margin-bottom: 2px; }
.jau-meta { color: #888; font-size: 10px; line-height: 1.4; }
.jau-actions {
    display: flex; gap: 6px; width: 100%; margin-top: 8px;
}
.jau-actions button {
    flex: 1; padding: 10px; border-radius: 10px; border: none;
    font-family: inherit; font-size: 12px; font-weight: 900;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 4px; transition: all 0.15s;
}
.jau-actions button:active { transform: scale(0.96); }
.jau-approve { background: linear-gradient(135deg,#84cc16,#65a30d); color: #fff; }
.jau-reject { background: rgba(255,68,68,0.2); color: #ff8888; border: 1px solid rgba(255,68,68,0.4); }

.jau-empty {
    text-align: center; color: #666;
    padding: 60px 20px; font-size: 13px; line-height: 1.7;
}
.jau-toolbar {
    padding: 8px 12px; border-top: 1px solid rgba(255,215,0,0.15);
    background: rgba(0,0,0,0.3); display: flex; gap: 6px; flex-shrink: 0;
}
.jau-toolbar button {
    flex: 1; padding: 8px; border-radius: 8px; border: none;
    font-family: inherit; font-size: 11px; font-weight: 900; cursor: pointer;
}
.jau-import { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); }
.jau-add { background: rgba(132,204,22,0.2); color: #a3e635; border: 1px solid rgba(132,204,22,0.4); }
        `;
        document.head.appendChild(s);
    })();

    /* ═══ زر ═══ */
    function injectButton() {
        if (!isKing()) return;
        var header = document.querySelector('.header .header-actions');
        if (!header) { setTimeout(injectButton, 1500); return; }
        if (document.getElementById('jau-btn')) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-btn';
        btn.id = 'jau-btn';
        btn.title = 'طلبات الدخول';
        btn.innerHTML = '🚪<span class="jau-badge" id="jau-badge">0</span>';
        btn.onclick = openModal;
        header.appendChild(btn);
    }

    function updateBadge(n) {
        var b = document.getElementById('jau-badge');
        if (!b) return;
        if (n > 0) {
            b.textContent = n > 99 ? '99+' : n;
            b.classList.add('show');
        } else {
            b.classList.remove('show');
        }
    }

    /* ═══ صوت ═══ */
    function playSound() {
        try {
            if (!U.audioCtx) U.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var ctx = U.audioCtx;
            var now = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                var start = now + i * 0.15;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.3, start + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start); osc.stop(start + 0.4);
            });
        } catch (e) {}
    }

    /* ═══ Toast للطلب الجديد ═══ */
    function showNewToast(name) {
        var el = document.createElement('div');
        el.style.cssText =
            'position:fixed;top:80px;left:50%;transform:translateX(-50%);' +
            'background:linear-gradient(135deg,#ffd700,#d4af37);color:#000;' +
            'padding:12px 20px;border-radius:12px;font-weight:900;font-size:13px;' +
            'z-index:99999999;box-shadow:0 8px 30px rgba(255,215,0,0.6);';
        el.textContent = '🔔 طلب دخول جديد: ' + name;
        document.body.appendChild(el);
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 5000);
        playSound();
    }

    /* ═══ Modal ═══ */
    function ensureModal() {
        if (U.modal) return U.modal;
        var m = document.createElement('div');
        m.id = 'jau-modal';
        m.innerHTML =
            '<div id="jau-box">' +
                '<div id="jau-head">' +
                    '<h3>🚪 طلبات الدخول</h3>' +
                    '<button type="button" id="jau-close">✕</button>' +
                '</div>' +
                '<div id="jau-stats">' +
                    '<span>⏳ معلقة: <b class="count-pending" id="jau-count">0</b></span>' +
                '</div>' +
                '<div id="jau-body"><div class="jau-empty">⏳</div></div>' +
                '<div class="jau-toolbar">' +
                    '<button type="button" class="jau-add" id="jau-add-btn">➕ إضافة بـ UID</button>' +
                    '<button type="button" class="jau-import" id="jau-import-btn">📥 استيراد القدامى</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(m);

        m.querySelector('#jau-close').onclick = closeModal;
        m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });

        m.querySelector('#jau-add-btn').onclick = function () {
            var uid = prompt('UID المستخدم:');
            if (uid) {
                JoinAdminActions.addByUid(uid.trim()).then(function (ok) {
                    if (ok) render();
                });
            }
        };
        m.querySelector('#jau-import-btn').onclick = function () {
            JoinAdminActions.importExisting().then(function (ok) {
                if (ok) render();
            });
        };

        U.modal = m;
        return m;
    }

    function openModal() {
        var m = ensureModal();
        m.classList.add('active');
        render();
    }

    function closeModal() {
        if (U.modal) U.modal.classList.remove('active');
    }

    /* ═══ Render ═══ */
    function render() {
        var body = document.getElementById('jau-body');
        if (!body) return;
        var list = (window.JoinAdminListener && JoinAdminListener.getList) ? JoinAdminListener.getList() : [];

        var countEl = document.getElementById('jau-count');
        if (countEl) countEl.textContent = list.length;

        if (list.length === 0) {
            body.innerHTML =
                '<div class="jau-empty">' +
                    '📭<br><br>' +
                    'لا توجد طلبات معلقة<br>' +
                    '<span style="color:#666;font-size:11px;">عندما يطلب شخص الانضمام، سيظهر هنا</span>' +
                '</div>';
            return;
        }

        body.innerHTML = '';
        list.forEach(function (u) {
            var el = document.createElement('div');
            el.className = 'jau-item';
            var av = u.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'U') + '&background=333&color=fff');
            el.innerHTML =
                '<img src="' + esc(av) + '" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=333&color=fff\'">' +
                '<div class="jau-info">' +
                    '<div class="jau-name">' + esc(u.name || 'مجهول') + '</div>' +
                    '<div class="jau-code">🔑 ' + esc(u.code || '—') + '</div>' +
                    '<div class="jau-meta">' +
                        '👤 ' + (u.isGuest ? 'زائر' : 'عضو') +
                        ' · 🎂 ' + esc(u.age || '—') +
                        ' · ⏱️ ' + ago(u.createdAt) +
                    '</div>' +
                '</div>' +
                '<div class="jau-actions">' +
                    '<button type="button" class="jau-approve" data-a="approve" data-uid="' + esc(u._uid) + '">✅ موافقة</button>' +
                    '<button type="button" class="jau-reject" data-a="reject" data-uid="' + esc(u._uid) + '">❌ رفض</button>' +
                '</div>';
            body.appendChild(el);
        });

        body.querySelectorAll('[data-a]').forEach(function (b) {
            b.onclick = function () {
                var uid = this.getAttribute('data-uid');
                var action = this.getAttribute('data-a');
                if (action === 'approve') {
                    JoinAdminActions.approve(uid).then(function (ok) {
                        if (ok) render();
                    });
                } else if (action === 'reject') {
                    var reason = prompt('سبب الرفض (اختياري):', '');
                    if (reason === null) return;
                    JoinAdminActions.reject(uid, reason).then(function (ok) {
                        if (ok) render();
                    });
                }
            };
        });
    }

    function ago(ts) {
        if (!ts) return '—';
        var d = Math.floor((Date.now() - ts) / 1000);
        if (d < 60) return 'الآن';
        if (d < 3600) return 'قبل ' + Math.floor(d / 60) + 'د';
        if (d < 86400) return 'قبل ' + Math.floor(d / 3600) + 'س';
        return 'قبل ' + Math.floor(d / 86400) + 'ي';
    }

    /* ═══ Setup ═══ */
    function setup() {
        if (!isKing()) return;
        injectButton();
        if (window.JoinAdminListener) {
            JoinAdminListener.setOnUpdate(function (list) {
                updateBadge(list.length);
                if (U.modal && U.modal.classList.contains('active')) render();
            });
        }
    }

    window.JoinAdminUI = {
        open: openModal,
        close: closeModal,
        render: render,
        setup: setup,
        version: 1
    };

    window.__joinAdminOnNew = showNewToast;

    // إعادة حقن الزر دورياً
    setInterval(function () {
        if (isKing() && !document.getElementById('jau-btn')) injectButton();
    }, 5000);

    // init
    var t = setInterval(function () {
        if (isKing() && window.JoinAdminListener && typeof db !== 'undefined' && db) {
            clearInterval(t);
            setup();
        }
    }, 1000);
    setTimeout(function () { clearInterval(t); }, 60000);

    console.log('📦 join-admin-ui.js v1 loaded');
})();
