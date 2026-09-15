// ==============================================
// قمر الشام — حزمة الإطارات العملاقة (v1)
// MEGA Frames — 30+ animated frames
// Gaming + Montage + Cinematic + Luxury
// ==============================================
// ✅ يعمل فوق css-frames.js بدون تعارض
// ✅ CSS فقط — لا صور، لا تأخير تحميل
// ✅ GPU accelerated (transform/opacity/filter)
// ==============================================

(function () {
    'use strict';
    if (document.getElementById('qamar-mega-frames')) return;

    const CSS = `

/* ══════════════════════════════════════════════
   أنيميشن أساسية مشتركة
   ══════════════════════════════════════════════ */
@keyframes mSpinCW  { to { transform: rotate(360deg); } }
@keyframes mSpinCCW { to { transform: rotate(-360deg); } }
@keyframes mPulse   { 0%,100% { transform: scale(1); opacity:.9; } 50% { transform: scale(1.06); opacity:1; } }
@keyframes mBright  { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.6); } }
@keyframes mFlicker { 0%,100% { opacity:1; } 45%,55% { opacity:.55; } }
@keyframes mSlideX  { 0% { background-position: 0 0; } 100% { background-position: 200% 0; } }
@keyframes mSlideY  { 0% { background-position: 0 0; } 100% { background-position: 0 200%; } }
@keyframes mBreath  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.09); } }
@keyframes mShake   { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-1px,1px); } 50% { transform: translate(1px,-1px); } 75% { transform: translate(-1px,-1px); } }
@keyframes mRingPulse { 0%,100% { transform: scale(1); opacity:.7; } 50% { transform: scale(1.15); opacity:1; } }
@keyframes mBarShrink { 0% { width: 100%; } 100% { width: 0%; } }

.qcf { position: absolute; inset: -20%; border-radius: 50%; pointer-events: none; z-index: 15; box-sizing: border-box; }


/* ══════════════════════════════════════════════
   🎮 GROUP 1 — GAMING / HUD
   ══════════════════════════════════════════════ */

/* ── 1. نيون ثلاثي ── */
.qcf--g_neon_triple::before,
.qcf--g_neon_triple::after {
    content:''; position:absolute; inset:0; border-radius:50%;
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
}
.qcf--g_neon_triple::before {
    background: conic-gradient(from 0deg, #00f2fe, transparent 25%, #ff007f 50%, transparent 75%, #00f2fe);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 6px #00f2fe) drop-shadow(0 0 12px #ff007f);
}
.qcf--g_neon_triple::after {
    inset: 8%;
    background: conic-gradient(from 180deg, #ff007f, transparent 25%, #00f2fe 50%, transparent 75%, #ff007f);
    animation: mSpinCCW 3s linear infinite;
    filter: drop-shadow(0 0 6px #ff007f) drop-shadow(0 0 12px #00f2fe);
}

/* ── 2. HUD عسكري ── */
.qcf--g_hud_warrior {
    border-radius: 25% !important;
    background:
        linear-gradient(90deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) top / 100% 4px no-repeat,
        linear-gradient(90deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) bottom / 100% 4px no-repeat,
        linear-gradient(180deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) left / 4px 100% no-repeat,
        linear-gradient(180deg, #00ff88 0%, transparent 8%, transparent 92%, #00ff88 100%) right / 4px 100% no-repeat;
    filter: drop-shadow(0 0 8px #00ff88);
    animation: mBright 2s ease-in-out infinite;
}
.qcf--g_hud_warrior::before {
    content:''; position:absolute; inset:-2px; border-radius:25%;
    background:
        radial-gradient(circle at 5% 5%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 95% 5%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 5% 95%, #00ff88 3px, transparent 4px),
        radial-gradient(circle at 95% 95%, #00ff88 3px, transparent 4px);
    filter: drop-shadow(0 0 6px #00ff88);
}

/* ── 3. تسجيل مباشر (REC) ── */
.qcf--g_recording::before {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    background: conic-gradient(from 0deg, #ff0000, #ff0000, transparent 40%, transparent 50%, #ff0000 90%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #ff0000);
}
.qcf--g_recording::after {
    content:''; position:absolute; top:5%; left:50%; width:10px; height:10px; border-radius:50%;
    background: #ff0000;
    transform: translateX(-50%);
    animation: mFlicker 1s steps(2) infinite;
    box-shadow: 0 0 12px #ff0000, 0 0 24px #ff0000;
}

/* ── 4. حدود سينمائية (Film) ── */
.qcf--g_cinematic {
    border-radius: 8% !important;
    border: 3px solid transparent !important;
    background:
        linear-gradient(90deg, #000 15%, transparent 15%, transparent 85%, #000 85%) top / 100% 12% no-repeat,
        linear-gradient(90deg, #000 15%, transparent 15%, transparent 85%, #000 85%) bottom / 100% 12% no-repeat;
    animation: mPulse 3s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255,215,0,0.6));
}
.qcf--g_cinematic::before {
    content:''; position:absolute; inset:0; border-radius:8%;
    background: linear-gradient(180deg,
        transparent 0%, transparent 12%, rgba(255,215,0,0.9) 12.5%, rgba(255,215,0,0.9) 13%,
        transparent 13.5%, transparent 86.5%, rgba(255,215,0,0.9) 87%, rgba(255,215,0,0.9) 87.5%, transparent 88%);
    pointer-events:none;
}

/* ── 5. كاميرا فوكس ── */
.qcf--g_camera_focus {
    border-radius: 20% !important;
}
.qcf--g_camera_focus::before,
.qcf--g_camera_focus::after {
    content:''; position:absolute; width:22%; height:22%;
    border: 2px solid #ffffff;
    filter: drop-shadow(0 0 6px #00f2fe);
}
.qcf--g_camera_focus::before {
    top:-4px; left:-4px;
    border-right: none; border-bottom: none;
    border-top-left-radius: 12px;
}
.qcf--g_camera_focus::after {
    bottom:-4px; right:-4px;
    border-left: none; border-top: none;
    border-bottom-right-radius: 12px;
}

/* ── 6. أركيد ريترو ── */
.qcf--g_arcade::before {
    content:''; position:absolute; inset:0; border-radius:50%;
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

/* ── 7. Glitch RGB ── */
.qcf--g_glitch {
    animation: mShake 0.4s infinite !important;
}
.qcf--g_glitch::before {
    content:''; position:absolute; inset:-2px; border-radius:50%;
    background: conic-gradient(from 0deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ff0000 100%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    filter: drop-shadow(2px 0 0 #ff0000) drop-shadow(-2px 0 0 #00ffff);
}
.qcf--g_glitch::after {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 5px);
    animation: mSlideY 0.5s linear infinite;
}

/* ── 8. طاقة خضراء ── */
.qcf--g_energy::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #39ff14, transparent 30%, #39ff14 60%, transparent 90%, #39ff14);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCW 2s linear infinite;
    filter: drop-shadow(0 0 10px #39ff14) drop-shadow(0 0 20px rgba(57,255,20,0.5));
}
.qcf--g_energy::after {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: radial-gradient(circle, transparent 60%, rgba(57,255,20,0.4) 72%, transparent 85%);
    animation: mPulse 1.5s ease-in-out infinite;
}

/* ── 9. مطر المصفوفة ── */
.qcf--g_matrix::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background:
        repeating-linear-gradient(180deg,
            rgba(0,255,0,0.9) 0, rgba(0,255,0,0.9) 2px,
            transparent 2px, transparent 18px),
        radial-gradient(circle, transparent 55%, rgba(0,255,0,0.15) 70%, transparent 80%);
    -webkit-mask: radial-gradient(circle, transparent 55%, #000 62%, #000 78%, transparent 82%);
    mask: radial-gradient(circle, transparent 55%, #000 62%, #000 78%, transparent 82%);
    animation: mSlideY 2s linear infinite;
    filter: drop-shadow(0 0 6px #00ff00);
}

/* ── 10. ليزر ── */
.qcf--g_laser::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: repeating-conic-gradient(from 0deg,
        transparent 0deg 8deg,
        rgba(255,0,100,0.9) 8deg 10deg,
        transparent 10deg 18deg,
        rgba(255,0,100,0.6) 18deg 20deg);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCCW 1.5s linear infinite;
    filter: drop-shadow(0 0 8px #ff006e);
}


/* ══════════════════════════════════════════════
   🔥 GROUP 2 — MYTHIC / LEGENDARY
   ══════════════════════════════════════════════ */

/* ── 11. نفس التنين ── */
.qcf--m_dragon {
    background: radial-gradient(circle, transparent 60%, rgba(255,60,0,0.25) 75%, transparent 88%);
}
.qcf--m_dragon::before {
    content:''; position:absolute; inset:-4%; border-radius:50%;
    background: conic-gradient(from 0deg,
        #ff2200 0deg, #ff6600 30deg, #ffdd00 60deg, #ff2200 90deg,
        transparent 120deg, #ff2200 180deg, #ffaa00 210deg,
        #ff2200 240deg, transparent 270deg, #ff2200 330deg, #ff2200 360deg);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 65%);
    mask: radial-gradient(circle, transparent 60%, #000 65%);
    animation: mSpinCW 5s linear infinite;
    filter: drop-shadow(0 0 12px #ff4400) drop-shadow(0 0 24px rgba(255,150,0,0.7));
}
.qcf--m_dragon::after {
    content:''; position:absolute; inset:-4%; border-radius:50%;
    background: radial-gradient(ellipse at 50% -10%, rgba(255,120,0,0.7), transparent 40%);
    animation: mFlicker 0.6s steps(2) infinite;
    mix-blend-mode: screen;
}

/* ── 12. الفينيق ── */
.qcf--m_phoenix::before {
    content:''; position:absolute; inset:-8%; border-radius:50%;
    background:
        radial-gradient(ellipse at 15% 30%, rgba(255,200,0,0.9) 0%, rgba(255,80,0,0.6) 30%, transparent 55%),
        radial-gradient(ellipse at 85% 30%, rgba(255,200,0,0.9) 0%, rgba(255,80,0,0.6) 30%, transparent 55%);
    filter: blur(4px) drop-shadow(0 0 15px #ff4400);
    animation: mBreath 2.5s ease-in-out infinite;
}
.qcf--m_phoenix::after {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 90deg, transparent 0%, #ffaa00 20%, transparent 40%, transparent 60%, #ffaa00 80%, transparent 100%);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 65%);
    mask: radial-gradient(circle, transparent 60%, #000 65%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffcc00);
}

/* ── 13. سيد الرعد ── */
.qcf--m_thunder::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background:
        conic-gradient(from 0deg,
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
.qcf--m_thunder::after {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: radial-gradient(circle, transparent 60%, rgba(0,200,255,0.3) 75%, transparent 88%);
    animation: mBright 0.3s steps(2) infinite;
}

/* ── 14. الملاك المقدس ── */
.qcf--m_angel::before {
    content:''; position:absolute; inset:-10% -15% 0 -15%;
    background:
        linear-gradient(45deg, transparent 45%, rgba(255,240,180,0.5) 47%, rgba(255,240,180,0.5) 53%, transparent 55%),
        linear-gradient(-45deg, transparent 45%, rgba(255,240,180,0.5) 47%, rgba(255,240,180,0.5) 53%, transparent 55%),
        linear-gradient(0deg, transparent 45%, rgba(255,240,180,0.4) 47%, rgba(255,240,180,0.4) 53%, transparent 55%);
    background-size: 100% 100%;
    filter: blur(1px) drop-shadow(0 0 15px rgba(255,215,0,0.9));
    animation: mBright 3s ease-in-out infinite;
}
.qcf--m_angel::after {
    content:''; position:absolute; top:-14%; left:50%; transform: translateX(-50%);
    width:50%; height:12%;
    background: radial-gradient(ellipse at center, #fff8dc 0%, #ffd700 40%, transparent 75%);
    border-radius: 50%;
    filter: drop-shadow(0 0 15px #ffd700);
    animation: mPulse 2s ease-in-out infinite;
}

/* ── 15. الإله السماوي ── */
.qcf--m_celestial::before,
.qcf--m_celestial::after {
    content:''; position:absolute; border-radius:50%;
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 65%);
    mask: radial-gradient(circle, transparent 62%, #000 65%);
}
.qcf--m_celestial::before {
    inset:-8%;
    background:
        radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 2px),
        radial-gradient(circle at 80% 30%, #ffd700 1px, transparent 2px),
        radial-gradient(circle at 40% 80%, #ffffff 1.5px, transparent 2.5px),
        radial-gradient(circle at 90% 70%, #87ceeb 1px, transparent 2px),
        conic-gradient(from 0deg, #1a0033, #6a0dad, #da70d6, #6a0dad, #1a0033);
    animation: mSpinCW 8s linear infinite, mBright 3s ease-in-out infinite;
    filter: drop-shadow(0 0 12px #da70d6);
}
.qcf--m_celestial::after {
    inset:0;
    background: conic-gradient(from 90deg, transparent, #ffffff 15%, transparent 30%, transparent 70%, #ffffff 85%, transparent);
    animation: mSpinCCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #ffffff);
}

/* ── 16. حاجب الجحيم ── */
.qcf--m_reaper::before {
    content:''; position:absolute; inset:-5%; border-radius:50%;
    background: conic-gradient(from 0deg,
        #000 0deg, #4a0000 40deg, #8b0000 80deg, #000 120deg,
        #000 180deg, #4a0000 220deg, #8b0000 260deg, #000 300deg, #000 360deg);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 66%);
    mask: radial-gradient(circle, transparent 62%, #000 66%);
    animation: mSpinCW 6s linear infinite;
    filter: drop-shadow(0 0 10px #8b0000);
}
.qcf--m_reaper::after {
    content:''; position:absolute; inset:0;
    background:
        radial-gradient(circle at 35% 45%, #ff0000 3px, transparent 4px),
        radial-gradient(circle at 65% 45%, #ff0000 3px, transparent 4px);
    filter: drop-shadow(0 0 6px #ff0000);
    animation: mFlicker 1s steps(3) infinite;
}

/* ── 17. درع التيتان ── */
.qcf--m_titan::before {
    content:''; position:absolute; inset:-3%; border-radius:50%;
    background:
        repeating-conic-gradient(from 0deg, #c0c0c0 0deg 8deg, #4a4a4a 8deg 16deg);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 66%);
    mask: radial-gradient(circle, transparent 62%, #000 66%);
    animation: mSpinCW 20s linear infinite;
    filter: drop-shadow(0 0 8px #c0c0c0);
}
.qcf--m_titan::after {
    content:''; position:absolute; inset:-3%;
    background:
        radial-gradient(circle at 0% 50%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 100% 50%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 50% 0%, #ffd700 2px, transparent 3px),
        radial-gradient(circle at 50% 100%, #ffd700 2px, transparent 3px);
    filter: drop-shadow(0 0 6px #ffd700);
    animation: mRingPulse 2s ease-in-out infinite;
}

/* ── 18. فراغ الشيطان ── */
.qcf--m_void::before {
    content:''; position:absolute; inset:-12%; border-radius:50%;
    background: radial-gradient(circle, transparent 40%, #000 55%, #1a0033 70%, #000 85%, transparent 100%);
    filter: blur(6px) drop-shadow(0 0 20px #4a0080);
    animation: mPulse 3s ease-in-out infinite;
}
.qcf--m_void::after {
    content:''; position:absolute; inset:0;
    background:
        radial-gradient(circle at 30% 50%, #ff0000 4px, transparent 6px),
        radial-gradient(circle at 70% 50%, #ff0000 4px, transparent 6px);
    filter: drop-shadow(0 0 10px #ff0000) blur(0.5px);
    animation: mFlicker 2s steps(5) infinite;
}

/* ── 19. الإمبراطور ── */
.qcf--m_emperor::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg,
        #ffd700, #ff8c00, #ffd700, #8b0000, #ffd700, #ff8c00, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 22px rgba(255,140,0,0.6));
}
.qcf--m_emperor::after {
    content:''; position:absolute; top:-20%; left:50%; transform: translateX(-50%);
    width:60%; height:30%;
    background: linear-gradient(180deg, #fff8dc 0%, #ffd700 40%, #b8860b 100%);
    clip-path: polygon(0% 100%, 0% 45%, 12% 20%, 20% 45%, 35% 5%, 50% 30%, 65% 5%, 80% 45%, 88% 20%, 100% 45%, 100% 100%);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px #ffd700);
    animation: mBreath 2.5s ease-in-out infinite;
    z-index: 20;
}

/* ── 20. التنين الكوني ── */
.qcf--m_cosmic_serpent::before {
    content:''; position:absolute; inset:-6%; border-radius:50%;
    background: conic-gradient(from 0deg,
        #1a0033, #4a0080, #8a2be2, #da70d6, #ff00ff, #da70d6, #8a2be2, #4a0080, #1a0033);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 63%, #000 78%, transparent 82%);
    mask: radial-gradient(circle, transparent 60%, #000 63%, #000 78%, transparent 82%);
    animation: mSpinCW 6s linear infinite;
    filter: drop-shadow(0 0 12px #8a2be2) drop-shadow(0 0 24px #ff00ff);
}


/* ══════════════════════════════════════════════
   💎 GROUP 3 — LUXURY / GLASS
   ══════════════════════════════════════════════ */

/* ── 21. كريستال ── */
.qcf--l_crystal::before {
    content:''; position:absolute; inset:-2%; border-radius:50%;
    background:
        conic-gradient(from 0deg,
            #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc, #90e0ef, #ffffff);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 5s linear infinite;
    filter: drop-shadow(0 0 8px #90e0ef) drop-shadow(0 0 16px #ffffff);
}
.qcf--l_crystal::after {
    content:''; position:absolute; inset:0;
    background:
        radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 3px),
        radial-gradient(circle at 75% 35%, #ffffff 1.5px, transparent 2.5px),
        radial-gradient(circle at 40% 75%, #ffffff 1px, transparent 2px);
    animation: mPulse 1.5s ease-in-out infinite;
    filter: drop-shadow(0 0 4px #ffffff);
}

/* ── 22. ذهب سائل ── */
.qcf--l_liquid_gold::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background:
        conic-gradient(from 0deg,
            #4a3800, #8b6914, #d4af37, #ffd700, #fff8dc, #ffd700, #d4af37, #8b6914, #4a3800);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 63%);
    mask: radial-gradient(circle, transparent 58%, #000 63%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 22px rgba(255,140,0,0.6));
}
.qcf--l_liquid_gold::after {
    content:''; position:absolute; inset:-3%;
    background: radial-gradient(circle, transparent 65%, rgba(255,215,0,0.35) 78%, transparent 92%);
    animation: mPulse 2.5s ease-in-out infinite;
}

/* ── 23. ياقوت ── */
.qcf--l_ruby::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #4a0000, #8b0000, #dc143c, #ff4466, #fff, #ff4466, #dc143c, #8b0000, #4a0000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #dc143c) drop-shadow(0 0 20px rgba(220,20,60,0.6));
}

/* ── 24. زمرد ── */
.qcf--l_emerald::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #002200, #006600, #00a651, #00d97e, #e0fff0, #00d97e, #00a651, #006600, #002200);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #00d97e);
}

/* ── 25. ياقوت أزرق ── */
.qcf--l_sapphire::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #000040, #000080, #0d47a1, #1e88e5, #90caf9, #1e88e5, #0d47a1, #000080, #000040);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #1e88e5);
}

/* ── 26. أميثيست ── */
.qcf--l_amethyst::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #1a0033, #4a0080, #6a1b9a, #8e24aa, #ce93d8, #8e24aa, #6a1b9a, #4a0080, #1a0033);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 10px #8e24aa);
}

/* ── 27. أوبسيديان ── */
.qcf--l_obsidian::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #000, #1a1a1a, #333, #4a4a4a, #666, #4a4a4a, #333, #1a1a1a, #000);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 4s linear infinite;
    filter: drop-shadow(0 0 8px #666) drop-shadow(0 0 16px #000);
}
.qcf--l_obsidian::after {
    content:''; position:absolute; inset:0;
    background: radial-gradient(circle at 40% 30%, #fff 1px, transparent 2px),
                radial-gradient(circle at 70% 65%, #fff 1px, transparent 2px);
    animation: mPulse 3s ease-in-out infinite;
}

/* ── 28. لؤلؤ ── */
.qcf--l_pearl::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #e0e0e0, #f0f0f0, #fff, #fff8dc, #fff, #f0f0f0, #e0e0e0);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 8s linear infinite;
    filter: drop-shadow(0 0 12px #ffffff) drop-shadow(0 0 24px rgba(255,240,200,0.5));
}

/* ── 29. ماسة متلألئة ── */
.qcf--l_diamond::before {
    content:''; position:absolute; inset:-2%; border-radius:50%;
    background: conic-gradient(from 0deg, #e0fbfc, #90e0ef, #ffffff, #caf0f8, #e0fbfc, #90e0ef, #caf0f8, #ffffff, #e0fbfc);
    -webkit-mask: radial-gradient(circle, transparent 58%, #000 62%);
    mask: radial-gradient(circle, transparent 58%, #000 62%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 12px #90e0ef) drop-shadow(0 0 24px #ffffff);
}
.qcf--l_diamond::after {
    content:''; position:absolute; inset:-6%;
    background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 2px, transparent 3px),
        radial-gradient(circle at 80% 30%, rgba(255,255,255,0.7) 2px, transparent 3px),
        radial-gradient(circle at 30% 80%, rgba(255,255,255,0.8) 1.5px, transparent 2.5px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.6) 1.5px, transparent 2.5px);
    animation: mPulse 1.2s ease-in-out infinite;
}

/* ── 30. تاج الملوك (شامل) ── */
.qcf--l_king_crown::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background: conic-gradient(from 0deg, #ffd700, #8b6914, #ffd700, #8b0000, #ffd700, #8b6914, #ffd700);
    -webkit-mask: radial-gradient(circle, transparent 60%, #000 64%);
    mask: radial-gradient(circle, transparent 60%, #000 64%);
    animation: mSpinCW 3s linear infinite;
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 24px rgba(255,140,0,0.7));
}
.qcf--l_king_crown::after {
    content:''; position:absolute; top:-24%; left:50%; transform: translateX(-50%);
    width:58%; height:34%;
    background: linear-gradient(180deg, #fff8dc 0%, #ffd700 30%, #d4af37 70%, #8b6914 100%);
    clip-path: polygon(0% 100%, 0% 45%, 12% 20%, 20% 45%, 35% 5%, 50% 30%, 65% 5%, 80% 45%, 88% 20%, 100% 45%, 100% 100%);
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 15px #ffd700);
    animation: mBreath 2s ease-in-out infinite;
    z-index: 20;
}

`;

    const style = document.createElement('style');
    style.id = 'qamar-mega-frames';
    style.textContent = CSS;
    document.head.appendChild(style);

    // ══════════════════════════════════════════════
    // تسجيل الإطارات الجديدة في النظام الموجود
    // ══════════════════════════════════════════════
    const MEGA_FRAMES = {
        // Gaming
        g_neon_triple:      { id:'g_neon_triple',    name:'⚡ نيون ثلاثي',    cssClass:'g_neon_triple',    category:'epic',      minRank:'User', price:0 },
        g_hud_warrior:      { id:'g_hud_warrior',    name:'🎯 HUD محارب',     cssClass:'g_hud_warrior',    category:'rare',      minRank:'User', price:0 },
        g_recording:        { id:'g_recording',      name:'🔴 تسجيل مباشر',   cssClass:'g_recording',      category:'rare',      minRank:'User', price:0 },
        g_cinematic:        { id:'g_cinematic',      name:'🎬 سينمائي',       cssClass:'g_cinematic',      category:'epic',      minRank:'User', price:0 },
        g_camera_focus:     { id:'g_camera_focus',   name:'📷 فوكس كاميرا',   cssClass:'g_camera_focus',   category:'rare',      minRank:'User', price:0 },
        g_arcade:           { id:'g_arcade',         name:'🕹️ أركيد',         cssClass:'g_arcade',         category:'epic',      minRank:'User', price:0 },
        g_glitch:           { id:'g_glitch',         name:'📺 جليتش',          cssClass:'g_glitch',         category:'epic',      minRank:'User', price:0 },
        g_energy:           { id:'g_energy',         name:'💚 طاقة',           cssClass:'g_energy',         category:'rare',      minRank:'User', price:0 },
        g_matrix:           { id:'g_matrix',         name:'🟢 المصفوفة',       cssClass:'g_matrix',         category:'epic',      minRank:'User', price:0 },
        g_laser:            { id:'g_laser',          name:'🔫 ليزر',           cssClass:'g_laser',          category:'epic',      minRank:'User', price:0 },

        // Mythic
        m_dragon:           { id:'m_dragon',         name:'🐉 التنين',         cssClass:'m_dragon',         category:'legendary', minRank:'Owner', price:0 },
        m_phoenix:          { id:'m_phoenix',        name:'🔥 الفينيق',        cssClass:'m_phoenix',        category:'legendary', minRank:'Owner', price:0 },
        m_thunder:          { id:'m_thunder',        name:'⚡ سيد الرعد',      cssClass:'m_thunder',        category:'legendary', minRank:'Owner', price:0 },
        m_angel:            { id:'m_angel',          name:'👼 الملاك',         cssClass:'m_angel',          category:'legendary', minRank:'Owner', price:0 },
        m_celestial:        { id:'m_celestial',      name:'🌟 السماوي',        cssClass:'m_celestial',      category:'legendary', minRank:'Owner', price:0 },
        m_reaper:           { id:'m_reaper',         name:'💀 الجحيم',         cssClass:'m_reaper',         category:'legendary', minRank:'Owner', price:0 },
        m_titan:            { id:'m_titan',          name:'🛡️ التيتان',        cssClass:'m_titan',          category:'epic',      minRank:'Owner', price:0 },
        m_void:             { id:'m_void',           name:'👹 الفراغ',         cssClass:'m_void',           category:'legendary', minRank:'Owner', price:0 },
        m_emperor:          { id:'m_emperor',        name:'👑 الإمبراطور',     cssClass:'m_emperor',        category:'legendary', minRank:'King',  price:0 },
        m_cosmic_serpent:   { id:'m_cosmic_serpent', name:'🐍 الأفعى الكونية', cssClass:'m_cosmic_serpent', category:'legendary', minRank:'Owner', price:0 },

        // Luxury
        l_crystal:          { id:'l_crystal',        name:'💎 كريستال',        cssClass:'l_crystal',        category:'epic',      minRank:'User',  price:0 },
        l_liquid_gold:      { id:'l_liquid_gold',    name:'✨ ذهب سائل',       cssClass:'l_liquid_gold',    category:'legendary', minRank:'User',  price:0 },
        l_ruby:             { id:'l_ruby',           name:'❤️ ياقوت',          cssClass:'l_ruby',           category:'epic',      minRank:'User',  price:0 },
        l_emerald:          { id:'l_emerald',        name:'💚 زمرد',           cssClass:'l_emerald',        category:'epic',      minRank:'User',  price:0 },
        l_sapphire:         { id:'l_sapphire',       name:'💙 ياقوت أزرق',     cssClass:'l_sapphire',       category:'epic',      minRank:'User',  price:0 },
        l_amethyst:         { id:'l_amethyst',       name:'💜 أميثيست',        cssClass:'l_amethyst',       category:'epic',      minRank:'User',  price:0 },
        l_obsidian:         { id:'l_obsidian',       name:'🖤 أوبسيديان',      cssClass:'l_obsidian',       category:'epic',      minRank:'User',  price:0 },
        l_pearl:            { id:'l_pearl',          name:'🤍 لؤلؤ',           cssClass:'l_pearl',          category:'rare',      minRank:'User',  price:0 },
        l_diamond:          { id:'l_diamond',        name:'💠 ألماس',          cssClass:'l_diamond',        category:'legendary', minRank:'Owner', price:0 },
        l_king_crown:       { id:'l_king_crown',     name:'👑 تاج الملوك',     cssClass:'l_king_crown',     category:'legendary', minRank:'King',  price:0 }
    };

    if (typeof window.CSS_FRAMES_DATA === 'object' && window.CSS_FRAMES_DATA !== null) {
        Object.assign(window.CSS_FRAMES_DATA, MEGA_FRAMES);
    } else {
        window.CSS_FRAMES_DATA = MEGA_FRAMES;
    }

    console.log('🔥 mega-frames.js loaded — ' + Object.keys(MEGA_FRAMES).length + ' frames');
})();
