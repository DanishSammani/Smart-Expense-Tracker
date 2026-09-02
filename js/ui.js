/* ==========================================================================
   ui.js — DOM rendering functions
   Ledger — Smart Expense Tracker
   ========================================================================== */

window.App = window.App || {};

App.ui = {
  toastTimer: null,

  /* ============== Summary ticket ============== */
  renderSummary(transactions){
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    App.utils.animateNumber(document.getElementById('totalIncome'), totalIncome, { currency: true });
    App.utils.animateNumber(document.getElementById('totalExpense'), totalExpense, { currency: true });
    App.utils.animateNumber(document.getElementById('totalBalance'), balance, { currency: true });

    document.getElementById('incomeCount').textContent = `${income.length} ${income.length === 1 ? 'entry' : 'entries'}`;
    document.getElementById('expenseCount').textContent = `${expense.length} ${expense.length === 1 ? 'entry' : 'entries'}`;
    document.getElementById('balanceNote').textContent = balance >= 0 ? 'Healthy standing' : 'Overspent this period';

    return { totalIncome, totalExpense, balance };
  },

  /* ============== Dashboard mini stats ============== */
  renderMiniStats(transactions){
    const now = new Date();
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');

    const todayExpense = expenses.filter(t => App.utils.isSameDay(t.date, now)).reduce((s, t) => s + t.amount, 0);
    const monthExpenses = expenses.filter(t => App.utils.isSameMonth(t.date, now));
    const monthExpenseTotal = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const monthIncomeTotal = incomes.filter(t => App.utils.isSameMonth(t.date, now)).reduce((s, t) => s + t.amount, 0);

    // Highest expense category (all-time)
    const catTotals = {};
    expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    let topCat = null, topCatAmt = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => { if (amt > topCatAmt) { topCat = cat; topCatAmt = amt; } });

    const avgDaily = monthExpenseTotal / App.utils.daysElapsedInMonth(now);
    const savingsPct = monthIncomeTotal > 0 ? Math.max(0, ((monthIncomeTotal - monthExpenseTotal) / monthIncomeTotal) * 100) : 0;

    document.getElementById('miniToday').textContent = App.utils.fmt(todayExpense);
    document.getElementById('miniMonth').textContent = App.utils.fmt(monthExpenseTotal);
    document.getElementById('miniTopCategory').textContent = topCat ? (App.CAT_LOOKUP[topCat]?.label || topCat) : '—';
    document.getElementById('miniTopCategoryAmt').textContent = topCat ? App.utils.fmt(topCatAmt) : 'No expenses yet';
    document.getElementById('miniTxCount').textContent = String(transactions.length);
    document.getElementById('miniAvgDaily').textContent = App.utils.fmt(avgDaily || 0);
    document.getElementById('miniSavings').textContent = `${savingsPct.toFixed(0)}%`;

    return { monthExpenseTotal };
  },

  /* ============== Budget card + banner ============== */
  renderBudget(budget, monthExpenseTotal){
    const valueEl = document.getElementById('budgetValue');
    const fillEl = document.getElementById('budgetBarFill');
    const banner = document.getElementById('budgetBanner');
    const bannerText = document.getElementById('budgetBannerText');

    if (!budget || budget <= 0) {
      valueEl.innerHTML = `Not set <small>· tap edit</small>`;
      fillEl.style.width = '0%';
      fillEl.className = 'budget-bar-fill';
      banner.className = 'budget-banner';
      return;
    }

    const pct = Math.min(100, (monthExpenseTotal / budget) * 100);
    valueEl.innerHTML = `${App.utils.fmt(monthExpenseTotal)} <small>/ ${App.utils.fmt(budget)}</small>`;
    fillEl.style.width = `${pct}%`;

    fillEl.className = 'budget-bar-fill';
    banner.className = 'budget-banner';
    if (monthExpenseTotal >= budget) {
      fillEl.classList.add('danger');
      banner.classList.add('show', 'danger');
      bannerText.textContent = `You've exceeded your monthly budget of ${App.utils.fmt(budget)}. Consider reviewing recent expenses.`;
    } else if (pct >= 80) {
      fillEl.classList.add('warn');
      banner.classList.add('show');
      bannerText.textContent = `Heads up — you've used ${pct.toFixed(0)}% of your ${App.utils.fmt(budget)} monthly budget.`;
    }
  },

  /* ============== Form: category select ============== */
  populateCategorySelect(type){
    const sel = document.getElementById('txCategory');
    sel.innerHTML = App.CATEGORIES[type].map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
  },

  populateFilterCategory(){
    const sel = document.getElementById('filterCategory');
    const current = sel.value || 'all';
    const all = [...App.CATEGORIES.income, ...App.CATEGORIES.expense];
    sel.innerHTML = '<option value="all">All categories</option>' + all.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    sel.value = current;
  },

  populateYearFilter(transactions){
    const sel = document.getElementById('filterYear');
    const current = sel.value || 'all';
    const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);
    sel.innerHTML = '<option value="all">All years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    sel.value = years.includes(Number(current)) ? current : 'all';
  },

  populateNameSuggestions(transactions){
    const list = document.getElementById('txSuggestions');
    const names = Array.from(new Set(transactions.map(t => t.name))).slice(0, 30);
    list.innerHTML = names.map(n => `<option value="${App.utils.escapeHtml(n)}"></option>`).join('');
  },

  /* ============== Transaction list ============== */
  renderList(transactions, filters){
    let list = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    if (filters.type !== 'all') list = list.filter(t => t.type === filters.type);
    if (filters.category !== 'all') list = list.filter(t => t.category === filters.category);
    if (filters.dateFrom) list = list.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter(t => t.date <= filters.dateTo);
    if (filters.month !== 'all') list = list.filter(t => String(new Date(t.date).getMonth()) === filters.month);
    if (filters.year !== 'all') list = list.filter(t => String(new Date(t.date).getFullYear()) === filters.year);
    if (filters.amountMin !== '' && !isNaN(parseFloat(filters.amountMin))) list = list.filter(t => t.amount >= parseFloat(filters.amountMin));
    if (filters.amountMax !== '' && !isNaN(parseFloat(filters.amountMax))) list = list.filter(t => t.amount <= parseFloat(filters.amountMax));

    const container = document.getElementById('txList');
    const countEl = document.getElementById('resultsCount');
    countEl.textContent = `${list.length} ${list.length === 1 ? 'transaction' : 'transactions'} shown`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M8 15h5" stroke-linecap="round"/><circle cx="17" cy="4.5" r="2.5" fill="none"/>
          </svg>
          <p>No transactions match your filters yet.</p>
          <span>Try widening the date range or clearing a filter.</span>
        </div>`;
      return list;
    }

    container.innerHTML = list.map(t => {
      const c = App.CAT_LOOKUP[t.category] || { label: 'Other', icon: '🗂️' };
      const isIncome = t.type === 'income';
      const badgeBg = isIncome ? 'var(--income-soft)' : 'var(--expense-soft)';
      return `
        <div class="tx-row" data-id="${t.id}">
          <div class="tx-cat-badge" style="background:${badgeBg}">${c.icon}</div>
          <div class="tx-main">
            <p class="tx-name">${App.utils.escapeHtml(t.name)}</p>
            <p class="tx-meta">${c.label} · ${App.utils.dateLabel(t.date)}</p>
          </div>
          <div class="tx-amount ${t.type}">${isIncome ? '+' : '−'}${App.utils.fmt(t.amount)}</div>
          <div class="tx-row-actions">
            <button class="tx-icon-btn edit" title="Edit transaction" data-action="edit" data-id="${t.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linejoin="round"/></svg>
            </button>
            <button class="tx-icon-btn del" title="Delete transaction" data-action="delete" data-id="${t.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');

    return list;
  },

  /* ============== Recent activity widget ============== */
  renderRecentActivity(transactions){
    const el = document.getElementById('recentList');
    const list = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    if (list.length === 0) {
      el.innerHTML = `<p style="font-size:12px;color:var(--ink-faint);margin:0;">No activity yet.</p>`;
      return;
    }
    el.innerHTML = list.map(t => {
      const c = App.CAT_LOOKUP[t.category] || { label: 'Other', icon: '🗂️' };
      const isIncome = t.type === 'income';
      return `
        <div class="recent-row">
          <span class="rc-badge" style="background:${isIncome ? 'var(--income-soft)' : 'var(--expense-soft)'}">${c.icon}</span>
          <span class="rc-name">${App.utils.escapeHtml(t.name)}</span>
          <span class="rc-amt ${t.type}" style="color:${isIncome ? 'var(--income)' : 'var(--expense)'}">${isIncome ? '+' : '−'}${App.utils.fmt(t.amount)}</span>
        </div>`;
    }).join('');
  },

  /* ============== Form helpers ============== */
  clearFormErrors(){
    ['field-name', 'field-amount', 'field-date'].forEach(id => document.getElementById(id).classList.remove('invalid'));
  },

  showFormErrors(errors){
    this.clearFormErrors();
    if (errors.name) { document.getElementById('field-name').classList.add('invalid'); document.querySelector('#field-name .err').textContent = errors.name; }
    if (errors.amount) { document.getElementById('field-amount').classList.add('invalid'); document.querySelector('#field-amount .err').textContent = errors.amount; }
    if (errors.date) { document.getElementById('field-date').classList.add('invalid'); document.querySelector('#field-date .err').textContent = errors.date; }
  },

  setEditMode(isEditing, tx){
    const banner = document.getElementById('editBanner');
    const submitBtn = document.getElementById('submitBtnLabel');
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (isEditing) {
      banner.classList.add('show');
      document.getElementById('editBannerText').textContent = `Editing "${tx.name}"`;
      submitBtn.textContent = 'Update Transaction';
      cancelBtn.classList.add('show');
    } else {
      banner.classList.remove('show');
      submitBtn.textContent = 'Add Transaction';
      cancelBtn.classList.remove('show');
    }
  },

  /* ============== Toast ============== */
  showToast(msg){
    const el = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  },

  /* ============== Theme ============== */
  applyTheme(theme){
    document.body.setAttribute('data-theme', theme);
  },
};
