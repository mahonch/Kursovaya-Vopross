package com.pollservice.controller;

import com.pollservice.config.JwtUtils;
import com.pollservice.service.ResponseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/response")
public class ResponseController {

    private final ResponseService responseService;
    private final JwtUtils jwtUtils;

    public ResponseController(ResponseService responseService, JwtUtils jwtUtils) {
        this.responseService = responseService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitResponse(@RequestParam Long answerId,
                                                 @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Long userId = responseService.getUserIdByUsername(username);
            responseService.submitResponse(answerId, userId);
            return ResponseEntity.ok("Ответ успешно отправлен");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при отправке ответа: " + e.getMessage());
        }
    }

    @GetMapping("/stats/{pollId}")
    public ResponseEntity<?> getStatistics(@PathVariable Long pollId) {
        try {
            return ResponseEntity.ok(responseService.getStatistics(pollId));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/has-responded/{pollId}")
    public ResponseEntity<Boolean> hasUserResponded(@PathVariable Long pollId,
                                                    @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            Long userId = responseService.getUserIdByUsername(username);
            boolean hasResponded = responseService.hasUserRespondedToPollByPollId(pollId, userId);
            return ResponseEntity.ok(hasResponded);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }
}