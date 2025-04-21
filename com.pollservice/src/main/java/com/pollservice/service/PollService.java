package com.pollservice.service;

import com.pollservice.dto.CreatePollDto;
import com.pollservice.model.Answer;
import com.pollservice.model.Poll;
import com.pollservice.model.Question;
import com.pollservice.model.User;
import com.pollservice.repository.AnswerRepository;
import com.pollservice.repository.PollRepository;
import com.pollservice.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PollService {
    private final PollRepository pollRepository;
    private final YouTubeService youTubeService;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public PollService(PollRepository pollRepository,
                       YouTubeService youTubeService,
                       QuestionRepository questionRepository,
                       AnswerRepository answerRepository) {
        this.pollRepository = pollRepository;
        this.youTubeService = youTubeService;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    @Transactional
    public Poll createPollWithQuestions(CreatePollDto pollDto, User author) {
        // Валидация входных данных
        if (!pollDto.isValid()) {
            throw new IllegalArgumentException("Название опроса и вопросы не могут быть пустыми");
        }

        for (CreatePollDto.QuestionDto questionDto : pollDto.getQuestions()) {
            if (!questionDto.isValid()) {
                throw new IllegalArgumentException("Все вопросы и варианты ответов должны быть заполнены");
            }
        }

        Poll poll = new Poll();
        poll.setTitle(pollDto.getTitle());
        poll.setQuestionCount(pollDto.getQuestionCount());
        poll.setUser(author);

        if (pollDto.getYoutubeUrl() != null && !pollDto.getYoutubeUrl().trim().isEmpty()) {
            try {
                String videoId = youTubeService.extractVideoId(pollDto.getYoutubeUrl());
                poll.setYoutubeVideoId(videoId);
            } catch (Exception e) {
                throw new IllegalArgumentException("Не удалось извлечь YouTube Video ID: " + e.getMessage());
            }
        }

        poll = pollRepository.save(poll);

        for (CreatePollDto.QuestionDto questionDto : pollDto.getQuestions()) {
            Question question = new Question();
            question.setText(questionDto.getText());
            question.setPoll(poll);
            question = questionRepository.save(question);

            for (String answerText : questionDto.getAnswers()) {
                Answer answer = new Answer();
                answer.setText(answerText);
                answer.setQuestion(question);
                answerRepository.save(answer);
            }
        }

        return poll;
    }

    public Poll getPollById(Long pollId) {
        return pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Опрос не найден"));
    }

    public List<Poll> getPollsByAuthor(User author) {
        return pollRepository.findByUserId(author.getId());
    }

    public List<Poll> getPollsWithYouTubeVideos() {
        return pollRepository.findPollsWithYouTube();
    }

    public List<Poll> getAllPollsForUser(User user) {
        return pollRepository.findAll();
    }

    public void deletePollById(Long pollId) {
        Optional<Poll> pollOptional = pollRepository.findById(pollId);
        if (pollOptional.isEmpty()) {
            throw new IllegalArgumentException("Опрос с ID " + pollId + " не найден");
        }

        pollRepository.deleteById(pollId);
    }
}