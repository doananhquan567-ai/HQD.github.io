/* script.js — ổn định, không lỗi, SGK-style, minimal UI toggle */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const toggleBtn = document.getElementById("toggle-ui");
  const mainApp = document.getElementById("mainApp");

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

  // Toggle minimal <-> full UI
  toggleBtn.addEventListener("click", () => {
    mainApp.classList.toggle("show");
    // change button text slightly for clarity
    toggleBtn.textContent = mainApp.classList.contains("show") ? "Ẩn công cụ" : "Hiện công cụ";
  });

  // safe toLatex using mathjs parse
  function toLatex(expr) {
    try {
      // math.parse may throw; guard it
      const node = math.parse(String(expr));
      if (typeof node.toTex === "function") return node.toTex({ parenthesis: "auto" });
      return expr;
    } catch {
      return expr;
    }
  }

  // Render Math in a container (returns promise)
  function renderMathIn(element) {
    if (!window.MathJax || !MathJax.typesetPromise) return Promise.resolve();
    return MathJax.typesetPromise([element]).catch(()=>{});
  }

  // Main derive handler
  function handleDerive() {
    const expr = (exprInput.value || "").trim();
    const variable = (variableInput.value || "x").trim() || "x";
    const order = parseInt(orderSelect.value || "1", 10);

    if (!expr) {
      stepsContainer.innerHTML = "<div style='color:#b91c1c'>Vui lòng nhập biểu thức!</div>";
      return;
    }

    try {
      // compute derivative iteratively
      let cur = expr;
      for (let i = 0; i < order; i++) {
        cur = math.derivative(cur, variable).toString();
      }
      const simplified = math.simplify(cur).toString();

      // show plain text
      resultText.textContent = simplified;
      // show latex
      const latex = toLatex(simplified);
      resultLatex.innerHTML = `\\(${latex}\\)`;

      // steps
      if (showSteps && showSteps.checked) {
        stepsContainer.innerHTML = buildSGKStepsHTML(expr, variable, order, simplified);
        // render math
        renderMathIn(stepsContainer);
      } else {
        stepsContainer.textContent = "Lời giải chi tiết đã bị ẩn.";
      }

      // render result latex
      renderMathIn(resultLatex);

      // plot
      plotFunction(expr, simplified, variable);
    } catch (e) {
      stepsContainer.innerHTML = `<div style="color:#b91c1c">Lỗi khi tính: ${escapeHtml(String(e.message || e))}</div>`;
      // clear plot
      try { Plotly.purge(plotRoot); } catch {}
    }
  }

  // Build SGK-style HTML for steps (lời + công thức)
  function buildSGKStepsHTML(expr, variable, order, simplified) {
    const texExpr = toLatex(expr);
    const texResult = toLatex(simplified);

    // We'll make explanations concise and SGK-like, but generic enough
    return `
      <div class="sgk-steps">
        <p><strong>Bước 1:</strong> Xét hàm số \\( f(${variable}) = ${texExpr} \\).</p>

        <p><strong>Bước 2:</strong> Cần tìm đạo hàm bậc ${order} theo biến ${variable}.</p>

        <p><strong>Bước 3:</strong> Áp dụng quy tắc đạo hàm phù hợp từng phần:
          <ul>
            <li>Đạo hàm của tổng: \\( (u+v)' = u' + v' \\).</li>
            <li>Đạo hàm lũy thừa: \\( (x^n)' = n x^{n-1} \\).</li>
            <li>Đối với hàm hợp, áp dụng quy tắc chuỗi: \\( (g(h(x)))' = g'(h(x))·h'(x) \\).</li>
          </ul>
        </p>

        <p><strong>Bước 4:</strong> Tính đạo hàm từng hạng tử và rút gọn. Kết quả thu được:
          <br>\\( f^{(${order})}(${variable}) = ${texResult} \\)
        </p>

        <p><strong>Kết luận:</strong> Do đó \\( f^{(${order})}(${variable}) = ${texResult} \\).</p>
      </div>
    `;
  }

  // Simple escape for error messages
  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Plotting function using Plotly
  function plotFunction(expr, derived, variable) {
    try {
      const xMin = parseFloat(xMinInput.value || "-6");
      const xMax = parseFloat(xMaxInput.value || "6");
      const step = Math.max((xMax - xMin) / 240, 0.01);
      const xs = [];
      for (let t = xMin; t <= xMax + 1e-9; t += step) xs.push(Number(t.toFixed(6)));

      const fCompiled = math.parse(expr).compile();
      const gCompiled = math.parse(derived).compile();

      const ys = xs.map(x => {
        try { const v = fCompiled.evaluate({ [variable]: x }); return (typeof v === 'number' && isFinite(v)) ? v : null; }
        catch { return null; }
      });
      const yps = xs.map(x => {
        try { const v = gCompiled.evaluate({ [variable]: x }); return (typeof v === 'number' && isFinite(v)) ? v : null; }
        catch { return null; }
      });

      const traces = [
        { x: xs, y: ys, mode: 'lines', name: 'f(x)', line:{width:2} },
        { x: xs, y: yps, mode: 'lines', name: "f'(x)", line:{dash:'dot', width:2} }
      ];

      const layout = {
        margin:{t:20,b:40,l:50,r:20},
        xaxis:{title:variable},
        yaxis:{title:'Giá trị'},
        paper_bgcolor:'#fff',
        plot_bgcolor:'#fff',
        height:300
      };

      Plotly.react(plotRoot, traces, layout, {responsive:true});
    } catch (e) {
      console.warn("Plot error:", e);
    }
  }

  // Wire buttons & examples
  deriveBtn.addEventListener("click", handleDerive);
  clearBtn.addEventListener("click", () => {
    exprInput.value = "";
    resultText.textContent = "—";
    resultLatex.innerHTML = "";
    stepsContainer.textContent = 'Nhấn "Tính đạo hàm" để xem lời giải.';
    try { Plotly.purge(plotRoot); } catch {}
  });
  plotUpdate.addEventListener("click", handleDerive);

  document.querySelectorAll(".example-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      exprInput.value = btn.dataset.expr;
      handleDerive();
    });
  });

  // Make initial greeting UI minimal (mainApp hidden). Optional: show on first load after 1s.
  // (User can click "Hiện công cụ" to use app)
});
