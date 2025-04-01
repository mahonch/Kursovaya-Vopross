package com.pollservice.controller;

import com.pollservice.model.Answer;
import com.pollservice.model.User;
import com.pollservice.service.ResponseService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {
    private final ResponseService responseService;

    public ResponseController(ResponseService responseService) {
        this.responseService = responseService;
    }

    @PostMapping
    public void submitResponse(@RequestBody Answer answer,
                               @AuthenticationPrincipal User user) {
        responseService.submitResponse(user, answer);
    }

    @GetMapping("/stats/{pollId}")
    public Map<Long, Long> getStats(@PathVariable Long pollId) {
        return responseService.getPollStatistics(pollId);
    }
}