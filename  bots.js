// ==============================================
// قمر الشام — البوتات (v4)
// Qamar Al Sham — Bots v4
// ==============================================
// ✅ يعمل مع chat.js v2.5 و auth.js v8.2
// - initBots()       → عند بدء الشات
// - handleBotCommand(text) → عند كتابة !أمر
// - processIncomingMessage(msg) → عند كل رسالة
// - onRoomChanged(roomId) → عند تبديل الغرفة
// ==============================================

const BotsState = {
    initialized: false,
    intervals: {},
    currentQuiz: null,
    quizTimeout: null,
    lastPostAt: {},
    badWords: ['كلمة1', 'كلمة2'] // ← عدّل هذه القائمة لاحقًا
};

// ==============================================
// 1. التهيئة
// ==============================================
function initBots() {
    if (BotsState.initialized) return;
    BotsState.initialized = true;
    console.log('🤖 Bots v4 initialized');

    const user = getCurrentUser();
    if (!user) return;

    // البوتات التلقائية — فقط للملك/الملكة
    if (user.rank === 'King' || user.rank === 'Queen') {
        startAutoBots();
    }
}

// ==============================================
// 2. البوتات التلقائية
// ==============================================
function startAutoBots() {
    // قمر الشام — كل 5 دقائق
    BotsState.intervals.islamic = setInterval(() => {
        postIslamicContent();
    }, 5 * 60 * 1000);

    // الشاطر — كل 5 دقائق
    BotsState.intervals.quiz = setInterval(() => {
        postQuizQuestion();
    }, 5 * 60 * 1000);

    console.log('🤖 Auto-bots started');
}

// ==============================================
// 3. نشر رسالة بوت
// ==============================================
async function postBotMessage(botKey, text, roomId) {
    if (!db) return;

    const bot = QAMAR.BOTS[botKey.toUpperCase()];
    if (!bot) {
        console.warn('Bot not found:', botKey);
        return;
    }

    const targetRoom = roomId || ChatState.currentRoom || 'general';

    const messageData = {
        senderUid: 'bot_' + bot.id,
        senderName: bot.name,
        senderCode: null,
        senderAvatar: '',
        senderColor: bot.color,
        senderRank: 'Bot',
        senderFrame: 'none',
        isBot: true,
        text: text,
        mentions: [],
        replyTo: null,
        time: firebase.database.ServerValue.TIMESTAMP,
        edited: false,
        deleted: false
    };

    try {
        await db.ref('room_messages/' + targetRoom).push(messageData);
        console.log('🤖 Bot posted:', bot.name, '→', targetRoom);
    } catch (e) {
        console.warn('Bot post failed:', e);
    }
}

// ==============================================
// 4. البوت الإسلامي — قمر الشام
// ==============================================
const ISLAMIC_CONTENT = [
    '🌙 اللهم صلِّ وسلِّم على نبينا محمد ﷺ',
    '📿 سبحان الله وبحمده، سبحان الله العظيم',
    '🤲 أستغفر الله العظيم وأتوب إليه',
    '✨ لا حول ولا قوة إلا بالله',
    '🌿 اللهم إني أسألك الجنة وأعوذ بك من النار',
    '💫 اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
    '🕌 اللهم اغفر لي ولوالديّ وللمؤمنين والمؤمنات',
    '🌅 أذكار الصباح: أصبحنا وأصبح الملك لله',
    '🌙 أذكار المساء: أمسينا وأمسى الملك لله',
    '📖 قال ﷺ: من قال لا إله إلا الله وحده لا شريك له...',
    '🤍 قال ﷺ: خيركم من تعلم القرآن وعلمه',
    '🌸 اللهم بلّغنا رمضان وأعنا على صيامه وقيامه'
];

function postIslamicContent() {
    const text = ISLAMIC_CONTENT[Math.floor(Math.random() * ISLAMIC_CONTENT.length)];
    postBotMessage('islamic', text, 'general');
}

