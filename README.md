# Ledger — Smart Expense Tracker

A professional, fully client-side expense tracker built for a Web Development Internship final submission. It demonstrates complete CRUD functionality, data persistence, form validation, responsive UI/UX design, and real-world features like budgeting, filtering, and data export — all without a backend server.

---

## 1. Project Overview

Most people lose track of spending simply because logging it is inconvenient. **Ledger** solves this with a lightweight, browser-based tool that makes recording income and expenses fast, visual, and habit-forming — no login, no server, no friction.

The interface uses a distinctive "financial ledger" visual identity: a serif display typeface, tabular monospace numerals for all currency figures, and a torn-ticket style summary strip, giving it a more considered look than a typical CRUD demo.

---

## 2. Features

### Core
- **Create** — Add income or expense transactions with description, amount, category, and date.
- **Read** — View all transactions in a searchable, filterable, sortable list.
- **Update** — Edit any existing transaction in place (form switches to "Update" mode).
- **Delete** — Remove any transaction with a confirmation prompt.
- Auto-calculated **Total Income**, **Total Expense**, and **Current Balance**, updating live with no page reload.
- Categorization: Food, Travel, Study, Shopping, Bills, Health, Salary, Freelance, Gift, Investment, and more.
- Data persistence via the browser's **LocalStorage** — survives refresh and restart.

### Dashboard & Analytics
- Today's Expenses, This Month's Expenses, Highest Expense Category, Total Transaction Count, Average Daily Spend, and Monthly Savings Rate.
- Category breakdown doughnut chart and a 6-month income vs. expense bar chart (Chart.js).
- Recent Activity widget showing the latest 5 entries at a glance.

### Budgeting
- Set a monthly budget with an editable inline control.
- Live progress bar (green → amber → red) as spending approaches the limit.
- Automatic warning banner at 80% of budget and an alert when it's exceeded.

### Filtering & Search
- Free-text search across transaction descriptions.
- Quick filters: transaction type (income/expense) and category.
- Advanced filter panel: date range (from/to), month, year, and amount range (min/max).
- One-click "Reset Filters."

### Data Portability
- **Export CSV** — download all (filtered) transactions as a spreadsheet-ready file.
- **Export PDF** — generate a formatted report with summary totals and a transaction table (via jsPDF).
- **Print Report** — clean, print-optimized layout (hides interactive controls).
- **Backup / Restore (JSON)** — export your full dataset (including budget) and re-import it later or on another device.

### UX Details
- Form validation: required fields, positive-number amounts, a sensible maximum amount, a 60-character description limit, no future dates, and a guard against accidental duplicate double-submits.
- Loading state on startup and a friendly empty-state illustration when filters return nothing.
- Subtle row-entry animation and animated count-up on summary figures.
- Dark mode toggle with the preference remembered across sessions.
- Fully responsive across mobile, tablet, laptop, and desktop breakpoints.

---

## 3. Technologies Used

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Structure      | HTML5                                         |
| Styling        | CSS3 (custom properties / design tokens, Grid, Flexbox) |
| Behavior       | Vanilla JavaScript (ES6, no framework/build step) |
| Charts         | Hand-built inline SVG (no external chart library — always renders, works fully offline) |
| PDF export     | [jsPDF](https://github.com/parallax/jsPDF) + jsPDF-AutoTable (via CDN, optional) |
| Data storage   | Browser `localStorage` API                    |
| Fonts          | Fraunces, Inter, IBM Plex Mono (Google Fonts, optional — falls back to system fonts offline) |

No build tools, bundlers, or backend server are required — open `index.html` directly in any modern browser.

> **Offline-first by design:** the category and monthly charts are generated as plain inline SVG from your own data — no external charting library, no CDN, no internet required. Only two things are CDN-dependent and strictly optional: Google Fonts (falls back to system fonts) and the **Export PDF** button (falls back to a clear message directing you to Export CSV instead if it can't load). Every core feature — add/edit/delete, filters, budget, charts, CSV export, backup/restore — works completely offline.

---

## 4. Folder Structure

```
Smart-Expense-Tracker/
│
├── index.html                # Single entry point — all markup
├── css/
│   ├── variables.css         # Design tokens: colors, type, radius, shadow (light + dark theme)
│   ├── style.css             # Core layout & component styles
│   └── responsive.css        # Breakpoints: mobile / tablet / laptop / desktop + print styles
├── js/
│   ├── utils.js               # Shared config (categories, limits) & helper functions
│   ├── storage.js             # LocalStorage persistence + CSV/PDF/JSON export & restore
│   ├── validation.js          # Form validation rules
│   ├── charts.js              # Dependency-free inline SVG chart rendering (category + monthly)
│   ├── ui.js                  # All DOM rendering functions
│   └── app.js                 # State, event wiring, CRUD orchestration, init
├── assets/
│   ├── images/                # Reserved for future use (e.g. onboarding graphics)
│   ├── icons/
│   │   └── favicon.svg
│   └── logo/
│       └── logo.svg
├── README.md
└── presentation/
    └── Smart_Expense_Tracker_Presentation.pptx
```

Scripts are loaded as plain `<script>` tags (no ES module system), so the project runs by simply double-clicking `index.html` — no local server required.

---

## 5. Installation & Usage

1. Download or clone this project folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. That's it — no `npm install`, no server, no build step.

### Basic usage
- Use the **Add Transaction** form to log income or expenses.
- Click the **pencil icon** on any row to edit it, or the **trash icon** to delete it.
- Use the **search bar**, **type/category dropdowns**, or **More Filters** panel to narrow the transaction list.
- Set a **Monthly Budget** from its card in the dashboard row to get spending warnings.
- Use **Export CSV / Export PDF / Print Report / Backup JSON** to take your data with you.
- Toggle **dark mode** from the sun/moon icon in the header.

---

## 6. Real-Life Uses

- **Individuals** tracking personal daily spending habits.
- **Students** managing limited pocket money across food, travel, and study costs.
- **Freelancers** separating project income from recurring business expenses.
- **Small businesses** logging petty cash where a full accounting suite is overkill.
- **Households** monitoring shared monthly bills, groceries, and utilities.

---

## 7. Advantages & Limitations

**Advantages**
- No installation, login, or account required.
- Instant, real-time UI updates with zero page reloads.
- Clean categorization makes spending patterns obvious at a glance.
- Fully responsive — usable on any device size.
- Own your data: export/backup any time, no vendor lock-in.

**Limitations**
- Data stays on one browser — no automatic cross-device sync (mitigated by manual JSON backup/restore).
- No user accounts, so there's no remote backup unless you export manually.
- Clearing browser storage erases transaction history if no backup was taken.
- Single-currency, single-user by design.

---

## 8. Future Scope

- Migrate storage to a **Node.js + Express + MongoDB** backend for durable, queryable, multi-device data.
- **User accounts & authentication** for private, synced ledgers.
- **Cloud sync** across phone, tablet, and desktop.
- **Receipt scanning (OCR)** to auto-fill amount and category from a photo.
- Recurring transactions and scheduled reminders.
- Multi-currency support.

---

## 9. Presentation

A full project presentation covering the introduction, workflow, features, real-life uses, advantages/disadvantages, and future scope is included in [`presentation/Smart_Expense_Tracker_Presentation.pptx`](./presentation/Smart_Expense_Tracker_Presentation.pptx).

---

## 10. Credits

Built as a Web Development Internship final project to demonstrate frontend engineering, UI/UX design, and client-side data handling skills.
#   S m a r t - E x p e n s e - T r a c k e r  
 