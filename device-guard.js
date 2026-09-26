// ==============================================
// device-guard.js v3 (TEST)
// ==============================================
// ✅ v3 (فوق v2):
//   1. لم يعد يمنع الحساب الثاني — يدخل بسلام
//   2. يسجّل إشعار "دخول من نفس الجهاز" للملك
//   3. يعطي الملك قائمة كل الحسابات على نفس البصمة
//   4. الحظر يدوي فقط (من تبويب المكررة)
//   v2 محفوظ: بصمة ثابتة + لا بطارية + media كفئات
// ==============================================

(function () {
    'use strict';
    if (window.__deviceGuardV3) return;
    window.__deviceGuardV3 = true;

    var DG = {
        deviceId: null,
        ipHash: null,
        ip: null,
        ready: false,
        _afterAuthDone: {},
        _forceLogout: false,
        _watchingBanned: false
    };

    /* ═══ Hash ═══ */
    function _hash(str) {
        if (!str) return '';
        var h1 = 5381, h2 = 52711;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            h1 = ((h1 * 33) ^ c) >>> 0;
            h2 = ((h2 * 31) ^ c) >>> 0;
        }
        var h3 = (h1 ^ h2) >>> 0;
        var out = h1.toString(36) + h2.toString(36) + h3.toString(36) + ((h1 + h2 + h3) >>> 0).toString(36);
        return 'dg_' + out.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 32);
    }

    /* ═══ بناء بصمة الجهاز (v3 - بدون بطارية) ═══ */
    async function _buildDeviceId() {
        var parts = [];

        try { parts.push(navigator.userAgent || ''); } catch (e) {}
        try { parts.push(navigator.language || ''); } catch (e) {}
        try { parts.push(navigator.platform || ''); } catch (e) {}
        try { parts.push(String(navigator.hardwareConcurrency || 0)); } catch (e) {}
        try { parts.push(String(navigator.deviceMemory || 0)); } catch (e) {}

        try {
            var s = window.screen || {};
            parts.push([s.width || 0, s.height || 0, s.colorDepth || 0, s.pixelDepth || 0].join('x'));
            parts.push(String(window.devicePixelRatio || 1));
        } catch (e) {}

        try {
            parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
        } catch (e) {}

        try {
            var canvas = document.createElement('canvas');
            canvas.width = 220;
            canvas.height = 60;
            var ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.textBaseline = 'top';
                ctx.font = '14px "Arial"';
                ctx.fillStyle = '#f60';
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = '#069';
                ctx.fillText('Qamar🌙 الشام', 2, 15);
                ctx.fillStyle = 'rgba(102,204,0,0.7)';
                ctx.fillText('Qamar🌙 الشام', 4, 17);
                parts.push(canvas.toDataURL().substring(0, 200));
            }
        } catch (e) {}

        try {
            var gl = document.createElement('canvas').getContext('webgl') ||
                     document.createElement('canvas').getContext('experimental-webgl');
            if (gl) {
                var dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) {
                    parts.push(String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || ''));
                    parts.push(String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || ''));
                }
                parts.push(String(gl.getParameter(gl.VERSION) || ''));
                parts.push(String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || ''));
            }
        } catch (e) {}

        try {
            var AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            if (AC) {
                var audioCtx = new AC(1, 44100, 44100);
                var osc = audioCtx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(10000, audioCtx.currentTime);
                var comp = audioCtx.createDynamicsCompressor();
                osc.connect(comp);
                comp.connect(audioCtx.destination);
                osc.start(0);
                var audioHash = await Promise.race([
                    new Promise(function (resolve) {
                        audioCtx.oncomplete = function (e) {
                            try {
                                var buf = e.renderedBuffer.getChannelData(0);
                                var sum = 0;
                                for (var i = 4500; i < 5000; i++) sum += Math.abs(buf[i]);
                                resolve(sum.toString().substring(0, 20));
                            } catch (err) { resolve(''); }
                        };
                        audioCtx.startRendering();
                    }),
                    new Promise(function (r) { setTimeout(function () { r(''); }, 1200); })
                ]);
                parts.push(audioHash);
            }
        } catch (e) {}

        try {
            var fontList = ['Arial','Verdana','Times New Roman','Courier New','Georgia',
                            'Tahoma','Comic Sans MS','Impact','Cairo','Amiri','Roboto',
                            'Helvetica','Monaco','Consolas'];
            var span = document.createElement('span');
            span.style.cssText = 'position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden;';
            span.textContent = 'mmmmmmmmmmlli';
            document.body.appendChild(span);
            var detected = [];
            fontList.forEach(function (f) {
                span.style.fontFamily = 'monospace';
                var base = span.offsetWidth;
                span.style.fontFamily = '"' + f + '", monospace';
                var test = span.offsetWidth;
                if (test !== base) detected.push(f);
            });
            document.body.removeChild(span);
            parts.push(detected.join(','));
        } catch (e) {}

        /* ⚠️ البطارية محذوفة — كانت تجعل البصمة متغيرة */

        try {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                var devs = await Promise.race([
                    navigator.mediaDevices.enumerateDevices(),
                    new Promise(function (r) { setTimeout(function () { r([]); }, 800); })
                ]);
                if (Array.isArray(devs) && devs.length > 0) {
                    var hasAudioIn = devs.some(function (d) { return d.kind === 'audioinput'; });
                    var hasAudioOut = devs.some(function (d) { return d.kind === 'audiooutput'; });
                    var hasVideoIn = devs.some(function (d) { return d.kind === 'videoinput'; });
                    parts.push((hasAudioIn ? '1' : '0') + (hasAudioOut ? '1' : '0') + (hasVideoIn ? '1' : '0'));
                }
            }
        } catch (e) {}

        return _hash(parts.join('|||'));
    }

    /* ═══ Device metadata ═══ */
    function _getDeviceMetadata() {
        var meta = {};
        try { meta.ua = (navigator.userAgent || '').substring(0, 200); } catch (e) {}
        try { meta
