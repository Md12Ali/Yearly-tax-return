import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { JOBS, JOB_META, INCOME_FIELDS, EXPENSE_FIELDS } from '../data/fields.js';
import { fieldTotal, num } from '../lib/taxEngine.js';
import { Card, MoneyInput, Segmented, Callout, Button, LabelWithTip } from '../components/ui.jsx';
import { MethodToggle } from '../components/parts.jsx';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function IncomeExpenses({ result, cfg, year, updateYear, resetYear }) {
  const { t, money, pct } = useI18n();
  const [scope, setScope] = useState('tuition');
  const mileage = year.method === 'mileage';

  const setField = (kind, field, value) =>
    updateYear((d) => {
      const bucket = scope === 'shared' ? d.shared : d.jobs[scope];
      bucket[kind === 'income' ? 'income' : 'expenses'][field] = value;
      return d;
    });

  const loggedExtra = (kind, field) => {
    const total = fieldTotal(year, scope, kind, field);
    const bucket = scope === 'shared' ? year.shared : year.jobs[scope];
    const base = num(kind === 'income' ? bucket.income[field] : bucket.expenses[field]);
    const extra = Math.round((total - base) * 100) / 100;
    return extra > 0 ? t('ie.fromEntries', { amount: money(extra) }) : undefined;
  };

  const expenseInput = (f, bucket) => {
    const off = mileage && f.vehicle;
    return (
      <MoneyInput
        key={f.id}
        label={t(`expense.${f.id}.label`)}
        tip={t(`expense.${f.id}.tip`)}
        value={bucket.expenses[f.id]}
        onChange={(v) => setField('expense', f.id, v)}
        badge={f.vehicle ? (off ? t('ie.notUsed') : t('ie.carCost')) : undefined}
        disabled={off}
        note={loggedExtra('expense', f.id)}
      />
    );
  };

  const options = [
    ...JOBS.map((j) => ({ value: j, label: t(`jobs.${j}.short`), icon: JOB_META[j].icon })),
    { value: 'shared', label: t('jobs.shared.short'), icon: '⛽' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <MethodToggle method={year.method} onChange={(m) => updateYear((d) => ({ ...d, method: m }))} />
        <p className="mt-2 text-xs text-muted">{mileage ? t('method.mileageDesc') : t('method.actualDesc')}</p>
      </Card>

      <div className="sticky top-[var(--header-h)] z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">{t('ie.pickBusiness')}</div>
        <Segmented label={t('ie.pickBusiness')} value={scope} onChange={setScope} options={options} size="sm" />
      </div>

      {scope !== 'shared' ? (
        <JobEditor
          job={scope}
          result={result}
          year={year}
          setField={setField}
          expenseInput={expenseInput}
          loggedExtra={loggedExtra}
          setMiles={(v) => updateYear((d) => ((d.jobs[scope].miles = v), d))}
        />
      ) : (
        <>
          <Card title={`🛣️ ${t('ie.milesTitle')}`}>
            <MoneyInput
              prefix=""
              placeholder="0"
              suffix="mi"
              label={t('ie.totalMiles')}
              tip={t('ie.totalMilesTip')}
              value={year.shared.totalMiles}
              onChange={(v) => updateYear((d) => ((d.shared.totalMiles = v), d))}
            />
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {JOBS.map((j) => (
                <div key={j} className="flex justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <span className="text-muted">{JOB_META[j].icon} {t(`jobs.${j}.short`)}</span>
                  <span className="num font-bold text-ink">{num(year.jobs[j].miles).toLocaleString('en-GB')}</span>
                </div>
              ))}
              <div className="flex justify-between rounded-lg bg-accent-soft px-3 py-2 font-bold">
                <span className="text-ink">{t('ie.businessUse')}</span>
                <span className="num text-ink">{pct(result.totals.businessUse)}</span>
              </div>
            </div>
            {!result.totals.hasTotalMiles && <div className="mt-3"><Callout tone="warn">{t('ie.missingTotal')}</Callout></div>}
          </Card>

          <Card title={`⛽ ${t('ie.vehicleTitle')}`} subtitle={t('ie.vehicleHint', { pct: pct(result.totals.businessUse) })}>
            {mileage && <div className="mb-2"><Callout>{t('method.mileageDesc')}</Callout></div>}
            <div className="grid gap-x-4 sm:grid-cols-2">{EXPENSE_FIELDS.shared.filter((f) => f.vehicle).map((f) => expenseInput(f, year.shared))}</div>
          </Card>

          <Card title={`📱 ${t('ie.otherSharedTitle')}`}>
            <div className="grid gap-x-4 sm:grid-cols-2">{EXPENSE_FIELDS.shared.filter((f) => !f.vehicle).map((f) => expenseInput(f, year.shared))}</div>
          </Card>
        </>
      )}

      <QuickLog key={scope} scope={scope} year={year} updateYear={updateYear} />

      <div className="flex justify-end pt-2">
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm(t('ie.resetConfirm', { year: cfg.label }))) resetYear();
          }}
        >
          🗑️ {t('ie.resetYear')}
        </Button>
      </div>
    </div>
  );
}

