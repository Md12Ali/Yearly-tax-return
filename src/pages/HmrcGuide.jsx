import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { JOBS, JOB_META } from '../data/fields.js';
import { HMRC_BANK } from '../data/taxYears.js';
import { Card, Callout } from '../components/ui.jsx';
import { ClaimGuideTabs } from '../components/ClaimGuide.jsx';

/* ---------- Illustrated screens (generic, not a copy of GOV.UK) ---------- */

function Frame({ title, children }) {
  const { t } = useI18n();
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-bg shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-bad/60" />
          <i className="h-2.5 w-2.5 rounded-full bg-warn/60" />
          <i className="h-2.5 w-2.5 rounded-full bg-good/60" />
        </span>
        <span className="truncate text-[11px] font-semibold text-muted">HMRC online · {title}</span>
      </div>
      <div className="space-y-3 p-3 sm:p-4">{children}</div>
      <figcaption className="border-t border-dashed border-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {t('guide.illustration')}
      </figcaption>
    </figure>
  );
}

/** HMRC screens are in English: show the English label, plus Bengali beneath when chosen. */
function MockLabel({ k }) {
  const { lang, t, en } = useI18n();
  return (
    <div>
      <div className="text-sm font-bold text-ink">{en(`guide.mock.${k}`)}</div>
      {lang !== 'en' && <div className="text-xs text-muted">{t(`guide.mock.${k}`)}</div>}
    </div>
  );
}

function MockField({ k, value, highlight }) {
  const { t } = useI18n();
  return (
    <div>
      <MockLabel k={k} />
      <div
        className={`num mt-1 flex items-center justify-between rounded-md border-2 px-3 py-2 text-sm ${
          highlight ? 'border-accent bg-accent-soft font-extrabold text-ink' : 'border-line text-muted'
        }`}
      >
        <span>{value}</span>
        {highlight && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-ink">{t('guide.yourFigure')}</span>}
      </div>
    </div>
  );
}

function MockButton({ k }) {
  const { en } = useI18n();
  return <span className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-ink">{en(`guide.mock.${k}`)}</span>;
}

function StepMockup({ n, result }) {
  const { money0, money, t } = useI18n();
  const active = JOBS.filter((j) => result.jobs[j].active);
  const list = active.length ? active : ['tuition'];
  switch (n) {
    case 0:
      return (
        <Frame title="Sign in">
          <MockField k="userId" value="•••• •••• ••••" />
          <MockField k="password" value="••••••••" />
          <MockButton k="signIn" />
          <div className="rounded-md border border-line bg-surface p-3">
            <MockLabel k="utr" />
            <div className="num mt-1 text-lg font-extrabold tracking-widest text-accent">12345 67890</div>
          </div>
        </Frame>
      );
    case 1:
      return (
        <Frame title="Tailor your return">
          <MockLabel k="q1" />
          <div className="flex items-center gap-2 text-sm text-ink">
            <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-accent">
              <i className="h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Yes
          </div>
          <MockField k="q2" value={String(list.length)} highlight />
        </Frame>
      );
    case 2:
      return (
        <div className="space-y-3">
          {list.map((j) => (
            <Frame key={j} title={`Self-employment · ${t(`jobs.${j}.short`)}`}>
              <div className="text-xs font-bold text-muted">
                {JOB_META[j].icon} {result.jobs[j].name || t(`jobs.${j}.name`)} · Box 9
              </div>
              <MockField k="turnover" value={money0(result.jobs[j].boxes[9])} highlight />
            </Frame>
          ))}
        </div>
      );
    case 3:
      return (
        <div className="space-y-3">
          {list.map((j) => (
            <Frame key={j} title={`Self-employment · ${t(`jobs.${j}.short`)}`}>
              <div className="text-xs font-bold text-muted">
                {JOB_META[j].icon} {result.jobs[j].name || t(`jobs.${j}.name`)} · Box 20 → Box 21
              </div>
              <MockField k="totalExpenses" value={money0(result.jobs[j].boxes[20])} highlight />
              <MockField k="netProfit" value={money0(result.jobs[j].boxes[21])} />
            </Frame>
          ))}
        </div>
      );
    case 4:
      return (
        <Frame title="Calculation">
          <MockLabel k="calc" />
          <dl className="num divide-y divide-line rounded-md border border-line text-sm">
            {[
              ['Income Tax', result.tax.incomeTax],
              ['Class 4 NI', result.tax.class4],
              ['Class 2 NI', result.tax.class2],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-3 py-1.5 text-ink">
                <dt>{k}</dt>
                <dd>{money(v)}</dd>
              </div>
            ))}
            <div className="flex justify-between bg-accent-soft px-3 py-1.5 font-extrabold text-ink">
              <dt>Total</dt>
              <dd>{money(result.tax.total)}</dd>
            </div>
          </dl>
          <MockButton k="submit" />
        </Frame>
      );
    default:
      return (
        <Frame title="Pay">
          <MockLabel k="payBank" />
          <MockLabel k="chooseBank" />
          <div className="grid grid-cols-2 gap-2">
            {['NatWest', 'Revolut'].map((b) => (
              <div key={b} className="rounded-md border-2 border-line px-3 py-2 text-center text-sm font-bold text-ink">
                {b}
              </div>
            ))}
          </div>
          <dl className="num space-y-1 rounded-md border border-line p-3 text-sm text-ink">
            <div className="flex justify-between gap-2"><dt className="text-muted">Payee</dt><dd>{HMRC_BANK.accountName}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Sort code</dt><dd>{HMRC_BANK.sortCode}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Account</dt><dd>{HMRC_BANK.accountNumber}</dd></div>
          </dl>
          <MockField k="reference" value="1234567890K" />
          <MockField k="amount" value={money(result.tax.dueJanuary)} highlight />
        </Frame>
      );
  }
}

