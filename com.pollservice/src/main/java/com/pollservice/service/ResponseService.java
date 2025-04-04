package com.pollservice.service;

import com.pollservice.model.Answer;
import com.pollservice.model.Response;
import com.pollservice.model.User;
import com.pollservice.repository.ResponseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResponseService {
    private final ResponseRepository responseRepository;

    public ResponseService(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    @Transactional
    public void submitResponse(User user, Answer answer) {
        Response response = new Response();
        response.setUser(user);
        response.setAnswer(answer);
        responseRepository.save(response);
    }

    public Map<Long, Long> getPollStatistics(Long pollId) {
        return responseRepository.getPollStatistics(pollId).stream()
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],
                        arr -> (Long) arr[1]
                ));
    }
}