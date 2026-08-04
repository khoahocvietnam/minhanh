// ================= KẾT NỐI SUPABASE =================
const SUPABASE_URL = 'https://ifhskkqjttkucirpztsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaHNra3FqdHRrdWNpcnB6dHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjk2NzksImV4cCI6MjEwMTQwNTY3OX0.n1sMPDMMRTcM72XKWyVKZJg3H67KPnSQHv03NKi8i3M';

const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let userName = "Sĩ tử";
let userTarget = "Sĩ tử 2K7 • Mục tiêu 9+ Tiếng Anh";
let userXP = 850;
let streak = 7;

// ================= AUTHENTICATION & CLOUD SYNC =================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await dbClient.auth.getSession();
        if (session && session.user) {
            currentUser = session.user;
            await fetchUserData();
            showHomeScreen();
        } else {
            showAuthScreen();
        }
    } catch (err) {
        showAuthScreen();
    }
});

async function handleRegister() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if(!email || !password) return alert("Vui lòng nhập đầy đủ email và mật khẩu!");

    const { error } = await dbClient.auth.signUp({ email, password });
    if (error) alert("Lỗi đăng ký: " + error.message);
    else alert("🎉 Đăng ký thành công! Hãy bấm Đăng nhập ngay.");
}

async function handleLogin() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if(!email || !password) return alert("Vui lòng nhập đầy đủ email và mật khẩu!");

    const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
    if (error) alert("Đăng nhập thất bại: " + error.message);
    else {
        currentUser = data.user;
        await fetchUserData();
        showHomeScreen();
    }
}

async function handleLogout() {
    await dbClient.auth.signOut();
    currentUser = null;
    showAuthScreen();
}

function showAuthScreen() {
    document.getElementById('screen-auth').classList.remove('hidden');
    document.getElementById('screen-home').classList.add('hidden');
    document.getElementById('bottom-nav').style.transform = 'translateY(100%)';
}

function showHomeScreen() {
    document.getElementById('screen-auth').classList.add('hidden');
    goHome();
}

async function fetchUserData() {
    if (!currentUser) return;
    try {
        const { data, error } = await dbClient.from('profiles').select('*').eq('id', currentUser.id).single();
        if (error || !data) {
            await dbClient.from('profiles').insert([{ id: currentUser.id, full_name: currentUser.email.split('@')[0], target: userTarget, streak: 7, xp: 850 }]);
        } else {
            userName = data.full_name || currentUser.email.split('@')[0];
            userTarget = data.target || "Sĩ tử 2K7";
            userXP = data.xp || 850;
            streak = data.streak || 7;
        }
        updateDynamicUI();
    } catch (err) {}
}

async function saveStateToCloud() {
    if (!currentUser) return;
    try {
        await dbClient.from('profiles').update({ full_name: userName, target: userTarget, xp: userXP, streak: streak, updated_at: new Date() }).eq('id', currentUser.id);
    } catch (err) {}
}

function updateDynamicUI() {
    ['greeting-name', 'profile-name'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = userName;
    });
    const avatar = document.getElementById('profile-avatar');
    if(avatar) avatar.innerText = userName.substring(0, 2).toUpperCase() || 'SZ';
    
    ['xp-display', 'stats-xp'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = userXP;
    });
}

async function updateXP(amount) {
    userXP += amount;
    updateDynamicUI();
    await saveStateToCloud();
}

// ================= ĐIỀU HƯỚNG MÀN HÌNH =================
function openScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('screen-enter');
    }
    if(screenId !== 'screen-home' && screenId !== 'screen-auth') {
        document.getElementById('bottom-nav').style.transform = 'translateY(100%)';
    }
}

function goHome() {
    document.querySelectorAll('.app-screen').forEach(el => el.classList.add('hidden'));
    document.getElementById('screen-home').classList.remove('hidden');
    document.getElementById('bottom-nav').style.transform = 'translateY(0)';
}

