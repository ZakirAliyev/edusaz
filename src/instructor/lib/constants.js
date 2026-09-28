// Stored values stay in English (the public catalogue filters on them); labels are Azerbaijani.
export const CATEGORIES = [
  ['Programming', 'Proqramlaşdırma'],
  ['Web Development', 'Veb proqramlaşdırma'],
  ['Mobile Development', 'Mobil proqramlaşdırma'],
  ['Data Science', 'Data Science'],
  ['AI & Machine Learning', 'Süni intellekt və maşın öyrənməsi'],
  ['Cloud & DevOps', 'Cloud və DevOps'],
  ['Cybersecurity', 'Kiber təhlükəsizlik'],
  ['Design', 'Dizayn'],
  ['Business', 'Biznes'],
  ['Marketing', 'Marketinq'],
  ['Finance', 'Maliyyə'],
  ['Language Learning', 'Dil öyrənmə'],
  ['Music', 'Musiqi'],
  ['Photography', 'Fotoqrafiya'],
  ['Health & Fitness', 'Sağlamlıq və idman'],
  ['Personal Development', 'Şəxsi inkişaf'],
  ['Other', 'Digər'],
].map(([value, label]) => ({ value, label }));

export const LEVELS = [
  ['Beginner', 'Başlanğıc'],
  ['Intermediate', 'Orta'],
  ['Advanced', 'İrəli'],
  ['All Levels', 'Bütün səviyyələr'],
].map(([value, label]) => ({ value, label }));

export const levelLabel = (v) => LEVELS.find((l) => l.value === v)?.label || v || '—';
export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v || '—';

export const CURRENCIES = ['AZN', 'USD', 'EUR', 'GBP', 'TRY', 'RUB'].map((v) => ({ value: v, label: v }));

export const LECTURE_TYPES = [
  { value: 'Video', label: 'Video' },
  { value: 'Article', label: 'Məqalə' },
  { value: 'Quiz', label: 'Test' },
];

// ePoint only charges in AZN, so foreign-currency prices are converted at checkout.
const AZN_RATES = { AZN: 1, USD: 1.7, EUR: 1.85, GBP: 2.18, TRY: 0.05, RUB: 0.018 };
export const convertToAZN = (amount, currency) => ((parseFloat(amount) || 0) * (AZN_RATES[(currency || 'AZN').toUpperCase()] ?? 1)).toFixed(2);

export const formatMoney = (value, currency = 'AZN') =>
  `${Number(value || 0).toLocaleString('az-AZ', { maximumFractionDigits: 2 })} ${currency}`;

export const PAYMENT_STATUS = {
  Paid: { label: 'Ödənilib', tone: 'success' },
  Pending: { label: 'Gözləyir', tone: 'warning' },
  Failed: { label: 'Uğursuz', tone: 'danger' },
};

export const ENROLLMENT_STATUS = {
  Active: { label: 'Aktiv', tone: 'success' },
  Refunded: { label: 'Ləğv edilib', tone: 'danger' },
};
