package com.pollservice.service;

import com.pollservice.model.Answer;
import com.pollservice.model.Response;
import com.pollservice.repository.AnswerRepository;
import com.pollservice.repository.ResponseRepository;
import com.pollservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final AnswerRepository answerRepository;

    public ResponseService(ResponseRepository responseRepository, UserRepository userRepository, AnswerRepository answerRepository) {
        this.responseRepository = responseRepository;
        this.userRepository = userRepository;
        this.answerRepository = answerRepository;
    }

    public void submitResponse(Long answerId, Long userId) {
        // Проверяем, не голосовал ли пользователь уже за этот опрос
        if (hasUserRespondedToPoll(answerId, userId)) {
            throw new IllegalStateException("Вы уже проголосовали в этом опросе.");
        }

        Response response = new Response();
        response.setUserId(userId);
        response.setAnswerId(answerId);
        responseRepository.save(response);
    }

    public boolean hasUserRespondedToPoll(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Ответ не найден"));
        Long pollId = answer.getQuestion().getPoll().getId();
        // Проверяем, есть ли ответы пользователя для этого опроса
        return responseRepository.findByPollId(pollId).stream()
                .anyMatch(response -> response.getUserId().equals(userId));
    }

    public Map<Long, Integer> getStatistics(Long pollId) {
        Map<Long, Integer> stats = new HashMap<>();
        responseRepository.findByPollId(pollId).forEach(response -> {
            Long answerId = response.getAnswerId();
            stats.put(answerId, stats.getOrDefault(answerId, 0) + 1);
        });
        return stats;
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь с именем " + username + " не найден"))
                .getId();
    }
    public boolean hasUserRespondedToPollByPollId(Long pollId, Long userId) {
        return responseRepository.findByPollId(pollId).stream()
                .anyMatch(response -> response.getUserId().equals(userId));
    }
}
