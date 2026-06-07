package com.globalphotowall.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoUploadResponse {

    private String photoId;
    private String imageUrl;
    private Instant uploadedAt;
    private String message;
}
