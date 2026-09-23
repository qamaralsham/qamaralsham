// ==============================================
// upload-service.js v1 — رفع موحّد (catbox + imgbb)
// ==============================================
// ✅ catbox.moe       → ملفات دائمة (موسيقى)
// ✅ litterbox.catbox → ملفات مؤقتة (فيديو الحالات، 24h)
// ✅ imgbb            → صور
// ✅ 0x0.st           → fallback عند فشل catbox
// ✅ تحويل تلقائي لـ JPG للصيغ غير المدعومة (HEIC/AVIF)
// ==============================================

(function () {
    'use strict';
    if (window.__uploadServiceV1) return;
    window.__uploadServiceV1 = true;

    var IMGBB_KEY = '80fd32c4ef79b5f25fbcf0893547de4f';

    /* ════════ catbox.moe — دائم (200MB) ════════ */
    async function uploadCatbox(file) {
        var fd = new FormData();
        fd.append('reqtype', 'fileupload');
        fd.append('fileToUpload', file);
        var res = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: fd
        });
        if (!res.ok) throw new Error('catbox HTTP ' + res.status);
        var text = (await res.text()).trim();
        if (!text || text.indexOf('https://') !== 0) {
            throw new Error('catbox: ' + text.substring(0, 100));
        }
        return text;
    }

    /* ════════ litterbox — مؤقت (24h/72h) ════════ */
    async function uploadLitterbox(file, hours) {
        hours = hours || 24;
        var time = hours <= 1 ? '1h' :
                   hours <= 12 ? '12h' :
                   hours <= 24 ? '24h' : '72h';
        var fd = new FormData();
        fd.append('reqtype', 'fileupload');
        fd.append('time', time);
        fd.append('fileToUpload', file);
        var res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
            method: 'POST',
            body: fd
        });
        if (!res.ok) throw new Error('litterbox HTTP ' + res.status);
        var text = (await res.text()).trim();
        if (!text || text.indexOf('https://') !== 0) {
            throw new Error('litterbox: ' + text.substring(0, 100));
        }
        return text;
    }

    /* ════════ 0x0.st — fallback (100MB) ════════ */
    async function upload0x0(file) {
        var fd = new FormData();
        fd.append('file', file);
        var res = await fetch('https://0x0.st', {
            method: 'POST',
            body: fd
        });
        if (!res.ok) throw new Error('0x0 HTTP ' + res.status);
        var text = (await res.text()).trim();
        if (!text || text.indexOf('https://') !== 0) {
            throw new Error('0x0: ' + text.substring(0, 100));
        }
        return text;
    }

    /* ════════ imgbb — صور ════════ */
    async function uploadImgbb(file) {
        var fd = new FormData();
        fd.append('key', IMGBB_KEY);
        fd.append('image', file);
        var res = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: fd
        });
        var data = await res.json();
        if (!data.success || !data.data || !data.data.url) {
            throw new Error('imgbb: ' + (data.error && data.error.message || 'unknown'));
        }
        return data.data.url;
    }

    /* ════════ تحويل صورة إلى JPG ════════ */
    function convertImageToJpg(file, maxSize, quality) {
        return new Promise(function (resolve, reject) {
            maxSize = maxSize || 1920;
            quality = quality || 0.88;
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    try {
                        var canvas = document.createElement('canvas');
                        var w = img.width, h = img.height;
                        if (w > h) {
                            if (w > maxSize) { h = h * maxSize / w; w = maxSize; }
                        } else {
                            if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
                        }
                        canvas.width = w;
                        canvas.height = h;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        canvas.toBlob(function (blob) {
                            if (!blob) { reject(new Error('convert failed')); return; }
                            var newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                            var newFile = new File([blob], newName, { type: 'image/jpeg' });
                            resolve(newFile);
                        }, 'image/jpeg', quality);
                    } catch (err) { reject(err); }
                };
                img.onerror = function () { reject(new Error('image load failed')); };
                img.src = e.target.result;
            };
            reader.onerror = function () { reject(new Error('file read failed')); };
            reader.readAsDataURL(file);
        });
    }

    /* ════════ هل الصيغة تحتاج تحويل؟ ════════ */
    function needsConversion(file) {
        if (!file || !file.type) return false;
        var needConvert = [
            'image/heic', 'image/heif', 'image/avif',
            'image/tiff', 'image/bmp'
        ];
        return needConvert.indexOf(file.type) !== -1;
    }

    /* ════════ الرفع الموحّد ════════ */
    async function upload(file, options) {
        options = options || {};
        if (!file) throw new Error('لا يوجد ملف');

        var type = file.type || '';
        var isVideo = type.indexOf('video/') === 0;
        var isAudio = type.indexOf('audio/') === 0;
        var isImage = type.indexOf('image/') === 0;

        // صور → imgbb (مع تحويل تلقائي عند الحاجة)
        if (isImage) {
            var imgFile = file;
            if (needsConversion(file)) {
                try {
                    imgFile = await convertImageToJpg(file, 1920, 0.88);
                } catch (e) {
                    console.warn('⚠️ conversion failed, trying original:', e);
                }
            }
            return await uploadImgbb(imgFile);
        }

        // فيديو → litterbox (مؤقت) أو catbox (دائم)
        if (isVideo) {
            if (options.temporary) {
                return await uploadLitterbox(file, options.hours || 24);
            }
            try {
                return await uploadCatbox(file);
            } catch (e) {
                console.warn('⚠️ catbox failed, trying 0x0.st:', e.message);
                return await upload0x0(file);
            }
        }

        // صوت → catbox
        if (isAudio) {
            try {
                return await uploadCatbox(file);
            } catch (e) {
                console.warn('⚠️ catbox failed, trying 0x0.st:', e.message);
                return await upload0x0(file);
            }
        }

        throw new Error('نوع غير مدعوم: ' + type);
    }

    /* ════════ التصدير ════════ */
    window.UploadService = {
        upload: upload,
        uploadCatbox: uploadCatbox,
        uploadLitterbox: uploadLitterbox,
        upload0x0: upload0x0,
        uploadImgbb: uploadImgbb,
        convertImageToJpg: convertImageToJpg,
        needsConversion: needsConversion,
        version: 1
    };

    console.log('📤 upload-service.js v1 loaded — catbox + litterbox + 0x0 + imgbb');
})();
