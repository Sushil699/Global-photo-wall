import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPhotoModal from './components/UploadPhotoModal';
import HomePage from './pages/HomePage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import './App.css';

function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    setGalleryKey((k) => k + 1);
    if (result?.photoId) {
      navigate(`/photo/${result.photoId}`);
    }
  };

  return (
    <div className="app">
      <Navbar onUploadClick={() => setIsUploadOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage key={galleryKey} />} />
          <Route path="/photo/:photoId" element={<PhotoDetailPage />} />
        </Routes>
      </main>
      <UploadPhotoModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default App;
