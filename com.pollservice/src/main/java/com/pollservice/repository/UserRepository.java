package com.pollservice.repository;

import com.pollservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);  // Для Spring Security
    boolean existsByUsername(String username);       // Проверка уникальности
}