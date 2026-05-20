package com.lavaloare.instagram.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dao.CommentVoteRepository;
import com.lavaloare.instagram.dao.UserRepository;
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
import com.lavaloare.instagram.model.CommentVote;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    public CommentResponse createComment(Long postId, User currentUser, CreateCommentRequest request) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getStatus() == PostStatus.OUTDATED) {
            throw new IllegalArgumentException("Comments are closed for this post");
        }

        if ((request.getText() == null || request.getText().isBlank()) &&
                (request.getFile() == null || request.getFile().isEmpty())) {
            throw new RuntimeException("Comment must contain text or an image");
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(currentUser);
        comment.setText(request.getText());

    
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String pictureUrl = fileStorageService.uploadImageToCloud(request.getFile());
            comment.setPictureUrl(pictureUrl);
        }

        commentRepository.save(comment);
        
        if (post.getStatus() == PostStatus.JUST_POSTED) {
            post.setStatus(PostStatus.FIRST_REACTIONS);
            postRepository.save(post);
        }

        PostAuthorDto commentAuthorDto = new PostAuthorDto(currentUser.getUsername(),
                currentUser.getProfilePictureUrl(), currentUser.getScore());
                
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getPictureUrl(),
                comment.getCreatedAt(),
                commentAuthorDto,
                calculateCommentVoteScore(comment));
    }

    public List<CommentResponse> getCommentsForPost(Long postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<Comment> comments = commentRepository.findAllByPost_IdOrderByCreatedAtAsc(postId);
        return comments.stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getText(),
                        comment.getPictureUrl(),
                        comment.getCreatedAt(),
                        new PostAuthorDto(
                                comment.getAuthor().getUsername(),
                                comment.getAuthor().getProfilePictureUrl(),
                                comment.getAuthor().getScore()),
                        calculateCommentVoteScore(comment)))
                .sorted((c1, c2) -> Long.compare(c2.getVoteScore(), c1.getVoteScore()))
                .toList();
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

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.MODERATOR) {
            throw new RuntimeException("Security Alert: You do not have permission to edit this comment");
        }

        List<CommentVote> votes = commentVoteRepository.findAllByComment(comment);

        User commentAuthor = comment.getAuthor();

        for (CommentVote vote : votes) {
            if (vote.getVoteType() == VoteType.UPVOTE) {
                commentAuthor.setScore(commentAuthor.getScore() - 5.0);
            } else {
                commentAuthor.setScore(commentAuthor.getScore() + 2.5);

            User voter = vote.getUser();
            voter.setScore(voter.getScore() + 1.5);
            userRepository.save(voter);
            }
        }

        userRepository.save(commentAuthor);

        commentVoteRepository.deleteAllByComment(comment);
        commentRepository.delete(comment);
    }

    private long calculateCommentVoteScore(Comment comment) {
        long upvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.DOWNVOTE);
        return upvotes - downvotes;
    }
}