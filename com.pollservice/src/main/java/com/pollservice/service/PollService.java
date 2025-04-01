package com.pollservice.service;

import com.pollservice.model.Poll;
import com.pollservice.model.User;
import com.pollservice.repository.PollRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PollService {
    private final PollRepository pollRepository;
    private final YouTubeService youTubeService;

    public PollService(PollRepository pollRepository, YouTubeService youTubeService) {
        this.pollRepository = pollRepository;
        this.youTubeService = youTubeService;
    }

    @Transactional
    public Poll createPoll(Poll poll, User author) {
        poll.setAuthor(author);
        if (poll.getYoutubeVideoId() != null) {
            String videoId = youTubeService.extractVideoId(poll.getYoutubeVideoId());
            poll.setYoutubeVideoId(videoId);
        }
        return pollRepository.save(poll);
    }

    public List<Poll> getPollsByAuthor(User author) {
        return pollRepository.findByAuthorId(author.getId());
    }

    public List<Poll> getPollsWithYouTubeVideos() {
        return pollRepository.findPollsWithYouTube();
    }
}