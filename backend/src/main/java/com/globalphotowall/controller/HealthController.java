package com.globalphotowall.controller;

import com.globalphotowall.config.CloudinaryProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final CloudinaryProperties cloudinaryProperties;

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    public HealthController(MongoTemplate mongoTemplate, CloudinaryProperties cloudinaryProperties) {
        this.mongoTemplate = mongoTemplate;
        this.cloudinaryProperties = cloudinaryProperties;
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "Global Photo Wall API");

        boolean mongoOk = false;
        try {
            mongoTemplate.getDb().getName();
            mongoOk = true;
        } catch (Exception ignored) {
            // reported below
        }
        body.put("mongodb", mongoOk ? "connected" : "NOT CONNECTED — fix MONGODB_URI in backend/.env");

        boolean cloudinaryOk = isCloudinaryConfigured();
        body.put("cloudinary", cloudinaryOk ? "configured" : "not configured (using local file storage for dev)");

        if (mongoUri != null && mongoUri.contains("<")) {
            body.put("warning", "MONGODB_URI still has placeholder values like <username> or <cluster>");
        }

        return ResponseEntity.ok(body);
    }

    private boolean isCloudinaryConfigured() {
        String name = cloudinaryProperties.getCloudName();
        return name != null && !name.isBlank() && !"your_cloud_name".equals(name);
    }
}
