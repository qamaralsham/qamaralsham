// ==============================================
// قمر الشام — عرض الإطارات (v1)
// ==============================================

/**
 * يرسم إطار حول صورة
 * @param {HTMLElement} container - عنصر الصورة
 * @param {string} frameId - معرّف الإطار
 */
function applyFrame(container, frameId) {
    if (!container || !frameId || frameId === 'none') {
        clearFrame(container);
        return;
    }

    const frame = getFrameData(frameId);
    if (!frame || !frame.url) {
        clearFrame(container);
        return;
    }

    // مسح الإطار القديم
    clearFrame(container);

    // تأكد من أن container relative
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    // إضافة الإطار
    const frameEl = document.createElement('div');
    frameEl.className = 'qamar-frame';
    frameEl.setAttribute('data-frame-id', frameId);
    
    const img = document.createElement('img');
    img.src = frame.url;
    img.alt = frame.name;
    img.loading = 'lazy';
    
    // حجم الإطار حسب الفئة
    const sizes = {
        small: 130,
        medium: 160,
        large: 200
    };
    const size = sizes[frame.size] || 160;
    
    frameEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${size}%;
        height: ${size}%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
    `;
    
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
    `;
    
    frameEl.appendChild(img);
    container.appendChild(frameEl);

    return frameEl;
}

/**
 * مسح الإطار من العنصر
 */
function clearFrame(container) {
    if (!container) return;
    const old = container.querySelector('.qamar-frame');
    if (old) old.remove();
}

/**
 * يعرض إطار في الحجم الكامل (مثلاً في البروفايل)
 */
function renderFramePreview(frameId, avatarUrl, targetEl) {
    if (!targetEl) return;
    
    targetEl.innerHTML = '';
    targetEl.style.cssText = `
        position: relative;
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    `;

    // الأفاتار
    const avatar = document.createElement('img');
    avatar.src = avatarUrl || 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=200';
    avatar.style.cssText = `
        width: 60%;
        height: 60%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #ffd700;
        z-index: 5;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    `;
    targetEl.appendChild(avatar);

    // الإطار
    applyFrame(targetEl, frameId);
}

window.applyFrame = applyFrame;
window.clearFrame = clearFrame;
window.renderFramePreview = renderFramePreview;
