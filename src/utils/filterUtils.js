// Utility for accurate, diacritic-safe and Turkish/Azerbaijani dotless/dotted I safe string normalization

export const normalizeFilterStr = (str) => {
  if (!str) return '';
  return str
    .toString()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/Ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const checkCountryMatch = (uni, activeCountry, countries = []) => {
  if (!activeCountry || activeCountry === 'All' || activeCountry === 'all') return true;

  const targetNorm = normalizeFilterStr(activeCountry);
  const selectedCountryObj = countries.find(c => 
    c.id === activeCountry || 
    (c.id && c.id.toString().toLowerCase() === activeCountry.toString().toLowerCase()) ||
    normalizeFilterStr(c.code) === targetNorm ||
    normalizeFilterStr(c.name) === targetNorm ||
    normalizeFilterStr(c.defaultName) === targetNorm
  );

  // 1. Match by ID
  if (uni.countryId) {
    if (uni.countryId.toString().toLowerCase() === activeCountry.toString().toLowerCase()) return true;
    if (selectedCountryObj && uni.countryId.toString().toLowerCase() === selectedCountryObj.id.toString().toLowerCase()) return true;
  }

  // 2. Match by Code
  if (uni.countryCode) {
    if (uni.countryCode.toString().toLowerCase() === activeCountry.toString().toLowerCase()) return true;
    if (selectedCountryObj && selectedCountryObj.code && uni.countryCode.toString().toLowerCase() === selectedCountryObj.code.toString().toLowerCase()) return true;
  }

  // 3. Match by Name
  const uCountryNorm = normalizeFilterStr(uni.country);
  if (uCountryNorm) {
    if (uCountryNorm.includes(targetNorm) || targetNorm.includes(uCountryNorm)) return true;
    if (selectedCountryObj) {
      const selNameNorm = normalizeFilterStr(selectedCountryObj.name);
      const selDefNorm = normalizeFilterStr(selectedCountryObj.defaultName);
      if (selNameNorm && (uCountryNorm.includes(selNameNorm) || selNameNorm.includes(uCountryNorm))) return true;
      if (selDefNorm && (uCountryNorm.includes(selDefNorm) || selDefNorm.includes(uCountryNorm))) return true;
    }
  }

  return false;
};

export const checkLanguageMatch = (uni, activeLang) => {
  if (!activeLang || activeLang === 'All' || activeLang === 'all') return true;

  const uLangNorm = normalizeFilterStr(uni.teachingLanguage);
  if (!uLangNorm) return true; // If unspecified, don't exclude

  const langKeyNorm = normalizeFilterStr(activeLang);

  const langMapping = {
    en: ['english', 'ingilis', 'ingilizce', 'eng', 'en'],
    english: ['english', 'ingilis', 'ingilizce', 'eng', 'en'],
    tr: ['turkish', 'turkce', 'turk', 'tur', 'tr'],
    turkish: ['turkish', 'turkce', 'turk', 'tur', 'tr'],
    az: ['azerbaijani', 'azerbaycan', 'azerbaycanca', 'aze', 'az'],
    azerbaijani: ['azerbaijani', 'azerbaycan', 'azerbaycanca', 'aze', 'az'],
    de: ['german', 'deutsch', 'alman', 'almanca', 'ger', 'de'],
    german: ['german', 'deutsch', 'alman', 'almanca', 'ger', 'de'],
    ru: ['russian', 'rus', 'rusca', 'ru'],
    russian: ['russian', 'rus', 'rusca', 'ru']
  };

  const keywords = langMapping[langKeyNorm] || [langKeyNorm];

  return keywords.some(kw => {
    const kwNorm = normalizeFilterStr(kw);
    return uLangNorm.includes(kwNorm);
  });
};
