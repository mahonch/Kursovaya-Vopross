document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('pollId');
    const token = localStorage.getItem('jwtToken');

    if (!pollId) {
        console.error('Poll ID is missing in the URL. Redirecting to main page...');
        window.location.href = '/index.html';
        return;
    }

    if (!token) {
        console.error('JWT token not found in localStorage. Redirecting to auth page...');
        window.location.href = '/auth.html';
        return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    async function fetchPoll() {
        try {
            const response = await fetch(`http://localhost:8080/api/polls/${pollId}`, { headers });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch poll: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const poll = await response.json();
            document.getElementById('poll-title').textContent = poll.title;
            if (poll.youtubeVideoId) {
                document.getElementById('youtube-video').innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${poll.youtubeVideoId}?rel=0" frameborder="0" allowfullscreen></iframe>`;
            }
            poll.questions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'mb-4';
                questionDiv.innerHTML = `<h3 class="text-lg font-semibold">${question.text}</h3>`;
                question.answers.forEach(answer => {
                    const answerDiv = document.createElement('div');
                    answerDiv.innerHTML = `<input type="radio" name="question-${question.id}" value="${answer.id}" class="mr-2">${answer.text}`;
                    questionDiv.appendChild(answerDiv);
                });
                document.getElementById('questions').appendChild(questionDiv);
            });
        } catch (error) {
            console.error('Error fetching poll:', error);
            alert('Не удалось загрузить опрос: ' + error.message);
        }
    }

    async function fetchStatistics() {
        try {
            const response = await fetch(`http://localhost:8080/api/responses/statistics/${pollId}`, { headers });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const statistics = await response.json();
            const statsDiv = document.getElementById('statistics');
            statsDiv.innerHTML = '<h2 class="text-xl font-bold mb-2">Statistics</h2>';
            statistics.forEach(stat => {
                const statDiv = document.createElement('div');
                statDiv.className = 'mb-4';
                statDiv.innerHTML = `<h3 class="text-lg font-semibold">${stat.questionText}</h3>`;
                Object.entries(stat.answerStatistics).forEach(([answer, count]) => {
                    const answerDiv = document.createElement('div');
                    answerDiv.textContent = `${answer}: ${count} votes`;
                    statDiv.appendChild(answerDiv);
                });
                statsDiv.appendChild(statDiv);
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert('Не удалось загрузить статистику: ' + error.message);
        }
    }

    async function checkHasResponded() {
        try {
            const response = await fetch(`http://localhost:8080/api/responses/hasResponded/${pollId}`, { headers });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to check if user has responded: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const hasResponded = await response.json();
            if (!hasResponded) {
                document.getElementById('submit-responses').classList.remove('hidden');
            } else {
                await fetchStatistics();
            }
        } catch (error) {
            console.error('Error checking if user has responded:', error);
            alert('Не удалось проверить, отвечал ли пользователь: ' + error.message);
        }
    }

    document.getElementById('submit-responses').addEventListener('click', async () => {
        const responses = [];
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            responses.push({ answerId: parseInt(input.value) });
        });
        try {
            for (const response of responses) {
                const res = await fetch('http://localhost:8080/api/responses/submit', {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ answerId: response.answerId })
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to submit response: ${res.status} ${res.statusText} - ${errorText}`);
                }
            }
            await fetchStatistics();
            document.getElementById('submit-responses').classList.add('hidden');
        } catch (error) {
            console.error('Error submitting response:', error);
            alert('Не удалось отправить ответ: ' + error.message);
        }
    });

    await fetchPoll();
    await checkHasResponded();
});