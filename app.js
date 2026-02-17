const display = document.getElementById("display");
let angleMode = "DEG"; // DEG or RAD

function setMode(mode) {
  angleMode = mode;
  document.getElementById("degBtn").classList.toggle("active", mode === "DEG");
  document.getElementById("radBtn").classList.toggle("active", mode === "RAD");
}

function press(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
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
  display.value = Math.random();
}

function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0) return NaN;
  let r = 1;
  for (let i = 1; i <= n; i++) r *= i;
  return r;
}

function toRad(x) {
  return x * Math.PI / 180;
}

// DEG versions for trig
function sinDEG(x) { return Math.sin(toRad(x)); }
function cosDEG(x) { return Math.cos(toRad(x)); }
function tanDEG(x) { return Math.tan(toRad(x)); }

function calculate() {
  let expr = display.value;

  // factorial: 5! -> factorial(5)
  expr = expr.replace(/(\d+)!/g, "factorial($1)");

  // constants
  expr = expr.replace(/π/g, "Math.PI");
  expr = expr.replace(/e/g, "Math.E");

  // logs and sqrt
  expr = expr.replace(/log\(/g, "Math.log10(");
  expr = expr.replace(/ln\(/g, "Math.log(");
  expr = expr.replace(/sqrt\(/g, "Math.sqrt(");

  // x^2 -> (x)**2
  expr = expr.replace(/(\d+|\))\^2/g, "($1)**2");

  // a^b -> (a)**(b)
  expr = expr.replace(/(\d+|\))\^(\d+)/g, "($1)**($2)");

  // trig functions: wrap depending on angleMode
  function wrap(fn) {
    const regex = new RegExp(fn + "\\(", "g");
    if (angleMode === "DEG") {
      expr = expr.replace(regex, fn + "DEG(");
    } else {
      expr = expr.replace(regex, "Math." + fn + "(");
    }
  }

  wrap("sin");
  wrap("cos");
  wrap("tan");

  try {
    display.value = eval(expr);
  } catch (e) {
    display.value = "Error";
  }
}
