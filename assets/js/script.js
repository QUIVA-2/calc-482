// ===============================
// 🧠 SMART RESULT MEMORY FEATURE
// ===============================

let LAST_RESULT = 0;
var currentExpression = "";

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
  return expr
    .replace(/asin\(/g, "asinDeg(")
    .replace(/acos\(/g, "acosDeg(")
    .replace(/atan\(/g, "atanDeg(")
    .replace(/sin\(/g, "sinDeg(")
    .replace(/cos\(/g, "cosDeg(")
    .replace(/tan\(/g, "tanDeg(")
    .replace(/asinh\(/g, "asinh(")
    .replace(/sinh\(/g, "sinh(")
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
      leftVal = eval(leftPart);
    } catch (e) {
      leftVal = parseFloat(leftPart);
    }

    const rightVal = parseFloat(rightPart);
    if (isNaN(leftVal) || isNaN(rightVal)) return;

    const percentVal = (leftVal * rightVal) / 100;

    currentExpression = percentVal.toString();
  }

  // 🔥 ADD THIS LINE
  currentExpression += "*";

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
    normalizedExpression = normalizedExpression.replace(
      /\bans\b/gi,
      LAST_RESULT,
    );

    // Calculate result
    let result = eval(normalizedExpression);
    console.log("Calculated result for expression:", currentExpression, "->", result);
    // Save result for future expressions
    LAST_RESULT = result;

    // Display normally
    display.value = result;

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    currentExpression = result.toString();
    updateResult();
  } catch (e) {
    currentExpression = "Error";
    updateResult();
  }
}


function updateResult() {
  // Keep raw value in hidden input (for forms/tests)
  const hidden = document.getElementById("result");
  if (hidden) hidden.value = currentExpression || "0";

  // Render a prettier display if `result-display` exists
  const disp = document.getElementById("result-display");
  if (disp) {
    const raw = currentExpression || "0";
    // Convert internal '**' or '^' exponent syntax to superscript HTML
    const asCaret = raw.replace(/\*\*/g, "^");

    // Escape HTML to avoid injecting markup from expression
    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

    // Replace caret + token with superscript
    const formatted = asCaret.replace(/\^(\(?[^\s^)]+\)?)/g, (m, p1) => {
      return '<sup>' + escapeHtml(p1) + '</sup>';
    });

    disp.innerHTML = formatted;
  }
}

// Prime factorization: reads currentExpression as integer and writes factorization string
function primeFactorization() {
  const val = parseInt(currentExpression, 10);
  if (isNaN(val)) {
    currentExpression = "Error";
    updateResult();
    return;
  }

  let n = Math.abs(val);
  if (n < 2) {
    currentExpression = n.toString();
    updateResult();
    return;
  }

  const factors = new Map();
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      n = n / d;
    }
    d = d === 2 ? 3 : d + 2;
  }
  if (n > 1) {
    factors.set(n, (factors.get(n) || 0) + 1);
  }

  // Build string like "2^3 * 3^2 * 5"
  const parts = [];
  Array.from(factors.keys()).sort((a,b)=>a-b).forEach((p) => {
    const exp = factors.get(p);
    parts.push(exp > 1 ? `${p}^${exp}` : `${p}`);
  });

  currentExpression = parts.join(' * ');
  updateResult();
}

// Export helpers for unit testing (works in Node + browser)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeExpression,
    percentToResult,
    calculateResult,
    primeFactorization,
    appendToResult,
    bracketToResult,
    backspace,
    operatorToResult,
    clearResult,
    updateResult,
    // state accessors for tests
    getCurrentExpression: () => currentExpression,
    setCurrentExpression: (v) => (currentExpression = v),
    getLastResult: () => LAST_RESULT,
    setLastResult: (v) => (LAST_RESULT = v),
  };
}

// Expose functions to global window for onclick handlers in production
if (typeof window !== 'undefined') {
  window.normalizeExpression = normalizeExpression;
  window.percentToResult = percentToResult;
  window.calculateResult = calculateResult;
  window.primeFactorization = primeFactorization;
  window.appendToResult = appendToResult;
  window.bracketToResult = bracketToResult;
  window.backspace = backspace;
  window.operatorToResult = operatorToResult;
  window.clearResult = clearResult;
  window.updateResult = updateResult;
}