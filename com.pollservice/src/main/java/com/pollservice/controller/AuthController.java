package com.pollservice.controller;

import com.pollservice.config.JwtUtils;
import com.pollservice.model.User;
import com.pollservice.service.RefreshTokenService;
import com.pollservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(UserService userService,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
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
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newToken = jwtUtils.generateToken(user);
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    return ResponseEntity.ok(new TokenResponse(
                            newToken,
                            newRefreshToken.getToken()
                    ));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }
}