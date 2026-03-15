package com.lavaloare.instagram.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lavaloare.instagram.dto.AuthenticationRequest;
import com.lavaloare.instagram.dto.AuthenticationResponse;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public AuthenticationResponse createUser(@Valid @RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest request) {
        return userService.login(request);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(currentUser);
    }
}
