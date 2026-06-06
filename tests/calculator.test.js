const calc = require('../assets/js/script.js');

beforeEach(() => {
  // Reset state
  calc.setCurrentExpression('');
  calc.setLastResult(0);
  // Ensure DOM element exists for functions that touch it
  document.body.innerHTML = '<input id="result" value="0" />';
});

test('normalizeExpression converts trig functions and constants', () => {
  const input = 'sin(30)+pi+e+asin(1)';
  const out = calc.normalizeExpression(input);
  expect(out).toContain('sinDeg(30)');
  expect(out).toContain('Math.PI');
  expect(out).toContain('Math.E');
  expect(out).toContain('asinDeg(1)');
});

test('percentToResult converts whole number percent to decimal and appends *', () => {
  calc.setCurrentExpression('50');
  calc.percentToResult();
  expect(calc.getCurrentExpression()).toBe('0.5*');
});

test('percentToResult computes percentage of left operand', () => {
  calc.setCurrentExpression('200+10');
  calc.percentToResult();
  expect(calc.getCurrentExpression()).toBe('20*');
});

test('calculateResult computes expression and updates LAST_RESULT and display', () => {
  calc.setCurrentExpression('2+3');
  calc.calculateResult();
  expect(calc.getLastResult()).toBe(5);
  expect(calc.getCurrentExpression()).toBe('5');
  const display = document.getElementById('result');
  expect(display.value).toBe('5');
});

test('calculateResult replaces ans with LAST_RESULT', () => {
  calc.setLastResult(7);
  calc.setCurrentExpression('ans+3');
  calc.calculateResult();
  expect(calc.getLastResult()).toBe(10);
  expect(calc.getCurrentExpression()).toBe('10');
});

test('primeFactorization computes factors for 360', () => {
  calc.setCurrentExpression('360');
  calc.primeFactorization();
  expect(calc.getCurrentExpression()).toBe('2^3 * 3^2 * 5');
});

test('primeFactorization handles primes and 1', () => {
  calc.setCurrentExpression('13');
  calc.primeFactorization();
  expect(calc.getCurrentExpression()).toBe('13');

  calc.setCurrentExpression('1');
  calc.primeFactorization();
  expect(calc.getCurrentExpression()).toBe('1');
});
