package com.lavaloare.instagram.dto;

import com.lavaloare.instagram.model.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDetailsResponse {
    private Long postId;
    private String title;
    private String pictureUrl;
    private String text;
    private LocalDateTime date;
    private PostStatus status;
    private PostAuthorDto author;
    private List<String> tags;

    private List<CommentResponse> comments;
}
