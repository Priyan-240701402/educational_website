'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock, GraduationCap } from 'lucide-react';
import { triggerEnquiryModal } from '../lib/api';

export default function CourseCard({ course }) {
  const university = course.university?.name || 'Supported University';

  const handleGetGuidance = (e) => {
    e.preventDefault();
    triggerEnquiryModal({
      university_id: course.university?.id || course.university_id,
      course_id: course.id,
      message: `I am interested in learning more about ${course.name} from ${university}.`
    });
  };

  return (
    <article className="course-card">
      <div className="card-top">
        <span className="eyebrow">{course.level}</span>
        <span className="course-category">{course.category}</span>
      </div>

      <h3>{course.name}</h3>
      <p className="university">
        <GraduationCap size={15} />
        {university}
      </p>

      <div className="course-meta">
        <span>
          <Clock size={14} /> {course.duration}
        </span>
        <span className="meta-eligibility">
          <strong>Eligibility:</strong> {course.eligibility}
        </span>
      </div>

      <p className="course-description">{course.description}</p>

      <div className="card-actions">
        <Link href={`/courses/${course.slug || course.id}`} className="inline-link">
          View Details <ArrowUpRight size={15} />
        </Link>
        <button
          type="button"
          onClick={handleGetGuidance}
          className="card-guidance-btn"
        >
          Get Guidance
        </button>
      </div>
    </article>
  );
}