/* ---------- Page ---------- */

export default function HmrcGuide({ result, cfg, year, updateYear }) {
  const { t, tx, money0, date } = useI18n();
  const [open, setOpen] = useState(0);
  const steps = tx('guide.steps');
  const vars = {
    year: cfg.label,
    registerBy: date(cfg.registerBy),
    deadline: date(cfg.onlineDeadline),
    spt: money0(cfg.class2.smallProfitsThreshold),
    ...HMRC_BANK,
  };
  const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  const keepUntil = `${Number(cfg.onlineDeadline.slice(0, 4)) + 5}${cfg.onlineDeadline.slice(4)}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">📜 {t('guide.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('guide.intro')}</p>
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className={`overflow-hidden rounded-2xl border ${isOpen ? 'border-accent/50 bg-surface' : 'border-line bg-surface'}`}>
              <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={`num grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold ${isOpen ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink'}`}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-muted">{t('guide.stepLabel', { n: i + 1 })}</span>
                  <span className="block font-bold text-ink">{s.title}</span>
                </span>
                <span className="text-muted" aria-hidden>{isOpen ? '▴' : '▾'}</span>
              </button>
              {isOpen && (
                <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <ul className="space-y-2.5">
                      {s.points.map((p, k) => (
                        <li key={k} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{fill(p)}</span>
                        </li>
                      ))}
                    </ul>
                    <Callout>{fill(s.tip)}</Callout>
                  </div>
                  <StepMockup n={i} result={result} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <h2 className="pt-2 text-lg font-extrabold text-ink">🎓 {t('guide.learnTitle')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <GrossNetCard />
        <Card title={`🛣️ ${t('learn.mileage.title')}`}>
          <p className="text-sm leading-relaxed text-ink">{t('learn.mileage.body')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-accent-soft p-3">
              <div className="num text-2xl font-extrabold text-ink">45p</div>
              <div className="text-xs text-muted">0 – 10,000 mi</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="num text-2xl font-extrabold text-ink">25p</div>
              <div className="text-xs text-muted">10,000+ mi</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title={`🧾 ${t('claimGuide.title')}`} subtitle={t('claimGuide.intro')}>
        <ClaimGuideTabs />
      </Card>

      <Card title={`✅ ${t('learn.claim.title')}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['can', '✓', 'text-good', 'bg-accent-soft'],
            ['cannot', '✕', 'text-bad', 'bg-bad/10'],
          ].map(([k, mark, color, bg]) => (
            <div key={k}>
              <h3 className={`mb-2 text-sm font-extrabold ${color}`}>{t(`learn.claim.${k}Title`)}</h3>
              <ul className="space-y-1.5">
                {tx(`learn.claim.${k}`).map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${color} ${bg}`}>{mark}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`🗂️ ${t('guide.recordsTitle')}`} subtitle={t('guide.recordsHint', { date: date(keepUntil) })}>
        <ul className="space-y-1">
          {tx('learn.records.items').map((item, i) => {
            const checked = !!year.checklist?.[i];
            return (
              <li key={i}>
                <label className="flex cursor-pointer gap-3 rounded-lg p-2 text-sm hover:bg-surface-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => updateYear((d) => ({ ...d, checklist: { ...d.checklist, [i]: !checked } }))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  />
                  <span className={checked ? 'text-muted line-through' : 'text-ink'}>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title={`💡 ${t('learn.allowance.title')}`}>
        <p className="text-sm leading-relaxed text-ink">{t('learn.allowance.body')}</p>
      </Card>
    </div>
  );
}

function GrossNetCard() {
  const { t, money0 } = useI18n();
  // Worked example: £30,000 earned, £8,000 costs.
  const gross = 30000;
  const exp = 8000;
  const net = gross - exp;
  const pa = 12570;
  const bars = [
    { label: t('learn.grossNet.expenses'), v: exp, c: 'var(--muted)' },
    { label: t('learn.grossNet.allowance'), v: pa, c: 'var(--accent)' },
    { label: t('learn.grossNet.taxable'), v: net - pa, c: 'var(--warn)' },
  ];
  return (
    <Card title={`💷 ${t('learn.grossNet.title')}`}>
      <p className="text-sm leading-relaxed text-ink">{t('learn.grossNet.body')}</p>
      <div className="mt-3 rounded-xl bg-surface-2 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{t('learn.grossNet.example')}</div>
        <div className="num mb-1 flex justify-between text-sm font-bold text-ink">
          <span>{t('learn.grossNet.gross')}</span>
          <span>{money0(gross)}</span>
        </div>
        <div className="flex h-6 overflow-hidden rounded-md">
          {bars.map((b) => (
            <div key={b.label} style={{ width: `${(b.v / gross) * 100}%`, background: b.c }} />
          ))}
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          {bars.map((b) => (
            <li key={b.label} className="flex items-center justify-between gap-2 text-ink">
              <span className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-sm" style={{ background: b.c }} />
                {b.label}
              </span>
              <span className="num font-bold">{money0(b.v)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-line pt-1 font-bold text-ink">
            <span>{t('learn.grossNet.net')}</span>
            <span className="num">{money0(net)}</span>
          </li>
        </ul>
      </div>
    </Card>
  );
}
