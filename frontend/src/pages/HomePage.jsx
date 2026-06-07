import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MasonryGrid from '../components/MasonryGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useInfinitePhotos } from '../hooks/useInfinitePhotos';
import { usePhotoSearch } from '../hooks/usePhotoSearch';

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { photos, loading, loadingMore, error, hasNext, loadMoreRef, refresh } = useInfinitePhotos(selectedCategory);
  const { search, loading: searchLoading } = usePhotoSearch();

  const categories = ['All', 'Nature', 'Street', 'Travel', 'Art', 'Tech', 'Others'];

  return (
    <>
      <section className="hero">
        <h1>Share Your World</h1>
        <p>Upload photos for everyone to see. No account required.</p>
        <SearchBar onSearch={search} loading={searchLoading} />
      </section>

      <div className="categories-container">
        <div className="categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="gallery-section">
        {loading && <LoadingSpinner label="Loading photos..." />}

        {!loading && error && (
          <ErrorState message={error} onRetry={refresh} />
        )}

        {!loading && !error && (
          <>
            <MasonryGrid photos={photos} />
            {hasNext && (
              <div ref={loadMoreRef} className="load-more-trigger">
                {loadingMore && <LoadingSpinner size="sm" label="Loading more..." />}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default HomePage;
