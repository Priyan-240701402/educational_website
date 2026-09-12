'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Filter,
  GraduationCap,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { api } from '../../lib/api';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ university: '', type: '', date: '' });
  const [activeModalNotice, setActiveModalNotice] = useState(null);

  useEffect(() => {
    Promise.all([
      api('/notifications'),
      api('/universities')
    ])
      .then(([notes, unis]) => {
        const noteList = Array.isArray(notes) ? notes : notes?.data || [];
        const uniList = Array.isArray(unis) ? unis : unis?.data || [];
        setItems(noteList);
        setUniversities(uniList);
      })
      .catch(err => console.error('Error fetching notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const uniId = item.university?.id || item.university_id;
      const matchesUni = !filters.university || String(uniId) === filters.university;
      const matchesType = !filters.type || item.type === filters.type;
      const matchesDate = !filters.date || item.published_at?.startsWith(filters.date);
      return matchesUni && matchesType && matchesDate;
    });
  }, [items, filters]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">Academic updates</p>
          <h1>Notifications &amp; Important Reminders</h1>
          <p>
            Stay updated on admission schedules, examination timetables, hall tickets, assignment submission deadlines, and results.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filters Bar */}
          <div className="filters notification-filters">
            <span>
              <Filter size={17} /> Filter updates
            </span>
            <select
              value={filters.university}
              onChange={e => setFilters({ ...filters, university: e.target.value })}
            >
              <option value="">All universities</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All types</option>
              {['Admission', 'Examination', 'Hall Ticket', 'Assignment', 'Results', 'General'].map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <input
              type="month"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            />
          </div>

          <p className="results-count">
            {filtered.length} notification{filtered.length === 1 ? '' : 's'} found
          </p>

          {/* List */}
          <div className="notification-list">
            {filtered.map(item => (
              <article
                className={`notification-list-item ${item.important ? 'important' : ''}`}
                key={item.id}
                onClick={() => setActiveModalNotice(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notification-icon">
                  <Calendar size={20} />
                </div>

                <div className="notification-copy">
                  <div className="notice-chip-row">
                    <span className="type-chip">{item.type}</span>
                    {item.is_new_badge && (
                      <span className="badge-new inline-badge">
                        <span className="red-dot"></span> NEW
                      </span>
                    )}
                    {item.important && <span className="important-chip">Important</span>}
                  </div>

                  <h2>{item.title}</h2>
                  <p>{item.description}</p>

                  <small>
                    {item.university?.name || 'General update'} · {item.published_at ? new Date(item.published_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : ''}
                  </small>
                </div>

                {(item.link || item.attachment) && (
                  <a
                    className="attachment-link"
                    href={item.link || item.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    View Official Notice <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>

          {!filtered.length && !loading && (
            <div className="empty-state">
              <p>No notifications match your selected filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NOTIFICATION MODAL DETAIL ── */}
      {activeModalNotice && (
        <div className="modal-overlay" onClick={() => setActiveModalNotice(null)}>
          <div className="modal-content notice-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label="Close modal"
              onClick={() => setActiveModalNotice(null)}
            >
              <X size={20} />
            </button>

            <div className="notice-modal-header">
              <div>
                <span className="type-chip">{activeModalNotice.type}</span>
                {activeModalNotice.is_new_badge && (
                  <span className="badge-new inline-badge">
                    <span className="red-dot"></span> NEW
                  </span>
                )}
              </div>
              <span className="notice-modal-date">
                {activeModalNotice.published_at ? new Date(activeModalNotice.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) : ''}
              </span>
            </div>

            <h2>{activeModalNotice.title}</h2>
            {activeModalNotice.university?.name && (
              <p className="notice-modal-uni">
                <GraduationCap size={15} /> {activeModalNotice.university.name}
              </p>
            )}

            <div className="notice-modal-body">
              <p>{activeModalNotice.description}</p>
            </div>

            {(activeModalNotice.link || activeModalNotice.attachment) && (
              <div className="notice-modal-actions">
                <a
                  href={activeModalNotice.link || activeModalNotice.attachment}
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
