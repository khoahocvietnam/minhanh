// ================= KẾT NỐI SUPABASE =================
const SUPABASE_URL = 'https://ifhskkqjttkucirpztsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaHNra3FqdHRrdWNpcnB6dHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjk2NzksImV4cCI6MjEwMTQwNTY3OX0.n1sMPDMMRTcM72XKWyVKZJg3H67KPnSQHv03NKi8i3M';

const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let userName = "Sĩ tử";
let userTarget = "Sĩ tử 2K7 • Mục tiêu 9+ Tiếng Anh (Cấu trúc mới)";
let userXP = 850;
let streak = 7;

// ================= AUTHENTICATION =================
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
        console.error("Auth Session Error:", err);
        showAuthScreen();
    }
});

async function handleRegister() {
    const emailField = document.getElementById('auth-email');
    const passwordField = document.getElementById('auth-password');
    if(!emailField || !passwordField) return;

    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if(!email || !password) {
        alert("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
    }

    const { error } = await dbClient.auth.signUp({ email, password });
    if (error) {
        alert("Lỗi đăng ký: " + error.message);
    } else {
        alert("🎉 Đăng ký thành công! Hãy bấm Đăng nhập ngay.");
    }
}

async function handleLogin() {
    const emailField = document.getElementById('auth-email');
    const passwordField = document.getElementById('auth-password');
    if(!emailField || !passwordField) return;

    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if(!email || !password) {
        alert("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
    }

    const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Đăng nhập thất bại: " + error.message);
    } else {
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
    const authScreen = document.getElementById('screen-auth');
    const homeScreen = document.getElementById('screen-home');
    const bottomNav = document.getElementById('bottom-nav');

    if(authScreen) authScreen.classList.remove('hidden');
    if(homeScreen) homeScreen.classList.add('hidden');
    if(bottomNav) bottomNav.style.transform = 'translateY(100%)';
}

function showHomeScreen() {
    const authScreen = document.getElementById('screen-auth');
    if(authScreen) authScreen.classList.add('hidden');
    goHome();
}

// ================= CLOUD SYNC =================
async function fetchUserData() {
    if (!currentUser) return;
    try {
        const { data, error } = await dbClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error || !data) {
            await dbClient.from('profiles').insert([{
                id: currentUser.id,
                full_name: currentUser.email.split('@')[0],
                target: userTarget,
                streak: 7,
                xp: 850
            }]);
        } else {
            userName = data.full_name || currentUser.email.split('@')[0];
            userTarget = data.target || "Sĩ tử 2K7";
            userXP = data.xp || 850;
            streak = data.streak || 7;
        }
        updateDynamicUI();
    } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
    }
}

async function saveStateToCloud() {
    if (!currentUser) return;
    try {
        await dbClient
            .from('profiles')
            .update({
                full_name: userName,
                target: userTarget,
                xp: userXP,
                streak: streak,
                updated_at: new Date()
            })
            .eq('id', currentUser.id);
    } catch (err) {
        console.error('Lỗi lưu Cloud:', err);
    }
}

function updateDynamicUI() {
    const greetingName = document.getElementById('greeting-name');
    const profileName = document.getElementById('profile-name');
    const profileTarget = document.getElementById('profile-target');
    const profileAvatar = document.getElementById('profile-avatar');

    if(greetingName) greetingName.innerText = userName;
    if(profileName) profileName.innerText = userName;
    if(profileTarget) profileTarget.innerText = userTarget;
    
    if(profileAvatar) {
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        profileAvatar.innerText = initials || 'SZ';
    }

    const xpDisplay = document.getElementById('xp-display');
    const streakDisplay = document.getElementById('streak-display');
    const statsXp = document.getElementById('stats-xp');
    const statsStreak = document.getElementById('stats-streak');
    
    if(xpDisplay) xpDisplay.innerText = userXP;
    if(streakDisplay) streakDisplay.innerText = streak;
    if(statsXp) statsXp.innerText = userXP;
    if(statsStreak) statsStreak.innerText = streak;
}

