import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import './Step2.scss';

// `native` is the language's own name (an endonym), shown as a quiet secondary line.
const languagesList = [
  { id: 'all', key: 'all', code: 'all', name: 'Bütün Dillər', native: null },
  { id: 'en', key: 'english', code: 'en', name: 'İngilis dili', native: 'English' },
  { id: 'tr', key: 'turkish', code: 'tr', name: 'Türk dili', native: 'Türkçe' },
  { id: 'az', key: 'azerbaijani', code: 'az', name: 'Azərbaycan dili', native: 'Azərbaycanca' },
  { id: 'de', key: 'german', code: 'de', name: 'Alman dili', native: 'Deutsch' },
  { id: 'ru', key: 'russian', code: 'ru', name: 'Rus dili', native: 'Русский' }
];

function Step2({ selection, onSelect }) {
  const { t } = useTranslation();

  return (
    <div className="gq-step">
      <div className="gq-step__head">
        <h1 className="gq-step__title" id="gq-step2-title">
          {t('aiDiscovery.step2Title', 'Hansı dildə təhsil almaq istəyirsiniz?')}
        </h1>
        <p className="gq-step__lead" id="gq-step2-desc">
          {t('aiDiscovery.step2Subtitle', 'Tədris dilini seçin ki, sizə ən uyğun universitet və proqramları təqdim edək.')}
        </p>
      </div>

      <div
        className="gq-options gq-options--languages"
        role="radiogroup"
        aria-labelledby="gq-step2-title"
        aria-describedby="gq-step2-desc"
      >
        {languagesList.map(lang => {
          const isSelected = selection === lang.id || selection === lang.key || selection === lang.name;
          const translatedName = t(`aiDiscovery.languages.${lang.key}`, lang.name);
          const secondary = lang.native || t('pages.matchQuiz.anyLanguageHint', 'Tədris dili fərq etmir');

          return (
            <label key={lang.id} className="gq-option">
              <input
                type="radio"
                name="gq-language"
                className="gq-option__input"
                value={lang.id}
                checked={isSelected}
                onChange={() => onSelect(lang.id, lang.name)}
              />
              <span className="gq-option__box">
                <span className="gq-option__mark" aria-hidden>
                  {lang.id === 'all' ? <Globe /> : lang.code.toUpperCase()}
                </span>
                <span className="gq-option__text">
                  <span className="gq-option__name">{translatedName}</span>
                  <span className="gq-option__meta" lang={lang.native ? lang.code : undefined}>{secondary}</span>
                </span>
                <span className="gq-option__check" aria-hidden>
                  <Check />
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default Step2;
