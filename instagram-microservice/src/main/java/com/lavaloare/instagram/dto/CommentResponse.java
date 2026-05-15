package com.lavaloare.instagram.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long commentId;
    private String text;
    private String pictureUrl;
    private LocalDateTime createdAt;
    private PostAuthorDto author;
    private long voteScore;

}
