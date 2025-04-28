package com.pollservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class SpaForwardingController {

    @GetMapping("/poll/{id}")
    public String redirectPoll(@PathVariable Long id) {
        System.out.println("Redirecting /poll/" + id + " to /poll.html?id=" + id);
        return "redirect:/poll.html?id=" + id;
    }


}