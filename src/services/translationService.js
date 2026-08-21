// Dynamic Global Translation Service — Google Cloud Translation API

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

// Google Cloud uses slightly different language codes for some languages
const LANG_CODE_MAP = {
  az: 'az',  en: 'en',  ru: 'ru',  tr: 'tr',  de: 'de',
  fr: 'fr',  es: 'es',  it: 'it',  ar: 'ar',  zh: 'zh-CN',
  pt: 'pt',  nl: 'nl',  se: 'sv',  no: 'no',  fi: 'fi',
  da: 'da',  dk: 'da',  el: 'el',  gr: 'el',  hu: 'hu',
  cs: 'cs',  cz: 'cs',  ro: 'ro',  bg: 'bg',  hr: 'hr',
  sk: 'sk',  uk: 'uk',  ua: 'uk',  ka: 'ka',  hy: 'hy',
  kz: 'kk',  uz: 'uz',  ja: 'ja',  ko: 'ko',  hi: 'hi',
  id: 'id',  th: 'th',  vi: 'vi',  fa: 'fa',  pl: 'pl'
};

// ── Two-layer Translation Cache ───────────────────────────────────────────────
// Layer 1: In-memory Map (ultra-fast, per session)
// Layer 2: localStorage (persists across sessions — same words never re-translated)
const _memCache = new Map();
const CACHE_PREFIX = 'gtr2_';
const CACHE_VERSION = 'v2';

function hashKey(text, from, to) {
  const normalized = text.trim().toLowerCase().substring(0, 120);
  return `${CACHE_PREFIX}${CACHE_VERSION}_${from}_${to}_${normalized}`;
}

function getCached(text, from, to) {
  const key = hashKey(text, from, to);
  if (_memCache.has(key)) return _memCache.get(key);
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      _memCache.set(key, stored);
      return stored;
    }
  } catch (_) {}
  return null;
}

function setCached(text, from, to, translated) {
  const key = hashKey(text, from, to);
  _memCache.set(key, translated);
  try {
    localStorage.setItem(key, translated);
  } catch (e) {
    try {
      const toRemove = Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .slice(0, 50);
      toRemove.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(key, translated);
    } catch (_) {}
  }
}

/** Returns cache statistics */
export function getTranslationCacheStats() {
  const memCount = _memCache.size;
  let lsCount = 0;
  let lsBytes = 0;
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(CACHE_PREFIX)) {
        lsCount++;
        lsBytes += (localStorage.getItem(k) || '').length * 2;
      }
    });
  } catch (_) {}
  return { memCount, lsCount, lsKB: Math.round(lsBytes / 1024) };
}

/** Clear the entire translation cache */
export function clearTranslationCache() {
  _memCache.clear();
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (_) {}
}

/**
 * Detect user language based on GeoIP country code or browser language
 */
export async function detectUserGeoLanguage() {
  const saved = localStorage.getItem('i18nextLng');
  if (saved) return saved.split('-')[0];

  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data.country_code;

    const countryToLangMap = {
      AZ: 'az', TR: 'tr', DE: 'de', FR: 'fr', ES: 'es',
      IT: 'it', RU: 'ru', BY: 'ru', KZ: 'kz', GE: 'ka',
      AM: 'hy', UA: 'uk', PL: 'pl', HU: 'hu', CN: 'zh',
      JP: 'ja', KR: 'ko', SA: 'ar', AE: 'ar', IN: 'hi',
      US: 'en', GB: 'en', CA: 'en', AU: 'en'
    };

    if (country && countryToLangMap[country]) {
      return countryToLangMap[country];
    }
  } catch (e) {
    console.warn('GeoIP detection failed, using browser language fallback', e);
  }

  const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
  return browserLang;
}

/**
 * Multi-layer Ultra-Reliable Translation Function
 * Layer 1: Google Cloud Translate API v2 (if key configured)
 * Layer 2: Google Translate Direct Web API (100% free, immediate, accurate)
 * Layer 3: MyMemory API fallback
 */
