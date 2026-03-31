package com.lavaloare.instagram.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lavaloare.instagram.dto.VoteRequest;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.service.VoteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {
    private final VoteService voteService;
    
    @PostMapping("/posts/{postId}")
    public long votePost(@AuthenticationPrincipal User currentUser, @PathVariable Long postId, @RequestBody VoteRequest request) {
        return voteService.votePost(currentUser, postId, request.getVoteType());
    }

    @PostMapping("/comments/{commentId}")
    public long voteComment(@AuthenticationPrincipal User currentUser, @PathVariable Long commentId, @RequestBody VoteRequest request) {
        return voteService.voteComment(currentUser, commentId, request.getVoteType());
    }

}