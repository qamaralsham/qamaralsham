// ==============================================
// قمر الشام - البوتات الأربعة (v1)
// Qamar Al Sham - The Four Bots v1
// ==============================================
// البوتات:
//   1. السجان (Guardian) — حماية + كتم + سجن + طرد
//   2. الإسلامي (Islamic) — أدعية/أذكار كل 5 دقائق
//   3. المسابقات (Quiz) — سؤال كل 5 دقائق
//   4. حكواتي الشام (Hakawati) — ترحيب + مساعدة + تفاعل
// ==============================================

// ==============================================
// 1. حالة البوتات
// ==============================================

const BotsState = {
    initialized: false,
    
    // مؤقتات
    islamicTimer: null,
    quizTimer: null,
    
    // بيانات المسابقات
    currentQuiz: null,        // { question, answer, startedAt }
    quizRevealTimeout: null,
    
    // السجان — سجل المخالفات
    violationTracker: {},     // { uid: { count, lastTime, times: [] } },
    
    // الكلمات الممنوعة (تُحمَّل من Firebase)
    bannedWords: [],
    criticalWords: [],
    
    // ذاكرة حكواتي
    hakawatiResponses: [],
    hakawatiWelcome: [],
    
    // محتوى إسلامي
    islamicContent: {
        duas: [],
        adhkar: [],
        istighfar: [],
        prayers: []
    },
    
    // أسئلة المسابقات
    quizQuestions: []
};

// ==============================================
// 2. التهيئة
// ==============================================

async function initBots() {
    if (BotsState.initialized) return;
    
    console.log('🤖 Initializing bots...');
    
    try {
        // تحميل البيانات من Firebase
        await loadBotsData();
        
        // بدء المؤقتات
        startIslamicBot();
        startQuizBot();
        
        // بدء مراقبة السجان
        startGuardianBot();
        
        // تحميل حكواتي
        initHakawati();
        
        BotsState.initialized = true;
        console.log('✅ All bots initialized');
    } catch (e) {
        console.error('❌ Bots init error:', e);
    }
}

// ==============================================
// 3. تحميل بيانات البوتات من Firebase
// ==============================================

async function loadBotsData() {
    if (!db) return;
    
    try {
        // الكلمات الممنوعة
        const bannedSnap = await db.ref('config/banned_words').once('value');
        const banned = bannedSnap.val();
        if (banned) {
            BotsState.bannedWords = banned.words || banned.list || [];
            BotsState.criticalWords = banned.critical || [];
        }
        
        // إذا ما فيه كلمات، نستخدم الافتراضية
        if (BotsState.bannedWords.length === 0) {
            await seedDefaultBannedWords();
        }
        
        // محتوى إسلامي
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
        
        // إذا فاضي، نستخدم الافتراضي
        if (BotsState.islamicContent.duas.length === 0) {
            await seedDefaultIslamicContent();
        }
        
        // أسئلة المسابقات
        const quizSnap = await db.ref('bot_data/quiz/questions').once('value');
        const questions = quizSnap.val();
        if (questions) {
            BotsState.quizQuestions = Object.values(questions);
        }
        
        if (BotsState.quizQuestions.length === 0) {
            await seedDefaultQuizQuestions();
        }
        
        // ردود حكواتي
        const hakawatiSnap = await db.ref('bot_data/hakawati/responses').once('value');
        const responses = hakawatiSnap.val();
        if (responses) {
            BotsState.hakawatiResponses = Object.values(responses);
        }
        
        if (BotsState.hakawatiResponses.length === 0) {
            await seedDefaultHakawati();
        }
        
        const welcomeSnap = await db.ref('bot_data/hakawati/welcome').once('value');
        const welcome = welcomeSnap.val();
        if (welcome) {
            BotsState.hakawatiWelcome = Array.isArray(welcome) ? welcome : [welcome];
        }
        
        if (BotsState.hakawatiWelcome.length === 0) {
            BotsState.hakawatiWelcome = [
                'أهلاً وسهلاً 🌸',
                'نورت المكان 🌟',
                'مرحباً بك 👋',
                'يا هلا ومرحبا 💫'
            ];
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
    const defaultBanned = [
        'غبي', 'حمار', 'كلب', 'حقير', 'تافه',
        'قذر', 'وسخ', 'لعنة', 'يلعن', 'خرا'
    ];
    
    const defaultCritical = [
        'موت', 'اقتل', 'انتحر', 'سأقتلك', 'سأموت'
    ];
    
    BotsState.bannedWords = defaultBanned;
    BotsState.criticalWords = defaultCritical;
    
    try {
        await db.ref('config/banned_words').set({
            words: defaultBanned,
            critical: defaultCritical,
            updatedBy: getCurrentUser()?.uid || 'system',
            updatedAt: Date.now()
        });
    } catch (e) {
        console.warn('Seed banned words failed:', e);
    }
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
            duas: duas.reduce((acc, t, i) => ({ ...acc, ['d' + i]: t }), {}),
            adhkar: adhkar.reduce((acc, t, i) => ({ ...acc, ['a' + i]: t }), {}),
            istighfar: istighfar.reduce((acc, t, i) => ({ ...acc, ['i' + i]: t }), {}),
            prayers: prayers.reduce((acc, t, i) => ({ ...acc, ['p' + i]: t }), {})
        });
    } catch (e) {
        console.warn('Seed islamic failed:', e);
    }
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
            questions.reduce((acc, q, i) => ({ ...acc, ['q' + i]: q }), {})
        );
    } catch (e) {
        console.warn('Seed quiz failed:', e);
    }
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
            responses.reduce((acc, r, i) => ({ ...acc, ['r' + i]: r }), {})
        );
    } catch (e) {
        console.warn('Seed hakawati failed:', e);
    }
}

