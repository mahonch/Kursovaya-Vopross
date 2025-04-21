package com.pollservice.service;

import com.pollservice.model.Comment;
import com.pollservice.model.Poll;
import com.pollservice.model.User;
import com.pollservice.repository.CommentRepository;
import com.pollservice.repository.PollRepository;
import com.pollservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PollRepository pollRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, PollRepository pollRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.pollRepository = pollRepository;
        this.userRepository = userRepository;
    }

    public Comment createComment(Long pollId, Long userId, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found with ID: " + pollId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setPoll(poll);
        comment.setUser(user);
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPollId(Long pollId) {
        return commentRepository.findByPollId(pollId);
    }

    public Comment getCommentById(Long commentId) {
        return commentRepository.findById(commentId)
                .orElse(null);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username))
                .getId();
    }
}