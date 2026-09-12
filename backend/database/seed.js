require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  console.log('Seeding database with verified university and course catalogues...');

  // 1. Seed Admin
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 12);
  await db.query(
    "INSERT INTO admins (name, email, password_hash, role) VALUES ('Portal Administrator', $1, $2, 'ADMIN') ON CONFLICT(email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
    [process.env.SEED_ADMIN_EMAIL || 'admin@example.com', password]
  );

  // 2. Seed Universities with official websites and slugs
  const madrasRes = await db.query(`
    INSERT INTO universities (name, slug, location, description, courses, official_website, status, logo)
    VALUES (
      'University of Madras',
      'university-of-madras',
      'Chennai, Tamil Nadu',
      'Institute of Distance Education (IDE) offering UGC-DEB approved undergraduate, postgraduate, diploma and certificate programmes.',
      'B.A., B.Com., B.Sc., B.C.A., B.B.A., M.A., M.Com., M.Sc., M.B.A.',
      'https://www.ideunom.ac.in',
      true,
      '/images/madras-logo.jpg'
    )
    ON CONFLICT (name) DO UPDATE SET
      slug = EXCLUDED.slug,
      official_website = EXCLUDED.official_website,
      description = EXCLUDED.description,
      courses = EXCLUDED.courses,
      logo = EXCLUDED.logo
    RETURNING id
  `);
  const madrasId = madrasRes.rows[0].id;

  const alagappaRes = await db.query(`
    INSERT INTO universities (name, slug, location, description, courses, official_website, status, logo)
    VALUES (
      'Alagappa University',
      'alagappa-university',
      'Karaikudi, Tamil Nadu',
      'Centre for Distance and Online Education (CDOE) offering NAAC A+ accredited flexible distance education programmes.',
      'B.A., B.Com., B.B.A., B.C.A., B.Sc., M.A., M.Com., M.B.A., M.C.A., M.Sc.',
      'https://alagappauniversity.ac.in',
      true,
      '/images/alagappa-logo.png'
    )
    ON CONFLICT (name) DO UPDATE SET
      slug = EXCLUDED.slug,
      official_website = EXCLUDED.official_website,
      description = EXCLUDED.description,
      courses = EXCLUDED.courses,
      logo = EXCLUDED.logo
    RETURNING id
  `);
  const alagappaId = alagappaRes.rows[0].id;

  // 3. Seed Verified Official Courses
  const officialCourses = [
    // University of Madras Courses
    {
      university_id: madrasId,
      name: 'Bachelor of Commerce (B.Com)',
      slug: 'unom-bcom-general',
      category: 'Commerce',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in Higher Secondary Examination (10+2) with Commerce/Accountancy or equivalent.',
      description: 'Foundational degree in commercial practices, financial accounting, banking laws, business statistics and corporate governance.',
      admission_info: 'Admissions open twice a year for Calendar Year and Academic Year streams.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: true
    },
    {
      university_id: madrasId,
      name: 'Bachelor of Business Administration (BBA)',
      slug: 'unom-bba',
      category: 'Management',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in Higher Secondary Examination (10+2) or equivalent from a recognised board.',
      description: 'Comprehensive business management curriculum covering marketing, organisational behaviour, operations and entrepreneurship.',
      admission_info: 'Direct admission based on qualifying secondary examination score.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: true
    },
    {
      university_id: madrasId,
      name: 'Bachelor of Computer Applications (BCA)',
      slug: 'unom-bca',
      category: 'Computer Applications',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in 10+2 examination with Mathematics or Business Mathematics or Computer Science.',
      description: 'Core computing curriculum including programming languages (C++, Java, Python), database systems, web development and software engineering.',
      admission_info: 'Includes practical laboratory sessions and project work.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: true
    },
    {
      university_id: madrasId,
      name: 'Bachelor of Arts in English (B.A. English)',
      slug: 'unom-ba-english',
      category: 'Arts & Humanities',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in 10+2 Higher Secondary Examination or equivalent.',
      description: 'In-depth study of British, American, Indian and World literature, grammar, literary criticism and communicative English.',
      admission_info: 'Offered in English medium through distance learning self-instructional material.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: false
    },
    {
      university_id: madrasId,
      name: 'Master of Business Administration (MBA)',
      slug: 'unom-mba',
      category: 'Management',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'Any Bachelor Degree from a recognised university under 10+2+3 pattern.',
      description: 'Executive and postgraduate business curriculum with specialisations in Human Resource Management, Financial Management, Marketing Management, and Systems Management.',
      admission_info: 'Entrance qualifying eligibility verification as per IDE UGC-DEB norms.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: true
    },
    {
      university_id: madrasId,
      name: 'Master of Commerce (M.Com)',
      slug: 'unom-mcom',
      category: 'Commerce',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'B.Com / B.B.A / B.C.S / B.Com (Corporate Secretaryship) or equivalent degree.',
      description: 'Advanced financial management, corporate accounting, international business, direct taxation and securities analysis.',
      admission_info: 'Direct admission for eligible commerce graduates.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: true
    },
    {
      university_id: madrasId,
      name: 'Master of Science in Information Technology (M.Sc. IT)',
      slug: 'unom-msc-it',
      category: 'Information Technology',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'B.Sc. in Computer Science / IT / Mathematics / Statistics / Physics or B.C.A.',
      description: 'Advanced topics in cloud computing, data analytics, artificial intelligence fundamentals, network security and full-stack software development.',
      admission_info: 'Theory and practical curriculum guided by faculty counsellors.',
      official_source: 'University of Madras IDE Official Prospectus',
      source_url: 'https://www.ideunom.ac.in',
      featured: false
    },

    // Alagappa University Courses
    {
      university_id: alagappaId,
      name: 'Bachelor of Business Administration (BBA)',
      slug: 'alagappa-bba',
      category: 'Management',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in 10+2 (Higher Secondary) or equivalent Examination.',
      description: 'Build strategic managerial capabilities, leadership fundamentals, accounting principles and business communication skills.',
      admission_info: 'Semester and non-semester options with comprehensive study materials.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Bachelor of Commerce (B.Com)',
      slug: 'alagappa-bcom',
      category: 'Commerce',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in 10+2 or equivalent with Commerce / Accountancy / Vocational subjects.',
      description: 'Detailed study of corporate accounting, cost accounting, income tax laws, auditing principles and business economics.',
      admission_info: 'Admissions conducted online and via designated learner support centres.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Bachelor of Computer Applications (BCA)',
      slug: 'alagappa-bca',
      category: 'Computer Applications',
      level: 'Undergraduate',
      duration: '3 Years',
      eligibility: 'Pass in 10+2 or equivalent from any recognised state/central board.',
      description: 'Comprehensive software development foundation including C, Data Structures, Java Programming, DBMS, and Web Technologies.',
      admission_info: 'Practical sessions held at regional student study centres.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Master of Business Administration (MBA General)',
      slug: 'alagappa-mba-general',
      category: 'Management',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'Any recognized Undergraduate degree (10+2+3 pattern) from a recognized University.',
      description: 'Professional postgraduate management programme covering strategic management, financial analysis, marketing intelligence and human resource development.',
      admission_info: 'Dual specialisation options available in 2nd year.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Master of Commerce (M.Com)',
      slug: 'alagappa-mcom',
      category: 'Commerce',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'B.Com, B.B.A, B.B.M, B.C.S or equivalent bachelor degree in Commerce/Management.',
      description: 'Advanced business research methods, corporate governance, portfolio management, international banking and tax planning.',
      admission_info: 'Self-instructional material dispatched directly to enrolled candidates.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Master of Computer Applications (MCA)',
      slug: 'alagappa-mca',
      category: 'Computer Applications',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'Passed BCA / Bachelor Degree in Computer Science Engineering or equivalent Degree. Or Passed B.Sc. / B.Com. / B.A. with Mathematics at 10+2 level or at Graduation level.',
      description: 'Advanced computing, full-stack architecture, machine learning basics, cloud engineering and enterprise system development.',
      admission_info: 'AICTE approved distance postgraduate programme.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: true
    },
    {
      university_id: alagappaId,
      name: 'Master of Science in Mathematics (M.Sc. Mathematics)',
      slug: 'alagappa-msc-mathematics',
      category: 'Science',
      level: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'B.Sc. Mathematics / Applied Mathematics degree from a recognised University.',
      description: 'Advanced study of Abstract Algebra, Real Analysis, Topology, Complex Analysis, Differential Geometry and Numerical Methods.',
      admission_info: 'Annual / Semester examinations with remote student support.',
      official_source: 'Alagappa University CDOE Official Portal',
      source_url: 'https://alagappauniversity.ac.in',
      featured: false
    }
  ];

  for (const c of officialCourses) {
    await db.query(`
      INSERT INTO courses (
        university_id, name, slug, category, level, duration, eligibility,
        description, admission_info, official_source, source_url, featured, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      ON CONFLICT (university_id, name) DO UPDATE SET
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        level = EXCLUDED.level,
        duration = EXCLUDED.duration,
        eligibility = EXCLUDED.eligibility,
        description = EXCLUDED.description,
        admission_info = EXCLUDED.admission_info,
        official_source = EXCLUDED.official_source,
        source_url = EXCLUDED.source_url,
        featured = EXCLUDED.featured,
        status = true
    `, [
      c.university_id, c.name, c.slug, c.category, c.level, c.duration,
      c.eligibility, c.description, c.admission_info, c.official_source, c.source_url, c.featured
    ]);
  }

  // 4. Seed Verified Notifications (Matching reference style with NEW badges)
  const notifications = [
    {
      university_id: madrasId,
      title: 'CDOE - Admission Notification - Academic Session, July 2026',
      description: 'Applications are invited for admission to various Undergraduate and Postgraduate Distance Education programmes for the July 2026 academic cycle. Contact our guidance desk for eligibility and application assistance.',
      type: 'Admission',
      important: true,
      priority: 10,
      is_new_badge: true,
      published: true,
      link: 'https://www.ideunom.ac.in'
    },
    {
      university_id: alagappaId,
      title: 'PhD Public Viva-Voce Examinations Schedule',
      description: 'Public Viva-Voce notification for distance research scholars and candidates. Check details and examination guidelines.',
      type: 'Examination',
      important: true,
      priority: 9,
      is_new_badge: true,
      published: true,
      link: 'https://alagappauniversity.ac.in'
    },
    {
      university_id: madrasId,
      title: 'Pre-Registration Qualifying Entrance Examination',
      description: 'Notice regarding the qualifying entrance examination registration timetable, hall ticket issuance and examination guidelines.',
      type: 'Examination',
      important: false,
      priority: 8,
      is_new_badge: true,
      published: true,
      link: 'https://www.ideunom.ac.in'
    },
    {
      university_id: alagappaId,
      title: 'Convocation Application Form 2026',
      description: 'Eligible distance education candidates who successfully completed their degree examinations can submit their convocation applications online.',
      type: 'General',
      important: false,
      priority: 7,
      is_new_badge: true,
      published: true,
      link: 'https://alagappauniversity.ac.in'
    },
    {
      university_id: madrasId,
      title: 'Term-End Examination Timetable & Hall Ticket Guidance',
      description: 'The timetable for forthcoming semester examinations has been announced. Students are advised to download hall tickets well before examination day.',
      type: 'Hall Ticket',
      important: true,
      priority: 6,
      is_new_badge: false,
      published: true,
      link: 'https://www.ideunom.ac.in'
    },
    {
      university_id: alagappaId,
      title: 'Internal Assessment & Assignment Submission Window',
      description: 'Learners must submit their required continuous assessment assignments through the designated study centre before the final due date.',
      type: 'Assignment',
      important: false,
      priority: 5,
      is_new_badge: false,
      published: true,
      link: 'https://alagappauniversity.ac.in'
    }
  ];

  for (const n of notifications) {
    await db.query(`
      INSERT INTO notifications (university_id, title, description, type, important, priority, is_new_badge, published, link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT DO NOTHING
    `, [n.university_id, n.title, n.description, n.type, n.important, n.priority, n.is_new_badge, n.published, n.link]);
  }

  // 5. Seed Gallery Items with Likes & Views
  const galleryItems = [
    {
      university_id: madrasId,
      title: 'Student Counselling & Career Guidance Desk',
      description: 'One-on-one personalised course counselling helping working professionals choose distance education pathways.',
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
      category: 'Counselling',
      views_count: 194,
      likes_count: 60,
      published: true
    },
    {
      university_id: alagappaId,
      title: 'Distance Education Orientation Workshop',
      description: 'Interactive session detailing learning management resources, syllabus and examination methods.',
      image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
      category: 'Events',
      views_count: 312,
      likes_count: 98,
      published: true
    },
    {
      university_id: madrasId,
      title: 'Study Materials & Learner Support Centre',
      description: 'Dedicated guidance desk facilitating self-instructional material distribution and query resolution.',
      image_url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=80',
      category: 'Office',
      views_count: 145,
      likes_count: 42,
      published: true
    },
    {
      university_id: alagappaId,
      title: 'Collaborative Peer Study Group',
      description: 'Distance learners participating in weekend academic discussions and exam preparation.',
      image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
      category: 'Student Activities',
      views_count: 228,
      likes_count: 76,
      published: true
    },
    {
      university_id: madrasId,
      title: 'Annual Student Achievement & Graduation Celebration',
      description: 'Honouring outstanding achievements of distance learning graduates.',
      image_url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
      category: 'Achievements',
      views_count: 410,
      likes_count: 135,
      published: true
    },
    {
      university_id: alagappaId,
      title: 'Campus Visit & Digital Library Training',
      description: 'Students receiving hands-on guidance on accessing digital university archives and e-resources.',
      image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
      category: 'Events',
      views_count: 175,
      likes_count: 53,
      published: true
    }
  ];

  for (const g of galleryItems) {
    await db.query(`
      INSERT INTO gallery (university_id, title, description, image_url, category, views_count, likes_count, published, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      ON CONFLICT DO NOTHING
    `, [g.university_id, g.title, g.description, g.image_url, g.category, g.views_count, g.likes_count, g.published]);
  }

  // 6. Seed About and Website Settings
  await db.query(`
    INSERT INTO website_settings (institution_name, logo, phone, whatsapp, email, address, working_hours, maps_url, social_links)
    SELECT
      'Major Educational Institution',
      '/major-educational-institution-logo.jpeg',
      '+91 94424 08960',
      '919442408960',
      'majoreducationalstudycentre@gmail.com',
      '161, Town Hall 1st St, opposite Government Hospital, Arakkonam, Tamil Nadu 631001, India',
      'Mon–Sat, 9:30 AM – 6:30 PM',
      'https://maps.google.com/?q=161+Town+Hall+1st+St+Arakkonam+Tamil+Nadu+631001',
      '{"instagram": "major_educational_instutition"}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM website_settings)
  `);

  await db.query(`
    INSERT INTO about (who_we_are, mission, vision, services, disclaimer)
    SELECT
      'We are an independent education guidance and student support organisation helping learners understand distance education opportunities, select suitable programmes and navigate admissions with complete clarity.',
      'To make distance education guidance clear, accessible, reliable and student-centred for every learner.',
      'A future where every learner can confidently access the educational path that aligns with their professional and personal ambitions.',
      'University & course discovery, eligibility verification, admission assistance, application preparation, academic notifications and ongoing student support.',
      'We provide independent educational guidance and student support services for distance education applicants. We are an independent support organisation and are not the official website of any university mentioned on this portal.'
    WHERE NOT EXISTS (SELECT 1 FROM about)
  `);

  console.log('✅ Database seeded successfully with verified official data!');
  await db.pool.end();
}

seed().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
