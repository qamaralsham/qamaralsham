// ==============================================
// قمر الشام - نظام الرتب والصلاحيات (v2.1)
// Qamar Al Sham - Ranks & Permissions v2.1
// ==============================================
// ⚠️ v2.1: أُعيدت تسمية isKing/isQueen/isRoyal
//         → isKingRank/isQueenRank/isRoyalRank
//         لحل التعارض مع auth.js (iAmKing/iAmQueen/iAmRoyal)
// ==============================================

const RANKS = {
    'King': {
        badge: '👑', color: '#ffd700', level: 100,
        canEditAllProfiles: true, canPromote: 'all', canDemote: 'all',
        canBan: 'all', canUnban: 'all', canJail: 'all',
        canKickFromRoom: 'all', canKickFromMic: 'all',
        canDeleteAnyMessage: true, canDeleteRoomMessages: true,
        canCreateRooms: true, canDeleteRooms: true,
        canAccessRoyal: true, canInviteToRoyal: true,
        canAccessStudio: true, canAccessBotTraining: true,
        canInvisible: true, canSeePrivateMessages: true, canSeeDeletedMessages: true,
        canResetPasswords: true, canUseMic: true, canTrainBots: true
    },
    'Queen': {
        badge: '👸', color: '#ff69b4', level: 95,
        canEditAllProfiles: true, canPromote: 'below_queen', canDemote: 'below_queen',
        canBan: 'below_queen', canUnban: 'all', canJail: 'below_queen',
        canKickFromRoom: 'below_queen', canKickFromMic: 'below_queen',
        canDeleteAnyMessage: true, canDeleteRoomMessages: true,
        canCreateRooms: true, canDeleteRooms: true,
        canAccessRoyal: true, canInviteToRoyal: true,
        canAccessStudio: true, canAccessBotTraining: true,
        canInvisible: true, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: true, canUseMic: true, canTrainBots: true
    },
    'Master Owner': {
        badge: '🌟', color: '#ffa500', level: 90,
        canEditAllProfiles: false, canPromote: 'below_self_one', canDemote: 'below_self',
        canBan: 'below_self', canUnban: 'same_rank_or_lower', canJail: 'below_self',
        canKickFromRoom: 'below_self', canKickFromMic: 'below_self',
        canDeleteAnyMessage: true, canDeleteRoomMessages: true,
        canCreateRooms: true, canDeleteRooms: true,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: true, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: true, canTrainBots: false
    },
    'Room Owner': {
        badge: '🛡️', color: '#3498db', level: 85,
        canEditAllProfiles: false, canPromote: 'below_self_one', canDemote: 'below_self',
        canBan: 'below_self', canUnban: 'same_rank_or_lower', canJail: 'below_self',
        canKickFromRoom: 'below_self', canKickFromMic: 'below_self',
        canDeleteAnyMessage: true, canDeleteRoomMessages: true,
        canCreateRooms: true, canDeleteRooms: true,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: true, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: true, canTrainBots: false
    },
    'Grand Owner': {
        badge: '💎', color: '#9b59b6', level: 80,
        canEditAllProfiles: true, canPromote: false, canDemote: false,
        canBan: 'below_self', canUnban: 'same_rank_or_lower', canJail: 'below_self',
        canKickFromRoom: 'below_self', canKickFromMic: 'below_self',
        canDeleteAnyMessage: true, canDeleteRoomMessages: true,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: true, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: true, canTrainBots: false
    },
    'Owner': {
        badge: '🏆', color: '#e67e22', level: 75,
        canEditAllProfiles: false, canPromote: false, canDemote: false,
        canBan: false, canUnban: false, canJail: false,
        canKickFromRoom: false, canKickFromMic: 'below_self',
        canDeleteAnyMessage: false, canDeleteRoomMessages: false,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: true, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: true, canTrainBots: false
    },
    'Super Admin': {
        badge: '🎖️', color: '#f1c40f', level: 70,
        canEditAllProfiles: false, canPromote: false, canDemote: false,
        canBan: false, canUnban: false, canJail: false,
        canKickFromRoom: false, canKickFromMic: false,
        canDeleteAnyMessage: false, canDeleteRoomMessages: false,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: false, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: true, canTrainBots: false
    },
    'Admin': {
        badge: '🛠️', color: '#1abc9c', level: 65,
        canEditAllProfiles: false, canPromote: false, canDemote: false,
        canBan: false, canUnban: false, canJail: false,
        canKickFromRoom: false, canKickFromMic: false,
        canDeleteAnyMessage: false, canDeleteRoomMessages: false,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: false, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: false, canTrainBots: false
    },
    'Premium': {
        badge: '💠', color: '#e84393', level: 60,
        canEditAllProfiles: false, canPromote: false, canDemote: false,
        canBan: false, canUnban: false, canJail: false,
        canKickFromRoom: false, canKickFromMic: false,
        canDeleteAnyMessage: false, canDeleteRoomMessages: false,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: false, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: false, canTrainBots: false
    },
    'User': {
        badge: '👤', color: '#ffffff', level: 50,
        canEditAllProfiles: false, canPromote: false, canDemote: false,
        canBan: false, canUnban: false, canJail: false,
        canKickFromRoom: false, canKickFromMic: false,
        canDeleteAnyMessage: false, canDeleteRoomMessages: false,
        canCreateRooms: false, canDeleteRooms: false,
        canAccessRoyal: false, canInviteToRoyal: false,
        canAccessStudio: false, canAccessBotTraining: false,
        canInvisible: false, canSeePrivateMessages: false, canSeeDeletedMessages: false,
        canResetPasswords: false, canUseMic: false, canTrainBots: false
    }
};

