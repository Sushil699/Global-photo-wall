import { Link } from 'react-router-dom';

function Navbar({ onUploadClick }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📷</span>
          <span className="brand-text">Global Photo Wall</span>
        </Link>
        <nav className="navbar-actions">
          <button type="button" className="btn btn-primary" onClick={onUploadClick}>
            Upload Photo
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
