package com.globalphotowall.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "photos")
public class Photo {

    @Id
    private String id;

    @Indexed(unique = true)
    private String photoId;

    private String imageUrl;

    @Indexed(unique = true, sparse = true)
    private String contentHash;

    private Instant uploadedAt;

    @Builder.Default
    private long viewCount = 0;

    private String category;

    @Builder.Default
    private long countLike = 0;

    @Builder.Default
    private long countLove = 0;

    @Builder.Default
    private long countHaha = 0;

    @Builder.Default
    private long countWow = 0;

    @Builder.Default
    private long countFire = 0;

    @Builder.Default
    private boolean hidden = false;

    @Builder.Default
    private long reportCount = 0;
}
