import i18n from './i18n.js';
import { toastTranslations } from './toastTranslations';

// Notification texts exist for all 31 site languages, so every code gets its own dictionary.
Object.keys(i18n.options.resources || {}).forEach((code) => {
  const dict = toastTranslations[code] || toastTranslations.en;
  i18n.addResourceBundle(code, 'translation', { toast: dict }, true, true);
});
