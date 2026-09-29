import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Handshake,
  Info,
  Laptop,
  Lightbulb,
  LineChart,
  MailCheck,
  Megaphone,
  MessageCircleQuestion,
  Mic,
  Palette,
  RotateCcw,
  Scale,
  Send,
  ShieldCheck,
  Square,
  Upload,
  User,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { useSubmitHiddenTalentMutation, useUploadTalentFileMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

// Several translation strings still carry emoji / arrows (e.g. "🎙️ Start", "← Back").
// The new design uses real icons, so strip those characters at render time.
const plain = (str) =>
  String(str ?? '')
    .replace(/\p{Extended_Pictographic}|\u{FE0F}|\u{200D}|[\u{2713}\u{2190}\u{2192}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

// "1. Share your idea" → "Share your idea" (the list already numbers the steps).
const stripNumber = (str) => plain(str).replace(/^\d+\.\s*/, '');

const INITIAL_FORM = {
  // Step 1
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  age: '',
  cityCountry: '',
  socialLinks: '',
  // Step 2
  skillName: '',
  experienceDuration: '',
  skillLevel: 'Orta',
  whereUsed: '',
  whatCreated: '',
  // Step 3
  ideaDescription: '',
  problemSolved: '',
  targetAudience: '',
  currentProgress: '',
  mainGoal: '',
  dynamicCategoryQuestion: '',
  dynamicCategoryAnswer: '',
  // Step 4
  voiceNoteUrl: '',
  videoUrl: '',
  uploadedFiles: [], // [{ name, url, size, type }]
  // Step 5
  estimatedInvestment: 'Bilmirəm',
  customInvestmentAmount: '',
  neededSupportTypes: ['Mentor', 'Maliyyə'],
  otherNeeds: '',
  // Step 6
  teamStatus: 'Solo',
  teamSize: '',
  teamRoles: '',
  teamNotes: '',
  oneYearVision: '',
  wantIncome: 'Bəli',
  wantBusiness: 'Bəli',
  ultimateAmbition: ''
};

function HiddenTalentsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [submitTalent, { isLoading: isSubmitting }] = useSubmitHiddenTalentMutation();
  const [uploadFileApi] = useUploadTalentFileMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Steps definition with reactive translations
  const steps = [
    { id: 1, title: t('talents.step1.title', 'Əvvəlcə səni tanıyaq'), short: t('talents.stepShort.1', 'Şəxsi') },
    { id: 2, title: t('talents.step2.title', 'İndi isə sənin bacarığın haqqında danışaq'), short: t('talents.stepShort.2', 'Bacarıq') },
    { id: 3, title: t('talents.step3.title', 'Bunu reallaşdırsaydın, nə edərdin?'), short: t('talents.stepShort.3', 'İdeya') },
    { id: 4, title: t('talents.step4.title', 'Bacardığını bizə göstər'), short: t('talents.stepShort.4', 'Fayllar') },
    { id: 5, title: t('talents.step5.title', 'Bunu reallaşdırmaq üçün sənə nə lazımdır?'), short: t('talents.stepShort.5', 'Resurs') },
    { id: 6, title: t('talents.step6.title', 'Bu bacarığın gələcəyini necə görürsən?'), short: t('talents.stepShort.6', 'Gələcək') },
    { id: 7, title: t('talents.step7.title', 'Bəlkə də axtardığımız insan sənsən.'), short: t('talents.stepShort.7', 'Təsdiq') },
  ];

  const skillLevels = [
    { id: 'Yeni başlayıram', label: t('talents.skillLevels.1.label', 'Yeni başlayıram'), desc: t('talents.skillLevels.1.desc', 'Sadəcə öyrənməyə və kəşf etməyə başlamışam') },
    { id: 'Başlanğıc', label: t('talents.skillLevels.2.label', 'Başlanğıc'), desc: t('talents.skillLevels.2.desc', 'Baza anlayışım və ilk təcrübələrim var') },
    { id: 'Orta', label: t('talents.skillLevels.3.label', 'Orta səviyyə'), desc: t('talents.skillLevels.3.desc', 'Müstəqil nələrsə yarada və tətbiq edə bilirəm') },
    { id: 'Yaxşı', label: t('talents.skillLevels.4.label', 'Yaxşı'), desc: t('talents.skillLevels.4.desc', 'Sahəmi yaxşı bilirəm və keyfiyyətli işlər çıxarıram') },
    { id: 'Peşəkar', label: t('talents.skillLevels.5.label', 'Peşəkar'), desc: t('talents.skillLevels.5.desc', 'Real layihələr, müştərilər və ya təcrübəm var') },
    { id: 'Çox yüksək səviyyə', label: t('talents.skillLevels.6.label', 'Ekspert / Usta'), desc: t('talents.skillLevels.6.desc', 'Bu sahədə fərqlənirəm və dərin biliyim var') }
  ];

  const investmentOptions = [
    t('talents.general.dontKnow', 'Bilmirəm'),
    '0 – 500 AZN / $300',
    '500 – 1,000 AZN / $600',
    '1,000 – 5,000 AZN / $3,000',
    '5,000 – 10,000 AZN / $6,000',
    '10,000+ AZN / $10,000+',
    t('talents.step5.customAmountOption', 'Dəqiq məbləği özüm yazım')
  ];

  const supportTypes = [
    { id: 'Maliyyə', label: t('talents.supportList.finance', 'Maliyyə / Qrant'), icon: Wallet },
    { id: 'Mentor', label: t('talents.supportList.mentor', 'Mentor / Məsləhət'), icon: GraduationCap },
    { id: 'Təhsil', label: t('talents.supportList.education', 'Təhsil / Təlimlər'), icon: BookOpen },
    { id: 'Texniki dəstək', label: t('talents.supportList.tech', 'Texniki / Proqram təminatı'), icon: Laptop },
    { id: 'Komanda', label: t('talents.supportList.team', 'Komanda üzvü / Həmtəsisçi'), icon: Users },
    { id: 'Marketinq', label: t('talents.supportList.marketing', 'Marketinq & Reklam'), icon: Megaphone },
    { id: 'Dizayn', label: t('talents.supportList.design', 'Dizayn & Brendinq'), icon: Palette },
    { id: 'Avadanlıq', label: t('talents.supportList.equipment', 'Avadanlıq & Alətlər'), icon: Wrench },
    { id: 'Məkan', label: t('talents.supportList.office', 'Ofis / İş məkanı'), icon: Building2 },
    { id: 'Hüquqi dəstək', label: t('talents.supportList.legal', 'Hüquqi & Patent dəstəyi'), icon: Scale },
    { id: 'Biznes plan', label: t('talents.supportList.businessPlan', 'Biznes plan & Strategiya'), icon: LineChart },
    { id: 'İnvestor tapmaq', label: t('talents.supportList.investor', 'İnvestor əlaqələri'), icon: Handshake },
    { id: 'Digər', label: t('talents.supportList.other', 'Digər dəstək'), icon: Lightbulb }
  ];

  const teamStatuses = [
    { id: 'Solo', label: t('talents.teamStatuses.solo', 'Tək işləyirəm'), icon: User },
    { id: 'Friends', label: t('talents.teamStatuses.friends', 'Dostlarım var'), icon: Handshake },
    { id: 'Team', label: t('talents.teamStatuses.team', 'Komandamız var'), icon: Users },
    { id: 'Company', label: t('talents.teamStatuses.company', 'Şirkətimiz var'), icon: Building2 },
    { id: 'Other', label: t('talents.teamStatuses.other', 'Digər'), icon: Lightbulb }
  ];

  const inspirationTags = [
    t('talents.inspirational.art', '🎨 Rəssamlıq & İncəsənət'),
    t('talents.inspirational.code', '💻 Proqramlaşdırma & Kod'),
    t('talents.inspirational.ai', '🤖 Süni İntellekt (AI)'),
    t('talents.inspirational.startup', '🚀 Startap & Biznes İdeyası'),
    t('talents.inspirational.music', '🎵 Musiqi & Bəstəkarlıq'),
    t('talents.inspirational.video', '📸 Videoqrafiya & Kino'),
    t('talents.inspirational.writing', '✍️ Yazıçılıq & Ədəbiyyat'),
    t('talents.inspirational.engineering', '⚙️ Mühəndislik & İxtira'),
    t('talents.inspirational.sport', '🥋 İdman & Bacarıq'),
    t('talents.inspirational.teaching', '🎓 Tədris & Kurs Təşəbbüsü'),
    t('talents.inspirational.craft', '🧵 Əl İşi & Sənətkarlıq')
  ].map(plain);

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Field change helper — also clears that field's inline error.
  const setField = (field, errorKey = field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
  };

  const formSectionRef = useRef(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Drag & Drop uploading state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Dynamic intelligent AI helper: context-aware multilingual questions
  const getDynamicQuestion = () => {
    const text = `${formData.skillName} ${formData.ideaDescription}`.toLowerCase();

    // 1. Visual Art / Drawing / Painting / Design / Sculpture
    const artKeywords = [
      'art', 'rəsm', 'resm', 'ressam', 'ressamliq', 'ressamlıq', 'boya', 'tablo', 'çəkmək', 'cekmek', 'çəkirəm', 'cekirem', 'çəkir', 'cekir',
      'portret', 'portrait', 'dizayn', 'design', 'designer', 'illustrat', 'illüstrasiya', 'illustration', 'sketch', 'eskiz', 'qrafik', 'graphic',
      'draw', 'drawing', 'paint', 'painting', 'painter', 'dessin', 'dessiner', 'peinture', 'peindre', 'kunst', 'malen', 'zeichnen', 'zeichnung',
      'çizim', 'çizmek', 'sanat', 'görsel', 'рисунок', 'рисование', 'рисовать', 'художник', 'живопись', 'графика', 'иллюстрация', 'дизайн',
      'cuadro', 'pintura', 'pintar', 'dibujo', 'dibujar', 'disegno', 'disegnare', 'pittura', 'dipingere', 'arte', '3d', 'sculpt', 'heykəl', 'heykel',
      'animat', 'animasiya', 'animation', 'tuval', 'karikatür'
    ];

    // 2. Coding / Software / AI / Mobile Apps / Web
    const techKeywords = [
      'kod', 'kodlaşdırma', 'kodlasdirma', 'proqram', 'proqramlaşdırma', 'proqramlasdirma', 'developer', 'dev', 'code', 'coding', 'software',
      'develop', 'ai', 'süni', 'suni', 'intellekt', 'intelligence', 'llm', 'gpt', 'bot', 'tətbiq', 'tetbiq', 'app', 'application',
      'mobile', 'mobil', 'sayt', 'site', 'veb', 'web', 'website', 'frontend', 'backend', 'fullstack', 'python', 'javascript', 'react', 'flutter',
      'c#', 'java', 'yazılım', 'yazilim', 'programlama', 'yapay zeka', 'ии', 'нейросеть', 'программирование', 'программист', 'разработка',
      'приложение', 'сайт', 'бот', 'кодинг', 'logiciel', 'programme', 'informatique', 'entwicklung', 'programador', 'desarrollo',
      'sviluppo', 'informatica', 'cyber', 'kiber', 'kibertəhlükəsizlik', 'robot', 'robototexnika', 'iot', 'game',
      'oyun', 'gaming', 'unity', 'data', 'analitika', 'analytics'
    ];

    // 3. Business / Startup / Sales / Commerce
    const bizKeywords = [
      'biznes', 'startap', 'startup', 'layihə', 'layihe', 'project', 'girişim', 'ticaret', 'ticarət', 'satış', 'satis', 'market', 'marketing',
      'marketinq', 'commerce', 'ecommerce', 'e-ticarət', 'business', 'sale', 'sales', 'venture', 'invest', 'investor', 'şirkət', 'sirket', 'company',
      'agency', 'agentlik', 'ajans', 'b2b', 'b2c', 'saas', 'platform', 'platforma', 'бизнес', 'стартап', 'предприятие', 'продажи', 'маркетинг',
      'инвестиции', 'торговля', 'affaire', 'entreprise', 'comercio', 'negocio', 'geschäft', 'unternehmen', 'affari', 'monetiz'
    ];

    // 4. Music / Audio / Singing / Composing
    const musicKeywords = [
      'musiqi', 'musiqiçi', 'mahnı', 'mahni', 'bəstə', 'beste', 'bəstəkar', 'bestekar', 'audio', 'səs', 'ses', 'instrument', 'alət', 'alet',
      'guitar', 'gitara', 'piano', 'pianino', 'vokal', 'vocal', 'sing', 'singer', 'müğənni', 'mugenny', 'oxumaq', 'track', 'trek', 'soundtrack',
      'soundtreki', 'sound', 'beat', 'beatmaker', 'beatmaking', 'prodüser', 'producer', 'müzik', 'şarkı', 'sarki', 'seslendirme',
      'музыка', 'песня', 'композитор', 'вокал', 'пение', 'звук', 'звукозапись', 'биты', 'аудио', 'трек', 'musique', 'chanson', 'musik', 'lied',
      'musica', 'canzone', 'cancion'
    ];

    // 5. Writing / Literature / Content
    const writingKeywords = [
      'yazı', 'yazi', 'yazıçı', 'yazici', 'kitab', 'kitap', 'kitablar', 'məqalə', 'meqale', 'mətn', 'metn', 'ədəbiyyat', 'edebiyyat', 'hekayə',
      'hekaye', 'roman', 'poeziya', 'şeir', 'seir', 'author', 'writer', 'write', 'writing', 'book', 'novel', 'poem', 'poetry', 'script', 'ssenari',
      'screenplay', 'copywriting', 'məzmun', 'content', 'bloq', 'blog', 'письмо', 'книга', 'автор', 'писатель', 'статья', 'роман', 'поэзия',
      'стихи', 'сценарий', 'текст', 'ecriture', 'livre', 'buch', 'autor', 'libro', 'scrittura'
    ];

    // 6. Science / Engineering / Invention
    const scienceKeywords = [
      'mühəndis', 'muhendis', 'mühəndislik', 'muhendislik', 'ixtira', 'ixtiraçı', 'ixtiraci', 'içat', 'elm', 'elmi', 'kəşf', 'kesf', 'fizika',
      'kimya', 'biologiya', 'laboratoriya', 'engineer', 'engineering', 'invent', 'invention', 'inventor', 'science', 'scientific', 'physics',
      'chemistry', 'biology', 'lab', 'mühendis', 'buluş', 'icat', 'bilim', 'инженер', 'инженерия', 'изобретение', 'изобретатель', 'наука',
      'физика', 'химия', 'лаборатория', 'ingenieur', 'wissenschaft', 'ingenieria', 'ciencia'
    ];

    const hasMatch = (keywords) => keywords.some((kw) => text.includes(kw));

    if (hasMatch(artKeywords)) {
      return {
        question: t('talents.dynamicAi.artQ', 'Əla vizual istedad! Daha çox hansı üslub və ya texnikada işləyirsən?'),
        options: [
          t('talents.dynamicAi.art1', 'Portret & Fiqurativ'),
          t('talents.dynamicAi.art2', 'Digital Art & İllüstrasiya'),
          t('talents.dynamicAi.art3', 'Realistik & Yağlı boya'),
          t('talents.dynamicAi.art4', 'Anime & Konsept Art'),
          t('talents.dynamicAi.art5', '3D Qrafika & Modelləmə'),
          t('talents.dynamicAi.art6', 'Abstrakt & Müasir incəsənət'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }
    if (hasMatch(techKeywords)) {
      return {
        question: t('talents.dynamicAi.techQ', 'Möhtəşəm texnoloji potensial! Hansı platforma və ya istiqaməti hədəfləyirsən?'),
        options: [
          t('talents.dynamicAi.tech1', 'Süni İntellekt (AI) & LLM'),
          t('talents.dynamicAi.tech2', 'Mobil Tətbiq (iOS/Android)'),
          t('talents.dynamicAi.tech3', 'Veb Platforma / SaaS'),
          t('talents.dynamicAi.tech4', 'Oyun & Virtual Reallıq'),
          t('talents.dynamicAi.tech5', 'Kibertəhlükəsizlik'),
          t('talents.dynamicAi.tech6', 'Robototexnika & IoT'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }
    if (hasMatch(bizKeywords)) {
      return {
        question: t('talents.dynamicAi.businessQ', 'Biznes düşüncəsi təqdirəlayiqdir! İdeyanın əsas potensial müştəriləri kimlərdir?'),
        options: [
          t('talents.dynamicAi.biz1', 'Fərdlər / Gənclər (B2C)'),
          t('talents.dynamicAi.biz2', 'Şirkətlər & Bizneslər (B2B)'),
          t('talents.dynamicAi.biz3', 'Tələbələr & Təhsil müəssisələri'),
          t('talents.dynamicAi.biz4', 'Qlobal / Xarici bazar'),
          t('talents.dynamicAi.biz5', 'Dövlət / İctimai sektor'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }
    if (hasMatch(musicKeywords)) {
      return {
        question: t('talents.dynamicAi.musicQ', 'Səs və musiqi qüdrətlidir! Əsas fəaliyyət sahən hansıdır?'),
        options: [
          t('talents.dynamicAi.mus1', 'Elektron musiqi & Beatmaking'),
          t('talents.dynamicAi.mus2', 'Bəstəkarlıq & Melodiya'),
          t('talents.dynamicAi.mus3', 'Vokal & İfaçılıq'),
          t('talents.dynamicAi.mus4', 'Film / Oyun Soundtreki'),
          t('talents.dynamicAi.mus5', 'Səs Rejissorluğu & Miksinq'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }
    if (hasMatch(writingKeywords)) {
      return {
        question: t('talents.dynamicAi.writingQ', 'Sözün gücü sonsuzdur! Hansı ədəbi və ya məzmun janrında yazırsan?'),
        options: [
          t('talents.dynamicAi.wri1', 'Bədii Nəsr & Roman'),
          t('talents.dynamicAi.wri2', 'Poeziya & Şeir'),
          t('talents.dynamicAi.wri3', 'Ssenari & Kino'),
          t('talents.dynamicAi.wri4', 'Kopiraytinq & Bloq'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }
    if (hasMatch(scienceKeywords)) {
      return {
        question: t('talents.dynamicAi.scienceQ', 'Elmi və mühəndislik düşüncəsi möhtəşəmdir! Əsas ixtira sahəniz nədir?'),
        options: [
          t('talents.dynamicAi.sci1', 'Mexanika & Robototexnika'),
          t('talents.dynamicAi.sci2', 'Biotexnologiya & Tibb'),
          t('talents.dynamicAi.sci3', 'Yaşıl Enerji & Ekologiya'),
          t('talents.dynamicAi.sci4', 'Elektronika & Çiplər'),
          t('talents.dynamicAi.other', 'Digər')
        ]
      };
    }

    return {
      question: t('talents.dynamicAi.generalQ', 'İdeyanın əsas fərqləndirici və xüsusi üstünlüyü nədir?'),
      options: [
        t('talents.dynamicAi.gen1', 'İnnovativ yanaşma'),
        t('talents.dynamicAi.gen2', 'Mövcud alternativlərdən daha ucuz'),
        t('talents.dynamicAi.gen3', 'Daha sürətli və rahat'),
        t('talents.dynamicAi.gen4', 'Lokal bazarda analoqu yoxdur'),
        t('talents.dynamicAi.gen5', 'Yüksək sosial təsiri var'),
        t('talents.dynamicAi.other', 'Digər')
      ]
    };
  };

  const dynamicInfo = getDynamicQuestion();

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        await uploadAudioToServer(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mikrofon icazəsi xətası:', err);
      toast.error(t('toast.talents.micDenied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlobUrl(null);
    setRecordingTime(0);
    setFormData((prev) => ({ ...prev, voiceNoteUrl: '' }));
  };

  const uploadAudioToServer = async (blob) => {
    setIsUploadingVoice(true);
    try {
      const file = new File([blob], `voice_pitch_${Date.now()}.webm`, { type: 'audio/webm' });
      const fData = new FormData();
      fData.append('file', file);

      const res = await uploadFileApi(fData).unwrap();
      if (res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, voiceNoteUrl: res.data.fileUrl }));
        toast.success(t('toast.talents.voiceSaved'));
      }
    } catch (err) {
      console.error('Audio upload error:', err);
      toast.apiError(err, 'toast.talents.fileUploadError');
    } finally {
      setIsUploadingVoice(false);
    }
  };

  // File Upload Handlers
  const handleFilesSelect = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingFile(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fData = new FormData();
        fData.append('file', file);

        const res = await uploadFileApi(fData).unwrap();
        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            uploadedFiles: [
              ...prev.uploadedFiles,
              {
                name: res.data.fileName || file.name,
                url: res.data.fileUrl,
                size: res.data.fileSizeBytes || file.size,
                type: res.data.fileType || file.type
              }
            ]
          }));
        }
      }
      toast.success(t('toast.talents.filesAdded', { count: files.length }));
    } catch (err) {
      console.error('File upload error:', err);
      toast.apiError(err, 'toast.talents.fileUploadError');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const toggleSupportType = (id) => {
    setFormData((prev) => {
      const current = prev.neededSupportTypes || [];
      const exists = current.includes(id);
      return {
        ...prev,
        neededSupportTypes: exists ? current.filter((x) => x !== id) : [...current, id]
      };
    });
  };

  // Step Validation — same rules as before; errors are now also shown inline next to the fields.
  const validateStep = (step) => {
    const next = {};
    if (step === 1) {
      if (!formData.firstName.trim()) next.firstName = t('talents.errors.firstName', 'Zəhmət olmasa adınızı daxil edin.');
      if (!formData.lastName.trim()) next.lastName = t('talents.errors.lastName', 'Zəhmət olmasa soyadınızı daxil edin.');
      if (!formData.phone.trim() && !formData.email.trim()) next.contact = t('talents.errors.contact', 'Əlaqə üçün ən azı telefon nömrəsi və ya e-mail daxil edin.');
    }
    if (step === 2) {
      if (!formData.skillName.trim()) next.skillName = t('talents.errors.skill', 'Zəhmət olmasa bacarığınız və ya istedadınız haqqında qısa məlumat yazın.');
    }
    const messages = Object.values(next);
    if (messages.length) {
      setErrors((prev) => ({ ...prev, ...next }));
      toast.warning(messages[0]);
      if (step !== currentStep) setCurrentStep(step);
      requestAnimationFrame(() => {
        const firstInvalid = formSectionRef.current?.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus();
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep((prev) => prev + 1);
        scrollToForm();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      scrollToForm();
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        age: formData.age,
        cityCountry: formData.cityCountry,
        socialLinks: formData.socialLinks,
        skillName: formData.skillName,
        experienceDuration: formData.experienceDuration,
        skillLevel: formData.skillLevel,
        whereUsed: formData.whereUsed,
        whatCreated: formData.whatCreated,
        ideaDescription: formData.ideaDescription,
        problemSolved: formData.problemSolved,
        targetAudience: formData.targetAudience,
        currentProgress: formData.currentProgress,
        mainGoal: formData.mainGoal,
        dynamicCategoryQuestion: dynamicInfo.question,
        dynamicCategoryAnswer: formData.dynamicCategoryAnswer,
        voiceNoteUrl: formData.voiceNoteUrl,
        videoUrl: formData.videoUrl,
        uploadedFilesJson: JSON.stringify(formData.uploadedFiles),
        estimatedInvestment: formData.estimatedInvestment,
        customInvestmentAmount: formData.customInvestmentAmount,
        neededSupportTypes: JSON.stringify(formData.neededSupportTypes),
        otherNeeds: formData.otherNeeds,
        teamStatus: formData.teamStatus,
        teamSize: formData.teamSize ? parseInt(formData.teamSize, 10) : null,
        teamRoles: formData.teamRoles,
        teamNotes: formData.teamNotes,
        oneYearVision: formData.oneYearVision,
        wantIncome: formData.wantIncome,
        wantBusiness: formData.wantBusiness,
        ultimateAmbition: formData.ultimateAmbition
      };

      await submitTalent(payload).unwrap();
      setIsSubmitted(true);
      scrollToForm();
    } catch (err) {
      console.error('Submission error:', err);
      toast.apiError(err, 'toast.talents.submitError');
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stageLabel = t('talents.general.stage', 'Mərhələ');
  const optionalText = t('talents.general.optional', 'İstəsən paylaş');
  const customAmountOption = t('talents.step5.customAmountOption', 'Dəqiq məbləği özüm yazım');
  const stepDescriptions = {
    1: t('talents.step1.desc', 'Səninlə necə əlaqə saxlaya biləcəyimizi bilmək istəyirik. Qorxma, məlumatların tam məxfi saxlanılır.'),
    2: t('talents.step2.desc', 'Səni ən çox həyəcanlandıran və saatlarla məşğul ola biləcəyin bacarıq və ya istedadın nədir?'),
    3: t('talents.step3.desc', 'Ağlına gələn hər şeyi yaz. Fikrin tam hazır olmasına ehtiyac yoxdur. Əsas sənin baxış bucağındır.'),
    4: t('talents.step4.desc', 'Şəkil, video, səs, sənəd və ya ideyanı izah edən başqa materialın varsa, buraya əlavə et. Görmək anlamağın ən yaxşı yoludur.'),
    5: t('talents.step5.desc', 'Xəyallarını həqiqətə çevirmək üçün hansı dəstəyə və ya resurslara ehtiyac duyursan?'),
    6: t('talents.step6.desc', 'Tək işləyirsən, yoxsa komandan var? Gələcək vizyonunu və planlarını bizimlə bölüş.'),
    7: t('talents.step7.desc', 'Sənin bacarığın sadəcə bir hobbi olaraq qalmalı deyil. Bəlkə də onun arxasında böyük bir layihə, biznes və ya gələcək karyera dayanır. Bizə bacarığını göstər. Qalan yolun necə ola biləcəyini birlikdə araşdıraq.'),
  };
  const howSteps = [
    { title: t('talents.howItWorksModal.step1Title', '1. Bacarıq və ya ideyanı bizimlə bölüş'), desc: t('talents.howItWorksModal.step1Desc', 'Hər hansı rəsmin, kodun, startap ideyan, musiqin və ya həvəsin varsa, formu doldur və ya birbaşa səsli izah et.') },
    { title: t('talents.howItWorksModal.step2Title', '2. Ekspert komandamız qiymətləndirir'), desc: t('talents.howItWorksModal.step2Desc', 'Edusaz mentorları və investor şəbəkəmiz ideyanın hansı dəstəyə (maliyyə, mentorluq, komanda, təhsil və s.) ehtiyacı olduğunu təyin edir.') },
    { title: t('talents.howItWorksModal.step3Title', '3. Birlikdə reallaşdırırıq'), desc: t('talents.howItWorksModal.step3Desc', 'Səninlə fərdi əlaqə saxlayıb yol xəritəsi cızırıq, lazım olduqda investor və ya komanda ilə birləşdiririk.') },
  ];

  const invalid = (key) => (errors[key] ? 'true' : undefined);
  const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

  const resetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setErrors({});
    setAudioBlobUrl(null);
    setRecordingTime(0);
    setFormData(INITIAL_FORM);
  };

  const openFilePicker = () => fileInputRef.current && fileInputRef.current.click();

  return (
    <main className="ds-page ht-page">
      <ScrollToTop />

      <div className="ds-container">
        {/* ── Intro ─────────────────────────────────────────────────────── */}
        <header className="ht-intro">
          <div className="ht-intro__copy ds-page-header">
            <span className="ds-eyebrow">{plain(t('talents.badge', 'Edusaz İstedad & İdeya İnkubatoru'))}</span>
            <h1 className="ds-title">
              {t('talents.heroTitle', 'Səndə hansı')}{' '}
              <span className="ht-accent">{t('talents.heroHighlight', 'gizli bacarıq')}</span>{' '}
              {t('talents.heroTitleEnd', 'var?')}
            </h1>
            <p className="ds-lead">
              {t('talents.heroSubtitle', 'Bəlkə yaxşı rəsm çəkirsən, maraqlı ideyan var, nəsə yaradırsan, bir layihə düşünmüsən və ya sadəcə bacarığının necə böyük bir işə çevrilə biləcəyini bilmirsən. Bizə danış. Sən bacarığını paylaş, Edusaza isə onu reallaşdırmağın yollarını səninlə birlikdə axtarsın.')}
            </p>
            <p className="ht-after">
              <MailCheck aria-hidden />
              <span>
                {t('pages.talents.afterSubmit', 'Göndərdikdən sonra komandamız müraciətini nəzərdən keçirir və ideyanı birlikdə inkişaf etdirə biləcəyimizə inansaq, səninlə əlaqə saxlayır.')}
              </span>
            </p>
            <div className="ht-intro__actions">
              <button type="button" className="ds-btn ds-btn--primary ds-btn--lg" onClick={scrollToForm}>
                {plain(t('talents.shareTalent', 'Bacarığımı paylaş'))}
                <ArrowRight aria-hidden className="ht-dir" />
              </button>
            </div>

            <div className="ht-inspire">
              <p className="ht-inspire__label" id="ht-inspire-label">{t('talents.getInspired', 'İlham al:')}</p>
              <ul className="ht-inspire__list" aria-labelledby="ht-inspire-label">
                {inspirationTags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      className="ds-chip"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          skillName: prev.skillName ? `${prev.skillName}, ${tag}` : tag
                        }));
                        if (errors.skillName) setErrors((prev) => ({ ...prev, skillName: undefined }));
                        scrollToForm();
                      }}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How it works — 3 steps */}
          <aside className="ht-how ds-card" id="ht-how" aria-labelledby="ht-how-title" data-reveal>
            <h2 id="ht-how-title" className="ds-h3">{plain(t('talents.howItWorks', 'Necə işləyir?'))}</h2>
            <ol className="ht-how__list">
              {howSteps.map((s, i) => (
                <li key={i} className="ht-how__item">
                  <span className="ht-how__num">0{i + 1}</span>
                  <div>
                    <h3 className="ht-how__title">{stripNumber(s.title)}</h3>
                    <p className="ds-muted">{plain(s.desc)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </header>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <section className="ht-form" ref={formSectionRef} aria-label={plain(t('talents.shareTalent', 'Bacarığımı paylaş'))}>
          {isSubmitted ? (
            /* SUCCESS */
            <div className="ht-success ds-card" role="status">
              <span className="ht-success__icon">
                <CheckCircle2 aria-hidden />
              </span>
              <h2 className="ds-h2">{plain(t('talents.success.title', 'Bacarığını bizimlə paylaşdın. İndi növbə bizdədir!'))}</h2>
              <p className="ds-lead">
                {t('talents.success.desc', 'Məlumatlarını və ideyanı qəbul etdik. Komandamız paylaşdığın bacarıq və layihəni diqqətlə nəzərdən keçirəcək. Əgər səninlə birlikdə bu ideyanı inkişaf etdirə biləcəyimizə inanırıqsa, ən qısa zamanda əlaqə saxlayacağıq.')}
              </p>

              <ol className="ht-timeline">
                {[
                  { state: 'done', title: t('talents.success.timeline1Title', 'Müraciət Göndərildi'), desc: t('talents.success.timeline1Desc', 'Bütün məlumat və fayllarınız təhlükəsiz qeydə alındı') },
                  { state: 'current', title: t('talents.success.timeline2Title', 'Komanda Baxışı'), desc: t('talents.success.timeline2Desc', 'Mütəxəssislərimiz bacarıq və resurs ehtiyaclarını analiz edir (24-48 saat)') },
                  { state: 'upcoming', title: t('talents.success.timeline3Title', 'Əlaqə & Görüş'), desc: t('talents.success.timeline3Desc', 'Sizinlə onlayn və ya ofisimizdə görüş təyin edib yol xəritəsini qururuq') },
                ].map((item, i) => (
                  <li key={i} className="ht-timeline__item" data-state={item.state}>
                    <span className="ht-timeline__dot" aria-hidden>
                      {item.state === 'done' ? <Check /> : i + 1}
                    </span>
                    <div>
                      <h3 className="ht-timeline__title">{plain(item.title)}</h3>
                      <p className="ds-muted">{plain(item.desc)}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="ht-success__actions">
                <Link to="/" className="ds-btn ds-btn--primary">
                  {plain(t('talents.success.returnHome', 'Edusazaya qayıt'))}
                </Link>
                <button type="button" className="ds-btn ds-btn--secondary" onClick={resetForm}>
                  {plain(t('talents.success.newSubmission', 'Yeni bacarıq əlavə et'))}
                </button>
              </div>
            </div>
          ) : (
            <div className="ht-wizard" data-step={currentStep}>
              {/* Side: stepper + trust note */}
              <div className="ht-wizard__side">
                <nav className="ht-stepper" aria-label={stageLabel}>
                  <ol className="ht-stepper__list">
                    {steps.map((s) => {
                      const state = s.id < currentStep ? 'done' : s.id === currentStep ? 'current' : 'upcoming';
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            className="ht-stepper__btn"
                            data-state={state}
                            aria-current={state === 'current' ? 'step' : undefined}
                            disabled={state === 'upcoming'}
                            onClick={() => {
                              if (s.id <= currentStep) setCurrentStep(s.id);
                            }}
                          >
                            <span className="ht-stepper__num" aria-hidden>
                              {state === 'done' ? <Check /> : s.id}
                            </span>
                            <span className="ht-stepper__label">{plain(s.short)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <div
                    className="ht-progress"
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={steps.length}
                    aria-valuenow={currentStep}
                    aria-label={`${stageLabel} ${currentStep} / ${steps.length}`}
                  >
                    <span className="ht-progress__fill" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
                  </div>
                </nav>

                <div className="ht-trust">
                  <Info aria-hidden />
                  <div>
                    <p className="ht-trust__title">{plain(t('talents.trustBannerTitle', 'Nə qədər çox məlumat paylaşsan, səni və ideyanı bir o qədər yaxşı anlaya bilərik.'))}</p>
                    <p className="ds-muted">{plain(t('talents.trustBannerDesc', 'Hər sahəni doldurmaq məcburi deyil. Sənin üçün vacib olan məlumatları paylaş. Qalanını birlikdə tamamlayarıq.'))}</p>
                  </div>
                </div>
              </div>

              {/* Main: current step */}
              <form
                className="ht-wizard__main ds-card"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentStep < 7) handleNext();
                  else handleSubmit(e);
                }}
              >
                <header className="ht-pane__head">
                  <p className="ht-pane__kicker">
                    {stageLabel} {currentStep} / {steps.length}
                  </p>
                  <h2 className="ds-h2">{plain(steps[currentStep - 1].title)}</h2>
                  <p className="ds-muted">{plain(stepDescriptions[currentStep])}</p>
                </header>

                <div className="ht-pane" key={currentStep}>
                  {/* ── STEP 1: ABOUT YOU ── */}
                  {currentStep === 1 && (
                    <>
                      <div className="ht-grid-2">
                        <Field id="ht-firstName" label={t('talents.step1.firstName', 'Adın')} req error={errors.firstName}>
                          <input
                            id="ht-firstName"
                            className="ds-input"
                            type="text"
                            autoComplete="given-name"
                            placeholder="Məs: Cavid"
                            value={formData.firstName}
                            onChange={setField('firstName')}
                            aria-invalid={invalid('firstName')}
                            aria-describedby={describedBy(errors.firstName && 'ht-firstName-error')}
                            required
                          />
                        </Field>
                        <Field id="ht-lastName" label={t('talents.step1.lastName', 'Soyadın')} req error={errors.lastName}>
                          <input
                            id="ht-lastName"
                            className="ds-input"
                            type="text"
                            autoComplete="family-name"
                            placeholder="Məs: Əliyev"
                            value={formData.lastName}
                            onChange={setField('lastName')}
                            aria-invalid={invalid('lastName')}
                            aria-describedby={describedBy(errors.lastName && 'ht-lastName-error')}
                            required
                          />
                        </Field>
                      </div>

                      <div className="ht-contact">
                        <div className="ht-grid-2">
                          <Field id="ht-phone" label={t('talents.step1.phone', 'Telefon nömrən')} req>
                            <input
                              id="ht-phone"
                              className="ds-input"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+994 50 123 45 67"
                              value={formData.phone}
                              onChange={setField('phone', 'contact')}
                              aria-invalid={invalid('contact')}
                              aria-describedby={describedBy('ht-contact-help', errors.contact && 'ht-contact-error')}
                            />
                          </Field>
                          <Field id="ht-email" label={t('talents.step1.email', 'E-mail ünvanın')} req>
                            <input
                              id="ht-email"
                              className="ds-input"
                              type="email"
                              autoComplete="email"
                              placeholder="cavid.aliyev@gmail.com"
                              value={formData.email}
                              onChange={setField('email', 'contact')}
                              aria-invalid={invalid('contact')}
                              aria-describedby={describedBy('ht-contact-help', errors.contact && 'ht-contact-error')}
                            />
                          </Field>
                        </div>
                        <p className="ds-help" id="ht-contact-help">
                          {t('pages.talents.contactHelp', 'Telefon və ya e-mail — ən azı birini yazmağın kifayətdir.')}
                        </p>
                        {errors.contact && (
                          <p className="ds-error" id="ht-contact-error">{errors.contact}</p>
                        )}
                      </div>

                      <div className="ht-grid-2">
                        <Field id="ht-age" label={t('talents.step1.age', 'Yaşın')} optionalText={optionalText}>
                          <input
                            id="ht-age"
                            className="ds-input"
                            type="number"
                            inputMode="numeric"
                            placeholder="Məs: 21"
                            value={formData.age}
                            onChange={setField('age')}
                          />
                        </Field>
                        <Field id="ht-city" label={t('talents.step1.cityCountry', 'Şəhər / Ölkə')} optionalText={optionalText}>
                          <input
                            id="ht-city"
                            className="ds-input"
                            type="text"
                            placeholder="Məs: Bakı, Azərbaycan"
                            value={formData.cityCountry}
                            onChange={setField('cityCountry')}
                          />
                        </Field>
                      </div>

                      <Field id="ht-social" label={t('talents.step1.socialLinks', 'Sosial media və ya Portfolio linklərin')} optionalText={optionalText}>
                        <input
                          id="ht-social"
                          className="ds-input"
                          type="text"
                          placeholder="Məs: Instagram / LinkedIn / Behance / GitHub"
                          value={formData.socialLinks}
                          onChange={setField('socialLinks')}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 2: YOUR SKILL ── */}
                  {currentStep === 2 && (
                    <>
                      <Field id="ht-skill" label={t('talents.step2.skillName', 'Bacarığın / istedadın nədir?')} req error={errors.skillName}>
                        <textarea
                          id="ht-skill"
                          className="ds-textarea"
                          rows="3"
                          placeholder={t('talents.step2.skillPlaceholder', 'Məsələn: rəsm çəkmək, musiqi bəstələmək, proqramlaşdırma, qrafik dizayn, əl işi, video montaj, biznes ideyası, idman, tədris və s.')}
                          value={formData.skillName}
                          onChange={setField('skillName')}
                          aria-invalid={invalid('skillName')}
                          aria-describedby={describedBy(errors.skillName && 'ht-skill-error')}
                          required
                        />
                      </Field>

                      <Field id="ht-exp" label={t('talents.step2.experienceDuration', 'Bu bacarığı nə vaxtdan edirsən?')} optionalText={optionalText}>
                        <input
                          id="ht-exp"
                          className="ds-input"
                          type="text"
                          placeholder={t('talents.step2.expPlaceholder', 'Məsələn: 6 aydır, 3 ildir, uşaqlıqdan bəri')}
                          value={formData.experienceDuration}
                          onChange={setField('experienceDuration')}
                        />
                      </Field>

                      <fieldset className="ht-fieldset">
                        <legend className="ds-label">{t('talents.step2.skillLevel', 'Özünü bu sahədə necə qiymətləndirirsən?')}</legend>
                        <div className="ht-levels">
                          {skillLevels.map((lvl, i) => (
                            <label key={lvl.id} className="ht-option ht-level" data-checked={formData.skillLevel === lvl.id ? 'true' : undefined}>
                              <input
                                type="radio"
                                name="ht-skillLevel"
                                className="ht-sr"
                                value={lvl.id}
                                checked={formData.skillLevel === lvl.id}
                                onChange={() => setFormData((prev) => ({ ...prev, skillLevel: lvl.id }))}
                              />
                              <span className="ht-level__meter" aria-hidden>
                                {skillLevels.map((_, j) => (
                                  <span key={j} data-on={j <= i ? 'true' : undefined} />
                                ))}
                              </span>
                              <span className="ht-level__title">{plain(lvl.label)}</span>
                              <span className="ht-level__desc">{plain(lvl.desc)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <Field id="ht-where" label={t('talents.step2.whereUsed', 'Bu bacarığı harada və necə istifadə etmisən?')} optionalText={optionalText}>
                        <textarea
                          id="ht-where"
                          className="ds-textarea ht-textarea-sm"
                          rows="2"
                          placeholder={t('talents.step2.wherePlaceholder', 'Məs: Dostlarıma kömək edəndə, universitet layihəsində, şəxsi səhifəmdə, yarışmada...')}
                          value={formData.whereUsed}
                          onChange={setField('whereUsed')}
                        />
                      </Field>

                      <Field id="ht-created" label={t('talents.step2.whatCreated', 'İndiyə qədər nə yaratmısan?')} optionalText={optionalText}>
                        <textarea
                          id="ht-created"
                          className="ds-textarea ht-textarea-sm"
                          rows="2"
                          placeholder={t('talents.step2.whatPlaceholder', 'Məs: Bir neçə portret çəkmişəm, sadə mobil tətbiq kodlamışam, 5 mahnı aranjeman etmişəm...')}
                          value={formData.whatCreated}
                          onChange={setField('whatCreated')}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 3: YOUR IDEA ── */}
                  {currentStep === 3 && (
                    <>
                      <Field id="ht-idea" label={t('talents.step3.ideaDesc', 'İdeyanı və ya xəyalındakı layihəni ətraflı izah et')}>
                        <textarea
                          id="ht-idea"
                          className="ds-textarea"
                          rows="4"
                          placeholder={t('talents.step3.ideaPlaceholder', 'Məs: Mən istəyirəm ki, gənclər üçün xüsusi interaktiv platforma quraq və ya öz çəkdiyim rəsmlərdən ibarət qlobal sərgi açaq...')}
                          value={formData.ideaDescription}
                          onChange={setField('ideaDescription')}
                        />
                      </Field>

                      {/* Context-aware follow-up question */}
                      <fieldset className="ht-fieldset ht-followup">
                        <legend className="ht-followup__legend">
                          <span className="ds-badge ds-badge--brand">
                            <MessageCircleQuestion aria-hidden />
                            {plain(t('talents.step3.aiBadge', 'Edusaz Ağıllı Sualı'))}
                          </span>
                          <span className="ht-followup__q">{plain(dynamicInfo.question)}</span>
                        </legend>
                        <div className="ht-choices">
                          {dynamicInfo.options.map((opt) => (
                            <label key={opt} className="ht-option ht-choice" data-checked={formData.dynamicCategoryAnswer === opt ? 'true' : undefined}>
                              <input
                                type="radio"
                                name="ht-dynamic"
                                className="ht-sr"
                                value={opt}
                                checked={formData.dynamicCategoryAnswer === opt}
                                onChange={() => setFormData((prev) => ({ ...prev, dynamicCategoryAnswer: opt }))}
                              />
                              {plain(opt)}
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <div className="ht-grid-2">
                        <Field id="ht-problem" label={t('talents.step3.problemSolved', 'Səncə bu ideya hansı problemi həll edir?')} optionalText={optionalText}>
                          <textarea
                            id="ht-problem"
                            className="ds-textarea ht-textarea-sm"
                            rows="2"
                            placeholder={t('talents.step3.problemPlaceholder', 'Məs: İnsanların vaxt itkisini azaldır, keyfiyyətli təhsili əlçatan edir...')}
                            value={formData.problemSolved}
                            onChange={setField('problemSolved')}
                          />
                        </Field>
                        <Field id="ht-audience" label={t('talents.step3.targetAudience', 'Bu ideyanın kimə faydası ola bilər?')} optionalText={optionalText}>
                          <textarea
                            id="ht-audience"
                            className="ds-textarea ht-textarea-sm"
                            rows="2"
                            placeholder={t('talents.step3.targetPlaceholder', 'Məs: Tələbələrə, kiçik bizneslərə, sənətsevərlərə...')}
                            value={formData.targetAudience}
                            onChange={setField('targetAudience')}
                          />
                        </Field>
                      </div>

                      <div className="ht-grid-2">
                        <Field id="ht-progress" label={t('talents.step3.currentProgress', 'İndiyə qədər bu ideya üçün nə etmisən?')} optionalText={optionalText}>
                          <input
                            id="ht-progress"
                            className="ds-input"
                            type="text"
                            placeholder={t('talents.step3.progressPlaceholder', 'Məs: Plan cızmışam, prototip hazırlamışam, hələ başlamamışam...')}
                            value={formData.currentProgress}
                            onChange={setField('currentProgress')}
                          />
                        </Field>
                        <Field id="ht-goal" label={t('talents.step3.mainGoal', 'Sənin bu layihədə əsas məqsədin nədir?')} optionalText={optionalText}>
                          <input
                            id="ht-goal"
                            className="ds-input"
                            type="text"
                            placeholder={t('talents.step3.goalPlaceholder', 'Məs: Öz biznesimi qurmaq, dünyaya səs salmaq, təqaüd almaq...')}
                            value={formData.mainGoal}
                            onChange={setField('mainGoal')}
                          />
                        </Field>
                      </div>
                    </>
                  )}

                  {/* ── STEP 4: MEDIA & FILES ── */}
                  {currentStep === 4 && (
                    <>
                      {/* Voice note */}
                      <section className="ht-media" aria-labelledby="ht-voice-title">
                        <div className="ht-media__head">
                          <span className="ht-media__icon">
                            <Mic aria-hidden />
                          </span>
                          <div>
                            <h3 id="ht-voice-title" className="ds-h3">{plain(t('talents.step4.voiceTitle', 'Səsli izah et'))}</h3>
                            <p className="ds-muted">{plain(t('talents.step4.voiceDesc', 'Yazmaq yerinə fikrini rahatca danışaraq izah etmək istəyirsənsə, birbaşa brauzerdən qeyd et.'))}</p>
                          </div>
                        </div>

                        <div className="ht-media__action">
                          {isRecording ? (
                            <div className="ht-rec">
                              <span className="ht-rec__dot" aria-hidden />
                              <span className="ht-rec__time">{formatTimer(recordingTime)}</span>
                              <button type="button" className="ds-btn ds-btn--danger" onClick={stopRecording}>
                                <Square aria-hidden />
                                {plain(t('talents.step4.stopRecording', 'Səsi dayandır və saxla'))}
                              </button>
                            </div>
                          ) : audioBlobUrl ? (
                            <div className="ht-playback">
                              <audio controls src={audioBlobUrl} className="ht-playback__audio" />
                              <div className="ht-playback__row">
                                <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={resetRecording}>
                                  <RotateCcw aria-hidden />
                                  {plain(t('talents.step4.rerecord', 'Yenidən yaz'))}
                                </button>
                                {isUploadingVoice && (
                                  <span className="ds-badge" role="status">{plain(t('talents.step4.uploadingVoice', 'Yüklənir...'))}</span>
                                )}
                                {!isUploadingVoice && formData.voiceNoteUrl && (
                                  <span className="ds-badge ds-badge--success">
                                    <Check aria-hidden />
                                    {plain(t('talents.step7.voiceAttached', 'Səs yazısı əlavə edildi'))}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button type="button" className="ds-btn ds-btn--secondary" onClick={startRecording}>
                              <Mic aria-hidden />
                              {plain(t('talents.step4.startRecording', 'Səsli izah etməyə başla'))}
                            </button>
                          )}
                        </div>
                      </section>

                      {/* Files */}
                      <section className="ht-files" aria-labelledby="ht-files-title">
                        <div className="ht-files__head">
                          <h3 id="ht-files-title" className="ds-label">{plain(t('talents.stepShort.4', 'Fayllar'))}</h3>
                        </div>
                        <div
                          className="ht-dropzone"
                          data-dragging={isDragging ? 'true' : undefined}
                          role="button"
                          tabIndex={0}
                          aria-describedby="ht-dropzone-desc"
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFilesSelect(e.dataTransfer.files);
                          }}
                          onClick={openFilePicker}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openFilePicker();
                            }
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            hidden
                            tabIndex={-1}
                            onChange={(e) => handleFilesSelect(e.target.files)}
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                          />
                          <span className="ht-dropzone__icon">
                            <Upload aria-hidden />
                          </span>
                          <span className="ht-dropzone__title">{plain(t('talents.step4.dropzoneTitle', 'Faylları buraya sürükləyin və ya seçmək üçün klikləyin'))}</span>
                          <span className="ht-dropzone__desc" id="ht-dropzone-desc">{plain(t('talents.step4.dropzoneDesc', 'İstənilən formatda iş nümunələri, eskizlər, təqdimatlar və ya sənədlər'))}</span>
                          {isUploadingFile && (
                            <span className="ds-badge ds-badge--brand" role="status">{plain(t('talents.step4.uploadingFiles', 'Fayllar yüklənir...'))}</span>
                          )}
                        </div>

                        {formData.uploadedFiles.length > 0 && (
                          <ul className="ht-filelist">
                            {formData.uploadedFiles.map((file, idx) => (
                              <li key={idx} className="ht-file">
                                <FileText aria-hidden className="ht-file__icon" />
                                <span className="ht-file__meta">
                                  <span className="ht-file__name">{file.name}</span>
                                  <span className="ht-file__size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </span>
                                <button
                                  type="button"
                                  className="ds-btn ds-btn--ghost ds-btn--sm ht-file__remove"
                                  onClick={() => removeFile(idx)}
                                  aria-label={`${t('pages.talents.removeFile', 'Faylı sil')}: ${file.name}`}
                                >
                                  <X aria-hidden />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      <Field id="ht-video" label={t('talents.step4.videoUrl', 'Video Linki')} optionalText="YouTube / Vimeo / Loom / Drive">
                        <input
                          id="ht-video"
                          className="ds-input"
                          type="url"
                          placeholder={t('talents.step4.videoPlaceholder', 'https://www.youtube.com/watch?v=...')}
                          value={formData.videoUrl}
                          onChange={setField('videoUrl')}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 5: NEEDS & RESOURCES ── */}
                  {currentStep === 5 && (
                    <>
                      <fieldset className="ht-fieldset">
                        <legend className="ds-label">{t('talents.step5.estInvestment', 'Təxminən nə qədər investisiya lazım olduğunu düşünürsən?')}</legend>
                        <div className="ht-choices">
                          {investmentOptions.map((opt) => (
                            <label key={opt} className="ht-option ht-choice" data-checked={formData.estimatedInvestment === opt ? 'true' : undefined}>
                              <input
                                type="radio"
                                name="ht-investment"
                                className="ht-sr"
                                value={opt}
                                checked={formData.estimatedInvestment === opt}
                                onChange={() => setFormData((prev) => ({ ...prev, estimatedInvestment: opt }))}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                        {formData.estimatedInvestment === customAmountOption && (
                          <input
                            className="ds-input ht-custom-amount"
                            type="text"
                            aria-label={t('talents.step5.customAmountPlaceholder', 'Dəqiq məbləği qeyd edin (məs: 7,500 AZN)')}
                            placeholder={t('talents.step5.customAmountPlaceholder', 'Dəqiq məbləği qeyd edin (məs: 7,500 AZN)')}
                            value={formData.customInvestmentAmount}
                            onChange={setField('customInvestmentAmount')}
                          />
                        )}
                      </fieldset>

                      <fieldset className="ht-fieldset">
                        <legend className="ds-label">
                          {t('talents.step5.supportTypes', 'Sənə hansı dəstək növləri lazımdır?')}{' '}
                          <span className="ht-opt">{t('talents.step5.multiSelectNote', 'Birdən çox seçə bilərsən')}</span>
                        </legend>
                        <div className="ht-tiles">
                          {supportTypes.map((supp) => {
                            const isSelected = (formData.neededSupportTypes || []).includes(supp.id);
                            const Icon = supp.icon;
                            return (
                              <label key={supp.id} className="ht-option ht-tile" data-checked={isSelected ? 'true' : undefined}>
                                <input
                                  type="checkbox"
                                  className="ht-sr"
                                  checked={isSelected}
                                  onChange={() => toggleSupportType(supp.id)}
                                />
                                <Icon aria-hidden className="ht-tile__icon" />
                                <span className="ht-tile__label">{plain(supp.label)}</span>
                                <span className="ht-tile__check" aria-hidden>
                                  <Check />
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      <Field id="ht-other" label={t('talents.step5.otherNeeds', 'Başqa nə lazımdır?')} optionalText={optionalText}>
                        <textarea
                          id="ht-other"
                          className="ds-textarea"
                          rows="3"
                          placeholder={t('talents.step5.otherNeedsPlaceholder', 'Məs: Güclü kompüter, xüsusi boyalar, laboratoriya avadanlığı, studiya vaxtı və s.')}
                          value={formData.otherNeeds}
                          onChange={setField('otherNeeds')}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 6: TEAM & FUTURE ── */}
                  {currentStep === 6 && (
                    <>
                      <fieldset className="ht-fieldset">
                        <legend className="ds-label">{t('talents.step6.teamQuestion', 'Bu ideyanı birlikdə etdiyin biri varmı?')}</legend>
                        <div className="ht-tiles ht-tiles--team">
                          {teamStatuses.map((tItem) => {
                            const Icon = tItem.icon;
                            return (
                              <label key={tItem.id} className="ht-option ht-tile" data-checked={formData.teamStatus === tItem.id ? 'true' : undefined}>
                                <input
                                  type="radio"
                                  name="ht-teamStatus"
                                  className="ht-sr"
                                  value={tItem.id}
                                  checked={formData.teamStatus === tItem.id}
                                  onChange={() => setFormData((prev) => ({ ...prev, teamStatus: tItem.id }))}
                                />
                                <Icon aria-hidden className="ht-tile__icon" />
                                <span className="ht-tile__label">{plain(tItem.label)}</span>
                              </label>
                            );
                          })}
                        </div>

                        {formData.teamStatus !== 'Solo' && (
                          <div className="ht-grid-2 ht-team-extra">
                            <Field id="ht-teamSize" label={t('talents.step6.teamSize', 'Komanda üzvlərinin sayı')}>
                              <input
                                id="ht-teamSize"
                                className="ds-input"
                                type="number"
                                inputMode="numeric"
                                placeholder="Məs: 3"
                                value={formData.teamSize}
                                onChange={setField('teamSize')}
                              />
                            </Field>
                            <Field id="ht-teamRoles" label={t('talents.step6.teamRoles', 'Rolları')}>
                              <input
                                id="ht-teamRoles"
                                className="ds-input"
                                type="text"
                                placeholder="Məs: 1 Dizayner, 1 Proqramçı"
                                value={formData.teamRoles}
                                onChange={setField('teamRoles')}
                              />
                            </Field>
                          </div>
                        )}
                      </fieldset>

                      <Field id="ht-vision" label={t('talents.step6.oneYearVision', '1 il sonra özünü və layihəni harada görürsən?')} optionalText={optionalText}>
                        <textarea
                          id="ht-vision"
                          className="ds-textarea ht-textarea-sm"
                          rows="2"
                          placeholder={t('talents.step6.visionPlaceholder', 'Məs: İlk 1,000 istifadəçiyə çatmış, xaricdə sərgidə iştirak edən, gəlir əldə edən...')}
                          value={formData.oneYearVision}
                          onChange={setField('oneYearVision')}
                        />
                      </Field>

                      <div className="ht-grid-2">
                        <Field id="ht-income" label={t('talents.step6.wantIncome', 'Bu bacarıqdan gəlir əldə etmək istəyirsən?')}>
                          <select id="ht-income" className="ds-select" value={formData.wantIncome} onChange={setField('wantIncome')}>
                            <option value="Bəli">{t('talents.general.yes', 'Bəli')}</option>
                            <option value="Xeyr">{t('talents.general.no', 'Xeyr')}</option>
                            <option value="Hələ qərar verməmişəm">{t('talents.general.undecided', 'Hələ qərar verməmişəm')}</option>
                          </select>
                        </Field>
                        <Field id="ht-business" label={t('talents.step6.wantBusiness', 'Bu layihəni biznesə çevirmək istəyirsən?')}>
                          <select id="ht-business" className="ds-select" value={formData.wantBusiness} onChange={setField('wantBusiness')}>
                            <option value="Bəli">{t('talents.general.yes', 'Bəli')}</option>
                            <option value="Xeyr">{t('talents.general.no', 'Xeyr')}</option>
                            <option value="Bilmirəm">{t('talents.general.dontKnow', 'Bilmirəm')}</option>
                          </select>
                        </Field>
                      </div>

                      <Field id="ht-ambition" label={t('talents.step6.ultimateAmbition', 'Sənin üçün ən böyük xəyal / məqsəd nədir?')}>
                        <textarea
                          id="ht-ambition"
                          className="ds-textarea"
                          rows="3"
                          placeholder={t('talents.step6.ambitionPlaceholder', 'Məs: Öz sahəmdə qlobal səviyyədə tanınmaq və dünyanı dəyişdirəcək bir məhsul buraxmaq...')}
                          value={formData.ultimateAmbition}
                          onChange={setField('ultimateAmbition')}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 7: REVIEW & SUBMIT ── */}
                  {currentStep === 7 && (
                    <>
                      <section className="ht-summary" aria-labelledby="ht-summary-title">
                        <h3 id="ht-summary-title" className="ds-h3">{plain(t('talents.step7.summaryTitle', 'Müraciət İcmalı'))}</h3>
                        <dl className="ht-summary__grid">
                          <div>
                            <dt>{t('talents.step7.fullName', 'Ad, Soyad:')}</dt>
                            <dd>{`${formData.firstName} ${formData.lastName}`.trim() || '—'}</dd>
                          </div>
                          <div>
                            <dt>{t('talents.step7.contact', 'Əlaqə:')}</dt>
                            <dd>{formData.phone || formData.email || '—'}</dd>
                          </div>
                          <div>
                            <dt>{t('talents.step7.skill', 'Bacarıq:')}</dt>
                            <dd>
                              {formData.skillName || '—'} ({plain(skillLevels.find((l) => l.id === formData.skillLevel)?.label || formData.skillLevel)})
                            </dd>
                          </div>
                          <div>
                            <dt>{t('talents.step7.investment', 'İnvestisiya Ehtiyacı:')}</dt>
                            <dd>{(formData.estimatedInvestment === customAmountOption ? formData.customInvestmentAmount : formData.estimatedInvestment) || '—'}</dd>
                          </div>
                          {formData.uploadedFiles.length > 0 && (
                            <div className="ht-summary__full">
                              <dt>{t('talents.step7.filesCount', 'Əlavə edilmiş fayllar:')}</dt>
                              <dd>{formData.uploadedFiles.length} {plain(t('talents.filesUploadedSuccess', 'fayl yükləndi'))}</dd>
                            </div>
                          )}
                          {formData.voiceNoteUrl && (
                            <div className="ht-summary__full">
                              <dt>{plain(t('talents.step4.voiceTitle', 'Səsli izah'))}:</dt>
                              <dd>{plain(t('talents.step7.voiceAttached', 'Səs yazısı əlavə edildi'))}</dd>
                            </div>
                          )}
                        </dl>
                      </section>

                      <div className="ht-privacy">
                        <ShieldCheck aria-hidden />
                        <p>
                          {t('talents.step7.privacyText', 'Paylaşdığın məlumatlar yalnız Edusaza komandası tərəfindən müraciətini qiymətləndirmək və səninlə əlaqə saxlamaq məqsədilə istifadə olunacaq.')}{' '}
                          <button
                            type="button"
                            className="ht-linkbtn"
                            onClick={() => { alert('Edusaz Privacy Policy: All personal data and project ideas are encrypted and never shared with third parties without consent.'); }}
                          >
                            {t('talents.step7.privacyLink', 'Məxfilik Siyasəti')}
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer controls */}
                <div className="ht-footer">
                  {currentStep > 1 && (
                    <button type="button" className="ds-btn ds-btn--ghost" onClick={handlePrev}>
                      <ArrowLeft aria-hidden className="ht-dir" />
                      {plain(t('talents.general.back', 'Geri'))}
                    </button>
                  )}
                  <span className="ht-footer__spacer" />
                  {currentStep < 7 ? (
                    <button type="submit" className="ds-btn ds-btn--primary">
                      {plain(t('talents.general.next', 'Növbəti'))}
                      <ArrowRight aria-hidden className="ht-dir" />
                    </button>
                  ) : (
                    <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg" disabled={isSubmitting} aria-busy={isSubmitting || undefined}>
                      {isSubmitting ? (
                        plain(t('talents.step7.submitting', 'Göndərilir...'))
                      ) : (
                        <>
                          <Send aria-hidden />
                          {plain(t('talents.step7.submitBtn', 'Bacarığımı göndər'))}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ id, label, req, optionalText, error, children }) {
  return (
    <div className="ds-field">
      <label className="ds-label ht-label" htmlFor={id}>
        <span>
          {label}
          {req && <span className="ht-req" aria-hidden> *</span>}
        </span>
        {optionalText && <span className="ht-opt">{optionalText}</span>}
      </label>
      {children}
      {error && (
        <p className="ds-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default HiddenTalentsPage;
