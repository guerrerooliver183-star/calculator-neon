// -------------------------
// LANGUAGE DETECTION SYSTEM
// -------------------------

let lang = "en";

const translations = {
  en: {
    tabs: ["BASIC", "SCI", "ADV", "MEM", "HIST"],
    ce: "CE",
    clearHistory: "Clear history",
    memText: "Memory value is used with current display."
  },
  es: {
    tabs: ["BÁSICO", "CIENTÍFICA", "AVANZADA", "MEMORIA", "HISTORIAL"],
    ce: "CE",
    clearHistory: "Borrar historial",
    memText: "El valor de memoria se usa con la pantalla actual."
  }
};

function detectLanguage() {
  const userLang = navigator.language || "en";
  const code = userLang.split("-")[0].toLowerCase();
  lang = translations[code] ? code : "en";
  applyLanguage();
}

function applyLanguage() {
  const t = translations[lang];

  document.getElementById("tab-basic").textContent = t.tabs[0];
  document.getElementById("tab-sci").textContent = t.tabs[1];
  document.getElementById("tab-adv").textContent = t.tabs[2];
  document.getElementById("tab-mem").textContent = t.tabs[3];
  document.getElementById("tab-hist").textContent = t.tabs[4];

  document.getElementById("btn-ce").textContent = t.ce;

  const histClear = document.querySelector(".history-clear");
  if (histClear) histClear.textContent = t.clearHistory;

  const memText = document.querySelector(".mem-text");
  if (memText) memText.textContent = t.memText;
}

detectLanguage();

// -------------------------
// TABS
// -------------------------

function switchTab(tab) {
  const sections = {
    basic: document.getElementById("section-basic"),
    sci: document.getElementById("section-sci"),
    adv: document.getElementById("section-adv"),
    mem: document.getElementById("section-mem"),
    hist: document.getElementById("section-hist")
  };

  const tabs = {
    basic: document.getElementById("tab-basic"),
    sci: document.getElementById("tab-sci"),
    adv: document.getElementById("tab-adv"),
    mem: document.getElementById("tab-mem"),
    hist: document.getElementById("tab-hist")
  };

  Object.values(sections).forEach(s => s.classList.remove("active"));
  Object.values(tabs).forEach(t => t.classList.remove("active"));

  sections[tab].classList.add("active");
  tabs[tab].classList.add("active");
}

switchTab("basic");

// -------------------------
// CALCULATOR LOGIC
// -------------------------

const display = document.getElementById("display");
const secondaryDisplay = document.getElementById("secondaryDisplay");
const historyList = document.getElementById("historyList");

let memory = 0;
let hasMemory = false;
let history = [];

// -------------------------
// INPUT
// -------------------------

function press(value) {
  if (value === "EXP") {
    display.value += "E";
    return;
  }
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
  display.value = display.value.startsWith("-")
    ? display.value.slice(1)
    : "-" + display.value;
}

function rnd() {
  display.value = Math.random().toString();
}

// -------------------------
// MEMORY
// -------------------------

function memClear() { memory = 0; hasMemory = false; }
function memRecall() { if (hasMemory) display.value += memory; }
function memAdd() { const v = Number(evalSafe(display.value)); if (!isNaN(v)) { memory += v; hasMemory = true; } }
function memSub() { const v = Number(evalSafe(display.value)); if (!isNaN(v)) { memory -= v; hasMemory = true; } }

// -------------------------
// MATH HELPERS
// -------------------------

function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0) return NaN;
  let r = 1;
  for (let i = 1; i <= n; i++) r *= i;
  return r;
}

function nCr(n, r) { return factorial(n) / (factorial(r) * factorial(n - r)); }
function nPr(n, r) { return factorial(n) / factorial(n - r); }

function evalSafe(expr) {
  try { return eval(expr); }
  catch { return NaN; }
}

// -------------------------
// HISTORY WITH LOCALSTORAGE
// -------------------------

function loadHistory() {
  const saved = localStorage.getItem("neoncalc_history");
  history = saved ? JSON.parse(saved) : [];
  renderHistory();
}

function saveHistory() {
  localStorage.setItem("neoncalc_history", JSON.stringify(history));
}

function addToHistory(expr, result) {
  history.unshift({ expr, result });

  if (history.length > 50) history.pop();

  saveHistory();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="expr">${item.expr}</span>
      <span class="res">= ${item.result}</span>
    `;
    historyList.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
}

loadHistory();

// -------------------------
// MAIN CALCULATE
// -------------------------

function calculate() {
  let expr = display.value;
  if (!expr) return;

  secondaryDisplay.textContent = expr;

  // Factorial
  expr = expr.replace(/(\d+)!/g, "factorial($1)");

  // Combinatoria
  expr = expr.replace(/nCr\(([^,]+),([^()]+)\)/g, "nCr($1,$2)");
  expr = expr.replace(/nPr\(([^,]+),([^()]+)\)/g, "nPr($1,$2)");

  // Constantes
  expr = expr.replace(/π/g, "Math.PI");
  expr = expr.replace(/e/g, "Math.E");

  // Potencias especiales
  expr = expr.replace(/10\^(\d+|\([^()]+\))/g, "Math.pow(10,$1)");
  expr = expr.replace(/e\^(\d+|\([^()]+\))/g, "Math.pow(Math.E,$1)");

  // Logs
  expr = expr.replace(/log\(/g, "Math.log10(");
  expr = expr.replace(/ln\(/g, "Math.log(");

  // Raíz
  expr = expr.replace(/sqrt\(/g, "Math.sqrt(");

  // Potencias
  expr = expr.replace(/(\d+|\([^()]+\))\^2/g, "Math.pow($1,2)");
  expr = expr.replace(/(\d+|\([^()]+\))\^3/g, "Math.pow($1,3)");
  expr = expr.replace(/(\d+|\([^()]+\))\^(\d+)/g, "Math.pow($1,$2)");

  // mod
  expr = expr.replace(/mod\(([^,]+),([^()]+)\)/g, "($1%$2)");

  // Notación científica
  expr = expr.replace(/(\d+(\.\d+)?)[eE]([+\-]?\d+)/g, "($1*Math.pow(10,$3))");

  try {
    const result = eval(expr);

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

// End of app.js
