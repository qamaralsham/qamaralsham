// ==============================================
// قمر الشام - البوتات الأربعة (v4)
// Qamar Al Sham - The Four Bots v4
// ==============================================
// الجديد في v4:
//   ✅ قفل موزّع لكل رسالة — يمنع معالجة مزدوجة من عدة عملاء
//   ✅ تبسيط منطق processIncomingMessage
// ==============================================

const BotsState = {
    initialized: false,
    islamicTimer: null,
    quizTimer: null,
    quizRevealTimeout: null,
    currentQuiz: null,
    quizListener: null,
    violationTracker: {},
    bannedWords: [],
    criticalWords: [],
    hakawatiResponses: [],
    hakawatiWelcome: [],
    islamicContent: { duas: [], adhkar: [], istighfar: [], prayers: [] },
    quizQuestions: []
};

// ==============================================
// 1. أداة القفل (Leader Lock)
// ==============================================

async function tryAcquireLock(lockName, cooldownMs) {
    if (!db) return false;
    const now = Date.now();
    const bufferMs = Math.min(30000, Math.floor(cooldownMs / 5));

    try {
        const result = await db.ref(`bot_locks/${lockName}`).transaction((current) => {
            const lastAt = (current && current.at) || 0;
            if (now - lastAt >= (cooldownMs - bufferMs)) {
                return { at: now, by: (getCurrentUser()?.uid) || 'anon' };
            }
            return undefined;
        });
        return result.committed === true;
    } catch (e) {
        console.warn('Lock error:', lockName, e);
        return false;
    }
}

// ==============================================
// 2. التهيئة
// ==============================================

async function initBots() {
    if (BotsState.initialized) return;
    console.log('🤖 Initializing bots...');
    try {
        await loadBotsData();
        startIslamicBot();
        startQuizBot();
        startQuizListener();
        startGuardianBot();
        initHakawati();
        BotsState.initialized = true;
        console.log('✅ All bots initialized');
    } catch (e) {
        console.error('❌ Bots init error:', e);
    }
}

// ==============================================
// 3. تحميل البيانات
// ==============================================

async function loadBotsData() {
    if (!db) return;
    try {
        const bannedSnap = await db.ref('config/banned_words').once('value');
        const banned = bannedSnap.val();
        if (banned) {
            BotsState.bannedWords = banned.words || banned.list || [];
            BotsState.criticalWords = banned.critical || [];
        }
        if (BotsState.bannedWords.length === 0) await seedDefaultBannedWords();

        const islamicSnap = await db.ref('bot_data/islamic').once('value');
        const islamic = islamicSnap.val();
        if (islamic) {
            BotsState.islamicContent = {
                duas: flattenToArray(islamic.duas),
                adhkar: flattenToArray(islamic.adhkar),
                istighfar: flattenToArray(islamic.istighfar),
                prayers: flattenToArray(islamic.prayers)
            };
        }
        if (BotsState.islamicContent.duas.length === 0) await seedDefaultIslamicContent();

        const quizSnap = await db.ref('bot_data/quiz/questions').once('value');
        const questions = quizSnap.val();
        if (questions) BotsState.quizQuestions = Object.values(questions);
        if (BotsState.quizQuestions.length === 0) await seedDefaultQuizQuestions();

        const hakawatiSnap = await db.ref('bot_data/hakawati/responses').once('value');
        const responses = hakawatiSnap.val();
        if (responses) BotsState.hakawatiResponses = Object.values(responses);
        if (BotsState.hakawatiResponses.length === 0) await seedDefaultHakawati();

        const welcomeSnap = await db.ref('bot_data/hakawati/welcome').once('value');
        const welcome = welcomeSnap.val();
        if (welcome) BotsState.hakawatiWelcome = Array.isArray(welcome) ? welcome : [welcome];
        if (BotsState.hakawatiWelcome.length === 0) {
            BotsState.hakawatiWelcome = ['أهلاً وسهلاً 🌸','نورت المكان 🌟','مرحباً بك 👋','يا هلا ومرحبا 💫'];
        }
    } catch (e) {
        console.warn('⚠️ Could not load bots data:', e);
    }
}

function flattenToArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return Object.values(obj).filter(v => typeof v === 'string' || (v && v.text));
}

// ==============================================
// 4. البيانات الافتراضية
// ==============================================

async function seedDefaultBannedWords() {
    const defaultBanned = ['غبي','حمار','كلب','حقير','تافه','قذر','وسخ','لعنة','يلعن','خرا'];
    const defaultCritical = ['موت','اقتل','انتحر','سأقتلك','سأموت'];
    BotsState.bannedWords = defaultBanned;
    BotsState.criticalWords = defaultCritical;
    try {
        await db.ref('config/banned_words').set({
            words: defaultBanned, critical: defaultCritical,
            updatedBy: (getCurrentUser()?.uid) || 'system',
            updatedAt: Date.now()
        });
    } catch (e) { console.warn('Seed banned failed:', e); }
}

async function seedDefaultIslamicContent() {
    const duas = [
        'اللهم إني أسألك الهدى والتقى والعفاف والغنى',
        'اللهم أصلح لي ديني الذي هو عصمة أمري',
        'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
        'اللهم اغفر لي ولوالدي وللمؤمنين يوم يقوم الحساب',
        'حسبنا الله ونعم الوكيل'
    ];
    const adhkar = [
        'سبحان الله وبحمده، سبحان الله العظيم',
        'لا إله إلا الله وحده لا شريك له',
        'الحمد لله على كل حال',
        'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',
        'لا حول ولا قوة إلا بالله'
    ];
    const istighfar = [
        'أستغفر الله العظيم وأتوب إليه',
        'أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه',
        'ربنا اغفر لنا وتب علينا إنك أنت التواب الرحيم'
    ];
    const prayers = [
        'اللهم صلِّ وسلم على نبينا محمد ﷺ',
        'صلى الله عليه وسلم',
        'اللهم صلِّ على محمد وعلى آل محمد',
        'اللهم صلِّ على محمد كما صليت على إبراهيم'
    ];
    BotsState.islamicContent = { duas, adhkar, istighfar, prayers };
    try {
        await db.ref('bot_data/islamic').set({
            duas: duas.reduce((a, t, i) => ({ ...a, ['d' + i]: t }), {}),
            adhkar: adhkar.reduce((a, t, i) => ({ ...a, ['a' + i]: t }), {}),
            istighfar: istighfar.reduce((a, t, i) => ({ ...a, ['i' + i]: t }), {}),
            prayers: prayers.reduce((a, t, i) => ({ ...a, ['p' + i]: t }), {})
        });
    } catch (e) { console.warn('Seed islamic failed:', e); }
}

async function seedDefaultQuizQuestions() {
    const questions = [
        { question: 'ما هي عاصمة سوريا؟', answer: 'دمشق' },
        { question: 'كم عدد أيام السنة الميلادية؟', answer: '365' },
        { question: 'ما هو أطول نهر في العالم؟', answer: 'النيل' },
        { question: 'كم عدد ألوان قوس قزح؟', answer: '7' },
        { question: 'ما هي أكبر دولة في العالم من حيث المساحة؟', answer: 'روسيا' },
        { question: 'كم عدد أركان الإسلام؟', answer: '5' },
        { question: 'ما هو الحيوان الذي يلقب بسفينة الصحراء؟', answer: 'الجمل' },
        { question: 'كم عدد سور القرآن الكريم؟', answer: '114' },
        { question: 'ما هي عملة اليابان؟', answer: 'الين' },
        { question: 'في أي قارة تقع مصر؟', answer: 'أفريقيا' },
        { question: 'كم عدد أضلاع جسم الإنسان؟', answer: '24' },
        { question: 'ما هي أكبر مدينة في العالم؟', answer: 'طوكيو' },
        { question: 'كم عدد ألوان العلم السوري؟', answer: '4' },
        { question: 'ما هو الكوكب الأحمر؟', answer: 'المريخ' },
        { question: 'ما هي أكبر بحيرة في العالم؟', answer: 'بحر قزوين' }
    ];
    BotsState.quizQuestions = questions;
    try {
        await db.ref('bot_data/quiz/questions').set(
            questions.reduce((a, q, i) => ({ ...a, ['q' + i]: q }), {})
        );
    } catch (e) { console.warn('Seed quiz failed:', e); }
}

