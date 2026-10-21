import { TAX_YEARS } from '../data/taxYears.js';

/** Today's date in the UK as YYYY-MM-DD. */
export function todayUK() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
}

/** Tax year (6 April – 5 April) that a date belongs to, e.g. '2026-10-21' → '2026-27'. */
export function taxYearForDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  const start = m > 4 || (m === 4 && d >= 6) ? y : y - 1;
  const id = `${start}-${String(start + 1).slice(2)}`;
  return TAX_YEARS[id] ? id : null;
}

/** The tax year we are in today (falls back to the newest one the app knows). */
export function currentTaxYear() {
  const ids = Object.keys(TAX_YEARS);
  return taxYearForDate(todayUK()) || ids[ids.length - 1];
}
