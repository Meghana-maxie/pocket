import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Wallet, TrendingUp, AlertTriangle, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { currency, computeSpentByCategory, computeMascotStatus, isValidExpenseAmount, shiftMonth, monthLabelFromPrefix, effectiveBudgetForMonth, computeRemaining } from './expense-logic';

const YOLK_MORPH = 'M 77,68 C 92,67 105,80 105,96 C 105,112 92,124 77,124 C 62,124 49,112 49,96 C 49,80 62,67 77,68 Z;M 77,65 C 94,64 108,79 108,96 C 108,113 94,127 77,127 C 60,127 46,113 46,96 C 46,79 60,64 77,65 Z;M 77,70 C 95,70 109,83 108,97 C 107,112 93,123 77,123 C 61,123 46,112 46,97 C 46,82 59,70 77,70 Z;M 79,67 C 95,66 108,80 107,96 C 106,112 93,126 77,125 C 61,124 48,111 49,95 C 50,79 63,68 79,67 Z;M 77,68 C 92,67 105,80 105,96 C 105,112 92,124 77,124 C 62,124 49,112 49,96 C 49,80 62,67 77,68 Z';

const ARM_ANIM = {
  happy: { l: '0 26,112;-18 26,112;0 26,112;10 26,112;0 26,112', r: '0 134,112;18 134,112;0 134,112;-10 134,112;0 134,112', dur: '1.8s' },
  neutral: { l: '0 26,112;-6 26,112;0 26,112', r: '0 134,112;6 134,112;0 134,112', dur: '3.2s' },
  worried: { l: '0 26,112;-4 26,112;4 26,112;-3 26,112;3 26,112;0 26,112', r: '0 134,112;-4 134,112;4 134,112;-3 134,112;3 134,112;0 134,112', dur: '2.4s' },
  sad: { l: '0 26,112;8 26,112;0 26,112', r: '0 134,112;-8 134,112;0 134,112', dur: '4.0s' },
};