async function seedDefaultHakawati() {
    const responses = [
        { trigger: 'السلام عليكم', reply: 'وعليكم السلام ورحمة الله وبركاته 🌸' },
        { trigger: 'مرحبا', reply: 'أهلاً وسهلاً بك 💫' },
        { trigger: 'كيفك', reply: 'الحمد لله بخير، كيف بقدر ساعدك؟ 🌹' },
        { trigger: 'شكرا', reply: 'العفو، هاد واجبي 🌷' },
        { trigger: 'صباح الخير', reply: 'صباح النور والسرور ☀️' },
        { trigger: 'مساء الخير', reply: 'مساء النور والأنس 🌙' },
        { trigger: 'كيف الحال', reply: 'الحمد لله، وكيف حالك أنت؟ 😊' },
        { trigger: 'وداعا', reply: 'بأمان الله، نورت 💜' }
    ];
    BotsState.hakawatiResponses = responses;
    try {
        await db.ref('bot_data/hakawati/responses').set(
            responses.reduce((a, r, i) => ({ ...a, ['r' + i]: r }), {})
        );
    } catch (e) { console.warn('Seed hakawati failed:', e); }
}

// ==============================================
// 5. السجان
// ==============================================

function startGuardianBot() { console.log('👮 Guardian bot ready'); }

function guardianCheck(text, user) {
    if (!text || !user) return null;
    const lower = text.toLowerCase();
    for (const word of BotsState.criticalWords) {
        if (lower.includes(word.toLowerCase())) {
            return { action: 'ban', reason: `كلمة محظورة: ${word}`, word };
        }
    }
    for (const word of BotsState.bannedWords) {
        if (lower.includes(word.toLowerCase())) {
            return { action: 'mute', reason: `كلمة ممنوعة: ${word}`, word };
        }
    }
    return null;
}

async function applyGuardianAction(user, action, reason, word) {
    const userRankLevel = (typeof getRankLevel === 'function')
        ? getRankLevel(user.rank)
        : (typeof getRank === 'function' ? getRank(user.rank).level : 0);
    if (userRankLevel >= 65) return;

    if (db) {
        try {
            const snap = await db.ref('jails/' + user.uid).once('value');
            const existing = snap.val();
            if (existing && existing.until > Date.now()) return;
        } catch (e) { /* تجاهل */ }
    }

    const uid = user.uid;
    const now = Date.now();

    if (!BotsState.violationTracker[uid]) {
        BotsState.violationTracker[uid] = { count: 0, times: [] };
    }
    const tracker = BotsState.violationTracker[uid];
    tracker.times = tracker.times.filter(t => now - t < QAMAR.JAIL.ESCALATION_WINDOW_MS);
    tracker.times.push(now);
    tracker.count = tracker.times.length;

    let durationMs = QAMAR.JAIL.FIRST_OFFENSE_MS;
    if (tracker.count > 1) {
        durationMs = QAMAR.JAIL.FIRST_OFFENSE_MS * Math.pow(QAMAR.JAIL.ESCALATION_MULTIPLIER, tracker.count - 1);
    }

    if (durationMs >= QAMAR.JAIL.MAX_AUTO_JAIL_MS) {
        await banUser(uid, user.name, 'تجاوز حد المخالفات', 'السجان');
        await sendBotMessage('السجان', `🔨 تم طرد ${user.name} بسبب تكرار المخالفات`);
        return;
    }

    await jailUser(uid, user.name, reason, durationMs, 'السجان');
    const minutes = Math.ceil(durationMs / 60000);
    await sendBotMessage('السجان', `🚔 تم سجن ${user.name} لمدة ${minutes} دقيقة — السبب: ${reason}`);
}

