import i18n from '../locales/i18n.js';
import { landingTranslations } from './translations';

// Same regional fallbacks as the main bundles (see locales/allLanguagesBundles.js).
const fallbackFor = (code) => (['ge', 'ua', 'am'].includes(code) ? 'ru' : ['kz', 'uz'].includes(code) ? 'tr' : 'en');

Object.keys(i18n.options.resources || {}).forEach((code) => {
  const dict = landingTranslations[code] || landingTranslations[fallbackFor(code)] || landingTranslations.en;
  i18n.addResourceBundle(code, 'translation', { landing: dict }, true, true);
});
