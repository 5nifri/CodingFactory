package tn.esprit.codingfactory.auth.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import tn.esprit.codingfactory.auth.dto.AuthResponse;
import tn.esprit.codingfactory.auth.dto.LoginRequest;
import tn.esprit.codingfactory.auth.dto.RegisterRequest;
import tn.esprit.codingfactory.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/admin-test")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTest() {
        return "You are an ADMIN";
    }
}
