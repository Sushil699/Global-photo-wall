import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/formatters';

function PhotoCard({ photo }) {
  return (
    <article className="photo-card">
      <Link to={`/photo/${photo.photoId}`} className="photo-card-link">
        <div className="photo-card-image-wrapper">
          <img
            src={photo.imageUrl}
            alt={`Photo ${photo.photoId}`}
            className="photo-card-image"
            loading="lazy"
          />
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
