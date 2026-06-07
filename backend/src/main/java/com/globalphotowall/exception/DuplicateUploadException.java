package com.globalphotowall.exception;

public class DuplicateUploadException extends RuntimeException {

    public DuplicateUploadException(String photoId) {
        super("This image has already been uploaded as " + photoId);
    }
}
