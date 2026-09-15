// ==============================================
// Qamar Al Sham - Profile Appearance (v1)
// ==============================================

function clearNameStyles() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    const toRemove = [];
    el.classList.forEach(c => {
        if (c.startsWith('nf-') || c.startsWith('name-')) toRemove.push(c);
    });
    toRemove.forEach(c => el.classList.remove(c));
    el.style.cssText = '';
    el.style.filter = '';
}

function applyNameColor() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    clearNameStyles();
    if (nameColor) {
        el.style.color = nameColor;
        el.style.textShadow = '0 2px 12px rgba(0,0,0,0.95)';
    }
    if (nameShape) el.classList.add(nameShape);
    if (nameFrame) {
        el.classList.add('nf', nameFrame);
        el.style.color = '#fff';
        el.style.textShadow = '0 1px 4px rgba(0,0,0,0.95)';
    }
    if (nameGlow) {
        if (nameGlow === 'soft') el.style.filter = 'drop-shadow(0 0 8px currentColor)';
        else if (nameGlow === 'medium') el.style.filter = 'drop-shadow(0 0 15px currentColor)';
        else if (nameGlow === 'strong') el.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
    }
}

function applyNameGradient() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    clearNameStyles();
    if (nameGradient && nameGradient.length >= 2) {
        el.style.background = 'linear-gradient(90deg,' + nameGradient[0] + ',' + nameGradient[1] + ',' + nameGradient[0] + ')';
        el.style.backgroundSize = '200% 200%';
        el.style.webkitBackgroundClip = 'text';
        el.style.backgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
        el.style.animation = 'nfSlide 3s linear infinite';
    }
    if (nameShape) el.classList.add(nameShape);
    if (nameFrame) {
        el.classList.add('nf', nameFrame);
        el.style.color = '#fff';
        el.style.textShadow = '0 1px 4px rgba(0,0,0,0.95)';
    }
    if (nameGlow) {
        if (nameGlow === 'soft') el.style.filter = 'drop-shadow(0 0 8px currentColor)';
        else if (nameGlow === 'medium') el.style.filter = 'drop-shadow(0 0 15px currentColor)';
        else if (nameGlow === 'strong') el.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
    }
}

function applyNameFrame() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    const toRemove = [];
    el.classList.forEach(c => {
        if (c.startsWith('nf-')) toRemove.push(c);
    });
    toRemove.forEach(c => el.classList.remove(c));
    if (nameFrame) {
        el.classList.add('nf', nameFrame);
        el.style.color = '#fff';
        el.style.textShadow = '0 1px 4px rgba(0,0,0,0.95)';
    }
}

function applyNameShape() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    el.classList.remove('name-capsule','name-pill','name-rounded','name-ellipse','name-square');
    if (nameShape) el.classList.add(nameShape);
}

function applyNameGlow() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    el.style.filter = '';
    if (nameGlow === 'soft') el.style.filter = 'drop-shadow(0 0 8px currentColor)';
    else if (nameGlow === 'medium') el.style.filter = 'drop-shadow(0 0 15px currentColor)';
    else if (nameGlow === 'strong') el.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
}

function reapplyShapeFrame() {
    const el = document.getElementById('profile-username');
    if (!el) return;
    el.classList.remove('name-capsule','name-pill','name-rounded','name-ellipse','name-square');
    if (nameShape) el.classList.add(nameShape);
    applyNameFrame();
}

function updateShapeLbl() {
    const b = document.getElementById('btn-name-shape');
    if (b) {
        const f = SHAPES.find(x => x.id === nameShape);
        b.innerText = f ? f.name : 'تغيير';
    }
}

function updateGlowLbl() {
    const b = document.getElementById('btn-name-glow');
    if (b) {
        const f = GLOWS.find(x => x.id === nameGlow);
        b.innerText = f ? f.name : 'تغيير';
    }
}

function applyGlow(c) {
    const p = document.getElementById('profile-container');
    if (!p) return;
    if (!c) {
        p.classList.remove('glow-active');
        p.style.removeProperty('--glow-color');
    } else {
        p.style.setProperty('--glow-color', c);
        p.classList.add('glow-active');
    }
}

