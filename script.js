/* ============================================================
   AI HQD — ĐẠO HÀM TRỢ LÝ THÔNG MINH
   Tác giả: Bạn và ChatGPT (Phiên bản AI HQD)
   Phiên bản: 1.0.0
   Mục tiêu: Giải đạo hàm từng bước, giải thích chuẩn SGK,
             hiển thị LaTeX đẹp và vẽ đồ thị hàm số.
   ============================================================ */

// ==================== CÁC THƯ VIỆN ====================
/* 
  - Math.js: hỗ trợ tính đạo hàm, rút gọn biểu thức, vẽ đồ thị.
  - MathJax: hiển thị công thức LaTeX.
  - Plotly.js: vẽ biểu đồ tương tác f(x) và f'(x).
*/

// ==================== HÀM KHỞI TẠO ====================

document.addEventListener("DOMContentLoaded", function () {
  const exprInput = document.getElementById("expr-input");
  const calcBtn = document.getElementById("calc-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultLatex = document.getElementById("result-latex");
  const resultText = document.getElementById("result-text");
  const stepsContainer = document.getElementById("steps-container");
  const plotRoot = document.getElementById("plot-root");
  const plotBtn = document.getElementById("plot-btn");
  const aiInput = document.getElementById("ai-input");
  const aiSend = document.getElementById("ai-send");
  const chatResponse = document.getElementById("chat-response");
  const helpBtn = document.getElementById("help-btn");
  const helpModal = document.getElementById("help-modal");
  const modalClose = document.getElementById("modal-close");

  // Ẩn/hiện hướng dẫn
  helpBtn.addEventListener("click", () => helpModal.style.display = "flex");
  modalClose.addEventListener("click", () => helpModal.style.display = "none");

  // Xử lý nút tính đạo hàm
  calcBtn.addEventListener("click", function () {
    const expr = exprInput.value.trim();
    if (expr === "") {
      showResult("⚠️ Vui lòng nhập một hàm số trước.", "", []);
      return;
    }

    try {
      const steps = explainDerivative(expr);
      const derivative = math.derivative(expr, "x").toString();
      const simplified = math.simplify(derivative).toString();

      showResult(
        `Kết quả: ${simplified}`,
        simplified,
        steps
      );

      renderLatex(resultLatex, simplified);
      drawPlot(expr, simplified);
    } catch (err) {
      showResult("❌ Biểu thức không hợp lệ hoặc chưa hỗ trợ.", "", []);
    }
  });

  // Nút xóa
  clearBtn.addEventListener("click", function () {
    exprInput.value = "";
    showResult("", "", []);
    Plotly.purge(plotRoot);
  });

  // Gửi câu hỏi tới AI Chat
  aiSend.addEventListener("click", function () {
    const question = aiInput.value.trim();
    if (!question) return;
    aiResponse(question);
  });

  // Gắn ví dụ nhanh
  document.querySelectorAll(".example-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      exprInput.value = btn.dataset.expr;
    });
  });
});

// ==================== HIỂN THỊ KẾT QUẢ ====================

function showResult(text, latexExpr, steps) {
  document.getElementById("result-text").textContent = text;
  renderLatex(document.getElementById("result-latex"), latexExpr);

  const stepsContainer = document.getElementById("steps-container");
  stepsContainer.innerHTML = steps.length
    ? steps.map((s, i) => `<p><b>Bước ${i + 1}:</b> ${s}</p>`).join("")
    : "";
}

// ==================== GIẢI THÍCH ĐẠO HÀM ====================

