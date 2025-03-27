package com.pollservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.pollservice.repository") // Активируем JPA репозитории
@EntityScan(basePackages = "com.pollservice.model") // Сканируем сущности в указанном пакете
public class PollApplication {
    public static void main(String[] args) {
        SpringApplication.run(PollApplication.class, args);
        System.out.println("Poll Service started successfully!"); // Стартовое сообщение
    }
}