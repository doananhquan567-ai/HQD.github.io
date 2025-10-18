/* =====================================================
   AI HQD — script.js (phiên bản nâng cấp SGK)
   Mục tiêu:
   - Giải đạo hàm & khảo sát hàm số theo SGK Toán 12
   - Hiển thị từng bước chi tiết, dễ hiểu, sang trọng
   - Giữ nguyên giao diện gốc (index.html + style.css)
   ===================================================== */

/* ------------------------- Khởi tạo ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const exprInput = document.getElementById("exprInput");
  const varInput = document.getElementById("variableInput");
  const deriveBtn = document.getElementById("deriveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const stepsContainer = document.getElementById("stepsContainer");
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");
  const plotRoot = document.getElementById("plotRoot");

  // Bổ sung nút "Khảo sát & Vẽ đồ thị SGK"
  const analyzeBtn = document.createElement("button");
  analyzeBtn.id = "analyzeBtn";
  analyzeBtn.className = "btn primary";
  analyzeBtn.textContent = "Khảo sát & Vẽ đồ thị SGK";
  deriveBtn.parentElement.appendChild(analyzeBtn);

  /* ----------- Nút Giải Đạo Hàm ----------- */
  deriveBtn.addEventListener("click", () => {
    const expr = exprInput.value.trim();
    const variable = varInput.value || "x";
    if (!expr) return alert("Hãy nhập biểu thức cần đạo hàm.");
    solveDerivative(expr, variable);
  });

  /* ----------- Nút Khảo Sát SGK ----------- */
  analyzeBtn.addEventListener("click", () => {
    const expr = exprInput.value.trim();
    const variable = varInput.value || "x";
    if (!expr) return alert("Hãy nhập biểu thức cần khảo sát.");
    analyzeFunction(expr, variable);
  });

  /* ----------- Nút Xóa ----------- */
  clearBtn.addEventListener("click", () => {
    exprInput.value = "";
    resultText.textContent = "—";
    resultLatex.innerHTML = "";
    stepsContainer.innerHTML = "Nhấn 'Tính đạo hàm' hoặc 'Khảo sát & Vẽ đồ thị SGK'.";
    Plotly.purge(plotRoot);
  });
});

/* =====================================================
   1️⃣  HÀM GIẢI ĐẠO HÀM (chi tiết, SGK-style)
   ===================================================== */
function solveDerivative(expr, variable = "x") {
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");
  const stepsContainer = document.getElementById("stepsContainer");

  try {
    const derivative = math.derivative(expr, variable);
    const simplified = math.simplify(derivative.toString());
    const latex = simplified.toTex();

    // Lời giải SGK-style
    const stepsHTML = `
      <div class="sgk-header">
        <h3>📘 Giải đạo hàm từng bước</h3>
        <p><strong>AI HQD</strong> – Giám đốc sản xuất: <strong>Anh Quân Đẹp Trai</strong></p>
      </div>
      <div class="sgk-step"><b>Bước 1.</b> Ta có hàm số: \\( f(${variable}) = ${math.parse(expr).toTex()} \\)</div>
      <div class="sgk-step"><b>Bước 2.</b> Áp dụng quy tắc đạo hàm tương ứng cho từng phần của biểu thức.</div>
      <div class="sgk-step"><b>Bước 3.</b> Ta được đạo hàm: \\( f'(${variable}) = ${derivative.toTex()} \\)</div>
      <div class="sgk-step"><b>Bước 4.</b> Rút gọn kết quả: \\( f'(${variable}) = ${latex} \\)</div>
      <div class="sgk-step"><b>Kết luận:</b> Đạo hàm của hàm số là \\( f'(${variable}) = ${latex} \\)</div>
    `;

    document.getElementById("stepsContainer").innerHTML = stepsHTML;
    resultText.textContent = simplified.toString();
    resultLatex.innerHTML = `\\( f'(${variable}) = ${latex} \\)`;
    MathJax.typesetPromise();

    plotFunctionGraph(expr, derivative.toString(), variable);
  } catch (err) {
    stepsContainer.innerHTML = `<div class="error">❌ Lỗi: ${err.message}</div>`;
  }
}

