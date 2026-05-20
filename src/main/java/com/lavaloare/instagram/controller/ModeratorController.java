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

    @PostMapping("/ban/{username}")
    public ResponseEntity<String> banUser(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        
        userService.banUser(username, currentUser);
        return ResponseEntity.ok("User successfully banned.");
    }

    @PostMapping("/unban/{username}")
    public ResponseEntity<String> unbanUser(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        
        userService.unbanUser(username, currentUser);
        return ResponseEntity.ok("User successfully unbanned.");
    }
}