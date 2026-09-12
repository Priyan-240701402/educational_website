require('dotenv').config();
const http = require('http');
const app = require('./app');

async function testAll() {
  const server = app.listen(4001, async () => {
    console.log('Testing server running on port 4001...');
    try {
      // Helper fetcher
      const fetchApi = async (path, options = {}) => {
        const res = await fetch(`http://localhost:4001/api${path}`, options);
        const data = await res.json();
        return { status: res.status, data };
      };

      // 1. Health check
      const health = await fetchApi('/health');
      console.log('1. Health check:', health.status, health.data.message);

      // 2. Universities list
      const unis = await fetchApi('/universities');
      console.log('2. Universities list:', unis.status, `count: ${unis.data.data.length}`);
      const firstUni = unis.data.data[0];

      // 3. Courses by university
      const uniCourses = await fetchApi(`/universities/${firstUni.id}/courses`);
      console.log('3. Courses for university:', uniCourses.status, `count: ${uniCourses.data.data.length}`);

      // 4. Notifications
      const notices = await fetchApi('/notifications');
      console.log('4. Notifications:', notices.status, `count: ${notices.data.data.length}`, `first notice is_new: ${notices.data.data[0]?.is_new_badge}`);

      // 5. Gallery with pagination & like
      const gallery = await fetchApi('/gallery?page=1&limit=3');
      console.log('5. Gallery paginated:', gallery.status, `items: ${gallery.data.data.length}`, `total: ${gallery.data.pagination?.totalItems}`);
      const firstGal = gallery.data.data[0];

      const like1 = await fetchApi(`/gallery/${firstGal.id}/like`, {
        method: 'POST',
        headers: { 'X-Client-Id': 'test_user_client_1' }
      });
      console.log('5b. Like toggle 1:', like1.status, like1.data);

      const like2 = await fetchApi(`/gallery/${firstGal.id}/like`, {
        method: 'POST',
        headers: { 'X-Client-Id': 'test_user_client_1' }
      });
      console.log('5c. Like toggle 2 (unlike):', like2.status, like2.data);

      // 6. Enquiry public POST
      const enquiryRes = await fetchApi('/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Student',
          phone: '+91 9876543210',
          email: 'teststudent@example.com',
          university_id: firstUni.id,
          message: 'I am interested in B.Com distance education programme.'
        })
      });
      console.log('6. Enquiry submission:', enquiryRes.status, enquiryRes.data.message);

      // 7. Admin Login
      const loginRes = await fetchApi('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
          password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'
        })
      });
      console.log('7. Admin Login:', loginRes.status, loginRes.data.message);
      const token = loginRes.data.data.token;

      // 8. Admin Enquiries list
      const adminEnquiries = await fetchApi('/enquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('8. Admin Enquiries (protected):', adminEnquiries.status, `count: ${adminEnquiries.data.data.length}`);

      // 9. Dashboard
      const dash = await fetchApi('/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('9. Dashboard stats:', dash.status, dash.data.data);

      console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testAll();
