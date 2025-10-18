// =============================
// AI HQD — script.js (v4 Fixed)
// =============================

// Lấy các phần tử trong DOM
const inputExpr = document.getElementById("expr-input");
const btnCalc = document.getElementById("calc-btn");
const btnSGK = document.getElementById("sgk-btn");
const btnPlot = document.getElementById("plot-btn");
const latexResult = document.getElementById("latex-result");
const stepsContainer = document.getElementById("steps-container");
const tableContainer = document.getElementById("table-container");

// Hàm hiển thị kết quả bằng MathJax
function renderMath(latex, container) {
  container.innerHTML = `\\(${latex}\\)`;
  if (window.MathJax) MathJax.typesetPromise([container]);
}

// Hàm tính đạo hàm SGK
btnCalc.addEventListener("click", () => {
  const expr = inputExpr.value.trim();
  if (!expr) {
    alert("⚠️ Hãy nhập biểu thức f(x)!");
    return;
  }

  try {
    const scope = { x: 1 };
    const derivative = math.derivative(expr, "x").toString();
    const simplified = math.simplify(derivative).toString();

    latexResult.innerHTML = `<b>Kết quả:</b> Đạo hàm của f(x) là:`;
    renderMath(`f'(x) = ${math.parse(simplified).toTex()}`, latexResult);

    stepsContainer.innerHTML = `
      <h4>🧮 Lời giải từng bước (Chuẩn SGK)</h4>
      <p><b>Bước 1:</b> Biểu thức ban đầu: \\( f(x) = ${math.parse(expr).toTex()} \\)</p>
      <p><b>Bước 2:</b> Áp dụng các quy tắc đạo hàm cơ bản (tổng, hiệu, tích, thương, hàm hợp...)</p>
      <p><b>Bước 3:</b> Đạo hàm: \\( f'(x) = ${math.parse(derivative).toTex()} \\)</p>
      <p><b>Bước 4:</b> Rút gọn kết quả: \\( f'(x) = ${math.parse(simplified).toTex()} \\)</p>
    `;
    MathJax.typesetPromise([stepsContainer]);

    // Reset bảng & đồ thị
    tableContainer.innerHTML = "";
    document.getElementById("plot").innerHTML = "";
  } catch (err) {
    alert("❌ Lỗi cú pháp trong biểu thức. Vui lòng kiểm tra lại!");
    console.error(err);
  }
});

// Hàm khảo sát SGK (bảng dấu + đồ thị)
btnSGK.addEventListener("click", () => {
  const expr = inputExpr.value.trim();
  if (!expr) return alert("⚠️ Hãy nhập hàm số trước!");

  try {
    const f = math.parse(expr).compile();
    const f1 = math.derivative(expr, "x").compile();

    // Tính giá trị tại các điểm
    const xValues = math.range(-5, 5, 0.5).toArray();
    const yValues = xValues.map((x) => f.evaluate({ x }));
    const yPrime = xValues.map((x) => f1.evaluate({ x }));

    // Hiển thị nhận xét SGK
    stepsContainer.innerHTML = `
      <h4>📘 Khảo sát hàm số (Chuẩn SGK)</h4>
      <p>Ta có đạo hàm: \\( f'(x) = ${math.parse(
        math.derivative(expr, "x").toString()
      ).toTex()} \\)</p>
      <p>Xét dấu của \\( f'(x) \\): Nếu dương → hàm đồng biến, âm → nghịch biến.</p>
    `;
    MathJax.typesetPromise([stepsContainer]);

    // Tạo bảng dấu đơn giản
    let htmlTable = `
      <table border="1" style="margin:auto; border-collapse:collapse;">
        <tr><th>x</th><th>f'(x)</th><th>f(x)</th></tr>`;
    for (let i = 0; i < xValues.length; i += 4) {
      htmlTable += `<tr>
        <td>${xValues[i].toFixed(1)}</td>
        <td>${yPrime[i].toFixed(2)}</td>
        <td>${yValues[i].toFixed(2)}</td>
      </tr>`;
    }
    htmlTable += `</table>`;
    tableContainer.innerHTML = `<h4>Bảng xét dấu / Biến thiên</h4>${htmlTable}`;

    // Vẽ đồ thị bằng Plotly
    Plotly.newPlot("plot", [
      { x: xValues, y: yValues, type: "scatter", name: "f(x)", line: { color: "blue" } },
      { x: xValues, y: yPrime, type: "scatter", name: "f'(x)", line: { color: "red", dash: "dot" } },
    ], {
      title: "Đồ thị hàm số và đạo hàm",
      paper_bgcolor: "#fff",
      plot_bgcolor: "#fff",
      xaxis: { title: "x" },
      yaxis: { title: "y" }
    });
  } catch (err) {
    alert("❌ Lỗi khi khảo sát hoặc vẽ đồ thị!");
    console.error(err);
  }
});

// Nút vẽ đồ thị riêng
btnPlot.addEventListener("click", () => {
  const expr = inputExpr.value.trim();
  if (!expr) return alert("⚠️ Hãy nhập hàm số!");

  try {
    const f = math.parse(expr).compile();
    const xValues = math.range(-10, 10, 0.1).toArray();
    const yValues = xValues.map((x) => f.evaluate({ x }));

    Plotly.newPlot("plot", [
      { x: xValues, y: yValues, type: "scatter", name: "f(x)", line: { color: "blue" } }
    ], {
      title: "Đồ thị hàm số",
      xaxis: { title: "x" },
      yaxis: { title: "y" },
      paper_bgcolor: "#fff",
      plot_bgcolor: "#fff"
    });
  } catch (err) {
    alert("❌ Lỗi khi vẽ đồ thị!");
    console.error(err);
  }
});
