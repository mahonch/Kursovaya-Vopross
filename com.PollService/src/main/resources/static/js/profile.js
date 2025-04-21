document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    loadUserProfile();

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
            document.getElementById('role').textContent = userData.role;
            document.getElementById('token').textContent = token;

            // Отображение фотографии профиля
            const profilePicture = document.getElementById('profile-picture');
            if (userData.profilePicture) {
                profilePicture.src = userData.profilePicture;
            }
            profilePicture.onerror = () => {
                profilePicture.src = '/images/fallback-profile.png'; // Локальное запасное изображение
            };

            // Отображение статистики
            document.getElementById('completed-polls').textContent = userData.completedPolls || 0;
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
            alert('Ошибка при загрузке профиля');
        }
    }

    window.uploadProfilePicture = async function () {
        const fileInput = document.getElementById('profile-picture-input');
        const file = fileInput.files[0];

        if (!file) {
            alert('Пожалуйста, выберите файл');
            return;
        }

        // Проверка размера файла на фронтенде (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Файл слишком большой. Максимальный размер: 10MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/user/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const responseText = await response.text();

            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('Файл слишком большой. Максимальный размер: 10MB.');
                }
                throw new Error('Ошибка при загрузке фотографии: ' + responseText);
            }

            alert('Фотография успешно загружена!');
            await loadUserProfile();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    };
    function logout() {
        localStorage.removeItem('jwtToken');
        window.location.href = '/auth.html';
    }
    window.logout = logout;
});