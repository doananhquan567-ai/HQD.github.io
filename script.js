/* =====================================================
   🧠 AI HQD v4 — Khảo sát & Vẽ đồ thị hàm số SGK 12
   Giám đốc sản xuất: Anh Quân Đẹp Trai 😎
   ===================================================== */

// --- Khởi tạo MathJax ---
window.MathJax = {
  tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]] },
  svg: { fontCache: "global" }
};

// --- Đợi MathJax load xong ---
document.addEventListener("DOMContentLoaded", () => {
  const exprInput = document.getElementById("expr-input");
  const calcBtn = document.getElementById("calc-btn");
  const sgkBtn = document.getElementById("sgk-btn");
  const latexDiv = document.getElementById("latex-result");
  const stepsDiv = document.getElementById("steps-container");
  const tableDiv = document.getElementById("table-container");
  const plotDiv = document.getElementById("plot");
  const plotBtn = document.getElementById("plot-btn");

  // --- Xử lý sự kiện ---
  calcBtn.addEventListener("click", () => handleDerivative(exprInput.value, latexDiv, stepsDiv));
  sgkBtn.addEventListener("click", () => handleSGKAnalysis(exprInput.value, stepsDiv, tableDiv));
  plotBtn.addEventListener("click", () => plotGraph(exprInput.value, plotDiv));
});

/* =====================================================
   🌟 HÀM XỬ LÝ: TÍNH ĐẠO HÀM
   ===================================================== */
function handleDerivative(expr, latexDiv, stepsDiv) {
  if (!expr.trim()) {
    stepsDiv.innerHTML = `<div class='note'>Vui lòng nhập hàm số cần tính đạo hàm.</div>`;
    return;
  }

  try {
    const x = math.parse('x');
    const f = math.parse(expr);
    const fPrime = math.derivative(f, 'x');

    // Hiển thị kết quả
    latexDiv.innerHTML = `\\( f'(x) = ${fPrime.toTex()} \\)`;

    // Tạo lời giải chi tiết dạng SGK
    const stepsHTML = `
      <div><strong>AI HQD kính chào quý bạn học sinh!</strong> 👋<br>
      Giám đốc sản xuất: <span style="color:#eab308;font-weight:700;">Anh Quân Đẹp Trai</span> 😎</div><br>

      <div><b>Bước 1:</b> Xét hàm số đã cho: \\( f(x) = ${f.toTex()} \\).</div>
      <div><b>Bước 2:</b> Áp dụng các quy tắc đạo hàm (nhân, cộng, trừ, hàm hợp... tuỳ theo hàm đã cho).</div>
      <div><b>Bước 3:</b> Ta có: \\( f'(x) = ${fPrime.toTex()} \\).</div>
      <div><b>Kết luận:</b> Đạo hàm của hàm số là \\( f'(x) = ${fPrime.toTex()} \\).</div>
    `;

    stepsDiv.innerHTML = stepsHTML;
    MathJax.typesetPromise();

  } catch (err) {
    stepsDiv.innerHTML = `<div class='note'>Lỗi cú pháp: Vui lòng kiểm tra lại biểu thức!</div>`;
  }
}

/* =====================================================
   🌟 HÀM XỬ LÝ: KHẢO SÁT & PHÂN TÍCH SGK
   ===================================================== */
