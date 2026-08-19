import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubmitHiddenTalentMutation, useUploadTalentFileMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

function HiddenTalentsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [submitTalent, { isLoading: isSubmitting }] = useSubmitHiddenTalentMutation();
  const [uploadFileApi] = useUploadTalentFileMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Steps definition with reactive translations
  const steps = [
    { id: 1, title: t('talents.step1.title', 'Əvvəlcə səni tanıyaq'), short: t('talents.stepShort.1', 'Şəxsi'), icon: '👤' },
    { id: 2, title: t('talents.step2.title', 'İndi isə sənin bacarığın haqqında danışaq'), short: t('talents.stepShort.2', 'Bacarıq'), icon: '✨' },
    { id: 3, title: t('talents.step3.title', 'Bunu reallaşdırsaydın, nə edərdin?'), short: t('talents.stepShort.3', 'İdeya'), icon: '💡' },
    { id: 4, title: t('talents.step4.title', 'Bacardığını bizə göstər'), short: t('talents.stepShort.4', 'Fayllar'), icon: '📁' },
    { id: 5, title: t('talents.step5.title', 'Bunu reallaşdırmaq üçün sənə nə lazımdır?'), short: t('talents.stepShort.5', 'Resurs'), icon: '🎯' },
    { id: 6, title: t('talents.step6.title', 'Bu bacarığın gələcəyini necə görürsən?'), short: t('talents.stepShort.6', 'Gələcək'), icon: '🚀' },
    { id: 7, title: t('talents.step7.title', 'Bəlkə də axtardığımız insan sənsən.'), short: t('talents.stepShort.7', 'Təsdiq'), icon: '🤝' },
  ];

  const skillLevels = [
    { id: 'Yeni başlayıram', label: t('talents.skillLevels.1.label', 'Yeni başlayıram'), icon: '🌱', desc: t('talents.skillLevels.1.desc', 'Sadəcə öyrənməyə və kəşf etməyə başlamışam') },
    { id: 'Başlanğıc', label: t('talents.skillLevels.2.label', 'Başlanğıc'), icon: '🚀', desc: t('talents.skillLevels.2.desc', 'Baza anlayışım və ilk təcrübələrim var') },
    { id: 'Orta', label: t('talents.skillLevels.3.label', 'Orta səviyyə'), icon: '⚡', desc: t('talents.skillLevels.3.desc', 'Müstəqil nələrsə yarada və tətbiq edə bilirəm') },
    { id: 'Yaxşı', label: t('talents.skillLevels.4.label', 'Yaxşı'), icon: '🌟', desc: t('talents.skillLevels.4.desc', 'Sahəmi yaxşı bilirəm və keyfiyyətli işlər çıxarıram') },
    { id: 'Peşəkar', label: t('talents.skillLevels.5.label', 'Peşəkar'), icon: '👑', desc: t('talents.skillLevels.5.desc', 'Real layihələr, müştərilər və ya təcrübəm var') },
    { id: 'Çox yüksək səviyyə', label: t('talents.skillLevels.6.label', 'Ekspert / Usta'), icon: '🔥', desc: t('talents.skillLevels.6.desc', 'Bu sahədə fərqlənirəm və dərin biliyim var') }
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
    { id: 'Maliyyə', label: t('talents.supportList.finance', 'Maliyyə / Qrant'), icon: '💰' },
    { id: 'Mentor', label: t('talents.supportList.mentor', 'Mentor / Məsləhət'), icon: '🎓' },
    { id: 'Təhsil', label: t('talents.supportList.education', 'Təhsil / Təlimlər'), icon: '📚' },
    { id: 'Texniki dəstək', label: t('talents.supportList.tech', 'Texniki / Proqram təminatı'), icon: '💻' },
    { id: 'Komanda', label: t('talents.supportList.team', 'Komanda üzvü / Həmtəsisçi'), icon: '👥' },
    { id: 'Marketinq', label: t('talents.supportList.marketing', 'Marketinq & Reklam'), icon: '📣' },
    { id: 'Dizayn', label: t('talents.supportList.design', 'Dizayn & Brendinq'), icon: '🎨' },
    { id: 'Avadanlıq', label: t('talents.supportList.equipment', 'Avadanlıq & Alətlər'), icon: '⚙️' },
    { id: 'Məkan', label: t('talents.supportList.office', 'Ofis / İş məkanı'), icon: '🏢' },
    { id: 'Hüquqi dəstək', label: t('talents.supportList.legal', 'Hüquqi & Patent dəstəyi'), icon: '⚖️' },
    { id: 'Biznes plan', label: t('talents.supportList.businessPlan', 'Biznes plan & Strategiya'), icon: '📈' },
    { id: 'İnvestor tapmaq', label: t('talents.supportList.investor', 'İnvestor əlaqələri'), icon: '🤝' },
    { id: 'Digər', label: t('talents.supportList.other', 'Digər dəstək'), icon: '💡' }
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
  ];

  // Form State
  const [formData, setFormData] = useState({
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
  });

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
      toast?.showError ? toast.showError(t('talents.voiceError', 'Mikrofon icazəsi verilmədi və ya cihaz dəstəklənmir.')) : alert('Mikrofon icazəsi verilmədi.');
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
        toast?.showSuccess ? toast.showSuccess(t('talents.voiceSuccess', 'Səsli izah uğurla yadda saxlanıldı!')) : null;
      }
    } catch (err) {
      console.error('Audio upload error:', err);
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
      toast?.showSuccess ? toast.showSuccess(`${files.length} ${t('talents.filesUploadedSuccess', 'fayl uğurla əlavə edildi.')}`) : null;
    } catch (err) {
      console.error('File upload error:', err);
      toast?.showError ? toast.showError(t('talents.fileUploadError', 'Fayl yükləmə zamanı xəta baş verdi.')) : null;
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

  // Step Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.firstName.trim()) {
        toast?.showError ? toast.showError(t('talents.errors.firstName', 'Zəhmət olmasa adınızı daxil edin.')) : alert('Ad daxil edin.');
        return false;
      }
      if (!formData.lastName.trim()) {
        toast?.showError ? toast.showError(t('talents.errors.lastName', 'Zəhmət olmasa soyadınızı daxil edin.')) : alert('Soyad daxil edin.');
        return false;
      }
      if (!formData.phone.trim() && !formData.email.trim()) {
        toast?.showError ? toast.showError(t('talents.errors.contact', 'Əlaqə üçün ən azı telefon nömrəsi və ya e-mail daxil edin.')) : alert('Telefon və ya e-mail daxil edin.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.skillName.trim()) {
        toast?.showError ? toast.showError(t('talents.errors.skill', 'Zəhmət olmasa bacarığınız və ya istedadınız haqqında qısa məlumat yazın.')) : alert('Bacarığınızı yazın.');
        return false;
      }
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
      const msg = err?.data?.message || t('talents.submitError', 'Müraciət göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.');
      toast?.showError ? toast.showError(msg) : alert(msg);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hidden-talents-page">
      <ScrollToTop />

      {/* 1. HERO SECTION */}
      <section className="ht-hero">
        <div className="ht-hero__ambient" />
        <div className="container ht-hero__container">
          <div className="ht-hero__badge">
            <span className="sparkle-icon">✨</span> {t('talents.badge', 'Edusaz İstedad & İdeya İnkubatoru')}
          </div>

          <h1 className="ht-hero__title">
            {t('talents.heroTitle', 'Səndə hansı')}{' '}
            <span className="ht-hero__highlight">{t('talents.heroHighlight', 'gizli bacarıq')}</span>{' '}
            {t('talents.heroTitleEnd', 'var?')}
          </h1>

          <p className="ht-hero__subtitle">
            {t('talents.heroSubtitle', 'Bəlkə yaxşı rəsm çəkirsən, maraqlı ideyan var, nəsə yaradırsan, bir layihə düşünmüsən və ya sadəcə bacarığının necə böyük bir işə çevrilə biləcəyini bilmirsən. Bizə danış. Sən bacarığını paylaş, Edusaza isə onu reallaşdırmağın yollarını səninlə birlikdə axtarsın.')}
          </p>

          <div className="ht-hero__actions">
            <button className="ht-btn ht-btn--primary" onClick={scrollToForm}>
              <span>{t('talents.shareTalent', 'Bacarığımı paylaş')}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button className="ht-btn ht-btn--secondary" onClick={() => setShowHowItWorks(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{t('talents.howItWorks', 'Necə işləyir?')}</span>
            </button>
          </div>

          {/* Inspiration Floating Tags */}
          <div className="ht-hero__tags">
            <span className="tags-label">{t('talents.getInspired', 'İlham al:')}</span>
            <div className="tags-scroll">
              {inspirationTags.map((tag) => (
                <button
                  key={tag}
                  className="inspiration-pill"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      skillName: prev.skillName ? `${prev.skillName}, ${tag.split(' ')[1] || tag}` : tag.split(' ').slice(1).join(' ') || tag
                    }));
                    scrollToForm();
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN FORM SECTION */}
      <section className="ht-form-section" ref={formSectionRef}>
        <div className="container">
          {/* Trust Banner */}
          {!isSubmitted && (
            <div className="ht-trust-banner">
              <div className="ht-trust-banner__icon">💡</div>
              <div className="ht-trust-banner__content">
                <h4>{t('talents.trustBannerTitle', 'Nə qədər çox məlumat paylaşsan, səni və ideyanı bir o qədər yaxşı anlaya bilərik.')}</h4>
                <p>{t('talents.trustBannerDesc', 'Hər sahəni doldurmaq məcburi deyil. Sənin üçün vacib olan məlumatları paylaş. Qalanını birlikdə tamamlayarıq.')}</p>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {isSubmitted ? (
            <div className="ht-success-card">
              <div className="ht-success-card__icon-wrap">
                <div className="ht-success-card__celebrate">🎉</div>
                <div className="ht-success-card__rocket">🚀</div>
              </div>

              <h2 className="ht-success-card__title">{t('talents.success.title', 'Bacarığını bizimlə paylaşdın. İndi növbə bizdədir!')}</h2>
              <p className="ht-success-card__desc">
                {t('talents.success.desc', 'Məlumatlarını və ideyanı qəbul etdik. Komandamız paylaşdığın bacarıq və layihəni diqqətlə nəzərdən keçirəcək. Əgər səninlə birlikdə bu ideyanı inkişaf etdirə biləcəyimizə inanırıqsa, ən qısa zamanda əlaqə saxlayacağıq.')}
              </p>

              {/* Review Timeline */}
              <div className="ht-timeline">
                <div className="ht-timeline__item done">
                  <div className="ht-timeline__dot">✓</div>
                  <div className="ht-timeline__info">
                    <h5>{t('talents.success.timeline1Title', 'Müraciət Göndərildi')}</h5>
                    <span>{t('talents.success.timeline1Desc', 'Bütün məlumat və fayllarınız təhlükəsiz qeydə alındı')}</span>
                  </div>
                </div>
                <div className="ht-timeline__item active">
                  <div className="ht-timeline__dot">2</div>
                  <div className="ht-timeline__info">
                    <h5>{t('talents.success.timeline2Title', 'Komanda Baxışı')}</h5>
                    <span>{t('talents.success.timeline2Desc', 'Mütəxəssislərimiz bacarıq və resurs ehtiyaclarını analiz edir (24-48 saat)')}</span>
                  </div>
                </div>
                <div className="ht-timeline__item">
                  <div className="ht-timeline__dot">3</div>
                  <div className="ht-timeline__info">
                    <h5>{t('talents.success.timeline3Title', 'Əlaqə & Görüş')}</h5>
                    <span>{t('talents.success.timeline3Desc', 'Sizinlə onlayn və ya ofisimizdə görüş təyin edib yol xəritəsini qururuq')}</span>
                  </div>
                </div>
              </div>

              <div className="ht-success-card__actions">
                <Link to="/" className="ht-btn ht-btn--primary">
                  {t('talents.success.returnHome', 'Edusazaya qayıt')}
                </Link>
                <button
                  className="ht-btn ht-btn--ghost"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                    setFormData({
                      firstName: '', lastName: '', phone: '', email: '', age: '', cityCountry: '', socialLinks: '',
                      skillName: '', experienceDuration: '', skillLevel: 'Orta', whereUsed: '', whatCreated: '',
                      ideaDescription: '', problemSolved: '', targetAudience: '', currentProgress: '', mainGoal: '',
                      dynamicCategoryQuestion: '', dynamicCategoryAnswer: '',
                      voiceNoteUrl: '', videoUrl: '', uploadedFiles: [],
                      estimatedInvestment: 'Bilmirəm', customInvestmentAmount: '', neededSupportTypes: ['Mentor', 'Maliyyə'], otherNeeds: '',
                      teamStatus: 'Solo', teamSize: '', teamRoles: '', teamNotes: '',
                      oneYearVision: '', wantIncome: 'Bəli', wantBusiness: 'Bəli', ultimateAmbition: ''
                    });
                  }}
                >
                  {t('talents.success.newSubmission', 'Yeni bacarıq əlavə et')}
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-STEP WIZARD CONTAINER */
            <div className="ht-wizard-card">
              {/* Wizard Steps Progress Header */}
              <div className="ht-steps-header">
                <div className="ht-steps-progress-bar">
                  <div
                    className="ht-steps-progress-fill"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="ht-steps-nav">
                  {steps.map((s) => {
                    const isPassed = s.id < currentStep;
                    const isActive = s.id === currentStep;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`ht-step-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                        onClick={() => {
                          if (isPassed || s.id === currentStep) {
                            setCurrentStep(s.id);
                          }
                        }}
                      >
                        <div className="ht-step-node__circle">
                          {isPassed ? '✓' : s.icon}
                        </div>
                        <span className="ht-step-node__text">{s.short}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="ht-steps-counter">
                  {t('talents.general.stage', 'Mərhələ')} {currentStep} / {steps.length}
                </div>
              </div>

              {/* FORM CONTENT BODY */}
              <div className="ht-wizard-body">
                {/* ── STEP 1: ŞƏXSİ MƏLUMATLAR ── */}
                {currentStep === 1 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 1</span>
                      <h3 className="ht-step-title">{t('talents.step1.title', 'Əvvəlcə səni tanıyaq')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step1.desc', 'Səninlə necə əlaqə saxlaya biləcəyimizi bilmək istəyirik. Qorxma, məlumatların tam məxfi saxlanılır.')}
                      </p>
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step1.firstName', 'Adın')} <span className="req">*</span></label>
                        <input
                          type="text"
                          placeholder="Məs: Cavid"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step1.lastName', 'Soyadın')} <span className="req">*</span></label>
                        <input
                          type="text"
                          placeholder="Məs: Əliyev"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step1.phone', 'Telefon nömrən')} <span className="req">*</span></label>
                        <input
                          type="tel"
                          placeholder="+994 50 123 45 67"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step1.email', 'E-mail ünvanın')} <span className="req">*</span></label>
                        <input
                          type="email"
                          placeholder="cavid.aliyev@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step1.age', 'Yaşın')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <input
                          type="number"
                          placeholder="Məs: 21"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step1.cityCountry', 'Şəhər / Ölkə')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <input
                          type="text"
                          placeholder="Məs: Bakı, Azərbaycan"
                          value={formData.cityCountry}
                          onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step1.socialLinks', 'Sosial media və ya Portfolio linklərin')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <input
                        type="text"
                        placeholder="Məs: Instagram / LinkedIn / Behance / GitHub"
                        value={formData.socialLinks}
                        onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 2: BACARIĞIN HAQQINDA ── */}
                {currentStep === 2 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 2</span>
                      <h3 className="ht-step-title">{t('talents.step2.title', 'İndi isə sənin bacarığın haqqında danışaq')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step2.desc', 'Səni ən çox həyəcanlandıran və saatlarla məşğul ola biləcəyin bacarıq və ya istedadın nədir?')}
                      </p>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step2.skillName', 'Bacarığın / istedadın nədir?')} <span className="req">*</span></label>
                      <textarea
                        rows="3"
                        placeholder={t('talents.step2.skillPlaceholder', 'Məsələn: rəsm çəkmək, musiqi bəstələmək, proqramlaşdırma, qrafik dizayn, əl işi, video montaj, biznes ideyası, idman, tədris və s.')}
                        value={formData.skillName}
                        onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step2.experienceDuration', 'Bu bacarığı nə vaxtdan edirsən?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <input
                        type="text"
                        placeholder={t('talents.step2.expPlaceholder', 'Məsələn: 6 aydır, 3 ildir, uşaqlıqdan bəri')}
                        value={formData.experienceDuration}
                        onChange={(e) => setFormData({ ...formData, experienceDuration: e.target.value })}
                      />
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step2.skillLevel', 'Özünü bu sahədə necə qiymətləndirirsən?')}</label>
                      <div className="ht-skill-levels-grid">
                        {skillLevels.map((lvl) => (
                          <div
                            key={lvl.id}
                            className={`ht-level-card ${formData.skillLevel === lvl.id ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, skillLevel: lvl.id })}
                          >
                            <div className="ht-level-card__icon">{lvl.icon}</div>
                            <div className="ht-level-card__title">{lvl.label}</div>
                            <div className="ht-level-card__desc">{lvl.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step2.whereUsed', 'Bu bacarığı harada və necə istifadə etmisən?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <textarea
                        rows="2"
                        placeholder={t('talents.step2.wherePlaceholder', 'Məs: Dostlarıma kömək edəndə, universitet layihəsində, şəxsi səhifəmdə, yarışmada...')}
                        value={formData.whereUsed}
                        onChange={(e) => setFormData({ ...formData, whereUsed: e.target.value })}
                      />
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step2.whatCreated', 'İndiyə qədər nə yaratmısan?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <textarea
                        rows="2"
                        placeholder={t('talents.step2.whatPlaceholder', 'Məs: Bir neçə portret çəkmişəm, sadə mobil tətbiq kodlamışam, 5 mahnı aranjeman etmişəm...')}
                        value={formData.whatCreated}
                        onChange={(e) => setFormData({ ...formData, whatCreated: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 3: İDEYAN ── */}
                {currentStep === 3 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 3</span>
                      <h3 className="ht-step-title">{t('talents.step3.title', 'Bunu reallaşdırsaydın, nə edərdin?')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step3.desc', 'Ağlına gələn hər şeyi yaz. Fikrin tam hazır olmasına ehtiyac yoxdur. Əsas sənin baxış bucağındır.')}
                      </p>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step3.ideaDesc', 'İdeyanı və ya xəyalındakı layihəni ətraflı izah et')}</label>
                      <textarea
                        rows="4"
                        placeholder={t('talents.step3.ideaPlaceholder', 'Məs: Mən istəyirəm ki, gənclər üçün xüsusi interaktiv platforma quraq və ya öz çəkdiyim rəsmlərdən ibarət qlobal sərgi açaq...')}
                        value={formData.ideaDescription}
                        onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
                      />
                    </div>

                    {/* AI Dynamic Smart Follow-up Box */}
                    <div className="ht-ai-smart-box">
                      <div className="ht-ai-smart-box__header">
                        <span className="ai-badge">🤖 {t('talents.step3.aiBadge', 'Edusaz Ağıllı Sualı')}</span>
                        <p>{dynamicInfo.question}</p>
                      </div>
                      <div className="ht-ai-smart-box__options">
                        {dynamicInfo.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`smart-opt-btn ${formData.dynamicCategoryAnswer === opt ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, dynamicCategoryAnswer: opt })}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step3.problemSolved', 'Səncə bu ideya hansı problemi həll edir?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <textarea
                          rows="2"
                          placeholder={t('talents.step3.problemPlaceholder', 'Məs: İnsanların vaxt itkisini azaldır, keyfiyyətli təhsili əlçatan edir...')}
                          value={formData.problemSolved}
                          onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                        />
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step3.targetAudience', 'Bu ideyanın kimə faydası ola bilər?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <textarea
                          rows="2"
                          placeholder={t('talents.step3.targetPlaceholder', 'Məs: Tələbələrə, kiçik bizneslərə, sənətsevərlərə...')}
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step3.currentProgress', 'İndiyə qədər bu ideya üçün nə etmisən?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <input
                          type="text"
                          placeholder={t('talents.step3.progressPlaceholder', 'Məs: Plan cızmışam, prototip hazırlamışam, hələ başlamamışam...')}
                          value={formData.currentProgress}
                          onChange={(e) => setFormData({ ...formData, currentProgress: e.target.value })}
                        />
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step3.mainGoal', 'Sənin bu layihədə əsas məqsədin nədir?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                        <input
                          type="text"
                          placeholder={t('talents.step3.goalPlaceholder', 'Məs: Öz biznesimi qurmaq, dünyaya səs salmaq, təqaüd almaq...')}
                          value={formData.mainGoal}
                          onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: FAYLLAR & SƏSLİ İZAH ── */}
                {currentStep === 4 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 4</span>
                      <h3 className="ht-step-title">{t('talents.step4.title', 'Bacardığını bizə göstər')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step4.desc', 'Şəkil, video, səs, sənəd və ya ideyanı izah edən başqa materialın varsa, buraya əlavə et. Görmək anlamağın ən yaxşı yoludur.')}
                      </p>
                    </div>

                    {/* 1. Voice Note Recorder */}
                    <div className="ht-voice-recorder-card">
                      <div className="ht-voice-recorder-card__header">
                        <div className="voice-icon-wrap">🎙️</div>
                        <div>
                          <h4>{t('talents.step4.voiceTitle', 'Səsli izah et')}</h4>
                          <p>{t('talents.step4.voiceDesc', 'Yazmaq yerinə fikrini rahatca danışaraq izah etmək istəyirsənsə, birbaşa brauzerdən qeyd et.')}</p>
                        </div>
                      </div>

                      <div className="ht-voice-recorder-card__action">
                        {isRecording ? (
                          <div className="recording-active-view">
                            <div className="pulsating-rec-dot" />
                            <span className="rec-timer">{formatTimer(recordingTime)}</span>
                            <button type="button" className="ht-btn ht-btn--danger" onClick={stopRecording}>
                              {t('talents.step4.stopRecording', '⏹️ Səsi dayandır və saxla')}
                            </button>
                          </div>
                        ) : audioBlobUrl ? (
                          <div className="recording-playback-view">
                            <audio controls src={audioBlobUrl} className="custom-audio-player" />
                            <button type="button" className="ht-btn ht-btn--ghost-sm" onClick={resetRecording}>
                              {t('talents.step4.rerecord', '🔄 Yenidən yaz')}
                            </button>
                            {isUploadingVoice && <span className="voice-uploading-tag">{t('talents.step4.uploadingVoice', '⏳ Yüklənir...')}</span>}
                          </div>
                        ) : (
                          <button type="button" className="ht-btn ht-btn--voice" onClick={startRecording}>
                            <span>{t('talents.step4.startRecording', '🎙️ Səsli izah etməyə başla')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Drag & Drop Multi-file Uploader */}
                    <div className="ht-field">
                      <label>{t('talents.step4.dropzoneTitle', 'Faylları buraya sürükləyin və ya seçmək üçün klikləyin')} <span className="opt">Şəkil, Video, PDF, DOC, ZIP</span></label>
                      <div
                        className={`ht-dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleFilesSelect(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        <input
                          type="file"
                          multiple
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={(e) => handleFilesSelect(e.target.files)}
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                        />
                        <div className="ht-dropzone__icon">📤</div>
                        <h4>{t('talents.step4.dropzoneTitle', 'Faylları buraya sürükləyin və ya seçmək üçün klikləyin')}</h4>
                        <p>{t('talents.step4.dropzoneDesc', 'İstənilən formatda iş nümunələri, eskizlər, təqdimatlar və ya sənədlər')}</p>
                        {isUploadingFile && <div className="ht-dropzone__uploading">{t('talents.step4.uploadingFiles', 'Fayllar yüklənir... ⏳')}</div>}
                      </div>

                      {/* Uploaded Files Preview List */}
                      {formData.uploadedFiles.length > 0 && (
                        <div className="ht-uploaded-files-list">
                          {formData.uploadedFiles.map((file, idx) => (
                            <div key={idx} className="ht-file-item">
                              <span className="ht-file-item__icon">📄</span>
                              <div className="ht-file-item__meta">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                              </div>
                              <button type="button" className="file-del-btn" onClick={() => removeFile(idx)}>
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Video Link Input */}
                    <div className="ht-field">
                      <label>{t('talents.step4.videoUrl', 'Video Linki')} <span className="opt">YouTube / Vimeo / Loom / Drive</span></label>
                      <input
                        type="url"
                        placeholder={t('talents.step4.videoPlaceholder', 'https://www.youtube.com/watch?v=...')}
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 5: İNVESTİSİYA VƏ RESURS EHTİYACI ── */}
                {currentStep === 5 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 5</span>
                      <h3 className="ht-step-title">{t('talents.step5.title', 'Bunu reallaşdırmaq üçün sənə nə lazımdır?')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step5.desc', 'Xəyallarını həqiqətə çevirmək üçün hansı dəstəyə və ya resurslara ehtiyac duyursan?')}
                      </p>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step5.estInvestment', 'Təxminən nə qədər investisiya lazım olduğunu düşünürsən?')}</label>
                      <div className="ht-radio-pills-grid">
                        {investmentOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`ht-radio-pill ${formData.estimatedInvestment === opt ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, estimatedInvestment: opt })}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {formData.estimatedInvestment === t('talents.step5.customAmountOption', 'Dəqiq məbləği özüm yazım') && (
                        <div className="ht-custom-amount-input animate-fade-in">
                          <input
                            type="text"
                            placeholder={t('talents.step5.customAmountPlaceholder', 'Dəqiq məbləği qeyd edin (məs: 7,500 AZN)')}
                            value={formData.customInvestmentAmount}
                            onChange={(e) => setFormData({ ...formData, customInvestmentAmount: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step5.supportTypes', 'Sənə hansı dəstək növləri lazımdır?')} <span className="opt">{t('talents.step5.multiSelectNote', 'Birdən çox seçə bilərsən')}</span></label>
                      <div className="ht-support-types-grid">
                        {supportTypes.map((supp) => {
                          const isSelected = (formData.neededSupportTypes || []).includes(supp.id);
                          return (
                            <div
                              key={supp.id}
                              className={`ht-support-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleSupportType(supp.id)}
                            >
                              <div className="ht-support-card__checkbox">
                                {isSelected ? '✓' : ''}
                              </div>
                              <span className="ht-support-card__icon">{supp.icon}</span>
                              <span className="ht-support-card__label">{supp.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step5.otherNeeds', 'Başqa nə lazımdır?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <textarea
                        rows="3"
                        placeholder={t('talents.step5.otherNeedsPlaceholder', 'Məs: Güclü kompüter, xüsusi boyalar, laboratoriya avadanlığı, studiya vaxtı və s.')}
                        value={formData.otherNeeds}
                        onChange={(e) => setFormData({ ...formData, otherNeeds: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 6: KOMANDA VƏ GƏLƏCƏK PLAN ── */}
                {currentStep === 6 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-step-title-group">
                      <span className="ht-step-subtitle">{t('talents.general.stage', 'Mərhələ')} 6</span>
                      <h3 className="ht-step-title">{t('talents.step6.title', 'Bu bacarığın gələcəyini necə görürsən?')}</h3>
                      <p className="ht-step-desc">
                        {t('talents.step6.desc', 'Tək işləyirsən, yoxsa komandan var? Gələcək vizyonunu və planlarını bizimlə bölüş.')}
                      </p>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step6.teamQuestion', 'Bu ideyanı birlikdə etdiyin biri varmı?')}</label>
                      <div className="ht-team-status-grid">
                        {[
                          { id: 'Solo', label: t('talents.teamStatuses.solo', 'Tək işləyirəm'), icon: '👤' },
                          { id: 'Friends', label: t('talents.teamStatuses.friends', 'Dostlarım var'), icon: '🤝' },
                          { id: 'Team', label: t('talents.teamStatuses.team', 'Komandamız var'), icon: '👥' },
                          { id: 'Company', label: t('talents.teamStatuses.company', 'Şirkətimiz var'), icon: '🏢' },
                          { id: 'Other', label: t('talents.teamStatuses.other', 'Digər'), icon: '💡' }
                        ].map((tItem) => (
                          <button
                            key={tItem.id}
                            type="button"
                            className={`ht-team-card ${formData.teamStatus === tItem.id ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, teamStatus: tItem.id })}
                          >
                            <span className="team-icon">{tItem.icon}</span>
                            <span className="team-label">{tItem.label}</span>
                          </button>
                        ))}
                      </div>

                      {formData.teamStatus !== 'Solo' && (
                        <div className="ht-team-extra-fields animate-fade-in">
                          <div className="ht-grid-2">
                            <div className="ht-field">
                              <label>{t('talents.step6.teamSize', 'Komanda üzvlərinin sayı')}</label>
                              <input
                                type="number"
                                placeholder="Məs: 3"
                                value={formData.teamSize}
                                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                              />
                            </div>
                            <div className="ht-field">
                              <label>{t('talents.step6.teamRoles', 'Rolları')}</label>
                              <input
                                type="text"
                                placeholder="Məs: 1 Dizayner, 1 Proqramçı"
                                value={formData.teamRoles}
                                onChange={(e) => setFormData({ ...formData, teamRoles: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step6.oneYearVision', '1 il sonra özünü və layihəni harada görürsən?')} <span className="opt">{t('talents.general.optional', 'İstəsən paylaş')}</span></label>
                      <textarea
                        rows="2"
                        placeholder={t('talents.step6.visionPlaceholder', 'Məs: İlk 1,000 istifadəçiyə çatmış, xaricdə sərgidə iştirak edən, gəlir əldə edən...')}
                        value={formData.oneYearVision}
                        onChange={(e) => setFormData({ ...formData, oneYearVision: e.target.value })}
                      />
                    </div>

                    <div className="ht-grid-2">
                      <div className="ht-field">
                        <label>{t('talents.step6.wantIncome', 'Bu bacarıqdan gəlir əldə etmək istəyirsən?')}</label>
                        <select
                          value={formData.wantIncome}
                          onChange={(e) => setFormData({ ...formData, wantIncome: e.target.value })}
                        >
                          <option value="Bəli">{t('talents.general.yes', 'Bəli')}</option>
                          <option value="Xeyr">{t('talents.general.no', 'Xeyr')}</option>
                          <option value="Hələ qərar verməmişəm">{t('talents.general.undecided', 'Hələ qərar verməmişəm')}</option>
                        </select>
                      </div>

                      <div className="ht-field">
                        <label>{t('talents.step6.wantBusiness', 'Bu layihəni biznesə çevirmək istəyirsən?')}</label>
                        <select
                          value={formData.wantBusiness}
                          onChange={(e) => setFormData({ ...formData, wantBusiness: e.target.value })}
                        >
                          <option value="Bəli">{t('talents.general.yes', 'Bəli')}</option>
                          <option value="Xeyr">{t('talents.general.no', 'Xeyr')}</option>
                          <option value="Bilmirəm">{t('talents.general.dontKnow', 'Bilmirəm')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="ht-field">
                      <label>{t('talents.step6.ultimateAmbition', 'Sənin üçün ən böyük xəyal / məqsəd nədir?')}</label>
                      <textarea
                        rows="3"
                        placeholder={t('talents.step6.ambitionPlaceholder', 'Məs: Öz sahəmdə qlobal səviyyədə tanınmaq və dünyanı dəyişdirəcək bir məhsul buraxmaq...')}
                        value={formData.ultimateAmbition}
                        onChange={(e) => setFormData({ ...formData, ultimateAmbition: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 7: İCMAL VƏ EMOSİONAL CTA ── */}
                {currentStep === 7 && (
                  <div className="ht-step-pane animate-fade-in">
                    <div className="ht-final-cta-box">
                      <div className="sparkle-circle">✨</div>
                      <h2>{t('talents.step7.title', 'Bəlkə də axtardığımız insan sənsən.')}</h2>
                      <p>
                        {t('talents.step7.desc', 'Sənin bacarığın sadəcə bir hobbi olaraq qalmalı deyil. Bəlkə də onun arxasında böyük bir layihə, biznes və ya gələcək karyera dayanır. Bizə bacarığını göstər. Qalan yolun necə ola biləcəyini birlikdə araşdıraq.')}
                      </p>
                    </div>

                    {/* Summary Preview Box */}
                    <div className="ht-summary-card">
                      <h4>{t('talents.step7.summaryTitle', 'Müraciət İcmalı')}</h4>
                      <div className="ht-summary-grid">
                        <div>
                          <span className="lbl">{t('talents.step7.fullName', 'Ad, Soyad:')}</span>
                          <strong>{formData.firstName} {formData.lastName}</strong>
                        </div>
                        <div>
                          <span className="lbl">{t('talents.step7.contact', 'Əlaqə:')}</span>
                          <strong>{formData.phone || formData.email}</strong>
                        </div>
                        <div>
                          <span className="lbl">{t('talents.step7.skill', 'Bacarıq:')}</span>
                          <strong>{formData.skillName} ({formData.skillLevel})</strong>
                        </div>
                        <div>
                          <span className="lbl">{t('talents.step7.investment', 'İnvestisiya Ehtiyacı:')}</span>
                          <strong>{formData.estimatedInvestment === t('talents.step5.customAmountOption', 'Dəqiq məbləği özüm yazım') ? formData.customInvestmentAmount : formData.estimatedInvestment}</strong>
                        </div>
                        {formData.uploadedFiles.length > 0 && (
                          <div className="full-width">
                            <span className="lbl">{t('talents.step7.filesCount', 'Əlavə edilmiş fayllar:')}</span>
                            <strong>{formData.uploadedFiles.length} {t('talents.filesUploadedSuccess', 'fayl yükləndi')}</strong>
                          </div>
                        )}
                        {formData.voiceNoteUrl && (
                          <div className="full-width">
                            <span className="lbl">{t('talents.step4.voiceTitle', 'Səsli izah')}:</span>
                            <strong>{t('talents.step7.voiceAttached', '✓ Səs yazısı əlavə edildi')}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Privacy Guarantee Reassurance */}
                    <div className="ht-privacy-note">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <p>
                        {t('talents.step7.privacyText', 'Paylaşdığın məlumatlar yalnız Edusaza komandası tərəfindən müraciətini qiymətləndirmək və səninlə əlaqə saxlamaq məqsədilə istifadə olunacaq.')}{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('Edusaz Privacy Policy: All personal data and project ideas are encrypted and never shared with third parties without consent.'); }}>
                          {t('talents.step7.privacyLink', 'Məxfilik Siyasəti')}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* WIZARD FOOTER CONTROLS */}
              <div className="ht-wizard-footer">
                {currentStep > 1 && (
                  <button type="button" className="ht-btn ht-btn--back" onClick={handlePrev}>
                    {t('talents.general.back', '← Geri')}
                  </button>
                )}

                <div className="ht-wizard-footer__spacer" />

                {currentStep < 7 ? (
                  <button type="button" className="ht-btn ht-btn--next" onClick={handleNext}>
                    <span>{t('talents.general.next', 'Növbəti')}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ht-btn ht-btn--submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="btn-spinner" />
                        <span>{t('talents.step7.submitting', 'Göndərilir...')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('talents.step7.submitBtn', 'Bacarığımı göndər 🚀')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS MODAL */}
      {showHowItWorks && (
        <div className="ht-modal-backdrop" onClick={() => setShowHowItWorks(false)}>
          <div className="ht-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ht-modal-card__header">
              <h3>{t('talents.howItWorksModal.title', 'Necə işləyir?')}</h3>
              <button className="close-btn" onClick={() => setShowHowItWorks(false)}>✕</button>
            </div>

            <div className="ht-modal-card__body">
              <div className="how-step">
                <div className="how-step__num">1</div>
                <div>
                  <h4>{t('talents.howItWorksModal.step1Title', '1. Bacarıq və ya ideyanı bizimlə bölüş')}</h4>
                  <p>{t('talents.howItWorksModal.step1Desc', 'Hər hansı rəsmin, kodun, startap ideyan, musiqin və ya həvəsin varsa, formu doldur və ya birbaşa səsli izah et.')}</p>
                </div>
              </div>

              <div className="how-step">
                <div className="how-step__num">2</div>
                <div>
                  <h4>{t('talents.howItWorksModal.step2Title', '2. Ekspert komandamız qiymətləndirir')}</h4>
                  <p>{t('talents.howItWorksModal.step2Desc', 'Edusaz mentorları və investor şəbəkəmiz ideyanın hansı dəstəyə (maliyyə, mentorluq, komanda, təhsil və s.) ehtiyacı olduğunu təyin edir.')}</p>
                </div>
              </div>

              <div className="how-step">
                <div className="how-step__num">3</div>
                <div>
                  <h4>{t('talents.howItWorksModal.step3Title', '3. Birlikdə reallaşdırırıq')}</h4>
                  <p>{t('talents.howItWorksModal.step3Desc', 'Səninlə fərdi əlaqə saxlayıb yol xəritəsi cızırıq, lazım olduqda investor və ya komanda ilə birləşdiririk.')}</p>
                </div>
              </div>
            </div>

            <div className="ht-modal-card__footer">
              <button className="ht-btn ht-btn--primary" onClick={() => { setShowHowItWorks(false); scrollToForm(); }}>
                {t('talents.howItWorksModal.understood', 'Anladım, başlayaq!')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HiddenTalentsPage;