// ================= NGÂN HÀNG CÂU HỎI MỞ RỘNG KHỔNG LỒ (>60 CÂU) =================
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const aiQuestionBank = {
    grammar: {
        "Thì và sự phối hợp thì": [
            { q: "By the time the teacher tomorrow, we will have finished our essay.", options: ["arrive", "arrives", "arrived", "will arrive"], ans: 1 },
            { q: "She in this city for 10 years before she moved to London in 2020.", options: ["has lived", "had lived", "was living", "lives"], ans: 1 },
            { q: "While my mother dinner, my father was reading the newspaper.", options: ["cooks", "cooked", "was cooking", "has cooked"], ans: 2 },
            { q: "Up to the present, the scientist several new species in the rainforest.", options: ["discovers", "discovered", "has discovered", "had discovered"], ans: 2 },
            { q: "Right now, Nam for his final physics examination in the library.", options: ["prepares", "is preparing", "prepared", "has prepared"], ans: 1 },
            { q: "I will call you as soon as I at the hotel.", options: ["will arrive", "arrived", "arrive", "am arriving"], ans: 2 },
            { q: "They for three hours when the storm suddenly hit.", options: ["were driving", "have driven", "had been driving", "drove"], ans: 2 },
            { q: "It is the first time I such a beautiful sunset.", options: ["saw", "have seen", "see", "had seen"], ans: 1 },
            { q: "When I came to the party, Mary home.", options: ["has gone", "had gone", "went", "was going"], ans: 1 },
            { q: "He always about the noise from the neighbors. It's so annoying!", options: ["complains", "is complaining", "complained", "has complained"], ans: 1 },
            { q: "Next month, they married for 25 years.", options: ["will be", "are", "will have been", "have been"], ans: 2 },
            { q: "I the book you lent me, but I haven't finished it yet.", options: ["read", "have read", "am reading", "have been reading"], ans: 3 }
        ],
        "Câu điều kiện và mệnh đề giả định": [
            { q: "If I you were coming, I would have baked a cake.", options: ["know", "knew", "had known", "would know"], ans: 2 },
            { q: "It is essential that every student their assignment on time.", options: ["submits", "submit", "submitted", "will submit"], ans: 1 },
            { q: "If she studies hard, she the entrance exam easily.", options: ["passed", "would pass", "will pass", "passes"], ans: 2 },
            { q: "Were I in your position, I responsibility for the mistake.", options: ["will take", "would take", "take", "took"], ans: 1 },
            { q: "Provided that you hard, you will achieve your target score.", options: ["study", "studied", "will study", "have studied"], ans: 0 },
            { q: "But for his help, I the project yesterday.", options: ["couldn't finish", "didn't finish", "couldn't have finished", "hadn't finished"], ans: 2 },
            { q: "I suggest that the doctor available at all times.", options: ["be", "is", "was", "will be"], ans: 0 },
            { q: "If it had not rained, we camping.", options: ["would go", "will go", "would have gone", "went"], ans: 2 },
            { q: "I would rather you smoking in this room.", options: ["stop", "stopped", "stopping", "had stopped"], ans: 1 },
            { q: "Without oxygen, all living creatures on Earth.", options: ["would die", "will die", "died", "had died"], ans: 0 },
            { q: "It's high time you to study seriously for the university entrance exam.", options: ["start", "started", "starting", "to start"], ans: 1 },
            { q: "Unless you apologize, she never forgive you.", options: ["will", "won't", "would", "wouldn't"], ans: 0 }
        ],
        "Câu bị động và đảo ngữ": [
            { q: "Hardly closed his eyes when the telephone rang.", options: ["he had", "had he", "did he", "he did"], ans: 1 },
            { q: "A new shopping mall in our town next month.", options: ["will build", "will be built", "is building", "built"], ans: 1 },
            { q: "Only when you practice every day fluent in English.", options: ["you can become", "can you become", "you will become", "become you"], ans: 1 },
            { q: "Not until she arrived home that she had left her keys at the office.", options: ["she realized", "did she realize", "realized she", "that she realized"], ans: 1 },
            { q: "English as a global language in many international schools.", options: ["is teaching", "is taught", "teaches", "has taught"], ans: 1 },
            { q: "Scarcely the house when it started to rain heavily.", options: ["I had left", "did I leave", "had I left", "I left"], ans: 2 },
            { q: "The students to finish the test in 45 minutes.", options: ["were told", "told", "were telling", "have told"], ans: 0 },
            { q: "Never before such a magnificent waterfall.", options: ["I have seen", "do I see", "have I seen", "I saw"], ans: 2 },
            { q: "It that the building was destroyed by fire.", options: ["believed", "is believing", "was believed", "believes"], ans: 2 },
            { q: "No sooner the door than the dog rushed out.", options: ["had he opened", "he had opened", "did he open", "he opened"], ans: 0 },
            { q: "The room before the guests arrive tonight.", options: ["must clean", "must be cleaned", "must have cleaned", "is cleaning"], ans: 1 },
            { q: "At no time during the test to use your phone.", options: ["you are allowed", "are you allowed", "do you allow", "you allow"], ans: 1 }
        ]
    },
    vocab: {
        "Unit 1-3": [
            { q: "The generation often creates misunderstandings in communication between parents and teenagers.", options: ["gap", "space", "distance", "interval"], ans: 0 },
            { q: "He decided to follow in his father's and become a doctor.", options: ["steps", "shoes", "footsteps", "path"], ans: 2 },
            { q: "An inspirational figure is someone who others to achieve great things.", options: ["discourages", "motivates", "forces", "bothers"], ans: 1 },
            { q: "Many young people nowadays prefer living independently rather than depending their parents.", options: ["on", "in", "with", "at"], ans: 0 },
            { q: "Respecting family traditions is an essential part of cultural in our country.", options: ["identity", "change", "rebellion", "conflict"], ans: 0 },
            { q: "My grandfather has a wealth of knowledge and is very about local history.", options: ["ignorant", "knowledgeable", "unaware", "confused"], ans: 1 },
            { q: "There is often a conflict of between different generations in a family.", options: ["interest", "ideas", "opinions", "viewpoints"], ans: 0 }, 
            { q: "She has been a role for many young girls in her community.", options: ["model", "figure", "symbol", "icon"], ans: 0 },
            { q: "It's important to bridge the generation by listening to each other.", options: ["gap", "hole", "crack", "divide"], ans: 0 },
            { q: "Youngsters tend to be more to new technological trends.", options: ["resistant", "adaptable", "hostile", "ignorant"], ans: 1 },
            { q: "The local community held a ceremony to honor the soldiers.", options: ["fallen", "dropped", "sunk", "collapsed"], ans: 0 },
            { q: "She made a significant to the success of the project.", options: ["donation", "contribution", "distribution", "dedication"], ans: 1 }
        ],
        "Unit 4-6": [
            { q: "Rapid leads to a massive movement of people from rural areas to big cities.", options: ["urbanisation", "industrialisation", "globalisation", "commercialisation"], ans: 0 },
            { q: "Smart cities utilize advanced technology to improve public and urban efficiency.", options: ["congestion", "services", "poverty", "pollution"], ans: 1 },
            { q: "Living in high-rise apartment blocks has become common among dwellers.", options: ["suburban", "rural", "urban", "provincial"], ans: 2 },
            { q: "Traffic congestion during rush hours remains a major issue for city planners.", options: ["solution", "challenge", "benefit", "advantage"], ans: 1 },
            { q: "Urban centers offer diverse career opportunities compared to remote areas.", options: ["similar", "various", "limited", "scarce"], ans: 1 },
            { q: "The local government is investing heavily in the city's .", options: ["infrastructure", "nature", "agriculture", "wilderness"], ans: 0 },
            { q: "Overpopulation can put a huge on housing and healthcare systems.", options: ["pressure", "support", "relief", "comfort"], ans: 0 },
            { q: "Many people migrate to cities seeking a higher standard of .", options: ["living", "life", "surviving", "lifestyle"], ans: 0 },
            { q: "Air pollution is one of the most severe in metropolitan areas.", options: ["drawbacks", "advantages", "improvements", "benefits"], ans: 0 },
            { q: "Sustainable urban development aims to balance economic growth and environmental .", options: ["destruction", "protection", "degradation", "pollution"], ans: 1 },
            { q: "The integration of AI in traffic lights helps reduce .", options: ["accidents", "congestion", "vehicles", "pedestrians"], ans: 1 },
            { q: "Slums often lack basic such as clean water and electricity.", options: ["amenities", "features", "decorations", "luxuries"], ans: 0 }
        ],
        "Unit 7-9": [
            { q: "We should adopt an eco-friendly lifestyle to reduce our carbon .", options: ["footprint", "handprint", "shadow", "emission"], ans: 0 },
            { q: "Deforestation significantly contributes to global and loss of biodiversity.", options: ["warming", "cooling", "freezing", "watering"], ans: 0 },
            { q: "Renewable energy sources such as solar and wind power are considered .", options: ["exhaustible", "sustainable", "limited", "harmful"], ans: 1 },
            { q: "Citizens are encouraged to plastic bags and switch to reusable containers.", options: ["recycle", "abandon", "manufacture", "consume"], ans: 1 },
            { q: "Protecting natural habitats is crucial for maintaining ecological balance on Earth.", options: ["destruction", "disruption", "balance", "instability"], ans: 2 },
            { q: "Many species are on the verge of due to illegal hunting.", options: ["extinction", "survival", "evolution", "existence"], ans: 0 },
            { q: "Governments should enforce strict laws to prevent illegal waste .", options: ["dumping", "saving", "collecting", "recycling"], ans: 0 },
            { q: "Using public transport is an effective way to cut on greenhouse gases.", options: ["off", "down", "out", "up"], ans: 1 },
            { q: "The factory was heavily fined for discharging toxic chemicals the river.", options: ["into", "onto", "above", "over"], ans: 0 },
            { q: "Organic farming promotes environmental by avoiding harmful pesticides.", options: ["hazard", "sustainability", "threat", "damage"], ans: 1 },
            { q: "Global warming leads to severe climate changes and weather events.", options: ["mild", "extreme", "gentle", "moderate"], ans: 1 },
            { q: "Conservationists are working hard to preserve wildlife reserves.", options: ["endangered", "dangerous", "threatening", "harmful"], ans: 0 }
        ]
    }
};

