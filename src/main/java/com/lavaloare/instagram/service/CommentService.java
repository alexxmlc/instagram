package com.lavaloare.instagram.service;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dao.CommentVoteRepository;
import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dto.CommentResponse;
import com.lavaloare.instagram.dto.CreateCommentRequest;
import com.lavaloare.instagram.dto.PostAuthorDto;
import com.lavaloare.instagram.dto.UpdateCommentRequest;
import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostStatus;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.model.VoteType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;
    private final CommentVoteRepository commentVoteRepository;

    public CommentResponse createComment(Long postId, User currentUser, CreateCommentRequest createCommentRequest) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (post.getStatus() == PostStatus.OUTDATED) {
            throw new IllegalArgumentException("Comments are closed for this post");
        }
        
        String imageUrl = null;
        if (createCommentRequest.getFile() != null && !createCommentRequest.getFile().isEmpty()) {
            imageUrl = fileStorageService.uploadImageToCloud(createCommentRequest.getFile());
        }
        if ((createCommentRequest.getText() == null || createCommentRequest.getText().isBlank()) && imageUrl == null) {
            throw new RuntimeException("Comment must contain text or image");
        }
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(currentUser);
        comment.setText(createCommentRequest.getText());
        comment.setImageUrl(imageUrl);

        commentRepository.save(comment);
        if (post.getStatus() == PostStatus.JUST_POSTED) {
            post.setStatus(PostStatus.FIRST_REACTIONS);
            postRepository.save(post);
        }

        PostAuthorDto commentAuthorDto = new PostAuthorDto(currentUser.getUsername(), currentUser.getProfilePictureUrl());
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getImageUrl(),
                comment.getCreatedAt(),
                commentAuthorDto,
                calculateCommentVoteScore(comment)
        );
    }

    public List<CommentResponse> getCommentsForPost(Long postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<Comment> comments=commentRepository.findAllByPost_IdOrderByCreatedAtAsc(postId);
        return comments.stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getText(),
                        comment.getImageUrl(),
                        comment.getCreatedAt(),
                        new PostAuthorDto(
                                comment.getAuthor().getUsername(),
                                comment.getAuthor().getProfilePictureUrl()
                        ),
                        calculateCommentVoteScore(comment)
                ))
                .sorted((c1, c2) -> Long.compare(c2.getVoteScore(), c1.getVoteScore()))
                .toList();
    }

    public CommentResponse updateComment(Long commentId, User currentUser, UpdateCommentRequest updateCommentRequest) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if(!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Security Alert: You can only edit your own comments");
        }
        if (updateCommentRequest.getText() != null) {
            if (updateCommentRequest.getText().isBlank()) {
                throw new RuntimeException("Comment text cannot be empty");
            }
            comment.setText(updateCommentRequest.getText());
        }

        if(updateCommentRequest.getFile() != null && !updateCommentRequest.getFile().isEmpty()) {
            comment.setImageUrl(fileStorageService.uploadImageToCloud(updateCommentRequest.getFile()));
        }
        if ((comment.getText() == null || comment.getText().isBlank()) && comment.getImageUrl() == null) {
            throw new RuntimeException("Comment must contain text or image");
        }
        commentRepository.save(comment);

        PostAuthorDto commentAuthorDto = new PostAuthorDto(currentUser.getUsername(), currentUser.getProfilePictureUrl());
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getImageUrl(),
                comment.getCreatedAt(),
                commentAuthorDto,
                calculateCommentVoteScore(comment)

        );

    }
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Security Alert: You can only delete your comments.");
        }

        commentRepository.delete(comment);
    }

    private long calculateCommentVoteScore(Comment comment) {
        long upvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.DOWNVOTE);
        return upvotes - downvotes;
}
}
