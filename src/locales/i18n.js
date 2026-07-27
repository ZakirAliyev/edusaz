import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { detectUserGeoLanguage, translateText } from '../services/translationService';

import en from './en/common.json';
import az from './az/common.json';
import ru from './ru/common.json';
import tr from './tr/common.json';
import de from './de/common.json';
import fr from './fr/common.json';
import es from './es/common.json';
import it from './it/common.json';
import ar from './ar/common.json';
import zh from './zh/common.json';


const initialResources = {
    en: { translation: en },
    az: { translation: az },
    ru: { translation: ru },
    tr: { translation: tr },
    de: { translation: de },
    fr: { translation: fr },
    es: { translation: es },
    it: { translation: it },
    ar: { translation: ar },
    zh: { translation: zh },
};

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
        fallbackLng: 'en',
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

// Helper for recursive object translation
async function translateObjectRecursive(obj, targetLng) {
    if (!obj || typeof obj !== 'object') return obj;

    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            translated[key] = await translateObjectRecursive(value, targetLng);
        } else if (typeof value === 'string') {
            translated[key] = await translateText(value, 'en', targetLng);
        } else {
            translated[key] = value;
        }
    }
    return translated;
}

// Dynamically translate missing keys when language is not in initialResources
i18n.on('languageChanged', async (lng) => {
    if (!i18n.hasResourceBundle(lng, 'translation')) {
        const baseTranslations = en;
        const newTranslations = await translateObjectRecursive(baseTranslations, lng);

        i18n.addResourceBundle(lng, 'translation', newTranslations, true, true);
        i18n.changeLanguage(lng);
    }
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



