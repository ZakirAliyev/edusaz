// Course categories and levels are stored in English in the database; these map them to the static
// `courses.cat.*` / `courses.lvl.*` translations (31 languages) instead of translating them at runtime.
const CATEGORY_KEYS = {
  'programming': 'programming',
  'web development': 'webDevelopment',
  'mobile development': 'mobileDevelopment',
  'data science': 'dataScience',
  'ai & machine learning': 'ai',
  'cloud & devops': 'cloud',
  'cybersecurity': 'cybersecurity',
  'design': 'design',
  'business': 'business',
  'marketing': 'marketing',
  'finance': 'finance',
  'language learning': 'languages',
  'music': 'music',
  'photography': 'photography',
  'health & fitness': 'health',
  'personal development': 'personalDevelopment',
  'other': 'other',
};

const LEVEL_KEYS = {
  'beginner': 'beginner',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
  'all levels': 'allLevels',
  'all': 'allLevels',
};

const normalize = (value) => String(value || '').trim().toLowerCase();

/** Translated category label, or null when the value is not one of the known categories. */
export const categoryLabel = (t, value) => {
  const key = CATEGORY_KEYS[normalize(value)];
  return key ? t(`courses.cat.${key}`) : null;
};

/** Translated level label, or null when the value is not one of the known levels. */
export const levelLabel = (t, value) => {
  const key = LEVEL_KEYS[normalize(value)];
  return key ? t(`courses.lvl.${key}`) : null;
};
