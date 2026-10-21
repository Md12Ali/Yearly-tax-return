import { useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { TAX_YEARS } from '../data/taxYears.js';
import { num } from '../lib/taxEngine.js';
import { withDefaults } from '../lib/store.js';
import { currentTaxYear, todayUK } from '../lib/dates.js';
import { download } from '../lib/exportData.js';
import { entryLabel, entryBusiness, monthTotals } from './entries.js';
import { Card, Button, Callout, Stat } from './ui.jsx';

/** This month's logged income, expenses and miles, plus the latest entries. */
export function ThisMonthCard({ store }) {
  const { t, lang, money, shortDate, number } = useI18n();
  const today = todayUK();
  const yearId = currentTaxYear();
  const year = withDefaults(store.years[yearId]);
  const month = today.slice(0, 7);
  const totals = monthTotals(year.entries, month);
  const monthName = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(`${month}-15T12:00:00Z`));
  const recent = (year.entries || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);

  const remove = (id) => store.updateYearFor(yearId, (d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }));

  return (
    <Card title={`🗓️ ${t('daily.title', { month: monthName })}`} subtitle={t('daily.hint', { year: TAX_YEARS[yearId].label })}>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={t('quick.income')} value={money(totals.income)} tone="good" />
        <Stat label={t('quick.expense')} value={money(totals.expenses)} />
        <Stat label={t('quick.miles')} value={`${number(totals.miles)} mi`} />
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">{t('daily.recent')}</div>
      {recent.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t('daily.none')}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
          {recent.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="num w-12 shrink-0 text-xs text-muted">{shortDate(e.date)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{entryLabel(e, year, t)}</span>
                <span className="block truncate text-xs text-muted">
                  {entryBusiness(e, year, t)}
                  {e.note ? ` · ${e.note}` : ''}
                </span>
              </span>
              <span className={`num whitespace-nowrap font-bold ${e.kind === 'income' ? 'text-good' : 'text-ink'}`}>
                {e.kind === 'miles' ? `${number(num(e.amount))} mi` : `${e.kind === 'income' ? '+' : '−'}${money(num(e.amount))}`}
              </span>
              <button type="button" aria-label={t('ie.remove')} onClick={() => window.confirm(t('daily.confirmDelete')) && remove(e.id)} className="rounded-lg px-2 py-1 text-muted hover:bg-bad/10 hover:text-bad">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null);

/** Save everything to a file, restore it, and export every logged entry. */
export function BackupCard({ store, onMessage }) {
  const { t, date } = useI18n();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const last = store.settings.lastBackup;
  const age = daysSince(last);

  const backup = async () => {
    setBusy(true);
    try {
      await download(`tax-return-backup-${todayUK()}.json`, store.exportBackup(), 'application/json');
      onMessage?.(t('backup.saved'));
    } catch {
      /* share sheet closed */
    } finally {
      setBusy(false);
    }
  };

  const restore = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      if (!window.confirm(t('backup.confirmRestore'))) return;
      const n = store.importBackup(text);
      onMessage?.(t('backup.restored', { n }));
    } catch {
      onMessage?.(t('backup.invalid'), 'warn');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const entriesCsv = async () => {
    const rows = [['Date', 'Tax year', 'Business', 'Type', 'Item', 'Amount', 'Note']];
    Object.entries(store.years).forEach(([id, raw]) => {
      const y = withDefaults(raw);
      (y.entries || []).forEach((e) =>
        rows.push([e.date, TAX_YEARS[id]?.label || id, entryBusiness(e, y, t), e.kind, entryLabel(e, y, t).replace(/^\S+\s/, ''), num(e.amount), e.note || ''])
      );
    });
    rows.sort((a, b) => (a[0] === 'Date' ? -1 : b[0] === 'Date' ? 1 : String(a[0]).localeCompare(String(b[0]))));
    const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    try {
      await download(`tax-return-entries-${todayUK()}.csv`, '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
    } catch {
      /* share sheet closed */
    }
  };

  return (
    <Card title={`💾 ${t('backup.title')}`} subtitle={t('backup.hint')}>
      {age === null || age > 14 ? (
        <Callout tone="warn">{age === null ? t('backup.never') : t('backup.overdue', { days: age })}</Callout>
      ) : (
        <p className="text-sm text-good">✓ {t('backup.last', { date: date(last.slice(0, 10)) })}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={backup} disabled={busy}>
          💾 {t('backup.backupNow')}
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          📂 {t('backup.restore')}
        </Button>
        <Button variant="ghost" onClick={entriesCsv}>
          📊 {t('backup.entriesCsv')}
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
      </div>
    </Card>
  );
}
