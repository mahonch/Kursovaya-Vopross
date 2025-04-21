package com.pollservice.controller;

import com.pollservice.config.JwtUtils;
import com.pollservice.model.Comment;
import com.pollservice.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final JwtUtils jwtUtils;

    public CommentController(CommentService commentService, JwtUtils jwtUtils) {
        this.commentService = commentService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitComment(
            @RequestParam("pollId") Long pollId,
            @RequestParam("text") String text,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            Long userId = commentService.getUserIdByUsername(username);
            Comment comment = commentService.createComment(pollId, userId, text);
            System.out.println("Created comment: " + comment);
            return ResponseEntity.ok(comment); // Возвращаем объект Comment в формате JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/poll/{pollId}")
    public ResponseEntity<?> getCommentsByPollId(@PathVariable Long pollId) {
        try {
            List<Comment> comments = commentService.getCommentsByPollId(pollId);
            System.out.println("Returning comments for pollId=" + pollId + ": " + comments);
            return ResponseEntity.ok(comments); // Возвращаем список комментариев в формате JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            String username = jwtUtils.extractUsername(jwt);
            String role = jwtUtils.extractRole(jwt); // Предполагаем, что JwtUtils имеет метод extractRole
            Long userId = commentService.getUserIdByUsername(username);

            Comment comment = commentService.getCommentById(commentId); // Новый метод в CommentService
            if (comment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found with ID: " + commentId);
            }

            // Проверяем, является ли пользователь автором комментария или администратором
            boolean isAdmin = "ADMIN".equals(role);
            boolean isAuthor = comment.getUser().getId().equals(userId);

            if (!isAdmin && !isAuthor) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this comment");
            }

            commentService.deleteComment(commentId);
            return ResponseEntity.ok("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}