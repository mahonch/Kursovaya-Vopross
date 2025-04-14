document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    loadUsers();
    loadPolls();

    function loadUsers() {
        fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
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
            .catch(err => console.error('Ошибка загрузки пользователей:', err));
    }

    function loadPolls() {
        fetch('/api/polls', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
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
            .catch(err => console.error('Ошибка загрузки опросов:', err));
    }
    function getUserRoleFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || (payload.authorities ? payload.authorities[0] : null);
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
            },
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка при удалении опроса');
                alert('Опрос успешно удалён!');
                loadPolls(); // перезагрузка таблицы
            })
            .catch(err => {
                alert('Ошибка: ' + err.message);
                console.error('Ошибка при удалении опроса:', err);
            });
    }




    window.editUser = function (userId, currentRole) {
        const newRole = prompt(`Введите новую роль для пользователя (текущая: ${currentRole})`, currentRole);
        if (!newRole) return;

        fetch(`/api/admin/user/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRole)
        })
            .then(res => {
                if (res.ok) {
                    alert('Роль пользователя обновлена');
                    loadUsers();
                } else {
                    alert('Ошибка при обновлении роли');
                }
            })
            .catch(err => console.error('Ошибка при обновлении пользователя:', err));
    };

    window.logout = function () {
        fetch(`/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                localStorage.removeItem('jwtToken');
                window.location.href = '/auth.html';
            })
            .catch(() => alert('Ошибка при выходе'));
    };
});


