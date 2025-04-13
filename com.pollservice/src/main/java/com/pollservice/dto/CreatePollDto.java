package com.pollservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreatePollDto {
    private String title;
    private String youtubeUrl;
    private List<QuestionDto> questions;

    // Метод для подсчета количества вопросов
    public int getQuestionCount() {
        return questions != null ? questions.size() : 0;
    }

    // Проверка на корректность заполнения
    public boolean isValid() {
        return title != null && !title.trim().isEmpty() && questions != null && !questions.isEmpty();
    }

    @Getter
    @Setter
    public static class QuestionDto {
        private String text;
        private List<String> answers;

        // Дополнительная валидация для вопроса
        public boolean isValid() {
            return text != null && !text.trim().isEmpty() && answers != null && !answers.isEmpty();
        }
    }
}
