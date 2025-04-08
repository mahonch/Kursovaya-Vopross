document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    // Если нет токена - перенаправляем на страницу входа
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    // Загружаем данные пользователя
    loadUserProfile();

    // Загружаем опросы
    loadPolls();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('username-display').textContent = userData.username;
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

async function loadPolls() {
    const container = document.getElementById('polls-container');
    container.innerHTML = '<div class="loading">Загрузка опросов...</div>';

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/polls', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки опросов');

        const polls = await response.json();
        displayPolls(polls);
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<div class="error">Не удалось загрузить опросы</div>';
    }
}

function displayPolls(polls) {
    const container = document.getElementById('polls-container');
    container.innerHTML = '';

    if (polls.length === 0) {
        container.innerHTML = '<div class="empty">Нет доступных опросов</div>';
        return;
    }

    polls.forEach(poll => {
        const pollElement = document.createElement('div');
        pollElement.className = 'poll-card';
        pollElement.innerHTML = `
            <h3>${poll.title}</h3>
            ${poll.youtubeVideoId ? `
                <div class="video-preview">
                    <img src="https://img.youtube.com/vi/${poll.youtubeVideoId}/0.jpg" 
                         alt="YouTube видео">
                </div>
            ` : ''}
            <div class="poll-actions">
                <button onclick="viewPoll(${poll.id})">Открыть</button>
            </div>
        `;
        container.appendChild(pollElement);
    });
}

function logout() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => {
            localStorage.removeItem('jwtToken');
            window.location.href = '/auth.html';
        })
        .catch(() => alert('Ошибка при выходе'));
}
async function createPoll() {
    const title = document.getElementById('poll-title').value;
    const youtubeUrl = document.getElementById('youtube-url').value;

    const questions = [];
    const questionBlocks = document.querySelectorAll('.question-block');

    questionBlocks.forEach((block, index) => {
        const questionText = block.querySelector('.question-text').value;
        const answers = Array.from(block.querySelectorAll('.answer-text'))
            .map(input => input.value.trim())
            .filter(text => text !== '');

        if (questionText && answers.length > 0) {
            questions.push({
                text: questionText,
                answers: answers
            });
        }
    });

    if (questions.length === 0) {
        alert('Добавьте хотя бы один вопрос с вариантами ответов');
        return;
    }

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/polls', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                youtubeUrl,
                questions
            })
        });

        if (!response.ok) throw new Error('Ошибка создания опроса');

        const poll = await response.json();
        alert('Опрос успешно создан!');
        resetPollForm();
        loadPolls();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось создать опрос: ' + error.message);
    }
}

// Добавление нового вопроса
function addQuestion() {
    const container = document.getElementById('questions-container');
    const questionCount = document.querySelectorAll('.question-block').length + 1;

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-block';
    questionDiv.innerHTML = `
        <h3>Вопрос ${questionCount}</h3>
        <input type="text" class="question-text" placeholder="Текст вопроса" required>
        <div class="answers-container">
            <input type="text" class="answer-text" placeholder="Вариант ответа" required>
        </div>
        <button type="button" class="add-answer-btn" onclick="addAnswer(this)">+ Добавить вариант</button>
    `;
    container.appendChild(questionDiv);
}

// Добавление варианта ответа
function addAnswer(button) {
    const answersContainer = button.previousElementSibling;
    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.className = 'answer-text';
    answerInput.placeholder = 'Вариант ответа';
    answersContainer.appendChild(answerInput);
}

// Сброс формы после создания опроса
function resetPollForm() {
    document.getElementById('poll-title').value = '';
    document.getElementById('youtube-url').value = '';
    document.getElementById('questions-container').innerHTML = `
        <div class="question-block">
            <h3>Вопрос 1</h3>
            <input type="text" class="question-text" placeholder="Текст вопроса" required>
            <div class="answers-container">
                <input type="text" class="answer-text" placeholder="Вариант ответа" required>
            </div>
            <button type="button" class="add-answer-btn" onclick="addAnswer(this)">+ Добавить вариант</button>
        </div>
    `;
}
