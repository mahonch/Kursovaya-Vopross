package com.pollservice.service;

import com.pollservice.model.Answer;
import com.pollservice.model.Response;
import com.pollservice.model.Question;
import com.pollservice.repository.*;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public ResponseService(ResponseRepository responseRepository, UserRepository userRepository,
                           PollRepository pollRepository, QuestionRepository questionRepository,
                           AnswerRepository answerRepository) {
        this.responseRepository = responseRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    public void submitResponse(Long answerId, Long userId) {
        System.out.println("Submitting response: answerId=" + answerId + ", userId=" + userId);
        if (answerId == null) {
            throw new IllegalArgumentException("Answer ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (responseRepository.existsByUserIdAndAnswerId(userId, answerId)) {
            throw new IllegalStateException("Вы уже проголосовали в этом опросе.");
        }
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found with ID: " + answerId));
        if (answer == null) {
            throw new IllegalStateException("Answer is null after retrieval");
        }
        System.out.println("Retrieved answer: id=" + answer.getId() + ", text=" + answer.getText());
        Question question = questionRepository.findById(answer.getQuestion().getId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        Response response = new Response();
        response.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
        response.setAnswer(answer);
        System.out.println("Saving response: answerId=" + (answer != null ? answer.getId() : "null") + ", userId=" + userId);
        responseRepository.save(response);
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
    }

    public boolean hasUserRespondedToPollByPollId(Long pollId, Long userId) {
        List<Question> questions = questionRepository.findByPollId(pollId);
        for (Question question : questions) {
            List<Answer> answers = answerRepository.findByQuestionId(question.getId());
            for (Answer answer : answers) {
                if (responseRepository.existsByUserIdAndAnswerId(userId, answer.getId())) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<QuestionStatistics> getStatistics(Long pollId) {
        if (!pollRepository.existsById(pollId)) {
            throw new IllegalArgumentException("Poll not found");
        }

        List<Question> questions = questionRepository.findByPollId(pollId);
        List<QuestionStatistics> questionStatistics = new ArrayList<>();

        for (Question question : questions) {
            List<Answer> answers = answerRepository.findByQuestionId(question.getId());
            Map<String, Long> answerStats = new HashMap<>();

            for (Answer answer : answers) {
                Long count = responseRepository.countByAnswerId(answer.getId());
                answerStats.put(answer.getText(), count);
            }

            questionStatistics.add(new QuestionStatistics(question.getText(), answerStats));
        }

        return questionStatistics;
    }

    public static class QuestionStatistics {
        private String questionText;
        private Map<String, Long> answerStatistics;

        public QuestionStatistics(String questionText, Map<String, Long> answerStatistics) {
            this.questionText = questionText;
            this.answerStatistics = answerStatistics;
        }

        // Добавляем геттеры и сеттеры
        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public Map<String, Long> getAnswerStatistics() {
            return answerStatistics;
        }

        public void setAnswerStatistics(Map<String, Long> answerStatistics) {
            this.answerStatistics = answerStatistics;
        }
    }
}