async function jailUser(uid, name, reason, durationMs, byName) {
    if (!db) return;
    const until = Date.now() + durationMs;
    try {
        await db.ref(`jails/${uid}`).set({
            byUid: 'guardian_bot', byRank: byName || 'Bot',
            reason, until, jailedAt: Date.now(), name
        });
        await db.ref(`user_notifications/${uid}`).push({
            fromUid: 'system', fromName: byName || 'النظام',
            type: 'jail',
            preview: `تم سجنك: ${reason} — لمدة ${Math.ceil(durationMs / 60000)} دقيقة`,
            time: Date.now(), read: false
        });
        scheduleUnjail(uid, durationMs);
    } catch (e) { console.warn('Jail error:', e); }
}

function scheduleUnjail(uid, durationMs) {
    setTimeout(async () => {
        try {
            const snap = await db.ref(`jails/${uid}`).once('value');
            const jail = snap.val();
            if (jail && jail.until <= Date.now()) {
                await db.ref(`jails/${uid}`).remove();
                await sendBotMessage('السجان', `🔓 تم فك السجن عن ${jail.name || 'مستخدم'}`);
            }
        } catch (e) { console.warn('Unjail error:', e); }
    }, durationMs + 1000);
}

async function banUser(uid, name, reason, byName) {
    if (!db) return;
    try {
        await db.ref(`bans/${uid}`).set({
            byUid: 'guardian_bot', byRank: byName || 'Bot',
            reason, time: Date.now(), name
        });
        await db.ref(`user_notifications/${uid}`).push({
            fromUid: 'system', fromName: byName || 'النظام',
            type: 'system', preview: `تم حظرك: ${reason}`,
            time: Date.now(), read: false
        });
    } catch (e) { console.warn('Ban error:', e); }
}

// ==============================================
// 6. الإسلامي
// ==============================================

function startIslamicBot() {
    if (BotsState.islamicTimer) clearInterval(BotsState.islamicTimer);
    BotsState.islamicTimer = setInterval(() => { postIslamicContent(); }, QAMAR.BOTS.ISLAMIC.intervalMs);
    console.log('🕌 Islamic bot started');
}

async function postIslamicContent() {
    if (ChatState.currentRoom !== 'islamic') return;
    const content = BotsState.islamicContent;
    const categories = [];
    if (content.duas.length > 0) categories.push('duas');
    if (content.adhkar.length > 0) categories.push('adhkar');
    if (content.istighfar.length > 0) categories.push('istighfar');
    if (content.prayers.length > 0) categories.push('prayers');
    if (categories.length === 0) return;

    const ok = await tryAcquireLock('islamic', QAMAR.BOTS.ISLAMIC.intervalMs);
    if (!ok) return;

    const category = categories[Math.floor(Math.random() * categories.length)];
    const list = content[category];
    const text = list[Math.floor(Math.random() * list.length)];
    const prefix = { duas: '🤲 دعاء:', adhkar: '📿 ذكر:', istighfar: '🤲 استغفار:', prayers: 'ﷺ صلاة على النبي:' };
    await sendBotMessage('قمر الشام', `${prefix[category]} ${text}`);
}

// ==============================================
// 7. المسابقات
// ==============================================

function startQuizBot() {
    if (BotsState.quizTimer) clearInterval(BotsState.quizTimer);
    BotsState.quizTimer = setInterval(() => { tryPostQuizAndAnnounce(); }, QAMAR.BOTS.QUIZ.intervalMs);
    console.log('🎯 Quiz bot started');
}

function startQuizListener() {
    if (!db) return;
    if (BotsState.quizListener) BotsState.quizListener.off();
    BotsState.quizListener = db.ref('bot_data/quiz/current');
    BotsState.quizListener.on('value', (snap) => {
        const q = snap.val();
        BotsState.currentQuiz = q;
        if (!q) return;
        if (BotsState.quizRevealTimeout) clearTimeout(BotsState.quizRevealTimeout);
        if (!q.revealed) {
            const delay = Math.max(1000, (q.startedAt + 60000) - Date.now());
            BotsState.quizRevealTimeout = setTimeout(tryRevealQuiz, delay);
        } else {
            const delay = Math.max(1000, (q.revealedAt + 60000) - Date.now());
            BotsState.quizRevealTimeout = setTimeout(tryPostQuizAndAnnounce, delay);
        }
    });
}

