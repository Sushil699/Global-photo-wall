import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    if (onSearch) {
      const result = await onSearch(trimmed);
      if (result?.photoId) {
        navigate(`/photo/${result.photoId}`);
      }
    } else {
      navigate(`/photo/${trimmed}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
        placeholder="Search by ID (e.g. IMG-100001)"
        aria-label="Search photos by ID"
        className="search-input"
      />
      <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}

export default SearchBar;
