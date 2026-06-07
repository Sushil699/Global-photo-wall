package com.globalphotowall.dto;

import com.globalphotowall.model.Photo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {

    private String photoId;
    private String imageUrl;
    private Instant uploadedAt;
    private long viewCount;
    private String category;
    private long countLike;
    private long countLove;
    private long countHaha;
    private long countWow;
    private long countFire;

    public static PhotoResponse from(Photo photo) {
        return PhotoResponse.builder()
                .photoId(photo.getPhotoId())
                .imageUrl(photo.getImageUrl())
                .uploadedAt(photo.getUploadedAt())
                .viewCount(photo.getViewCount())
                .category(photo.getCategory())
                .countLike(photo.getCountLike())
                .countLove(photo.getCountLove())
                .countHaha(photo.getCountHaha())
                .countWow(photo.getCountWow())
                .countFire(photo.getCountFire())
                .build();
    }
}