function applyBg() {
    const layer = document.getElementById('profile-bg-layer');
    if (!layer) return;
    layer.innerHTML = '';
    layer.style.backgroundImage = '';
    layer.style.background = '';
    if (bgType === 'color') {
        layer.style.background = bgValue || '#050508';
    } else if (bgType === 'image') {
        layer.style.backgroundImage = 'url(' + bgValue + ')';
    } else if (bgType === 'video') {
        const v = document.createElement('video');
        v.src = bgValue;
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        layer.appendChild(v);
    }
}

function applyAvatarFrame(fid) {
    const box = document.getElementById('avatar-box');
    if (!box) return;
    box.querySelectorAll('.dynamic-frame-wrapper,.qamar-frame,.qcf').forEach(e => e.remove());
    if (!fid || fid === 'none') {
        localStorage.setItem('saved_avatar_frame_motion', '');
        return;
    }
    if (typeof CSS_FRAMES_DATA !== 'undefined' && CSS_FRAMES_DATA[fid] && typeof applyCSSFrame === 'function') {
        applyCSSFrame(box, fid);
        localStorage.setItem('saved_avatar_frame_motion', fid);
        return;
    }
    const fr = FRAMES.find(f => f.id === fid);
    if (!fr) return;
    const w = document.createElement('div');
    w.className = 'dynamic-frame-wrapper';
    w.style.cssText = fr.style;
    if (fr.badge && fr.badge !== '') {
        const bd = document.createElement('div');
        bd.className = 'frame-badge-top';
        bd.innerHTML = fr.badge;
        w.appendChild(bd);
    }
    box.appendChild(w);
    localStorage.setItem('saved_avatar_frame_motion', fid);
}

function initAppearance() {
    if (viewMode !== 'owner') return;

    const bc = document.getElementById('btn-name-color');
    if (bc) bc.onclick = () => openNamePicker('color');

    const bg = document.getElementById('btn-name-gradient');
    if (bg) bg.onclick = () => openNamePicker('gradient');

    const bf = document.getElementById('btn-name-frame');
    if (bf) bf.onclick = () => openNamePicker('frame');

    const bs = document.getElementById('btn-name-shape');
    if (bs) bs.onclick = () => openNamePicker('shape');

    const bgl = document.getElementById('btn-name-glow');
    if (bgl) bgl.onclick = () => openNamePicker('glow');

    const pgb = document.getElementById('btn-profile-glow');
    if (pgb) pgb.onclick = () => {
        const g = document.getElementById('profile-glow-grid');
        g.innerHTML = '';
        ['#ffd700','#ff69b4','#00f3ff','#39ff14','#a855f7','#ff0066','#ffffff','#ff4444','#ff8c00','#00ff88','#8b00ff','#feca57'].forEach(c => {
            const b = document.createElement('div');
            b.className = 'color-box';
            b.style.background = c;
            b.onclick = () => {
                applyGlow(c);
                localStorage.setItem('profile_glow', c);
                if (pgb) pgb.innerText = 'تغيير';
                closeModal('profile-glow-modal');
                saveToChat();
                toast('✅ تم');
            };
            g.appendChild(b);
        });
        openModal('profile-glow-modal');
    };

    const gob = document.getElementById('glow-off-btn');
    if (gob) gob.onclick = () => {
        applyGlow(null);
        localStorage.removeItem('profile_glow');
        if (pgb) pgb.innerText = 'تغيير';
        closeModal('profile-glow-modal');
    };

    const bb = document.getElementById('btn-profile-bg');
    if (bb) bb.onclick = () => {
        openAppModal('تغيير خلفية البروفايل', 'اختر النوع:', 'select', ['لون','صورة','فيديو'], 'لون', v => {
            if (v === 'صورة' || v === 'فيديو') {
                const inp = document.getElementById('profile-bg-input');
                if (inp) inp.click();
            } else {
                bgType = 'color';
                bgValue = '#050508';
                localStorage.setItem('profile_bg_type', 'color');
                localStorage.setItem('profile_bg_value', '#050508');
                applyBg();
                saveToChat();
            }
        });
    };

    const bi = document.getElementById('profile-bg-input');
    if (bi) bi.onchange = async e => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.type.startsWith('video/')) {
            const r = new FileReader();
            r.onload = ev => {
                bgValue = ev.target.result;
                bgType = 'video';
                localStorage.setItem('profile_bg_type', 'video');
                localStorage.setItem('profile_bg_value', bgValue);
                applyBg();
                saveToChat();
            };
            r.readAsDataURL(f);
            return;
        }
        const u = await uploadLoad(f, 5);
        if (u) {
            bgValue = u;
            bgType = 'image';
            localStorage.setItem('profile_bg_type', 'image');
            localStorage.setItem('profile_bg_value', u);
            applyBg();
            saveToChat();
        }
    };

    const mb = document.getElementById('btn-profile-music');
    const mi = document.getElementById('music-file-input');
    if (mb && mi) mb.onclick = () => mi.click();
    if (mi) mi.onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
            musicURL = ev.target.result;
            localStorage.setItem('profile_music_url', musicURL);
            const p = document.getElementById('music-player');
            if (p) p.src = musicURL;
            const mbb = document.getElementById('music-btn-mini');
            if (mbb) mbb.style.display = 'flex';
            saveToChat();
            toast('✅ تم تعيين الموسيقى');
        };
        r.readAsDataURL(f);
    };

    const fb = document.getElementById('avatar-frame-motion');
    if (fb) fb.onclick = () => {
        openModal('frames-modal');
        if (typeof renderFrames === 'function') renderFrames();
    };
}

