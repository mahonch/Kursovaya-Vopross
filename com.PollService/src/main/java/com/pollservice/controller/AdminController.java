package com.pollservice.controller;

import com.pollservice.model.Role;
import com.pollservice.model.User;
import com.pollservice.service.PollService;
import com.pollservice.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;


    public AdminController(UserService userService, PollService pollService) {
        this.userService = userService;
    }

    // Получение списка всех пользователей для отображения в админской панели
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Изменение роли пользователя
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user/{userId}/role")
    public String changeUserRole(@PathVariable Long userId, @RequestBody Role newRole) {
        userService.changeUserRole(userId, newRole);
        return "User role updated successfully";
    }

}
