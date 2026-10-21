import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTax, mileageAllowance, computeAll, homeAllowance } from '../src/lib/taxEngine.js';
import { TAX_YEARS } from '../src/data/taxYears.js';
import { emptyYearData, newVehicle, migrateYear } from '../src/data/fields.js';

const cfg = TAX_YEARS['2025-26'];
const cfg27 = TAX_YEARS['2026-27'];

test('mileage rates by vehicle and year', () => {
  assert.equal(mileageAllowance(12000, 'car', cfg.mileage), 5000); // 10k×45p + 2k×25p
  assert.equal(mileageAllowance(12000, 'car', cfg27.mileage), 6000); // 10k×55p + 2k×25p
  assert.equal(mileageAllowance(5000, 'motorcycle', cfg.mileage), 1200); // 24p
  assert.equal(mileageAllowance(5000, 'dualControl', cfg.mileage), 0); // not allowed
  assert.equal(mileageAllowance(5000, 'bicycle', cfg.mileage), 0);
});

test('use of home flat rate', () => {
  assert.equal(homeAllowance('30', '', cfg.homeFlatRates), 120);
  assert.equal(homeAllowance('60', '6', cfg.homeFlatRates), 108);
  assert.equal(homeAllowance('120', '12', cfg.homeFlatRates), 312);
  assert.equal(homeAllowance('20', '12', cfg.homeFlatRates), 0);
});

test('£30,000 profit: basic rate only', () => {
  const t = computeTax(30000, cfg);
  assert.equal(t.incomeTax, 3486);
  assert.equal(t.class4, 1045.8);
  assert.equal(t.total, 4531.8);
  assert.equal(t.poaEach, 2265.9);
});

test('£60,000 and £110,000 profit', () => {
  assert.equal(computeTax(60000, cfg).incomeTax, 11432);
  assert.equal(computeTax(60000, cfg).class4, 2456.6);
  assert.equal(computeTax(110000, cfg).allowance, 7570);
  assert.equal(computeTax(110000, cfg).incomeTax, 33432);
});

test('voluntary Class 2 below threshold', () => {
  assert.equal(computeTax(5000, cfg, { class2Voluntary: true }).class2, 182);
});

test('dual-control car always uses actual costs, private car can use mileage', () => {
  const d = emptyYearData();
  d.jobs.tuition.income = { ezlicence: '10000' };
  d.jobs.privateHire.income = { uber: '20000' };
  d.jobs.privateHire.expenses = { platformFeesRide: '5000' };
  const dual = { ...newVehicle('dualControl', ['tuition']), method: 'mileage', totalMiles: '6000', miles: { tuition: '5000' }, costs: { lease: '3000', fuel: '1200' } };
  const car = { ...d.vehicles[0], jobs: ['privateHire'], method: 'actual', totalMiles: '15000', miles: { privateHire: '12000' }, costs: { fuel: '2000', insurance: '1500' } };
  d.vehicles = [car, dual];
  const r = computeAll(d, cfg);
  const dv = r.vehicles.find((v) => v.type === 'dualControl');
  assert.equal(dv.method, 'actual'); // mileage ignored
  assert.equal(dv.actualClaim, round(4200 * 5000 / 6000));
  const cv = r.vehicles.find((v) => v.id === car.id);
  assert.equal(cv.actualClaim, 2800); // 3500 × 80%
  assert.equal(cv.mileageClaim, 5000);
  assert.equal(cv.best, 'mileage');
  assert.ok(r.best.saving > 0);
  assert.deepEqual(r.best.switches, [{ id: car.id, to: 'mileage' }]);
  assert.equal(r.jobs.tuition.boxes[12], 3500);
});

test('capital allowances on a new electric car, business share', () => {
  const d = emptyYearData();
  d.jobs.privateHire.income = { uber: '40000' };
  d.vehicles[0] = { ...d.vehicles[0], jobs: ['privateHire'], totalMiles: '20000', miles: { privateHire: '16000' }, purchase: { cost: '30000', broughtForward: '', kind: 'newZero' } };
  const r = computeAll(d, cfg);
  assert.equal(r.jobs.privateHire.boxes['24.1'], 24000); // 100% FYA × 80%
  assert.equal(r.jobs.privateHire.boxes[31], 16000);
});

test('custom items, grants and motorcycle delivery', () => {
  const d = emptyYearData();
  d.jobs.delivery.income = { deliveroo: '8000', grantsDelivery: '500' };
  d.jobs.delivery.customIncome = [{ id: 'a', label: 'Stuart', amount: '1000' }];
  d.jobs.delivery.customExpenses = [{ id: 'b', label: 'Thermal gloves', amount: '40', box: 19 }];
  d.vehicles = [{ ...newVehicle('motorcycle', ['delivery']), method: 'mileage', miles: { delivery: '6000' } }];
  const r = computeAll(d, cfg);
  const b = r.jobs.delivery.boxes;
  assert.equal(b[9], 9000);
  assert.equal(b[10], 500);
  assert.equal(b[12], 1440);
  assert.equal(b[20], 1480);
  assert.equal(b[21], 8020);
});

test('version 1 data migrates', () => {
  const v1 = {
    method: 'mileage',
    jobs: { tuition: { income: { ezlicence: '100' }, expenses: { dualControl: '2400' }, miles: '4000' }, privateHire: { income: {}, expenses: {}, miles: '' }, delivery: { income: {}, expenses: { equipment: '50' }, miles: '' } },
    shared: { expenses: { fuel: '900', phone: '200' }, totalMiles: '9000' },
    entries: [],
  };
  const m = migrateYear(v1);
  assert.equal(m.version, 2);
  assert.equal(m.vehicles[0].method, 'mileage');
  assert.equal(m.vehicles[0].costs.fuel, '900');
  assert.equal(m.vehicles[1].type, 'dualControl');
  assert.equal(m.jobs.delivery.expenses.deliveryKit, '50');
});

function round(n) {
  return Math.round(n * 100) / 100;
}