// ================= HÀM XỬ LÝ LẤY CÂU HỎI THEO TÙY CHỌN SỐ LƯỢNG =================
function getQuestions(type, topic, countSelectId) {
    let allQs = [];
    if (topic === 'all') {
        for (let key in aiQuestionBank[type]) {
            allQs = allQs.concat(aiQuestionBank[type][key]);
        }
    } else {
        allQs = [...aiQuestionBank[type][topic]];
    }
    
    let shuffled = shuffleArray(allQs); // Xáo trộn mảng
    
    const selectElem = document.getElementById(countSelectId);
    if(selectElem) {
        let count = selectElem.value;
        if(count !== 'all') {
            // Nếu ngân hàng không đủ số lượng user chọn, sẽ tự lặp lại (clone) để đủ số câu
            let requestedCount = parseInt(count);
            let finalQs = [];
            while(finalQs.length < requestedCount) {
                finalQs = finalQs.concat(shuffled);
            }
            return finalQs.slice(0, requestedCount);
        }
    }
    return shuffled;
}

function startAIGrammarQuiz(topicName) {
    quizData = getQuestions('grammar', topicName, 'grammar-q-count');
    const displayTopic = topicName === 'all' ? 'Tổng hợp ngẫu nhiên' : topicName;
    document.getElementById('quiz-header-title').innerText = `Ngữ pháp: ${displayTopic} 🧪`;
    openScreen('screen-quiz');
    initQuiz();
}

