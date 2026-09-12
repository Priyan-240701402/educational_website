export const fallbackUniversities = [
  { id: 'alagappa', name: 'Alagappa University', location: 'Karaikudi, Tamil Nadu', description: 'Guidance for flexible undergraduate, postgraduate, diploma and certificate options through distance education.', courses: 'MBA, B.Com, B.A., M.Com', status: true, logo: '/images/alagappa-logo.png' },
  { id: 'madras', name: 'University of Madras', location: 'Chennai, Tamil Nadu', description: 'Course and admission support for eligible distance learners looking to continue their education.', courses: 'BBA, BCA, M.A., M.Sc.', status: true, logo: '/images/madras-logo.jpg' },
];

export const fallbackCourses = [
  { id: 'mba', name: 'Master of Business Administration', university: fallbackUniversities[0], level: 'Postgraduate', category: 'Management', duration: '2 Years', eligibility: 'Bachelor degree from a recognised university', description: 'A flexible programme for professionals looking to build strategic business and leadership skills.', status: true },
  { id: 'bcom', name: 'Bachelor of Commerce', university: fallbackUniversities[0], level: 'Undergraduate', category: 'Commerce', duration: '3 Years', eligibility: '10+2 or equivalent from a recognised board', description: 'Build foundational skills in accounting, finance and business operations.', status: true },
  { id: 'bca', name: 'Bachelor of Computer Applications', university: fallbackUniversities[1], level: 'Undergraduate', category: 'Computer Applications', duration: '3 Years', eligibility: '10+2 or equivalent; mathematics preference may apply', description: 'Develop programming, software and information technology foundations.', status: true },
  { id: 'mcom', name: 'Master of Commerce', university: fallbackUniversities[1], level: 'Postgraduate', category: 'Commerce', duration: '2 Years', eligibility: 'Bachelor degree in a relevant discipline', description: 'Advance your knowledge of finance, taxation and business research.', status: true },
];

export const fallbackNotifications = [
  { id: 'n1', title: 'Admissions open for the new academic session', type: 'Admission', university: fallbackUniversities[0], description: 'Contact our guidance team to understand available programmes, eligibility and document requirements.', important: true, published_at: '2026-09-01' },
  { id: 'n2', title: 'Term-end examination timetable guidance', type: 'Examination', university: fallbackUniversities[1], description: 'Students should verify the official university timetable and prepare their examination plan.', important: false, published_at: '2026-08-28' },
  { id: 'n3', title: 'Assignment submission reminder', type: 'Assignment', university: fallbackUniversities[0], description: 'Check course-specific instructions and submit assignments within the university deadline.', important: false, published_at: '2026-08-21' },
];

export const services = [
  ['Admission Assistance', 'Eligibility, document checklist, deadlines and application guidance.'],
  ['Examination Updates', 'Timetable announcements, examination dates and instructions.'],
  ['Hall Ticket Updates', 'Clear instructions for accessing official hall tickets.'],
  ['Assignment Information', 'Submission reminders and course-specific guidance.'],
  ['Results Updates', 'Result release notices and next-step support.'],
  ['University Notifications', 'Important academic updates from supported universities.'],
];
