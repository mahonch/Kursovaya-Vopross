package com.pollservice.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class CreatePollDto {
    private String title;
    private String youtubeUrl;
    private List<QuestionDto> questions;

    // 💡 Вот этот метод добавь
    public int getQuestionCount() {
        return questions != null ? questions.size() : 0;
    }

    @Getter
    public static class QuestionDto {
        private String text;
        private List<String> answers;

    }
}
