package com.lavaloare.instagram.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lavaloare.instagram.dao.CommentRepository;
import com.lavaloare.instagram.dto.UpdateCommentRequest;
import com.lavaloare.instagram.model.Comment;
import com.lavaloare.instagram.model.Post;
import com.lavaloare.instagram.model.User;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;
    
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
}
