import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { CLAIM_ITEMS, GUIDE_JOBS } from '../data/claimGuide.js';
import { JOB_META } from '../data/fields.js';
import { Segmented } from './ui.jsx';

const STATUS_STYLE = {
  yes: { mark: '✓', cls: 'bg-accent-soft text-good' },
  part: { mark: '!', cls: 'bg-warn-soft text-warn' },
  no: { mark: '✕', cls: 'bg-bad/10 text-bad' },
};

/** "How to show it to HMRC" + allowed / not allowed list for one job. */
export function JobClaimGuide({ job, showHow = true }) {
  const { t, tx } = useI18n();
  const [filter, setFilter] = useState('all');
  const items = CLAIM_ITEMS[job].filter((i) => filter === 'all' || i.s === filter);
  const how = tx(`claimGuide.jobs.${job}.how`);
  const income = tx(`claimGuide.jobs.${job}.income`);

  return (
    <div className="space-y-4">
      {showHow && (
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [t('claimGuide.howTitle'), how, '📋'],
            [t('claimGuide.incomeTitle'), income, '💷'],
          ].map(([title, list, icon]) => (
            <div key={title} className="rounded-xl bg-surface-2 p-3">
              <h4 className="mb-2 text-sm font-extrabold text-ink">
                {icon} {title}
              </h4>
              <ul className="space-y-1.5">
                {list.map((p) => (
                  <li key={p} className="flex gap-2 text-sm leading-relaxed text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Segmented
        size="sm"
        label={t('claimGuide.filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('claimGuide.all') },
          { value: 'yes', label: t('claimGuide.status.yes') },
          { value: 'part', label: t('claimGuide.status.part') },
          { value: 'no', label: t('claimGuide.status.no') },
        ]}
      />

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {items.map((i) => {
          const st = STATUS_STYLE[i.s];
          return (
            <li key={i.id} className="flex gap-3 bg-surface px-3 py-2.5">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold ${st.cls}`} title={t(`claimGuide.status.${i.s}`)}>
                {st.mark}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{t(`claimGuide.items.${i.id}.t`)}</div>
                <div className="text-xs leading-relaxed text-muted">{t(`claimGuide.items.${i.id}.n`)}</div>
                {(i.box || i.car) && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {i.box && (
                      <span className="num rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                        {i.box === 'ca' ? `${t('claimGuide.caBox')} · Box 24.1/25` : `${t('calc.box')} ${i.box}`}
                      </span>
                    )}
                    {i.car && (
                      <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-muted">
                        {i.car === 'covered' ? `🛣️ ${t('claimGuide.covered')}` : `➕ ${t('claimGuide.extra')}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Full guide with a tab per job (used on the HMRC Guide page). */
export function ClaimGuideTabs() {
  const { t } = useI18n();
  const [job, setJob] = useState('tuition');
  return (
    <div className="space-y-3">
      <Segmented
        size="sm"
        label={t('claimGuide.title')}
        value={job}
        onChange={setJob}
        options={GUIDE_JOBS.map((j) => ({ value: j, label: t(`claimGuide.tabs.${j}`), icon: JOB_META[j]?.icon || '👥' }))}
      />
      <JobClaimGuide key={job} job={job} />
    </div>
  );
}