// ==============================================
// 5. السجان (Guardian) — كتم/سجن/طرد تلقائي
// ==============================================

function startGuardianBot() {
    // السجان لا يحتاج مؤقت — يعمل عند كل رسالة
    // سيتم استدعاؤه من chat.js عند استقبال رسالة جديدة
    console.log('👮 Guardian bot ready');
}

/**
 * فحص رسالة جديدة (يُستدعى من chat.js)
 * @returns {object|null} نتيجة الفحص: { action: 'warn'|'mute'|'jail'|'ban', reason, word }
 */
function guardianCheck(text, user) {
    if (!text || !user) return null;
    
    const lowerText = text.toLowerCase();
    
    // فحص الكلمات الحرجة (طرد فوري)
    for (const word of BotsState.criticalWords) {
        if (lowerText.includes(word.toLowerCase())) {
            return {
                action: 'ban',
                reason: `كلمة محظورة: ${word}`,
                word: word
            };
        }
    }
    
    // فحص الكلمات الممنوعة (كتم/سجن متدرج)
    for (const word of BotsState.bannedWords) {
        if (lowerText.includes(word.toLowerCase())) {
            return {
                action: 'mute',
                reason: `كلمة ممنوعة: ${word}`,
                word: word
            };
        }
    }
    
    return null;
}

/**
 * تطبيق العقوبة
 */
async function applyGuardianAction(user, action, reason, word) {
    const uid = user.uid;
    const now = Date.now();
    
    // تتبع المخالفات
    if (!BotsState.violationTracker[uid]) {
        BotsState.violationTracker[uid] = { count: 0, times: [] };
    }
    
    const tracker = BotsState.violationTracker[uid];
    
    // تنظيف المخالفات القديمة (> 10 دقائق)
    tracker.times = tracker.times.filter(t => now - t < QAMAR.JAIL.ESCALATION_WINDOW_MS);
    
    // إضافة المخالفة الحالية
    tracker.times.push(now);
    tracker.count = tracker.times.length;
    
    // حساب المدة
    let durationMs = QAMAR.JAIL.FIRST_OFFENSE_MS;
    if (tracker.count > 1) {
        durationMs = QAMAR.JAIL.FIRST_OFFENSE_MS * Math.pow(QAMAR.JAIL.ESCALATION_MULTIPLIER, tracker.count - 1);
    }
    
    // الحد الأقصى
    if (durationMs >= QAMAR.JAIL.MAX_AUTO_JAIL_MS) {
        // طرد مباشر
        await banUser(uid, user.name, 'تجاوز حد المخالفات', 'Guardian Bot');
        sendBotMessage('السجان', `🔨 تم طرد ${user.name} بسبب تكرار المخالفات`);
        return;
    }
    
    // كتم + سجن
    await jailUser(uid, user.name, reason, durationMs, 'Guardian Bot');
    
    const minutes = Math.ceil(durationMs / 60000);
    sendBotMessage('السجان', `🚔 تم سجن ${user.name} لمدة ${minutes} دقيقة — السبب: ${reason}`);
}

/**
 * سجن مستخدم
 */
