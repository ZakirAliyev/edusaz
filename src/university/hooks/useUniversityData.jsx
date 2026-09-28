import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/admin/lib/api';
import { mapCountry, mapProgram, mapScholarship, mapUniversity } from '@/admin/hooks/useAdminData';

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const KEYS = ['university', 'countries', 'programs', 'scholarships', 'leads'];

const UniversityDataContext = createContext(null);

/** Loads everything the university portal needs, scoped to one university. */
export function UniversityDataProvider({ universityId, children }) {
  const [data, setData] = useState({ university: null, countries: [], programs: [], scholarships: [], leads: [] });
  const [loading, setLoading] = useState(() => Object.fromEntries(KEYS.map((k) => [k, true])));
  const [errors, setErrors] = useState({});

  const load = useCallback(
    async (keys = KEYS) => {
      const list = Array.isArray(keys) ? keys : [keys];
      setLoading((l) => ({ ...l, ...Object.fromEntries(list.map((k) => [k, true])) }));

      let countries = null;
      const loaders = {
        university: async () => mapUniversity(await apiRequest(`/Universities/${universityId}?lang=az`)),
        countries: async () => {
          countries = asArray(await apiRequest('/Countries?lang=az')).map(mapCountry);
          return countries;
        },
        programs: async () => asArray(await apiRequest(`/Programs?lang=az&universityId=${universityId}`)).map(mapProgram),
        scholarships: async () => {
          const list = asArray(await apiRequest(`/Scholarships?lang=az&universityId=${universityId}`));
          const c = countries || asArray(await apiRequest('/Countries?lang=az')).map(mapCountry);
          return list.map((s) => mapScholarship(s, c));
        },
        leads: async () => asArray(await apiRequest(`/StudentLeads?universityId=${universityId}`)),
      };

      if (list.includes('countries') && list.includes('scholarships')) await loaders.countries().catch(() => null);
      const results = await Promise.allSettled(list.map((k) => (k === 'countries' && countries ? Promise.resolve(countries) : loaders[k]())));

      const nextData = {};
      const nextErrors = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          nextData[list[i]] = r.value;
          nextErrors[list[i]] = null;
        } else {
          nextErrors[list[i]] = r.reason?.message || 'Yüklənmədi';
        }
      });
      setData((d) => ({ ...d, ...nextData }));
      setErrors((e) => ({ ...e, ...nextErrors }));
      setLoading((l) => ({ ...l, ...Object.fromEntries(list.map((k) => [k, false])) }));
    },
    [universityId]
  );

  useEffect(() => {
    if (universityId) load();
  }, [universityId, load]);

  const value = useMemo(() => ({ ...data, universityId, loading, errors, reload: load }), [data, universityId, loading, errors, load]);
  return <UniversityDataContext.Provider value={value}>{children}</UniversityDataContext.Provider>;
}

export function useUniversityData() {
  const ctx = useContext(UniversityDataContext);
  if (!ctx) throw new Error('useUniversityData must be used within UniversityDataProvider');
  return ctx;
}
