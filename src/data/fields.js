// Every input in the app is defined here. Labels and tips live in src/i18n.
// box = SA103S box: 9 turnover, 10 other business income, 12 car/van/travel,
// 14 rent/rates/power/insurance, 15 repairs of equipment, 16 professional fees,
// 17 bank/finance charges, 18 phone/stationery/office, 19 other.

export const JOBS = ['tuition', 'privateHire', 'delivery', 'other'];

export const JOB_META = {
  tuition: { icon: '🚗', color: 'var(--c-tuition)' },
  privateHire: { icon: '🚕', color: 'var(--c-ride)' },
  delivery: { icon: '🛵', color: 'var(--c-delivery)' },
  other: { icon: '💼', color: 'var(--c-other)' },
};

/* ---------------- Income ---------------- */

export const INCOME_FIELDS = {
  tuition: [
    { id: 'ezlicence', box: 9 },
    { id: 'cash', box: 9 },
    { id: 'bankTransfer', box: 9 },
    { id: 'cardPayments', box: 9 },
    { id: 'schoolPayments', box: 9 },
    { id: 'intensiveCourses', box: 9 },
    { id: 'giftVouchers', box: 9 },
    { id: 'testFeesCollected', box: 9 },
    { id: 'otherTuition', box: 9 },
    { id: 'grantsTuition', box: 10 },
  ],
  privateHire: [
    { id: 'uber', box: 9 },
    { id: 'bolt', box: 9 },
    { id: 'freenow', box: 9 },
    { id: 'otherOperators', box: 9 },
    { id: 'cashFares', box: 9 },
    { id: 'tipsRide', box: 9 },
    { id: 'incentivesRide', box: 9 },
    { id: 'otherRide', box: 9 },
    { id: 'grantsRide', box: 10 },
  ],
  delivery: [
    { id: 'deliveroo', box: 9 },
    { id: 'ubereats', box: 9 },
    { id: 'justeat', box: 9 },
    { id: 'amazonflex', box: 9 },
    { id: 'courierWork', box: 9 },
    { id: 'tipsDelivery', box: 9 },
    { id: 'incentivesDelivery', box: 9 },
    { id: 'otherDelivery', box: 9 },
    { id: 'grantsDelivery', box: 10 },
  ],
  other: [
    { id: 'salesOther', box: 9 },
    { id: 'cashOther', box: 9 },
    { id: 'platformOther', box: 9 },
    { id: 'tipsOther', box: 9 },
    { id: 'otherOther', box: 9 },
    { id: 'grantsOther', box: 10 },
  ],
};

/* ---------------- Job expenses (not vehicle running costs) ---------------- */

export const EXPENSE_FIELDS = {
  tuition: [
    { id: 'franchise', box: 19 },
    { id: 'dvsaFees', box: 19 },
    { id: 'cpdTraining', box: 19 },
    { id: 'memberships', box: 19 },
    { id: 'bookingFees', box: 19 },
    { id: 'cardFees', box: 17 },
    { id: 'teachingKit', box: 19 },
    { id: 'learningResources', box: 18 },
    { id: 'advertising', box: 19 },
    { id: 'instructorLiability', box: 14 },
    { id: 'testFeesPaid', box: 19 },
    { id: 'travelTuition', box: 12 },
  ],
  privateHire: [
    { id: 'platformFeesRide', box: 19 },
    { id: 'phvDriverLicence', box: 19 },
    { id: 'tflAssessments', box: 19 },
    { id: 'dbsMedical', box: 19 },
    { id: 'congestionCharge', box: 12 },
    { id: 'ulezCharge', box: 12 },
    { id: 'travelRide', box: 12 },
    { id: 'dispatchApps', box: 18 },
    { id: 'cardTerminal', box: 17 },
    { id: 'passengerItems', box: 19 },
    { id: 'rideEquipment', box: 19 },
    { id: 'safetyKit', box: 19 },
    { id: 'businessInsuranceRide', box: 14 },
    { id: 'tradeAssociation', box: 19 },
    { id: 'trainingRide', box: 19 },
    { id: 'uniformRide', box: 19 },
  ],
  delivery: [
    { id: 'platformFeesDelivery', box: 19 },
    { id: 'deliveryKit', box: 19 },
    { id: 'protectiveKit', box: 19 },
    { id: 'goodsInTransit', box: 14 },
    { id: 'deliveryRightToWork', box: 19 },
    { id: 'travelDelivery', box: 12 },
  ],
  other: [
    { id: 'costOfGoods', box: 11 },
    { id: 'subcontractors', box: 13 },
    { id: 'premises', box: 14 },
    { id: 'businessInsurance', box: 14 },
    { id: 'repairsEquipment', box: 15 },
    { id: 'professionalFees', box: 16 },
    { id: 'equipment', box: 19 },
    { id: 'softwareOther', box: 18 },
    { id: 'advertisingOther', box: 19 },
    { id: 'trainingOther', box: 19 },
    { id: 'platformFeesOther', box: 19 },
    { id: 'travelOther', box: 12 },
  ],
  shared: [
    { id: 'phone', box: 18, allocate: 'income' },
    { id: 'phoneHandset', box: 19, allocate: 'income' },
    { id: 'software', box: 18, allocate: 'income' },
    { id: 'stationery', box: 18, allocate: 'income' },
    { id: 'accountancy', box: 16, allocate: 'income' },
    { id: 'bankCharges', box: 17, allocate: 'income' },
    { id: 'loanInterest', box: 17, allocate: 'income' },
    { id: 'otherExpense', box: 19, allocate: 'income' },
  ],
};

