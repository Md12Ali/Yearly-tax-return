// CSV and PDF summaries. Kept in English so the wording matches the HMRC SA103S form.
import en from '../i18n/en.js';
import { JOBS, EXPENSE_BOXES } from '../data/fields.js';
import { HMRC_BANK } from '../data/taxYears.js';

const gbp = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whole = (n) => `£${Math.round(n || 0).toLocaleString('en-GB')}`;
const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const BOX_ORDER = [9, 10, ...EXPENSE_BOXES, 20, 21, 22, '24.1', 25, 31, 32];
const boxLabel = (n) => en.boxes[String(n).replace('.', '_')];

/** Structured summary used by both exports. */
export function buildSummary(result, cfg, year) {
  const { tax, totals } = result;
  const businesses = JOBS.filter((j) => result.jobs[j].active).map((j) => {
    const b = result.jobs[j].boxes;
    return {
      id: j,
      name: result.jobs[j].name || en.jobs[j].name,
      rows: BOX_ORDER.filter((n) => [9, 20, 21, 31].includes(n) || b[n] > 0).map((n) => ({ box: n, label: boxLabel(n), value: b[n] })),
    };
  });
  const calc = [
    ['Gross income (all businesses)', gbp(totals.gross)],
    ['Allowable expenses', gbp(totals.expenses)],
    ...(totals.capitalAllowances ? [['Capital allowances', gbp(totals.capitalAllowances)]] : []),
    ['Total taxable profits (all businesses)', whole(totals.taxableProfits)],
    ['Personal Allowance', whole(tax.allowance)],
    ['Taxable income', whole(tax.taxable)],
    ['Income Tax - basic rate 20%', gbp(tax.bands.basicTax)],
    ...(tax.bands.higherTax ? [['Income Tax - higher rate 40%', gbp(tax.bands.higherTax)]] : []),
    ...(tax.bands.additionalTax ? [['Income Tax - additional rate 45%', gbp(tax.bands.additionalTax)]] : []),
    ['Class 4 NI (6% / 2%)', gbp(tax.class4)],
    ['Class 2 NI', tax.class2TreatedAsPaid ? 'Treated as paid (£0)' : gbp(tax.class2)],
    ['TOTAL TAX & NI', gbp(tax.total)],
  ];
  const pay = [
    [`By ${fmtDate(cfg.onlineDeadline)}`, gbp(tax.dueJanuary), tax.poaEach ? 'Balance + 1st payment on account' : 'Balance'],
    ...(tax.poaEach ? [[`By ${fmtDate(cfg.secondPoaDate)}`, gbp(tax.dueJuly), '2nd payment on account']] : []),
  ];
  return {
    title: `Self Assessment summary ${cfg.label}`,
    method: result.vehicles
      .filter((v) => v.businessMiles > 0 || v.claim > 0)
      .map((v, i) => `${year.vehicles.find((x) => x.id === v.id)?.name || en.vehicle.defaultName[v.type] + (i ? ` ${i + 1}` : '')}: ${v.method === 'mileage' ? 'mileage rate' : 'actual costs'} (${gbp(v.claim)})`)
      .join('; ') || 'No vehicle claim',
    miles: totals.businessMiles,
    businesses,
    calc,
    pay,
  };
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCSV(summary) {
  const rows = [['Section', 'Business', 'Box', 'Description', 'Value']];
  summary.businesses.forEach((b) => b.rows.forEach((r) => rows.push(['SA103S', b.name, r.box, r.label, r.value])));
  summary.calc.forEach(([k, v]) => rows.push(['Tax calculation', '', '', k, v]));
  summary.pay.forEach(([when, amt, what]) => rows.push(['Payments', '', '', `${what} ${when}`, amt]));
  rows.push(['Info', '', '', 'Vehicles', summary.method]);
  rows.push(['Info', '', '', 'Business miles', summary.miles]);
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}

export async function toPDF(summary, cfg) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.13, 0.11);
  const muted = rgb(0.4, 0.44, 0.42);
  const accent = rgb(0.06, 0.42, 0.31);
  const rule = rgb(0.85, 0.87, 0.84);
  const W = 595;
  const M = 48;
  let page = doc.addPage([W, 842]);
  let y = 842 - M;

  const wrap = (str, size) => {
    const words = String(str).split(' ');
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      const next = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > W - 2 * M) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    });
    if (cur) lines.push(cur);
    return lines;
  };
  const ensure = (h) => {
    if (y - h < M) {
      page = doc.addPage([W, 842]);
      y = 842 - M;
    }
  };
  const text = (s, x, size = 10, f = font, color = ink) => page.drawText(String(s), { x, y, size, font: f, color });
  const right = (s, xr, size = 10, f = font, color = ink) =>
    page.drawText(String(s), { x: xr - f.widthOfTextAtSize(String(s), size), y, size, font: f, color });
  const heading = (s) => {
    ensure(40);
    y -= 14;
    text(s, M, 13, bold, accent);
    y -= 8;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: accent });
    y -= 16;
  };
  const row = (cells, { b = false, line = true } = {}) => {
    ensure(18);
    const f = b ? bold : font;
    if (cells.length === 3) {
      text(cells[0], M, 10, f);
      text(cells[1], M + 52, 10, f);
      right(cells[2], W - M, 10, f);
    } else {
      text(cells[0], M, 10, f);
      right(cells[1], W - M, 10, f);
    }
    y -= 6;
    if (line) page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: rule });
    y -= 12;
  };

  text(summary.title, M, 18, bold);
  y -= 18;
  text(`Tax year ${cfg.start.slice(0, 4)}-${cfg.end.slice(0, 4)} (6 April to 5 April)`, M, 9, font, muted);
  y -= 12;
  wrap(`Vehicles: ${summary.method}`, 9).forEach((line) => {
    text(line, M, 9, font, muted);
    y -= 12;
  });
  text(`Generated ${new Date().toLocaleDateString('en-GB')}  |  Estimate only - check figures against your records before submitting.`, M, 9, font, muted);
  y -= 10;

  summary.businesses.forEach((b) => {
    heading(`Self-employment (short) SA103S - ${b.name}`);
    row(['Box', 'Description', 'Amount'], { b: true });
    b.rows.forEach((r) => row([String(r.box), r.label, whole(r.value)], { b: [9, 20, 21, 31].includes(r.box) }));
  });

  heading('Tax calculation');
  summary.calc.forEach(([k, v]) => row([k, v], { b: k.startsWith('TOTAL') }));

  heading('What to pay');
  summary.pay.forEach(([when, amt, what]) => row([`${when} - ${what}`, amt], { b: true }));
  ensure(60);
  y -= 4;
  text(`Pay HMRC: ${HMRC_BANK.accountName}, sort code ${HMRC_BANK.sortCode}, account ${HMRC_BANK.accountNumber}.`, M, 9, font, muted);
  y -= 12;
  text('Reference: your 10-digit UTR followed by K (e.g. 1234567890K). Check details on GOV.UK first.', M, 9, font, muted);
  y -= 20;
  text('Rates: England, Wales & NI. Not professional tax advice.', M, 8, font, muted);

  return doc.save();
}

const isNativeApp = () => typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

function toBase64(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(bin);
}

/** Save a file: browser download on the web, share sheet in the Android app. */
export async function download(filename, data, type) {
  if (isNativeApp()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const written =
      typeof data === 'string'
        ? await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache, encoding: Encoding.UTF8 })
        : await Filesystem.writeFile({ path: filename, data: toBase64(new Uint8Array(await data.arrayBuffer())), directory: Directory.Cache });
    await Share.share({ title: filename, files: [written.uri] });
    return;
  }
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
