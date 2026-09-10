// ==============================================
// قمر الشام - نظام الرتب والصلاحيات (محدّث v2)
// Qamar Al Sham - Ranks & Permissions System v2
// ==============================================
// ملاحظة: أسماء الرتب هنا مطابقة لـ config.js (RANK_LEVELS)
// ==============================================

const RANKS = {
    'King': {
        badge: '👑',
        color: '#ffd700',
        level: 100,
        canEditAllProfiles: true,
        canPromote: 'all',              // يرقّي أي رتبة
        canDemote: 'all',
        canBan: 'all',
        canUnban: 'all',
        canJail: 'all',
        canKickFromRoom: 'all',
        canKickFromMic: 'all',
        canDeleteAnyMessage: true,
        canDeleteRoomMessages: true,
        canCreateRooms: true,
        canDeleteRooms: true,
        canAccessRoyal: true,
        canInviteToRoyal: true,
        canAccessStudio: true,
        canAccessBotTraining: true,
        canInvisible: true,
        canSeePrivateMessages: true,    // ← يراه كل شيء
        canSeeDeletedMessages: true,
        canResetPasswords: true,
        canUseMic: true,
        canTrainBots: true
    },

    'Queen': {
        badge: '👸',
        color: '#ff69b4',
        level: 95,
        canEditAllProfiles: true,
        canPromote: 'below_queen',      // يرقّي الجميع ما عدا الملك
        canDemote: 'below_queen',
        canBan: 'below_queen',
        canUnban: 'all',
        canJail: 'below_queen',
        canKickFromRoom: 'below_queen',
        canKickFromMic: 'below_queen',
        canDeleteAnyMessage: true,
        canDeleteRoomMessages: true,
        canCreateRooms: true,
        canDeleteRooms: true,
        canAccessRoyal: true,
        canInviteToRoyal: true,
        canAccessStudio: true,
        canAccessBotTraining: true,
        canInvisible: true,
        canSeePrivateMessages: false,   // ← لا ترى رسائل الملك إلا إذا أراد
        canSeeDeletedMessages: false,
        canResetPasswords: true,
        canUseMic: true,
        canTrainBots: true
    },

    'Master Owner': {
        badge: '🌟',
        color: '#ffa500',
        level: 90,
        canEditAllProfiles: false,
        canPromote: 'below_self_one',   // يرقّي لأقل منه بدرجة
        canDemote: 'below_self',
        canBan: 'below_self',
        canUnban: 'same_rank_or_lower', // ← يفك البان من نفس رتبته أو أقل
        canJail: 'below_self',
        canKickFromRoom: 'below_self',
        canKickFromMic: 'below_self',
        canDeleteAnyMessage: true,
        canDeleteRoomMessages: true,
        canCreateRooms: true,
        canDeleteRooms: true,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: true,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: true,
        canTrainBots: false
    },

    'Room Owner': {
        badge: '🛡️',
        color: '#3498db',
        level: 85,
        canEditAllProfiles: false,
        canPromote: 'below_self_one',
        canDemote: 'below_self',
        canBan: 'below_self',
        canUnban: 'same_rank_or_lower',
        canJail: 'below_self',
        canKickFromRoom: 'below_self',
        canKickFromMic: 'below_self',
        canDeleteAnyMessage: true,
        canDeleteRoomMessages: true,    // ← داخل رومه فقط
        canCreateRooms: true,
        canDeleteRooms: true,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: true,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: true,
        canTrainBots: false
    },

    'Grand Owner': {
        badge: '💎',
        color: '#9b59b6',
        level: 80,
        canEditAllProfiles: true,       // ← يعدل بروفايلات الأدنى منه
        canPromote: false,              // ← لا يرقّي
        canDemote: false,
        canBan: 'below_self',
        canUnban: 'same_rank_or_lower',
        canJail: 'below_self',
        canKickFromRoom: 'below_self',
        canKickFromMic: 'below_self',
        canDeleteAnyMessage: true,
        canDeleteRoomMessages: true,    // ← مسح رسائل روم كامل داخل رومه
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: true,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: true,
        canTrainBots: false
    },

    'Owner': {
        badge: '🏆',
        color: '#e67e22',
        level: 75,
        canEditAllProfiles: false,
        canPromote: false,
        canDemote: false,
        canBan: false,
        canUnban: false,
        canJail: false,
        canKickFromRoom: false,
        canKickFromMic: 'below_self',   // ← يطرد من المايك فقط
        canDeleteAnyMessage: false,
        canDeleteRoomMessages: false,
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: true,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: true,
        canTrainBots: false
    },

    'Super Admin': {
        badge: '🎖️',
        color: '#f1c40f',
        level: 70,
        canEditAllProfiles: false,
        canPromote: false,
        canDemote: false,
        canBan: false,
        canUnban: false,
        canJail: false,
        canKickFromRoom: false,
        canKickFromMic: false,
        canDeleteAnyMessage: false,
        canDeleteRoomMessages: false,
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: false,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: true,                // ← يستخدم المايك
        canTrainBots: false
    },

    'Admin': {
        badge: '🛠️',
        color: '#1abc9c',
        level: 65,
        canEditAllProfiles: false,
        canPromote: false,
        canDemote: false,
        canBan: false,
        canUnban: false,
        canJail: false,
        canKickFromRoom: false,
        canKickFromMic: false,
        canDeleteAnyMessage: false,
        canDeleteRoomMessages: false,
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: false,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: false,               // ← لا يستخدم المايك
        canTrainBots: false
    },

    'Premium': {
        badge: '💠',
        color: '#e84393',
        level: 60,
        canEditAllProfiles: false,
        canPromote: false,
        canDemote: false,
        canBan: false,
        canUnban: false,
        canJail: false,
        canKickFromRoom: false,
        canKickFromMic: false,
        canDeleteAnyMessage: false,
        canDeleteRoomMessages: false,
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: false,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: false,
        canTrainBots: false
    },

    'User': {
        badge: '👤',
        color: '#ffffff',
        level: 50,
        canEditAllProfiles: false,
        canPromote: false,
        canDemote: false,
        canBan: false,
        canUnban: false,
        canJail: false,
        canKickFromRoom: false,
        canKickFromMic: false,
        canDeleteAnyMessage: false,
        canDeleteRoomMessages: false,
        canCreateRooms: false,
        canDeleteRooms: false,
        canAccessRoyal: false,
        canInviteToRoyal: false,
        canAccessStudio: false,
        canAccessBotTraining: false,
        canInvisible: false,
        canSeePrivateMessages: false,
        canSeeDeletedMessages: false,
        canResetPasswords: false,
        canUseMic: false,               // ← شات نصي فقط
        canTrainBots: false
    }
};

