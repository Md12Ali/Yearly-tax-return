import { JOBS, INCOME_FIELDS, EXPENSE_FIELDS, EXPENSE_BOXES } from '../data/fields.js';
import { MILEAGE, POA_THRESHOLD, SHORT_FORM_TURNOVER_LIMIT } from '../data/taxYears.js';

/** Parse any user input ("1,234.50", "", null) into a non-negative number. */
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[£,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const round2 = (n) => Math.round(n * 100) / 100;

/** Typed total + any quick-log entries for one field. */
export function fieldTotal(data, scope, kind, field) {
  const bucket = scope === 'shared' ? data.shared : data.jobs[scope];
  const base = num(kind === 'income' ? bucket.income?.[field] : bucket.expenses?.[field]);
  const logged = (data.entries || [])
    .filter((e) => e.scope === scope && e.kind === kind && e.field === field)
    .reduce((s, e) => s + num(e.amount), 0);
  return round2(base + logged);
}

/** HMRC simplified mileage: 45p for the first 10,000 business miles, 25p after. */
export function mileageAllowance(miles) {
  const m = Math.max(0, miles);
  const first = Math.min(m, MILEAGE.firstMiles);
  const later = Math.max(0, m - MILEAGE.firstMiles);
  return round2(first * MILEAGE.firstRate + later * MILEAGE.laterRate);
}

/** Split `amount` across jobs using weights; only active jobs receive a share. */
function allocate(amount, weights, activeJobs) {
  const out = Object.fromEntries(JOBS.map((j) => [j, 0]));
  if (!amount) return out;
  const pool = activeJobs.length ? activeJobs : JOBS;
  const totalW = pool.reduce((s, j) => s + (weights[j] || 0), 0);
  pool.forEach((j) => {
    out[j] = totalW > 0 ? (amount * (weights[j] || 0)) / totalW : amount / pool.length;
  });
  return out;
}

/**
 * Work out every business (SA103S page) for one expense method.
 * Returns per-job figures, SA103S boxes (whole pounds) and combined totals.
 */
export function computeBusinesses(data, method) {
  const gross = {};
  const miles = {};
  JOBS.forEach((j) => {
    gross[j] = round2(INCOME_FIELDS[j].reduce((s, f) => s + fieldTotal(data, j, 'income', f), 0));
    miles[j] = num(data.jobs[j].miles);
  });
  const businessMiles = JOBS.reduce((s, j) => s + miles[j], 0);
  const totalMiles = num(data.shared.totalMiles);
  const hasTotalMiles = totalMiles > 0 && totalMiles >= businessMiles && businessMiles > 0;
  const businessUse = hasTotalMiles ? businessMiles / totalMiles : 1;
  const active = JOBS.filter((j) => gross[j] > 0 || miles[j] > 0);

  const mileageTotal = mileageAllowance(businessMiles);
  const mileageShare = allocate(mileageTotal, miles, active);

  const jobs = {};
  JOBS.forEach((j) => {
    jobs[j] = { gross: gross[j], miles: miles[j], byBox: Object.fromEntries(EXPENSE_BOXES.map((b) => [b, 0])), vehicleActual: 0, mileage: 0 };
  });

  // Job-specific expenses
  JOBS.forEach((j) => {
    EXPENSE_FIELDS[j].forEach((f) => {
      const amt = fieldTotal(data, j, 'expense', f.id);
      if (!amt) return;
      if (f.vehicle) {
        jobs[j].vehicleActual += amt;
        if (method === 'mileage') return; // covered by the mileage rate
      }
      jobs[j].byBox[f.box] += amt;
    });
  });

  // Shared expenses, split across the businesses
  EXPENSE_FIELDS.shared.forEach((f) => {
    let amt = fieldTotal(data, 'shared', 'expense', f.id);
    if (!amt) return;
    if (f.vehicle) amt *= businessUse;
    const split = allocate(amt, f.allocate === 'miles' ? miles : gross, active);
    JOBS.forEach((j) => {
      if (f.vehicle) {
        jobs[j].vehicleActual += split[j];
        if (method === 'mileage') return;
      }
      jobs[j].byBox[f.box] += split[j];
    });
  });

  if (method === 'mileage') {
    JOBS.forEach((j) => {
      jobs[j].mileage = mileageShare[j];
      jobs[j].byBox[12] += mileageShare[j];
    });
  }

  // SA103S boxes: HMRC lets you round income down and expenses up to whole pounds.
  JOBS.forEach((j) => {
    const r = jobs[j];
    r.expenses = round2(EXPENSE_BOXES.reduce((s, b) => s + r.byBox[b], 0));
    r.profit = round2(r.gross - r.expenses);
    const boxes = { 9: Math.floor(r.gross), 10: 0 };
    EXPENSE_BOXES.forEach((b) => (boxes[b] = Math.ceil(round2(r.byBox[b]))));
    boxes[20] = EXPENSE_BOXES.reduce((s, b) => s + boxes[b], 0);
    boxes[21] = Math.max(0, boxes[9] + boxes[10] - boxes[20]);
    boxes[22] = Math.max(0, boxes[20] - boxes[9] - boxes[10]);
    r.boxes = boxes;
    r.active = active.includes(j);
    r.shortFormOk = r.gross < SHORT_FORM_TURNOVER_LIMIT;
  });

  const totalGross = round2(JOBS.reduce((s, j) => s + jobs[j].gross, 0));
  const totalExpenses = round2(JOBS.reduce((s, j) => s + jobs[j].expenses, 0));
  const profitBoxes = JOBS.reduce((s, j) => s + jobs[j].boxes[21] - jobs[j].boxes[22], 0);

  return {
    method,
    jobs,
    totals: {
      gross: totalGross,
      expenses: totalExpenses,
      netProfit: round2(totalGross - totalExpenses),
      taxableProfits: Math.max(0, profitBoxes), // whole pounds, losses set against other trades
      businessMiles,
      totalMiles,
      hasTotalMiles,
      businessUse,
      mileageTotal,
      vehicleActual: round2(JOBS.reduce((s, j) => s + jobs[j].vehicleActual, 0)),
    },
  };
}

/** Income Tax, Class 4 and Class 2 NI on total self-employed profits. */
export function computeTax(profit, cfg, { class2Voluntary = false, poaPaid = 0 } = {}) {
  const p = Math.max(0, Math.floor(profit));
  const it = cfg.incomeTax;
  const allowance = Math.max(0, it.personalAllowance - Math.floor(Math.max(0, p - it.paTaperThreshold) / 2));
  const taxable = Math.max(0, p - allowance);

  const basicAmt = Math.min(taxable, it.basicBand);
  const higherAmt = Math.max(0, Math.min(taxable, it.additionalThreshold) - it.basicBand);
  const additionalAmt = Math.max(0, taxable - it.additionalThreshold);
  const basicTax = round2(basicAmt * it.rates.basic);
  const higherTax = round2(higherAmt * it.rates.higher);
  const additionalTax = round2(additionalAmt * it.rates.additional);
  const incomeTax = round2(basicTax + higherTax + additionalTax);

  const c4 = cfg.class4;
  const c4MainAmt = Math.max(0, Math.min(p, c4.upperLimit) - c4.lowerLimit);
  const c4UpperAmt = Math.max(0, p - c4.upperLimit);
  const class4Main = round2(c4MainAmt * c4.mainRate);
  const class4Upper = round2(c4UpperAmt * c4.upperRate);
  const class4 = round2(class4Main + class4Upper);

  const c2 = cfg.class2;
  const class2TreatedAsPaid = p >= c2.smallProfitsThreshold;
  const class2Annual = round2(c2.weeklyRate * c2.weeks);
  const class2 = !class2TreatedAsPaid && class2Voluntary ? class2Annual : 0;

  const total = round2(incomeTax + class4 + class2);
  const poaBase = round2(incomeTax + class4); // Class 2 is never part of payments on account
  const poaRequired = poaBase > POA_THRESHOLD;
  const poaEach = poaRequired ? round2(poaBase / 2) : 0;
  const paid = num(poaPaid);
  const balance = round2(Math.max(0, total - paid));
  const refund = round2(Math.max(0, paid - total));

  return {
    profit: p,
    allowance,
    taxable,
    bands: { basicAmt, higherAmt, additionalAmt, basicTax, higherTax, additionalTax },
    incomeTax,
    class4Main,
    class4Upper,
    class4,
    class2,
    class2Annual,
    class2TreatedAsPaid,
    total,
    effectiveRate: p > 0 ? total / p : 0,
    poaRequired,
    poaEach,
    balance,
    refund,
    dueJanuary: round2(balance + poaEach),
    dueJuly: poaEach,
  };
}

/** Everything the UI needs: both methods, the chosen one, and which saves more. */
export function computeAll(data, cfg) {
  const opts = { class2Voluntary: data.class2Voluntary, poaPaid: data.poaPaid };
  const actual = computeBusinesses(data, 'actual');
  const mileage = computeBusinesses(data, 'mileage');
  const actualTax = computeTax(actual.totals.taxableProfits, cfg, opts);
  const mileageTax = computeTax(mileage.totals.taxableProfits, cfg, opts);
  const chosen = data.method === 'mileage' ? mileage : actual;
  const tax = data.method === 'mileage' ? mileageTax : actualTax;
  const diff = round2(actualTax.total - mileageTax.total);
  const better = Math.abs(diff) < 0.01 ? 'same' : diff > 0 ? 'mileage' : 'actual';
  const mtdQualifying = actual.totals.gross;

  return {
    ...chosen,
    tax,
    compare: {
      actual: { expenses: actual.totals.expenses, profit: actual.totals.taxableProfits, tax: actualTax.total },
      mileage: { expenses: mileage.totals.expenses, profit: mileage.totals.taxableProfits, tax: mileageTax.total },
      better,
      saving: Math.abs(diff),
    },
    mtd: { applies: mtdQualifying > cfg.mtd.threshold, threshold: cfg.mtd.threshold, startDate: cfg.mtd.startDate, qualifying: mtdQualifying },
  };
}