async function jailUser(uid, name, reason, durationMs, byName) {
    if (!db) return;
    
    const until = Date.now() + durationMs;
    
    try {
        await db.ref(`jails/${uid}`).set({
            byUid: 'guardian_bot',
            byRank: byName || 'Bot',
            reason: reason,
            until: until,
            jailedAt: Date.now(),
            name: name
        });
        
        // إشعار
        await db.ref(`user_notifications/${uid}`).push({
            fromUid: 'system',
            fromName: byName || 'النظام',
            type: 'jail',
            preview: `تم سجنك: ${reason} — لمدة ${Math.ceil(durationMs / 60000)} دقيقة`,
            time: Date.now(),
            read: false
        });
        
        // جدولة فك السجن
        scheduleUnjail(uid, durationMs);
    } catch (e) {
        console.warn('Jail error:', e);
    }
}

/**
 * جدولة فك السجن تلقائياً
 */
function scheduleUnjail(uid, durationMs) {
    setTimeout(async () => {
        try {
            const snap = await db.ref(`jails/${uid}`).once('value');
            const jail = snap.val();
            
            // تأكد أنه ما زال نفس السجن
            if (jail && jail.until <= Date.now()) {
                await db.ref(`jails/${uid}`).remove();
                sendBotMessage('السجان', `🔓 تم فك السجن عن ${jail.name || 'مستخدم'}`);
            }
        } catch (e) {
            console.warn('Unjail error:', e);
        }
    }, durationMs + 1000);
}

/**
 * بان (طرد دائم)
 */
async function banUser(uid, name, reason, byName) {
    if (!db) return;
    
    try {
        await db.ref(`bans/${uid}`).set({
            byUid: 'guardian_bot',
            byRank: byName || 'Bot',
            reason: reason,
            time: Date.now(),
            name: name
        });
        
        await db.ref(`user_notifications/${uid}`).push({
            fromUid: 'system',
            fromName: byName || 'النظام',
            type: 'system',
            preview: `تم حظرك: ${reason}`,
            time: Date.now(),
            read: false
        });
    } catch (e) {
        console.warn('Ban error:', e);
    }
}

// ==============================================
// 6. الإسلامي (Islamic) — كل 5 دقائق
// ==============================================

function startIslamicBot() {
    if (BotsState.islamicTimer) clearInterval(BotsState.islamicTimer);
    
    // كل 5 دقائق
    BotsState.islamicTimer = setInterval(async () => {
        await postIslamicContent();
    }, QAMAR.BOTS.ISLAMIC.intervalMs);
    
    console.log('🕌 Islamic bot started (5 min interval)');
}

async function postIslamicContent() {
    // فقط في روم الإسلاميات
    if (ChatState.currentRoom !== 'islamic') return;
    
    const content = BotsState.islamicContent;
    const categories = [];
    
    if (content.duas.length > 0) categories.push('duas');
    if (content.adhkar.length > 0) categories.push('adhkar');
    if (content.istighfar.length > 0) categories.push('istighfar');
    if (content.prayers.length > 0) categories.push('prayers');
    
    if (categories.length === 0) return;
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const list = content[category];
    const text = list[Math.floor(Math.random() * list.length)];
    
    const prefix = {
        duas: '🤲 دعاء:',
        adhkar: '📿 ذكر:',
        istighfar: '🤲 استغفار:',
        prayers: 'ﷺ صلاة على النبي:'
    };
    
    await sendBotMessage('البوت الإسلامي', `${prefix[category]} ${text}`);
}

// ==============================================
// 7. المسابقات (Quiz) — سؤال كل 5 دقائق
// ==============================================

function startQuizBot() {
    if (BotsState.quizTimer) clearInterval(BotsState.quizTimer);
    
    BotsState.quizTimer = setInterval(async () => {
        await postQuizQuestion();
    }, QAMAR.BOTS.QUIZ.intervalMs);
    
    console.log('🎯 Quiz bot started (5 min interval)');
}

async function postQuizQuestion() {
    // فقط في روم المسابقات
    if (ChatState.currentRoom !== 'quiz') return;
    
    if (BotsState.quizQuestions.length === 0) return;
    
    // لا تسأل إذا فيه سؤال نشط
    if (BotsState.currentQuiz && !BotsState.currentQuiz.revealed) return;
    
    const random = BotsState.quizQuestions[Math.floor(Math.random() * BotsState.quizQuestions.length)];
    
    BotsState.currentQuiz = {
        question: random.question,
        answer: random.answer.toLowerCase().trim(),
        originalAnswer: random.answer,
        startedAt: Date.now(),
        revealed: false
    };
    
    await sendBotMessage('بوت المسابقات', `🎯 سؤال: ${random.question}`);
    
    // جدولة إعلان الجواب بعد دقيقة
    if (BotsState.quizRevealTimeout) clearTimeout(BotsState.quizRevealTimeout);
    BotsState.quizRevealTimeout = setTimeout(() => {
        revealQuizAnswer();
    }, 60000);
}

