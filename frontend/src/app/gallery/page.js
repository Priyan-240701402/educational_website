'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon, Heart } from 'lucide-react';
import { api } from '../../lib/api';

const sample = [
  { id: '1', title: 'Student counselling session', category: 'Counselling', description: 'One-on-one guidance for course selection.', image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80', likes_count: 60, views_count: 194 },
  { id: '2', title: 'Group learning support', category: 'Student Activities', description: 'Collaborative study and peer support.', image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80', likes_count: 76, views_count: 228 },
  { id: '3', title: 'Guidance help desk', category: 'Office', description: 'Our team ready to assist walk-in students.', image_url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=80', likes_count: 42, views_count: 145 },
  { id: '4', title: 'Student achievement ceremony', category: 'Achievements', description: 'Celebrating student milestones and success.', image_url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80', likes_count: 135, views_count: 410 },
  { id: '5', title: 'Distance education workshop', category: 'Events', description: 'Workshop on distance education opportunities.', image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80', likes_count: 98, views_count: 312 },
  { id: '6', title: 'Campus visit and orientation', category: 'Events', description: 'Students exploring educational pathways.', image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80', likes_count: 53, views_count: 175 },
];

export default function GalleryPage() {
  const [images, setImages] = useState(sample);
  const [category, setCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalItems: 6, totalPages: 1 });

  const loadGallery = useCallback(async (page = 1) => {
    try {
      const res = await api(`/gallery?page=${page}&limit=9`);
      if (res && res.data && res.data.length) {
        setImages(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (Array.isArray(res) && res.length) {
        setImages(res);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadGallery(pagination.page);
  }, [loadGallery, pagination.page]);

  const categories = ['All', ...new Set(images.map(img => img.category).filter(Boolean))];
  const visible = category === 'All' ? images : images.filter(img => img.category === category);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => (i - 1 + visible.length) % visible.length), [visible.length]);
  const next = useCallback(() => setLightbox(i => (i + 1) % visible.length), [visible.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, closeLightbox, prev, next]);

  const handleLike = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await api(`/gallery/${id}/like`, { method: 'POST' });
      if (res && res.data) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, is_liked: res.data.liked, likes_count: res.data.likes_count } : img));
      }
    } catch {}
  };

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">Gallery</p>
          <h1>Student guidance, in action</h1>
          <p>Moments from our counselling, support and community activities.</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section">
        <div className="container">
          {/* Category Tabs */}
          <div className="gallery-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={category === cat ? 'active' : ''}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="results-count">{visible.length} image{visible.length !== 1 ? 's' : ''}</p>

          {/* Grid */}
          {visible.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={40} style={{ margin: '0 auto 14px', display: 'block', opacity: .4 }} />
              <p>No images in this category yet.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {visible.map((img, index) => (
                <figure
                  key={img.id}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  onClick={() => openLightbox(index)}
                >
                  <img src={img.image_url} alt={img.title} loading="lazy" />
                  {/* Hover overlay */}
                  <div
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(8,45,103,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: '.25s',
                    }}
                    className="gallery-hover-overlay"
                  >
                    <ZoomIn size={36} color="#fff" />
                  </div>
                  <figcaption>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{img.category}</span>
                      <button
                        type="button"
                        onClick={(e) => handleLike(e, img.id)}
                        style={{
                          background: 'none', border: 'none', display: 'inline-flex',
                          alignItems: 'center', gap: 4, color: img.is_liked ? '#e74c3c' : '#73869c',
                          fontSize: '.76rem', cursor: 'pointer', padding: 0
                        }}
                      >
                        <Heart size={14} fill={img.is_liked ? '#e74c3c' : 'none'} />
                        <span>{img.likes_count || 0}</span>
                      </button>
                    </div>
                    <h2>{img.title}</h2>
                    {img.description && <p>{img.description}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-wrap">
              <button
                className="pagination-btn"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                « Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-btn ${pagination.page === p ? 'active' : ''}`}
                  onClick={() => setPagination(curr => ({ ...curr, page: p }))}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && visible[lightbox] && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(4,21,55,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={closeLightbox}
        >
          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
              width: 48, height: 48, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff',
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', textAlign: 'center' }}>
            <img
              src={visible[lightbox].image_url}
              alt={visible[lightbox].title}
              style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 30px 60px #00000060' }}
            />
            <p style={{ color: '#d7e8ff', marginTop: 14, fontSize: '.95rem', fontWeight: 600 }}>
              {visible[lightbox].title}
            </p>
            {visible[lightbox].description && (
              <p style={{ color: '#8fb4dd', fontSize: '.82rem', margin: '4px 0 0' }}>{visible[lightbox].description}</p>
            )}
            <p style={{ color: '#6a90ba', fontSize: '.72rem', marginTop: 8 }}>
              {lightbox + 1} / {visible.length}
            </p>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
              width: 48, height: 48, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff',
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
              width: 42, height: 42, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* Hover overlay CSS */}
      <style>{`
        .gallery-grid figure:hover .gallery-hover-overlay { opacity: 1 !important; }
        .gallery-grid figure img { transition: transform .3s; }
        .gallery-grid figure:hover img { transform: scale(1.04); }
      `}</style>
    </>
  );
}
