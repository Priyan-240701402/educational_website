import './globals.css';
import './branding.css';
import SiteChrome from '../components/SiteChrome';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: { default: 'Major Educational Institution | Student Guidance', template: '%s | Major Educational Institution' },
  description: 'Independent admission, course and student support guidance for distance education learners.',
  metadataBase: new URL('https://majoreducation.example'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
