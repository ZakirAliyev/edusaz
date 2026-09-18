import { useTranslation } from 'react-i18next';
import './Step2.scss';

const languagesList = [
  { id: 'all', key: 'all', code: 'all', name: 'Bütün Dillər', flag: '🌐', tag: 'Global' },
  { id: 'en', key: 'english', code: 'en', name: 'İngilis dili', flag: '🇬🇧', tag: 'International' },
  { id: 'tr', key: 'turkish', code: 'tr', name: 'Türk dili', flag: '🇹🇷', tag: 'Bilingual' },
  { id: 'az', key: 'azerbaijani', code: 'az', name: 'Azərbaycan dili', flag: '🇦🇿', tag: 'National' },
  { id: 'de', key: 'german', code: 'de', name: 'Alman dili', flag: '🇩🇪', tag: 'DAAD & EU' },
  { id: 'ru', key: 'russian', code: 'ru', name: 'Rus dili', flag: '🇷🇺', tag: 'Regional' }
];

function Step2({ selection, onSelect }) {
  const { t } = useTranslation();

  return (
    <div className="ad-step-container step2-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">
          {t('aiDiscovery.stepBadge2', 'ADDIM 2 / 2')}
        </span>
        <h1>{t('aiDiscovery.step2Title', 'Hansı dildə təhsil almaq istəyirsiniz?')}</h1>
        <p className="ad-step-subtitle">
          {t('aiDiscovery.step2Subtitle', 'Tədris dilini seçin ki, sizə ən uyğun universitet və proqramları təqdim edək.')}
        </p>
      </div>

      <div className="destination-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {languagesList.map(lang => {
          const isSelected = selection === lang.id || selection === lang.key || selection === lang.name;
          const translatedName = t(`aiDiscovery.languages.${lang.key}`, lang.name);

          return (
            <div 
              key={lang.id} 
              className={`ad-option-card destination-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(lang.id, lang.name)}
              style={{ padding: '20px 24px', cursor: 'pointer' }}
            >
              <div className="dest-image" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                {lang.flag}
              </div>
              <div className="dest-info" style={{ marginLeft: '12px' }}>
                <div className="dest-title">
                  <span className="name" style={{ fontSize: '16px', fontWeight: 600 }}>{translatedName}</span>
                </div>
                <div className="dest-tag" style={{ marginTop: '4px', fontSize: '12px', color: '#7c6ee8', fontWeight: 500 }}>
                  {lang.tag}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Step2;