/** Boxes a custom expense can be put in. */
export const CUSTOM_BOXES = [11, 12, 13, 14, 15, 16, 17, 18, 19];
export const EXPENSE_BOXES = [11, 12, 13, 14, 15, 16, 17, 18, 19];

/* ---------------- Vehicles ---------------- */

// mileage: which HMRC flat rate applies (null = actual costs only).
export const VEHICLE_TYPES = {
  car: { icon: '🚘', mileage: 'car' },
  dualControl: { icon: '🚗', mileage: null }, // HMRC: dual-control instructor cars can't use flat rates
  van: { icon: '🚐', mileage: 'car' }, // goods vehicles share the car rate
  motorcycle: { icon: '🏍️', mileage: 'motorcycle' },
  bicycle: { icon: '🚲', mileage: null },
};

// Running costs. All are replaced by the flat rate when the vehicle uses the mileage method.
export const VEHICLE_COSTS = ['fuel', 'insurance', 'repairs', 'tyres', 'lease', 'financeInterest', 'taxMot', 'phvVehicleLicence', 'breakdownCover', 'cleaning', 'otherVehicle'];

export const DRIVING_JOBS = ['tuition', 'privateHire', 'delivery'];

export const newVehicle = (type = 'car', jobs = [...DRIVING_JOBS]) => ({
  id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  type,
  method: 'actual', // 'actual' | 'mileage'
  jobs, // which kinds of work it is used for
  totalMiles: '',
  miles: {}, // business miles per job
  costs: {},
  purchase: { cost: '', broughtForward: '', kind: 'low' }, // kind: newZero | low (≤50g/km or used EV) | high (>50g/km)
});

/* ---------------- Year template ---------------- */

export const emptyYearData = () => ({
  version: 2,
  jobs: {
    tuition: { income: {}, expenses: {}, customIncome: [], customExpenses: [] },
    privateHire: { income: {}, expenses: {}, customIncome: [], customExpenses: [] },
    delivery: { income: {}, expenses: {}, customIncome: [], customExpenses: [] },
    other: { name: '', income: {}, expenses: {}, customIncome: [], customExpenses: [] },
  },
  vehicles: [{ ...newVehicle('car'), id: 'v-main' }],
  shared: { expenses: {}, customExpenses: [], homeHours: '', homeMonths: '' },
  entries: [], // quick-log entries {id, date, scope, kind, field, amount, note}
  class2Voluntary: false,
  poaPaid: '',
  checklist: {},
});

/**
 * Upgrade a version-1 year (single shared car, global method) to version 2 (vehicles).
 */
export function migrateYear(y) {
  if (!y || y.version === 2) return y;
  const d = emptyYearData();
  JOBS.forEach((j) => {
    const old = y.jobs?.[j] || {};
    d.jobs[j].income = { ...old.income };
    d.jobs[j].expenses = { ...old.expenses };
  });
  // Rename old fields
  const ride = d.jobs.privateHire.expenses;
  if (ride.tflLicence) ride.phvDriverLicence = ride.tflLicence;
  const del = d.jobs.delivery.expenses;
  if (del.equipment) del.deliveryKit = del.equipment;

  const sharedOld = y.shared?.expenses || {};
  const car = d.vehicles[0];
  car.name = '';
  car.method = y.method === 'mileage' ? 'mileage' : 'actual';
  car.totalMiles = y.shared?.totalMiles || '';
  JOBS.forEach((j) => (car.miles[j] = y.jobs?.[j]?.miles || ''));
  car.costs = {
    fuel: sharedOld.fuel,
    repairs: sharedOld.repairs,
    insurance: sharedOld.insurance,
    lease: sharedOld.carLease,
    taxMot: sharedOld.roadTaxMot,
    cleaning: sharedOld.cleaning,
    phvVehicleLicence: y.jobs?.privateHire?.expenses?.phvVehicleLicence,
  };
  if (sharedOld.parking) d.jobs.privateHire.expenses.travelRide = sharedOld.parking;
  d.shared.expenses = { phone: sharedOld.phone, accountancy: sharedOld.accountancy, bankCharges: sharedOld.bankCharges, otherExpense: sharedOld.otherExpense };
  const dual = y.jobs?.tuition?.expenses?.dualControl;
  if (dual) d.vehicles.push({ ...newVehicle('dualControl', ['tuition']), costs: { lease: dual } });
  d.entries = (y.entries || []).filter((e) => e.scope !== 'shared');
  d.class2Voluntary = !!y.class2Voluntary;
  d.poaPaid = y.poaPaid || '';
  d.checklist = y.checklist || {};
  return d;
}
