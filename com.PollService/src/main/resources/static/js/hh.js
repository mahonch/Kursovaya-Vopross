window.checkRoleAndUpdateButton = function() {
    const token = localStorage.getItem('jwtToken');
    const adminButton = document.querySelector('.admin-btn');

    if (token && adminButton) {
        // Декодируем токен
        const decodedToken = jwt_decode(token);

        // Проверяем роль
        const role = decodedToken.role; // предполагаем, что роль хранится в поле 'role'

        console.log('Роль:', role);

        // Если роль admin, показываем кнопку
        if (role === 'ADMIN') {
            adminButton.classList.remove('hidden');
        } else {
            adminButton.classList.add('hidden');
        }

        // Проверка видимости кнопки
        console.log('Кнопка видимая:', !adminButton.classList.contains('hidden'));
    }
};
