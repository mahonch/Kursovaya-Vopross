package com.pollservice.dto;

import java.util.List;

public class CreatePollDto {
    private String title;
    private String youtubeUrl;
    private List<QuestionDto> questions;

    // Геттеры и сеттеры
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public List<QuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionDto> questions) {
        this.questions = questions;
    }

    // Define the getQuestionCount method
    public int getQuestionCount() {
        return this.questions != null ? this.questions.size() : 0;
    }


    public static class QuestionDto {
        private String text;
        private List<String> answers;

        // Геттеры и сеттеры
        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public List<String> getAnswers() {
            return answers;
        }

        public void setAnswers(List<String> answers) {
            this.answers = answers;
        }
    }
}