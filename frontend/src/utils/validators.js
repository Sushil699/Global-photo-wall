import { ALLOWED_TYPES, MAX_FILE_SIZE } from './constants';

export const validateImageFile = (file) => {
  if (!file) {
    return 'Please select an image to upload.';
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Image size must not exceed 10 MB.';
  }

  return null;
};
