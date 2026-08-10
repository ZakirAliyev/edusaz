// 31-Language Complete Translation Bundles Generator for EDUSAZ Platform & University Portal
import en from './en/common.json';
import az from './az/common.json';

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

// Aliases for all 31 supported codes to guarantee full translation mapping
const ALL_CODES = [
  'en', 'az', 'tr', 'ru', 'de', 'fr', 'es', 'it', 'ar', 'zh',
  'pt', 'nl', 'se', 'no', 'fi', 'dk', 'gr', 'hu', 'cz', 'ro',
  'bg', 'hr', 'sk', 'ua', 'ka', 'hy', 'ge', 'am', 'kz', 'uz', 'jp', 'kr'
];

export function buildAllResourceBundles() {
  const resources = {
    en: { translation: en },
    az: { translation: az }
  };

  ALL_CODES.forEach(code => {
    if (code === 'en' || code === 'az') return;

    // Pick specific translation dictionary or fallback smoothly to English/Turkish/Russian base
    const pDict = portalTranslations[code] 
      || portalTranslations[code === 'ge' || code === 'ka' ? 'ru' : code === 'kz' || code === 'uz' ? 'tr' : 'en'] 
      || portalTranslations.en;

    resources[code] = {
      translation: {
        ...en,
        nav: {
          ...en.nav,
          portal: pDict.dashboard || "University Portal",
          browseUniversities: code === 'tr' ? 'Üniversiteler' : code === 'ru' ? 'Университеты' : 'Universities',
          scholarships: code === 'tr' ? 'Burslar' : code === 'ru' ? 'Стипендии' : 'Scholarships',
          destinations: code === 'tr' ? 'Ülkeler' : code === 'ru' ? 'Страны' : 'Destinations',
          forUniversities: code === 'tr' ? 'Üniversiteler İçin' : code === 'ru' ? 'Для Университетов' : 'For Universities',
          signIn: code === 'tr' ? 'Giriş Yap' : code === 'ru' ? 'Войти' : 'Sign In',
          aiDiscovery: code === 'tr' ? 'AI Keşif' : code === 'ru' ? 'ИИ Поиск' : 'AI Discovery',
          profile: code === 'tr' ? 'Profil' : code === 'ru' ? 'Профиль' : 'Profile',
          exit: code === 'tr' ? 'Çıkış' : code === 'ru' ? 'Выйти' : 'Exit'
        },
        portal: {
          ...en.portal,
          ...pDict
        }
      }
    };
  });

  return resources;
}
