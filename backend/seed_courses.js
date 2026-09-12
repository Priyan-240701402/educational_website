// seed_courses.js - Run: node seed_courses.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:12345@localhost:5432/mei_database' });

const madrasCourses = [
  // UG
  ['BA Sociology','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA French','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Historical Studies','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Economics','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA English','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Tamil','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Literature','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Public Administration','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Criminology and Police Administration','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['B.Sc. Mathematics','Undergraduate','Science','3 Years','Pass in 10+2 with Mathematics as one of the subjects.'],
  ['B.Sc. Psychology','Undergraduate','Science','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['B.Com General','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or equivalent.'],
  ['B.Com Corporate Secretaryship','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or equivalent.'],
  ['B.Com Bank Management','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or equivalent.'],
  ['B.Com Computer Applications','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or Computer Science.'],
  ['BBA Bachelor of Business Administration','Undergraduate','Management','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BCA Bachelor of Computer Applications','Undergraduate','Computer Applications','3 Years','Pass in 10+2 with Mathematics or Computer Science.'],
  ['BFA Music','Undergraduate','Fine Arts','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BSc Geography','Undergraduate','Science','3 Years','Pass in 10+2 with Science subjects.'],
  ['B.Ed Bachelor of Education','Undergraduate','Education','2 Years','Bachelor Degree with minimum 50% marks from a recognised University.'],
  ['Part I Tamil and Other Languages UG Common','Undergraduate','Languages','3 Years','Applicable to all UG students enrolled under language courses.'],
  ['Environmental Studies Programme UG','Undergraduate','Science','1 Year','Open to all undergraduate students as a supplementary course.'],
  ['Value Education UG','Undergraduate','Arts & Humanities','1 Year','Open to all undergraduate students as a supplementary course.'],
  ['UG Part-II English','Undergraduate','Languages','3 Years','Applicable to all UG students enrolled under English medium courses.'],
  // PG
  ['MA Historical Studies','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree in Arts from a recognised University.'],
  ['MA Economics','Postgraduate','Arts & Humanities','2 Years','B.A./B.Sc. Economics or equivalent from a recognised university.'],
  ['MA English','Postgraduate','Languages','2 Years','Bachelor Degree from a recognised University.'],
  ['MA Tamil','Postgraduate','Languages','2 Years','Bachelor Degree with Tamil from a recognised University.'],
  ['MA Political Science','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree in Arts from a recognised University.'],
  ['MA Public Administration','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MA Human Rights and Duties Education','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['M.Sc. Mathematics','Postgraduate','Science','2 Years','B.Sc. Mathematics or Applied Mathematics from a recognised University.'],
  ['M.Sc. Psychology','Postgraduate','Science','2 Years','B.A./B.Sc. Psychology or equivalent from a recognised University.'],
  ['M.Com Master of Commerce','Postgraduate','Commerce','2 Years','B.Com / B.B.A / B.C.S or equivalent degree from a recognised University.'],
  ['MBA Master of Business Administration','Postgraduate','Management','2 Years','Any Bachelor Degree from a recognised University under 10+2+3 pattern.'],
  ['MCA Master of Computer Applications','Postgraduate','Computer Applications','3 Years','B.Sc./B.Com./B.A./BCA with Mathematics at 10+2 or graduation level.'],
  ['MSc Cyber Forensics and Information Security','Postgraduate','Computer Science','2 Years','B.Sc./B.C.A./B.E./B.Tech. in relevant discipline from a recognised University.'],
  ['MSc Counselling Psychology','Postgraduate','Science','2 Years','Bachelor Degree in Psychology or related field from a recognised University.'],
  ['MSc IT Information Technology','Postgraduate','Information Technology','2 Years','B.Sc. IT/B.Sc. CS/BCA/B.E./B.Tech. from a recognised University.'],
  ['MFA Music','Postgraduate','Fine Arts','2 Years','BFA or equivalent degree from a recognised University.'],
  ['MSc Geography','Postgraduate','Science','2 Years','B.Sc. Geography from a recognised University.'],
  ['MA Christian Studies','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MA Journalism','Postgraduate','Arts & Humanities','2 Years','Bachelor Degree from a recognised University.'],
  ['MA Sociology','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MBA Business Data Analytics','Postgraduate','Management','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MA Applied Saiva Siddhanta','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MA Sanskrit','Postgraduate','Languages','2 Years','Bachelor Degree with Sanskrit from a recognised University.'],
  // Certificates
  ['Certificate in Online Teaching','Certificate','Education','6 Months','Any graduate or working professional.'],
  ['Certificate in Research Methods of Social Sciences','Certificate','Arts & Humanities','6 Months','Any graduate.'],
  ['Certificate in Management','Certificate','Management','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Karnatic Music','Certificate','Fine Arts','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Voice Training','Certificate','Fine Arts','6 Months','Open to all interested candidates.'],
  ['Certificate in Accounting and Auditing','Certificate','Commerce','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Corporate Social Responsibility','Certificate','Management','6 Months','Any graduate or working professional.'],
  ['Certificate in Taxation','Certificate','Commerce','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Written Tamil','Certificate','Languages','6 Months','Open to all interested candidates.'],
  ['Certificate in Indian Christianity','Certificate','Arts & Humanities','6 Months','Open to all interested candidates.'],
  ['Certificate in Christian Scriptures and Interpretation','Certificate','Arts & Humanities','6 Months','Open to all interested candidates.'],
  ['Certificate in Spoken Tamil','Certificate','Languages','6 Months','Open to all interested candidates.'],
  ['Certificate in Computer Applications','Certificate','Computer Applications','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in E-Commerce','Certificate','Commerce','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Library and Information Science','Certificate','Arts & Humanities','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  // Diplomas
  ['Diploma in Labour Law','Diploma','Law','1 Year','Any Bachelor Degree from a recognised University.'],
  ['Diploma in Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Information Security and Cyber Law','Diploma','Computer Science','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Hospital Management','Diploma','Management','1 Year','Any Bachelor Degree from a recognised University.'],
  ['Diploma in Human Resource Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Financial Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Accounting and Finance','Diploma','Commerce','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Logistics Supply Chain Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Taxation Finance and Investment','Diploma','Commerce','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Marketing Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Teaching Methodology in Music','Diploma','Education','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Systems Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in School Management','Diploma','Education','1 Year','Any Bachelor Degree from a recognised University.'],
  ['Diploma in Intellectual Property Rights','Diploma','Law','1 Year','Any Bachelor Degree from a recognised University.'],
];

const alagappaCourses = [
  // UG
  ['BA Tamil','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA English','Undergraduate','Languages','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA History','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Economics','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BA Public Administration','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BSc Mathematics','Undergraduate','Science','3 Years','Pass in 10+2 with Mathematics as one of the main subjects.'],
  ['BSc Physics','Undergraduate','Science','3 Years','Pass in 10+2 with Physics as one of the main subjects.'],
  ['BSc Chemistry','Undergraduate','Science','3 Years','Pass in 10+2 with Chemistry as one of the main subjects.'],
  ['BSc Computer Science','Undergraduate','Computer Science','3 Years','Pass in 10+2 with Mathematics/Computer Science.'],
  ['B.Com General','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or Accountancy.'],
  ['B.Com Computer Applications','Undergraduate','Commerce','3 Years','Pass in 10+2 with Commerce or Computer Science.'],
  ['BBA Bachelor of Business Administration','Undergraduate','Management','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  ['BCA Bachelor of Computer Applications','Undergraduate','Computer Applications','3 Years','Pass in 10+2 with Mathematics or Computer Science.'],
  ['BSW Bachelor of Social Work','Undergraduate','Arts & Humanities','3 Years','Pass in 10+2 or equivalent from a recognised board.'],
  // PG
  ['MA Tamil','Postgraduate','Languages','2 Years','Bachelor Degree with Tamil from a recognised University.'],
  ['MA English','Postgraduate','Languages','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MA History','Postgraduate','Arts & Humanities','2 Years','Bachelor Degree in Arts from a recognised University.'],
  ['MA Economics','Postgraduate','Arts & Humanities','2 Years','Bachelor Degree in Economics/Arts from a recognised University.'],
  ['MA Public Administration','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['MBA General','Postgraduate','Management','2 Years','Any recognised Undergraduate degree under 10+2+3 pattern.'],
  ['MBA Human Resource Management','Postgraduate','Management','2 Years','Any recognised Undergraduate degree.'],
  ['MBA Marketing Management','Postgraduate','Management','2 Years','Any recognised Undergraduate degree.'],
  ['MBA Finance Management','Postgraduate','Management','2 Years','Any recognised Undergraduate degree.'],
  ['M.Com Master of Commerce','Postgraduate','Commerce','2 Years','B.Com/B.B.A/B.B.M or equivalent degree.'],
  ['MCA Master of Computer Applications','Postgraduate','Computer Applications','2 Years','BCA/B.Sc. CS or equivalent with Mathematics at 10+2 level.'],
  ['M.Sc. Mathematics','Postgraduate','Science','2 Years','B.Sc. Mathematics/Applied Mathematics from a recognised University.'],
  ['M.Sc. Physics','Postgraduate','Science','2 Years','B.Sc. Physics from a recognised University.'],
  ['M.Sc. Chemistry','Postgraduate','Science','2 Years','B.Sc. Chemistry from a recognised University.'],
  ['M.Sc. Computer Science','Postgraduate','Computer Science','2 Years','B.Sc. CS/BCA/B.Tech. from a recognised University.'],
  ['MSW Master of Social Work','Postgraduate','Arts & Humanities','2 Years','Any Bachelor Degree from a recognised University.'],
  ['M.Sc. Information Technology','Postgraduate','Information Technology','2 Years','B.Sc. IT/BCA/B.E./B.Tech. from a recognised University.'],
  // Diplomas
  ['Diploma in Computer Applications','Diploma','Computer Applications','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Yoga','Diploma','Arts & Humanities','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  ['Diploma in Nutrition and Dietetics','Diploma','Science','1 Year','Pass in 10+2 with Biology as one of the subjects.'],
  ['Diploma in Tamil','Diploma','Languages','1 Year','Open to all interested candidates.'],
  ['Diploma in English','Diploma','Languages','1 Year','Open to all interested candidates.'],
  ['Diploma in Business Management','Diploma','Management','1 Year','Pass in 10+2 or equivalent from a recognised board.'],
  // Certificates
  ['Certificate in Tamil','Certificate','Languages','6 Months','Open to all interested candidates.'],
  ['Certificate in Computer Applications','Certificate','Computer Applications','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
  ['Certificate in Yoga','Certificate','Arts & Humanities','6 Months','Open to all interested candidates.'],
  ['Certificate in Business Management','Certificate','Management','6 Months','Pass in 10+2 or equivalent from a recognised board.'],
];

async function main() {
  const client = await pool.connect();
  try {
    const uniRes = await client.query('SELECT id, name FROM universities');
    const unis = {};
    for (const row of uniRes.rows) {
      if (row.name.toLowerCase().indexOf('madras') >= 0) unis.madras = row.id;
      if (row.name.toLowerCase().indexOf('alagappa') >= 0) unis.alagappa = row.id;
    }
    if (!unis.madras || !unis.alagappa) throw new Error('Universities not found');

    const existRes = await client.query('SELECT name, university_id FROM courses');
    const existSet = new Set();
    for (const r of existRes.rows) {
      existSet.add(r.name.toLowerCase().trim() + '|' + r.university_id);
    }

    const ins = 'INSERT INTO courses (name, level, category, duration, eligibility, description, university_id, status, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,true,false)';
    let iM = 0, iA = 0, sM = 0, sA = 0;

    for (const c of madrasCourses) {
      const key = c[0].toLowerCase().trim() + '|' + unis.madras;
      if (existSet.has(key)) { sM++; continue; }
      const desc = c[0] + ' offered through CDOE, University of Madras - flexible distance education programme recognised by UGC/DEB.';
      await client.query(ins, [c[0], c[1], c[2], c[3], c[4], desc, unis.madras]);
      iM++;
    }

    for (const c of alagappaCourses) {
      const key = c[0].toLowerCase().trim() + '|' + unis.alagappa;
      if (existSet.has(key)) { sA++; continue; }
      const desc = c[0] + ' offered through DDE, Alagappa University, Karaikudi - UGC/DEB recognised distance learning programme.';
      await client.query(ins, [c[0], c[1], c[2], c[3], c[4], desc, unis.alagappa]);
      iA++;
    }

    const total = await client.query('SELECT COUNT(*) as cnt FROM courses');
    console.log('SUCCESS: Madras ' + iM + ' added (' + sM + ' skipped), Alagappa ' + iA + ' added (' + sA + ' skipped). Total: ' + total.rows[0].cnt);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(function(e) { console.error('FAILED:', e.message); process.exit(1); });
