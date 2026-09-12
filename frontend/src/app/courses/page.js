'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../../lib/api';
import { fallbackCourses, fallbackUniversities } from '../../lib/content';
import CourseCard from '../../components/CourseCard';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialUniversity = searchParams.get('university') || '';

  const [courses, setCourses] = useState(fallbackCourses);
  const [universities, setUniversities] = useState(fallbackUniversities);
  const [filters, setFilters] = useState({
    university: initialUniversity,
    level: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    if (initialUniversity) {
      setFilters(prev => ({ ...prev, university: initialUniversity }));
    }
  }, [initialUniversity]);

  useEffect(() => {
    api('/courses')
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length) setCourses(list);
      })
      .catch(() => {});

    api('/universities')
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || [];
        if (list.length) setUniversities(list);
      })
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    return [...new Set(courses.map(item => item.category).filter(Boolean))];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(course => {
      const uniId = course.university?.id || course.university_id;
      const matchesUni = !filters.university || String(uniId) === filters.university;
      const matchesLevel = !filters.level || course.level === filters.level;
      const matchesCategory = !filters.category || course.category === filters.category;
      const matchesSearch = !filters.search ||
        `${course.name} ${course.description}`.toLowerCase().includes(filters.search.toLowerCase());
      return matchesUni && matchesLevel && matchesCategory && matchesSearch;
    });
  }, [courses, filters]);

  const set = (key, value) => setFilters(current => ({ ...current, [key]: value }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">Course guidance</p>
          <h1>Explore distance education courses</h1>
          <p>Compare programme levels, eligibility and universities before you make your next move.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filters">
            <div className="search-field">
              <Search size={18} />
              <input
                value={filters.search}
                onChange={event => set('search', event.target.value)}
                placeholder="Search course name or keyword"
              />
            </div>

            <div className="filter-field">
              <SlidersHorizontal size={16} />
              <select
                value={filters.university}
                onChange={event => set('university', event.target.value)}
              >
                <option value="">All universities</option>
                {universities.map(item => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filters.level}
              onChange={event => set('level', event.target.value)}
            >
              <option value="">All levels</option>
              {['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate'].map(value => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={event => set('category', event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map(value => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          <p className="results-count">
            {filtered.length} course{filtered.length === 1 ? '' : 's'} available
          </p>

          <div className="course-grid">
            {filtered.map(course => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>

          {!filtered.length && (
            <div className="empty-state">
              No courses match these filters. Try changing your selection or contact us for help.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container">Loading courses...</div></div>}>
      <CoursesContent />
    </Suspense>
  );
}
