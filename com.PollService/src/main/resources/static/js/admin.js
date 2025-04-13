document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    loadUsers();

    function loadUsers() {
        fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(users => {
                const usersTableBody = document.querySelector('#users-table tbody');
                usersTableBody.innerHTML = '';

                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.role}</td>
                        <td>
                            <button class="edit-btn" onclick="editUser(${user.id}, '${user.role}')">Редактировать</button>
                        </td>
                    `;
                    usersTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Ошибка загрузки пользователей:', error));
    }

    window.editUser = function (userId, currentRole) {
        const role = prompt(`Введите новую роль для пользователя (текущая: ${currentRole})`, currentRole);
        if (!role) return;

        fetch(`/api/admin/user/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(role)
        })
            .then(response => {
                if (response.ok) {
                    alert('Роль пользователя обновлена');
                    loadUsers();
                } else {
                    alert('Ошибка при обновлении роли');
                }
            })
            .catch(error => console.error('Ошибка при обновлении пользователя:', error));
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
