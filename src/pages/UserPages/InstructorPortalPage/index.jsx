import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetInstructorProfileQuery,
  useUpdateInstructorProfileMutation,
  useGetMyCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  usePublishCourseMutation,
  useGetInstructorAnalyticsQuery,
  useGetCourseStudentsQuery,
} from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Programming', 'Web Development', 'Mobile Development', 'Data Science', 'AI & Machine Learning',
  'Cloud & DevOps', 'Cybersecurity', 'Design', 'Business', 'Marketing', 'Finance',
  'Language Learning', 'Music', 'Photography', 'Health & Fitness', 'Personal Development', 'Other'
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AZN', 'TRY', 'RUB'];

const LANGS_31 = [
  { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'se', name: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
];

const emptySection = () => ({ id: Date.now(), title: '', description: '', lectures: [] });
const emptyLecture = () => ({ id: Date.now(), title: '', videoUrl: '', durationMinutes: 0, isFree: false, lectureType: 'Video' });
const emptyCourse = () => ({
  title: '', description: '', shortDescription: '', whatYouLearn: '', requirements: '',
  category: 'Programming', subCategory: '', tags: '', language: 'en', level: 'Beginner',
  price: 0, discountPrice: 0, currency: 'USD', isFree: false,
  thumbnailUrl: '', previewVideoUrl: '', isPublished: false,
  sections: [], translations: {}
});

// ── SVG Icons ──────────────────────────────────────────────────────────────────

const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  courses: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  analytics: "M22 12h-4l-3 9L9 3l-3 9H2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  global: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12A10 10 0 1 0 22 12 10 10 0 0 0 2 12z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  profile: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  menu: "M3 12h18M3 6h18M3 18h18",
};

// ── Main Component ─────────────────────────────────────────────────────────────

function InstructorPortalPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const i = (key, fallback = key) => t(`instructor.${key}`, { defaultValue: fallback });

  // Auth check
  const [isAuth, setIsAuth] = useState(false);
  const instructorEmail = localStorage.getItem('instructorEmail') || '';

  useEffect(() => {
    const isInstructor = localStorage.getItem('isInstructor') === 'true' && instructorEmail;
    if (!isInstructor) {
      navigate('/instructor/signin');
    } else {
      setIsAuth(true);
    }
  }, [navigate, instructorEmail]);

  // Navigation
  const [activeTab, setActiveTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const { data: profile } = useGetInstructorProfileQuery(instructorEmail, { skip: !isAuth });
  const { data: courses = [], refetch: refetchCourses } = useGetMyCoursesQuery(instructorEmail, { skip: !isAuth });
  const { data: analytics } = useGetInstructorAnalyticsQuery(instructorEmail, { skip: !isAuth || activeTab !== 'Analytics' });

  // Mutations
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [updateProfile] = useUpdateInstructorProfileMutation();

  // Modal state
  const [courseModal, setCourseModal] = useState(false);
  const [courseMode, setCourseMode] = useState('add'); // 'add' | 'edit'
  const [courseForm, setCourseForm] = useState(emptyCourse());
  const [deleteModal, setDeleteModal] = useState(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Profile edit
  const [profileForm, setProfileForm] = useState({
    displayName: '', bio: '', expertise: '', avatarUrl: '', website: '', linkedin: '', youtube: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        expertise: profile.expertise || '',
        avatarUrl: profile.avatarUrl || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        youtube: profile.youtube || '',
      });
    }
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem('isInstructor');
    localStorage.removeItem('instructorToken');
    localStorage.removeItem('instructorEmail');
    navigate('/instructor/signin');
  };

  // ── Course Form Helpers ────────────────────────────────────────────────────

  const openAddCourse = () => {
    setCourseForm(emptyCourse());
    setCourseMode('add');
    setActiveFormTab('basic');
    setCourseModal(true);
  };

  const openEditCourse = (course) => {
    setCourseForm({
      ...course,
      sections: course.sections || [],
      translations: course.translations || {}
    });
    setCourseMode('edit');
    setActiveFormTab('basic');
    setCourseModal(true);
  };

  const handleCourseFormChange = (field, value) => {
    setCourseForm(f => ({ ...f, [field]: value }));
  };

  const addSection = () => {
    setCourseForm(f => ({ ...f, sections: [...f.sections, emptySection()] }));
  };

  const updateSection = (idx, field, value) => {
    setCourseForm(f => {
      const sections = [...f.sections];
      sections[idx] = { ...sections[idx], [field]: value };
      return { ...f, sections };
    });
  };

  const removeSection = (idx) => {
    setCourseForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }));
  };

  const addLecture = (sIdx) => {
    setCourseForm(f => {
      const sections = [...f.sections];
      sections[sIdx] = { ...sections[sIdx], lectures: [...(sections[sIdx].lectures || []), emptyLecture()] };
      return { ...f, sections };
    });
  };

  const updateLecture = (sIdx, lIdx, field, value) => {
    setCourseForm(f => {
      const sections = [...f.sections];
      const lectures = [...(sections[sIdx].lectures || [])];
      lectures[lIdx] = { ...lectures[lIdx], [field]: value };
      sections[sIdx] = { ...sections[sIdx], lectures };
      return { ...f, sections };
    });
  };

  const removeLecture = (sIdx, lIdx) => {
    setCourseForm(f => {
      const sections = [...f.sections];
      sections[sIdx] = { ...sections[sIdx], lectures: sections[sIdx].lectures.filter((_, i) => i !== lIdx) };
      return { ...f, sections };
    });
  };

  const handleAutoTranslate = () => {
    const base = { title: courseForm.title, description: courseForm.shortDescription, shortDescription: courseForm.shortDescription, whatYouLearn: courseForm.whatYouLearn, requirements: courseForm.requirements };
    const generated = {};
    LANGS_31.forEach(lang => {
      if (lang.code !== 'en') {
        generated[lang.code] = { ...base, title: `${courseForm.title} (${lang.name})` };
      }
    });
    setCourseForm(f => ({ ...f, translations: { ...f.translations, ...generated } }));
    toast?.success?.('Auto-translated to 31 languages!');
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title) { toast?.error?.('Course title is required'); return; }
    setIsSaving(true);
    try {
      const payload = { email: instructorEmail, ...courseForm };
      if (courseMode === 'add') {
        await createCourse(payload).unwrap();
        toast?.success?.('Course created successfully!');
      } else {
        await updateCourse({ id: courseForm.id, ...payload }).unwrap();
        toast?.success?.('Course updated!');
      }
      setCourseModal(false);
      refetchCourses();
    } catch (e) {
      toast?.error?.('Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteModal) return;
    try {
      await deleteCourse({ id: deleteModal.id, email: instructorEmail }).unwrap();
      toast?.success?.('Course deleted');
      setDeleteModal(null);
      refetchCourses();
    } catch {
      toast?.error?.('Failed to delete course');
    }
  };

  const handlePublish = async (course, publish) => {
    try {
      await publishCourse({ id: course.id, email: instructorEmail, publish }).unwrap();
      toast?.success?.(publish ? 'Course published!' : 'Course unpublished');
      refetchCourses();
    } catch {
      toast?.error?.('Failed to update publish status');
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile({ email: instructorEmail, ...profileForm }).unwrap();
      toast?.success?.('Profile updated!');
    } catch {
      toast?.error?.('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(c => {
    const matchSearch = !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = levelFilter === 'All' || c.level === levelFilter;
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Published' ? c.isPublished : !c.isPublished);
    return matchSearch && matchLevel && matchStatus;
  });

  if (!isAuth) return null;

  const navItems = [
    { key: 'Overview', label: i('overview'), icon: icons.dashboard },
    { key: 'MyCourses', label: i('myCourses'), icon: icons.courses },
    { key: 'Students', label: i('students'), icon: icons.students },
    { key: 'Analytics', label: i('analytics'), icon: icons.analytics },
    { key: 'Settings', label: i('settings'), icon: icons.settings },
    { key: 'Profile', label: i('profile'), icon: icons.profile },
  ];

  return (
    <div className="ip">
      <ScrollToTop />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`ip__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ip__sidebar-header">
          <Link to="/" className="ip__logo">
            <div className="ip__logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#7A5CFF"/>
                <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="ip__logo-text">EDUSAZ</span>
          </Link>
          <div className="ip__instructor-badge">🎓 Instructor</div>
        </div>

        <nav className="ip__nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`ip__nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
            >
              <Icon path={item.icon} size={18} />
              <span>{item.label}</span>
              {item.key === 'MyCourses' && courses.length > 0 && (
                <span className="ip__nav-badge">{courses.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ip__sidebar-footer">
          <div className="ip__instructor-info">
            <div className="ip__instructor-avatar">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} />
              ) : (
                <span>{profile?.displayName?.[0] || profile?.firstName?.[0] || '?'}</span>
              )}
            </div>
            <div className="ip__instructor-details">
              <div className="ip__instructor-name">{profile?.displayName || profile?.firstName || 'Instructor'}</div>
              <div className="ip__instructor-email">{instructorEmail}</div>
            </div>
          </div>
          <button className="ip__logout" onClick={handleLogout}>
            <Icon path={icons.logout} size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="ip__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="ip__main">
        {/* Top bar */}
        <header className="ip__topbar">
          <button className="ip__menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icon path={icons.menu} size={20} />
          </button>
          <div className="ip__topbar-title">
            {navItems.find(n => n.key === activeTab)?.label}
          </div>
          <div className="ip__topbar-actions">
            <select className="ip__lang-select" value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
              {LANGS_31.slice(0, 10).map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
            {activeTab === 'MyCourses' && (
              <button className="ip__btn ip__btn--primary" onClick={openAddCourse}>
                <Icon path={icons.plus} size={16} />
                <span>{i('addCourse')}</span>
              </button>
            )}
          </div>
        </header>

        <div className="ip__content">
          {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'Overview' && (
            <div className="ip__overview">
              <div className="ip__page-header">
                <h1 className="ip__page-title">
                  {i('overview')}, {profile?.displayName || profile?.firstName || 'Instructor'}! 👋
                </h1>
                <p className="ip__page-subtitle">Here's what's happening with your courses today.</p>
              </div>

              {/* Stats Grid */}
              <div className="ip__stats-grid">
                {[
                  { label: i('totalCourses'), value: courses.length, icon: icons.courses, color: '#7A5CFF', suffix: '' },
                  { label: i('publishedCourses'), value: courses.filter(c => c.isPublished).length, icon: icons.eye, color: '#10b981', suffix: '' },
                  { label: i('totalStudents'), value: profile?.totalStudents ?? 0, icon: icons.students, color: '#f59e0b', suffix: '' },
                  { label: i('totalRevenue'), value: `$${(profile?.totalRevenue ?? 0).toLocaleString()}`, icon: icons.dollar, color: '#ec4899', suffix: '' },
                  { label: i('avgRating'), value: (profile?.rating ?? 0).toFixed(1), icon: icons.star, color: '#f59e0b', suffix: '★' },
                ].map((stat, idx) => (
                  <div key={idx} className="ip__stat-card" style={{ '--accent': stat.color }}>
                    <div className="ip__stat-icon">
                      <Icon path={stat.icon} size={22} />
                    </div>
                    <div className="ip__stat-body">
                      <div className="ip__stat-value">{stat.value}{stat.suffix}</div>
                      <div className="ip__stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Courses */}
              <div className="ip__section">
                <div className="ip__section-header">
                  <h2 className="ip__section-title">Recent Courses</h2>
                  <button className="ip__link-btn" onClick={() => setActiveTab('MyCourses')}>View all →</button>
                </div>
                {courses.length === 0 ? (
                  <div className="ip__empty">
                    <div className="ip__empty-icon">📚</div>
                    <p>{i('noCourses')}</p>
                    <button className="ip__btn ip__btn--primary" onClick={openAddCourse}>
                      {i('addCourse')}
                    </button>
                  </div>
                ) : (
                  <div className="ip__course-grid">
                    {courses.slice(0, 3).map(course => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onEdit={() => openEditCourse(course)}
                        onDelete={() => setDeleteModal(course)}
                        onPublish={() => handlePublish(course, !course.isPublished)}
                        i={i}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MY COURSES TAB ───────────────────────────────────────────────── */}
          {activeTab === 'MyCourses' && (
            <div className="ip__courses">
              <div className="ip__page-header">
                <div>
                  <h1 className="ip__page-title">{i('myCourses')}</h1>
                  <p className="ip__page-subtitle">{courses.length} courses in your portfolio</p>
                </div>
                <button className="ip__btn ip__btn--primary" onClick={openAddCourse}>
                  <Icon path={icons.plus} size={16} />
                  {i('addCourse')}
                </button>
              </div>

              {/* Filters */}
              <div className="ip__filters">
                <input
                  className="ip__search"
                  placeholder="🔍 Search courses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select className="ip__filter-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                  <option value="All">All Levels</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <select className="ip__filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="ip__empty">
                  <div className="ip__empty-icon">📚</div>
                  <p>{i('noCourses')}</p>
                  <button className="ip__btn ip__btn--primary" onClick={openAddCourse}>{i('addCourse')}</button>
                </div>
              ) : (
                <div className="ip__course-table">
                  <div className="ip__table-header">
                    <span>Course</span>
                    <span>Level</span>
                    <span>Students</span>
                    <span>Revenue</span>
                    <span>Rating</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {filteredCourses.map(course => (
                    <CourseTableRow
                      key={course.id}
                      course={course}
                      onEdit={() => openEditCourse(course)}
                      onDelete={() => setDeleteModal(course)}
                      onPublish={() => handlePublish(course, !course.isPublished)}
                      i={i}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STUDENTS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'Students' && (
            <StudentsTab
              courses={courses}
              instructorEmail={instructorEmail}
              i={i}
            />
          )}

          {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'Analytics' && (
            <AnalyticsTab analytics={analytics} courses={courses} i={i} />
          )}

          {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'Settings' && (
            <div className="ip__settings">
              <div className="ip__page-header">
                <h1 className="ip__page-title">{i('settings')}</h1>
                <p className="ip__page-subtitle">Manage your instructor preferences</p>
              </div>
              <div className="ip__settings-card">
                <h3>Account Information</h3>
                <div className="ip__settings-field">
                  <label>Email</label>
                  <input value={instructorEmail} disabled />
                </div>
                <div className="ip__settings-field">
                  <label>Platform Language</label>
                  <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
                    {LANGS_31.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="ip__settings-danger">
                  <h3>Danger Zone</h3>
                  <button className="ip__btn ip__btn--danger" onClick={handleLogout}>
                    <Icon path={icons.logout} size={16} />
                    Sign Out of Instructor Portal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ───────────────────────────────────────────────────── */}
          {activeTab === 'Profile' && (
            <div className="ip__profile-page">
              <div className="ip__page-header">
                <h1 className="ip__page-title">{i('profile')}</h1>
                <p className="ip__page-subtitle">How students see you on the platform</p>
              </div>
              <div className="ip__profile-card">
                <div className="ip__profile-avatar-section">
                  <div className="ip__profile-avatar">
                    {profileForm.avatarUrl ? (
                      <img src={profileForm.avatarUrl} alt="Avatar" />
                    ) : (
                      <span>{profileForm.displayName?.[0] || '?'}</span>
                    )}
                  </div>
                  <div>
                    <div className="ip__profile-name">{profile?.displayName || profile?.firstName}</div>
                    <div className="ip__profile-meta">
                      <span>⭐ {(profile?.rating ?? 0).toFixed(1)} Rating</span>
                      <span>👥 {profile?.totalStudents ?? 0} Students</span>
                      <span>📚 {profile?.totalCourses ?? 0} Courses</span>
                    </div>
                  </div>
                </div>

                <div className="ip__form-grid">
                  {[
                    { field: 'displayName', label: i('displayName'), placeholder: 'Your public name' },
                    { field: 'expertise', label: i('expertise'), placeholder: 'e.g. Web Development' },
                    { field: 'website', label: i('website'), placeholder: 'https://yoursite.com' },
                    { field: 'linkedin', label: i('linkedin'), placeholder: 'LinkedIn URL' },
                    { field: 'youtube', label: i('youtube'), placeholder: 'YouTube channel URL' },
                    { field: 'avatarUrl', label: 'Avatar URL', placeholder: 'https://...' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field} className="ip__form-field">
                      <label>{label}</label>
                      <input
                        value={profileForm[field] || ''}
                        onChange={e => setProfileForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>

                <div className="ip__form-field ip__form-field--full">
                  <label>{i('bio')}</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell students about your background and expertise..."
                    rows={5}
                  />
                </div>

                <div className="ip__form-actions">
                  <button
                    className="ip__btn ip__btn--primary"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? <span className="ip__spinner" /> : i('save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Course Modal ─────────────────────────────────────────────────────── */}
      {courseModal && (
        <div className="ip__modal-overlay" onClick={e => e.target === e.currentTarget && setCourseModal(false)}>
          <div className="ip__modal ip__modal--large">
            <div className="ip__modal-header">
              <h2>{courseMode === 'add' ? i('addCourse') : i('edit') + ' Course'}</h2>
              <button className="ip__modal-close" onClick={() => setCourseModal(false)}>
                <Icon path={icons.x} size={20} />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="ip__form-tabs">
              {['basic', 'media', 'curriculum', 'translations'].map(tab => (
                <button
                  key={tab}
                  className={`ip__form-tab ${activeFormTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveFormTab(tab)}
                >
                  {tab === 'basic' ? '📋 Basic Info' :
                   tab === 'media' ? '🖼️ Media & Pricing' :
                   tab === 'curriculum' ? '📚 Curriculum' : '🌍 Translations'}
                </button>
              ))}
            </div>

            <div className="ip__modal-body">
              {/* ── Basic Info ── */}
              {activeFormTab === 'basic' && (
                <div className="ip__form-section">
                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('courseTitle')} *</label>
                    <input
                      value={courseForm.title}
                      onChange={e => handleCourseFormChange('title', e.target.value)}
                      placeholder="e.g. Complete Web Development Bootcamp"
                    />
                  </div>

                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('shortDesc')}</label>
                    <input
                      value={courseForm.shortDescription}
                      onChange={e => handleCourseFormChange('shortDescription', e.target.value)}
                      placeholder="Short compelling description (shown in listings)"
                    />
                  </div>

                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('description')}</label>
                    <textarea
                      value={courseForm.description}
                      onChange={e => handleCourseFormChange('description', e.target.value)}
                      placeholder="Full course description..."
                      rows={4}
                    />
                  </div>

                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('whatLearn')}</label>
                    <textarea
                      value={courseForm.whatYouLearn}
                      onChange={e => handleCourseFormChange('whatYouLearn', e.target.value)}
                      placeholder="List key learning outcomes..."
                      rows={3}
                    />
                  </div>

                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('requirements')}</label>
                    <textarea
                      value={courseForm.requirements}
                      onChange={e => handleCourseFormChange('requirements', e.target.value)}
                      placeholder="Prerequisites and requirements..."
                      rows={2}
                    />
                  </div>

                  <div className="ip__form-grid">
                    <div className="ip__form-field">
                      <label>{i('category')}</label>
                      <select value={courseForm.category} onChange={e => handleCourseFormChange('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="ip__form-field">
                      <label>{i('level')}</label>
                      <select value={courseForm.level} onChange={e => handleCourseFormChange('level', e.target.value)}>
                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="ip__form-field">
                      <label>{i('language')}</label>
                      <select value={courseForm.language} onChange={e => handleCourseFormChange('language', e.target.value)}>
                        {LANGS_31.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                      </select>
                    </div>
                    <div className="ip__form-field">
                      <label>{i('tags')}</label>
                      <input
                        value={courseForm.tags}
                        onChange={e => handleCourseFormChange('tags', e.target.value)}
                        placeholder="react, javascript, frontend"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Media & Pricing ── */}
              {activeFormTab === 'media' && (
                <div className="ip__form-section">
                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('thumbnail')}</label>
                    <input
                      value={courseForm.thumbnailUrl}
                      onChange={e => handleCourseFormChange('thumbnailUrl', e.target.value)}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    {courseForm.thumbnailUrl && (
                      <img src={courseForm.thumbnailUrl} alt="Thumbnail preview" className="ip__thumb-preview" />
                    )}
                  </div>

                  <div className="ip__form-field ip__form-field--full">
                    <label>{i('previewVideo')}</label>
                    <input
                      value={courseForm.previewVideoUrl}
                      onChange={e => handleCourseFormChange('previewVideoUrl', e.target.value)}
                      placeholder="https://youtube.com/... or other video URL"
                    />
                  </div>

                  <div className="ip__pricing-section">
                    <h3>💰 Pricing</h3>
                    <div className="ip__free-toggle">
                      <label className="ip__toggle-label">
                        <input
                          type="checkbox"
                          checked={courseForm.isFree}
                          onChange={e => handleCourseFormChange('isFree', e.target.checked)}
                        />
                        <span className="ip__toggle-track" />
                        {i('isFree')}
                      </label>
                    </div>

                    {!courseForm.isFree && (
                      <div className="ip__form-grid">
                        <div className="ip__form-field">
                          <label>{i('price')}</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={courseForm.price}
                            onChange={e => handleCourseFormChange('price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="ip__form-field">
                          <label>{i('discountPrice')}</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={courseForm.discountPrice}
                            onChange={e => handleCourseFormChange('discountPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="ip__form-field">
                          <label>{i('currency')}</label>
                          <select value={courseForm.currency} onChange={e => handleCourseFormChange('currency', e.target.value)}>
                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="ip__form-field">
                          <label>Publish Status</label>
                          <select
                            value={courseForm.isPublished ? 'published' : 'draft'}
                            onChange={e => handleCourseFormChange('isPublished', e.target.value === 'published')}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Curriculum ── */}
              {activeFormTab === 'curriculum' && (
                <div className="ip__form-section">
                  <div className="ip__curriculum-header">
                    <h3>{i('sections')}</h3>
                    <button className="ip__btn ip__btn--outline" onClick={addSection}>
                      <Icon path={icons.plus} size={14} />
                      {i('addSection')}
                    </button>
                  </div>

                  {courseForm.sections.length === 0 ? (
                    <div className="ip__curriculum-empty">
                      <p>No sections yet. Add your first section to organize your course content.</p>
                      <button className="ip__btn ip__btn--primary" onClick={addSection}>
                        {i('addSection')}
                      </button>
                    </div>
                  ) : (
                    courseForm.sections.map((section, sIdx) => (
                      <div key={section.id} className="ip__section-block">
                        <div className="ip__section-header">
                          <div className="ip__section-number">Section {sIdx + 1}</div>
                          <input
                            className="ip__section-title-input"
                            value={section.title}
                            onChange={e => updateSection(sIdx, 'title', e.target.value)}
                            placeholder="Section title"
                          />
                          <button className="ip__btn-icon ip__btn-icon--danger" onClick={() => removeSection(sIdx)}>
                            <Icon path={icons.trash} size={15} />
                          </button>
                        </div>

                        <div className="ip__lectures">
                          {(section.lectures || []).map((lecture, lIdx) => (
                            <div key={lecture.id} className="ip__lecture">
                              <div className="ip__lecture-num">{lIdx + 1}</div>
                              <div className="ip__lecture-fields">
                                <input
                                  value={lecture.title}
                                  onChange={e => updateLecture(sIdx, lIdx, 'title', e.target.value)}
                                  placeholder={i('lectureTitle')}
                                />
                                <input
                                  value={lecture.videoUrl}
                                  onChange={e => updateLecture(sIdx, lIdx, 'videoUrl', e.target.value)}
                                  placeholder={i('lectureVideo')}
                                />
                                <div className="ip__lecture-meta">
                                  <input
                                    type="number" min="0"
                                    value={lecture.durationMinutes}
                                    onChange={e => updateLecture(sIdx, lIdx, 'durationMinutes', parseInt(e.target.value) || 0)}
                                    placeholder="Min"
                                    className="ip__lecture-duration"
                                  />
                                  <label className="ip__free-check">
                                    <input
                                      type="checkbox"
                                      checked={lecture.isFree}
                                      onChange={e => updateLecture(sIdx, lIdx, 'isFree', e.target.checked)}
                                    />
                                    {i('isFreePreview')}
                                  </label>
                                  <select
                                    value={lecture.lectureType}
                                    onChange={e => updateLecture(sIdx, lIdx, 'lectureType', e.target.value)}
                                    className="ip__lecture-type"
                                  >
                                    <option>Video</option>
                                    <option>Article</option>
                                    <option>Quiz</option>
                                  </select>
                                </div>
                              </div>
                              <button className="ip__btn-icon ip__btn-icon--danger" onClick={() => removeLecture(sIdx, lIdx)}>
                                <Icon path={icons.x} size={14} />
                              </button>
                            </div>
                          ))}
                          <button className="ip__add-lecture" onClick={() => addLecture(sIdx)}>
                            <Icon path={icons.plus} size={14} />
                            {i('addLecture')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Translations ── */}
              {activeFormTab === 'translations' && (
                <div className="ip__form-section">
                  <div className="ip__translations-header">
                    <h3>🌍 {i('aiTranslate')}</h3>
                    <button className="ip__btn ip__btn--ai" onClick={handleAutoTranslate}>
                      ✨ Auto-Translate to 31 Languages
                    </button>
                  </div>
                  <p className="ip__translations-hint">
                    Auto-translate generates translations for all 31 languages based on your English content.
                    You can also manually edit each language below.
                  </p>

                  <div className="ip__translations-grid">
                    {LANGS_31.filter(l => l.code !== 'en').slice(0, 15).map(lang => (
                      <div key={lang.code} className="ip__translation-card">
                        <div className="ip__translation-lang">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          {courseForm.translations[lang.code] && (
                            <span className="ip__translation-done">✓</span>
                          )}
                        </div>
                        <input
                          value={courseForm.translations[lang.code]?.title || ''}
                          onChange={e => setCourseForm(f => ({
                            ...f,
                            translations: {
                              ...f.translations,
                              [lang.code]: { ...(f.translations[lang.code] || {}), title: e.target.value }
                            }
                          }))}
                          placeholder={`${lang.flag} Title in ${lang.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ip__modal-footer">
              <button className="ip__btn ip__btn--ghost" onClick={() => setCourseModal(false)}>
                {i('cancel')}
              </button>
              <button className="ip__btn ip__btn--primary" onClick={handleSaveCourse} disabled={isSaving}>
                {isSaving ? <span className="ip__spinner" /> : (courseMode === 'add' ? i('create') : i('save'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      {deleteModal && (
        <div className="ip__modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className="ip__modal ip__modal--small">
            <div className="ip__modal-header">
              <h2>⚠️ Delete Course</h2>
              <button className="ip__modal-close" onClick={() => setDeleteModal(null)}>
                <Icon path={icons.x} size={20} />
              </button>
            </div>
            <div className="ip__modal-body">
              <p className="ip__confirm-text">
                Are you sure you want to delete <strong>"{deleteModal.title}"</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="ip__modal-footer">
              <button className="ip__btn ip__btn--ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="ip__btn ip__btn--danger" onClick={handleDeleteCourse}>Delete Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function CourseCard({ course, onEdit, onDelete, onPublish, i }) {
  return (
    <div className="ip__course-card">
      <div className="ip__course-thumb">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} />
        ) : (
          <div className="ip__course-thumb-placeholder">📚</div>
        )}
        <div className={`ip__course-status ${course.isPublished ? 'published' : 'draft'}`}>
          {course.isPublished ? i('published') : i('draft')}
        </div>
      </div>
      <div className="ip__course-info">
        <h3 className="ip__course-title">{course.title}</h3>
        <p className="ip__course-desc">{course.shortDescription || course.description}</p>
        <div className="ip__course-meta">
          <span>📊 {course.level}</span>
          <span>👥 {course.totalStudents || 0} students</span>
          <span>⭐ {(course.rating || 0).toFixed(1)}</span>
          <span>💵 {course.isFree ? 'Free' : `$${course.price}`}</span>
        </div>
      </div>
      <div className="ip__course-actions">
        <button className="ip__btn-icon" onClick={onEdit} title="Edit">
          <Icon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
        </button>
        <button className="ip__btn-icon" onClick={onPublish} title={course.isPublished ? 'Unpublish' : 'Publish'}>
          <Icon path={course.isPublished ? "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"} size={15} />
        </button>
        <button className="ip__btn-icon ip__btn-icon--danger" onClick={onDelete} title="Delete">
          <Icon path="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" size={15} />
        </button>
      </div>
    </div>
  );
}

function CourseTableRow({ course, onEdit, onDelete, onPublish, i }) {
  return (
    <div className="ip__table-row">
      <div className="ip__table-course">
        <div className="ip__table-thumb">
          {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" /> : <span>📚</span>}
        </div>
        <div>
          <div className="ip__table-course-title">{course.title}</div>
          <div className="ip__table-course-cat">{course.category}</div>
        </div>
      </div>
      <span className="ip__table-tag">{course.level}</span>
      <span>{course.totalStudents || 0}</span>
      <span>${(course.price * (course.totalStudents || 0)).toFixed(0)}</span>
      <span>⭐ {(course.rating || 0).toFixed(1)}</span>
      <span className={`ip__status-badge ${course.isPublished ? 'published' : 'draft'}`}>
        {course.isPublished ? i('published') : i('draft')}
      </span>
      <div className="ip__table-actions">
        <button className="ip__btn-icon" onClick={onEdit}><Icon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} /></button>
        <button className="ip__btn-icon" onClick={onPublish}>
          <Icon path={course.isPublished ? "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8" : "M1 12s4-8 11-8 11 8 11 8"} size={15} />
        </button>
        <button className="ip__btn-icon ip__btn-icon--danger" onClick={onDelete}><Icon path="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" size={15} /></button>
      </div>
    </div>
  );
}

function StudentsTab({ courses, instructorEmail, i }) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || null);
  const { data: students = [], isLoading } = useGetCourseStudentsQuery(
    { courseId: selectedCourse, email: instructorEmail },
    { skip: !selectedCourse }
  );

  return (
    <div className="ip__students">
      <div className="ip__page-header">
        <h1 className="ip__page-title">{i('students')}</h1>
        <p className="ip__page-subtitle">All students enrolled in your courses</p>
      </div>

      <div className="ip__students-filter">
        <label>Filter by Course:</label>
        <select value={selectedCourse || ''} onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="ip__loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="ip__empty">
          <div className="ip__empty-icon">👥</div>
          <p>{i('noStudents')}</p>
        </div>
      ) : (
        <div className="ip__students-table">
          <div className="ip__students-header">
            <span>{i('studentName')}</span>
            <span>{i('studentEmail')}</span>
            <span>{i('enrolledAt')}</span>
            <span>{i('progress')}</span>
            <span>{i('status')}</span>
            <span>Price Paid</span>
          </div>
          {students.map(s => (
            <div key={s.id} className="ip__students-row">
              <span>{s.studentName || 'Student'}</span>
              <span>{s.studentEmail}</span>
              <span>{new Date(s.enrolledAt).toLocaleDateString()}</span>
              <div className="ip__progress-bar">
                <div className="ip__progress-fill" style={{ width: `${s.progress || 0}%` }} />
                <span>{s.progress || 0}%</span>
              </div>
              <span className={`ip__status-badge ${s.status?.toLowerCase()}`}>{s.status}</span>
              <span>${s.pricePaid}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ analytics, courses, i }) {
  const maxRevenue = analytics?.monthlyRevenue?.length
    ? Math.max(...(analytics.monthlyRevenue.map(m => m.revenue || 0)), 1)
    : 1;

  return (
    <div className="ip__analytics">
      <div className="ip__page-header">
        <h1 className="ip__page-title">{i('analytics')}</h1>
        <p className="ip__page-subtitle">Performance insights for your courses</p>
      </div>

      {/* Top Stats */}
      <div className="ip__stats-grid">
        {[
          { label: i('totalCourses'), value: analytics?.totalCourses || courses.length, color: '#7A5CFF' },
          { label: 'Published', value: analytics?.publishedCourses || 0, color: '#10b981' },
          { label: i('totalStudents'), value: analytics?.totalStudents || 0, color: '#f59e0b' },
          { label: i('totalRevenue'), value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`, color: '#ec4899' },
          { label: i('avgRating'), value: `${(analytics?.averageRating || 0).toFixed(1)} ★`, color: '#f59e0b' },
        ].map((s, idx) => (
          <div key={idx} className="ip__stat-card" style={{ '--accent': s.color }}>
            <div className="ip__stat-value">{s.value}</div>
            <div className="ip__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {analytics?.monthlyRevenue?.length > 0 && (
        <div className="ip__chart-card">
          <h3>📈 Monthly Revenue (Last 6 Months)</h3>
          <div className="ip__bar-chart">
            {analytics.monthlyRevenue.map((month, idx) => (
              <div key={idx} className="ip__bar-item">
                <div className="ip__bar-track">
                  <div
                    className="ip__bar-fill"
                    style={{ height: `${Math.max((month.revenue / maxRevenue) * 100, 2)}%` }}
                  />
                </div>
                <div className="ip__bar-label">{month.month?.split(' ')[0]}</div>
                <div className="ip__bar-value">${month.revenue?.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Courses */}
      {analytics?.topCourses?.length > 0 && (
        <div className="ip__chart-card">
          <h3>🏆 Top Performing Courses</h3>
          <div className="ip__top-courses">
            {analytics.topCourses.map((c, idx) => (
              <div key={c.courseId} className="ip__top-course-row">
                <span className="ip__rank">#{idx + 1}</span>
                <span className="ip__tc-title">{c.courseTitle}</span>
                <span className="ip__tc-students">👥 {c.enrollments}</span>
                <span className="ip__tc-revenue">💵 ${c.revenue?.toFixed(0)}</span>
                <span className="ip__tc-rating">⭐ {c.rating?.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analytics && (
        <div className="ip__empty">
          <div className="ip__empty-icon">📊</div>
          <p>Analytics will appear once you have enrolled students.</p>
        </div>
      )}
    </div>
  );
}

export default InstructorPortalPage;
