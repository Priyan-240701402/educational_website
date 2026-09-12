'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  Heart,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  X
} from 'lucide-react';
import { api, apiUrl } from '../../../lib/api';

const blankUniversity = {
  name: '',
  location: '',
  official_website: '',
  description: '',
  courses: '',
  logo: '',
  status: true
};

const blankCourse = {
  name: '',
  university_id: '',
  level: 'Undergraduate',
  category: '',
  duration: '',
  eligibility: '',
  description: '',
  admission_info: '',
  official_source: '',
  source_url: '',
  featured: false,
  status: true
};

const blankNotification = {
  title: '',
  description: '',
  university_id: '',
  type: 'Admission',
  link: '',
  important: false,
  priority: 5,
  is_new_badge: true,
  published: true,
  expiry_date: ''
};

const blankGallery = {
  title: '',
  description: '',
  category: 'Events',
  university_id: '',
  image_url: '',
  published: true
};

const blankEnquiry = {
  name: '',
  phone: '',
  email: '',
  university_id: '',
  course_id: '',
  message: '',
  status: 'New'
};

// Reusable Pagination Component: « Prev 1 2 3 4 5 Next »
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalItems, limit } = pagination;
  const startRecord = Math.min((page - 1) * limit + 1, totalItems);
  const endRecord = Math.min(page * limit, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis-1');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('ellipsis-2');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="admin-pagination">
      <span className="pagination-info">
        Showing <b>{startRecord}–{endRecord}</b> of <b>{totalItems}</b> records (Page {page} of {totalPages})
      </span>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous page"
        >
          « Prev
        </button>

        {getPageNumbers().map((p, idx) => {
          if (typeof p === 'string') {
            return <span key={`ell-${idx}`} className="pagination-ellipsis">…</span>;
          }
          return (
            <button
              key={p}
              type="button"
              className={`pagination-btn ${page === p ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          title="Next page"
        >
          Next »
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // All Universities for dropdown selections across all forms and filters
  const [allUniversities, setAllUniversities] = useState([]);

  // ── Universities Tab State ──
  const [universities, setUniversities] = useState([]);
  const [uniPagination, setUniPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [uniSearch, setUniSearch] = useState('');
  const [universityForm, setUniversityForm] = useState(blankUniversity);
  const [editingUniversityId, setEditingUniversityId] = useState(null);

  // ── Courses Tab State ──
  const [courses, setCourses] = useState([]);
  const [coursePagination, setCoursePagination] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [courseUniFilter, setCourseUniFilter] = useState('');
  const [courseLevelFilter, setCourseLevelFilter] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseForm, setCourseForm] = useState(blankCourse);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // ── Notifications Tab State ──
  const [notifications, setNotifications] = useState([]);
  const [notifPagination, setNotifPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [notifUniFilter, setNotifUniFilter] = useState('');
  const [notifTypeFilter, setNotifTypeFilter] = useState('');
  const [notifSearch, setNotifSearch] = useState('');
  const [notificationForm, setNotificationForm] = useState(blankNotification);
  const [editingNotificationId, setEditingNotificationId] = useState(null);

  // ── Gallery Tab State ──
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryPagination, setGalleryPagination] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('');
  const [galleryUniFilter, setGalleryUniFilter] = useState('');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryForm, setGalleryForm] = useState(blankGallery);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // ── Enquiries Tab State ──
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryPagination, setEnquiryPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('All');
  const [enquiryUniFilter, setEnquiryUniFilter] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [viewEnquiryModal, setViewEnquiryModal] = useState(null);

  // ── Settings State ──
  const [settings, setSettings] = useState({});

  // ── Confirmation Dialog ──
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });

  const galleryFileRef = useRef(null);
  const uniLogoFileRef = useRef(null);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const saved = localStorage.getItem('portal_token');
    if (!saved) {
      router.replace('/admin/login');
      return;
    }
    setToken(saved);
  }, [router]);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const flashMessage = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // ── DATA FETCHERS ──

  // Fetch dropdown list of universities (unpaginated for select options)
  const loadDropdownUniversities = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api('/universities', { headers });
      const list = Array.isArray(res) ? res : res?.data || [];
      setAllUniversities(list);
    } catch (err) {
      console.error('Failed to load universities dropdown:', err);
    }
  }, [token]);

  // Fetch Dashboard Stats & Recent Enquiries for Overview
  const loadDashboardStats = useCallback(async () => {
    if (!token) return;
    try {
      const [stats, settingsData] = await Promise.all([
        api('/dashboard', { headers }),
        api('/settings', { headers }).catch(() => ({}))
      ]);
      setDashboard(stats);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  }, [token]);

  // 1. Fetch Universities with pagination & search
  const fetchUniversities = useCallback(async (page = 1, search = uniSearch) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });
      if (search && search.trim()) params.set('search', search.trim());

      const res = await api(`/universities?${params.toString()}`, { headers });
      if (res && res.pagination) {
        setUniversities(res.data || []);
        setUniPagination(res.pagination);
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setUniversities(list);
        setUniPagination({ page: 1, limit: 10, totalItems: list.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching universities:', err);
      flashMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, uniSearch]);

  // 2. Fetch Courses with pagination, search & filters
  const fetchCourses = useCallback(async (
    page = 1,
    uniId = courseUniFilter,
    level = courseLevelFilter,
    category = courseCategoryFilter,
    search = courseSearch
  ) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12'
      });
      if (uniId) params.set('university_id', uniId);
      if (level && level !== 'All') params.set('level', level);
      if (category && category !== 'All') params.set('category', category);
      if (search && search.trim()) params.set('search', search.trim());

      const res = await api(`/courses?${params.toString()}`, { headers });
      if (res && res.pagination) {
        setCourses(res.data || []);
        setCoursePagination(res.pagination);
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setCourses(list);
        setCoursePagination({ page: 1, limit: 12, totalItems: list.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      flashMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, courseUniFilter, courseLevelFilter, courseCategoryFilter, courseSearch]);

  // 3. Fetch Notifications with pagination, search & filters
  const fetchNotifications = useCallback(async (
    page = 1,
    uniId = notifUniFilter,
    type = notifTypeFilter,
    search = notifSearch
  ) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });
      if (uniId) params.set('university_id', uniId);
      if (type && type !== 'All') params.set('type', type);
      if (search && search.trim()) params.set('search', search.trim());

      const res = await api(`/notifications?${params.toString()}`, { headers });
      if (res && res.pagination) {
        setNotifications(res.data || []);
        setNotifPagination(res.pagination);
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setNotifications(list);
        setNotifPagination({ page: 1, limit: 10, totalItems: list.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      flashMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, notifUniFilter, notifTypeFilter, notifSearch]);

  // 4. Fetch Gallery with pagination, search & filters
  const fetchGallery = useCallback(async (
    page = 1,
    uniId = galleryUniFilter,
    category = galleryCategoryFilter,
    search = gallerySearch
  ) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12'
      });
      if (uniId) params.set('university_id', uniId);
      if (category && category !== 'All') params.set('category', category);
      if (search && search.trim()) params.set('search', search.trim());

      const res = await api(`/gallery?${params.toString()}`, { headers });
      if (res && res.pagination) {
        setGalleryItems(res.data || []);
        setGalleryPagination(res.pagination);
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setGalleryItems(list);
        setGalleryPagination({ page: 1, limit: 12, totalItems: list.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      flashMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, galleryUniFilter, galleryCategoryFilter, gallerySearch]);

  // 5. Fetch Enquiries with pagination, search & filters
  const fetchEnquiries = useCallback(async (
    page = 1,
    status = enquiryStatusFilter,
    uniId = enquiryUniFilter,
    search = enquirySearch
  ) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });
      if (status && status !== 'All') params.set('status', status);
      if (uniId) params.set('university_id', uniId);
      if (search && search.trim()) params.set('search', search.trim());

      const res = await api(`/enquiries?${params.toString()}`, { headers });
      if (res && res.pagination) {
        setEnquiries(res.data || []);
        setEnquiryPagination(res.pagination);
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setEnquiries(list);
        setEnquiryPagination({ page: 1, limit: 10, totalItems: list.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      flashMessage(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, enquiryStatusFilter, enquiryUniFilter, enquirySearch]);

  // Initial load
  useEffect(() => {
    if (token) {
      loadDropdownUniversities();
      loadDashboardStats();
    }
  }, [token, loadDropdownUniversities, loadDashboardStats]);

  // Tab-specific initial load and re-fetches
  useEffect(() => {
    if (!token) return;
    if (tab === 'overview') {
      loadDashboardStats();
      fetchEnquiries(1);
    } else if (tab === 'universities') {
      fetchUniversities(1);
    } else if (tab === 'courses') {
      fetchCourses(1);
    } else if (tab === 'notifications') {
      fetchNotifications(1);
    } else if (tab === 'gallery') {
      fetchGallery(1);
    } else if (tab === 'enquiries') {
      fetchEnquiries(1);
    }
  }, [tab, token]);

  // Master refresh function
  const loadAll = useCallback(() => {
    loadDropdownUniversities();
    loadDashboardStats();
    if (tab === 'universities') fetchUniversities(uniPagination.page);
    else if (tab === 'courses') fetchCourses(coursePagination.page);
    else if (tab === 'notifications') fetchNotifications(notifPagination.page);
    else if (tab === 'gallery') fetchGallery(galleryPagination.page);
    else if (tab === 'enquiries') fetchEnquiries(enquiryPagination.page);
    else if (tab === 'overview') {
      loadDashboardStats();
      fetchEnquiries(1);
    }
  }, [
    tab,
    loadDropdownUniversities,
    loadDashboardStats,
    fetchUniversities,
    fetchCourses,
    fetchNotifications,
    fetchGallery,
    fetchEnquiries,
    uniPagination.page,
    coursePagination.page,
    notifPagination.page,
    galleryPagination.page,
    enquiryPagination.page
  ]);

  // Logout handler
  function logout() {
    localStorage.removeItem('portal_token');
    router.push('/admin/login');
  }

  // ── FILE UPLOADS ──
  async function handleFileUpload(file, target = 'gallery') {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(apiUrl('/uploads'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Upload failed');

      if (target === 'gallery') {
        setUploadedUrl(payload.data.url);
        setGalleryForm(prev => ({ ...prev, image_url: payload.data.url }));
      } else if (target === 'university') {
        setUniversityForm(prev => ({ ...prev, logo: payload.data.url }));
      }

      flashMessage('File uploaded successfully.');
    } catch (err) {
      flashMessage('Upload failed: ' + err.message, true);
    } finally {
      setUploading(false);
    }
  }

  // ════════ 1. UNIVERSITY CRUD ════════
  async function saveUniversity(e) {
    e.preventDefault();
    if (!universityForm.name.trim()) {
      flashMessage('University name is required.', true);
      return;
    }

    try {
      if (editingUniversityId) {
        await api(`/universities/${editingUniversityId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(universityForm)
        });
        flashMessage('University updated successfully.');
      } else {
        await api('/universities', {
          method: 'POST',
          headers,
          body: JSON.stringify(universityForm)
        });
        flashMessage('University created successfully.');
      }
      setUniversityForm(blankUniversity);
      setEditingUniversityId(null);
      loadDropdownUniversities();
      fetchUniversities(uniPagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  function startEditUniversity(u) {
    setUniversityForm({
      name: u.name || '',
      location: u.location || '',
      official_website: u.official_website || '',
      description: u.description || '',
      courses: u.courses || '',
      logo: u.logo || '',
      status: u.status !== undefined ? u.status : true
    });
    setEditingUniversityId(u.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmDeleteUniversity(u) {
    setConfirmDialog({
      open: true,
      title: 'Delete University',
      message: `Are you sure you want to delete ${u.name}? Associated courses should be reassigned or deleted first.`,
      action: async () => {
        try {
          await api(`/universities/${u.id}`, { method: 'DELETE', headers });
          flashMessage('University deleted successfully.');
          loadDropdownUniversities();
          fetchUniversities(1);
        } catch (err) {
          flashMessage(err.message, true);
        }
      }
    });
  }

  // Manage courses navigation from university card
  function handleManageCourses(u) {
    setTab('courses');
    setCourseUniFilter(String(u.id));
    setCourseSearch('');
    setCourseLevelFilter('');
    setCourseCategoryFilter('');
    setCourseForm({ ...blankCourse, university_id: u.id });
    setEditingCourseId(null);
    fetchCourses(1, String(u.id), '', '', '');
  }

  // ════════ 2. COURSE CRUD ════════
  async function saveCourse(e) {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.university_id) {
      flashMessage('Course name and university are required.', true);
      return;
    }

    try {
      if (editingCourseId) {
        await api(`/courses/${editingCourseId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(courseForm)
        });
        flashMessage('Course updated successfully.');
      } else {
        await api('/courses', {
          method: 'POST',
          headers,
          body: JSON.stringify(courseForm)
        });
        flashMessage('Course created successfully.');
      }
      setCourseForm({ ...blankCourse, university_id: courseUniFilter || '' });
      setEditingCourseId(null);
      fetchCourses(coursePagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  function startEditCourse(c) {
    setCourseForm({
      name: c.name || '',
      university_id: c.university?.id || c.university_id || '',
      level: c.level || 'Undergraduate',
      category: c.category || '',
      duration: c.duration || '',
      eligibility: c.eligibility || '',
      description: c.description || '',
      admission_info: c.admission_info || '',
      official_source: c.official_source || '',
      source_url: c.source_url || '',
      featured: Boolean(c.featured),
      status: c.status !== undefined ? c.status : true
    });
    setEditingCourseId(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmDeleteCourse(c) {
    setConfirmDialog({
      open: true,
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete "${c.name}"?`,
      action: async () => {
        try {
          await api(`/courses/${c.id}`, { method: 'DELETE', headers });
          flashMessage('Course deleted successfully.');
          fetchCourses(coursePagination.page);
        } catch (err) {
          flashMessage(err.message, true);
        }
      }
    });
  }

  // ════════ 3. NOTIFICATION CRUD ════════
  async function saveNotification(e) {
    e.preventDefault();
    if (!notificationForm.title.trim() || !notificationForm.description.trim()) {
      flashMessage('Notification title and description are required.', true);
      return;
    }

    try {
      const payload = {
        ...notificationForm,
        university_id: notificationForm.university_id || null,
        expiry_date: notificationForm.expiry_date || null
      };

      if (editingNotificationId) {
        await api(`/notifications/${editingNotificationId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        flashMessage('Notification updated successfully.');
      } else {
        await api('/notifications', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        flashMessage('Notification published successfully.');
      }
      setNotificationForm(blankNotification);
      setEditingNotificationId(null);
      fetchNotifications(notifPagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  function startEditNotification(n) {
    setNotificationForm({
      title: n.title || '',
      description: n.description || '',
      university_id: n.university?.id || n.university_id || '',
      type: n.type || 'Admission',
      link: n.link || n.attachment || '',
      important: Boolean(n.important),
      priority: n.priority || 5,
      is_new_badge: n.is_new_badge !== undefined ? Boolean(n.is_new_badge) : true,
      published: n.published !== undefined ? Boolean(n.published) : true,
      expiry_date: n.expiry_date ? n.expiry_date.split('T')[0] : ''
    });
    setEditingNotificationId(n.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmDeleteNotification(n) {
    setConfirmDialog({
      open: true,
      title: 'Delete Notification',
      message: `Are you sure you want to delete the notice "${n.title}"?`,
      action: async () => {
        try {
          await api(`/notifications/${n.id}`, { method: 'DELETE', headers });
          flashMessage('Notification deleted.');
          fetchNotifications(notifPagination.page);
        } catch (err) {
          flashMessage(err.message, true);
        }
      }
    });
  }

  // ════════ 4. GALLERY CRUD ════════
  async function saveGallery(e) {
    e.preventDefault();
    const finalImageUrl = uploadedUrl || galleryForm.image_url;
    if (!finalImageUrl) {
      flashMessage('Please upload a photo or provide an image URL.', true);
      return;
    }
    if (!galleryForm.title.trim()) {
      flashMessage('Please provide a title for the photo.', true);
      return;
    }

    try {
      const payload = {
        ...galleryForm,
        university_id: galleryForm.university_id || null,
        image_url: finalImageUrl
      };

      if (editingGalleryId) {
        await api(`/gallery/${editingGalleryId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        flashMessage('Gallery photo updated successfully.');
      } else {
        await api('/gallery', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        flashMessage('Gallery photo added successfully.');
      }

      setGalleryForm(blankGallery);
      setUploadedUrl('');
      setEditingGalleryId(null);
      if (galleryFileRef.current) galleryFileRef.current.value = '';
      fetchGallery(galleryPagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  function startEditGallery(g) {
    setGalleryForm({
      title: g.title || '',
      description: g.description || '',
      category: g.category || 'Events',
      university_id: g.university?.id || g.university_id || '',
      image_url: g.image_url || '',
      published: g.published !== undefined ? Boolean(g.published) : true
    });
    setUploadedUrl(g.image_url || '');
    setEditingGalleryId(g.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmDeleteGallery(g) {
    setConfirmDialog({
      open: true,
      title: 'Delete Gallery Image',
      message: `Are you sure you want to delete "${g.title}"?`,
      action: async () => {
        try {
          await api(`/gallery/${g.id}`, { method: 'DELETE', headers });
          flashMessage('Gallery image deleted.');
          fetchGallery(galleryPagination.page);
        } catch (err) {
          flashMessage(err.message, true);
        }
      }
    });
  }

  // ════════ 5. ENQUIRIES CRUD ════════
  async function updateEnquiryStatus(id, newStatus) {
    try {
      await api(`/enquiries/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      flashMessage(`Status updated to "${newStatus}".`);
      fetchEnquiries(enquiryPagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  async function saveEnquiryModal(e) {
    e.preventDefault();
    if (!editingEnquiry || !editingEnquiry.name || !editingEnquiry.phone) {
      flashMessage('Student name and mobile number are required.', true);
      return;
    }

    try {
      await api(`/enquiries/${editingEnquiry.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: editingEnquiry.name,
          phone: editingEnquiry.phone,
          email: editingEnquiry.email || '',
          university_id: editingEnquiry.university_id || null,
          course_id: editingEnquiry.course_id || null,
          message: editingEnquiry.message || '',
          status: editingEnquiry.status || 'New'
        })
      });
      flashMessage('Enquiry details updated successfully.');
      setEditingEnquiry(null);
      fetchEnquiries(enquiryPagination.page);
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  function startEditEnquiry(item) {
    setEditingEnquiry({
      id: item.id,
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      university_id: item.university?.id || item.university_id || '',
      course_id: item.course?.id || item.course_id || '',
      message: item.message || '',
      status: item.status || 'New'
    });
  }

  function confirmDeleteEnquiry(enq) {
    setConfirmDialog({
      open: true,
      title: 'Delete Student Enquiry',
      message: `Are you sure you want to delete the enquiry from ${enq.name}?`,
      action: async () => {
        try {
          await api(`/enquiries/${enq.id}`, { method: 'DELETE', headers });
          flashMessage('Enquiry record deleted.');
          if (viewEnquiryModal?.id === enq.id) setViewEnquiryModal(null);
          if (editingEnquiry?.id === enq.id) setEditingEnquiry(null);
          fetchEnquiries(enquiryPagination.page);
        } catch (err) {
          flashMessage(err.message, true);
        }
      }
    });
  }

  // ════════ 6. SETTINGS ════════
  async function saveSettings(e) {
    e.preventDefault();
    try {
      await api('/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(settings)
      });
      flashMessage('Website settings updated successfully.');
    } catch (err) {
      flashMessage(err.message, true);
    }
  }

  if (!token) return null;

  const tabs = [
    ['overview', 'Overview', BarChart3],
    ['universities', 'Universities', Building2],
    ['courses', 'Courses', BookOpen],
    ['notifications', 'Notifications', Bell],
    ['gallery', 'Gallery', ImageIcon],
    ['enquiries', 'Enquiries / Leads', Mail],
    ['settings', 'Settings', SettingsIcon],
  ];

  return (
    <main className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Building2 size={20} /> Portal Admin
        </div>
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            className={tab === id ? 'active' : ''}
            onClick={() => {
              setTab(id);
              setEditingUniversityId(null);
              setEditingCourseId(null);
              setEditingNotificationId(null);
              setEditingGalleryId(null);
              setEditingEnquiry(null);
            }}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
        <button onClick={logout} className="admin-logout-sidebar-btn">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <section className="admin-content">
        <header>
          <div>
            <p className="section-kicker">Management Console</p>
            <h1>{tabs.find(item => item[0] === tab)?.[1]}</h1>
          </div>
          <div className="admin-header-actions">
            <button
              className="button button-outline"
              onClick={loadAll}
              title="Refresh current data"
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button className="button button-primary" onClick={logout}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </header>

        {message && <div className="admin-message success">{message}</div>}
        {errorMessage && <div className="admin-message error">{errorMessage}</div>}

        {/* ════════ 1. TAB: OVERVIEW ════════ */}
        {tab === 'overview' && (
          <>
            <div className="stats-grid">
              {[
                ['Total Universities', dashboard?.universities ?? allUniversities.length, Building2],
                ['Active Courses', dashboard?.courses ?? '—', BookOpen],
                ['Published Notices', dashboard?.notifications ?? '—', Bell],
                ['Gallery Photos', dashboard?.gallery ?? '—', ImageIcon],
                ['New Leads', dashboard?.newEnquiries ?? '—', Mail],
              ].map(([label, value, Icon]) => (
                <article key={label}>
                  <Icon size={22} />
                  <strong>{value ?? '—'}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>

            <div className="admin-two-col" style={{ marginTop: 24 }}>
              {/* Recent Enquiries */}
              <div className="admin-panel">
                <div className="admin-panel-top-row">
                  <h2>Recent Student Enquiries</h2>
                  <button className="inline-link" onClick={() => setTab('enquiries')}>
                    View All Leads »
                  </button>
                </div>
                {enquiries.length === 0 ? (
                  <p className="empty-text">No student enquiries yet.</p>
                ) : (
                  enquiries.slice(0, 5).map(item => (
                    <div
                      className="admin-row"
                      key={item.id}
                      onClick={() => setViewEnquiryModal(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>
                        <b>{item.name}</b>
                        <small>
                          {item.phone} · {item.university?.name || 'General enquiry'} · {item.course?.name || ''}
                        </small>
                      </span>
                      <em className={`status-badge status-${(item.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </em>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions & Short summary */}
              <div className="admin-panel">
                <h2>Quick Management Links</h2>
                <div className="admin-quick-actions-grid">
                  <button
                    className="quick-action-card"
                    onClick={() => { setTab('universities'); setEditingUniversityId(null); setUniversityForm(blankUniversity); }}
                  >
                    <Building2 size={20} />
                    <span>+ Add University</span>
                  </button>
                  <button
                    className="quick-action-card"
                    onClick={() => { setTab('courses'); setEditingCourseId(null); setCourseForm(blankCourse); }}
                  >
                    <BookOpen size={20} />
                    <span>+ Add Course</span>
                  </button>
                  <button
                    className="quick-action-card"
                    onClick={() => { setTab('notifications'); setEditingNotificationId(null); setNotificationForm(blankNotification); }}
                  >
                    <Bell size={20} />
                    <span>+ Publish Notice</span>
                  </button>
                  <button
                    className="quick-action-card"
                    onClick={() => { setTab('gallery'); setEditingGalleryId(null); setGalleryForm(blankGallery); }}
                  >
                    <ImageIcon size={20} />
                    <span>+ Upload Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════ 2. TAB: UNIVERSITIES ════════ */}
        {tab === 'universities' && (
          <div className="admin-two-col">
            {/* University Form (Standard Add/Edit) */}
            <form className="admin-panel admin-form" onSubmit={saveUniversity}>
              <div className="admin-panel-top-row">
                <h2>{editingUniversityId ? 'Edit University' : 'Add New University'}</h2>
                {editingUniversityId && (
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ padding: '4px 10px', fontSize: '.75rem' }}
                    onClick={() => { setEditingUniversityId(null); setUniversityForm(blankUniversity); }}
                  >
                    <X size={13} /> Cancel Edit
                  </button>
                )}
              </div>

              <label>
                University Name *
                <input
                  required
                  value={universityForm.name}
                  onChange={e => setUniversityForm({ ...universityForm, name: e.target.value })}
                  placeholder="e.g. University of Madras"
                />
              </label>

              <label>
                Location / Campus
                <input
                  value={universityForm.location}
                  onChange={e => setUniversityForm({ ...universityForm, location: e.target.value })}
                  placeholder="e.g. Chennai, Tamil Nadu"
                />
              </label>

              <label>
                Official Website URL
                <input
                  type="url"
                  value={universityForm.official_website}
                  onChange={e => setUniversityForm({ ...universityForm, official_website: e.target.value })}
                  placeholder="https://www.ideunom.ac.in"
                />
              </label>

              <label>
                University Logo
                <div className="admin-upload-wrap">
                  {universityForm.logo ? (
                    <div className="admin-logo-preview">
                      <img src={universityForm.logo} alt="Logo preview" />
                      <button
                        type="button"
                        onClick={() => setUniversityForm({ ...universityForm, logo: '' })}
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      className="dropzone-box"
                      onClick={() => uniLogoFileRef.current?.click()}
                    >
                      <Upload size={20} />
                      <span>{uploading ? 'Uploading...' : 'Click to upload logo (JPG/PNG/WebP)'}</span>
                    </div>
                  )}
                  <input
                    ref={uniLogoFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleFileUpload(e.target.files?.[0], 'university')}
                  />
                </div>
              </label>

              <label>
                Description &amp; Highlights *
                <textarea
                  required
                  rows="3"
                  value={universityForm.description}
                  onChange={e => setUniversityForm({ ...universityForm, description: e.target.value })}
                  placeholder="Brief description of distance education offerings and accreditation..."
                />
              </label>

              <label>
                Summary of Offered Programmes
                <input
                  value={universityForm.courses}
                  onChange={e => setUniversityForm({ ...universityForm, courses: e.target.value })}
                  placeholder="e.g. B.A., B.Com., B.Sc., M.A., M.Com., M.B.A."
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={universityForm.status}
                  onChange={e => setUniversityForm({ ...universityForm, status: e.target.checked })}
                />
                Active (visible on website)
              </label>

              <button className="button button-primary" type="submit" disabled={uploading}>
                <Save size={16} /> {editingUniversityId ? 'Update University' : 'Add University'}
              </button>
            </form>

            {/* University List & Directory */}
            <div className="admin-panel">
              <div className="admin-panel-top-row">
                <h2>Universities Directory ({uniPagination.totalItems || universities.length})</h2>
              </div>

              {/* Search bar */}
              <div className="admin-toolbar-row">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    value={uniSearch}
                    onChange={e => {
                      setUniSearch(e.target.value);
                      fetchUniversities(1, e.target.value);
                    }}
                    placeholder="Search university name or location..."
                  />
                </div>
              </div>

              {universities.length === 0 ? (
                <p className="empty-text">No universities found.</p>
              ) : (
                universities.map(u => (
                  <div className="admin-entity-card" key={u.id}>
                    <div className="admin-entity-header">
                      <div className="admin-uni-logo-box">
                        {u.logo ? <img src={u.logo} alt={u.name} /> : <Building2 size={24} />}
                      </div>
                      <div className="admin-entity-info">
                        <h3>{u.name}</h3>
                        <p className="admin-entity-sub">{u.location || 'Distance learning support'}</p>
                        {u.official_website && (
                          <a
                            href={u.official_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-link-ext"
                          >
                            {u.official_website} <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <span className={`status-badge ${u.status ? 'status-converted' : 'status-closed'}`}>
                        {u.status ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="admin-entity-body">
                      <p>{u.description}</p>
                      <small>
                        <strong>Programmes:</strong> {u.courses || 'UG / PG Programmes'}
                      </small>
                    </div>

                    <div className="admin-entity-footer">
                      <button
                        className="button button-outline"
                        style={{ padding: '6px 12px', fontSize: '.78rem' }}
                        onClick={() => handleManageCourses(u)}
                        title={`View and manage courses for ${u.name}`}
                      >
                        <BookOpen size={14} /> Manage Courses ({u.active_courses_count || 0})
                      </button>
                      <div className="admin-actions-group">
                        <button
                          className="admin-icon-btn edit"
                          onClick={() => startEditUniversity(u)}
                          title="Edit University"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="admin-icon-btn delete"
                          onClick={() => confirmDeleteUniversity(u)}
                          title="Delete University"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Pagination
                pagination={uniPagination}
                onPageChange={p => fetchUniversities(p, uniSearch)}
              />
            </div>
          </div>
        )}

        {/* ════════ 3. TAB: COURSES ════════ */}
        {tab === 'courses' && (
          <div className="admin-two-col">
            {/* Course Form (Standard Add/Edit) */}
            <form className="admin-panel admin-form" onSubmit={saveCourse}>
              <div className="admin-panel-top-row">
                <h2>{editingCourseId ? 'Edit Course' : 'Add New Course'}</h2>
                {editingCourseId && (
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ padding: '4px 10px', fontSize: '.75rem' }}
                    onClick={() => {
                      setEditingCourseId(null);
                      setCourseForm({ ...blankCourse, university_id: courseUniFilter || '' });
                    }}
                  >
                    <X size={13} /> Cancel Edit
                  </button>
                )}
              </div>

              <label>
                Course Name *
                <input
                  required
                  value={courseForm.name}
                  onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="e.g. Master of Business Administration (MBA)"
                />
              </label>

              <label>
                University *
                <select
                  required
                  value={courseForm.university_id}
                  onChange={e => setCourseForm({ ...courseForm, university_id: e.target.value })}
                >
                  <option value="">Select University</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>

              <div className="admin-form-grid">
                <label>
                  Level *
                  <select
                    value={courseForm.level}
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    {['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate'].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Category *
                  <input
                    required
                    value={courseForm.category}
                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                    placeholder="e.g. Management, Commerce, IT"
                  />
                </label>
              </div>

              <label>
                Duration *
                <input
                  required
                  value={courseForm.duration}
                  onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="e.g. 2 Years / 3 Years / 1 Year"
                />
              </label>

              <label>
                Eligibility Requirement *
                <textarea
                  required
                  rows="2"
                  value={courseForm.eligibility}
                  onChange={e => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                  placeholder="e.g. Bachelor degree in any discipline from a recognised university."
                />
              </label>

              <label>
                Course Description *
                <textarea
                  required
                  rows="3"
                  value={courseForm.description}
                  onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Overview of curriculum, subject matter and learning outcomes..."
                />
              </label>

              <label>
                Admission Cycle / Information
                <input
                  value={courseForm.admission_info}
                  onChange={e => setCourseForm({ ...courseForm, admission_info: e.target.value })}
                  placeholder="e.g. Academic Year & Calendar Year batches"
                />
              </label>

              <div className="admin-form-grid">
                <label>
                  Official Source Reference
                  <input
                    value={courseForm.official_source}
                    onChange={e => setCourseForm({ ...courseForm, official_source: e.target.value })}
                    placeholder="e.g. University IDE Prospectus"
                  />
                </label>

                <label>
                  Source URL
                  <input
                    type="url"
                    value={courseForm.source_url}
                    onChange={e => setCourseForm({ ...courseForm, source_url: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={courseForm.featured}
                    onChange={e => setCourseForm({ ...courseForm, featured: e.target.checked })}
                  />
                  Featured (show on home page)
                </label>

                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={courseForm.status}
                    onChange={e => setCourseForm({ ...courseForm, status: e.target.checked })}
                  />
                  Active (published)
                </label>
              </div>

              <button className="button button-primary" type="submit">
                <Save size={16} /> {editingCourseId ? 'Update Course' : 'Add Course'}
              </button>
            </form>

            {/* Courses List with Search + Filters + Backend Pagination */}
            <div className="admin-panel">
              <div className="admin-panel-top-row">
                <h2>
                  Published Courses ({coursePagination.totalItems || courses.length})
                  {courseUniFilter && allUniversities.find(u => String(u.id) === String(courseUniFilter)) && (
                    <span style={{ fontSize: '.8rem', color: '#0b5bd3', fontWeight: 500, display: 'block', marginTop: 2 }}>
                      Filtered for: {allUniversities.find(u => String(u.id) === String(courseUniFilter))?.name}
                    </span>
                  )}
                </h2>
              </div>

              {/* Filter Controls Row */}
              <div className="admin-toolbar-row">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    value={courseSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setCourseSearch(val);
                      fetchCourses(1, courseUniFilter, courseLevelFilter, courseCategoryFilter, val);
                    }}
                    placeholder="Search courses or category..."
                  />
                </div>

                <select
                  value={courseUniFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setCourseUniFilter(val);
                    setCourseForm(prev => ({ ...prev, university_id: val || prev.university_id }));
                    fetchCourses(1, val, courseLevelFilter, courseCategoryFilter, courseSearch);
                  }}
                >
                  <option value="">All Universities</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <select
                  value={courseLevelFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setCourseLevelFilter(val);
                    fetchCourses(1, courseUniFilter, val, courseCategoryFilter, courseSearch);
                  }}
                >
                  <option value="">All Levels</option>
                  {['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate'].map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="admin-courses-list">
                {courses.length === 0 ? (
                  <p className="empty-text">No courses match the selected criteria.</p>
                ) : (
                  courses.map(item => (
                    <div className="admin-course-item" key={item.id}>
                      <div className="admin-course-main">
                        <div className="admin-course-tags">
                          <span className="type-chip">{item.level}</span>
                          <span className="course-category">{item.category}</span>
                          {item.featured && <span className="featured-chip">Featured</span>}
                        </div>
                        <h3>{item.name}</h3>
                        <p className="admin-course-uni">
                          <Building2 size={13} /> {item.university?.name || 'Assigned University'}
                        </p>
                        <small className="admin-course-eligibility">
                          <strong>Eligibility:</strong> {item.eligibility}
                        </small>
                        {item.official_source && (
                          <div className="admin-source-note">
                            <ShieldCheck size={13} color="#168751" /> {item.official_source}
                          </div>
                        )}
                      </div>

                      <div className="admin-course-actions">
                        <span className={`status-badge ${item.status ? 'status-converted' : 'status-closed'}`}>
                          {item.status ? 'Active' : 'Disabled'}
                        </span>
                        <div className="admin-actions-group">
                          <button
                            className="admin-icon-btn edit"
                            onClick={() => startEditCourse(item)}
                            title="Edit Course"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="admin-icon-btn delete"
                            onClick={() => confirmDeleteCourse(item)}
                            title="Delete Course"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Pagination
                pagination={coursePagination}
                onPageChange={p => fetchCourses(p, courseUniFilter, courseLevelFilter, courseCategoryFilter, courseSearch)}
              />
            </div>
          </div>
        )}

        {/* ════════ 4. TAB: NOTIFICATIONS ════════ */}
        {tab === 'notifications' && (
          <div className="admin-two-col">
            {/* Notification Form (Standard Add/Edit) */}
            <form className="admin-panel admin-form" onSubmit={saveNotification}>
              <div className="admin-panel-top-row">
                <h2>{editingNotificationId ? 'Edit Notification' : 'Publish Notification'}</h2>
                {editingNotificationId && (
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ padding: '4px 10px', fontSize: '.75rem' }}
                    onClick={() => { setEditingNotificationId(null); setNotificationForm(blankNotification); }}
                  >
                    <X size={13} /> Cancel Edit
                  </button>
                )}
              </div>

              <label>
                Notification Title *
                <input
                  required
                  value={notificationForm.title}
                  onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="e.g. CDOE - Admission Notification - Academic Session, July 2026"
                />
              </label>

              <label>
                Associated University
                <select
                  value={notificationForm.university_id}
                  onChange={e => setNotificationForm({ ...notificationForm, university_id: e.target.value })}
                >
                  <option value="">General Update (All Universities)</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>

              <div className="admin-form-grid">
                <label>
                  Type *
                  <select
                    value={notificationForm.type}
                    onChange={e => setNotificationForm({ ...notificationForm, type: e.target.value })}
                  >
                    {['Admission', 'Examination', 'Hall Ticket', 'Assignment', 'Results', 'General'].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority Order (1-10)
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={notificationForm.priority}
                    onChange={e => setNotificationForm({ ...notificationForm, priority: parseInt(e.target.value, 10) || 5 })}
                  />
                </label>
              </div>

              <label>
                Description / Notice Content *
                <textarea
                  required
                  rows="3"
                  value={notificationForm.description}
                  onChange={e => setNotificationForm({ ...notificationForm, description: e.target.value })}
                  placeholder="Full text of notification..."
                />
              </label>

              <label>
                Link or Official Attachment URL
                <input
                  type="url"
                  value={notificationForm.link}
                  onChange={e => setNotificationForm({ ...notificationForm, link: e.target.value })}
                  placeholder="https://..."
                />
              </label>

              <div className="admin-form-grid">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={notificationForm.is_new_badge}
                    onChange={e => setNotificationForm({ ...notificationForm, is_new_badge: e.target.checked })}
                  />
                  Show &quot;🔴 NEW&quot; badge
                </label>

                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={notificationForm.important}
                    onChange={e => setNotificationForm({ ...notificationForm, important: e.target.checked })}
                  />
                  Mark as Important (highlighted)
                </label>
              </div>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={notificationForm.published}
                  onChange={e => setNotificationForm({ ...notificationForm, published: e.target.checked })}
                />
                Published immediately (active on scroller)
              </label>

              <button className="button button-primary" type="submit">
                <Save size={16} /> {editingNotificationId ? 'Update Notice' : 'Publish Notice'}
              </button>
            </form>

            {/* Notifications List & Directory */}
            <div className="admin-panel">
              <div className="admin-panel-top-row">
                <h2>All Notifications ({notifPagination.totalItems || notifications.length})</h2>
              </div>

              {/* Filters */}
              <div className="admin-toolbar-row">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    value={notifSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setNotifSearch(val);
                      fetchNotifications(1, notifUniFilter, notifTypeFilter, val);
                    }}
                    placeholder="Search notice title or text..."
                  />
                </div>

                <select
                  value={notifUniFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setNotifUniFilter(val);
                    fetchNotifications(1, val, notifTypeFilter, notifSearch);
                  }}
                >
                  <option value="">All Universities</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <select
                  value={notifTypeFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setNotifTypeFilter(val);
                    fetchNotifications(1, notifUniFilter, val, notifSearch);
                  }}
                >
                  <option value="">All Types</option>
                  {['Admission', 'Examination', 'Hall Ticket', 'Assignment', 'Results', 'General'].map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div className="admin-notifications-list">
                {notifications.length === 0 ? (
                  <p className="empty-text">No notifications found.</p>
                ) : (
                  notifications.map(n => (
                    <div className={`admin-notification-item ${n.important ? 'important' : ''}`} key={n.id}>
                      <div className="admin-notif-left">
                        <div className="notice-chip-row">
                          <span className="type-chip">{n.type}</span>
                          {n.is_new_badge && (
                            <span className="badge-new inline-badge">
                              <span className="red-dot"></span> NEW
                            </span>
                          )}
                          {n.important && <span className="important-chip">Important</span>}
                        </div>
                        <h3>{n.title}</h3>
                        <p>{n.description}</p>
                        <small>
                          {n.university?.name || 'General Update'} · Priority: {n.priority} · {n.published_at ? new Date(n.published_at).toLocaleDateString('en-IN') : ''}
                        </small>
                      </div>

                      <div className="admin-notif-actions">
                        <button
                          className="admin-icon-btn edit"
                          onClick={() => startEditNotification(n)}
                          title="Edit Notice"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="admin-icon-btn delete"
                          onClick={() => confirmDeleteNotification(n)}
                          title="Delete Notice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Pagination
                pagination={notifPagination}
                onPageChange={p => fetchNotifications(p, notifUniFilter, notifTypeFilter, notifSearch)}
              />
            </div>
          </div>
        )}

        {/* ════════ 5. TAB: GALLERY (Standard 2-Column with Add/Edit Form & Edit Buttons) ════════ */}
        {tab === 'gallery' && (
          <div className="admin-two-col">
            {/* Gallery Add/Edit Form */}
            <form className="admin-panel admin-form" onSubmit={saveGallery}>
              <div className="admin-panel-top-row">
                <h2>{editingGalleryId ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}</h2>
                {editingGalleryId && (
                  <button
                    type="button"
                    className="button button-outline"
                    style={{ padding: '4px 10px', fontSize: '.75rem' }}
                    onClick={() => {
                      setEditingGalleryId(null);
                      setGalleryForm(blankGallery);
                      setUploadedUrl('');
                    }}
                  >
                    <X size={13} /> Cancel Edit
                  </button>
                )}
              </div>

              <div
                className="dropzone-box gallery-dropzone"
                onClick={() => galleryFileRef.current?.click()}
              >
                {uploadedUrl || galleryForm.image_url ? (
                  <div className="dropzone-preview">
                    <img src={uploadedUrl || galleryForm.image_url} alt="Preview" />
                    <p>✅ Image selected (click to change)</p>
                  </div>
                ) : (
                  <>
                    <Upload size={32} />
                    <p>{uploading ? 'Uploading...' : 'Click to select photo (JPG, PNG, WebP)'}</p>
                  </>
                )}
              </div>
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFileUpload(e.target.files?.[0], 'gallery')}
              />

              <label>
                Or Image URL
                <input
                  type="url"
                  value={galleryForm.image_url}
                  onChange={e => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </label>

              <label>
                Photo Title *
                <input
                  required
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Student Counselling Session"
                />
              </label>

              <div className="admin-form-grid">
                <label>
                  Category
                  <select
                    value={galleryForm.category}
                    onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  >
                    {['Events', 'Counselling', 'Student Activities', 'Office', 'Achievements', 'Other'].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Assign University
                  <select
                    value={galleryForm.university_id}
                    onChange={e => setGalleryForm({ ...galleryForm, university_id: e.target.value })}
                  >
                    <option value="">None / General</option>
                    {allUniversities.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Description / Caption (Optional)
                <textarea
                  rows="2"
                  value={galleryForm.description}
                  onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  placeholder="Short caption describing the moment..."
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={galleryForm.published}
                  onChange={e => setGalleryForm({ ...galleryForm, published: e.target.checked })}
                />
                Published immediately
              </label>

              <button className="button button-primary" type="submit" disabled={uploading}>
                <Save size={16} /> {editingGalleryId ? 'Update Photo' : 'Add to Gallery'}
              </button>
            </form>

            {/* Gallery Directory with Search + Filters + Backend Pagination */}
            <div className="admin-panel">
              <div className="admin-panel-top-row">
                <h2>Gallery Images ({galleryPagination.totalItems || galleryItems.length})</h2>
              </div>

              {/* Filters */}
              <div className="admin-toolbar-row">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    value={gallerySearch}
                    onChange={e => {
                      const val = e.target.value;
                      setGallerySearch(val);
                      fetchGallery(1, galleryUniFilter, galleryCategoryFilter, val);
                    }}
                    placeholder="Search gallery title or description..."
                  />
                </div>

                <select
                  value={galleryCategoryFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setGalleryCategoryFilter(val);
                    fetchGallery(1, galleryUniFilter, val, gallerySearch);
                  }}
                >
                  <option value="">All Categories</option>
                  {['Events', 'Counselling', 'Student Activities', 'Office', 'Achievements', 'Other'].map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>

                <select
                  value={galleryUniFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setGalleryUniFilter(val);
                    fetchGallery(1, val, galleryCategoryFilter, gallerySearch);
                  }}
                >
                  <option value="">All Universities</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-gallery-table">
                {galleryItems.length === 0 ? (
                  <p className="empty-text">No gallery items found.</p>
                ) : (
                  galleryItems.map(item => (
                    <div className="admin-gallery-row" key={item.id}>
                      <img src={item.image_url} alt={item.title} className="admin-gallery-thumb" />
                      <div className="admin-gallery-meta">
                        <b>{item.title}</b>
                        <small>
                          {item.category} {item.university?.name ? `· ${item.university.name}` : ''}
                        </small>
                        <div className="admin-gallery-counts">
                          <span><Eye size={12} /> {item.views_count || 0} views</span>
                          <span><Heart size={12} color="#e74c3c" /> {item.likes_count || 0} likes</span>
                        </div>
                      </div>

                      <div className="admin-actions-group">
                        <button
                          className="admin-icon-btn edit"
                          onClick={() => startEditGallery(item)}
                          title="Edit Photo"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="admin-icon-btn delete"
                          onClick={() => confirmDeleteGallery(item)}
                          title="Delete Image"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Pagination
                pagination={galleryPagination}
                onPageChange={p => fetchGallery(p, galleryUniFilter, galleryCategoryFilter, gallerySearch)}
              />
            </div>
          </div>
        )}

        {/* ════════ 6. TAB: ENQUIRIES / LEADS (With Search + Filter + Pagination + Edit Modal) ════════ */}
        {tab === 'enquiries' && (
          <div className="admin-panel">
            <div className="admin-enquiries-toolbar">
              <h2>Student Enquiries &amp; Admission Leads ({enquiryPagination.totalItems || enquiries.length})</h2>

              <div className="enquiry-filter-group">
                <div className="search-field" style={{ minWidth: 240 }}>
                  <Search size={16} />
                  <input
                    value={enquirySearch}
                    onChange={e => {
                      const val = e.target.value;
                      setEnquirySearch(val);
                      fetchEnquiries(1, enquiryStatusFilter, enquiryUniFilter, val);
                    }}
                    placeholder="Search name, phone, message..."
                  />
                </div>

                <select
                  value={enquiryStatusFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setEnquiryStatusFilter(val);
                    fetchEnquiries(1, val, enquiryUniFilter, enquirySearch);
                  }}
                  style={{ padding: '8px 12px', fontSize: '.8rem' }}
                >
                  <option value="All">All Statuses</option>
                  {['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={enquiryUniFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setEnquiryUniFilter(val);
                    fetchEnquiries(1, enquiryStatusFilter, val, enquirySearch);
                  }}
                  style={{ padding: '8px 12px', fontSize: '.8rem' }}
                >
                  <option value="">All Universities</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {enquiries.length === 0 ? (
              <p className="empty-text" style={{ padding: '30px 0' }}>No enquiry leads match your search.</p>
            ) : (
              <div className="admin-enquiries-list">
                {enquiries.map(item => (
                  <article className="enquiry-card-admin" key={item.id}>
                    <div className="enquiry-admin-main" onClick={() => setViewEnquiryModal(item)}>
                      <div className="enquiry-header-row">
                        <h3>{item.name}</h3>
                        <span className="enquiry-date">
                          {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </span>
                      </div>

                      <div className="enquiry-details-row">
                        <span><strong>Phone:</strong> {item.phone}</span>
                        {item.email && <span><strong>Email:</strong> {item.email}</span>}
                        {item.university?.name && <span><strong>University:</strong> {item.university.name}</span>}
                        {item.course?.name && <span><strong>Course:</strong> {item.course.name}</span>}
                      </div>

                      <p className="enquiry-message-preview">{item.message}</p>
                    </div>

                    <div className="enquiry-admin-actions">
                      <label>
                        Status
                        <select
                          value={item.status || 'New'}
                          onChange={e => updateEnquiryStatus(item.id, e.target.value)}
                          className={`status-select status-${(item.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map(x => (
                            <option key={x} value={x}>{x}</option>
                          ))}
                        </select>
                      </label>

                      <div className="admin-actions-group">
                        <button
                          className="admin-icon-btn edit"
                          onClick={() => startEditEnquiry(item)}
                          title="Edit Enquiry Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="admin-icon-btn delete"
                          onClick={() => confirmDeleteEnquiry(item)}
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Pagination
              pagination={enquiryPagination}
              onPageChange={p => fetchEnquiries(p, enquiryStatusFilter, enquiryUniFilter, enquirySearch)}
            />
          </div>
        )}

        {/* ════════ 7. TAB: SETTINGS ════════ */}
        {tab === 'settings' && (
          <form className="admin-panel admin-form" onSubmit={saveSettings} style={{ maxWidth: 800 }}>
            <h2>Organization &amp; Contact Settings</h2>
            <p style={{ color: '#5f6f85', fontSize: '.85rem', margin: '-6px 0 16px' }}>
              Update contact numbers, WhatsApp link, email and office address displayed across headers, footers and contact pages.
            </p>

            <label>
              Institution / Organization Name
              <input
                required
                value={settings.institution_name || ''}
                onChange={e => setSettings({ ...settings, institution_name: e.target.value })}
              />
            </label>

            <div className="admin-form-grid">
              <label>
                Primary Phone Number
                <input
                  value={settings.phone || ''}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                />
              </label>

              <label>
                WhatsApp Number (with country code, digits only)
                <input
                  value={settings.whatsapp || ''}
                  onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                />
              </label>
            </div>

            <div className="admin-form-grid">
              <label>
                Email Address
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                />
              </label>

              <label>
                Working Hours
                <input
                  value={settings.working_hours || ''}
                  onChange={e => setSettings({ ...settings, working_hours: e.target.value })}
                />
              </label>
            </div>

            <label>
              Physical Address
              <textarea
                rows="2"
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </label>

            <label>
              Google Maps Embed / URL
              <input
                value={settings.maps_url || ''}
                onChange={e => setSettings({ ...settings, maps_url: e.target.value })}
              />
            </label>

            <button className="button button-primary" type="submit">
              <Save size={16} /> Save Settings
            </button>
          </form>
        )}

        {/* ── ENQUIRY EDIT MODAL (Consistent Form Standard) ── */}
        {editingEnquiry && (
          <div className="modal-overlay" onClick={() => setEditingEnquiry(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <button
                className="modal-close"
                onClick={() => setEditingEnquiry(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <span className="section-kicker">Edit Lead Details</span>
              <h2>Modify Enquiry</h2>

              <form onSubmit={saveEnquiryModal} className="modal-edit-form">
                <label>
                  Student Name *
                  <input
                    required
                    value={editingEnquiry.name}
                    onChange={e => setEditingEnquiry({ ...editingEnquiry, name: e.target.value })}
                  />
                </label>

                <div className="admin-form-grid">
                  <label>
                    Phone / WhatsApp *
                    <input
                      required
                      value={editingEnquiry.phone}
                      onChange={e => setEditingEnquiry({ ...editingEnquiry, phone: e.target.value })}
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      type="email"
                      value={editingEnquiry.email}
                      onChange={e => setEditingEnquiry({ ...editingEnquiry, email: e.target.value })}
                    />
                  </label>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Target University
                    <select
                      value={editingEnquiry.university_id}
                      onChange={e => setEditingEnquiry({ ...editingEnquiry, university_id: e.target.value })}
                    >
                      <option value="">General Guidance</option>
                      {allUniversities.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Lead Status
                    <select
                      value={editingEnquiry.status}
                      onChange={e => setEditingEnquiry({ ...editingEnquiry, status: e.target.value })}
                    >
                      {['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map(x => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Enquiry Message / Notes
                  <textarea
                    rows="3"
                    value={editingEnquiry.message}
                    onChange={e => setEditingEnquiry({ ...editingEnquiry, message: e.target.value })}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="button button-primary" type="submit">
                    <Save size={16} /> Update Enquiry
                  </button>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setEditingEnquiry(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ENQUIRY DETAIL VIEW MODAL ── */}
        {viewEnquiryModal && (
          <div className="modal-overlay" onClick={() => setViewEnquiryModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setViewEnquiryModal(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <span className="section-kicker">Student Enquiry Details</span>
              <h2>{viewEnquiryModal.name}</h2>

              <dl className="enquiry-modal-dl">
                <dt>Phone / WhatsApp</dt>
                <dd>
                  <a href={`tel:${viewEnquiryModal.phone}`} style={{ color: '#0b5bd3', fontWeight: 600 }}>
                    {viewEnquiryModal.phone}
                  </a>
                </dd>

                <dt>Email</dt>
                <dd>{viewEnquiryModal.email || 'Not provided'}</dd>

                <dt>Interested University</dt>
                <dd>{viewEnquiryModal.university?.name || 'General Guidance'}</dd>

                <dt>Interested Course</dt>
                <dd>{viewEnquiryModal.course?.name || 'General Inquiry'}</dd>

                <dt>Message</dt>
                <dd className="enquiry-full-message">{viewEnquiryModal.message || 'No additional message provided.'}</dd>

                <dt>Received On</dt>
                <dd>{viewEnquiryModal.created_at ? new Date(viewEnquiryModal.created_at).toLocaleString('en-IN') : ''}</dd>

                <dt>Current Status</dt>
                <dd>
                  <select
                    value={viewEnquiryModal.status || 'New'}
                    onChange={e => {
                      const val = e.target.value;
                      setViewEnquiryModal({ ...viewEnquiryModal, status: val });
                      updateEnquiryStatus(viewEnquiryModal.id, val);
                    }}
                    className={`status-select status-${(viewEnquiryModal.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </dd>
              </dl>

              <div className="modal-actions-row" style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  className="button button-whatsapp"
                  href={`https://wa.me/${String(viewEnquiryModal.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${viewEnquiryModal.name}, reaching out regarding your distance education inquiry.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message on WhatsApp
                </a>
                <button
                  className="button button-outline"
                  onClick={() => {
                    const item = viewEnquiryModal;
                    setViewEnquiryModal(null);
                    startEditEnquiry(item);
                  }}
                >
                  <Edit2 size={15} /> Edit Details
                </button>
                <button
                  className="button button-outline"
                  onClick={() => confirmDeleteEnquiry(viewEnquiryModal)}
                >
                  <Trash2 size={15} color="#c0392b" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIRMATION MODAL ── */}
        {confirmDialog.open && (
          <div className="modal-overlay" onClick={() => setConfirmDialog({ open: false, title: '', message: '', action: null })}>
            <div className="modal-content confirm-modal-box" onClick={e => e.stopPropagation()}>
              <h3>{confirmDialog.title}</h3>
              <p>{confirmDialog.message}</p>
              <div className="confirm-modal-actions">
                <button
                  className="button button-primary danger-btn"
                  onClick={async () => {
                    if (confirmDialog.action) await confirmDialog.action();
                    setConfirmDialog({ open: false, title: '', message: '', action: null });
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  className="button button-outline"
                  onClick={() => setConfirmDialog({ open: false, title: '', message: '', action: null })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
