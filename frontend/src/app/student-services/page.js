'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, ClipboardCheck, FileText, GraduationCap, Trophy } from 'lucide-react';
import { api } from '../../lib/api';
import { fallbackNotifications, services } from '../../lib/content';

const serviceIcons = [GraduationCap, CalendarDays, FileText, ClipboardCheck, Trophy, FileText];

export default function StudentServices() {
  const [notifications, setNotifications] = useState(fallbackNotifications);

  useEffect(() => {
    api('/notifications?limit=6')
      .then(data => {
        if (Array.isArray(data) && data.length) setNotifications(data);
        else if (data?.data && Array.isArray(data.data) && data.data.length) setNotifications(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">Student support</p>
          <h1>Support for every stage of your learning journey</h1>
          <p>From course discovery to academic updates, we make important information easier to navigate.</p>
        </div>
      </section>

      <section className="section">
        <div className="container service-layout">
          <div className="service-list">
            {services.map(([title, description], index) => {
              const Icon = serviceIcons[index] || GraduationCap;
              return (
                <article className="service-detail" key={title}>
                  <span><Icon size={24} /></span>
                  <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    {index === 0 && (
                      <ul>
                        <li>Understand eligibility and document requirements</li>
                        <li>Receive step-by-step application support</li>
                        <li>Get help selecting a suitable course</li>
                      </ul>
                    )}
                    {index === 1 && (
                      <ul>
                        <li>Exam date and timetable reminders</li>
                        <li>Official examination announcements</li>
                      </ul>
                    )}
                    {index === 2 && (
                      <ul>
                        <li>Hall ticket availability guidance</li>
                        <li>Official portal instructions</li>
                      </ul>
                    )}
                    {index === 3 && (
                      <ul>
                        <li>Assignment submission announcements</li>
                        <li>Deadline reminders</li>
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="support-aside">
            <p className="section-kicker">Current updates</p>
            {notifications.slice(0, 4).map(item => (
              <div key={item.id}>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
              </div>
            ))}
            <Link href="/notifications">
              See all notifications <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