async function revealQuizAnswer() {
    if (!BotsState.currentQuiz || BotsState.currentQuiz.revealed) return;
    
    BotsState.currentQuiz.revealed = true;
    
    await sendBotMessage('بوت المسابقات', `⏱️ انتهى الوقت! الجواب: ${BotsState.currentQuiz.originalAnswer}`);
    
    // انتظر دقيقة ثم اسأل سؤال جديد
    setTimeout(() => {
        BotsState.currentQuiz = null;
        postQuizQuestion();
    }, 60000);
}

/**
 * فحص إجابة مستخدم (يُستدعى من chat.js)
 */
async function checkQuizAnswer(text, user) {
    if (!BotsState.currentQuiz || BotsState.currentQuiz.revealed) return false;
    if (ChatState.currentRoom !== 'quiz') return false;
    
    const cleanText = text.toLowerCase().trim();
    
    if (cleanText === BotsState.currentQuiz.answer) {
        // إجابة صحيحة!
        BotsState.currentQuiz.revealed = true;
        
        // إضافة نقاط
        await addQuizPoints(user.uid, 10);
        
        await sendBotMessage('بوت المسابقات', `🎉 إجابة صحيحة! ${user.name} كسب 10 نقاط`);
        await sendBotMessage('بوت المسابقات', `💡 الجواب: ${BotsState.currentQuiz.originalAnswer}`);
        
        // سؤال جديد بعد دقيقة
        if (BotsState.quizRevealTimeout) clearTimeout(BotsState.quizRevealTimeout);
        BotsState.quizRevealTimeout = setTimeout(() => {
            BotsState.currentQuiz = null;
            postQuizQuestion();
        }, 60000);
        
        return true;
    }
    
    return false;
}

async function addQuizPoints(uid, points) {
    try {
        const ref = db.ref(`bot_data/quiz/scores/${uid}`);
        await ref.transaction(current => (current || 0) + points);
    } catch (e) {
        console.warn('Add points error:', e);
    }
}

// ==============================================
// 8. حكواتي الشام (Hakawati)
// ==============================================

function initHakawati() {
    console.log('📖 Hakawati ready');
}

/**
 * رد حكواتي على رسالة (يُستدعى من chat.js)
 */
