package com.pollservice.repository;

import com.pollservice.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByAuthorId(Long userId);  // Опросы конкретного пользователя

    @Query("SELECT p FROM Poll p WHERE p.youtubeVideoId IS NOT NULL")
    List<Poll> findPollsWithYouTube();       // Опросы с видео
}