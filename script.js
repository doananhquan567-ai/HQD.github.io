// =======================================================
// AI HQD — script.js (v5 full)
// =======================================================

// --- Lấy phần tử DOM ---
const inputExpr = document.getElementById("expr-input");
const varInput = document.getElementById("var-input");
const orderInput = document.getElementById("order-input");
const btnCalc = document.getElementById("calc-btn");
const btnPlot = document.getElementById("plot-btn");
const btnClear = document.getElementById("clear-btn");
const latexResult = document.getElementById("latex-result");
const stepsContainer = document.getElementById("steps-container");
const tableContainer = document.getElementById("table-container");
const plotRoot = document.getElementById("plot-root");

// --- Hàm hiển thị công thức bằng KaTeX ---
function renderLatex(latex, el) {
  try {
    katex.render(latex, el, { throwOnError: false });
  } catch {
    el.textContent = latex;
  }
}

// --- Hàm tính đạo hàm ---
function computeDerivative() {
  const expr = inputExpr.value.trim();
  const variable = varInput.value.trim() || "x";
  const order = parseInt(orderInput.value);

  if (!expr) {
    alert("Vui lòng nhập biểu thức hàm số!");
    return;
  }

  try {
    const node = math.parse(expr);
    let derivative = node;

    for (let i = 0; i < order; i++) {
      derivative = math.derivative(derivative, variable);
    }

    const simplified = math.simplify(derivative);
    const latex = simplified.toTex();

    renderLatex(latex, latexResult);
    stepsContainer.innerHTML = `
      <b>Bước 1:</b> Xét hàm số f(${variable}) = ${expr}<br>
      <b>Bước 2:</b> Lấy đạo hàm bậc ${order}:<br>
      f${"'".repeat(order)}(${variable}) = ${latex}<br>
      <b>Kết luận:</b> Đạo hàm rút gọn: ${latex}
    `;
  } catch (err) {
    latexResult.textContent = "Lỗi: không thể tính đạo hàm!";
    stepsContainer.textContent = err.message;
  }
}

// --- Hàm khảo sát & vẽ đồ thị ---
function plotFunction() {
  const expr = inputExpr.value.trim();
  const variable = varInput.value.trim() || "x";

  if (!expr) {
    alert("Vui lòng nhập hàm số để khảo sát!");
    return;
  }

  try {
    const f = math.compile(expr);
    const xValues = math.range(-10, 10, 0.1).toArray();
    const yValues = xValues.map((x) => {
      try {
        return f.evaluate({ [variable]: x });
      } catch {
        return NaN;
      }
    });

    // Tính đạo hàm bậc 1
    const d = math.derivative(expr, variable);
    const dLatex = d.toTex();

    // Cực trị (tìm nghiệm của f'(x)=0)
    let critical = [];
    try {
      const simplified = math.simplify(d);
      const roots = math
        .roots(simplified.evaluate ? simplified : math.parse(simplified.toString()))
        .filter((x) => !isNaN(x));
      critical = roots;
    } catch {}

    // Vẽ đồ thị
    const trace1 = {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      name: `f(${variable})`,
      line: { color: "#0f4b8a", width: 2.5 },
    };

    const layout = {
      title: `Đồ thị hàm số f(${variable}) = ${expr}`,
      xaxis: { title: variable },
      yaxis: { title: "f(x)" },
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
      font: { family: "Montserrat", size: 13 },
    };

    Plotly.newPlot(plotRoot, [trace1], layout, { responsive: true });

    // Hiển thị thông tin khảo sát
    tableContainer.innerHTML = `
      <p><b>Đạo hàm bậc 1:</b> \\(${dLatex}\\)</p>
      <p><b>Gợi ý khảo sát:</b> Tìm nghiệm của f'(${variable}) = 0 để xác định cực trị.</p>
      <p><b>Miền khảo sát:</b> x ∈ [-10, 10]</p>
    `;
    renderMathInElement(tableContainer);
  } catch (err) {
    tableContainer.textContent = "Lỗi khi vẽ đồ thị!";
  }
}

// --- Xóa toàn bộ ---
function clearAll() {
  inputExpr.value = "";
  latexResult.textContent = "—";
  stepsContainer.textContent = "Nhấn 'Tính đạo hàm' để xem lời giải chi tiết.";
  tableContainer.textContent = "—";
  plotRoot.innerHTML = "";
}

// --- Gán sự kiện ---
btnCalc.addEventListener("click", computeDerivative);
btnPlot.addEventListener("click", plotFunction);
btnClear.addEventListener("click", clearAll);