// ====== دوال مساعدة ======
function getRank(rankName) { return RANKS[rankName] || RANKS['User']; }
function getRankBadge(rankName) { return getRank(rankName).badge; }
function getRankColor(rankName) { return getRank(rankName).color; }
function getRankLevel(rankName) { return getRank(rankName).level; }

function isHigherRank(rankA, rankB) {
    return getRankLevel(rankA) > getRankLevel(rankB);
}
function isHigherOrEqualRank(rankA, rankB) {
    return getRankLevel(rankA) >= getRankLevel(rankB);
}

function can(user, permission) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    const value = rank[permission];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return true;
    return false;
}

function isAdmin(user) {
    if (!user || !user.rank) return false;
    return getRankLevel(user.rank) >= 65;
}
function isOwner(user) {
    if (!user || !user.rank) return false;
    return getRankLevel(user.rank) >= 80;
}

// ✅ v2.1: أُعيدت التسمية لمنع التعارض مع auth.js
function isKingRank(user) {
    return !!(user && user.rank === 'King');
}
function isQueenRank(user) {
    return !!(user && user.rank === 'Queen');
}
function isRoyalRank(user) {
    return isKingRank(user) || isQueenRank(user);
}

function canPromote(user, targetRank) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    if (rank.canPromote === 'all') return true;
    if (rank.canPromote === 'below_queen') {
        return targetRank !== 'King' && targetRank !== 'Queen';
    }
    if (rank.canPromote === 'below_self_one') return true;
    return false;
}

function canManageRank(user, targetRank) {
    if (!user || !user.rank) return false;
    return isHigherRank(user.rank, targetRank);
}
function canModerateTarget(user, targetRank) {
    if (!user || !user.rank) return false;
    return isHigherRank(user.rank, targetRank);
}
function canEditTargetProfile(user, targetRank) {
    if (!user || !user.rank) return false;
    const rank = getRank(user.rank);
    if (!rank.canEditAllProfiles) return false;
    return isHigherRank(user.rank, targetRank);
}

console.log('📦 Ranks v2.1 loaded:', Object.keys(RANKS).length, 'ranks');