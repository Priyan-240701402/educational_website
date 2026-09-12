'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Headphones,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users,
  Compass,
  FileText
} from 'lucide-react';
import { api } from '../../lib/api';

const fallback = {
  who_we_are: 'We are an independent education guidance and student support organisation helping learners understand distance education opportunities, select suitable programmes and navigate admissions with complete clarity.',
  mission: 'To make distance education guidance clear, accessible, reliable and student-centred for every learner.',
  vision: 'To help every learner confidently choose and succeed in the right educational path that aligns with their personal and career ambitions.',
  services: 'University & course discovery, eligibility verification, admission assistance, application preparation, academic notifications and ongoing student support.',
  disclaimer: 'We provide independent educational guidance and student support services for distance education applicants. We are an independent support organisation and are not the official website of any university mentioned on this portal.'
};

const whatWeProvide = [
  {
    icon: Compass,
    title: 'University & Course Discovery',
    description: 'Explore approved distance education programmes from multiple accredited universities all in one place.'
  },
  {
    icon: FileCheck2,
    title: 'Eligibility Guidance',
    description: 'Detailed assessment of prior academic qualifications to ensure you meet official admission criteria.'
  },
  {
    icon: GraduationCap,
    title: 'Admission Assistance',
    description: 'Step-by-step guidance through enrollment cycles, intake schedules and university registration steps.'
  },
  {
    icon: FileText,
    title: 'Application Support',
    description: 'Hands-on help with form filling, application tracking and verifying requirements before submission.'
  },
  {
    icon: BookOpen,
    title: 'Distance Education Guidance',
    description: 'Clear explanations of syllabus structures, self-instructional material and remote learning methods.'
  },
  {
    icon: Headphones,
    title: 'Student Support',
    description: 'Continuous advisory support answering questions about hall tickets, assignments and timetables.'
  },
  {
    icon: ShieldCheck,
    title: 'Documentation Guidance',
    description: 'Checklists and instructions for preparing certificates, mark sheets, and transfer documents.'
  },
  {
    icon: Lightbulb,
    title: 'Course Selection Assistance',
    description: 'Unbiased programme recommendations aligned with your current profession and long-term career aspirations.'
  }
];

const whyChooseUs = [
  'Independent & Unbiased Guidance',
  'Student-Centered Personalised Support',
  'Multiple Recognised University Options',
  'Verified & Transparent Course Information',
  'Comprehensive Application Assistance',
  'Prompt & Responsive Communication Desk'
];

export default function AboutPage() {
  const [about, setAbout] = useState(fallback);

  useEffect(() => {
    api('/about')
      .then(data => setAbout(curr => ({ ...curr, ...data })))
      .catch(() => { });
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">About Our Service</p>
          <h1>Education guidance that puts students first</h1>
          <p>
            Clear information, unbiased guidance, and a supportive path toward your distance education goals.
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE & MISSION / VISION ── */}
      <section className="section">
        <div className="container">
          <div className="about-overview-grid">
            <article className="about-lead-card">
              <span className="section-kicker">Who We Are</span>
              <h2>A trusted, independent guide for distance education learners</h2>
              <p className="lead">{about.who_we_are}</p>
              <p>
                Navigating distance education admissions, differing university eligibility standards, and deadlines can often be overwhelming. Our organization bridges that gap by offering transparent, student-centric guidance tailored to working professionals, homemakers, and learners seeking upward career mobility.
              </p>
            </article>

            <div className="mission-vision-stack">
              <article className="mission-card">
                <div className="card-icon-badge">
                  <Target size={24} />
                </div>
                <h3>Our Mission</h3>
                <p>{about.mission}</p>
              </article>

              <article className="vision-card">
                <div className="card-icon-badge">
                  <Lightbulb size={24} />
                </div>
                <h3>Our Vision</h3>
                <p>{about.vision}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE PROVIDE ── */}
      <section className="section soft">
        <div className="container">
          <div className="section-heading centered">
            <p className="section-kicker">What We Provide</p>
            <h2>Comprehensive support for your learning journey</h2>
          </div>

          <div className="what-we-provide-grid">
            {whatWeProvide.map((item) => {
              const Icon = item.icon;
              return (
                <article className="provide-card" key={item.title}>
                  <div className="provide-icon-box">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── OUR ACHIEVEMENTS / PILLARS ── */}
      <section className="section achievements-section">
        <div className="container">
          <div className="section-heading centered light-text">
            <p className="section-kicker">Key Highlights</p>
            <h2>Dedicated to making education accessible</h2>
          </div>

          <div className="achievements-grid">
            <article className="achievement-card">
              <strong>Multiple</strong>
              <h4>Recognised Universities</h4>
              <p>Guidance for top state and central distance universities.</p>
            </article>

            <article className="achievement-card">
              <strong>100+</strong>
              <h4>Courses Explored</h4>
              <p>Undergraduate, Postgraduate, Diploma &amp; Professional degrees.</p>
            </article>

            <article className="achievement-card">
              <strong>Dedicated</strong>
              <h4>Student Counsellors</h4>
              <p>Personalised consultation for working professionals and learners.</p>
            </article>

            <article className="achievement-card">
              <strong>100%</strong>
              <h4>Student-Centred Support</h4>
              <p>Independent, transparent guidance from enrollment to graduation.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Why Choose Us</p>
              <h2>Empowering your decision with absolute clarity</h2>
            </div>
            <p>
              We are committed to delivering honest, verified, and accessible distance learning guidance.
            </p>
          </div>

          <div className="why-choose-grid">
            {whyChooseUs.map((reason) => (
              <div className="why-choose-card" key={reason}>
                <CheckCircle2 size={20} className="check-icon" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
