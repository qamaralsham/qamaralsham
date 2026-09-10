// ==============================================
// قمر الشام - Firebase Sync
// مزامنة تلقائية بين البروفايل و Firebase
// ==============================================

(function() {
    'use strict';
    
    window.addEventListener('load', function() {
        setTimeout(initSync, 1500);
    });

    function initSync() {
        if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
            console.warn('⚠️ Firebase not initialized');
            return;
        }
        
        const db = firebase.database();
        
        function getUID() {
            if (firebase.auth().currentUser) {
                return firebase.auth().currentUser.uid;
            }
            try {
                const u = JSON.parse(localStorage.getItem('qamar_user') || '{}');
                if (u.uid) return u.uid;
                const u2 = JSON.parse(localStorage.getItem('qamar_current_user') || '{}');
                if (u2.uid) return u2.uid;
                if (u.name) return 'guest_' + u.name.replace(/\s+/g, '_');
                if (u2.name) return 'guest_' + u2.name.replace(/\s+/g, '_');
            } catch(e) {}
            return null;
        }
        
        const uid = getUID();
        if (!uid) {
            console.warn('⚠️ No UID found');
            return;
        }
        
        console.log('✅ Firebase Sync started for UID:', uid);
        const userRef = db.ref('users/' + uid);
        
        userRef.once('value').then(function(snap) {
            const data = snap.val();
            if (data) {
                console.log('📥 Loading data from Firebase...');
                loadFromFirebase(data);
            }
        }).catch(function(err) {
            console.warn('Initial load error:', err);
        });
        
        syncElement('profile-username', function(el) {
            let name = el.innerText || '';
            name = name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, '').trim();
            if (name) {
                userRef.child('name').set(name).catch(console.warn);
            }
        });
        
        syncImage('profile-avatar-img', function(src) {
            if (src && (src.startsWith('data:image') || src.startsWith('http'))) {
                userRef.child('avatar').set(src).catch(console.warn);
            }
        });
        
        syncImage('profile-cover-img', function(src) {
            if (src && (src.startsWith('data:image') || src.startsWith('http'))) {
                userRef.child('cover').set(src).catch(console.warn);
            }
        });
        
        syncElement('profile-bio', function(el) {
            const bio = el.innerText || '';
            if (bio) {
                userRef.child('bio').set(bio).catch(console.warn);
            }
        });
        
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            if (key === 'saved_avatar_frame_motion') {
                if (value && value !== '' && value !== 'none') {
                    userRef.child('avatarFrame').set(value).catch(console.warn);
                } else {
                    userRef.child('avatarFrame').remove().catch(console.warn);
                }
            }
            if (key === 'name_gradient') {
                try {
                    const grad = JSON.parse(value);
                    if (grad && grad.length >= 2) {
                        userRef.child('nameGradient').set(grad).catch(console.warn);
                    }
                } catch(e) {}
            }
            if (key === 'name_glow') {
                userRef.child('nameGlow').set(value || 'none').catch(console.warn);
            }
            if (key === 'name_emoji') {
                if (value) {
                    userRef.child('nameEmoji').set(value).catch(console.warn);
                } else {
                    userRef.child('nameEmoji').remove().catch(console.warn);
                }
            }
            if (key === 'name_gif') {
                if (value) {
                    userRef.child('nameGif').set(value).catch(console.warn);
                } else {
                    userRef.child('nameGif').remove().catch(console.warn);
                }
            }
            if (key === 'profile_music_url') {
                if (value) {
                    userRef.child('music').set(value).catch(console.warn);
                } else {
                    userRef.child('music').remove().catch(console.warn);
                }
            }
            if (key === 'profile_bg_value') {
                if (value) {
                    const type = localStorage.getItem('profile_bg_type') || 'color';
                    userRef.child('profileBg').set({ type: type, value: value }).catch(console.warn);
                }
            }
            if (key === 'poetry_text') {
                userRef.child('poetry').set(value || '').catch(console.warn);
            }
            if (key === 'status_privacy') {
                userRef.child('statusPrivacy').set(value || 'public').catch(console.warn);
            }
            if (key && key.startsWith('privacy_')) {
                const field = key.replace('privacy_', '');
                userRef.child('privacy/' + field).set(value).catch(console.warn);
            }
        };
        
        userRef.on('value', function(snap) {
            const data = snap.val();
            if (!data) return;
            const mode = localStorage.getItem('profile_view_mode') || 'owner';
            if (mode === 'owner') {
                console.log('🔄 Firebase data updated');
            }
        });
        
        console.log('✅ Firebase Sync fully active for:', uid);
    }
    
    function loadFromFirebase(data) {
        const mode = localStorage.getItem('profile_view_mode') || 'owner';
        if (mode === 'visitor') return;
        
        if (data.name) localStorage.setItem('profile_name', data.name);
        if (data.avatar) localStorage.setItem('saved_avatar', data.avatar);
        if (data.cover) localStorage.setItem('saved_cover', data.cover);
        if (data.bio) localStorage.setItem('profile_bio', data.bio);
        if (data.avatarFrame) localStorage.setItem('saved_avatar_frame_motion', data.avatarFrame);
        if (data.nameGradient) localStorage.setItem('name_gradient', JSON.stringify(data.nameGradient));
        if (data.nameGlow) localStorage.setItem('name_glow', data.nameGlow);
        if (data.nameEmoji) localStorage.setItem('name_emoji', data.nameEmoji);
        if (data.nameGif) localStorage.setItem('name_gif', data.nameGif);
        if (data.music) localStorage.setItem('profile_music_url', data.music);
        if (data.profileBg) {
            localStorage.setItem('profile_bg_type', data.profileBg.type || 'color');
            localStorage.setItem('profile_bg_value', data.profileBg.value || '#050508');
        }
        if (data.poetry) localStorage.setItem('poetry_text', data.poetry);
        if (data.statusPrivacy) localStorage.setItem('status_privacy', data.statusPrivacy);
        if (data.privacy) {
            Object.keys(data.privacy).forEach(function(field) {
                localStorage.setItem('privacy_' + field, data.privacy[field]);
            });
        }
        
        setTimeout(function() {
            if (typeof loadAllSaved === 'function') {
                loadAllSaved();
            }
        }, 150);
    }
    
    function syncElement(id, callback) {
        const el = document.getElementById(id);
        if (!el) {
            setTimeout(function() { syncElement(id, callback); }, 500);
            return;
        }
        let timeout;
        const observer = new MutationObserver(function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() { callback(el); }, 300);
        });
        observer.observe(el, { childList: true, characterData: true, subtree: true, attributes: true });
    }
    
    function syncImage(id, callback) {
        const el = document.getElementById(id);
        if (!el) {
            setTimeout(function() { syncImage(id, callback); }, 500);
            return;
        }
        let timeout;
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                if (m.attributeName === 'src') {
                    clearTimeout(timeout);
                    timeout = setTimeout(function() { callback(el.src); }, 300);
                }
            });
        });
        observer.observe(el, { attributes: true, attributeFilter: ['src'] });
    }
    
    console.log('📦 firebase-sync.js loaded');
})();
