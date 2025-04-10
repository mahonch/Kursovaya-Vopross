const API_BASE_URL = 'http://localhost:8080/api/auth';

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        // Если пользователь уже авторизован, перенаправляем на главную
        redirectToMain();
    }
});

function showTab(tabName) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-form`).style.display = 'block';
    document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// Обработка регистрации
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Регистрация прошла успешно! Теперь вы можете войти.');
            showTab('login');
        } else {
            showError(await response.text());
        }
    } catch (error) {
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
});

// Обработка входа
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem('jwtToken', token);
            redirectToMain();
        } else {
            showError(await response.text());
        }
    } catch (error) {
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
});

// Перенаправление на главную страницу
function redirectToMain() {
    document.getElementById('auth-loading').style.display = 'block';
    setTimeout(() => {
        window.location.href = '/main.html'; // Или '/', в зависимости от вашей настройки
    }, 1000);
}

function showLoading() {
    document.getElementById('auth-loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('auth-loading').style.display = 'none';
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    const activeForm = document.querySelector('.auth-form[style="display: block;"]');
    const existingError = activeForm.querySelector('.error-message');

    if (existingError) {
        existingError.remove();
    }

    activeForm.appendChild(errorElement);
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
