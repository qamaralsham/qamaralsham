// ==============================================
// قمر الشام - Firebase Sync for Profile
// المزامنة المباشرة بين البروفايل والشات
// ==============================================

(function() {
    'use strict';

    // ====== انتظر تحميل الصفحة ======
    window.addEventListener('load', function() {
        setTimeout(initFirebaseSync, 1000);
    });

    function initFirebaseSync() {
        // التحقق من Firebase
        if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
            console.warn('⚠️ Firebase not initialized — sync disabled');
            return;
        }

        const auth = firebase.auth();
        const db = firebase.database();

        // التحقق من المستخدم
        auth.onAuthStateChanged(function(user) {
            if (!user) {
                console.log('👤 No authenticated user — sync disabled');
                return;
            }

            console.log('✅ Firebase Sync started for UID:', user.uid);
            startSync(user.uid, db);
        });
    }

    // ====== بدء المزامنة ======
    function startSync(uid, db) {
        const userRef = db.ref('users/' + uid);

        // ====== 1. مزامنة الاسم ======
        monitorElement('profile-username', function(newValue) {
            const cleanName = newValue.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            if (cleanName && cleanName.length > 0) {
                userRef.child('name').set(cleanName).catch(console.warn);
                console.log('📝 Name synced:', cleanName);
            }
        });

        // ====== 2. مزامنة الصورة ======
        monitorElement('profile-avatar-img', function(newValue) {
            if (newValue && newValue.startsWith('data:image')) {
                userRef.child('avatar').set(newValue).catch(console.warn);
                console.log('🖼️ Avatar synced');
            }
        }, 'src');

        // ====== 3. مزامنة الغلاف ======
        monitorElement('profile-cover-img', function(newValue) {
            if (newValue && newValue.startsWith('data:image')) {
                userRef.child('cover').set(newValue).catch(console.warn);
                console.log('🖼️ Cover synced');
            }
        }, 'src');

        // ====== 4. مزامنة النبذة ======
        monitorElement('profile-bio', function(newValue) {
            if (newValue && newValue.length > 0) {
                userRef.child('bio').set(newValue).catch(console.warn);
                console.log('📝 Bio synced');
            }
        });

        // ====== 5. مزامنة إطار الصورة ======
        monitorAvatarFrame(userRef);

        // ====== 6. مزامنة تدرج الاسم ======
        monitorNameGradient(userRef);

        // ====== 7. مزامنة توهج الاسم ======
        monitorNameGlow(userRef);

        // ====== 8. مزامنة إيموجي الاسم ======
        monitorNameEmoji(userRef);

        console.log('✅ Firebase Sync fully active');
    }

    // ====== مراقبة تغييرات عنصر ======
    function monitorElement(elementId, callback, attribute) {
        const el = document.getElementById(elementId);
        if (!el) {
            // حاول بعد فترة (يمكن العنصر لسا ما تحمل)
            setTimeout(function() {
                monitorElement(elementId, callback, attribute);
            }, 500);
            return;
        }

        if (attribute) {
            // مراقبة attribute (مثل src)
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === attribute) {
                        callback(el.getAttribute(attribute));
                    }
                });
            });
            observer.observe(el, { attributes: true, attributeFilter: [attribute] });
        } else {
            // مراقبة النص
            const observer = new MutationObserver(function() {
                callback(el.innerText);
            });
            observer.observe(el, { childList: true, characterData: true, subtree: true });
        }
    }

    // ====== مراقبة إطار الصورة ======
    function monitorAvatarFrame(userRef) {
        const box = document.getElementById('avatar-box');
        if (!box) {
            setTimeout(function() { monitorAvatarFrame(userRef); }, 500);
            return;
        }

        const observer = new MutationObserver(function() {
            const frameEl = box.querySelector('.dynamic-frame-wrapper');
            if (frameEl) {
                // استخراج id الإطار من الـ style
                // بدل هذا، نراقب localStorage
                const frameId = localStorage.getItem('saved_avatar_frame_motion');
                if (frameId) {
                    userRef.child('avatarFrame').set(frameId).catch(console.warn);
                    console.log('🎨 Avatar frame synced:', frameId);
                }
            } else {
                userRef.child('avatarFrame').remove().catch(console.warn);
            }
        });
        observer.observe(box, { childList: true, subtree: true });
    }

    // ====== مراقبة تدرج الاسم ======
    function monitorNameGradient(userRef) {
        const username = document.getElementById('profile-username');
        if (!username) {
            setTimeout(function() { monitorNameGradient(userRef); }, 500);
            return;
        }

        const observer = new MutationObserver(function() {
            const style = username.style.background;
            if (style && style.includes('linear-gradient')) {
                // استخراج الألوان
                const match = style.match(/rgb\([^)]+\)/g);
                if (match && match.length >= 2) {
                    const gradient = [match[0], match[1]];
                    userRef.child('nameGradient').set(gradient).catch(console.warn);
                    console.log('🌈 Name gradient synced');
                }
            }
        });
        observer.observe(username, { attributes: true, attributeFilter: ['style'] });
    }

    // ====== مراقبة توهج الاسم ======
    function monitorNameGlow(userRef) {
        const username = document.getElementById('profile-username');
        if (!username) {
            setTimeout(function() { monitorNameGlow(userRef); }, 500);
            return;
        }

        const observer = new MutationObserver(function() {
            let glow = 'none';
            if (username.classList.contains('name-glow-soft')) glow = 'soft';
            else if (username.classList.contains('name-glow-medium')) glow = 'medium';
            else if (username.classList.contains('name-glow-strong')) glow = 'strong';

            userRef.child('nameGlow').set(glow).catch(console.warn);
            console.log('✨ Name glow synced:', glow);
        });
        observer.observe(username, { attributes: true, attributeFilter: ['class'] });
    }

    // ====== مراقبة إيموجي الاسم ======
    function monitorNameEmoji(userRef) {
        const username = document.getElementById('profile-username');
        if (!username) {
            setTimeout(function() { monitorNameEmoji(userRef); }, 500);
            return;
        }

        const observer = new MutationObserver(function() {
            const text = username.innerText;
            // البحث عن إيموجي في النهاية
            const emojiMatch = text.match(/[\u{1F300}-\u{1F9FF}]+$/u);
            if (emojiMatch) {
                userRef.child('nameEmoji').set(emojiMatch[0]).catch(console.warn);
                console.log('😊 Name emoji synced:', emojiMatch[0]);
            } else {
                userRef.child('nameEmoji').remove().catch(console.warn);
            }
        });
        observer.observe(username, { childList: true, characterData: true, subtree: true });
    }

    console.log('📦 Firebase Sync script loaded');
})();
