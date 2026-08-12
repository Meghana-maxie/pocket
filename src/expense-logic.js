// Pure logic extracted from expense-tracker.jsx for testing.
// Mirrors the real component's behavior exactly — keep in sync if the component changes.

export function currency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function computeSpentByCategory(expenses, monthPrefix) {
  const map = {};
  expenses
    .filter((e) => e.date.slice(0, 7) === monthPrefix)
    .forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
  return map;
}

export function computeMascotStatus(totalSpent, totalBudget) {
  if (totalBudget <= 0) return 'neutral';
  const pct = totalSpent / totalBudget;
  if (pct >= 1) return 'sad';
  if (pct >= 0.9) return 'worried';
  if (pct >= 0.7) return 'neutral';
  return 'happy';
}

export function isValidExpenseAmount(amount) {
  return amount !== '' && amount !== null && amount !== undefined && Number(amount) > 0;
}

export function shiftMonth(prefix, delta) {
  const [y, m] = prefix.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function monthLabelFromPrefix(prefix) {
  const [y, m] = prefix.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

// Budgets carry forward from the nearest earlier month until explicitly
// changed. Changing a budget only affects that month onward — past months
// keep whatever snapshot was actually in effect at the time.
export function effectiveBudgetForMonth(budgetsByMonth, month) {
  const keys = Object.keys(budgetsByMonth)
    .filter((k) => k <= month)
    .sort();
  if (keys.length === 0) return {};
  return budgetsByMonth[keys[keys.length - 1]];
}

export function computeRemaining(totalSpent, totalBudget) {
  return totalBudget - totalSpent;
}
