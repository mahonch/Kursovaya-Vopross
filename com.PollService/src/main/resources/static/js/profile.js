document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/auth.html'; // Перенаправление на страницу авторизации
        return;
    }

    loadUserProfile();

    // Функция для загрузки профиля
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки профиля');
            }

            const userData = await response.json();
            document.getElementById('username').textContent = userData.username;
            document.getElementById('role').textContent = userData.role; // Отображаем роль
            document.getElementById('token').textContent = token; // Отображаем токен
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
            alert('Ошибка при загрузке профиля');
        }
    }
});


