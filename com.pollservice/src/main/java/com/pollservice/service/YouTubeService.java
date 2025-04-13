package com.pollservice.service;

import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class YouTubeService {
    // Обновленное регулярное выражение для более широкого захвата видео ID
    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:https?://(?:www\\.)?youtube\\.com(?:/[^\\n]*)?\\?v=|youtu\\.be/)([a-zA-Z0-9_-]+)"
    );

    public String extractVideoId(String url) {
        var matcher = YOUTUBE_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1); // Возвращаем только video ID
        }
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }
}
