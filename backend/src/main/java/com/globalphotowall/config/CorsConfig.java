package com.globalphotowall.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter(AppProperties appProperties) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // Allow any localhost port during local development (Vite may use 5173, 5174, etc.)
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("http://127.0.0.1:*");
        config.addAllowedOriginPattern("https://*.vercel.app");

        String origins = appProperties.getCors().getAllowedOrigins();
        if (origins != null && !origins.isBlank()) {
            Arrays.stream(origins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(config::addAllowedOrigin);
        }

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
