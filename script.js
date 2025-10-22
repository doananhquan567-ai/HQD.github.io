// ================================================
// AI HQD — script.js (v8.0 SGK Pro)
// ================================================

// --- DOM Elements ---
const exprInput = document.getElementById("expr-input");
const varInput = document.getElementById("var-input");
const degreeInput = document.getElementById("degree-input");
const btnCalc = document.getElementById("calc-btn");
const btnPlot = document.getElementById("plot-btn");
const btnClear = document.getElementById("clear-btn");
const resultContainer = document.getElementById("result-container");
const plotContainer = document.getElementById("plot-container");

// --- Render & Error ---
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

// =======================================================
// 1️⃣ XÁC ĐỊNH LOẠI HÀM (AI SGK Pro)
// =======================================================
function detectFunctionType(exprStr) {
  if (exprStr.includes("sin") || exprStr.includes("cos") || exprStr.includes("tan"))
    return "trigonometric";
  if (exprStr.includes("log") || exprStr.includes("ln")) return "logarithmic";
  if (exprStr.includes("sqrt")) return "square_root";
  if (exprStr.includes("/")) return "rational";
  if (exprStr.includes("^")) {
    const degreeMatch = exprStr.match(/\^(\d+)/);
    if (degreeMatch && parseInt(degreeMatch[1]) === 2) return "quadratic";
    if (degreeMatch && parseInt(degreeMatch[1]) === 3) return "cubic";
  }
  return "general";
}

// =======================================================
// 2️⃣ TÍNH ĐẠO HÀM + GIẢI THEO QUY TẮC SGK
// =======================================================
function calculateDerivative() {
  const exprStr = exprInput.value.trim();
  const variable = varInput.value.trim() || "x";
  const degree = parseInt(degreeInput.value);
  if (!exprStr) return displayError("Vui lòng nhập hàm số!");

  try {
    const type = detectFunctionType(exprStr);
    const expr = math.parse(exprStr);
    let derivative = expr;

    for (let i = 0; i < degree; i++) {
      derivative = math.derivative(derivative, variable);
    }

    const simplified = math.simplify(derivative);
    let rule = "";

    switch (type) {
      case "quadratic":
        rule = "Hàm bậc 2: f'(x) = 2ax + b";
        break;
      case "cubic":
        rule = "Hàm bậc 3: f'(x) = 3ax² + 2bx + c";
        break;
      case "rational":
        rule = "Phân thức: (u/v)' = (u'v - uv') / v²";
        break;
      case "trigonometric":
        rule = "Lượng giác: (sin)' = cos, (cos)' = -sin, (tan)' = 1/cos²";
        break;
      case "square_root":
        rule = "Căn: (√u)' = u' / (2√u)";
        break;
      case "logarithmic":
        rule = "Log: (ln u)' = u'/u, (log_a u)' = u' / (u ln a)";
        break;
      default:
        rule = "Áp dụng quy tắc tổng, tích, thương, hợp của đạo hàm.";
    }

    const html = `
      <div class="rule-box">
        <b>📚 Nhận dạng:</b> ${type.toUpperCase()} <br/>
        <b>📘 Quy tắc áp dụng:</b> ${rule}
      </div>
      <p><b>Bước 1️⃣:</b> Hàm ban đầu: \\(${expr.toTex()}\\)</p>
      <p><b>Bước 2️⃣:</b> Đạo hàm ${degree} lần:</p>
      <p>\\(f'(${variable}) = ${simplified.toTex()}\\)</p>
      <hr/>
      <button id="btn-analysis" class="sub-btn">🔍 Khảo sát hàm số (Chuẩn SGK)</button>
    `;

    renderMath(html);

    document.getElementById("btn-analysis").addEventListener("click", () =>
      analyzeFunction(exprStr, variable)
    );
  } catch (err) {
    displayError("Lỗi cú pháp: " + err.message);
  }
}

// =======================================================
// 3️⃣ KHẢO SÁT HÀM SỐ CHUẨN SGK
// =======================================================
function analyzeFunction(exprStr, variable) {
  try {
    const expr = math.parse(exprStr);
    const f = expr.compile();
    const df = math.derivative(expr, variable).compile();

    let domain = "ℝ";
    if (exprStr.includes("/")) {
      const parts = exprStr.split("/");
      const denom = parts[1];
      domain = `ℝ \\ {x | ${denom} = 0}`;
    }

    const xValues = math.range(-10, 10, 0.2).toArray();
    const yValues = xValues.map((x) => f.evaluate({ [variable]: x }));
    const dValues = xValues.map((x) => df.evaluate({ [variable]: x }));

    const criticalPoints = [];
    for (let i = 1; i < xValues.length - 1; i++) {
      if (dValues[i - 1] * dValues[i + 1] < 0) {
        criticalPoints.push({ x: xValues[i], y: yValues[i] });
      }
    }

    const signChanges = [];
    for (let i = 1; i < xValues.length; i++) {
      if (dValues[i - 1] * dValues[i] < 0) signChanges.push(xValues[i]);
    }

    const btHTML = `
      <div class="bt-container">
        <b>📉 Bảng biến thiên (Chuẩn SGK):</b>
        <table class="bt-table">
          <tr><th>x</th><td>-∞</td>${signChanges.map(x => `<td>${x.toFixed(2)}</td>`).join("")}<td>+∞</td></tr>
          <tr><th>f'(x)</th><td>${dValues[0]>0?"+":"-"}</td>${signChanges.map(()=>"<td>0</td>").join("")}<td>${dValues.at(-1)>0?"+":"-"}</td></tr>
          <tr><th>f(x)</th><td>${dValues[0]>0?"↑":"↓"}</td>${signChanges.map(()=>"<td>cực trị</td>").join("")}<td>${dValues.at(-1)>0?"↑":"↓"}</td></tr>
        </table>
      </div>
    `;

    const trace1 = { x: xValues, y: yValues, mode: "lines", name: "f(x)", line: { color: "#3b82f6", width: 3 }};
    const trace2 = { x: xValues, y: dValues, mode: "lines", name: "f'(x)", line: { color: "#facc15", dash: "dot", width: 2 }};
    const layout = {
      title: "Đồ thị f(x) và f'(x)",
      paper_bgcolor: "#0f172a", plot_bgcolor: "#0f172a",
      font: { color: "#f8fafc" },
      xaxis: { title: "x", gridcolor: "#334155" },
      yaxis: { title: "Giá trị", gridcolor: "#334155" },
    };
    Plotly.newPlot(plotContainer, [trace1, trace2], layout);

    renderMath(`
      <h3>📊 Khảo sát hàm số</h3>
      <p><b>Tập xác định:</b> ${domain}</p>
      ${btHTML}
      <p><b>Cực trị gần đúng:</b> ${criticalPoints.length ? criticalPoints.map(p=>`(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`).join(", ") : "Không có"}</p>
      <p><b>Kết luận:</b> Hàm ${dValues[0]>0?"đồng biến":"nghịch biến"} trên từng khoảng theo bảng biến thiên ở trên.</p>
    `);
  } catch (err) {
    displayError("Lỗi khảo sát: " + err.message);
  }
}

// =======================================================
// 4️⃣ SỰ KIỆN
// =======================================================
btnCalc.addEventListener("click", calculateDerivative);
btnPlot.addEventListener("click", () => analyzeFunction(exprInput.value.trim(), varInput.value.trim() || "x"));
btnClear.addEventListener("click", clearAll);
window.addEventListener("load", () => exprInput.focus());
