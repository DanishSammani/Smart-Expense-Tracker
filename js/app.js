/* ==========================================================================
   app.js — Application state, event wiring, and CRUD orchestration
   Ledger — Smart Expense Tracker
   ========================================================================== */

window.App = window.App || {};

App.state = {
  transactions: [],
  budget: 0,
  currentType: 'income',
  editingId: null,
  lastSubmitAt: 0,
};

/* ============================================================
   Init
============================================================ */
App.init = function () {
  App.ui.applyTheme(App.storage.loadTheme());
  App.state.transactions = App.storage.loadTransactions();
  App.state.budget = App.storage.loadBudget();

  App.ui.populateCategorySelect(App.state.currentType);
  document.getElementById('txDate').value = App.utils.todayISO();
  document.getElementById('txDate').max = App.utils.todayISO(); // prevent future dates at the picker level
  document.getElementById('todayChip').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  App.bindEvents();

  try {
    App.refreshAll();
  } catch (err) {
    console.error('Ledger: non-fatal error during initial render —', err);
  }

  // Simulate a brief, honest loading state so the spinner/empty-state UX is real, not decorative.
  setTimeout(() => {
    document.getElementById('loadingOverlay').classList.add('hidden');
  }, 450);
};

/* ============================================================
   Derived refresh — re-renders every part of the UI from state
============================================================ */
App.refreshAll = function () {
  const { transactions, budget } = App.state;

  App.ui.populateFilterCategory();
  App.ui.populateYearFilter(transactions);
  App.ui.populateNameSuggestions(transactions);

  App.ui.renderSummary(transactions);
  const { monthExpenseTotal } = App.ui.renderMiniStats(transactions);
  App.ui.renderBudget(budget, monthExpenseTotal);
  App.ui.renderRecentActivity(transactions);
  App.charts.renderAll(transactions);
  App.ui.renderList(transactions, App.getFilters());
};

App.getFilters = function () {
  return {
    search: document.getElementById('searchInput').value.trim(),
    type: document.getElementById('filterType').value,
    category: document.getElementById('filterCategory').value,
    dateFrom: document.getElementById('filterDateFrom').value,
    dateTo: document.getElementById('filterDateTo').value,
    month: document.getElementById('filterMonth').value,
    year: document.getElementById('filterYear').value,
    amountMin: document.getElementById('filterAmountMin').value,
    amountMax: document.getElementById('filterAmountMax').value,
  };
};

/* ============================================================
   Event binding
============================================================ */
App.bindEvents = function () {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    App.ui.applyTheme(next);
    App.storage.saveTheme(next);
    App.charts.renderAll(App.state.transactions); // re-theme chart colors/gridlines
  });

  // Type toggle (income / expense) in the add/edit form
  document.querySelectorAll('.type-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      App.state.currentType = btn.dataset.type;
      App.ui.populateCategorySelect(App.state.currentType);
    });
  });

  // Form submit (handles both Add and Update)
  document.getElementById('txForm').addEventListener('submit', App.handleFormSubmit);
  document.getElementById('cancelEditBtn').addEventListener('click', App.cancelEdit);

  // Live character counter on description
  const nameInput = document.getElementById('txName');
  nameInput.addEventListener('input', () => {
    document.getElementById('charCount').textContent = `${nameInput.value.length}/${App.LIMITS.MAX_NAME_LENGTH}`;
  });

  // Transaction list — delegated edit/delete clicks
  document.getElementById('txList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete') App.deleteTransaction(id);
    if (btn.dataset.action === 'edit') App.startEdit(id);
  });

  // Search + filters
  const rerender = App.utils.debounce(() => App.ui.renderList(App.state.transactions, App.getFilters()), 150);
  document.getElementById('searchInput').addEventListener('input', rerender);
  ['filterType', 'filterCategory', 'filterDateFrom', 'filterDateTo', 'filterMonth', 'filterYear', 'filterAmountMin', 'filterAmountMax']
    .forEach(id => document.getElementById(id).addEventListener('change', rerender));

  document.getElementById('filtersToggleBtn').addEventListener('click', () => {
    document.getElementById('filtersPanel').classList.toggle('show');
  });
  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    ['filterDateFrom', 'filterDateTo', 'filterAmountMin', 'filterAmountMax'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('filterMonth').value = 'all';
    document.getElementById('filterYear').value = 'all';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('searchInput').value = '';
    App.ui.renderList(App.state.transactions, App.getFilters());
  });

  // Budget edit
  document.getElementById('budgetEditBtn').addEventListener('click', () => {
    document.getElementById('budgetEditRow').classList.toggle('show');
    document.getElementById('budgetInput').value = App.state.budget || '';
    document.getElementById('budgetInput').focus();
  });
  document.getElementById('budgetSaveBtn').addEventListener('click', App.saveBudget);
  document.getElementById('budgetInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') App.saveBudget(); });
  document.getElementById('budgetCancelBtn').addEventListener('click', () => {
    document.getElementById('budgetEditRow').classList.remove('show');
  });

  // Data actions: export / backup / restore / print
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    App.storage.exportCSV(App.ui.renderList(App.state.transactions, App.getFilters()));
    App.ui.showToast('CSV export started');
  });
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const summary = App.ui.renderSummary(App.state.transactions);
    App.storage.exportPDF(App.ui.renderList(App.state.transactions, App.getFilters()), summary);
    App.ui.showToast('PDF export started');
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('backupBtn').addEventListener('click', () => {
    App.storage.exportJSON(App.state.transactions, App.state.budget);
    App.ui.showToast('Backup downloaded');
  });
  document.getElementById('restoreInput').addEventListener('change', App.handleRestore);
};

