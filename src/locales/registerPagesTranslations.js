import i18n from './i18n.js';
import { pagesTranslations } from './pagesTranslations';
import { sharedTranslations } from './sharedTranslations';

// Registers the `pages.*` strings for every loaded language, using the same
// regional fallbacks as the landing bundle (see landing/i18n.js).
const fallbackFor = (code) => (['ge', 'ua', 'am'].includes(code) ? 'ru' : ['kz', 'uz'].includes(code) ? 'tr' : 'en');

Object.keys(i18n.options.resources || {}).forEach((code) => {
  const dict = pagesTranslations[code] || pagesTranslations[fallbackFor(code)] || pagesTranslations.en;
  i18n.addResourceBundle(code, 'translation', { pages: dict }, true, true);

  // Fill strings that previously existed only as inline Azerbaijani defaults (never overwrites).
  const shared = sharedTranslations[code] || sharedTranslations[fallbackFor(code)] || sharedTranslations.en;
  i18n.addResourceBundle(code, 'translation', shared, true, false);
});
