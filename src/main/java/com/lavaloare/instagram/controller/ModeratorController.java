package com.lavaloare.instagram.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mod")
@RequiredArgsConstructor
public class ModeratorController {

    private final UserService userService;

    @PostMapping("/ban/{userId}")
    public ResponseEntity<String> banUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        
        userService.banUser(userId, currentUser);
        return ResponseEntity.ok("User successfully banned.");
    }

    @PostMapping("/unban/{userId}")
    public ResponseEntity<String> unbanUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        
        userService.unbanUser(userId, currentUser);
        return ResponseEntity.ok("User successfully unbanned.");
    }
}