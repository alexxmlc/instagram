package com.lavaloare.instagram.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dao.TagRepository;
import com.lavaloare.instagram.dto.CreatePostRequest;
import com.lavaloare.instagram.dto.PostResponse;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.PostStatus;
import com.lavaloare.instagram.model.Tag;
import com.lavaloare.instagram.model.User;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    // Mock all dependencies that PostService relies on
    @Mock
    private PostRepository postRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private FileStorageService fileStorageService;

    // Inject the mocks into the service to test
    @InjectMocks
    private PostService postService;

    private User testUser;

    // This runs before every test to give us a clean user obj
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("alex_test");
        testUser.setProfilePictureUrl("http://example.com/avatar.jpg");
    }

    @Test
    void createPost_ShouldSuccessfullyCreateAndReturnPost() {
        // --ARRANGE--
        // simulate the multipart file upload
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "idk.jpg", "image/jpeg", "fake-image-data".getBytes());

        CreatePostRequest request = new CreatePostRequest("IDK", "1234567890qwertyuiop", mockFile,
                List.of("nothing", "idk"));

        // When simulating file upload force it to return a fake url
        when(fileStorageService.uploadImageToCloud(mockFile)).thenReturn("http://cloudinary.com/idk.jpg");

        // Tag repository behaviour
        Tag existingTag = new Tag();
        existingTag.setTag("idk");
        when(tagRepository.findByTag("idk")).thenReturn(Optional.of(existingTag));
        when(tagRepository.findByTag("nothing")).thenReturn(Optional.empty());

        // When saving the new "nothing" tag return a mock saved tag
        Tag savedNewTag = new Tag();
        savedNewTag.setTag("nothing");
        when(tagRepository.save(any(Tag.class))).thenReturn(savedNewTag);

        // When saving the post, simulate JPA assigning an ID and Date
        doAnswer(invocation -> {
            Post post = invocation.getArgument(0);
            post.setId(200L);
            post.setDate(LocalDateTime.now());
            return post;
        }).when(postRepository).save(any(Post.class));

        // --ACT--
        PostResponse response = postService.createPost(testUser, request);

        // --ASSERT--
        assertNotNull(response);
        assertEquals(200L, response.getPostId());
        assertEquals("IDK", response.getTitle());
        assertEquals("http://cloudinary.com/idk.jpg", response.getPictureUrl());
        assertEquals(PostStatus.JUST_POSTED, response.getStatus());
        assertEquals("alex_test", response.getAuthor().getUsername());
        assertTrue(response.getTags().containsAll(List.of("nothing", "idk")));

        // Verify if the mock dependencies are called only once
        verify(fileStorageService, times(1)).uploadImageToCloud(mockFile);
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    void deletePost_ShouldThrowExcetion_WhenUserIsNotAuthor() {
        // --ARRANGE--
        Post mockPost = new Post();
        mockPost.setId(88L);

        User differentUser = new User();
        differentUser.setId(10000L);
        mockPost.setAuthor(differentUser);

        when(postRepository.findById(88L)).thenReturn(Optional.of(mockPost));

        // --ACT & ASSERT--
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.deletePost(88L, testUser);
        });

        assertEquals("Security Alert: You can only delete your posts.", exception.getMessage());
        verify(postRepository, never()).delete(any(Post.class));
    }

}
