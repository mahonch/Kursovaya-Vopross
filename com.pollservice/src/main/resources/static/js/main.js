

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    loadUserProfile();
    loadPolls();

    // Функции для добавления ответов и вопросов
    function addAnswer(button) {
        const answerContainer = button.previousElementSibling;  // Контейнер для вариантов ответов
        const newAnswerInput = document.createElement('input');
        newAnswerInput.type = 'text';
        newAnswerInput.classList.add('answer-text');
        newAnswerInput.placeholder = 'Вариант ответа';
        answerContainer.appendChild(newAnswerInput);
    }


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

// Убедитесь, что эта функция определена
    document.querySelector('.submit-btn').addEventListener('click', createPoll);

    // Кнопка для показа формы
    const showFormBtn = document.getElementById('show-form-btn');
    const formSection = document.getElementById('poll-creation-section');

    showFormBtn.addEventListener('click', () => {
        formSection.style.display = 'block';
        showFormBtn.style.display = 'none';
    });

    // Функция для загрузки профиля пользователя
    async function loadUserProfile() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            alert('Токен не найден. Пожалуйста, войдите снова.');
            window.location.href = '/auth.html';
            return;
        }

        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Проверяем, что сервер вернул JSON, а не HTML
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Сервер вернул не JSON. Возможно, ошибка на сервере или неверный путь.');
            }

            if (response.ok) {
                const userData = await response.json();
                document.getElementById('username-display').textContent = userData.username;
            } else if (response.status === 401) {
                alert('Ваш токен истек. Пожалуйста, войдите снова.');
                localStorage.removeItem('jwtToken');
                window.location.href = '/auth.html';
            } else {
                console.error('Ошибка при загрузке профиля');
            }
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
            alert('Ошибка при загрузке профиля: ' + error.message);
        }
    }



    // Функция для загрузки опросов
    // Функция для загрузки опросов
    function loadPolls() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            alert('Токен не найден. Пожалуйста, войдите снова.');
            window.location.href = '/auth.html';
            return;
        }

        fetch('/api/polls', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Сервер вернул не JSON. Возможно, ошибка на сервере или неверный путь.');
                }

                if (!response.ok) {
                    throw new Error("Ошибка загрузки опросов: " + response.status);
                }

                return response.json();
            })
            .then(data => {
                console.log("Опросы:", data);
                displayPolls(data); // отобразим опросы
            })
            .catch(error => {
                console.error("Ошибка:", error);
                alert("Ошибка при загрузке опросов: " + error.message);
            });
    }



    // Функция для отображения опросов
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

    // Функция для создания нового опроса
    async function createPoll() {
        const title = document.getElementById('poll-title').value;
        const youtubeUrl = document.getElementById('youtube-url').value;
        const questions = [];

        // Собираем все вопросы
        const questionBlocks = document.querySelectorAll('.question-block');
        questionBlocks.forEach(questionBlock => {
            const questionText = questionBlock.querySelector('.question-text').value;
            const answers = [];

            // Собираем все ответы для вопроса
            const answerInputs = questionBlock.querySelectorAll('.answer-text');
            answerInputs.forEach(answerInput => {
                answers.push(answerInput.value);
            });

            questions.push({ text: questionText, answers });
        });

        const pollData = {
            title,
            youtubeUrl,
            questions
        };

        try {
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,  // Токен из локального хранилища
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pollData)
            });

            if (response.ok) {
                alert('Опрос успешно создан!');
                loadPolls();  // Обновить список опросов
            } else {
                const error = await response.json();
                alert('Ошибка при создании опроса: ' + error.message);
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    }





    // Функция для выхода
    function logout() {
        const token = localStorage.getItem('jwtToken');
        if (!token) return;

        fetch(`/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                localStorage.removeItem('jwtToken');
                window.location.href = '/auth.html';
            })
            .catch(() => alert('Ошибка при выходе'));
    }


    // Привязываем функцию создания опроса к кнопке
    document.querySelector('.submit-btn').addEventListener('click', createPoll);
});
