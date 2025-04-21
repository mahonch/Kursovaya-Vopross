document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pollId = urlParams.get('pollId');
    const token = localStorage.getItem('jwtToken');
    let currentUserId = null;
    let userRole = null;

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

    // Извлечение userId и роли из токена
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.sub; // Предполагаем, что userId хранится в поле sub
        userRole = payload.role || 'USER';
        console.log('Current user ID:', currentUserId, 'Role:', userRole);
    } catch (error) {
        console.error('Error decoding token:', error);
        window.location.href = '/auth.html';
        return;
    }

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
            statsDiv.innerHTML = '<h2 class="text-xl font-bold mb-2">Результаты</h2>';

            statistics.forEach(stat => {
                const statDiv = document.createElement('div');
                statDiv.className = 'mb-4';

                const totalVotes = Object.values(stat.answerStatistics).reduce((sum, count) => sum + count, 0);

                statDiv.innerHTML = `<h3 class="text-lg font-semibold">${stat.questionText}</h3>`;
                const answersContainer = document.createElement('div');
                answersContainer.className = 'answers-stats';

                Object.entries(stat.answerStatistics).forEach(([answer, count]) => {
                    const percentage = totalVotes > 0 ? (count / totalVotes * 100).toFixed(1) : 0;

                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer-stat';

                    answerDiv.innerHTML = `
                        <div class="answer-label">${answer}: ${count} голосов (${percentage}%)</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%;" data-percentage="${percentage}"></div>
                        </div>
                    `;
                    answersContainer.appendChild(answerDiv);
                });

                statDiv.appendChild(answersContainer);
                statsDiv.appendChild(statDiv);
            });

            setTimeout(() => {
                document.querySelectorAll('.progress-fill').forEach(bar => {
                    const percentage = bar.getAttribute('data-percentage');
                    bar.style.width = `${percentage}%`;
                });
            }, 100);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert('Не удалось загрузить статистику: ' + error.message);
        }
    }

    async function fetchComments() {
        try {
            const response = await fetch(`http://localhost:8080/api/comments/poll/${pollId}`, { headers });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const comments = await response.json();
            const commentsDiv = document.getElementById('comments');
            commentsDiv.innerHTML = '<h2 class="text-xl font-bold mb-2">Комментарии</h2>';

            if (comments.length === 0) {
                commentsDiv.innerHTML += '<p>Комментариев пока нет. Будьте первым!</p>';
            } else {
                const commentsList = document.createElement('div');
                commentsList.className = 'comments-list';

                comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'comment-item';
                    commentDiv.setAttribute('data-comment-id', comment.id);

                    const formattedDate = new Date(comment.createdAt).toLocaleString('ru-RU');
                    const isAuthor = comment.user.id.toString() === currentUserId.toString();
                    const canDelete = isAuthor || userRole === 'ADMIN';

                    // Формируем полный URL для фотографии профиля
                    const profilePictureUrl = comment.user.profilePicture
                        ? `http://localhost:8080${comment.user.profilePicture}`
                        : '/images/fallback-profile.png'; // Локальное запасное изображение

                    commentDiv.innerHTML = `
                        <div class="comment-header">
                            <div class="comment-author-section">
                                <img src="${profilePictureUrl}" alt="Profile Picture" class="comment-profile-pic">
                                <span class="comment-author">${comment.user.username}</span>
                            </div>
                            <span class="comment-date">${formattedDate}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        ${canDelete ? `<button class="delete-btn delete-comment-btn" onclick="deleteComment(${comment.id})">Удалить</button>` : ''}
                    `;
                    commentsList.appendChild(commentDiv);
                });

                commentsDiv.appendChild(commentsList);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Не удалось загрузить комментарии: ' + error.message);
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

    document.getElementById('submit-comment').addEventListener('click', async () => {
        const commentText = document.getElementById('comment-text').value.trim();
        if (!commentText) {
            alert('Комментарий не может быть пустым');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/comments/submit', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ pollId, text: commentText })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit comment: ${response.status} ${response.statusText} - ${errorText}`);
            }
            document.getElementById('comment-text').value = ''; // Очищаем поле
            await fetchComments(); // Обновляем список комментариев
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Не удалось отправить комментарий: ' + error.message);
        }
    });

    window.deleteComment = async (commentId) => {
        if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete comment: ${response.status} ${response.statusText} - ${errorText}`);
            }
            await fetchComments(); // Обновляем список комментариев
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Не удалось удалить комментарий: ' + error.message);
        }
    };

    await fetchPoll();
    await checkHasResponded();
    await fetchComments();
});