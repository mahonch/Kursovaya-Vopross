package com.pollservice.controller;

import com.pollservice.dto.CreatePollDto;
import com.pollservice.model.Poll;
import com.pollservice.model.User;
import com.pollservice.service.PollService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/polls")
public class PollController {
    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @PostMapping

    public Poll createPoll(@RequestBody CreatePollDto pollDto, @AuthenticationPrincipal User author) {
        System.out.println("Полученные данные для создания опроса: " + pollDto);
        Poll createdPoll = pollService.createPollWithQuestions(pollDto, author);
        System.out.println("Созданный опрос: " + createdPoll);
        return createdPoll;
    }


    @GetMapping("/with-youtube")
    public List<Poll> getPollsWithYouTube() {
        return pollService.getPollsWithYouTubeVideos();
    }
    @GetMapping
    public List<Poll> getAllPolls(@AuthenticationPrincipal User user) {
        return pollService.getAllPollsForUser(user); // или просто pollService.getAll()
    }
    public ResponseEntity<String> handleError(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"error\": \"" + ex.getMessage() + "\"}");
    }


}