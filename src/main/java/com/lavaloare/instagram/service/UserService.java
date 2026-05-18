package com.lavaloare.instagram.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException; // Added this import
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lavaloare.instagram.dao.UserRepository;
import com.lavaloare.instagram.dto.AuthenticationRequest;
import com.lavaloare.instagram.dto.AuthenticationResponse;
import com.lavaloare.instagram.dto.UpdateProfileRequest;
import com.lavaloare.instagram.dto.UserProfileResponse;
import com.lavaloare.instagram.model.User;
import com.lavaloare.instagram.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public AuthenticationResponse createUser(User user) {
        String rawPassword = user.getPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        user.setPassword(encodedPassword);
        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(savedUser);
        return new AuthenticationResponse(jwtToken);
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        try {
            // Tries to authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (LockedException e) {
            // This triggers because isAccountNonLocked() returns false for banned users
            throw new RuntimeException("You have been banned from the site.");
        }

        // If authentication was successfull it proceeds to generating the access token
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        String jwtToken = jwtService.generateToken(user);

        // Returns the token which will be verified on each request by the Filter
        // function
        return new AuthenticationResponse(jwtToken);
    }

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow();
        return new UserProfileResponse(user.getUsername(),
                user.getBio(),
                user.getProfilePictureUrl());
    }

    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        if (request.getBio() != null) {
            currentUser.setBio(request.getBio());
        }

        if (request.getProfilePictureUrl() != null) {
            currentUser.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        User savedUser = userRepository.save(currentUser);

        return new UserProfileResponse(savedUser.getUsername(),
                savedUser.getBio(),
                savedUser.getProfilePictureUrl());
    }

    public UserProfileResponse uploadProfilePicture(User user, MultipartFile file) {
        String pictureUrl = fileStorageService.uploadImageToCloud(file);
        user.setProfilePictureUrl(pictureUrl);
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(
                savedUser.getUsername(),
                savedUser.getBio(),
                savedUser.getProfilePictureUrl());
    }

    // --- MODERATOR ACTIONS ---

    public void banUser(Long userIdToBan, User currentUser) {
        if (currentUser.getRole() != User.Role.MODERATOR) {
            throw new RuntimeException("Security Alert: Only moderators can ban users.");
        }

        User targetUser = userRepository.findById(userIdToBan)
                .orElseThrow(() -> new RuntimeException("User not found"));

        targetUser.setBanned(true);
        userRepository.save(targetUser);

        notificationService.sendBanNotification(targetUser);
    }

    public void unbanUser(Long userIdToUnban, User currentUser) {
        if (currentUser.getRole() != User.Role.MODERATOR) {
            throw new RuntimeException("Security Alert: Only moderators can unban users.");
        }

        User targetUser = userRepository.findById(userIdToUnban)
                .orElseThrow(() -> new RuntimeException("User not found"));

        targetUser.setBanned(false);
        userRepository.save(targetUser);
    }
}