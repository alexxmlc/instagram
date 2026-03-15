package com.lavaloare.instagram.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lavaloare.instagram.model.User;

// On run Spring sees this interface and makes a new class in his memory
// that implements UserRepository
@Repository
public interface  UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByUsername(String username);
}
