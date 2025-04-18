package com.pollservice.repository;

import com.pollservice.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    boolean existsByUserIdAndAnswerId(Long userId, Long answerId);

    @Query("SELECT r FROM Response r " +
            "JOIN Answer a ON r.answerId = a.id " +
            "JOIN Question q ON a.question.id = q.id " +
            "WHERE q.poll.id = :pollId")
    List<Response> findByPollId(Long pollId);
}