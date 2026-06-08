import { useState } from 'react';
import { Link } from 'react-router-dom';

function PhotoCard({ photo, shouldLoad, onLoadComplete }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate a deterministic height for the placeholder based on the photoId digits
  const heights = [250, 320, 400, 280, 350, 450];
  const photoIdNum = photo.photoId ? parseInt(photo.photoId.replace(/\D/g, ''), 10) : 0;
  const placeholderHeight = isNaN(photoIdNum) ? 300 : heights[photoIdNum % heights.length];

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoadComplete) {
      onLoadComplete();
    }
  };

  const handleImageError = () => {
    // Call onLoadComplete even on error so the loading queue isn't blocked
    if (onLoadComplete) {
      onLoadComplete();
    }
  };

  return (
    <article className="photo-card">
      <Link to={`/photo/${photo.photoId}`} className="photo-card-link">
        <div 
          className="photo-card-image-wrapper"
          style={{ height: isLoaded ? 'auto' : `${placeholderHeight}px` }}
        >
          {/* Show shimmer skeleton when the image is not loaded */}
          {!isLoaded && <div className="photo-card-skeleton" />}
          
          {shouldLoad && (
            <img
              src={photo.imageUrl}
              alt={`Photo ${photo.photoId}`}
              className={`photo-card-image ${isLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          
          <div className="photo-card-overlay">
            <span className="photo-card-id">{photo.photoId}</span>
          </div>
        </div>
        <div className="photo-card-meta">
          <span className="photo-card-category-tag">{photo.category || 'Others'}</span>
          <span className="photo-card-reactions">
            ❤️ {(photo.countLove || 0) + (photo.countLike || 0) + (photo.countHaha || 0) + (photo.countWow || 0) + (photo.countFire || 0)}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default PhotoCard;
