
const API_BASE_URL = 'http://localhost:8080/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    // Здесь не проверяем token, поскольку это страница аутентификации.
});

function showLoading() {
    document.getElementById('auth-loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('auth-loading').style.display = 'none';
}

function showError(message) {
    const authError = document.getElementById('auth-error');
    authError.textContent = message;
    authError.style.color = 'red';
}

// Обработка регистрации
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Регистрация прошла успешно! Теперь вы можете войти.');
            // При успешной регистрации можно переключить видимую форму,
            // либо просто предложить пользователю перейти к входу.
        } else {
            const errorText = await response.text();
            showError(errorText);
        }
    } catch (error) {
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
});

// Обработка входа
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Если сервер возвращает просто строку токена:
            const token = await response.text();
            // Если сервер возвращает JSON, тогда:
            // const data = await response.json();
            // const token = data.token;

            console.log('Получен токен:', token);

            localStorage.setItem('jwtToken', token);
            // Перенаправляем пользователя на закрытую страницу:
            window.location.href = '/main.html';
        } else {
            const errorText = await response.text();
            showError(errorText);
        }
    } catch (error) {
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
});

function showTab(tabName) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-form`).style.display = 'block';
    document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`).classList.add('active');
}