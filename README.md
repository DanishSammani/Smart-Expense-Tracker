# Ledger — Smart Expense Tracker

A professional, fully client-side expense tracker built for a Web Development Internship final submission. It demonstrates complete CRUD functionality, data persistence, form validation, responsive UI/UX design, and real-world features like budgeting, filtering, and data export — all without a backend server.

---

## 1. Project Overview

Most people lose track of spending simply because logging it is inconvenient. **Ledger** solves this with a lightweight, browser-based tool that makes recording income and expenses fast, visual, and habit-forming — no login, no server, no friction.

The interface uses a distinctive "financial ledger" visual identity: a serif display typeface, tabular monospace numerals for all currency figures, and a torn-ticket style summary strip, giving it a more considered look than a typical CRUD demo.

---

## 2. Features

### Core

* **Create** — Add income or expense transactions with description, amount, category, and date.
* **Read** — View all transactions in a searchable, filterable, sortable list.
* **Update** — Edit any existing transaction in place.
* **Delete** — Remove any transaction with a confirmation prompt.
* Auto-calculated **Total Income**, **Total Expense**, and **Current Balance**, updating live with no page reload.
* Categorization: Food, Travel, Study, Shopping, Bills, Health, Salary, Freelance, Gift, Investment, and more.
* Data persistence via the browser's **LocalStorage** — survives refresh and restart.

### Dashboard & Analytics

* Today's Expenses
* This Month's Expenses
* Highest Expense Category
* Total Transaction Count
* Average Daily Spend
* Monthly Savings Rate
* Category breakdown doughnut chart
* Six-month income vs. expense bar chart
* Recent Activity widget showing the latest five entries

### Budgeting

* Set a monthly budget with an editable inline control.
* Live progress bar as spending approaches the limit.
* Automatic warning banner at 80% of budget.
* Alert when the monthly budget is exceeded.

### Filtering & Search

* Free-text search across transaction descriptions.
* Quick filters for transaction type and category.
* Advanced filters:

  * Date range
  * Month
  * Year
  * Minimum amount
  * Maximum amount
* One-click **Reset Filters**.

### Data Portability

* **Export CSV** — Download all filtered transactions as a spreadsheet-ready file.
* **Export PDF** — Generate a formatted report with summary totals and a transaction table using jsPDF.
* **Print Report** — Clean, print-optimized layout.
* **Backup / Restore JSON** — Export the complete dataset, including budget, and restore it later.

### UX Details

* Form validation for required fields.
* Positive-number amount validation.
* Sensible maximum amount limit.
* 60-character description limit.
* No future transaction dates.
* Protection against accidental duplicate submissions.
* Loading state on startup.
* Friendly empty-state illustration.
* Subtle transaction row animations.
* Animated count-up for summary figures.
* Dark mode with saved preference.
* Fully responsive across mobile, tablet, laptop, and desktop.

---

## 3. Technologies Used

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Structure    | HTML5                                    |
| Styling      | CSS3 — Custom Properties, Grid, Flexbox  |
| Behavior     | Vanilla JavaScript ES6                   |
| Charts       | Hand-built inline SVG                    |
| PDF Export   | jsPDF + jsPDF-AutoTable via optional CDN |
| Data Storage | Browser `localStorage` API               |
| Fonts        | Fraunces, Inter, IBM Plex Mono           |

No build tools, bundlers, or backend server are required. The project can be opened directly through `index.html` in a modern browser.

> **Offline-first by design:** The category and monthly charts are generated as plain inline SVG from the application's own data. No external charting library is required. Core features such as adding, editing, deleting, filtering, budgeting, charts, CSV export, and JSON backup/restore work completely offline.
>
> Google Fonts and PDF export libraries are optional CDN dependencies. If Google Fonts are unavailable, the application falls back to system fonts. If the PDF libraries cannot be loaded, the application continues to work normally and CSV export remains available.

---

## 4. Folder Structure

