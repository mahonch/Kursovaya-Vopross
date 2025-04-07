const API_BASE_URL = 'http://localhost:8080/api/auth';

// DOM элементы
const registerForm = document.getElementById('register');
const loginForm = document.getElementById('login');
const registerFormContainer = document.getElementById('register-form');
const loginFormContainer = document.getElementById('login-form');
const authActions = document.getElementById('auth-actions');
const tokenInfo = document.getElementById('token-info');

// Показать форму входа
function showLogin() {
    registerFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
}

// Показать форму регистрации
function showRegister() {
    loginFormContainer.style.display = 'none';
    registerFormContainer.style.display = 'block';
}

// Обработка регистрации
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.text();

        if (response.ok) {
            alert(data);
            showLogin();
        } else {
            alert(data);
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации');
    }
});

// Обработка входа
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem('jwtToken', token);

            // Скрываем формы, показываем кнопку выхода
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'none';
            authActions.style.display = 'block';

            // Показываем информацию о токене (для демонстрации)
            tokenInfo.textContent = `Токен: ${token}`;
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе');
    }
});

// Выход
function logout() {
    const token = localStorage.getItem('jwtToken');

    if (!token) return;

    fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                localStorage.removeItem('jwtToken');
                authActions.style.display = 'none';
                registerFormContainer.style.display = 'block';
                tokenInfo.textContent = '';
                alert('Вы успешно вышли');
            }
        })
        .catch(error => {
            console.error('Ошибка выхода:', error);
        });
}

// Проверка аутентификации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    if (token) {
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'none';
        authActions.style.display = 'block';
        tokenInfo.textContent = `Токен: ${token}`;
    }
});