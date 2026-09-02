/* ==========================================================================
   utils.js — Shared configuration & helper functions
   Ledger — Smart Expense Tracker
   Exposes everything on the global `App` namespace so plain <script> tags
   (no bundler / module system required) can share state safely offline.
   ========================================================================== */

window.App = window.App || {};

App.CATEGORIES = {
  income: [
    { id: 'salary',       label: 'Salary',      icon: '💼' },
    { id: 'freelance',    label: 'Freelance',   icon: '🧾' },
    { id: 'gift',         label: 'Gift',        icon: '🎁' },
    { id: 'investment',   label: 'Investment',  icon: '📈' },
    { id: 'other_income', label: 'Other',       icon: '✨' },
  ],
  expense: [
    { id: 'food',          label: 'Food',      icon: '🍔' },
    { id: 'travel',        label: 'Travel',    icon: '🚗' },
    { id: 'study',         label: 'Study',     icon: '📚' },
    { id: 'shopping',      label: 'Shopping',  icon: '🛍️' },
    { id: 'bills',         label: 'Bills',     icon: '💡' },
    { id: 'health',        label: 'Health',    icon: '🩺' },
    { id: 'other_expense', label: 'Other',     icon: '🗂️' },
  ]
};

App.CAT_LOOKUP = {};
[...App.CATEGORIES.income, ...App.CATEGORIES.expense].forEach(c => App.CAT_LOOKUP[c.id] = c);

App.CHART_PALETTE = ['#B8873A', '#177350', '#B5432B', '#5B7CC9', '#8A5FC9', '#C9527D', '#3E9E8F'];

App.LIMITS = {
  MAX_AMOUNT: 10000000,       // ₹1 crore ceiling per entry
  MAX_NAME_LENGTH: 60,
  DUPLICATE_WINDOW_MS: 1200,  // block accidental double-submits
};

App.utils = {
  uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  fmt(n){
    const num = Number(n) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  todayISO(){
    return new Date().toISOString().slice(0, 10);
  },

  escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  },

  debounce(fn, wait){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  /** Animates a numeric text node from its current value to `to`. */
  animateNumber(el, to, opts = {}){
    const prefix = opts.prefix || '';
    const isCurrency = !!opts.currency;
    const duration = opts.duration || 500;
    const from = parseFloat((el.dataset.raw || '0'));
    const start = performance.now();

    function frame(now){
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const val = from + (to - from) * eased;
      el.textContent = isCurrency ? App.utils.fmt(val) : prefix + Math.round(val).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(frame);
      else el.dataset.raw = String(to);
    }
    el.dataset.raw = el.dataset.raw || '0';
    requestAnimationFrame(frame);
  },

  dateLabel(iso){
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  isSameMonth(iso, ref = new Date()){
    const d = new Date(iso);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  },

  isSameDay(iso, ref = new Date()){
    const d = new Date(iso);
    return d.toDateString() === ref.toDateString();
  },

  daysElapsedInMonth(ref = new Date()){
    return ref.getDate(); // 1-based day count so far this month
  },

  monthKey(iso){
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}`;
  },
};
