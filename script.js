// ===========================================
// AI HQD — script.js (v6 FINAL)
// ===========================================

// --- DOM Element References ---
const exprInput = document.getElementById("expr-input");
const varInput = document.getElementById("var-input");
const degreeInput = document.getElementById("degree-input");
const btnCalc = document.getElementById("calc-btn");
const btnPlot = document.getElementById("plot-btn");
const btnClear = document.getElementById("clear-btn");
const resultContainer = document.getElementById("result-container");
const plotContainer = document.getElementById("plot-container");

// --- Helper Functions ---
function renderMath(content) {
  resultContainer.innerHTML = content;
  MathJax.typesetPromise([resultContainer]);
}

function displayError(message) {
  resultContainer.innerHTML = `<p style="color: #f87171;">⚠️ ${message}</p>`;
}

function clearAll() {
  exprInput.value = "";
  resultContainer.innerHTML = "";
  Plotly.purge(plotContainer);
}

// --- Derivative Calculation Function ---
function calculateDerivative() {
  const exprStr = exprInput.value.trim();
  const variable = varInput.value.trim() || "x";
  const degree = parseInt(degreeInput.value);

  if (!exprStr) {
    displayError("Vui lòng nhập hàm số!");
    return;
  }

  try {
    // Parse biểu thức gốc
    let expr = math.parse(exprStr);
    let derivative = expr;

    // Tính đạo hàm bậc n
    for (let i = 0; i < degree; i++) {
      derivative = math.derivative(derivative, variable);
    }

    // Rút gọn
    const simplified = math.simplify(derivative);

    // Hiển thị kết quả
    const resultHTML = `
      <div class="label">🧠 Kết quả rút gọn:</div>
      <div class="result-text">\\(${simplified.toTex()}\\)</div>
      <div class="steps-container">
        <b>Lời giải chi tiết:</b><br>
        Bước 1️⃣: Biểu thức ban đầu \\(${math.parse(exprStr).toTex()}\\)<br>
        Bước 2️⃣: Đạo hàm ${degree} lần theo biến ${variable}.<br>
        Bước 3️⃣: Kết quả cuối cùng: \\(${simplified.toTex()}\\)
      </div>
    `;

    renderMath(resultHTML);
  } catch (err) {
    displayError("Lỗi cú pháp: " + err.message);
  }
}

// --- Plot Function ---
function plotGraph() {
  const exprStr = exprInput.value.trim();
  const variable = varInput.value.trim() || "x";

  if (!exprStr) {
    displayError("Nhập hàm trước khi vẽ đồ thị!");
    return;
  }

  try {
    const node = math.parse(exprStr);
    const code = node.compile();

    const xValues = math.range(-10, 10, 0.1).toArray();
    const yValues = xValues.map((x) => {
      return code.evaluate({ [variable]: x });
    });

    const trace = {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      name: "f(x)",
      line: { color: "#3b82f6", width: 3 },
    };

    const layout = {
      title: "Đồ thị hàm số",
      paper_bgcolor: "#0f172a",
      plot_bgcolor: "#0f172a",
      font: { color: "#f8fafc" },
      xaxis: { title: "x", gridcolor: "#334155" },
      yaxis: { title: "f(x)", gridcolor: "#334155" },
    };

    Plotly.newPlot(plotContainer, [trace], layout, { responsive: true });
  } catch (err) {
    displayError("Không thể vẽ đồ thị: " + err.message);
  }
}

// --- Event Listeners ---
btnCalc.addEventListener("click", calculateDerivative);
btnPlot.addEventListener("click", plotGraph);
btnClear.addEventListener("click", clearAll);

// --- Auto Focus on Load ---
window.addEventListener("load", () => {
  exprInput.focus();
});
