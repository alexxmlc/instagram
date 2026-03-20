package com.lavaloare.instagram.dao;

import com.lavaloare.instagram.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByPost_IdOrderByCreatedAtAsc(Long postId);

}
