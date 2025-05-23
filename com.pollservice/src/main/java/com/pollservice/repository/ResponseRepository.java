package com.pollservice.repository;

import com.pollservice.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    boolean existsByUserIdAndAnswerId(Long userId, Long answerId);

    @Query("SELECT r FROM Response r " +
            "JOIN r.answer a " +
            "JOIN a.question q " +
            "WHERE q.poll.id = :pollId")
    List<Response> findByPollId(Long pollId);

    Long countByAnswerId(Long answerId);

    @Query("SELECT r.answer.question.poll.id FROM Response r WHERE r.user.id = :userId")
    List<Long> findPollIdsByUserId(@Param("userId") Long userId);
}