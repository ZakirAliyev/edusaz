import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export const mapUniversity = (u) => ({
  id: u.id,
  name: u.name || '',
  country: u.country || '',
  countryId: u.countryId || '',
  city: u.city || '',
  ranking: u.ranking || '',
  logoUrl: u.logoUrl || '',
  establishedYear: u.establishedYear || '',
  tuition: u.tuition || '',
  acceptanceRate: u.acceptanceRate || '',
  teachingLanguage: u.teachingLanguage || '',
  deadline: u.deadline || '',
  hasScholarship: u.hasScholarship !== false,
  status: u.status || 'Active',
  website: u.websiteUrl || u.website || '',
  description: u.description || '',
  images: asArray(u.images),
  videoUrls: asArray(u.videoUrls),
});

const mapTranslations = (translations, titleKey) =>
  translations
    ? Object.fromEntries(
        Object.entries(translations).map(([code, t]) => [code, { name: t?.[titleKey] || '', description: t?.description || '' }])
      )
    : null;

export const mapProgram = (p) => ({
  id: p.id,
  title: p.title || p.name || '',
  description: p.description || '',
  university: p.universityName || p.university || '',
  universityId: p.universityId || '',
  country: p.country || p.countryName || '',
  degree: p.degreeLevel || p.degree || '',
  tuitionFee: p.tuitionFee || '',
  duration: p.duration || '',
  language: p.languageOfInstruction || p.teachingLanguage || p.language || '',
  translations: mapTranslations(p.translations, 'title'),
});

export const mapScholarship = (s, countries) => ({
  id: s.id,
  title: s.name || s.title || '',
  description: s.description || '',
  provider: s.location || s.provider || s.organization || '',
  universityId: s.universityId || '',
  university: s.universityName || '',
  country: s.countryCode
    ? countries.find((c) => c.code.toLowerCase() === s.countryCode.toLowerCase())?.name || s.countryCode
    : s.countryName || '',
  countryId: s.countryId || '',
  coverage: s.coverage || s.amount || '',
  amount: s.amount || '',
  deadline: s.deadline ? String(s.deadline).split('T')[0] : '',
  eligible: s.eligible || '',
  places: s.places || '',
  status: s.status || 'Aktiv',
  translations: mapTranslations(s.translations, 'name'),
});

export const mapCountry = (c) => ({
  id: c.id,
  code: (c.code || '').toUpperCase(),
  flag: c.flagEmoji || '🌐',
  name: c.name || c.defaultName || c.code || '',
  universitiesCount: c.universityCount ?? 0,
});

const mapLanguage = (l) => ({ code: l.code, name: l.name, flag: l.flag || '🌐', active: l.isActive !== false });

const RESOURCES = {
  universities: async () => asArray(await apiRequest('/Universities?lang=az')).map(mapUniversity),
  programs: async () => asArray(await apiRequest('/Programs?lang=az')).map(mapProgram),
  courses: async () => asArray(await apiRequest('/Courses?lang=az')),
  countries: async () => asArray(await apiRequest('/Countries?lang=az')).map(mapCountry),
  languages: async () => asArray(await apiRequest('/Languages')).map(mapLanguage),
  talents: async () => asArray(await apiRequest('/HiddenTalents')),
  // Scholarships resolve their country names against the countries list.
  scholarships: async (state) => {
    const countries = state.countries?.length ? state.countries : await RESOURCES.countries();
    return asArray(await apiRequest('/Scholarships?lang=az')).map((s) => mapScholarship(s, countries));
  },
};

const RESOURCE_KEYS = Object.keys(RESOURCES);
const initialData = Object.fromEntries(RESOURCE_KEYS.map((k) => [k, []]));

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(() => Object.fromEntries(RESOURCE_KEYS.map((k) => [k, true])));
  const [errors, setErrors] = useState({});

  const load = useCallback(async (keys = RESOURCE_KEYS) => {
    const list = Array.isArray(keys) ? keys : [keys];
    setLoading((prev) => ({ ...prev, ...Object.fromEntries(list.map((k) => [k, true])) }));

    // Countries first so scholarships can map country codes without a second request.
    const snapshot = {};
    if (list.includes('countries') && list.includes('scholarships')) {
      snapshot.countries = await RESOURCES.countries().catch(() => []);
    }

    const results = await Promise.allSettled(
      list.map((k) => (k === 'countries' && snapshot.countries ? Promise.resolve(snapshot.countries) : RESOURCES[k](snapshot)))
    );

    const nextData = {};
    const nextErrors = {};
    results.forEach((r, i) => {
      const key = list[i];
      if (r.status === 'fulfilled') {
        nextData[key] = r.value;
        nextErrors[key] = null;
      } else {
        nextErrors[key] = r.reason?.message || 'Yüklənmədi';
      }
    });
    setData((prev) => ({ ...prev, ...nextData }));
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    setLoading((prev) => ({ ...prev, ...Object.fromEntries(list.map((k) => [k, false])) }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const isRefreshing = Object.values(loading).some(Boolean);
    return { ...data, loading, errors, reload: load, isRefreshing };
  }, [data, loading, errors, load]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

/** Same as useAdminData, but returns null outside the SuperAdmin panel (shared dialogs use it). */
export function useOptionalAdminData() {
  return useContext(AdminDataContext);
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}
