import { useId, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export function Card({ title, subtitle, action, children, className = '', tone }) {
  const toneCls =
    tone === 'accent'
      ? 'border-accent/40 bg-accent-soft'
      : tone === 'warn'
        ? 'border-warn/40 bg-warn-soft'
        : 'border-line bg-surface';
  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${toneCls} ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-bold leading-tight text-ink">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Small "i" button; the explanation opens as a block under the label (works on narrow phones). */
export function InfoButton({ open, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t('common.info')}
      aria-expanded={open}
      onClick={onToggle}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
        open ? 'border-accent bg-accent text-accent-ink' : 'border-line text-muted hover:border-accent hover:text-accent'
      }`}
    >
      i
    </button>
  );
}

export function TipText({ text }) {
  return <p className="mb-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-ink">{text}</p>;
}

/** Label + optional explanation toggle. */
export function LabelWithTip({ htmlFor, label, tip, badge }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {tip && <InfoButton open={open} onToggle={() => setOpen((o) => !o)} />}
        {badge && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{badge}</span>}
      </div>
      {open && tip && <TipText text={tip} />}
    </>
  );
}

export function MoneyInput({ label, tip, value, onChange, disabled, badge, note, suffix, prefix = '£', placeholder = '0.00' }) {
  const id = useId();
  return (
    <div className={`py-2 ${disabled ? 'opacity-50' : ''}`}>
      <LabelWithTip htmlFor={id} label={label} tip={tip} badge={badge} />
      <div className="flex items-center rounded-xl border border-line bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
        {prefix && <span className="pl-3 text-muted">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
          className="num w-full min-w-0 bg-transparent px-2 py-2.5 text-base text-ink outline-none placeholder:text-muted/60 disabled:cursor-not-allowed"
        />
        {suffix && <span className="pr-3 text-sm text-muted">{suffix}</span>}
      </div>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

export function Segmented({ options, value, onChange, label, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex-1 whitespace-nowrap rounded-lg font-semibold transition-colors ${
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
            } ${on ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'}`}
          >
            {o.icon && <span className="mr-1" aria-hidden>{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

export function Stat({ label, value, hint, tone }) {
  const color = tone === 'good' ? 'text-good' : tone === 'bad' ? 'text-bad' : 'text-ink';
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`num mt-1 text-lg font-extrabold sm:text-xl ${color}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] leading-snug text-muted">{hint}</div>}
    </div>
  );
}

export function Progress({ value, color = 'var(--accent)', label }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  );
}

export function Callout({ tone = 'info', title, children }) {
  const cls = tone === 'warn' ? 'border-warn/40 bg-warn-soft' : tone === 'good' ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2';
  const icon = tone === 'warn' ? '⚠️' : tone === 'good' ? '✅' : '💡';
  return (
    <div className={`flex gap-3 rounded-xl border p-3 text-sm ${cls}`}>
      <span aria-hidden>{icon}</span>
      <div className="min-w-0 leading-relaxed text-ink">
        {title && <div className="font-bold">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function CopyValue({ value, display }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const copy = async () => {
    const text = String(value);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={t('calc.copy')}
      className="num inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 text-sm font-bold text-ink hover:border-accent"
    >
      {display ?? value}
      <span className={`text-[11px] font-semibold ${done ? 'text-good' : 'text-muted'}`}>{done ? `✓ ${t('calc.copied')}` : '⧉'}</span>
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', className = '', ...rest }) {
  const v =
    variant === 'primary'
      ? 'bg-accent text-accent-ink hover:brightness-110'
      : variant === 'danger'
        ? 'border border-bad/50 text-bad hover:bg-bad/10'
        : 'border border-line bg-surface text-ink hover:border-accent';
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}
