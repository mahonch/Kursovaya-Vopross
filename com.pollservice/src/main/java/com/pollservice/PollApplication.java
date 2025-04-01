package com.pollservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.pollservice")
@EntityScan(basePackages = "com.pollservice.model")
@EnableJpaRepositories(basePackages = "com.pollservice.repository")
public class PollApplication {
    public static void main(String[] args) {
        SpringApplication.run(PollApplication.class, args);
    }
}