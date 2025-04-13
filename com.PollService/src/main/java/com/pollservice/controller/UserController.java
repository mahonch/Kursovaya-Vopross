package com.pollservice.controller;

import com.pollservice.model.User;
import lombok.Getter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    public UserProfile getUserProfile(@AuthenticationPrincipal User user) {
        return new UserProfile(user.getUsername(), user.getRole().toString()); // Возвращаем имя и роль
    }

    // Класс для отправки данных профиля с ролью
    @Getter
    public static class UserProfile {
        private String username;
        private String role;

        public UserProfile(String username, String role) {
            this.username = username;
            this.role = role;
        }

    }
}
