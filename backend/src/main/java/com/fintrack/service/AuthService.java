package com.fintrack.service;

import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.SignupRequest;
import com.fintrack.model.Category;
import com.fintrack.model.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        CategoryRepository categoryRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        User user = new User(
            request.name().trim(),
            email,
            passwordEncoder.encode(request.password())
        );
        User savedUser = userRepository.save(user);
        seedDefaultCategories(savedUser);

        return new AuthResponse(jwtService.generateToken(savedUser), DtoMapper.toUserResponse(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return new AuthResponse(jwtService.generateToken(user), DtoMapper.toUserResponse(user));
    }

    private void seedDefaultCategories(User user) {
        List<Category> categories = List.of(
            category(user, "Food", "#22c55e", "utensils"),
            category(user, "Rent", "#38bdf8", "home"),
            category(user, "Transport", "#f97316", "car"),
            category(user, "Shopping", "#a78bfa", "shopping-cart"),
            category(user, "Utilities", "#facc15", "zap"),
            category(user, "Healthcare", "#fb7185", "heart-pulse")
        );
        categoryRepository.saveAll(categories);
    }

    private Category category(User user, String name, String color, String icon) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setColor(color);
        category.setIcon(icon);
        return category;
    }
}
