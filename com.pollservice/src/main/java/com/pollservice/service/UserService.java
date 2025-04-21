package com.pollservice.service;

import com.pollservice.dto.UserRegistrationDto;
import com.pollservice.model.Role;
import com.pollservice.model.User;
import com.pollservice.repository.ResponseRepository;
import com.pollservice.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ResponseRepository responseRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, ResponseRepository responseRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.responseRepository = responseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void changeUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void createUser(UserRegistrationDto registrationDto) {
        if (registrationDto.getPassword() == null || registrationDto.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }

        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole(registrationDto.getRole());
        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    public void updateUser(User user) {
        userRepository.save(user);
    }

    public int getCompletedPollsCount(Long userId) {
        List<Long> pollIds = responseRepository.findPollIdsByUserId(userId);
        Set<Long> uniquePollIds = new HashSet<>(pollIds);
        return uniquePollIds.size();
    }
}