// ==============================================
// قمر الشام — الإطارات الشاملة (v3 MEGA)
// 48 إطار: CSS + Gaming + Mythic + Luxury
// ==============================================
// ✅ يستبدل css-frames.js القديم بالكامل
// ✅ يحمّل qamar-ui.js تلقائياً (الزجاج + إصلاحات UI)
// ✅ لا يحتاج أي تعديل على ملفات أخرى
// ==============================================

(function () {
    'use strict';
    if (document.getElementById('qamar-css-frames-mega')) return;

    // ══════════════════════════════════════════════
    // تحميل ملف UI تلقائياً
    // ══════════════════════════════════════════════
    if (!document.getElementById('qamar-ui-loader')) {
        const s = document.createElement('script');
        s.id = 'qamar-ui-loader';
        s.src = 'qamar-ui.js?v=1';
        s.async = false;
        document.head.appendChild(s);
    }

    const CSS = `

/* ══════════════════════════════════════════════
   الأساس المشترك
   ══════════════════════════════════════════════ */
.qcf {
    position: absolute;
    inset: -18%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 15;
    box-sizing: border-box;
}
.qcf::before, .qcf::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-sizing: border-box;
}

@keyframes qcf-rotate     { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
@keyframes qcf-rotate-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg);    } }
@keyframes qcf-pulse      { 0%,100% { opacity:.6; transform: scale(1);    } 50% { opacity:1;  transform: scale(1.04); } }
@keyframes qcf-glow       { 0%,100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.4) saturate(1.3); } }
@keyframes qcf-breathe    { 0%,100% { transform: scale(1);    } 50% { transform: scale(1.06); } }
@keyframes qcf-heart-beat {
    0%,100% { transform: scale(1); } 15% { transform: scale(1.08); }
    30% { transform: scale(1); } 45% { transform: scale(1.05); } 60% { transform: scale(1); }
}

/* ══════════════════════════════════════════════
   المجموعة الأصلية (18 إطار)
   ══════════════════════════════════════════════ */
.qcf--neon-rotate::before {
    background: conic-gradient(from 0deg, #00f2fe, #ff007f, #00f2fe, #ff007f, #00f2fe);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 6px #00f2fe) drop-shadow(0 0 12px #ff007f);
}
.qcf--neon-rotate::after {
    inset: -8%;
    background: radial-gradient(circle, transparent 60%, rgba(255,0,127,0.25) 70%, transparent 80%);
    animation: qcf-pulse 2s ease-in-out infinite;
}
.qcf--royal-gold::before {
    background: conic-gradient(from 0deg, #ffd700, #ff8c00, #ffec8b, #b8860b, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 6s linear infinite;
    filter: drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 18px rgba(255,140,0,0.6));
}
.qcf--royal-gold::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,215,0,0.35) 72%, transparent 82%);
    animation: qcf-glow 3s ease-in-out infinite;
}
.qcf--fire::before {
    background: conic-gradient(from 0deg, #ff4500, #ffcc00, #ff0055, #ff4500, #ffcc00);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 2s linear infinite;
    filter: drop-shadow(0 0 10px #ff4500) drop-shadow(0 0 20px #ffcc00);
}
.qcf--fire::after {
    background: radial-gradient(circle, transparent 60%, rgba(255,69,0,0.5) 70%, transparent 85%);
    animation: qcf-pulse 1.2s ease-in-out infinite;
    mix-blend-mode: screen;
}
.qcf--ice::before {
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #caf0f8, #ffffff, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 15px #ffffff);
}
.qcf--ice::after {
    background: radial-gradient(circle, transparent 62%, rgba(144,224,239,0.3) 72%, transparent 82%);
    animation: qcf-glow 2.5s ease-in-out infinite;
}
.qcf--rainbow::before {
    background: conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
}
.qcf--rainbow::after {
    inset: -6%;
    background: radial-gradient(circle, transparent 65%, rgba(255,255,255,0.15) 75%, transparent 85%);
}
.qcf--rose::before {
    background: conic-gradient(from 0deg, #ff69b4, #ff1493, #ffb6c1, #ff69b4);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #ff69b4) drop-shadow(0 0 16px rgba(255,20,147,0.6));
}
.qcf--rose::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,105,180,0.35) 72%, transparent 82%);
    animation: qcf-breathe 2s ease-in-out infinite;
}
.qcf--emerald::before {
    background: conic-gradient(from 0deg, #00ff88, #00cc66, #aaffdd, #00ff88);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 8px #00ff88);
}
.qcf--emerald::after {
    background: radial-gradient(circle, transparent 62%, rgba(0,255,136,0.3) 72%, transparent 82%);
    animation: qcf-glow 2.5s ease-in-out infinite;
}
.qcf--royal-purple::before {
    background: conic-gradient(from 0deg, #a855f7, #7c3aed, #c084fc, #a855f7);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 5s linear infinite;
    filter: drop-shadow(0 0 10px #a855f7) drop-shadow(0 0 20px rgba(124,58,237,0.5));
}
.qcf--royal-purple::after {
    background: radial-gradient(circle, transparent 62%, rgba(168,85,247,0.35) 72%, transparent 82%);
    animation: qcf-pulse 2.5s ease-in-out infinite;
}
.qcf--silver::before {
    background: conic-gradient(from 0deg, #ffffff, #c0c0c0, #ffffff, #e8e8e8, #ffffff);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(192,192,192,0.6));
}
.qcf--dark-red::before {
    background: conic-gradient(from 0deg, #000000, #ff0000, #000000, #cc0000, #000000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 4s linear infinite;
    filter: drop-shadow(0 0 10px #ff0000);
}
.qcf--dark-red::after {
    background: radial-gradient(circle, transparent 62%, rgba(255,0,0,0.3) 72%, transparent 82%);
    animation: qcf-pulse 1.5s ease-in-out infinite;
}
.qcf--bronze::before {
    background: conic-gradient(from 0deg, #cd7f32, #a0522d, #daa520, #cd7f32);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 6s linear infinite;
    filter: drop-shadow(0 0 8px #cd7f32);
}
.qcf--diamond::before {
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 16px #ffffff);
}
.qcf--diamond::after {
    inset: -6%;
    background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 1px, transparent 2px),
        radial-gradient(circle at 80% 30%, rgba(255,255,255,0.6) 1px, transparent 2px),
        radial-gradient(circle at 30% 80%, rgba(255,255,255,0.7) 1px, transparent 2px);
    animation: qcf-pulse 1.5s ease-in-out infinite;
}
.qcf--toxic::before {
    background: conic-gradient(from 0deg, #39ff14, #00ff00, #ccff00, #39ff14);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 10px #39ff14) drop-shadow(0 0 20px rgba(0,255,0,0.5));
}
.qcf--toxic::after {
    background: radial-gradient(circle, transparent 62%, rgba(57,255,20,0.3) 72%, transparent 82%);
    animation: qcf-pulse 1.2s ease-in-out infinite;
}
.qcf--galaxy::before {
    background: conic-gradient(from 0deg, #1a2a6c, #b21f1f, #fdbb2d, #1a2a6c, #b21f1f);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 8s linear infinite;
    filter: drop-shadow(0 0 12px rgba(178,31,31,0.7));
}
.qcf--galaxy::after {
    background: radial-gradient(circle, transparent 62%, rgba(26,42,108,0.5) 72%, transparent 85%);
    animation: qcf-glow 4s ease-in-out infinite;
}
.qcf--dual-neon::before {
    background: conic-gradient(from 0deg, #00f2fe, #00f2fe, transparent, transparent);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 3s linear infinite;
    filter: drop-shadow(0 0 8px #00f2fe);
}
.qcf--dual-neon::after {
    inset: 8%;
    background: conic-gradient(from 180deg, #ff007f, #ff007f, transparent, transparent);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate-rev 3s linear infinite;
    filter: drop-shadow(0 0 8px #ff007f);
}
.qcf--heart::before {
    background: conic-gradient(from 0deg, #ff1493, #ff69b4, #ff1493);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%);
    mask: radial-gradient(circle, transparent 60%, #000 63%);
    filter: drop-shadow(0 0 10px #ff1493) drop-shadow(0 0 20px #ff69b4);
    animation: qcf-heart-beat 1.2s ease-in-out infinite;
}
.qcf--golden-serpent::before {
    background: conic-gradient(from 0deg, #ffd700, transparent 30%, #ffd700, transparent 70%, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 61%);
    mask: radial-gradient(circle, transparent 58%, #000 61%);
    animation: qcf-rotate 1.5s linear infinite;
    filter: drop-shadow(0 0 12px #ffd700) drop-shadow(0 0 24px rgba(255,140,0,0.7));
}
.qcf--blue-flame::before {
    background: conic-gradient(from 0deg, #0080ff, #00f2fe, #4facfe, #0080ff);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: qcf-rotate 2s linear infinite;
    filter: drop-shadow(0 0 10px #00f2fe) drop-shadow(0 0 20px #0080ff);
}
.qcf--blue-flame::after {
    background: radial-gradient(circle, transparent 60%, rgba(0,128,255,0.4) 70%, transparent 85%);
    animation: qcf-pulse 1.3s ease-in-out infinite;
    mix-blend-mode: screen;
}

/* ══════════════════════════════════════════════
   GROUP 1 — GAMING / HUD
   ══════════════════════════════════════════════ */
@keyframes mSpinCW  { to { transform: rotate(360deg);  } }
@keyframes mSpinCCW { to { transform: rotate(-360deg); } }
@keyframes mPulse   { 0%,100% { transform: scale(1); opacity:.9; } 50% { transform: scale(1.06); opacity:1; } }
@keyframes mBright  { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.6); } }
@keyframes mFlicker { 0%,100% { opacity:1; } 45%,55% { opacity:.55; } }
@keyframes mSlideY  { 0% { background-position: 0 0; } 100% { background-position: 0 200%; } }
@keyframes mBreath  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.09); } }
@keyframes mShake   { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-1px,1px); } 50% { transform: translate(1px,-1px); } 75% { transform: translate(-1px,-1px); } }
@keyframes mRingPulse { 0%,100% { transform: scale(1); opacity:.7; } 50% { transform: scale(1.15); opacity:1; } }

.qcf--g-neon-triple::before,
.qcf--g-neon-triple::after {
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
}
.qcf--g-neon-triple::before {
    background: conic-gradient(from 0deg, #00f2fe, transparent 25%, #ff007f 50%, transparent 75%, #00f2fe);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 6px #00f2fe) drop-shadow(0 0 12px #ff007f);
}
.qcf--g-neon-triple::after {
    inset: 8%;
    background: conic-gradient(from 180deg, #ff007f, transparent 25%, #00f2fe 50%, transparent 75%, #ff007f);
    animation: mSpinCCW 3s linear infinite;
    filter: drop-shadow(0 0 6px #ff007f) drop-shadow(0 0 12px #00f2fe);
}
.qcf--g-hud-warrior {
    border-radius: 25%;
    background:
        linear-gradient(90deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) top / 100% 4px no-repeat,
        linear-gradient(90deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) bottom / 100% 4px no-repeat,
        linear-gradient(180deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) left / 4px 100% no-repeat,
        linear-gradient(180deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) right / 4px 100% no-repeat;
    filter: drop-shadow(0 0 8px #00ff88);
    animation: mBright 2s ease-in-out infinite;
}
.qcf--g-hud-warrior::before {
    inset: -2px;
    border-radius: 25%;
    background:
        radial-gradient(circle at 5% 5%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 95% 5%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 5% 95%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 95% 95%, #00ff88 3px, transparent 4px);
    filter: drop-shadow(0 0 6px #00ff88);
}
.qcf--g-recording::before {
    inset: -3px;
    background: conic-gradient(from 0deg, #ff0000, #ff0000, transparent 40%, transparent 50%, #ff0000 90%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #ff0000);
}
.qcf--g-recording::after {
    inset: auto;
    top: 5%; left: 50%;
    width: 10px; height: 10px;
    background: #ff0000;
    transform: translateX(-50%);
    animation: mFlicker 1s steps(2) infinite;
    box-shadow: 0 0 12px #ff0000, 0 0 24px #ff0000;
}
.qcf--g-cinematic {
    border-radius: 8%;
    background:
        linear-gradient(90deg, #000 15%, transparent 15%, transparent 85%, #000 85%) top / 100% 12% no-repeat,
        linear-gradient(90deg, #000 15%, transparent 15%, transparent 85%, #000 85%) bottom / 100% 12% no-repeat;
    animation: mPulse 3s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255,215,0,0.6));
}
.qcf--g-cinematic::before {
    border-radius: 8%;
    background: linear-gradient(180deg,
        transparent 0%, transparent 12%, rgba(255,215,0,0.9) 12.5%, rgba(255,215,0,0.9) 13%,
        transparent 13.5%, transparent 86.5%, rgba(255,215,0,0.9) 87%, rgba(255,215,0,0.9) 87.5%, transparent 88%);
}
.qcf--g-camera-focus { border-radius: 20%; }
.qcf--g-camera-focus::before,
.qcf--g-camera-focus::after {
    inset: auto;
    width: 22%; height: 22%;
    border: 2px solid #ffffff;
    filter: drop-shadow(0 0 6px #00f2fe);
}
.qcf--g-camera-focus::before {
    top: -4px; left: -4px;
    border-right: none; border-bottom: none;
    border-top-left-radius: 12px;
}
.qcf--g-camera-focus::after {
    bottom: -4px; right: -4px;
    border-left: none; border-top: none;
    border-bottom-right-radius: 12px;
}
.qcf--g-arcade::before {
    background: repeating-linear-gradient(0deg,
        #ff0000 0, #ff0000 3px, transparent 3px, transparent 6px,
        #ffff00 6px, #ffff00 9px, transparent 9px, transparent 12px,
        #00ff00 12px, #00ff00 15px, transparent 15px, transparent 18px,
        #00ffff 18px, #00ffff 21px, transparent 21px, transparent 24px);
    -webkit-mask: radial-gradient(circle, transparent 55%, #000 60%, #000 75%, transparent 78%);
    mask: radial-gradient(circle, transparent 55%, #000 60%, #000 75%, transparent 78%);
    animation: mSpinCW 8s linear infinite;
    filter: drop-shadow(0 0 6px #ff0000);
}
.qcf--g-glitch { animation: mShake 0.4s infinite; }
.qcf--g-glitch::before {
    inset: -2px;
    background: conic-gradient(from 0deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ff0000 100%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    filter: drop-shadow(2px 0 0 #ff0000) drop-shadow(-2px 0 0 #00ffff);
}
.qcf--g-glitch::after {
    background: repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 5px);
    animation: mSlideY 0.5s linear infinite;
}
.qcf--g-energy::before {
    background: conic-gradient(from 0deg, #39ff14, transparent 30%, #39ff14 60%, transparent 90%, #39ff14);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCW 2s linear infinite;
    filter: drop-shadow(0 0 10px #39ff14) drop-shadow(0 0 20px rgba(57,255,20,0.5));
}
.qcf--g-energy::after {
    background: radial-gradient(circle, transparent 60%, rgba(57,255,20,0.4) 72%, transparent 85%);
    animation: mPulse 1.5s ease-in-out infinite;
}
.qcf--g-matrix::before {
    background:
        repeating-linear-gradient(180deg, rgba(0,255,0,0.9) 0, rgba(0,255,0,0.9) 2px, transparent 2px, transparent 18px),
        radial-gradient(circle, transparent 55%, rgba(0,255,0,0.15) 70%, transparent 80%);
    -webkit-mask: radial-gradient(circle, transparent 55%, #000 62%, #000 78%, transparent 82%);
    mask: radial-gradient(circle, transparent 55%, #000 62%, #000 78%, transparent 82%);
    animation: mSlideY 2s linear infinite;
    filter: drop-shadow(0 0 6px #00ff00);
}
.qcf--g-laser::before {
    background: repeating-conic-gradient(from 0deg,
        transparent 0deg 8deg, rgba(255,0,100,0.9) 8deg 10deg,
        transparent 10deg 18deg, rgba(255,0,100,0.6) 18deg 20deg);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCCW 1.5s linear infinite;
    filter: drop-shadow(0 0 8px #ff006e);
}

/* ══════════════════════════════════════════════
   GROUP 2 — MYTHIC / LEGENDARY
   ══════════════════════════════════════════════ */
.qcf--m-dragon {
    background: radial-gradient(circle, transparent 60%, rgba(255,60,0,0.25) 75%, transparent 88%);
}
.qcf--m-dragon::before {
    inset: -4%;
    background: conic-gradient(from 0deg,
        #ff2200 0deg, #ff6600 30deg, #ffdd00 60deg, #ff2200 90deg,
        transparent 120deg, #ff2200 180deg, #ffaa00 210deg,
        #ff2200 240deg, transparent 270deg, #ff2200 330deg, #ff2200 360deg);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 65%);
    mask: radial-gradient(circle, transparent 60%, #000 65%);
    animation: mSpinCW 5s linear infinite;
    filter: drop-shadow(0 0 12px #ff4400) drop-shadow(0 0 24px rgba(255,150,0,0.7));
}
.qcf--m-dragon::after {
    inset: -4%;
    background: radial-gradient(ellipse at 50% -10%, rgba(255,120,0,0.7), transparent 40%);
    animation: mFlicker 0.6s steps(2) infinite;
    mix-blend-mode: screen;
}
.qcf--m-phoenix::before {
    inset: -8%;
    background:
        radial-gradient(ellipse at 15% 30%, rgba(255,200,0,0.9) 0%, rgba(255,80,0,0.6) 30%, transparent 55%),
        radial-gradient(ellipse at 85% 30%, rgba(255,200,0,0.9) 0%, rgba(255,80,0,0.6) 30%, transparent 55%);
    filter: blur(4px) drop-shadow(0 0 15px #ff4400);
    animation: mBreath 2.5s ease-in-out infinite;
}
.qcf--m-phoenix::after {
    background: conic-gradient(from 90deg, transparent 0%, #ffaa00 20%, transparent 40%, transparent 60%, #ffaa00 80%, transparent 100%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 65%);
    mask: radial-gradient(circle, transparent 60%, #000 65%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffcc00);
}
.qcf--m-thunder::before {
    background: conic-gradient(from 0deg,
        transparent 0deg 20deg, #ffffff 20deg 21deg,
        transparent 21deg 90deg, #00ccff 90deg 91.5deg,
        transparent 91.5deg 180deg, #ffffff 180deg 181deg,
        transparent 181deg 250deg, #00ccff 250deg 252deg,
        transparent 252deg 360deg);
    -webkit-mask: radial-gradient(circle, transparent 55%, #000 60%);
    mask: radial-gradient(circle, transparent 55%, #000 60%);
    animation: mSpinCW 1.2s steps(8) infinite;
    filter: drop-shadow(0 0 10px #00ccff) drop-shadow(0 0 20px #ffffff);
}
.qcf--m-thunder::after {
    background: radial-gradient(circle, transparent 60%, rgba(0,200,255,0.3) 75%, transparent 88%);
    animation: mBright 0.3s steps(2) infinite;
}
.qcf--m-angel::before {
    inset: -10% -15% 0 -15%;
    background:
        linear-gradient(45deg,  transparent 45%, rgba(255,240,180,0.5) 47%, rgba(255,240,180,0.5) 53%, transparent 55%),
        linear-gradient(-45deg, transparent 45%, rgba(255,240,180,0.5) 47%, rgba(255,240,180,0.5) 53%, transparent 55%),
        linear-gradient(0deg,   transparent 45%, rgba(255,240,180,0.4) 47%, rgba(255,240,180,0.4) 53%, transparent 55%);
    filter: blur(1px) drop-shadow(0 0 15px rgba(255,215,0,0.9));
    animation: mBright 3s ease-in-out infinite;
}
.qcf--m-angel::after {
    inset: auto;
    top: -14%; left: 50%;
    transform: translateX(-50%);
    width: 50%; height: 12%;
    background: radial-gradient(ellipse at center, #fff8dc 0%, #ffd700 40%, transparent 75%);
    filter: drop-shadow(0 0 15px #ffd700);
    animation: mPulse 2s ease-in-out infinite;
}
.qcf--m-celestial::before {
    inset: -8%;
    background:
        radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 2px),
        radial-gradient(circle at 80% 30%, #ffd700 1px, transparent 2px),
        radial-gradient(circle at 40% 80%, #ffffff 1.5px, transparent 2.5px),
        radial-gradient(circle at 90% 70%, #87ceeb 1px, transparent 2px),
        conic-gradient(from 0deg, #1a0033, #6a0dad, #da70d6, #6a0dad, #1a0033);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
    animation: mSpinCW 8s linear infinite, mBright 3s ease-in-out infinite;
    filter: drop-shadow(0 0 12px #da70d6);
}
.qcf--m-celestial::after {
    background: conic-gradient(from 90deg, transparent, #ffffff 15%, transparent 30%, transparent 70%, #ffffff 85%, transparent);
    animation: mSpinCCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #ffffff);
}
.qcf--m-reaper::before {
    inset: -5%;
    background: conic-gradient(from 0deg,
        #000 0deg, #4a0000 40deg, #8b0000 80deg, #000 120deg,
        #000 180deg, #4a0000 220deg, #8b0000 260deg, #000 300deg, #000 360deg);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 66%);
    mask: radial-gradient(circle, transparent 62%, #000 66%);
    animation: mSpinCW 6s linear infinite;
    filter: drop-shadow(0 0 10px #8b0000);
}
.qcf--m-reaper::after {
    background:
        radial-gradient(circle at 35% 45%, #ff0000 3px, transparent 4px),
        radial-gradient(circle at 65% 45%, #ff0000 3px, transparent 4px);
    filter: drop-shadow(0 0 6px #ff0000);
    animation: mFlicker 1s steps(3) infinite;
}
.qcf--m-titan::before {
    inset: -3%;
    background: repeating-conic-gradient(from 0deg, #c0c0c0 0deg 8deg, #4a4a4a 8deg 16deg);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 66%);
    mask: radial-gradient(circle, transparent 62%, #000 66%);
    animation: mSpinCW 20s linear infinite;
    filter: drop-shadow(0 0 8px #c0c0c0);
}
.qcf--m-titan::after {
    inset: -3%;
    background:
        radial-gradient(circle at 0% 50%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 100% 50%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 50% 0%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 50% 100%, #ffd700 2px, transparent 3px);
    filter: drop-shadow(0 0 6px #ffd700);
    animation: mRingPulse 2s ease-in-out infinite;
}
.qcf--m-void::before {
    inset: -12%;
    background: radial-gradient(circle, transparent 40%, #000 55%, #1a0033 70%, #000 85%, transparent 100%);
    filter: blur(6px) drop-shadow(0 0 20px #4a0080);
    animation: mPulse 3s ease-in-out infinite;
}
.qcf--m-void::after {
    background:
        radial-gradient(circle at 30% 50%, #ff0000 4px, transparent 6px),
        radial-gradient(circle at 70% 50%, #ff0000 4px, transparent 6px);
    filter: drop-shadow(0 0 10px #ff0000) blur(0.5px);
    animation: mFlicker 2s steps(5) infinite;
}
.qcf--m-emperor::before {
    background: conic-gradient(from 0deg, #ffd700, #ff8c00, #ffd700, #8b0000, #ffd700, #ff8c00, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 22px rgba(255,140,0,0.6));
}
.qcf--m-emperor::after {
    inset: auto;
    top: -20%; left: 50%;
    transform: translateX(-50%);
    width: 60%; height: 30%;
    background: linear-gradient(180deg, #fff8dc 0%, #ffd700 40%, #b8860b 100%);
    clip-path: polygon(0% 100%, 0% 45%, 12% 20%, 20% 45%, 35% 5%, 50% 30%, 65% 5%, 80% 45%, 88% 20%, 100% 45%, 100% 100%);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px #ffd700);
    animation: mBreath 2.5s ease-in-out infinite;
    z-index: 20;
}
.qcf--m-cosmic-serpent::before {
    inset: -6%;
    background: conic-gradient(from 0deg, #1a0033, #4a0080, #8a2be2, #da70d6, #ff00ff, #da70d6, #8a2be2, #4a0080, #1a0033);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%, #000 78%, transparent 82%);
    mask: radial-gradient(circle, transparent 60%, #000 63%, #000 78%, transparent 82%);
    animation: mSpinCW 6s linear infinite;
    filter: drop-shadow(0 0 12px #8a2be2) drop-shadow(0 0 24px #ff00ff);
}

/* ══════════════════════════════════════════════
   GROUP 3 — LUXURY / GEMS
   ══════════════════════════════════════════════ */
.qcf--l-crystal::before {
    inset: -2%;
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc, #90e0ef, #ffffff);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 5s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 16px #ffffff);
}
.qcf--l-crystal::after {
    background:
        radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 3px),
        radial-gradient(circle at 75% 35%, #ffffff 1.5px, transparent 2.5px),
        radial-gradient(circle at 40% 75%, #ffffff 1px, transparent 2px);
    animation: mPulse 1.5s ease-in-out infinite;
    filter: drop-shadow(0 0 4px #ffffff);
}
.qcf--l-liquid-gold::before {
    background: conic-gradient(from 0deg, #4a3800, #8b6914, #d4af37, #ffd700, #fff8dc, #ffd700, #d4af37, #8b6914, #4a3800);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 63%);
    mask: radial-gradient(circle, transparent 58%, #000 63%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 22px rgba(255,140,0,0.6));
}
.qcf--l-liquid-gold::after {
    inset: -3%;
    background: radial-gradient(circle, transparent 65%, rgba(255,215,0,0.35) 78%, transparent 92%);
    animation: mPulse 2.5s ease-in-out infinite;
}
.qcf--l-ruby::before {
    background: conic-gradient(from 0deg, #4a0000, #8b0000, #dc143c, #ff4466, #fff, #ff4466, #dc143c, #8b0000, #4a0000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #dc143c) drop-shadow(0 0 20px rgba(220,20,60,0.6));
}
.qcf--l-emerald::before {
    background: conic-gradient(from 0deg, #002200, #006600, #00a651, #00d97e, #e0fff0, #00d97e, #00a651, #006600, #002200);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #00d97e);
}
.qcf--l-sapphire::before {
    background: conic-gradient(from 0deg, #000040, #000080, #0d47a1, #1e88e5, #90caf9, #1e88e5, #0d47a1, #000080, #000040);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #1e88e5);
}
.qcf--l-amethyst::before {
    background: conic-gradient(from 0deg, #1a0033, #4a0080, #6a1b9a, #8e24aa, #ce93d8, #8e24aa, #6a1b9a, #4a0080, #1a0033);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #8e24aa);
}
.qcf--l-obsidian::before {
    background: conic-gradient(from 0deg, #000, #1a1a1a, #333, #4a4a4a, #666, #4a4a4a, #333, #1a1a1a, #000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #666) drop-shadow(0 0 16px #000);
}
.qcf--l-obsidian::after {
    background:
        radial-gradient(circle at 40% 30%, #fff 1px, transparent 2px),
        radial-gradient(circle at 70% 65%, #fff 1px, transparent 2px);
    animation: mPulse 3s ease-in-out infinite;
}
.qcf--l-pearl::before {
    background: conic-gradient(from 0deg, #e0e0e0, #f0f0f0, #fff, #fff8dc, #fff, #f0f0f0, #e0e0e0);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 8s linear infinite;
    filter: drop-shadow(0 0 12px #ffffff) drop-shadow(0 0 24px rgba(255,240,200,0.5));
}
.qcf--l-diamond::before {
    inset: -2%;
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc, #90e0ef, #caf0f8, #ffffff, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 12px #90e0ef) drop-shadow(0 0 24px #ffffff);
}
.qcf--l-diamond::after {
    inset: -6%;
    background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 2px, transparent 3px),
        radial-gradient(circle at 80% 30%, rgba(255,255,255,0.7) 2px, transparent 3px),
        radial-gradient(circle at 30% 80%, rgba(255,255,255,0.8) 1.5px, transparent 2.5px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.6) 1.5px, transparent 2.5px);
    animation: mPulse 1.2s ease-in-out infinite;
}
.qcf--l-king-crown::before {
    background: conic-gradient(from 0deg, #ffd700, #8b6914, #ffd700, #8b0000, #ffd700, #8b6914, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 24px rgba(255,140,0,0.7));
}
.qcf--l-king-crown::after {
    inset: auto;
    top: -24%; left: 50%;
    transform: translateX(-50%);
    width: 58%; height: 34%;
    background: linear-gradient(180deg, #fff8dc 0%, #ffd700 30%, #d4af37 70%, #8b6914 100%);
    clip-path: polygon(0% 100%, 0% 45%, 12% 20%, 20% 45%, 35% 5%, 50% 30%, 65% 5%, 80% 45%, 88% 20%, 100% 45%, 100% 100%);
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 15px #ffd700);
    animation: mBreath 2s ease-in-out infinite;
    z-index: 20;
}

/* ══════════════════════════════════════════════
   Mobile optimization
   ══════════════════════════════════════════════ */
@media (max-width: 480px) {
    .qcf--galaxy::before,
    .qcf--m-celestial::before { animation-duration: 12s; }
    .qcf--rainbow::before { animation-duration: 6s; }
}
`;

    const style = document.createElement('style');
    style.id = 'qamar-css-frames-mega';
    style.textContent = CSS;
    document.head.appendChild(style);
    console.log('✅ CSS Frames MEGA injected — 48 frames');

    // ══════════════════════════════════════════════
    // البيانات الكاملة لكل الإطارات
    // ══════════════════════════════════════════════
    const ALL_FRAMES = {
        // ── المجموعة الأصلية ──
        css_neon_rotate:    { id:'css_neon_rotate',    name:'⚡ نيون دوّار',     cssClass:'neon-rotate',     category:'rare',      minRank:'Owner', price:500 },
        css_royal_gold:     { id:'css_royal_gold',     name:'👑 ذهبي ملكي',     cssClass:'royal-gold',      category:'legendary', minRank:'Owner', price:5000 },
        css_fire:           { id:'css_fire',           name:'🔥 نار ملتهبة',    cssClass:'fire',            category:'epic',      minRank:'Owner', price:2000 },
        css_ice:            { id:'css_ice',            name:'❄️ جليد',           cssClass:'ice',             category:'rare',      minRank:'Owner', price:800 },
        css_rainbow:        { id:'css_rainbow',        name:'🌈 قوس قزح',       cssClass:'rainbow',         category:'epic',      minRank:'Owner', price:1500 },
        css_rose:           { id:'css_rose',           name:'🌹 وردي رومانسي',  cssClass:'rose',            category:'rare',      minRank:'Owner', price:600 },
        css_emerald:        { id:'css_emerald',        name:'💚 زمردي',          cssClass:'emerald',         category:'rare',      minRank:'Owner', price:900 },
        css_royal_purple:   { id:'css_royal_purple',   name:'💜 بنفسجي ملكي',   cssClass:'royal-purple',    category:'epic',      minRank:'Owner', price:1800 },
        css_silver:         { id:'css_silver',         name:'🥈 فضي لامع',      cssClass:'silver',          category:'common',    minRank:'User',  price:300 },
        css_dark_red:       { id:'css_dark_red',       name:'🩸 أسود-أحمر',     cssClass:'dark-red',        category:'epic',      minRank:'Owner', price:2500 },
        css_bronze:         { id:'css_bronze',         name:'🥉 برونزي',         cssClass:'bronze',          category:'common',    minRank:'User',  price:400 },
        css_diamond:        { id:'css_diamond',        name:'💎 ألماس متلألئ',   cssClass:'diamond',         category:'legendary', minRank:'Owner', price:8000 },
        css_toxic:          { id:'css_toxic',          name:'☢️ أخضر سام',       cssClass:'toxic',           category:'epic',      minRank:'Owner', price:1700 },
        css_galaxy:         { id:'css_galaxy',         name:'🌌 جالاكسي',        cssClass:'galaxy',          category:'legendary', minRank:'Owner', price:7000 },
        css_dual_neon:      { id:'css_dual_neon',      name:'⚡ نيون مزدوج',     cssClass:'dual-neon',       category:'epic',      minRank:'Owner', price:2200 },
        css_heart:          { id:'css_heart',          name:'💗 نبض القلب',      cssClass:'heart',           category:'rare',      minRank:'Owner', price:700 },
        css_golden_serpent: { id:'css_golden_serpent', name:'🐍 الثعبان الذهبي', cssClass:'golden-serpent',  category:'legendary', minRank:'Owner', price:6000 },
        css_blue_flame:     { id:'css_blue_flame',     name:'🔵 لهب أزرق',       cssClass:'blue-flame',      category:'epic',      minRank:'Owner', price:1900 },

        // ── GAMING ──
        g_neon_triple:      { id:'g_neon_triple',      name:'⚡ نيون ثلاثي',     cssClass:'g-neon-triple',   category:'epic',      minRank:'User',  price:0 },
        g_hud_warrior:      { id:'g_hud_warrior',      name:'🎯 HUD محارب',      cssClass:'g-hud-warrior',   category:'rare',      minRank:'User',  price:0 },
        g_recording:        { id:'g_recording',        name:'🔴 تسجيل مباشر',    cssClass:'g-recording',     category:'rare',      minRank:'User',  price:0 },
        g_cinematic:        { id:'g_cinematic',        name:'🎬 سينمائي',        cssClass:'g-cinematic',     category:'epic',      minRank:'User',  price:0 },
        g_camera_focus:     { id:'g_camera_focus',     name:'📷 فوكس كاميرا',    cssClass:'g-camera-focus',  category:'rare',      minRank:'User',  price:0 },
        g_arcade:           { id:'g_arcade',           name:'🕹️ أركيد',          cssClass:'g-arcade',        category:'epic',      minRank:'User',  price:0 },
        g_glitch:           { id:'g_glitch',           name:'📺 جليتش',           cssClass:'g-glitch',        category:'epic',      minRank:'User',  price:0 },
        g_energy:           { id:'g_energy',           name:'💚 طاقة',            cssClass:'g-energy',        category:'rare',      minRank:'User',  price:0 },
        g_matrix:           { id:'g_matrix',           name:'🟢 المصفوفة',        cssClass:'g-matrix',        category:'epic',      minRank:'User',  price:0 },
        g_laser:            { id:'g_laser',            name:'🔫 ليزر',            cssClass:'g-laser',         category:'epic',      minRank:'User',  price:0 },

        // ── MYTHIC ──
        m_dragon:           { id:'m_dragon',           name:'🐉 التنين',          cssClass:'m-dragon',         category:'legendary', minRank:'Owner', price:0 },
        m_phoenix:          { id:'m_phoenix',          name:'🔥 الفينيق',         cssClass:'m-phoenix',        category:'legendary', minRank:'Owner', price:0 },
        m_thunder:          { id:'m_thunder',          name:'⚡ سيد الرعد',       cssClass:'m-thunder',        category:'legendary', minRank:'Owner', price:0 },
        m_angel:            { id:'m_angel',            name:'👼 الملاك',          cssClass:'m-angel',          category:'legendary', minRank:'Owner', price:0 },
        m_celestial:        { id:'m_celestial',        name:'🌟 السماوي',         cssClass:'m-celestial',      category:'legendary', minRank:'Owner', price:0 },
        m_reaper:           { id:'m_reaper',           name:'💀 الجحيم',          cssClass:'m-reaper',         category:'legendary', minRank:'Owner', price:0 },
        m_titan:            { id:'m_titan',            name:'🛡️ التيتان',         cssClass:'m-titan',          category:'epic',      minRank:'Owner', price:0 },
        m_void:             { id:'m_void',             name:'👹 الفراغ',          cssClass:'m-void',           category:'legendary', minRank:'Owner', price:0 },
        m_emperor:          { id:'m_emperor',          name:'👑 الإمبراطور',      cssClass:'m-emperor',        category:'legendary', minRank:'King',  price:0 },
        m_cosmic_serpent:   { id:'m_cosmic_serpent',   name:'🐍 الأفعى الكونية',  cssClass:'m-cosmic-serpent', category:'legendary', minRank:'Owner', price:0 },

        // ── LUXURY ──
        l_crystal:          { id:'l_crystal',          name:'💎 كريستال',         cssClass:'l-crystal',        category:'epic',      minRank:'User',  price:0 },
        l_liquid_gold:      { id:'l_liquid_gold',      name:'✨ ذهب سائل',        cssClass:'l-liquid-gold',    category:'legendary', minRank:'User',  price:0 },
        l_ruby:             { id:'l_ruby',             name:'❤️ ياقوت',           cssClass:'l-ruby',           category:'epic',      minRank:'User',  price:0 },
        l_emerald:          { id:'l_emerald',          name:'💚 زمرد',            cssClass:'l-emerald',        category:'epic',      minRank:'User',  price:0 },
        l_sapphire:         { id:'l_sapphire',         name:'💙 ياقوت أزرق',      cssClass:'l-sapphire',       category:'epic',      minRank:'User',  price:0 },
        l_amethyst:         { id:'l_amethyst',         name:'💜 أميثيست',         cssClass:'l-amethyst',       category:'epic',      minRank:'User',  price:0 },
        l_obsidian:         { id:'l_obsidian',         name:'🖤 أوبسيديان',       cssClass:'l-obsidian',       category:'epic',      minRank:'User',  price:0 },
        l_pearl:            { id:'l_pearl',            name:'🤍 لؤلؤ',            cssClass:'l-pearl',          category:'rare',      minRank:'User',  price:0 },
        l_diamond:          { id:'l_diamond',          name:'💠 ألماس',           cssClass:'l-diamond',        category:'legendary', minRank:'Owner', price:0 },
        l_king_crown:       { id:'l_king_crown',       name:'👑 تاج الملوك',      cssClass:'l-king-crown',     category:'legendary', minRank:'King',  price:0 }
    };

    window.CSS_FRAMES_DATA = ALL_FRAMES;

    // ══════════════════════════════════════════════
    // دالة تطبيق الإطار
    // ══════════════════════════════════════════════
    window.applyCSSFrame = function (container, frameId) {
        if (!container) return;
        container.querySelectorAll('.qcf').forEach(el => el.remove());
        const frame = ALL_FRAMES[frameId];
        if (!frame) return;
        const el = document.createElement('div');
        el.className = 'qcf qcf--' + frame.cssClass;
        el.setAttribute('data-frame-id', frameId);
        container.appendChild(el);
    };

    console.log('🔥 css-frames.js MEGA — ' + Object.keys(ALL_FRAMES).length + ' frames ready');
})();