function BudgetMascot({ status, size = 80, bump = 0 }) {
  const arms = ARM_ANIM[status];

  const face = {
    happy: (
      <>
        <path d="M 63 93 Q 67.5 87 72 93" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 79 93 Q 83.5 87 88 93" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 66 101 Q 75.5 110 87 101" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <ellipse cx="76.5" cy="108" rx="5" ry="4" fill="#FF9B9B" />
      </>
    ),
    neutral: (
      <>
        <ellipse cx="62" cy="97" rx="8" ry="4.5" fill="#FFB3B3" opacity="0.45" />
        <ellipse cx="92" cy="97" rx="8" ry="4.5" fill="#FFB3B3" opacity="0.45" />
        <circle cx="67.5" cy="91" r="2.5" fill="#4A3F35" />
        <circle cx="84" cy="91" r="2.5" fill="#4A3F35" />
        <path d="M 68 101 Q 75.5 105 85 101" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ),
    worried: (
      <>
        <line x1="63" y1="91" x2="72" y2="91" stroke="#4A3F35" strokeWidth="2" strokeLinecap="round" />
        <line x1="79" y1="91" x2="88" y2="91" stroke="#4A3F35" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="103" x2="84" y2="103" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    sad: (
      <>
        <line x1="62" y1="83" x2="70" y2="87" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="82" y1="87" x2="90" y2="83" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 63 93 Q 67.5 92 72 94" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 79 94 Q 83.5 92 88 93" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 67 105 Q 75.5 99 85 105" stroke="#4A3F35" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <ellipse cx="88.5" cy="95.5" rx="4" ry="2.2" fill="#8FD3F4" opacity="0.9">
          <animate attributeName="rx" values="4;5.2;4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2.4s" repeatCount="indefinite" />
        </ellipse>
        <path d="M 88.5 97 Q 93 104 88.5 111 Q 84 104 88.5 97 Z" fill="#8FD3F4">
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.7;1" dur="2.4s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,14" keyTimes="0;0.15;1" dur="2.4s" repeatCount="indefinite" />
        </path>
        <path d="M 88.5 97 Q 91.5 102 88.5 107 Q 85.5 102 88.5 97 Z" fill="#8FD3F4">
          <animate attributeName="opacity" values="0;0;0.9;0.9;0" keyTimes="0;0.25;0.4;0.75;1" dur="2.4s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,8;0,18" keyTimes="0;0.25;0.4;1" dur="2.4s" repeatCount="indefinite" />
        </path>
        <ellipse cx="64" cy="95.5" rx="3.5" ry="2" fill="#8FD3F4">
          <animate attributeName="opacity" values="0;0;0.9;0.9;0" keyTimes="0;0.3;0.45;0.75;1" dur="3.6s" repeatCount="indefinite" />
        </ellipse>
        <path d="M 64 97 Q 68 104 64 111 Q 60 104 64 97 Z" fill="#8FD3F4">
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.3;0.45;0.78;1" dur="3.6s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,3;0,16" keyTimes="0;0.3;0.45;1" dur="3.6s" repeatCount="indefinite" />
        </path>
        <line x1="88.5" y1="106" x2="88.5" y2="120" stroke="#8FD3F4" strokeWidth="2" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0;0.7;0.7;0" keyTimes="0;0.2;0.4;0.7;1" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="106;106;118;126" keyTimes="0;0.2;0.4;1" dur="2.4s" repeatCount="indefinite" />
        </line>
      </>
    ),
  }[status];

  return (
    <svg
      aria-hidden="true"
      height={size}
      width={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', overflow: 'visible', verticalAlign: 'middle' }}
    >
      <g key={bump} className={bump > 0 ? 'mascot-jiggle' : ''}>
        <line x1="26" y1="112" x2="44" y2="126" stroke="#D8D2C4" strokeWidth="2.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values={arms.l} dur={arms.dur} repeatCount="indefinite" />
        </line>
        <line x1="134" y1="112" x2="116" y2="126" stroke="#D8D2C4" strokeWidth="2.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values={arms.r} dur={arms.dur} repeatCount="indefinite" />
        </line>
        <path d="M 19,116 C 16,104 29,90 54,91 C 64,91 70,86 80,86 C 90,86 98,90 110,92 C 133,95 147,106 145,119 C 143,132 129,152 104,153 C 91,154 65,154 52,153 C 27,151 21,130 19,116 Z" fill="#FFFBF3" stroke="#D8D2C4" strokeWidth="1.5" />
        <ellipse cx="54" cy="108" rx="20" ry="8" fill="white" opacity="0.55" />
        <path fill="#FFD75E" fillOpacity="0.78" stroke="#E8B93E" strokeWidth="1.5">
          <animate attributeName="d" dur="4.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1" values={YOLK_MORPH} />
        </path>
        <ellipse cx="67" cy="86" rx="9" ry="5.5" fill="white" opacity="0.60" />
        <g>{face}</g>
      </g>
    </svg>
  );
}

const CATEGORIES = [
  { name: 'Food', color: '#F4B942' },
  { name: 'Transport', color: '#3EC9A7' },
  { name: 'Shopping', color: '#FF8FA3' },
  { name: 'Bills', color: '#7C6FF0' },
  { name: 'Entertainment', color: '#E8834E' },
  { name: 'Health', color: '#4EA1D3' },
  { name: 'Other', color: '#9C9691' },
];

const catColor = (name) => (CATEGORIES.find((c) => c.name === name) || CATEGORIES[6]).color;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthLabel(d) {
  return new Date(d).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

export default function ExpenseTracker() {
  const [loaded, setLoaded] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [budgetsByMonth, setBudgetsByMonth] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'Food', note: '', date: todayStr() });
  const [budgetDraft, setBudgetDraft] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(todayStr().slice(0, 7));
  const [amountError, setAmountError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mascotBump, setMascotBump] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const e = await window.storage.get('expenses');
        setExpenses(e ? JSON.parse(e.value) : []);
      } catch (err) {
        setExpenses([]);
      }
      try {
        const bm = await window.storage.get('budgetsByMonth');
        if (bm) {
          setBudgetsByMonth(JSON.parse(bm.value));
        } else {
          // Migrate an older single-budget save: apply it as the base
          // that every month carries forward from, unless overridden later.
          const old = await window.storage.get('budgets').catch(() => null);
          if (old) {
            const migrated = { '0000-01': JSON.parse(old.value) };
            setBudgetsByMonth(migrated);
            persist('budgetsByMonth', migrated);
          } else {
            setBudgetsByMonth({});
          }
        }
      } catch (err) {
        setBudgetsByMonth({});
      }
      try {
        const dm = await window.storage.get('darkMode');
        setDarkMode(dm ? JSON.parse(dm.value) : false);
      } catch (err) {
        setDarkMode(false);
      }
      setLoaded(true);
    })();
  }, []);

  const persist = async (key, value) => {
    try {
      const res = await window.storage.set(key, JSON.stringify(value));
      if (!res) setSaveError(true);
      else setSaveError(false);
    } catch (err) {
      setSaveError(true);
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    persist('darkMode', next);
  };

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === selectedMonth),
    [expenses, selectedMonth]
  );

  const spentByCategory = useMemo(
    () => computeSpentByCategory(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const budgets = useMemo(
    () => effectiveBudgetForMonth(budgetsByMonth, selectedMonth),
    [budgetsByMonth, selectedMonth]
  );

  const totalSpent = Object.values(spentByCategory).reduce((a, b) => a + b, 0);
  const totalBudget = Object.values(budgets).reduce((a, b) => a + Number(b || 0), 0);
  const remaining = computeRemaining(totalSpent, totalBudget);

  const mascotStatus = useMemo(
    () => computeMascotStatus(totalSpent, totalBudget),
    [totalSpent, totalBudget]
  );

  const pieData = Object.entries(spentByCategory).map(([name, value]) => ({ name, value }));
  const budgetPieData = Object.entries(budgets)
    .filter(([, value]) => Number(value) > 0)
    .map(([name, value]) => ({ name, value: Number(value) }));

  const lowBudgetCats = CATEGORIES.filter((c) => {
    const b = Number(budgets[c.name] || 0);
    const s = spentByCategory[c.name] || 0;
    return b > 0 && s / b >= 0.85;
  });

  const defaultFormDate = () => {
    const real = todayStr();
    return selectedMonth === real.slice(0, 7) ? real : selectedMonth + '-01';
  };

  const saveExpense = () => {
    if (!isValidExpenseAmount(form.amount)) {
      setAmountError(true);
      return;
    }
    let next;
    if (editingId) {
      next = expenses.map((e) =>
        e.id === editingId
          ? { ...e, amount: Number(form.amount), category: form.category, note: form.note, date: form.date }
          : e
      );
    } else {
      next = [
        { id: Date.now().toString(), amount: Number(form.amount), category: form.category, note: form.note, date: form.date },
        ...expenses,
      ];
    }
    setExpenses(next);
    persist('expenses', next);
    setForm({ amount: '', category: 'Food', note: '', date: todayStr() });
    setAmountError(false);
    setEditingId(null);
    setShowAdd(false);
  };

  const openEditExpense = (expense) => {
    setForm({ amount: String(expense.amount), category: expense.category, note: expense.note, date: expense.date });
    setEditingId(expense.id);
    setAmountError(false);
    setShowAdd(true);
  };

  const deleteExpense = (id) => {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    persist('expenses', next);
  };

  const openBudgetEditor = () => {
    const draft = {};
    CATEGORIES.forEach((c) => (draft[c.name] = budgets[c.name] || ''));
    setBudgetDraft(draft);
    setShowBudget(true);
  };

  const saveBudgets = () => {
    const clean = {};
    Object.entries(budgetDraft).forEach(([k, v]) => {
      if (v !== '') clean[k] = Number(v);
    });
    const nextByMonth = { ...budgetsByMonth, [selectedMonth]: clean };
    setBudgetsByMonth(nextByMonth);
    persist('budgetsByMonth', nextByMonth);
    setShowBudget(false);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FB]">
        <p className="text-[#8B85A3] text-sm">Loading your pocket...</p>
      </div>
    );
  }

  return (
    <div className={`pocket-root min-h-screen bg-[var(--bg)] pb-8 ${darkMode ? 'dark' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap');
        .pocket-root {
          --bg: #F5F3FB;
          --card: #FFFFFF;
          --text-1: #2B2640;
          --text-2: #8B85A3;
          --text-3: #B4AFC7;
          --border: #F0EEF7;
          --input-border: #EEEDFE;
          --overlay: #2B264080;
          --accent: #7C6FF0;
          --track: #F0EEF7;
        }
        .pocket-root.dark {
          --bg: #1B1826;
          --card: #262132;
          --text-1: #F2EEFB;
          --text-2: #A79FC2;
          --text-3: #726892;
          --border: #362F47;
          --input-border: #3A3350;
          --overlay: #00000090;
          --accent: #9A8CFF;
          --track: #362F47;
        }
        .font-display { font-family: 'Fredoka', sans-serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
        .font-num { font-family: 'JetBrains Mono', monospace; }
        .mascot-jiggle { animation: mascot-click-jiggle 0.5s ease-in-out; transform-origin: 80px 126px; }
        @keyframes mascot-click-jiggle {
          0% { transform: scale(1,1) rotate(0deg); }
          30% { transform: scale(1.15,0.85) rotate(-4deg); }
          60% { transform: scale(0.92,1.08) rotate(3deg); }
          100% { transform: scale(1,1) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) { .mascot-jiggle { animation: none; } }
      `}</style>

      <div className="max-w-md mx-auto px-5 pt-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Wallet size={22} className="text-[#F4B942]" strokeWidth={2.2} />
            <h1 className="font-display text-[var(--text-1)] text-2xl">Pocket</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-[var(--text-2)] p-1.5"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
            aria-label="Previous month"
            className="text-[var(--text-2)] p-1.5 -ml-1.5"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="font-body text-[var(--text-1)] text-sm font-medium">{monthLabelFromPrefix(selectedMonth)}</p>
          <button
            onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
            aria-label="Next month"
            className="text-[var(--text-2)] p-1.5 -mr-1.5"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {saveError && (
          <div className="bg-[#FCEBEB] border border-[#F0999560] rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#A32D2D] shrink-0" />
            <p className="font-body text-xs text-[#791F1F]">Couldn't save just now — your last change may not have stuck. Try again.</p>
          </div>
        )}

        {lowBudgetCats.length > 0 && (
          <div className="bg-[#FAEEDA] border border-[#EF9F2760] rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-[#854F0B] shrink-0 mt-0.5" />
            <p className="font-body text-xs text-[#633806] leading-relaxed">
              Running low on {lowBudgetCats.map((c) => c.name).join(', ')} — you've used most of what's set aside.
            </p>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setMascotBump((n) => n + 1)}
            aria-label={`Boop your budget egg. Status: ${mascotStatus}`}
            className="p-1"
          >
            <BudgetMascot status={mascotStatus} size={88} bump={mascotBump} />
          </button>
        </div>

        <div className="bg-[var(--card)] rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="font-body text-[var(--text-2)] text-xs mb-1">Spent</p>
              <p className="font-num text-[var(--text-1)] text-3xl font-medium">{currency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-[var(--text-2)] text-xs mb-1">Budgeted</p>
              <p className="font-num text-[var(--text-2)] text-lg">{currency(totalBudget)}</p>
            </div>
          </div>

          {totalBudget > 0 && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]">
              <p className="font-body text-[var(--text-1)] text-xs font-medium">
                {remaining < 0 ? 'Over budget by' : 'Left to spend'}
              </p>
              <p className={`font-num text-sm font-medium ${remaining < 0 ? 'text-[#E24B4A]' : 'text-[#3EC9A7]'}`}>
                {currency(Math.abs(remaining))}
              </p>
            </div>
          )}

          {pieData.length > 0 ? (
            <div className="h-44 -mx-2">
              <p className="font-body text-[var(--text-3)] text-[11px] text-center mb-1">Spending by category</p>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={catColor(entry.name)} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ fontFamily: 'Manrope', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="font-body text-[var(--text-3)] text-xs text-center py-8">Log an expense to see your breakdown here.</p>
          )}
        </div>

        <div className="bg-[var(--card)] rounded-2xl p-5 mb-5 shadow-sm">
          <p className="font-body text-[var(--text-1)] text-sm font-medium mb-1">Budget allocation</p>
          <p className="font-body text-[var(--text-3)] text-[11px] mb-3">How your {currency(totalBudget)} is split across categories</p>

          {budgetPieData.length > 0 ? (
            <div className="h-44 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {budgetPieData.map((entry) => (
                      <Cell key={entry.name} fill={catColor(entry.name)} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ fontFamily: 'Manrope', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="font-body text-[var(--text-3)] text-xs text-center py-8">Set budgets to see how you've split your money.</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[var(--text-1)] text-base">Categories</h2>
          <button onClick={openBudgetEditor} className="font-body text-xs text-[var(--accent)] font-medium">
            Set budgets
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {CATEGORIES.map((c) => {
            const spent = spentByCategory[c.name] || 0;
            const budget = Number(budgets[c.name] || 0);
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const barColor = pct >= 100 ? '#E24B4A' : pct >= 85 ? '#EF9F27' : c.color;
            return (
              <div key={c.name} className="bg-[var(--card)] rounded-xl p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <p className="font-body text-[var(--text-1)] text-xs font-medium truncate">{c.name}</p>
                </div>
                <p className="font-num text-[var(--text-1)] text-sm font-medium mb-1.5">{currency(spent)}</p>
                {budget > 0 ? (
                  <>
                    <div className="w-full h-1.5 bg-[var(--track)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: barColor }} />
                    </div>
                    <p className="font-body text-[var(--text-3)] text-[10px] mt-1">{currency(spent)} spent of {currency(budget)}</p>
                  </>
                ) : (
                  <p className="font-body text-[var(--text-3)] text-[10px]">no budget set</p>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="font-display text-[var(--text-1)] text-base mb-3">Recent</h2>
        {monthExpenses.length === 0 ? (
          <p className="font-body text-[var(--text-3)] text-xs text-center py-6">Nothing logged for {monthLabelFromPrefix(selectedMonth)} yet.</p>
        ) : (
          <div className="space-y-2">
            {monthExpenses.slice(0, 15).map((e) => (
              <div key={e.id} className="bg-[var(--card)] rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <button
                  onClick={() => openEditExpense(e)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  aria-label={`Edit ${e.note || e.category}, ${currency(e.amount)}`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor(e.category) }} />
                  <div className="min-w-0">
                    <p className="font-body text-[var(--text-1)] text-sm font-medium truncate">{e.note || e.category}</p>
                    <p className="font-body text-[var(--text-3)] text-[11px]">{e.category} · {e.date}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="font-num text-[var(--text-1)] text-sm">{currency(e.amount)}</p>
                  <button onClick={() => deleteExpense(e.id)} aria-label="Delete" className="text-[var(--text-3)] hover:text-[#E24B4A]">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            setForm({ amount: '', category: 'Food', note: '', date: defaultFormDate() });
            setEditingId(null);
            setAmountError(false);
            setShowAdd(true);
          }}
          aria-label="Add expense"
          className="sticky bottom-6 w-full mt-6 bg-[var(--accent)] text-white font-body font-medium text-sm rounded-full py-3.5 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <Plus size={18} /> Add expense
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-[var(--overlay)] flex items-end justify-center z-10" onClick={() => { setShowAdd(false); setEditingId(null); }}>
          <div className="bg-[var(--card)] rounded-t-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-[var(--text-1)] text-lg">{editingId ? 'Edit expense' : 'Add expense'}</h3>
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} aria-label="Close"><X size={18} className="text-[var(--text-2)]" /></button>
            </div>
            <label className="font-body text-xs text-[var(--text-2)] mb-1 block">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => {
                setForm({ ...form, amount: e.target.value });
                if (amountError) setAmountError(false);
              }}
              placeholder="0"
              className={`font-num w-full text-2xl font-medium text-[var(--text-1)] bg-transparent border-b pb-2 mb-1 outline-none ${amountError ? 'border-[#E24B4A]' : 'border-[var(--input-border)] focus:border-[var(--accent)]'}`}
            />
            {amountError && (
              <p className="font-body text-[#E24B4A] text-xs mb-3">Enter an amount greater than 0.</p>
            )}
            <label className="font-body text-xs text-[var(--text-2)] mb-1.5 block mt-4">Category</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setForm({ ...form, category: c.name })}
                  className="font-body text-xs px-3 py-1.5 rounded-full border transition-colors"
                  style={
                    form.category === c.name
                      ? { background: c.color + '22', borderColor: c.color, color: 'var(--text-1)' }
                      : { borderColor: 'var(--input-border)', color: 'var(--text-2)' }
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>
            <label className="font-body text-xs text-[var(--text-2)] mb-1 block">Note (optional)</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="What was it for?"
              className="font-body w-full text-sm text-[var(--text-1)] bg-transparent border border-[var(--input-border)] rounded-lg px-3 py-2.5 mb-4 outline-none focus:border-[var(--accent)]"
            />
            <label className="font-body text-xs text-[var(--text-2)] mb-1 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="font-body w-full text-sm text-[var(--text-1)] bg-transparent border border-[var(--input-border)] rounded-lg px-3 py-2.5 mb-5 outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={saveExpense}
              className="w-full bg-[var(--accent)] text-white font-body font-medium text-sm rounded-full py-3.5"
            >
              {editingId ? 'Save changes' : 'Save expense'}
            </button>
          </div>
        </div>
      )}

      {showBudget && (
        <div className="fixed inset-0 bg-[var(--overlay)] flex items-end justify-center z-10" onClick={() => setShowBudget(false)}>
          <div className="bg-[var(--card)] rounded-t-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-display text-[var(--text-1)] text-lg">Set budgets</h3>
              <button onClick={() => setShowBudget(false)} aria-label="Close"><X size={18} className="text-[var(--text-2)]" /></button>
            </div>
            <p className="font-body text-[var(--text-3)] text-[11px] mb-4">
              Applies from {monthLabelFromPrefix(selectedMonth)} onward — earlier months keep their own numbers.
            </p>
            <div className="space-y-3.5 mb-5">
              {CATEGORIES.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <p className="font-body text-sm text-[var(--text-1)]">{c.name}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={budgetDraft[c.name] ?? ''}
                    onChange={(e) => setBudgetDraft({ ...budgetDraft, [c.name]: e.target.value })}
                    placeholder="0"
                    className="font-num w-24 text-sm text-right text-[var(--text-1)] bg-transparent border border-[var(--input-border)] rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--accent)]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={saveBudgets}
              className="w-full bg-[var(--accent)] text-white font-body font-medium text-sm rounded-full py-3.5"
            >
              Save budgets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
