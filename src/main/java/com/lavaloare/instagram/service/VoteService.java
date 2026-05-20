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
import com.lavaloare.instagram.dao.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class VoteService {
    private final CommentRepository commentRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final PostRepository postRepository;
    private final PostVoteRepository postVoteRepository;
    private final UserRepository userRepository;

    public long votePost(User currentUser, Long postId, VoteType voteType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if(post.getAuthor().getId().equals(currentUser.getId())){
            throw new IllegalArgumentException("You cannot vote your own post");
        }

        User author = post.getAuthor();
        double authorScoreChange = 0.0;

        Optional<PostVote> existingVote = postVoteRepository.findByUserAndPost(currentUser, post);
        if(existingVote.isPresent()){
            PostVote vote = existingVote.get();
            if(vote.getVoteType() == voteType){
                authorScoreChange -= getPostScoreImpact(voteType);
                postVoteRepository.delete(vote);
            } else {
                authorScoreChange -= getPostScoreImpact(vote.getVoteType());
                authorScoreChange += getPostScoreImpact(voteType);
                vote.setVoteType(voteType);
                postVoteRepository.save(vote);
            }
        } else {
            authorScoreChange += getPostScoreImpact(voteType);
            PostVote newVote = new PostVote();
            newVote.setPost(post);
            newVote.setUser(currentUser);
            newVote.setVoteType(voteType);
            postVoteRepository.save(newVote);
        }

        author.setScore(author.getScore() + authorScoreChange);
        userRepository.save(author);

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

        User author = comment.getAuthor();
        double authorScoreChange = 0.0;
        double voterScoreChange = 0.0;

        Optional<CommentVote> existingVote = commentVoteRepository.findByUserAndComment(currentUser, comment);
        if(existingVote.isPresent()){
            CommentVote vote = existingVote.get();
            if(vote.getVoteType() == voteType){
                authorScoreChange -= getCommentScoreImpact(voteType);
                if (voteType == VoteType.DOWNVOTE) {
                    voterScoreChange += 1.5;
                }

                commentVoteRepository.delete(vote);
            } else {
                authorScoreChange -= getCommentScoreImpact(vote.getVoteType());
                authorScoreChange += getCommentScoreImpact(voteType);

                if (vote.getVoteType() == VoteType.DOWNVOTE) {
                    voterScoreChange += 1.5;
                }

                if (voteType == VoteType.DOWNVOTE) {
                    voterScoreChange -= 1.5;
                }
                vote.setVoteType(voteType);
                commentVoteRepository.save(vote);
            }
        } else {
            authorScoreChange += getCommentScoreImpact(voteType);

            if (voteType == VoteType.DOWNVOTE) {
                voterScoreChange -= 1.5;
            }
            CommentVote newVote = new CommentVote();
            newVote.setComment(comment);
            newVote.setUser(currentUser);
            newVote.setVoteType(voteType);
            commentVoteRepository.save(newVote);
        }

        author.setScore(author.getScore() + authorScoreChange);
        currentUser.setScore(currentUser.getScore() + voterScoreChange);

        userRepository.save(author);
        userRepository.save(currentUser);

        long upvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.UPVOTE);
        long downvotes = commentVoteRepository.countByCommentAndVoteType(comment, VoteType.DOWNVOTE);
        return upvotes - downvotes;
    }  
    private double getPostScoreImpact(VoteType voteType) {
    return voteType == VoteType.UPVOTE ? 2.5 : -1.5;
    }

    private double getCommentScoreImpact(VoteType voteType) {
    return voteType == VoteType.UPVOTE ? 5.0 : -2.5;
    }    
}
