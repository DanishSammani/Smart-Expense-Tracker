/* ==========================================================================
   storage.js — LocalStorage persistence + Export / Backup / Restore
   Ledger — Smart Expense Tracker
   ========================================================================== */

window.App = window.App || {};

App.storage = {
  KEYS: {
    TRANSACTIONS: 'ledger_transactions_v2',
    THEME: 'ledger_theme_v1',
    BUDGET: 'ledger_monthly_budget_v1',
  },

  /* ---------------- Transactions ---------------- */
  loadTransactions(){
    try {
      const raw = localStorage.getItem(this.KEYS.TRANSACTIONS);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to seed data */ }
    const seed = this.seedData();
    this.saveTransactions(seed);
    return seed;
  },

  saveTransactions(list){
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(list));
  },

  seedData(){
    const { uid } = App.utils;
    const today = new Date();
    const d = off => { const t = new Date(today); t.setDate(t.getDate() - off); return t.toISOString().slice(0, 10); };
    return [
      { id: uid(), type: 'income',  name: 'Monthly Salary',     category: 'salary',   amount: 32000, date: d(2)  },
      { id: uid(), type: 'expense', name: 'Grocery run',        category: 'food',     amount: 1450,  date: d(1)  },
      { id: uid(), type: 'expense', name: 'Metro card recharge',category: 'travel',   amount: 500,   date: d(3)  },
      { id: uid(), type: 'expense', name: 'Online course',      category: 'study',    amount: 1999,  date: d(5)  },
      { id: uid(), type: 'expense', name: 'New headphones',     category: 'shopping', amount: 2299,  date: d(7)  },
      { id: uid(), type: 'income',  name: 'Logo design gig',    category: 'freelance',amount: 6000,  date: d(10) },
    ];
  },

  /* ---------------- Theme ---------------- */
  loadTheme(){ return localStorage.getItem(this.KEYS.THEME) || 'light'; },
  saveTheme(theme){ localStorage.setItem(this.KEYS.THEME, theme); },

  /* ---------------- Budget ---------------- */
  loadBudget(){
    const v = parseFloat(localStorage.getItem(this.KEYS.BUDGET));
    return isNaN(v) ? 0 : v;
  },
  saveBudget(amount){ localStorage.setItem(this.KEYS.BUDGET, String(amount)); },

  /* ---------------- CSV Export ---------------- */
  exportCSV(transactions){
    const header = ['Date', 'Type', 'Description', 'Category', 'Amount'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      App.CAT_LOOKUP[t.category]?.label || t.category,
      t.amount
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    this._download(csv, `ledger-transactions-${App.utils.todayISO()}.csv`, 'text/csv');
  },

  /* ---------------- JSON Backup / Restore ---------------- */
  exportJSON(transactions, budget){
    const payload = { version: 2, exportedAt: new Date().toISOString(), budget, transactions };
    this._download(JSON.stringify(payload, null, 2), `ledger-backup-${App.utils.todayISO()}.json`, 'application/json');
  },

  parseJSONBackup(text){
    const data = JSON.parse(text);
    if (Array.isArray(data)) return { transactions: data, budget: null };
    if (data && Array.isArray(data.transactions)) return { transactions: data.transactions, budget: data.budget ?? null };
    throw new Error('Unrecognized backup file format');
  },

  _download(content, filename, mime){
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /* ---------------- PDF Export (via jsPDF, loaded from CDN) ---------------- */
  exportPDF(transactions, summary){
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert('PDF library failed to load (check your internet connection). Try Export CSV instead.');
      return;
    }
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Ledger — Expense Report', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 25);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(`Total Income: ${App.utils.fmt(summary.totalIncome)}`, 14, 35);
    doc.text(`Total Expense: ${App.utils.fmt(summary.totalExpense)}`, 80, 35);
    doc.text(`Balance: ${App.utils.fmt(summary.balance)}`, 150, 35);

    const rows = transactions.map(t => [
      App.utils.dateLabel(t.date),
      t.type === 'income' ? 'Income' : 'Expense',
      t.name,
      App.CAT_LOOKUP[t.category]?.label || t.category,
      (t.type === 'income' ? '+' : '-') + App.utils.fmt(t.amount)
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
        body: rows,
        startY: 42,
        headStyles: { fillColor: [22, 25, 34] },
        styles: { fontSize: 9 },
      });
    } else {
      // Fallback: plain text list if autotable plugin isn't available
      let y = 45;
      rows.forEach(r => {
        doc.text(r.join('   |   '), 14, y);
        y += 6;
        if (y > 280) { doc.addPage(); y = 20; }
      });
    }

    doc.save(`ledger-report-${App.utils.todayISO()}.pdf`);
  },
};
