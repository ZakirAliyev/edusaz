import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { detectUserGeoLanguage } from '../services/translationService';
import { buildAllResourceBundles } from './allLanguagesBundles';

const initialResources = buildAllResourceBundles();

const customUniversalDetector = {
  name: 'universalCountryDetector',
  lookup() {
    const savedLng = localStorage.getItem('i18nextLng');
    if (savedLng) return savedLng;

    const browserLng = (navigator.language || (navigator.languages && navigator.languages[0]) || '').split('-')[0].toLowerCase();
    return browserLng || 'en';
  },
  cacheUserLanguage(lng) {
    localStorage.setItem('i18nextLng', lng);
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customUniversalDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: initialResources,
    fallbackLng: ['az', 'en'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'universalCountryDetector', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Trigger GeoIP detection if no saved language preference exists
if (!localStorage.getItem('i18nextLng')) {
  detectUserGeoLanguage().then(detectedLng => {
    if (detectedLng && detectedLng !== i18n.language) {
      i18n.changeLanguage(detectedLng);
    }
  });
}

export default i18n;
