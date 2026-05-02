package com.fintrack.dto;

public record AuthResponse(String token, UserResponse user) {
}
