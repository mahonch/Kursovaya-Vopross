document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    await loadUserProfile();
    const currentUserRole = getUserRoleFromToken();
    loadPolls(currentUserRole);

    function addAnswer(button) {
        const answersContainer = button.previousElementSibling;
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.className = 'answer-text';
        answerInput.placeholder = 'Вариант ответа';
        answersContainer.appendChild(answerInput);
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

    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }

    async function createPoll() {
        const title = document.getElementById('poll-title').value.trim();
        const youtubeUrl = document.getElementById('youtube-url').value.trim();
        const questionBlocks = document.querySelectorAll('.question-block');
        const questions = [];

        // Валидация заголовка
        if (!title) {
            alert('Пожалуйста, введите название опроса');
            return;
        }

        // Валидация YouTube URL
        if (youtubeUrl && !isValidYouTubeUrl(youtubeUrl)) {
            alert('Пожалуйста, введите корректный YouTube URL');
            return;
        }

        // Валидация вопросов и ответов
        let hasValidQuestions = false;
        for (const block of questionBlocks) {
            const questionText = block.querySelector('.question-text').value.trim();
            const answerInputs = block.querySelectorAll('.answer-text');
            const answers = [];

            answerInputs.forEach(input => {
                const answerText = input.value.trim();
                if (answerText) {
                    answers.push(answerText);
                }
            });

            if (questionText && answers.length > 0) {
                questions.push({ text: questionText, answers });
                hasValidQuestions = true;
            }
        }

        if (!hasValidQuestions) {
            alert('Пожалуйста, добавьте хотя бы один вопрос с вариантами ответов');
            return;
        }

        const pollData = { title, youtubeUrl, questions };

        try {
            const response = await fetch('http://localhost:8080/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pollData),
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error('Ошибка при создании опроса: ' + responseText);
            }

            try {
                const responseJson = JSON.parse(responseText);
                alert('Опрос успешно создан!');
            } catch (e) {
                alert('Ответ сервера не является JSON: ' + responseText);
            }

            document.getElementById('poll-title').value = '';
            document.getElementById('youtube-url').value = '';
            document.getElementById('questions-container').innerHTML = '';
            loadPolls(currentUserRole); // Обновляем список опросов
        } catch (error) {
            alert('Ошибка при отправке данных: ' + error.message);
        }
    }

    function logout() {
        localStorage.removeItem('jwtToken');
        window.location.href = '/auth.html';
    }

    window.addAnswer = addAnswer;
    window.addQuestion = addQuestion;
    window.createPoll = createPoll;
    window.logout = logout;

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

            if (!response.ok) {
                throw new Error('Не удалось загрузить профиль: ' + response.status + ' ' + response.statusText);
            }

            if (response.status === 401) {
                window.location.href = '/auth.html';
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const user = await response.json();
                userProfileContainer.textContent = user.username;
            } else {
                const text = await response.text();
                throw new Error('Ответ сервера не является JSON: ' + text);
            }
        } catch (error) {
            alert('Ошибка при загрузке профиля: ' + error.message);
        }
    }

    function getUserRoleFromToken() {
        const token = localStorage.getItem('jwtToken');
        if (!token) return null;

        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || (payload.authorities ? payload.authorities[0] : null);
    }

    async function deletePoll(pollId) {
        const token = localStorage.getItem('jwtToken');
        if (!confirm('Вы уверены, что хотите удалить этот опрос?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/polls/${pollId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении опроса');
            }

            alert('Опрос успешно удален!');
            loadPolls(getUserRoleFromToken());
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    async function loadPolls(currentUserRole) {
        const token = localStorage.getItem('jwtToken');
        const pollsContainer = document.getElementById("polls-container");

        try {
            const response = await fetch('http://localhost:8080/api/polls', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const rawResponse = await response.text();
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке опросов: ${response.status} ${response.statusText}`);
            }

            let polls;
            try {
                polls = JSON.parse(rawResponse);
            } catch (e) {
                throw new Error("Ответ сервера не является корректным JSON: " + rawResponse);
            }

            pollsContainer.innerHTML = "";

            polls.forEach(poll => {
                const videoId = poll.youtubeVideoId || "";
                const previewImageUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    : "https://placehold.co/320x180?text=No+Preview";

                const isAdmin = currentUserRole === "ADMIN";
                const deleteButtonHTML = isAdmin
                    ? `<button class="delete-btn" data-poll-id="${poll.id}">🗑 Удалить</button>`
                    : '';

                const pollCard = document.createElement("div");
                pollCard.className = "poll-card";
                pollCard.innerHTML = `
                    <h3>${poll.title}</h3>
                    <p class="poll-author">Автор: ${poll.user?.username || 'Unknown User'}</p>
                    <img src="${previewImageUrl}" alt="YouTube Preview" class="youtube-preview"/>
                    <a href="/poll.html?pollId=${poll.id}">Перейти к опросу</a>
                    ${deleteButtonHTML}
                `;

                if (isAdmin) {
                    pollCard.querySelector('.delete-btn').addEventListener('click', () => {
                        deletePoll(poll.id);
                    });
                }

                pollsContainer.appendChild(pollCard);
            });
        } catch (error) {
            console.error("Ошибка при загрузке опросов:", error);
        }
    }

    async function extractVideoIdFromUrl(url) {
        try {
            const response = await fetch(`http://localhost:8080/api/youtube/extract-id?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Не удалось извлечь video ID');
            }
            return await response.text();
        } catch (error) {
            console.error('Ошибка при извлечении видео ID: ', error);
            return '';
        }
    }

    const showFormButton = document.getElementById('show-form-btn');
    const pollCreationSection = document.getElementById('poll-creation-section');

    showFormButton.addEventListener('click', () => {
        pollCreationSection.style.display =
            pollCreationSection.style.display === 'none' || pollCreationSection.style.display === ''
                ? 'block'
                : 'none';
    });
});