import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import sellerApi from '../services/sellerApi';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function AddProductPage() {
  const { sellerUser } = useSellerAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [brand, setBrand] = useState('NovaTech Audio');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [weight, setWeight] = useState('450g');

  // Media state: Up to 10 photos and up to 2 videos
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [videos, setVideos] = useState([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const [loading, setLoading] = useState(false);

  // Handle Photo File Upload (up to 10)
  const handlePhotoFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      alert('You have already reached the maximum limit of 10 photos.');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target.result) {
          setImages(prev => {
            if (prev.length >= 10) return prev;
            return [...prev, loadEvt.target.result];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Photo via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 10) {
      alert('Maximum 10 photos allowed.');
      return;
    }
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remove Photo
  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Move Photo (Reorder)
  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Handle Video File Upload (up to 2)
  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= 2) {
      alert('Maximum 2 videos allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target.result) {
        setVideos(prev => {
          if (prev.length >= 2) return prev;
          return [...prev, loadEvt.target.result];
        });
      }
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Add Video via URL
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    if (videos.length >= 2) {
      alert('Maximum 2 showcase videos allowed.');
      return;
    }
    setVideos(prev => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
  };

  // Remove Video
  const handleRemoveVideo = (indexToRemove) => {
    setVideos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Sample Presets for easy testing
  const addSamplePhotos = () => {
    const samples = [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ];
    setImages(prev => {
      const available = 10 - prev.length;
      return [...prev, ...samples.slice(0, available)];
    });
  };

  const addSampleVideo = () => {
    if (videos.length >= 2) {
      alert('Maximum 2 showcase videos allowed.');
      return;
    }
    const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    setVideos(prev => [...prev, sampleVideoUrl]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellerUser?.isApproved) {
      alert('Your seller store is awaiting administrator approval before you can publish products.');
      return;
    }

    if (images.length === 0) {
      alert('Please add at least 1 product photo.');
      return;
    }

    setLoading(true);
    try {
      await sellerApi.post('/products/seller', {
        name,
        description,
        category,
        brand,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : Number(price) * 1.3,
        stock: Number(stock),
        weight,
        images: images.slice(0, 10),
        videos: videos.slice(0, 2)
      });

      alert('🎉 Product listed successfully! Photos and videos are now live on the Customer Storefront.');
      navigate('/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="seller-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Add New Product</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            Publish product directly to Customer Storefront with up to 10 photos &amp; 2 showcase videos
          </p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PRODUCT BASICS */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Product Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Wireless ANC Studio Headphones" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Category</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Electronics & Gadgets">Electronics &amp; Gadgets</option>
                <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                <option value="Home & Office">Home &amp; Office</option>
                <option value="Beauty & Care">Beauty &amp; Care</option>
                <option value="Sports & Fitness">Sports &amp; Fitness</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Brand Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. NovaTech" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Price (₹ INR)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 4999" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Original MRP (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 6999" 
                value={oldPrice} 
                onChange={(e) => setOldPrice(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Initial Stock Units</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="25" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 1: PRODUCT PHOTOS (UP TO 10 PHOTOS) */}
          {/* ================================================================= */}
          <div className="media-section">
            <div className="media-header">
              <div className="media-title">
                <i className="fa-solid fa-camera-retro" style={{ color: '#1A237E' }}></i>
                Product Photos
              </div>
              <span className={`media-badge ${images.length >= 10 ? 'full' : ''}`}>
                {images.length} / 10 Added
              </span>
            </div>

            <p className="media-hint">
              Upload up to <strong>10 high-resolution photos</strong>. The 1st photo is used as the <strong>Cover Photo</strong> across the customer portal. Customers can slide to view all photos.
            </p>

            {/* Upload Area */}
            {images.length < 10 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  className="media-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: '#64748B', marginBottom: '6px' }}></i>
                  <p style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                    Click to browse &amp; upload photo files
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Supports JPG, PNG, WebP (select multiple files at once)
                  </p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handlePhotoFiles} 
                  />
                </div>

                {/* Direct Image URL input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="url" 
                    className="form-input" 
                    style={{ margin: 0 }}
                    placeholder="Or paste photo image URL (https://...)" 
                    value={imageUrlInput} 
                    onChange={(e) => setImageUrlInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                  />
                  <button 
                    type="button" 
                    className="btn-seller btn-seller-primary" 
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handleAddImageUrl}
                  >
                    <i className="fa-solid fa-plus"></i> Add URL
                  </button>
                  <button
                    type="button"
                    className="btn-seller"
                    style={{ background: '#E0E7FF', color: '#3730A3', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                    onClick={addSamplePhotos}
                    title="Add sample headphone studio photos for quick testing"
                  >
                    + Sample Pack
                  </button>
                </div>
              </div>
            )}

            {/* Photo Cards Grid */}
            {images.length > 0 && (
              <div className="photo-grid">
                {images.map((img, idx) => (
                  <div key={idx} className="photo-card" title={`Photo #${idx + 1}`}>
                    <img src={img} alt={`Product photo ${idx + 1}`} />
                    <span className={`photo-slot-badge ${idx === 0 ? 'cover' : ''}`}>
                      {idx === 0 ? '★ Cover #1' : `#${idx + 1}`}
                    </span>
                    <button 
                      type="button" 
                      className="photo-remove-btn" 
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove this photo"
                    >
                      ✕
                    </button>
                    {/* Reorder buttons */}
                    <div style={{ position: 'absolute', bottom: 3, left: 3, right: 3, display: 'flex', justifyContent: 'space-between' }}>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, -1)}
                          style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 5px', fontSize: '0.65rem', cursor: 'pointer' }}
                          title="Move left"
                        >
                          ◀
                        </button>
                      )}
                      <div style={{ flex: 1 }}></div>
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 1)}
                          style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 5px', fontSize: '0.65rem', cursor: 'pointer' }}
                          title="Move right"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: SHOWCASE VIDEOS (UP TO 2 VIDEOS) */}
          {/* ================================================================= */}
          <div className="media-section">
            <div className="media-header">
              <div className="media-title">
                <i className="fa-solid fa-video" style={{ color: '#7C3AED' }}></i>
                Product Showcase Videos
              </div>
              <span className={`media-badge ${videos.length >= 2 ? 'full' : ''}`}>
                {videos.length} / 2 Added
              </span>
            </div>

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8rem', color: '#1E40AF', lineHeight: '1.4' }}>
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                <i className="fa-solid fa-circle-info"></i> Automated Storefront Display Rule:
              </div>
              • <strong>Video #1</strong> will appear in the <strong>2nd slot</strong> on the customer portal (right after the cover photo).<br />
              • <strong>Video #2</strong> will appear as the <strong>final item</strong> at the end of the customer gallery.<br />
              • If no video is added, only photos are displayed. No empty video boxes will be shown.
            </div>

            {/* Video Input Options (if less than 2) */}
            {videos.length < 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="url" 
                    className="form-input" 
                    style={{ margin: 0 }}
                    placeholder={`Enter URL for Video #${videos.length + 1} (.mp4, .webm, cdn video link)`} 
                    value={videoUrlInput} 
                    onChange={(e) => setVideoUrlInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideoUrl(); } }}
                  />
                  <button 
                    type="button" 
                    className="btn-seller btn-seller-primary" 
                    style={{ background: '#7C3AED', whiteSpace: 'nowrap' }}
                    onClick={handleAddVideoUrl}
                  >
                    <i className="fa-solid fa-plus"></i> Add Video URL
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-seller"
                    style={{ background: '#F3E8FF', color: '#6B21A8', fontSize: '0.82rem', padding: '8px 14px' }}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <i className="fa-solid fa-file-video"></i> Upload Local Video File (.mp4)
                  </button>
                  <input 
                    ref={videoInputRef}
                    type="file" 
                    accept="video/mp4,video/webm" 
                    style={{ display: 'none' }} 
                    onChange={handleVideoFile} 
                  />

                  <button
                    type="button"
                    className="btn-seller"
                    style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.82rem', padding: '8px 14px' }}
                    onClick={addSampleVideo}
                    title="Add high-definition sample product demo video"
                  >
                    <i className="fa-solid fa-play"></i> + Sample Video
                  </button>
                </div>
              </div>
            )}

            {/* Video Slots Display */}
            {videos.length > 0 && (
              <div className="video-slots-container">
                {videos.map((vidUrl, idx) => (
                  <div key={idx} className="video-slot-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`video-slot-label ${idx === 0 ? 'slot1' : 'slot2'}`}>
                        <i className="fa-solid fa-circle-play"></i>
                        {idx === 0 ? 'Video #1 (Displays in 2nd Slot)' : 'Video #2 (Displays as Final Slot)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(idx)}
                        style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ borderRadius: '6px', overflow: 'hidden', background: '#000', maxHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video 
                        src={vidUrl} 
                        controls 
                        muted 
                        style={{ width: '100%', maxHeight: '140px', objectFit: 'contain' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {vidUrl.startsWith('data:') ? 'Local video file loaded' : vidUrl}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPECIFICATIONS */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Detailed Specifications &amp; Features</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: '100px' }} 
              placeholder="Describe battery life, material, warranty and dimensions..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            className="btn-seller btn-seller-primary" 
            style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem', fontWeight: '700' }} 
            disabled={loading}
          >
            {loading ? 'Publishing to MongoDB...' : 'Publish Product to Customer Storefront'}
          </button>
        </form>
      </div>
    </div>
  );
}
