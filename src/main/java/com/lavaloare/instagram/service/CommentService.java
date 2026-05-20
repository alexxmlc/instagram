package com.lavaloare.instagram.service;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dao.CommentVoteRepository;
import com.lavaloare.instagram.dto.CommentResponse;
import com.lavaloare.instagram.dto.PostAuthorDto;
import com.lavaloare.instagram.dto.UpdateCommentRequest;
import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.model.VoteType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final FileStorageService fileStorageService;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String COMMENT_SERVICE_URL = "http://localhost:8081/api/comments";

    public List<CommentResponse> getCommentsForPostFromMicroservice(
            Long postId,
            String authorizationHeader) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorizationHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<List<CommentResponse>> response = restTemplate.exchange(
                COMMENT_SERVICE_URL + "/post/" + postId,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<CommentResponse>>() {}
        );

        return response.getBody();
    }

    public CommentResponse createCommentViaMicroservice(
            Long postId,
            String authorizationHeader,
            String text,
            MultipartFile file) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorizationHeader);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (text != null) {
            body.add("text", text);
        }

        if (file != null && !file.isEmpty()) {
            body.add("file", file.getResource());
        }

        HttpEntity<MultiValueMap<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<CommentResponse> response = restTemplate.exchange(
                COMMENT_SERVICE_URL + "/post/" + postId,
                HttpMethod.POST,
                entity,
                CommentResponse.class
        );

        return response.getBody();
    }

    public void deleteCommentViaMicroservice(
            Long commentId,
            String authorizationHeader) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorizationHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                COMMENT_SERVICE_URL + "/" + commentId,
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }

    public CommentResponse updateComment(Long commentId, User currentUser, UpdateCommentRequest updateCommentRequest) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.MODERATOR) {
            throw new RuntimeException("Security Alert: You do not have permission to edit this comment");
        }
        if (updateCommentRequest.getText() != null) {
            if (updateCommentRequest.getText().isBlank()) {
                throw new RuntimeException("Comment text cannot be empty");
            }
            comment.setText(updateCommentRequest.getText());
        }

        if (updateCommentRequest.getFile() != null && !updateCommentRequest.getFile().isEmpty()) {
            String newPictureUrl = fileStorageService.uploadImageToCloud(updateCommentRequest.getFile());
            comment.setPictureUrl(newPictureUrl);
        }

        if ((comment.getText() == null || comment.getText().isBlank()) && 
             (comment.getPictureUrl() == null || comment.getPictureUrl().isBlank())) {
            throw new RuntimeException("Comment must contain text or image");
        }
        commentRepository.save(comment);

        PostAuthorDto commentAuthorDto = new PostAuthorDto(currentUser.getUsername(),
                currentUser.getProfilePictureUrl(), currentUser.getScore());
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getPictureUrl(),
                comment.getCreatedAt(),
                commentAuthorDto,
                calculateCommentVoteScore(comment)

        );

    }
    private long calculateCommentVoteScore(Comment comment) {
        long upvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.DOWNVOTE);
        return upvotes - downvotes;
    }
}