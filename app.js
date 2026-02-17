const display = document.getElementById("display");
const secondaryDisplay = document.getElementById("secondaryDisplay");
const memIndicator = document.getElementById("memIndicator");
const historyList = document.getElementById("historyList");

let angleMode = "DEG"; // DEG or RAD
let memory = 0;
let hasMemory = false;
let history = [];

// ----- Angle mode -----
function setMode(mode) {
  angleMode = mode;
  document.getElementById("degBtn").classList.toggle("active", mode === "DEG");
  document.getElementById("radBtn").classList.toggle("active", mode === "RAD");
  secondaryDisplay.textContent = `Mode: ${angleMode}`;
}

// ----- Input handling -----
function press(value) {
  if (value === "EXP") {
    // Insert scientific notation marker
    display.value += "E";
    return;
  }

  // Special patterns for 10^ and e^
  if (value === "10^") {
    display.value += "10^";
    return;
  }
  if (value === "e^") {
    display.value += "e^";
    return;
  }

  display.value += value;
}

function clearDisplay() {
  display.value = "";
  secondaryDisplay.textContent = "";
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

function toggleSign() {
  if (!display.value) return;
  if (display.value.startsWith("-")) {
    display.value = display.value.slice(1);
  } else {
    display.value = "-" + display.value;
  }
}

function rnd() {
  const r = Math.random();
  display.value = r.toString();
}

// ----- Memory -----
function updateMemoryIndicator() {
  memIndicator.style.opacity = hasMemory ? 1 : 0.15;
}

function memClear() {
  memory = 0;
  hasMemory = false;
  updateMemoryIndicator();
}

function memRecall() {
  if (!hasMemory) return;
  display.value += memory.toString();
}

function memAdd() {
  const val = Number(evalSafe(display.value));
  if (!isNaN(val)) {
    memory += val;
    hasMemory = true;
    updateMemoryIndicator();
  }
}

function memSub() {
  const val = Number(evalSafe(display.value));
  if (!isNaN(val)) {
    memory -= val;
    hasMemory = true;
    updateMemoryIndicator();
  }
}

// ----- Math helpers -----
function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0) return NaN;
  let r = 1;
  for (let i = 1; i <= n; i++) r *= i;
  return r;
}

function nCr(n, r) {
  n = Number(n); r = Number(r);
  if (r > n || n < 0 || r < 0) return NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function nPr(n, r) {
  n = Number(n); r = Number(r);
  if (r > n || n < 0 || r < 0) return NaN;
  return factorial(n) / factorial(n - r);
}

function toRad(x) {
  return x * Math.PI / 180;
}

// Trig wrappers for DEG/RAD
function sinMode(x) {
  return angleMode === "DEG" ? Math.sin(toRad(x)) : Math.sin(x);
}
function cosMode(x) {
  return angleMode === "DEG" ? Math.cos(toRad(x)) : Math.cos(x);
}
function tanMode(x) {
  return angleMode === "DEG" ? Math.tan(toRad(x)) : Math.tan(x);
}
function asinMode(x) {
  const v = Math.asin(x);
  return angleMode === "DEG" ? v * 180 / Math.PI : v;
}
function acosMode(x) {
  const v = Math.acos(x);
  return angleMode === "DEG" ? v * 180 / Math.PI : v;
}
function atanMode(x) {
  const v = Math.atan(x);
  return angleMode === "DEG" ? v * 180 / Math.PI : v;
}

// Hiperbólicas
function sinhMode(x) { return Math.sinh(x); }
function coshMode(x) { return Math.cosh(x); }
function tanhMode(x) { return Math.tanh(x); }
function asinhMode(x) { return Math.asinh(x); }
function acoshMode(x) { return Math.acosh(x); }
function atanhMode(x) { return Math.atanh(x); }

// Safe eval wrapper
function evalSafe(expr) {
  try {
    // eslint-disable-next-line no-eval
    return eval(expr);
  } catch {
    return NaN;
  }
}

// ----- History -----
function addToHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 50) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    const exprSpan = document.createElement("span");
    exprSpan.className = "expr";
    exprSpan.textContent = item.expr;
    const resSpan = document.createElement("span");
    resSpan.className = "res";
    resSpan.textContent = "= " + item.result;
    li.appendChild(exprSpan);
    li.appendChild(resSpan);
    historyList.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  renderHistory();
}

// ----- Main calculate -----
function calculate() {
  let expr = display.value;
  if (!expr) return;

  secondaryDisplay.textContent = expr;

  // Factorial: 5! -> factorial(5)
  expr = expr.replace(/(\d+)!/g, "factorial($1)");

  // nCr and nPr: nCr(a,b) / nPr(a,b)
  expr = expr.replace(/nCr\(([^,]+),([^()]+)\)/g, "nCr($1,$2)");
  expr = expr.replace(/nPr\(([^,]+),([^()]+)\)/g, "nPr($1,$2)");

  // Constants
  expr = expr.replace(/π/g, "Math.PI");
  expr = expr.replace(/e/g, "Math.E");

  // 10^x and e^x
  expr = expr.replace(/10\^(\d+(\.\d+)?|\([^()]+\))/g, "Math.pow(10,$1)");
  expr = expr.replace(/Math\.E\^(\d+(\.\d+)?|\([^()]+\))/g, "Math.pow(Math.E,$1)");
  expr = expr.replace(/e\^(\d+(\.\d+)?|\([^()]+\))/g, "Math.pow(Math.E,$1)");

  // Logs and sqrt
  expr = expr.replace(/log\(/g, "Math.log10(");
  expr = expr.replace(/ln\(/g, "Math.log(");
  expr = expr.replace(/sqrt\(/g, "Math.sqrt(");

  // x^2, x^3, x^y
  expr = expr.replace(/(\d+|\([^()]+\))\^2/g, "Math.pow($1,2)");
  expr = expr.replace(/(\d+|\([^()]+\))\^3/g, "Math.pow($1,3)");
  expr = expr.replace(/(\d+|\([^()]+\))\^(\d+(\.\d+)?)/g, "Math.pow($1,$2)");

  // mod(a,b) -> (a % b)
  expr = expr.replace(/mod\(([^,]+),([^()]+)\)/g, "($1%$2)");

  // Trig and inverse trig
  expr = expr.replace(/sin\(/g, "sinMode(");
  expr = expr.replace(/cos\(/g, "cosMode(");
  expr = expr.replace(/tan\(/g, "tanMode(");
  expr = expr.replace(/asin\(/g, "asinMode(");
  expr = expr.replace(/acos\(/g, "acosMode(");
  expr = expr.replace(/atan\(/g, "atanMode(");

  // Hiperbólicas
  expr = expr.replace(/sinh\(/g, "sinhMode(");
  expr = expr.replace(/cosh\(/g, "coshMode(");
  expr = expr.replace(/tanh\(/g, "tanhMode(");
  expr = expr.replace(/asinh\(/g, "asinhMode(");
  expr = expr.replace(/acosh\(/g, "acoshMode(");
  expr = expr.replace(/atanh\(/g, "atanhMode(");

  // Scientific notation: aE±b -> a * 10^b
  expr = expr.replace(/(\d+(\.\d+)?)[eE]([+\-]?\d+)/g, "($1*Math.pow(10,$3))");

  let result;
  try {
    // eslint-disable-next-line no-eval
    result = eval(expr);
    if (typeof result === "number" && !isNaN(result)) {
      display.value = result;
      addToHistory(secondaryDisplay.textContent, result);
    } else {
      display.value = "Error";
    }
  } catch (e) {
    display.value = "Error";
  }
}
