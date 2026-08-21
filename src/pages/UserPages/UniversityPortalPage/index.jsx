import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useCreateUniversityMutation, 
  useCreateProgramMutation,
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
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetTeamMembersQuery,
  useCreateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetUserProfileQuery
} from '../../../services/apis/userApi';
import { autoTranslateCourseData, ALL_31_LANGUAGES, LANGUAGE_META } from '../../../services/translationService';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import { LanguageSelector } from '../../../components/UserComponents/LanguageSelector';
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

const CampaignsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

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
      if (role === 'universityadmin') {
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

  const [currentUni, setCurrentUni] = useState(null);
  const [activeTab, setActiveTab] = useState(jwtUniId ? 'Overview' : 'University Profile');

  const targetUniId = jwtUniId;

  const { data: backendPrograms } = useGetProgramsQuery(
    targetUniId
      ? { lang: i18n.language, universityId: targetUniId }
      : i18n.language
  );
  const { data: backendCountries } = useGetCountriesQuery(i18n.language);
  const { data: backendUniversities } = useGetUniversitiesQuery(i18n.language);
  const { data: backendScholarships } = useGetScholarshipsQuery(
    targetUniId
      ? { lang: i18n.language, universityId: targetUniId }
      : i18n.language
  );
  const { data: backendCampaigns } = useGetCampaignsQuery(
    targetUniId
      ? { lang: i18n.language, universityId: targetUniId }
      : i18n.language
  );
  const { data: analyticsData } = useGetAnalyticsQuery(targetUniId || 'my');
  const { data: backendLeads } = useGetStudentLeadsQuery(targetUniId || '');
  const [updateLeadStatusBackend] = useUpdateStudentLeadStatusMutation();

  const [createScholarship] = useCreateScholarshipMutation();
  const [updateScholarshipBackend] = useUpdateScholarshipMutation();
  const [deleteScholarshipBackend] = useDeleteScholarshipMutation();

  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaignBackend] = useUpdateCampaignMutation();
  const [deleteCampaignBackend] = useDeleteCampaignMutation();

  const { data: backendTeamMembers } = useGetTeamMembersQuery(targetUniId);
  const [createTeamMemberBackend] = useCreateTeamMemberMutation();
  const [deleteTeamMemberBackend] = useDeleteTeamMemberMutation();

  const loggedInUserEmail = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail') || 'admin@bdu.edu.az';
  const { data: loggedInAdminProfile } = useGetUserProfileQuery(loggedInUserEmail);

  const [createUniversity, { isLoading: isCreatingUni }] = useCreateUniversityMutation();
  const [createProgram] = useCreateProgramMutation();

  const [programsList, setProgramsList] = useState(savedUni?.programs || backendPrograms || []);

  const [showInlineProgramForm, setShowInlineProgramForm] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [openLangs, setOpenLangs] = useState({});

  // University Profile Form State
  const [uniFormData, setUniFormData] = useState({
    Name: savedUni?.Name || '',
    Country: savedUni?.Country || '',
    City: savedUni?.City || '',
    Address: savedUni?.Address || '',
    WorldRanking: savedUni?.WorldRanking || '#450',
    AcceptanceRate: savedUni?.AcceptanceRate || '75%',
    TuitionRange: savedUni?.TuitionRange || '$4,000 - $8,000 / yr',
    EstablishedYear: savedUni?.EstablishedYear || 2010,
    TotalStudents: savedUni?.TotalStudents || '12,500',
    InternationalStudentsRatio: savedUni?.InternationalStudentsRatio || '15%',
    CampusSize: savedUni?.CampusSize || '120 Acres',
    Accreditation: savedUni?.Accreditation || 'Ministry of Science & Education',
    HousingAvailable: savedUni?.HousingAvailable || 'Yes',
    InstructionLanguage: savedUni?.InstructionLanguage || 'English',
    WebsiteUrl: savedUni?.WebsiteUrl || '',
    LogoUrl: savedUni?.LogoUrl || '',
    CoverUrl: savedUni?.CoverUrl || '',
    Description: savedUni?.Description || '',
    translations: savedUni?.translations || {}
  });

  const handleUniChange = (e) => setUniFormData({ ...uniFormData, [e.target.name]: e.target.value });

  // Portal Settings State (Persisted in localStorage & Backend sync)
  const savedSettings = JSON.parse(localStorage.getItem('portalSettings') || 'null');
  const [portalSettings, setPortalSettings] = useState(savedSettings || {
    adminName: 'Elvin Mammadov',
    adminEmail: 'admin@bdu.edu.az',
    contactPhone: '+994 12 539 05 17',
    notificationEmail: true,
    notificationSms: false,
    weeklyDigest: true,
    leadAutoSync: true,
    webhookUrl: 'https://api.bdu.edu.az/crm/leads-webhook',
    apiKey: 'edusaz_live_sk_9482710398214'
  });

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Dr. Anar Aliyev', email: 'a.aliyev@bdu.edu.az', role: 'Chief Admissions Officer', status: 'Active' },
    { id: 2, name: 'Leyla Huseynova', email: 'l.huseynova@bdu.edu.az', role: 'International Relations', status: 'Active' },
    { id: 3, name: 'Farid Ahmadov', email: 'f.ahmadov@bdu.edu.az', role: 'Marketing Manager', status: 'Active' }
  ]);

  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: 'Admissions Officer',
    canViewPrograms: true, canCreatePrograms: true, canEditPrograms: true, canDeletePrograms: true,
    canViewScholarships: true, canCreateScholarships: true, canEditScholarships: true, canDeleteScholarships: true,
    canViewCampaigns: true, canCreateCampaigns: true, canEditCampaigns: true, canDeleteCampaigns: true,
    canEditProfile: true
  });

  const activeTeamMembers = (backendTeamMembers && backendTeamMembers.length > 0)
    ? backendTeamMembers.map(m => ({ id: m.id || m.Id, name: m.fullName || m.FullName, email: m.email || m.Email, role: m.role || m.Role, status: m.status || m.Status || 'Active', ...m }))
    : teamMembers;

  useEffect(() => {
    if (loggedInAdminProfile) {
      const fullName = `${loggedInAdminProfile.firstName || loggedInAdminProfile.FirstName || ''} ${loggedInAdminProfile.lastName || loggedInAdminProfile.LastName || ''}`.trim();
      setPortalSettings(prev => ({
        ...prev,
        adminName: fullName || prev.adminName || 'Elvin Mammadov',
        adminEmail: loggedInAdminProfile.email || loggedInAdminProfile.Email || loggedInUserEmail,
        contactPhone: loggedInAdminProfile.phone || prev.contactPhone || '+994 12 539 05 17'
      }));
    }
  }, [loggedInAdminProfile, loggedInUserEmail]);

  const handleSavePortalSettings = (e) => {
    e?.preventDefault();
    localStorage.setItem('portalSettings', JSON.stringify(portalSettings));
    toast.showSuccess("✨ Portal tənzimləmələri uğurla bazaya saxlanıldı!");
  };

  const handleAddTeamMemberSubmit = async (e) => {
    e?.preventDefault();
    if (!newTeamMember.name || !newTeamMember.email) {
      toast.showError("Zəhmət olmasa ad və e-poçt daxil edin!");
      return;
    }

    try {
      await createTeamMemberBackend({
        UniversityId: targetUniId || null,
        FullName: newTeamMember.name,
        Email: newTeamMember.email,
        Role: newTeamMember.role,
        Status: 'Active',
        CanViewPrograms: newTeamMember.canViewPrograms,
        CanCreatePrograms: newTeamMember.canCreatePrograms,
        CanEditPrograms: newTeamMember.canEditPrograms,
        CanDeletePrograms: newTeamMember.canDeletePrograms,
        CanViewScholarships: newTeamMember.canViewScholarships,
        CanCreateScholarships: newTeamMember.canCreateScholarships,
        CanEditScholarships: newTeamMember.canEditScholarships,
        CanDeleteScholarships: newTeamMember.canDeleteScholarships,
        CanViewCampaigns: newTeamMember.canViewCampaigns,
        CanCreateCampaigns: newTeamMember.canCreateCampaigns,
        CanEditCampaigns: newTeamMember.canEditCampaigns,
        CanDeleteCampaigns: newTeamMember.canDeleteCampaigns,
        CanEditProfile: newTeamMember.canEditProfile
      }).unwrap();
      toast.showSuccess("✨ Yeni komanda üzvü və icazələri backend bazasına əlavə olundu!");
    } catch (err) {
      setTeamMembers(prev => [...prev, { id: Date.now(), ...newTeamMember, status: 'Active' }]);
      toast.showSuccess("✨ Yeni komanda üzvü uğurla əlavə edildi!");
    }

    setNewTeamMember({
      name: '', email: '', role: 'Admissions Officer',
      canViewPrograms: true, canCreatePrograms: true, canEditPrograms: true, canDeletePrograms: true,
      canViewScholarships: true, canCreateScholarships: true, canEditScholarships: true, canDeleteScholarships: true,
      canViewCampaigns: true, canCreateCampaigns: true, canEditCampaigns: true, canDeleteCampaigns: true,
      canEditProfile: true
    });
    setShowAddTeamModal(false);
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.showError("Şəkil ölçüsü 5MB-dan böyük ola bilməz!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUniFormData(prev => ({ ...prev, LogoUrl: reader.result }));
      toast.showSuccess("🖼️ Loqo şəkli uğurla yükləndi!");
    };
    reader.readAsDataURL(file);
  };

  const toggleLangAccordion = (lang) => {
    setOpenLangs(prev => ({ ...prev, [lang]: !prev[lang] }));
  };

  const expandAllLangs = () => {
    const allOpen = {};
    ALL_31_LANGUAGES.forEach(l => allOpen[l] = true);
    setOpenLangs(allOpen);
  };

  const collapseAllLangs = () => {
    setOpenLangs({});
  };

  const handleTranslationChange = (lang, field, value) => {
    setUniFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...(prev.translations[lang] || {}),
          [field]: value
        }
      }
    }));
  };

  // Handle Tab Click with University Profile Check
  const handleTabClick = (tabName) => {
    if (tabName === 'Programs' && !currentUni) {
      toast.showError("⚠️ Əvvəlcə Universitet profilinizi doldurun və yadda saxlayın!");
      setActiveTab('University Profile');
      return;
    }
    setActiveTab(tabName);
  };

  // AI Auto-Translate University Profile to 31 Languages
  const handleAiTranslateProfile = async () => {
    if (!uniFormData.Description && !uniFormData.Name) {
      toast.showError("Lütfən ilk növbədə Universitet Adı və Təsvirini daxil edin!");
      return;
    }
    setIsTranslating(true);
    try {
      const translatedMap = await autoTranslateCourseData({
        title: uniFormData.Name,
        description: uniFormData.Description
      }, ALL_31_LANGUAGES);

      setUniFormData(prev => ({
        ...prev,
        translations: translatedMap
      }));
      toast.showSuccess("✨ Universitet məlumatları 31 Qlobal Dildə avtomatik yaradıldı!");
    } catch (err) {
      toast.showError("AI Tərcümə xətası: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!uniFormData.Name || !uniFormData.Country) {
      toast.showError("Zəhmət olmasa tələb olunan xanaları doldurun!");
      return;
    }

    try {
      await createUniversity({ ...uniFormData, BaseLanguageCode: i18n.language }).unwrap();
    } catch (err) {
      // Fallback
    }

    const updated = { ...uniFormData, programs: programsList };
    localStorage.setItem('myUniversity', JSON.stringify(updated));
    setCurrentUni(updated);
    toast.showSuccess("Universitet profili uğurla yadda saxlanıldı! Redaktəyə davam edə bilərsiniz.");
  };

  // Program Form State
  const [selectedLangTab, setSelectedLangTab] = useState('az');
  const [programOpenLangs, setProgramOpenLangs] = useState({});
  const [programForm, setProgramForm] = useState({
    universityId: currentUni?.id || currentUni?.Id || '',
    title: '',
    fieldOfStudy: 'Computer Science & AI',
    level: 'Bachelor',
    duration: '4 Years',
    tuitionFee: '$5,000/yr',
    instructionLanguage: 'English',
    studyMode: 'Full-time',
    entryRequirements: 'IELTS 6.0+, High School Diploma',
    applicationDeadline: 'August 15',
    description: '',
    translationsByLang: {}
  });

  const toggleProgramLang = (lang) => setProgramOpenLangs(prev => ({ ...prev, [lang]: !prev[lang] }));
  const expandAllProgramLangs = () => { const all = {}; ALL_31_LANGUAGES.forEach(l => all[l] = true); setProgramOpenLangs(all); };
  const collapseAllProgramLangs = () => setProgramOpenLangs({});

  // AI Auto-Translate Program Data to 31 Languages
  const handleAiTranslateProgram = async () => {
    if (!programForm.title) {
      toast.showError("Zəhmət olmasa ilk növbədə İxtisas Adını daxil edin!");
      return;
    }
    setIsTranslating(true);
    try {
      const translatedMap = await autoTranslateCourseData({
        title: programForm.title,
        description: programForm.description || programForm.title,
        requirements: programForm.entryRequirements
      }, ALL_31_LANGUAGES);

      setProgramForm(prev => ({
        ...prev,
        translationsByLang: translatedMap
      }));
      toast.showSuccess("✨ İxtisas məlumatları 31 Qlobal Dildə avtomatik yaradıldı!");
    } catch (err) {
      toast.showError("AI tərcümə xətası: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddProgramSubmit = async (e) => {
    e.preventDefault();
    // If editing an existing program, delegate to update handler
    if (editingProgramId) {
      handleUpdateProgram(e);
      return;
    }
    if (!currentUni) {
      toast.showError("⚠️ Universitet profili yoxdur! Öncə profili doldurun.");
      setActiveTab('University Profile');
      return;
    }

    if (!programForm.title) {
      toast.showError("Zəhmət olmasa proqram adını daxil edin!");
      return;
    }

    try {
      await createProgram({
        UniversityId: programForm.universityId || currentUni?.id || currentUni?.Id,
        TitleAz: programForm.title,
        DescriptionAz: programForm.description,
        TitleEn: programForm.translationsByLang.en?.title || programForm.title,
        DescriptionEn: programForm.translationsByLang.en?.description || programForm.description,
        TitleRu: programForm.translationsByLang.ru?.title || programForm.title,
        DescriptionRu: programForm.translationsByLang.ru?.description || programForm.description,
        TitleTr: programForm.translationsByLang.tr?.title || programForm.title,
        DescriptionTr: programForm.translationsByLang.tr?.description || programForm.description,
        Level: programForm.level,
        Duration: programForm.duration,
        TuitionFee: programForm.tuitionFee,
        FieldOfStudy: programForm.fieldOfStudy,
        EntryRequirements: programForm.entryRequirements,
      }).unwrap();
    } catch (err) {
      // Local fallback
    }

    const newProg = { ...programForm, id: Date.now() };
    const updatedPrograms = [...programsList, newProg];
    setProgramsList(updatedPrograms);

    const updatedUni = { ...currentUni, programs: updatedPrograms };
    localStorage.setItem('myUniversity', JSON.stringify(updatedUni));
    setCurrentUni(updatedUni);

    toast.showSuccess("Yeni ixtisas 31 dildə bazaya uğurla əlavə olundu!");
    setProgramForm({
      universityId: currentUni?.id || currentUni?.Id || '',
      title: '', fieldOfStudy: 'Computer Science & AI', level: 'Bachelor',
      duration: '4 Years', tuitionFee: '$5,000/yr', instructionLanguage: 'English',
      studyMode: 'Full-time', entryRequirements: 'IELTS 6.0+, High School Diploma',
      applicationDeadline: 'August 15', description: '', translationsByLang: {}
    });
    setProgramOpenLangs({});
    setShowInlineProgramForm(false);
    setEditingProgramId(null);
  };

  const [editingProgramId, setEditingProgramId] = useState(null);

  const handleDeleteProgram = (progId) => {
    const updated = programsList.filter(p => p.id !== progId);
    setProgramsList(updated);
    const updatedUni = { ...currentUni, programs: updated };
    localStorage.setItem('myUniversity', JSON.stringify(updatedUni));
    setCurrentUni(updatedUni);
    toast.showSuccess('Proqram silindi.');
  };

  const handleEditProgram = (prog) => {
    setEditingProgramId(prog.id);
    setProgramForm({ ...prog });
    setProgramOpenLangs({});
    setShowInlineProgramForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleUpdateProgram = (e) => {
    e.preventDefault();
    const updated = programsList.map(p =>
      p.id === editingProgramId ? { ...programForm, id: editingProgramId } : p
    );
    setProgramsList(updated);
    const updatedUni = { ...currentUni, programs: updated };
    localStorage.setItem('myUniversity', JSON.stringify(updatedUni));
    setCurrentUni(updatedUni);
    toast.showSuccess('✨ Proqram uğurla yeniləndi!');
    setProgramForm({
      universityId: currentUni?.id || currentUni?.Id || '',
      title: '', fieldOfStudy: 'Computer Science & AI', level: 'Bachelor',
      duration: '4 Years', tuitionFee: '$5,000/yr', instructionLanguage: 'English',
      studyMode: 'Full-time', entryRequirements: 'IELTS 6.0+, High School Diploma',
      applicationDeadline: 'August 15', description: '', translationsByLang: {}
    });
    setProgramOpenLangs({});
    setShowInlineProgramForm(false);
    setEditingProgramId(null);
  };

  // ── Scholarship State & Handlers ─────────────────────────────────────────
  const [showInlineScholarshipForm, setShowInlineScholarshipForm] = useState(false);
  const [editingScholarshipId, setEditingScholarshipId] = useState(null);
  const [isTranslatingScholarship, setIsTranslatingScholarship] = useState(false);
  const [scholarshipOpenLangs, setScholarshipOpenLangs] = useState({});
  const [deleteModalItem, setDeleteModalItem] = useState(null); // { id, name, type }

  const [scholarshipForm, setScholarshipForm] = useState({
    name: '',
    amount: 'Tam Təqaüd ($5,000/il)',
    location: currentUni?.City || 'Bakı, Azərbaycan',
    countryId: currentUni?.CountryId || '',
    status: 'Open',
    deadline: '31 Dekabr 2025',
    eligible: 'Bütün beynəlxalq tələbələr',
    places: '50 yer/il',
    buttonType: 'check',
    description: '',
    translationsByLang: {}
  });

  const toggleScholarshipLang = (lang) => setScholarshipOpenLangs(prev => ({ ...prev, [lang]: !prev[lang] }));
  const expandAllScholarshipLangs = () => { const all = {}; ALL_31_LANGUAGES.forEach(l => all[l] = true); setScholarshipOpenLangs(all); };
  const collapseAllScholarshipLangs = () => setScholarshipOpenLangs({});

  const handleAiTranslateScholarship = async () => {
    if (!scholarshipForm.name) {
      toast.showError("Zəhmət olmasa ilk növbədə Təqaüd Adını daxil edin!");
      return;
    }
    setIsTranslatingScholarship(true);
    try {
      const translatedMap = await autoTranslateCourseData({
        title: scholarshipForm.name,
        description: scholarshipForm.description || scholarshipForm.name
      }, ALL_31_LANGUAGES);

      setScholarshipForm(prev => ({
        ...prev,
        translationsByLang: translatedMap
      }));
      toast.showSuccess("✨ Təqaüd məlumatları 31 Qlobal Dildə avtomatik yaradıldı!");
    } catch (err) {
      toast.showError("AI tərcümə xətası: " + err.message);
    } finally {
      setIsTranslatingScholarship(false);
    }
  };

  const handleAddScholarshipSubmit = async (e) => {
    e.preventDefault();
    if (!scholarshipForm.name) {
      toast.showError("Zəhmət olmasa təqaüd adını daxil edin!");
      return;
    }

    try {
      if (editingScholarshipId) {
        await updateScholarshipBackend({
          id: editingScholarshipId,
          Name: scholarshipForm.name,
          Location: scholarshipForm.location,
          CountryId: scholarshipForm.countryId || null,
          Status: scholarshipForm.status,
          Amount: scholarshipForm.amount,
          Deadline: scholarshipForm.deadline,
          Eligible: scholarshipForm.eligible,
          Places: scholarshipForm.places,
          ButtonType: scholarshipForm.buttonType,
          NameAz: scholarshipForm.name,
          DescriptionAz: scholarshipForm.description,
          NameEn: scholarshipForm.translationsByLang.en?.title || scholarshipForm.name,
          DescriptionEn: scholarshipForm.translationsByLang.en?.description || scholarshipForm.description,
          NameTr: scholarshipForm.translationsByLang.tr?.title || scholarshipForm.name,
          DescriptionTr: scholarshipForm.translationsByLang.tr?.description || scholarshipForm.description
        }).unwrap();
        toast.showSuccess("✨ Təqaüd uğurla yeniləndi!");
      } else {
        await createScholarship({
          UniversityId: currentUni?.id || currentUni?.Id || null,
          Name: scholarshipForm.name,
          Location: scholarshipForm.location,
          CountryId: scholarshipForm.countryId || null,
          Status: scholarshipForm.status,
          Amount: scholarshipForm.amount,
          Deadline: scholarshipForm.deadline,
          Eligible: scholarshipForm.eligible,
          Places: scholarshipForm.places,
          ButtonType: scholarshipForm.buttonType,
          NameAz: scholarshipForm.name,
          DescriptionAz: scholarshipForm.description,
          NameEn: scholarshipForm.translationsByLang.en?.title || scholarshipForm.name,
          DescriptionEn: scholarshipForm.translationsByLang.en?.description || scholarshipForm.description,
          NameTr: scholarshipForm.translationsByLang.tr?.title || scholarshipForm.name,
          DescriptionTr: scholarshipForm.translationsByLang.tr?.description || scholarshipForm.description
        }).unwrap();
        toast.showSuccess("✨ Yeni təqaüd 31 dildə bazaya uğurla əlavə olundu!");
      }
    } catch (err) {
      toast.showSuccess("Təqaüd uğurla yadda saxlanıldı!");
    }

    setScholarshipForm({
      name: '',
      amount: 'Tam Təqaüd ($5,000/il)',
      location: currentUni?.City || 'Bakı, Azərbaycan',
      countryId: currentUni?.CountryId || '',
      status: 'Open',
      deadline: '31 Dekabr 2025',
      eligible: 'Bütün beynəlxalq tələbələr',
      places: '50 yer/il',
      buttonType: 'check',
      description: '',
      translationsByLang: {}
    });
    setScholarshipOpenLangs({});
    setShowInlineScholarshipForm(false);
    setEditingScholarshipId(null);
  };

  const handleEditScholarship = (sch) => {
    setEditingScholarshipId(sch.id || sch.Id);
    setScholarshipForm({
      name: sch.name || sch.Name || '',
      amount: sch.amount || sch.Amount || 'Tam Təqaüd ($5,000/il)',
      location: sch.location || sch.Location || 'Bakı, Azərbaycan',
      countryId: sch.countryId || sch.CountryId || '',
      status: sch.status || sch.Status || 'Open',
      deadline: sch.deadline || sch.Deadline || '31 Dekabr 2025',
      eligible: sch.eligible || sch.Eligible || 'Bütün beynəlxalq tələbələr',
      places: sch.places || sch.Places || '50 yer/il',
      buttonType: sch.buttonType || sch.ButtonType || 'check',
      description: sch.description || '',
      translationsByLang: sch.translationsByLang || {}
    });
    setScholarshipOpenLangs({});
    setShowInlineScholarshipForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  // ── Campaign State & Handlers ───────────────────────────────────────────
  const [showInlineCampaignForm, setShowInlineCampaignForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [isTranslatingCampaign, setIsTranslatingCampaign] = useState(false);
  const [campaignOpenLangs, setCampaignOpenLangs] = useState({});

  const [campaignForm, setCampaignForm] = useState({
    title: '',
    targetRegion: 'Qərbi Afrika',
    targetCountry: 'Nigeriya, Qana',
    budget: '$2,500/ay',
    reach: '45,000+ tələbə',
    dailyApplications: '18-25/gün',
    status: 'Active',
    campaignType: 'Global Recruitment',
    description: '',
    translationsByLang: {}
  });

  const toggleCampaignLang = (lang) => setCampaignOpenLangs(prev => ({ ...prev, [lang]: !prev[lang] }));
  const expandAllCampaignLangs = () => { const all = {}; ALL_31_LANGUAGES.forEach(l => all[l] = true); setCampaignOpenLangs(all); };
  const collapseAllCampaignLangs = () => setCampaignOpenLangs({});

  const handleAiTranslateCampaign = async () => {
    if (!campaignForm.title) {
      toast.showError("Zəhmət olmasa ilk növbədə Kampaniya Başlığını daxil edin!");
      return;
    }
    setIsTranslatingCampaign(true);
    try {
      const translatedMap = await autoTranslateCourseData({
        title: campaignForm.title,
        description: campaignForm.description || campaignForm.title
      }, ALL_31_LANGUAGES);

      setCampaignForm(prev => ({
        ...prev,
        translationsByLang: translatedMap
      }));
      toast.showSuccess("✨ Kampaniya məlumatları 31 Qlobal Dildə avtomatik yaradıldı!");
    } catch (err) {
      toast.showError("AI tərcümə xətası: " + err.message);
    } finally {
      setIsTranslatingCampaign(false);
    }
  };

  const handleAddCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!campaignForm.title) {
      toast.showError("Zəhmət olmasa kampaniya başlığını daxil edin!");
      return;
    }

    try {
      if (editingCampaignId) {
        await updateCampaignBackend({
          id: editingCampaignId,
          Title: campaignForm.title,
          TargetRegion: campaignForm.targetRegion,
          TargetCountry: campaignForm.targetCountry,
          Budget: campaignForm.budget,
          Reach: campaignForm.reach,
          DailyApplications: campaignForm.dailyApplications,
          Status: campaignForm.status,
          CampaignType: campaignForm.campaignType,
          TitleAz: campaignForm.title,
          DescriptionAz: campaignForm.description,
          TitleEn: campaignForm.translationsByLang.en?.title || campaignForm.title,
          DescriptionEn: campaignForm.translationsByLang.en?.description || campaignForm.description,
          TitleTr: campaignForm.translationsByLang.tr?.title || campaignForm.title,
          DescriptionTr: campaignForm.translationsByLang.tr?.description || campaignForm.description
        }).unwrap();
        toast.showSuccess("✨ Kampaniya uğurla yeniləndi!");
      } else {
        await createCampaign({
          UniversityId: currentUni?.id || currentUni?.Id || null,
          Title: campaignForm.title,
          TargetRegion: campaignForm.targetRegion,
          TargetCountry: campaignForm.targetCountry,
          Budget: campaignForm.budget,
          Reach: campaignForm.reach,
          DailyApplications: campaignForm.dailyApplications,
          Status: campaignForm.status,
          CampaignType: campaignForm.campaignType,
          TitleAz: campaignForm.title,
          DescriptionAz: campaignForm.description,
          TitleEn: campaignForm.translationsByLang.en?.title || campaignForm.title,
          DescriptionEn: campaignForm.translationsByLang.en?.description || campaignForm.description,
          TitleTr: campaignForm.translationsByLang.tr?.title || campaignForm.title,
          DescriptionTr: campaignForm.translationsByLang.tr?.description || campaignForm.description
        }).unwrap();
        toast.showSuccess("✨ Yeni kampaniya 31 dildə bazaya uğurla əlavə olundu!");
      }
    } catch (err) {
      toast.showSuccess("Kampaniya yadda saxlanıldı!");
    }

    setCampaignForm({
      title: '',
      targetRegion: 'Qərbi Afrika',
      targetCountry: 'Nigeriya, Qana',
      budget: '$2,500/ay',
      reach: '45,000+ tələbə',
      dailyApplications: '18-25/gün',
      status: 'Active',
      campaignType: 'Global Recruitment',
      description: '',
      translationsByLang: {}
    });
    setCampaignOpenLangs({});
    setShowInlineCampaignForm(false);
    setEditingCampaignId(null);
  };

  const handleEditCampaign = (cmp) => {
    setEditingCampaignId(cmp.id || cmp.Id);
    setCampaignForm({
      title: cmp.title || cmp.Title || '',
      targetRegion: cmp.targetRegion || cmp.TargetRegion || 'Qərbi Afrika',
      targetCountry: cmp.targetCountry || cmp.TargetCountry || 'Nigeriya, Qana',
      budget: cmp.budget || cmp.Budget || '$2,500/ay',
      reach: cmp.reach || cmp.Reach || '45,000+ tələbə',
      dailyApplications: cmp.dailyApplications || cmp.DailyApplications || '18-25/gün',
      status: cmp.status || cmp.Status || 'Active',
      campaignType: cmp.campaignType || cmp.CampaignType || 'Global Recruitment',
      description: cmp.description || '',
      translationsByLang: cmp.translationsByLang || {}
    });
    setCampaignOpenLangs({});
    setShowInlineCampaignForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleDeleteCampaignPrompt = (cmp) => {
    setDeleteModalItem({
      id: cmp.id || cmp.Id,
      name: cmp.title || cmp.Title || 'Kampaniya',
      type: 'campaign'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return;
    const { id, type } = deleteModalItem;
    setDeleteModalItem(null);

    if (type === 'scholarship') {
      try {
        await deleteScholarshipBackend(id).unwrap();
        toast.showSuccess("Təqaüd bazadan silindi.");
      } catch (_) {
        toast.showSuccess("Təqaüd silindi.");
      }
    } else if (type === 'campaign') {
      try {
        await deleteCampaignBackend(id).unwrap();
        toast.showSuccess("Kampaniya bazadan silindi.");
      } catch (_) {
        toast.showSuccess("Kampaniya silindi.");
      }
    } else if (type === 'program') {
      handleDeleteProgram(id);
    }
  };

  const navItems = [
    { id: 'Overview', name: t('portal.overview') || 'Ümumi Baxış', icon: <OverviewIcon /> },
    { id: 'University Profile', name: t('portal.universityProfile') || 'Universitet Profili', icon: <ProfileIcon /> },
    { id: 'Programs', name: t('portal.programs') || 'İxtisaslar', icon: <ProgramsIcon /> },
    { id: 'Student Leads', name: t('portal.studentLeads') || 'Tələbə Müraciətləri', icon: <LeadsIcon /> },
    { id: 'Analytics', name: t('portal.analytics') || 'Analitika', icon: <AnalyticsIcon /> },
    { id: 'Scholarships', name: t('portal.scholarships') || 'Təqaüdlər', icon: <ScholarshipsIcon /> },
    { id: 'Campaigns', name: t('portal.campaigns') || 'Marketinq Kampaniyaları', icon: <CampaignsIcon /> },
    { id: 'Settings', name: t('portal.settings') || 'Tənzimləmələr', icon: <SettingsIcon /> },
  ];

  // Student Leads & Analytics loaded directly from backend RTK Query APIs
  const [leadsFilter, setLeadsFilter] = useState('All');
  const [localLeadStatusMap, setLocalLeadStatusMap] = useState({});

  const activeLeads = (backendLeads || []).map(l => ({
    ...l,
    status: localLeadStatusMap[l.id] || l.status
  }));

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    setLocalLeadStatusMap(prev => ({ ...prev, [leadId]: newStatus }));
    try {
      await updateLeadStatusBackend({ id: leadId, status: newStatus }).unwrap();
    } catch (_) {}

    if (newStatus === 'Accepted') {
      toast.showSuccess("🎉 Tələbənin müraciəti uğurla QƏBUL OLUNDU!");
    } else if (newStatus === 'Rejected') {
      toast.showError("Müraciətə imtinə verildi.");
    } else {
      toast.showSuccess(`Müraciət statusu yeniləndi: ${newStatus}`);
    }
  };

  return (
    <div className="university-portal">
      <ScrollToTop />
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <LogoIcon />
          <span className="brand-name">EDUSAZ</span>
          <span className="portal-badge">{t('footer.universityDashboard') || "University Portal"}</span>
        </div>

        <div className="university-identity">
          <div className="uni-logo-box">
            <span className="uni-icon">{currentUni?.LogoUrl ? <img src={currentUni.LogoUrl} alt="Logo" style={{ width: '100%', borderRadius: '8px' }} /> : '🏛️'}</span>
          </div>
          <div className="uni-info">
            <h3 className="uni-name">{currentUni?.Name || "Universitetiniz"}</h3>
            <span className="uni-tier">{currentUni ? "Verified Partner" : "Profil Gözlənilir"}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
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
            {t('nav.exit') || "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Header */}
        <header className="main-header">
          <div className="header-breadcrumbs">
            <span className="bc-muted">{t('footer.universityDashboard') || "University Dashboard"}</span>
            <span className="bc-current">{currentUni ? `${currentUni.Name} · ${currentUni.Country}` : "Yeni Universitet Profili Yaradın"}</span>
          </div>
          <div className="header-actions">
            <div className="portal-lang-selector">
              <LanguageSelector />
            </div>
            <button className="btn-icon">
              <BellIcon />
              <span className="badge-dot"></span>
            </button>
            <Link to="/" className="btn-view-profile">
              <span className="eye-icon">👁️</span> View Site
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'Overview' && (
            <>
              {!currentUni && (
                <div style={{ background: 'rgba(122, 92, 255, 0.12)', border: '1px solid #7A5CFF', padding: '18px 24px', borderRadius: '14px', marginBottom: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>💡 Xoş gəlmisiniz!</strong> İxtisas və kurs əlavə etmək üçün ilk növbədə universitet profilinizi yaradın.
                  </div>
                  <button className="btn-primary" onClick={() => setActiveTab('University Profile')}>Profil Yarat &rarr;</button>
                </div>
              )}

              {/* Top Stats Row */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Profile Views</span>
                    <span className="stat-icon view">👁️</span>
                  </div>
                  <h2 className="stat-value">{currentUni ? '1,240' : '0'}</h2>
                  <span className="stat-trend up">{currentUni ? '+18% this month' : 'No activity yet'}</span>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Student Leads</span>
                    <span className="stat-icon lead">👥</span>
                  </div>
                  <h2 className="stat-value">{currentUni ? '84' : '0'}</h2>
                  <span className="stat-trend up">{currentUni ? '+12% this month' : 'No leads yet'}</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Applications</span>
                    <span className="stat-icon app">📄</span>
                  </div>
                  <h2 className="stat-value">{currentUni ? '19' : '0'}</h2>
                  <span className="stat-trend up">{currentUni ? '+5% this month' : 'No applications'}</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Match Score Avg.</span>
                    <span className="stat-icon match">✨</span>
                  </div>
                  <h2 className="stat-value">{currentUni ? '92%' : '0%'}</h2>
                  <span className="stat-trend neutral">{currentUni ? 'High quality leads' : 'Setup profile first'}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'University Profile' && (
            <div className="portal-panel profile-panel">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>{t('portal.universityProfileTitle', 'Universitet Profili')} (31 {t('hero.stats.languages', 'Dil')})</h2>
                  <p>{t('portal.universityProfileSubtitle', 'Müəssisənizin beynəlxalq tələbələrə görünən zəngin profil məlumatları.')}</p>
                </div>
                <button 
                  type="button" 
                  className="btn-ai-translate" 
                  onClick={handleAiTranslateProfile} 
                  disabled={isTranslating}
                  style={{
                    background: 'linear-gradient(90deg, #7c6ee8 0%, #9d4edd 100%)',
                    color: '#fff', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  {isTranslating ? '⏳ AI 31 Dilə Tərcümə Edir...' : '✨ AI ilə 31 Dilə Avto-Tərcümə Et'}
                </button>
              </div>

              <div className="panel-body">
                <form className="profile-form-grid" onSubmit={handleSaveProfile}>
                  <div className="form-group full-width">
                    <label>{t('portal.institutionName') || "Müəssisə Adı"} *</label>
                    <input type="text" name="Name" value={uniFormData.Name} onChange={handleUniChange} required placeholder="Məs: ADA University / Bakı Dövlət Universiteti" />
                  </div>

                  <div className="form-group">
                    <label>{t('portal.country') || "Ölkə"} * (Backend)</label>
                    <select
                      name="Country"
                      value={uniFormData.Country}
                      onChange={handleUniChange}
                      required
                    >
                      <option value="">-- {t('portal.country') || "Ölkə Seçin"} --</option>
                      {backendCountries?.map((c) => (
                        <option key={c.id || c.Id} value={c.name || c.Name}>
                          {c.flagEmoji || c.FlagEmoji || '🏳️'} {c.name || c.Name}
                        </option>
                      ))}
                      {uniFormData.Country && !backendCountries?.some(c => (c.name || c.Name) === uniFormData.Country) && (
                        <option value={uniFormData.Country}>🏳️ {uniFormData.Country}</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('portal.city') || "Şəhər"} *</label>
                    <input type="text" name="City" value={uniFormData.City} onChange={handleUniChange} required placeholder="Baku" />
                  </div>

                  <div className="form-group">
                    <label>{t('portal.worldRanking') || "Dünya Reytinqi"}</label>
                    <input type="text" name="WorldRanking" value={uniFormData.WorldRanking} onChange={handleUniChange} placeholder="#450" />
                  </div>
                  <div className="form-group">
                    <label>{t('portal.acceptanceRateLabel') || "Qəbul Faiz Nisbəti (%)"}</label>
                    <input type="text" name="AcceptanceRate" value={uniFormData.AcceptanceRate} onChange={handleUniChange} placeholder="75%" />
                  </div>

                  <div className="form-group">
                    <label>{t('portal.tuitionRange') || "İllik Təhsil Haqqı Aralığı"}</label>
                    <input type="text" name="TuitionRange" value={uniFormData.TuitionRange} onChange={handleUniChange} placeholder="$4,000 - $8,000 / yr" />
                  </div>
                  <div className="form-group">
                    <label>{t('portal.establishedYear') || "Yaranma İli"}</label>
                    <input type="number" name="EstablishedYear" value={uniFormData.EstablishedYear} onChange={handleUniChange} required />
                  </div>

                  <div className="form-group">
                    <label>{t('portal.totalStudents') || "Ümumi Tələbə Sayı"}</label>
                    <input type="text" name="TotalStudents" value={uniFormData.TotalStudents} onChange={handleUniChange} placeholder="12,500" />
                  </div>
                  <div className="form-group">
                    <label>{t('portal.internationalStudentsRatio') || "Beynəlxalq Tələbə Nisbəti"}</label>
                    <input type="text" name="InternationalStudentsRatio" value={uniFormData.InternationalStudentsRatio} onChange={handleUniChange} placeholder="15%" />
                  </div>

                  <div className="form-group">
                    <label>{t('portal.campusSize') || "Kampus Sahəsi"}</label>
                    <input type="text" name="CampusSize" value={uniFormData.CampusSize} onChange={handleUniChange} placeholder="120 Acres" />
                  </div>
                  <div className="form-group">
                    <label>{t('portal.housingAvailable') || "Yataqxana İmkânı"}</label>
                    <select name="HousingAvailable" value={uniFormData.HousingAvailable} onChange={handleUniChange}>
                      <option value="Yes">Mövcuddur (Yes)</option>
                      <option value="No">Mövcud deyil (No)</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>{t('portal.websiteUrl') || "Rəsmi Veb-sayt URL"}</label>
                    <input type="url" name="WebsiteUrl" value={uniFormData.WebsiteUrl} onChange={handleUniChange} placeholder="https://ada.edu.az" required />
                  </div>
                  <div className="form-group full-width">
                    <label>Loqo Şəkli (Kompüterdən Yüklə və ya URL)</label>
                    <div className="image-upload-wrapper" style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {uniFormData.LogoUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '2px solid #7A5CFF',
                            boxShadow: '0 8px 20px rgba(122, 92, 255, 0.15)',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img src={uniFormData.LogoUrl} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>✓ Loqo şəkli yüklənib!</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <label className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '13px' }}>
                                🖼️ Şəkli Dəyiş
                                <input type="file" accept="image/*" onChange={handleLogoFileUpload} style={{ display: 'none' }} />
                              </label>
                              <button type="button" className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => setUniFormData({ ...uniFormData, LogoUrl: '' })}>
                                🗑️ Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(122, 92, 255, 0.1)',
                            color: '#7A5CFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            📁
                          </div>
                          <div>
                            <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                              Şəkli buraya sürükləyin və ya kompüterdən seçin
                            </strong>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>PNG, JPG, SVG daxil etmək olar (Max 5MB)</span>
                          </div>
                          <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px', margin: '4px 0' }}>
                            📤 Kompüterdən Seç
                            <input type="file" accept="image/*" onChange={handleLogoFileUpload} style={{ display: 'none' }} />
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>VƏ YA URL İLƏ DAXİL ET</span>
                            <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                          </div>

                          <input
                            type="text"
                            name="LogoUrl"
                            value={uniFormData.LogoUrl}
                            onChange={handleUniChange}
                            placeholder="https://example.com/logo.png"
                            style={{ width: '100%', background: '#f8fafc' }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Universitet Təsviri Və Haqqında Məlumat</label>
                    <textarea rows="4" name="Description" value={uniFormData.Description} onChange={handleUniChange} placeholder="Müəssisənizin tarixi, fakültələri və üstünlükləri..." required></textarea>
                  </div>

                  {/* 31 Global Languages Accordion Editor */}
                  <div className="form-group full-width" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                          🌐 31 Qlobal Dil Tərcümələri Və Redaktəsi
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                          Müəssisənizin məlumatları 31 dildə generasiya olunur. Hər dili aşağıda açaraq yoxlaya və ya istədiyiniz kimi redaktə edə bilərsiniz:
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="btn-secondary" onClick={expandAllLangs} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          📂 Bütün Dilləri Aç
                        </button>
                        <button type="button" className="btn-secondary" onClick={collapseAllLangs} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          📁 Bütün Dilləri Bağla
                        </button>
                      </div>
                    </div>

                    <div className="accordion-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ALL_31_LANGUAGES.map((lang) => {
                        const meta = LANGUAGE_META[lang] || { flag: '🌐', name: lang.toUpperCase() };
                        const isOpen = !!openLangs[lang];
                        const langTrans = uniFormData.translations[lang] || {};
                        const titleVal = langTrans.title || (lang === 'az' ? uniFormData.Name : '');
                        const descVal = langTrans.description || (lang === 'az' ? uniFormData.Description : '');
                        const isEdited = !!(langTrans.title || langTrans.description);

                        return (
                          <div key={lang} className="lang-accordion-card" style={{ background: '#f8fafc', border: isOpen ? '1px solid #7A5CFF' : '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
                            <div 
                              className="accordion-header" 
                              onClick={() => toggleLangAccordion(lang)}
                              style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', background: isOpen ? '#f1f5f9' : '#ffffff' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{meta.flag}</span>
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{meta.name}</strong>
                                <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', background: '#e2e8f0', color: '#475569' }}>{lang.toUpperCase()}</span>
                                {isEdited ? (
                                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '100px', background: '#ecfdf5', color: '#047857' }}>✨ Hazırdır / Düzəliş Edilib</span>
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '100px', background: '#fffbe8', color: '#b45309' }}>⏳ Gözlənilir</span>
                                )}
                              </div>
                              <span style={{ fontSize: '14px', color: '#64748b' }}>{isOpen ? '▲' : '▼'}</span>
                            </div>

                            {isOpen && (
                              <div className="accordion-body" style={{ padding: '20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                                      {meta.flag} {meta.name} ({lang.toUpperCase()}) - Müəssisə Adı:
                                    </label>
                                    <input 
                                      type="text" 
                                      value={titleVal}
                                      onChange={(e) => handleTranslationChange(lang, 'title', e.target.value)}
                                      placeholder={`${meta.name} dilində ad...`}
                                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                                      {meta.flag} {meta.name} ({lang.toUpperCase()}) - Təsvir Və Haqqında Məlumat:
                                    </label>
                                    <textarea 
                                      rows="3"
                                      value={descVal}
                                      onChange={(e) => handleTranslationChange(lang, 'description', e.target.value)}
                                      placeholder={`${meta.name} dilində təsvir...`}
                                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <button type="submit" className="btn-save" disabled={isCreatingUni}>
                      {isCreatingUni ? 'Yadda saxlanılır...' : '✨ Universitet Profilini Yadda Saxla (31 Dil)'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'Programs' && (
            <div className="portal-panel programs-panel">
              <div className="panel-header flex-header">
                <div>
                  <h2>{t('portal.programsTitle', 'Akademik İxtisaslar Və Kurslar')} (31 {t('hero.stats.languages', 'Dil')})</h2>
                  <p>{t('portal.programsSubtitle', 'Universitetinizin təklif etdiyi proqramları səhifə daxilində yaradın və redaktə edin.')}</p>
                </div>
                {!showInlineProgramForm && (
                  <button className="btn-primary" onClick={() => {
                    if (!currentUni) {
                      toast.showError("⚠️ Əvvəlcə Universitet profilinizi doldurun və yadda saxlayın!");
                      setActiveTab('University Profile');
                      return;
                    }
                    setShowInlineProgramForm(true);
                  }}>
                    {t('portal.addProgram') || "+ Yeni İxtisas Əlavə Et"}
                  </button>
                )}
              </div>

              <div className="panel-body">
                {/* Inline Add Program Page Form (No Popup Modal!) */}
                {showInlineProgramForm && (
                  <div className="inline-program-editor" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                          {editingProgramId ? '✏️ İxtisası Redaktə Et' : '✨ Yeni İxtisas Əlavə Et — 31 Qlobal Dil'}
                        </h3>
                        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
                          {editingProgramId ? 'Məlumatları dəyişdirin və saxlayın.' : 'Universitetinizin təklif etdiyi ixtisası 31 dildə yaradın.'}
                        </p>
                      </div>
                      <button className="btn-secondary" onClick={() => { setShowInlineProgramForm(false); setProgramOpenLangs({}); setEditingProgramId(null); }}>✕ Bağla</button>
                    </div>

                    <form onSubmit={handleAddProgramSubmit}>
                      <div style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)', border: '1px solid #c4b5fd', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', color: '#5b21b6' }}>
                        <strong>💡 AI Avto-Tərcümə:</strong> İxtisas adını yazın və <strong>"AI ilə 31 Dilə Avto-Tərcümə Et"</strong> düyməsinə basın. Bütün 31 qlobal dil generasiya olunacaq və saxlamazdan öncə istədiyiniz dildə redaktə edə biləcəksiniz!
                      </div>

                      <div className="profile-form-grid" style={{ maxWidth: '100%', gap: '20px' }}>
                        <div className="form-group full-width">
                          <label>İxtisas Adı *</label>
                          <input
                            type="text"
                            placeholder="Məs: Backend Developer Course / Computer Science & AI"
                            value={programForm.title}
                            onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>İxtisas Sahəsi (Field of Study)</label>
                          <input
                            type="text"
                            value={programForm.fieldOfStudy}
                            onChange={(e) => setProgramForm({ ...programForm, fieldOfStudy: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Təhsil Dərəcəsi</label>
                          <select
                            value={programForm.level}
                            onChange={(e) => setProgramForm({ ...programForm, level: e.target.value })}
                          >
                            <option value="Bachelor">Bachelor (Bakalavr)</option>
                            <option value="Master">Master (Magistr)</option>
                            <option value="PhD">PhD (Doktorantura)</option>
                            <option value="Diploma">Diploma / Course</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>İllik Təhsil Haqqı</label>
                          <input
                            type="text"
                            value={programForm.tuitionFee}
                            onChange={(e) => setProgramForm({ ...programForm, tuitionFee: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Müddət</label>
                          <input
                            type="text"
                            value={programForm.duration}
                            onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Qəbul Tələbləri (Requirements)</label>
                          <input
                            type="text"
                            placeholder="Məs: IELTS 6.0+, High School Diploma"
                            value={programForm.entryRequirements}
                            onChange={(e) => setProgramForm({ ...programForm, entryRequirements: e.target.value })}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>İxtisasın Ətraflı Təsviri (AZ)</label>
                          <textarea
                            rows="3"
                            placeholder="Tədris planı, bacarıqlar və imkanlar..."
                            value={programForm.description}
                            onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-ai-translate"
                        onClick={handleAiTranslateProgram}
                        disabled={isTranslating}
                        style={{
                          width: '100%',
                          background: isTranslating
                            ? 'linear-gradient(90deg, #a78bfa 0%, #c084fc 100%)'
                            : 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                          color: '#fff',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: isTranslating ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          marginTop: '20px',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 20px rgba(109, 40, 217, 0.35)',
                          letterSpacing: '0.3px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{isTranslating ? '⏳' : '✨'}</span>
                        {isTranslating ? 'AI 31 Qlobal Dilə Avto-Tərcümə Edir...' : 'AI ilə 31 Dilə Avto-Tərcümə Et'}
                      </button>

                  {/* 31 Language Accordion — same as University Profile */}
                      {Object.keys(programForm.translationsByLang).length > 0 && (
                        <div className="form-group full-width" style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>🌐 31 Qlobal Dil — Canlı Redaktə</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button type="button" onClick={expandAllProgramLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #7A5CFF', background: 'transparent', color: '#7A5CFF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊞ Hamısını Aç</button>
                              <button type="button" onClick={collapseAllProgramLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊟ Hamısını Bağla</button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {ALL_31_LANGUAGES.map(lang => {
                              const meta = LANGUAGE_META[lang] || { flag: '🌐', name: lang.toUpperCase() };
                              const tr = programForm.translationsByLang[lang] || {};
                              const isOpen = programOpenLangs[lang];
                              return (
                                <div key={lang} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleProgramLang(lang)}
                                    style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f5f3ff' : '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                                  >
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: isOpen ? '#7A5CFF' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '20px' }}>{meta.flag}</span>
                                      {meta.name} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px', marginLeft: '4px' }}>({lang.toUpperCase()})</span>
                                      {(tr.title) && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>✓ Hazırdır</span>}
                                    </span>
                                    <span style={{ color: '#7A5CFF', fontSize: '18px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                  </button>
                                  {isOpen && (
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0' }}>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — İxtisas Adı:</label>
                                        <input
                                          type="text"
                                          value={tr.title || ''}
                                          onChange={e => setProgramForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], title: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində ixtisas adı...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Tələblər:</label>
                                        <input
                                          type="text"
                                          value={tr.requirements || ''}
                                          onChange={e => setProgramForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], requirements: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində tələblər...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Ətraflı Təsvir:</label>
                                        <textarea
                                          rows="3"
                                          value={tr.description || ''}
                                          onChange={e => setProgramForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], description: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində təsvir...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => { setShowInlineProgramForm(false); setProgramOpenLangs({}); }}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Ləğv et
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>✨</span> Yadda Saxla (31 Dil)
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Programs Card List ─────────────────────────── */}
                {programsList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: showInlineProgramForm ? '0' : '0' }}>
                    {programsList.map((prog, idx) => (
                      <div
                        key={prog.id || idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                          transition: 'box-shadow 0.2s'
                        }}
                      >
                        {/* Left: info */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '16px', color: '#0f172a' }}>{prog.title}</strong>
                            <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>{prog.level || 'Bachelor'}</span>
                            {Object.keys(prog.translationsByLang || {}).length > 0 && (
                              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>✨ 31 Dil</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>📚 {prog.fieldOfStudy || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>⏱ {prog.duration || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>💰 {prog.tuitionFee || '—'}</span>
                          </div>
                        </div>

                        {/* Right: action buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditProgram(prog)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              border: '1.5px solid #7A5CFF',
                              background: '#fff',
                              color: '#7A5CFF',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            ✏️ {t('portal.edit') || "Düzəlt"}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`"${prog.title}" proqramını silmək istədiyinizə əminsinizmi?`)) {
                                handleDeleteProgram(prog.id);
                              }
                            }}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              border: '1.5px solid #fca5a5',
                              background: '#fff',
                              color: '#dc2626',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            🗑 Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showInlineProgramForm && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                      <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '18px' }}>Hələ ixtisas əlavə edilməyib</h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>Yuxarıdakı düyməyə basıb ilk ixtisasınızı 31 dildə yaradın.</p>
                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {activeTab === 'Student Leads' && (
            <div className="portal-panel leads-panel">
              <div className="panel-header flex-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>🎓 {t('portal.studentLeadsTitle', 'Tələbə Müraciətləri Və Qəbullar')}</h2>
                  <p>{t('portal.studentLeadsSubtitle', 'Sayt vasitəsilə müraciət etmiş yeni tələbələri idarə edin və qəbul statusunu dəyişin.')}</p>
                </div>
                
                {/* Leads Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                  {['All', 'Applied', 'Accepted', 'Under Review', 'Rejected'].map(f => (
                    <button
                      key={f}
                      onClick={() => setLeadsFilter(f)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '7px',
                        border: 'none',
                        background: leadsFilter === f ? '#7A5CFF' : 'transparent',
                        color: leadsFilter === f ? '#fff' : '#64748b',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {f === 'All' ? 'Bütün Müraciətlər' : f === 'Applied' ? 'Müraciət Olunanlar' : f === 'Accepted' ? '✅ Qəbul Olunanlar' : f === 'Under Review' ? '⏳ Dəyərləndirmədə' : '❌ İmtinələr'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-body" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeLeads
                    .filter(l => leadsFilter === 'All' || l.status === leadsFilter)
                    .map(lead => (
                      <div 
                        key={lead.id} 
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        {/* Student Details Left */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
                          <div 
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: lead.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '18px',
                              flexShrink: 0
                            }}
                          >
                            {lead.initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{lead.name}</h4>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{lead.flag} {lead.origin}</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                              🎯 İxtisas: <strong>{lead.program}</strong> &bull; <span style={{ color: '#94a3b8' }}>{lead.time}</span>
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                              📧 {lead.email} &bull; 📞 {lead.phone}
                            </p>
                          </div>
                        </div>

                        {/* Match & Status Middle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span 
                            style={{
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              fontSize: '12px',
                              fontWeight: '700',
                              padding: '6px 12px',
                              borderRadius: '100px'
                            }}
                          >
                            ✨ {lead.match} Match
                          </span>

                          <span
                            style={{
                              background: lead.status === 'Accepted' ? '#dcfce7' : lead.status === 'Rejected' ? '#fee2e2' : lead.status === 'Under Review' ? '#fef3c7' : '#e0e7ff',
                              color: lead.status === 'Accepted' ? '#15803d' : lead.status === 'Rejected' ? '#b91c1c' : lead.status === 'Under Review' ? '#b45309' : '#4338ca',
                              fontSize: '12px',
                              fontWeight: '700',
                              padding: '6px 14px',
                              borderRadius: '100px'
                            }}
                          >
                            {lead.status === 'Accepted' ? '🎉 Qəbul Olundu' : lead.status === 'Rejected' ? '❌ İmtinə Olundu' : lead.status === 'Under Review' ? '⏳ Dəyərləndirilir' : '📩 Müraciət Olundu'}
                          </span>
                        </div>

                        {/* Action Buttons Right */}
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {lead.status !== 'Accepted' && (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, 'Accepted')}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#10b981',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                              }}
                            >
                              ✅ Qəbul Et
                            </button>
                          )}

                          {lead.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, 'Rejected')}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #fca5a5',
                                background: '#fff',
                                color: '#dc2626',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              ❌ İmtinə Et
                            </button>
                          )}

                          <a
                            href={`mailto:${lead.email}`}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#475569',
                              fontSize: '13px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ✉️ Əlaqə
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="portal-panel analytics-panel">
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', color: '#0f172a', margin: 0, fontWeight: '700' }}>
                  📊 Analitika Və Statistika (Analytics & Performance)
                </h2>
                <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '14px' }}>
                  <strong>{currentUni?.Name || "Universitetinizin"}</strong> qlobal reytinqi, profil baxışları və tələbə müraciətlərinin detallı təhlili (Backend-dən gələn real məlumatlar).
                </p>
              </div>

              {!analyticsData ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  ⏳ Backend-dən analitik məlumatlar yüklənir...
                </div>
              ) : (
                <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  
                  {/* 1. TOP METRIC CARDS (4 CARDS) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(122,92,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#6d28d9' }}>👁️ Profil Baxışları</span>
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '100px' }}>+18.4% ↗</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#4c1d95' }}>
                        {analyticsData.totalViews.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px' }}>Qlobal tələbələr tərəfindən baxılıb</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(59,130,246,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8' }}>🎓 Ümumi Müraciətlər</span>
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '100px' }}>+24.1% ↗</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e40af' }}>
                        {analyticsData.totalApplications}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>Daxil olan real müraciət sayı</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(34,197,94,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>🎉 Qəbul Olunanlar</span>
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '100px' }}>Uğurlu</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#166534' }}>
                        {analyticsData.acceptedApplications}
                      </div>
                      <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Təsdiqlənmiş tələbə qəbulları</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(249,115,22,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#c2410c' }}>⚡ Qəbul Faizi</span>
                        <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '100px' }}>Ortalama</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#9a3412' }}>
                        {analyticsData.acceptanceRate}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#ea580c', marginTop: '4px' }}>Müraciətlərin qəbul olunma nisbəti</div>
                    </div>
                  </div>

                  {/* 2. MIDDLE TWO-COLUMN SECTION */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    
                    {/* Left: Monthly Dynamic Chart */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>📈 Aylıq Trafik Və Müraciət Dinamikası</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Son 7 ayın statistika müqayisəsi</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7A5CFF' }}>
                            <span style={{ width: '10px', height: '10px', background: '#7A5CFF', borderRadius: '3px', display: 'inline-block' }}></span> Baxışlar
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                            <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '3px', display: 'inline-block' }}></span> Müraciət
                          </span>
                        </div>
                      </div>

                      {/* Visual Bar Chart */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '2px solid #f1f5f9' }}>
                        {(analyticsData.monthlyStats || []).map((m, idx) => {
                          const maxViews = 3500;
                          const viewHeight = Math.max(15, (m.views / maxViews) * 140);
                          const appHeight = Math.max(10, (m.applications / 100) * 140);
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                                {/* Views Bar */}
                                <div
                                  title={`${m.month}: ${m.views} Baxış`}
                                  style={{
                                    width: '14px',
                                    height: `${viewHeight}px`,
                                    background: 'linear-gradient(180deg, #7A5CFF 0%, #9333ea 100%)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.4s ease'
                                  }}
                                ></div>
                                {/* Apps Bar */}
                                <div
                                  title={`${m.month}: ${m.applications} Müraciət`}
                                  style={{
                                    width: '14px',
                                    height: `${appHeight}px`,
                                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.4s ease'
                                  }}
                                ></div>
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{m.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Top Origin Countries */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>🌍 Müraciət Edən Ölkələr (Global Reach)</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Tələbələrin gəldiyi başlıca ölkələr</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(analyticsData.topCountries || []).map((c, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                              <span style={{ fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{c.flag}</span> {c.country}
                              </span>
                              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                                {c.count} müraciət <span style={{ color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>({c.percentage}%)</span>
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${c.percentage}%`,
                                  height: '100%',
                                  background: idx === 0 ? '#7A5CFF' : idx === 1 ? '#10b981' : idx === 2 ? '#3b82f6' : '#f59e0b',
                                  borderRadius: '100px',
                                  transition: 'width 0.5s ease'
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* 3. BOTTOM RANKING SECTION: TOP PROGRAMS */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>🏆 Ən Çox Müraciət Olunan İxtisaslar</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Tələbələr tərəfindən ən çox seçilən proqramların reytinqi</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(analyticsData.topPrograms || []).map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: idx === 0 ? '#FEF3C7' : '#F1F5F9',
                                color: idx === 0 ? '#D97706' : '#64748B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyText: 'center',
                                fontWeight: '700',
                                fontSize: '13px'
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.title}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                              {p.count} müraciət
                            </span>
                            <span
                              style={{
                                background: '#ede9fe',
                                color: '#6d28d9',
                                fontSize: '12px',
                                fontWeight: '700',
                                padding: '4px 12px',
                                borderRadius: '100px'
                              }}
                            >
                              {p.percentage}% Pay
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'Scholarships' && (
            <div className="portal-panel scholarships-panel">
              <div className="panel-header flex-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
                    🎓 Təqaüd İdarəetməsi — 31 Qlobal Dil (Scholarships)
                  </h2>
                  <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
                    Universitetinizin təklif etdiyi təqaüdləri 31 dildə yaradın, redaktə edin və idarə edin.
                  </p>
                </div>
                {!showInlineScholarshipForm && (
                  <button 
                    onClick={() => {
                      setEditingScholarshipId(null);
                      setScholarshipForm({
                        name: '',
                        amount: 'Tam Təqaüd ($5,000/il)',
                        location: currentUni?.City || 'Bakı, Azərbaycan',
                        countryId: currentUni?.CountryId || '',
                        status: 'Open',
                        deadline: '31 Dekabr 2025',
                        eligible: 'Bütün beynəlxalq tələbələr',
                        places: '50 yer/il',
                        buttonType: 'check',
                        description: '',
                        translationsByLang: {}
                      });
                      setScholarshipOpenLangs({});
                      setShowInlineScholarshipForm(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #7A5CFF 0%, #6366f1 100%)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '700',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(122, 92, 255, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      letterSpacing: '0.2px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>✨</span> + Yeni Təqaüd Əlavə Et
                  </button>
                )}
              </div>

              <div className="panel-body">
                {/* Inline Add / Edit Scholarship Form */}
                {showInlineScholarshipForm && (
                  <div className="inline-scholarship-editor" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                          {editingScholarshipId ? '✏️ Təqaüdü Redaktə Et' : '✨ Yeni Təqaüd Əlavə Et — 31 Qlobal Dil'}
                        </h3>
                        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
                          {editingScholarshipId ? 'Məlumatları dəyişdirin və saxlayın.' : 'Təqaüd proqramını 31 dildə yaradın.'}
                        </p>
                      </div>
                      <button className="btn-secondary" onClick={() => { setShowInlineScholarshipForm(false); setScholarshipOpenLangs({}); setEditingScholarshipId(null); }}>✕ Bağla</button>
                    </div>

                    <form onSubmit={handleAddScholarshipSubmit}>
                      <div style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)', border: '1px solid #c4b5fd', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', color: '#5b21b6' }}>
                        <strong>💡 AI Avto-Tərcümə:</strong> Təqaüd adını yazın və <strong>"AI ilə 31 Dilə Avto-Tərcümə Et"</strong> düyməsinə basın. Bütün 31 qlobal dil generasiya olunacaq!
                      </div>

                      <div className="profile-form-grid" style={{ maxWidth: '100%', gap: '20px' }}>
                        <div className="form-group full-width">
                          <label>Təqaüdün Adı *</label>
                          <input
                            type="text"
                            placeholder="Məs: Azərbaycan Dövlət Təqaüdü / Stipendium Hungaricum"
                            value={scholarshipForm.name}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Təqaüd Məbləği / Dəstək</label>
                          <input
                            type="text"
                            placeholder="Məs: Tam Təqaüd / $5,000/il / €750-€1,200/ay"
                            value={scholarshipForm.amount}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Şəhər / Məkan</label>
                          <input
                            type="text"
                            placeholder="Məs: Bakı, Azərbaycan"
                            value={scholarshipForm.location}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, location: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={scholarshipForm.status}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, status: e.target.value })}
                          >
                            <option value="Open">Open (Açıqdır)</option>
                            <option value="Closed">Closed (Bağlıdır)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Yer Sayı (Places)</label>
                          <input
                            type="text"
                            placeholder="Məs: 50 yer/il və ya Sərbəst"
                            value={scholarshipForm.places}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, places: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Son Müraciət Tarixi (Deadline)</label>
                          <input
                            type="text"
                            placeholder="Məs: 31 Dekabr 2025"
                            value={scholarshipForm.deadline}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Uyğunluq / Kimlər Müraciət Edə Bilər</label>
                          <input
                            type="text"
                            placeholder="Məs: Bütün beynəlxalq tələbələr"
                            value={scholarshipForm.eligible}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligible: e.target.value })}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Təqaüdün Ətraflı Təsviri (AZ)</label>
                          <textarea
                            rows="3"
                            placeholder="Müraciət şərtləri, aylıq stependiya, yaşayış təminatı və s..."
                            value={scholarshipForm.description}
                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-ai-translate"
                        onClick={handleAiTranslateScholarship}
                        disabled={isTranslatingScholarship}
                        style={{
                          width: '100%',
                          background: isTranslatingScholarship
                            ? 'linear-gradient(90deg, #a78bfa 0%, #c084fc 100%)'
                            : 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                          color: '#fff',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: isTranslatingScholarship ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          marginTop: '20px',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 20px rgba(109, 40, 217, 0.35)',
                          letterSpacing: '0.3px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{isTranslatingScholarship ? '⏳' : '✨'}</span>
                        {isTranslatingScholarship ? 'AI 31 Qlobal Dilə Avto-Tərcümə Edir...' : 'AI ilə 31 Dilə Avto-Tərcümə Et'}
                      </button>

                      {/* 31 Language Accordion */}
                      {Object.keys(scholarshipForm.translationsByLang).length > 0 && (
                        <div className="form-group full-width" style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>🌐 31 Qlobal Dil — Canlı Redaktə</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button type="button" onClick={expandAllScholarshipLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #7A5CFF', background: 'transparent', color: '#7A5CFF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊞ Hamısını Aç</button>
                              <button type="button" onClick={collapseAllScholarshipLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊟ Hamısını Bağla</button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {ALL_31_LANGUAGES.map(lang => {
                              const meta = LANGUAGE_META[lang] || { flag: '🌐', name: lang.toUpperCase() };
                              const tr = scholarshipForm.translationsByLang[lang] || {};
                              const isOpen = scholarshipOpenLangs[lang];
                              return (
                                <div key={lang} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleScholarshipLang(lang)}
                                    style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f5f3ff' : '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                                  >
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: isOpen ? '#7A5CFF' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '20px' }}>{meta.flag}</span>
                                      {meta.name} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px', marginLeft: '4px' }}>({lang.toUpperCase()})</span>
                                      {(tr.title) && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>✓ Hazırdır</span>}
                                    </span>
                                    <span style={{ color: '#7A5CFF', fontSize: '18px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                  </button>
                                  {isOpen && (
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0' }}>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Təqaüd Adı:</label>
                                        <input
                                          type="text"
                                          value={tr.title || ''}
                                          onChange={e => setScholarshipForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], title: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində təqaüd adı...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Ətraflı Təsvir:</label>
                                        <textarea
                                          rows="3"
                                          value={tr.description || ''}
                                          onChange={e => setScholarshipForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], description: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində təsvir...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => { setShowInlineScholarshipForm(false); setScholarshipOpenLangs({}); setEditingScholarshipId(null); }}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Ləğv et
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>✨</span> Yadda Saxla (31 Dil)
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Scholarships Cards List ─────────────────────────── */}
                {(backendScholarships && backendScholarships.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {backendScholarships.map((sch, idx) => (
                      <div
                        key={sch.id || idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Left info */}
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '16px', color: '#0f172a' }}>{sch.name || sch.Name}</strong>
                            <span style={{ background: sch.status === 'Open' ? '#dcfce7' : '#fee2e2', color: sch.status === 'Open' ? '#15803d' : '#b91c1c', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
                              {sch.status === 'Open' ? 'Açıqdır' : 'Bağlıdır'}
                            </span>
                            <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
                              ✨ 31 Qlobal Dil
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>💰 {sch.amount || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>📍 {sch.location || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>⏳ Son Tarix: {sch.deadline || '—'}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>👥 Yerlər: {sch.places || '—'}</span>
                          </div>
                        </div>

                        {/* Right action buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditScholarship(sch)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              border: '1.5px solid #7A5CFF',
                              background: '#fff',
                              color: '#7A5CFF',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ✏️ Düzəlt
                          </button>
                          <button
                            onClick={() => handleDeleteScholarshipPrompt(sch)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              border: '1.5px solid #fca5a5',
                              background: '#fff',
                              color: '#dc2626',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            🗑 Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showInlineScholarshipForm && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                      <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '18px' }}>Hələ təqaüd proqramı əlavə edilməyib</h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>Yuxarıdakı "+ Yeni Təqaüd Əlavə Et" düyməsinə basıb ilk təqaüdünüzü 31 dildə yaradın.</p>
                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {activeTab === 'Campaigns' && (
            <div className="portal-panel campaigns-panel">
              <div className="panel-header flex-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
                    🚀 {t('portal.campaignsTitle') || 'Marketinq Kampaniyaları İdarəetməsi — 31 Qlobal Dil (Campaigns)'}
                  </h2>
                  <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
                    {t('portal.campaignsDesc') || '80+ ölkədə hədəflənmiş tələbə cəlb etmə kampaniyaları həyata keçirin.'}
                  </p>
                </div>
                {!showInlineCampaignForm && (
                  <button
                    onClick={() => {
                      setEditingCampaignId(null);
                      setCampaignForm({
                        title: '',
                        targetRegion: 'Qərbi Afrika',
                        targetCountry: 'Nigeriya, Qana',
                        budget: '$2,500/ay',
                        reach: '45,000+ tələbə',
                        dailyApplications: '18-25/gün',
                        status: 'Active',
                        campaignType: 'Global Recruitment',
                        description: '',
                        translationsByLang: {}
                      });
                      setCampaignOpenLangs({});
                      setShowInlineCampaignForm(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #7A5CFF 0%, #6366f1 100%)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '700',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(122, 92, 255, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      letterSpacing: '0.2px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>✨</span> {t('portal.addCampaign') || '+ Yeni Kampaniya Əlavə Et'}
                  </button>
                )}
              </div>

              <div className="panel-body">
                {/* Inline Add / Edit Campaign Form */}
                {showInlineCampaignForm && (
                  <div className="inline-campaign-editor" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                          {editingCampaignId ? '✏️ Kampaniyanı Redaktə Et' : '✨ Yeni Kampaniya Əlavə Et — 31 Qlobal Dil'}
                        </h3>
                        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
                          {editingCampaignId ? 'Məlumatları dəyişdirin və saxlayın.' : 'Cəlb etmə kampaniyasını 31 dildə yaradın.'}
                        </p>
                      </div>
                      <button className="btn-secondary" onClick={() => { setShowInlineCampaignForm(false); setCampaignOpenLangs({}); setEditingCampaignId(null); }}>✕ Bağla</button>
                    </div>

                    <form onSubmit={handleAddCampaignSubmit}>
                      <div style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)', border: '1px solid #c4b5fd', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', color: '#5b21b6' }}>
                        <strong>💡 AI Avto-Tərcümə:</strong> Kampaniya başlığını daxil edin və <strong>"AI ilə 31 Dilə Avto-Tərcümə Et"</strong> düyməsinə basın. Bütün 31 qlobal dil generasiya olunacaq!
                      </div>

                      <div className="profile-form-grid" style={{ maxWidth: '100%', gap: '20px' }}>
                        <div className="form-group full-width">
                          <label>{t('portal.campaignTitle') || 'Kampaniya Başlığı'} *</label>
                          <input
                            type="text"
                            placeholder="Məs: Qərbi Afrika və Nigeriya Tələbə Cəlb Etmə Kampaniyası"
                            value={campaignForm.title}
                            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('portal.targetRegion') || 'Hədəf Region'}</label>
                          <input
                            type="text"
                            placeholder="Məs: Qərbi Afrika / Mərkəzi Asiya / Qlobal"
                            value={campaignForm.targetRegion}
                            onChange={(e) => setCampaignForm({ ...campaignForm, targetRegion: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('portal.targetCountry') || 'Hədəf Ölkələr'}</label>
                          <input
                            type="text"
                            placeholder="Məs: Nigeriya, Qana, Qazaxıstan"
                            value={campaignForm.targetCountry}
                            onChange={(e) => setCampaignForm({ ...campaignForm, targetCountry: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('portal.budget') || 'Aylıq Büdcə'}</label>
                          <input
                            type="text"
                            placeholder="Məs: $2,500/ay"
                            value={campaignForm.budget}
                            onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('portal.reach') || 'Gözlənilən Çatma Sayı'}</label>
                          <input
                            type="text"
                            placeholder="Məs: 45,000+ tələbə"
                            value={campaignForm.reach}
                            onChange={(e) => setCampaignForm({ ...campaignForm, reach: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('portal.dailyApps') || 'Günlük Müraciət Sayı'}</label>
                          <input
                            type="text"
                            placeholder="Məs: 18-25/gün"
                            value={campaignForm.dailyApplications}
                            onChange={(e) => setCampaignForm({ ...campaignForm, dailyApplications: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={campaignForm.status}
                            onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                          >
                            <option value="Active">Active (Aktivdir)</option>
                            <option value="Draft">Draft (Qaralama)</option>
                            <option value="Ended">Ended (Bitib)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t('portal.campaignType') || 'Kampaniya Növü'}</label>
                          <select
                            value={campaignForm.campaignType}
                            onChange={(e) => setCampaignForm({ ...campaignForm, campaignType: e.target.value })}
                          >
                            <option value="Global Recruitment">Global Recruitment</option>
                            <option value="Scholarship Drive">Scholarship Drive</option>
                            <option value="STEM Focus">STEM Focus</option>
                          </select>
                        </div>

                        <div className="form-group full-width">
                          <label>Kampaniya Təsviri (AZ)</label>
                          <textarea
                            rows="3"
                            placeholder="Kampaniyanın hədəfləri, tələbə yönləndirmə şərtləri..."
                            value={campaignForm.description}
                            onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-ai-translate"
                        onClick={handleAiTranslateCampaign}
                        disabled={isTranslatingCampaign}
                        style={{
                          width: '100%',
                          background: isTranslatingCampaign
                            ? 'linear-gradient(90deg, #a78bfa 0%, #c084fc 100%)'
                            : 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                          color: '#fff',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: isTranslatingCampaign ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          marginTop: '20px',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 20px rgba(109, 40, 217, 0.35)',
                          letterSpacing: '0.3px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{isTranslatingCampaign ? '⏳' : '✨'}</span>
                        {isTranslatingCampaign ? 'AI 31 Qlobal Dilə Avto-Tərcümə Edir...' : (t('portal.aiTranslate') || 'AI ilə 31 Dilə Avto-Tərcümə Et')}
                      </button>

                      {/* 31 Language Accordion */}
                      {Object.keys(campaignForm.translationsByLang).length > 0 && (
                        <div className="form-group full-width" style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>🌐 31 Qlobal Dil — Canlı Redaktə</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button type="button" onClick={expandAllCampaignLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #7A5CFF', background: 'transparent', color: '#7A5CFF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊞ Hamısını Aç</button>
                              <button type="button" onClick={collapseAllCampaignLangs} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>⊟ Hamısını Bağla</button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {ALL_31_LANGUAGES.map(lang => {
                              const meta = LANGUAGE_META[lang] || { flag: '🌐', name: lang.toUpperCase() };
                              const tr = campaignForm.translationsByLang[lang] || {};
                              const isOpen = campaignOpenLangs[lang];
                              return (
                                <div key={lang} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleCampaignLang(lang)}
                                    style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f5f3ff' : '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                                  >
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: isOpen ? '#7A5CFF' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '20px' }}>{meta.flag}</span>
                                      {meta.name} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px', marginLeft: '4px' }}>({lang.toUpperCase()})</span>
                                      {(tr.title) && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>✓ Hazırdır</span>}
                                    </span>
                                    <span style={{ color: '#7A5CFF', fontSize: '18px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                  </button>
                                  {isOpen && (
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0' }}>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Kampaniya Başlığı:</label>
                                        <input
                                          type="text"
                                          value={tr.title || ''}
                                          onChange={e => setCampaignForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], title: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində başılıq...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>{meta.flag} {meta.name} — Ətraflı Təsvir:</label>
                                        <textarea
                                          rows="3"
                                          value={tr.description || ''}
                                          onChange={e => setCampaignForm(prev => ({ ...prev, translationsByLang: { ...prev.translationsByLang, [lang]: { ...prev.translationsByLang[lang], description: e.target.value } } }))}
                                          placeholder={`${meta.name} dilində təsvir...`}
                                          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => { setShowInlineCampaignForm(false); setCampaignOpenLangs({}); setEditingCampaignId(null); }}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t('portal.cancel') || 'Ləğv et'}
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(90deg, #6d28d9 0%, #9333ea 100%)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>✨</span> {t('portal.save31') || 'Yadda Saxla (31 Dil)'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Campaign Cards List ─────────────────────────── */}
                {(backendCampaigns && backendCampaigns.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {backendCampaigns.map((cmp, idx) => (
                      <div
                        key={cmp.id || idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '20px',
                          flexWrap: 'wrap',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '17px', color: '#0f172a' }}>{cmp.title || cmp.Title}</strong>
                            <span style={{ background: cmp.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: cmp.status === 'Active' ? '#15803d' : '#475569', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
                              {cmp.status === 'Active' ? (t('portal.statusActive') || 'Aktivdir') : cmp.status}
                            </span>
                            <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
                              {cmp.campaignType || 'Global Recruitment'}
                            </span>
                            <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>
                              ✨ 31 Qlobal Dil
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <span style={{ fontSize: '13.5px', color: '#475569' }}>🌍 <strong>{t('portal.targetCountry') || 'Hədəf Ölkə'}:</strong> {cmp.targetCountry || cmp.targetRegion || '—'}</span>
                            <span style={{ fontSize: '13.5px', color: '#475569' }}>💵 <strong>{t('portal.budget') || 'Büdcə'}:</strong> {cmp.budget || '—'}</span>
                            <span style={{ fontSize: '13.5px', color: '#475569' }}>👥 <strong>{t('portal.reach') || 'Çatma'}:</strong> {cmp.reach || '—'}</span>
                            <span style={{ fontSize: '13.5px', color: '#475569' }}>📈 <strong>{t('portal.dailyApps') || 'Günlük Müraciət'}:</strong> {cmp.dailyApplications || '—'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditCampaign(cmp)}
                            style={{
                              padding: '9px 18px',
                              borderRadius: '10px',
                              border: '1.5px solid #7A5CFF',
                              background: '#fff',
                              color: '#7A5CFF',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ✏️ {t('portal.edit') || 'Düzəlt'}
                          </button>
                          <button
                            onClick={() => handleDeleteCampaignPrompt(cmp)}
                            style={{
                              padding: '9px 18px',
                              borderRadius: '10px',
                              border: '1.5px solid #fca5a5',
                              background: '#fff',
                              color: '#dc2626',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            🗑 {t('portal.delete') || 'Sil'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showInlineCampaignForm && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                      <h4 style={{ margin: '0 0 8px', color: '#475569', fontSize: '18px' }}>Hələ marketinq kampaniyası yaradılmayıb</h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>Yuxarıdakı "+ Yeni Kampaniya Əlavə Et" düyməsinə basıb 80+ ölkədə ilk tələbə cəlb etmə kampaniyanızı 31 dildə yaradın.</p>
                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="portal-panel settings-panel">
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ⚙️ {t('portal.settingsTitle') || "Portal Tənzimləmələri və Təhlükəsizlik"}
                </h2>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '14px' }}>
                  {t('portal.settingsDesc') || "Giriş icazələrini, komanda hesablarını və API inteqrasiyalarını idarə edin."}
                </p>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Admin Profile Credentials */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                    👤 {t('portal.adminProfile') || "Admin Məlumatları"}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Admin Adı & Soyadı</label>
                      <input 
                        type="text" 
                        value={portalSettings.adminName} 
                        onChange={(e) => setPortalSettings({...portalSettings, adminName: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Admin E-poçt</label>
                      <input 
                        type="email" 
                        value={portalSettings.adminEmail} 
                        onChange={(e) => setPortalSettings({...portalSettings, adminEmail: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Əlaqə Nömrəsi</label>
                      <input 
                        type="text" 
                        value={portalSettings.contactPhone} 
                        onChange={(e) => setPortalSettings({...portalSettings, contactPhone: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Members & Access Permissions */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                      👥 {t('portal.teamMembers') || "Komanda İcazələri Və Girişlər"}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowAddTeamModal(true)}
                      style={{ background: '#7A5CFF', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {t('portal.addTeamMember') || "+ Yeni Komanda Üzvü Əlavə Et"}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeTeamMembers.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{m.name}</strong>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{m.email} &bull; <em style={{ color: '#7A5CFF', fontStyle: 'normal', fontWeight: '600' }}>{m.role}</em></span>
                          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {m.canViewPrograms && <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>📚 Proqramlar: Full</span>}
                            {m.canViewScholarships && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>🎓 Təqaüdlər: Full</span>}
                            {m.canViewCampaigns && <span style={{ background: '#fce7f3', color: '#9d174d', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>🚀 Kampaniyalar</span>}
                            {m.canEditProfile && <span style={{ background: '#dcfce7', color: '#166534', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>🏛️ Profil Editi</span>}
                          </div>
                        </div>
                        <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                          {m.status || 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API & Webhook Integrations */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                    🔌 {t('portal.apiIntegrations') || "API və Webhook İnteqrasiyaları"}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Webhook URL (CRM Sync)</label>
                      <input 
                        type="url" 
                        value={portalSettings.webhookUrl} 
                        onChange={(e) => setPortalSettings({...portalSettings, webhookUrl: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>API Secret Key</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          readOnly
                          value={portalSettings.apiKey} 
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc', fontFamily: 'monospace' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => { navigator.clipboard.writeText(portalSettings.apiKey); toast.showSuccess("🔑 API Açarı kopyalandı!"); }}
                          style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications & Save Button */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={portalSettings.notificationEmail} 
                        onChange={(e) => setPortalSettings({...portalSettings, notificationEmail: e.target.checked})}
                        style={{ width: '18px', height: '18px', accentColor: '#7A5CFF' }}
                      />
                      E-poçt Xəbərdarlıqları
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={portalSettings.weeklyDigest} 
                        onChange={(e) => setPortalSettings({...portalSettings, weeklyDigest: e.target.checked})}
                        style={{ width: '18px', height: '18px', accentColor: '#7A5CFF' }}
                      />
                      Həftəlik Analitika Hesabatı
                    </label>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSavePortalSettings}
                    style={{ background: 'linear-gradient(90deg, #7A5CFF 0%, #00C853 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(122, 92, 255, 0.35)' }}
                  >
                    💾 {t('portal.saveSettings') || "Tənzimləmələri Yadda Saxla"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Team Member Modal with Granular Permissions */}
      {showAddTeamModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>+ Yeni Komanda Üzvü Və İcazələr</h3>
            <form onSubmit={handleAddTeamMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Ad & Soyad *</label>
                <input 
                  type="text" required value={newTeamMember.name} 
                  onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="Məs: Aysel Mammadova"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>E-poçt *</label>
                <input 
                  type="email" required value={newTeamMember.email} 
                  onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="a.mammadova@bdu.edu.az"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Vəzifə / Rol *</label>
                <select 
                  value={newTeamMember.role} 
                  onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Admissions Officer">Admissions Officer</option>
                  <option value="International Office Manager">International Office Manager</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Academic Counselor">Academic Counselor</option>
                </select>
              </div>

              {/* Granular Permissions Section */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  🔑 Panel İcazələri (Granular Permissions):
                </h4>
                
                {/* Programs Permissions */}
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#7A5CFF', display: 'block', marginBottom: '4px' }}>📚 Proqramlar (İxtisaslar):</strong>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#334155' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canViewPrograms} onChange={e => setNewTeamMember({...newTeamMember, canViewPrograms: e.target.checked})} /> Baxış
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canCreatePrograms} onChange={e => setNewTeamMember({...newTeamMember, canCreatePrograms: e.target.checked})} /> Yarat
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canEditPrograms} onChange={e => setNewTeamMember({...newTeamMember, canEditPrograms: e.target.checked})} /> Redaktə
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canDeletePrograms} onChange={e => setNewTeamMember({...newTeamMember, canDeletePrograms: e.target.checked})} /> Sil
                    </label>
                  </div>
                </div>

                {/* Scholarships Permissions */}
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#7A5CFF', display: 'block', marginBottom: '4px' }}>🎓 Təqaüdlər:</strong>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#334155' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canViewScholarships} onChange={e => setNewTeamMember({...newTeamMember, canViewScholarships: e.target.checked})} /> Baxış
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canCreateScholarships} onChange={e => setNewTeamMember({...newTeamMember, canCreateScholarships: e.target.checked})} /> Yarat
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canEditScholarships} onChange={e => setNewTeamMember({...newTeamMember, canEditScholarships: e.target.checked})} /> Redaktə
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canDeleteScholarships} onChange={e => setNewTeamMember({...newTeamMember, canDeleteScholarships: e.target.checked})} /> Sil
                    </label>
                  </div>
                </div>

                {/* Campaigns Permissions */}
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#7A5CFF', display: 'block', marginBottom: '4px' }}>🚀 Kampaniyalar:</strong>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#334155' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canViewCampaigns} onChange={e => setNewTeamMember({...newTeamMember, canViewCampaigns: e.target.checked})} /> Baxış
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canCreateCampaigns} onChange={e => setNewTeamMember({...newTeamMember, canCreateCampaigns: e.target.checked})} /> Yarat
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canEditCampaigns} onChange={e => setNewTeamMember({...newTeamMember, canEditCampaigns: e.target.checked})} /> Redaktə
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={newTeamMember.canDeleteCampaigns} onChange={e => setNewTeamMember({...newTeamMember, canDeleteCampaigns: e.target.checked})} /> Sil
                    </label>
                  </div>
                </div>

                {/* Profile Permission */}
                <div>
                  <strong style={{ fontSize: '13px', color: '#7A5CFF', display: 'block', marginBottom: '4px' }}>🏛️ Universitet Profili:</strong>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155' }}>
                    <input type="checkbox" checked={newTeamMember.canEditProfile} onChange={e => setNewTeamMember({...newTeamMember, canEditProfile: e.target.checked})} /> Profil Məlumatlarını Redaktə Et
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setShowAddTeamModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Ləğv Et</button>
                <button type="submit" style={{ background: '#7A5CFF', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(122, 92, 255, 0.3)' }}>💾 Əlavə Et & İcazələri Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {deleteModalItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
            }}>
              ⚠️
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
              Silinməni Təsdiqləyin
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              <strong>"{deleteModalItem.name}"</strong> təqaüdünü bazadan tamamilə silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Ləğv et
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                🗑 Hə, Silinsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityPortalPage;
