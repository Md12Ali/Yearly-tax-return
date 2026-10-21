// Every input in the app is defined here. Labels/tips live in src/i18n.
// box = SA103S box the expense belongs to (12 car & travel, 16 professional fees,
// 17 bank charges, 18 phone & office, 19 other). vehicle = replaced by the mileage rate.
// allocate = how a shared cost is split across the three businesses.

export const JOBS = ['tuition', 'privateHire', 'delivery'];

export const JOB_META = {
  tuition: { icon: '🚗', color: 'var(--c-tuition)' },
  privateHire: { icon: '🚕', color: 'var(--c-ride)' },
  delivery: { icon: '🛵', color: 'var(--c-delivery)' },
};

export const INCOME_FIELDS = {
  tuition: ['ezlicence', 'cash', 'bankTransfer', 'otherTuition'],
  privateHire: ['uber', 'bolt', 'freenow', 'tipsRide', 'otherRide'],
  delivery: ['deliveroo', 'ubereats', 'justeat', 'amazonflex', 'tipsDelivery', 'otherDelivery'],
};

export const EXPENSE_FIELDS = {
  tuition: [
    { id: 'dualControl', box: 12, vehicle: true },
    { id: 'franchise', box: 19 },
    { id: 'dvsaFees', box: 19 },
    { id: 'bookingFees', box: 19 },
    { id: 'teachingKit', box: 19 },
    { id: 'advertising', box: 19 },
  ],
  privateHire: [
    { id: 'phvVehicleLicence', box: 12, vehicle: true },
    { id: 'platformFeesRide', box: 19 },
    { id: 'tflLicence', box: 19 },
  ],
  delivery: [
    { id: 'platformFeesDelivery', box: 19 },
    { id: 'equipment', box: 19 },
  ],
  shared: [
    { id: 'fuel', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'repairs', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'insurance', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'carLease', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'roadTaxMot', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'cleaning', box: 12, vehicle: true, allocate: 'miles' },
    { id: 'parking', box: 12, allocate: 'miles' },
    { id: 'phone', box: 18, allocate: 'income' },
    { id: 'accountancy', box: 16, allocate: 'income' },
    { id: 'bankCharges', box: 17, allocate: 'income' },
    { id: 'otherExpense', box: 19, allocate: 'income' },
  ],
};

export const EXPENSE_BOXES = [11, 12, 13, 14, 15, 16, 17, 18, 19];

export const emptyYearData = () => ({
  method: 'actual', // 'actual' | 'mileage'
  jobs: {
    tuition: { income: {}, expenses: {}, miles: '' },
    privateHire: { income: {}, expenses: {}, miles: '' },
    delivery: { income: {}, expenses: {}, miles: '' },
  },
  shared: { expenses: {}, totalMiles: '' },
  entries: [], // quick-log entries {id, date, scope, kind, field, amount, note}
  class2Voluntary: false,
  poaPaid: '',
  checklist: {},
});