async function tryPostQuiz() {
    if (!db) return false;
    if (BotsState.quizQuestions.length === 0) return false;
    const random = BotsState.quizQuestions[Math.floor(Math.random() * BotsState.quizQuestions.length)];
    const now = Date.now();
    const newQuiz = {
        id: 'q_' + now + '_' + Math.random().toString(36).slice(2, 8),
        question: random.question,
        answer: random.answer.toLowerCase().trim(),
        originalAnswer: random.answer,
        startedAt: now, revealed: false, revealedAt: 0
    };
    try {
        const result = await db.ref('bot_data/quiz/current').transaction((current) => {
            const t = Date.now();
            if (!current) return newQuiz;
            if (current.revealed && t - (current.revealedAt || 0) > 60000) return newQuiz;
            if (!current.revealed && t - (current.startedAt || 0) > 90000) return newQuiz;
            return undefined;
        });
        return result.committed === true;
    } catch (e) { console.warn('Post quiz error:', e); return false; }
}

async function tryPostQuizAndAnnounce() {
    if (ChatState.currentRoom !== 'quiz') return;
    const ok = await tryPostQuiz();
    if (!ok) return;
    const snap = await db.ref('bot_data/quiz/current').once('value');
    const q = snap.val();
    if (!q) return;
    await sendBotMessage('الشاطر', `🎯 سؤال: ${q.question}`);
}

async function tryRevealQuiz() {
    if (!db) return;
    try {
        const result = await db.ref('bot_data/quiz/current').transaction((current) => {
            if (!current) return undefined;
            if (current.revealed) return undefined;
            if (Date.now() - (current.startedAt || 0) < 55000) return undefined;
            current.revealed = true;
            current.revealedAt = Date.now();
            return current;
        });
        if (result.committed) {
            const q = result.snapshot.val();
            await sendBotMessage('الشاطر', `⏱️ انتهى الوقت! الجواب: ${q.originalAnswer}`);
        }
    } catch (e) { console.warn('Reveal error:', e); }
}

async function checkQuizAnswer(text, user) {
    if (!db) return false;
    if (ChatState.currentRoom !== 'quiz') return false;
    let q;
    try {
        const snap = await db.ref('bot_data/quiz/current').once('value');
        q = snap.val();
    } catch (e) { return false; }
    if (!q || q.revealed) return false;
    const clean = text.toLowerCase().trim();
    if (clean !== q.answer) return false;

    const result = await db.ref('bot_data/quiz/winners/' + q.id).transaction((current) => {
        if (current) return undefined;
        return { uid: user.uid, name: user.name, at: Date.now() };
    });
    if (!result.committed) return true;

    await db.ref('bot_data/quiz/current').transaction((c) => {
        if (c && !c.revealed) { c.revealed = true; c.revealedAt = Date.now(); }
        return c;
    });
    await addQuizPoints(user.uid, 10);
    await sendBotMessage('الشاطر', `🎉 إجابة صحيحة! ${user.name} كسب 10 نقاط`);
    await sendBotMessage('الشاطر', `💡 الجواب: ${q.originalAnswer}`);
    return true;
}

async function addQuizPoints(uid, points) {
    try {
        await db.ref(`bot_data/quiz/scores/${uid}`).transaction(c => (c || 0) + points);
    } catch (e) { console.warn('Add points error:', e); }
}

// ==============================================
// 8. حكواتي
// ==============================================

function initHakawati() { console.log('📖 Hakawati ready'); }

async function hakawatiRespond(text, user) {
    if (!text || !user) return false;
    const lower = text.toLowerCase().trim();
    for (const r of BotsState.hakawatiResponses) {
        if (lower.includes(r.trigger.toLowerCase())) {
            await sendBotMessage('حكواتي الشام', r.reply);
            return true;
        }
    }
    if (lower.includes('صلاحيات') || lower.includes('صلاحية')) {
        await answerAboutPermissions(user);
        return true;
    }
    if (lower.includes('كيف') && (lower.includes('الموقع') || lower.includes('شات'))) {
        await sendBotMessage('حكواتي الشام', `${user.name}، اسألني عن أي شي بالموقع وسأساعدك 🌟`);
        return true;
    }
    return false;
}

