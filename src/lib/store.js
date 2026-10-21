import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TAX_YEAR } from '../data/taxYears.js';
import { emptyYearData } from '../data/fields.js';

const KEY = 'yearly-tax-return:v1';

const defaultState = () => ({
  settings: {
    lang: 'en',
    theme: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    taxYear: DEFAULT_TAX_YEAR,
  },
  years: {},
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return { settings: { ...base.settings, ...parsed.settings }, years: parsed.years || {} };
  } catch {
    return defaultState();
  }
}

/** Deep-merge saved year data over a fresh template so new fields always exist. */
function withDefaults(year) {
  const d = emptyYearData();
  if (!year) return d;
  const jobs = Object.fromEntries(Object.keys(d.jobs).map((j) => [j, { ...d.jobs[j], ...year.jobs?.[j] }]));
  return { ...d, ...year, jobs, shared: { ...d.shared, ...year.shared } };
}

export function useAppStore() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — app still works for this session */
    }
  }, [state]);

  const setSetting = useCallback((key, value) => setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } })), []);

  const yearId = state.settings.taxYear;
  const year = withDefaults(state.years[yearId]);

  /** updater receives a copy of this year's data and returns the new data. */
  const updateYear = useCallback(
    (updater) =>
      setState((s) => {
        const id = s.settings.taxYear;
        const current = withDefaults(s.years[id]);
        return { ...s, years: { ...s.years, [id]: updater(structuredClone(current)) } };
      }),
    []
  );

  const resetYear = useCallback(
    () => setState((s) => ({ ...s, years: { ...s.years, [s.settings.taxYear]: emptyYearData() } })),
    []
  );

  return { settings: state.settings, setSetting, year, updateYear, resetYear };
}