```text
Smart-Expense-Tracker/
│
├── index.html
│
├── css/
│   ├── variables.css
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── utils.js
│   ├── storage.js
│   ├── validation.js
│   ├── charts.js
│   ├── ui.js
│   └── app.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   │   └── favicon.svg
│   └── logo/
│       └── logo.svg
│
├── README.md
│
└── presentation/
    └── Smart_Expense_Tracker_Presentation.pptx
```

### JavaScript Files

| File            | Responsibility                                                          |
| --------------- | ----------------------------------------------------------------------- |
| `utils.js`      | Shared configuration, categories, limits, and helper functions          |
| `storage.js`    | LocalStorage persistence and CSV/PDF/JSON export and restore            |
| `validation.js` | Form validation rules                                                   |
| `charts.js`     | Dependency-free inline SVG chart rendering                              |
| `ui.js`         | DOM rendering and UI updates                                            |
| `app.js`        | Application state, event wiring, CRUD orchestration, and initialization |

Scripts are loaded as standard `<script>` tags without an ES module system, so the project can run by simply opening `index.html`.

---

## 5. Installation & Usage

### Installation

No package installation is required.

Clone the repository:

```bash
git clone https://github.com/DanishSammani/Smart-Expense-Tracker.git
```

Then open the project folder.

### Running the Application

Open:

```text
index.html
```

in any modern browser such as:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari

No `npm install`, backend server, or build step is required.

### Basic Usage

* Use the **Add Transaction** form to log income or expenses.
* Click the **pencil icon** on any transaction to edit it.
* Click the **trash icon** to delete a transaction.
* Use the **search bar** to search transaction descriptions.
* Use the **type/category dropdowns** to filter transactions.
* Open **More Filters** for advanced filtering.
* Set a **Monthly Budget** from the dashboard.
* Use **Export CSV**, **Export PDF**, **Print Report**, or **Backup JSON** to manage your data.
* Toggle **dark mode** using the theme icon in the header.

---

## 6. Real-Life Uses

* **Individuals** — Track personal daily spending habits.
* **Students** — Manage limited pocket money across food, travel, and study expenses.
* **Freelancers** — Separate project income from recurring business expenses.
* **Small Businesses** — Log petty cash where a full accounting suite is unnecessary.
* **Households** — Monitor shared monthly bills, groceries, and utilities.

---

## 7. Advantages & Limitations

### Advantages

* No installation, login, or account required.
* Instant, real-time UI updates with zero page reloads.
* Clear categorization makes spending patterns easy to understand.
* Fully responsive across device sizes.
* Data remains under the user's control.
* Export and backup functionality available.
* Core functionality works offline.

### Limitations

* Data stays in one browser and does not automatically sync across devices.
* No user accounts or remote backup.
* Clearing browser storage can erase transaction history if no backup exists.
* Single-currency design.
* Single-user application.

---

## 8. Future Scope

The project can be extended with:

* **Node.js + Express + MongoDB** backend integration.
* User accounts and authentication.
* Cloud synchronization across devices.
* Receipt scanning using OCR.
* Automatic transaction categorization.
* Recurring transactions.
* Scheduled reminders.
* Multi-currency support.
* Advanced financial reports.
* Cloud-based data backup.

---

## 9. Presentation

A complete project presentation covering the introduction, workflow, features, real-life applications, advantages, limitations, and future scope is included in:

[`presentation/Smart_Expense_Tracker_Presentation.pptx`](./presentation/Smart_Expense_Tracker_Presentation.pptx)

---

## 10. Credits

Built as a **Web Development Internship final project** to demonstrate frontend engineering, UI/UX design, CRUD operations, client-side data persistence, data visualization, and browser-based data management.

---

## 👨‍💻 Author

**Md Danish Ali**

Computer Engineering
NIAMT, Ranchi

GitHub: [DanishSammani](https://github.com/DanishSammani/Smart-Expense-Tracker)

---

⭐ If you find this project useful, consider giving the repository a star.
