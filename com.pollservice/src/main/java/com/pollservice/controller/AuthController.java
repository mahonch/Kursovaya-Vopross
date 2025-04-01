package com.pollservice.controller;

import com.pollservice.model.User;
import com.pollservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userService.isUsernameAvailable(user.getUsername())) {
            // В реальном проекте: хеширование пароля!
            userService.createUser(user);
            return ResponseEntity.ok("User registered");
        }
        return ResponseEntity.badRequest().body("Username taken");
    }
}