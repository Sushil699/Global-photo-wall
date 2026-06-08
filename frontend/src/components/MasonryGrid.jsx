import { useState, useEffect, useCallback, useRef } from 'react';
import PhotoCard from './PhotoCard';

// Limit concurrent image requests to prevent server spikes, while avoiding queue blockages
const CONCURRENT_LOAD_LIMIT = 4;

function MasonryGrid({ photos }) {
  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);
  const prevFirstPhotoIdRef = useRef(null);

  // Reset sequential loader queue only when a new list is fetched (e.g. category switch or search)
  // Do NOT reset when more photos are appended to the end of the list (infinite scrolling)
  useEffect(() => {
    const firstPhoto = photos[0];
    const firstPhotoId = firstPhoto ? firstPhoto.photoId : null;

    if (!firstPhotoId || firstPhotoId !== prevFirstPhotoIdRef.current) {
      setMaxLoadedIndex(0);
    }
    prevFirstPhotoIdRef.current = firstPhotoId;
  }, [photos]);

  const handleLoadComplete = useCallback((index) => {
    setMaxLoadedIndex((prev) => Math.max(prev, index + 1));
  }, []);

  if (!photos.length) {
    return (
      <div className="empty-state">
        <h3>No photos yet</h3>
        <p>Be the first to share a photo with the world!</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.photoId}
          photo={photo}
          shouldLoad={index <= maxLoadedIndex + CONCURRENT_LOAD_LIMIT - 1}
          onLoadComplete={() => handleLoadComplete(index)}
        />
      ))}
    </div>
  );
}

export default MasonryGrid;