function JobEditor({ job, result, year, setField, expenseInput, loggedExtra, setMiles }) {
  const { t, money } = useI18n();
  const data = year.jobs[job];
  const r = result.jobs[job];
  return (
    <>
      <div className="rounded-2xl border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${JOB_META[job].color}` }}>
        <div className="text-lg font-extrabold text-ink">
          {JOB_META[job].icon} {t(`jobs.${job}.name`)}
        </div>
        <div className="text-sm text-muted">{t(`jobs.${job}.desc`)}</div>
        <div className="num mt-2 text-sm font-semibold text-ink">
          {t('ie.jobTotal', { gross: money(r.gross), expenses: money(r.expenses), profit: money(r.profit) })}
        </div>
      </div>

      <Card title={`💷 ${t('ie.incomeTitle')}`} subtitle={t('ie.incomeHint')}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {INCOME_FIELDS[job].map((f) => (
            <MoneyInput
              key={f}
              label={t(`income.${f}.label`)}
              tip={t(`income.${f}.tip`)}
              value={data.income[f]}
              onChange={(v) => setField('income', f, v)}
              note={loggedExtra('income', f)}
            />
          ))}
        </div>
      </Card>

      <Card title={`🧾 ${t('ie.expensesTitle')}`}>
        <div className="grid gap-x-4 sm:grid-cols-2">{EXPENSE_FIELDS[job].map((f) => expenseInput(f, data))}</div>
      </Card>

      <Card title={`🛣️ ${t('ie.milesTitle')}`}>
        <MoneyInput
          prefix=""
          placeholder="0"
          suffix="mi"
          label={t('ie.businessMiles')}
          tip={t('ie.businessMilesTip')}
          value={data.miles}
          onChange={setMiles}
        />
      </Card>
    </>
  );
}

function QuickLog({ scope, year, updateYear }) {
  const { t, money, shortDate } = useI18n();
  const isShared = scope === 'shared';
  const [kind, setKind] = useState(isShared ? 'expense' : 'income');
  const effectiveKind = isShared ? 'expense' : kind;
  const fields =
    effectiveKind === 'income' ? INCOME_FIELDS[scope].map((id) => ({ id, label: t(`income.${id}.label`) })) : EXPENSE_FIELDS[scope].map((f) => ({ id: f.id, label: t(`expense.${f.id}.label`) }));
  const [field, setFieldId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [when, setWhen] = useState(todayIso());
  const chosen = fields.some((f) => f.id === field) ? field : fields[0]?.id;

  const add = () => {
    if (!num(amount) || !chosen) return;
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: when, scope, kind: effectiveKind, field: chosen, amount, note: note.trim() };
    updateYear((d) => ({ ...d, entries: [entry, ...(d.entries || [])] }));
    setAmount('');
    setNote('');
  };
  const remove = (id) => updateYear((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }));
  const list = (year.entries || []).filter((e) => e.scope === scope);
  const labelFor = (e) => t(`${e.kind === 'income' ? 'income' : 'expense'}.${e.field}.label`);
  const inputCls = 'w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-ink outline-none focus:border-accent';

  return (
    <Card title={`⚡ ${t('ie.quickLog')}`} subtitle={t('ie.quickLogHint')}>
      <div className="grid gap-3 sm:grid-cols-2">
        {!isShared && (
          <div className="sm:col-span-2">
            <Segmented
              label={t('ie.type')}
              value={kind}
              onChange={(k) => {
                setKind(k);
                setFieldId('');
              }}
              size="sm"
              options={[
                { value: 'income', label: t('ie.incomeKind'), icon: '💷' },
                { value: 'expense', label: t('ie.expenseKind'), icon: '🧾' },
              ]}
            />
          </div>
        )}
        <div>
          <LabelWithTip htmlFor="ql-item" label={t('ie.item')} />
          <select id="ql-item" value={chosen} onChange={(e) => setFieldId(e.target.value)} className={inputCls}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <LabelWithTip htmlFor="ql-date" label={t('ie.date')} />
          <input id="ql-date" type="date" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
        </div>
        <MoneyInput label={t('ie.amount')} value={amount} onChange={setAmount} />
        <div className="py-2">
          <LabelWithTip htmlFor="ql-note" label={t('ie.note')} />
          <input id="ql-note" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        </div>
      </div>
      <Button className="mt-2 w-full sm:w-auto" onClick={add}>
        ＋ {t('ie.add')}
      </Button>

      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{t('ie.entries')}</div>
        {list.length === 0 ? (
          <p className="text-sm text-muted">{t('ie.noEntries')}</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {list.slice(0, 50).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="num w-14 shrink-0 text-xs text-muted">{shortDate(e.date)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{labelFor(e)}</span>
                  {e.note && <span className="block truncate text-xs text-muted">{e.note}</span>}
                </span>
                <span className={`num font-bold ${e.kind === 'income' ? 'text-good' : 'text-ink'}`}>
                  {e.kind === 'income' ? '+' : '−'}
                  {money(num(e.amount))}
                </span>
                <button type="button" aria-label={t('ie.remove')} onClick={() => remove(e.id)} className="rounded-lg px-2 py-1 text-muted hover:bg-bad/10 hover:text-bad">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