/* =====================================================
   2️⃣  HÀM KHẢO SÁT & VẼ ĐỒ THỊ (SGK-style)
   ===================================================== */
function analyzeFunction(expr, variable = "x") {
  const stepsContainer = document.getElementById("stepsContainer");
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");

  try {
    const derivative = math.derivative(expr, variable).toString();
    const second = math.derivative(derivative, variable).toString();

    const domain = determineDomain(expr, variable);

    const stepsHTML = `
      <div class="sgk-header">
        <h3>🧭 Khảo sát hàm số theo SGK Toán 12</h3>
        <p><strong>AI HQD</strong> – Giám đốc sản xuất: <strong>Anh Quân Đẹp Trai</strong></p>
      </div>

      <div class="sgk-step"><b>Bước 1.</b> Tập xác định: ${domain}</div>

      <div class="sgk-step"><b>Bước 2.</b> Tính đạo hàm bậc nhất:</div>
      <div class="sgk-formula">\\( f'(${variable}) = ${math.parse(derivative).toTex()} \\)</div>

      <div class="sgk-step"><b>Bước 3.</b> Tính đạo hàm bậc hai:</div>
      <div class="sgk-formula">\\( f''(${variable}) = ${math.parse(second).toTex()} \\)</div>

      <div class="sgk-step"><b>Bước 4.</b> Xét các điểm tới hạn, cực trị và tính đơn điệu của hàm số.</div>

      <div class="sgk-step"><b>Bước 5.</b> Dựa vào dấu của \\( f'(${variable}) \\) và \\( f''(${variable}) \\), lập bảng biến thiên và vẽ đồ thị minh họa.</div>
    `;

    stepsContainer.innerHTML = stepsHTML;
    resultText.textContent = "Khảo sát hoàn tất – xem đồ thị bên dưới.";
    resultLatex.innerHTML = `\\( f'(${variable}) = ${math.parse(derivative).toTex()} \\)`;
    MathJax.typesetPromise();

    plotFunctionGraph(expr, derivative, variable);
  } catch (err) {
    stepsContainer.innerHTML = `<div class="error">❌ Lỗi: ${err.message}</div>`;
  }
}

/* =====================================================
   3️⃣  TÌM MIỀN XÁC ĐỊNH (đơn giản)
   ===================================================== */
function determineDomain(expr, variable) {
  if (expr.includes("/")) return "Tập xác định là tất cả các giá trị của " + variable + " sao cho mẫu khác 0.";
  if (expr.includes("log")) return "Tập xác định là tập các giá trị của " + variable + " để biểu thức trong log > 0.";
  if (expr.includes("sqrt")) return "Tập xác định là tập các giá trị của " + variable + " để biểu thức trong căn ≥ 0.";
  return "Tập xác định là \\( \\mathbb{R} \\).";
}

/* =====================================================
   4️⃣  VẼ ĐỒ THỊ (f và f')
   ===================================================== */
