// Khởi tạo State và tải dữ liệu đã lưu từ trình duyệt (localStorage)
let userXP = parseInt(localStorage.getItem('scoreup_xp')) || 850;
let streak = parseInt(localStorage.getItem('scoreup_streak')) || 7;

// Cập nhật lên giao diện ngay khi load trang
window.addEventListener('DOMContentLoaded', () => {
    const xpDisplay = document.getElementById('xp-display');
    const streakDisplay = document.getElementById('streak-display');
    const statsXp = document.getElementById('stats-xp');
    const statsStreak = document.getElementById('stats-streak');
    
    if(xpDisplay) xpDisplay.innerText = userXP;
    if(streakDisplay) streakDisplay.innerText = streak;
    if(statsXp) statsXp.innerText = userXP;
    if(statsStreak) statsStreak.innerText = streak;
});

function saveState() {
    localStorage.setItem('scoreup_xp', userXP);
    localStorage.setItem('scoreup_streak', streak);
}

function updateXP(amount) {
    userXP += amount;
    saveState();
    
    const xpDisplay = document.getElementById('xp-display');
    const statsXp = document.getElementById('stats-xp');
    if(xpDisplay) xpDisplay.innerText = userXP;
    if(statsXp) statsXp.innerText = userXP;

    if(xpDisplay) {
        xpDisplay.classList.add('text-green-500', 'scale-125');
        setTimeout(() => xpDisplay.classList.remove('text-green-500', 'scale-125'), 300);
    }
}

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
    if(screenId !== 'screen-home') {
        if(bottomNav) bottomNav.style.transform = 'translateY(100%)';
        if(screenId === 'screen-quiz') initQuiz();
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

// Quiz Logic
const quizData = [
    { q: "I _____ working on this project since last Monday.", options: ["have been", "am", "was", "had"], ans: 0 },
    { q: "If I _____ you, I would study harder for the exam.", options: ["was", "am", "were", "had been"], ans: 2 },
    { q: "She asked me where I _____ my umbrella.", options: ["leave", "have left", "left", "had left"], ans: 3 }
];
let currentQuizIndex = 0;
let quizScore = 0;

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
    const qElem = document.getElementById('quiz-question');
    if(currElem) currElem.innerText = currentQuizIndex + 1;
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

// Timer Logic
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
                alert("Hết giờ! Hoàn thành 1 Pomodoro. +50 XP");
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

// AI Chat Logic
let chatHistory = [];

function handleChatKey(e) {
    if(e.key === 'Enter') sendChatMessage();
}

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

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if(!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    
    chatHistory.push({ role: "user", parts: [{ text: text }] });
    appendLoading();

    try {
        const apiKey = "YOUR_API_KEY_HERE"; // Thay key của bạn vào đây
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey === "") {
            removeLoading();
            appendMessage("⚠️ <b>Lỗi kết nối:</b> Bạn chưa điền Gemini API Key trong file <code>app.js</code>! 🐘", 'bot');
            chatHistory.pop();
            return;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: chatHistory,
            systemInstruction: {
                parts: [{ text: "Bạn tên là Scorey, một chú voi AI thông minh làm gia sư tiếng Anh cho học sinh cấp 3 tại Việt Nam ôn thi THPT Quốc Gia. Hãy luôn trả lời bằng tiếng Việt, giải thích ngữ pháp ngắn gọn, dễ hiểu, dùng ngôn ngữ GenZ thân thiện, hay dùng emoji. Câu trả lời dưới 100 chữ." }]
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        removeLoading();

        if (result.candidates && result.candidates[0].content) {
            const aiText = result.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "model", parts: [{ text: aiText }] });
            const htmlText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            appendMessage(htmlText, 'bot');
        } else {
            appendMessage("Xin lỗi, Scorey đang bị nghẽn mạng một xíu, bạn thử lại sau nha 😥", 'bot');
        }

    } catch (error) {
        console.error("AI Chat Error:", error);
        removeLoading();
        appendMessage("Oops! Kết nối mạng bị lỗi rồi, Minh Anh kiểm tra lại nha 🔌", 'bot');
    }
}