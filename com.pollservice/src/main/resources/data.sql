-- Удаляем таблицу если существует
DROP TABLE IF EXISTS users;

-- Создаем таблицу с правильными ограничениями
CREATE TABLE users (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       username TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL,
                       role TEXT NOT NULL
);

-- Вставляем начального администратора
INSERT OR IGNORE INTO users (username, password, role) 
VALUES ('admin', '$2a$10$ArUclvm5Fom9vnalXs3FZOZFInsnK74yyjNP/sUL2grncb6pqZACq', 'ADMIN');
VALUES ('mahonch', '$2a$10$ArUclvm5Fom9vnalXs3FZOZFInsnK74yyjNP/sUL2grncb6pqZACq', 'ADMIN');