function plotFunctionGraph(expr, derivativeExpr, variable) {
  const xMin = parseFloat(document.getElementById("xMin").value) || -6;
  const xMax = parseFloat(document.getElementById("xMax").value) || 6;
  const plotRoot = document.getElementById("plotRoot");

  const scope = {};
  const f = math.parse(expr).compile();
  const df = math.parse(derivativeExpr).compile();

  const xValues = math.range(xMin, xMax, 0.1).toArray();
  const yValues = xValues.map((x) => {
    scope[variable] = x;
    try { return f.evaluate(scope); } catch { return NaN; }
  });
  const dyValues = xValues.map((x) => {
    scope[variable] = x;
    try { return df.evaluate(scope); } catch { return NaN; }
  });

  const trace1 = { x: xValues, y: yValues, mode: "lines", name: "f(x)", line: { width: 3 } };
  const trace2 = { x: xValues, y: dyValues, mode: "lines", name: "f'(x)", line: { dash: "dot" } };

  Plotly.newPlot(plotRoot, [trace1, trace2], {
    margin: { t: 20 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    xaxis: { title: variable },
    yaxis: { title: "Giá trị" },
    legend: { orientation: "h" }
  });
}

/* =====================================================
   5️⃣  TIỆN ÍCH
   ===================================================== */
function displayMessage(html) {
  const container = document.getElementById("stepsContainer");
  container.innerHTML = html;
}
/* AI HQD v3 — script.js
   Khảo sát & vẽ đồ thị SGK (BBT, bảng xét dấu, nhận xét)
   Yêu cầu: đặt cùng thư mục với index.html và style.css
*/

document.addEventListener("DOMContentLoaded", () => {
  // elements
  const exprInput = document.getElementById("exprInput");
  const variableInput = document.getElementById("variableInput");
  const deriveBtn = document.getElementById("deriveBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const plotUpdate = document.getElementById("plotUpdate");
  const xMinInput = document.getElementById("xMin");
  const xMaxInput = document.getElementById("xMax");

  const stepsContainer = document.getElementById("stepsContainer");
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");
  const plotRoot = document.getElementById("plotRoot");

  // toggle UI: keeps the page minimal (header visible)
  const toggleBtn = document.getElementById("toggle-ui");
  const mainApp = document.getElementById("mainApp");
  toggleBtn.addEventListener("click", () => {
    mainApp.classList.toggle("show");
    toggleBtn.textContent = mainApp.classList.contains("show") ? "Ẩn công cụ" : "Hiện / Ẩn công cụ";
  });

  // examples
  document.querySelectorAll(".example-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      exprInput.value = btn.dataset.expr;
    });
  });

  // Derivative
  deriveBtn.addEventListener("click", () => {
    const expr = exprInput.value.trim();
    const variable = (variableInput.value || "x").trim();
    if (!expr) { alert("Vui lòng nhập biểu thức!"); return; }
    computeDerivative(expr, variable);
  });

  // Analyze SGK (BBT)
  analyzeBtn.addEventListener("click", () => {
    const expr = exprInput.value.trim();
    const variable = (variableInput.value || "x").trim();
    if (!expr) { alert("Vui lòng nhập hàm số!"); return; }
    analyzeFunctionSGK(expr, variable);
  });

  clearBtn.addEventListener("click", () => {
    exprInput.value = "";
    resultText.textContent = "—";
    resultLatex.innerHTML = "";
    stepsContainer.innerHTML = "Nhấn 'Tính đạo hàm' hoặc 'Phân tích SGK (BBT)' để bắt đầu.";
    try { Plotly.purge(plotRoot); } catch(e){}
  });

  plotUpdate.addEventListener("click", () => {
    const expr = exprInput.value.trim();
    const variable = (variableInput.value || "x").trim();
    if (!expr) return;
    plotFunction(expr, variable);
  });

  // initial minimal state
  mainApp.classList.remove("show");
});

/* ----------------------- Utility helpers ----------------------- */

function safeParseToTex(expr) {
  try { return math.parse(String(expr)).toTex({parenthesis:'auto'}); } catch { return expr; }
}

function safeCompile(expr) {
  try { return math.parse(String(expr)).compile(); } catch { return null; }
}

function linspace(a,b,n){ const out=[]; if(n<=1){ out.push(a); return out;} const step=(b-a)/(n-1); for(let i=0;i<n;i++) out.push(a + step*i); return out; }

/* ----------------------- Derivative computation ----------------------- */

