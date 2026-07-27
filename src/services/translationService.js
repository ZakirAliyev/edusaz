// Dynamic Global Translation Service with AI Auto-Translate capabilities

const cacheKey = (text, from, to) => `tr_cache_${from}_${to}_${text.trim().toLowerCase()}`;

/**
 * Detect user language based on GeoIP country code or browser language
 */
export async function detectUserGeoLanguage() {
  const saved = localStorage.getItem('i18nextLng');
  if (saved) return saved.split('-')[0];

  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data.country_code; // e.g. "AZ", "TR", "DE", "FR", "ES", "RU", "US"

    const countryToLangMap = {
      AZ: 'az',
      TR: 'tr',
      DE: 'de',
      FR: 'fr',
      ES: 'es',
      IT: 'it',
      RU: 'ru',
      BY: 'ru',
      KZ: 'ru',
      GE: 'ka',
      AM: 'hy',
      UA: 'uk',
      PL: 'pl',
      HU: 'hu',
      CN: 'zh',
      JP: 'ja',
      KR: 'ko',
      SA: 'ar',
      AE: 'ar',
      US: 'en',
      GB: 'en',
      CA: 'en',
      AU: 'en'
    };

    if (country && countryToLangMap[country]) {
      return countryToLangMap[country];
    }
  } catch (e) {
    console.warn('GeoIP detection failed, using browser language fallback', e);
  }

  // Browser language fallback
  const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
  return browserLang;
}

/**
 * Translate text dynamically using MyMemory API with local caching
 */
export async function translateText(text, fromLang = 'az', toLang = 'en') {
  if (!text || fromLang === toLang) return text;

  const key = cacheKey(text, fromLang, toLang);
  const cached = localStorage.getItem(key);
  if (cached) {
    if (cached.includes('MYMEMORY WARNING') || cached.includes('USAGE LIMITS')) {
      localStorage.removeItem(key);
    } else {
      return cached;
    }
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated.includes('MYMEMORY WARNING') || translated.includes('USAGE LIMITS') || translated.includes('IS OVER QUOTA')) {
        return text; // Return original text fallback when API quota is reached
      }

      try {
        localStorage.setItem(key, translated);
      } catch (e) {
        // Ignore storage limits
      }
      return translated;
    }
  } catch (err) {
    console.error('Translation error:', err);
  }

  return text; // Return original text if translation fails
}


/**
 * AI Auto-Translate function for Admin Panel (Translates Azerbaijani course data to multiple target languages)
 */
export async function autoTranslateCourseData(azData, targetLangs = ['en', 'ru', 'tr', 'de']) {
  const result = { az: { ...azData } };

  for (const lang of targetLangs) {
    if (lang === 'az') continue;

    const translatedTitle = await translateText(azData.title || '', 'az', lang);
    const translatedDescription = await translateText(azData.description || '', 'az', lang);
    const translatedCategory = await translateText(azData.category || '', 'az', lang);

    result[lang] = {
      title: translatedTitle,
      description: translatedDescription,
      category: translatedCategory,
    };
  }

  return result;
}
