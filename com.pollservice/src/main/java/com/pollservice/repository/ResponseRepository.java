package com.pollservice.repository;

import com.pollservice.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    @Query("SELECT r FROM Response r WHERE r.user.id = :userId")
    List<Response> findByUserId(Long userId);  // Ответы пользователя

    @Query("SELECT r.answer.id, COUNT(r) FROM Response r WHERE r.answer.question.poll.id = :pollId GROUP BY r.answer.id")
    List<Object[]> getPollStatistics(Long pollId);  // Статистика по опросу
}