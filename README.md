# Tax Return Helper 🇬🇧

A mobile-first web app for **HMRC Self Assessment** if you are self-employed as a
**trainee driving instructor**, a **private hire driver** (Uber, Bolt, FREE NOW), a
**food & parcel delivery driver** (Deliveroo, Uber Eats, Just Eat, Amazon Flex) and/or in
**any other self-employment** (e.g. web design, cleaning, tutoring) — name it yourself.

English and বাংলা (Bengali), light and dark theme. Your figures are saved only in your browser (LocalStorage) — nothing is sent anywhere.

## What it does

| Tab | Features |
| --- | --- |
| 📊 Dashboard | Estimated tax & NI, monthly set-aside, deadline countdown, income by business, Making Tax Digital warning, key dates, progress checklist |
| 💰 Income & Expenses | 25+ income sources and 30+ expense types per job, your own custom items (with SA103S box), vehicles (car, dual-control car, van, motorbike, bicycle) each with its own method, capital allowances on a car you bought, working-from-home flat rate, quick log for single receipts, and a “What can I claim here?” guide for every job |
| 🧮 Tax Calculator | Actual costs vs mileage compared for each vehicle, with one tap to use the best method, Income Tax + Class 4 + Class 2 breakdown, payments on account, SA103S box-by-box figures with copy buttons |
| 📜 HMRC Guide | 6 illustrated steps from sign-in to paying with NatWest/Revolut, an allowed / not-allowed list for each job with SA103S boxes, records checklist |

**Export:** PDF and CSV summary with SA103S box numbers (9, 12, 16–21).

## Daily use

- **＋ Add** (every screen): log income, an expense or business miles in a few taps. Entries go into the right tax year from their date.
- **Dashboard → this month**: income, expenses and miles logged this month, with recent entries.
- **Backup & restore**: save everything to a file (e.g. Google Drive) and restore it on any phone or browser. Reminder after 14 days.
- **All entries (CSV)**: every logged entry across all years, for your records.
- The website works offline and can be installed from the browser menu (PWA).

## How the numbers work

- Rates for England, Wales & NI, tax years **2024/25, 2025/26 and 2026/27** (`src/data/taxYears.js`).
- Personal Allowance £12,570 (reduced above £100,000), 20% / 40% / 45% bands.
- Class 4 NI 6% on £12,570–£50,270, 2% above. Class 2 is treated as paid above the small profits threshold; optional voluntary Class 2 below it.
- Each job is a separate SA103S page. Vehicle costs are cut to each vehicle's business-use % (business miles ÷ total miles) and split by each job's miles. Shared costs (phone, accountant, home) are split by income.
- Mileage rates: cars/vans 45p then 25p after 10,000 miles (55p/25p from 6 April 2026), motorbikes 24p. Not allowed for dual-control instructor cars or bicycles. The rate replaces all running costs; parking, tolls, platform fees, phone and licences are still claimed.
- Capital allowances on a car (actual method only): 100% for a new fully electric car, otherwise 18% (14% from April 2026) or 6% over 50g/km, × business use. Vans, motorbikes and bicycles bought are an expense under the cash basis.
- Working from home flat rate: £10 / £18 / £26 a month for 25–50 / 51–100 / 101+ hours.
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

## Android app (APK)

The app is wrapped with [Capacitor](https://capacitorjs.com). Every push to `main` runs
`.github/workflows/android.yml`, which builds a signed APK and publishes it as a GitHub Release.

- **Latest APK:** https://github.com/Md12Ali/Yearly-tax-return/releases/latest/download/tax-return-helper.apk
- Install: open the link on your Android phone, download, tap the file, and allow "Install unknown apps" when asked.
- In the app, the PDF/CSV buttons open the phone's share sheet (save to Files, Drive, email…).
- `android-signing/test-release.keystore` is a **test key only** (password `taxhelper-test`). Before Google Play,
  create your own private upload key, keep it out of the repo, and build an `.aab` with it.

Build locally (needs Android Studio): `npm install && npm run build && npx cap add android && npx cap open android`