function computeDerivative(expr, variable='x') {
  const stepsContainer = document.getElementById("stepsContainer");
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");
  try {
    let cur = expr;
    const order = Number(document.getElementById("orderSelect").value || 1);
    for(let i=0;i<order;i++){
      cur = math.derivative(cur, variable).toString();
    }
    const simplified = math.simplify(cur).toString();
    const tex = safeParseToTex(simplified);

    // SGK-style steps
    const html = `
      <div class="sgk-header">
        <h3>📘 Giải đạo hàm từng bước</h3>
        <p><strong>AI HQD kính chào</strong> — Giám đốc sản xuất: <strong>ANH QUÂN ĐẸP TRAI</strong></p>
      </div>
      <div class="sgk-step"><b>Bước 1.</b> Hàm ban đầu: \\( f(${variable}) = ${safeParseToTex(expr)} \\)</div>
      <div class="sgk-step"><b>Bước 2.</b> Lấy đạo hàm bậc ${order} (theo biến ${variable}).</div>
      <div class="sgk-step"><b>Bước 3.</b> Kết quả: \\( f^{(${order})}(${variable}) = ${safeParseToTex(cur)} \\)</div>
      <div class="sgk-step"><b>Bước 4.</b> Rút gọn: \\( f^{(${order})}(${variable}) = ${tex} \\)</div>
    `;
    stepsContainer.innerHTML = html;
    resultText.textContent = simplified;
    resultLatex.innerHTML = `\\(${tex}\\)`;
    MathJax.typesetPromise();

    // plot f only by default
    plotFunction(expr, variable);
  } catch (e) {
    stepsContainer.innerHTML = `<div class="error">Lỗi: ${escapeHtml(String(e.message||e))}</div>`;
  }
}

/* ----------------------- SGK Analysis: BBT + sign table ----------------------- */

function analyzeFunctionSGK(expr, variable='x') {
  const stepsContainer = document.getElementById("stepsContainer");
  try {
    // domain (simple heuristic)
    const domain = determineDomain(expr);

    // derivative expressions
    const f1Expr = math.derivative(expr, variable).toString();
    const f2Expr = (() => { try { return math.derivative(f1Expr, variable).toString(); } catch { return null; } })();

    // critical points numeric
    const criticals = findRootsNumeric(f1Expr, variable, -50, 50, 1200).map(r => roundTo(r, 6));

    // sign table
    const signTableHTML = buildSignTableHTML(f1Expr, variable, criticals);

    // variation table & extremums
    const variationHTML = buildVariationHTML(expr, f1Expr, variable, criticals);

    // remarks
    const remarksHTML = buildRemarksHTML(expr, f1Expr, f2Expr, variable, criticals);

    const html = `
      <div class="sgk-header">
        <h3>🧭 Khảo sát hàm số theo SGK</h3>
        <p><strong>AI HQD kính chào</strong> — Giám đốc sản xuất: <strong>ANH QUÂN ĐẸP TRAI</strong></p>
      </div>

      <div class="sgk-step"><b>Bước 1.</b> Tập xác định: ${domain}</div>

      <div class="sgk-step"><b>Bước 2.</b> Tính đạo hàm bậc nhất và bậc hai:</div>
      <div class="sgk-formula">\\( f'(${variable}) = ${safeParseToTex(f1Expr)} \\)</div>
      ${f2Expr ? `<div class="sgk-formula">\\( f''(${variable}) = ${safeParseToTex(f2Expr)} \\)</div>` : ''}

      <div class="sgk-step"><b>Bước 3.</b> Giải \\( f'(${variable}) = 0 \\) → nghiệm: ${criticals.length? criticals.join(', '): 'Không tìm thấy (trong khoảng khảo sát)'}</div>

      <div class="sgk-step"><b>Bước 4.</b> Bảng xét dấu của \\( f'(${variable}) \\):</div>
      ${signTableHTML}

      <div class="sgk-step"><b>Bước 5.</b> Bảng biến thiên:</div>
      ${variationHTML}

      <div class="sgk-step"><b>Bước 6.</b> Nhận xét:</div>
      ${remarksHTML}

      <div class="sgk-step"><b>Bước 7.</

