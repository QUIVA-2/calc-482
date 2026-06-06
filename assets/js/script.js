// Minimal calculator logic exported for tests and index.html
let CURRENT_EXPRESSION = '';
let LAST_RESULT = 0;

function updateDisplay() {
  const el = typeof document !== 'undefined' ? document.getElementById('result') : null;
  if (el) el.value = CURRENT_EXPRESSION === '' ? String(LAST_RESULT) : CURRENT_EXPRESSION;
}

// Trig helpers (degrees)
function sinDeg(x) { return Math.sin(Number(x) * Math.PI / 180); }
function cosDeg(x) { return Math.cos(Number(x) * Math.PI / 180); }
function tanDeg(x) { return Math.tan(Number(x) * Math.PI / 180); }
function asinDeg(x) { return Math.asin(Number(x)) * 180 / Math.PI; }
function acosDeg(x) { return Math.acos(Number(x)) * 180 / Math.PI; }
function atanDeg(x) { return Math.atan(Number(x)) * 180 / Math.PI; }

function setCurrentExpression(s) {
  CURRENT_EXPRESSION = String(s);
  updateDisplay();
}
function getCurrentExpression() { return CURRENT_EXPRESSION; }

function setLastResult(v) { LAST_RESULT = Number(v); }
function getLastResult() { return LAST_RESULT; }

function normalizeExpression(input) {
  if (!input || typeof input !== 'string') return input;
  let s = input;
  // replace inverse trig first (asin, acos, atan)
  s = s.replace(/\basin\(/g, 'asinDeg(');
  s = s.replace(/\bacos\(/g, 'acosDeg(');
  s = s.replace(/\batan\(/g, 'atanDeg(');
  // then normal trig
  s = s.replace(/\bsin\(/g, 'sinDeg(');
  s = s.replace(/\bcos\(/g, 'cosDeg(');
  s = s.replace(/\btan\(/g, 'tanDeg(');
  // constants
  s = s.replace(/\bpi\b/g, 'Math.PI');
  s = s.replace(/\be\b/g, 'Math.E');
  return s;
}

function percentToResult() {
  const expr = CURRENT_EXPRESSION;
  if (!expr) return;
  // whole number percent -> decimal *
  if (/^\d+(?:\.\d+)?$/.test(expr)) {
    const n = Number(expr) / 100;
    CURRENT_EXPRESSION = String(n) + '*';
    updateDisplay();
    return;
  }

  // find last operator and compute percentage of left operand
  const m = expr.match(/(.+?)([+\-*/])([^+\-*/]+)$/);
  if (m) {
    const left = m[1];
    const right = m[3];
    let leftVal = 0;
    try {
      leftVal = eval(normalizeExpression(left));
    } catch (e) {
      leftVal = Number(left) || 0;
    }
    const perc = (Number(right) / 100) * leftVal;
    CURRENT_EXPRESSION = String(perc) + '*';
    updateDisplay();
  }
}

function calculateResult() {
  if (!CURRENT_EXPRESSION) return;
  // replace ans with last result
  let expr = CURRENT_EXPRESSION.replace(/\bans\b/g, String(LAST_RESULT));
  expr = normalizeExpression(expr);
  try {
    // make helper functions visible to eval by referencing them here
    const _sin = sinDeg, _cos = cosDeg, _tan = tanDeg, _asin = asinDeg, _acos = acosDeg, _atan = atanDeg;
    const value = eval(expr);
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) throw new Error('Non-finite result');
    LAST_RESULT = numeric;
    CURRENT_EXPRESSION = String(numeric);
    updateDisplay();
    return numeric;
  } catch (e) {
    CURRENT_EXPRESSION = 'Error';
    updateDisplay();
    return null;
  }
}

function primeFactorization() {
  const expr = CURRENT_EXPRESSION || String(LAST_RESULT);
  let n = Math.floor(Number(expr));
  if (isNaN(n) || n < 1) {
    CURRENT_EXPRESSION = 'Error'; updateDisplay(); return;
  }
  if (n === 1) {
    CURRENT_EXPRESSION = '1'; updateDisplay(); return;
  }
  const factors = {};
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      n = n / d;
    }
    d += (d === 2) ? 1 : 2;
  }
  if (n > 1) factors[n] = (factors[n] || 0) + 1;
  const parts = Object.keys(factors).map(p => {
    const exp = factors[p];
    return exp === 1 ? p : `${p}^${exp}`;
  });
  const out = parts.join(' * ');
  CURRENT_EXPRESSION = out || String(expr);
  updateDisplay();
}

// Misc helpers for UI
function appendToResult(v) {
  CURRENT_EXPRESSION = CURRENT_EXPRESSION + String(v);
  updateDisplay();
}
function operatorToResult(op) {
  CURRENT_EXPRESSION = CURRENT_EXPRESSION + String(op);
  updateDisplay();
}
function bracketToResult(b) { appendToResult(b); }
function backspace() {
  CURRENT_EXPRESSION = CURRENT_EXPRESSION.slice(0, -1);
  updateDisplay();
}
function clearResult() { CURRENT_EXPRESSION = ''; updateDisplay(); }

function toggleTheme() {
  const html = typeof document !== 'undefined' ? document.documentElement : null;
  if (!html) return;
  const isDark = html.getAttribute('data-bs-theme') === 'dark';
  html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';
}

// Load saved theme on init
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
  });
}

// Make functions globally available for browser onclick handlers
if (typeof window !== 'undefined') {
  window.setCurrentExpression = setCurrentExpression;
  window.getCurrentExpression = getCurrentExpression;
  window.setLastResult = setLastResult;
  window.getLastResult = getLastResult;
  window.normalizeExpression = normalizeExpression;
  window.percentToResult = percentToResult;
  window.calculateResult = calculateResult;
  window.primeFactorization = primeFactorization;
  window.appendToResult = appendToResult;
  window.operatorToResult = operatorToResult;
  window.bracketToResult = bracketToResult;
  window.backspace = backspace;
  window.clearResult = clearResult;
  window.toggleTheme = toggleTheme;
}

// Export for Node/tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setCurrentExpression,
    getCurrentExpression,
    setLastResult,
    getLastResult,
    normalizeExpression,
    percentToResult,
    calculateResult,
    primeFactorization,
    appendToResult,
    operatorToResult,
    bracketToResult,
    backspace,
    clearResult,
    sinDeg, cosDeg, tanDeg, asinDeg, acosDeg, atanDeg
  };
}
