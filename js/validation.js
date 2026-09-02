/* ==========================================================================
   validation.js — Form validation rules
   Ledger — Smart Expense Tracker
   ========================================================================== */

window.App = window.App || {};

App.validation = {
  /**
   * Validates a transaction form payload.
   * @param {{name:string, amountRaw:string, date:string}} data
   * @returns {{valid:boolean, errors:Object}}
   */
  validateTransactionForm(data){
    const errors = {};
    const name = (data.name || '').trim();
    const amount = parseFloat(data.amountRaw);
    const today = App.utils.todayISO();

    if (!name) {
      errors.name = 'Please enter a description.';
    } else if (name.length > App.LIMITS.MAX_NAME_LENGTH) {
      errors.name = `Description must be under ${App.LIMITS.MAX_NAME_LENGTH} characters.`;
    }

    if (!data.amountRaw || isNaN(amount) || amount <= 0) {
      errors.amount = 'Enter a valid amount greater than 0.';
    } else if (amount > App.LIMITS.MAX_AMOUNT) {
      errors.amount = `Amount cannot exceed ${App.utils.fmt(App.LIMITS.MAX_AMOUNT)}.`;
    }

    if (!data.date) {
      errors.date = 'Please select a date.';
    } else if (data.date > today) {
      errors.date = 'Future dates are not allowed.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  },

  /** Blocks accidental duplicate submissions fired within a short window. */
  isDuplicateSubmission(lastSubmitAt){
    return lastSubmitAt && (Date.now() - lastSubmitAt) < App.LIMITS.DUPLICATE_WINDOW_MS;
  },

  validateBudget(raw){
    const amount = parseFloat(raw);
    if (raw === '' || isNaN(amount) || amount < 0) return { valid: false, message: 'Enter a valid budget amount.' };
    if (amount > App.LIMITS.MAX_AMOUNT) return { valid: false, message: 'Budget is unrealistically high.' };
    return { valid: true, amount };
  },
};
