import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../../context/LanguageContext';
import { useGetCountriesQuery, useGetUniversitiesQuery } from '../../../../services/apis/userApi';
import './Step1.scss';

function Step1({ selection, onSelect }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: countries = [], isLoading: isLoadingCountries } = useGetCountriesQuery(language);
  const { data: universities = [] } = useGetUniversitiesQuery(language);

  // Group or match universities to count per country
  const systemCountries = countries.map(c => {
    const uniCount = universities.filter(u => 
      u.countryId === c.id || 
      (u.country && u.country.toLowerCase() === (c.name || '').toLowerCase()) ||
      (u.countryCode && u.countryCode.toLowerCase() === (c.code || '').toLowerCase())
    ).length;

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      flagEmoji: c.flagEmoji || '🌍',
      universities: uniCount || c.universityCount || 0,
      label: c.label || c.defaultLabel || ''
    };
  }).filter(c => c.name); // only valid system countries

  return (
    <div className="ad-step-container step1-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">
          {t('aiDiscovery.stepBadge', 'ADDIM 1 / 2')}
        </span>
        <h1>{t('aiDiscovery.step1Title', 'Harada təhsil almaq istəyirsiniz?')}</h1>
        <p className="ad-step-subtitle">
          {t('aiDiscovery.step1Subtitle', 'Sistemimizdə olan ölkələrdən birini seçin. Yalnız seçdiyiniz ölkənin universitetləri təhlil ediləcək.')}
        </p>
      </div>

      {isLoadingCountries ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          {t('common.loading', 'Yüklənir...')}
        </div>
      ) : (
        <div className="country-grid">
          {systemCountries.map(country => {
            const isSelected = selection === country.id || selection === country.name || selection === country.code;
            return (
              <div 
                key={country.id || country.code} 
                className={`ad-option-card country-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(country.id, country.name)}
              >
                <span className="flag" style={{ fontSize: '24px' }}>{country.flagEmoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <span className="name" style={{ fontWeight: 600, fontSize: '15px' }}>{country.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {country.universities} {t('topDestinations.countSuffix', 'universitet')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Step1;
