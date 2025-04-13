package com.pollservice.controller;

import com.pollservice.service.YouTubeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/youtube")
public class YouTubeController {
    private final YouTubeService youTubeService;

    public YouTubeController(YouTubeService youTubeService) {
        this.youTubeService = youTubeService;
    }

    @GetMapping("/extract-id")
    public String extractVideoId(@RequestParam String url) {
        System.out.println("Получен URL: " + url); // Логируем URL
        return youTubeService.extractVideoId(url);
    }


}
