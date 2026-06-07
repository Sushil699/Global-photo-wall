package com.globalphotowall.controller;

import com.globalphotowall.dto.PhotoPageResponse;
import com.globalphotowall.dto.PhotoResponse;
import com.globalphotowall.dto.PhotoUploadResponse;
import com.globalphotowall.service.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponse> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "Others") String category
    ) {
        PhotoUploadResponse response = photoService.uploadPhoto(file, category);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PhotoPageResponse> getPhotos(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(photoService.getPhotos(category, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<PhotoResponse> searchPhoto(@RequestParam String photoId) {
        return ResponseEntity.ok(photoService.searchByPhotoId(photoId));
    }

    @GetMapping("/{photoId}")
    public ResponseEntity<PhotoResponse> getPhoto(@PathVariable String photoId) {
        return ResponseEntity.ok(photoService.getPhotoById(photoId.toUpperCase()));
    }

    @PutMapping("/{photoId}/view")
    public ResponseEntity<PhotoResponse> incrementView(@PathVariable String photoId) {
        return ResponseEntity.ok(photoService.incrementViewCount(photoId.toUpperCase()));
    }

    @PutMapping("/{photoId}/react")
    public ResponseEntity<PhotoResponse> incrementReaction(
            @PathVariable String photoId,
            @RequestParam String type
    ) {
        return ResponseEntity.ok(photoService.incrementReactionCount(photoId.toUpperCase(), type));
    }

    @PutMapping("/{photoId}/report")
    public ResponseEntity<PhotoResponse> incrementReport(@PathVariable String photoId) {
        return ResponseEntity.ok(photoService.incrementReportCount(photoId.toUpperCase()));
    }
}
