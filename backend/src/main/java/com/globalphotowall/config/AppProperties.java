package com.globalphotowall.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Upload upload = new Upload();

    @Data
    public static class Cors {
        private String allowedOrigins;
    }

    @Data
    public static class Upload {
        private long maxSizeBytes;
        private List<String> allowedContentTypes;
        private List<String> allowedExtensions;
    }
}