function openNamePicker(tab) {
    document.querySelectorAll('#name-tabs .modal-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-pick') === tab);
        t.onclick = () => openNamePicker(t.getAttribute('data-pick'));
    });
    const grid = document.getElementById('name-picker-grid');
    grid.innerHTML = '';
    const realName = (viewMode === 'owner' && currentUser && currentUser.name) ? currentUser.name : ((targetUser && targetUser.name) || 'مستخدم');

    if (tab === 'color') {
        COLORS.forEach(c => {
            const d = document.createElement('div');
            d.className = 'picker-item';
            if (nameColor === c) d.classList.add('selected');
            const p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = c;
            p.innerText = realName;
            d.appendChild(p);
            d.onclick = () => {
                nameColor = c;
                nameGradient = null;
                localStorage.setItem('name_color', c);
                localStorage.removeItem('name_gradient');
                applyNameColor();
                saveToChat();
                toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    else if (tab === 'gradient') {
        GRADS.forEach(g => {
            const d = document.createElement('div');
            d.className = 'picker-item';
            const p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.background = 'linear-gradient(90deg,' + g[0] + ',' + g[1] + ',' + g[0] + ')';
            p.style.backgroundSize = '200% 200%';
            p.style.webkitBackgroundClip = 'text';
            p.style.backgroundClip = 'text';
            p.style.webkitTextFillColor = 'transparent';
            p.style.animation = 'nfSlide 3s linear infinite';
            p.innerText = realName;
            d.appendChild(p);
            d.onclick = () => {
                nameGradient = g;
                nameColor = null;
                localStorage.setItem('name_gradient', JSON.stringify(g));
                localStorage.removeItem('name_color');
                applyNameGradient();
                saveToChat();
                toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    else if (tab === 'frame') {
        const dNone = document.createElement('div');
        dNone.className = 'picker-item';
        if (!nameFrame) dNone.classList.add('selected');
        const pNone = document.createElement('div');
        pNone.className = 'picker-prev';
        pNone.style.background = 'rgba(0,0,0,0.5)';
        pNone.innerText = 'بدون';
        dNone.appendChild(pNone);
        dNone.onclick = () => {
            nameFrame = null;
            localStorage.removeItem('name_frame');
            applyNameFrame();
            const btn = document.getElementById('btn-name-frame');
            if (btn) btn.innerText = 'تغيير';
            saveToChat();
            toast('✅ تم');
            closeModal('name-picker-modal');
        };
        grid.appendChild(dNone);

        FRAMES_LIST.forEach(f => {
            const d = document.createElement('div');
            d.className = 'picker-item';
            if (nameFrame === f.id) d.classList.add('selected');
            const p = document.createElement('div');
            p.className = 'picker-prev nf ' + f.id;
            p.innerText = realName;
            d.appendChild(p);
            d.onclick = () => {
                nameFrame = f.id;
                localStorage.setItem('name_frame', f.id);
                applyNameFrame();
                const btn = document.getElementById('btn-name-frame');
                if (btn) btn.innerText = f.id;
                saveToChat();
                toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    else if (tab === 'shape') {
        const dNone = document.createElement('div');
        dNone.className = 'picker-item';
        if (!nameShape) dNone.classList.add('selected');
        const pNone = document.createElement('div');
        pNone.className = 'picker-prev';
        pNone.innerText = realName;
        dNone.appendChild(pNone);
        dNone.onclick = () => {
            nameShape = null;
            localStorage.removeItem('name_shape');
            reapplyShapeFrame();
            updateShapeLbl();
            saveToChat();
            toast('✅ تم');
            closeModal('name-picker-modal');
        };
        grid.appendChild(dNone);

        SHAPES.forEach(f => {
            const d = document.createElement('div');
            d.className = 'picker-item';
            if (nameShape === f.id) d.classList.add('selected');
            const p = document.createElement('div');
            p.className = 'picker-prev ' + f.id;
            p.innerText = realName;
            d.appendChild(p);
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            lbl.textContent = f.name;
            d.style.flexDirection = 'column';
            d.appendChild(lbl);
            d.onclick = () => {
                nameShape = f.id;
                localStorage.setItem('name_shape', f.id);
                reapplyShapeFrame();
                updateShapeLbl();
                saveToChat();
                toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    else if (tab === 'glow') {
        GLOWS.forEach(g => {
            const d = document.createElement('div');
            d.className = 'picker-item';
            if (nameGlow === g.id) d.classList.add('selected');
            const p = document.createElement('div');
            p.className = 'picker-prev';
            p.style.color = '#ffd700';
            p.innerText = realName;
            if (g.id === 'soft') p.style.filter = 'drop-shadow(0 0 8px currentColor)';
            else if (g.id === 'medium') p.style.filter = 'drop-shadow(0 0 15px currentColor)';
            else if (g.id === 'strong') p.style.filter = 'drop-shadow(0 0 25px currentColor) drop-shadow(0 0 40px currentColor)';
            d.appendChild(p);
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            lbl.textContent = g.name;
            d.style.flexDirection = 'column';
            d.appendChild(lbl);
            d.onclick = () => {
                nameGlow = g.id;
                localStorage.setItem('name_glow', g.id);
                applyNameGlow();
                updateGlowLbl();
                saveToChat();
                toast('✅ تم');
                closeModal('name-picker-modal');
            };
            grid.appendChild(d);
        });
    }
    openModal('name-picker-modal');
}

function renderFrames() {
    const c = document.getElementById('frames-container');
    if (!c) return;
    c.innerHTML = '';
    if (typeof CSS_FRAMES_DATA !== 'undefined') {
        Object.values(CSS_FRAMES_DATA).forEach(f => {
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px;text-align:center;cursor:pointer';
            const p = document.createElement('div');
            p.style.cssText = 'background:#1a0e2e;position:relative;width:44px;height:44px;border-radius:50%;margin:0 auto';
            const av = document.createElement('img');
            av.src = 'https://ui-avatars.com/api/?name=U&background=333&color=fff';
            av.style.cssText = 'width:70%;height:70%;border-radius:50%;position:absolute;top:15%;left:15%';
            p.appendChild(av);
            const fp = document.createElement('div');
            fp.className = 'qcf qcf--' + f.cssClass;
            fp.style.cssText = 'position:absolute;inset:-3px;z-index:15';
            p.appendChild(fp);
            const n = document.createElement('div');
            n.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            n.textContent = f.name;
            card.appendChild(p);
            card.appendChild(n);
            card.onclick = () => {
                applyAvatarFrame(f.id);
                saveToChat();
                toast('✅ تم');
            };
            c.appendChild(card);
        });
    }
    if (typeof FRAMES_DATA !== 'undefined') {
        Object.values(FRAMES_DATA).forEach(f => {
            if (!f.url) return;
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px;text-align:center;cursor:pointer';
            const p = document.createElement('div');
            p.style.cssText = 'background:#1a0e2e;width:44px;height:44px;margin:0 auto;border-radius:50%';
            const img = document.createElement('img');
            img.src = f.url;
            img.style.cssText = 'width:100%;height:100%;object-fit:contain';
            p.appendChild(img);
            const n = document.createElement('div');
            n.style.cssText = 'font-size:10px;color:#ffd700;margin-top:6px';
            n.textContent = f.name;
            card.appendChild(p);
            card.appendChild(n);
            card.onclick = () => {
                applyAvatarFrame(f.id);
                saveToChat();
                toast('✅ تم');
            };
            c.appendChild(card);
        });
    }
}

console.log('Profile appearance v1 loaded');
