import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { getPhotoById, incrementViewCount, reactPhoto, reportPhoto, getErrorMessage } from '../services/api';
import { formatDateTime, formatViewCount } from '../utils/formatters';

function PhotoDetailPage() {
  const { photoId } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomed, setZoomed] = useState(false);

  // Actions states
  const [reactedType, setReactedType] = useState(null);
  const [reported, setReported] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const reactionTypes = [
    { key: 'like', emoji: '👍', label: 'Like' },
    { key: 'love', emoji: '❤️', label: 'Love' },
    { key: 'fire', emoji: '🔥', label: 'Fire' },
    { key: 'haha', emoji: '😂', label: 'Haha' },
    { key: 'wow', emoji: '😮', label: 'Wow' }
  ];

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadPhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      const normalizedId = photoId.toUpperCase();
      const data = await getPhotoById(normalizedId);
      setPhoto(data);

      // Check local storage states
      const reactedMap = JSON.parse(localStorage.getItem('reacted_photos') || '{}');
      if (reactedMap[normalizedId]) {
        setReactedType(reactedMap[normalizedId]);
      }

      const reportedMap = JSON.parse(localStorage.getItem('reported_photos') || '{}');
      if (reportedMap[normalizedId]) {
        setReported(true);
      }

      try {
        const updated = await incrementViewCount(normalizedId);
        setPhoto((prev) => ({ ...prev, viewCount: updated.viewCount }));
      } catch {
        // View count increment failure should not block photo display
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setPhoto(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhoto();
  }, [photoId]);

  const handleReact = async (type) => {
    if (reactedType) {
      showToast('You have already reacted to this photo!');
      return;
    }

    try {
      const normalizedId = photo.photoId;
      const updated = await reactPhoto(normalizedId, type);
      setPhoto(updated);
      setReactedType(type);

      const reactedMap = JSON.parse(localStorage.getItem('reacted_photos') || '{}');
      reactedMap[normalizedId] = type;
      localStorage.setItem('reacted_photos', JSON.stringify(reactedMap));
      showToast(`Added ${type} reaction!`);
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      setShowReactions(false);
    }
  };

  const handleReport = async () => {
    if (reported) {
      showToast('You have already reported this photo.');
      return;
    }

    const confirmReport = window.confirm(
      'Are you sure you want to report this photo for inappropriate content?'
    );
    if (!confirmReport) return;

    try {
      const normalizedId = photo.photoId;
      await reportPhoto(normalizedId);
      setReported(true);

      const reportedMap = JSON.parse(localStorage.getItem('reported_photos') || '{}');
      reportedMap[normalizedId] = true;
      localStorage.setItem('reported_photos', JSON.stringify(reportedMap));
      showToast('Photo has been reported.');
    } catch (err) {
      showToast(getErrorMessage(err));
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      showToast('Starting download...');
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.photoId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Downloaded successfully!');
    } catch (err) {
      showToast('Failed to download image. Opening in new tab instead.');
      window.open(photo.imageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: `Photo ${photo.photoId} on Global Photo Wall`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <LoadingSpinner label="Loading photo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <ErrorState title="Photo Not Found" message={error} onRetry={loadPhoto} />
        <Link to="/" className="back-link">← Back to Gallery</Link>
      </div>
    );
  }

  // Get active reaction object
  const activeReaction = reactionTypes.find((r) => r.key === reactedType);

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Back to Gallery</Link>

      <div className="detail-card animate-fade-in">
        <div
          className={`detail-image-wrapper ${zoomed ? 'zoomed' : ''}`}
          onClick={() => setZoomed((z) => !z)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setZoomed((z) => !z)}
          aria-label="Toggle image zoom"
        >
          <img
            src={photo.imageUrl}
            alt={`Photo ${photo.photoId}`}
            className="detail-image"
          />
        </div>

        <div className="detail-info">
          <div className="detail-header">
            <h1>{photo.photoId}</h1>
            <span className="detail-category">{photo.category || 'Others'}</span>
          </div>

          <dl className="detail-meta">
            <div>
              <dt>Uploaded</dt>
              <dd>{formatDateTime(photo.uploadedAt)}</dd>
            </div>
            <div>
              <dt>Views</dt>
              <dd>{formatViewCount(photo.viewCount)}</dd>
            </div>
          </dl>

          <p className="zoom-hint">Click the image to zoom in/out</p>

          <div className="detail-actions">
            {/* Reaction Section */}
            <div 
              className="reaction-button-container"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <button 
                type="button"
                className={`btn btn-reaction ${reactedType ? 'active' : ''}`}
                onClick={() => setShowReactions(!showReactions)}
              >
                {activeReaction ? `${activeReaction.emoji} ${activeReaction.label}` : '👍 React'}
              </button>

              {showReactions && (
                <div className="reactions-popover">
                  {reactionTypes.map((react) => (
                    <button
                      key={react.key}
                      type="button"
                      className="reaction-emoji-btn"
                      title={react.label}
                      onClick={() => handleReact(react.key)}
                    >
                      <span className="reaction-emoji">{react.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Other Action Buttons */}
            <button type="button" className="btn btn-action" onClick={handleDownload} disabled={downloading}>
              📥 Download
            </button>
            
            <button type="button" className="btn btn-action" onClick={handleShare}>
              🔗 Share
            </button>

            <button 
              type="button" 
              className={`btn btn-action btn-danger-outline ${reported ? 'reported' : ''}`} 
              onClick={handleReport}
            >
              🚩 {reported ? 'Reported' : 'Report'}
            </button>
          </div>

          {/* Reaction stats display */}
          <div className="reactions-stats">
            <span className="stat-item" title="Likes">👍 {photo.countLike || 0}</span>
            <span className="stat-item" title="Love">❤️ {photo.countLove || 0}</span>
            <span className="stat-item" title="Fire">🔥 {photo.countFire || 0}</span>
            <span className="stat-item" title="Haha">😂 {photo.countHaha || 0}</span>
            <span className="stat-item" title="Wow">😮 {photo.countWow || 0}</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default PhotoDetailPage;
