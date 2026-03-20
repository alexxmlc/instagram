package com.lavaloare.instagram.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long>{
    List<Post> findAllByOrderByDateDesc();
    List<Post> findAllByTags_TagOrderByDateDesc(String tag);
    List<Post> findAllByTitleContainingIgnoreCaseOrderByDateDesc(String title);
    List<Post> findAllByAuthor_UsernameOrderByDateDesc(String username);
    List<Post> findAllByDateBeforeAndStatus(LocalDateTime date, PostStatus status);
}
