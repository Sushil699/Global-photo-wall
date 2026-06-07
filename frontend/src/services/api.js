import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const resolveImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
};

const mapPhoto = (photo) => ({
  ...photo,
  imageUrl: resolveImageUrl(photo.imageUrl),
});

export const uploadPhoto = async (file, category) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category || 'Others');
  const { data } = await api.post('/api/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapPhoto(data);
};

export const getPhotos = async (category = 'All', page = 0, size = 20) => {
  const params = { page, size };
  if (category && category !== 'All') {
    params.category = category;
  }
  const { data } = await api.get('/api/photos', { params });
  return {
    ...data,
    photos: data.photos.map(mapPhoto),
  };
};

export const reactPhoto = async (photoId, type) => {
  const { data } = await api.put(`/api/photos/${photoId}/react`, null, {
    params: { type },
  });
  return mapPhoto(data);
};

export const reportPhoto = async (photoId) => {
  const { data } = await api.put(`/api/photos/${photoId}/report`);
  return mapPhoto(data);
};

export const getPhotoById = async (photoId) => {
  const { data } = await api.get(`/api/photos/${photoId}`);
  return mapPhoto(data);
};

export const searchPhoto = async (photoId) => {
  const { data } = await api.get('/api/photos/search', { params: { photoId } });
  return mapPhoto(data);
};

export const incrementViewCount = async (photoId) => {
  const { data } = await api.put(`/api/photos/${photoId}/view`);
  return mapPhoto(data);
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Server took too long. Check backend/.env (MongoDB + Cloudinary) and restart the backend.';
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the server. Make sure the backend is running on http://localhost:8080 and restart it after changing .env';
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

export default api;
