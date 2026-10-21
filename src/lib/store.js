import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TAX_YEAR } from '../data/taxYears.js';
import { taxYearForDate } from './dates.js';
import { emptyYearData, migrateYear, JOBS } from '../data/fields.js';

const KEY = 'yearly-tax-return:v1';
const BACKUP_FORMAT = 'tax-return-helper-backup';

export { taxYearForDate, currentTaxYear } from './dates.js';

const defaultState = () => ({
  settings: {
    lang: 'en',
    theme: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    taxYear: DEFAULT_TAX_YEAR,
    lastBackup: null,
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

/** Upgrade old data and deep-merge over a fresh template so new fields always exist. */
export function withDefaults(raw) {
  const d = emptyYearData();
  const year = migrateYear(raw);
  if (!year) return d;
  const jobs = Object.fromEntries(JOBS.map((j) => [j, { ...d.jobs[j], ...year.jobs?.[j] }]));
  return {
    ...d,
    ...year,
    jobs,
    shared: { ...d.shared, ...year.shared },
    vehicles: Array.isArray(year.vehicles) && year.vehicles.length ? year.vehicles : d.vehicles,
  };
}

/** Does this year have anything entered? */
export function yearHasData(y) {
  if (!y) return false;
  const filled = (o) => Object.values(o || {}).some((v) => String(v ?? '').trim() !== '' && v !== 0);
  return (
    (y.entries || []).length > 0 ||
    Object.values(y.jobs || {}).some((j) => filled(j.income) || filled(j.expenses) || (j.customIncome || []).length || (j.customExpenses || []).length) ||
    (y.vehicles || []).some((v) => filled(v.costs) || filled(v.miles) || v.totalMiles)
  );
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

  // Ask the browser not to clear our data when space runs low.
  useEffect(() => {
    try {
      navigator.storage?.persist?.();
    } catch {
      /* not supported */
    }
  }, []);

  const setSetting = useCallback((key, value) => setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } })), []);

  const yearId = state.settings.taxYear;
  const year = withDefaults(state.years[yearId]);

  /** Update any tax year's data (defaults to the one on screen). */
  const updateYearFor = useCallback(
    (id, updater) =>
      setState((s) => {
        const target = id || s.settings.taxYear;
        const current = withDefaults(s.years[target]);
        return { ...s, years: { ...s.years, [target]: updater(structuredClone(current)) } };
      }),
    []
  );
  const updateYear = useCallback((updater) => updateYearFor(null, updater), [updateYearFor]);

  /** Add a quick-log entry to the tax year its date belongs to. Returns that year id. */
  const addEntry = useCallback(
    (entry) => {
      const id = taxYearForDate(entry.date) || state.settings.taxYear;
      updateYearFor(id, (d) => ({ ...d, entries: [entry, ...(d.entries || [])] }));
      return id;
    },
    [updateYearFor, state.settings.taxYear]
  );

  const resetYear = useCallback(() => setState((s) => ({ ...s, years: { ...s.years, [s.settings.taxYear]: emptyYearData() } })), []);

  /** Everything, as a JSON string you can save. */
  const exportBackup = useCallback(() => {
    const payload = { format: BACKUP_FORMAT, version: 2, exportedAt: new Date().toISOString(), settings: state.settings, years: state.years };
    setState((s) => ({ ...s, settings: { ...s.settings, lastBackup: payload.exportedAt } }));
    return JSON.stringify(payload, null, 2);
  }, [state]);

  /** Replace all data with a backup. Throws if the file isn't a backup. */
  const importBackup = useCallback((text) => {
    const data = JSON.parse(text);
    if (data?.format !== BACKUP_FORMAT || typeof data.years !== 'object') throw new Error('not-a-backup');
    const years = Object.fromEntries(Object.entries(data.years).map(([id, y]) => [id, withDefaults(y)]));
    setState((s) => ({ settings: { ...s.settings, ...data.settings, lastBackup: data.exportedAt || s.settings.lastBackup }, years }));
    return Object.keys(years).length;
  }, []);

  return { settings: state.settings, setSetting, year, years: state.years, updateYear, updateYearFor, addEntry, resetYear, exportBackup, importBackup };
}
