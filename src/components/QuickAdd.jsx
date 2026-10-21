import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { TAX_YEARS } from '../data/taxYears.js';
import { num } from '../lib/taxEngine.js';
import { taxYearForDate, todayUK } from '../lib/dates.js';
import { withDefaults } from '../lib/store.js';
import { quickTargets, targetKey } from './entries.js';
import { Segmented, MoneyInput, LabelWithTip, Button } from './ui.jsx';

const MEMO_KEY = 'yearly-tax-return:quick';
const readMemo = () => {
  try {
    return JSON.parse(localStorage.getItem(MEMO_KEY)) || {};
  } catch {
    return {};
  }
};
const inputCls = 'w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-ink outline-none focus:border-accent';

/** Floating ＋ button and a bottom sheet to log income, an expense or miles in a few taps. */
export default function QuickAdd({ store, onAdded }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const memo = useRef(readMemo());
  const [kind, setKind] = useState(memo.current.kind || 'income');
  const [date, setDate] = useState(todayUK());
  const [sel, setSel] = useState(memo.current.sel || {});
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const amountRef = useRef(null);

  // The tax year the date falls in decides which vehicles exist.
  const targetYearId = taxYearForDate(date);
  const yearData = useMemo(() => withDefaults(store.years[targetYearId || store.settings.taxYear]), [store.years, targetYearId, store.settings.taxYear]);
  const targets = useMemo(() => quickTargets(kind, yearData, t), [kind, yearData, t]);
  const chosen = targets.find((x) => targetKey(x) === sel[kind]) || targets[0];
  const groups = [...new Set(targets.map((x) => x.group))];

  useEffect(() => {
    if (open) setTimeout(() => amountRef.current?.querySelector('input')?.focus(), 150);
  }, [open, kind]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const save = (keepOpen) => {
    if (!num(amount) || !chosen) return;
    const entry = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      date,
      scope: chosen.scope,
      kind: chosen.kind,
      field: chosen.field,
      amount,
      note: note.trim(),
    };
    const yearId = store.addEntry(entry);
    try {
      localStorage.setItem(MEMO_KEY, JSON.stringify({ kind, sel }));
    } catch {
      /* ignore */
    }
    onAdded?.({ entry, yearId, label: kind === 'miles' ? `${chosen.group.replace(/^\S+\s/, '')} · ${chosen.label}` : chosen.label, group: chosen.group });
    setAmount('');
    setNote('');
    if (!keepOpen) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('quick.button')}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-accent px-5 text-base font-extrabold text-accent-ink shadow-lg shadow-black/20 transition hover:brightness-110 active:scale-95 md:bottom-8"
      >
        <span className="text-2xl leading-none">＋</span>
        <span className="hidden sm:inline">{t('quick.button')}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('quick.title')}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-5"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink">⚡ {t('quick.title')}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('common.close')} className="rounded-lg px-2 py-1 text-xl text-muted hover:bg-surface-2">
                ✕
              </button>
            </div>

            <Segmented
              label={t('ie.type')}
              value={kind}
              onChange={setKind}
              options={[
                { value: 'income', label: t('quick.income'), icon: '💷' },
                { value: 'expense', label: t('quick.expense'), icon: '🧾' },
                { value: 'miles', label: t('quick.miles'), icon: '🛣️' },
              ]}
            />

            <div className="mt-3 grid gap-3">
              <div>
                <LabelWithTip htmlFor="qa-item" label={kind === 'miles' ? t('quick.vehicleJob') : t('ie.item')} />
                <select id="qa-item" value={chosen ? targetKey(chosen) : ''} onChange={(e) => setSel({ ...sel, [kind]: e.target.value })} className={inputCls}>
                  {groups.map((g) => (
                    <optgroup key={g} label={g}>
                      {targets
                        .filter((x) => x.group === g)
                        .map((x) => (
                          <option key={targetKey(x)} value={targetKey(x)}>
                            {x.label}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div ref={amountRef}>
                <MoneyInput
                  label={kind === 'miles' ? t('quick.milesAmount') : t('ie.amount')}
                  prefix={kind === 'miles' ? '' : '£'}
                  suffix={kind === 'miles' ? 'mi' : undefined}
                  placeholder={kind === 'miles' ? '0' : '0.00'}
                  value={amount}
                  onChange={setAmount}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <LabelWithTip htmlFor="qa-date" label={t('ie.date')} />
                  <input id="qa-date" type="date" value={date} onChange={(e) => setDate(e.target.value || todayUK())} className={inputCls} />
                </div>
                <div>
                  <LabelWithTip htmlFor="qa-note" label={t('ie.note')} />
                  <input id="qa-note" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} className={inputCls} />
                </div>
              </div>

              <p className="text-xs text-muted">
                {targetYearId ? t('quick.goesTo', { year: TAX_YEARS[targetYearId].label }) : t('quick.outOfRange', { year: TAX_YEARS[store.settings.taxYear].label })}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => save(true)} disabled={!num(amount)}>
                  {t('quick.saveAnother')}
                </Button>
                <Button onClick={() => save(false)} disabled={!num(amount)}>
                  ✓ {t('quick.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
