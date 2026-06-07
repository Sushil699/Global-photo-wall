package com.globalphotowall.exception;

public class UploadLimitExceededException extends RuntimeException {
    public UploadLimitExceededException(String message) {
        super(message);
    }
}
