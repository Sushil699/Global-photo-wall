import { useState, useEffect, useCallback } from 'react';
import PhotoCard from './PhotoCard';

function MasonryGrid({ photos }) {
  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);

  // Reset sequential loader queue whenever photos change
  useEffect(() => {
    setMaxLoadedIndex(0);
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
          shouldLoad={index <= maxLoadedIndex}
          onLoadComplete={() => handleLoadComplete(index)}
        />
      ))}
    </div>
  );
}

export default MasonryGrid;
