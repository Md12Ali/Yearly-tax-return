import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { JOBS, JOB_META, INCOME_FIELDS, EXPENSE_FIELDS, VEHICLE_TYPES, VEHICLE_COSTS, CUSTOM_BOXES, newVehicle } from '../data/fields.js';
import { fieldTotal, num, homeAllowance } from '../lib/taxEngine.js';
import { Card, MoneyInput, Segmented, Callout, Button, LabelWithTip } from '../components/ui.jsx';
import { VehicleMethods, vehicleName } from '../components/parts.jsx';
import { JobClaimGuide } from '../components/ClaimGuide.jsx';

const todayIso = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const inputCls = 'w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-ink outline-none focus:border-accent';

export default function IncomeExpenses({ result, cfg, year, updateYear, resetYear }) {
  const { t } = useI18n();
  const [scope, setScope] = useState('tuition');

  const options = [
    ...JOBS.map((j) => ({ value: j, label: t(`jobs.${j}.short`), icon: JOB_META[j].icon })),
    { value: 'vehicles', label: t('vehicle.title'), icon: '⛽' },
    { value: 'shared', label: t('jobs.shared.short'), icon: '📱' },
  ];

  return (
    <div className="space-y-4">
      <div className="sticky top-[var(--header-h)] z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">{t('ie.pickBusiness')}</div>
        <Segmented label={t('ie.pickBusiness')} value={scope} onChange={setScope} options={options} size="sm" />
      </div>

      {JOBS.includes(scope) && <JobEditor key={scope} job={scope} result={result} year={year} updateYear={updateYear} />}
      {scope === 'vehicles' && <VehiclesEditor result={result} year={year} updateYear={updateYear} cfg={cfg} />}
      {scope === 'shared' && <SharedEditor year={year} updateYear={updateYear} cfg={cfg} />}

      <QuickLog key={scope} scope={scope} year={year} updateYear={updateYear} />

      <div className="flex justify-end pt-2">
        <Button variant="danger" onClick={() => window.confirm(t('ie.resetConfirm', { year: cfg.label })) && resetYear()}>
          🗑️ {t('ie.resetYear')}
        </Button>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function useLoggedNote(year) {
  const { t, money } = useI18n();
  return (scope, kind, field, base) => {
    const extra = Math.round((fieldTotal(year, scope, kind, field) - num(base)) * 100) / 100;
    return extra > 0 ? t('ie.fromEntries', { amount: money(extra) }) : undefined;
  };
}

/** Editable list of user-named items. withBox adds an SA103S box chooser. */
function CustomList({ title, items, onChange, withBox }) {
  const { t } = useI18n();
  const update = (id, patch) => onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return (
    <div className="mt-3 rounded-xl border border-dashed border-line p-3">
      <div className="mb-1 text-sm font-extrabold text-ink">✏️ {title}</div>
      <p className="mb-2 text-xs text-muted">{t('custom.hint')}</p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg bg-surface-2 p-2 sm:grid-cols-[1fr_8rem_auto_auto]">
            <input aria-label={t('custom.name')} placeholder={t('custom.namePlaceholder')} value={it.label} maxLength={60} onChange={(e) => update(it.id, { label: e.target.value })} className={`${inputCls} col-span-2 sm:col-span-1`} />
            <input aria-label={t('custom.amount')} inputMode="decimal" placeholder="£ 0.00" value={it.amount} onChange={(e) => update(it.id, { amount: e.target.value.replace(/[^\d.,]/g, '') })} className={`${inputCls} num`} />
            {withBox && (
              <select aria-label={t('custom.box')} value={it.box || 19} onChange={(e) => update(it.id, { box: Number(e.target.value) })} className={`${inputCls} sm:w-auto`}>
                {CUSTOM_BOXES.map((b) => (
                  <option key={b} value={b}>
                    {t('calc.box')} {b} · {t(`boxes.${b}`)}
                  </option>
                ))}
              </select>
            )}
            <button type="button" aria-label={t('custom.remove')} onClick={() => onChange(items.filter((x) => x.id !== it.id))} className="rounded-lg px-3 text-muted hover:bg-bad/10 hover:text-bad">
              ✕
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="mt-2" onClick={() => onChange([...items, { id: uid(), label: '', amount: '', ...(withBox ? { box: 19 } : {}) }])}>
        ＋ {t('custom.add')}
      </Button>
    </div>
  );
}

/* ---------------- Jobs ---------------- */

function JobEditor({ job, result, year, updateYear }) {
  const { t, money } = useI18n();
  const [help, setHelp] = useState(false);
  const data = year.jobs[job];
  const r = result.jobs[job];
  const note = useLoggedNote(year);
  const set = (kind, field, value) => updateYear((d) => ((d.jobs[job][kind][field] = value), d));
  const setList = (key, list) => updateYear((d) => ((d.jobs[job][key] = list), d));

  return (
    <>
      <div className="rounded-2xl border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${JOB_META[job].color}` }}>
        <div className="text-lg font-extrabold text-ink">
          {JOB_META[job].icon} {t(`jobs.${job}.name`)}
        </div>
        <div className="text-sm text-muted">{t(`jobs.${job}.desc`)}</div>
        <div className="num mt-2 text-sm font-semibold text-ink">
          {t('ie.jobTotal', { gross: money(r.gross + r.otherIncome), expenses: money(r.expenses + r.capitalAllowances), profit: money(r.profit) })}
        </div>
        <button type="button" onClick={() => setHelp((h) => !h)} aria-expanded={help} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-bold text-ink">
          💡 {t('claimGuide.showMe')} {help ? '▴' : '▾'}
        </button>
      </div>

      {help && (
        <Card>
          <JobClaimGuide job={job} />
        </Card>
      )}

      <Card title={`💷 ${t('ie.incomeTitle')}`} subtitle={t('ie.incomeHint')}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {INCOME_FIELDS[job].map((f) => (
            <MoneyInput
              key={f.id}
              label={t(`income.${f.id}.label`)}
              tip={t(`income.${f.id}.tip`)}
              value={data.income[f.id]}
              onChange={(v) => set('income', f.id, v)}
              note={note(job, 'income', f.id, data.income[f.id])}
            />
          ))}
        </div>
        <CustomList title={t('custom.incomeTitle')} items={data.customIncome || []} onChange={(l) => setList('customIncome', l)} />
      </Card>

      <Card title={`🧾 ${t('ie.expensesTitle')}`} subtitle={t('ie.vehicleElsewhere')}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {EXPENSE_FIELDS[job].map((f) => (
            <MoneyInput
              key={f.id}
              label={t(`expense.${f.id}.label`)}
              tip={t(`expense.${f.id}.tip`)}
              badge={`${t('calc.box')} ${f.box}`}
              value={data.expenses[f.id]}
              onChange={(v) => set('expenses', f.id, v)}
              note={note(job, 'expense', f.id, data.expenses[f.id])}
            />
          ))}
        </div>
        <CustomList title={t('custom.expenseTitle')} items={data.customExpenses || []} onChange={(l) => setList('customExpenses', l)} withBox />
      </Card>
    </>
  );
}

/* ---------------- Vehicles ---------------- */

function VehiclesEditor({ result, year, updateYear, cfg }) {
  const { t } = useI18n();
  const add = (type) =>
    updateYear((d) => {
      d.vehicles.push(newVehicle(type, type === 'dualControl' ? ['tuition'] : type === 'bicycle' || type === 'motorcycle' ? ['delivery'] : [...JOBS]));
      return d;
    });
  return (
    <>
      <Card title={`⚖️ ${t('method.title')}`}>
        <VehicleMethods result={result} data={year} updateYear={updateYear} />
      </Card>
      {year.vehicles.map((v, i) => (
        <VehicleCard key={v.id} v={v} i={i} r={result.vehicles.find((x) => x.id === v.id)} year={year} updateYear={updateYear} cfg={cfg} />
      ))}
      <Card title={`＋ ${t('vehicle.add')}`}>
        <div className="flex flex-wrap gap-2">
          {Object.keys(VEHICLE_TYPES).map((type) => (
            <Button key={type} variant="ghost" onClick={() => add(type)}>
              {VEHICLE_TYPES[type].icon} {t(`vehicle.types.${type}`)}
            </Button>
          ))}
        </div>
      </Card>
    </>
  );
}

function VehicleCard({ v, i, r, year, updateYear, cfg }) {
  const { t, money, pct } = useI18n();
  const note = useLoggedNote(year);
  const edit = (fn) =>
    updateYear((d) => {
      const x = d.vehicles.find((y) => y.id === v.id);
      if (x) fn(x);
      return d;
    });
  const eligible = !!VEHICLE_TYPES[v.type]?.mileage;
  const usingMileage = eligible && v.method === 'mileage';
  const isCar = v.type === 'car' || v.type === 'dualControl';
  const rates = cfg.mileage;
  const p100 = (n) => `${Math.round(n * 100)}p`;

  return (
    <Card
      title={`${VEHICLE_TYPES[v.type].icon} ${vehicleName(v, t, i)}`}
      subtitle={r ? `${t('vehicle.businessUse')}: ${pct(r.businessUse)} · ${t('vehicle.claim')}: ${money(r.claim)}` : undefined}
      action={
        year.vehicles.length > 1 && (
          <button type="button" onClick={() => window.confirm(t('vehicle.removeConfirm')) && updateYear((d) => ({ ...d, vehicles: d.vehicles.filter((x) => x.id !== v.id) }))} className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-bad/10 hover:text-bad" aria-label={t('vehicle.remove')}>
            🗑️
          </button>
        )
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <LabelWithTip htmlFor={`vn-${v.id}`} label={t('vehicle.name')} />
          <input id={`vn-${v.id}`} value={v.name} maxLength={40} placeholder={t('vehicle.namePlaceholder')} onChange={(e) => edit((x) => (x.name = e.target.value))} className={inputCls} />
        </div>
        <div>
          <LabelWithTip htmlFor={`vt-${v.id}`} label={t('vehicle.type')} />
          <select id={`vt-${v.id}`} value={v.type} onChange={(e) => edit((x) => (x.type = e.target.value))} className={inputCls}>
            {Object.keys(VEHICLE_TYPES).map((type) => (
              <option key={type} value={type}>
                {VEHICLE_TYPES[type].icon} {t(`vehicle.types.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1 text-sm font-semibold text-ink">{t('vehicle.usedFor')}</legend>
        <div className="flex flex-wrap gap-2">
          {JOBS.map((j) => {
            const on = v.jobs?.includes(j);
            return (
              <label key={j} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${on ? 'border-accent bg-accent-soft text-ink' : 'border-line text-muted'}`}>
                <input type="checkbox" className="sr-only" checked={!!on} onChange={() => edit((x) => (x.jobs = on ? x.jobs.filter((y) => y !== j) : [...(x.jobs || []), j]))} />
                {JOB_META[j].icon} {t(`jobs.${j}.short`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4">
        <div className="mb-1.5 text-sm font-semibold text-ink">{t('vehicle.method')}</div>
        {eligible ? (
          <>
            <Segmented
              label={t('vehicle.method')}
              value={v.method}
              onChange={(m) => edit((x) => (x.method = m))}
              options={[
                { value: 'actual', label: t('method.actual'), icon: '🧾' },
                { value: 'mileage', label: t('method.mileage'), icon: '🛣️' },
              ]}
            />
            <p className="mt-1.5 text-xs text-muted">
              {VEHICLE_TYPES[v.type].mileage === 'motorcycle'
                ? t('vehicle.rate.motorcycle', { rate: p100(rates.motorcycle) })
                : t('vehicle.rate.car', { first: p100(rates.carFirst), later: p100(rates.carLater) })}
            </p>
            {r && r.best !== 'same' && (r.businessMiles > 0 || r.running > 0) && (
              <p className="mt-1 text-xs font-bold text-good">★ {t('vehicle.bestHint', { method: t(`method.${r.best}`), amount: money(r.saving) })}</p>
            )}
          </>
        ) : (
          <Callout tone="warn">{t(`vehicle.mileageNotAllowed.${v.type}`)}</Callout>
        )}
      </div>

      <div className="mt-3 grid gap-x-4 sm:grid-cols-2">
        <MoneyInput prefix="" suffix="mi" placeholder="0" label={t('vehicle.totalMiles')} tip={t('vehicle.totalMilesTip')} value={v.totalMiles} onChange={(val) => edit((x) => (x.totalMiles = val))} />
        {(v.jobs || []).map((j) => (
          <MoneyInput
            key={j}
            prefix=""
            suffix="mi"
            placeholder="0"
            label={t('vehicle.businessMiles', { job: t(`jobs.${j}.short`) })}
            tip={t('vehicle.businessMilesTip')}
            value={v.miles?.[j]}
            onChange={(val) => edit((x) => (x.miles = { ...x.miles, [j]: val }))}
          />
        ))}
      </div>
      {r && !r.hasTotal && r.running + r.purchaseExpense > 0 && !usingMileage && <Callout tone="warn">{t('vehicle.missingTotal')}</Callout>}

      <div className="mt-4 rounded-xl bg-surface-2 p-3">
        <div className="text-sm font-extrabold text-ink">{t('vehicle.costsTitle')}</div>
        <p className="text-xs text-muted">{usingMileage ? t('vehicle.costsOff') : t('vehicle.costsHint', { pct: pct(r?.businessUse ?? 1) })}</p>
        <div className={`grid gap-x-4 sm:grid-cols-2 ${usingMileage ? 'opacity-50' : ''}`}>
          {VEHICLE_COSTS.filter((f) => f !== 'phvVehicleLicence' || v.jobs?.includes('privateHire')).map((f) => (
            <MoneyInput
              key={f}
              label={t(`vehicle.costs.${f}.label`)}
              tip={t(`vehicle.costs.${f}.tip`)}
              value={v.costs?.[f]}
              onChange={(val) => edit((x) => (x.costs = { ...x.costs, [f]: val }))}
              note={note(v.id, 'vehicle', f, v.costs?.[f])}
            />
          ))}
        </div>
      </div>

      <details className="mt-3 rounded-xl border border-line p-3" open={!!(num(v.purchase?.cost) || num(v.purchase?.broughtForward))}>
        <summary className="cursor-pointer text-sm font-extrabold text-ink">🏷️ {t('vehicle.purchaseTitle')}</summary>
        {usingMileage && <div className="mt-2"><Callout>{t('vehicle.costsOff')}</Callout></div>}
        <div className="grid gap-x-4 sm:grid-cols-2">
          <MoneyInput
            label={t('vehicle.purchaseCost')}
            tip={isCar ? t('vehicle.purchaseCostTipCar') : t('vehicle.purchaseCostTipOther')}
            value={v.purchase?.cost}
            onChange={(val) => edit((x) => (x.purchase = { ...x.purchase, cost: val }))}
          />
          {isCar && (
            <MoneyInput label={t('vehicle.broughtForward')} tip={t('vehicle.broughtForwardTip')} value={v.purchase?.broughtForward} onChange={(val) => edit((x) => (x.purchase = { ...x.purchase, broughtForward: val }))} />
          )}
        </div>
        {isCar && (
          <div className="py-2">
            <LabelWithTip htmlFor={`vk-${v.id}`} label={t('vehicle.kind')} />
            <select id={`vk-${v.id}`} value={v.purchase?.kind || 'low'} onChange={(e) => edit((x) => (x.purchase = { ...x.purchase, kind: e.target.value }))} className={inputCls}>
              {['newZero', 'low', 'high'].map((k) => (
                <option key={k} value={k}>
                  {t(`vehicle.kinds.${k}`, { main: `${Math.round(cfg.capitalAllowances.mainRate * 100)}%`, special: `${Math.round(cfg.capitalAllowances.specialRate * 100)}%` })}
                </option>
              ))}
            </select>
            {r && !usingMileage && r.fya + r.wda > 0 && <p className="mt-2 text-sm font-bold text-good">{t('vehicle.caResult', { amount: money(r.fya + r.wda) })}</p>}
          </div>
        )}
      </details>
    </Card>
  );
}

/* ---------------- Shared ---------------- */

function SharedEditor({ year, updateYear, cfg }) {
  const { t, money } = useI18n();
  const note = useLoggedNote(year);
  const home = homeAllowance(year.shared.homeHours, year.shared.homeMonths, cfg.homeFlatRates);
  return (
    <>
      <Card title={`📱 ${t('ie.otherSharedTitle')}`} subtitle={t('jobs.shared.desc')}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {EXPENSE_FIELDS.shared.map((f) => (
            <MoneyInput
              key={f.id}
              label={t(`expense.${f.id}.label`)}
              tip={t(`expense.${f.id}.tip`)}
              badge={`${t('calc.box')} ${f.box}`}
              value={year.shared.expenses[f.id]}
              onChange={(v) => updateYear((d) => ((d.shared.expenses[f.id] = v), d))}
              note={note('shared', 'expense', f.id, year.shared.expenses[f.id])}
            />
          ))}
        </div>
        <CustomList title={t('custom.expenseTitle')} items={year.shared.customExpenses || []} onChange={(l) => updateYear((d) => ((d.shared.customExpenses = l), d))} withBox />
      </Card>

      <Card title={`🏠 ${t('home.title')}`} subtitle={t('home.hint')}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <MoneyInput prefix="" suffix="h" placeholder="0" label={t('home.hours')} value={year.shared.homeHours} onChange={(v) => updateYear((d) => ((d.shared.homeHours = v), d))} />
          <MoneyInput prefix="" placeholder="12" label={t('home.months')} value={year.shared.homeMonths} onChange={(v) => updateYear((d) => ((d.shared.homeMonths = v), d))} />
        </div>
        {home > 0 && <p className="mt-1 text-sm font-bold text-good">{t('home.result', { amount: money(home) })}</p>}
      </Card>

      <Card title={`💡 ${t('claimGuide.tabs.everyone')}`}>
        <JobClaimGuide job="everyone" />
      </Card>
    </>
  );
}

/* ---------------- Quick log ---------------- */

function QuickLog({ scope, year, updateYear }) {
  const { t, money, shortDate } = useI18n();

  // Every item that can be logged in this section.
  const targets = [];
  if (JOBS.includes(scope)) {
    INCOME_FIELDS[scope].forEach((f) => targets.push({ scope, kind: 'income', field: f.id, label: `💷 ${t(`income.${f.id}.label`)}` }));
    EXPENSE_FIELDS[scope].forEach((f) => targets.push({ scope, kind: 'expense', field: f.id, label: `🧾 ${t(`expense.${f.id}.label`)}` }));
  } else if (scope === 'shared') {
    EXPENSE_FIELDS.shared.forEach((f) => targets.push({ scope: 'shared', kind: 'expense', field: f.id, label: `🧾 ${t(`expense.${f.id}.label`)}` }));
  } else {
    year.vehicles.forEach((v, i) =>
      VEHICLE_COSTS.forEach((f) => targets.push({ scope: v.id, kind: 'vehicle', field: f, label: `${vehicleName(v, t, i)} · ${t(`vehicle.costs.${f}.label`)}` }))
    );
  }
  const key = (x) => `${x.scope}|${x.kind}|${x.field}`;
  const [sel, setSel] = useState('');
  const [amount, setAmount] = useState('');
  const [noteText, setNoteText] = useState('');
  const [when, setWhen] = useState(todayIso());
  const chosen = targets.find((x) => key(x) === sel) || targets[0];
  const scopes = new Set(targets.map((x) => x.scope));
  const labelFor = (e) => targets.find((x) => key(x) === key(e))?.label || e.field;

  const add = () => {
    if (!num(amount) || !chosen) return;
    const entry = { id: uid(), date: when, scope: chosen.scope, kind: chosen.kind, field: chosen.field, amount, note: noteText.trim() };
    updateYear((d) => ({ ...d, entries: [entry, ...(d.entries || [])] }));
    setAmount('');
    setNoteText('');
  };
  const list = (year.entries || []).filter((e) => scopes.has(e.scope));
  if (!targets.length) return null;

  return (
    <Card title={`⚡ ${t('ie.quickLog')}`} subtitle={t('ie.quickLogHint')}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <LabelWithTip htmlFor="ql-item" label={t('ie.item')} />
          <select id="ql-item" value={chosen ? key(chosen) : ''} onChange={(e) => setSel(e.target.value)} className={inputCls}>
            {targets.map((x) => (
              <option key={key(x)} value={key(x)}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div className="py-2">
          <LabelWithTip htmlFor="ql-date" label={t('ie.date')} />
          <input id="ql-date" type="date" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
        </div>
        <MoneyInput label={t('ie.amount')} value={amount} onChange={setAmount} />
        <div className="sm:col-span-2">
          <LabelWithTip htmlFor="ql-note" label={t('ie.note')} />
          <input id="ql-note" value={noteText} maxLength={80} onChange={(e) => setNoteText(e.target.value)} className={inputCls} />
        </div>
      </div>
      <Button className="mt-3 w-full sm:w-auto" onClick={add}>
        ＋ {t('ie.add')}
      </Button>

      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{t('ie.entries')}</div>
        {list.length === 0 ? (
          <p className="text-sm text-muted">{t('ie.noEntries')}</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {list.slice(0, 60).map((e) => (
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
                <button type="button" aria-label={t('ie.remove')} onClick={() => updateYear((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== e.id) }))} className="rounded-lg px-2 py-1 text-muted hover:bg-bad/10 hover:text-bad">
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
