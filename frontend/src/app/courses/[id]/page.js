'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  Building2,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { api, triggerEnquiryModal } from '../../../lib/api';

export default function CourseDetail({ params }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/courses/${params.id}`)
      .then(data => setCourse(data))
      .catch(err => console.error('Error fetching course detail:', err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <section className="section">
        <div className="container detail">
          <p>Loading course details...</p>
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="section">
        <div className="container detail">
          <Link className="back-link" href="/courses">
            <ArrowLeft size={16} /> Back to courses
          </Link>
          <h2>Course not found</h2>
          <p>The requested course could not be located. Please browse our active course directory.</p>
        </div>
      </section>
    );
  }

  const handleOpenGuidance = (e) => {
    e.preventDefault();
    triggerEnquiryModal({
      university_id: course.university?.id || course.university_id,
      course_id: course.id,
      message: `I need admission guidance for ${course.name} from ${course.university?.name || 'the university'}.`
    });
  };

  return (
    <section className="section">
      <div className="container detail">
        <Link className="back-link" href="/courses">
          <ArrowLeft size={16} /> Back to courses
        </Link>

        <p className="section-kicker">
          {course.level} · {course.category}
        </p>
        <h1>{course.name}</h1>

        <p className="course-university-name">
          <GraduationCap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          {course.university?.name || 'Recognised Distance University'}
        </p>

        <p className="detail-intro">{course.description}</p>

        <div className="detail-grid">
          <article>
            <h2>Programme overview</h2>
            <dl>
              <dt>Duration</dt>
              <dd>{course.duration}</dd>

              <dt>Eligibility Requirement</dt>
              <dd>{course.eligibility}</dd>

              <dt>University / Institution</dt>
              <dd>{course.university?.name || 'Distance Education'}</dd>

              {course.admission_info && (
                <>
                  <dt>Admission Cycle &amp; Information</dt>
                  <dd>{course.admission_info}</dd>
                </>
              )}

              {course.official_source && (
                <>
                  <dt>Official Source Reference</dt>
                  <dd className="detail-source-row">
                    <ShieldCheck size={16} color="#16a96e" />
                    <span>{course.official_source}</span>
                    {course.source_url && (
                      <a
                        href={course.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-ext-link"
                      >
                        Official Website <ExternalLink size={13} />
                      </a>
                    )}
                  </dd>
                </>
              )}
            </dl>
          </article>

          <aside>
            <h2>Need admission guidance?</h2>
            <p>
              Our distance education counsellors can help you verify your eligibility, prepare documents, and complete application steps with ease.
            </p>

            <button
              type="button"
              className="button button-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleOpenGuidance}
            >
              Get Admission Guidance <Send size={15} />
            </button>

            <p className="aside-note">
              <CheckCircle2 size={16} /> Independent student support &amp; guidance service
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
