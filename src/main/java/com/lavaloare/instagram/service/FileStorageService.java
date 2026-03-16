package com.lavaloare.instagram.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final Cloudinary cloudinary;

    public String uploadProfilePicture(MultipartFile file) {
        try {
            // Uploads the file(image) to the cloud and
            // returns a map that contains info about it
            Map uploadResult = cloudinary
                    .uploader()
                    .upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload profile picture to cloud storage", e);
        }
    }
}
