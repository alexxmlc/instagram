package com.lavaloare.instagram.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.lavaloare.instagram.model.PostStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PostResponse {
    private String title;
    private String pictureUrl;
    private String text;
    private LocalDateTime date;
    private PostStatus status;
    private PostAuthorDto author;
    private List<String> tags;
}
