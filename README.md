# Tax Return Helper 🇬🇧

**HMRC Self Assessment helper for self-employed drivers — and anyone self-employed.**
Track income and expenses every day, compare the mileage rate against actual costs, see your
Income Tax and National Insurance, and get box-by-box figures to copy into your GOV.UK tax return.
Available in **English** and **বাংলা (Bengali)**, as a website and an Android app.

| | |
| --- | --- |
| 🌐 **Website** | https://yearly-tax-return.onrender.com |
| 📱 **Android app (APK)** | https://github.com/Md12Ali/Yearly-tax-return/releases/latest/download/tax-return-helper.apk |

Built for people who are self-employed as a:

- 🚗 **Driving instructor** (including trainees / PDIs) — EZ Licence, cash, bank transfers, driving school payments
- 🚕 **Private hire driver** — Uber, Bolt, FREE NOW, minicab offices
- 🛵 **Food & parcel delivery driver** — Deliveroo, Uber Eats, Just Eat, Amazon Flex, other couriers
- 💼 **Any other self-employment** — web design, cleaning, tutoring… you name it

> ⚠️ This is a guide, not professional tax advice. Estimates use HMRC rates for England, Wales and
> Northern Ireland and assume self-employment is your only income. Check GOV.UK or an accountant if unsure.

