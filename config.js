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

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.database();
        console.log('✅ Firebase initialized');
    }
} catch (e) {
    console.error('❌ Firebase init failed:', e);
}

// ====== ثوابت المشروع ======
const QAMAR = {
    // معلومات الملك
    KING_EMAIL: 'emadhlaweh@gmail.com',
    KING_NAME: 'Emad',
    QUEEN_EMAIL: null, // يُحدد لاحقاً
    
    // روابط
    PROFILE_URL: 'https://qamaralsham.github.io/qamaralsham/profile.html',
    INDEX_URL: 'https://qamaralsham.github.io/qamaralsham/index1.html',
    
    // ====== الغرف ======
    // visibleTo: 'all' = للجميع | 'royal' = للملك/الملكة | 'owner+' = Owner وما فوق
    ROOMS: {
        general: { 
            id: 'general', 
            name: 'الروم العام', 
            icon: '🌍', 
            type: 'public',
            visibleTo: 'all'
        },
        quiz: { 
            id: 'quiz', 
            name: 'روم المسابقات', 
            icon: '🎯', 
            type: 'public',
            visibleTo: 'all'
        },
        islamic: { 
            id: 'islamic', 
            name: 'روم الإسلاميات', 
            icon: '🕌', 
            type: 'public',
            visibleTo: 'all'
        },
        royal: { 
            id: 'royal', 
            name: 'السويت الملكي', 
            icon: '👑', 
            type: 'private',
            visibleTo: 'royal'
        },
        candy: { 
            id: 'candy', 
            name: 'كانديز', 
            icon: '🍫', 
            type: 'public',
            visibleTo: 'all'
        },
        studio: { 
            id: 'studio', 
            name: 'استديو التسجيل', 
            icon: '🎙️', 
            type: 'private',
            visibleTo: 'owner+'
        },
        gaza: { 
            id: 'gaza', 
            name: 'غزة العزة', 
            icon: '🇵🇸', 
            type: 'public',
            visibleTo: 'all'
        },
        sham: { 
            id: 'sham', 
            name: 'ليالي الشام', 
            icon: '🌙', 
            type: 'public',
            visibleTo: 'all'
        },
        jail: { 
            id: 'jail', 
            name: 'السجن', 
            icon: '🚔', 
            type: 'private',
            visibleTo: 'owner+'
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
        
        // الملك يشوف كل شي
        if (user.rank === 'King') return true;
        
        // القواعد حسب visibleTo
        switch (room.visibleTo) {
            case 'all':
                return true;
            case 'royal':
                return user.rank === 'King' || user.rank === 'Queen';
            case 'owner+':
                return ['King', 'Queen', 'Super Owner', 'Room Manager Owner', 'Grand Owner', 'Owner'].includes(user.rank);
            default:
                return false;
        }
    },
    
    /**
     * جلب الغرف المرئية للمستخدم
     */
    getVisibleRooms: function(user) {
        const visible = {};
        for (const [id, room] of Object.entries(this.ROOMS)) {
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
    
    // ====== مفاتيح localStorage ======
    STORAGE_KEYS: {
        USER: 'qamar_user',
        GUEST: 'qamar_guest',
        BACKGROUND: 'qamar_background'
    }
};

// ====== تهيئة Firebase SDK ======
console.log('📦 Qamar Config loaded with', Object.keys(QAMAR.ROOMS).length, 'rooms');
