package com.globalphotowall.repository;

import com.globalphotowall.model.Photo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface PhotoRepository extends MongoRepository<Photo, String> {

    Optional<Photo> findByPhotoId(String photoId);

    Optional<Photo> findByContentHash(String contentHash);

    @Query("{ 'hidden': { $ne: true } }")
    Page<Photo> findAllByHiddenFalseOrderByUploadedAtDesc(Pageable pageable);

    @Query("{ 'category': ?0, 'hidden': { $ne: true } }")
    Page<Photo> findAllByCategoryAndHiddenFalseOrderByUploadedAtDesc(String category, Pageable pageable);
}
