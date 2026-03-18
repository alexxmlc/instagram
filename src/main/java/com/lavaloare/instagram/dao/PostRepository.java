package com.lavaloare.instagram.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lavaloare.instagram.model.Post;

public interface PostRepository extends JpaRepository<Post, Long>{
    
}
