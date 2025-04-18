function checkRoleAndUpdateButton() {
    const token = localStorage.getItem('jwtToken');
    const adminButton = document.querySelector('.admin-btn');

    if (!token || !adminButton) {
        if (adminButton) {
            adminButton.classList.add('hidden');
        }
        console.log('Токен или кнопка отсутствуют, кнопка скрыта');
        return;
    }

    try {
        // Декодируем токен вручную
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || 'UNKNOWN';

        console.log('Декодированный токен:', payload);
        console.log('Роль:', role);

        // Показываем кнопку только для роли ADMIN
        if (role === 'ADMIN') {
            adminButton.classList.remove('hidden');
        } else {
            adminButton.classList.add('hidden');
        }

        console.log('Кнопка видимая:', !adminButton.classList.contains('hidden'));
    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        adminButton.classList.add('hidden');
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkRoleAndUpdateButton);