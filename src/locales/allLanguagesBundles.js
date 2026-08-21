// 31-Language Complete Translation Bundles Generator for EDUSAZ Platform & University Portal
import en from './en/common.json';
import az from './az/common.json';
import tr from './tr/common.json';
import ru from './ru/common.json';
import de from './de/common.json';
import fr from './fr/common.json';
import es from './es/common.json';
import it from './it/common.json';
import ar from './ar/common.json';
import zh from './zh/common.json';
import { talentsTranslations } from './talentsTranslations';
import { superAdminTranslations } from './superAdminTranslations';

const portalBaseAz = az.portal || {};

// Comprehensive Portal Translation Dictionaries for All 31 Global Languages
const portalTranslations = {
  en: {
    dashboard: "University Dashboard", overview: "Overview", universityProfile: "University Profile",
    programs: "Programs", studentLeads: "Student Leads", analytics: "Analytics",
    scholarships: "Scholarships", campaigns: "Marketing Campaigns", settings: "Portal Settings",
    totalLeads: "Total Student Leads", acceptanceRate: "Acceptance Rate", topCountries: "Top Source Countries",
    programDistribution: "Program Distribution", addProgram: "+ Add New Program", addScholarship: "+ Add New Scholarship",
    addCampaign: "+ Add New Campaign", edit: "Edit", delete: "Delete", save: "Save Changes",
    save31: "Save (31 Languages)", aiTranslate: "AI Auto-Translate to 31 Languages",
    statusOpen: "Open", statusClosed: "Closed", statusActive: "Active", statusDraft: "Draft", statusEnded: "Ended",
    statusAccepted: "Accepted", statusPending: "Applied / Pending", statusUnderReview: "Under Review", statusRejected: "Rejected",
    searchStudent: "Search student name or country...", filterStatus: "Filter Status", all: "All",
    confirmDeleteTitle: "Confirm Deletion", confirmDeleteDesc: "Are you sure you want to delete this item? This action cannot be undone.",
    cancel: "Cancel", confirmDeleteBtn: "Yes, Delete",
    campaignsTitle: "Marketing Campaigns Management", campaignsDesc: "Run targeted student recruitment campaigns across 80+ countries.",
    campaignTitle: "Campaign Title", targetRegion: "Target Region", targetCountry: "Target Country",
    budget: "Monthly Budget", reach: "Estimated Reach", dailyApps: "Daily Applications",
    campaignType: "Campaign Type", globalRecruitment: "Global Recruitment", scholarshipDrive: "Scholarship Drive", stemFocus: "STEM Focus",
    programsTitle: "Academic Programs & Courses",
    programsSubtitle: "Create and manage your university's degree programs across 31 global languages.",
    universityProfileTitle: "University Profile",
    universityProfileSubtitle: "Rich institutional profile information visible to international applicants.",
    scholarshipsTitle: "Scholarship & Grant Opportunities",
    scholarshipsSubtitle: "Manage full, partial, and merit-based financial aid options for international students.",
    studentLeadsTitle: "Student Leads & Applications",
    studentLeadsSubtitle: "Review and manage student applications received for your institution."
  },
  az: portalBaseAz,
  tr: {
    dashboard: "Üniversite Paneli", overview: "Genel Bakış", universityProfile: "Üniversite Profili",
    programs: "Programlar (Bölümler)", studentLeads: "Öğrenci Başvuruları", analytics: "Analitik",
    scholarships: "Burslar", campaigns: "Pazarlama Kampanyaları", settings: "Portal Ayarları",
    totalLeads: "Toplam Öğrenci Başvurusu", acceptanceRate: "Kabul Oranı", topCountries: "En Çok Başvuran Ülkeler",
    programDistribution: "Program Dağılımı", addProgram: "+ Yeni Program Ekle", addScholarship: "+ Yeni Burs Ekle",
    addCampaign: "+ Yeni Kampanya Ekle", edit: "Düzenle", delete: "Sil", save: "Kaydet",
    save31: "Kaydet (31 Dil)", aiTranslate: "AI ile 31 Dilde Otomatik Çevir",
    statusOpen: "Açık", statusClosed: "Kapalı", statusActive: "Aktif", statusDraft: "Taslak", statusEnded: "Bitti",
    statusAccepted: "Kabul Edildi", statusPending: "Başvuruldu / Beklemede", statusUnderReview: "İnceleniyor", statusRejected: "Reddedildi",
    searchStudent: "Öğrenci adı veya ülke ara...", filterStatus: "Duruma göre filtrele", all: "Hepsı",
    confirmDeleteTitle: "Silmeyi Onaylayın", confirmDeleteDesc: "Bu ögeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    cancel: "İptal", confirmDeleteBtn: "Evet, Sil",
    campaignsTitle: "Pazarlama Kampanyaları Yönetimi", campaignsDesc: "80+ ülkede hedefli öğrenci çekme kampanyaları yürütün.",
    campaignTitle: "Kampanya Başlığı", targetRegion: "Hedef Bölge", targetCountry: "Hedef Ülke",
    budget: "Aylık Bütçe", reach: "Tahmini Erişim", dailyApps: "Günlük Başvuru",
    campaignType: "Kampanya Türü", globalRecruitment: "Küresel Öğrenci Alımı", scholarshipDrive: "Burs Teşviki", stemFocus: "STEM Alanları"
  },
  ru: {
    dashboard: "Панель Университета", overview: "Обзор", universityProfile: "Профиль Университета",
    programs: "Программы обучения", studentLeads: "Заявки Студентов", analytics: "Аналитика",
    scholarships: "Стипендии и Гранты", campaigns: "Маркетинговые Кампании", settings: "Настройки Портала",
    totalLeads: "Всего Заявок Студентов", acceptanceRate: "Процент Поступления", topCountries: "Страны по Количеству Заявок",
    programDistribution: "Распределение по Программам", addProgram: "+ Добавить Программу", addScholarship: "+ Добавить Стипендию",
    addCampaign: "+ Создать Кампанию", edit: "Редактировать", delete: "Удалить", save: "Сохранить",
    save31: "Сохранить (31 Язык)", aiTranslate: "Автоперевод ИИ на 31 Язык",
    statusOpen: "Открыто", statusClosed: "Закрыто", statusActive: "Активно", statusDraft: "Черновик", statusEnded: "Завершено",
    statusAccepted: "Принят", statusPending: "Подано / Ожидание", statusUnderReview: "На Рассмотрении", statusRejected: "Отклонено",
    searchStudent: "Поиск по имени или стране...", filterStatus: "Фильтр по статусу", all: "Все",
    confirmDeleteTitle: "Подтверждение Удаления", confirmDeleteDesc: "Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.",
    cancel: "Отмена", confirmDeleteBtn: "Да, Удалить",
    campaignsTitle: "Управление Маркетинговыми Кампаниями", campaignsDesc: "Запускайте таргетированные кампании по набору студентов в 80+ странах.",
    campaignTitle: "Название Кампании", targetRegion: "Целевой Регион", targetCountry: "Целевая Страна",
    budget: "Месячный Бюджет", reach: "Ожидаемый Охват", dailyApps: "Заявок в День",
    campaignType: "Тип Кампании", globalRecruitment: "Глобальный Набор", scholarshipDrive: "Стипендиальная Кампания", stemFocus: "Направление STEM"
  },
  de: {
    dashboard: "Universitäts-Dashboard", overview: "Übersicht", universityProfile: "Hochschulprofil",
    programs: "Studiengänge", studentLeads: "Bewerbungen", analytics: "Analysen",
    scholarships: "Stipendien", campaigns: "Marketingkampagnen", settings: "Einstellungen",
    totalLeads: "Gesamte Bewerbungen", acceptanceRate: "Zulassungsquote", topCountries: "Top-Herkunftsländer",
    programDistribution: "Studiengangsverteilung", addProgram: "+ Studiengang Hinzufügen", addScholarship: "+ Stipendium Hinzufügen",
    addCampaign: "+ Kampagne Erstellen", edit: "Bearbeiten", delete: "Löschen", save: "Speichern",
    save31: "Speichern (31 Sprachen)", aiTranslate: "KI Auto-Übersetzung in 31 Sprachen",
    statusOpen: "Offen", statusClosed: "Geschlossen", statusActive: "Aktiv", statusDraft: "Entwurf", statusEnded: "Beendet",
    statusAccepted: "Akzeptiert", statusPending: "Eingereicht / Ausstehend", statusUnderReview: "In Prüfung", statusRejected: "Abgelehnt",
    searchStudent: "Suche nach Name oder Land...", filterStatus: "Statusfiltern", all: "Alle",
    confirmDeleteTitle: "Löschen Bestätigen", confirmDeleteDesc: "Möchten Sie diesen Eintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
    cancel: "Abbrechen", confirmDeleteBtn: "Ja, Löschen",
    campaignsTitle: "Marketingkampagnen-Verwaltung", campaignsDesc: "Gezielte Kampagnen zur Studierendenrekrutierung in 80+ Ländern.",
    campaignTitle: "Kampagnentitel", targetRegion: "Zielregion", targetCountry: "Zielland",
    budget: "Monatsbudget", reach: "Geschätzte Reichweite", dailyApps: "Bewerbungen / Tag",
    campaignType: "Kampagnentyp", globalRecruitment: "Globale Rekrutierung", scholarshipDrive: "Stipendienoffensive", stemFocus: "STEM-Fokus"
  },
  fr: {
    dashboard: "Tableau de Bord", overview: "Aperçu Général", universityProfile: "Profil de l'Université",
    programs: "Programmes d'Études", studentLeads: "Candidatures Étudiantes", analytics: "Analytiques",
    scholarships: "Bourses d'Études", campaigns: "Campagnes Marketing", settings: "Paramètres",
    totalLeads: "Total des Candidatures", acceptanceRate: "Taux d'Admission", topCountries: "Principaux Pays d'Origine",
    programDistribution: "Répartition des Programmes", addProgram: "+ Ajouter un Programme", addScholarship: "+ Ajouter une Bourse",
    addCampaign: "+ Créer une Campagne", edit: "Modifier", delete: "Supprimer", save: "Enregistrer",
    save31: "Enregistrer (31 Langues)", aiTranslate: "Traduction Auto IA en 31 Langues",
    statusOpen: "Ouvert", statusClosed: "Fermé", statusActive: "Actif", statusDraft: "Brouillon", statusEnded: "Terminé",
    statusAccepted: "Accepté", statusPending: "Soumis / En Attente", statusUnderReview: "En Cours d'Examen", statusRejected: "Refusé",
    searchStudent: "Rechercher par nom ou pays...", filterStatus: "Filtrer par statut", all: "Tous",
    confirmDeleteTitle: "Confirmer la Suppression", confirmDeleteDesc: "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
    cancel: "Annuler", confirmDeleteBtn: "Oui, Supprimer",
    campaignsTitle: "Gestion des Campagnes Marketing", campaignsDesc: "Menez des campagnes ciblées de recrutement dans 80+ pays.",
    campaignTitle: "Titre de la Campagne", targetRegion: "Région Cible", targetCountry: "Pays Cible",
    budget: "Budget Mensuel", reach: "Portée Estimée", dailyApps: "Candidatures / Jour",
    campaignType: "Type de Campagne", globalRecruitment: "Recrutement Global", scholarshipDrive: "Promotion de Bourses", stemFocus: "Focus STEM"
  },
  es: {
    dashboard: "Panel de la Universidad", overview: "Resumen General", universityProfile: "Perfil Institucional",
    programs: "Programas Académicos", studentLeads: "Solicitudes de Estudiantes", analytics: "Analíticas",
    scholarships: "Becas de Estudio", campaigns: "Campañas de Marketing", settings: "Configuración",
    totalLeads: "Total de Solicitudes", acceptanceRate: "Tasa de Admisión", topCountries: "Principales Países de Origen",
    programDistribution: "Distribución por Programa", addProgram: "+ Agregar Programa", addScholarship: "+ Agregar Beca",
    addCampaign: "+ Crear Campaña", edit: "Editar", delete: "Eliminar", save: "Guardar Cambios",
    save31: "Guardar (31 Idiomas)", aiTranslate: "Traducción Automática IA (31 Idiomas)",
    statusOpen: "Abierto", statusClosed: "Cerrado", statusActive: "Activo", statusDraft: "Borrador", statusEnded: "Finalizado",
    statusAccepted: "Aceptado", statusPending: "Enviado / Pendiente", statusUnderReview: "En Revisión", statusRejected: "Rechazado",
    searchStudent: "Buscar por nombre o país...", filterStatus: "Filtrar por estado", all: "Todos",
    confirmDeleteTitle: "Confirmar Eliminación", confirmDeleteDesc: "¿Está seguro de eliminar este elemento? Esta acción no se puede deshacer.",
    cancel: "Cancelar", confirmDeleteBtn: "Sí, Eliminar",
    campaignsTitle: "Gestión de Campañas de Marketing", campaignsDesc: "Ejecute campañas dirigidas de reclutamiento estudiantil en más de 80 países.",
    campaignTitle: "Título de la Campaña", targetRegion: "Región Objetivo", targetCountry: "País Objetivo",
    budget: "Presupuesto Mensual", reach: "Alcance Estimado", dailyApps: "Solicitudes / Día",
    campaignType: "Tipo de Campaña", globalRecruitment: "Reclutamiento Global", scholarshipDrive: "Impulso de Becas", stemFocus: "Enfoque STEM"
  },
  it: {
    dashboard: "Dashboard Università", overview: "Panoramica", universityProfile: "Profilo Università",
    programs: "Corsi di Studio", studentLeads: "Candidature Studenti", analytics: "Analitica",
    scholarships: "Borse di Studio", campaigns: "Campagne Marketing", settings: "Impostazioni",
    totalLeads: "Totale Candidature", acceptanceRate: "Tasso di Ammissione", topCountries: "Paesi di Provenienza Principali",
    programDistribution: "Distribuzione dei Corsi", addProgram: "+ Aggiungi Corso", addScholarship: "+ Aggiungi Borsa",
    addCampaign: "+ Crea Campagna", edit: "Modifica", delete: "Elimina", save: "Salva Modifiche",
    save31: "Salva (31 Lingue)", aiTranslate: "Traduzione Automatica IA (31 Lingue)",
    statusOpen: "Aperto", statusClosed: "Chiuso", statusActive: "Attivo", statusDraft: "Bozza", statusEnded: "Terminato",
    statusAccepted: "Accettato", statusPending: "Inviato / In Attesa", statusUnderReview: "In Valutazione", statusRejected: "Rifiutato",
    searchStudent: "Cerca nome o paese...", filterStatus: "Filtra per stato", all: "Tutti",
    confirmDeleteTitle: "Conferma Eliminazione", confirmDeleteDesc: "Sei sicuro di voler eliminare questo elemento? L'azione è irreversibile.",
    cancel: "Annulla", confirmDeleteBtn: "Sì, Elimina",
    campaignsTitle: "Gestione Campagne Marketing", campaignsDesc: "Avvia campagne mirate di reclutamento studenti in oltre 80 Paesi.",
    campaignTitle: "Titolo Campagna", targetRegion: "Regione Target", targetCountry: "Paese Target",
    budget: "Budget Mensile", reach: "Copertura Stimata", dailyApps: "Candidature / Giorno",
    campaignType: "Tipo Campagna", globalRecruitment: "Reclutamento Globale", scholarshipDrive: "Promozione Borse", stemFocus: "Focus STEM"
  },
  ar: {
    dashboard: "لوحة التحكم الجامعية", overview: "نظرة عامة", universityProfile: "الملف التعريفي للجامعة",
    programs: "البرامج الأكاديمية", studentLeads: "طلبات الطلاب", analytics: "التحليلات",
    scholarships: "المنح الدراسية", campaigns: "الحملات التسويقية", settings: "إعدادات البوابة",
    totalLeads: "إجمالي طلبات الطلاب", acceptanceRate: "نسبة القبول", topCountries: "أبرز دول الطلاب",
    programDistribution: "توزيع البرامج", addProgram: "+ إضافة برنامج جديد", addScholarship: "+ إضافة منحة جديدة",
    addCampaign: "+ إنشاء حملة جديدة", edit: "تعديل", delete: "حذف", save: "حفظ التغييرات",
    save31: "حفظ (31 لغة)", aiTranslate: "ترجمة آلیة بالذكاء الاصطناعي إلى 31 لغة",
    statusOpen: "مفتوح", statusClosed: "مغلق", statusActive: "نشط", statusDraft: "مسودة", statusEnded: "منتهي",
    statusAccepted: "مقبول", statusPending: "مُقدم / قيد الانتظار", statusUnderReview: "قيد المراجعة", statusRejected: "مرفوض",
    searchStudent: "البحث باسم الطالب أو الدولة...", filterStatus: "التصفية حسب الحالة", all: "الكل",
    confirmDeleteTitle: "تأكيد الحذف", confirmDeleteDesc: "هل أنت تأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء", confirmDeleteBtn: "نعم، احذف",
    campaignsTitle: "إدارة الحملات التسويقية", campaignsDesc: "إطلاق حملات تسويقية مستهدفة لجذب الطلاب في أكثر من 80 دولة.",
    campaignTitle: "عنوان الحملة", targetRegion: "المنطقة المستهدفة", targetCountry: "الدولة المستهدفة",
    budget: "الميزانية الشهرية", reach: "الوصول المتوقع", dailyApps: "الطلبات اليومية",
    campaignType: "نوع الحملة", globalRecruitment: "استقطاب عالمي", scholarshipDrive: "ترويج المنح", stemFocus: "مسار العلوم والتقنية STEM"
  },
  zh: {
    dashboard: "高校管理面板", overview: "概览", universityProfile: "院校资料",
    programs: "专业课程", studentLeads: "学生申请意向", analytics: "数据分析",
    scholarships: "奖学金项目", campaigns: "招生营销活动", settings: "门户设置",
    totalLeads: "总申请学生数", acceptanceRate: "录取率", topCountries: "主要学生来源国",
    programDistribution: "专业分布", addProgram: "+ 添加新专业", addScholarship: "+ 添加新奖学金",
    addCampaign: "+ 创建新活动", edit: "编辑", delete: "删除", save: "保存更改",
    save31: "保存 (31种语言)", aiTranslate: "AI自动翻译至31种语言",
    statusOpen: "开放中", statusClosed: "已截止", statusActive: "进行中", statusDraft: "草稿", statusEnded: "已结束",
    statusAccepted: "已录取", statusPending: "已提交/待处理", statusUnderReview: "审核中", statusRejected: "未录取",
    searchStudent: "按姓名或国家搜索...", filterStatus: "按状态筛选", all: "全部",
    confirmDeleteTitle: "确认删除", confirmDeleteDesc: "确定要删除此项目吗？此操作无法撤销。",
    cancel: "取消", confirmDeleteBtn: "确认删除",
    campaignsTitle: "招生营销活动管理", campaignsDesc: "面向全球80多个国家展开精准学生招募活动。",
    campaignTitle: "活动名称", targetRegion: "目标地区", targetCountry: "目标国家",
    budget: "月度预算", reach: "预计覆盖人数", dailyApps: "每日申请量",
    campaignType: "活动类型", globalRecruitment: "全球招生", scholarshipDrive: "奖学金推广", stemFocus: "STEM理工类专场"
  }
};

const mainBundles = {
  en, az, tr, ru, de, fr, es, it, ar, zh
};

// Aliases for all 31 supported codes to guarantee full translation mapping
const ALL_CODES = [
  'en', 'az', 'tr', 'ru', 'de', 'fr', 'es', 'it', 'ar', 'zh',
  'pt', 'nl', 'se', 'no', 'fi', 'dk', 'gr', 'hu', 'cz', 'ro',
  'bg', 'hr', 'sk', 'ua', 'ge', 'am', 'kz', 'uz', 'jp', 'kr'
];

// ── Instructor Portal Translations (31 Languages) ─────────────────────────────
const instructorTranslations = {
  en: {
    portal: "Instructor Portal", signIn: "Sign In as Instructor", register: "Become an Instructor",
    dashboard: "Dashboard", myCourses: "My Courses", addCourse: "+ Add New Course",
    students: "My Students", analytics: "Analytics", settings: "Settings", profile: "My Profile",
    overview: "Overview", totalCourses: "Total Courses", publishedCourses: "Published Courses",
    totalStudents: "Total Students", totalRevenue: "Total Revenue", avgRating: "Avg. Rating",
    courseTitle: "Course Title", description: "Description", shortDesc: "Short Description",
    whatLearn: "What You'll Learn", requirements: "Requirements", category: "Category",
    subCategory: "Sub-Category", tags: "Tags", language: "Language", level: "Level",
    price: "Price", discountPrice: "Discount Price", currency: "Currency",
    isFree: "Free Course", thumbnail: "Thumbnail URL", previewVideo: "Preview Video URL",
    beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", allLevels: "All Levels",
    sections: "Course Sections", addSection: "+ Add Section", addLecture: "+ Add Lecture",
    lectureTitle: "Lecture Title", lectureVideo: "Video URL", lectureDuration: "Duration (min)",
    isFreePreview: "Free Preview", publish: "Publish", unpublish: "Unpublish", edit: "Edit",
    delete: "Delete", save: "Save Changes", cancel: "Cancel", create: "Create Course",
    confirmDelete: "Are you sure you want to delete this course?",
    loginTitle: "Instructor Login", loginSubtitle: "Manage your courses and students",
    emailPlaceholder: "Your email address", passwordPlaceholder: "Your password",
    noAccount: "Don't have an instructor account?", signUp: "Register here",
    displayName: "Display Name", expertise: "Area of Expertise", bio: "Biography",
    website: "Website URL", linkedin: "LinkedIn", youtube: "YouTube Channel",
    enrollments: "Enrollments", revenue: "Revenue", rating: "Rating",
    studentName: "Student Name", studentEmail: "Email", enrolledAt: "Enrolled At",
    progress: "Progress", status: "Status", aiTranslate: "AI Auto-Translate (31 Languages)",
    published: "Published", draft: "Draft", featured: "Featured",
    noCourses: "No courses yet. Create your first course!", noStudents: "No students enrolled yet."
  },
  az: {
    portal: "Müəllim Portalı", signIn: "Müəllim kimi daxil ol", register: "Müəllim ol",
    dashboard: "İdarəetmə Paneli", myCourses: "Mənim Kurslarım", addCourse: "+ Yeni Kurs Əlavə Et",
    students: "Tələbələrim", analytics: "Analitika", settings: "Parametrlər", profile: "Profilim",
    overview: "İcmal", totalCourses: "Ümumi Kurslar", publishedCourses: "Yayımlanmış Kurslar",
    totalStudents: "Ümumi Tələbələr", totalRevenue: "Ümumi Gəlir", avgRating: "Ort. Reytinq",
    courseTitle: "Kursun Adı", description: "Təsvir", shortDesc: "Qısa Təsvir",
    whatLearn: "Nə Öyrənəcəksiniz", requirements: "Tələblər", category: "Kateqoriya",
    subCategory: "Alt Kateqoriya", tags: "Etiketlər", language: "Dil", level: "Səviyyə",
    price: "Qiymət", discountPrice: "Endirimli Qiymət", currency: "Valyuta",
    isFree: "Pulsuz Kurs", thumbnail: "Thumbnail URL", previewVideo: "Önizləmə Video URL",
    beginner: "Başlanğıc", intermediate: "Orta", advanced: "İrəliləmiş", allLevels: "Bütün Səviyyələr",
    sections: "Kurs Bölmələri", addSection: "+ Bölmə Əlavə Et", addLecture: "+ Mühazirə Əlavə Et",
    lectureTitle: "Mühazirə Başlığı", lectureVideo: "Video URL", lectureDuration: "Müddət (dəq)",
    isFreePreview: "Pulsuz Baxış", publish: "Yayımla", unpublish: "Geri Çək", edit: "Redaktə Et",
    delete: "Sil", save: "Dəyişiklikləri Saxla", cancel: "Ləğv Et", create: "Kurs Yarat",
    confirmDelete: "Bu kursu silmək istədiyinizə əminsiniz?",
    loginTitle: "Müəllim Girişi", loginSubtitle: "Kurslarınızı və tələbələrinizi idarə edin",
    emailPlaceholder: "E-poçt ünvanınız", passwordPlaceholder: "Şifrəniz",
    noAccount: "Müəllim hesabınız yoxdur?", signUp: "Buradan qeydiyyatdan keçin",
    displayName: "Göstərilən Ad", expertise: "İxtisas Sahəsi", bio: "Bioqrafiya",
    website: "Vebsayt URL", linkedin: "LinkedIn", youtube: "YouTube Kanalı",
    enrollments: "Qeydiyyatlar", revenue: "Gəlir", rating: "Reytinq",
    studentName: "Tələbə Adı", studentEmail: "E-poçt", enrolledAt: "Qeydiyyat Tarixi",
    progress: "İrəliləyiş", status: "Status", aiTranslate: "AI Avtomatik Tərcümə (31 Dil)",
    published: "Yayımlanmış", draft: "Qaralama", featured: "Seçilmiş",
    noCourses: "Hələ kurs yoxdur. İlk kursunuzu yaradın!", noStudents: "Hələ tələbə qeydiyyatdan keçməyib."
  },
  tr: {
    portal: "Eğitmen Portalı", signIn: "Eğitmen Olarak Giriş Yap", register: "Eğitmen Ol",
    dashboard: "Kontrol Paneli", myCourses: "Kurslarım", addCourse: "+ Yeni Kurs Ekle",
    students: "Öğrencilerim", analytics: "Analitik", settings: "Ayarlar", profile: "Profilim",
    overview: "Genel Bakış", totalCourses: "Toplam Kurs", publishedCourses: "Yayınlanan Kurslar",
    totalStudents: "Toplam Öğrenci", totalRevenue: "Toplam Gelir", avgRating: "Ort. Puan",
    courseTitle: "Kurs Başlığı", description: "Açıklama", shortDesc: "Kısa Açıklama",
    whatLearn: "Ne Öğreneceksiniz", requirements: "Gereksinimler", category: "Kategori",
    subCategory: "Alt Kategori", tags: "Etiketler", language: "Dil", level: "Seviye",
    price: "Fiyat", discountPrice: "İndirimli Fiyat", currency: "Para Birimi",
    isFree: "Ücretsiz Kurs", thumbnail: "Kapak Görseli URL", previewVideo: "Önizleme Video URL",
    beginner: "Başlangıç", intermediate: "Orta", advanced: "İleri", allLevels: "Tüm Seviyeler",
    sections: "Kurs Bölümleri", addSection: "+ Bölüm Ekle", addLecture: "+ Ders Ekle",
    lectureTitle: "Ders Başlığı", lectureVideo: "Video URL", lectureDuration: "Süre (dk)",
    isFreePreview: "Ücretsiz Önizleme", publish: "Yayınla", unpublish: "Geri Çek", edit: "Düzenle",
    delete: "Sil", save: "Değişiklikleri Kaydet", cancel: "İptal", create: "Kurs Oluştur",
    confirmDelete: "Bu kursu silmek istediğinizden emin misiniz?",
    loginTitle: "Eğitmen Girişi", loginSubtitle: "Kurslarınızı ve öğrencilerinizi yönetin",
    emailPlaceholder: "E-posta adresiniz", passwordPlaceholder: "Şifreniz",
    noAccount: "Eğitmen hesabınız yok mu?", signUp: "Buradan kayıt olun",
    displayName: "Görünen Ad", expertise: "Uzmanlık Alanı", bio: "Biyografi",
    website: "Web Sitesi", linkedin: "LinkedIn", youtube: "YouTube Kanalı",
    enrollments: "Kayıtlar", revenue: "Gelir", rating: "Puan",
    studentName: "Öğrenci Adı", studentEmail: "E-posta", enrolledAt: "Kayıt Tarihi",
    progress: "İlerleme", status: "Durum", aiTranslate: "AI Otomatik Çeviri (31 Dil)",
    published: "Yayınlandı", draft: "Taslak", featured: "Öne Çıkan",
    noCourses: "Henüz kurs yok. İlk kursunuzu oluşturun!", noStudents: "Henüz kayıtlı öğrenci yok."
  },
  ru: {
    portal: "Портал Преподавателя", signIn: "Войти как преподаватель", register: "Стать преподавателем",
    dashboard: "Панель управления", myCourses: "Мои курсы", addCourse: "+ Добавить курс",
    students: "Мои студенты", analytics: "Аналитика", settings: "Настройки", profile: "Мой профиль",
    overview: "Обзор", totalCourses: "Всего курсов", publishedCourses: "Опубликованные",
    totalStudents: "Всего студентов", totalRevenue: "Общий доход", avgRating: "Ср. рейтинг",
    courseTitle: "Название курса", description: "Описание", shortDesc: "Краткое описание",
    whatLearn: "Что вы узнаете", requirements: "Требования", category: "Категория",
    subCategory: "Подкатегория", tags: "Теги", language: "Язык", level: "Уровень",
    price: "Цена", discountPrice: "Цена со скидкой", currency: "Валюта",
    isFree: "Бесплатный курс", thumbnail: "URL обложки", previewVideo: "URL превью видео",
    beginner: "Начинающий", intermediate: "Средний", advanced: "Продвинутый", allLevels: "Все уровни",
    sections: "Разделы курса", addSection: "+ Добавить раздел", addLecture: "+ Добавить лекцию",
    lectureTitle: "Название лекции", lectureVideo: "URL видео", lectureDuration: "Длительность (мин)",
    isFreePreview: "Бесплатный просмотр", publish: "Опубликовать", unpublish: "Снять с публикации",
    edit: "Редактировать", delete: "Удалить", save: "Сохранить", cancel: "Отмена", create: "Создать курс",
    confirmDelete: "Вы уверены, что хотите удалить этот курс?",
    loginTitle: "Вход для преподавателей", loginSubtitle: "Управляйте курсами и студентами",
    emailPlaceholder: "Ваш email", passwordPlaceholder: "Ваш пароль",
    noAccount: "Нет аккаунта преподавателя?", signUp: "Зарегистрируйтесь здесь",
    displayName: "Отображаемое имя", expertise: "Область экспертизы", bio: "Биография",
    website: "Сайт", linkedin: "LinkedIn", youtube: "YouTube канал",
    enrollments: "Записи", revenue: "Доход", rating: "Рейтинг",
    studentName: "Имя студента", studentEmail: "Email", enrolledAt: "Дата записи",
    progress: "Прогресс", status: "Статус", aiTranslate: "AI Автоперевод (31 язык)",
    published: "Опубликован", draft: "Черновик", featured: "Рекомендуемый",
    noCourses: "Курсов пока нет. Создайте первый курс!", noStudents: "Студентов пока нет."
  },
  de: {
    portal: "Dozenten-Portal", signIn: "Als Dozent anmelden", register: "Dozent werden",
    dashboard: "Dashboard", myCourses: "Meine Kurse", addCourse: "+ Neuen Kurs hinzufügen",
    students: "Meine Studenten", analytics: "Analytik", settings: "Einstellungen", profile: "Mein Profil",
    overview: "Übersicht", totalCourses: "Kurse gesamt", publishedCourses: "Veröffentlicht",
    totalStudents: "Studenten gesamt", totalRevenue: "Gesamtumsatz", avgRating: "Ø Bewertung",
    courseTitle: "Kurstitel", description: "Beschreibung", shortDesc: "Kurzbeschreibung",
    whatLearn: "Was Sie lernen werden", requirements: "Anforderungen", category: "Kategorie",
    level: "Niveau", price: "Preis", discountPrice: "Rabattpreis", currency: "Währung",
    isFree: "Kostenloser Kurs", thumbnail: "Thumbnail-URL", previewVideo: "Vorschau-Video-URL",
    beginner: "Anfänger", intermediate: "Mittelstufe", advanced: "Fortgeschritten", allLevels: "Alle Niveaus",
    sections: "Kursabschnitte", addSection: "+ Abschnitt hinzufügen", addLecture: "+ Vorlesung hinzufügen",
    publish: "Veröffentlichen", unpublish: "Zurückziehen", edit: "Bearbeiten",
    delete: "Löschen", save: "Änderungen speichern", cancel: "Abbrechen", create: "Kurs erstellen",
    loginTitle: "Dozenten-Login", loginSubtitle: "Verwalten Sie Ihre Kurse und Studenten",
    published: "Veröffentlicht", draft: "Entwurf", noCourses: "Noch keine Kurse. Erstellen Sie Ihren ersten!"
  },
  fr: {
    portal: "Portail Formateur", signIn: "Se connecter comme formateur", register: "Devenir formateur",
    dashboard: "Tableau de bord", myCourses: "Mes cours", addCourse: "+ Ajouter un cours",
    students: "Mes étudiants", analytics: "Analytique", settings: "Paramètres", profile: "Mon profil",
    overview: "Vue d'ensemble", totalCourses: "Total des cours", publishedCourses: "Publiés",
    totalStudents: "Total étudiants", totalRevenue: "Revenus totaux", avgRating: "Note moy.",
    courseTitle: "Titre du cours", description: "Description", shortDesc: "Description courte",
    whatLearn: "Ce que vous apprendrez", requirements: "Prérequis", category: "Catégorie",
    level: "Niveau", price: "Prix", discountPrice: "Prix réduit", currency: "Devise",
    isFree: "Cours gratuit", publish: "Publier", unpublish: "Dépublier", edit: "Modifier",
    delete: "Supprimer", save: "Enregistrer", cancel: "Annuler", create: "Créer le cours",
    loginTitle: "Connexion formateur", loginSubtitle: "Gérez vos cours et étudiants",
    published: "Publié", draft: "Brouillon", noCourses: "Pas encore de cours. Créez votre premier!"
  },
  es: {
    portal: "Portal del Instructor", signIn: "Iniciar sesión como instructor", register: "Conviértete en instructor",
    dashboard: "Panel de control", myCourses: "Mis cursos", addCourse: "+ Agregar nuevo curso",
    students: "Mis estudiantes", analytics: "Analítica", settings: "Configuración", profile: "Mi perfil",
    overview: "Resumen", totalCourses: "Total de cursos", publishedCourses: "Publicados",
    totalStudents: "Total estudiantes", totalRevenue: "Ingresos totales", avgRating: "Calificación prom.",
    courseTitle: "Título del curso", description: "Descripción", shortDesc: "Descripción breve",
    level: "Nivel", price: "Precio", discountPrice: "Precio con descuento",
    isFree: "Curso gratuito", publish: "Publicar", unpublish: "Despublicar", edit: "Editar",
    delete: "Eliminar", save: "Guardar cambios", cancel: "Cancelar", create: "Crear curso",
    loginTitle: "Inicio de sesión instructor", loginSubtitle: "Gestiona tus cursos y estudiantes",
    published: "Publicado", draft: "Borrador", noCourses: "Aún no hay cursos. ¡Crea el primero!"
  },
  it: {
    portal: "Portale Istruttore", signIn: "Accedi come istruttore", register: "Diventa istruttore",
    dashboard: "Dashboard", myCourses: "I miei corsi", addCourse: "+ Aggiungi nuovo corso",
    students: "I miei studenti", analytics: "Analisi", settings: "Impostazioni", profile: "Il mio profilo",
    overview: "Panoramica", totalCourses: "Corsi totali", publishedCourses: "Pubblicati",
    totalStudents: "Studenti totali", totalRevenue: "Entrate totali", avgRating: "Valutazione media",
    courseTitle: "Titolo del corso", price: "Prezzo", discountPrice: "Prezzo scontato",
    isFree: "Corso gratuito", publish: "Pubblica", edit: "Modifica", delete: "Elimina",
    save: "Salva modifiche", cancel: "Annulla", create: "Crea corso",
    loginTitle: "Accesso istruttore", published: "Pubblicato", draft: "Bozza",
    noCourses: "Nessun corso ancora. Crea il tuo primo!"
  },
  ar: {
    portal: "بوابة المدرب", signIn: "تسجيل الدخول كمدرب", register: "كن مدرباً",
    dashboard: "لوحة التحكم", myCourses: "دوراتي", addCourse: "+ إضافة دورة جديدة",
    students: "طلابي", analytics: "التحليلات", settings: "الإعدادات", profile: "ملفي الشخصي",
    overview: "نظرة عامة", totalCourses: "إجمالي الدورات", publishedCourses: "المنشورة",
    totalStudents: "إجمالي الطلاب", totalRevenue: "إجمالي الإيرادات", avgRating: "متوسط التقييم",
    courseTitle: "عنوان الدورة", price: "السعر", discountPrice: "السعر المخفض",
    isFree: "دورة مجانية", publish: "نشر", edit: "تعديل", delete: "حذف",
    save: "حفظ التغييرات", cancel: "إلغاء", create: "إنشاء دورة",
    loginTitle: "تسجيل دخول المدرب", published: "منشور", draft: "مسودة",
    noCourses: "لا توجد دورات بعد. أنشئ دورتك الأولى!"
  },
  zh: {
    portal: "讲师门户", signIn: "以讲师身份登录", register: "成为讲师",
    dashboard: "控制台", myCourses: "我的课程", addCourse: "+ 添加新课程",
    students: "我的学生", analytics: "分析", settings: "设置", profile: "我的资料",
    overview: "概览", totalCourses: "总课程数", publishedCourses: "已发布",
    totalStudents: "总学生数", totalRevenue: "总收入", avgRating: "平均评分",
    courseTitle: "课程标题", price: "价格", discountPrice: "折扣价",
    isFree: "免费课程", publish: "发布", edit: "编辑", delete: "删除",
    save: "保存更改", cancel: "取消", create: "创建课程",
    loginTitle: "讲师登录", published: "已发布", draft: "草稿",
    noCourses: "暂无课程，创建您的第一门课程！"
  }
};

const navTalentsMap = {
  az: "Gizli Bacarıqlar",
  en: "Hidden Talents",
  tr: "Gizli Yetenekler",
  ru: "Таланты",
  de: "Talente",
  fr: "Talents",
  es: "Talentos",
  it: "Talenti",
  ar: "المواهب",
  zh: "隐藏才能",
  pt: "Talentos",
  nl: "Talenten",
  pl: "Talenty",
  se: "Talanger",
  sv: "Talanger",
  fi: "Kyvyt",
  no: "Talenter",
  da: "Talenter",
  dk: "Talenter",
  cs: "Talenty",
  cz: "Talenty",
  hu: "Tehetségek",
  ro: "Talente",
  el: "Ταλέντα",
  gr: "Ταλέντα",
  hi: "प्रतिभाएं",
  id: "Bakat",
  th: "พรสวรรค์",
  vi: "Tài năng",
  fa: "استعدادها",
  uk: "Таланти",
  ua: "Таланти",
  bg: "Таланти",
  sk: "Talenty",
  ja: "才能・アイデア",
  jp: "才能・アイデア",
  ko: "숨은 재능",
  kr: "숨은 재능"
};

const coursesTranslations = {
  az: {
    platform: "Online Kurslar Platforması",
    heroTitle: "Dünya üzrə Mütəxəssislərdən",
    heroAccent: "Öyrən",
    heroDesc: "Yüzlərlə ekspert tərəfindən hazırlanmış kursları kəşf et, praktiki bacarıqlar əldə et və qlobal karyeranı inkişaf etdir.",
    searchPlaceholder: "Ad, mövzu və ya açar söz axtar...",
    allCourses: "Bütün Kurslar",
    available: "kurs mövcuddur",
    notFound: "Kurs tapılmadı",
    notFoundDesc: "Axtarış meyarlarına uyğun kurs tapılmadı. Filtrləri dəyişdirin.",
    free: "Ödənişsiz",
    freeCourse: "Ödənişsiz Kurs",
    students: "tələbə",
    instructorBy: "Müəllif:",
    enrollFree: "İndi Qoşul (Ödənişsiz)",
    buyNow: "Kursu Al",
    includes: "Bu kursa daxildir:",
    videoLectures: "video dərs",
    minutesDuration: "dəqiqə ümumi müddət",
    accessDevices: "Mobil və kompüterdən giriş",
    certificate: "Bitirmə sertifikatı",
    whatYouLearn: "Nələr Öyrənəcəksiniz",
    content: "Kursun Məzmunu",
    section: "Bölmə",
    lectures: "dərs",
    freePreview: "Ödənişsiz Baxış",
    min: "dəq",
    watchVideo: "Videoya Bax",
    description: "Açıqlama",
    requirements: "Tələblər"
  },
  en: {
    platform: "Online Courses Platform",
    heroTitle: "Learn From Global",
    heroAccent: "Experts",
    heroDesc: "Explore hundreds of expert-led video courses, gain practical skills, and boost your global career.",
    searchPlaceholder: "Search by title, topic, or keyword...",
    allCourses: "All Courses",
    available: "courses available",
    notFound: "No Courses Found",
    notFoundDesc: "We couldn't find any courses matching your criteria. Try adjusting your filters.",
    free: "Free",
    freeCourse: "Free Course",
    students: "students",
    instructorBy: "Instructor:",
    enrollFree: "Enroll Now (Free)",
    buyNow: "Buy Course Now",
    includes: "This course includes:",
    videoLectures: "video lectures",
    minutesDuration: "minutes total duration",
    accessDevices: "Access on mobile and TV",
    certificate: "Certificate of completion",
    whatYouLearn: "What You'll Learn",
    content: "Course Content",
    section: "Section",
    lectures: "lectures",
    freePreview: "Free Preview",
    min: "min",
    watchVideo: "Watch Video",
    description: "Description",
    requirements: "Requirements"
  },
  tr: {
    platform: "Online Kurslar Platformu",
    heroTitle: "Dünya Çapında Uzmanlardan",
    heroAccent: "Öğrenin",
    heroDesc: "Yüzlerce uzman liderliğindeki video kursu keşfedin, pratik beceriler kazanın ve küresel kariyerinizi geliştirin.",
    searchPlaceholder: "Başlık, konu veya anahtar kelime arayın...",
    allCourses: "Tüm Kurslar",
    available: "kurs mevcut",
    notFound: "Kurs Bulunamadı",
    notFoundDesc: "Kriterlerinize uygun kurs bulunamadı. Lütfen filtreleri değiştirin.",
    free: "Ücretsiz",
    freeCourse: "Ücretsiz Kurs",
    students: "öğrenci",
    instructorBy: "Eğitmen:",
    enrollFree: "Hemen Katıl (Ücretsiz)",
    buyNow: "Kursu Satın Al",
    includes: "Bu kurs şunları içerir:",
    videoLectures: "video ders",
    minutesDuration: "dakika toplam süre",
    accessDevices: "Mobil ve bilgisayardan erişim",
    certificate: "Bitirme sertifikası",
    whatYouLearn: "Neler Öğreneceksiniz",
    content: "Kurs İçeriği",
    section: "Bölüm",
    lectures: "ders",
    freePreview: "Ücretsiz Önizleme",
    min: "dk",
    watchVideo: "Videoyu İzle",
    description: "Açıklama",
    requirements: "Gereksinimler"
  },
  ru: {
    platform: "Платформа Онлайн Курсов",
    heroTitle: "Обучайтесь у Мировых",
    heroAccent: "Экспертов",
    heroDesc: "Изучайте сотни курсов от ведущих экспертов, получайте практические навыки и развивайте свою карьеру.",
    searchPlaceholder: "Поиск по названию, теме или ключевому слову...",
    allCourses: "Все Курсы",
    available: "курсов доступно",
    notFound: "Курсы не найдены",
    notFoundDesc: "По вашему запросу курсов не найдено. Попробуйте изменить фильтры.",
    free: "Бесплатно",
    freeCourse: "Бесплатный Курс",
    students: "студентов",
    instructorBy: "Преподаватель:",
    enrollFree: "Записаться (Бесплатно)",
    buyNow: "Купить Курс",
    includes: "Этот курс включает:",
    videoLectures: "видео лекций",
    minutesDuration: "минут общая длительность",
    accessDevices: "Доступ на мобильных и ПК",
    certificate: "Сертификат об окончании",
    whatYouLearn: "Чему вы научитесь",
    content: "Содержание Курса",
    section: "Раздел",
    lectures: "лекций",
    freePreview: "Бесплатный Просмотр",
    min: "мин",
    watchVideo: "Смотреть Видео",
    description: "Описание",
    requirements: "Требования"
  }
};