function startAIVocabQuiz(topicName) {
    quizData = getQuestions('vocab', topicName, 'vocab-q-count');
    const displayTopic = topicName === 'all' ? 'Tổng hợp ngẫu nhiên' : topicName;
    document.getElementById('quiz-header-title').innerText = `Từ vựng: ${displayTopic} 🛍️`;
    openScreen('screen-quiz');
    initQuiz();
}

// ================= AI MOCK TEST (TỰ SINH CHUẨN XÁC ĐỦ 40 CÂU THI THỬ) =================
function startMockTest() {
    let fullGrammar = [];
    for (let key in aiQuestionBank.grammar) fullGrammar = fullGrammar.concat(aiQuestionBank.grammar[key]);
    
    let fullVocab = [];
    for (let key in aiQuestionBank.vocab) fullVocab = fullVocab.concat(aiQuestionBank.vocab[key]);
    
    // Tổng hợp tất cả câu hỏi từ 2 kho, trộn cực kỳ ngẫu nhiên
    let mixedPool = shuffleArray([...fullGrammar, ...fullVocab]);
    
    let mock40 = [];
    // Lấy liên tục đến khi đủ tròn 40 câu
    while(mock40.length < 40) {
        mock40 = mock40.concat(shuffleArray(mixedPool));
    }
    mock40 = mock40.slice(0, 40); 
    
    // Format gắn tên Phần thi (Mô phỏng 4 phần của BGD)
    mock40 = mock40.map((q, index) => {
        let prefix = "";
        if(index < 12) prefix = "[Phần 1 - Đọc điền/Ngữ pháp] ";
        else if(index < 17) prefix = "[Phần 2 - Sắp xếp logic] ";
        else if(index < 22) prefix = "[Phần 3 - Điền khuyết văn bản] ";
        else prefix = "[Phần 4 - Đọc hiểu chuyên sâu] ";
        
        let cleanQ = q.q.replace(/\[.*?\] /g, '');
        return { ...q, q: prefix + cleanQ };
    });

    quizData = mock40;
    document.getElementById('quiz-header-title').innerText = `AI Mock Test (Chuẩn 40 câu) 📝`;
    openScreen('screen-quiz');
    initQuiz();
}

// ================= XỬ LÝ QUIZ UI =================
let currentQuizIndex = 0;
let quizScore = 0;

function initQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    document.getElementById('quiz-summary').classList.add('hidden');
    loadQuizQuestion();
}

function loadQuizQuestion() {
    if(currentQuizIndex >= quizData.length) return;
    const qData = quizData[currentQuizIndex];
    document.getElementById('quiz-current').innerText = currentQuizIndex + 1;
    document.getElementById('quiz-total').innerText = quizData.length;
    document.getElementById('quiz-question').innerText = qData.q;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    qData.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left bg-white border-2 border-gray-100 p-4 rounded-2xl font-medium text-app-text hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-between';
        btn.innerHTML = `<span>${opt}</span> <i class="fa-regular fa-circle text-gray-300"></i>`;
        btn.onclick = () => handleAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, btnElement) {
    const buttons = document.getElementById('quiz-options').querySelectorAll('button');
    buttons.forEach(b => b.onclick = null);

    const correctIndex = quizData[currentQuizIndex].ans;
    const isCorrect = (selectedIndex === correctIndex);

    if (isCorrect) {
        btnElement.classList.remove('border-gray-100', 'hover:border-blue-300', 'hover:bg-blue-50');
        btnElement.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        btnElement.querySelector('i').className = 'fa-solid fa-circle-check text-emerald-500 text-xl';
        quizScore += 10;
    } else {
        btnElement.classList.add('border-red-500', 'bg-red-50', 'text-red-700');
        btnElement.querySelector('i').className = 'fa-solid fa-circle-xmark text-red-500 text-xl';
        buttons[correctIndex].classList.add('border-emerald-500', 'bg-emerald-50');
        buttons[correctIndex].querySelector('i').className = 'fa-solid fa-circle-check text-emerald-500 text-xl';
    }

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizData.length) loadQuizQuestion();
        else finishQuiz();
    }, 1200);
}

function finishQuiz() {
    document.getElementById('quiz-summary').classList.remove('hidden');
    document.getElementById('quiz-xp-earned').innerText = `+${quizScore} XP`;
    updateXP(quizScore);
}

// ================= POMODORO TIMER =================
let timerInterval = null;
let timeLeft = 25 * 60;
let isTimerRunning = false;

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    const display = document.getElementById('timer-display');
    if(display) display.innerText = `${m}:${s}`;
}

function toggleTimer() {
    const toggleBtn = document.getElementById('btn-timer-toggle');
    if(!toggleBtn) return;
    const btnIcon = toggleBtn.querySelector('i');
    if (isTimerRunning) {
        clearInterval(timerInterval);
        if(btnIcon) btnIcon.className = 'fa-solid fa-play';
    } else {
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert("Hết giờ! Hoàn thành 1 Pomodoro tập trung. +50 XP");
                updateXP(50);
            }
        }, 1000);
        if(btnIcon) btnIcon.className = 'fa-solid fa-pause';
    }
    isTimerRunning = !isTimerRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    const toggleBtn = document.getElementById('btn-timer-toggle');
    if(toggleBtn) {
        const btnIcon = toggleBtn.querySelector('i');
        if(btnIcon) btnIcon.className = 'fa-solid fa-play';
    }
}

// ================= AI TUTOR CHAT =================
function appendMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-3 max-w-[85%] ${sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`;
    
    const avatar = sender === 'user' 
        ? `<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 text-blue-600 text-sm"><i class="fa-solid fa-user"></i></div>`
        : `<div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 text-sm">🤖</div>`;
        
    const bubbleClasses = sender === 'user'
        ? `bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-[15px] leading-relaxed`
        : `bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-[15px] text-app-text leading-relaxed`;

    msgDiv.innerHTML = `${avatar}<div class="${bubbleClasses}">${text}</div>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function appendLoading() {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.id = 'chat-loading';
    msgDiv.className = `flex gap-3 max-w-[85%]`;
    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 text-sm">🤖</div>
        <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
        </div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function removeLoading() {
    const loader = document.getElementById('chat-loading');
    if (loader) loader.remove();
}

function handleChatKey(e) {
    if(e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if(!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    appendLoading();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const result = await response.json();
        removeLoading();

        if (result.text) {
            const htmlText = result.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            appendMessage(htmlText, 'bot');
        } else {
            appendMessage(result.error || "Scorey đang bận một chút, thử lại sau nhé! 😥", 'bot');
        }
    } catch (error) {
        console.error("Chat Error:", error);
        removeLoading();
        appendMessage("Lỗi kết nối mạng rồi bạn ơi! 🔌", 'bot');
    }
}
