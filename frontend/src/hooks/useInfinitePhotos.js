import { useCallback, useEffect, useRef, useState } from 'react';
import { getPhotos, getErrorMessage } from '../services/api';
import { PAGE_SIZE } from '../utils/constants';

export const useInfinitePhotos = (category = 'All') => {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchPage = useCallback(async (pageNumber, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getPhotos(category, pageNumber, PAGE_SIZE);

      setPhotos((prev) => (append ? [...prev, ...data.photos] : data.photos));
      setHasNext(data.hasNext);
      setPage(pageNumber);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category]);

  const refresh = useCallback(() => {
    setPhotos([]);
    setPage(0);
    setHasNext(true);
    fetchPage(0, false);
  }, [fetchPage]);

  useEffect(() => {
    setPhotos([]);
    setPage(0);
    setHasNext(true);
    fetchPage(0, false);
  }, [category, fetchPage]);

  useEffect(() => {
    if (!hasNext || loading || loadingMore) return undefined;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPage(page + 1, true);
        }
      },
      { rootMargin: '200px' }
    );

    const node = loadMoreRef.current;
    if (node) {
      observerRef.current.observe(node);
    }

    return () => {
      if (observerRef.current && node) {
        observerRef.current.unobserve(node);
      }
    };
  }, [fetchPage, hasNext, loading, loadingMore, page]);

  return {
    photos,
    loading,
    loadingMore,
    error,
    hasNext,
    loadMoreRef,
    refresh,
  };
};
