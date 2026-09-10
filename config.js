// ==============================================
// قمر الشام - الإعدادات المشتركة
// Qamar Al Sham - Shared Configuration
// ==============================================

// ====== Firebase Config ======
const firebaseConfig = {
    apiKey: "AIzaSyDOBWW4uACUSShJjwzfpnEzcL3KONZ-6FI",
    authDomain: "qamaralsham.firebaseapp.com",
    databaseURL: "https://qamaralsham-default-rtdb.firebaseio.com",
    projectId: "qamaralsham",
    storageBucket: "qamaralsham.firebasestorage.app",
    messagingSenderId: "1059424590289",
    appId: "1:1059424590289:web:176e82c30c8c7ec4c028f0"
};

// ====== تهيئة Firebase ======
// ⚠️ ملاحظة: هذا القسم يجب أن يبقى هنا لأنه الأساس لكل الملفات
let auth = null;
let db = null;
let storage = null;

try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.database();
        storage = firebase.storage();
        console.log('✅ Firebase initialized');
    } else if (firebase.apps.length) {
        auth = firebase.auth();
        db = firebase.database();
        storage = firebase.storage();
    }
} catch (e) {
    console.error('❌ Firebase init failed:', e);
}

// ====== ثوابت المشروع ======
const QAMAR = {
    // ====== روابط (نسبية أفضل) ======
    PROFILE_URL: 'profile.html',
    INDEX_URL: 'index1.html',
    
    // ====== مستويات الرتب (للمقارنات) ======
    // كل رتبة لها رقم — الأعلى = رقم أكبر
    RANK_LEVELS: {
        'King': 100,
        'Queen': 95,
        'Master Owner': 90,
        'Room Owner': 85,
        'Grand Owner': 80,
        'Owner': 75,
        'Super Admin': 70,
        'Admin': 65,
        'Premium': 60,
        'User': 50
    },
    
    // ====== قائمة الرتب بالترتيب (من الأعلى للأدنى) ======
    RANKS_ORDERED: [
        'King',
        'Queen',
        'Master Owner',
        'Room Owner',
        'Grand Owner',
        'Owner',
        'Super Admin',
        'Admin',
        'Premium',
        'User'
    ],
    
    // ====== دوال الرتب ======
    
    /**
     * هل رتبة a أعلى من رتبة b؟
     */
    isHigherRank: function(rankA, rankB) {
        const levelA = this.RANK_LEVELS[rankA] || 0;
        const levelB = this.RANK_LEVELS[rankB] || 0;
        return levelA > levelB;
    },
    
    /**
     * هل رتبة a أعلى أو تساوي رتبة b؟
     */
    isHigherOrEqual: function(rankA, rankB) {
        const levelA = this.RANK_LEVELS[rankA] || 0;
        const levelB = this.RANK_LEVELS[rankB] || 0;
        return levelA >= levelB;
    },
    
    /**
     * جلب رقم الرتبة
     */
    getRankLevel: function(rank) {
        return this.RANK_LEVELS[rank] || 0;
    },
    
    // ====== الغرف ======
    // visibleTo: 'all' = للجميع | 'royal' = للملك/الملكة | 'owner+' = Owner وما فوق
    //           'grandowner+' = Grand Owner وما فوق | 'jailed' = للمسجونين فقط
    //           'king' = للملك فقط
    // micCount: عدد المايكات في الغرفة
    // allowMic: هل يُسمح باستخدام المايك في الغرفة
    // maxUsers: الحد الأقصى للمستخدمين (null = بلا حد)
    ROOMS: {
        general: { 
            id: 'general', 
            name: 'الروم العام', 
            icon: '🌍', 
            type: 'public',
            visibleTo: 'all',
            micCount: 4,
            allowMic: true,
            maxUsers: null
        },
        quiz: { 
            id: 'quiz', 
            name: 'روم المسابقات', 
            icon: '🎯', 
            type: 'public',
            visibleTo: 'all',
            micCount: 4,
            allowMic: true,
            maxUsers: null
        },
        islamic: { 
            id: 'islamic', 
            name: 'روم الإسلاميات', 
            icon: '🕌', 
            type: 'public',
            visibleTo: 'all',
            micCount: 1,        // ← غرفة الإسلاميات: مايك واحد
            allowMic: true,
            maxUsers: null
        },
        royal: { 
            id: 'royal', 
            name: 'السويت الملكي', 
            icon: '👑', 
            type: 'private',
            visibleTo: 'royal',
            micCount: 2,        // ← السويت: مايكان
            allowMic: true,
            maxUsers: 2         // ← الملك + الملكة + دعوة
        },
        candy: { 
            id: 'candy', 
            name: 'كانديز', 
            icon: '🍫', 
            type: 'public',
            visibleTo: 'all',
            micCount: 4,
            allowMic: true,
            maxUsers: null
        },
        studio: { 
            id: 'studio', 
            name: 'استديو التسجيل', 
            icon: '🎙️', 
            type: 'private',
            visibleTo: 'owner+',
            micCount: 1,        // ← استديو: مايك واحد
            allowMic: true,
            maxUsers: 1,        // ← شخص واحد فقط (باستثناء الملك)
            hasRecording: true, // ← دعم التسجيل
            hasEcho: true,      // ← دعم الإيكو
            hasEqualizer: true  // ← دعم الإيكولايزر
        },
        gaza: { 
            id: 'gaza', 
            name: 'غزة العزة', 
            icon: '🇵🇸', 
            type: 'public',
            visibleTo: 'all',
            micCount: 4,
            allowMic: true,
            maxUsers: null
        },
        sham: { 
            id: 'sham', 
            name: 'ليالي الشام', 
            icon: '🌙', 
            type: 'public',
            visibleTo: 'all',
            micCount: 4,
            allowMic: true,
            maxUsers: null
        },
        bot_training: {
            id: 'bot_training',
            name: 'تدريب البوت',
            icon: '🤖',
            type: 'private',
            visibleTo: 'royal',  // ← الملك + الملكة فقط
            micCount: 0,
            allowMic: false,
            maxUsers: 2,
            invisible: true      // ← لا تظهر في قائمة الغرف العادية
        },
        jail: { 
            id: 'jail', 
            name: 'السجن', 
            icon: '🚔', 
            type: 'private',
            visibleTo: 'jailed', // ← المسجونون فقط
            micCount: 0,
            allowMic: false,
            maxUsers: null
        }
    },
    
    // ====== دوال مساعدة ======
    
    /**
     * هل الغرفة مرئية للمستخدم؟
     */
    isRoomVisible: function(roomId, user) {
        const room = this.ROOMS[roomId];
        if (!room) return false;
        if (!user) return false;
        
        // الملك يرى كل شيء (بما فيها غرفة تدريب البوت)
        if (user.rank === 'King') return true;
        
        // الملكة ترى غرفة تدريب البوت أيضاً
        if (roomId === 'bot_training' && user.rank === 'Queen') return true;
        
        // غرفة تدريب البوت مخفية عن الجميع ما عدا الملك/الملكة
        if (room.visibleTo === 'royal' && roomId === 'bot_training') {
            return user.rank === 'King' || user.rank === 'Queen';
        }
        
        // القواعد حسب visibleTo
        switch (room.visibleTo) {
            case 'all':
                return true;
            case 'royal':
                return user.rank === 'King' || user.rank === 'Queen';
            case 'owner+':
                return ['King', 'Queen', 'Master Owner', 'Room Owner', 'Grand Owner', 'Owner'].includes(user.rank);
            case 'grandowner+':
                return ['King', 'Queen', 'Master Owner', 'Room Owner', 'Grand Owner'].includes(user.rank);
            case 'jailed':
                // ← خاص: تظهر فقط لمن هو مسجون حالياً
                return user.isJailed === true;
            case 'king':
                return user.rank === 'King';
            default:
                return false;
        }
    },
    
    /**
     * جلب الغرف المرئية للمستخدم (بدون المخفية)
     */
    getVisibleRooms: function(user) {
        const visible = {};
        for (const [id, room] of Object.entries(this.ROOMS)) {
            // تجاهل الغرف المخفية (مثل تدريب البوت)
            if (room.invisible) continue;
            if (this.isRoomVisible(id, user)) {
                visible[id] = room;
            }
        }
        return visible;
    },
    
    // ====== الخلفيات ======
    BACKGROUNDS: [
        { id: 'stars', class: 'background-type-stars' },
        { id: 'nebula', class: 'background-type-nebula' },
        { id: 'moon', class: 'background-type-moon' },
        { id: 'dust', class: 'background-type-dust' },
        { id: 'waves', class: 'background-type-waves' }
    ],
    
    // ====== الألوان ======
    COLORS: {
        gold: '#d4af37',
        goldLight: '#ffd700',
        bgDark: '#050508'
    },
    
    // ====== إعدادات Rate Limiting ======
    RATE_LIMIT: {
        MESSAGE_INTERVAL_MS: 5000,      // ← 5 ثواني بين الرسائل
        PRIVATE_MESSAGE_INTERVAL_MS: 3000,  // ← 3 ثواني في الخاص
        MAX_MESSAGE_LENGTH: 2000,        // ← أقصى طول رسالة
        MAX_FILE_SIZE: {
            image: 5 * 1024 * 1024,      // 5 MB للصور
            gif: 5 * 1024 * 1024,        // 5 MB للـ GIF
            audio: 3 * 1024 * 1024,      // 3 MB للصوت
            video: 20 * 1024 * 1024      // 20 MB للفيديو
        }
    },
    
    // ====== إعدادات السجن ======
    JAIL: {
        FIRST_OFFENSE_MS: 2 * 60 * 1000,       // 2 دقيقة أول مخالفة
        ESCALATION_WINDOW_MS: 10 * 60 * 1000,  // نافذة 10 دقائق للتكرار
        MAX_AUTO_JAIL_MS: 15 * 60 * 1000,      // 15 دقيقة = طرد تلقائي
        ESCALATION_MULTIPLIER: 2                // مضاعف المدة
    },
    
    // ====== البوتات ======
    BOTS: {
        GUARDIAN: {
            id: 'guardian',
            name: 'السجان',
            icon: '👮',
            color: '#ff4444'
        },
        ISLAMIC: {
            id: 'islamic',
            name: 'البوت الإسلامي',
            icon: '🕌',
            color: '#4CAF50',
            intervalMs: 5 * 60 * 1000   // ← كل 5 دقائق
        },
        QUIZ: {
            id: 'quiz',
            name: 'بوت المسابقات',
            icon: '🎯',
            color: '#FF9800',
            intervalMs: 5 * 60 * 1000,  // ← كل 5 دقائق
            revealDelayMs: 60 * 1000    // ← دقيقة قبل السؤال التالي
        },
        HAKAWATI: {
            id: 'hakawati',
            name: 'حكواتي الشام',
            icon: '📖',
            color: '#9C27B0'
        }
    },
    
    // ====== مفاتيح localStorage ======
    STORAGE_KEYS: {
        USER: 'qamar_user',
        GUEST: 'qamar_guest',
        BACKGROUND: 'qamar_background',
        CURRENT_USER: 'qamar_current_user'
    },
    
    // ====== إعدادات عامة ======
    SETTINGS: {
        MESSAGES_LIMIT: 100,            // ← آخر 100 رسالة في الغرفة
        PRIVATE_MESSAGES_LIMIT: 50,     // ← آخر 50 رسالة في الخاص
        NOTIFICATIONS_LIMIT: 50         // ← آخر 50 إشعار
    }
};

// ====== تهيئة ======
console.log('📦 Qamar Config loaded:', {
    rooms: Object.keys(QAMAR.ROOMS).length,
    ranks: QAMAR.RANKS_ORDERED.length,
    bots: Object.keys(QAMAR.BOTS).length
});
