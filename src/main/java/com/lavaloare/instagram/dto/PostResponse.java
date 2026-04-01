package com.lavaloare.instagram.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.lavaloare.instagram.model.PostStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long postId;
    private String title;
    private String pictureUrl;
    private String text;
    private LocalDateTime date;
    private PostStatus status;
    private PostAuthorDto author;
    private List<String> tags;
    private long voteScore;
}
