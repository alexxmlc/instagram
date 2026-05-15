package com.lavaloare.instagram.controller;

import java.util.List;

import com.lavaloare.instagram.dto.CommentResponse;
import com.lavaloare.instagram.dto.UpdateCommentRequest;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.CommentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsForPost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String authorizationHeader) {

        return ResponseEntity.ok(
                commentService.getCommentsForPostFromMicroservice(
                        postId,
                        authorizationHeader
                )
        );
    }

    @PostMapping(value = "/post/{postId}", consumes = "multipart/form-data")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) MultipartFile file) {

        return ResponseEntity.ok(
                commentService.createCommentViaMicroservice(
                        postId,
                        authorizationHeader,
                        text,
                        file
                )
        );
    }

    // EDIT RAMANE LOCAL
    @PatchMapping(value = "/{commentId}", consumes = "multipart/form-data")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser,
            @ModelAttribute UpdateCommentRequest request) {

        return ResponseEntity.ok(
                commentService.updateComment(
                        commentId,
                        currentUser,
                        request
                )
        );
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String authorizationHeader) {

        commentService.deleteCommentViaMicroservice(
                commentId,
                authorizationHeader
        );

        return ResponseEntity.noContent().build();
    }
}