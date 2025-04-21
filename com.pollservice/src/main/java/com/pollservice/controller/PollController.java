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
    public ResponseEntity<?> createPoll(@RequestBody CreatePollDto pollDto, @AuthenticationPrincipal User author) {
        try {
            System.out.println("Полученные данные для создания опроса: " + pollDto);
            if (author == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не авторизован");
            }
            Poll createdPoll = pollService.createPollWithQuestions(pollDto, author);
            System.out.println("Созданный опрос: " + createdPoll);
            return ResponseEntity.ok(createdPoll);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при создании опроса: " + e.getMessage());
        }
    }

    @GetMapping("/with-youtube")
    public ResponseEntity<List<Poll>> getPollsWithYouTube() {
        try {
            List<Poll> polls = pollService.getPollsWithYouTubeVideos();
            return ResponseEntity.ok(polls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<Poll>> getAllPolls(@AuthenticationPrincipal User user) {
        try {
            List<Poll> polls = pollService.getAllPollsForUser(user);
            return ResponseEntity.ok(polls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Autowired
    private UserService userService;

    @DeleteMapping("/{pollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePoll(@PathVariable Long pollId, Principal principal) {
        System.out.println("Удаляет: " + principal.getName());
        try {
            pollService.deletePollById(pollId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Ошибка при удалении опроса: " + e.getMessage());
        }
    }

    @GetMapping("/{pollId}")
    public ResponseEntity<?> getPollById(@PathVariable Long pollId) {
        try {
            Poll poll = pollService.getPollById(pollId);
            return ResponseEntity.ok(poll);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при получении опроса: " + e.getMessage());
        }
    }
}