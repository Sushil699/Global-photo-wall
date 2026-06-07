import { useState } from 'react';
import { searchPhoto, getErrorMessage } from '../services/api';

export const usePhotoSearch = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (photoId) => {
    const trimmed = photoId.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a photo ID to search.');
      setResult(null);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchPhoto(trimmed);
      setResult(data);
      return data;
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, search, clear };
};
