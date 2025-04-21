package com.pollservice.controller;

import com.pollservice.config.JwtUtils;
import com.pollservice.service.ResponseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    private final ResponseService responseService;
    private final JwtUtils jwtUtils;

    public ResponseController(ResponseService responseService, JwtUtils jwtUtils) {
        this.responseService = responseService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitResponse(
            @RequestParam("answerId") Long answerId,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            Long userId = responseService.getUserIdByUsername(username);
            responseService.submitResponse(answerId, userId);
            return ResponseEntity.ok("Response submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/statistics/{pollId}")
    public ResponseEntity<?> getStatistics(@PathVariable Long pollId) {
        try {
            List<ResponseService.QuestionStatistics> statistics = responseService.getStatistics(pollId);
            return ResponseEntity.ok(statistics);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching statistics: " + e.getMessage());
        }
    }

    @GetMapping("/hasResponded/{pollId}")
    public ResponseEntity<?> hasResponded(
            @PathVariable Long pollId,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            Long userId = responseService.getUserIdByUsername(username);
            boolean hasResponded = responseService.hasUserRespondedToPollByPollId(pollId, userId);
            return ResponseEntity.ok(hasResponded);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}