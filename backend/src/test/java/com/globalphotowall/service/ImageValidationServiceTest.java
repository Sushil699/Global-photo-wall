package com.globalphotowall.service;

import com.globalphotowall.config.AppProperties;
import com.globalphotowall.exception.InvalidImageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ImageValidationServiceTest {

    private ImageValidationService imageValidationService;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties();
        AppProperties.Upload upload = new AppProperties.Upload();
        upload.setMaxSizeBytes(10 * 1024 * 1024);
        upload.setAllowedContentTypes(List.of("image/jpeg", "image/png", "image/webp"));
        upload.setAllowedExtensions(List.of("jpg", "jpeg", "png", "webp"));
        properties.setUpload(upload);
        imageValidationService = new ImageValidationService(properties);
    }

    @Test
    void acceptsValidJpeg() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        assertDoesNotThrow(() -> imageValidationService.validate(file));
    }

    @Test
    void rejectsInvalidType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3}
        );
        assertThrows(InvalidImageException.class, () -> imageValidationService.validate(file));
    }

    @Test
    void rejectsOversizedFile() {
        byte[] large = new byte[10 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.jpg", "image/jpeg", large
        );
        assertThrows(InvalidImageException.class, () -> imageValidationService.validate(file));
    }
}