async function hakawatiRespond(text, user) {
    if (!text || !user) return false;
    
    const lowerText = text.toLowerCase().trim();
    
    // 1. فحص الردود المبرمجة
    for (const response of BotsState.hakawatiResponses) {
        if (lowerText.includes(response.trigger.toLowerCase())) {
            await sendBotMessage('حكواتي الشام', response.reply);
            return true;
        }
    }
    
    // 2. أسئلة عن الصلاحيات
    if (lowerText.includes('صلاحيات') || lowerText.includes('صلاحية')) {
        await answerAboutPermissions(user);
        return true;
    }
    
    // 3. أسئلة عن الموقع
    if (lowerText.includes('كيف') && (lowerText.includes('الموقع') || lowerText.includes('شات'))) {
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

/**
 * ترحيب عند دخول عضو للروم
 */
async function hakawatiWelcomeUser(user) {
    if (!user || !user.name) return;
    
    const welcomes = BotsState.hakawatiWelcome;
    if (welcomes.length === 0) return;
    
    const welcome = welcomes[Math.floor(Math.random() * welcomes.length)];
    const text = welcome.replace('{name}', user.name);
    
    await sendBotMessage('حكواتي الشام', `${user.name} ${welcome}`);
}

// ==============================================
// 9. إرسال رسالة من بوت
// ==============================================

async function sendBotMessage(botName, text) {
    if (!db) return;
    if (!ChatState.currentRoom) return;
    
    const botData = Object.values(QAMAR.BOTS).find(b => b.name === botName) || {
        id: 'bot',
        name: botName,
        icon: '🤖',
        color: '#ffd700'
    };
    
    const messageData = {
        senderUid: 'bot_' + botData.id,
        senderName: botData.name,
        senderAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(botData.name)}&background=222&color=${botData.color.replace('#', '')}&bold=true`,
        senderColor: botData.color,
        senderRank: 'Bot',
        text: text,
        mentions: [],
        replyTo: null,
        time: firebase.database.ServerValue.TIMESTAMP,
        edited: false,
        deleted: false,
        isBot: true,
        botIcon: botData.icon
    };
    
    const ref = db.ref(`room_messages/${ChatState.currentRoom}`).push();
    await ref.set(messageData);
}

// ==============================================
// 10. معالجة أوامر البوت (من المستخدم)
// ==============================================

async function handleBotCommand(text) {
    const user = getCurrentUser();
    if (!user) return;
    
    const parts = text.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    switch (command) {
        case '!نقاطي':
            await showMyPoints(user);
            break;
            
        case '!المتصدرون':
            await showTopPlayers();
            break;
            
        case '!مسابقة':
            if (can(user, 'canTrainBots')) {
                await postQuizQuestion();
            } else {
                showToast('fa-lock', '🔒 للملك/الملكة فقط');
            }
            break;
            
        case '!توقف':
            if (can(user, 'canTrainBots')) {
                stopQuizBot();
            }
            break;
            
        case '!صلاحياتي':
            await answerAboutPermissions(user);
            break;
            
        case '!مساعدة':
        case '!help':
            await showHelp(user);
            break;
            
        default:
            // ليس أمر بوت
            return false;
    }
    
    return true;
}

async function showMyPoints(user) {
    try {
        const snap = await db.ref(`bot_data/quiz/scores/${user.uid}`).once('value');
        const points = snap.val() || 0;
        await sendBotMessage('بوت المسابقات', `🏆 ${user.name}، نقاطك: ${points}`);
    } catch (e) {
        console.warn(e);
    }
}

async function showTopPlayers() {
    try {
        const snap = await db.ref('bot_data/quiz/scores').orderByValue().limitToLast(10).once('value');
        const scores = [];
        snap.forEach(child => {
            scores.push({ uid: child.key, points: child.val() });
        });
        
        if (scores.length === 0) {
            await sendBotMessage('بوت المسابقات', '📊 لا توجد نقاط بعد');
            return;
        }
        
        scores.reverse();
        const lines = ['🏆 المتصدرون:'];
        for (let i = 0; i < scores.length; i++) {
            const uid = scores[i].uid;
            const userSnap = await db.ref(`users/${uid}/name`).once('value');
            const name = userSnap.val() || 'مستخدم';
            lines.push(`${i + 1}. ${name} — ${scores[i].points} نقطة`);
        }
        
        await sendBotMessage('بوت المسابقات', lines.join('\n'));
    } catch (e) {
        console.warn(e);
    }
}

function stopQuizBot() {
    if (BotsState.quizTimer) {
        clearInterval(BotsState.quizTimer);
        BotsState.quizTimer = null;
    }
    if (BotsState.quizRevealTimeout) {
        clearTimeout(BotsState.quizRevealTimeout);
        BotsState.quizRevealTimeout = null;
    }
    BotsState.currentQuiz = null;
    sendBotMessage('بوت المسابقات', '⏸️ تم إيقاف المسابقات');
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
// 11. تفاعل السجان مع الرسائل الجديدة
// ==============================================

/**
 * يُستدعى من chat.js عند استقبال رسالة جديدة
 */
async function processIncomingMessage(msg) {
    if (!msg || !msg.text) return;
    if (msg.isBot) return;
    if (msg.senderUid && msg.senderUid.startsWith('bot_')) return;
    
    // جلب بيانات المرسل
    const senderUid = msg.senderUid;
    if (!senderUid) return;
    
    // فحص السجان
    const sender = { uid: senderUid, name: msg.senderName, rank: msg.senderRank };
    const violation = guardianCheck(msg.text, sender);
    
    if (violation) {
        // 🔴 نعالج المخالفة
        await applyGuardianAction(sender, violation.action, violation.reason, violation.word);
        return; // ← لا نعالج باقي البوتات إذا فيه مخالفة
    }
    
    // فحص المسابقات
    await checkQuizAnswer(msg.text, sender);
    
    // فحص حكواتي
    await hakawatiRespond(msg.text, sender);
}

// ==============================================
// 12. إعادة تشغيل عند تغيير الروم
// ==============================================

function onRoomChanged(newRoomId) {
    // إذا انتقل لروم المسابقات، ابدأ المسابقة بعد قليل
    if (newRoomId === 'quiz') {
        setTimeout(() => {
            if (!BotsState.currentQuiz) postQuizQuestion();
        }, 3000);
    }
    
    // إذا انتقل لروم الإسلاميات، انشر محتوى
    if (newRoomId === 'islamic') {
        setTimeout(() => {
            postIslamicContent();
        }, 3000);
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

console.log('✅ bots.js v1 loaded — 4 bots ready 🤖');
