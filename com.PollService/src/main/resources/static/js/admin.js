document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    // Проверяем роль пользователя
    const userRole = getUserRoleFromToken(token);
    if (userRole !== 'ADMIN') {
        alert('Доступ запрещён: требуется роль администратора.');
        window.location.href = '/main.html';
        return;
    }

    loadUsers();
    loadPolls();

    function loadUsers() {
        fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) {
                        throw new Error('Доступ запрещён: требуется роль администратора.');
                    }
                    throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(users => {
                console.log('Ответ от сервера:', users);
                if (Array.isArray(users)) {
                    const tbody = document.querySelector('#users-table tbody');
                    tbody.innerHTML = '';
                    users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.username}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="edit-btn" onclick="editUser(${user.id}, '${user.role}')">Редактировать</button>
                            </td>`;
                        tbody.appendChild(row);
                    });
                } else {
                    console.error('Ожидался массив пользователей, но получен:', users);
                }
            })
            .catch(err => {
                console.error('Ошибка загрузки пользователей:', err);
                alert(err.message);
                if (err.message.includes('Доступ запрещён')) {
                    window.location.href = '/main.html';
                }
            });
    }

    function loadPolls() {
        fetch('/api/polls', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(polls => {
                console.log('Ответ от сервера для опросов:', polls);
                if (Array.isArray(polls)) {
                    let tbody = document.querySelector('#polls-table tbody');
                    if (!tbody) {
                        const table = document.createElement('table');
                        table.id = 'polls-table';
                        table.innerHTML = `
                            <thead>
                                <tr><th>ID</th><th>Название</th><th>Действия</th></tr>
                            </thead>
                            <tbody></tbody>`;
                        document.querySelector('.main-content').appendChild(table);
                        tbody = table.querySelector('tbody');
                    }
                    tbody.innerHTML = '';
                    polls.forEach(poll => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${poll.id}</td>
                            <td>${poll.title}</td>
                            <td>
                                <button class="delete-btn" onclick="deletePoll(${poll.id})">Удалить</button>
                            </td>`;
                        tbody.appendChild(row);
                    });
                } else {
                    console.error('Ожидался массив опросов, но получен:', polls);
                }
            })
            .catch(err => {
                console.error('Ошибка загрузки опросов:', err);
                alert('Ошибка загрузки опросов: ' + err.message);
            });
    }

    function getUserRoleFromToken(token) {
        try {
            const decoded = jwt_decode(token);
            return decoded.role || null; // Роль хранится в поле 'role'
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return null;
        }
    }

    window.deletePoll = function(pollId) {
        if (!confirm('Вы уверены, что хотите удалить этот опрос?')) return;

        fetch(`/api/polls/${pollId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) {
                        throw new Error('Доступ запрещён: требуется роль администратора.');
                    }
                    throw new Error('Ошибка при удалении опроса');
                }
                alert('Опрос успешно удалён!');
                loadPolls();
            })
            .catch(err => {
                alert('Ошибка: ' + err.message);
                console.error('Ошибка при удалении опроса:', err);
                if (err.message.includes('Доступ запрещён')) {
                    window.location.href = '/main.html';
                }
            });
    }

    window.editUser = function(userId, currentRole) {
        const newRole = prompt(`Введите новую роль для пользователя (текущая: ${currentRole})`, currentRole);
        if (!newRole || !['ADMIN', 'USER', 'MODERATOR', 'GUEST'].includes(newRole.toUpperCase())) {
            alert('Недопустимая роль. Выберите: ADMIN, USER, MODERATOR, GUEST.');
            return;
        }

        fetch(`/api/admin/user/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRole.toUpperCase()) // Отправляем строку, а не объект
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) {
                        throw new Error('Доступ запрещён: требуется роль администратора.');
                    }
                    return res.text().then(text => {
                        throw new Error(`Ошибка при обновлении роли: ${text}`);
                    });
                }
                alert('Роль пользователя обновлена');
                loadUsers();
            })
            .catch(err => {
                alert('Ошибка: ' + err.message);
                console.error('Ошибка при обновлении пользователя:', err);
                if (err.message.includes('Доступ запрещён')) {
                    window.location.href = '/main.html';
                }
            });
    };

    function logout() {
        localStorage.removeItem('jwtToken');
        window.location.href = '/auth.html';
    }
    window.logout = logout;
});