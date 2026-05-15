package com.lavaloare.instagram.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.CommentVote;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.model.VoteType;

public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    Optional<CommentVote> findByUserAndComment(User user, Comment comment);
    long countByCommentAndVoteType(Comment comment, VoteType voteType);
    
}
