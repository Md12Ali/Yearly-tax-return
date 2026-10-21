import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTax, mileageAllowance, computeAll } from '../src/lib/taxEngine.js';
import { TAX_YEARS } from '../src/data/taxYears.js';
import { emptyYearData } from '../src/data/fields.js';

const cfg = TAX_YEARS['2025-26'];

test('mileage allowance 45p then 25p', () => {
  assert.equal(mileageAllowance(8000), 3600);
  assert.equal(mileageAllowance(10000), 4500);
  assert.equal(mileageAllowance(12000), 5000);
});

test('£30,000 profit: basic rate only', () => {
  const t = computeTax(30000, cfg);
  assert.equal(t.taxable, 17430);
  assert.equal(t.incomeTax, 3486);
  assert.equal(t.class4, 1045.8);
  assert.equal(t.class2, 0);
  assert.equal(t.class2TreatedAsPaid, true);
  assert.equal(t.total, 4531.8);
  assert.equal(t.poaRequired, true);
  assert.equal(t.poaEach, 2265.9);
  assert.equal(t.dueJanuary, 6797.7);
});

test('£60,000 profit: higher rate + 2% Class 4', () => {
  const t = computeTax(60000, cfg);
  assert.equal(t.incomeTax, 11432);
  assert.equal(t.class4, 2456.6);
});

test('£110,000 profit: personal allowance tapered', () => {
  const t = computeTax(110000, cfg);
  assert.equal(t.allowance, 7570);
  assert.equal(t.incomeTax, 33432);
});

test('£5,000 profit: no tax, voluntary Class 2 optional', () => {
  assert.equal(computeTax(5000, cfg).total, 0);
  const v = computeTax(5000, cfg, { class2Voluntary: true });
  assert.equal(v.class2, 182);
  assert.equal(v.poaRequired, false);
});

test('full scenario: actual vs mileage across three businesses', () => {
  const d = emptyYearData();
  d.jobs.tuition.income = { ezlicence: '9000', cash: '1000' };
  d.jobs.tuition.expenses = { franchise: '1200', dualControl: '2400' };
  d.jobs.tuition.miles = '4000';
  d.jobs.privateHire.income = { uber: '20000' };
  d.jobs.privateHire.expenses = { platformFeesRide: '5000' };
  d.jobs.privateHire.miles = '9000';
  d.jobs.delivery.income = { deliveroo: '5000' };
  d.jobs.delivery.miles = '3000';
  d.shared.expenses = { fuel: '3000', insurance: '1500', phone: '300' };
  d.shared.totalMiles = '20000'; // 16,000 business = 80%
  const r = computeAll(d, cfg);
  assert.equal(r.totals.gross, 35000);
  assert.equal(r.totals.businessUse, 0.8);
  // actual: 1200+2400+5000+ (4500*0.8=3600) + 300 = 12500
  assert.equal(r.compare.actual.expenses, 12500);
  // mileage: 1200+5000+300 + (4500 + 6000*0.25=6000) = 12500
  assert.equal(r.compare.mileage.expenses, 12500);
  assert.equal(r.jobs.tuition.boxes[9], 10000);
  assert.equal(r.compare.better, 'same');
  assert.equal(r.mtd.applies, true); // over £30,000 for 2025/26
});
