import { useRef, useState } from 'react';
import { uploadPhoto, getErrorMessage } from '../services/api';
import { validateImageFile } from '../utils/validators';
import LoadingSpinner from './LoadingSpinner';

function UploadPhotoModal({ isOpen, onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('Others');
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setPreview(null);
    setSelectedFile(null);
    setCategory('Others');
    setError(null);
    setUploading(false);
    setDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = (file) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    try {
      setUploading(true);
      setError(null);
      const result = await uploadPhoto(selectedFile, category);
      onSuccess?.(result);
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <div className="modal-header">
          <h2 id="upload-modal-title">Upload a Photo</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              hidden
            />
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">+</span>
                <p>Drag & drop or click to select</p>
                <small>JPEG, PNG, WebP — max 10 MB</small>
              </div>
            )}
          </div>

          {preview && (
            <div className="category-select-wrapper">
              <label htmlFor="category-select" className="category-select-label">Select Category</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                <option value="Others">Others</option>
                <option value="Nature">Nature</option>
                <option value="Street">Street</option>
                <option value="Travel">Travel</option>
                <option value="Art">Art</option>
                <option value="Tech">Tech</option>
              </select>
            </div>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? <LoadingSpinner size="sm" label="" /> : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadPhotoModal;
