package com.pollservice.controller;

import com.pollservice.model.Poll;
import com.pollservice.model.User;
import com.pollservice.service.PollService;
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

    @GetMapping
    public List<Poll> getAllPolls(@AuthenticationPrincipal User user) {
        return pollService.getPollsByAuthor(user);
    }

    @PostMapping
    public Poll createPoll(@RequestBody Poll poll,
                           @AuthenticationPrincipal User author) {
        return pollService.createPoll(poll, author);
    }

    @GetMapping("/with-youtube")
    public List<Poll> getPollsWithYouTube() {
        return pollService.getPollsWithYouTubeVideos();
    }
}