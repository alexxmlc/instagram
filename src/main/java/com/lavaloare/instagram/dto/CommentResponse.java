package com.lavaloare.instagram.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long commentId;
    private String text;
    private String imageUrl;
    private LocalDateTime createdAt;
    private PostAuthorDto author;

}
