package com.lavaloare.instagram.service;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dao.CommentVoteRepository;
import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dao.PostVoteRepository;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.CommentVote;
import com.lavaloare.instagram.model.PostVote;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.model.VoteType;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class VoteService {
    private final CommentRepository commentRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final PostRepository postRepository;
    private final PostVoteRepository postVoteRepository;

    public long votePost(User currentUser, Long postId, VoteType voteType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if(post.getAuthor().getId().equals(currentUser.getId())){
            throw new IllegalArgumentException("You cannot vote your own post");
        }

        Optional<PostVote> existingVote = postVoteRepository.findByUserAndPost(currentUser, post);
        if(existingVote.isPresent()){
            PostVote vote = existingVote.get();
            if(vote.getVoteType() == voteType){
                postVoteRepository.delete(vote);
            } else {
                vote.setVoteType(voteType);
                postVoteRepository.save(vote);
            }
        } else {
            PostVote newVote = new PostVote();
            newVote.setPost(post);
            newVote.setUser(currentUser);
            newVote.setVoteType(voteType);
            postVoteRepository.save(newVote);
        }

        long upvotes = postVoteRepository.countByPostAndVoteType(post, VoteType.UPVOTE);
        long downvotes = postVoteRepository.countByPostAndVoteType(post, VoteType.DOWNVOTE);
        return upvotes - downvotes;
    }

    public long voteComment(User currentUser, Long commentId, VoteType voteType) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found"));

        if(comment.getAuthor().getId().equals(currentUser.getId())){
            throw new IllegalArgumentException("You cannot vote your own comment");
        }

        Optional<CommentVote> existingVote = commentVoteRepository.findByUserAndComment(currentUser, comment);
        if(existingVote.isPresent()){
            CommentVote vote = existingVote.get();
            if(vote.getVoteType() == voteType){
                commentVoteRepository.delete(vote);
            } else {
                vote.setVoteType(voteType);
                commentVoteRepository.save(vote);
            }
        } else {
            CommentVote newVote = new CommentVote();
            newVote.setComment(comment);
            newVote.setUser(currentUser);
            newVote.setVoteType(voteType);
            commentVoteRepository.save(newVote);
        }

        long upvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.DOWNVOTE);
        return upvotes - downvotes;
    }  
}