// ====== دوال مساعدة ======

/**
 * جلب بيانات الرتبة
 */
function getRank(rankName) {
    return RANKS[rankName] || RANKS['User'];
}

/**
 * شارة الرتبة
 */
function getRankBadge(rankName) {
    return getRank(rankName).badge;
}

/**
 * لون الرتبة
 */
function getRankColor(rankName) {
    return getRank(rankName).color;
}

/**
 * مستوى الرتبة (رقم)
 */
function getRankLevel(rankName) {
    return getRank(rankName).level;
}

/**
 * هل رتبة A أعلى من B؟
 */
function isHigherRank(rankA, rankB) {
    return getRankLevel(rankA) > getRankLevel(rankB);
}

/**
 * هل رتبة A أعلى أو تساوي B؟
 */
function isHigherOrEqualRank(rankA, rankB) {
    return getRankLevel(rankA) >= getRankLevel(rankB);
}

/**
 * التحقق من صلاحية معينة
 */
function can(user, permission) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    const value = rank[permission];
    
    // إذا كانت القيمة boolean → أعِدها
    if (typeof value === 'boolean') return value;
    
    // إذا كانت نصية ('all', 'below_self', إلخ) → true (تفصيلها في دوال أخرى)
    if (typeof value === 'string') return true;
    
    return false;
}

/**
 * هل رتبة المستخدم ضمن الرتب الإدارية؟
 */
function isAdmin(user) {
    if (!user || !user.rank) return false;
    return getRankLevel(user.rank) >= 65; // Admin+
}

/**
 * هل المستخدم من المالكين (Grand Owner+)
 */
function isOwner(user) {
    if (!user || !user.rank) return false;
    return getRankLevel(user.rank) >= 80; // Grand Owner+
}

/**
 * هل المستخدم ملك؟
 */
function isKing(user) {
    return user && user.rank === 'King';
}

/**
 * هل المستخدم ملكة؟
 */
function isQueen(user) {
    return user && user.rank === 'Queen';
}

/**
 * هل المستخدم ملك أو ملكة؟
 */
function isRoyal(user) {
    return isKing(user) || isQueen(user);
}

/**
 * هل يستطيع المستخدم الترقية؟
 */
function canPromote(user, targetRank) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    
    if (rank.canPromote === 'all') return true;
    if (rank.canPromote === 'below_queen') {
        return targetRank !== 'King' && targetRank !== 'Queen';
    }
    if (rank.canPromote === 'below_self_one') {
        // يمكنه ترقية الشخص لأقل منه بدرجة واحدة فقط
        return true; // التفصيل عند التنفيذ الفعلي
    }
    return false;
}

/**
 * هل يستطيع المستخدم ترقية/تنزيل الشخص المستهدف؟
 * القاعدة الذهبية: لا يعدل من مستواه أو أعلى
 */
function canManageRank(user, targetRank) {
    if (!user || !user.rank) return false;
    return isHigherRank(user.rank, targetRank);
}

/**
 * هل يمكن للمستخدم كتم/طرد/سجن الشخص المستهدف؟
 */
function canModerateTarget(user, targetRank) {
    if (!user || !user.rank) return false;
    return isHigherRank(user.rank, targetRank);
}

/**
 * هل يمكن للمستخدم رؤية/تعديل بروفايل الشخص المستهدف؟
 */
function canEditTargetProfile(user, targetRank) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    if (!rank.canEditAllProfiles) return false;
    return isHigherRank(user.rank, targetRank);
}

console.log('📦 Ranks v2 loaded:', Object.keys(RANKS).length, 'ranks');
