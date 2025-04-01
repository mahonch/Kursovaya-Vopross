package com.pollservice.model;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    GUEST, MODERATOR, ADMIN;

    @Override
    public String getAuthority() {
        return "ROLE_" + name();
    }
}