async function editProfile() {
    const newName = prompt("Nhập tên hiển thị của bạn:", userName);
    if(newName !== null && newName.trim() !== "") {
        userName = newName.trim();
    }

    const newTarget = prompt("Nhập mục tiêu học tập của bạn:", userTarget);
    if(newTarget !== null && newTarget.trim() !== "") {
        userTarget = newTarget.trim();
    }

    updateDynamicUI();
    await saveStateToCloud();
    alert("🎉 Đã cập nhật hồ sơ thành công!");
}

async function updateXP(amount) {
    userXP += amount;
    updateDynamicUI();
    await saveStateToCloud();

    const xpDisplay = document.getElementById('xp-display');
    if(xpDisplay) {
        xpDisplay.classList.add('text-green-500', 'scale-125');
        setTimeout(() => xpDisplay.classList.remove('text-green-500', 'scale-125'), 300);
    }
}

// ================= NAVIGATION =================
function openScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('screen-enter');
    });
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('screen-enter');
    }
    const bottomNav = document.getElementById('bottom-nav');
    if(screenId !== 'screen-home' && screenId !== 'screen-auth') {
        if(bottomNav) bottomNav.style.transform = 'translateY(100%)';
    }
}

function goHome() {
    document.querySelectorAll('.app-screen').forEach(el => {
        el.classList.add('hidden');
    });
    const home = document.getElementById('screen-home');
    if(home) {
        home.classList.remove('hidden');
        home.classList.add('screen-enter');
    }
    const bottomNav = document.getElementById('bottom-nav');
    if(bottomNav) bottomNav.style.transform = 'translateY(0)';
}

// ================= AI DYNAMIC QUIZ GENERATOR ENGINE =================
let quizData = [];
let currentQuizIndex = 0;
let quizScore = 0;

