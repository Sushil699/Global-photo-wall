import PhotoCard from './PhotoCard';

function MasonryGrid({ photos }) {
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
      {photos.map((photo) => (
        <PhotoCard key={photo.photoId} photo={photo} />
      ))}
    </div>
  );
}

export default MasonryGrid;
