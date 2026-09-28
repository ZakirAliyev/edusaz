export const LANGUAGES = [
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

export const PRESET_FLAGS = [
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
  { flag: '🌐', name: 'Digər / Qlobal' },
];

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=60';

export const ROLES = [
  { value: 'UniversityAdmin', label: 'Universitet admini', tone: 'brand' },
  { value: 'Teacher', label: 'Müəllim', tone: 'success' },
  { value: 'CourseCenter', label: 'Tədris mərkəzi', tone: 'warning' },
  { value: 'Student', label: 'Tələbə', tone: 'info' },
  { value: 'SuperAdmin', label: 'SuperAdmin', tone: 'danger' },
];
export const CREATABLE_ROLES = ROLES.filter((r) => r.value !== 'SuperAdmin');
export const roleMeta = (role) =>
  ROLES.find((r) => r.value.toLowerCase() === (role || '').toLowerCase()) || { value: role, label: role || 'Tələbə', tone: 'info' };

export const UNIVERSITY_STATUSES = [
  { value: 'Active', label: 'Aktiv', tone: 'success' },
  { value: 'Pending', label: 'Gözləmədə', tone: 'warning' },
];

export const DEGREES = [
  { value: 'Bakalavr', label: 'Bakalavr (Bachelor)' },
  { value: 'Magistr', label: 'Magistr (Master)' },
  { value: 'Doktorantura', label: 'Doktorantura (PhD)' },
  { value: 'Assosiat', label: 'Assosiat (Subbakalavr)' },
  { value: 'Sertifikat', label: 'Diplom / Sertifikat' },
  { value: 'Hazırlıq', label: 'Hazırlıq (Foundation)' },
];

export const TEACHING_LANGUAGES = [
  'İngilis dili', 'Azərbaycan dili', 'Türk dili', 'Rus dili', 'Alman dili', 'Fransız dili',
  'İspan dili', 'İtalyan dili', 'Çin dili', 'İngilis və Azərbaycan dili', 'İngilis və Türk dili',
  'İngilis və Alman dili', 'İngilis və Rus dili',
].map((v) => ({ value: v, label: v }));

export const DURATION_GROUPS = [
  {
    label: 'İl',
    options: [
      { value: '1 il', label: '1 il' },
      { value: '1.5 il', label: '1.5 il' },
      { value: '2 il', label: '2 il' },
      { value: '3 il', label: '3 il' },
      { value: '4 il', label: '4 il' },
      { value: '5 il', label: '5 il' },
      { value: '6 il', label: '6 il' },
    ],
  },
  {
    label: 'Ay',
    options: [
      { value: '3 ay', label: '3 ay' },
      { value: '6 ay', label: '6 ay' },
      { value: '9 ay', label: '9 ay' },
      { value: '12 ay', label: '12 ay' },
      { value: '18 ay', label: '18 ay' },
      { value: '24 ay', label: '24 ay' },
    ],
  },
];

export const CURRENCIES = [
  { value: 'AZN', label: '₼ AZN' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'TRY', label: '₺ TRY' },
  { value: 'PLN', label: 'zł PLN' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
];

export const TUITION_PERIODS = [
  { value: '/ il', label: 'illik' },
  { value: '/ semestr', label: 'semestrlik' },
  { value: '/ ay', label: 'aylıq' },
  { value: '/ ümumi proqram', label: 'bütün proqram' },
];

export const SCHOLARSHIP_COVERAGE_GROUPS = [
  {
    label: 'Tam maliyyələşmə',
    options: [
      'Tam Təqaüd (100% Təhsil + Aylıq Yaşayış Xərcləri + Yol)',
      '100% Təhsil Haqqı Təqaüdü (Full Tuition Waiver)',
    ],
  },
  {
    label: 'Hissəvi güzəşt',
    options: [
      '80% - 90% Yüksək Təhsil Güzəşti',
      '75% Təhsil Haqqı Təqaüdü',
      '50% Təhsil Haqqı Təqaüdü (Yarımtəqaüd)',
      '30% - 40% Təhsil Haqqı Güzəşti',
      '25% Təhsil Haqqı Təqaüdü',
      '10% - 20% İlkin Akademik Endirim',
    ],
  },
  {
    label: 'Yaşayış və tədqiqat qrantları',
    options: [
      'Aylıq Yaşayış Təqaüdü (Stipend €800 - €1,500/ay)',
      'Yalnız Yol, Yaşayış və Tibbi Sığorta Təminatı',
      'Tədqiqat Qrantı və Layihə Təqaüdü (Research Grant)',
      'Xüsusi İstedad, İdman və Yaradıcılıq Təqaüdü',
    ],
  },
].map((g) => ({ label: g.label, options: g.options.map((v) => ({ value: v, label: v })) }));

export const SCHOLARSHIP_ELIGIBILITY = [
  'Bütün Təhsil Pillələri (Bakalavr, Magistr, PhD)',
  'Yalnız Bakalavr (Undergraduate)',
  'Yalnız Magistratura (Master / Post-graduate)',
  'Yalnız Doktorantura (PhD / Research)',
  'Bakalavr və Magistratura',
  'Magistr və Doktorantura',
  'Tədqiqatçılar və Post-Doktorantura',
].map((v) => ({ value: v, label: v }));

export const SCHOLARSHIP_PLACES = [
  'Limitsiz (Meyarları ödəyən hər kəs)', '10 yer', '25 yer', '50 yer', '100 yer', '200+ yer',
].map((v) => ({ value: v, label: v }));

export const SCHOLARSHIP_STATUSES = [
  { value: 'Aktiv', label: 'Aktiv — müraciət açıqdır', short: 'Aktiv', tone: 'success' },
  { value: 'Gözləmədə', label: 'Gözləmədə — tezliklə', short: 'Gözləmədə', tone: 'warning' },
  { value: 'Başa Çatıb', label: 'Başa çatıb — qapalı', short: 'Başa çatıb', tone: 'neutral' },
];

export const SCHOLARSHIP_PROVIDERS = [
  'Dövlət Proqramı (Azərbaycan Respublikası)',
  'Heydər Əliyev Fondu Beynəlxalq Təhsil Qrantı',
  'Hökumətlərarası Təqaüd Proqramı (HTP)',
  'Fulbright Təqaüd Proqramı (ABŞ)',
  'DAAD Təqaüdü (Almaniya)',
  'Chevening Təqaüd Proqramı (Böyük Britaniya)',
  'Erasmus+ / Erasmus Mundus (Avropa İttifaqı)',
  'Türkiye Bursları (Türkiyə Cümhuriyyəti)',
  'Visegrad Təqaüd Fondu (Mərkəzi Avropa)',
  'GKS - Global Korea Scholarship (Cənubi Koreya)',
  'MEXT Təqaüdü (Yaponiya)',
  'Universitet Daxili Akademik Təqaüd Fondu',
];

export const COURSE_CATEGORY_GROUPS = [
  {
    label: 'Qəbul və imtahan hazırlığı',
    options: [
      { value: 'Abituriyent & Bakalavr Hazırlığı', label: 'Abituriyent və bakalavr hazırlığı' },
      { value: 'Riyaziyyat & Məntiq', label: 'Riyaziyyat və məntiq' },
      { value: 'Fizika, Kimya & Biologiya', label: 'Fizika, kimya və biologiya' },
      { value: 'Azərbaycan dili & Ədəbiyyat', label: 'Azərbaycan dili və ədəbiyyat' },
      { value: 'Tarix & Coğrafiya', label: 'Tarix və coğrafiya' },
      { value: 'Magistratura & Dövlət Qulluğu', label: 'Magistratura və dövlət qulluğu' },
      { value: 'Xaricdə Təhsil & İmtahanlar', label: 'Xaricdə təhsil (SAT, GRE, GMAT)' },
    ],
  },
  {
    label: 'Dillər',
    options: [
      { value: 'Xarici Dillər', label: 'İngilis dili, IELTS, TOEFL' },
      { value: 'Rus & Alman & Fransız dili', label: 'Rus, alman və fransız dili' },
      { value: 'Türk dili & TÖMER', label: 'Türk dili və TÖMER' },
    ],
  },
  {
    label: 'Texnologiya və IT',
    options: [
      { value: 'Proqramlaşdırma', label: 'Proqramlaşdırma və IT' },
      { value: 'AI & Data Science', label: 'Süni intellekt və Data Science' },
      { value: 'UI/UX & Qrafik Dizayn', label: 'UI/UX və qrafik dizayn' },
      { value: 'Cloud & DevOps', label: 'Cloud və DevOps' },
      { value: 'Kiber Təhlükəsizlik', label: 'Kiber təhlükəsizlik' },
    ],
  },
  {
    label: 'Biznes və peşə',
    options: [
      { value: 'Biznes, Maliyyə & Menecment', label: 'Biznes, maliyyə və menecment' },
      { value: 'Marketinq & SMM', label: 'Rəqəmsal marketinq və SMM' },
    ],
  },
];

export const COURSE_LEVELS = [
  'Bütün Səviyyələr', '9-11-ci Sinif (Abituriyent)', 'Bakalavr Tələbələri',
  'Başlanğıc (Beginner)', 'Orta (Intermediate)', 'İrəli (Advanced)',
].map((v) => ({ value: v, label: v }));

export const COURSE_LANGUAGES = [
  { value: 'az', label: 'Azərbaycan dili' },
  { value: 'en', label: 'İngilis dili' },
  { value: 'tr', label: 'Türk dili' },
  { value: 'ru', label: 'Rus dili' },
];

export const COURSE_CURRENCIES = ['AZN', 'USD', 'EUR'].map((v) => ({ value: v, label: v }));

export const TALENT_STATUSES = [
  { value: 'New', label: 'Yeni', tone: 'info' },
  { value: 'Reviewing', label: 'Baxılır', tone: 'warning' },
  { value: 'Contacted', label: 'Əlaqə saxlanıldı', tone: 'brand' },
  { value: 'Partnered', label: 'Tərəfdaşlıq', tone: 'success' },
  { value: 'Archived', label: 'Arxiv', tone: 'neutral' },
];
export const talentStatusMeta = (status) =>
  TALENT_STATUSES.find((s) => s.value === status) || TALENT_STATUSES[0];