// Bộ dữ liệu mẫu ngân hàng câu hỏi AI phân hóa theo chuyên đề
const aiQuestionBank = {
    grammar: {
        "Thì và sự phối hợp thì": [
            { q: "By the time the teacher _____ tomorrow, we will have finished our essay.", options: ["arrive", "arrives", "arrived", "will arrive"], ans: 1 },
            { q: "She _____ in this city for 10 years before she moved to London in 2020.", options: ["has lived", "had lived", "was living", "lives"], ans: 1 },
            { q: "While my mother _____ dinner, my father was reading the newspaper.", options: ["cooks", "cooked", "was cooking", "has cooked"], ans: 2 }
        ],
        "Câu điều kiện và mệnh đề giả định": [
            { q: "If I _____ you were coming, I would have baked a cake.", options: ["know", "knew", "had known", "would know"], ans: 2 },
            { q: "It is essential that every student _____ their assignment on time.", options: ["submits", "submit", "submitted", "will submit"], ans: 1 },
            { q: "If she studies hard, she _____ the entrance exam easily.", options: ["passed", "would pass", "will pass", "passes"], ans: 2 }
        ],
        "Mệnh đề quan hệ và rút gọn mệnh đề": [
            { q: "The man _____ to my father yesterday is our new principal.", options: ["talked", "talking", "talk", "is talking"], ans: 1 },
            { q: "Do you know the house _____ the famous author was born?", options: ["which", "where", "when", "whose"], ans: 1 },
            { q: "The book _____ on the top shelf belongs to me.", options: ["is found", "found", "finding", "to find"], ans: 1 }
        ],
        "Câu bị động và đảo ngữ": [
            { q: "Hardly _____ closed his eyes when the telephone rang.", options: ["he had", "had he", "did he", "he did"], ans: 1 },
            { q: "A new shopping mall _____ in our town next month.", options: ["will build", "will be built", "is building", "built"], ans: 1 },
            { q: "Only when you practice every day _____ fluent in English.", options: ["you can become", "can you become", "you will become", "become you"], ans: 1 }
        ],
        "all": [
            { q: "[Tổng hợp] Neither the teacher nor the students _____ present at the meeting yet.", options: ["is", "are", "has been", "have been"], ans: 3 },
            { q: "[Tổng hợp] Not only _____ the exam, but she also got a scholarship.", options: ["she passed", "did she pass", "passed she", "she did pass"], ans: 1 },
            { q: "[Tổng hợp] Having finished her homework, Linh _____ to bed.", options: ["went", "go", "going", "gone"], ans: 0 },
            { q: "[Tổng hợp] She speaks English as fluently as if she _____ a native speaker.", options: ["is", "were", "had been", "will be"], ans: 1 }
        ]
    },
    vocab: {
        "Unit 1-3: Life Stories & Generations": [
            { q: "The generation _____ often creates misunderstandings in communication between parents and teenagers.", options: ["gap", "space", "distance", "interval"], ans: 0 },
            { q: "He decided to follow in his father's _____ and become a doctor.", options: ["steps", "shoes", "footsteps", "path"], ans: 2 },
            { q: "An inspirational figure is someone who _____ others to achieve great things.", options: ["discourages", "motivates", "forces", "bothers"], ans: 1 }
        ],
        "Unit 4-6: Urbanisation & Smart Cities": [
            { q: "Rapid _____ leads to a massive movement of people from rural areas to big cities.", options: ["urbanisation", "industrialisation", "globalisation", "commercialisation"], ans: 0 },
            { q: "Smart cities utilize advanced technology to improve public _____ and urban efficiency.", options: ["congestion", "services", "poverty", "pollution"], ans: 1 },
            { q: "Living in high-rise apartment blocks has become common among _____ dwellers.", options: ["suburban", "rural", "urban", "provincial"], ans: 2 }
        ],
        "Unit 7-9: Green Movement & Ecology": [
            { q: "We should adopt an eco-friendly lifestyle to reduce our carbon _____.", options: ["footprint", "handprint", "shadow", "emission"], ans: 0 },
            { q: "Deforestation significantly contributes to global _____ and loss of biodiversity.", options: ["warming", "cooling", "freezing", "watering"], ans: 0 },
            { q: "Renewable energy sources such as solar and wind power are considered _____.", options: ["exhaustible", "sustainable", "limited", "harmful"], ans: 1 }
        ],
        "Unit 10-12: Artificial Intelligence & Career": [
            { q: "Artificial intelligence (AI) has the potential to _____ various industries completely.", options: ["revolutionise", "stagnate", "deteriorate", "damage"], ans: 0 },
            { q: "Job applicants are required to possess strong digital _____ in the modern workplace.", options: ["illiteracy", "literacy", "skills", "ignorance"], ans: 2 },
            { q: "Automation may replace routine tasks, creating a high demand for _____ thinking.", options: ["critical", "useless", "shallow", "passive"], ans: 0 }
        ],
        "all": [
            { q: "[Tổng hợp Từ vựng] The company is looking for candidates with high _____ and adaptability.", options: ["flexibility", "rigidity", "hostility", "fragility"], ans: 0 },
            { q: "[Tổng hợp Từ vựng] Environmentalists are calling for stricter regulations on plastic _____.", options: ["conservation", "consumption", "production", "destruction"], ans: 2 },
            { q: "[Tổng hợp Từ vựng] Modern technology offers immense benefits in _____ medical treatments.", options: ["enhancing", "hindering", "delaying", "worsening"], ans: 0 },
            { q: "[Tổng hợp Từ vựng] Maintaining work-life balance is crucial for long-term mental _____.", options: ["stress", "well-being", "pressure", "fatigue"], ans: 1 }
        ]
    },
    mock: [
        { q: "[BGD 2025 - Câu 1-12: Đọc điền] Smart devices are becoming increasingly popular _____ modern households.", options: ["in", "on", "at", "with"], ans: 0 },
        { q: "[BGD 2025 - Câu 13-17: Sắp xếp câu] Choose the correct arrangement: a. However, high-rise buildings also block natural light. b. Urban areas provide numerous job opportunities. c. Therefore, green architecture is introduced. -> b - a - c", options: ["Đúng", "Sai"], ans: 0 },
        { q: "[BGD 2025 - Câu 18-22: Điền khuyết văn bản] If city planners invest in public transport, traffic congestion _____ significantly.", options: ["will reduce", "will be reduced", "reduces", "reduced"], ans: 1 },
        { q: "[BGD 2025 - Câu 23-40: Đọc hiểu] What is the main message of sustainable urban design?", options: ["Maximizing concrete buildings", "Balancing human growth and environmental protection", "Eliminating all private vehicles", "Stopping all economic activities"], ans: 1 }
    ]
};

