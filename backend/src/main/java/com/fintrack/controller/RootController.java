package com.fintrack.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
    @GetMapping({"/", "/api"})
    public Map<String, Object> root() {
        return Map.of(
            "service", "expense-tracker-api",
            "status", "UP",
            "health", "/api/health"
        );
    }
}
