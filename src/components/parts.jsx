import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { JOBS, JOB_META, EXPENSE_BOXES } from '../data/fields.js';
import { Button, Card, CopyValue, Segmented, Callout } from './ui.jsx';
import { buildSummary, toCSV, toPDF, download } from '../lib/exportData.js';

export function MethodToggle({ method, onChange }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">{t('method.title')}</div>
      <Segmented
        label={t('method.title')}
        value={method}
        onChange={onChange}
        options={[
          { value: 'actual', label: t('method.actual'), icon: '🧾' },
          { value: 'mileage', label: t('method.mileage'), icon: '🛣️' },
        ]}
      />
    </div>
  );
}

/** Side-by-side comparison of both expense methods, highlighting the cheaper one. */
export function MethodCompare({ result, method, onChange, compact = false }) {
  const { t, money } = useI18n();
  const { compare } = result;
  const hasData = result.totals.gross > 0 && (result.totals.businessMiles > 0 || result.totals.vehicleActual > 0);
  const name = (m) => t(`method.${m}`);

  const tile = (m) => {
    const c = compare[m];
    const best = compare.better === m;
    const active = method === m;
    return (
      <button
        type="button"
        onClick={() => onChange(m)}
        aria-pressed={active}
        className={`relative flex-1 rounded-xl border p-3 text-left transition ${
          best ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
        } ${active ? 'ring-2 ring-accent' : ''}`}
      >
        {best && (
          <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent-ink">
            ★ {t('method.best')}
          </span>
        )}
        <div className="text-sm font-bold text-ink">
          {m === 'actual' ? '🧾' : '🛣️'} {name(m)}
        </div>
        {!compact && <p className="mt-1 text-xs leading-snug text-muted">{t(`method.${m}Desc`)}</p>}
        <dl className="mt-2 space-y-0.5 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">{t('method.expensesLabel')}</dt>
            <dd className="num font-bold text-ink">{money(c.expenses)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">{t('method.taxLabel')}</dt>
            <dd className="num font-bold text-ink">{money(c.tax)}</dd>
          </div>
        </dl>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 pt-2">
        {tile('actual')}
        {tile('mileage')}
      </div>
      {!hasData ? (
        <p className="text-xs text-muted">{t('method.noData')}</p>
      ) : compare.better === 'same' ? (
        <Callout>{t('method.same')}</Callout>
      ) : (
        <Callout tone="good">
          <strong>{t('method.better', { method: name(compare.better), amount: money(compare.saving) })}</strong>
          {method !== compare.better && (
            <button type="button" onClick={() => onChange(compare.better)} className="ml-2 font-bold text-accent underline underline-offset-2">
              {t('method.switchTo', { method: name(compare.better) })}
            </button>
          )}
        </Callout>
      )}
      {!compact && <p className="text-xs text-muted">ℹ️ {t('method.lockNote')}</p>}
    </div>
  );
}

/** Gross → expenses → tax → what you keep, as one stacked bar. */
export function MoneyFlow({ result }) {
  const { t, money } = useI18n();
  const { gross, expenses } = result.totals;
  if (gross <= 0) return null;
  const tax = Math.min(result.tax.total, Math.max(0, gross - expenses));
  const keep = Math.max(0, gross - expenses - tax);
  const parts = [
    { label: t('calc.expenses'), v: Math.min(expenses, gross), c: 'var(--muted)' },
    { label: t('calc.total'), v: tax, c: 'var(--warn)' },
    { label: t('calc.keep'), v: keep, c: 'var(--accent)' },
  ];
  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-surface-2">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.v / gross) * 100}%`, background: p.c }} className="h-full transition-all duration-500" />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5 text-muted">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.c }} />
            {p.label}: <span className="num font-bold text-ink">{money(p.v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Gross → Net → Taxable flow with definitions. */
export function StepFlow({ result }) {
  const { t, money } = useI18n();
  const { totals, tax } = result;
  const steps = [
    { op: '', label: t('calc.gross'), def: t('calc.grossDef'), v: totals.gross },
    { op: '−', label: t('calc.expenses'), def: t('calc.expensesDef'), v: totals.expenses },
    { op: '=', label: t('calc.net'), def: t('calc.netDef'), v: totals.netProfit, strong: true },
    { op: '−', label: t('calc.allowance'), def: t('calc.allowanceDef'), v: Math.min(tax.allowance, Math.max(0, totals.taxableProfits)) },
    { op: '=', label: t('calc.taxable'), def: t('calc.taxableDef'), v: tax.taxable, strong: true },
  ];
  return (
    <ol className="space-y-1.5">
      {steps.map((s) => (
        <li key={s.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${s.strong ? 'bg-accent-soft' : 'bg-surface-2'}`}>
          <span className="w-4 text-center text-lg font-extrabold text-muted">{s.op}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink">{s.label}</div>
            <div className="text-[11px] leading-snug text-muted">{s.def}</div>
          </div>
          <div className={`num text-right font-extrabold ${s.v < 0 ? 'text-bad' : 'text-ink'} ${s.strong ? 'text-lg' : ''}`}>{money(s.v)}</div>
        </li>
      ))}
    </ol>
  );
}

/** SA103S box-by-box figures for each business, with copy buttons. */
export function BoxesTable({ result }) {
  const { t, money0 } = useI18n();
  const active = JOBS.filter((j) => result.jobs[j].active);
  const [open, setOpen] = useState(active[0]);
  if (!active.length) return <p className="text-sm text-muted">{t('dash.empty')}</p>;
  return (
    <div className="space-y-3">
      {active.map((j) => {
        const r = result.jobs[j];
        const b = r.boxes;
        const isOpen = open === j;
        const rows = [9, ...EXPENSE_BOXES.filter((n) => b[n] > 0), 20, b[22] > 0 ? 22 : 21];
        return (
          <div key={j} className="overflow-hidden rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : j)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 bg-surface-2 px-3 py-2.5 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <span aria-hidden>{JOB_META[j].icon}</span>
                SA103S · {t(`jobs.${j}.name`)}
              </span>
              <span className="num text-sm font-bold text-muted">
                {b[22] > 0 ? `−${money0(b[22])}` : money0(b[21])} {isOpen ? '▴' : '▾'}
              </span>
            </button>
            {isOpen && (
              <div className="divide-y divide-line">
                {!r.shortFormOk && <div className="p-3"><Callout tone="warn">{t('calc.longForm')}</Callout></div>}
                {b[22] > 0 && <div className="p-3"><Callout tone="warn">{t('calc.loss')}</Callout></div>}
                {rows.map((n) => (
                  <div key={n} className={`flex items-center gap-3 px-3 py-2 ${[9, 20, 21, 22].includes(n) ? 'bg-surface' : 'bg-bg'}`}>
                    <span className="num w-14 shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-center text-xs font-extrabold text-accent">
                      {t('calc.box')} {n}
                    </span>
                    <span className={`min-w-0 flex-1 text-sm ${[9, 20, 21, 22].includes(n) ? 'font-bold text-ink' : 'text-muted'}`}>{t(`boxes.${n}`)}</span>
                    <CopyValue value={b[n]} display={money0(b[n])} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ExportButtons({ result, cfg, year }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const base = `self-assessment-${cfg.id}`;
  const csv = () => download(`${base}.csv`, toCSV(buildSummary(result, cfg, year)), 'text/csv;charset=utf-8');
  const pdf = async () => {
    setBusy(true);
    try {
      const bytes = await toPDF(buildSummary(result, cfg, year), cfg);
      download(`${base}.pdf`, new Blob([bytes], { type: 'application/pdf' }));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title={`⬇️ ${t('dash.export')}`} subtitle={t('dash.exportNote')}>
      <div className="flex flex-wrap gap-2">
        <Button onClick={pdf} disabled={busy}>📄 {t('dash.exportPdf')}</Button>
        <Button variant="ghost" onClick={csv}>📊 {t('dash.exportCsv')}</Button>
      </div>
    </Card>
  );
}
