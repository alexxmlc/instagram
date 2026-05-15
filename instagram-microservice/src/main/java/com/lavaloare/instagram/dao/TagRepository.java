package com.lavaloare.instagram.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lavaloare.instagram.model.Tag;

public interface TagRepository extends JpaRepository<Tag, Long>{
    public Optional<Tag> findByTag(String tag);
    
}
