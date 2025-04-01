package com.pollservice.controller;

import com.pollservice.service.YouTubeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/youtube")
public class YouTubeController {
    private final YouTubeService youTubeService;

    public YouTubeController(YouTubeService youTubeService) {
        this.youTubeService = youTubeService;
    }

    @GetMapping("/extract-id")
    public String extractVideoId(@RequestParam String url) {
        return youTubeService.extractVideoId(url);
    }
}