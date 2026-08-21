import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useCreateUniversityMutation, 
  useUpdateUniversityMutation,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useGetProgramsQuery,
  useGetUniversitiesQuery,
  useGetCountriesQuery,
  useGetAnalyticsQuery,
  useGetStudentLeadsQuery,
  useUpdateStudentLeadStatusMutation,
  useGetScholarshipsQuery,
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
  useDeleteScholarshipMutation,
  useGetTeamMembersQuery,
  useCreateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetUserProfileQuery
} from '../../../services/apis/userApi';
import { translateText } from '../../../services/translationService';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import Cookies from 'js-cookie';
import './index.scss';

// SVG Icons
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#7A5CFF"/>
    <path d="M12 6V18M6 12H18M8 8L16 16M8 16L16 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OverviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ProgramsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const LeadsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const ScholarshipsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

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

const generateDefault31Translations = (title = '', desc = '', extra = {}) => {
  const trans = {};
  ALL_31_LANGUAGES.forEach(lang => {
    trans[lang.code] = {
      name: title,
      title: title,
      description: desc,
      city: extra.city || 'Bakı',
      ...extra
    };
  });
  return trans;
};

function UniversityPortalPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const token = Cookies.get('userToken');
  let jwtUniId = null;
  let isAuth = false;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      jwtUniId = payload.universityId || payload.UniversityId || null;
      const role = localStorage.getItem('userRole');
      if (role === 'universityadmin' || role === 'superadmin') {
        isAuth = true;
      }
    } catch (e) {
      console.error('Token parse error', e);
    }
  }

  useEffect(() => {
    if (!isAuth) {
      navigate('/signin');
    }
  }, [navigate, isAuth]);

  const loggedInUserEmail = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail') || '';
  const { data: loggedInAdminProfile } = useGetUserProfileQuery(loggedInUserEmail, { skip: !loggedInUserEmail });

  const targetUniId = jwtUniId || loggedInAdminProfile?.universityId || localStorage.getItem('universityId') || null;

  const [currentUni, setCurrentUni] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Backend RTK Queries
  const { data: backendPrograms, refetch: refetchPrograms } = useGetProgramsQuery(
    targetUniId
      ? { lang: i18n.language, universityId: targetUniId }
      : i18n.language
  );
  const { data: backendCountries } = useGetCountriesQuery(i18n.language);
  const { data: backendUniversities, refetch: refetchUniversities } = useGetUniversitiesQuery(i18n.language);
  const { data: backendScholarships, refetch: refetchScholarships } = useGetScholarshipsQuery(
    targetUniId
      ? { lang: i18n.language, universityId: targetUniId }
      : i18n.language
  );
  const { data: analyticsData } = useGetAnalyticsQuery(targetUniId || 'my');
  const { data: backendLeads, refetch: refetchLeads } = useGetStudentLeadsQuery(targetUniId || '');
  const [updateLeadStatusBackend] = useUpdateStudentLeadStatusMutation();

  const [createUniversity, { isLoading: isCreatingUni }] = useCreateUniversityMutation();
  const [updateUniversityBackend] = useUpdateUniversityMutation();

  const [createProgramBackend, { isLoading: isCreatingProg }] = useCreateProgramMutation();
  const [updateProgramBackend, { isLoading: isUpdatingProg }] = useUpdateProgramMutation();
  const [deleteProgramBackend] = useDeleteProgramMutation();

  const [createScholarshipBackend, { isLoading: isCreatingSch }] = useCreateScholarshipMutation();
  const [updateScholarshipBackend, { isLoading: isUpdatingSch }] = useUpdateScholarshipMutation();
  const [deleteScholarshipBackend] = useDeleteScholarshipMutation();

  const { data: backendTeamMembers, refetch: refetchTeamMembers } = useGetTeamMembersQuery(targetUniId);
  const [createTeamMemberBackend] = useCreateTeamMemberMutation();
  const [deleteTeamMemberBackend] = useDeleteTeamMemberMutation();

  // 1. UNIVERSITY PROFILE FORM STATE (Exact matching SuperAdmin)
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

  const [activeLangSubTab, setActiveLangSubTab] = useState('az');
  const [isTranslatingUni, setIsTranslatingUni] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isSavingUni, setIsSavingUni] = useState(false);
  const [uniProgress, setUniProgress] = useState({ visible: false, percent: 0, text: '' });
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sync University Profile from backend
  useEffect(() => {
    if (backendUniversities && backendUniversities.length > 0) {
      const found = targetUniId 
        ? backendUniversities.find(u => u.id === targetUniId || u.Id === targetUniId)
        : backendUniversities[0];

      if (found) {
        setCurrentUni(found);
        setUniForm({
          name: found.name || found.Name || '',
          country: found.country || found.Country || 'Azərbaycan',
          countryId: found.countryId || found.CountryId || '',
          city: found.city || found.City || 'Bakı',
          logoUrl: found.logoUrl || found.LogoUrl || '',
          establishedYear: found.establishedYear || found.EstablishedYear || 1919,
          ranking: found.ranking || found.WorldRanking || '#1 Azərbaycanda',
          tuition: found.tuition || found.TuitionRange || '4,500 AZN / il',
          acceptanceRate: found.acceptanceRate || found.AcceptanceRate || '45%',
          teachingLanguage: found.teachingLanguage || found.InstructionLanguage || 'İngilis dili, Azərbaycan dili',
          deadline: found.deadline || '30 İyul 2026',
          website: found.website || found.websiteUrl || found.WebsiteUrl || 'https://',
          hasScholarship: found.hasScholarship !== false,
          description: found.description || found.Description || '',
          status: found.status || found.Status || 'Active',
          images: found.images || found.Images || [],
          videoUrls: found.videoUrls || found.VideoUrls || [],
          translations: found.translations || generateDefault31Translations(found.name || found.Name, found.description || found.Description)
        });
      }
    }
  }, [targetUniId, backendUniversities]);

  // 2. PROGRAM MODAL STATE (Exact matching SuperAdmin)
  const [showProgModal, setShowProgModal] = useState(false);
  const [progModalMode, setProgModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProgId, setEditingProgId] = useState(null);
  const [progForm, setProgForm] = useState({
    title: '',
    description: '',
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
  const [progProgress, setProgProgress] = useState({ visible: false, percent: 0, text: '' });

  // 3. SCHOLARSHIP MODAL STATE (Exact matching SuperAdmin)
  const [showSchModal, setShowSchModal] = useState(false);
  const [schModalMode, setSchModalMode] = useState('add'); // 'add' | 'edit'
  const [editingSchId, setEditingSchId] = useState(null);
  const [schForm, setSchForm] = useState({
    title: '',
    description: '',
    provider: 'Dövlət Proqramı',
    country: 'Azərbaycan',
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
  const [schProgress, setSchProgress] = useState({ visible: false, percent: 0, text: '' });

  // 4. TEAM & SETTINGS STATE
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: 'Admissions Officer'
  });

  const [portalSettings, setPortalSettings] = useState({
    adminName: 'Admin',
    adminEmail: loggedInUserEmail || 'admin@edusaz.com',
    contactPhone: '+994 12 539 05 17',
    notificationEmail: true,
    notificationSms: false,
    weeklyDigest: true,
    leadAutoSync: true
  });

  useEffect(() => {
    if (loggedInAdminProfile) {
      const fullName = `${loggedInAdminProfile.firstName || ''} ${loggedInAdminProfile.lastName || ''}`.trim();
      setPortalSettings(prev => ({
        ...prev,
        adminName: fullName || prev.adminName,
        adminEmail: loggedInAdminProfile.email || loggedInUserEmail,
        contactPhone: loggedInAdminProfile.phone || prev.contactPhone
      }));
    }
  }, [loggedInAdminProfile, loggedInUserEmail]);

  // ── AI TRANSLATION HANDLERS (31 LANGUAGES) ──────────────────────────────────
  const handleAiTranslateUni = async () => {
    if (!uniForm.name?.trim() && !uniForm.description?.trim()) {
      toast.showError("Zəhmət olmasa əvvəlcə Universitetin əsas adını və ya təsvirini daxil edin!");
      return;
    }
    setIsTranslatingUni(true);
    setUniProgress({ visible: true, percent: 10, text: '31 dildə tərcümə paketi hazırlanır...' });
    toast.showInfo("Universitet profili 31 dilə tərcümə olunur... ⏳");

    try {
      const baseName = uniForm.name?.trim() || '';
      const baseDesc = uniForm.description?.trim() || `${baseName} - Yüksək keyfiyyətli beynəlxalq təhsil imkanları təqdim edən qabaqcıl ali təhsil müəssisəsi.`;
      const baseCity = uniForm.city?.trim() || 'Bakı';

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
              newTranslations['az'] = { name: baseName, description: baseDesc, city: baseCity };
              completedLangs++;
              return;
            }

            const [tName, tDesc, tCity] = await Promise.all([
              translateText(baseName, 'az', langCode),
              translateText(baseDesc, 'az', langCode),
              translateText(baseCity, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tName || `${baseName} (${langCode.toUpperCase()})`,
              description: tDesc || baseDesc,
              city: tCity || baseCity
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

      setUniForm(prev => ({ ...prev, translations: newTranslations }));
      setUniProgress({ visible: true, percent: 100, text: '✨ Bütün 31 dil üçün profil 100% tərcümə olundu!' });
      toast.showSuccess("✨ Universitet profili 31 qlobal dilə uğurla tərcümə edildi!");
    } catch (err) {
      console.error(err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingUni(false);
      setTimeout(() => setUniProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev), 3500);
    }
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

      setProgForm(prev => ({ ...prev, translations: newTranslations }));
      setProgProgress({ visible: true, percent: 100, text: '✨ Bütün 31 dil üçün proqram adı və təsviri 100% tərcümə olundu!' });
      toast.showSuccess("✨ Bütün 31 dil üçün proqram adı və təsviri avtomatik tərcümə olundu!");
    } catch (err) {
      console.error(err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingProg(false);
      setTimeout(() => setProgProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev), 3500);
    }
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
      const baseDesc = schForm.description?.trim() || `${baseTitle} - Beynəlxalq təhsil xərclərini tam və ya hissəvi qarşılayan rəsmi qrant və təqaüd proqramı.`;
      const baseCoverage = schForm.coverage?.trim() || 'Tam Təqaüd';
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
              newTranslations['az'] = { name: baseTitle, title: baseTitle, description: baseDesc, coverage: baseCoverage };
              completedLangs++;
              return;
            }

            const [tTitle, tDesc, tCov] = await Promise.all([
              translateText(baseTitle, 'az', langCode),
              translateText(baseDesc, 'az', langCode),
              translateText(baseCoverage, 'az', langCode)
            ]);

            newTranslations[langCode] = {
              name: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              title: tTitle || `${baseTitle} (${langCode.toUpperCase()})`,
              description: tDesc || baseDesc,
              coverage: tCov || baseCoverage
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

      setSchForm(prev => ({ ...prev, translations: newTranslations }));
      setSchProgress({ visible: true, percent: 100, text: '✨ Bütün 31 dil üçün təqaüd adı və təsviri 100% tərcümə olundu!' });
      toast.showSuccess("✨ Bütün 31 dil üçün təqaüd adı və təsviri avtomatik tərcümə olundu!");
    } catch (err) {
      console.error(err);
      toast.showError("Tərcümə zamanı xəta baş verdi.");
    } finally {
      setIsTranslatingSch(false);
      setTimeout(() => setSchProgress(prev => prev.percent === 100 ? { ...prev, visible: false } : prev), 3500);
    }
  };

  // ── SAVE HANDLERS ─────────────────────────────────────────────────────────
  const handleSaveUniProfile = async (e) => {
    e?.preventDefault();
    setIsSavingUni(true);
    try {
      if (currentUni?.id || targetUniId) {
        await updateUniversityBackend({
          id: currentUni?.id || targetUniId,
          ...uniForm
        }).unwrap();
      } else {
        await createUniversity({
          ...uniForm
        }).unwrap();
      }
      toast.showSuccess("🏛️ Universitet profili 31 dildə uğurla bazada yeniləndi! 🎉");
      refetchUniversities();
    } catch (err) {
      toast.showError("Yadda saxlanarkən xəta: " + (err?.data?.message || err?.message || 'Xəta'));
    } finally {
      setIsSavingUni(false);
    }
  };

  const handleOpenProgModal = (mode, prog = null) => {
    setProgModalMode(mode);
    setActiveProgLangSubTab('az');
    if (mode === 'edit' && prog) {
      setEditingProgId(prog.id);
      const tuitionFeeRaw = prog.tuitionFee || prog.tuition || '3500 AZN / il';
      const parts = tuitionFeeRaw.split(' ');
      setProgForm({
        title: prog.title || prog.name || '',
        description: prog.description || '',
        country: prog.country || 'Azərbaycan',
        degree: prog.degreeLevel || prog.degree || 'Bakalavr',
        tuitionAmount: parts[0] || '3500',
        tuitionCurrency: parts[1] || 'AZN',
        tuitionPeriod: parts.slice(2).join(' ') || '/ il',
        duration: prog.duration || '4 il',
        language: prog.languageOfInstruction || prog.teachingLanguage || prog.language || 'İngilis dili',
        status: prog.status || 'Aktiv',
        translations: prog.translations || generateDefault31Translations(prog.title || prog.name, prog.description)
      });
    } else {
      setEditingProgId(null);
      setProgForm({
        title: '',
        description: '',
        country: currentUni?.country || 'Azərbaycan',
        degree: 'Bakalavr',
        tuitionAmount: '3500',
        tuitionCurrency: 'AZN',
        tuitionPeriod: '/ il',
        duration: '4 il',
        language: 'İngilis dili',
        status: 'Aktiv',
        translations: generateDefault31Translations()
      });
    }
    setShowProgModal(true);
  };

  const handleSaveProgSubmit = async (e) => {
    e.preventDefault();
    if (!progForm.title) {
      toast.showError("Zəhmət olmasa proqram adını daxil edin!");
      return;
    }

    const payload = {
      universityId: currentUni?.id || targetUniId || '',
      title: progForm.title,
      name: progForm.title,
      description: progForm.description,
      degreeLevel: progForm.degree,
      degree: progForm.degree,
      tuitionFee: `${progForm.tuitionAmount} ${progForm.tuitionCurrency} ${progForm.tuitionPeriod}`.trim(),
      duration: progForm.duration,
      languageOfInstruction: progForm.language,
      teachingLanguage: progForm.language,
      country: progForm.country,
      status: progForm.status,
      translations: progForm.translations
    };

    try {
      if (progModalMode === 'edit' && editingProgId) {
        await updateProgramBackend({ id: editingProgId, ...payload }).unwrap();
        toast.showSuccess("🎓 İxtisas 31 dildə uğurla yeniləndi!");
      } else {
        await createProgramBackend(payload).unwrap();
        toast.showSuccess("✨ Yeni ixtisas 31 dildə bazaya əlavə edildi!");
      }
      setShowProgModal(false);
      refetchPrograms();
    } catch (err) {
      toast.showError("Xəta baş verdi: " + (err?.data?.message || err?.message || 'Xəta'));
    }
  };

  const handleDeleteProg = async (id) => {
    if (window.confirm("Bu ixtisası silmək istədiyinizə əminsiniz?")) {
      try {
        await deleteProgramBackend(id).unwrap();
        toast.showSuccess("İxtisas bazadan silindi! 🗑️");
        refetchPrograms();
      } catch (err) {
        toast.showError("Silinmə xətası baş verdi.");
      }
    }
  };

  const handleOpenSchModal = (mode, sch = null) => {
    setSchModalMode(mode);
    setActiveSchLangSubTab('az');
    if (mode === 'edit' && sch) {
      setEditingSchId(sch.id);
      setSchForm({
        title: sch.name || sch.title || '',
        description: sch.description || '',
        provider: sch.provider || sch.organization || currentUni?.name || 'Dövlət Proqramı',
        country: sch.country || currentUni?.country || 'Azərbaycan',
        coverage: sch.coverage || sch.amount || 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
        amount: sch.amount || '100% Tam Təminat',
        deadline: sch.deadline ? sch.deadline.split('T')[0] : '2026-11-15',
        eligible: sch.eligible || 'Bütün Təhsil Pillələri',
        places: sch.places || '50 yer',
        status: sch.status || 'Aktiv',
        translations: sch.translations || generateDefault31Translations(sch.name || sch.title, sch.description)
      });
    } else {
      setEditingSchId(null);
      setSchForm({
        title: '',
        description: '',
        provider: currentUni?.name || 'Dövlət Proqramı',
        country: currentUni?.country || 'Azərbaycan',
        coverage: 'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
        amount: '100% Tam Təminat',
        deadline: '2026-11-15',
        eligible: 'Bütün Təhsil Pillələri',
        places: '50 yer',
        status: 'Aktiv',
        translations: generateDefault31Translations()
      });
    }
    setShowSchModal(true);
  };

  const handleSaveSchSubmit = async (e) => {
    e.preventDefault();
    if (!schForm.title) {
      toast.showError("Zəhmət olmasa təqaüd adını daxil edin!");
      return;
    }

    const payload = {
      universityId: currentUni?.id || targetUniId || '',
      name: schForm.title,
      title: schForm.title,
      description: schForm.description,
      provider: schForm.provider,
      organization: schForm.provider,
      coverage: schForm.coverage,
      amount: schForm.amount,
      deadline: schForm.deadline,
      eligible: schForm.eligible,
      places: schForm.places,
      status: schForm.status,
      translations: schForm.translations
    };

    try {
      if (schModalMode === 'edit' && editingSchId) {
        await updateScholarshipBackend({ id: editingSchId, ...payload }).unwrap();
        toast.showSuccess("💰 Təqaüd 31 dildə uğurla yeniləndi!");
      } else {
        await createScholarshipBackend(payload).unwrap();
        toast.showSuccess("✨ Yeni təqaüd 31 dildə bazaya əlavə edildi!");
      }
      setShowSchModal(false);
      refetchScholarships();
    } catch (err) {
      toast.showError("Xəta baş verdi: " + (err?.data?.message || err?.message || 'Xəta'));
    }
  };

  const handleDeleteSch = async (id) => {
    if (window.confirm("Bu təqaüdü silmək istədiyinizə əminsiniz?")) {
      try {
        await deleteScholarshipBackend(id).unwrap();
        toast.showSuccess("Təqaüd bazadan silindi! 🗑️");
        refetchScholarships();
      } catch (err) {
        toast.showError("Silinmə xətası baş verdi.");
      }
    }
  };

  // Image Upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImg(true);
    const reader = new FileReader();
    reader.onload = () => {
      setUniForm(prev => ({ ...prev, logoUrl: reader.result }));
      setIsUploadingImg(false);
      toast.showSuccess("Loqo şəkli seçildi!");
    };
    reader.readAsDataURL(file);
  };

  // Gallery Upload handler
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingGallery(true);
    let loaded = 0;
    const newImgs = [...(uniForm.images || [])];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newImgs.push(reader.result);
        loaded++;
        if (loaded === files.length) {
          setUniForm(prev => ({ ...prev, images: newImgs }));
          setIsUploadingGallery(false);
          toast.showSuccess(`${files.length} ədəd şəkil qalereyaya əlavə edildi!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Video URL Add/Remove
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setUniForm(prev => ({
      ...prev,
      videoUrls: [...(prev.videoUrls || []), videoUrlInput.trim()]
    }));
    setVideoUrlInput('');
    toast.showSuccess("Video linki əlavə edildi!");
  };

  const handleRemoveVideoUrl = (idx) => {
    setUniForm(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== idx)
    }));
  };

  // Student Leads Status Update
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await updateLeadStatusBackend({ id: leadId, status: newStatus }).unwrap();
      refetchLeads();
      toast.showSuccess(`Müraciət statusu yeniləndi: ${newStatus}`);
    } catch (_) {
      toast.showError("Status yenilənmədi.");
    }
  };

  // Navigation Items (Campaigns removed as requested!)
  const navItems = [
    { id: 'Overview', name: 'Ümumi Baxış', icon: <OverviewIcon /> },
    { id: 'University Profile', name: 'Universitet Profili (31 Dil)', icon: <ProfileIcon /> },
    { id: 'Programs', name: `İxtisaslar (${backendPrograms?.length || 0})`, icon: <ProgramsIcon /> },
    { id: 'Scholarships', name: `Təqaüdlər (${backendScholarships?.length || 0})`, icon: <ScholarshipsIcon /> },
    { id: 'Student Leads', name: `Tələbə Müraciətləri (${backendLeads?.length || 0})`, icon: <LeadsIcon /> },
    { id: 'Analytics', name: 'Analitika', icon: <AnalyticsIcon /> },
    { id: 'Settings', name: 'Tənzimləmələr', icon: <SettingsIcon /> },
  ];

  return (
    <div className="university-portal">
      <ScrollToTop />

      {/* 1. SIDEBAR */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <LogoIcon />
          <span className="brand-name">EDUSAZ</span>
          <span className="portal-badge">Admin Portal</span>
        </div>

        <div className="university-identity">
          <div className="uni-logo-box">
            <span className="uni-icon">
              {uniForm.logoUrl ? (
                <img src={uniForm.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
              ) : '🏛️'}
            </span>
          </div>
          <div className="uni-info">
            <h3 className="uni-name">{uniForm.name || currentUni?.name || "Universitetiniz"}</h3>
            <span className="uni-tier">🏛️ Təsdiqlənmiş Tərəfdaş</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-signout" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Çıxış Et
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="portal-main">
        <header className="main-header">
          <div className="header-breadcrumbs">
            <span className="bc-muted">Universitet Portalı</span>
            <span className="bc-current">{uniForm.name ? `${uniForm.name} · ${uniForm.country}` : "Universitet Profili"}</span>
          </div>
          <div className="header-actions">
            <Link to={`/university/${currentUni?.id || targetUniId || '1'}`} target="_blank" className="btn-preview-site">
              🌐 Saytda Gör
            </Link>
          </div>
        </header>

        <div className="portal-content-body" style={{ padding: '24px' }}>

          {/* TAB 1: OVERVIEW (100% Dynamic Backend Data) */}
          {activeTab === 'Overview' && (
            <div className="portal-panel overview-panel animate-fade-in">
              <div className="overview-hero-card" style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
                borderRadius: '20px',
                padding: '32px',
                color: '#fff',
                marginBottom: '28px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0' }}>
                    Xoş gəlmisiniz, {uniForm.name || currentUni?.name || 'Universitet Admini'}! 👋
                  </h1>
                  <p style={{ color: '#cbd5e1', fontSize: '15px', margin: 0 }}>
                    Universitet profiliniz, 31 dildə ixtisaslarınız, təqaüdlər və tələbə müraciətləri real vaxt rejimində sinxronlaşdırılır.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-add-primary" onClick={() => handleOpenProgModal('add')}>
                    + Yeni İxtisas Əlavə Et
                  </button>
                  <button className="btn-add-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} onClick={() => handleOpenSchModal('add')}>
                    + Yeni Təqaüd Əlavə Et
                  </button>
                </div>
              </div>

              {/* Dynamic Stats Grid */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                  <span style={{ fontSize: '28px' }}>🎓</span>
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>
                      {backendPrograms?.length || 0}
                    </h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Aktiv İxtisaslar / Proqramlar</span>
                  </div>
                </div>

                <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                  <span style={{ fontSize: '28px' }}>💰</span>
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', margin: '0 0 4px 0' }}>
                      {backendScholarships?.length || 0}
                    </h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Təqaüd Proqramları</span>
                  </div>
                </div>

                <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                  <span style={{ fontSize: '28px' }}>📨</span>
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', margin: '0 0 4px 0' }}>
                      {backendLeads?.length || 0}
                    </h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Tələbə Müraciətləri</span>
                  </div>
                </div>

                <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                  <span style={{ fontSize: '28px' }}>🎯</span>
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#a855f7', margin: '0 0 4px 0' }}>
                      {uniForm.acceptanceRate || '45%'}
                    </h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Qəbul Faizi</span>
                  </div>
                </div>
              </div>

              {/* Recent Applications from Backend */}
              <div className="recent-leads-section" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                    📥 Son Gələn Tələbə Müraciətləri
                  </h3>
                  <button className="btn-text" style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => setActiveTab('Student Leads')}>
                    Hamısına Bax →
                  </button>
                </div>

                {(!backendLeads || backendLeads.length === 0) ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0', margin: 0 }}>
                    Hələlik yeni tələbə müraciəti qeydə alınmayıb.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="super-data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Tələbə</th>
                          <th>Email & Telefon</th>
                          <th>Seçilən Proqram</th>
                          <th>Tarix</th>
                          <th>Status</th>
                          <th>Əməliyyat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backendLeads.slice(0, 5).map(lead => (
                          <tr key={lead.id}>
                            <td><strong>{lead.fullName || lead.name}</strong></td>
                            <td>{lead.email} <br/><small style={{ color: '#94a3b8' }}>{lead.phone}</small></td>
                            <td>{lead.programName || lead.program || 'Ümumi Müraciət'}</td>
                            <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('az-AZ') : '—'}</td>
                            <td>
                              <span className={`status-pill ${lead.status?.toLowerCase() || 'new'}`}>
                                {lead.status || 'Yeni'}
                              </span>
                            </td>
                            <td>
                              <select
                                value={lead.status || 'New'}
                                onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                                style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px' }}
                              >
                                <option value="New">Yeni</option>
                                <option value="UnderReview">Baxılır</option>
                                <option value="Accepted">Qəbul Edildi</option>
                                <option value="Rejected">İmtina</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UNIVERSITY PROFILE (31 Languages, Gallery, Videos) */}
          {activeTab === 'University Profile' && (
            <div className="portal-panel profile-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box" style={{ marginBottom: '24px' }}>
                  <div>
                    <h3>🏛️ Universitet Profili (31 Qlobal Dildə)</h3>
                    <p className="table-desc">
                      Müəssisənizin 31 dildə tələbələrə görünən rəsmi profil məlumatları, foto və video qalereyası.
                    </p>
                  </div>
                  <button 
                    type="button"
                    className="btn-ai-translate"
                    onClick={handleAiTranslateUni}
                    disabled={isTranslatingUni}
                  >
                    {isTranslatingUni ? '⏳ AI 31 Dilə Tərcümə Edir...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <form onSubmit={handleSaveUniProfile} className="modal-form">
                  {/* Photo & Logo Upload */}
                  <div className="form-row">
                    <div className="form-group full-width" style={{ background: '#0f172a', border: '1px dashed #334155', borderRadius: '12px', padding: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '10px' }}>📷 Əsas Loqo və ya Şəkil</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {uniForm.logoUrl && (
                          <img src={uniForm.logoUrl} alt="Logo Preview" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #6366f1' }} />
                        )}
                        <div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleLogoUpload} 
                          />
                          <button type="button" className="btn-add-primary" onClick={() => fileInputRef.current?.click()}>
                            📁 Kompüterdən Loqo Seç
                          </button>
                          <input 
                            type="url" 
                            placeholder="və ya Loqo URL linki..." 
                            value={uniForm.logoUrl} 
                            onChange={e => setUniForm({ ...uniForm, logoUrl: e.target.value })} 
                            style={{ marginTop: '10px', display: 'block', width: '320px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campus Gallery */}
                  <div className="form-row">
                    <div className="form-group full-width" style={{ background: '#0f172a', border: '1px dashed #334155', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label>🖼️ Kampus və Universitet Şəkilləri Qalereyası ({uniForm.images?.length || 0} şəkil)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          ref={galleryInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleGalleryUpload} 
                        />
                        <button type="button" className="btn-add-primary" onClick={() => galleryInputRef.current?.click()}>
                          + Şəkillər Əlavə Et (Çoxlu)
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {(!uniForm.images || uniForm.images.length === 0) ? (
                          <span style={{ color: '#64748b', fontSize: '13px' }}>Hələ heç bir əlavə kampus şəkli yüklənməyib.</span>
                        ) : (
                          uniForm.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img src={img} alt={`Campus ${idx}`} style={{ width: '90px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                              <button 
                                type="button" 
                                onClick={() => setUniForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video Links */}
                  <div className="form-row">
                    <div className="form-group full-width" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                      <label>🎥 Universitet Video Linkləri (YouTube / Vimeo)</label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input 
                          type="url" 
                          placeholder="Məsələn: https://www.youtube.com/watch?v=..." 
                          value={videoUrlInput}
                          onChange={e => setVideoUrlInput(e.target.value)}
                        />
                        <button type="button" className="btn-add-primary" onClick={handleAddVideoUrl}>
                          + Video Əlavə Et
                        </button>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {uniForm.videoUrls?.map((vid, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '8px 12px', borderRadius: '8px' }}>
                            <span style={{ color: '#818cf8', fontSize: '13px' }}>🎬 {vid}</span>
                            <button type="button" onClick={() => handleRemoveVideoUrl(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Sil
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* General Info Grid */}
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label>Universitetin Adı *</label>
                      <input 
                        type="text" 
                        required 
                        value={uniForm.name} 
                        onChange={e => setUniForm({ ...uniForm, name: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Ölkə *</label>
                      <select 
                        value={uniForm.country} 
                        onChange={e => setUniForm({ ...uniForm, country: e.target.value })}
                        style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                      >
                        {backendCountries?.map(c => (
                          <option key={c.id} value={c.name}>{c.flagEmoji || '🏳️'} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Şəhər *</label>
                      <input 
                        type="text" 
                        required 
                        value={uniForm.city} 
                        onChange={e => setUniForm({ ...uniForm, city: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Dünya / Ölkə Reytinqi</label>
                      <input 
                        type="text" 
                        value={uniForm.ranking} 
                        onChange={e => setUniForm({ ...uniForm, ranking: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Yaranma İli</label>
                      <input 
                        type="number" 
                        value={uniForm.establishedYear} 
                        onChange={e => setUniForm({ ...uniForm, establishedYear: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>İllik Təhsil Haqqı</label>
                      <input 
                        type="text" 
                        value={uniForm.tuition} 
                        onChange={e => setUniForm({ ...uniForm, tuition: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Qəbul Faizi</label>
                      <input 
                        type="text" 
                        value={uniForm.acceptanceRate} 
                        onChange={e => setUniForm({ ...uniForm, acceptanceRate: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Tədris Dili</label>
                      <input 
                        type="text" 
                        value={uniForm.teachingLanguage} 
                        onChange={e => setUniForm({ ...uniForm, teachingLanguage: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Qəbul Son Tarixi</label>
                      <input 
                        type="text" 
                        value={uniForm.deadline} 
                        onChange={e => setUniForm({ ...uniForm, deadline: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Rəsmi Vebsayt Linki</label>
                      <input 
                        type="url" 
                        value={uniForm.website} 
                        onChange={e => setUniForm({ ...uniForm, website: e.target.value })} 
                      />
                    </div>
                  </div>

                  {/* 31 Languages Tabs */}
                  <div className="multi-lang-section" style={{ marginTop: '24px', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: '700' }}>
                        🌐 31 Qlobal Dildə Təsvir və Lokalizasiya
                      </h4>
                    </div>

                    <div className="lang-subtabs-bar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {ALL_31_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          className={`lang-subtab-btn ${activeLangSubTab === lang.code ? 'active' : ''}`}
                          onClick={() => setActiveLangSubTab(lang.code)}
                        >
                          <span>{lang.flag}</span> {lang.code.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <label>{activeLangSubTab.toUpperCase()} Dilində Universitet Adı:</label>
                        <input
                          type="text"
                          value={uniForm.translations?.[activeLangSubTab]?.name || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setUniForm(prev => ({
                              ...prev,
                              translations: {
                                ...(prev.translations || {}),
                                [activeLangSubTab]: {
                                  ...(prev.translations?.[activeLangSubTab] || {}),
                                  name: val
                                }
                              }
                            }));
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginTop: '12px' }}>
                        <label>{activeLangSubTab.toUpperCase()} Dilində Təsvir:</label>
                        <textarea
                          rows="4"
                          value={uniForm.translations?.[activeLangSubTab]?.description || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setUniForm(prev => ({
                              ...prev,
                              translations: {
                                ...(prev.translations || {}),
                                [activeLangSubTab]: {
                                  ...(prev.translations?.[activeLangSubTab] || {}),
                                  description: val
                                }
                              }
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uniProgress.visible && (
                    <div className="uni-progress-container animate-fade-in" style={{ marginTop: '20px' }}>
                      <div className="uni-progress-header">
                        <span className="uni-progress-text">{uniProgress.percent === 100 ? '✅' : '⚡'} {uniProgress.text}</span>
                        <span className="uni-progress-badge">{uniProgress.percent}%</span>
                      </div>
                      <div className="uni-progress-track">
                        <div className={`uni-progress-fill ${uniProgress.percent === 100 ? 'complete' : ''}`} style={{ width: `${uniProgress.percent}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="modal-actions" style={{ marginTop: '24px' }}>
                    <button type="submit" className="btn-save-primary" disabled={isSavingUni}>
                      {isSavingUni ? '⏳ Yadda Saxlanılır...' : '💾 Məlumatları Yenilə (31 Dil)'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAMS (Exact Matching SuperAdmin) */}
          {activeTab === 'Programs' && (
            <div className="portal-panel programs-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box">
                  <div>
                    <h3>🎓 İxtisaslar və Proqramlar ({backendPrograms?.length || 0})</h3>
                    <p className="table-desc">Universitetinizin təklif etdiyi bakalavr, magistr və doktorantura tədris proqramları (31 dildə).</p>
                  </div>
                  <button className="btn-add-primary" onClick={() => handleOpenProgModal('add')}>
                    + Yeni Proqram Əlavə Et (31 Dil)
                  </button>
                </div>

                <div className="data-table-wrapper">
                  <table className="super-data-table">
                    <thead>
                      <tr>
                        <th>İxtisas / Proqram</th>
                        <th>Dərəcə</th>
                        <th>Tədris Dili</th>
                        <th>Müddət</th>
                        <th>Təhsil Haqqı</th>
                        <th>Status</th>
                        <th>Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!backendPrograms || backendPrograms.length === 0) ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Hələlik heç bir proqram əlavə edilməyib. "+ Yeni Proqram Əlavə Et" düyməsindən istifadə edin.
                          </td>
                        </tr>
                      ) : (
                        backendPrograms.map(prog => (
                          <tr key={prog.id}>
                            <td>
                              <strong style={{ color: '#fff' }}>{prog.title || prog.name}</strong>
                              <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>
                                {prog.description?.slice(0, 60)}...
                              </span>
                            </td>
                            <td><span className="badge-degree">{prog.degreeLevel || prog.degree || 'Bakalavr'}</span></td>
                            <td>{prog.languageOfInstruction || prog.teachingLanguage || prog.language || 'İngilis dili'}</td>
                            <td>{prog.duration || '4 il'}</td>
                            <td style={{ color: '#38bdf8', fontWeight: '600' }}>{prog.tuitionFee || prog.tuition || '3500 AZN / il'}</td>
                            <td><span className="status-badge active">{prog.status || 'Aktiv'}</span></td>
                            <td>
                              <div className="table-action-btns">
                                <button className="btn-action-edit" onClick={() => handleOpenProgModal('edit', prog)}>✏️</button>
                                <button className="btn-action-delete" onClick={() => handleDeleteProg(prog.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOLARSHIPS (Exact Matching SuperAdmin) */}
          {activeTab === 'Scholarships' && (
            <div className="portal-panel scholarships-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box">
                  <div>
                    <h3>💰 Təqaüdlər və Qrantlar ({backendScholarships?.length || 0})</h3>
                    <p className="table-desc">Universitetiniz tərəfindən və ya dövlət xətti ilə təklif olunan 31 dilli təqaüd proqramları.</p>
                  </div>
                  <button className="btn-add-primary" onClick={() => handleOpenSchModal('add')}>
                    + Yeni Təqaüd Əlavə Et (31 Dil)
                  </button>
                </div>

                <div className="data-table-wrapper">
                  <table className="super-data-table">
                    <thead>
                      <tr>
                        <th>Təqaüd Adı</th>
                        <th>Təminatçı</th>
                        <th>Əhatə / Məbləğ</th>
                        <th>Yer Sayı</th>
                        <th>Son Tarix</th>
                        <th>Status</th>
                        <th>Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!backendScholarships || backendScholarships.length === 0) ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Hələlik heç bir təqaüd proqramı əlavə edilməyib.
                          </td>
                        </tr>
                      ) : (
                        backendScholarships.map(sch => (
                          <tr key={sch.id}>
                            <td>
                              <strong style={{ color: '#fff' }}>{sch.name || sch.title}</strong>
                              <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>{sch.eligible}</span>
                            </td>
                            <td>{sch.provider || sch.organization || currentUni?.name}</td>
                            <td style={{ color: '#10b981', fontWeight: '600' }}>{sch.coverage || sch.amount}</td>
                            <td>{sch.places || '50 yer'}</td>
                            <td>{sch.deadline ? sch.deadline.split('T')[0] : '—'}</td>
                            <td><span className="status-badge active">{sch.status || 'Aktiv'}</span></td>
                            <td>
                              <div className="table-action-btns">
                                <button className="btn-action-edit" onClick={() => handleOpenSchModal('edit', sch)}>✏️</button>
                                <button className="btn-action-delete" onClick={() => handleDeleteSch(sch.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT LEADS */}
          {activeTab === 'Student Leads' && (
            <div className="portal-panel leads-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box">
                  <div>
                    <h3>📨 Tələbə Müraciətləri ({backendLeads?.length || 0})</h3>
                    <p className="table-desc">Universitetinizə portal vasitəsilə müraciət etmiş tələbələrin əlaqə məlumatları və statusları.</p>
                  </div>
                </div>

                <div className="data-table-wrapper">
                  <table className="super-data-table">
                    <thead>
                      <tr>
                        <th>Tələbə</th>
                        <th>Email & Əlaqə</th>
                        <th>Ölkə</th>
                        <th>İxtisas</th>
                        <th>Tarix</th>
                        <th>Status</th>
                        <th>Statusu Dəyiş</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!backendLeads || backendLeads.length === 0) ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Hələlik heç bir tələbə müraciəti qeydə alınmayıb.
                          </td>
                        </tr>
                      ) : (
                        backendLeads.map(lead => (
                          <tr key={lead.id}>
                            <td><strong>{lead.fullName || lead.name}</strong></td>
                            <td>
                              <div>{lead.email}</div>
                              <small style={{ color: '#94a3b8' }}>{lead.phone}</small>
                            </td>
                            <td>{lead.country || 'Azərbaycan'}</td>
                            <td><strong style={{ color: '#c4b5fd' }}>{lead.programName || lead.program || 'Ümumi Müraciət'}</strong></td>
                            <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('az-AZ') : '—'}</td>
                            <td>
                              <span className={`status-pill ${lead.status?.toLowerCase() || 'new'}`}>
                                {lead.status === 'Accepted' ? 'Qəbul Edildi' : lead.status === 'Rejected' ? 'İmtina' : lead.status === 'UnderReview' ? 'Baxılır' : 'Yeni'}
                              </span>
                            </td>
                            <td>
                              <select
                                value={lead.status || 'New'}
                                onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                                style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px' }}
                              >
                                <option value="New">Yeni</option>
                                <option value="UnderReview">Baxılır</option>
                                <option value="Accepted">Qəbul Edildi</option>
                                <option value="Rejected">İmtina</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'Analytics' && (
            <div className="portal-panel analytics-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box">
                  <div>
                    <h3>📊 Universitet Analitikası & Hesabatlar</h3>
                    <p className="table-desc">Profil baxışları, müraciət konversiyası və tələbə marağı üzrə statistik göstəricilər.</p>
                  </div>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <span style={{ fontSize: '28px' }}>👀</span>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '12px 0 4px 0' }}>{analyticsData?.totalViews || 1420}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Ümumi Profil Baxışı</span>
                  </div>
                  <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <span style={{ fontSize: '28px' }}>📈</span>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', margin: '12px 0 4px 0' }}>8.4%</h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Müraciət Konversiyası</span>
                  </div>
                  <div className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <span style={{ fontSize: '28px' }}>🌍</span>
                    <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', margin: '12px 0 4px 0' }}>14</h3>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Müraciət Edən Ölkələr</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & TEAM */}
          {activeTab === 'Settings' && (
            <div className="portal-panel settings-panel animate-fade-in">
              <div className="super-table-container">
                <div className="table-header-box">
                  <div>
                    <h3>⚙️ Portal Tənzimləmələri və Komanda</h3>
                    <p className="table-desc">Admin əlaqə məlumatları və bildiriş parametrləri.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <h4 style={{ color: '#fff', margin: '0 0 16px 0' }}>👤 Baş Admin Əlaqə Məlumatı</h4>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Admin Adı</label>
                      <input type="text" value={portalSettings.adminName} onChange={e => setPortalSettings({ ...portalSettings, adminName: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Email Ünvanı</label>
                      <input type="email" value={portalSettings.adminEmail} onChange={e => setPortalSettings({ ...portalSettings, adminEmail: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label>Telefon Nömrəsi</label>
                      <input type="text" value={portalSettings.contactPhone} onChange={e => setPortalSettings({ ...portalSettings, contactPhone: e.target.value })} />
                    </div>
                    <button className="btn-save-primary" onClick={() => toast.showSuccess("Tənzimləmələr saxlanıldı!")}>
                      Yadda Saxla
                    </button>
                  </div>

                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
                    <h4 style={{ color: '#fff', margin: '0 0 16px 0' }}>🔔 Bildiriş Parametrləri</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input type="checkbox" checked={portalSettings.notificationEmail} onChange={e => setPortalSettings({ ...portalSettings, notificationEmail: e.target.checked })} />
                        Yeni müraciət gəldikdə dərhal Email bildirişi göndər
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input type="checkbox" checked={portalSettings.weeklyDigest} onChange={e => setPortalSettings({ ...portalSettings, weeklyDigest: e.target.checked })} />
                        Həftəlik müraciət hesabatını göndər
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── PROGRAM CREATE / EDIT MODAL (Exact Matching SuperAdmin Screenshot 1) ── */}
      {showProgModal && (
        <div className="modal-overlay" onClick={() => setShowProgModal(false)}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '840px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{progModalMode === 'add' ? '🎓 Yeni Proqram (31 Dildə Bazaya Əlavə)' : '✏️ Proqram Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => setShowProgModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveProgSubmit} className="modal-form">
              {/* Row 1: Title, Country */}
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

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ölkə *</label>
                  <select 
                    value={progForm.country} 
                    onChange={e => setProgForm({ ...progForm, country: e.target.value })}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                  >
                    {backendCountries?.map(c => (
                      <option key={c.id} value={c.name}>{c.flagEmoji || '🇦🇿'} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Degree, Language, Duration */}
              <div className="form-row">
                <div className="form-group">
                  <label>Təhsil Dərəcəsi *</label>
                  <select 
                    value={progForm.degree} 
                    onChange={e => setProgForm({ ...progForm, degree: e.target.value })}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                  >
                    <option value="Bakalavr">🎓 Bakalavr (Bachelor)</option>
                    <option value="Magistr">📜 Magistr (Master)</option>
                    <option value="Doktorantura / PhD">🔬 Doktorantura / PhD</option>
                    <option value="Diplom / Sertifikat">📑 Diplom / Sertifikat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>🌐 Tədris Dili (Seçim ilə) *</label>
                  <select 
                    value={progForm.language} 
                    onChange={e => setProgForm({ ...progForm, language: e.target.value })}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                  >
                    <option value="İngilis dili">🇬🇧 İngilis dili</option>
                    <option value="Azərbaycan dili">🇦🇿 Azərbaycan dili</option>
                    <option value="Rus dili">🇷🇺 Rus dili</option>
                    <option value="Türk dili">🇹🇷 Türk dili</option>
                    <option value="Alman dili">🇩🇪 Alman dili</option>
                    <option value="Fransız dili">🇫🇷 Fransız dili</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>⌛ Müddət (İl və Ay Seçimi ilə) *</label>
                  <select 
                    value={progForm.duration} 
                    onChange={e => setProgForm({ ...progForm, duration: e.target.value })}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                  >
                    <option value="4 il">4 il (Standart Bakalavr)</option>
                    <option value="2 il">2 il (Standart Magistr)</option>
                    <option value="3 il">3 il (Doktorantura / PhD)</option>
                    <option value="1 il">1 il (Sürətli Təhsil)</option>
                    <option value="5 il">5 il (Tibb / Mühəndislik)</option>
                    <option value="6 ay">6 ay (Sertifikat / Hazırlıq)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Tuition Fee with Currency and Period Selectors */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label>💰 Təhsil Haqqı və Məzənnə *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                    <input 
                      type="number" 
                      value={progForm.tuitionAmount} 
                      onChange={e => setProgForm({ ...progForm, tuitionAmount: e.target.value })} 
                      placeholder="3500" 
                      required 
                    />
                    <select 
                      value={progForm.tuitionCurrency} 
                      onChange={e => setProgForm({ ...progForm, tuitionCurrency: e.target.value })}
                      style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                    >
                      <option value="AZN">₼ AZN (Manat)</option>
                      <option value="USD">$ USD (Dollar)</option>
                      <option value="EUR">€ EUR (Avro)</option>
                      <option value="GBP">£ GBP (Funt)</option>
                      <option value="TRY">₺ TRY (Lirə)</option>
                    </select>
                    <select 
                      value={progForm.tuitionPeriod} 
                      onChange={e => setProgForm({ ...progForm, tuitionPeriod: e.target.value })}
                      style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                    >
                      <option value="/ il">/ il (İllik)</option>
                      <option value="/ semestr">/ semestr (Yarımillik)</option>
                      <option value="/ ümumi">/ ümumi (Tam kurs)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description AZ */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label>📝 Proqram Haqqında Ətraflı Təsvir (Əsas Dil - AZ)</label>
                  <textarea 
                    rows="3" 
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
              </div>

              {/* 31 Languages Tabs & AI Translate Button */}
              <div className="multi-lang-section" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '15px', fontWeight: '700' }}>
                      🌍 31 Qlobal Dildə İxtisas və Təsvir Lokalizasiyası
                    </h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>AI ilə bir kliklə bütün dillərə tərcümə edin və ya fərdi redaktə edin:</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-ai-translate" 
                    onClick={handleAiTranslateProg}
                    disabled={isTranslatingProg}
                  >
                    {isTranslatingProg ? '⏳ Tərcümə olunur...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <div className="lang-subtabs-bar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {ALL_31_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-subtab-btn ${activeProgLangSubTab === lang.code ? 'active' : ''}`}
                      onClick={() => setActiveProgLangSubTab(lang.code)}
                    >
                      <span>{lang.flag}</span> {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label>{activeProgLangSubTab.toUpperCase()} Dilində Proqram Adı:</label>
                    <input 
                      type="text" 
                      value={progForm.translations?.[activeProgLangSubTab]?.title || progForm.translations?.[activeProgLangSubTab]?.name || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setProgForm(prev => ({
                          ...prev,
                          translations: {
                            ...(prev.translations || {}),
                            [activeProgLangSubTab]: {
                              ...(prev.translations?.[activeProgLangSubTab] || {}),
                              title: val,
                              name: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Proqram adı (${activeProgLangSubTab.toUpperCase()})...`} 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>{activeProgLangSubTab.toUpperCase()} Dilində Təsvir:</label>
                    <textarea 
                      rows="3" 
                      value={progForm.translations?.[activeProgLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setProgForm(prev => ({
                          ...prev,
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

              {/* Progress Bar */}
              {progProgress.visible && (
                <div className="uni-progress-container animate-fade-in" style={{ marginTop: '16px' }}>
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">{progProgress.percent === 100 ? '✅' : '⚡'} {progProgress.text}</span>
                    <span className="uni-progress-badge">{progProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div className={`uni-progress-fill ${progProgress.percent === 100 ? 'complete' : ''}`} style={{ width: `${progProgress.percent}%` }} />
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowProgModal(false)}>
                  Ləğv Et
                </button>
                <button type="submit" className="btn-save-primary" disabled={isCreatingProg || isUpdatingProg || isTranslatingProg}>
                  {progModalMode === 'add' ? '✨ Proqramı Əlavə Et (31 Dil)' : '💾 Yenilə (31 Dil)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SCHOLARSHIP CREATE / EDIT MODAL (Exact Matching SuperAdmin) ── */}
      {showSchModal && (
        <div className="modal-overlay" onClick={() => setShowSchModal(false)}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '840px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{schModalMode === 'add' ? '💰 Yeni Təqaüd (31 Dildə Bazaya Əlavə)' : '✏️ Təqaüd Məlumatlarını Yenilə'}</h3>
              <button className="btn-close-modal" onClick={() => setShowSchModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveSchSubmit} className="modal-form">
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
                          az: { ...(prev.translations?.az || {}), name: val, title: val }
                        }
                      }));
                    }} 
                    placeholder="Məsələn: Fulbright / Dövlət Təqaüd Proqramı" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Təminatçı Qurum / Fond *</label>
                  <input 
                    type="text"
                    value={schForm.provider} 
                    onChange={e => setSchForm({ ...schForm, provider: e.target.value })}
                    placeholder="Məsələn: Universitet / Dövlət Proqramı"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Coverage, Amount, Deadline */}
              <div className="form-row">
                <div className="form-group">
                  <label>Təqaüd Əhatəsi *</label>
                  <select 
                    value={schForm.coverage} 
                    onChange={e => setSchForm({ ...schForm, coverage: e.target.value })}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}
                  >
                    <option value="Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)">🌟 Tam Təqaüd (Full Ride)</option>
                    <option value="Təhsil Haqqı Güzəşti (100% Tuition Waiver)">🎓 100% Təhsil Haqqı Güzəşti</option>
                    <option value="Hissəvi Təqaüd (50% Təhsil Haqqı + Stipendiya)">⚖️ Hissəvi Təqaüd (Partial)</option>
                    <option value="Aylıq Təqaüd / Yaşayış Dəstəyi (Stipend Only)">💵 Aylıq Təqaüd / Yaşayış Dəstəyi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Təqaüd Dəyəri / Məbləği</label>
                  <input 
                    type="text" 
                    value={schForm.amount} 
                    onChange={e => setSchForm({ ...schForm, amount: e.target.value })} 
                    placeholder="Məsələn: 100% Tam Təminat / $10,000" 
                  />
                </div>

                <div className="form-group">
                  <label>Son Müraciət Tarixi *</label>
                  <input 
                    type="date" 
                    value={schForm.deadline} 
                    onChange={e => setSchForm({ ...schForm, deadline: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* Row 3: Places, Eligible */}
              <div className="form-row">
                <div className="form-group">
                  <label>Yer Sayı (Kvota)</label>
                  <input 
                    type="text" 
                    value={schForm.places} 
                    onChange={e => setSchForm({ ...schForm, places: e.target.value })} 
                    placeholder="50 yer" 
                  />
                </div>

                <div className="form-group" style={{ flex: 2 }}>
                  <label>Uyğunluq / Kimlər Müraciət Edə Bilər</label>
                  <input 
                    type="text" 
                    value={schForm.eligible} 
                    onChange={e => setSchForm({ ...schForm, eligible: e.target.value })} 
                    placeholder="Bütün Təhsil Pillələri (Bakalavr, Magistr)" 
                  />
                </div>
              </div>

              {/* Description AZ */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label>📝 Təqaüdün Ətraflı Təsviri (Əsas Dil - AZ)</label>
                  <textarea 
                    rows="3" 
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
                    placeholder="Təqaüd şərtləri, aylıq təminat və seçim meyarları haqqında..." 
                  />
                </div>
              </div>

              {/* 31 Languages Tabs & AI Translate Button */}
              <div className="multi-lang-section" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '15px', fontWeight: '700' }}>
                      🌍 31 Qlobal Dildə Təqaüd Lokalizasiyası
                    </h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>AI ilə bir kliklə bütün dillərə tərcümə edin və ya fərdi redaktə edin:</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-ai-translate" 
                    onClick={handleAiTranslateSch}
                    disabled={isTranslatingSch}
                  >
                    {isTranslatingSch ? '⏳ Tərcümə olunur...' : '✨ AI ilə 31 Dilə Avtomatik Tərcümə Et'}
                  </button>
                </div>

                <div className="lang-subtabs-bar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {ALL_31_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-subtab-btn ${activeSchLangSubTab === lang.code ? 'active' : ''}`}
                      onClick={() => setActiveSchLangSubTab(lang.code)}
                    >
                      <span>{lang.flag}</span> {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label>{activeSchLangSubTab.toUpperCase()} Dilində Təqaüd Adı:</label>
                    <input 
                      type="text" 
                      value={schForm.translations?.[activeSchLangSubTab]?.title || schForm.translations?.[activeSchLangSubTab]?.name || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setSchForm(prev => ({
                          ...prev,
                          translations: {
                            ...(prev.translations || {}),
                            [activeSchLangSubTab]: {
                              ...(prev.translations?.[activeSchLangSubTab] || {}),
                              title: val,
                              name: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Təqaüd adı (${activeSchLangSubTab.toUpperCase()})...`} 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>{activeSchLangSubTab.toUpperCase()} Dilində Təsvir:</label>
                    <textarea 
                      rows="3" 
                      value={schForm.translations?.[activeSchLangSubTab]?.description || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setSchForm(prev => ({
                          ...prev,
                          translations: {
                            ...(prev.translations || {}),
                            [activeSchLangSubTab]: {
                              ...(prev.translations?.[activeSchLangSubTab] || {}),
                              description: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Təqaüd haqqında təsvir (${activeSchLangSubTab.toUpperCase()})...`} 
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {schProgress.visible && (
                <div className="uni-progress-container animate-fade-in" style={{ marginTop: '16px' }}>
                  <div className="uni-progress-header">
                    <span className="uni-progress-text">{schProgress.percent === 100 ? '✅' : '⚡'} {schProgress.text}</span>
                    <span className="uni-progress-badge">{schProgress.percent}%</span>
                  </div>
                  <div className="uni-progress-track">
                    <div className={`uni-progress-fill ${schProgress.percent === 100 ? 'complete' : ''}`} style={{ width: `${schProgress.percent}%` }} />
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowSchModal(false)}>
                  Ləğv Et
                </button>
                <button type="submit" className="btn-save-primary" disabled={isCreatingSch || isUpdatingSch || isTranslatingSch}>
                  {schModalMode === 'add' ? '✨ Təqaüdü Əlavə Et (31 Dil)' : '💾 Yenilə (31 Dil)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default UniversityPortalPage;