/* ============================================================
   CRUD
============================================================ */
App.handleFormSubmit = function (e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById('txName').value.trim(),
    amountRaw: document.getElementById('txAmount').value,
    date: document.getElementById('txDate').value,
  };
  const { valid, errors } = App.validation.validateTransactionForm(payload);
  if (!valid) { App.ui.showFormErrors(errors); return; }
  App.ui.clearFormErrors();

  // Guard accidental double-submits (double-click / double-Enter) of a *valid* entry only —
  // it must never silently swallow a genuine validation attempt.
  if (App.validation.isDuplicateSubmission(App.state.lastSubmitAt)) return;
  App.state.lastSubmitAt = Date.now();

  const amount = parseFloat(payload.amountRaw);
  const category = document.getElementById('txCategory').value;

  if (App.state.editingId) {
    const idx = App.state.transactions.findIndex(t => t.id === App.state.editingId);
    if (idx !== -1) {
      App.state.transactions[idx] = { ...App.state.transactions[idx], type: App.state.currentType, name: payload.name, category, amount, date: payload.date };
    }
    App.storage.saveTransactions(App.state.transactions);
    App.ui.showToast('Transaction updated');
    App.cancelEdit();
  } else {
    App.state.transactions.unshift({ id: App.utils.uid(), type: App.state.currentType, name: payload.name, category, amount, date: payload.date });
    App.storage.saveTransactions(App.state.transactions);
    App.ui.showToast(`${App.state.currentType === 'income' ? 'Income' : 'Expense'} added successfully`);
    document.getElementById('txForm').reset();
    document.getElementById('txDate').value = App.utils.todayISO();
    document.getElementById('charCount').textContent = `0/${App.LIMITS.MAX_NAME_LENGTH}`;
  }

  App.refreshAll();
};

App.deleteTransaction = function (id) {
  const tx = App.state.transactions.find(t => t.id === id);
  if (!tx) return;
  if (!confirm(`Delete "${tx.name}"? This cannot be undone.`)) return;
  App.state.transactions = App.state.transactions.filter(t => t.id !== id);
  App.storage.saveTransactions(App.state.transactions);
  if (App.state.editingId === id) App.cancelEdit();
  App.ui.showToast('Transaction deleted');
  App.refreshAll();
};

App.startEdit = function (id) {
  const tx = App.state.transactions.find(t => t.id === id);
  if (!tx) return;
  App.state.editingId = id;
  App.state.currentType = tx.type;

  document.querySelectorAll('.type-toggle button').forEach(b => b.classList.toggle('active', b.dataset.type === tx.type));
  App.ui.populateCategorySelect(tx.type);
  document.getElementById('txName').value = tx.name;
  document.getElementById('txAmount').value = tx.amount;
  document.getElementById('txCategory').value = tx.category;
  document.getElementById('txDate').value = tx.date;
  document.getElementById('charCount').textContent = `${tx.name.length}/${App.LIMITS.MAX_NAME_LENGTH}`;

  App.ui.setEditMode(true, tx);
  document.getElementById('txForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('txName').focus();
};

App.cancelEdit = function () {
  App.state.editingId = null;
  document.getElementById('txForm').reset();
  document.getElementById('txDate').value = App.utils.todayISO();
  document.getElementById('charCount').textContent = `0/${App.LIMITS.MAX_NAME_LENGTH}`;
  App.ui.setEditMode(false, {});
  App.ui.clearFormErrors();
};

/* ============================================================
   Budget
============================================================ */
App.saveBudget = function () {
  const raw = document.getElementById('budgetInput').value;
  const result = App.validation.validateBudget(raw);
  if (!result.valid) { App.ui.showToast(result.message); return; }
  App.state.budget = result.amount;
  App.storage.saveBudget(result.amount);
  document.getElementById('budgetEditRow').classList.remove('show');
  App.ui.showToast('Monthly budget updated');
  App.refreshAll();
};

/* ============================================================
   Backup / Restore
============================================================ */
App.handleRestore = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { transactions, budget } = App.storage.parseJSONBackup(reader.result);
      if (!confirm(`Import ${transactions.length} transactions? This will replace your current data.`)) return;
      App.state.transactions = transactions;
      if (budget != null) App.state.budget = budget;
      App.storage.saveTransactions(App.state.transactions);
      App.storage.saveBudget(App.state.budget);
      App.ui.showToast('Backup restored successfully');
      App.refreshAll();
    } catch (err) {
      App.ui.showToast('Restore failed — invalid backup file');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // allow re-selecting the same file later
};

document.addEventListener('DOMContentLoaded', App.init);