// ==============================================
// 5. بوت المسابقات — الشاطر
// ==============================================
const QUIZ_QUESTIONS = [
    { q: 'ما هي أطول سورة في القرآن الكريم؟', a: 'البقرة' },
    { q: 'كم عدد أركان الإسلام؟', a: '5' },
    { q: 'ما عاصمة سوريا؟', a: 'دمشق' },
    { q: 'ما هي أكبر قارة في العالم؟', a: 'آسيا' },
    { q: 'كم عدد أيام السنة الميلادية؟', a: '365' },
    { q: 'ما هو الكوكب الأحمر؟', a: 'المريخ' },
    { q: 'من هو أول خليفة في الإسلام؟', a: 'أبو بكر' },
    { q: 'ما هي أصغر وحدة في الكائن الحي؟', a: 'الخلية' },
    { q: 'كم عدد قارات العالم؟', a: '7' },
    { q: 'ما أطول نهر في العالم؟', a: 'النيل' },
    { q: 'ما هي عملة اليابان؟', a: 'الين' },
    { q: 'من اخترع المصباح الكهربائي؟', a: 'إديسون' }
];

function postQuizQuestion() {
    const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

    const text = '🎯 سؤال جديد!\n\n' + q.q + '\n\n⏳ أول إجابة صحيحة = 10 نقاط';

    BotsState.currentQuiz = {
        question: q.q,
        answer: q.a.toLowerCase().trim(),
        points: 10,
        startedAt: Date.now(),
        answered: false
    };

    postBotMessage('quiz', text, 'quiz');

    if (BotsState.quizTimeout) clearTimeout(BotsState.quizTimeout);
    BotsState.quizTimeout = setTimeout(() => {
        if (BotsState.currentQuiz && !BotsState.currentQuiz.answered) {
            postBotMessage('quiz', '💡 الإجابة الصحيحة: ' + q.a, 'quiz');
            BotsState.currentQuiz = null;
        }
    }, 60000);
}

// ==============================================
// 6. معالجة الأوامر (!)
// ==============================================
function handleBotCommand(text) {
    const user = getCurrentUser();
    if (!user) return;

    const cmd = text.slice(1).trim();
    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    console.log('🤖 Bot command:', command);

    switch (command) {
        case 'مساعدة':
        case 'help':
        case 'اوامر':
        case 'أوامر':
            showBotHelp();
            break;
        case 'نقاطي':
        case 'نقاط':
            showUserPoints(user.uid);
            break;
        case 'دعاء':
            postBotMessage('islamic', ISLAMIC_CONTENT[Math.floor(Math.random() * ISLAMIC_CONTENT.length)]);
            break;
        case 'نكتة':
            postJoke();
            break;
        case 'سؤال':
            postQuizQuestion();
            break;
        case 'حكواتي':
            if (args) {
                postBotMessage('hakawati', '📖 سؤالك: ' + args + '\n\n' + getHakawatiAnswer(args));
            } else {
                postBotMessage('hakawati', '📖 اكتب سؤالك بعد "حكواتي" — مثال: حكواتي كيف أستخدم الموقع؟');
            }
            break;
        default:
            postBotMessage('hakawati', '❓ أمر غير معروف: ' + command + '\nاكتب !مساعدة لعرض الأوامر');
    }
}

function showBotHelp() {
    const help = `🌙 قمر الشام — قائمة الأوامر

📖 عامة:
• !مساعدة — هذه القائمة
• !نقاطي — عرض نقاطك
• !نكتة — نكتة عشوائية
• !دعاء — دعاء عشوائي
• !حكواتي سؤالك — اسأل حكواتي

🎯 المسابقات:
• !سؤال — سؤال مسابقة جديد`;

    postBotMessage('hakawati', help);
}

async function showUserPoints(uid) {
    try {
        const snap = await db.ref('bot_data/quiz/scores/' + uid).once('value');
        const points = snap.val() || 0;
        const level = Math.floor(points / 100) + 1;
        postBotMessage('quiz', '🏆 نقاطك: ' + points + '\n⭐ مستواك: ' + level);
    } catch (e) {
        postBotMessage('quiz', '⚠️ لم أستطع قراءة نقاطك');
    }
}

const JOKES = [
    'واحد راح للطبيب قاله: يا دكتور، كل ما آكل بيض، تطلع لي بقع في وجهي. قاله: جرب آكل بيض بيض! 🥚',
    'مرة واحد بلع ساعة. صار كل ما ياكل، يطلع له صوت "تيك توك"! ⏰😂',
    'سألوا الحمار: ليش ما تتعلم تقرا؟ قال: أخاف أقرا نعيي! 📚',
    'واحد ركب تكسي، قاله للسواق: بسرعة! قاله: آسف، هاي سيارة مو زورق! 🚗',
    'قالوا للبروفيسور: عطيني مثال على الصدفة. قال: لو صار فيلم بالسينما وبطل الفيلم صدفة! 😂'
];

