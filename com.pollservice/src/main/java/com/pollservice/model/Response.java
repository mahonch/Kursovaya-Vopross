package com.pollservice.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String youtubeVideoId;  // Для интеграции с YouTube

    @ManyToOne
    private User author;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL)
    private List<Question> questions;

    // Геттеры и сеттеры
}