package com.lavaloare.instagram.service;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dao.PostRepository;
import com.lavaloare.instagram.dto.CommentResponse;
import com.lavaloare.instagram.dto.CreateCommentRequest;
import com.lavaloare.instagram.dto.UpdateCommentRequest;
import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import static org.junit.jupiter.api.Assertions.assertThrows;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private CommentService commentService;

    private User testUser;
    private Post testPost;
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("georgi_test");
        testUser.setProfilePictureUrl("http://example.com/avatar.jpg");
        testPost = new Post();
        testPost.setId(10L);
    }

    @Test
    void createComment_ShouldSuccessfullyCreateAndReturnComment() {
        
        MockMultipartFile mockFile=new MockMultipartFile(
                "file",
                "comment.jpg",
                "image/jpeg",
                "fake-image-data".getBytes()
        );
        CreateCommentRequest createCommentRequest = new CreateCommentRequest();
        createCommentRequest.setText("Test comment");
        createCommentRequest.setFile(mockFile);
        when(postRepository.findById(10L)).thenReturn(Optional.of(testPost));
        when(fileStorageService.uploadImageToCloud(mockFile)).thenReturn("http://cloudinary.com/comment.jpg");

        doAnswer(invocation ->{
           Comment comment = invocation.getArgument(0);
           comment.setId(100L);
           comment.setCreatedAt(LocalDateTime.now());
           return comment;

        }).when(commentRepository).save(any(Comment.class));
        CommentResponse response = commentService.createComment(10L,testUser,createCommentRequest);

        assertNotNull(response);
        assertEquals(100L,response.getCommentId());
        assertEquals("http://cloudinary.com/comment.jpg", response.getImageUrl());
        assertEquals("georgi_test", response.getAuthor().getUsername());



        // Verify that file upload was called exactly once
        verify(fileStorageService, times(1)).uploadImageToCloud(mockFile);

        // Verify that comment was saved exactly once
        verify(commentRepository, times(1)).save(any(Comment.class));
    }
    @Test
    void getCommentForPost_ShouldSuccessfullyReturnCommentsList() {
        Comment comment1 = new Comment();
        comment1.setId(30L);
        comment1.setText("Comment 1");
        comment1.setCreatedAt(LocalDateTime.now());
        comment1.setImageUrl(null);
        comment1.setAuthor(testUser);

        Comment comment2 = new Comment();
        comment2.setId(40L);
        comment2.setText("Comment 2");
        comment2.setCreatedAt(LocalDateTime.now());
        comment2.setImageUrl("http://cloudinary.com/second.jpg");
        comment2.setAuthor(testUser);

        when(postRepository.findById(10L)).thenReturn(Optional.of(testPost));
        when(commentRepository.findAllByPost_IdOrderByCreatedAtAsc(10L)).thenReturn(List.of(comment1,comment2));
        List<CommentResponse> commentsResponse = commentService.getCommentsForPost(10L);

        assertNotNull(commentsResponse);
        assertEquals(2, commentsResponse.size());
        assertEquals("Comment 1", commentsResponse.get(0).getText());
        assertEquals("Comment 2", commentsResponse.get(1).getText());

        verify(postRepository, times(1)).findById(10L);
        verify(commentRepository, times(1)).findAllByPost_IdOrderByCreatedAtAsc(10L);

    }
    @Test
    void createComment_ShouldThrowException_WhenPostNotFound(){
        CreateCommentRequest createCommentRequest = new CreateCommentRequest();
        createCommentRequest.setText("New comment");

        when(postRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class , ()->{
            commentService.createComment(10L,testUser,createCommentRequest); //metode that I verify
        });

        assertEquals(exception.getMessage(), "Post not found");

        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void updateComment_ShoulThrowException_WhenUserIsNotAuthor(){
        Comment comment = new Comment();
        comment.setId(52L);

        User differentUser = new User();
        differentUser.setId(98L);
        comment.setAuthor(differentUser);

        UpdateCommentRequest updateCommentRequest = new UpdateCommentRequest();
        updateCommentRequest.setText("Comment updated");
        when(commentRepository.findById(52L)).thenReturn(Optional.of(comment));
        RuntimeException exception = assertThrows(RuntimeException.class , ()->{
            commentService.updateComment(52L,testUser,updateCommentRequest);
        });
        assertEquals("Security Alert: You can only edit your own comments",exception.getMessage());

        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void deleteComment_ShouldThrowException_WhenUserIsNotAuthor(){
        Comment comment = new Comment();
        comment.setId(50L);
        User differentUser = new User();
        differentUser.setId(100L);
        comment.setAuthor(differentUser);
        UpdateCommentRequest updateCommentRequest = new UpdateCommentRequest();
        updateCommentRequest.setText("Comment");
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));
        RuntimeException exception = assertThrows(RuntimeException.class , ()->{
            commentService.deleteComment(50L,testUser);
        });
        assertEquals("Security Alert: You can only delete your comments.",exception.getMessage());
        verify(commentRepository, never()).delete(any(Comment.class));
    }
    @Test
    void deleteComment_ShouldSuccessfullyDelete_WhenUserIsAuthor() {
        Comment comment = new Comment();
        comment.setId(50L);
        User differentUser = new User();
        differentUser.setId(100L);
        comment.setAuthor(differentUser);
        UpdateCommentRequest updateCommentRequest = new UpdateCommentRequest();
        updateCommentRequest.setText("Comment");
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));
        commentService.deleteComment(50L,differentUser); //if I modify differentUsser with testUser this test fail
        verify(commentRepository, times(1)).findById(50L);
        verify(commentRepository,times(1)).delete(comment);
    }

}
