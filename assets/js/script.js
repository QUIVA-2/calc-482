// ===============================
// 🧠 SMART RESULT MEMORY FEATURE
// ===============================

let LAST_RESULT = 0;
var currentExpression = "";

// Test helpers
function setCurrentExpression(s) { currentExpression = String(s); updateResult(); }
function getCurrentExpression() { return currentExpression; }
function setLastResult(v) { LAST_RESULT = Number(v); }
function getLastResult() { return LAST_RESULT; }

function updateResult() {
  const display = document.getElementById("result");
  if (display) {
    display.value = currentExpression || "0";
  }
}

// Trig helpers (degrees)
function sinDeg(x) { return Math.sin(Number(x) * Math.PI / 180); }
function cosDeg(x) { return Math.cos(Number(x) * Math.PI / 180); }
function tanDeg(x) { return Math.tan(Number(x) * Math.PI / 180); }
function asinDeg(x) { return Math.asin(Number(x)) * 180 / Math.PI; }
function acosDeg(x) { return Math.acos(Number(x)) * 180 / Math.PI; }
function atanDeg(x) { return Math.atan(Number(x)) * 180 / Math.PI; }

// ------------------------------
// Theme Toggle Logic
// ------------------------------
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    btn.innerHTML = "☀️";
    btn.title = "Switch to light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerHTML = "🌙";
    btn.title = "Switch to dark mode";
    localStorage.setItem("theme", "light");
  }
}

// Set theme on page load from localStorage
window.addEventListener("DOMContentLoaded", function () {
  const theme = localStorage.getItem("theme");
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  if (btn) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      btn.innerHTML = "☀️";
      btn.title = "Switch to light mode";
    } else {
      btn.innerHTML = "🌙";
      btn.title = "Switch to dark mode";
    }
  }
});

// ------------------------------
// Calculator State
// ------------------------------
let left = "";
let operator = "";
let right = "";
let steps = [];
const MAX_STEPS = 6;

// ------------------------------
// Basic Calculator Functions
// ------------------------------
function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  if (value === "^") {
    currentExpression += "**";
  } else {
    currentExpression += value;
  }
  updateResult();
}

function clearResult() {
  currentExpression = "";
  updateResult();
}

function normalizeExpression(expr) {
  if (!expr || typeof expr !== 'string') return expr;
  return expr
    .replace(/\basin\(/g, "asinDeg(")
    .replace(/\bacos\(/g, "acosDeg(")
    .replace(/\batan\(/g, "atanDeg(")
    .replace(/\bsin\(/g, "sinDeg(")
    .replace(/\bcos\(/g, "cosDeg(")
    .replace(/\btan\(/g, "tanDeg(")
    .replace(/\basinh\(/g, "asinh(")
    .replace(/\bsinh\(/g, "sinh(")
    .replace(/\be\b/g, "Math.E")
    .replace(/\bpi\b/g, "Math.PI");
}

function percentToResult() {
  if (!currentExpression) return;

  const match = currentExpression.match(/(.+?)(\*\*|[+\-*/^])([0-9.]*)$/);

  if (!match) {
    const num = parseFloat(currentExpression);
    if (isNaN(num)) return;
    currentExpression = (num / 100).toString();
  } else {
    const leftPart = match[1];
    const rightPart = match[3];

    if (!rightPart) return;

    let leftVal;
    try {
      leftVal = eval(normalizeExpression(leftPart));
    } catch (e) {
      leftVal = parseFloat(leftPart);
    }

    const rightVal = parseFloat(rightPart);
    if (isNaN(leftVal) || isNaN(rightVal)) return;

    const percentVal = (leftVal * rightVal) / 100;
    currentExpression = percentVal.toString();
  }

  currentExpression += "*";
  updateResult();
}

// ------------------------------
// Prime Factorization
// ------------------------------
function primeFactorization() {
  const expr = currentExpression || String(LAST_RESULT);
  let n = Math.floor(Number(expr));
  if (isNaN(n) || n < 1) {
    currentExpression = 'Error';
    updateResult();
    return;
  }
  if (n === 1) {
    currentExpression = '1';
    updateResult();
    return;
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
  currentExpression = out || String(expr);
  updateResult();
}

// ------------------------------
// Calculate Result
// ------------------------------
function calculateResult() {
  if (!currentExpression) return;

  try {
    const display = document.getElementById("result");
    let normalizedExpression = normalizeExpression(currentExpression);

    // 🧠 Replace "ans" with last result automatically
    normalizedExpression = normalizedExpression.replace(/\bans\b/gi, LAST_RESULT);

    // Make trig functions available to eval
    const _sin = sinDeg, _cos = cosDeg, _tan = tanDeg, _asin = asinDeg, _acos = acosDeg, _atan = atanDeg;
    
    // Calculate result
    let result = eval(normalizedExpression);
    console.log("Calculated result for expression:", currentExpression, "->", result);
    
    // Save result for future expressions
    LAST_RESULT = result;

    if (isNaN(result) || !isFinite(result)) {
      throw new Error("Non-finite result");
    }

    // Display normally
    if (display) display.value = result;
    currentExpression = result.toString();
    updateResult();
  } catch (e) {
    console.error("Calculation error:", e);
    currentExpression = "Error";
    updateResult();
  }
}


// Make functions globally available for browser onclick handlers
if (typeof window !== 'undefined') {
  window.appendToResult = appendToResult;
  window.bracketToResult = bracketToResult;
  window.backspace = backspace;
  window.operatorToResult = operatorToResult;
  window.clearResult = clearResult;
  window.normalizeExpression = normalizeExpression;
  window.percentToResult = percentToResult;
  window.calculateResult = calculateResult;
  window.primeFactorization = primeFactorization;
  window.toggleTheme = toggleTheme;
  window.setCurrentExpression = setCurrentExpression;
  window.getCurrentExpression = getCurrentExpression;
  window.setLastResult = setLastResult;
  window.getLastResult = getLastResult;
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
