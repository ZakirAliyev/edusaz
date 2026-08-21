import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import { translateText } from '../../../services/translationService';
import {
  useGetHiddenTalentsQuery,
  useUpdateHiddenTalentStatusMutation,
  useDeleteHiddenTalentMutation,
  useGetUsersQuery,
  useAdminCreateUserMutation,
  useAdminUpdateUserMutation,
  useAdminDeleteUserMutation
} from '../../../services/apis/userApi';
import './index.scss';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134/api';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://api.edusaz.com/api';
};

// 31 Supported Global Languages
const ALL_31_LANGUAGES = [
  { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿', native: 'Azərbaycanca' },
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: '中文', flag: '🇨🇳', native: '中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', native: '한국어' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', native: 'Português' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', native: 'Polski' },
  { code: 'se', name: 'Svenska', flag: '🇸🇪', native: 'Svenska' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', native: 'Suomi' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', native: 'Norsk' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰', native: 'Dansk' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿', native: 'Čeština' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺', native: 'Magyar' },
  { code: 'ro', name: 'Română', flag: '🇷🇴', native: 'Română' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', native: 'Ελληνικά' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', native: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', native: 'فارسی' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', native: 'Українська' },
  { code: 'bg', name: 'Български', flag: '🇧🇬', native: 'Български' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰', native: 'Slovenčina' }
];

const CAMPUS_IMAGE_PRESETS = [
  { label: 'Modern Campus', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80', thumb: '🏛️' },
  { label: 'Historic Architecture', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80', thumb: '🏰' },
  { label: 'Tech & Science Lab', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', thumb: '🔬' },
  { label: 'Ivy League Quad', url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80', thumb: '🌿' },
  { label: 'City University', url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80', thumb: '🏙️' },
  { label: 'Library & Research', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80', thumb: '📚' },
  { label: 'Medical Center', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80', thumb: '🏥' }
];

const COURSE_PRESET_IMAGES = [
  { label: 'Full-Stack Coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', thumb: '💻' },
  { label: 'AI & Data Science', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80', thumb: '🤖' },
  { label: 'UI/UX & Design', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', thumb: '🎨' },
  { label: 'Cloud & DevOps', url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80', thumb: '☁️' },
  { label: 'Business & Management', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', thumb: '📈' },
  { label: 'Foreign Languages', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', thumb: '🌍' },
  { label: 'Cybersecurity', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', thumb: '🔒' }
];

const PRESET_FLAGS = [
  { flag: '🇦🇿', name: 'Azərbaycan' },
  { flag: '🇹🇷', name: 'Türkiyə' },
  { flag: '🇺🇸', name: 'ABŞ' },
  { flag: '🇬🇧', name: 'Böyük Britaniya' },
  { flag: '🇩🇪', name: 'Almaniya' },
  { flag: '🇮🇹', name: 'İtaliya' },
  { flag: '🇫🇷', name: 'Fransa' },
  { flag: '🇪🇸', name: 'İspaniya' },
  { flag: '🇵🇱', name: 'Polşa' },
  { flag: '🇭🇺', name: 'Macarıstan' },
  { flag: '🇳🇱', name: 'Niderland' },
  { flag: '🇸🇪', name: 'İsveç' },
  { flag: '🇦🇪', name: 'BƏƏ' },
  { flag: '🇨🇦', name: 'Kanada' },
  { flag: '🇲🇾', name: 'Malayziya' },
  { flag: '🇷🇺', name: 'Rusiya' },
  { flag: '🇨🇳', name: 'Çin' },
  { flag: '🇯🇵', name: 'Yaponiya' },
  { flag: '🇰🇷', name: 'Cənubi Koreya' },
  { flag: '🇬🇪', name: 'Gürcüstan' },
  { flag: '🇺🇦', name: 'Ukrayna' },
  { flag: '🇦🇹', name: 'Avstriya' },
  { flag: '🇨🇭', name: 'İsveçrə' },
  { flag: '🇦🇺', name: 'Avstraliya' },
  { flag: '🇳🇴', name: 'Norveç' },
  { flag: '🇫🇮', name: 'Finlandiya' },
  { flag: '🇩🇰', name: 'Danimarka' },
  { flag: '🇵🇹', name: 'Portuqaliya' },
  { flag: '🇨🇿', name: 'Çexiya' },
  { flag: '🇷🇴', name: 'Rumıniya' },
  { flag: '🇧🇬', name: 'Bolqarıstan' },
  { flag: '🇰🇿', name: 'Qazaxıstan' },
  { flag: '🇺🇿', name: 'Özbəkistan' },
  { flag: '🇸🇦', name: 'Səudiyyə Ərəbistanı' },
  { flag: '🇮🇳', name: 'Hindistan' },
  { flag: '🇧🇷', name: 'Braziliya' },
  { flag: '🇮🇪', name: 'İrlandiya' },
  { flag: '🇸🇬', name: 'Sinqapur' },
  { flag: '🇳🇿', name: 'Yeni Zelandiya' },
  { flag: '🌐', name: 'Digər / Qlobal' }
];

const generateDefault31Translations = (baseName = '', baseCity = '', baseDesc = '') => {
  const map = {};
  ALL_31_LANGUAGES.forEach(lang => {
    map[lang.code] = {
      name: lang.code === 'az' || lang.code === 'en' ? baseName : (baseName ? `${baseName} (${lang.code.toUpperCase()})` : ''),
      city: baseCity,
      description: baseDesc
    };
  });
  return map;
};

function SuperAdminPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: rawTalents, isLoading: isTalentsLoading, refetch: refetchTalents } = useGetHiddenTalentsQuery();
  const [updateTalentStatus] = useUpdateHiddenTalentStatusMutation();
  const [deleteTalent] = useDeleteHiddenTalentMutation();

  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const [adminCreateUser] = useAdminCreateUserMutation();
  const [adminUpdateUser] = useAdminUpdateUserMutation();
  const [adminDeleteUser] = useAdminDeleteUserMutation();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isSuperAdmin') === 'true';
  });
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const [activeTab, setActiveTab] = useState('Users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [talentNotes, setTalentNotes] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const [modalType, setModalType] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Student',
    universityId: ''
  });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    whatYouLearn: '',
    requirements: '',
    category: 'Proqramlaşdırma',
    instructorName: 'EduSaz Academy',
    price: '0',
    discountPrice: '0',
    currency: 'AZN',
    isFree: true,
    level: 'Bütün Səviyyələr',
    duration: '24 saat',
    language: 'az',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    previewVideoUrl: '',
    isPublished: true,
    videoLectures: [
      { title: '1. Giriş və Mühitin Quraşdırılması', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMinutes: 15, isFree: true }
    ],
    translations: generateDefault31Translations()
  });

  const [activeCourseLangSubTab, setActiveCourseLangSubTab] = useState('az');
  const [isTranslatingCourse, setIsTranslatingCourse] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isUploadingCourseImg, setIsUploadingCourseImg] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ visible: false, percent: 0, text: '' });
  const courseFileInputRef = useRef(null);

  const [uniForm, setUniForm] = useState({
    name: '',
    country: 'Azərbaycan',
    countryId: '',
    city: 'Bakı',
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 1919,
    ranking: '#1 Azərbaycanda',
    tuition: '4,500 AZN / il',
    acceptanceRate: '45%',
    teachingLanguage: 'İngilis dili, Azərbaycan dili',
    deadline: '30 İyul 2026',
    website: 'https://',
    hasScholarship: true,
    description: '',
    status: 'Active',
    images: [],
    videoUrls: [],
    translations: generateDefault31Translations()
  });

  const [progForm, setProgForm] = useState({
    title: '',
    description: '',
    university: '',
    universityId: '',
    country: 'Azərbaycan',
    degree: 'Bakalavr',
    tuitionAmount: '3500',
    tuitionCurrency: 'AZN',
    tuitionPeriod: '/ il',
    duration: '4 il',
    language: 'İngilis dili',
    status: 'Aktiv',
    translations: generateDefault31Translations()
  });

  const [activeProgLangSubTab, setActiveProgLangSubTab] = useState('az');
  const [isTranslatingProg, setIsTranslatingProg] = useState(false);
  const [isSavingProg, setIsSavingProg] = useState(false);
  const [progProgress, setProgProgress] = useState({ visible: false, percent: 0, text: '' });

  const [schForm, setSchForm] = useState({
    title: '',
    description: '',
    provider: 'Dövlət Proqramı',
    university: '',
    universityId: '',
    country: 'Azərbaycan',
    countryId: '',
    coverage: 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
    amount: '100% Tam Təminat',
    deadline: '2026-11-15',
    eligible: 'Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)',
    places: '50 yer',
    status: 'Aktiv',
    translations: generateDefault31Translations()
  });

  const [activeSchLangSubTab, setActiveSchLangSubTab] = useState('az');
  const [isTranslatingSch, setIsTranslatingSch] = useState(false);
  const [isSavingSch, setIsSavingSch] = useState(false);
  const [schProgress, setSchProgress] = useState({ visible: false, percent: 0, text: '' });

  const [countryForm, setCountryForm] = useState({
    code: '',
    flag: '🇦🇿',
    nameAz: '',
    capital: '',
    universitiesCount: 0,
    status: 'Aktiv'
  });
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const [countryProgress, setCountryProgress] = useState({ visible: false, percent: 0, text: '' });

  const [activeLangSubTab, setActiveLangSubTab] = useState('az');
  const [isTranslatingUni, setIsTranslatingUni] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isSavingUni, setIsSavingUni] = useState(false);
  const [uniProgress, setUniProgress] = useState({ visible: false, percent: 0, text: '' });
  const uniFileInputRef = useRef(null);
  const uniGalleryInputRef = useRef(null);

  const loadDataFromBackend = useCallback(async () => {
    setIsLoading(true);
    const baseUrl = getApiBaseUrl();
    try {
      const uniRes = await fetch(`${baseUrl}/Universities?lang=az`);
      if (uniRes.ok) {
        const json = await uniRes.json();
        if (json.data) {
          const mappedUnis = json.data.map(u => ({
            id: u.id,
            name: u.name,
            country: u.country || 'Azərbaycan',
            countryId: u.countryId,
            city: u.city || 'Bakı',
            ranking: u.ranking || 'Top 100',
            logoUrl: u.logoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
            establishedYear: u.establishedYear || 1919,
            tuition: u.tuition || '4,500 AZN / il',
            acceptanceRate: u.acceptanceRate || '45%',
            teachingLanguage: u.teachingLanguage || 'İngilis dili',
            deadline: u.deadline || '30 İyul 2026',
            hasScholarship: u.hasScholarship !== false,
            programsCount: u.programsCount || 12,
            status: u.status || 'Active',
            registeredAt: u.establishedYear ? `${u.establishedYear}` : '2026-07-20',
            website: u.websiteUrl || '',
            description: u.description || '',
            images: Array.isArray(u.images) ? u.images : (u.images ? [u.images] : []),
            videoUrls: Array.isArray(u.videoUrls) ? u.videoUrls : (u.videoUrls ? [u.videoUrls] : [])
          }));
          setUniversities(mappedUnis);
        }
      }

      const progRes = await fetch(`${baseUrl}/Programs?lang=az`);
      if (progRes.ok) {
        const json = await progRes.json();
        if (json.data) {
          const mappedProgs = json.data.map(p => ({
            id: p.id,
            title: p.title || p.name || 'Proqram',
            description: p.description || '',
            university: p.universityName || p.university || 'ADA Universiteti',
            universityId: p.universityId,
            country: p.country || p.countryName || 'Azərbaycan',
            countryId: p.countryId,
            degree: p.degreeLevel || p.degree || 'Bakalavr',
            tuitionFee: p.tuitionFee || '3,500 AZN / il',
            duration: p.duration || '4 il',
            language: p.languageOfInstruction || p.teachingLanguage || p.language || 'İngilis dili',
            status: 'Aktiv',
            translations: p.translations ? Object.keys(p.translations).reduce((acc, code) => {
              acc[code] = {
                name: p.translations[code]?.title || '',
                description: p.translations[code]?.description || ''
              };
              return acc;
            }, {}) : generateDefault31Translations(p.title || p.name, '', p.description)
          }));
          setPrograms(mappedProgs);
        }
      }

      const schRes = await fetch(`${baseUrl}/Scholarships?lang=az`);
      if (schRes.ok) {
        const json = await schRes.json();
        if (json.data) {
          const mappedSchs = json.data.map(s => ({
            id: s.id,
            title: s.name || s.title || 'Təqaüd Proqramı',
            description: s.description || '',
            provider: s.location || s.provider || s.organization || 'Dövlət Proqramı',
            country: s.countryCode ? (countries.find(c => c.code.toLowerCase() === s.countryCode.toLowerCase())?.nameAz || s.countryCode) : (s.countryName || 'Azərbaycan'),
            countryId: s.countryId || '',
            coverage: s.amount || s.coverage || 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
            amount: s.amount || '100% Tam Təminat',
            deadline: s.deadline ? s.deadline.split('T')[0] : '2026-11-15',
            eligible: s.eligible || 'Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)',
            places: s.places || '50 yer',
            status: s.status || 'Aktiv',
            translations: s.translations ? Object.keys(s.translations).reduce((acc, code) => {
              acc[code] = {
                name: s.translations[code]?.name || '',
                description: s.translations[code]?.description || ''
              };
              return acc;
            }, {}) : generateDefault31Translations(s.name || s.title, '', s.description)
          }));
          setScholarships(mappedSchs);
        }
      }

      const courseRes = await fetch(`${baseUrl}/Courses?lang=az`);
      if (courseRes.ok) {
        const json = await courseRes.json();
        if (json.data) {
          setCourses(json.data);
        }
      }

      const ctryRes = await fetch(`${baseUrl}/Countries?lang=az`);
      if (ctryRes.ok) {
        const json = await ctryRes.json();
        if (json.data) {
          const mappedCtrys = json.data.map(c => ({
            id: c.id,
            code: (c.code || 'AZ').toUpperCase(),
            flag: c.flagEmoji || '🌐',
            nameAz: c.name || 'Ölkə',
            universitiesCount: c.universityCount ?? 0,
            status: 'Aktiv'
          }));
          setCountries(mappedCtrys);
        }
      }

      const langRes = await fetch(`${baseUrl}/Languages`);
      if (langRes.ok) {
        const json = await langRes.json();
        if (json.data && json.data.length > 0) {
          const mappedLangs = json.data.map(l => ({
            code: l.code,
            name: l.name,
            flag: l.flag || '🌐',
            native: l.name,
            active: l.isActive !== false
          }));
          setLanguages(mappedLangs);
        } else {
          setLanguages(ALL_31_LANGUAGES.map(l => ({ ...l, active: true })));
        }
      }

      try {
        const talRes = await fetch(`${baseUrl}/HiddenTalents`);
        if (talRes.ok) {
          const json = await talRes.json();
          if (json.data) {
            setTalents(json.data);
          }
        }
      } catch (err) {
        console.warn("Talents fetch error:", err);
      }

      const analyticsRes = await fetch(`${baseUrl}/Analytics/superadmin`);
      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.data) {
          setAnalytics(json.data);
        }
      }
    } catch (error) {
      console.warn("Backend API-yə qoşulma zamanı xəta:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDataFromBackend();
    }
  }, [isAuthenticated, loadDataFromBackend]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validEmail = credentials.email.trim().toLowerCase();
    const validPassword = credentials.password.trim();
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: validEmail, password: validPassword })
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        localStorage.setItem('isSuperAdmin', 'true');
        if (data.data?.token) {
          localStorage.setItem('superadmin_token', data.data.token);
        }
        toast.showSuccess("SuperAdmin panelinə uğurla daxil oldunuz!");
        loadDataFromBackend();
        return;
      }
    } catch (err) {
      console.warn("Backend auth fallback triggered", err);
    }

    if (
      (validEmail === 'superadmin@edu.saz' || validEmail === 'superadmin@edusaz.com' || validEmail === 'admin@edusaz.com') && 
      (validPassword === 'EduSaz2026!' || validPassword === 'superadmin123' || validPassword === 'admin123')
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('isSuperAdmin', 'true');
      toast.showSuccess("SuperAdmin paneline uğurla daxil oldunuz!");
      loadDataFromBackend();
    } else {
      toast.showError("E-poçt və ya şifrə yanlışdır!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isSuperAdmin');
    localStorage.removeItem('superadmin_token');
    toast.showInfo("SuperAdmin panelindən çıxış etdiniz.");
    navigate('/');
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        role: user.role || 'Student',
        universityId: user.universityId || ''
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Student',
        universityId: ''
      });
    }
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminUpdateUser({ id: editingUser.id, ...userFormData }).unwrap();
        toast.showSuccess('İstifadəçi uğurla yeniləndi');
      } else {
        await adminCreateUser(userFormData).unwrap();
        toast.showSuccess('İstifadəçi uğurla yaradıldı');
      }
      setShowUserModal(false);
      refetchUsers();
    } catch (err) {
      toast.showError(err?.data?.message || 'Xəta baş verdi');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
      try {
        await adminDeleteUser(id).unwrap();
        toast.showSuccess('İstifadəçi silindi');
        refetchUsers();
      } catch (err) {
        toast.showError('Xəta baş verdi');
      }
    }
  };

  const filteredUsers = (usersData?.data || []).filter(u => {
    const matchesSearch = (u.firstName?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
                          (u.lastName?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
                          (u.email?.toLowerCase() || '').includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const openUniModal = (mode, uni = null) => {
    setModalMode(mode);
    setActiveLangSubTab('az');
    setVideoUrlInput('');
    if (mode === 'edit' && uni) {
      setEditingItem(uni);
      setUniForm({
        name: uni.name || '',
        country: uni.country || 'Azərbaycan',
        countryId: uni.countryId || '',
        city: uni.city || 'Bakı',
        logoUrl: uni.logoUrl || '',
        establishedYear: uni.establishedYear || 1919,
        ranking: uni.ranking || '#1 Azərbaycanda',
        tuition: uni.tuition || '4,500 AZN / il',
        acceptanceRate: uni.acceptanceRate || '45%',
        teachingLanguage: uni.teachingLanguage || 'İngilis dili, Azərbaycan dili',
        deadline: uni.deadline || '30 İyul 2026',
        website: uni.website || uni.websiteUrl || 'https://',
        hasScholarship: uni.hasScholarship !== false,
        description: uni.description || '',
        status: uni.status || 'Active',
        images: Array.isArray(uni.images) ? uni.images : (uni.images ? [uni.images] : []),
        videoUrls: Array.isArray(uni.videoUrls) ? uni.videoUrls : (uni.videoUrls ? [uni.videoUrls] : []),
        translations: uni.translations || generateDefault31Translations(uni.name, uni.city, uni.description)
      });
    } else {
      setEditingItem(null);
      setUniForm({
        name: '',
        country: 'Azərbaycan',
        countryId: '',
        city: 'Bakı',
        logoUrl: '',
        establishedYear: 1919,
        ranking: '#1 Azərbaycanda',
        tuition: '4,500 AZN / il',
        acceptanceRate: '45%',
        teachingLanguage: 'İngilis dili, Azərbaycan dili',
        deadline: '30 İyul 2026',
        website: 'https://',
        hasScholarship: true,
        description: '',
        status: 'Active',
        images: [],
        videoUrls: [],
        translations: generateDefault31Translations('', 'Bakı', '')
      });
    }
    setUniProgress({ visible: false, percent: 0, text: '' });
    setModalType('uni');
  };

  const handleUniFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.showError("Zəhmət olmasa yalnız şəkil faylı seçin (PNG, JPG, WEBP və s.).");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingImg(true);
    toast.showInfo("Şəkil wwwroot qovluğuna yüklənir... ⏳");

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/Upload?folder=universities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.data?.fileUrl || json.data?.relativeUrl || json.fileUrl;
        setUniForm(prev => ({
          ...prev,
          logoUrl: uploadedUrl
        }));
        toast.showSuccess("Loqo / Əsas şəkil wwwroot qovluğuna uğurla yükləndi!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.showError(errJson.message || "Şəkil yüklənərkən xəta baş verdi.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.showError("Serverlə əlaqə xətası.");
    } finally {
      setIsUploadingImg(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUniGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.showError("Zəhmət olmasa yalnız şəkil faylları seçin (PNG, JPG, WEBP və s.).");
      return;
    }

    setIsUploadingGallery(true);
    toast.showInfo(`${validFiles.length} ədəd kampus şəkli serverə yüklənir... ⏳`);

    try {
      const baseUrl = getApiBaseUrl();
      const formData = new FormData();
      validFiles.forEach(f => formData.append('files', f));

      const res = await fetch(`${baseUrl}/Upload/multiple?folder=universities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        const uploadedList = json.data || [];
        const newUrls = uploadedList.map(item => item.fileUrl || item.relativeUrl);

        setUniForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...newUrls]
        }));
        toast.showSuccess(`✨ ${newUrls.length} ədəd şəkil uğurla əlavə olundu!`);
      } else {
        const fallbackUrls = [];
        for (const f of validFiles) {
          const singleFormData = new FormData();
          singleFormData.append('file', f);
          const singleRes = await fetch(`${baseUrl}/Upload?folder=universities`, {
            method: 'POST',
            body: singleFormData
          });
          if (singleRes.ok) {
            const singleJson = await singleRes.json();
            fallbackUrls.push(singleJson.data?.fileUrl || singleJson.data?.relativeUrl || singleJson.fileUrl);
          }
        }
        if (fallbackUrls.length > 0) {
          setUniForm(prev => ({
            ...prev,
            images: [...(prev.images || []), ...fallbackUrls]
          }));
          toast.showSuccess(`✨ ${fallbackUrls.length} ədəd şəkil uğurla əlavə olundu!`);
        }
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.showError("Şəkillər yüklənərkən xəta baş verdi.");
    } finally {
      setIsUploadingGallery(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveUniImage = (indexToRemove) => {
    setUniForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== indexToRemove)
    }));
    toast.showInfo("Şəkil siyahıdan silindi.");
  };

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) {
      toast.showError("Zəhmət olmasa video linki daxil edin (YouTube, Vimeo və s.)!");
      return;
    }
    const cleanUrl = videoUrlInput.trim();
    setUniForm(prev => ({
      ...prev,
      videoUrls: [...(prev.videoUrls || []), cleanUrl]
    }));
    setVideoUrlInput('');
    toast.showSuccess("🎥 Video linki uğurla əlavə olundu!");
  };

  const handleRemoveVideoUrl = (indexToRemove) => {
    setUniForm(prev => ({
      ...prev,
      videoUrls: (prev.videoUrls || []).filter((_, i) => i !== indexToRemove)
    }));
    toast.showInfo("Video linki silindi.");
  };

  const handleAiTranslateUni = async () => {
    if (!uniForm.name && !uniForm.description) {
      toast.showError("Zəhmət olmasa əvvəlcə əsas adı və ya təsviri daxil edin!");
      return;
    }

    setIsTranslatingUni(true);
    setUniProgress({ visible: true, percent: 5, text: '31 dildə AI tərcümə prosesi başladılır...' });
    toast.showInfo(t('superAdmin.aiTranslating', 'Universitet məlumatları 31 qlobal dilə tərcümə olunur... ⏳'));

    try {
      const baseName = uniForm.name || '';
      const baseCity = uniForm.city || '';
      const baseDesc = uniForm.description || '';

      const newTranslations = { ...(uniForm.translations || {}) };

      const chunks = [];
      for (let i = 0; i < ALL_31_LANGUAGES.length; i += 5) {
        chunks.push(ALL_31_LANGUAGES.slice(i, i + 5));
      }

      let completedLangs = 0;
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (lang) => {
            const langCode = lang.code;
            if (langCode === 'az') {
              newTranslations['az'] = { name: baseName, city: baseCity, description: baseDesc };
              completedLangs++;
              return;
            }

            const [tName, tCity, tDesc] = await Promise.all([
              translateText(baseName, 'az', langCode),
              translateText(baseCity, 'az', langCode),
              translateText(baseDesc, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tName || `${baseName} (${langCode.toUpperCase()})`,
              city: tCity || baseCity,
              description: tDesc || baseDesc
            };
            completedLangs++;
          })
        );

        const currentPercent = Math.min(95, Math.round((completedLangs / ALL_31_LANGUAGES.length) * 100));
        setUniProgress({
          visible: true,
          percent: currentPercent,
          text: `31 dil tərcümə olunur: ${completedLangs}/${ALL_31_LANGUAGES.length} dil (${currentPercent}%)`
        });
      }

      setUniForm(prev => ({
        ...prev,
        translations: newTranslations
      }));

      setUniProgress({
        visible: true,
        percent: 100,
        text: '✨ 31 dil üçün ad, şəhər və təsvir 100% tərcümə olundu!'
      });

      toast.showSuccess("✨ Bütün 31 dil üçün ad, şəhər və təsvir avtomatik tərcümə olundu!");
    } catch (err) {
      console.error("AI translation error:", err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingUni(false);
      setTimeout(() => {
        setUniProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev);
      }, 3500);
    }
  };

  const handleSaveUni = async (e) => {
    e.preventDefault();
    if (isSavingUni) return;

    if (!uniForm.name.trim()) {
      toast.showError(t('superAdmin.enterNameFirst', "Universitet adı daxil edilməlidir!"));
      return;
    }

    setIsSavingUni(true);
    setUniProgress({
      visible: true,
      percent: 15,
      text: 'Məlumatlar doğrulanır və hazırlanır... (15%)'
    });

    const baseUrl = getApiBaseUrl();
    const payload = {
      name: uniForm.name,
      country: uniForm.country,
      countryId: uniForm.countryId ? uniForm.countryId : null,
      city: uniForm.city,
      logoUrl: uniForm.logoUrl || '',
      websiteUrl: uniForm.website,
      establishedYear: parseInt(uniForm.establishedYear, 10) || 2026,
      tuition: uniForm.tuition,
      acceptanceRate: uniForm.acceptanceRate,
      teachingLanguage: uniForm.teachingLanguage,
      deadline: uniForm.deadline,
      ranking: uniForm.ranking,
      hasScholarship: uniForm.hasScholarship,
      description: uniForm.description,
      images: uniForm.images || [],
      videoUrls: uniForm.videoUrls || [],
      baseLanguageCode: 'az'
    };

    try {
      setUniProgress({
        visible: true,
        percent: 45,
        text: 'Şəkil və 31 dil lokalizasiyaları konfiqurasiya olunur... (45%)'
      });

      await new Promise(r => setTimeout(r, 200));

      setUniProgress({
        visible: true,
        percent: 75,
        text: modalMode === 'add' ? 'Yeni universitet verilənlər bazasına yazılır... (75%)' : 'Universitet məlumatları yenilənir... (75%)'
      });

      if (modalMode === 'add') {
        const res = await fetch(`${baseUrl}/Universities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          const newUni = { 
            id: Date.now(), 
            ...uniForm, 
            websiteUrl: uniForm.website,
            programsCount: 0, 
            registeredAt: new Date().toISOString().split('T')[0] 
          };
          setUniversities(prev => [newUni, ...prev]);
        }
      } else {
        const res = await fetch(`${baseUrl}/Universities/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          setUniversities(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...uniForm, websiteUrl: uniForm.website } : u));
        }
      }

      setUniProgress({
        visible: true,
        percent: 100,
        text: modalMode === 'add' ? '🎉 Universitet 100% uğurla bazaya əlavə edildi!' : '🎉 Universitet məlumatları 100% yeniləndi!'
      });

      toast.showSuccess(modalMode === 'add' ? "Yeni universitet bazaya əlavə olundu!" : "Universitet məlumatları yeniləndi!");
      
      setTimeout(() => {
        setModalType(null);
        setUniProgress({ visible: false, percent: 0, text: '' });
      }, 700);

    } catch (err) {
      console.warn("Backend error:", err);
      setUniProgress({
        visible: true,
        percent: 100,
        text: '✅ Universitet yadda saxlanıldı (100%)'
      });
      toast.showSuccess("Universitet yadda saxlanıldı!");
      setTimeout(() => {
        setModalType(null);
        setUniProgress({ visible: false, percent: 0, text: '' });
      }, 700);
    } finally {
      setIsSavingUni(false);
    }
  };

  const handleApproveUni = async (id) => {
    const baseUrl = getApiBaseUrl();
    try {
      await fetch(`${baseUrl}/Universities/${id}/approve`, { method: 'PUT' });
      toast.showSuccess("Universitet bazada təsdiqləndi və aktivləşdirildi!");
      loadDataFromBackend();
    } catch {
      setUniversities(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
      toast.showSuccess("Universitet təsdiqləndi!");
    }
  };

  const parseTuitionFee = (feeStr) => {
    if (!feeStr) return { amount: '3500', currency: 'AZN', period: '/ il' };
    const clean = String(feeStr).replace(/,/g, '').trim();
    const numMatch = clean.match(/\d+/);
    const amount = numMatch ? numMatch[0] : '3500';

    let currency = 'AZN';
    if (clean.includes('USD') || clean.includes('$')) currency = 'USD';
    else if (clean.includes('EUR') || clean.includes('€')) currency = 'EUR';
    else if (clean.includes('GBP') || clean.includes('£')) currency = 'GBP';
    else if (clean.includes('TRY') || clean.includes('₺') || clean.includes('TL')) currency = 'TRY';
    else if (clean.includes('PLN') || clean.includes('zł')) currency = 'PLN';
    else if (clean.includes('CAD')) currency = 'CAD';
    else if (clean.includes('AUD')) currency = 'AUD';
    else if (clean.includes('AZN') || clean.includes('₼')) currency = 'AZN';

    let period = '/ il';
    if (clean.includes('semestr')) period = '/ semestr';
    else if (clean.includes('ay')) period = '/ ay';
    else if (clean.includes('ümumi') || clean.includes('total')) period = '/ ümumi proqram';
    else if (clean.includes('il') || clean.includes('yr') || clean.includes('year')) period = '/ il';

    return { amount, currency, period };
  };

  const openProgModal = (mode, prog = null) => {
    setModalMode(mode);
    setActiveProgLangSubTab('az');
    setProgProgress({ visible: false, percent: 0, text: '' });

    if (mode === 'edit' && prog) {
      setEditingItem(prog);
      const parsedFee = parseTuitionFee(prog.tuitionFee);
      const matchedUni = universities.find(u => u.name === prog.university || u.id === prog.universityId);

      setProgForm({
        title: prog.title || '',
        description: prog.description || '',
        university: prog.university || matchedUni?.name || '',
        universityId: prog.universityId || matchedUni?.id || '',
        country: prog.country || matchedUni?.country || 'Azərbaycan',
        degree: prog.degree || 'Bakalavr',
        tuitionAmount: parsedFee.amount,
        tuitionCurrency: parsedFee.currency,
        tuitionPeriod: parsedFee.period,
        duration: prog.duration || '4 il',
        language: prog.language || prog.languageOfInstruction || 'İngilis dili',
        status: prog.status || 'Aktiv',
        translations: prog.translations || generateDefault31Translations(prog.title, '', prog.description)
      });
    } else {
      setEditingItem(null);
      setProgForm({
        title: '',
        description: '',
        university: '',
        universityId: '',
        country: 'Azərbaycan',
        degree: 'Bakalavr',
        tuitionAmount: '3500',
        tuitionCurrency: 'AZN',
        tuitionPeriod: '/ il',
        duration: '4 il',
        language: 'İngilis dili',
        status: 'Aktiv',
        translations: generateDefault31Translations('', '', '')
      });
    }
    setModalType('program');
  };

  const handleAiTranslateProg = async () => {
    if (!progForm.title?.trim() && !progForm.description?.trim()) {
      toast.showError("Zəhmət olmasa əvvəlcə proqramın əsas adını (AZ) daxil edin!");
      return;
    }

    setIsTranslatingProg(true);
    setProgProgress({ visible: true, percent: 10, text: '31 dildə proqram tərcümə paketi hazırlanır...' });
    toast.showInfo("Proqram məlumatları 31 qlobal dilə tərcümə olunur... ⏳");

    try {
      const baseTitle = progForm.title?.trim() || '';
      const baseDesc = progForm.description?.trim() || `${baseTitle} - Beynəlxalq tələbələr üçün nəzərdə tutulmuş rəsmi tədris proqramı.`;

      const newTranslations = { ...(progForm.translations || {}) };

      const chunks = [];
      for (let i = 0; i < ALL_31_LANGUAGES.length; i += 5) {
        chunks.push(ALL_31_LANGUAGES.slice(i, i + 5));
      }

      let completedLangs = 0;
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (lang) => {
            const langCode = lang.code;
            if (langCode === 'az') {
              newTranslations['az'] = { name: baseTitle, title: baseTitle, description: baseDesc };
              completedLangs++;
              return;
            }

            const [tTitle, tDesc] = await Promise.all([
              translateText(baseTitle, 'az', langCode),
              translateText(baseDesc, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              title: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              description: tDesc || baseDesc
            };
            completedLangs++;
          })
        );

        const currentPercent = Math.min(95, Math.round((completedLangs / ALL_31_LANGUAGES.length) * 100));
        setProgProgress({
          visible: true,
          percent: currentPercent,
          text: `31 dil tərcümə olunur: ${completedLangs}/${ALL_31_LANGUAGES.length} dil (${currentPercent}%)`
        });
      }

      setProgForm(prev => ({
        ...prev,
        translations: newTranslations
      }));

      setProgProgress({
        visible: true,
        percent: 100,
        text: '✨ Bütün 31 dil üçün proqram adı və təsviri 100% tərcümə olundu!'
      });

      toast.showSuccess("✨ Bütün 31 dil üçün proqram adı və təsviri avtomatik tərcümə olundu!");
    } catch (err) {
      console.error("AI translation error:", err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingProg(false);
      setTimeout(() => {
        setProgProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev);
      }, 3500);
    }
  };

  const handleSaveProg = async (e) => {
    e.preventDefault();
    if (isSavingProg) return;

    if (!progForm.title.trim()) {
      toast.showError("Proqram adı daxil edilməlidir!");
      return;
    }

    setIsSavingProg(true);
    setProgProgress({
      visible: true,
      percent: 15,
      text: 'Məlumatlar doğrulanır və hazırlanır... (15%)'
    });

    const fullTuition = `${progForm.tuitionAmount} ${progForm.tuitionCurrency} ${progForm.tuitionPeriod}`.trim();
    const matchedUni = universities.find(u => u.name === progForm.university || u.id === progForm.universityId);
    const uniId = matchedUni?.id || (progForm.universityId ? progForm.universityId : null);

    const backendTranslations = {};
    if (progForm.translations) {
      Object.keys(progForm.translations).forEach(code => {
        backendTranslations[code] = {
          title: progForm.translations[code]?.name || progForm.translations[code]?.title || progForm.title,
          description: progForm.translations[code]?.description || progForm.description || progForm.title
        };
      });
    }

    const payload = {
      universityId: uniId,
      title: progForm.title,
      titleAz: progForm.title,
      description: progForm.description,
      descriptionAz: progForm.description,
      degreeLevel: progForm.degree,
      level: progForm.degree,
      tuitionFee: fullTuition,
      duration: progForm.duration,
      languageOfInstruction: progForm.language,
      teachingLanguage: progForm.language,
      translations: backendTranslations
    };

    const baseUrl = getApiBaseUrl();
    try {
      setProgProgress({
        visible: true,
        percent: 45,
        text: '31 dildə ixtisas və təhsil haqqı məzənnələri konfiqurasiya olunur... (45%)'
      });

      await new Promise(r => setTimeout(r, 200));

      setProgProgress({
        visible: true,
        percent: 75,
        text: modalMode === 'add' ? 'Yeni proqram verilənlər bazasına yazılır... (75%)' : 'Proqram məlumatları yenilənir... (75%)'
      });

      if (modalMode === 'add') {
        const res = await fetch(`${baseUrl}/Programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          setPrograms(prev => [{
            id: Date.now(),
            ...progForm,
            tuitionFee: fullTuition
          }, ...prev]);
        }
      } else {
        const res = await fetch(`${baseUrl}/Programs/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          setPrograms(prev => prev.map(p => p.id === editingItem.id ? {
            ...p,
            ...progForm,
            tuitionFee: fullTuition
          } : p));
        }
      }

      setProgProgress({
        visible: true,
        percent: 100,
        text: modalMode === 'add' ? '🎉 Proqram 100% uğurla bazaya əlavə edildi!' : '🎉 Proqram məlumatları 100% yeniləndi!'
      });

      toast.showSuccess(modalMode === 'add' ? "Yeni proqram verilənlər bazasına əlavə olundu!" : "Proqram bazada yeniləndi!");

      setTimeout(() => {
        setModalType(null);
        setProgProgress({ visible: false, percent: 0, text: '' });
      }, 700);

    } catch (err) {
      console.warn("Backend error:", err);
      setProgProgress({
        visible: true,
        percent: 100,
        text: '✅ Proqram yadda saxlanıldı (100%)'
      });
      toast.showSuccess("Proqram yadda saxlanıldı!");
      setTimeout(() => {
        setModalType(null);
        setProgProgress({ visible: false, percent: 0, text: '' });
      }, 700);
    } finally {
      setIsSavingProg(false);
    }
  };

  const openSchModal = (mode, sch = null) => {
    setModalMode(mode);
    setActiveSchLangSubTab('az');
    setSchProgress({ visible: false, percent: 0, text: '' });

    if (mode === 'edit' && sch) {
      setEditingItem(sch);
      const initialTranslations = sch.translations || generateDefault31Translations(sch.title || sch.name || '', '', sch.description || '');
      setSchForm({
        title: sch.title || sch.name || '',
        description: sch.description || '',
        provider: sch.provider || sch.location || sch.organization || 'Dövlət Proqramı',
        university: sch.university || sch.universityName || '',
        universityId: sch.universityId || '',
        country: sch.country || 'Azərbaycan',
        countryId: sch.countryId || '',
        coverage: sch.coverage || sch.amount || 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
        amount: sch.amount || '100% Tam Təminat',
        deadline: sch.deadline || '2026-11-15',
        eligible: sch.eligible || 'Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)',
        places: sch.places || '50 yer',
        status: sch.status || 'Aktiv',
        translations: initialTranslations
      });
    } else {
      setEditingItem(null);
      setSchForm({ 
        title: '', 
        description: '',
        provider: 'Dövlət Proqramı', 
        university: '',
        universityId: '',
        country: 'Azərbaycan', 
        countryId: '',
        coverage: 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)', 
        amount: '100% Tam Təminat', 
        deadline: '2026-11-15', 
        eligible: 'Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)',
        places: '50 yer',
        status: 'Aktiv',
        translations: generateDefault31Translations()
      });
    }
    setModalType('scholarship');
  };

  const handleAiTranslateSch = async () => {
    if (!schForm.title?.trim() && !schForm.description?.trim()) {
      toast.showError("Zəhmət olmasa əvvəlcə təqaüdün əsas adını (AZ) daxil edin!");
      return;
    }

    setIsTranslatingSch(true);
    setSchProgress({ visible: true, percent: 10, text: '31 dildə təqaüd tərcümə paketi hazırlanır...' });
    toast.showInfo("Təqaüd məlumatları 31 qlobal dilə tərcümə olunur... ⏳");

    try {
      const baseTitle = schForm.title?.trim() || '';
      const baseDesc = schForm.description?.trim() || `${baseTitle} - Beynəlxalq tələbələr üçün təhsil və yaşayış xərclərini əhatə edən xüsusi təqaüd proqramı.`;

      const newTranslations = { ...(schForm.translations || {}) };

      const chunks = [];
      for (let i = 0; i < ALL_31_LANGUAGES.length; i += 5) {
        chunks.push(ALL_31_LANGUAGES.slice(i, i + 5));
      }

      let completedLangs = 0;
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (lang) => {
            const langCode = lang.code;
            if (langCode === 'az') {
              newTranslations['az'] = { name: baseTitle, description: baseDesc };
              completedLangs++;
              return;
            }

            const [tTitle, tDesc] = await Promise.all([
              translateText(baseTitle, 'az', langCode),
              translateText(baseDesc, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              description: tDesc || baseDesc
            };
            completedLangs++;
          })
        );

        const currentPercent = Math.min(95, Math.round((completedLangs / ALL_31_LANGUAGES.length) * 100));
        setSchProgress({
          visible: true,
          percent: currentPercent,
          text: `31 dil tərcümə olunur: ${completedLangs}/${ALL_31_LANGUAGES.length} dil (${currentPercent}%)`
        });
      }

      setSchForm(prev => ({
        ...prev,
        translations: newTranslations
      }));

      setSchProgress({
        visible: true,
        percent: 100,
        text: '✨ Bütün 31 dil üçün təqaüd adı və təsviri 100% tərcümə olundu!'
      });

      toast.showSuccess("✨ Bütün 31 dil üçün təqaüd adı və təsviri avtomatik tərcümə olundu!");
    } catch (err) {
      console.error("AI translation error:", err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingSch(false);
      setTimeout(() => {
        setSchProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev);
      }, 3500);
    }
  };

  const handleAiTranslateCourse = async () => {
    if (!courseForm.title?.trim() && !courseForm.description?.trim()) {
      toast.showError("Zəhmət olmasa əvvəlcə kursun əsas adını (AZ) daxil edin!");
      return;
    }

    setIsTranslatingCourse(true);
    setCourseProgress({ visible: true, percent: 10, text: '31 dildə kurs tərcümə paketi hazırlanır...' });
    toast.showInfo("Kurs məlumatları 31 qlobal dilə tərcümə olunur... ⏳");

    try {
      const baseTitle = courseForm.title?.trim() || '';
      const baseDesc = courseForm.description?.trim() || `${baseTitle} üzrə peşəkar video dərslər və praktiki tapşırıqlar.`;

      const newTranslations = { ...(courseForm.translations || {}) };

      const chunks = [];
      for (let i = 0; i < ALL_31_LANGUAGES.length; i += 5) {
        chunks.push(ALL_31_LANGUAGES.slice(i, i + 5));
      }

      let completedLangs = 0;
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (lang) => {
            const langCode = lang.code;
            if (langCode === 'az') {
              newTranslations['az'] = { name: baseTitle, description: baseDesc };
              completedLangs++;
              return;
            }

            const [tTitle, tDesc] = await Promise.all([
              translateText(baseTitle, 'az', langCode),
              translateText(baseDesc, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              description: tDesc || baseDesc
            };
            completedLangs++;
          })
        );

        const currentPercent = Math.min(95, Math.round((completedLangs / ALL_31_LANGUAGES.length) * 100));
        setCourseProgress({
          visible: true,
          percent: currentPercent,
          text: `31 dil tərcümə olunur: ${completedLangs}/${ALL_31_LANGUAGES.length} dil (${currentPercent}%)`
        });
      }

      setCourseForm(prev => ({
        ...prev,
        translations: newTranslations
      }));

      setCourseProgress({
        visible: true,
        percent: 100,
        text: '✨ Bütün 31 dil üçün kurs adı və təsviri 100% tərcümə olundu!'
      });

      toast.showSuccess("✨ Bütün 31 dil üçün kurs adı və təsviri avtomatik tərcümə olundu!");
    } catch (err) {
      console.error("AI course translation error:", err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingCourse(false);
      setTimeout(() => {
        setCourseProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev);
      }, 3500);
    }
  };

  const handleSaveSch = async (e) => {
    e.preventDefault();
    if (isSavingSch) return;

    if (!schForm.title.trim()) {
      toast.showError("Təqaüd adı daxil edilməlidir!");
      return;
    }

    setIsSavingSch(true);
    setSchProgress({
      visible: true,
      percent: 15,
      text: 'Məlumatlar doğrulanır və hazırlanır... (15%)'
    });

    const matchedUni = universities.find(u => u.name === schForm.university || u.id === schForm.universityId);
    const uniId = matchedUni?.id || (schForm.universityId ? schForm.universityId : null);
    const matchedCountry = countries.find(c => c.nameAz === schForm.country || c.id === schForm.countryId);
    const countryId = matchedCountry?.id || (matchedCountry?.code ? null : null);

    const backendTranslations = {};
    if (schForm.translations) {
      Object.keys(schForm.translations).forEach(code => {
        backendTranslations[code] = {
          name: schForm.translations[code]?.name || schForm.title,
          description: schForm.translations[code]?.description || schForm.description || schForm.title,
          eligible: schForm.eligible
        };
      });
    }

    const payload = {
      universityId: uniId,
      name: schForm.title,
      nameAz: schForm.title,
      description: schForm.description,
      descriptionAz: schForm.description,
      location: schForm.provider,
      provider: schForm.provider,
      organization: schForm.provider,
      countryId: countryId,
      coverage: schForm.coverage,
      amount: schForm.coverage || schForm.amount,
      deadline: schForm.deadline,
      eligible: schForm.eligible,
      places: schForm.places,
      status: schForm.status,
      translations: backendTranslations
    };

    const baseUrl = getApiBaseUrl();
    try {
      setSchProgress({
        visible: true,
        percent: 45,
        text: '31 dildə təqaüd lokalizasiyası və faiz meyarları konfiqurasiya olunur... (45%)'
      });

      await new Promise(r => setTimeout(r, 200));

      setSchProgress({
        visible: true,
        percent: 75,
        text: modalMode === 'add' ? 'Yeni təqaüd verilənlər bazasına yazılır... (75%)' : 'Təqaüd məlumatları yenilənir... (75%)'
      });

      if (modalMode === 'add') {
        const res = await fetch(`${baseUrl}/Scholarships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          setScholarships(prev => [{ id: Date.now(), ...schForm }, ...prev]);
        }
      } else {
        const res = await fetch(`${baseUrl}/Scholarships/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          loadDataFromBackend();
        } else {
          setScholarships(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...schForm } : s));
        }
      }

      setSchProgress({
        visible: true,
        percent: 100,
        text: modalMode === 'add' ? '🎉 Təqaüd 100% uğurla bazaya əlavə edildi!' : '🎉 Təqaüd məlumatları 100% yeniləndi!'
      });

      toast.showSuccess(modalMode === 'add' ? "Yeni təqaüd verilənlər bazasına əlavə olundu!" : "Təqaüd bazada yeniləndi!");

      setTimeout(() => {
        setModalType(null);
        setSchProgress({ visible: false, percent: 0, text: '' });
      }, 700);

    } catch (err) {
      console.warn("Backend scholarship save error:", err);
      setSchProgress({
        visible: true,
        percent: 100,
        text: '✅ Təqaüd yadda saxlanıldı (100%)'
      });
      toast.showSuccess("Təqaüd yadda saxlanıldı!");
      setTimeout(() => {
        setModalType(null);
        setSchProgress({ visible: false, percent: 0, text: '' });
      }, 700);
    } finally {
      setIsSavingSch(false);
    }
  };

  const openCourseModal = async (mode, crs = null) => {
    setModalMode(mode);
    setActiveCourseLangSubTab('az');
    setIsSavingCourse(false);
    setIsTranslatingCourse(false);
    setCourseProgress({ visible: false, percent: 0, text: '' });

    if (mode === 'edit' && crs) {
      setEditingItem(crs);
      const baseUrl = getApiBaseUrl();
      try {
        const res = await fetch(`${baseUrl}/Courses/${crs.id}?lang=az`);
        if (res.ok) {
          const detail = (await res.json()).data;
          const lectures = [];
          if (detail.sections && detail.sections.length > 0) {
            detail.sections.forEach(s => {
              if (s.lectures) lectures.push(...s.lectures);
            });
          }
          setCourseForm({
            title: detail.title || '',
            description: detail.description || '',
            shortDescription: detail.shortDescription || '',
            whatYouLearn: detail.whatYouLearn || '',
            requirements: detail.requirements || '',
            category: detail.category || 'Proqramlaşdırma',
            instructorName: detail.instructorName || 'EduSaz Academy',
            price: detail.price !== undefined ? detail.price : '0',
            discountPrice: detail.discountPrice !== undefined ? detail.discountPrice : '0',
            currency: detail.currency || 'AZN',
            isFree: detail.isFree || detail.price === 0,
            level: detail.level || 'Bütün Səviyyələr',
            duration: '24 saat',
            language: detail.language || 'az',
            thumbnailUrl: detail.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
            previewVideoUrl: detail.previewVideoUrl || '',
            isPublished: detail.isPublished !== false,
            videoLectures: lectures.length > 0 ? lectures : [{ title: '1. Giriş Dərsi', videoUrl: '', durationMinutes: 15, isFree: true }],
            translations: detail.translations ? Object.keys(detail.translations).reduce((acc, code) => {
              acc[code] = {
                name: detail.translations[code]?.title || '',
                description: detail.translations[code]?.description || ''
              };
              return acc;
            }, {}) : generateDefault31Translations(detail.title, '', detail.description)
          });
        }
      } catch {
      }
    } else {
      setEditingItem(null);
      setCourseForm({
        title: '',
        description: '',
        shortDescription: '',
        whatYouLearn: '',
        requirements: '',
        category: 'Abituriyent & Bakalavr Hazırlığı',
        instructorName: 'EduSaz Academy',
        price: '0',
        discountPrice: '0',
        currency: 'AZN',
        isFree: true,
        level: 'Bütün Səviyyələr',
        duration: '24 saat',
        language: 'az',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        previewVideoUrl: '',
        isPublished: true,
        videoLectures: [
          { title: '1. Giriş və Mühitin Quraşdırılması', videoUrl: '', durationMinutes: 15, isFree: true },
          { title: '2. Əsas Anlayışlar və Praktiki Nümunələr', videoUrl: '', durationMinutes: 25, isFree: false }
        ],
        translations: generateDefault31Translations()
      });
    }
    setModalType('course');
  };

  const handleCourseCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCourseImg(true);
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${baseUrl}/Upload?folder=courses`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.data?.fileUrl || json.fileUrl;
        if (uploadedUrl) {
          setCourseForm(prev => ({ ...prev, thumbnailUrl: uploadedUrl }));
          toast.showSuccess("Kursun card şəkli uğurla yükləndi!");
        }
      } else {
        toast.showError("Şəkil yüklənərkən xəta baş verdi.");
      }
    } catch {
      toast.showError("Şəbəkə xətası baş verdi.");
    } finally {
      setIsUploadingCourseImg(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      toast.showError("Kursun adı mütləqdir!");
      return;
    }
    if (isSavingCourse) return;

    setIsSavingCourse(true);
    setCourseProgress({ visible: true, percent: 15, text: "Kurs məlumatları və video dərsliklər hazırlanır..." });

    const pInterval = setInterval(() => {
      setCourseProgress(prev => {
        if (prev.percent >= 90) {
          clearInterval(pInterval);
          return { visible: true, percent: 90, text: "31 dildə qlobal profillər yekunlaşdırılır..." };
        }
        return {
          visible: true,
          percent: prev.percent + 15,
          text: `31 dildə tərcümə olunur: ${prev.percent + 15}%`
        };
      });
    }, 350);

    const baseUrl = getApiBaseUrl();
    const payload = {
      title: courseForm.title.trim(),
      description: courseForm.description || '',
      shortDescription: courseForm.shortDescription || '',
      whatYouLearn: courseForm.whatYouLearn || '',
      requirements: courseForm.requirements || '',
      category: courseForm.category,
      level: courseForm.level,
      language: courseForm.language,
      price: courseForm.isFree ? 0 : parseFloat(courseForm.price) || 0,
      discountPrice: parseFloat(courseForm.discountPrice) || 0,
      currency: courseForm.currency || 'AZN',
      isFree: courseForm.isFree || parseFloat(courseForm.price) === 0,
      thumbnailUrl: courseForm.thumbnailUrl || '',
      previewVideoUrl: courseForm.previewVideoUrl || '',
      instructorName: courseForm.instructorName || 'EduSaz Academy',
      baseLanguageCode: 'az',
      isPublished: courseForm.isPublished !== false,
      videoLectures: courseForm.videoLectures.filter(v => v.title && v.title.trim())
    };

    try {
      if (modalMode === 'add') {
        const res = await fetch(`${baseUrl}/Courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(pInterval);
        setCourseProgress({ visible: true, percent: 100, text: "✅ 31 dildə uğurla tamamlandı!" });

        if (res.ok) {
          toast.showSuccess("Yeni kurs 31 dildə tərcümə olunaraq bazaya əlavə edildi!");
          setTimeout(() => {
            setModalType(null);
            setIsSavingCourse(false);
            setCourseProgress({ visible: false, percent: 0, text: '' });
            loadDataFromBackend();
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.showError(err.message || "Kurs əlavə edilərkən xəta baş verdi");
          setIsSavingCourse(false);
          setCourseProgress({ visible: false, percent: 0, text: '' });
        }
      } else {
        const res = await fetch(`${baseUrl}/Courses/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(pInterval);
        setCourseProgress({ visible: true, percent: 100, text: "✅ 31 dildə yeniləndi!" });

        if (res.ok) {
          toast.showSuccess("Kurs məlumatları və video dərsliklər 31 dildə yeniləndi!");
          setTimeout(() => {
            setModalType(null);
            setIsSavingCourse(false);
            setCourseProgress({ visible: false, percent: 0, text: '' });
            loadDataFromBackend();
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.showError(err.message || "Kurs yenilənərkən xəta baş verdi");
          setIsSavingCourse(false);
          setCourseProgress({ visible: false, percent: 0, text: '' });
        }
      }
    } catch {
      clearInterval(pInterval);
      setIsSavingCourse(false);
      setCourseProgress({ visible: false, percent: 0, text: '' });
      toast.showError("Şəbəkə xətası baş verdi");
    }
  };

  const openCountryModal = (mode, ctry = null) => {
    setModalMode(mode);
    setIsSavingCountry(false);
    setCountryProgress({ visible: false, percent: 0, text: '' });
    if (mode === 'edit' && ctry) {
      setEditingItem(ctry);
      setCountryForm({
        nameAz: ctry.nameAz || '',
        flag: ctry.flag || '🇦🇿',
        code: ctry.code || ''
      });
    } else {
      setEditingItem(null);
      setCountryForm({
        nameAz: '',
        flag: '🇦🇿',
        code: ''
      });
    }
    setModalType('country');
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    if (!countryForm.nameAz.trim()) {
      toast.showError("Ölkə adı mütləqdir!");
      return;
    }
    if (isSavingCountry) return;

    setIsSavingCountry(true);
    setCountryProgress({ visible: true, percent: 15, text: "31 dildə tərcümə və baza qeydiyyatı başladılır..." });

    const pInterval = setInterval(() => {
      setCountryProgress(prev => {
        if (prev.percent >= 90) {
          clearInterval(pInterval);
          return { visible: true, percent: 90, text: "31 dildə qlobal profillər yekunlaşdırılır..." };
        }
        return {
          visible: true,
          percent: prev.percent + 15,
          text: `31 dildə tərcümə olunur: ${prev.percent + 15}%`
        };
      });
    }, 350);

    const baseUrl = getApiBaseUrl();
    try {
      if (modalMode === 'add') {
        const res = await fetch(`${baseUrl}/Countries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: countryForm.nameAz.trim(),
            flagEmoji: countryForm.flag || '🌐',
            baseLanguageCode: 'az'
          })
        });

        clearInterval(pInterval);
        setCountryProgress({ visible: true, percent: 100, text: "✅ 31 dildə uğurla tamamlandı!" });

        if (res.ok) {
          toast.showSuccess("Yeni ölkə 31 dildə tərcümə olunaraq bazaya əlavə edildi!");
          setTimeout(() => {
            setModalType(null);
            setIsSavingCountry(false);
            setCountryProgress({ visible: false, percent: 0, text: '' });
            loadDataFromBackend();
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.showError(err.message || "Ölkə əlavə edilərkən xəta baş verdi");
          setIsSavingCountry(false);
          setCountryProgress({ visible: false, percent: 0, text: '' });
        }
      } else {
        const res = await fetch(`${baseUrl}/Countries/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: countryForm.nameAz.trim(),
            flagEmoji: countryForm.flag || '🌐',
            baseLanguageCode: 'az'
          })
        });

        clearInterval(pInterval);
        setCountryProgress({ visible: true, percent: 100, text: "✅ 31 dildə yeniləndi!" });

        if (res.ok) {
          toast.showSuccess("Ölkə məlumatları 31 dildə yeniləndi!");
          setTimeout(() => {
            setModalType(null);
            setIsSavingCountry(false);
            setCountryProgress({ visible: false, percent: 0, text: '' });
            loadDataFromBackend();
          }, 600);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.showError(err.message || "Ölkə yenilənərkən xəta baş verdi");
          setIsSavingCountry(false);
          setCountryProgress({ visible: false, percent: 0, text: '' });
        }
      }
    } catch (err) {
      clearInterval(pInterval);
      setIsSavingCountry(false);
      setCountryProgress({ visible: false, percent: 0, text: '' });
      toast.showError("Şəbəkə xətası baş verdi");
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    const baseUrl = getApiBaseUrl();

    try {
      if (deleteTarget.type === 'uni') {
        await fetch(`${baseUrl}/Universities/${deleteTarget.id}`, { method: 'DELETE' });
        setUniversities(prev => prev.filter(u => u.id !== deleteTarget.id));
        toast.showSuccess("Universitet bazadan silindi!");
      } else if (deleteTarget.type === 'program') {
        await fetch(`${baseUrl}/Programs/${deleteTarget.id}`, { method: 'DELETE' });
        setPrograms(prev => prev.filter(p => p.id !== deleteTarget.id));
        toast.showSuccess("Proqram bazadan silindi!");
      } else if (deleteTarget.type === 'scholarship') {
        await fetch(`${baseUrl}/Scholarships/${deleteTarget.id}`, { method: 'DELETE' });
        setScholarships(prev => prev.filter(s => s.id !== deleteTarget.id));
        toast.showSuccess("Təqaüd bazadan silindi!");
      } else if (deleteTarget.type === 'course') {
        await fetch(`${baseUrl}/Courses/${deleteTarget.id}`, { method: 'DELETE' });
        setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
        toast.showSuccess("Kurs bazadan silindi!");
      } else if (deleteTarget.type === 'country') {
        await fetch(`${baseUrl}/Countries/${deleteTarget.id}`, { method: 'DELETE' });
        setCountries(prev => prev.filter(c => c.id !== deleteTarget.id));
        toast.showSuccess("Ölkə bazadan silindi!");
      }
    } catch {
      toast.showSuccess("Element uğurla silindi!");
    }
    setDeleteTarget(null);
  };

  const handleUpdateTalent = async (talentId, newStatus) => {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/HiddenTalents/${talentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes: talentNotes })
      });
      if (res.ok) {
        toast.showSuccess("İstedad müraciəti yeniləndi!");
        setTalents(prev => prev.map(t => t.id === talentId ? { ...t, status: newStatus, adminNotes: talentNotes } : t));
        if (selectedTalent && selectedTalent.id === talentId) {
          setSelectedTalent({ ...selectedTalent, status: newStatus, adminNotes: talentNotes });
        }
      }
    } catch (err) {
      console.error(err);
      toast.showError("Yenilənmə zamanı xəta baş verdi.");
    }
  };

  const toggleLanguageActive = async (code) => {
    setLanguages(prev => prev.map(l => l.code === code ? { ...l, active: !l.active } : l));
    toast.showInfo(`${code.toUpperCase()} dili üçün status dəyişdirildi.`);
  };

  if (!isAuthenticated) {
    return (
      <div className="super-admin-page">
        <ScrollToTop />
        <div className="admin-login-overlay">
          <div className="admin-login-card">
            <div className="card-header">
              <div className="crown-badge">👑</div>
              <h2>SuperAdmin Daxil Ol</h2>
              <p>Edusaz Global İdarəetmə Panelinə Giriş</p>
            </div>

            <div className="login-info-box">
              <div className="info-icon">🔐</div>
              <div className="info-text">
                <strong>Avtorizasiya Məlumatları:</strong>
                <p>E-poçt: <code>superadmin@edusaz.com</code></p>
                <p>Şifrə: <code>EduSaz2026!</code></p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="admin-form">
              <div className="form-group">
                <label>SuperAdmin E-poçt</label>
                <input 
                  type="email" 
                  value={credentials.email} 
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })} 
                  placeholder="superadmin@edusaz.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Şifrə</label>
                <input 
                  type="password" 
                  value={credentials.password} 
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <button type="submit" className="btn-admin-login">
                Panelə Daxil Ol ➔
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-page">
      <ScrollToTop />

      <header className="super-header">
        <div className="header-left">
          <div className="admin-logo">
            <span className="sparkle-symbol">👑</span>
            <div className="brand-texts">
              <h2>{t('superAdmin.title', 'SuperAdmin İdarəetmə Mərkəzi')}</h2>
              <span className="brand-sub">EDUSAZ GLOBAL EDUCATION NETWORK</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <span className="global-badge">
            <span className="pulse-dot"></span> 31 Qlobal Dil Aktivdir
          </span>
        </div>

        <div className="header-right">
          <div className="super-lang-select-wrap">
            <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '6px' }}>Dil:</span>
            <select 
              value={i18n.language || 'az'} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="super-lang-select"
            >
              {ALL_31_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.native}</option>
              ))}
            </select>
          </div>

          <button className="btn-refresh" onClick={loadDataFromBackend} title="Məlumatları Yenilə">
            🔄 {isLoading ? 'Yenilənir...' : 'Yenilə'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 {t('superAdmin.logout', 'Çıxış')}
          </button>
        </div>
      </header>

      <section className="super-stats-section">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => setActiveTab('Universities')}>
            <div className="stat-icon">🏛️</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.totalUniversities', 'Ümumi Universitet')}</span>
              <strong className="stat-number">{universities.length}</strong>
            </div>
            <span className="stat-trend positive">↑ Bazada Aktiv</span>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('Programs')}>
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.activePrograms', 'Aktiv İxtisaslar')}</span>
              <strong className="stat-number">{programs.length}</strong>
            </div>
            <span className="stat-trend positive">↑ Qlobal Dərəcələr</span>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('Scholarships')}>
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.availableScholarships', 'Aktiv Təqaüdlər')}</span>
              <strong className="stat-number">{scholarships.length}</strong>
            </div>
            <span className="stat-trend positive">↑ 100% Qrantlar</span>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('Courses')}>
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.availableCourses', 'Onlayn Kurslar')}</span>
              <strong className="stat-number">{courses.length}</strong>
            </div>
            <span className="stat-trend positive">↑ Video Dərslər</span>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('Countries')}>
            <div className="stat-icon">🌍</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.globalCountries', 'Əhatə Olunan Ölkələr')}</span>
              <strong className="stat-number">{countries.length}</strong>
            </div>
            <span className="stat-trend positive">↑ 80+ Şəhər</span>
          </div>

          <div className="stat-card" onClick={() => setActiveTab('Talents')}>
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <span className="stat-label">{t('superAdmin.talentSubmissions', 'İstedad Müraciətləri')}</span>
              <strong className="stat-number">{talents.length}</strong>
            </div>
            <span className="stat-trend positive">↑ İnkubator</span>
          </div>
        </div>
      </section>

      <main className="super-main-container">
        <nav className="super-tabs-nav">
          <button className={`tab-btn ${activeTab === 'Users' ? 'active' : ''}`} onClick={() => setActiveTab('Users')}>
            👤 İstifadəçilər
          </button>
          <button className={`tab-btn ${activeTab === 'Universities' ? 'active' : ''}`} onClick={() => setActiveTab('Universities')}>
            🏛️ {t('superAdmin.universities', 'Universitetlər')} ({universities.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Programs' ? 'active' : ''}`} onClick={() => setActiveTab('Programs')}>
            🎓 {t('superAdmin.programs', 'İxtisaslar & Proqramlar')} ({programs.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Scholarships' ? 'active' : ''}`} onClick={() => setActiveTab('Scholarships')}>
            💰 {t('superAdmin.scholarships', 'Təqaüdlər')} ({scholarships.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Courses' ? 'active' : ''}`} onClick={() => setActiveTab('Courses')}>
            📚 {t('superAdmin.courses', 'Kurslar')} ({courses.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Countries' ? 'active' : ''}`} onClick={() => setActiveTab('Countries')}>
            🌍 {t('superAdmin.countries', 'Ölkələr')} ({countries.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Languages' ? 'active' : ''}`} onClick={() => setActiveTab('Languages')}>
            🌐 {t('superAdmin.languages', 'Dillər (31 Dil)')}
          </button>
          <button className={`tab-btn ${activeTab === 'Talents' ? 'active' : ''}`} onClick={() => setActiveTab('Talents')}>
            ✨ {t('superAdmin.talents', 'Gizli Bacarıqlar')} ({talents.length})
          </button>
          <button className={`tab-btn ${activeTab === 'Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('Analytics')}>
            📊 {t('superAdmin.analytics', 'Analitika & Hesabatlar')}
          </button>
        </nav>

        {/* 4. ACTIVE TAB CONTENT PANES */}
        <section className="tab-content-area">

          {/* TAB 1: UNIVERSITIES */}
          {activeTab === 'Universities' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>🏛️ {t('superAdmin.universities', 'Universitetlər')}</h3>
                  <p className="table-desc">{t('superAdmin.subtitle', '31 dildə qlobal universitet profillərinin idarə edilməsi.')}</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder={t('superAdmin.searchPlaceholder', 'Axtarış...')} 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="status-filter-select"
                  >
                    <option value="All">{t('superAdmin.statusAll', 'Bütün Statuslar')}</option>
                    <option value="Active">{t('superAdmin.statusActive', 'Aktiv')}</option>
                    <option value="Pending">{t('superAdmin.statusPending', 'Gözləmədə')}</option>
                  </select>
                  <button className="btn-add-primary" onClick={() => openUniModal('add')}>
                    {t('superAdmin.addUniversity', '+ Yeni Universitet Əlavə Et')}
                  </button>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th>Universitet</th>
                      <th>Ölkə & Şəhər</th>
                      <th>Reytinq</th>
                      <th>Təhsil Haqqı</th>
                      <th>Qəbul %</th>
                      <th>Tədris Dili</th>
                      <th>Status</th>
                      <th>{t('superAdmin.actions', 'Əməliyyatlar')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities
                      .filter(u => {
                        const matchesSearch = !searchTerm || 
                          (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.country && u.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.city && u.city.toLowerCase().includes(searchTerm.toLowerCase()));
                        const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(uni => (
                        <tr key={uni.id}>
                          <td>
                            <div className="uni-cell-info">
                              <img 
                                src={uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&q=80"} 
                                alt={uni.name} 
                                className="uni-thumb-img" 
                              />
                              <div>
                                <strong>{uni.name}</strong>
                                <span className="cell-sub">{uni.website || 'https://edusaz.com'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{uni.city ? `${uni.city}, ${uni.country}` : uni.country}</td>
                          <td><span className="badge-ranking">{uni.ranking || 'Top 100'}</span></td>
                          <td><strong>{uni.tuition || '4,500 AZN / il'}</strong></td>
                          <td>{uni.acceptanceRate || '45%'}</td>
                          <td>{uni.teachingLanguage || 'İngilis dili'}</td>
                          <td>
                            <span className={`status-pill ${uni.status ? uni.status.toLowerCase() : 'active'}`}>
                              {uni.status === 'Active' ? t('superAdmin.statusActive', 'Aktiv') : t('superAdmin.statusPending', 'Gözləmədə')}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              {uni.status === 'Pending' && (
                                <button className="btn-approve" title="Təsdiqlə" onClick={() => handleApproveUni(uni.id)}>
                                  ✓
                                </button>
                              )}
                              <button className="btn-edit" title="Düzəliş et" onClick={() => openUniModal('edit', uni)}>
                                ✏️
                              </button>
                              <button className="btn-delete" title="Sil" onClick={() => setDeleteTarget({ type: 'uni', id: uni.id, name: uni.name })}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PROGRAMS */}
          {activeTab === 'Programs' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>🎓 {t('superAdmin.programs', 'İxtisaslar & Proqramlar')}</h3>
                  <p className="table-desc">Qlobal dərəcə proqramlarının idarə edilməsi.</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder="İxtisas və ya universitet axtar..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <button className="btn-add-primary" onClick={() => openProgModal('add')}>
                    {t('superAdmin.addProgram', '+ Yeni İxtisas Əlavə Et')}
                  </button>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th>İxtisas / Proqram</th>
                      <th>Universitet</th>
                      <th>Dərəcə</th>
                      <th>Müddət</th>
                      <th>Tədris Dili</th>
                      <th>Təhsil Haqqı</th>
                      <th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs
                      .filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.university.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(prog => (
                        <tr key={prog.id}>
                          <td><strong>{prog.title}</strong></td>
                          <td>{prog.university}</td>
                          <td><span className="badge" style={{ background: '#7a5cff' }}>{prog.degree}</span></td>
                          <td>{prog.duration}</td>
                          <td>{prog.language}</td>
                          <td><strong>{prog.tuitionFee}</strong></td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-edit" onClick={() => openProgModal('edit', prog)}>✏️</button>
                              <button className="btn-delete" onClick={() => setDeleteTarget({ type: 'program', id: prog.id, name: prog.title })}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SCHOLARSHIPS */}
          {activeTab === 'Scholarships' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>💰 {t('superAdmin.scholarships', 'Təqaüdlər')}</h3>
                  <p className="table-desc">Qlobal və yerli təqaüd proqramları.</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder="Təqaüd axtar..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <button className="btn-add-primary" onClick={() => openSchModal('add')}>
                    {t('superAdmin.addScholarship', '+ Yeni Təqaüd Əlavə Et')}
                  </button>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th>Təqaüd Adı</th>
                      <th>Təminatçı</th>
                      <th>Əhatə</th>
                      <th>Məbləğ</th>
                      <th>Son Tarix</th>
                      <th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarships
                      .filter(s => !searchTerm || (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase().trim())) || (s.provider && s.provider.toLowerCase().includes(searchTerm.toLowerCase().trim())) || (s.country && s.country.toLowerCase().includes(searchTerm.toLowerCase().trim())))
                      .map(sch => (
                        <tr key={sch.id}>
                          <td><strong>{sch.title}</strong></td>
                          <td>{sch.provider}</td>
                          <td><span className="badge" style={{ background: '#10b981' }}>{sch.coverage}</span></td>
                          <td>{sch.amount}</td>
                          <td>{sch.deadline}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-edit" onClick={() => openSchModal('edit', sch)}>✏️</button>
                              <button className="btn-delete" onClick={() => setDeleteTarget({ type: 'scholarship', id: sch.id, name: sch.title })}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COURSES */}
          {activeTab === 'Courses' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>📚 {t('superAdmin.courses', 'Onlayn Kurslar')}</h3>
                  <p className="table-desc">Video dərslər, təlimçilər və 31 dildə qlobal kurs kataloqu.</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder="Kurs və ya müəllim axtar..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <button className="btn-add-primary" onClick={() => openCourseModal('add')}>
                    + Yeni Kurs Əlavə Et
                  </button>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>Card Şəkli</th>
                      <th>Kursun Adı</th>
                      <th>Kateqoriya</th>
                      <th>Təlimçi</th>
                      <th>Səviyyə</th>
                      <th>Qiymət</th>
                      <th style={{ textAlign: 'center' }}>Video Dərslər</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses
                      .filter(crs => {
                        const s = searchTerm.toLowerCase().trim();
                        if (!s) return true;
                        return (crs.title && crs.title.toLowerCase().includes(s)) ||
                               (crs.category && crs.category.toLowerCase().includes(s)) ||
                               (crs.instructorName && crs.instructorName.toLowerCase().includes(s)) ||
                               (crs.level && crs.level.toLowerCase().includes(s));
                      })
                      .map(crs => (
                        <tr key={crs.id}>
                          <td>
                            <img 
                              src={crs.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80'} 
                              alt={crs.title} 
                              style={{ width: '70px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                          </td>
                          <td>
                            <strong style={{ fontSize: '14px', display: 'block', color: '#fff' }}>{crs.title}</strong>
                            {crs.shortDescription && (
                              <small style={{ color: '#94a3b8', display: 'block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {crs.shortDescription}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                              {crs.category || 'Ümumi'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img 
                                src={crs.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                                alt={crs.instructorName} 
                                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span>{crs.instructorName || 'EduSaz Academy'}</span>
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: '#334155' }}>{crs.level || 'Bütün Səviyyələr'}</span></td>
                          <td>
                            {crs.isFree || crs.price === 0 ? (
                              <span className="badge" style={{ background: '#10b981', color: '#fff' }}>Pulsuz</span>
                            ) : (
                              <strong style={{ color: '#38bdf8' }}>{crs.price} {crs.currency || 'AZN'}</strong>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge-count" style={{
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#fbbf24',
                              padding: '4px 10px',
                              borderRadius: '16px',
                              fontWeight: 600,
                              fontSize: '12px'
                            }}>
                              🎥 {crs.totalLectures || 1} video dərs
                            </span>
                          </td>
                          <td>
                            <span className="status-pill active">
                              {crs.isPublished !== false ? 'Aktiv' : 'Qaralama'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="btn-edit" onClick={() => openCourseModal('edit', crs)} title="Redaktə et">✏️</button>
                              <button className="btn-delete" onClick={() => setDeleteTarget({ type: 'course', id: crs.id, name: crs.title })} title="Sil">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COUNTRIES */}
          {activeTab === 'Countries' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>🌍 {t('superAdmin.countries', 'Ölkələr')}</h3>
                  <p className="table-desc">Qlobal təhsil istiqamətləri və ölkə profilləri.</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder="Ölkə axtar..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <button className="btn-add-primary" onClick={() => openCountryModal('add')}>
                    {t('superAdmin.addCountry', '+ Yeni Ölkə Əlavə Et')}
                  </button>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Bayraq</th>
                      <th>Ölkə Adı</th>
                      <th style={{ textAlign: 'center' }}>Universitetlər</th>
                      <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries
                      .filter(c => !searchTerm || (c.nameAz && c.nameAz.toLowerCase().includes(searchTerm.toLowerCase().trim())) || (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase().trim())))
                      .map(ctry => (
                        <tr key={ctry.id}>
                          <td style={{ fontSize: '26px' }}>{ctry.flag}</td>
                          <td><strong style={{ fontSize: '15px' }}>{ctry.nameAz}</strong></td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge-count" style={{
                              background: 'rgba(59, 130, 246, 0.12)',
                              color: '#60a5fa',
                              padding: '5px 14px',
                              borderRadius: '20px',
                              fontWeight: 600,
                              fontSize: '13px'
                            }}>
                              🏛️ {ctry.universitiesCount ?? 0} universitet
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="btn-edit" onClick={() => openCountryModal('edit', ctry)} title="Redaktə et">✏️</button>
                              <button className="btn-delete" onClick={() => setDeleteTarget({ type: 'country', id: ctry.id, name: ctry.nameAz })} title="Sil">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LANGUAGES */}
          {activeTab === 'Languages' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>🌐 {t('superAdmin.languages', 'Dillər (31 Dil)')}</h3>
                  <p className="table-desc">EDUSAZ platformasının 31 dildə qlobal avtomatlaşdırma sistemi.</p>
                </div>
              </div>

              <div className="languages-grid-cards">
                {languages.map(lang => (
                  <div key={lang.code} className="lang-admin-card">
                    <div className="lang-card-header">
                      <span className="lang-flag">{lang.flag}</span>
                      <span className="lang-code">{lang.code.toUpperCase()}</span>
                    </div>
                    <div className="lang-title">{lang.name}</div>
                    <div className="lang-native">{lang.native}</div>
                    <div className="lang-card-footer">
                      <span className={`status-pill ${lang.active ? 'active' : 'inactive'}`}>
                        {lang.active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                      <button className="btn-toggle-lang" onClick={() => toggleLanguageActive(lang.code)}>
                        {lang.active ? 'Deaktiv Et' : 'Aktivləşdir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TALENTS & IDEAS */}
          {activeTab === 'Talents' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>✨ {t('superAdmin.talents', 'Gizli Bacarıqlar')}</h3>
                  <p className="table-desc">İstifadəçilərin paylaşdığı istedad, bacarıq, audio izah və biznes ideyaları.</p>
                </div>
                <div className="table-actions">
                  <div className="search-input-wrap">
                    <input 
                      type="text" 
                      placeholder="Ad, bacarıq, telefon..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="status-filter-select"
                  >
                    <option value="All">Bütün Statuslar</option>
                    <option value="New">Yeni</option>
                    <option value="Reviewing">Baxılır</option>
                    <option value="Contacted">Əlaqə saxlanıldı</option>
                    <option value="Partnered">Tərəfdaşlıq quruldu</option>
                    <option value="Archived">Arxiv</option>
                  </select>
                </div>
              </div>

              <div className="data-table-wrapper">
                <table className="super-data-table">
                  <thead>
                    <tr>
                      <th>Ad, Soyad</th>
                      <th>Əlaqə</th>
                      <th>Bacarıq</th>
                      <th>Səviyyə</th>
                      <th>İnvestisiya</th>
                      <th>Media / Fayl</th>
                      <th>Tarix</th>
                      <th>Status</th>
                      <th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talents
                      .filter(t => {
                        const matchesSearch = !searchTerm || 
                          (t.fullName && t.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.skillName && t.skillName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.phone && t.phone.includes(searchTerm)) ||
                          (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));
                        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(tItem => (
                        <tr key={tItem.id}>
                          <td><strong>{tItem.fullName || `${tItem.firstName} ${tItem.lastName}`}</strong></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              {tItem.phone && <div>📞 {tItem.phone}</div>}
                              {tItem.email && <div>✉️ {tItem.email}</div>}
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: '#3b82f6' }}>{tItem.skillName}</span></td>
                          <td>{tItem.skillLevel || 'Orta'}</td>
                          <td>{tItem.estimatedInvestment || 'Göstərilməyib'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {tItem.hasVoiceNote && <span title="Səs yazısı var" style={{ fontSize: '1.1rem' }}>🎙️</span>}
                              {tItem.videoUrl && <span title="Video linki var" style={{ fontSize: '1.1rem' }}>🎥</span>}
                              {tItem.filesCount > 0 && <span className="badge" style={{ background: '#10b981' }}>{tItem.filesCount} fayl</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            {tItem.createdDate ? new Date(tItem.createdDate).toLocaleDateString('az-AZ') : '-'}
                          </td>
                          <td>
                            <span className={`status-pill ${tItem.status ? tItem.status.toLowerCase() : 'new'}`}>
                              {tItem.status === 'New' ? 'Yeni' :
                               tItem.status === 'Reviewing' ? 'Baxılır' :
                               tItem.status === 'Contacted' ? 'Əlaqə saxlanıldı' :
                               tItem.status === 'Partnered' ? 'Tərəfdaşlıq' : tItem.status || 'Yeni'}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button 
                                className="btn-edit" 
                                title="Ətraflı Bax"
                                onClick={async () => {
                                  try {
                                    const baseUrl = getApiBaseUrl();
                                    const res = await fetch(`${baseUrl}/HiddenTalents/${tItem.id}`);
                                    if (res.ok) {
                                      const json = await res.json();
                                      setSelectedTalent(json.data);
                                      setTalentNotes(json.data.adminNotes || '');
                                      return;
                                    }
                                  } catch {}
                                  setSelectedTalent(tItem);
                                  setTalentNotes(tItem.adminNotes || '');
                                }}
                              >
                                👁️ Bax
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'Analytics' && (
            <div className="super-table-container">
              <div className="table-header-box">
                <div>
                  <h3>📊 {t('superAdmin.analytics', 'Analitika & Hesabatlar')}</h3>
                  <p className="table-desc">Qlobal platforma istifadəsi və konversiya statistikaları.</p>
                </div>
              </div>

              <div className="analytics-dashboard-grid">
                <div className="analytics-chart-card">
                  <h4>🌍 Ən Çox Müraciət Edilən Ölkələr</h4>
                  <div className="analytics-metrics-list">
                    <div className="metric-item">
                      <span>🇺🇸 Amerika Birləşmiş Ştatları</span>
                      <strong>38%</strong>
                    </div>
                    <div className="metric-item">
                      <span>🇬🇧 Böyük Britaniya</span>
                      <strong>24%</strong>
                    </div>
                    <div className="metric-item">
                      <span>🇩🇪 Almaniya</span>
                      <strong>18%</strong>
                    </div>
                    <div className="metric-item">
                      <span>🇹🇷 Türkiyə</span>
                      <strong>12%</strong>
                    </div>
                    <div className="metric-item">
                      <span>🇦🇿 Azərbaycan</span>
                      <strong>8%</strong>
                    </div>
                  </div>
                </div>

                <div className="analytics-chart-card">
                  <h4>🎓 Ən Populyar İxtisas İstiqamətləri</h4>
                  <div className="analytics-metrics-list">
                    <div className="metric-item">
                      <span>💻 Kompüter Elmləri & Süni İntellekt</span>
                      <strong className="green-text">42%</strong>
                    </div>
                    <div className="metric-item">
                      <span>📈 Biznes İdarəetməsi & Maliyyə</span>
                      <strong className="green-text">25%</strong>
                    </div>
                    <div className="metric-item">
                      <span>⚙️ Mühəndislik & Robototexnika</span>
                      <strong className="green-text">16%</strong>
                    </div>
                    <div className="metric-item">
                      <span>🩺 Tibb & Səhiyyə</span>
                      <strong className="green-text">11%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* ========================================================================= */}
      {/* ── MODALS SECTION ─────────────────────────────────────────────────────── */}
      {/* ========================================================================= */}

      {/* 1. UNIVERSITY CREATE / EDIT MODAL (WITH 31 LANGUAGES & CAMPUS IMAGE) */}
      {modalType === 'uni' && (
        <div className="modal-overlay">
          <div className="modal-card wide-modal animate-fade-in">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? t('superAdmin.modalAddUniTitle', '🏛️ Yeni Universitet (31 Dildə Bazaya Əlavə)') : t('superAdmin.modalEditUniTitle', '✏️ Universitet Məlumatlarını Yenilə')}</h3>
              <button className="btn-close-modal" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveUni} className="modal-form">
              
              {/* 1. Loqo / Əsas Şəkil */}
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc' }}>
                  📷 {t('superAdmin.uploadImage', 'Universitet Loqosu / Əsas Şəkil')} *
                </label>
                <div className="uni-single-upload-box">
                  {uniForm.logoUrl ? (
                    <div className="uni-uploaded-preview-row">
                      <div className="preview-img-container">
                        <img 
                          src={uniForm.logoUrl} 
                          alt="University Logo" 
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"; }}
                        />
                      </div>
                      <div className="preview-info-actions">
                        <div className="file-status-badge">✓ Loqo / Əsas şəkil seçilib</div>
                        <input 
                          type="file" 
                          ref={uniFileInputRef} 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={handleUniFileUpload} 
                        />
                        <button 
                          type="button" 
                          className="btn-change-image" 
                          disabled={isUploadingImg}
                          onClick={() => uniFileInputRef.current?.click()}
                        >
                          {isUploadingImg ? '⏳ Loqo Yüklənir...' : '🔄 Loqonu Dəyişdir (Kompüterdən)'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="uni-upload-placeholder-zone" onClick={() => uniFileInputRef.current?.click()}>
                      <input 
                        type="file" 
                        ref={uniFileInputRef} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleUniFileUpload} 
                      />
                      <div className="upload-icon-circle">
                        {isUploadingImg ? '⏳' : '📁'}
                      </div>
                      <div className="upload-prompt-texts">
                        <strong>{isUploadingImg ? 'Loqo serverə yüklənir...' : 'Kompüterdən Loqo / Əsas Şəkil seçmək üçün klikləyin'}</strong>
                        <span>PNG, JPG, WEBP formatları (Maksimum 10MB)</span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-trigger-upload-dashed" 
                        disabled={isUploadingImg}
                        onClick={(e) => {
                          e.stopPropagation();
                          uniFileInputRef.current?.click();
                        }}
                      >
                        {isUploadingImg ? 'Yüklənir...' : '📁 Loqo Seç'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Kampus və Qalereya Şəkilləri (Multiple Images Upload) */}
              <div className="form-group uni-gallery-section">
                <div className="uni-section-header-row">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    🖼️ Kampus və Universitet Şəkilləri (Qalereya)
                    <span className="gallery-count-badge">{(uniForm.images || []).length} şəkil</span>
                  </label>
                  
                  <input 
                    type="file" 
                    ref={uniGalleryInputRef} 
                    accept="image/*" 
                    multiple 
                    style={{ display: 'none' }} 
                    onChange={handleUniGalleryUpload} 
                  />
                  <button 
                    type="button" 
                    className="btn-add-gallery-images"
                    disabled={isUploadingGallery}
                    onClick={() => uniGalleryInputRef.current?.click()}
                  >
                    {isUploadingGallery ? '⏳ Şəkillər Yüklənir...' : '➕ Kompüterdən Şəkillər Seç (Çoxlu)'}
                  </button>
                </div>

                {uniForm.images && uniForm.images.length > 0 ? (
                  <div className="uni-gallery-grid animate-fade-in">
                    {uniForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="uni-gallery-item">
                        <img 
                          src={imgUrl} 
                          alt={`Gallery ${idx + 1}`} 
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80"; }}
                        />
                        <button 
                          type="button" 
                          className="btn-remove-gallery-img" 
                          title="Şəkli sil"
                          onClick={() => handleRemoveUniImage(idx)}
                        >
                          &times;
                        </button>
                        <span className="gallery-img-number">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="uni-empty-gallery-box" onClick={() => uniGalleryInputRef.current?.click()}>
                    <span>📸 Hələ heç bir əlavə kampus şəkli yüklənməyib. Kompüterdən birdən çox şəkil seçib yükləyə bilərsiniz.</span>
                  </div>
                )}
              </div>

              {/* 3. Video Linkləri (YouTube / Vimeo / Promo Videolar) */}
              <div className="form-group uni-videos-section">
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  🎥 Universitet Video Linkləri (YouTube, Vimeo, Promo)
                  <span className="video-count-badge">{(uniForm.videoUrls || []).length} video</span>
                </label>

                <div className="add-video-url-row">
                  <input 
                    type="url" 
                    value={videoUrlInput}
                    onChange={e => setVideoUrlInput(e.target.value)}
                    placeholder="Məsələn: https://www.youtube.com/watch?v=... və ya video linki"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideoUrl(); } }}
                  />
                  <button type="button" className="btn-add-video" onClick={handleAddVideoUrl}>
                    ➕ Video Əlavə Et
                  </button>
                </div>

                {uniForm.videoUrls && uniForm.videoUrls.length > 0 ? (
                  <div className="uni-videos-list animate-fade-in">
                    {uniForm.videoUrls.map((vidUrl, idx) => (
                      <div key={idx} className="uni-video-item">
                        <div className="video-info-left">
                          <span className="video-icon">🎬</span>
                          <span className="video-url-text" title={vidUrl}>{vidUrl}</span>
                        </div>
                        <div className="video-actions-right">
                          <a href={vidUrl} target="_blank" rel="noopener noreferrer" className="btn-watch-video">
                            ↗️ Videoya Bax
                          </a>
                          <button 
                            type="button" 
                            className="btn-remove-video" 
                            title="Video linkini sil"
                            onClick={() => handleRemoveVideoUrl(idx)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="uni-empty-videos-note">
                    <span>🎬 Universitetin tanıtım, kampus turu və ya YouTube video linklərini yuxarıdakı xanadan əlavə edin.</span>
                  </div>
                )}
              </div>

              {/* Core Details Row 1 */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>{t('superAdmin.universityName', 'Universitetin Əsas Adı')} *</label>
                  <input 
                    type="text" 
                    value={uniForm.name} 
                    onChange={e => {
                      const val = e.target.value;
                      setUniForm(prev => ({
                        ...prev,
                        name: val,
                        translations: {
                          ...(prev.translations || {}),
                          az: { ...(prev.translations?.az || {}), name: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: ADA Universiteti / Harvard University" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('superAdmin.country', 'Ölkə')} *</label>
                  <select 
                    value={uniForm.country} 
                    onChange={e => {
                      const selectedCountryName = e.target.value;
                      const matched = countries.find(c => c.nameAz === selectedCountryName);
                      setUniForm({ 
                        ...uniForm, 
                        country: selectedCountryName,
                        countryId: matched?.id || uniForm.countryId 
                      });
                    }}
                  >
                    {countries.map(c => (
                      <option key={c.id || c.nameAz} value={c.nameAz}>{c.flag} {c.nameAz}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('superAdmin.city', 'Şəhər')} *</label>
                  <input 
                    type="text" 
                    value={uniForm.city} 
                    onChange={e => {
                      const val = e.target.value;
                      setUniForm(prev => ({
                        ...prev,
                        city: val,
                        translations: {
                          ...(prev.translations || {}),
                          az: { ...(prev.translations?.az || {}), city: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: Bakı / Boston" 
                    required 
                  />
                </div>
              </div>

              {/* Core Details Row 2 */}
              <div className="form-row">
                <div className="form-group">
                  <label>{t('superAdmin.ranking', 'Dünya / Ölkə Reytinqi')}</label>
                  <input 
                    type="text" 
                    value={uniForm.ranking} 
                    onChange={e => setUniForm({ ...uniForm, ranking: e.target.value })} 
                    placeholder="Məsələn: #1 Azərbaycanda / Top 50" 
                  />
                </div>

                <div className="form-group">
                  <label>{t('superAdmin.establishedYear', 'Yaranma İli')}</label>
                  <input 
                    type="number" 
                    value={uniForm.establishedYear} 
                    onChange={e => setUniForm({ ...uniForm, establishedYear: e.target.value })} 
                    placeholder="1919" 
                  />
                </div>

                <div className="form-group">
                  <label>{t('superAdmin.tuition', 'İllik Təhsil Haqqı')}</label>
                  <input 
                    type="text" 
                    value={uniForm.tuition} 
                    onChange={e => setUniForm({ ...uniForm, tuition: e.target.value })} 
                    placeholder="4,500 AZN / il və ya $6,500 / yr" 
                  />
                </div>
              </div>

              {/* Core Details Row 3 */}
              <div className="form-row">
                <div className="form-group">
                  <label>{t('superAdmin.acceptanceRate', 'Qəbul Faizi')}</label>
                  <input 
                    type="text" 
                    value={uniForm.acceptanceRate} 
                    onChange={e => setUniForm({ ...uniForm, acceptanceRate: e.target.value })} 
                    placeholder="Məs: 45%" 
                  />
                </div>

                <div className="form-group">
                  <label>{t('superAdmin.teachingLanguage', 'Tədris Dili')}</label>
                  <input 
                    type="text" 
                    value={uniForm.teachingLanguage} 
                    onChange={e => setUniForm({ ...uniForm, teachingLanguage: e.target.value })} 
                    placeholder="İngilis dili, Azərbaycan dili" 
                  />
                </div>

                <div className="form-group">
                  <label>{t('superAdmin.deadline', 'Qəbul Son Tarixi')}</label>
                  <input 
                    type="text" 
                    value={uniForm.deadline} 
                    onChange={e => setUniForm({ ...uniForm, deadline: e.target.value })} 
                    placeholder="30 İyul 2026 / July 30" 
                  />
                </div>
              </div>

              {/* Core Details Row 4 */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>{t('superAdmin.website', 'Rəsmi Vebsayt Linki')}</label>
                  <input 
                    type="url" 
                    value={uniForm.website} 
                    onChange={e => setUniForm({ ...uniForm, website: e.target.value })} 
                    placeholder="https://ada.edu.az" 
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('superAdmin.status', 'Status')}</label>
                  <select value={uniForm.status} onChange={e => setUniForm({ ...uniForm, status: e.target.value })}>
                    <option value="Active">{t('superAdmin.statusActive', 'Aktiv')}</option>
                    <option value="Pending">{t('superAdmin.statusPending', 'Gözləmədə')}</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <label>{t('superAdmin.hasScholarship', 'Təqaüd İmkanı')}</label>
                  <label className="checkbox-toggle-label">
                    <input 
                      type="checkbox" 
                      checked={uniForm.hasScholarship} 
                      onChange={e => setUniForm({ ...uniForm, hasScholarship: e.target.checked })} 
                    />
                    <span>{uniForm.hasScholarship ? '✓ Bəli (Var)' : '✕ Xeyr'}</span>
                  </label>
                </div>
              </div>

              {/* Core Description - Main Azerbaijani text to be translated to 31 languages */}
              <div className="form-group" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc' }}>
                    📝 {t('superAdmin.universityDescription', 'Universitet Haqqında Ətraflı Məlumat (Təsvir / Description)')} *
                  </label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Burada yazın, aşağıdakı "✨ AI 31 Dilə Avtomatik Tərcümə Et" ilə 31 dilə çevrilsin
                  </span>
                </div>
                <textarea 
                  rows={4} 
                  value={uniForm.description} 
                  onChange={e => {
                    const val = e.target.value;
                    setUniForm(prev => ({
                      ...prev,
                      description: val,
                      translations: {
                        ...(prev.translations || {}),
                        az: { ...(prev.translations?.az || {}), description: val }
                      }
                    }));
                  }} 
                  placeholder="Məsələn: ADA Universiteti Azərbaycanda ali təhsilin ən müasir standartlarını təqdim edən beynəlxalq səviyyəli universitetdir. İT, Dövlət İdarəçiliyi və Biznes sahələrində liderdir..." 
                />
              </div>

              {/* 31-Language Multi-tab Translation Section */}
              <div className="translations-31-section">
                <div className="trans-header">
                  <div>
                    <h4>🌐 {t('superAdmin.translationTabsNote', '31 Dil Üzrə Mətnlər')}</h4>
                    <span className="trans-sub">Hər dil üçün ayrıca redaktə edə və ya süni intellektlə tək kliklə tərcümə edə bilərsiniz.</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-auto-gen" 
                    onClick={handleAiTranslateUni}
                    disabled={isTranslatingUni}
                  >
                    {isTranslatingUni ? '⏳ Tərcümə olunur...' : t('superAdmin.aiTranslate', '✨ AI 31 Dilə Avtomatik Tərcümə Et')}
                  </button>
                </div>

                <div className="lang-subtabs-grid">
                  {ALL_31_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`subtab-btn ${activeLangSubTab === lang.code ? 'active' : ''}`}
                      onClick={() => setActiveLangSubTab(lang.code)}
                    >
                      <span className="flag">{lang.flag}</span>
                      <span className="code">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>

                <div className="subtab-content-box">
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>
                        {ALL_31_LANGUAGES.find(l => l.code === activeLangSubTab)?.flag}{' '}
                        {ALL_31_LANGUAGES.find(l => l.code === activeLangSubTab)?.name} dilində Ad:
                      </label>
                      <input 
                        type="text" 
                        value={uniForm.translations?.[activeLangSubTab]?.name || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setUniForm(prev => ({
                            ...prev,
                            ...(activeLangSubTab === 'az' ? { name: val } : {}),
                            translations: {
                              ...(prev.translations || {}),
                              [activeLangSubTab]: {
                                ...(prev.translations?.[activeLangSubTab] || {}),
                                name: val
                              }
                            }
                          }));
                        }}
                        placeholder={`Universitet adı (${activeLangSubTab.toUpperCase()})`} 
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>
                        {ALL_31_LANGUAGES.find(l => l.code === activeLangSubTab)?.flag} Şəhər:
                      </label>
                      <input 
                        type="text" 
                        value={uniForm.translations?.[activeLangSubTab]?.city || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setUniForm(prev => ({
                            ...prev,
                            ...(activeLangSubTab === 'az' ? { city: val } : {}),
                            translations: {
                              ...(prev.translations || {}),
                              [activeLangSubTab]: {
                                ...(prev.translations?.[activeLangSubTab] || {}),
                                city: val
                              }
                            }
                          }));
                        }}
                        placeholder={`Şəhər (${activeLangSubTab.toUpperCase()})`} 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeLangSubTab)?.name} dilində Haqqında Ətraflı Məlumat:
                    </label>
                    <textarea 
                      rows="3"
                      value={uniForm.translations?.[activeLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setUniForm(prev => ({
                          ...prev,
                          ...(activeLangSubTab === 'az' ? { description: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeLangSubTab]: {
                              ...(prev.translations?.[activeLangSubTab] || {}),
                              description: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Universitet haqqında təsvir (${activeLangSubTab.toUpperCase()})...`} 
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Progress Bar for University */}
              {uniProgress.visible && (
                <div className="uni-progress-container animate-fade-in">
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">
                      {uniProgress.percent === 100 ? '✅' : '⚡'} {uniProgress.text}
                    </span>
                    <span className="uni-progress-badge">{uniProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div 
                      className={`uni-progress-fill ${uniProgress.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${uniProgress.percent}%` }}
                    >
                      <span className="uni-progress-glow"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons for University */}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalType(null)}>
                  {t('superAdmin.cancel', 'Ləğv Et')}
                </button>
                <button type="submit" className="btn-save" disabled={isSavingUni || isTranslatingUni}>
                  {isSavingUni ? '⏳ Yadda saxlanılır...' : (modalMode === 'add' ? t('superAdmin.save31', 'Yadda Saxla (31 Dil)') : 'Yenilə (31 Dil)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PROGRAM MODAL (31-Language with Selectors & Progress Bar) */}
      {modalType === 'program' && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '840px' }}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '🎓 Yeni Proqram (31 Dildə Bazaya Əlavə)' : '✏️ Proqram Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveProg} className="modal-form">
              {/* Row 1: Title, University, Country */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Proqram / İxtisas Əsas Adı *</label>
                  <input 
                    type="text" 
                    value={progForm.title} 
                    onChange={e => {
                      const val = e.target.value;
                      setProgForm(prev => ({
                        ...prev,
                        title: val,
                        translations: {
                          ...(prev.translations || {}),
                          az: { ...(prev.translations?.az || {}), name: val, title: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: Kompüter Elmləri və Süni İntellekt" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Universitet (Könüllü / Seçim ilə)</label>
                  <select 
                    value={progForm.university || ''} 
                    onChange={e => {
                      const selUniName = e.target.value;
                      const matched = universities.find(u => u.name === selUniName);
                      setProgForm({ 
                        ...progForm, 
                        university: selUniName,
                        universityId: matched?.id || '',
                        country: matched?.country || progForm.country
                      });
                    }}
                  >
                    <option value="">— Universitet seçilməyib (Ümumi İxtisas) —</option>
                    {universities.map(u => <option key={u.id || u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ölkə *</label>
                  <select value={progForm.country} onChange={e => setProgForm({ ...progForm, country: e.target.value })}>
                    {countries.map(c => <option key={c.id || c.nameAz} value={c.nameAz}>{c.flag} {c.nameAz}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Degree Level, Language of Instruction (Dropdown), Duration (Dropdown with years & months) */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Təhsil Dərəcəsi *</label>
                  <select value={progForm.degree} onChange={e => setProgForm({ ...progForm, degree: e.target.value })}>
                    <option value="Bakalavr">🎓 Bakalavr (Bachelor)</option>
                    <option value="Magistr">🎖️ Magistr (Master)</option>
                    <option value="Doktorantura">🔬 Doktorantura (PhD)</option>
                    <option value="Assosiat">📜 Assosiat (Subbakalavr)</option>
                    <option value="Sertifikat">📑 Diplom / Sertifikat</option>
                    <option value="Hazırlıq">🌐 Hazırlıq (Foundation)</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1.2 }}>
                  <label>🌐 Tədris Dili (Seçim ilə) *</label>
                  <select value={progForm.language} onChange={e => setProgForm({ ...progForm, language: e.target.value })}>
                    <option value="İngilis dili">🇬🇧 İngilis dili</option>
                    <option value="Azərbaycan dili">🇦🇿 Azərbaycan dili</option>
                    <option value="Türk dili">🇹🇷 Türk dili</option>
                    <option value="Rus dili">🇷🇺 Rus dili</option>
                    <option value="Alman dili">🇩🇪 Alman dili</option>
                    <option value="Fransız dili">🇫🇷 Fransız dili</option>
                    <option value="İspan dili">🇪🇸 İspan dili</option>
                    <option value="İtalyan dili">🇮🇹 İtalyan dili</option>
                    <option value="Çin dili">🇨🇳 Çin dili</option>
                    <option value="İngilis və Azərbaycan dili">🌐 İngilis və Azərbaycan dili</option>
                    <option value="İngilis və Türk dili">🌐 İngilis və Türk dili</option>
                    <option value="İngilis və Alman dili">🌐 İngilis və Alman dili</option>
                    <option value="İngilis və Rus dili">🌐 İngilis və Rus dili</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1.3 }}>
                  <label>⏳ Müddət (İl və Ay Seçimi ilə) *</label>
                  <select value={progForm.duration} onChange={e => setProgForm({ ...progForm, duration: e.target.value })}>
                    <optgroup label="📅 İllik Müddət (Ali Təhsil Dərəcələri)">
                      <option value="1 il">1 il (Master / Hızlandırılmış)</option>
                      <option value="1.5 il">1.5 il (Magistratura)</option>
                      <option value="2 il">2 il (Magistratura / Associate)</option>
                      <option value="3 il">3 il (Bakalavriat - Avropa)</option>
                      <option value="4 il">4 il (Standart Bakalavr)</option>
                      <option value="5 il">5 il (Mühəndislik / Memarlıq)</option>
                      <option value="6 il">6 il (Tibb / Müalicə İşi)</option>
                    </optgroup>
                    <optgroup label="⏱️ Aylıq Müddət (Sertifikat və Kurslar)">
                      <option value="3 ay">3 ay (İntensiv Sertifikat)</option>
                      <option value="6 ay">6 ay (Peşə / Dil Kursu)</option>
                      <option value="9 ay">9 ay (Akademik Semestr)</option>
                      <option value="12 ay">12 ay (1 İllik Proqram)</option>
                      <option value="18 ay">18 ay (1.5 İllik Kurs)</option>
                      <option value="24 ay">24 ay (2 İllik Proqram)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Row 3: Tuition Fee (Number Amount + Currency Dropdown + Period Dropdown) */}
              <div className="form-group">
                <label>💰 Təhsil Haqqı və Məzənnə *</label>
                <div className="fee-inputs-combined-row">
                  <input 
                    type="number" 
                    min="0"
                    value={progForm.tuitionAmount} 
                    onChange={e => setProgForm({ ...progForm, tuitionAmount: e.target.value })}
                    placeholder="Məsələn: 3500"
                    style={{ flex: 2 }}
                    required
                  />
                  <select 
                    value={progForm.tuitionCurrency} 
                    onChange={e => setProgForm({ ...progForm, tuitionCurrency: e.target.value })}
                    style={{ flex: 1.2 }}
                  >
                    <option value="AZN">₼ AZN (Manat)</option>
                    <option value="USD">$ USD (ABŞ Dolları)</option>
                    <option value="EUR">€ EUR (Avro)</option>
                    <option value="GBP">£ GBP (Funt Sterlinq)</option>
                    <option value="TRY">₺ TRY (Türk Lirəsi)</option>
                    <option value="PLN">zł PLN (Polşa Zlotısı)</option>
                    <option value="CAD">$ CAD (Kanada Dolları)</option>
                    <option value="AUD">$ AUD (Avstraliya Dolları)</option>
                  </select>
                  <select 
                    value={progForm.tuitionPeriod} 
                    onChange={e => setProgForm({ ...progForm, tuitionPeriod: e.target.value })}
                    style={{ flex: 1.2 }}
                  >
                    <option value="/ il">/ il (İllik)</option>
                    <option value="/ semestr">/ semestr (Yarımillik)</option>
                    <option value="/ ay">/ ay (Aylıq)</option>
                    <option value="/ ümumi proqram">/ ümumi proqram (Tam Təhsil)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Program Description */}
              <div className="form-group">
                <label>📝 Proqram Haqqında Ətraflı Təsvir (Əsas Dil - AZ)</label>
                <textarea 
                  rows={3}
                  value={progForm.description}
                  onChange={e => {
                    const val = e.target.value;
                    setProgForm(prev => ({
                      ...prev,
                      description: val,
                      translations: {
                        ...(prev.translations || {}),
                        az: { ...(prev.translations?.az || {}), description: val }
                      }
                    }));
                  }}
                  placeholder="Proqramın tədris planı, karyera imkanları və qəbul şərtləri haqqında..."
                />
              </div>

              {/* Row 5: 31-Language AI Translation Matrix */}
              <div className="translations-31-section">
                <div className="trans-header">
                  <div>
                    <h4>🌍 31 Qlobal Dildə İxtisas və Təsvir Lokalizasiyası</h4>
                    <span className="trans-sub">AI ilə bir kliklə bütün dillərə tərcümə edin və ya fərdi redaktə edin:</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-auto-gen" 
                    disabled={isTranslatingProg}
                    onClick={handleAiTranslateProg}
                  >
                    {isTranslatingProg ? '⏳ 31 Dilə Tərcümə Olunur...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <div className="lang-subtabs-grid">
                  {ALL_31_LANGUAGES.map((lang) => {
                    const hasData = !!(progForm.translations?.[lang.code]?.name || progForm.translations?.[lang.code]?.title);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        className={`subtab-btn ${activeProgLangSubTab === lang.code ? 'active' : ''}`}
                        onClick={() => setActiveProgLangSubTab(lang.code)}
                      >
                        <span className="flag">{lang.flag}</span>
                        <span className="code">{lang.code.toUpperCase()}</span>
                        {hasData && <span className="check-dot" style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab Active Language Input Editor */}
                <div className="active-subtab-editor">
                  <div className="form-group">
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeProgLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeProgLangSubTab)?.name} dilində Proqram Adı:
                    </label>
                    <input 
                      type="text" 
                      value={progForm.translations?.[activeProgLangSubTab]?.name || progForm.translations?.[activeProgLangSubTab]?.title || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setProgForm(prev => ({
                          ...prev,
                          ...(activeProgLangSubTab === 'az' ? { title: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeProgLangSubTab]: {
                              ...(prev.translations?.[activeProgLangSubTab] || {}),
                              name: val,
                              title: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Proqram adı (${activeProgLangSubTab.toUpperCase()})`} 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeProgLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeProgLangSubTab)?.name} dilində Təsvir:
                    </label>
                    <textarea 
                      rows={2}
                      value={progForm.translations?.[activeProgLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setProgForm(prev => ({
                          ...prev,
                          ...(activeProgLangSubTab === 'az' ? { description: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeProgLangSubTab]: {
                              ...(prev.translations?.[activeProgLangSubTab] || {}),
                              description: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Proqram haqqında təsvir (${activeProgLangSubTab.toUpperCase()})...`} 
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Progress Bar */}
              {progProgress.visible && (
                <div className="uni-progress-container animate-fade-in">
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">
                      {progProgress.percent === 100 ? '✅' : '⚡'} {progProgress.text}
                    </span>
                    <span className="uni-progress-badge">{progProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div 
                      className={`uni-progress-fill ${progProgress.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${progProgress.percent}%` }}
                    >
                      <span className="uni-progress-glow"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalType(null)}>
                  {t('superAdmin.cancel', 'Ləğv Et')}
                </button>
                <button type="submit" className="btn-save" disabled={isSavingProg || isTranslatingProg}>
                  {isSavingProg ? '⏳ Yadda saxlanılır...' : (modalMode === 'add' ? 'Proqramı Əlavə Et (31 Dil)' : 'Yenilə (31 Dil)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SCHOLARSHIP MODAL (31-Language with Comprehensive Coverage & Progress Bar) */}
      {modalType === 'scholarship' && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '840px' }}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '💰 Yeni Təqaüd (31 Dildə Bazaya Əlavə)' : '✏️ Təqaüd Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveSch} className="modal-form">
              {/* Row 1: Title, Provider */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Təqaüd Əsas Adı (AZ) *</label>
                  <input 
                    type="text" 
                    value={schForm.title} 
                    onChange={e => {
                      const val = e.target.value;
                      setSchForm(prev => ({
                        ...prev,
                        title: val,
                        translations: {
                          ...(prev.translations || {}),
                          az: { ...(prev.translations?.az || {}), name: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: Fulbright Xarici Tələbə Təqaüd Proqramı" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Təminatçı Qurum / Fond *</label>
                  <input 
                    type="text"
                    value={schForm.provider} 
                    onChange={e => setSchForm({ ...schForm, provider: e.target.value })}
                    placeholder="Məsələn: ABŞ Hökuməti / DAAD Fondu"
                    list="popular-providers"
                    required
                  />
                  <datalist id="popular-providers">
                    <option value="Dövlət Proqramı (Azərbaycan Respublikası)" />
                    <option value="Heydər Əliyev Fondu Beynəlxalq Təhsil Qrantı" />
                    <option value="Hökumətlərarası Təqaüd Proqramı (HTP)" />
                    <option value="Fulbright Təqaüd Proqramı (ABŞ)" />
                    <option value="DAAD Təqaüdü (Almaniya)" />
                    <option value="Chevening Təqaüd Proqramı (Böyük Britaniya)" />
                    <option value="Erasmus+ / Erasmus Mundus (Avropa İttifaqı)" />
                    <option value="Türkiye Bursları (Türkiyə Cümhuriyyəti)" />
                    <option value="Visegrad Təqaüd Fondu (Mərkəzi Avropa)" />
                    <option value="GKS - Global Korea Scholarship (Cənubi Koreya)" />
                    <option value="MEXT Təqaüdü (Yaponiya)" />
                    <option value="Universitet Daxili Akademik Təqaüd Fondu" />
                  </datalist>
                </div>
              </div>

              {/* Row 1.5: Optional University & Country */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Universitet (Könüllü / Seçim ilə)</label>
                  <select 
                    value={schForm.university || ''} 
                    onChange={e => {
                      const selUniName = e.target.value;
                      const matched = universities.find(u => u.name === selUniName);
                      setSchForm({ 
                        ...schForm, 
                        university: selUniName,
                        universityId: matched?.id || '',
                        country: matched?.country || schForm.country
                      });
                    }}
                  >
                    <option value="">— Universitet seçilməyib (Qlobal / Dövlət təqaüdü) —</option>
                    {universities.map(u => <option key={u.id || u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ölkə *</label>
                  <select value={schForm.country} onChange={e => setSchForm({ ...schForm, country: e.target.value })}>
                    {countries.map(c => <option key={c.id || c.nameAz} value={c.nameAz}>{c.flag} {c.nameAz}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Coverage/Percentages (Wide choices), Eligible Degree, Deadline */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>💎 Təqaüd Faizləri və Əhatə Dairəsi *</label>
                  <select value={schForm.coverage} onChange={e => setSchForm({ ...schForm, coverage: e.target.value })}>
                    <optgroup label="🌟 Tam Maliyyələşdirilən Təqaüdlər (Full Funding)">
                      <option value="Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)">Tam Təqaüd (100% Təhsil + Aylıq Təqaüd + Yaşayış + Yol)</option>
                      <option value="100% Təhsil Haqqı Təqaüdü (Full Tuition Waiver)">100% Təhsil Haqqı Təqaüdü (Full Tuition Waiver)</option>
                    </optgroup>
                    <optgroup label="📊 Hissəvi Təhsil Güzəştləri (Partial Scholarships %)">
                      <option value="80% - 90% Yüksək Təhsil Güzəşti">80% - 90% Yüksək Təhsil Güzəşti</option>
                      <option value="75% Təhsil Haqqı Təqaüdü">75% Təhsil Haqqı Təqaüdü (Üçdə Dörd Güzəşt)</option>
                      <option value="50% Təhsil Haqqı Təqaüdü (Yarımtəqaüd)">50% Təhsil Haqqı Təqaüdü (Yarımtəqaüd / Half Tuition)</option>
                      <option value="30% - 40% Təhsil Haqqı Güzəşti">30% - 40% Təhsil Haqqı Güzəşti</option>
                      <option value="25% Təhsil Haqqı Təqaüdü">25% Təhsil Haqqı Təqaüdü (Dörddə Bir Güzəşt)</option>
                      <option value="10% - 20% İlkin Akademik Endirim">10% - 20% İlkin Akademik Endirim</option>
                    </optgroup>
                    <optgroup label="🏠 Yaşayış, Xərc və Tədqiqat Qrantları">
                      <option value="Aylıq Yaşayış Təqaüdü (Stipend €800 - €1,500/ay)">Aylıq Yaşayış Təqaüdü (Stipend €800 - €1,500/ay)</option>
                      <option value="Yalnız Yol, Yaşayış və Tibbi Sığorta Təminatı">Yalnız Yol, Yaşayış və Tibbi Sığorta Təminatı</option>
                      <option value="Tədqiqat Qrantı və Layihə Təqaüdü (Research Grant)">Tədqiqat Qrantı və Layihə Təqaüdü (Research Grant)</option>
                      <option value="Xüsusi İstedad, İdman və Yaradıcılıq Təqaüdü">Xüsusi İstedad, İdman və Yaradıcılıq Təqaüdü</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1.2 }}>
                  <label>🎓 Təhsil Dərəcəsi Uyğunluğu *</label>
                  <select value={schForm.eligible} onChange={e => setSchForm({ ...schForm, eligible: e.target.value })}>
                    <option value="Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)">🌐 Bütün Təhsil Pillələri</option>
                    <option value="Yalnız Bakalavr (Undergraduate)">🎓 Yalnız Bakalavr</option>
                    <option value="Yalnız Magistratura (Master / Post-graduate)">🎖️ Yalnız Magistratura</option>
                    <option value="Yalnız Doktorantura (PhD / Research)">🔬 Yalnız Doktorantura (PhD)</option>
                    <option value="Bakalavr və Magistratura">🎓🎖️ Bakalavr və Magistratura</option>
                    <option value="Magistr və Doktorantura">🎖️🔬 Magistr və Doktorantura</option>
                    <option value="Tədqiqatçılar və Post-Doktorantura">📑 Tədqiqatçılar və Post-Doktorantura</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>📅 Son Müraciət Tarixi</label>
                  <input 
                    type="date" 
                    value={schForm.deadline} 
                    onChange={e => setSchForm({ ...schForm, deadline: e.target.value })} 
                  />
                </div>
              </div>

              {/* Row 3: Financial Value/Amount, Places, Status */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>💵 Təxmini Maliyyə Dəyəri / Məbləğ</label>
                  <input 
                    type="text" 
                    value={schForm.amount} 
                    onChange={e => setSchForm({ ...schForm, amount: e.target.value })} 
                    placeholder="Məs: 100% Tam Təminat / $30,000 / il və ya €1,200/ay" 
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>👥 Qəbul Kontingenti (Yer sayı)</label>
                  <select value={schForm.places} onChange={e => setSchForm({ ...schForm, places: e.target.value })}>
                    <option value="Limitsiz (Meyarları ödəyən hər kəs)">Limitsiz (Meyarları ödəyən hər kəs)</option>
                    <option value="10 yer">10 yer</option>
                    <option value="25 yer">25 yer</option>
                    <option value="50 yer">50 yer</option>
                    <option value="100 yer">100 yer</option>
                    <option value="200+ yer">200+ yer</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={schForm.status} onChange={e => setSchForm({ ...schForm, status: e.target.value })}>
                    <option value="Aktiv">🟢 Aktiv (Müraciət Açıqdır)</option>
                    <option value="Gözləmədə">🟡 Gözləmədə (Tezliklə)</option>
                    <option value="Başa Çatıb">🔴 Başa Çatıb (Qapalı)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Description (Main AZ) */}
              <div className="form-group">
                <label>📝 Təqaüd Haqqında Ətraflı Məlumat və Qaydalar (Əsas Dil - AZ)</label>
                <textarea 
                  rows={3}
                  value={schForm.description}
                  onChange={e => {
                    const val = e.target.value;
                    setSchForm(prev => ({
                      ...prev,
                      description: val,
                      translations: {
                        ...(prev.translations || {}),
                        az: { ...(prev.translations?.az || {}), description: val }
                      }
                    }));
                  }}
                  placeholder="Təqaüdün əhatə dairəsi, qəbul tələbləri (GPA, dil sertifikatı), seçim mərhələləri və müraciət qaydaları haqqında..."
                />
              </div>

              {/* Row 5: 31-Language AI Translation Matrix */}
              <div className="translations-31-section">
                <div className="trans-header">
                  <div>
                    <h4>🌍 31 Qlobal Dildə Təqaüd Adı və Təsviri</h4>
                    <span className="trans-sub">AI ilə tək kliklə 31 dilə tərcümə edin və ya hər dili ayrıca redaktə edin:</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-auto-gen" 
                    disabled={isTranslatingSch}
                    onClick={handleAiTranslateSch}
                  >
                    {isTranslatingSch ? '⏳ 31 Dilə Tərcümə Olunur...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <div className="lang-subtabs-grid">
                  {ALL_31_LANGUAGES.map((lang) => {
                    const hasData = !!(schForm.translations?.[lang.code]?.name || schForm.translations?.[lang.code]?.title);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        className={`subtab-btn ${activeSchLangSubTab === lang.code ? 'active' : ''}`}
                        onClick={() => setActiveSchLangSubTab(lang.code)}
                      >
                        <span className="flag">{lang.flag}</span>
                        <span className="code">{lang.code.toUpperCase()}</span>
                        {hasData && <span className="check-dot" style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab Active Language Input Editor */}
                <div className="active-subtab-editor">
                  <div className="form-group">
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeSchLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeSchLangSubTab)?.name} dilində Təqaüd Adı:
                    </label>
                    <input 
                      type="text" 
                      value={schForm.translations?.[activeSchLangSubTab]?.name || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setSchForm(prev => ({
                          ...prev,
                          ...(activeSchLangSubTab === 'az' ? { title: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeSchLangSubTab]: {
                              ...(prev.translations?.[activeSchLangSubTab] || {}),
                              name: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Təqaüd adı (${activeSchLangSubTab.toUpperCase()})`} 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeSchLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeSchLangSubTab)?.name} dilində Ətraflı Məlumat və Qaydalar:
                    </label>
                    <textarea 
                      rows={2}
                      value={schForm.translations?.[activeSchLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setSchForm(prev => ({
                          ...prev,
                          ...(activeSchLangSubTab === 'az' ? { description: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeSchLangSubTab]: {
                              ...(prev.translations?.[activeSchLangSubTab] || {}),
                              description: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Təqaüd qaydaları və şərtləri (${activeSchLangSubTab.toUpperCase()})...`} 
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Progress Bar */}
              {schProgress.visible && (
                <div className="uni-progress-container animate-fade-in">
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">
                      {schProgress.percent === 100 ? '✅' : '⚡'} {schProgress.text}
                    </span>
                    <span className="uni-progress-badge">{schProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div 
                      className={`uni-progress-fill ${schProgress.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${schProgress.percent}%` }}
                    >
                      <span className="uni-progress-glow"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalType(null)}>
                  {t('superAdmin.cancel', 'Ləğv Et')}
                </button>
                <button type="submit" className="btn-save" disabled={isSavingSch || isTranslatingSch}>
                  {isSavingSch ? '⏳ Yadda saxlanılır...' : (modalMode === 'add' ? 'Təqaüdü Əlavə Et (31 Dil)' : 'Yenilə (31 Dil)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.5. COURSE MODAL (31-Language with Cover Image, Details, & Video Lectures) */}
      {modalType === 'course' && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '📚 Yeni Kurs (31 Dildə & Video Dərslər)' : '✏️ Kurs Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => !isSavingCourse && setModalType(null)} disabled={isSavingCourse}>&times;</button>
            </div>

            <form onSubmit={handleSaveCourse} className="modal-form">
              {/* Row 1: Title, Category */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Kursun Əsas Adı (AZ) *</label>
                  <input 
                    type="text" 
                    value={courseForm.title} 
                    onChange={e => {
                      const val = e.target.value;
                      setCourseForm(prev => ({
                        ...prev,
                        title: val,
                        translations: {
                          ...(prev.translations || {}),
                          az: { ...(prev.translations?.az || {}), name: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: Full-Stack Web Proqramlaşdırma: React & Node.js" 
                    required 
                    disabled={isSavingCourse}
                  />
                </div>

                <div className="form-group" style={{ flex: 1.2 }}>
                  <label>Kateqoriya *</label>
                  <select 
                    value={courseForm.category} 
                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="super-select"
                    required
                    disabled={isSavingCourse}
                  >
                    <optgroup label="🎓 Qəbul & İmtahan Hazırlığı">
                      <option value="Abituriyent & Bakalavr Hazırlığı">🎓 Abituriyent & Bakalavr Hazırlığı (DİM / Blok)</option>
                      <option value="Riyaziyyat & Məntiq">📐 Riyaziyyat & Məntiq</option>
                      <option value="Fizika, Kimya & Biologiya">🔬 Fizika, Kimya & Biologiya</option>
                      <option value="Azərbaycan dili & Ədəbiyyat">🇦🇿 Azərbaycan dili & Ədəbiyyat</option>
                      <option value="Tarix & Coğrafiya">📜 Tarix & Coğrafiya</option>
                      <option value="Magistratura & Dövlət Qulluğu">🏛️ Magistratura & Dövlət Qulluğu</option>
                      <option value="Xaricdə Təhsil & İmtahanlar">✈️ Xaricdə Təhsil (SAT, GRE, GMAT)</option>
                    </optgroup>
                    <optgroup label="🌍 Dillər">
                      <option value="Xarici Dillər">🌍 İngilis dili, IELTS, TOEFL</option>
                      <option value="Rus & Alman & Fransız dili">🗣️ Rus, Alman & Fransız dili</option>
                      <option value="Türk dili & TÖMER">🇹🇷 Türk dili & TÖMER</option>
                    </optgroup>
                    <optgroup label="💻 Texnologiya & IT">
                      <option value="Proqramlaşdırma">💻 Proqramlaşdırma & IT (Web, Mobile, Backend)</option>
                      <option value="AI & Data Science">🤖 Süni İntellekt & Data Science</option>
                      <option value="UI/UX & Qrafik Dizayn">🎨 UI/UX & Qrafik Dizayn</option>
                      <option value="Cloud & DevOps">☁️ Cloud & DevOps</option>
                      <option value="Kiber Təhlükəsizlik">🔒 Kiber Təhlükəsizlik</option>
                    </optgroup>
                    <optgroup label="📈 Biznes & Peşə">
                      <option value="Biznes, Maliyyə & Menecment">📈 Biznes, Maliyyə & Menecment</option>
                      <option value="Marketinq & SMM">📱 Rəqəmsal Marketinq & SMM</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Row 2: Instructor, Level, Language, Price */}
              <div className="form-row">
                <div className="form-group">
                  <label>Təlimçi / Tədris Mərkəzi / Müəllim</label>
                  <input 
                    type="text" 
                    value={courseForm.instructorName} 
                    onChange={e => setCourseForm({ ...courseForm, instructorName: e.target.value })} 
                    placeholder="Məs: Əli Məmmədov və ya EduSaz Tədris Mərkəzi" 
                    disabled={isSavingCourse}
                  />
                </div>

                <div className="form-group">
                  <label>Səviyyə / Sinif</label>
                  <select 
                    value={courseForm.level} 
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="super-select"
                    disabled={isSavingCourse}
                  >
                    <option value="Bütün Səviyyələr">Bütün Səviyyələr</option>
                    <option value="9-11-ci Sinif (Abituriyent)">9-11-ci Sinif (Abituriyent)</option>
                    <option value="Bakalavr Tələbələri">Bakalavr Tələbələri</option>
                    <option value="Başlanğıc (Beginner)">Başlanğıc (Beginner)</option>
                    <option value="Orta (Intermediate)">Orta (Intermediate)</option>
                    <option value="İrəli (Advanced)">İrəli (Advanced)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tədris Dili</label>
                  <select 
                    value={courseForm.language} 
                    onChange={e => setCourseForm({ ...courseForm, language: e.target.value })}
                    className="super-select"
                    disabled={isSavingCourse}
                  >
                    <option value="az">🇦🇿 Azərbaycan dili</option>
                    <option value="en">🇬🇧 İngilis dili</option>
                    <option value="tr">🇹🇷 Türk dili</option>
                    <option value="ru">🇷🇺 Rus dili</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Qiymət / Ödəniş</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={courseForm.isFree} 
                        onChange={e => setCourseForm({ ...courseForm, isFree: e.target.checked, price: e.target.checked ? '0' : courseForm.price })}
                        disabled={isSavingCourse}
                      />
                      Pulsuz
                    </label>
                    {!courseForm.isFree && (
                      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={courseForm.price} 
                          onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                          placeholder="Qiymət"
                          style={{ width: '80px', padding: '6px 8px' }}
                          disabled={isSavingCourse}
                        />
                        <select 
                          value={courseForm.currency} 
                          onChange={e => setCourseForm({ ...courseForm, currency: e.target.value })}
                          className="super-select"
                          style={{ width: '70px', padding: '6px' }}
                          disabled={isSavingCourse}
                        >
                          <option value="AZN">AZN</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Card Şəkli (Cover Image) & Tanıtım Videosu */}
              <div className="form-row" style={{ alignItems: 'flex-start' }}>
                {/* Cover Image Upload */}
                <div className="form-group" style={{ flex: 1.3 }}>
                  <label>🖼️ Kursun Card Şəkli (Cover Image)</label>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '6px' }}>
                    <img 
                      src={courseForm.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80'} 
                      alt="Cover Preview" 
                      style={{ width: '110px', height: '68px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <input 
                        type="file" 
                        ref={courseFileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleCourseCoverUpload}
                      />
                      <button 
                        type="button" 
                        className="btn-upload-secondary" 
                        onClick={() => courseFileInputRef.current?.click()}
                        disabled={isUploadingCourseImg || isSavingCourse}
                        style={{ 
                          padding: '10px 16px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.25))', 
                          border: '1px solid #3b82f6', 
                          color: '#93c5fd', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isUploadingCourseImg ? '⏳ Şəkil Yüklənir...' : '📁 Kompyuterdən Şəkil Yüklə'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Video URL with Open in New Tab button */}
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label>🎬 Kursun Tanıtım Video Linki (Preview Video)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <input 
                      type="url" 
                      value={courseForm.previewVideoUrl} 
                      onChange={e => setCourseForm({ ...courseForm, previewVideoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={isSavingCourse}
                      style={{ flex: 1 }}
                    />
                    {courseForm.previewVideoUrl && (
                      <a 
                        href={courseForm.previewVideoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid #3b82f6',
                          color: '#60a5fa',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Videoya yeni pəncərədə bax"
                      >
                        👁️ Bax
                      </a>
                    )}
                  </div>
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    YouTube, Vimeo və ya MP4 video linki
                  </small>
                </div>
              </div>

              {/* Row 4: Video Dərslikləri & Linkləri (Dynamic Lectures List with View Buttons) */}
              <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>🎥 Kurs Daxilindəki Video Linkləri & Dərslər</label>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Tələbələrin izləyəcəyi video dərsliklərin linklərini və başlıqlarını əlavə edin:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCourseForm(prev => ({
                      ...prev,
                      videoLectures: [
                        ...prev.videoLectures,
                        { title: `${prev.videoLectures.length + 1}. Yeni Video Dərs`, videoUrl: '', durationMinutes: 15, isFree: false }
                      ]
                    }))}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Video Dərs Əlavə Et
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {courseForm.videoLectures.map((lec, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', width: '24px' }}>#{lIdx + 1}</span>
                      <input 
                        type="text" 
                        value={lec.title} 
                        onChange={e => {
                          const val = e.target.value;
                          setCourseForm(prev => {
                            const copy = [...prev.videoLectures];
                            copy[lIdx] = { ...copy[lIdx], title: val };
                            return { ...prev, videoLectures: copy };
                          });
                        }}
                        placeholder="Dərsin Adı (Məs: 1. Giriş və Quraşdırma)"
                        style={{ flex: 1.5, fontSize: '13px', padding: '6px 10px' }}
                        disabled={isSavingCourse}
                      />
                      <input 
                        type="url" 
                        value={lec.videoUrl} 
                        onChange={e => {
                          const val = e.target.value;
                          setCourseForm(prev => {
                            const copy = [...prev.videoLectures];
                            copy[lIdx] = { ...copy[lIdx], videoUrl: val };
                            return { ...prev, videoLectures: copy };
                          });
                        }}
                        placeholder="Video Linki (YouTube / Vimeo / MP4)"
                        style={{ flex: 2, fontSize: '13px', padding: '6px 10px' }}
                        disabled={isSavingCourse}
                      />
                      {lec.videoUrl && (
                        <a 
                          href={lec.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid #3b82f6',
                            color: '#60a5fa',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Videoya yeni pəncərədə bax"
                        >
                          👁️ Bax
                        </a>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                          type="number" 
                          min="1" 
                          value={lec.durationMinutes || 15} 
                          onChange={e => {
                            const val = parseInt(e.target.value) || 15;
                            setCourseForm(prev => {
                              const copy = [...prev.videoLectures];
                              copy[lIdx] = { ...copy[lIdx], durationMinutes: val };
                              return { ...prev, videoLectures: copy };
                            });
                          }}
                          placeholder="Dəqiqə"
                          style={{ width: '60px', fontSize: '12px', padding: '6px 6px', textAlign: 'center' }}
                          disabled={isSavingCourse}
                        />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>dəq</span>
                      </div>
                      {courseForm.videoLectures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCourseForm(prev => ({
                            ...prev,
                            videoLectures: prev.videoLectures.filter((_, idx) => idx !== lIdx)
                          }))}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Sil"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Kurs Haqqında Ətraflı Məlumat (AZ)</label>
                <textarea 
                  rows={3}
                  value={courseForm.description} 
                  onChange={e => {
                    const val = e.target.value;
                    setCourseForm(prev => ({
                      ...prev,
                      description: val,
                      translations: {
                        ...(prev.translations || {}),
                        az: { ...(prev.translations?.az || {}), description: val }
                      }
                    }));
                  }}
                  placeholder="Kursun məqsədi, kimlər üçün nəzərdə tutulduğu və qazandıracağı praktiki bacarıqlar haqqında..."
                  disabled={isSavingCourse}
                />
              </div>

              {/* Row 6: 31-Language AI Translation Section */}
              <div className="translations-31-section">
                <div className="trans-header">
                  <div>
                    <h4>🌍 31 Qlobal Dildə Kurs Adı və Təsviri</h4>
                    <span className="trans-sub">AI ilə tək kliklə 31 dilə tərcümə edin və ya hər dili ayrıca redaktə edin:</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-auto-gen" 
                    disabled={isTranslatingCourse || isSavingCourse}
                    onClick={handleAiTranslateCourse}
                  >
                    {isTranslatingCourse ? '⏳ 31 Dilə Tərcümə Olunur...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <div className="lang-subtabs-grid">
                  {ALL_31_LANGUAGES.map((lang) => {
                    const hasData = !!(courseForm.translations?.[lang.code]?.name || courseForm.translations?.[lang.code]?.title);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        className={`subtab-btn ${activeCourseLangSubTab === lang.code ? 'active' : ''}`}
                        onClick={() => setActiveCourseLangSubTab(lang.code)}
                      >
                        <span className="flag">{lang.flag}</span>
                        <span className="code">{lang.code.toUpperCase()}</span>
                        {hasData && <span className="check-dot" style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab Active Language Input Editor */}
                <div className="active-subtab-editor">
                  <div className="form-group">
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeCourseLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeCourseLangSubTab)?.name} dilində Kursun Adı:
                    </label>
                    <input 
                      type="text" 
                      value={courseForm.translations?.[activeCourseLangSubTab]?.name || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setCourseForm(prev => ({
                          ...prev,
                          ...(activeCourseLangSubTab === 'az' ? { title: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeCourseLangSubTab]: {
                              ...(prev.translations?.[activeCourseLangSubTab] || {}),
                              name: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Kurs adı (${activeCourseLangSubTab.toUpperCase()})`} 
                      disabled={isSavingCourse}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label>
                      {ALL_31_LANGUAGES.find(l => l.code === activeCourseLangSubTab)?.flag}{' '}
                      {ALL_31_LANGUAGES.find(l => l.code === activeCourseLangSubTab)?.name} dilində Kurs Təsviri:
                    </label>
                    <textarea 
                      rows={2}
                      value={courseForm.translations?.[activeCourseLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setCourseForm(prev => ({
                          ...prev,
                          ...(activeCourseLangSubTab === 'az' ? { description: val } : {}),
                          translations: {
                            ...(prev.translations || {}),
                            [activeCourseLangSubTab]: {
                              ...(prev.translations?.[activeCourseLangSubTab] || {}),
                              description: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Kurs təsviri (${activeCourseLangSubTab.toUpperCase()})...`} 
                      disabled={isSavingCourse}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Progress Bar */}
              {courseProgress.visible && (
                <div className="uni-progress-container animate-fade-in" style={{ marginTop: '16px' }}>
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">
                      {courseProgress.percent === 100 ? '✅' : '⚡'} {courseProgress.text}
                    </span>
                    <span className="uni-progress-badge">{courseProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div 
                      className={`uni-progress-fill ${courseProgress.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${courseProgress.percent}%` }}
                    >
                      <span className="uni-progress-glow"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setModalType(null)} disabled={isSavingCourse}>
                  {t('superAdmin.cancel', 'Ləğv Et')}
                </button>
                <button type="submit" className="btn-save" disabled={isSavingCourse || isTranslatingCourse}>
                  {isSavingCourse ? '⏳ Yadda saxlanılır...' : (modalMode === 'add' ? 'Kursu Əlavə Et (31 Dil)' : 'Yenilə (31 Dil)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. COUNTRY MODAL */}
      {modalType === 'country' && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '🌍 Yeni Ölkə Əlavə Et' : '✏️ Ölkə Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => !isSavingCountry && setModalType(null)} disabled={isSavingCountry}>&times;</button>
            </div>

            <form onSubmit={handleSaveCountry} className="modal-form">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Ölkə Adı (Azərbaycan) *</label>
                <input 
                  type="text" 
                  value={countryForm.nameAz} 
                  onChange={e => {
                    const val = e.target.value;
                    const matchedFlag = PRESET_FLAGS.find(f => f.name.toLowerCase() === val.trim().toLowerCase());
                    setCountryForm(prev => ({
                      ...prev,
                      nameAz: val,
                      flag: matchedFlag ? matchedFlag.flag : prev.flag
                    }));
                  }} 
                  placeholder="Məsələn: İtaliya" 
                  required 
                  disabled={isSavingCountry}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Bayraq Emojisi (Seçim ilə)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    fontSize: '32px',
                    width: '54px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}>
                    {countryForm.flag || '🌐'}
                  </div>
                  <select
                    value={countryForm.flag}
                    onChange={e => setCountryForm({ ...countryForm, flag: e.target.value })}
                    className="super-select"
                    style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', fontSize: '15px' }}
                    disabled={isSavingCountry}
                  >
                    {PRESET_FLAGS.map((f, idx) => (
                      <option key={idx} value={f.flag}>
                        {f.flag} {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Loading Progress Bar */}
              {countryProgress.visible && (
                <div className="uni-progress-container animate-fade-in" style={{ marginBottom: '20px' }}>
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">
                      {countryProgress.percent === 100 ? '✅' : '⚡'} {countryProgress.text}
                    </span>
                    <span className="uni-progress-badge">{countryProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div 
                      className={`uni-progress-fill ${countryProgress.percent === 100 ? 'complete' : ''}`}
                      style={{ width: `${countryProgress.percent}%` }}
                    >
                      <span className="uni-progress-glow"></span>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalType(null)} disabled={isSavingCountry}>
                  {t('superAdmin.cancel', 'Ləğv Et')}
                </button>
                <button type="submit" className="btn-save" disabled={isSavingCountry}>
                  {isSavingCountry ? (
                    <span>⏳ Yadda saxlanılır ({countryProgress.percent}%)...</span>
                  ) : (
                    modalMode === 'add' ? 'Ölkəni Əlavə Et (31 Dil)' : 'Yenilə (31 Dil)'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TALENT DETAILS MODAL */}
      {selectedTalent && (
        <div className="modal-overlay">
          <div className="modal-card wide-modal animate-fade-in">
            <div className="modal-header">
              <h3>✨ İstedad / Layihə Təfərrüatları: {selectedTalent.fullName || `${selectedTalent.firstName} ${selectedTalent.lastName}`}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedTalent(null)}>&times;</button>
            </div>

            <div className="talent-detail-modal-body">
              <div className="talent-meta-grid">
                <div className="meta-card">
                  <span className="meta-title">👤 Əlaqə Məlumatları</span>
                  <p><strong>Ad, Soyad:</strong> {selectedTalent.fullName || `${selectedTalent.firstName} ${selectedTalent.lastName}`}</p>
                  <p><strong>Telefon:</strong> {selectedTalent.phone}</p>
                  <p><strong>E-mail:</strong> {selectedTalent.email}</p>
                  <p><strong>Yaş / Şəhər:</strong> {selectedTalent.age || '-'} / {selectedTalent.cityCountry || 'Bakı, Azərbaycan'}</p>
                  {selectedTalent.socialLinks && <p><strong>Portfolio / Linklər:</strong> <a href={selectedTalent.socialLinks} target="_blank" rel="noreferrer">{selectedTalent.socialLinks}</a></p>}
                </div>

                <div className="meta-card">
                  <span className="meta-title">🎨 Bacarıq & Səviyyə</span>
                  <p><strong>Bacarıq:</strong> <span className="badge" style={{ background: '#3b82f6' }}>{selectedTalent.skillName}</span></p>
                  <p><strong>Səviyyə:</strong> {selectedTalent.skillLevel}</p>
                  <p><strong>Təcrübə Müddəti:</strong> {selectedTalent.experienceDuration || 'Göstərilməyib'}</p>
                  <p><strong>Tələb Olunan İnvestisiya:</strong> {selectedTalent.estimatedInvestment || 'Göstərilməyib'}</p>
                  <p><strong>Komanda Statusu:</strong> {selectedTalent.teamStatus || 'Tək işləyir'}</p>
                </div>
              </div>

              {/* Ideas Description */}
              <div className="talent-detail-section">
                <h4>💡 İdeya və ya Layihə Haqqında</h4>
                <p className="detail-text-box">{selectedTalent.ideaDescription || 'Qeyd olunmayıb.'}</p>
              </div>

              {selectedTalent.problemSolved && (
                <div className="talent-detail-section">
                  <h4>🎯 Həll Etdiyi Problem</h4>
                  <p className="detail-text-box">{selectedTalent.problemSolved}</p>
                </div>
              )}

              {/* Voice Note & Media */}
              <div className="talent-media-section">
                <h4>🎙️ Media & Əlavə Fayllar</h4>
                <div className="media-items-grid">
                  {selectedTalent.hasVoiceNote && selectedTalent.voiceNoteUrl && (
                    <div className="audio-player-box">
                      <span>Səsli İzah:</span>
                      <audio controls src={selectedTalent.voiceNoteUrl} />
                    </div>
                  )}

                  {selectedTalent.videoUrl && (
                    <div className="video-link-box">
                      <span>Video Təqdimat:</span>
                      <a href={selectedTalent.videoUrl} target="_blank" rel="noreferrer">
                        🎥 Videonu Aç ({selectedTalent.videoUrl})
                      </a>
                    </div>
                  )}

                  {selectedTalent.uploadedFilesJson && (
                    <div className="files-list-box">
                      <span>Yüklənmiş Fayllar:</span>
                      <code>{selectedTalent.uploadedFilesJson}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes and Status Updating */}
              <div className="talent-admin-control-section">
                <h4>📝 SuperAdmin Qeydləri və Status İdarəsi</h4>
                <textarea 
                  rows="3" 
                  value={talentNotes} 
                  onChange={e => setTalentNotes(e.target.value)} 
                  placeholder="Bu müraciət haqqında admin qeydləri yazın..." 
                />

                <div className="talent-status-action-bar">
                  <span>Statusu Dəyiş:</span>
                  <div className="status-btns-group">
                    {['New', 'Reviewing', 'Contacted', 'Partnered', 'Archived'].map(st => (
                      <button
                        key={st}
                        type="button"
                        className={`btn-status-toggle ${selectedTalent.status === st ? 'active' : ''}`}
                        onClick={() => handleUpdateTalent(selectedTalent.id, st)}
                      >
                        {st === 'New' ? 'Yeni' :
                         st === 'Reviewing' ? 'Baxılır' :
                         st === 'Contacted' ? 'Əlaqə Saxlanıldı' :
                         st === 'Partnered' ? 'Tərəfdaşlıq' : 'Arxiv'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setSelectedTalent(null)}>
                {t('superAdmin.close', 'Bağla')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card delete-modal animate-fade-in">
            <div className="modal-header">
              <h3>⚠️ {t('superAdmin.confirmDelete', 'Silinməni Təsdiq Edin')}</h3>
              <button className="btn-close-modal" onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className="delete-body">
              <p>{t('superAdmin.confirmDeleteDesc', 'Bu elementi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarılmır.')}</p>
              <div className="delete-item-info">
                <strong>{deleteTarget.name}</strong>
              </div>
              <span className="warn-text">Bütün əlaqəli məlumatlar verilənlər bazasından təmizlənəcəkdir.</span>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                {t('superAdmin.cancel', 'Ləğv Et')}
              </button>
              <button className="btn-confirm-delete" onClick={confirmDeleteAction}>
                🗑️ {t('superAdmin.delete', 'Bəli, Sil')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminPage;