export async function translateText(text, fromLang = 'az', toLang = 'en') {
  if (!text || !text.trim()) return text;

  const normalizedFrom = fromLang.split('-')[0].toLowerCase();
  const normalizedTo = toLang.split('-')[0].toLowerCase();
  if (normalizedFrom === normalizedTo) return text;

  // Check cache first
  const cached = getCached(text, normalizedFrom, normalizedTo);
  if (cached) return cached;

  const googleFrom = LANG_CODE_MAP[normalizedFrom] || normalizedFrom;
  const googleTo = LANG_CODE_MAP[normalizedTo] || normalizedTo;

  // 1. Google Cloud v2 (if key provided)
  if (GOOGLE_API_KEY) {
    try {
      const res = await fetch(
        `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: googleFrom,
            target: googleTo,
            format: 'text'
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const translated = data?.data?.translations?.[0]?.translatedText;
        if (translated && translated.trim()) {
          setCached(text, normalizedFrom, normalizedTo, translated);
          return translated;
        }
      }
    } catch (e) {
      console.warn('Google Cloud v2 failed, using direct API', e);
    }
  }

  // 2. Direct Google Translate API
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(googleFrom)}&tl=${encodeURIComponent(googleTo)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const translated = json[0].map(item => item && item[0] ? item[0] : '').join('');
        if (translated && translated.trim()) {
          setCached(text, normalizedFrom, normalizedTo, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Direct Google API translation error:', err);
  }

  // 3. MyMemory Fallback
  try {
    const pair = `${googleFrom}|${googleTo}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
    const res = await fetch(myMemoryUrl);
    if (res.ok) {
      const json = await res.json();
      const translated = json?.responseData?.translatedText;
      if (translated && !translated.includes('MYMEMORY WARNING')) {
        setCached(text, normalizedFrom, normalizedTo, translated);
        return translated;
      }
    }
  } catch (err) {
    console.error('All translation providers failed:', err);
  }

  return text;
}


export const ALL_31_LANGUAGES = [
  'en', 'az', 'tr', 'ru', 'de', 'fr', 'es', 'it', 'ar', 'zh',
  'pt', 'nl', 'se', 'no', 'fi', 'dk', 'gr', 'hu', 'cz', 'ro',
  'bg', 'hr', 'sk', 'ua', 'ka', 'hy', 'kz', 'uz', 'ja', 'ko', 'hi'
];

export const LANGUAGE_META = {
  az: { flag: '🇦🇿', name: 'Azərbaycanca' },
  en: { flag: '🇬🇧', name: 'English' },
  tr: { flag: '🇹🇷', name: 'Türkçe' },
  ru: { flag: '🇷🇺', name: 'Русский' },
  de: { flag: '🇩🇪', name: 'Deutsch' },
  fr: { flag: '🇫🇷', name: 'Français' },
  es: { flag: '🇪🇸', name: 'Español' },
  it: { flag: '🇮🇹', name: 'Italiano' },
  ar: { flag: '🇸🇦', name: 'العربية' },
  zh: { flag: '🇨🇳', name: '中文' },
  pt: { flag: '🇵🇹', name: 'Português' },
  nl: { flag: '🇳🇱', name: 'Nederlands' },
  se: { flag: '🇸🇪', name: 'Svenska' },
  no: { flag: '🇳🇴', name: 'Norsk' },
  fi: { flag: '🇫🇮', name: 'Suomi' },
  dk: { flag: '🇩🇰', name: 'Dansk' },
  gr: { flag: '🇬🇷', name: 'Ελληνικά' },
  hu: { flag: '🇭🇺', name: 'Magyar' },
  cz: { flag: '🇨🇿', name: 'Čeština' },
  ro: { flag: '🇷🇴', name: 'Română' },
  bg: { flag: '🇧🇬', name: 'Български' },
  hr: { flag: '🇭🇷', name: 'Hrvatski' },
  sk: { flag: '🇸🇰', name: 'Slovenčina' },
  ua: { flag: '🇺🇦', name: 'Українська' },
  ka: { flag: '🇬🇪', name: 'ქართული' },
  hy: { flag: '🇦🇲', name: 'Հայերեն' },
  kz: { flag: '🇰🇿', name: 'Қазақша' },
  uz: { flag: '🇺🇿', name: 'Oʻzbekcha' },
  ja: { flag: '🇯🇵', name: '日本語' },
  ko: { flag: '🇰🇷', name: '한국어' },
  hi: { flag: '🇮🇳', name: 'हिन्दी' }
};

/**
 * AI Auto-Translate: Translates university/course data into 31 global languages
 * using Google Cloud Translation API
 */
export async function autoTranslateCourseData(sourceData, targetLangs = ALL_31_LANGUAGES) {
  const sourceLang = 'az';
  const result = { [sourceLang]: { ...sourceData } };

  // Batch translate all languages in parallel (max 5 concurrent requests)
  const chunks = [];
  for (let i = 0; i < targetLangs.length; i += 5) {
    chunks.push(targetLangs.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (lang) => {
        if (lang === sourceLang) return;

        const [translatedTitle, translatedDescription, translatedRequirements] = await Promise.all([
          translateText(sourceData.title || '', sourceLang, lang),
          translateText(sourceData.description || '', sourceLang, lang),
          translateText(sourceData.requirements || '', sourceLang, lang),
        ]);

        result[lang] = {
          title: translatedTitle,
          description: translatedDescription,
          requirements: translatedRequirements,
        };
      })
    );
  }

  return result;
}