function postJoke() {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    postBotMessage('hakawati', '😄 ' + joke);
}

function getHakawatiAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes('كيف') && (q.includes('دخول') || q.includes('سجل'))) {
        return '📝 لتسجيل الدخول: اختر "زائر" أو "عضو"، املأ البيانات، واضغط الدخول.';
    }
    if (q.includes('رتب') || q.includes('رتبة')) {
        return '👑 الرتب من الأعلى: الملك ← الملكة ← Master Owner ← Room Owner ← Grand Owner ← Owner ← Super Admin ← Admin ← Premium ← User';
    }
    if (q.includes('كود') || q.includes('تعريف')) {
        return '🔑 كود التعريف الخاص بك موجود في تبويب "المعلومات" — شاركه مع أصدقائك.';
    }
    if (q.includes('بروفايل') || q.includes('ملف')) {
        return '👤 افتح بروفايلك من الزر "بروفايلي" في الشريط السفلي.';
    }
    if (q.includes('روم') || q.includes('غرفة')) {
        return '🚪 الغرف في القائمة الجانبية — كل غرفة لها موضوع مختلف.';
    }
    if (q.includes('خاص') || q.includes('رسائل خاصة')) {
        return '💬 اضغط أيقونة الرسائل في الهيدر — أو اضغط على اسم أي مستخدم لفتح الخاص.';
    }

    return '🤔 لم أجد إجابة محددة. جرّب صياغة أخرى أو اكتب !مساعدة.';
}

// ==============================================
// 7. معالجة الرسائل الواردة
// ==============================================
async function processIncomingMessage(msg) {
    if (!msg || msg.isBot) return;

    // 1. فحص الكلمات الممنوعة
    if (msg.text && containsBadWords(msg.text)) {
        await handleBadWord(msg);
        return;
    }

    // 2. فحص إجابة المسابقة
    if (BotsState.currentQuiz && !BotsState.currentQuiz.answered && msg.text) {
        const answer = msg.text.trim().toLowerCase();
        if (answer === BotsState.currentQuiz.answer) {
            BotsState.currentQuiz.answered = true;
            await awardQuizPoints(msg.senderUid, msg.senderName, BotsState.currentQuiz.points);
            postBotMessage('quiz', '🎉 إجابة صحيحة! ' + msg.senderName + ' — +' + BotsState.currentQuiz.points + ' نقطة');
            BotsState.currentQuiz = null;
        }
    }
}

function containsBadWords(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return BotsState.badWords.some(w => w && lower.includes(w.toLowerCase()));
}

async function handleBadWord(msg) {
    try {
        await db.ref('users/' + msg.senderUid + '/warnings').transaction(c => (c || 0) + 1);
        postBotMessage('guardian', '🚔 تحذير لـ ' + msg.senderName + '\n❌ استخدام كلمات ممنوعة.');
    } catch (e) {
        console.warn('Bad word handling failed:', e);
    }
}

async function awardQuizPoints(uid, name, points) {
    try {
        await db.ref('bot_data/quiz/scores/' + uid).transaction(c => (c || 0) + points);
    } catch (e) {
        console.warn('Award points failed:', e);
    }
}

// ==============================================
// 8. تغيير الغرفة
// ==============================================
function onRoomChanged(roomId) {
    if (roomId !== 'quiz' && BotsState.quizTimeout) {
        clearTimeout(BotsState.quizTimeout);
        BotsState.quizTimeout = null;
        BotsState.currentQuiz = null;
    }
}

// ==============================================
// 9. التنظيف
// ==============================================
function stopBots() {
    Object.values(BotsState.intervals).forEach(iv => clearInterval(iv));
    BotsState.intervals = {};
    if (BotsState.quizTimeout) clearTimeout(BotsState.quizTimeout);
    BotsState.initialized = false;
    console.log('🤖 Bots stopped');
}

// ==============================================
// 10. تصدير
// ==============================================
window.initBots = initBots;
window.handleBotCommand = handleBotCommand;
window.processIncomingMessage = processIncomingMessage;
window.onRoomChanged = onRoomChanged;
window.stopBots = stopBots;

console.log('🤖 bots.js v4 loaded');