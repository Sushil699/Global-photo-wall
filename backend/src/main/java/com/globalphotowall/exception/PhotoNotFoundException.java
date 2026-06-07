package com.globalphotowall.exception;

public class PhotoNotFoundException extends RuntimeException {

    public PhotoNotFoundException(String photoId) {
        super("Photo not found with ID: " + photoId);
    }
}
