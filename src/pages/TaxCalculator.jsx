import { useI18n } from '../i18n/index.jsx';
import { Card, MoneyInput, Switch, Callout, Stat } from '../components/ui.jsx';
import { VehicleMethods, StepFlow, BoxesTable, ExportButtons } from '../components/parts.jsx';

export default function TaxCalculator({ result, cfg, year, updateYear }) {
  const { t, money, money0, date, pct } = useI18n();
  const { tax, totals } = result;
  const c2 = cfg.class2;

  const Row = ({ label, value, strong, muted }) => (
    <div className={`flex items-baseline justify-between gap-3 py-2 ${strong ? 'font-extrabold text-ink' : muted ? 'pl-4 text-sm text-muted' : 'font-semibold text-ink'}`}>
      <span className="min-w-0">{label}</span>
      <span className="num whitespace-nowrap">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card title={t('method.title')}>
        <VehicleMethods result={result} data={year} updateYear={updateYear} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`🧮 ${t('calc.title')}`}>
          <StepFlow result={result} />
          {tax.allowance < cfg.incomeTax.personalAllowance && (
            <div className="mt-3">
              <Callout tone="warn">{t('calc.paTapered')}</Callout>
            </div>
          )}
        </Card>

        <Card title={t('calc.breakdown')}>
          <div className="divide-y divide-line">
            <Row label={t('calc.incomeTax')} value={money(tax.incomeTax)} />
            <Row muted label={t('calc.basic', { amount: money0(tax.bands.basicAmt) })} value={money(tax.bands.basicTax)} />
            {tax.bands.higherAmt > 0 && <Row muted label={t('calc.higher', { amount: money0(tax.bands.higherAmt) })} value={money(tax.bands.higherTax)} />}
            {tax.bands.additionalAmt > 0 && (
              <Row muted label={t('calc.additional', { amount: money0(tax.bands.additionalAmt) })} value={money(tax.bands.additionalTax)} />
            )}
            <Row label={t('calc.class4')} value={money(tax.class4)} />
            <Row muted label={t('calc.class4Main', { amount: money0(Math.max(0, Math.min(tax.profit, cfg.class4.upperLimit) - cfg.class4.lowerLimit)) })} value={money(tax.class4Main)} />
            {tax.class4Upper > 0 && <Row muted label={t('calc.class4Upper', { amount: money0(tax.profit - cfg.class4.upperLimit) })} value={money(tax.class4Upper)} />}
            <Row label={t('calc.class2')} value={money(tax.class2)} />
            <div className="py-2">
              {tax.class2TreatedAsPaid ? (
                <p className="text-xs leading-relaxed text-muted">{t('calc.class2Treated', { spt: money0(c2.smallProfitsThreshold) })}</p>
              ) : (
                <>
                  <p className="text-xs leading-relaxed text-muted">
                    {t('calc.class2Low', { spt: money0(c2.smallProfitsThreshold), weekly: money(c2.weeklyRate), annual: money(tax.class2Annual) })}
                  </p>
                  <Switch label={t('calc.class2Toggle')} checked={!!year.class2Voluntary} onChange={(v) => updateYear((d) => ({ ...d, class2Voluntary: v }))} />
                </>
              )}
            </div>
            <div className="pt-2">
              <div className="flex items-baseline justify-between rounded-xl bg-accent-soft px-3 py-3">
                <span className="font-extrabold text-ink">{t('calc.total')}</span>
                <span className="num text-2xl font-extrabold text-ink">{money(tax.total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label={t('calc.effective')} value={pct(tax.effectiveRate)} />
            <Stat label={t('calc.setAside')} value={money(tax.total / 12)} />
          </div>
        </Card>
      </div>

      <Card title={`📅 ${t('calc.poaTitle')}`} subtitle={tax.poaRequired ? t('calc.poaExplain') : t('calc.poaNone')}>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-accent/40 bg-accent-soft p-3">
            <div className="text-xs font-bold text-muted">{t('calc.dueBy', { date: date(cfg.onlineDeadline) })}</div>
            <div className="num mt-1 text-2xl font-extrabold text-ink">{money(tax.dueJanuary)}</div>
            <div className="text-xs text-muted">{tax.poaEach ? t('calc.janIncludes') : t('calc.total')}</div>
          </div>
          {tax.poaEach > 0 && (
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="text-xs font-bold text-muted">{t('calc.dueBy', { date: date(cfg.secondPoaDate) })}</div>
              <div className="num mt-1 text-2xl font-extrabold text-ink">{money(tax.dueJuly)}</div>
              <div className="text-xs text-muted">{t('calc.julIncludes')}</div>
            </div>
          )}
        </div>
        <MoneyInput label={t('calc.poaPaid')} tip={t('calc.poaPaidTip')} value={year.poaPaid} onChange={(v) => updateYear((d) => ({ ...d, poaPaid: v }))} />
        {tax.refund > 0 && <Callout tone="good">{t('calc.refund', { amount: money(tax.refund) })}</Callout>}
      </Card>

      <Card title={`📋 ${t('calc.boxesTitle')}`} subtitle={t('calc.boxesHint')}>
        <BoxesTable result={result} />
        {totals.gross > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-sm font-bold text-ink">
            <span>{t('calc.totalProfits')}</span>
            <span className="num">{money0(totals.taxableProfits)}</span>
          </div>
        )}
      </Card>

      {totals.gross > 0 && <ExportButtons result={result} cfg={cfg} year={year} />}
    </div>
  );
}