async function answerAboutPermissions(user) {
    const rank = getRank(user.rank);
    const perms = [];
    if (user.rank === 'King') {
        perms.push('أنت الملك 👑 — كل الصلاحيات مطلقة');
    } else if (user.rank === 'Queen') {
        perms.push('أنت الملكة 👸 — صلاحياتك يحددها الملك');
    } else if (can(user, 'canDeleteRoomMessages')) {
        perms.push('✅ مسح رسائل روم كامل');
        if (can(user, 'canCreateRooms')) perms.push('✅ إنشاء/إزالة غرف');
        if (can(user, 'canPromote')) perms.push('✅ ترقية الرتب الأدنى');
    } else if (can(user, 'canKickFromMic')) {
        perms.push('✅ طرد من المايك (الأدنى منك)');
    } else if (can(user, 'canUseMic')) {
        perms.push('✅ استخدام المايك');
        perms.push('❌ لا صلاحيات إدارية');
    } else {
        perms.push('❌ لا صلاحيات إدارية');
        perms.push('💬 شات نصي فقط');
    }
    const msg = `📋 ${user.name} — رتبتك: ${rank.badge} ${user.rank}\n${perms.join('\n')}`;
    await sendBotMessage('حكواتي الشام', msg);
}

async function hakawatiWelcomeUser(user) {
    if (!user || !user.name) return;
    const welcomes = BotsState.hakawatiWelcome;
    if (welcomes.length === 0) return;
    const welcome = welcomes[Math.floor(Math.random() * welcomes.length)];
    await sendBotMessage('حكواتي الشام', `${user.name} ${welcome}`);
}

// ==============================================
// 9. إرسال رسالة بوت
// ==============================================

