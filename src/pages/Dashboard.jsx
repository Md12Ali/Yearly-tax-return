import { useI18n } from '../i18n/index.jsx';
import { JOBS, JOB_META } from '../data/fields.js';
import { Card, Stat, Progress, Callout, Button } from '../components/ui.jsx';
import { VehicleMethods, MoneyFlow, ExportButtons } from '../components/parts.jsx';

const daysUntil = (iso) => {
  const today = new Date();
  const end = new Date(`${iso}T23:59:59Z`);
  return Math.ceil((end - today) / 86400000);
};

export default function Dashboard({ result, cfg, year, updateYear, goTo }) {
  const { t, tx, money, money0, date, pct } = useI18n();
  const { totals, tax } = result;
  const days = daysUntil(cfg.onlineDeadline);
  const empty = totals.gross <= 0;
  const maxGross = Math.max(1, ...JOBS.map((j) => result.jobs[j].gross));

  const hasExpenses = totals.expenses > 0;
  const recordsDone = Object.values(year.checklist || {}).filter(Boolean).length;
  const steps = [
    { label: t('dash.stepIncome'), done: totals.gross > 0 },
    { label: t('dash.stepExpenses'), done: hasExpenses },
    { label: t('dash.stepMiles'), done: totals.businessMiles > 0 },
    { label: t('dash.stepRecords'), done: recordsDone >= tx('learn.records.items').length },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="hero relative overflow-hidden rounded-3xl p-5 text-white sm:p-6">
        <div className="text-sm font-semibold opacity-85">{t('dash.hello', { year: cfg.label })}</div>
        <div className="mt-3 text-sm font-semibold opacity-85">{t('dash.toSetAside')}</div>
        <div className="num mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{money(tax.total)}</div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
          <span>
            {t('calc.setAside')}: <strong className="num">{money(tax.total / 12)}</strong>
          </span>
          <span>
            {t('calc.effective')}: <strong className="num">{pct(tax.effectiveRate)}</strong>
          </span>
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
          <span>📅 {t('dash.deadline', { date: date(cfg.onlineDeadline) })}</span>
          <span className="opacity-80">·</span>
          <span>{days >= 0 ? t('dash.daysLeft', { days }) : t('dash.overdue')}</span>
        </div>
      </section>

      {empty && (
        <Card tone="accent">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{t('dash.empty')}</p>
            <Button onClick={() => goTo('income')}>💰 {t('dash.start')}</Button>
          </div>
        </Card>
      )}

      {result.mtd.applies && (
        <Callout tone="warn" title={t('dash.mtdTitle')}>
          {t('dash.mtdBody', { amount: money0(result.mtd.qualifying), threshold: money0(result.mtd.threshold), date: date(result.mtd.startDate) })}
        </Callout>
      )}

      <Card title={t('dash.stats')}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label={t('calc.gross')} value={money0(totals.gross)} hint={t('calc.grossDef')} />
          <Stat label={t('calc.expenses')} value={money0(totals.expenses + totals.capitalAllowances)} hint={t('calc.expensesDef')} />
          <Stat label={t('calc.net')} value={money0(totals.netProfit)} hint={t('calc.netDef')} tone={totals.netProfit < 0 ? 'bad' : undefined} />
          <Stat label={t('calc.taxable')} value={money0(tax.taxable)} hint={t('calc.taxableDef')} />
        </div>
        {!empty && (
          <div className="mt-4">
            <MoneyFlow result={result} />
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t('dash.byJob')}>
          <ul className="space-y-3">
            {JOBS.map((j) => {
              const r = result.jobs[j];
              return (
                <li key={j}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-bold text-ink">
                      <span aria-hidden>{JOB_META[j].icon}</span> {t(`jobs.${j}.name`)}
                    </span>
                    <span className="num font-bold text-ink">{money0(r.gross)}</span>
                  </div>
                  <Progress value={r.gross / maxGross} color={JOB_META[j].color} label={t(`jobs.${j}.name`)} />
                  <div className="num mt-1 text-xs text-muted">
                    {t('dash.profit')}: <span className={r.profit < 0 ? 'text-bad' : 'text-ink'}>{money0(r.profit)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title={t('method.title')}>
          <VehicleMethods result={result} data={year} updateYear={updateYear} compact />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t('dash.progress')} action={<span className="num text-sm font-bold text-muted">{doneCount}/4</span>}>
          <Progress value={doneCount / 4} label={t('dash.progress')} />
          <ul className="mt-3 space-y-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm">
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${s.done ? 'bg-accent text-accent-ink' : 'border border-line text-muted'}`}>
                  {s.done ? '✓' : ''}
                </span>
                <span className={s.done ? 'text-ink' : 'text-muted'}>{s.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('dash.keyDates')}>
          <ul className="space-y-2 text-sm">
            {[
              [t('dash.registerBy'), cfg.registerBy],
              [t('dash.paperBy'), cfg.paperDeadline],
              [t('dash.onlineBy'), cfg.onlineDeadline, true],
              [t('dash.secondPoa'), cfg.secondPoaDate],
            ].map(([label, iso, key]) => (
              <li key={label} className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${key ? 'bg-accent-soft font-bold' : 'bg-surface-2'}`}>
                <span className="text-ink">{label}</span>
                <span className="num whitespace-nowrap text-ink">{date(iso)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {!empty && <ExportButtons result={result} cfg={cfg} year={year} />}
    </div>
  );
}
