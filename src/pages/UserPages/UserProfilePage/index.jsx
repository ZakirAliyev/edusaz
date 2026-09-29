import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  CheckCircle2,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  Save,
  Star,
  UserRound,
} from 'lucide-react';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

// Fields that count toward the "profile completion" meter.
// Values the degree select offers; any other stored value is still shown as-is instead of silently displaying the first option.
const DEGREE_VALUES = ['Bakalavr', 'Magistratura', 'Doktorantura'];
const COMPLETION_FIELDS = ['firstName', 'lastName', 'phone', 'country', 'gpa', 'englishScore', 'degreeLevel', 'desiredField'];

function formatDate(value, lang) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function ProfileSkeleton() {
  return (
    <div className="up-skeleton" aria-hidden>
      <div className="up-head">
        <div className="ds-skeleton up-skeleton__avatar" />
        <div className="up-skeleton__lines">
          <div className="ds-skeleton" style={{ width: '220px', height: '28px' }} />
          <div className="ds-skeleton" style={{ width: '180px', height: '16px' }} />
        </div>
      </div>
      <div className="up-grid">
        <div className="ds-skeleton" style={{ height: '420px', borderRadius: 'var(--ds-r-lg)' }} />
        <div className="ds-skeleton" style={{ height: '240px', borderRadius: 'var(--ds-r-lg)' }} />
      </div>
    </div>
  );
}

function UserProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const userEmail = localStorage.getItem('userEmail') || 'student@edusaz.com';
  const { data: apiProfile, isLoading: isProfileLoading } = useGetUserProfileQuery(userEmail);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    gpa: '',
    englishScore: '',
    degreeLevel: '',
    desiredField: ''
  });

  useEffect(() => {
    const token = Cookies.get('userToken');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  useEffect(() => {
    if (apiProfile) {
      setProfileData({
        firstName: apiProfile.firstName || '',
        lastName: apiProfile.lastName || '',
        email: apiProfile.email || userEmail,
        phone: apiProfile.phone || '',
        country: apiProfile.country || '',
        gpa: apiProfile.gpa ? String(apiProfile.gpa) : '',
        englishScore: apiProfile.englishScore || '',
        degreeLevel: apiProfile.degreeLevel || '',
        desiredField: apiProfile.desiredField || ''
      });
    }
  }, [apiProfile, userEmail]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        email: userEmail,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        country: profileData.country,
        // An empty GPA is sent as null (the API then keeps the stored value) instead of a made-up default.
        gpa: parseFloat(profileData.gpa) || null,
        englishScore: profileData.englishScore,
        degreeLevel: profileData.degreeLevel,
        desiredField: profileData.desiredField
      }).unwrap();

      localStorage.setItem('userName', `${profileData.firstName} ${profileData.lastName}`.trim());
      localStorage.setItem('userEmail', profileData.email);
      setSavedSuccess(true);
      toast.success(t('toast.profile.updated'));
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      toast.apiError(err, 'toast.profile.updateError');
    }
  };

  const setField = (name) => (e) => setProfileData({ ...profileData, [name]: e.target.value });

  const activities = apiProfile?.activities || [];
  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
  const initials = [profileData.firstName, profileData.lastName]
    .map((part) => part.trim().charAt(0))
    .join('')
    .toUpperCase();
  const filled = COMPLETION_FIELDS.filter((name) => String(profileData[name] || '').trim()).length;
  const completion = Math.round((filled / COMPLETION_FIELDS.length) * 100);
  const scholarshipCount = apiProfile?.scholarshipCount ?? activities.length;

  return (
    <main className="ds-page up-page">
      <div className="ds-container">
        {isProfileLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Header: avatar, name, email and quick facts */}
            <header className="up-head" data-reveal>
              <div className="up-avatar" aria-hidden>
                {initials || <UserRound />}
              </div>
              <div className="up-head__info">
                <h1 className="up-name">{fullName || profileData.email}</h1>
                {fullName && <p className="up-email">{profileData.email}</p>}
                <ul className="up-badges">
                  <li className="ds-badge ds-badge--brand">
                    <GraduationCap aria-hidden /> {t('profile.studentAccount', 'Tələbə Hesabı')}
                  </li>
                  {profileData.country && (
                    <li className="ds-badge"><MapPin aria-hidden /> {profileData.country}</li>
                  )}
                  {profileData.gpa && (
                    <li className="ds-badge"><Star aria-hidden /> GPA {profileData.gpa}/4.0</li>
                  )}
                  {profileData.englishScore && (
                    <li className="ds-badge"><Languages aria-hidden /> {profileData.englishScore}</li>
                  )}
                </ul>
              </div>
            </header>

            <div className="up-grid">
              <form onSubmit={handleSave} className="up-form">
                <section className="ds-card ds-card--pad up-card" aria-labelledby="up-personal-title" data-reveal>
                  <h2 id="up-personal-title" className="up-card__title">
                    {t('pages.profile.personalInfo', 'Şəxsi məlumatlar')}
                  </h2>
                  <div className="up-fields">
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-first-name">{t('profile.firstName', 'Ad')} *</label>
                      <input id="up-first-name" className="ds-input" type="text" autoComplete="given-name"
                        value={profileData.firstName} onChange={setField('firstName')} required />
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-last-name">{t('profile.lastName', 'Soyad')} *</label>
                      <input id="up-last-name" className="ds-input" type="text" autoComplete="family-name"
                        value={profileData.lastName} onChange={setField('lastName')} required />
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-email">{t('profile.email', 'E-poçt Ünvanı')}</label>
                      <input id="up-email" className="ds-input" type="email" value={profileData.email}
                        readOnly aria-describedby="up-email-help" />
                      <p id="up-email-help" className="ds-help">
                        {t('pages.profile.emailLocked', 'E-poçt ünvanı hesabınızın girişidir və burada dəyişdirilmir.')}
                      </p>
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-phone">{t('profile.phone', 'Əlaqə Nömrəsi')}</label>
                      <input id="up-phone" className="ds-input" type="tel" autoComplete="tel"
                        value={profileData.phone} onChange={setField('phone')} />
                    </div>
                    <div className="ds-field up-fields__full">
                      <label className="ds-label" htmlFor="up-country">{t('profile.country', 'Vətəndaşlıq Ölkəsi')}</label>
                      <input id="up-country" className="ds-input" type="text" autoComplete="country-name"
                        value={profileData.country} onChange={setField('country')} />
                    </div>
                  </div>
                </section>

                <section className="ds-card ds-card--pad up-card" aria-labelledby="up-academic-title" data-reveal>
                  <h2 id="up-academic-title" className="up-card__title">
                    {t('pages.profile.academicProfile', 'Akademik profil')}
                  </h2>
                  <div className="up-fields">
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-degree">{t('profile.degreeLevel', 'Təhsil Dərəcəsi')}</label>
                      <select id="up-degree" className="ds-select" value={profileData.degreeLevel} onChange={setField('degreeLevel')}>
                        <option value="" disabled>{t('pages.profile.selectDegree', 'Seçin')}</option>
                        <option value="Bakalavr">{t('profile.bachelor', 'Bakalavr')}</option>
                        <option value="Magistratura">{t('profile.master', 'Magistratura')}</option>
                        <option value="Doktorantura">{t('profile.phd', 'Doktorantura')}</option>
                        {profileData.degreeLevel && !DEGREE_VALUES.includes(profileData.degreeLevel) && (
                          <option value={profileData.degreeLevel}>{profileData.degreeLevel}</option>
                        )}
                      </select>
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-gpa">{t('profile.gpa', 'Ortalama Ball (GPA 4.0)')}</label>
                      <input id="up-gpa" className="ds-input" type="text" inputMode="decimal" placeholder="3.5"
                        value={profileData.gpa} onChange={setField('gpa')} />
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-english">{t('profile.englishScore', 'Xarici Dil Sertifikatı')}</label>
                      <input id="up-english" className="ds-input" type="text" placeholder="IELTS 7.0"
                        value={profileData.englishScore} onChange={setField('englishScore')} />
                    </div>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="up-field">{t('profile.desiredField', 'Arzuladığınız İxtisas Sahəsi')}</label>
                      <input id="up-field" className="ds-input" type="text"
                        value={profileData.desiredField} onChange={setField('desiredField')} />
                    </div>
                  </div>
                </section>

                <div className="up-actions" data-reveal>
                  <p className="up-actions__status" role="status" aria-live="polite">
                    {savedSuccess && (
                      <>
                        <CheckCircle2 aria-hidden /> {t('profile.updatedSuccess', 'Məlumatlarınız yeniləndi')}
                      </>
                    )}
                  </p>
                  <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg up-save" disabled={isUpdating} aria-busy={isUpdating}>
                    {isUpdating ? <Loader2 className="up-spin" aria-hidden /> : <Save aria-hidden />}
                    {isUpdating ? t('profile.saving', 'Yenilənir...') : t('profile.saveBtn', 'Dəyişiklikləri Yadda Saxla')}
                  </button>
                </div>
              </form>

              <aside className="up-side">
                <section className="ds-card ds-card--pad up-card" aria-labelledby="up-status-title" data-reveal>
                  <h2 id="up-status-title" className="up-card__title">{t('profile.applicationStatus', 'Müraciət Statusu')}</h2>
                  <dl className="up-stats">
                    <div className="up-stat">
                      <dt>{t('profile.activeScholarships', 'Aktiv Təqaüd Analizləri')}</dt>
                      <dd>{scholarshipCount}</dd>
                    </div>
                    <div className="up-stat">
                      <dt>{t('profile.profileCompletion', 'Profil Tamlığı')}</dt>
                      <dd>{completion}%</dd>
                    </div>
                  </dl>
                  <div
                    className="up-meter"
                    role="progressbar"
                    aria-label={t('profile.profileCompletion', 'Profil Tamlığı')}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={completion}
                  >
                    <span style={{ inlineSize: `${completion}%` }} />
                  </div>
                </section>

                <section className="ds-card ds-card--pad up-card" aria-labelledby="up-activity-title" data-reveal style={{ '--delay': '60ms' }}>
                  <h2 id="up-activity-title" className="up-card__title">{t('profile.recentActivity', 'Son Fəaliyyət')}</h2>
                  {activities.length > 0 ? (
                    <ol className="up-activity">
                      {activities.map((act, idx) => (
                        <li key={idx} className="up-activity__item">
                          <span className="up-activity__dot" aria-hidden />
                          <div className="up-activity__body">
                            <strong>{act.title}</strong>
                            {act.description && <p>{act.description}</p>}
                            {act.date && <time dateTime={act.date}>{formatDate(act.date, i18n.language)}</time>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="up-empty">
                      <Activity aria-hidden />
                      <p>{t('pages.profile.noActivity', 'Hələ fəaliyyət yoxdur. Təqaüd uyğunluğunu yoxladıqda burada görünəcək.')}</p>
                    </div>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default UserProfilePage;
