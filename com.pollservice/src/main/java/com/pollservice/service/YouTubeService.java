package com.pollservice.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class YouTubeService {
    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?<=watch\\?v=|/videos/|embed\\/|youtu.be\\/|\\/v\\/|\\/e\\/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%\u200C\u200B2F|youtu.be%2F|%2Fv%2F)[^#\\&\\?\\n]*"
    );

    public String extractVideoId(String url) {
        var matcher = YOUTUBE_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }
}