export function buildAllResourceBundles() {
  const resources = {};

  ALL_CODES.forEach(code => {
    const baseDict = mainBundles[code] || mainBundles[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en'] || mainBundles.en;
    const pDict = portalTranslations[code] 
      || portalTranslations[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en'] 
      || portalTranslations.en;
    const iDict = instructorTranslations[code]
      || instructorTranslations[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en']
      || instructorTranslations.en;
    const tDict = talentsTranslations[code]
      || talentsTranslations[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en']
      || talentsTranslations.en;
    const sDict = superAdminTranslations[code]
      || superAdminTranslations[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en']
      || superAdminTranslations.en;

    resources[code] = {
      translation: {
        ...en,
        ...baseDict,
        nav: {
          ...(en.nav || {}),
          ...(baseDict.nav || {}),
          talents: navTalentsMap[code] || "Talents"
        },
        portal: {
          ...(baseDict.portal || {}),
          ...pDict
        },
        instructor: {
          ...iDict
        },
        courses: {
          ...(coursesTranslations.en || {}),
          ...(coursesTranslations[code] || coursesTranslations[code === 'ge' || code === 'ua' || code === 'am' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en'] || {})
        },
        superAdmin: {
          ...(superAdminTranslations.en || {}),
          ...sDict
        },
        talents: {
          ...(talentsTranslations.en || {}),
          ...tDict,
          skillLevels: {
            ...(talentsTranslations.en?.skillLevels || {}),
            ...(tDict.skillLevels || {})
          },
          supportList: {
            ...(talentsTranslations.en?.supportList || {}),
            ...(tDict.supportList || {})
          },
          teamStatuses: {
            ...(talentsTranslations.en?.teamStatuses || {}),
            ...(tDict.teamStatuses || {})
          },
          inspirational: {
            ...(talentsTranslations.en?.inspirational || {}),
            ...(tDict.inspirational || {})
          },
          dynamicAi: {
            ...(talentsTranslations.en?.dynamicAi || {}),
            ...(tDict.dynamicAi || {})
          },
          general: {
            ...(talentsTranslations.en?.general || {}),
            ...(tDict.general || {})
          }
        }
      }
    };
  });

  return resources;
}

