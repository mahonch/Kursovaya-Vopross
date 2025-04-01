package com.pollservice.repository;

import com.pollservice.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByPollId(Long pollId);  // Вопросы для опроса
}