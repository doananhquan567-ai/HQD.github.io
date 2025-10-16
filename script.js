/* =====================================================
   AI HQD — script.js (Phiên bản SGK hiển thị sang trọng)
   Giải đạo hàm từng bước bằng Math.js + hiển thị SGK
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const exprInput = document.getElementById("exprInput");
  const variableInput = document.getElementById("variableInput");
  const orderSelect = document.getElementById("orderSelect");
  const showSteps = document.getElementById("showSteps");
  const deriveBtn = document.getElementById("deriveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const resultText = document.getElementById("resultText");
  const resultLatex = document.getElementById("resultLatex");
  const stepsContainer = document.getElementById("stepsContainer");

  const plotRoot = document.getElementById("plotRoot");
  const xMinInput = document.getElementById("xMin");
  const xMaxInput = document.getElementById("xMax");
  const plotUpdate = document.getElementById("plotUpdate");

  // Hàm chuyển biểu thức thành LaTeX đẹp
  const toLatex = (expr) => {
    try {
      return math.parse(expr).toTex({ parenthesis: "auto", implicit: "show" });
    } catch {
      return expr;
    }
  };

  // Hàm chính xử lý đạo hàm
  function handleDerive() {
    const expr = exprInput.value.trim();
    const variable = variableInput.value.trim() || "x";
    const order = parseInt(orderSelect.value);

    if (!expr) {
      stepsContainer.innerHTML = "Vui lòng nhập biểu thức cần đạo hàm.";
      return;
    }

    try {
      // Tính đạo hàm
      let derived = math.derivative(expr, variable);
      for (let i = 1; i < order; i++) {
        derived = math.derivative(derived.toString(), variable);
      }

      // Rút gọn
      const simplified = math.simplify(derived.toString());

      // Hiển thị kết quả chính
      resultText.textContent = simplified.toString();
      resultLatex.innerHTML = `\\(${toLatex(simplified.toString())}\\)`;
      MathJax.typesetPromise();

      // Nếu bật hiển thị bước
      if (showSteps.checked) {
        const stepsHTML = generateSGKSteps(expr, variable, simplified.toString(), order);
        stepsContainer.innerHTML = stepsHTML;
        MathJax.typesetPromise();
      } else {
        stepsContainer.textContent = "Đã ẩn lời giải chi tiết.";
      }

      plotFunction(expr, simplified.toString(), variable);

    } catch (err) {
      stepsContainer.innerHTML = `<span style="color:red">Lỗi: ${err.message}</span>`;
    }
  }

  // Hàm sinh lời giải chi tiết kiểu SGK
  function generateSGKSteps(expr, variable, result, order) {
    const texExpr = toLatex(expr);
    const texResult = toLatex(result);

    let steps = `
      <div class="sgk-steps">
        <p><strong>Bước 1:</strong> Ta có hàm số ban đầu là \\( f(${variable}) = ${texExpr} \\).</p>
        <p><strong>Bước 2:</strong> Cần tìm đạo hàm bậc ${order} theo biến ${variable}.</p>
        <p><strong>Bước 3:</strong> Áp dụng các quy tắc đạo hàm cơ bản:
          <ul>
            <li>\\( (x^n)' = n \\cdot x^{n-1} \\)</li>
            <li>\\( (u + v)' = u' + v' \\)</li>
            <li>\\( (c)' = 0 \\), trong đó c là hằng số.</li>
          </ul>
        </p>
        <p><strong>Bước 4:</strong> Tính lần lượt đạo hàm từng hạng tử của biểu thức \\( f(${variable}) \\).</p>
        <p><strong>Bước 5:</strong> Sau khi tính và rút gọn, ta được:
          <br>\\( f^{(${order})}(${variable}) = ${texResult} \\)
        </p>
        <p><strong>Kết luận:</strong> Vậy đạo hàm bậc ${order} của hàm số là \\( ${texResult} \\).</p>
      </div>
    `;

    return steps;
  }

  // Vẽ đồ thị f và f'
  function plotFunction(expr, derived, variable) {
    try {
      const xMin = parseFloat(xMinInput.value);
      const xMax = parseFloat(xMaxInput.value);
      const xValues = math.range(xMin, xMax, 0.2).toArray();

      const f = math.compile(expr);
      const fPrime = math.compile(derived);

      const y1 = xValues.map((x) => f.evaluate({ [variable]: x }));
      const y2 = xValues.map((x) => fPrime.evaluate({ [variable]: x }));

      const data = [
        { x: xValues, y: y1, mode: "lines", name: "f(x)", line: { width: 3 } },
        { x: xValues, y: y2, mode: "lines", name: "f'(x)", line: { dash: "dot", width: 3 } },
      ];

      const layout = {
        margin: { t: 20, l: 40, r: 20, b: 30 },
        paper_bgcolor: "#fff",
        plot_bgcolor: "#fff",
        legend: { orientation: "h" },
      };

      Plotly.newPlot(plotRoot, data, layout, { responsive: true });
    } catch (e) {
      console.error("Plot error:", e);
    }
  }

  // Nút sự kiện
  deriveBtn.addEventListener("click", handleDerive);
  clearBtn.addEventListener("click", () => {
    exprInput.value = "";
    resultText.textContent = "—";
    resultLatex.textContent = "";
    stepsContainer.textContent = "Nhấn \"Tính đạo hàm\" để xem bước giải theo SGK.";
    plotRoot.innerHTML = "";
  });
  plotUpdate.addEventListener("click", () => handleDerive());

  // Ví dụ nhanh
  document.querySelectorAll(".example-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      exprInput.value = btn.dataset.expr;
      handleDerive();
    });
  });
});
