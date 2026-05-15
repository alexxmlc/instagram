package com.lavaloare.instagram.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostVote;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.model.VoteType;

public interface PostVoteRepository extends JpaRepository<PostVote, Long> {
    Optional<PostVote> findByUserAndPost(User user, Post post);
    long countByPostAndVoteType(Post post, VoteType voteType);
    
}
