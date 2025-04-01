package com.pollservice.controller;

import com.pollservice.config.JwtUtils;
import com.pollservice.dto.RefreshTokenRequest;
import com.pollservice.dto.TokenResponse;
import com.pollservice.model.RefreshToken;
import com.pollservice.model.User;
import com.pollservice.service.RefreshTokenService;
import com.pollservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RefreshTokenService refreshTokenService;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    // Конструктор с внедрением зависимостей
    public AuthController(RefreshTokenService refreshTokenService,
                          JwtUtils jwtUtils,
                          UserService userService, PasswordEncoder passwordEncoder)  {
        this.refreshTokenService = refreshTokenService;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userService.isUsernameAvailable(user.getUsername())) {
            userService.createUser(user);
            return ResponseEntity.ok("User registered");
        }
        return ResponseEntity.badRequest().body("Username taken");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
        if (passwordEncoder.matches(user.getPassword(), userDetails.getPassword())) {
            return ResponseEntity.ok(jwtUtils.generateToken(userDetails));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtUtils.generateToken((UserDetails) user); // 1. Исправлено jutUtils -> jwtUtils
                    return ResponseEntity.ok(new TokenResponse(
                            accessToken,
                            request.getRefreshToken()
                    )); // 2. Исправлена закрывающая скобка
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is invalid"));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal User user) {
        refreshTokenService.deleteByUserId(user.getId());
        return ResponseEntity.ok("Logout successful");
    }

}