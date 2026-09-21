/* ==============================================
   frames-engine.css v3 — نظيف للشات
   ==============================================
   ✅ v3:
     1. إزالة :root { --frame-inset } المكرر
     2. .qf styles (الموطن الأصلي)
     3. تحسينات بصرية طفيفة
   ============================================== */

/* ══════════════════════════════════════════════ */
/* الحاوية الأساسية للإطار                        */
/* ══════════════════════════════════════════════ */
.qf {
    position: absolute;
    inset: var(--frame-inset, -8%);
    pointer-events: none;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
}

.qf img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

/* ══════════════════════════════════════════════ */
/* حركات الإطارات                                 */
/* ══════════════════════════════════════════════ */

/* Royal Glow — توهج ذهبي نابض */
.qf.royal-glow {
    animation: qfRoyalGlow 2.5s ease-in-out infinite;
}
@keyframes qfRoyalGlow {
    0%, 100% {
        filter: drop-shadow(0 0 8px #ffd700)
                drop-shadow(0 0 16px rgba(255, 215, 0, 0.5));
        transform: scale(1);
    }
    50% {
        filter: drop-shadow(0 0 18px #ffd700)
                drop-shadow(0 0 36px rgba(255, 215, 0, 0.9));
        transform: scale(1.02);
    }
}

/* Wing Flutter — رفرفة أجنحة */
.qf.wing-flutter {
    animation: qfWingFlutter 3s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
}
@keyframes qfWingFlutter {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50%      { transform: scale(1.05) rotate(1.5deg); }
}

/* Flame Flicker — لهب متراقص */
.qf.flame-flicker {
    animation: qfFlameFlicker 0.5s steps(2) infinite;
}
@keyframes qfFlameFlicker {
    0% {
        filter: brightness(1) drop-shadow(0 0 10px #ff4400);
        transform: scale(1);
    }
    100% {
        filter: brightness(1.25) drop-shadow(0 0 22px #ffaa00);
        transform: scale(1.015);
    }
}

/* Celestial Spin — دوران سماوي */
.qf.celestial-spin {
    animation: qfCelestialSpin 12s linear infinite;
    filter: drop-shadow(0 0 10px rgba(255, 80, 80, 0.8));
}
@keyframes qfCelestialSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}
