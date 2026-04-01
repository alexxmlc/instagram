package com.lavaloare.instagram.dto;

import com.lavaloare.instagram.model.VoteType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteRequest {
    VoteType voteType;
    
}
