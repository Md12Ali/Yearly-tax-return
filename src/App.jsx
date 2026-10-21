import { useEffect, useMemo, useState } from 'react';
import { I18nProvider, useI18n } from './i18n/index.jsx';
import { useAppStore } from './lib/store.js';
import { computeAll } from './lib/taxEngine.js';
import { TAX_YEARS, DEFAULT_TAX_YEAR } from './data/taxYears.js';
import Dashboard from './pages/Dashboard.jsx';
import IncomeExpenses from './pages/IncomeExpenses.jsx';
import TaxCalculator from './pages/TaxCalculator.jsx';
import HmrcGuide from './pages/HmrcGuide.jsx';

const TABS = [
  { id: 'dashboard', icon: '📊' },
  { id: 'income', icon: '💰' },
  { id: 'calculator', icon: '🧮' },
  { id: 'guide', icon: '📜' },
];

export default function App() {
  const store = useAppStore();
  const { lang, theme } = store.settings;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en-GB';
  }, [theme, lang]);

  return (
    <I18nProvider lang={lang}>
      <Shell store={store} />
    </I18nProvider>
  );
}

function Shell({ store }) {
  const { t } = useI18n();
  const { settings, setSetting, year, updateYear, resetYear } = store;
  const cfg = TAX_YEARS[settings.taxYear] || TAX_YEARS[DEFAULT_TAX_YEAR];
  const [tab, setTab] = useState(() => (TABS.some((x) => x.id === location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard'));
  const result = useMemo(() => computeAll(year, cfg), [year, cfg]);

  // Back/forward buttons and shared links (#calculator) switch tabs too.
  useEffect(() => {
    const onHash = () => {
      const id = location.hash.slice(1);
      if (TABS.some((x) => x.id === id)) setTab(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goTo = (id) => {
    setTab(id);
    history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const props = { result, cfg, year, updateYear, resetYear, goTo };

  return (
    <div className="min-h-dvh bg-bg pb-24 text-ink md:pb-10">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ height: 'var(--header-h)' }}>
        <div className="mx-auto flex h-full max-w-5xl items-center gap-2 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-lg font-extrabold text-accent-ink" aria-hidden>
            £
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold leading-tight sm:text-base">{t('app.title')}</div>
            <div className="hidden truncate text-xs text-muted sm:block">{t('app.subtitle')}</div>
          </div>
          <select
            aria-label={t('header.taxYear')}
            value={settings.taxYear}
            onChange={(e) => setSetting('taxYear', e.target.value)}
            className="num rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-bold text-ink"
          >
            {Object.values(TAX_YEARS).map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
          <div role="radiogroup" aria-label={t('header.language')} className="flex rounded-lg border border-line bg-surface p-0.5 text-xs font-bold">
            {[
              ['en', 'English', 'EN'],
              ['bn', 'বাংলা', 'বাং'],
            ].map(([code, full, short]) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={settings.lang === code}
                onClick={() => setSetting('lang', code)}
                className={`rounded-md px-2 py-1 ${settings.lang === code ? 'bg-accent text-accent-ink' : 'text-muted'}`}
              >
                <span className="hidden sm:inline">{full}</span>
                <span className="sm:hidden">{short}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={`${t('header.theme')}: ${settings.theme === 'dark' ? t('header.dark') : t('header.light')}`}
            onClick={() => setSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface"
          >
            {settings.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Desktop tabs */}
      <nav className="mx-auto hidden max-w-5xl px-4 pt-4 md:block" aria-label="Sections">
        <div className="flex gap-1 rounded-2xl border border-line bg-surface p-1">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => goTo(x.id)}
              aria-current={tab === x.id ? 'page' : undefined}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${tab === x.id ? 'bg-accent text-accent-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
            >
              <span aria-hidden>{x.icon}</span> {t(`tabs.${x.id}`)}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pt-4">
        {tab === 'dashboard' && <Dashboard {...props} />}
        {tab === 'income' && <IncomeExpenses {...props} />}
        {tab === 'calculator' && <TaxCalculator {...props} />}
        {tab === 'guide' && <HmrcGuide {...props} />}

        <footer className="mt-8 space-y-1 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          <p>{t('app.disclaimer')}</p>
          <p>🔒 {t('app.savedLocally')}</p>
        </footer>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Sections">
        <div className="grid grid-cols-4">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => goTo(x.id)}
              aria-current={tab === x.id ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-bold leading-tight ${tab === x.id ? 'text-accent' : 'text-muted'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full text-lg ${tab === x.id ? 'bg-accent-soft' : ''}`} aria-hidden>
                {x.icon}
              </span>
              <span className="text-center">{t(`tabs.${x.id}`)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
