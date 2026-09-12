'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Phone, Send, GraduationCap, Lock } from 'lucide-react';
import { api } from '../lib/api';

export default function EnquiryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    university_id: '',
    course_id: '',
    message: '',
    source: 'admission_guidance_popup'
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef(null);

  // Load universities and courses on mount and whenever modal opens
  const loadData = useCallback(async () => {
    try {
      const [uniRes, courseRes] = await Promise.all([
        api('/universities'),
        api('/courses')
      ]);
      const uniList = Array.isArray(uniRes) ? uniRes : uniRes?.data || [];
      const courseList = Array.isArray(courseRes) ? courseRes : courseRes?.data || [];

      if (uniList.length) setUniversities(uniList);
      if (courseList.length) setAllCourses(courseList);
    } catch (err) {
      console.error('Failed to load modal course data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Filter courses dynamically when university changes
  useEffect(() => {
    if (!form.university_id) {
      setFilteredCourses(allCourses);
      return;
    }

    const target = String(form.university_id).toLowerCase().trim();

    const filtered = allCourses.filter(c => {
      const uniId = String(c.university_id || c.university?.id || '').toLowerCase().trim();
      const uniName = String(c.university?.name || '').toLowerCase().trim();
      const uniSlug = String(c.university?.slug || '').toLowerCase().trim();

      return (
        uniId === target ||
        uniSlug === target ||
        uniName === target ||
        (target.includes('madras') && (uniName.includes('madras') || uniSlug.includes('madras') || uniId.includes('madras'))) ||
        (target.includes('alagappa') && (uniName.includes('alagappa') || uniSlug.includes('alagappa') || uniId.includes('alagappa')))
      );
    });

    setFilteredCourses(filtered.length ? filtered : allCourses);
  }, [form.university_id, allCourses]);

  // Listen to manual triggers from "Get Admission Guidance" buttons
  useEffect(() => {
    const handleOpenModal = (event) => {
      const detail = event?.detail || {};
      setForm(prev => ({
        ...prev,
        university_id: detail.university_id || prev.university_id,
        course_id: detail.course_id || prev.course_id,
        message: detail.message || prev.message
      }));
      setStatus('idle');
      setIsOpen(true);
    };

    window.addEventListener('open-enquiry-modal', handleOpenModal);
    return () => window.removeEventListener('open-enquiry-modal', handleOpenModal);
  }, []);

  // ── Automatic Popup Trigger Strategy ──
  // 1st popup after 5 seconds
  // Repeats for 3 times if dismissed
  // 3rd time is mandatory / persistent (cannot be closed until filled)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user submitted in current session
    if (sessionStorage.getItem('enquiry_submitted_session') === 'true') {
      return;
    }

    const count = parseInt(sessionStorage.getItem('enquiry_popup_count') || '0', 10);

    // If already at 3rd attempt, make persistent and open immediately
    if (count >= 3) {
      setIsPersistent(true);
      setIsOpen(true);
      return;
    }

    // 1st popup after 5 seconds
    const timer = setTimeout(() => {
      if (sessionStorage.getItem('enquiry_submitted_session') === 'true') return;

      const currentCount = parseInt(sessionStorage.getItem('enquiry_popup_count') || '0', 10) + 1;
      sessionStorage.setItem('enquiry_popup_count', String(currentCount));

      if (currentCount >= 3) {
        setIsPersistent(true);
      }
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    if (isPersistent) return; // Cannot close on 3rd attempt until filled

    setIsOpen(false);
    setStatus('idle');

    if (sessionStorage.getItem('enquiry_submitted_session') === 'true') return;

    const currentCount = parseInt(sessionStorage.getItem('enquiry_popup_count') || '1', 10);

    if (currentCount < 3) {
      // Schedule next popup after 12 seconds
      setTimeout(() => {
        if (sessionStorage.getItem('enquiry_submitted_session') === 'true') return;

        const nextCount = currentCount + 1;
        sessionStorage.setItem('enquiry_popup_count', String(nextCount));

        if (nextCount >= 3) {
          setIsPersistent(true);
        }
        setIsOpen(true);
      }, 12000);
    }
  }, [isPersistent]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isPersistent) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPersistent, handleClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!form.name.trim() || form.name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = form.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('sending');

    try {
      await api('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          phone: cleanPhone,
          university_id: form.university_id || null,
          course_id: form.course_id || null
        })
      });

      setStatus('success');
      sessionStorage.setItem('enquiry_submitted_session', 'true');
      setIsPersistent(false); // Form submitted, unlock
      setForm({
        name: '',
        phone: '',
        email: '',
        university_id: '',
        course_id: '',
        message: '',
        source: 'admission_guidance_popup'
      });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Unable to submit enquiry. Please call or WhatsApp us.');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!isPersistent) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div
        className={`modal-content ${isPersistent ? 'modal-persistent' : ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {!isPersistent && (
          <button
            className="modal-close"
            aria-label="Close modal"
            onClick={handleClose}
            type="button"
          >
            <X size={20} />
          </button>
        )}

        {status === 'success' ? (
          <div className="popup-success-card">
            <div className="popup-success-icon">
              <CheckCircle2 size={46} />
            </div>
            <h2>Guidance Request Received!</h2>
            <p>
              Thank you for reaching out. One of our dedicated distance education counsellors will contact you shortly to assist with courses, eligibility, and the admission procedure.
            </p>
            <div className="popup-success-actions">
              <button
                className="button button-primary"
                onClick={() => {
                  setIsOpen(false);
                  setStatus('idle');
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="contact-form modal-form" onSubmit={handleSubmit} noValidate>
            <div className="modal-header-wrap">
              <span className="section-kicker">Admission &amp; Course Guidance</span>
              <h2 id="enquiry-modal-title">Get Admission Guidance</h2>
              <p className="modal-subtitle">
                Connect with our independent student advisors for eligibility, course information, and application support.
              </p>
              {isPersistent && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '.74rem',
                  fontWeight: 600,
                  marginTop: 6
                }}>
                  <Lock size={12} /> Please fill this form to continue exploring programmes
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="form-alert-box error" role="alert">
                <AlertCircle size={17} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-grid">
              <label>
                Full Name *
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  autoFocus
                />
              </label>

              <label>
                Mobile Number *
                <input
                  required
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />
              </label>

              <label>
                Email Address (Optional)
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </label>

              <label>
                Interested University
                <select
                  name="university_id"
                  value={form.university_id}
                  onChange={handleChange}
                >
                  <option value="">Select university</option>
                  {universities.map(u => (
                    <option value={u.id} key={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>

              <label className="full">
                Interested Course
                <select
                  name="course_id"
                  value={form.course_id}
                  onChange={handleChange}
                >
                  <option value="">Select course</option>
                  {filteredCourses.map(c => (
                    <option value={c.id} key={c.id}>
                      {c.name} ({c.university?.name || 'University course'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="full">
                How can we help? (Optional)
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your educational background or questions regarding admissions..."
                  rows="3"
                />
              </label>
            </div>

            <div className="modal-actions-row">
              <button
                type="submit"
                className="button button-primary"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Submitting...' : 'Get Guidance'} <Send size={16} />
              </button>
              {!isPersistent && (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              )}
            </div>

            <p className="modal-privacy-note">
              🔒 Your contact information is kept secure and used exclusively for distance education guidance.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
