'use client';

import { useEffect, useState, useMemo } from 'react';
import { Clock3, Instagram, Mail, MapPin, MessageCircle, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

const settingsFallback = {
  institution_name: 'Major Educational Institution',
  logo: '/major-educational-institution-logo.jpeg',
  phone: '+91 94424 08960',
  whatsapp: '919442408960',
  email: 'majoreducationalstudycentre@gmail.com',
  address: '161, Town Hall 1st St, opposite Government Hospital, Arakkonam, Tamil Nadu 631001, India',
  working_hours: 'Mon–Sat, 9:30 AM – 6:30 PM',
  maps_url: 'https://maps.google.com/?q=161+Town+Hall+1st+St+Arakkonam+Tamil+Nadu+631001',
  instagram: 'major_educational_instutition'
};

export default function ContactPage() {
  const [settings, setSettings] = useState(settingsFallback);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', university_id: '', course_id: '', message: '', source: 'contact_page' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api('/settings').then(data => setSettings(current => ({ ...current, ...data }))).catch(() => {});
    api('/universities').then(data => Array.isArray(data) && setUniversities(data)).catch(() => {});
    api('/courses').then(data => {
      const list = Array.isArray(data) ? data : data?.data || [];
      setCourses(list);
    }).catch(() => {});
  }, []);

  const filteredCourses = useMemo(() => {
    if (!form.university_id) return courses;
    const target = String(form.university_id).toLowerCase().trim();
    const filtered = courses.filter(c => {
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
    return filtered.length ? filtered : courses;
  }, [form.university_id, courses]);

  const change = event => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!form.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = form.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setStatus('sending');
    try {
      await api('/enquiries', {
        method: 'POST',
        body: JSON.stringify({ ...form, phone: cleanPhone })
      });
      setStatus('success');
      setForm({ name: '', phone: '', email: '', university_id: '', course_id: '', message: '', source: 'contact_page' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'We could not submit this right now. Please call or WhatsApp us.');
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="section-kicker">Contact us</p>
          <h1>Let&apos;s talk about your next step</h1>
          <p>Share your question and our distance education guidance team will get back to you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-details">
            <p className="section-kicker">Reach our team</p>
            <h2>Get clear, student-friendly guidance</h2>
            <p>
              We can help you explore courses, understand eligibility requirements, and guide you through each stage of your admission.
            </p>

            <a href={`tel:${settings.phone}`}>
              <Phone />
              <span>
                <b>Call / Mobile Guidance</b>
                {settings.phone}
              </span>
            </a>

            <a
              href={`https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle />
              <span>
                <b>Message on WhatsApp</b>
                Chat with our counsellors
              </span>
            </a>

            <a href={`mailto:${settings.email}`}>
              <Mail />
              <span>
                <b>Email us</b>
                {settings.email}
              </span>
            </a>

            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram />
                <span>
                  <b>Instagram</b>
                  @{settings.instagram}
                </span>
              </a>
            )}

            <div>
              <MapPin />
              <span>
                <b>Visit or write to us</b>
                {settings.address}
              </span>
            </div>

            <div>
              <Clock3 />
              <span>
                <b>Working hours</b>
                {settings.working_hours}
              </span>
            </div>
          </div>

          <form className="contact-form" onSubmit={submit} noValidate>
            <h2>Send an enquiry</h2>

            {errorMessage && (
              <div className="form-alert-box error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-grid">
              <label>
                Full Name *
                <input required name="name" value={form.name} onChange={change} placeholder="Your name" />
              </label>

              <label>
                Phone Number *
                <input required type="tel" name="phone" value={form.phone} onChange={change} placeholder="10-digit mobile number" />
              </label>

              <label>
                Email Address
                <input type="email" name="email" value={form.email} onChange={change} placeholder="name@example.com" />
              </label>

              <label>
                University
                <select name="university_id" value={form.university_id} onChange={change}>
                  <option value="">Select university</option>
                  {universities.map(u => (
                    <option value={u.id} key={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>

              <label className="full">
                Course
                <select name="course_id" value={form.course_id} onChange={change}>
                  <option value="">Select course</option>
                  {filteredCourses.map(c => (
                    <option value={c.id} key={c.id}>{c.name} ({c.university?.name || ''})</option>
                  ))}
                </select>
              </label>

              <label className="full">
                How can we help?
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={change}
                  placeholder="Tell us what programme or admission guidance you are looking for..."
                  rows="4"
                />
              </label>
            </div>

            <button className="button button-primary" disabled={status === 'sending'} type="submit">
              {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'} <Send size={15} />
            </button>

            {status === 'success' && (
              <p className="form-success" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
                <CheckCircle2 size={16} /> Thank you — your enquiry has been received. Our guidance team will contact you shortly.
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
