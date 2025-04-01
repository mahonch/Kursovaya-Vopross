package com.pollservice.dto;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}