package com.pollservice.controller;

import com.pollservice.dto.CreatePollDto;
import com.pollservice.model.Poll;
import com.pollservice.model.User;
import com.pollservice.service.PollService;
import com.pollservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
    @Autowired
    private UserService userService; // или UserRepository

    @DeleteMapping("/{pollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePoll(@PathVariable Long pollId, Principal principal) {
        System.out.println("Удаляет: " + principal.getName());
        try {
            pollService.deletePollById(pollId); // если автор не нужен
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Ошибка при удалении опроса: " + e.getMessage());
        }
    }
    @GetMapping("/{pollId}")
    public Poll getPollById(@PathVariable Long pollId) {
        return pollService.getPollById(pollId);
    }


}