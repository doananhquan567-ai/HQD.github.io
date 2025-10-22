// ===========================================
// AI HQD — script.js (v7.5 Chuẩn SGK Thật)
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

// --- Helper Functions ---
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

// ===========================================================
// 1️⃣ TÍNH ĐẠO HÀM + LỜI GIẢI THEO TỪNG BƯỚC
// ===========================================================
function calculateDerivative() {
  const exprStr = exprInput.value.trim();
  const variable = varInput.value.trim() || "x";
  const degree = parseInt(degreeInput.value);

  if (!exprStr) {
    displayError("Vui lòng nhập hàm số!");
    return;
  }

  try {
    let expr = math.parse(exprStr);
    let derivative = expr;

    for (let i = 0; i < degree; i++) {
      derivative = math.derivative(derivative, variable);
    }

    const simplified = math.simplify(derivative);

    const stepsHTML = `
      <div class="steps-container">
        <b>📘 Lời giải chi tiết (Chuẩn SGK):</b><br>
        <p>Bước 1️⃣: Biểu thức ban đầu: \\(${expr.toTex()}\\)</p>
        <p>Bước 2️⃣: Áp dụng quy tắc đạo hàm (thương, tích, hằng số...)</p>
        <p>Bước 3️⃣: Kết quả sau ${degree} lần đạo hàm:</p>
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

    document.getElementById("btn-analysis").addEventListener("click", () => {
      analyzeFunction(exprStr, variable);
    });
  } catch (err) {
    displayError("Lỗi cú pháp: " + err.message);
  }
}

// ===========================================================
// 2️⃣ KHẢO SÁT HÀM SỐ + BẢNG BIẾN THIÊN CHUẨN SGK
// ===========================================================
function analyzeFunction(exprStr, variable) {
  try {
    const expr = math.parse(exprStr);
    const f = expr.compile();
    const df = math.derivative(expr, variable).compile();

    // ===== Tập xác định =====
    let domain = "ℝ";
    if (exprStr.includes("/")) {
      const parts = exprStr.split("/");
      const denom = parts[1];
      domain = `ℝ \\ {x | ${denom} = 0}`;
    }

    // ===== Tạo dữ liệu khảo sát =====
    const xValues = math.range(-10, 10, 0.2).toArray();
    const yValues = xValues.map((x) => f.evaluate({ [variable]: x }));
    const dValues = xValues.map((x) => df.evaluate({ [variable]: x }));

    // ===== Tìm cực trị =====
    let criticalPoints = [];
    for (let i = 1; i < xValues.length - 1; i++) {
      if (dValues[i - 1] * dValues[i + 1] < 0) {
        criticalPoints.push({ x: xValues[i], y: yValues[i] });
      }
    }

    // ===== Xét dấu đạo hàm (tăng/giảm) =====
    let signChanges = [];
    for (let i = 1; i < xValues.length; i++) {
      if (dValues[i - 1] * dValues[i] < 0) signChanges.push(xValues[i]);
    }

    // ===== Tạo bảng biến thiên (chuẩn SGK) =====
    let btHTML = `
      <div class="bt-container">
        <b>📉 Bảng biến thiên (Chuẩn SGK):</b>
        <table class="bt-table">
          <tr><th>x</th><td>-∞</td>${signChanges
            .map((x) => `<td>${x.toFixed(2)}</td>`)
            .join("")}<td>+∞</td></tr>
          <tr><th>f'(x)</th><td>${dValues[0] > 0 ? "+" : "-"}</td>${signChanges
            .map(() => "<td>0</td>")
            .join("")}<td>${dValues.at(-1) > 0 ? "+" : "-"}</td></tr>
          <tr><th>f(x)</th><td>${dValues[0] > 0 ? "↑" : "↓"}</td>${signChanges
            .map((_, i) =>
              dValues[0] > 0
                ? "<td>cực đại</td>"
                : "<td>cực tiểu</td>"
            )
            .join("")}<td>${dValues.at(-1) > 0 ? "↑" : "↓"}</td></tr>
        </table>
      </div>
    `;

    // ===== Đồ thị f và f' =====
    const trace1 = {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      name: "f(x)",
      line: { color: "#3b82f6", width: 3 },
    };
    const trace2 = {
      x: xValues,
      y: dValues,
      type: "scatter",
      mode: "lines",
      name: "f'(x)",
      line: { color: "#facc15", dash: "dot", width: 2 },
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

    // ===== Hiển thị kết quả =====
    renderMath(`
      <h3>📊 Khảo sát hàm số</h3>
      <p><b>Tập xác định:</b> ${domain}</p>
      ${btHTML}
      <p><b>Cực trị gần đúng:</b> ${
        criticalPoints.length
          ? criticalPoints
              .map((p) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`)
              .join(", ")
          : "Không có"
      }</p>
      <p><b>Kết luận:</b> Hàm số ${dValues[0] > 0 ? "nghịch biến" : "đồng biến"} trên từng khoảng theo bảng biến thiên ở trên.</p>
    `);
  } catch (err) {
    displayError("Lỗi khảo sát: " + err.message);
  }
}

// ===========================================================
// 3️⃣ SỰ KIỆN
// ===========================================================
btnCalc.addEventListener("click", calculateDerivative);
btnPlot.addEventListener("click", () =>
  analyzeFunction(exprInput.value.trim(), varInput.value.trim() || "x")
);
btnClear.addEventListener("click", clearAll);
window.addEventListener("load", () => exprInput.focus());
