'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  ShieldCheck,
  Volume2,
  X
} from 'lucide-react';
import { api, triggerEnquiryModal } from '../lib/api';
import { fallbackCourses, fallbackNotifications, fallbackUniversities, services } from '../lib/content';
import CourseCard from '../components/CourseCard';

const icons = [GraduationCap, BookOpen, FileText, CalendarDays, ShieldCheck, Headphones];

export default function Home() {
  const [universities, setUniversities] = useState(fallbackUniversities);
  const [courses, setCourses] = useState(fallbackCourses);
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '919000000000', phone: '+91 90000 00000' });
  const [activeNotice, setActiveNotice] = useState(null);

  // Auto-scroll ticker state
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef(null);

  useEffect(() => {
    // 1. Universities
    api('/universities')
      .then(data => {
        if (Array.isArray(data) && data.length) {
          const mapped = data.map(u => {
            if (u.name?.toLowerCase().includes('alagappa')) return { ...u, logo: u.logo || '/images/alagappa-logo.png' };
            if (u.name?.toLowerCase().includes('madras')) return { ...u, logo: u.logo || '/images/madras-logo.jpg' };
            return u;
          });
          setUniversities(mapped);
        }
      })
      .catch(() => {});

    // 2. Featured courses
    api('/courses?featured=true')
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length) setCourses(list);
      })
      .catch(() => {});

    // 3. Notifications
    api('/notifications')
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length) setNotifications(list);
      })
      .catch(() => {});

    // 4. Gallery
    api('/gallery?limit=3')
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length) setGallery(list);
      })
      .catch(() => {});

    // 5. Settings
    api('/settings')
      .then(data => data && setSettings(data))
      .catch(() => {});
  }, []);

  // Smooth vertical auto-scrolling for notifications ticker (every 3.5s when not paused)
  useEffect(() => {
    if (notifications.length <= 3 || isPaused) return;

    const interval = setInterval(() => {
      setScrollIndex(prev => (prev + 1) % notifications.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [notifications.length, isPaused]);

  const handleOpenGuidance = (e) => {
    e.preventDefault();
    triggerEnquiryModal();
  };

  return (
    <>
      {/* ── 1. CLEAN ORIGINAL HERO SECTION ── */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="section-kicker">Distance education, made clearer</p>
            <h1>Your Trusted Bridge to <em>Distance Education</em></h1>
            <p>
              Get guidance for distance education admissions, courses, examinations and student services through leading universities.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/courses">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                className="button button-light"
                onClick={handleOpenGuidance}
              >
                Get Admission Guidance
              </button>
            </div>
            <div className="trust-row">
              <span><CheckCircle2 size={18} /> Course selection support</span>
              <span><CheckCircle2 size={18} /> Student-first guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WHY STUDENTS CHOOSE US / SIMPLE SUPPORT AT EVERY STEP ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading centered">
            <p className="section-kicker">Why students choose us</p>
            <h2>Simple support at every important step</h2>
          </div>
          <div className="feature-grid">
            {services.map(([name, description], index) => {
              const Icon = icons[index] || GraduationCap;
              return (
                <article className="feature" key={name}>
                  <span><Icon size={23} /></span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. NOTIFICATIONS SECTION (SPLIT LAYOUT: RIGHT-SIDE AUTO-SCROLLING PANEL) ── */}
      <section className="section soft">
        <div className="container split-section">
          <div>
            <p className="section-kicker">Latest notifications</p>
            <h2>Stay informed, without missing a deadline</h2>
            <p className="lead">
              We surface useful notices and point students to the relevant official university channels.
            </p>
            <Link className="button button-outline" href="/notifications">
              View all notifications <ArrowRight size={17} />
            </Link>
          </div>

          {/* Right-Hand Latest Notification Ticker Panel */}
          <div
            className="home-notification-panel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="panel-header">
              <div className="panel-title-wrap">
                <Volume2 size={18} className="panel-icon" />
                <h3>Latest Notification</h3>
              </div>
              <span className="live-indicator">LIVE</span>
            </div>

            <div className="ticker-window" ref={tickerRef}>
              <div
                className="ticker-track"
                style={{
                  transform: `translateY(-${Math.min(scrollIndex, Math.max(0, notifications.length - 3)) * 88}px)`,
                  transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                {notifications.map((note) => (
                  <article
                    key={note.id}
                    className={`ticker-item ${note.important ? 'important' : ''}`}
                    onClick={() => setActiveNotice(note)}
                  >
                    <div className="ticker-item-top">
                      {note.is_new_badge ? (
                        <span className="badge-new">
                          <span className="red-dot"></span> NEW
                        </span>
                      ) : (
                        <span className="badge-type">{note.type}</span>
                      )}
                      <span className="ticker-date">
                        {note.published_at ? new Date(note.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                    <h4 className="ticker-title">{note.title}</h4>
                    {note.university?.name && (
                      <p className="ticker-uni">{note.university.name}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="panel-footer">
              <Link href="/notifications" className="button-view-all">
                [ View All ]
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SUPPORTED UNIVERSITIES (CLEAN UI: NO OFFERED PROGRAMMES OR PORTAL LINK FIELDS) ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Supported universities</p>
              <h2>Explore your education options</h2>
            </div>
            <p>University details and available courses are managed by our guidance team.</p>
          </div>

          <div className="university-grid">
            {universities.slice(0, 4).map((university, index) => (
              <article className="university-card" key={university.id}>
                <div className="university-badge">
                  {university.logo ? (
                    <img src={university.logo} alt={`${university.name} logo`} />
                  ) : (
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <div>
                  <p className="eyebrow">{university.location || 'Distance learning support'}</p>
                  <h3>{university.name}</h3>
                  <p>{university.description}</p>
                </div>
                <Link href={`/courses?university=${university.id}`}>
                  View courses <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. POPULAR COURSES ── */}
      <section className="section soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Popular courses</p>
              <h2>Find a course that fits your next step</h2>
            </div>
            <Link className="inline-link" href="/courses">
              Explore all courses <ArrowRight size={16} />
            </Link>
          </div>

          <div className="course-grid">
            {courses.slice(0, 3).map(course => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PROCESS / HOW IT WORKS ── */}
      <section className="process">
        <div className="container">
          <div className="section-heading centered light-text">
            <p className="section-kicker">How it works</p>
            <h2>Guidance that keeps moving forward</h2>
          </div>
          <div className="process-grid">
            {['Choose Your Course', 'Get Guidance', 'Complete Application', 'Continue Your Education'].map((step, index) => (
              <div key={step} className="process-step">
                <b>{index + 1}</b>
                <h3>{step}</h3>
                <p>{['Tell us what you want to achieve.', 'We explain options and eligibility.', 'Prepare your application confidently.', 'Receive updates and student support.'][index]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. GALLERY PREVIEW (ORIGINAL 3-IMAGE PREVIEW UI) ── */}
      <section className="section soft gallery-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Our gallery</p>
              <h2>Guidance in action</h2>
            </div>
            <Link className="inline-link" href="/gallery">
              View Gallery <ArrowRight size={16} />
            </Link>
          </div>

          <div className="gallery-preview">
            {gallery.length ? (
              gallery.slice(0, 3).map(image => (
                <img key={image.id} src={image.image_url} alt={image.title} loading="lazy" />
              ))
            ) : (
              ['Counselling', 'Student support', 'Learning journeys'].map((title, index) => (
                <div className={`gallery-placeholder placeholder-${index + 1}`} key={title}>
                  <span>{title}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 8. CTA SECTION ── */}
      <section className="cta-section">
        <div className="container cta-wrap">
          <div>
            <p className="section-kicker">Talk to a guidance counsellor</p>
            <h2>Need help choosing the right distance education course?</h2>
          </div>
          <div className="cta-actions">
            <a className="button button-light" href={`tel:${settings.phone}`}>
              Call Us
            </a>
            <a
              className="button button-whatsapp"
              href={`https://wa.me/${String(settings.whatsapp || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>
            <button
              type="button"
              className="button button-outline-on-dark"
              onClick={handleOpenGuidance}
            >
              Enquire Now
            </button>
          </div>
        </div>
      </section>

      {/* ── NOTIFICATION DETAILS MODAL ── */}
      {activeNotice && (
        <div className="modal-overlay" onClick={() => setActiveNotice(null)}>
          <div className="modal-content notice-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label="Close modal"
              onClick={() => setActiveNotice(null)}
            >
              <X size={20} />
            </button>

            <div className="notice-modal-header">
              <div>
                <span className="type-chip">{activeNotice.type}</span>
                {activeNotice.is_new_badge && (
                  <span className="badge-new inline-badge">
                    <span className="red-dot"></span> NEW
                  </span>
                )}
              </div>
              <span className="notice-modal-date">
                {activeNotice.published_at ? new Date(activeNotice.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) : ''}
              </span>
            </div>

            <h2>{activeNotice.title}</h2>
            {activeNotice.university?.name && (
              <p className="notice-modal-uni">
                <GraduationCap size={15} /> {activeNotice.university.name}
              </p>
            )}

            <div className="notice-modal-body">
              <p>{activeNotice.description}</p>
            </div>

            {activeNotice.link && (
              <div className="notice-modal-actions">
                <a
                  href={activeNotice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                >
                  Official Announcement Link <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
