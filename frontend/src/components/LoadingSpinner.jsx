function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  return (
    <div className={`spinner-wrapper spinner-${size}`} role="status" aria-live="polite">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

export default LoadingSpinner;
