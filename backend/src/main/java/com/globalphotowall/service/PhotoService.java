package com.globalphotowall.service;

import com.globalphotowall.dto.PhotoPageResponse;
import com.globalphotowall.dto.PhotoResponse;
import com.globalphotowall.dto.PhotoUploadResponse;
import com.globalphotowall.exception.DuplicateUploadException;
import com.globalphotowall.exception.PhotoNotFoundException;
import com.globalphotowall.model.Photo;
import com.globalphotowall.repository.PhotoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Value;
import com.globalphotowall.exception.UploadLimitExceededException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

@Service
public class PhotoService {

    @Value("${app.reports.hide-threshold:1000}")
    private int hideThreshold;

    private static final java.util.Set<String> ALLOWED_CATEGORIES = java.util.Set.of("Nature", "Street", "Travel", "Art", "Tech", "Others");

    private final PhotoRepository photoRepository;
    private final PhotoIdGeneratorService photoIdGeneratorService;
    private final ImageStorageService imageStorageService;
    private final ImageValidationService imageValidationService;

    public PhotoService(
            PhotoRepository photoRepository,
            PhotoIdGeneratorService photoIdGeneratorService,
            ImageStorageService imageStorageService,
            ImageValidationService imageValidationService
    ) {
        this.photoRepository = photoRepository;
        this.photoIdGeneratorService = photoIdGeneratorService;
        this.imageStorageService = imageStorageService;
        this.imageValidationService = imageValidationService;
    }

    public PhotoUploadResponse uploadPhoto(MultipartFile file, String category) {
        imageValidationService.validate(file);

        // Check 10 Million limit
        if (photoRepository.count() >= 10000000) {
            throw new UploadLimitExceededException("Upload limit reached. The platform allows a maximum of 10 million photos.");
        }

        String contentHash = computeContentHash(file);

        photoRepository.findByContentHash(contentHash).ifPresent(existing -> {
            throw new DuplicateUploadException(existing.getPhotoId());
        });

        String photoId = photoIdGeneratorService.generateNextPhotoId();
        String imageUrl = imageStorageService.uploadImage(file, photoId);

        Photo photo = Photo.builder()
                .photoId(photoId)
                .imageUrl(imageUrl)
                .contentHash(contentHash)
                .uploadedAt(Instant.now())
                .viewCount(0)
                .category(validateAndGetCategory(category))
                .countLike(0)
                .countLove(0)
                .countHaha(0)
                .countWow(0)
                .countFire(0)
                .hidden(false)
                .reportCount(0)
                .build();

        photoRepository.save(photo);

        return PhotoUploadResponse.builder()
                .photoId(photo.getPhotoId())
                .imageUrl(photo.getImageUrl())
                .uploadedAt(photo.getUploadedAt())
                .message("Photo uploaded successfully")
                .build();
    }

    public PhotoPageResponse getPhotos(String category, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        
        Page<Photo> photoPage;
        if (category != null && !category.isBlank() && !"All".equalsIgnoreCase(category)) {
            photoPage = photoRepository.findAllByCategoryAndHiddenFalseOrderByUploadedAtDesc(validateAndGetCategory(category), pageable);
        } else {
            photoPage = photoRepository.findAllByHiddenFalseOrderByUploadedAtDesc(pageable);
        }

        List<PhotoResponse> photos = photoPage.getContent().stream()
                .map(PhotoResponse::from)
                .toList();

        return PhotoPageResponse.builder()
                .photos(photos)
                .page(safePage)
                .size(safeSize)
                .totalElements(photoPage.getTotalElements())
                .totalPages(photoPage.getTotalPages())
                .hasNext(photoPage.hasNext())
                .build();
    }

    public PhotoResponse getPhotoById(String photoId) {
        Photo photo = photoRepository.findByPhotoId(photoId)
                .orElseThrow(() -> new PhotoNotFoundException(photoId));
        if (photo.isHidden()) {
            throw new PhotoNotFoundException(photoId);
        }
        return PhotoResponse.from(photo);
    }

    public PhotoResponse searchByPhotoId(String photoId) {
        if (photoId == null || photoId.isBlank()) {
            throw new PhotoNotFoundException("unknown");
        }
        return getPhotoById(photoId.trim().toUpperCase());
    }

    public PhotoResponse incrementViewCount(String photoId) {
        Photo photo = photoRepository.findByPhotoId(photoId)
                .orElseThrow(() -> new PhotoNotFoundException(photoId));
        if (photo.isHidden()) {
            throw new PhotoNotFoundException(photoId);
        }

        photo.setViewCount(photo.getViewCount() + 1);
        Photo saved = photoRepository.save(photo);
        return PhotoResponse.from(saved);
    }

    public PhotoResponse incrementReactionCount(String photoId, String type) {
        Photo photo = photoRepository.findByPhotoId(photoId.toUpperCase())
                .orElseThrow(() -> new PhotoNotFoundException(photoId));
        if (photo.isHidden()) {
            throw new PhotoNotFoundException(photoId);
        }

        String normalizedType = type != null ? type.toLowerCase().trim() : "";
        switch (normalizedType) {
            case "like" -> photo.setCountLike(photo.getCountLike() + 1);
            case "love" -> photo.setCountLove(photo.getCountLove() + 1);
            case "haha" -> photo.setCountHaha(photo.getCountHaha() + 1);
            case "wow" -> photo.setCountWow(photo.getCountWow() + 1);
            case "fire" -> photo.setCountFire(photo.getCountFire() + 1);
            default -> throw new IllegalArgumentException("Invalid reaction type");
        }

        Photo saved = photoRepository.save(photo);
        return PhotoResponse.from(saved);
    }

    public PhotoResponse incrementReportCount(String photoId) {
        Photo photo = photoRepository.findByPhotoId(photoId.toUpperCase())
                .orElseThrow(() -> new PhotoNotFoundException(photoId));
        if (photo.isHidden()) {
            throw new PhotoNotFoundException(photoId);
        }

        photo.setReportCount(photo.getReportCount() + 1);
        if (photo.getReportCount() >= hideThreshold) {
            photo.setHidden(true);
        }

        Photo saved = photoRepository.save(photo);
        return PhotoResponse.from(saved);
    }

    private String validateAndGetCategory(String category) {
        if (category == null || category.isBlank()) {
            return "Others";
        }
        String trimmed = category.trim();
        String formatted = trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
        if (ALLOWED_CATEGORIES.contains(formatted)) {
            return formatted;
        }
        return "Others";
    }

    private String computeContentHash(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | java.io.IOException ex) {
            throw new com.globalphotowall.exception.InvalidImageException("Unable to process image file");
        }
    }
}
