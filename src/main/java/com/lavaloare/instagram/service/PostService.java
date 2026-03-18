package com.lavaloare.instagram.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dao.TagRepository;
import com.lavaloare.instagram.dto.CreatePostRequest;
import com.lavaloare.instagram.dto.PostAuthorDto;
import com.lavaloare.instagram.dto.PostResponse;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostStatus;
import com.lavaloare.instagram.model.Tag;
import com.lavaloare.instagram.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final FileStorageService fileStorageService;

    public PostResponse createPost(User author, CreatePostRequest request) {
        String pictureUrl = fileStorageService.uploadImageToCloud(request.getFile());
        Post newPost = new Post();
        newPost.setAuthor(author);

        newPost.setPictureUrl(pictureUrl);
        newPost.setTitle(request.getTitle());
        newPost.setText(request.getText());

        newPost.setStatus(PostStatus.JUST_POSTED);

        Set<Tag> tagSet = new java.util.HashSet<>();
        for (String tag : request.getTags()) {
            Optional<Tag> optionalTag = tagRepository.findByTag(tag);

            if (!optionalTag.isPresent()) {
                Tag newTag = new Tag();
                newTag.setTag(tag);
                newTag = tagRepository.save(newTag);
                tagSet.add(newTag);
            } else {
                Tag newTag = optionalTag.get();
                tagSet.add(newTag);
            }
        }
        newPost.setTags(tagSet);
        postRepository.save(newPost);

        PostAuthorDto postAuthor = new PostAuthorDto(author.getUsername(), author.getProfilePictureUrl());

        return new PostResponse(
                newPost.getTitle(),
                newPost.getPictureUrl(),
                newPost.getText(),
                newPost.getDate(),
                newPost.getStatus(),
                postAuthor,
                request.getTags());
    }

}
