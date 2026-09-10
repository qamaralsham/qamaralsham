// ==============================================
// قمر الشام - نظام الرتب والصلاحيات
// Qamar Al Sham - Ranks & Permissions System
// ==============================================

const RANKS = {
    'King': {
        badge: '👑',
        color: '#ffd700',
        priority: 100,
        permissions: {
            // كل الصلاحيات
            canBan: true,
            canMute: true,
            canPromote: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canChangeAnyName: true,
            canAccessRoyal: true,
            canAccessStudio: true,
            canInvisible: true,
            canEditAnyProfile: true,
            canSeeAllMessages: true
        }
    },
    'Queen': {
        badge: '👸',
        color: '#ff69b4',
        priority: 95,
        permissions: {
            canBan: true,
            canMute: true,
            canPromote: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canChangeAnyName: true,
            canAccessRoyal: true,
            canAccessStudio: true,
            canInvisible: true
        }
    },
    'Super Owner': {
        badge: '🌟',
        color: '#ffa500',
        priority: 90,
        permissions: {
            canBan: true,
            canMute: true,
            canPromote: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canAccessRoyal: true,
            canAccessStudio: true
        }
    },
    'Room Manager Owner': {
        badge: '🛡️',
        color: '#3498db',
        priority: 85,
        permissions: {
            canBan: true,
            canMute: true,
            canPromote: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canAccessRoyal: false,
            canAccessStudio: true
        }
    },
    'Grand Owner': {
        badge: '💎',
        color: '#9b59b6',
        priority: 80,
        permissions: {
            canBan: true,
            canMute: true,
            canPromote: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canAccessRoyal: false,
            canAccessStudio: true
        }
    },
    'Owner': {
        badge: '🏆',
        color: '#e67e22',
        priority: 70,
        permissions: {
            canBan: true,
            canMute: true,
            canDeleteMessages: true,
            canChangeBackground: true,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    },
    'Super Admin': {
        badge: '🎖️',
        color: '#f1c40f',
        priority: 60,
        permissions: {
            canBan: true,
            canMute: true,
            canDeleteMessages: true,
            canChangeBackground: false,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    },
    'Admin': {
        badge: '🛠️',
        color: '#1abc9c',
        priority: 50,
        permissions: {
            canBan: true,
            canMute: true,
            canDeleteMessages: false,
            canChangeBackground: false,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    },
    'Premium': {
        badge: '💎',
        color: '#e84393',
        priority: 40,
        permissions: {
            canBan: false,
            canMute: false,
            canDeleteMessages: false,
            canChangeBackground: false,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    },
    'User': {
        badge: '👤',
        color: '#ffffff',
        priority: 30,
        permissions: {
            canBan: false,
            canMute: false,
            canDeleteMessages: false,
            canChangeBackground: false,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    },
    'Guest': {
        badge: '🕶️',
        color: '#95a5a6',
        priority: 10,
        permissions: {
            canBan: false,
            canMute: false,
            canDeleteMessages: false,
            canChangeBackground: false,
            canAccessRoyal: false,
            canAccessStudio: false
        }
    }
};

// ====== دوال مساعدة ======

/**
 * جلب بيانات الرتبة
 */
function getRank(rankName) {
    return RANKS[rankName] || RANKS['Guest'];
}

/**
 * جلب شارة الرتبة
 */
function getRankBadge(rankName) {
    return getRank(rankName).badge;
}

/**
 * جلب لون الرتبة
 */
function getRankColor(rankName) {
    return getRank(rankName).color;
}

/**
 * التحقق من صلاحية معينة
 */
function can(user, permission) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    return rank.permissions[permission] === true;
}

/**
 * هل المستخدم أدمن أو أعلى؟
 */
function isAdmin(user) {
    if (!user || !user.rank) return false;
    return getRank(user.rank).priority >= 50;
}

/**
 * هل المستخدم مالك؟
 */
function isOwner(user) {
    if (!user || !user.rank) return false;
    return getRank(user.rank).priority >= 80;
}

/**
 * هل المستخدم ملك؟
 */
function isKing(user) {
    return user && user.rank === 'King';
}

console.log('📦 Ranks loaded:', Object.keys(RANKS).length, 'ranks');