/* ==========================================================================
   charts.js — Hand-built, dependency-free SVG chart rendering
   Ledger — Smart Expense Tracker

   Deliberately does NOT depend on any external charting library / CDN.
   An earlier version used Chart.js from a CDN, which left both chart
   panels permanently blank on any offline machine, restricted network,
   or ad-blocker — a bad look for a "professional" dashboard. These are
   plain inline SVG, generated from the same data, so they always render.
   ========================================================================== */

window.App = window.App || {};

App.charts = {
  themeColor(varName, fallback){
    const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
    return v || fallback;
  },

  /* ============== Category doughnut (expenses) ============== */
  renderCategoryChart(transactions){
    const wrap = document.getElementById('categoryChart');
    const emptyEl = document.getElementById('categoryEmpty');
    const legendEl = document.getElementById('categoryLegend');
    if (!wrap) return;

    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
      wrap.style.display = 'none';
      emptyEl.style.display = 'flex';
      emptyEl.textContent = 'Add expenses to see the breakdown';
      legendEl.innerHTML = '';
      return;
    }
    wrap.style.display = 'block';
    emptyEl.style.display = 'none';

    const totals = {};
    expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const labels = Object.keys(totals);
    const values = labels.map(l => totals[l]);
    const colors = labels.map((_, i) => App.CHART_PALETTE[i % App.CHART_PALETTE.length]);
    const total = values.reduce((a, b) => a + b, 0);

    const size = 200, cx = size / 2, cy = size / 2, r = 72, strokeW = 30;
    const circumference = 2 * Math.PI * r;
    const bg = this.themeColor('--paper-alt', '#E4E6EC');
    const ink = this.themeColor('--ink', '#161922');
    const faint = this.themeColor('--ink-faint', '#8A90A0');
    const card = this.themeColor('--card', '#FFFFFF');

    let cumulative = 0;
    const segments = labels.map((l, i) => {
      const frac = values[i] / total;
      const dash = Math.max(frac * circumference - 1.5, 0); // small gap between segments
      const circle = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="${strokeW}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-cumulative}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"><title>${App.utils.escapeHtml(App.CAT_LOOKUP[l]?.label || l)}: ${App.utils.fmt(values[i])}</title></circle>`;
      cumulative += frac * circumference;
      return circle;
    }).join('');

    wrap.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" width="100%" height="200" role="img" aria-label="Expense breakdown by category">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${bg}" stroke-width="${strokeW}"/>
        ${segments}
        <circle cx="${cx}" cy="${cy}" r="${r - strokeW / 2 - 3}" fill="${card}"/>
        <text x="${cx}" y="${cy - 3}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="15" font-weight="600" fill="${ink}">${App.utils.fmt(total)}</text>
        <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" letter-spacing="1" fill="${faint}">TOTAL SPENT</text>
      </svg>`;

    legendEl.innerHTML = labels.map((l, i) => `
      <li>
        <span class="lg-left"><span class="legend-swatch" style="background:${colors[i]}"></span>${App.utils.escapeHtml(App.CAT_LOOKUP[l]?.label || l)}</span>
        <span class="amt">${App.utils.fmt(totals[l])} · ${Math.round(totals[l] / total * 100)}%</span>
      </li>`).join('');
  },

  /* ============== Monthly income vs. expense bar chart ============== */
  renderMonthlyChart(transactions){
    const wrap = document.getElementById('monthlyChart');
    if (!wrap) return;

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), income: 0, expense: 0 });
    }
    transactions.forEach(t => {
      const key = App.utils.monthKey(t.date);
      const m = months.find(m => m.key === key);
      if (m) { if (t.type === 'income') m.income += t.amount; else m.expense += t.amount; }
    });

    const hasData = months.some(m => m.income > 0 || m.expense > 0);
    const income = this.themeColor('--income', '#177350');
    const expense = this.themeColor('--expense', '#B5432B');
    const grid = this.themeColor('--line', '#D8DAE3');
    const label = this.themeColor('--ink-faint', '#8A90A0');

    if (!hasData) {
      wrap.innerHTML = `<div class="empty-chart" style="height:220px;">Add transactions to see your monthly trend</div>`;
      return;
    }

    const W = 620, H = 220, padTop = 14, padBottom = 26, padSide = 14;
    const chartH = H - padTop - padBottom;
    const maxVal = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
    const groupW = (W - padSide * 2) / months.length;
    const barW = Math.min(20, groupW / 3.4);
    const gap = 5;

    let gridLines = '';
    for (let i = 0; i <= 3; i++) {
      const y = padTop + chartH - (chartH * i / 3);
      gridLines += `<line x1="${padSide}" y1="${y.toFixed(1)}" x2="${W - padSide}" y2="${y.toFixed(1)}" stroke="${grid}" stroke-width="1"/>`;
    }

    let bars = '';
    months.forEach((m, i) => {
      const groupX = padSide + i * groupW;
      const incH = (m.income / maxVal) * chartH;
      const expH = (m.expense / maxVal) * chartH;
      const incX = groupX + groupW / 2 - barW - gap / 2;
      const expX = groupX + groupW / 2 + gap / 2;
      bars += `<rect x="${incX.toFixed(1)}" y="${(padTop + chartH - incH).toFixed(1)}" width="${barW}" height="${Math.max(incH, m.income > 0 ? 2 : 0).toFixed(1)}" rx="3" fill="${income}"><title>${m.label} Income: ${App.utils.fmt(m.income)}</title></rect>`;
      bars += `<rect x="${expX.toFixed(1)}" y="${(padTop + chartH - expH).toFixed(1)}" width="${barW}" height="${Math.max(expH, m.expense > 0 ? 2 : 0).toFixed(1)}" rx="3" fill="${expense}"><title>${m.label} Expense: ${App.utils.fmt(m.expense)}</title></rect>`;
      bars += `<text x="${(groupX + groupW / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="10.5" fill="${label}">${m.label}</text>`;
    });

    wrap.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="220" role="img" aria-label="Monthly income vs expense trend">
        ${gridLines}
        ${bars}
      </svg>
      <div class="chart-legend-inline">
        <span><i style="background:${income}"></i>Income</span>
        <span><i style="background:${expense}"></i>Expense</span>
      </div>`;
  },

  renderAll(transactions){
    this.renderCategoryChart(transactions);
    this.renderMonthlyChart(transactions);
  },
};
