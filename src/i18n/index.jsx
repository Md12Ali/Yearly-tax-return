import { createContext, useContext, useMemo } from 'react';
import en from './en.js';
import bn from './bn.js';

export const DICTS = { en, bn };
const I18nContext = createContext(null);

const lookup = (dict, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
const fill = (str, vars) =>
  typeof str === 'string' && vars ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : str;

export function I18nProvider({ lang, children }) {
  const value = useMemo(() => {
    const dict = DICTS[lang] || en;
    const locale = lang === 'bn' ? 'bn-BD' : 'en-GB';
    const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
    const money0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
    const dateFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
    const shortDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'Europe/London' });
    const numFmt = new Intl.NumberFormat(locale);
    return {
      lang,
      /** Translated string with {placeholders}; falls back to English. */
      t: (path, vars) => fill(lookup(dict, path) ?? lookup(en, path) ?? path, vars),
      /** Raw value (arrays/objects), falls back to English. */
      tx: (path) => lookup(dict, path) ?? lookup(en, path),
      /** English value, used where the HMRC screen itself is in English. */
      en: (path) => lookup(en, path),
      // Money always uses Western digits so figures can be copied straight into GOV.UK.
      money: (n) => money.format(n || 0),
      money0: (n) => money0.format(Math.round(n || 0)),
      date: (iso) => dateFmt.format(new Date(`${iso}T12:00:00Z`)),
      shortDate: (iso) => shortDate.format(new Date(`${iso}T12:00:00Z`)),
      number: (n) => numFmt.format(n || 0),
      pct: (n) => `${numFmt.format(Math.round((n || 0) * 1000) / 10)}%`,
    };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