---

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Daily routine](#daily-routine)
- [At tax return time](#at-tax-return-time)
- [How the numbers work](#how-the-numbers-work)
- [Your data and privacy](#your-data-and-privacy)
- [For developers](#for-developers)
- [Android app](#android-app)
- [Updating for a new tax year](#updating-for-a-new-tax-year)
- [Sources](#sources)

---

## Features

### 📊 Dashboard
- Estimated **tax & NI** for the year, how much to **set aside each month**, and your effective rate
- **Deadline countdown** and key dates (registration, paper and online deadlines, payments on account)
- **This month**: income, expenses and miles you logged, with recent entries
- Income and profit **by business**
- **Making Tax Digital** warning when your turnover passes the threshold
- **Backup & restore**, with a reminder if you haven't backed up for 14 days

### ⚡ Quick add (every screen)
- A floating **＋ Add** button to log **income**, an **expense** or **business miles** in a few taps
- Entries are saved in the **correct tax year from their date** (6 April – 5 April)
- Remembers your last item; "Save & add another" for busy days

### 💰 Income & Expenses
- **30+ income sources** and **60+ expense types**, grouped by job, each with a help tip and its **SA103S box**
- **Your own items**: add any income or expense with your own name and choose its box
- **Vehicles**: car, dual-control car, van, motorbike/moped, bicycle — each with its own:
  - business miles per job and total miles (business-use % worked out for you)
  - running costs (fuel, insurance, repairs, tyres, lease/PCO rental, finance interest, tax/MOT, TfL licence…)
  - **actual costs vs mileage rate**, compared and recommended per vehicle
  - **capital allowances** if you bought a car
- **Working from home** flat rate (£10 / £18 / £26 a month)
- **"What can I claim here?"** guide on every job: how to report it to HMRC, what counts as income, and what is allowed / not allowed

### 🧮 Tax Calculator
- Gross income → expenses → net profit → Personal Allowance → taxable profit, step by step
- **Income Tax** (20% / 40% / 45%), **Class 4 NI** (6% / 2%), **Class 2 NI** (with optional voluntary payments)
- **Payments on account**: what to pay by 31 January and 31 July
- **SA103S figures** for each business with one-tap **copy** buttons
- **PDF and CSV** summary to download or share

### 📜 HMRC Guide
- 6 illustrated steps: sign in and find your UTR → choose SA103S → income (Box 9) → expenses (Box 20) → check and submit → pay with NatWest or Revolut
- **What can I claim?** for each job, with boxes and whether the mileage rate already covers it
- Gross vs net explained, records checklist (keep for 5+ years)

### 🌍 Everywhere
- English / বাংলা switch, light / dark theme
- Mobile-first, works offline, installable from the browser
- Tax years **2024/25, 2025/26 and 2026/27**

---

## Getting started

### On the website
1. Open **https://yearly-tax-return.onrender.com**.
2. Optional: install it — in Chrome tap **⋮ → Install app** (or **Add to Home screen**). It then opens like an app and works offline.

### On Android (APK)
1. On your phone, open the **Android app (APK)** link at the top of this page.
2. Tap the downloaded file. If asked, allow **"Install unknown apps"** for your browser or Files app.
3. Tap **Install**. "Tax Return Helper" appears with the green £ icon.
4. New versions install over the old one and keep your data.

### First-time setup (5 minutes)
1. Pick the **tax year** at the top (2025/26 is the return due 31 January 2027).
2. **Income & Expenses → ⛽ Your vehicles**: set up each vehicle, what it's used for, and its total miles.
   - Teaching in a **dual-control car**? Add it as *Dual-control car* — HMRC doesn't allow the mileage rate for it.
3. Enter any yearly totals you already have (from Uber/Bolt tax summaries, EZ Licence reports, receipts).
4. **Dashboard → Back up now** and save the file somewhere safe (e.g. Google Drive).

---

## Daily routine

| When | What to do |
| --- | --- |
| After each shift or lesson day | **＋ Add → Income** for each platform/pupil payment, **＋ Add → Miles** for business miles |
| When you pay for something | **＋ Add → Expense** (fuel, parking, Congestion Charge, licence, phone…) and keep the receipt |
| Every week or two | **Dashboard → Back up now** |
| Each month | Check **This month** on the Dashboard |
| 6 April | Write down your odometer reading (start of the tax year) |
| 5 April | Write down your odometer reading again (end of the tax year) |

---

## At tax return time

1. Choose the tax year at the top.
2. Download each platform's **annual tax summary** and check the income figures match.
3. Enter **total miles** for each vehicle (odometer 5 April − odometer 6 April).
4. **Tax Calculator**: tap **Use the best method for each vehicle** if it suggests a saving.
5. Follow the **HMRC Guide** tab step by step, copying the **SA103S** figures for each business.
6. Compare HMRC's calculation with the app's, submit, and pay by **31 January**.
7. Download the **PDF summary** and keep it with your records.

---

## How the numbers work

**Income Tax and National Insurance** (England, Wales and Northern Ireland)
- Personal Allowance £12,570, reduced by £1 for every £2 of profit over £100,000
- 20% on the first £37,700 of taxable profit, 40% up to £125,140, 45% above
- Class 4 NI: 6% on profits £12,570–£50,270, 2% above
- Class 2 NI: treated as paid when profits are at least the small profits threshold (£6,845 for 2024/25 and 2025/26, £7,105 for 2026/27); voluntary below it (£3.45 / £3.50 / £3.65 a week)
- Payments on account: when the bill (Income Tax + Class 4) is over £1,000, two advance payments of half each

**Businesses and boxes**
- Each job is its own self-employment with its own **SA103S** page; tax is worked out on all profits together
- Income is rounded **down** and expenses **up** to whole pounds, as HMRC allows
- Shared costs (phone, accountant, home) are split between businesses by income
- Turnover of £90,000 or more needs the full SA103F pages

**Vehicles**
- Business use = business miles ÷ total miles; running costs are cut to that share and split between jobs by miles
- Mileage rates (per vehicle): cars and vans **45p** for the first 10,000 business miles then **25p** (from 6 April 2026: **55p** then 25p); motorbikes **24p**
- No mileage rate for **dual-control instructor cars** or **bicycles** — actual costs only
- The mileage rate replaces all running costs; parking, tolls, Congestion Charge, platform fees, phone and licences are still claimed
- Once you use the mileage rate for a vehicle, you must keep using it for that vehicle
- Buying a car (actual costs only): **capital allowances** — 100% for a new fully electric car; otherwise 18% a year (14% from April 2026), or 6% if over 50g/km CO₂ — × business use
- Vans, motorbikes and bicycles bought for work are an expense under the cash basis

**Making Tax Digital for Income Tax**
- Turnover over £50,000 (2024/25) → quarterly updates from April 2026
- Over £30,000 (2025/26) → from April 2027; over £20,000 (2026/27) → from April 2028

---

## Your data and privacy

- Everything you enter stays **on your device** (browser storage or inside the app). Nothing is sent to a server, and there are no accounts or tracking.
- The website and the Android app keep **separate** data. Move between them with a backup file.
- Uninstalling the app or clearing browser data deletes your figures — **use Backup & restore regularly**.
- A backup is a plain `.json` file. Anyone with the file can read your figures, so store it privately.

---

## For developers

**Tech stack:** React 19 · Vite 7 · Tailwind CSS 4 · pdf-lib · Capacitor 7 (Android) · LocalStorage. No backend.

```bash
npm install        # install dependencies
npm run dev        # local development server
npm test           # tax engine tests (Node's built-in test runner)
npm run build      # production build into dist/
npm run preview    # preview the production build
```

### Project structure

```
src/
  data/
    taxYears.js      HMRC rates, thresholds and dates for each tax year
    fields.js        every income / expense / vehicle input and its SA103S box
    claimGuide.js    allowed / not allowed items per job
  lib/
    taxEngine.js     all calculations (businesses, vehicles, tax, NI, payments on account)
    store.js         saved data, backup / restore, migrations
    dates.js         UK date and tax-year helpers
    exportData.js    PDF and CSV export (share sheet in the Android app)
  i18n/              English and Bengali text (en.js, bn.js, fields.*.js, guide.*.js)
  components/        UI parts, quick add, claim guide, dashboard cards
  pages/             Dashboard, IncomeExpenses, TaxCalculator, HmrcGuide
public/              icons, web manifest, offline service worker
assets/              source images for the Android icon and splash screen
tests/               taxEngine.test.js
.github/workflows/   android.yml — builds the APK
```

### Deploy the website (Render, free)
1. On [render.com](https://render.com): **New → Static Site** → pick this repo
   (or **New → Blueprint**, which reads `render.yaml`).
2. Build command `npm install && npm run build`, publish directory `dist`, environment variable `NODE_VERSION=22`.
3. If pushes stop triggering deploys (e.g. after renaming the repo), reconnect the repository in the site's **Settings** on Render, or use **Manual Deploy**.

---

## Android app

The web app is wrapped with [Capacitor](https://capacitorjs.com).

- Every push to `main` runs `.github/workflows/android.yml`, which tests, builds and signs the APK and publishes it as a **GitHub Release** (`apk-1.0.<build number>`).
- In the app, PDF/CSV/backup buttons open the Android **share sheet** (save to Files, Drive, email, WhatsApp…).
- Build locally (needs Android Studio):
  ```bash
  npm install && npm run build
  npx cap add android && npx cap sync android
  npx cap open android
  ```

### Before publishing on Google Play
`android-signing/test-release.keystore` is a **test key only** (its password is in the workflow). Do **not** use it for Google Play. To publish:
1. Create your own private upload key with `keytool` and keep it **out of the repo**.
2. Store the key and passwords in **GitHub Secrets** and change the workflow to use them.
3. Build an Android App Bundle (`./gradlew bundleRelease`) and upload the `.aab` to the Play Console.
4. Add a privacy policy page, store listing text and screenshots, and complete the data-safety form (the app stores data only on the device).

---

## Updating for a new tax year

1. Add the year to `src/data/taxYears.js` (allowances, NI thresholds, Class 2 rate, mileage and capital allowance rates, deadlines, Making Tax Digital threshold).
2. Check the **SA103S notes** for that year for any box changes.
3. Add a test in `tests/taxEngine.test.js` and run `npm test`.
4. Push — the website (after deploy) and a new APK update automatically.

---

## Sources

- [Income Tax rates and allowances](https://www.gov.uk/income-tax-rates)
- [Self-employed National Insurance rates](https://www.gov.uk/self-employed-national-insurance-rates)
- [SA103S notes 2025–26](https://assets.publishing.service.gov.uk/media/69ce15395cf899414a0bc69f/SA103S_Notes_2026.pdf)
- [Simplified expenses: vehicles](https://www.gov.uk/simpler-income-tax-simplified-expenses/vehicles) · [working from home](https://www.gov.uk/simpler-income-tax-simplified-expenses/working-from-home)
- [Expenses if you're self-employed](https://www.gov.uk/expenses-if-youre-self-employed)
- [Pay your Self Assessment tax bill](https://www.gov.uk/pay-self-assessment-tax-bill) · [HMRC bank details](https://www.gov.uk/pay-self-assessment-tax-bill/bank-details)
- [Making Tax Digital for Income Tax — who it applies to (LITRG)](https://www.litrg.org.uk/tax-nic/making-tax-digital-income-tax/who-does-making-tax-digital-apply)
- [TfL taxi and private hire licence fees](https://content.tfl.gov.uk/05-26-taxi-and-private-hire-licence-fees.pdf) · [Congestion Charge changes for PHVs](https://content.tfl.gov.uk/02-26-tph-notice-changes-to-the-congestion-charge-scheme.pdf)
