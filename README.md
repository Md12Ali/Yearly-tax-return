# Tax Return Helper 🇬🇧

A mobile-first web app for **HMRC Self Assessment** if you are self-employed as a
**trainee driving instructor**, a **private hire driver** (Uber, Bolt, FREE NOW) and/or a
**food & parcel delivery driver** (Deliveroo, Uber Eats, Just Eat, Amazon Flex).

English and বাংলা (Bengali), light and dark theme. Your figures are saved only in your browser (LocalStorage) — nothing is sent anywhere.

## What it does

| Tab | Features |
| --- | --- |
| 📊 Dashboard | Estimated tax & NI, monthly set-aside, deadline countdown, income by business, Making Tax Digital warning, key dates, progress checklist |
| 💰 Income & Expenses | Income per platform, expenses per business, shared car costs split by business mileage, quick log for single receipts |
| 🧮 Tax Calculator | Actual costs vs mileage (45p/25p) comparison with the cheaper method highlighted, Income Tax + Class 4 + Class 2 breakdown, payments on account, SA103S box-by-box figures with copy buttons |
| 📜 HMRC Guide | 6 illustrated steps from sign-in to paying with NatWest/Revolut, gross vs net, what you can/can't claim, records checklist |

**Export:** PDF and CSV summary with SA103S box numbers (9, 12, 16–21).

## How the numbers work

- Rates for England, Wales & NI, tax years **2024/25, 2025/26 and 2026/27** (`src/data/taxYears.js`).
- Personal Allowance £12,570 (reduced above £100,000), 20% / 40% / 45% bands.
- Class 4 NI 6% on £12,570–£50,270, 2% above. Class 2 is treated as paid above the small profits threshold; optional voluntary Class 2 below it.
- Each job is a separate SA103S page. Shared car costs are cut to your business-use % (business miles ÷ total miles) and split by each job's miles.
- Mileage method replaces all car running costs; parking, platform fees, phone and licences are still claimed.
- Income rounded down and expenses rounded up to whole pounds, as HMRC allows.
- Assumes self-employment is your only income. Not professional tax advice.

Tests: `npm test`

## Run locally

```bash
npm install
npm run dev
```

## Deploy free on Render

1. Push this repo to GitHub (already done if you are reading this there).
2. On [render.com](https://render.com) choose **New → Static Site** and pick this repo.
3. Build command: `npm install && npm run build` · Publish directory: `dist`
4. Click **Create Static Site**. (Or use **New → Blueprint** — `render.yaml` sets this up for you.)

## Project structure

```
src/
  data/        taxYears.js (HMRC rates & dates), fields.js (all inputs & SA103S boxes)
  lib/         taxEngine.js (calculations), store.js (LocalStorage), exportData.js (PDF/CSV)
  i18n/        en.js, bn.js (every piece of text, both languages)
  components/  ui.jsx (inputs, cards), parts.jsx (method comparison, boxes table, export)
  pages/       Dashboard, IncomeExpenses, TaxCalculator, HmrcGuide
tests/         taxEngine.test.js
```

To update for a new tax year, add an entry to `src/data/taxYears.js`.
