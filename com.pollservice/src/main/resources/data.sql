-- Создание тестового администратора
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$xVCH4IA5wJto4WXkgzDhf.D6X5Jdwjm5gXLF.y2xVa.TZR5ZOK7qO', 'ADMIN');

-- Пароль: admin123 (зашифрован BCrypt)