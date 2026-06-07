package com.globalphotowall.service;

import com.globalphotowall.config.AppProperties;
import com.globalphotowall.exception.InvalidImageException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@Service
public class ImageValidationService {

    private final AppProperties appProperties;

    public ImageValidationService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("No image file provided");
        }

        if (file.getSize() > appProperties.getUpload().getMaxSizeBytes()) {
            throw new InvalidImageException("Image size exceeds the maximum allowed limit of 10 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !appProperties.getUpload().getAllowedContentTypes().contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new InvalidImageException("Only JPEG, PNG, and WebP images are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidImageException("Invalid file name");
        }

        String extension = getExtension(originalFilename).toLowerCase(Locale.ROOT);
        if (!appProperties.getUpload().getAllowedExtensions().contains(extension)) {
            throw new InvalidImageException("Only JPEG, PNG, and WebP images are allowed");
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }
}
