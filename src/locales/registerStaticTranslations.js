import i18n from './i18n.js';
import { toastTranslations } from './toastTranslations';
import { coursesTranslations } from './coursesTranslations';

// Reviewed static texts that exist for all 31 site languages, so every code gets its own dictionary
// (overriding older partial bundles that only covered a few languages).
Object.keys(i18n.options.resources || {}).forEach((code) => {
  i18n.addResourceBundle(code, 'translation', {
    toast: toastTranslations[code] || toastTranslations.en,
    courses: coursesTranslations[code] || coursesTranslations.en,
  }, true, true);
});
