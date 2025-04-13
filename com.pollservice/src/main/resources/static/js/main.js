
document.addEventListener('DOMContentLoaded', async () => {
    // Проверка наличия токена в localStorage
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    // Загрузка профиля пользователя
    loadUserProfile();
    // Загрузка доступных опросов с передачей токена
    loadPolls();

    // Функция добавления варианта ответа
    function addAnswer(button) {
        const answersContainer = button.previousElementSibling;
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.className = 'answer-text';
        answerInput.placeholder = 'Вариант ответа';
        answersContainer.appendChild(answerInput);
    }

    // Функция добавления нового вопроса
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

    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }

    // Функция для создания опроса
    async function createPoll() {
        const title = document.getElementById('poll-title').value;
        const youtubeUrl = document.getElementById('youtube-url').value;
        const questionBlocks = document.querySelectorAll('.question-block');
        const questions = [];

        // Проверка, что данные валидны
        if (!isValidYouTubeUrl(youtubeUrl)) {
            alert('Пожалуйста, введите корректный YouTube URL');
            return;
        }

        questionBlocks.forEach(block => {
            const questionText = block.querySelector('.question-text').value;
            const answerInputs = block.querySelectorAll('.answer-text');
            const answers = [];
            answerInputs.forEach(input => {
                if (input.value) {
                    answers.push(input.value);
                }
            });
            if (questionText && answers.length > 0) {
                questions.push({text: questionText, answers});
            } else {
                alert('Пожалуйста, заполните все вопросы и варианты ответов.');
                return;
            }
        });

        const pollData = {title, youtubeUrl, questions};

        // Логируем отправляемые данные
        console.log("Отправляемые данные: ", JSON.stringify(pollData));

        try {
            const response = await fetch('http://localhost:8080/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pollData),
            });

            // Логирование ответа от сервера
            const responseText = await response.text();  // Считываем ответ как текст

            if (!response.ok) {
                throw new Error('Ошибка при создании опроса: ' + responseText);
            }

            // Попытка преобразовать ответ в JSON, если он в правильном формате
            try {
                const responseJson = JSON.parse(responseText);
                alert('Опрос успешно создан!');
            } catch (e) {
                alert('Ответ сервера не является JSON: ' + responseText);
            }

            // Очистить форму или перенаправить на другую страницу
            document.getElementById('poll-title').value = '';
            document.getElementById('youtube-url').value = '';
            document.getElementById('questions-container').innerHTML = '';
        } catch (error) {
            alert('Ошибка при отправке данных: ' + error.message);
        }
    }

    // Функция для выхода
    function logout() {
        localStorage.removeItem('jwtToken');
        window.location.href = '/auth.html';  // Перенаправление на страницу авторизации
    }

    // Экспортируем функции в глобальную область
    window.addAnswer = addAnswer;
    window.addQuestion = addQuestion;
    window.createPoll = createPoll;
    window.logout = logout;

    // Загрузка данных профиля пользователя
    async function loadUserProfile() {
        const token = localStorage.getItem('jwtToken');
        const userProfileContainer = document.getElementById('username-display');

        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Проверка, что сервер возвращает правильный статус
            if (!response.ok) {
                throw new Error('Не удалось загрузить профиль: ' + response.status + ' ' + response.statusText);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const user = await response.json();
                userProfileContainer.textContent = user.username;  // Выводим имя пользователя
            } else {
                const text = await response.text(); // Если это не JSON, выводим текст ошибки
                throw new Error('Ответ сервера не является JSON: ' + text);
            }

        } catch (error) {
            alert('Ошибка при загрузке профиля: ' + error.message);
        }
    }

    async function extractVideoIdFromUrl(url) {
        console.log("Запрос к API с URL: ", url);  // Логируем URL

        try {
            const response = await fetch(`http://localhost:8080/api/youtube/extract-id?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Не удалось извлечь video ID');
            }

            const videoId = await response.text();  // Получаем ID из ответа
            console.log("Извлеченный videoId: ", videoId);  // Логируем извлеченный videoId
            return videoId;
        } catch (error) {
            console.error('Ошибка при извлечении видео ID: ', error);
            return ''; // Возвращаем пустую строку, если не удалось получить ID
        }
    }

    // Загрузка доступных опросов с добавлением авторизации
    async function loadPolls() {
        const token = localStorage.getItem('jwtToken');
        try {
            const response = await fetch('http://localhost:8080/api/polls', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке опросов: ${response.status}`);
            }

            const polls = await response.json();
            console.log('Полученные опросы:', polls);

            const pollsContainer = document.getElementById("polls-container");
            pollsContainer.innerHTML = "";

            for (const poll of polls) {
                let videoId = "";
                try {
                    videoId = await extractVideoIdFromUrl(poll.youtubeUrl);
                } catch (error) {
                    console.error("Не удалось извлечь video ID для URL:", poll.youtubeUrl);
                    console.error("Ошибка при извлечении видео ID: ", error);
                }

                const previewImageUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    : "https://via.placeholder.com/320x180?text=No+Preview";

                const pollCard = document.createElement("div");
                pollCard.className = "poll-card";
                pollCard.innerHTML = `
                <h3>${poll.title}</h3>
                <img src="${previewImageUrl}" alt="YouTube Preview" class="youtube-preview"/>
                <a href="/poll/${poll.id}">Перейти к опросу</a>
            `;
                pollsContainer.appendChild(pollCard);
            }
        } catch (error) {
            console.error("Ошибка при загрузке опросов:", error);
        }
    }

    // Добавляем обработчик для кнопки "Новый опрос"
    const showFormButton = document.getElementById('show-form-btn');
    const pollCreationSection = document.getElementById('poll-creation-section');

    showFormButton.addEventListener('click', () => {
        // Переключаем отображение формы
        if (pollCreationSection.style.display === 'none' || pollCreationSection.style.display === '') {
            pollCreationSection.style.display = 'block';  // Показываем форму
        } else {
            pollCreationSection.style.display = 'none';   // Скрываем форму
        }
    });
});
