'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MessageCircle, GraduationCap, Instagram } from 'lucide-react';
import { api, triggerEnquiryModal } from '../lib/api';
import EnquiryModal from './EnquiryModal';

const links = [
  ['Home', '/'],
  ['Courses', '/courses'],
  ['Student Services', '/student-services'],
  ['Notifications', '/notifications'],
  ['Gallery', '/gallery'],
  ['About Us', '/about'],
  ['Contact', '/contact']
];

const fallback = {
  institution_name: 'Major Educational Institution',
  logo: '/major-educational-institution-logo.jpeg',
  phone: '+91 94424 08960',
  whatsapp: '919442408960',
  email: 'majoreducationalstudycentre@gmail.com',
  address: '161, Town Hall 1st St, opposite Government Hospital, Arakkonam, Tamil Nadu 631001, India',
  working_hours: 'Mon–Sat, 9:30 AM – 6:30 PM',
  instagram: 'major_educational_instutition'
};

function Brand({ settings }) {
  return (
    <>
      <span className="brand-mark">
        {settings.logo ? (
          <img src={settings.logo} alt={`${settings.institution_name} logo`} />
        ) : (
          <GraduationCap size={23} />
        )}
      </span>
      <span>
        {settings.institution_name}
        <small>Distance education guidance</small>
      </span>
    </>
  );
}

export default function SiteChrome({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(fallback);
  const pathname = usePathname();

  useEffect(() => {
    api('/settings')
      .then(data => setSettings(current => ({ ...current, ...data })))
      .catch(() => {});
  }, []);

  if (pathname.startsWith('/admin')) {
    return children;
  }

  const whatsapp = `https://wa.me/${String(settings.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I need distance education guidance.')}`;

  const handleOpenGuidance = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    triggerEnquiryModal();
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="brand" href="/">
            <Brand settings={settings} />
          </Link>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={pathname === href ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <button
              className="nav-cta"
              onClick={handleOpenGuidance}
              type="button"
            >
              Get Admission Guidance
            </button>
          </nav>
          <button
            className="menu-button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main>{children}</main>

      <footer>
        <div className="container footer-grid">
          <div>
            <Link className="brand light" href="/">
              <Brand settings={settings} />
            </Link>
            <p>
              Helping students make informed distance education choices with clear, reliable guidance and ongoing support.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            {links.slice(1).map(([label, href]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>
          <div>
            <h3>Talk to us</h3>
            <a href={`tel:${settings.phone}`}>
              <Phone size={15} /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
            {(settings.instagram || fallback.instagram) && (
              <a
                href={`https://instagram.com/${settings.instagram || fallback.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={15} /> @{settings.instagram || fallback.instagram}
              </a>
            )}
          </div>
        </div>
        <div className="container footer-bottom">
          © {new Date().getFullYear()} {settings.institution_name}. Independent student guidance service; university names are used for informational purposes only.
        </div>
      </footer>

      <a
        className="whatsapp-float"
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={23} />
      </a>

      <EnquiryModal />
    </>
  );
}