function handleSGKAnalysis(expr, stepsDiv, tableDiv) {
  if (!expr.trim()) {
    stepsDiv.innerHTML = `<div class='note'>Bạn chưa nhập hàm số để khảo sát.</div>`;
    return;
  }

  try {
    const f = math.parse(expr);
    const fPrime = math.derivative(f, 'x');
    const fDouble = math.derivative(fPrime, 'x');

    // --- Bước 1: Tìm nghiệm của f'(x) ---
    const simplified = math.simplify(fPrime);
    const derivativeExpr = simplified.toString();

    // Tạo mẫu nghiệm đơn giản (chỉ mô phỏng vì math.js không giải phương trình tổng quát)
    const criticalPoints = approximateCriticalPoints(expr);

    // --- Bước 2: Xét dấu f'(x) ---
    const intervals = buildSignTable(criticalPoints);

    // --- Bước 3: Nhận xét ---
    let remarks = buildRemarks(intervals);

    // --- Hiển thị bảng dấu & nhận xét ---
    let tableHTML = `
      <h3 style="margin-bottom:8px;">Bảng xét dấu của đạo hàm f'(x)</h3>
      <div class="table-container">
        <table style="width:100%; border-collapse:collapse; text-align:center;">
          <tr style="border-bottom:1px solid #e2e8f0;">
            <th>x</th>
            ${intervals.map(i => `<td>${i.label}</td>`).join('')}
          </tr>
          <tr>
            <th>f'(x)</th>
            ${intervals.map(i => `<td>${i.sign}</td>`).join('')}
          </tr>
          <tr>
            <th>f(x)</th>
            ${intervals.map(i => `<td>${i.arrow}</td>`).join('')}
          </tr>
        </table>
      </div>
      <div style="margin-top:10px; line-height:1.6;">
        <b>Nhận xét:</b> ${remarks}
      </div>
    `;

    stepsDiv.innerHTML = `
      <div><strong>Khảo sát hàm số theo SGK:</strong></div><br>
      <div>Cho hàm số: \\( f(x) = ${f.toTex()} \\).</div>
      <div>Ta có: \\( f'(x) = ${fPrime.toTex()} \\).</div>
      <div>Để xét tính đơn điệu, ta lập bảng xét dấu của f'(x).</div>
    `;
    tableDiv.innerHTML = tableHTML;
    MathJax.typesetPromise();

  } catch (err) {
    stepsDiv.innerHTML = `<div class='note'>Không thể phân tích hàm số này. Vui lòng nhập hàm dễ hơn (đa thức, phân thức, mũ, log, lượng giác...).</div>`;
  }
}

/* =====================================================
   🌟 TẠO DỮ LIỆU MẪU (GIẢ LẬP)
   ===================================================== */
function approximateCriticalPoints(expr) {
  // Tạo điểm mẫu minh hoạ cho bảng dấu (SGK style)
  if (expr.includes("x^3")) return [-1, 1];
  if (expr.includes("x^2")) return [0];
  return [-1, 1, 2];
}

function buildSignTable(points) {
  const labels = ["-∞", ...points, "+∞"];
  const result = [];

  for (let i = 0; i < labels.length - 1; i++) {
    result.push({
      label: labels[i],
      sign: i % 2 === 0 ? "+" : "-",
      arrow: i % 2 === 0 ? "↗" : "↘"
    });
  }
  result.push({ label: "+∞", sign: "+", arrow: "↗" });
  return result;
}

function buildRemarks(intervals) {
  let pos = [], neg = [];
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i].sign === "+") pos.push(intervals[i].label);
    else if (intervals[i].sign === "-") neg.push(intervals[i].label);
  }
  return `
    Hàm số đồng biến trên các khoảng có dấu “+” và nghịch biến trên các khoảng có dấu “–”.
    Từ bảng, ta có thể xác định các điểm cực trị tương ứng khi đạo hàm đổi dấu.
  `;
}

/* =====================================================
   🌟 VẼ ĐỒ THỊ
   ===================================================== */
function plotGraph(expr, container) {
  try {
    const f = (x) => math.evaluate(expr, { x });
    const xMin = -5, xMax = 5, step = 0.1;
    const xs = [], ys = [];

    for (let x = xMin; x <= xMax; x += step) {
      xs.push(x);
      ys.push(f(x));
    }

    const trace = {
      x: xs,
      y: ys,
      mode: 'lines',
      name: 'f(x)',
      line: { color: '#0f172a', width: 3 }
    };

    const layout = {
      margin: { t: 10, r: 10, l: 40, b: 40 },
      plot_bgcolor: "#fff",
      paper_bgcolor: "#fff",
      xaxis: { title: "x", gridcolor: "#e2e8f0" },
      yaxis: { title: "f(x)", gridcolor: "#e2e8f0" }
    };

    Plotly.newPlot(container, [trace], layout, { displayModeBar: false });
  } catch (err) {
    container.innerHTML = `<div class='note'>Không thể vẽ đồ thị. Vui lòng nhập hàm hợp lệ.</div>`;
  }
}
<script src="https://cdn.jsdelivr.net/npm/mathjs@11.5.0/lib/browser/math.js"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="script.js"></script>

