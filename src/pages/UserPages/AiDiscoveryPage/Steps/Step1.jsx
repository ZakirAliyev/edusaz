import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
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
      universities: uniCount || c.universityCount || 0,
      label: c.label || c.defaultLabel || ''
    };
  }).filter(c => c.name); // only valid system countries

  return (
    <div className="gq-step">
      <div className="gq-step__head">
        <h1 className="gq-step__title" id="gq-step1-title">
          {t('aiDiscovery.step1Title', 'Harada təhsil almaq istəyirsiniz?')}
        </h1>
        <p className="gq-step__lead" id="gq-step1-desc">
          {t('aiDiscovery.step1Subtitle', 'Sistemimizdə olan ölkələrdən birini seçin. Yalnız seçdiyiniz ölkənin universitetləri təhlil ediləcək.')}
        </p>
      </div>

      {isLoadingCountries ? (
        <div className="gq-options gq-options--countries" aria-busy="true">
          <span className="gq-sr-only">{t('common.loading', 'Yüklənir...')}</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ds-skeleton gq-option-skeleton" aria-hidden />
          ))}
        </div>
      ) : systemCountries.length === 0 ? (
        <div className="ds-empty">
          <strong>{t('pages.matchQuiz.noCountries', 'Hazırda seçim üçün ölkə yoxdur.')}</strong>
        </div>
      ) : (
        <div
          className="gq-options gq-options--countries"
          role="radiogroup"
          aria-labelledby="gq-step1-title"
          aria-describedby="gq-step1-desc"
        >
          {systemCountries.map(country => {
            const isSelected = selection === country.id || selection === country.name || selection === country.code;
            return (
              <label key={country.id || country.code} className="gq-option">
                <input
                  type="radio"
                  name="gq-country"
                  className="gq-option__input"
                  value={country.id}
                  checked={isSelected}
                  onChange={() => onSelect(country.id, country.name)}
                />
                <span className="gq-option__box">
                  <span className="gq-option__mark" aria-hidden>
                    {(country.code || country.name.slice(0, 2)).toUpperCase()}
                  </span>
                  <span className="gq-option__text">
                    <span className="gq-option__name">{country.name}</span>
                    <span className="gq-option__meta">
                      {country.universities} {t('topDestinations.countSuffix', 'universitet')}
                    </span>
                  </span>
                  <span className="gq-option__check" aria-hidden>
                    <Check />
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Step1;
