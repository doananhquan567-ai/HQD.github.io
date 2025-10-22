// ===========================================
// AI HQD — script.js (v7 SGK + Khảo sát hàm số)
// ===========================================

// --- DOM Elements ---
const exprInput = document.getElementById("expr-input");
const varInput = document.getElementById("var-input");
const degreeInput = document.getElementById("degree-input");
const btnCalc = document.getElementById("calc-btn");
const btnPlot = document.getElementById("plot-btn");
const btnClear = document.getElementById("clear-btn");
const resultContainer = document.getElementById("result-container");
const plotContainer = document.getElementById("plot-container");

// --- Helpers ---
function renderMath(content) {
  resultContainer.innerHTML = content;
  MathJax.typesetPromise([resultContainer]);
}

function displayError(message) {
  resultContainer.innerHTML = `<p style="color:#f87171">⚠️ ${message}</p>`;
}

function clearAll() {
  exprInput.value = "";
  resultContainer.innerHTML = "";
  Plotly.purge(plotContainer);
}

// --- 1️⃣ Đạo hàm + Lời giải SGK ---
function calculateDerivative() {
  const exprStr = exprInput.value.trim();
  const variable = varInput.value.trim() || "x";
  const degree = parseInt(degreeInput.value);

  if (!exprStr) {
    displayError("Vui lòng nhập hàm số!");
    return;
  }

  try {
    // Tính đạo hàm
    let expr = math.parse(exprStr);
    let derivative = expr;
    for (let i = 0; i < degree; i++) {
      derivative = math.derivative(derivative, variable);
    }
    const simplified = math.simplify(derivative);

    // --- Phân tích lời giải SGK ---
    let stepsHTML = `
      <div class="steps-container">
        <b>📘 Lời giải chi tiết (Chuẩn SGK):</b><br>
        <p>• Biểu thức ban đầu: \\(${math.parse(exprStr).toTex()}\\)</p>
        <p>• Áp dụng quy tắc đạo hàm (thương, tích, hằng số...):</p>
        <p>\\(f'(${variable}) = ${simplified.toTex()}\\)</p>
      </div>
    `;

    renderMath(`
      <div class="label">🧠 Kết quả rút gọn:</div>
      <div class="result-text">\\(${simplified.toTex()}\\)</div>
      ${stepsHTML}
      <hr/>
      <button id="btn-analysis" class="sub-btn">🔍 Phân tích & Khảo sát hàm số</button>
    `);

    // Gắn sự kiện khảo sát
    document.getElementById("btn-analysis").addEventListener("click", () => {
      analyzeFunction(exprStr, variable);
    });
  } catch (err) {
    displayError("Lỗi cú pháp: " + err.message);
  }
}

// --- 2️⃣ Khảo sát hàm số ---
function analyzeFunction(exprStr, variable) {
  try {
    const expr = math.parse(exprStr);
    const f = expr.compile();
    const df = math.derivative(expr, variable).compile();

    // Tập xác định: loại trừ mẫu = 0
    let domainNote = "";
    if (exprStr.includes("/")) {
      const parts = exprStr.split("/");
      const denom = parts[1];
      domainNote = `Mẫu khác 0 ⇒ ${denom} ≠ 0`;
    }

    // Bảng biến thiên (x từ -10 đến 10)
    const xValues = math.range(-10, 10, 0.5).toArray();
    const yValues = xValues.map(x => f.evaluate({ [variable]: x }));
    const dValues = xValues.map(x => df.evaluate({ [variable]: x }));

    // Tìm cực trị
    let criticalPoints = [];
    for (let i = 1; i < xValues.length - 1; i++) {
      if (dValues[i - 1] * dValues[i + 1] < 0) {
        criticalPoints.push({
          x: xValues[i],
          y: yValues[i]
        });
      }
    }

    // Render bảng biến thiên
    let tableHTML = `
      <div class="table-container">
        <b>📉 Bảng biến thiên (minh họa):</b><br>
        <table class="bt">
          <tr><th>x</th><td>-∞</td><td>...</td><td>+∞</td></tr>
          <tr><th>f'(x)</th><td>+</td><td>0</td><td>-</td></tr>
          <tr><th>f(x)</th><td>↑</td><td>cực đại</td><td>↓</td></tr>
        </table>
      </div>
    `;

    // Vẽ đồ thị f và f'
    const trace1 = {
      x: xValues, y: yValues, mode: "lines", name: "f(x)",
      line: { color: "#3b82f6", width: 3 }
    };
    const trace2 = {
      x: xValues, y: dValues, mode: "lines", name: "f'(x)",
      line: { color: "#facc15", dash: "dot", width: 2 }
    };

    const layout = {
      title: "Đồ thị f(x) và f'(x)",
      paper_bgcolor: "#0f172a",
      plot_bgcolor: "#0f172a",
      font: { color: "#f8fafc" },
      xaxis: { title: "x", gridcolor: "#334155" },
      yaxis: { title: "Giá trị", gridcolor: "#334155" },
    };

    Plotly.newPlot(plotContainer, [trace1, trace2], layout, { responsive: true });

    renderMath(`
      <h3>📊 Khảo sát hàm số</h3>
      <p><b>Tập xác định:</b> ${domainNote || "ℝ"}</p>
      ${tableHTML}
      <p><b>Cực trị gần đúng:</b> ${criticalPoints.length ? criticalPoints.map(p => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`).join(", ") : "Không có"}</p>
    `);
  } catch (err) {
    displayError("Lỗi khảo sát: " + err.message);
  }
}

// --- 3️⃣ Sự kiện ---
btnCalc.addEventListener("click", calculateDerivative);
btnPlot.addEventListener("click", () => analyzeFunction(exprInput.value.trim(), varInput.value.trim() || "x"));
btnClear.addEventListener("click", clearAll);

window.addEventListener("load", () => exprInput.focus());
