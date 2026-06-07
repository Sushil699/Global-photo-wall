package com.globalphotowall.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.globalphotowall.config.CloudinaryProperties;
import com.globalphotowall.exception.InvalidImageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;

@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;
    private final Path uploadDir;

    public ImageStorageService(
            Cloudinary cloudinary,
            CloudinaryProperties cloudinaryProperties,
            @Value("${app.local-upload-dir:uploads}") String localUploadDir
    ) {
        this.cloudinary = cloudinary;
        this.cloudinaryProperties = cloudinaryProperties;
        this.uploadDir = Paths.get(localUploadDir).toAbsolutePath().normalize();
    }

    public String uploadImage(MultipartFile file, String photoId) {
        if (isCloudinaryConfigured()) {
            return uploadToCloudinary(file, photoId);
        }
        log.warn("Cloudinary not configured — saving image locally for development");
        return uploadLocally(file, photoId);
    }

    private boolean isCloudinaryConfigured() {
        String name = cloudinaryProperties.getCloudName();
        String key = cloudinaryProperties.getApiKey();
        String secret = cloudinaryProperties.getApiSecret();
        return name != null && !name.isBlank() && !"your_cloud_name".equals(name)
                && key != null && !key.isBlank() && !"your_api_key".equals(key)
                && secret != null && !secret.isBlank() && !"your_api_secret".equals(secret);
    }

    private String uploadToCloudinary(MultipartFile file, String photoId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "global-photo-wall",
                            "public_id", photoId,
                            "resource_type", "image",
                            "overwrite", false
                    )
            );
            return (String) result.get("secure_url");
        } catch (Exception ex) {
            throw new InvalidImageException(
                    "Cloudinary upload failed. Check CLOUDINARY_* values in backend/.env — " + ex.getMessage()
            );
        }
    }

    private String uploadLocally(MultipartFile file, String photoId) {
        try {
            Files.createDirectories(uploadDir);
            String extension = getExtension(file.getOriginalFilename());
            String filename = photoId + "." + extension;
            Path target = uploadDir.resolve(filename);
            Files.write(target, file.getBytes());
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new InvalidImageException("Failed to save image locally: " + ex.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
