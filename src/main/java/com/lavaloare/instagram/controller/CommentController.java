package com.lavaloare.instagram.controller;

import com.lavaloare.instagram.dto.*;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
        private final CommentService commentService;

    @PostMapping(value = "/post/{postId}",consumes = "multipart/form-data")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser,
            @ModelAttribute CreateCommentRequest createCommentRequest) {
        return ResponseEntity.ok(commentService.createComment(postId,currentUser, createCommentRequest));
    }
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsForPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }
    @PatchMapping(value = "/{commentId}",consumes = "multipart/form-data")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser,
            @ModelAttribute UpdateCommentRequest request) {

        return ResponseEntity.ok(commentService.updateComment(commentId, currentUser, request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser) {

        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
