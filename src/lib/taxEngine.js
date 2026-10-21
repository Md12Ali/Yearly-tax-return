import { JOBS, INCOME_FIELDS, EXPENSE_FIELDS, EXPENSE_BOXES, VEHICLE_TYPES, VEHICLE_COSTS } from '../data/fields.js';
import { POA_THRESHOLD, SHORT_FORM_TURNOVER_LIMIT } from '../data/taxYears.js';

/** Parse any user input ("1,234.50", "", null) into a non-negative number. */
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[£,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const round2 = (n) => Math.round(n * 100) / 100;

/** Logged quick-entries for a field. scope = job id, 'shared' or a vehicle id. */
function logged(data, scope, kind, field) {
  return (data.entries || [])
    .filter((e) => e.scope === scope && e.kind === kind && e.field === field)
    .reduce((s, e) => s + num(e.amount), 0);
}

/** Typed amount + quick-log entries for one field. */
export function fieldTotal(data, scope, kind, field) {
  let base = 0;
  if (kind === 'vehicle') base = num(data.vehicles.find((v) => v.id === scope)?.costs?.[field]);
  else {
    const bucket = scope === 'shared' ? data.shared : data.jobs[scope];
    base = num(kind === 'income' ? bucket?.income?.[field] : bucket?.expenses?.[field]);
  }
  return round2(base + logged(data, scope, kind, field));
}

/** HMRC simplified mileage for one vehicle. */
export function mileageAllowance(miles, type, rates) {
  const m = Math.max(0, miles);
  const kind = VEHICLE_TYPES[type]?.mileage;
  if (kind === 'motorcycle') return round2(m * rates.motorcycle);
  if (kind !== 'car') return 0;
  const first = Math.min(m, rates.firstMiles);
  return round2(first * rates.carFirst + Math.max(0, m - rates.firstMiles) * rates.carLater);
}

/** Simplified use-of-home flat rate for the year. */
export function homeAllowance(hours, months, flatRates) {
  const h = num(hours);
  const band = flatRates.find((b) => h >= b.minHours);
  if (!band) return 0;
  const m = Math.min(12, num(months) || 12);
  return band.monthly * m;
}

/** Split `amount` across jobs by weight; only `pool` jobs receive a share. */
function allocate(amount, weights, pool) {
  const out = Object.fromEntries(JOBS.map((j) => [j, 0]));
  if (!amount || !pool.length) return out;
  const totalW = pool.reduce((s, j) => s + (weights[j] || 0), 0);
  pool.forEach((j) => (out[j] = totalW > 0 ? (amount * (weights[j] || 0)) / totalW : amount / pool.length));
  return out;
}

/** Everything about one vehicle: business use, actual claim, mileage claim, capital allowances. */
export function computeVehicle(data, v, cfg, activeJobs) {
  const type = VEHICLE_TYPES[v.type] ? v.type : 'car';
  const jobs = (v.jobs?.length ? v.jobs : JOBS).filter((j) => JOBS.includes(j));
  const miles = Object.fromEntries(JOBS.map((j) => [j, jobs.includes(j) ? num(v.miles?.[j]) : 0]));
  const businessMiles = JOBS.reduce((s, j) => s + miles[j], 0);
  const totalMiles = num(v.totalMiles);
  const hasTotal = totalMiles > 0 && totalMiles >= businessMiles && businessMiles > 0;
  const businessUse = hasTotal ? businessMiles / totalMiles : 1;

  const running = round2(VEHICLE_COSTS.reduce((s, f) => s + fieldTotal(data, v.id, 'vehicle', f), 0));
  const isCar = type === 'car' || type === 'dualControl';
  const cost = num(v.purchase?.cost);
  const bf = num(v.purchase?.broughtForward);
  const ca = cfg.capitalAllowances;

  // Cars: capital allowances. Vans, motorcycles, bicycles: cash basis lets you deduct the purchase as an expense.
  let fya = 0;
  let wda = 0;
  let purchaseExpense = 0;
  if (isCar) {
    if (v.purchase?.kind === 'newZero') {
      fya = cost * ca.zeroEmissionFya;
      wda = bf * ca.mainRate;
    } else {
      wda = (bf + cost) * (v.purchase?.kind === 'high' ? ca.specialRate : ca.mainRate);
    }
  } else {
    purchaseExpense = cost;
  }
  fya = round2(fya * businessUse);
  wda = round2(wda * businessUse);

  const actualExpense = round2((running + purchaseExpense) * businessUse);
  const actualClaim = round2(actualExpense + fya + wda);
  const eligible = !!VEHICLE_TYPES[type].mileage;
  const mileageClaim = eligible ? mileageAllowance(businessMiles, type, cfg.mileage) : 0;
  const method = eligible && v.method === 'mileage' ? 'mileage' : 'actual';
  const best = !eligible ? 'actual' : mileageClaim > actualClaim ? 'mileage' : actualClaim > mileageClaim ? 'actual' : 'same';

  // Who gets the cost: by miles, otherwise by the jobs it's used for that have income.
  const pool = businessMiles > 0 ? jobs : jobs.filter((j) => activeJobs.includes(j)).length ? jobs.filter((j) => activeJobs.includes(j)) : jobs;
  const weights = businessMiles > 0 ? miles : {};

  return {
    id: v.id,
    name: v.name,
    type,
    jobs,
    eligible,
    method,
    best,
    businessMiles,
    totalMiles,
    hasTotal,
    businessUse,
    running,
    purchaseExpense,
    actualExpense,
    fya,
    wda,
    actualClaim,
    mileageClaim,
    claim: method === 'mileage' ? mileageClaim : actualClaim,
    saving: eligible ? round2(Math.abs(mileageClaim - actualClaim)) : 0,
    split: {
      box12: allocate(method === 'mileage' ? mileageClaim : actualExpense, weights, pool),
      fya: allocate(method === 'mileage' ? 0 : fya, weights, pool),
      wda: allocate(method === 'mileage' ? 0 : wda, weights, pool),
    },
  };
}

/**
 * Work out every business (one SA103S page each).
 * methodOverride lets the comparison try each vehicle's other method.
 */
export function computeBusinesses(data, cfg, methodOverride = {}) {
  const gross = {};
  const box10 = {};
  JOBS.forEach((j) => {
    const job = data.jobs[j];
    let g = 0;
    let other = 0;
    INCOME_FIELDS[j].forEach((f) => {
      const amt = fieldTotal(data, j, 'income', f.id);
      if (f.box === 10) other += amt;
      else g += amt;
    });
    (job.customIncome || []).forEach((c) => (g += num(c.amount)));
    gross[j] = round2(g);
    box10[j] = round2(other);
  });
  const active = JOBS.filter((j) => gross[j] > 0 || box10[j] > 0);

  const jobs = {};
  JOBS.forEach((j) => {
    jobs[j] = { gross: gross[j], otherIncome: box10[j], byBox: Object.fromEntries(EXPENSE_BOXES.map((b) => [b, 0])), fya: 0, wda: 0, vehicleClaim: 0 };
  });

  // Job-specific expenses + custom ones
  JOBS.forEach((j) => {
    EXPENSE_FIELDS[j].forEach((f) => (jobs[j].byBox[f.box] += fieldTotal(data, j, 'expense', f.id)));
    (data.jobs[j].customExpenses || []).forEach((c) => (jobs[j].byBox[c.box || 19] += num(c.amount)));
  });

  // Shared costs, split by income
  const sharedPool = active.length ? active : JOBS;
  const addShared = (amount, box) => {
    const split = allocate(amount, gross, sharedPool);
    JOBS.forEach((j) => (jobs[j].byBox[box] += split[j]));
  };
  EXPENSE_FIELDS.shared.forEach((f) => addShared(fieldTotal(data, 'shared', 'expense', f.id), f.box));
  (data.shared.customExpenses || []).forEach((c) => addShared(num(c.amount), c.box || 19));
  const home = homeAllowance(data.shared.homeHours, data.shared.homeMonths, cfg.homeFlatRates);
  addShared(home, 14);

  // Vehicles
  const vehicles = (data.vehicles || []).map((v) => {
    const vv = methodOverride[v.id] ? { ...v, method: methodOverride[v.id] } : v;
    return computeVehicle(data, vv, cfg, active);
  });
  vehicles.forEach((r) => {
    JOBS.forEach((j) => {
      jobs[j].byBox[12] += r.split.box12[j];
      jobs[j].fya += r.split.fya[j];
      jobs[j].wda += r.split.wda[j];
      jobs[j].vehicleClaim += r.split.box12[j] + r.split.fya[j] + r.split.wda[j];
    });
  });

  // SA103S boxes in whole pounds: income rounded down, expenses and allowances rounded up.
  JOBS.forEach((j) => {
    const r = jobs[j];
    r.expenses = round2(EXPENSE_BOXES.reduce((s, b) => s + r.byBox[b], 0));
    r.capitalAllowances = round2(r.fya + r.wda);
    r.profit = round2(r.gross + r.otherIncome - r.expenses - r.capitalAllowances);
    const boxes = { 9: Math.floor(r.gross), 10: Math.floor(r.otherIncome) };
    EXPENSE_BOXES.forEach((b) => (boxes[b] = Math.ceil(round2(r.byBox[b]))));
    boxes[20] = EXPENSE_BOXES.reduce((s, b) => s + boxes[b], 0);
    boxes[21] = Math.max(0, boxes[9] + boxes[10] - boxes[20]);
    boxes[22] = Math.max(0, boxes[20] - boxes[9] - boxes[10]);
    boxes['24.1'] = Math.ceil(round2(r.fya));
    boxes[25] = Math.ceil(round2(r.wda));
    const afterCa = boxes[21] - boxes[22] - boxes['24.1'] - boxes[25];
    boxes[31] = Math.max(0, afterCa); // total taxable profits from this business
    boxes[32] = Math.max(0, -afterCa); // loss
    r.boxes = boxes;
    r.active = active.includes(j);
    r.shortFormOk = r.gross < SHORT_FORM_TURNOVER_LIMIT;
  });

  const sum = (k) => round2(JOBS.reduce((s, j) => s + jobs[j][k], 0));
  const totalGross = round2(sum('gross') + sum('otherIncome'));
  const totalExpenses = sum('expenses');
  const totalCa = sum('capitalAllowances');

  return {
    jobs,
    vehicles,
    totals: {
      gross: totalGross,
      expenses: totalExpenses,
      capitalAllowances: totalCa,
      netProfit: round2(totalGross - totalExpenses - totalCa),
      taxableProfits: Math.max(0, JOBS.reduce((s, j) => s + jobs[j].boxes[31] - jobs[j].boxes[32], 0)),
      businessMiles: vehicles.reduce((s, v) => s + v.businessMiles, 0),
      vehicleClaim: round2(vehicles.reduce((s, v) => s + v.claim, 0)),
      home,
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
  const class4Main = round2(Math.max(0, Math.min(p, c4.upperLimit) - c4.lowerLimit) * c4.mainRate);
  const class4Upper = round2(Math.max(0, p - c4.upperLimit) * c4.upperRate);
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
    refund: round2(Math.max(0, paid - total)),
    dueJanuary: round2(balance + poaEach),
    dueJuly: poaEach,
  };
}

/** Everything the UI needs, including the best method for each vehicle. */
export function computeAll(data, cfg) {
  const opts = { class2Voluntary: data.class2Voluntary, poaPaid: data.poaPaid };
  const current = computeBusinesses(data, cfg);
  const tax = computeTax(current.totals.taxableProfits, cfg, opts);

  // A bigger vehicle claim always means less tax, so the best mix is the bigger claim per vehicle.
  const bestMethods = {};
  current.vehicles.forEach((v) => {
    if (v.eligible && v.best !== 'same') bestMethods[v.id] = v.best;
  });
  const best = computeBusinesses(data, cfg, bestMethods);
  const bestTax = computeTax(best.totals.taxableProfits, cfg, opts);
  const switches = current.vehicles.filter((v) => v.eligible && v.best !== 'same' && v.best !== v.method).map((v) => ({ id: v.id, to: v.best }));

  return {
    ...current,
    tax,
    best: { tax: bestTax.total, saving: round2(Math.max(0, tax.total - bestTax.total)), switches },
    mtd: { applies: current.totals.gross > cfg.mtd.threshold, threshold: cfg.mtd.threshold, startDate: cfg.mtd.startDate, qualifying: current.totals.gross },
  };
}