async function sendBotMessage(botName, text) {
    if (!db || !ChatState.currentRoom) return;
    const botData = Object.values(QAMAR.BOTS).find(b => b.name === botName);
    const bot = botData || { id: 'bot', name: botName, icon: '🤖', color: '#ffd700' };
    const colorHex = (bot.color || '#ffd700').replace('#', '');

    const messageData = {
        senderUid: 'bot_' + bot.id,
        senderName: bot.name,
        senderAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=222&color=${colorHex}&bold=true`,
        senderColor: bot.color,
        senderRank: 'Bot',
        text, mentions: [], replyTo: null,
        time: firebase.database.ServerValue.TIMESTAMP,
        edited: false, deleted: false,
        isBot: true, botIcon: bot.icon
    };

    try {
        await db.ref(`room_messages/${ChatState.currentRoom}`).push(messageData);
    } catch (e) { console.warn('Send bot message error:', e); }
}

// ==============================================
// 10. أوامر المستخدم
// ==============================================

async function handleBotCommand(text) {
    const user = getCurrentUser();
    if (!user) return false;
    const parts = text.trim().split(' ');
    const command = parts[0].toLowerCase();
    switch (command) {
        case '!نقاطي': await showMyPoints(user); return true;
        case '!المتصدرون': await showTopPlayers(); return true;
        case '!مسابقة':
            if (can(user, 'canTrainBots')) await tryPostQuizAndAnnounce();
            else showToast('fa-lock', '🔒 للملك/الملكة فقط');
            return true;
        case '!توقف':
            if (can(user, 'canTrainBots')) stopQuizBot();
            return true;
        case '!صلاحياتي': await answerAboutPermissions(user); return true;
        case '!مساعدة':
        case '!help': await showHelp(user); return true;
        default: return false;
    }
}

async function showMyPoints(user) {
    try {
        const snap = await db.ref(`bot_data/quiz/scores/${user.uid}`).once('value');
        const points = snap.val() || 0;
        await sendBotMessage('الشاطر', `🏆 ${user.name}، نقاطك: ${points}`);
    } catch (e) { console.warn(e); }
}

async function showTopPlayers() {
    try {
        const snap = await db.ref('bot_data/quiz/scores').orderByValue().limitToLast(10).once('value');
        const scores = [];
        snap.forEach(child => scores.push({ uid: child.key, points: child.val() }));
        if (scores.length === 0) {
            await sendBotMessage('الشاطر', '📊 لا توجد نقاط بعد');
            return;
        }
        scores.reverse();
        const lines = ['🏆 المتصدرون:'];
        for (let i = 0; i < scores.length; i++) {
            const nameSnap = await db.ref(`users/${scores[i].uid}/name`).once('value');
            const name = nameSnap.val() || 'مستخدم';
            lines.push(`${i + 1}. ${name} — ${scores[i].points} نقطة`);
        }
        await sendBotMessage('الشاطر', lines.join('\n'));
    } catch (e) { console.warn(e); }
}

function stopQuizBot() {
    if (BotsState.quizTimer) { clearInterval(BotsState.quizTimer); BotsState.quizTimer = null; }
    if (BotsState.quizRevealTimeout) { clearTimeout(BotsState.quizRevealTimeout); BotsState.quizRevealTimeout = null; }
    sendBotMessage('الشاطر', '⏸️ تم إيقاف المسابقات');
}

async function showHelp(user) {
    const help = [
        '📖 الأوامر المتاحة:',
        '• !نقاطي — عرض نقاطك',
        '• !المتصدرون — أفضل 10 لاعبين',
        '• !صلاحياتي — عرض صلاحياتك',
        '• !مسابقة — بدء مسابقة (للملك/الملكة)',
        '• !توقف — إيقاف المسابقات (للملك/الملكة)'
    ];
    await sendBotMessage('حكواتي الشام', help.join('\n'));
}

// ==============================================
// 11. معالجة الرسائل الواردة (v4 — قفل موزّع)
// ==============================================

async function processIncomingMessage(msg) {
    if (!msg || !msg.text) return;
    if (msg.isBot) return;
    if (msg.senderUid && msg.senderUid.startsWith('bot_')) return;

    const age = Date.now() - (msg.time || 0);
    if (age > 60000) return;

    // ✅ قفل موزّع — يمنع معالجة نفس الرسالة من عدة عملاء
    const msgId = msg._key || (msg.senderUid + '_' + (msg.time || Date.now()));
    const processLock = await tryAcquireLock('processed_' + msgId, 300000);
    if (!processLock) {
        console.log('⏭️ Message already processed:', msgId);
        return;
    }

    const senderUid = msg.senderUid;
    if (!senderUid) return;
    const sender = { uid: senderUid, name: msg.senderName, rank: msg.senderRank };

    const violation = guardianCheck(msg.text, sender);
    if (violation) {
        await applyGuardianAction(sender, violation.action, violation.reason, violation.word);
        return;
    }

    await checkQuizAnswer(msg.text, sender);

    if (age < 55000) {
        await hakawatiRespond(msg.text, sender);
    }
}

// ==============================================
// 12. تغيير الروم
// ==============================================

function onRoomChanged(newRoomId) {
    if (!db) return;
    if (newRoomId === 'quiz') {
        setTimeout(async () => {
            try {
                const snap = await db.ref('bot_data/quiz/current').once('value');
                const q = snap.val();
                const now = Date.now();
                const stale = !q
                    || (q.revealed && now - (q.revealedAt || 0) > 60000)
                    || (!q.revealed && now - (q.startedAt || 0) > 90000);
                if (stale) await tryPostQuizAndAnnounce();
            } catch (e) { console.warn(e); }
        }, 2000);
    }
    if (newRoomId === 'islamic') {
        setTimeout(() => { postIslamicContent(); }, 2000);
    }
}

// ==============================================
// 13. تصدير
// ==============================================

window.BotsState = BotsState;
window.initBots = initBots;
window.handleBotCommand = handleBotCommand;
window.processIncomingMessage = processIncomingMessage;
window.guardianCheck = guardianCheck;
window.jailUser = jailUser;
window.banUser = banUser;
window.hakawatiWelcomeUser = hakawatiWelcomeUser;
window.onRoomChanged = onRoomChanged;

console.log('✅ bots.js v4 loaded — Distributed Lock 🤖');
