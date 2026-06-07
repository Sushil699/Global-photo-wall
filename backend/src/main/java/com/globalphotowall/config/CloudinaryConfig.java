package com.globalphotowall.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    private final CloudinaryProperties properties;

    public CloudinaryConfig(CloudinaryProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void validateConfig() {
        if (isBlank(properties.getCloudName()) || isBlank(properties.getApiKey()) || isBlank(properties.getApiSecret())
                || "your_cloud_name".equals(properties.getCloudName())) {
            log.warn("============================================================");
            log.warn("Cloudinary is NOT configured! Photo upload will fail.");
            log.warn("Add real credentials to backend/.env and restart the server.");
            log.warn("Get keys from: https://cloudinary.com/console");
            log.warn("============================================================");
        }
    }

    @Bean
    public Cloudinary cloudinary(CloudinaryProperties properties) {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret()
        ));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
