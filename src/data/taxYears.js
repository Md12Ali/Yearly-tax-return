// HMRC rates for England, Wales & Northern Ireland (Scotland has different income tax bands).
// Sources: GOV.UK income tax rates, self-employed National Insurance rates, SA103S notes,
// Making Tax Digital for Income Tax thresholds. Check GOV.UK each year before relying on these.

const INCOME_TAX = {
  personalAllowance: 12570,
  paTaperThreshold: 100000, // allowance falls £1 for every £2 above this
  basicBand: 37700, // taxable income taxed at 20%
  additionalThreshold: 125140, // taxable income above this taxed at 45%
  rates: { basic: 0.2, higher: 0.4, additional: 0.45 },
};

const CLASS4 = { lowerLimit: 12570, upperLimit: 50270, mainRate: 0.06, upperRate: 0.02 };

export const MILEAGE = { firstMiles: 10000, firstRate: 0.45, laterRate: 0.25 };
export const TRADING_ALLOWANCE = 1000;
export const SHORT_FORM_TURNOVER_LIMIT = 90000; // SA103S can be used below this
export const POA_THRESHOLD = 1000; // payments on account needed when bill is over this

export const TAX_YEARS = {
  '2024-25': {
    id: '2024-25',
    label: '2024/25',
    start: '2024-04-06',
    end: '2025-04-05',
    incomeTax: INCOME_TAX,
    class4: CLASS4,
    class2: { smallProfitsThreshold: 6845, weeklyRate: 3.45, weeks: 52 },
    registerBy: '2025-10-05',
    paperDeadline: '2025-10-31',
    onlineDeadline: '2026-01-31',
    secondPoaDate: '2026-07-31',
    mtd: { threshold: 50000, startDate: '2026-04-06' },
  },
  '2025-26': {
    id: '2025-26',
    label: '2025/26',
    start: '2025-04-06',
    end: '2026-04-05',
    incomeTax: INCOME_TAX,
    class4: CLASS4,
    class2: { smallProfitsThreshold: 6845, weeklyRate: 3.5, weeks: 52 },
    registerBy: '2026-10-05',
    paperDeadline: '2026-10-31',
    onlineDeadline: '2027-01-31',
    secondPoaDate: '2027-07-31',
    mtd: { threshold: 30000, startDate: '2027-04-06' },
  },
  '2026-27': {
    id: '2026-27',
    label: '2026/27',
    start: '2026-04-06',
    end: '2027-04-05',
    incomeTax: INCOME_TAX,
    class4: CLASS4,
    class2: { smallProfitsThreshold: 7105, weeklyRate: 3.65, weeks: 52 },
    registerBy: '2027-10-05',
    paperDeadline: '2027-10-31',
    onlineDeadline: '2028-01-31',
    secondPoaDate: '2028-07-31',
    mtd: { threshold: 20000, startDate: '2028-04-06' },
  },
};

export const DEFAULT_TAX_YEAR = '2025-26';

export const HMRC_BANK = {
  accountName: 'HMRC Cumbernauld',
  sortCode: '08-32-10',
  accountNumber: '12001039',
};