function explainDerivative(expr) {
  const steps = [];

  // Chuẩn hóa
  const normalized = expr.replace(/\s+/g, "");

  // Nhận dạng loại hàm cơ bản
  if (/sin|cos|tan/.test(normalized)) {
    steps.push("Nhận dạng: Hàm lượng giác.");
    if (normalized.includes("sin")) steps.push("Áp dụng công thức (sin x)' = cos x.");
    if (normalized.includes("cos")) steps.push("Áp dụng công thức (cos x)' = -sin x.");
    if (normalized.includes("tan")) steps.push("Áp dụng công thức (tan x)' = 1 / cos²x.");
  }

  if (/exp|e\^/.test(normalized)) {
    steps.push("Nhận dạng: Hàm mũ cơ bản e^x.");
    steps.push("Áp dụng công thức (e^u)' = u'·e^u.");
  }

  if (/log/.test(normalized)) {
    steps.push("Nhận dạng: Hàm logarit.");
    steps.push("Áp dụng công thức (ln u)' = u'/u.");
  }

  if (/\+|-/.test(normalized)) {
    steps.push("Áp dụng quy tắc tổng/hiệu: (u ± v)' = u' ± v'.");
  }

  if (/\*/.test(normalized)) {
    steps.push("Áp dụng quy tắc nhân: (u·v)' = u'·v + u·v'.");
  }

  if (/\//.test(normalized)) {
    steps.push("Áp dụng quy tắc thương: (u/v)' = (u'v - uv') / v².");
  }

  // Luôn có bước cuối: Rút gọn kết quả
  steps.push("Rút gọn biểu thức thu được để có đạo hàm cuối cùng.");

  return steps;
}

// ==================== HIỂN THỊ CÔNG THỨC LaTeX ====================

function renderLatex(target, expr) {
  if (!window.MathJax) return;
  target.innerHTML = `$$${math.parse(expr).toTex()}$$`;
  MathJax.typesetPromise();
}

// ==================== VẼ ĐỒ THỊ ====================

function drawPlot(originalExpr, derivativeExpr) {
  const xValues = math.range(-10, 10, 0.1).toArray();
  const yOriginal = xValues.map(x => math.evaluate(originalExpr, { x }));
  const yDeriv = xValues.map(x => math.evaluate(derivativeExpr, { x }));

  const trace1 = {
    x: xValues,
    y: yOriginal,
    mode: "lines",
    name: "f(x)",
    line: { color: "#3b82f6", width: 3 }
  };

  const trace2 = {
    x: xValues,
    y: yDeriv,
    mode: "lines",
    name: "f'(x)",
    line: { color: "#f59e0b", width: 3, dash: "dot" }
  };

  const layout = {
    margin: { t: 20 },
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    xaxis: { title: "x", gridcolor: "#e2e8f0" },
    yaxis: { title: "y", gridcolor: "#e2e8f0" },
    legend: { x: 0.8, y: 1 }
  };

  Plotly.newPlot("plot-root", [trace1, trace2], layout, { responsive: true });
}

// ==================== TRÒ CHUYỆN AI HQD ====================

function aiResponse(question) {
  const responseBox = document.getElementById("chat-response");
  const aiName = "AI HQD";

  let answer = "";

  // Các câu hỏi phổ biến
  const lower = question.toLowerCase();

  if (lower.includes("tạo") && lower.includes("bạn")) {
    answer = "Tôi được tạo ra bởi bạn cùng sự hỗ trợ của ChatGPT — mô hình GPT-5 💡.";
  } else if (lower.includes("đạo hàm")) {
    answer = "Đạo hàm là công cụ để xác định tốc độ biến thiên của hàm số. Tôi có thể giúp bạn tính và giải thích từng bước chi tiết.";
  } else if (lower.includes("quy tắc") && lower.includes("nhân")) {
    answer = "Quy tắc nhân: (u·v)' = u'·v + u·v'. Bạn hãy xác định u và v trước khi áp dụng nhé.";
  } else if (lower.includes("quy tắc") && lower.includes("thương")) {
    answer = "Quy tắc thương: (u/v)' = (u'v - uv') / v². Đừng quên bình phương mẫu số.";
  } else if (lower.includes("chào")) {
    answer = "Xin chào! Tôi là AI HQD 🤖 – Trợ lý Toán học thông minh, rất vui được giúp bạn!";
  } else {
    answer = "Tôi chưa hiểu rõ câu hỏi, nhưng bạn có thể hỏi về đạo hàm, quy tắc toán, hay công thức cụ thể nhé.";
  }

  responseBox.textContent = `${aiName}: ${answer}`;
}
