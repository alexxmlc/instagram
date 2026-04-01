package com.lavaloare.instagram.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lavaloare.instagram.dto.CreatePostRequest;
import com.lavaloare.instagram.dto.PostResponse;
import com.lavaloare.instagram.dto.UpdatePostRequest;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.PostService;

import lombok.RequiredArgsConstructor;
import com.lavaloare.instagram.dto.PostDetailsResponse;
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

    @PostMapping("/{postId}/close-comments")
    public void closeComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        postService.closeComments(postId, currentUser);
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdatePostRequest request) {

        return ResponseEntity.ok(postService.updatePost(postId, currentUser, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {

        postService.deletePost(postId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String author,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.getAllPosts(tag, search, author, currentUser));
    }
    @GetMapping("/{postId}")
    public ResponseEntity<PostDetailsResponse> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }
}
