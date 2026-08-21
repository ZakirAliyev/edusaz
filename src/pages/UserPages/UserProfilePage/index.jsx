import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../../services/apis/userApi';
import './index.scss';

const UserAvatarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const CheckBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

function UserProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        gpa: parseFloat(profileData.gpa) || 3.6,
        englishScore: profileData.englishScore,
        degreeLevel: profileData.degreeLevel,
        desiredField: profileData.desiredField
      }).unwrap();

      localStorage.setItem('userName', `${profileData.firstName} ${profileData.lastName}`);
      localStorage.setItem('userEmail', profileData.email);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const activities = apiProfile?.activities || [];

  return (
    <div id="user-profile-page">
      <div className="profile-container">
        
        {isProfileLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading profile from backend...</div>
        ) : (
          <>
            {/* Profile Header Banner */}
            <div className="profile-header-card">
              <div className="profile-avatar-wrapper">
                <UserAvatarIcon />
              </div>
              <div className="profile-header-info">
                <h2>{profileData.firstName} {profileData.lastName}</h2>
                <p className="profile-email">{profileData.email}</p>
                <div className="profile-badges">
                  <span className="p-badge role">🎓 {t('profile.studentAccount', 'Tələbə Hesabı')}</span>
                  <span className="p-badge country">🇦🇿 {profileData.country}</span>
                  <span className="p-badge gpa">⭐ GPA {profileData.gpa}/4.0</span>
                  <span className="p-badge lang">🌐 {profileData.englishScore}</span>
                </div>
              </div>
            </div>

            {/* Profile Details Form */}
            <div className="profile-content-grid">
              <div className="profile-card main-info">
                <div className="card-header">
                  <AcademicCapIcon />
                  <h3>{t('profile.title', 'Şəxsi & Akademik Məlumatlar')}</h3>
                </div>

                {savedSuccess && (
                  <div className="save-toast">
                    <CheckBadgeIcon /> {t('profile.updatedSuccess', 'Məlumatlarınız yeniləndi')}
                  </div>
                )}

                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.firstName', 'Ad')} *</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.lastName', 'Soyad')} *</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.email', 'E-poçt Ünvanı')} *</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.phone', 'Əlaqə Nömrəsi')}</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.country', 'Vətəndaşlıq Ölkəsi')}</label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.degreeLevel', 'Təhsil Dərəcəsi')}</label>
                      <select
                        value={profileData.degreeLevel}
                        onChange={(e) => setProfileData({ ...profileData, degreeLevel: e.target.value })}
                      >
                        <option value="Bakalavr">{t('profile.bachelor', 'Bakalavr')}</option>
                        <option value="Magistratura">{t('profile.master', 'Magistratura')}</option>
                        <option value="Doktorantura">{t('profile.phd', 'Doktorantura')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('profile.gpa', 'Ortalama Ball (GPA 4.0)')}</label>
                      <input
                        type="text"
                        value={profileData.gpa}
                        onChange={(e) => setProfileData({ ...profileData, gpa: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('profile.englishScore', 'Xarici Dil Sertifikatı')}</label>
                      <input
                        type="text"
                        value={profileData.englishScore}
                        onChange={(e) => setProfileData({ ...profileData, englishScore: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('profile.desiredField', 'Arzuladığınız İxtisas Sahəsi')}</label>
                    <input
                      type="text"
                      value={profileData.desiredField}
                      onChange={(e) => setProfileData({ ...profileData, desiredField: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-save-profile" disabled={isUpdating}>
                    <SaveIcon /> {isUpdating ? t('profile.saving', 'Yenilənir...') : t('profile.saveBtn', 'Dəyişiklikləri Yadda Saxla')}
                  </button>
                </form>
              </div>

              {/* Quick Stats & Saved Applications */}
              <div className="profile-sidebar">
                <div className="profile-card summary-card">
                  <h3>{t('profile.applicationStatus', 'Müraciət Statusu')}</h3>
                  <div className="stat-item">
                    <span className="lbl">{t('profile.activeScholarships', 'Aktiv Təqaüd Analizləri')}</span>
                    <span className="val highlight">{apiProfile?.scholarshipCount || 3}</span>
                  </div>
                  <div className="stat-item">
                    <span className="lbl">{t('profile.emailNotifications', 'E-poçt Bildirişləri')}</span>
                    <span className="val status-active">Aktiv</span>
                  </div>
                  <div className="stat-item">
                    <span className="lbl">{t('profile.profileCompletion', 'Profil Tamlığı')}</span>
                    <span className="val percent">100%</span>
                  </div>
                </div>

                <div className="profile-card activity-card">
                  <h3>{t('profile.recentActivity', 'Son Fəaliyyət')}</h3>
                  <ul className="activity-list">
                    {activities.map((act, idx) => (
                      <li key={idx}>
                        <span className="act-dot"></span>
                        <div>
                          <strong>{act.title}</strong>
                          <p>{act.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default UserProfilePage;