function startAIGrammarQuiz(topicName) {
    quizData = aiQuestionBank.grammar[topicName] || aiQuestionBank.grammar["all"];
    document.getElementById('quiz-header-title').innerText = `Ngữ pháp: ${topicName} 🧪`;
    openScreen('screen-quiz');
    initQuiz();
}

function startAIAllGrammarTest() {
    quizData = aiQuestionBank.grammar["all"];
    document.getElementById('quiz-header-title').innerText = `Kiểm tra tổng hợp Ngữ Pháp ⚡`;
    openScreen('screen-quiz');
    initQuiz();
}

function startAIVocabQuiz(topicName) {
    quizData = aiQuestionBank.vocab[topicName] || aiQuestionBank.vocab["all"];
    document.getElementById('quiz-header-title').innerText = `Từ vựng: ${topicName} 🛍️`;
    openScreen('screen-quiz');
    initQuiz();
}

function startAIAllVocabTest() {
    quizData = aiQuestionBank.vocab["all"];
    document.getElementById('quiz-header-title').innerText = `Kiểm tra tổng hợp Từ Vựng ⚡`;
    openScreen('screen-quiz');
    initQuiz();
}

function startTest(testName) {
    quizData = aiQuestionBank.mock;
    document.getElementById('quiz-header-title').innerText = `AI Mock Test (Chuẩn 40 câu BGD) 📝`;
    openScreen('screen-quiz');
    initQuiz();
}

function generateFullAIMockTest() {
    alert("🤖 AI đã tự động biên soạn thành công bộ đề thi thử chuẩn cấu trúc BGD mới nhất với 4 câu hỏi tổng hợp chuyên sâu!");
    startTest('AI Mock Test');
}

function initQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    const summary = document.getElementById('quiz-summary');
    if(summary) summary.classList.add('hidden');
    loadQuizQuestion();
}

function loadQuizQuestion() {
    if(currentQuizIndex >= quizData.length) return;
    const qData = quizData[currentQuizIndex];
    const currElem = document.getElementById('quiz-current');
    const totalElem = document.getElementById('quiz-total');
    const qElem = document.getElementById('quiz-question');
    
    if(currElem) currElem.innerText = currentQuizIndex + 1;
    if(totalElem) totalElem.innerText = quizData.length;
    if(qElem) qElem.innerText = qData.q;
    
    const optionsContainer = document.getElementById('quiz-options');
    if(!optionsContainer) return;
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
    const optionsContainer = document.getElementById('quiz-options');
    if(!optionsContainer) return;
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(b => b.onclick = null);

    const correctIndex = quizData[currentQuizIndex].ans;
    const isCorrect = (selectedIndex === correctIndex);

    if (isCorrect) {
        btnElement.classList.remove('border-gray-100', 'hover:border-blue-300', 'hover:bg-blue-50');
        btnElement.classList.add('border-green-500', 'bg-green-50', 'text-green-700');
        const icon = btnElement.querySelector('i');
        if(icon) icon.className = 'fa-solid fa-circle-check text-green-500 text-xl';
        quizScore += 10;
    } else {
        btnElement.classList.remove('border-gray-100');
        btnElement.classList.add('border-red-500', 'bg-red-50', 'text-red-700');
        const icon = btnElement.querySelector('i');
        if(icon) icon.className = 'fa-solid fa-circle-xmark text-red-500 text-xl';
        
        if(buttons[correctIndex]) {
            buttons[correctIndex].classList.add('border-green-500', 'bg-green-50');
            const correctIcon = buttons[correctIndex].querySelector('i');
            if(correctIcon) correctIcon.className = 'fa-solid fa-circle-check text-green-500 text-xl';
        }
    }

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizData.length) {
            loadQuizQuestion();
        } else {
            finishQuiz();
        }
    }, 1200);
}

function finishQuiz() {
    const summary = document.getElementById('quiz-summary');
    const earned = document.getElementById('quiz-xp-earned');
    if(summary) summary.classList.remove('hidden');
    if(earned) earned.innerText = `+${quizScore}`;
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
