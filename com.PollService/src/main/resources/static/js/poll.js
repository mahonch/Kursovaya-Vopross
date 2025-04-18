document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Пожалуйста, войдите в систему, чтобы просмотреть опрос.');
        window.location.href = '/auth.html';
        return;
    }

    if (!pollId) {
        alert('ID опроса не указан. Пожалуйста, перейдите на страницу опроса через корректную ссылку (например, /poll/2).');
        window.location.href = '/main.html';
        return;
    }

    try {
        const hasResponded = await checkIfUserResponded();
        await loadPoll(hasResponded);
        if (hasResponded) {
            disablePollForm();
            displayCompletedMessage();
        }
        await loadStatistics();
    } catch (error) {
        alert('Произошла ошибка: ' + error.message);
        window.location.href = '/auth.html';
    }

    async function checkIfUserResponded() {
        const response = await fetch(`http://localhost:8080/api/response/has-responded/${pollId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            throw new Error('Ошибка при проверке статуса ответа: ' + response.statusText);
        }

        return await response.json();
    }

    async function loadPoll(hasResponded) {
        const response = await fetch(`http://localhost:8080/api/polls/${pollId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            throw new Error('Ошибка при загрузке опроса: ' + response.statusText);
        }

        const poll = await response.json();
        pollContainer.innerHTML = '';

        if (poll.youtubeVideoId) {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'youtube-video';
            videoContainer.innerHTML = `
                <iframe width="560" height="315" 
                    src="https://www.youtube.com/embed/${poll.youtubeVideoId}" 
                    title="YouTube video" frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
            pollContainer.appendChild(videoContainer);
        }

        poll.questions.forEach(q => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            const questionTitle = document.createElement('h3');
            questionTitle.textContent = q.text;
            questionBlock.appendChild(questionTitle);

            q.answers.forEach(a => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question_${q.id}`;
                input.value = a.id;
                if (hasResponded) {
                    input.disabled = true;
                }

                input.addEventListener('change', () => {
                    selectedAnswerId = a.id;
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(a.text));
                questionBlock.appendChild(label);
                questionBlock.appendChild(document.createElement('br'));
            });

            pollContainer.appendChild(questionBlock);
        });
    }

    function disablePollForm() {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
    }

    function displayCompletedMessage() {
        const message = document.createElement('div');
        message.className = 'completed-message';
        message.style.color = '#d32f2f';
        message.style.textAlign = 'center';
        message.style.marginTop = '20px';
        message.textContent = 'Вы уже прошли этот опрос.';
        pollContainer.appendChild(message);
    }

    async function submitResponse() {
        if (!selectedAnswerId) {
            alert('Пожалуйста выберите ответ.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/response/submit?answerId=${selectedAnswerId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при отправке ответа: ' + response.statusText);
            }

            alert('Ответ отправлен!');
            disablePollForm();
            displayCompletedMessage();
            await loadStatistics();
        } catch (error) {
            alert('Ошибка: ' + error.message);
            if (error.message.includes('Сессия истекла')) {
                window.location.href = '/auth.html';
            }
        }
    }

    async function loadStatistics() {
        const response = await fetch(`http://localhost:8080/api/response/stats/${pollId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            throw new Error('Ошибка при загрузке статистики: ' + response.statusText);
        }

        const stats = await response.json();
        const statsDiv = document.getElementById('statistics');
        statsDiv.innerHTML = '<h2>Статистика</h2>';
        for (const [answerId, count] of Object.entries(stats)) {
            statsDiv.innerHTML += `<p>Ответ #${answerId}: ${count} голосов</p>`;
        }
    }

    async function logout() {
        try {
            const response = await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при выходе: ' + response.statusText);
            }

            localStorage.removeItem('jwtToken');
            window.location.href = '/auth.html';
        } catch (error) {
            alert('Ошибка при выходе: ' + error.message);
        }
    }

    submitBtn.addEventListener('click', submitResponse);
    window.logout = logout;
});

const pollId = new URLSearchParams(window.location.search).get('id');
const pollContainer = document.getElementById('poll-container');
const submitBtn = document.getElementById('submit-btn');
let selectedAnswerId = null;