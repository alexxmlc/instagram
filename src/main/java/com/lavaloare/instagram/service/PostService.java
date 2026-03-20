package com.lavaloare.instagram.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.lavaloare.instagram.dao.CommentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dao.TagRepository;
import com.lavaloare.instagram.dto.CreatePostRequest;
import com.lavaloare.instagram.dto.PostAuthorDto;
import com.lavaloare.instagram.dto.PostResponse;
import com.lavaloare.instagram.dto.UpdatePostRequest;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostStatus;
import com.lavaloare.instagram.model.Tag;
import com.lavaloare.instagram.model.User;

import lombok.RequiredArgsConstructor;
import com.lavaloare.instagram.dto.PostDetailsResponse;
import com.lavaloare.instagram.dto.CommentResponse;
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final FileStorageService fileStorageService;
    private final CommentRepository commentRepository;

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
                newPost.getId(),
                newPost.getTitle(),
                newPost.getPictureUrl(),
                newPost.getText(),
                newPost.getDate(),
                newPost.getStatus(),
                postAuthor,
                request.getTags());
    }

    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByDateDesc();

        List<PostResponse> feed = new ArrayList<>();

        for (Post post : posts) {
            PostAuthorDto author = new PostAuthorDto(
                    post.getAuthor().getUsername(),
                    post.getAuthor().getProfilePictureUrl());

            List<String> tagNames = post.getTags().stream()
                    .map(Tag::getTag)
                    .toList();

            feed.add(new PostResponse(
                    post.getId(),
                    post.getTitle(),
                    post.getPictureUrl(),
                    post.getText(),
                    post.getDate(),
                    post.getStatus(),
                    author,
                    tagNames));

        }
        return feed;
    }

    public PostResponse updatePost(Long postId, User currentUser, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Security Alert: You can only edit your own posts");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }

        if (request.getText() != null) {
            post.setText(request.getText());
        }

        postRepository.save(post);

        PostAuthorDto author = new PostAuthorDto(
                post.getAuthor().getUsername(),
                post.getAuthor().getProfilePictureUrl());

        List<String> tagNames = post.getTags().stream()
                .map(Tag::getTag)
                .toList();

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getPictureUrl(),
                post.getText(),
                post.getDate(),
                post.getStatus(),
                author,
                tagNames);
    }

    public void deletePost(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Security Alert: You can only delete your posts.");
        }

        postRepository.delete(post);
    }

    public List<PostResponse> getAllPosts(String tag, String search,
            String author, User currentUser) {

        List<Post> posts;

        if (tag != null && !tag.isEmpty()) {
            posts = postRepository.findAllByTags_TagOrderByDateDesc(tag);
        } else if (search != null && !search.isEmpty()) {
            posts = postRepository.findAllByTitleContainingIgnoreCaseOrderByDateDesc(search);
        } else if (author != null && !author.isEmpty()) {
            posts = postRepository.findAllByAuthor_UsernameOrderByDateDesc(author);
        } else {
            posts = postRepository.findAllByOrderByDateDesc();
        }

        List<PostResponse> feed = new ArrayList<>();

        for (Post post : posts) {
            PostResponse newPost = new PostResponse();
            newPost.setPostId(post.getId());
            newPost.setTitle(post.getTitle());
            newPost.setPictureUrl(post.getPictureUrl());
            newPost.setText(post.getText());
            newPost.setDate(post.getDate());
            newPost.setStatus(post.getStatus());
            newPost.setTags(post.getTags().stream().map(Tag::getTag).toList());

            PostAuthorDto authorDto = new PostAuthorDto(
                    post.getAuthor().getUsername(),
                    post.getAuthor().getProfilePictureUrl());
            newPost.setAuthor(authorDto);

            feed.add(newPost);
        }

        return feed;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void postOutdated() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<Post> oldPosts = postRepository.findAllByDateBeforeAndStatus(twentyFourHoursAgo, PostStatus.JUST_POSTED);

        if(oldPosts.isEmpty()){
            return;
        }

        for(Post post: oldPosts){
            post.setStatus(PostStatus.OUTDATED);
        }

        postRepository.saveAll(oldPosts);
        System.out.println("Marked " + oldPosts.size() + " as OUTDATED");
    }
    public PostDetailsResponse getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<CommentResponse> comments = commentRepository
                .findAllByPost_IdOrderByCreatedAtAsc(postId)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getText(),
                        comment.getImageUrl(),
                        comment.getCreatedAt(),
                        new PostAuthorDto(
                                comment.getAuthor().getUsername(),
                                comment.getAuthor().getProfilePictureUrl()
                        )
                ))
                .toList();

        return new PostDetailsResponse(
                post.getId(),
                post.getTitle(),
                post.getPictureUrl(),
                post.getText(),
                post.getDate(),
                post.getStatus(),
                new PostAuthorDto(
                        post.getAuthor().getUsername(),
                        post.getAuthor().getProfilePictureUrl()
                ),
                post.getTags().stream().map(tag -> tag.getTag()).toList(),
                comments
        );
    }
}
