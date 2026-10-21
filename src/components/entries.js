import { JOBS, INCOME_FIELDS, EXPENSE_FIELDS, VEHICLE_COSTS } from '../data/fields.js';
import { num } from '../lib/taxEngine.js';
import { vehicleName } from './parts.jsx';

/** Human label for a logged entry. */
export function entryLabel(e, year, t) {
  const vi = (year.vehicles || []).findIndex((v) => v.id === e.scope);
  const v = vi >= 0 ? year.vehicles[vi] : null;
  if (e.kind === 'income') return `💷 ${t(`income.${e.field}.label`)}`;
  if (e.kind === 'miles') return `🛣️ ${v ? vehicleName(v, t, vi) : '—'} · ${t(`jobs.${e.field}.short`)}`;
  if (e.kind === 'vehicle') return `⛽ ${v ? vehicleName(v, t, vi) : '—'} · ${t(`vehicle.costs.${e.field}.label`)}`;
  return `🧾 ${t(`expense.${e.field}.label`)}`;
}

export const entryBusiness = (e, year, t) => {
  if (JOBS.includes(e.scope)) return year.jobs[e.scope]?.name || t(`jobs.${e.scope}.short`);
  if (e.scope === 'shared') return t('jobs.shared.short');
  return t('vehicle.title');
};

/** Options for the quick-add sheet: where an entry can go, for each type. */
export function quickTargets(kind, year, t) {
  const out = [];
  if (kind === 'income') {
    JOBS.forEach((j) =>
      INCOME_FIELDS[j].forEach((f) => out.push({ group: year.jobs[j]?.name || t(`jobs.${j}.name`), scope: j, kind, field: f.id, label: t(`income.${f.id}.label`) }))
    );
  } else if (kind === 'expense') {
    JOBS.forEach((j) =>
      EXPENSE_FIELDS[j].forEach((f) => out.push({ group: year.jobs[j]?.name || t(`jobs.${j}.name`), scope: j, kind, field: f.id, label: t(`expense.${f.id}.label`) }))
    );
    EXPENSE_FIELDS.shared.forEach((f) => out.push({ group: t('jobs.shared.name'), scope: 'shared', kind, field: f.id, label: t(`expense.${f.id}.label`) }));
    (year.vehicles || []).forEach((v, i) =>
      VEHICLE_COSTS.forEach((f) => out.push({ group: `⛽ ${vehicleName(v, t, i)}`, scope: v.id, kind: 'vehicle', field: f, label: t(`vehicle.costs.${f}.label`) }))
    );
  } else {
    (year.vehicles || []).forEach((v, i) =>
      (v.jobs || []).forEach((j) => out.push({ group: `🛣️ ${vehicleName(v, t, i)}`, scope: v.id, kind: 'miles', field: j, label: t(`jobs.${j}.name`) }))
    );
  }
  return out;
}

export const targetKey = (x) => `${x.scope}|${x.kind}|${x.field}`;

/** Totals of logged entries in one calendar month (YYYY-MM). */
export function monthTotals(entries, month) {
  const list = (entries || []).filter((e) => String(e.date).startsWith(month));
  const sum = (k) => list.filter(k).reduce((s, e) => s + num(e.amount), 0);
  return {
    count: list.length,
    income: sum((e) => e.kind === 'income'),
    expenses: sum((e) => e.kind === 'expense' || e.kind === 'vehicle'),
    miles: sum((e) => e.kind === 'miles'),
  };
}
