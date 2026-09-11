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
    // ====== روابط ======
    PROFILE_URL: 'profile.html',
    INDEX_URL: 'index1.html',

    // ====== مستويات الرتب ======
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

    // ====== الرتب بالترتيب ======
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
    isHigherRank: function(rankA, rankB) {
        const levelA = this.RANK_LEVELS[rankA] || 0;
        const levelB = this.RANK_LEVELS[rankB] || 0;
        return levelA > levelB;
    },

    isHigherOrEqual: function(rankA, rankB) {
        const levelA = this.RANK_LEVELS[rankA] || 0;
        const levelB = this.RANK_LEVELS[rankB] || 0;
        return levelA >= levelB;
    },

    getRankLevel: function(rank) {
        return this.RANK_LEVELS[rank] || 0;
    },

    // ====== الغرف ======
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
            micCount: 1,
            allowMic: true,
            maxUsers: null
        },
        royal: {
            id: 'royal',
            name: 'السويت الملكي',
            icon: '👑',
            type: 'private',
            visibleTo: 'royal',
            micCount: 2,
            allowMic: true,
            maxUsers: 2
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
            micCount: 1,
            allowMic: true,
            maxUsers: 1,
            hasRecording: true,
            hasEcho: true,
            hasEqualizer: true
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
            visibleTo: 'royal',
            micCount: 0,
            allowMic: false,
            maxUsers: 2,
            invisible: true
        },
        jail: {
            id: 'jail',
            name: 'السجن',
            icon: '🚔',
            type: 'private',
            visibleTo: 'jailed',
            micCount: 0,
            allowMic: false,
            maxUsers: null
        }
    },

    // ====== دوال مساعدة للغرف ======
    isRoomVisible: function(roomId, user) {
        const room = this.ROOMS[roomId];
        if (!room) return false;
        if (!user) return false;

        if (user.rank === 'King') return true;

        if (roomId === 'bot_training' && user.rank === 'Queen') return true;

        if (room.visibleTo === 'royal' && roomId === 'bot_training') {
            return user.rank === 'King' || user.rank === 'Queen';
        }

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
                return user.isJailed === true;
            case 'king':
                return user.rank === 'King';
            default:
                return false;
        }
    },

    getVisibleRooms: function(user) {
        const visible = {};
        for (const [id, room] of Object.entries(this.ROOMS)) {
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

    // ====== Rate Limiting ======
    RATE_LIMIT: {
        MESSAGE_INTERVAL_MS: 5000,
        PRIVATE_MESSAGE_INTERVAL_MS: 3000,
        MAX_MESSAGE_LENGTH: 2000,
        MAX_FILE_SIZE: {
            image: 5 * 1024 * 1024,
            gif: 5 * 1024 * 1024,
            audio: 3 * 1024 * 1024,
            video: 20 * 1024 * 1024
        }
    },

    // ====== إعدادات السجن ======
    JAIL: {
        FIRST_OFFENSE_MS: 2 * 60 * 1000,
        ESCALATION_WINDOW_MS: 10 * 60 * 1000,
        MAX_AUTO_JAIL_MS: 15 * 60 * 1000,
        ESCALATION_MULTIPLIER: 2
    },

    // ====== البوتات ======
    BOTS: {
        GUARDIAN: {
            id: 'guardian',
            name: 'السجان',
            icon: '🚔',
            color: '#ff4444',
            description: 'يحرس المكان — يكتشف الكلمات الممنوعة ويعاقب المخالفين تلقائياً.'
        },
        ISLAMIC: {
            id: 'islamic',
            name: 'قمر الشام',
            icon: '🌙',
            color: '#d4af37',
            intervalMs: 5 * 60 * 1000,
            description: 'ينشر الأدعية والأذكار والاستغفار والصلاة على النبي ﷺ كل 5 دقائق.'
        },
        QUIZ: {
            id: 'quiz',
            name: 'الشاطر',
            icon: '🎯',
            color: '#FF9800',
            intervalMs: 5 * 60 * 1000,
            revealDelayMs: 60 * 1000,
            description: 'يطرح الأسئلة كل 5 دقائق — من يجيب أولاً يكسب نقاطاً.'
        },
        HAKAWATI: {
            id: 'hakawati',
            name: 'حكواتي الشام',
            icon: '📖',
            color: '#9C27B0',
            description: 'يساعدك على فهم الموقع — نادِه بـ "حكواتي" + سؤالك.'
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
        MESSAGES_LIMIT: 100,
        PRIVATE_MESSAGES_LIMIT: 50,
        NOTIFICATIONS_LIMIT: 50
    }
};

// ====== تهيئة ======
console.log('📦 Qamar Config loaded:', {
    rooms: Object.keys(QAMAR.ROOMS).length,
    ranks: QAMAR.RANKS_ORDERED.length,
    bots: Object.keys(QAMAR.BOTS).length
});
