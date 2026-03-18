package com.lavaloare.instagram.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lavaloare.instagram.dto.CreatePostRequest;
import com.lavaloare.instagram.dto.PostResponse;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal User author,
            @ModelAttribute CreatePostRequest request) {
        return ResponseEntity.ok(postService.createPost(author, request));
    }
}
