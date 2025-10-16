// ----------------------------
// AI HQD - Trợ lý Giải Đạo Hàm
// ----------------------------

// Cấu hình math.js
const mathConfig = {
  number: 'number',
  precision: 14
};
const mathjs = math.create(math.all, mathConfig);

// Truy xuất phần tử DOM
const exprInput = document.getElementById('expr');
const variableInput = document.getElementById('variable');
const orderSelect = document.getElementById('order');
const deriveBtn = document.getElementById('deriveBtn');
const clearBtn = document.getElementById('clearBtn');
const stepsDiv = document.getElementById('steps');
const derivativePre = document.getElementById('derivative');
const derivativeLatex = document.getElementById('derivative-latex');
const plotDiv = document.getElementById('plot');

const showStepsCheckbox = document.getElementById('showSteps');
const useLatexCheckbox = document.getElementById('useLatex');
const simplifyCheckbox = document.getElementById('simplifyResult');

const exampleBtns = document.querySelectorAll('.example');

// Thêm sự kiện cho ví dụ nhanh
exampleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    exprInput.value = btn.textContent.trim();
  });
});

// Hàm chính tính đạo hàm
deriveBtn.addEventListener('click', () => {
  const expr = exprInput.value.trim();
  const variable = variableInput.value.trim() || 'x';
  const order = parseInt(orderSelect.value);

  if (!expr) {
    alert("⚠️ Vui lòng nhập biểu thức!");
    return;
  }

  try {
    // Tính đạo hàm (hàm symbolic)
    let derivative = expr;
    for (let i = 0; i < order; i++) {
      derivative = mathjs.derivative(derivative, variable).toString();
    }

    // Rút gọn
    if (simplifyCheckbox.checked) {
      derivative = mathjs.simplify(derivative).toString();
    }

    // Hiển thị kết quả
    derivativePre.textContent = derivative;
    derivativeLatex.innerHTML = useLatexCheckbox.checked
      ? `\\( ${mathjs.parse(derivative).toTex()} \\)`
      : '';

    // Cập nhật hiển thị MathJax
    if (useLatexCheckbox.checked && window.MathJax) {
      MathJax.typesetPromise();
    }

    // Tạo lời giải từng bước
    if (showStepsCheckbox.checked) {
      showStepByStep(expr, variable, order);
    } else {
      stepsDiv.textContent = 'Ẩn lời giải từng bước.';
    }

    // Vẽ đồ thị (nếu có)
    drawPlot(expr, derivative, variable);
  } catch (error) {
    derivativePre.textContent = 'Lỗi khi tính toán: ' + error.message;
    stepsDiv.textContent = '';
  }
});

// Nút xóa
clearBtn.addEventListener('click', () => {
  exprInput.value = '';
  derivativePre.textContent = '—';
  derivativeLatex.textContent = '';
  stepsDiv.textContent = 'Nhấn "Tính đạo hàm" để xem lời giải từng bước.';
  plotDiv.innerHTML = '';
});

// ----------------------------
// Hàm tạo lời giải từng bước
// ----------------------------
function showStepByStep(expr, variable, order) {
  let html = `<strong>Bước 0:</strong> Biểu thức ban đầu: <code>${expr}</code><br>`;

  let currentExpr = expr;
  for (let i = 1; i <= order; i++) {
    try {
      const derived = mathjs.derivative(currentExpr, variable).toString();
      html += `<hr><strong>Bước ${i}:</strong> Tính đạo hàm bậc ${i} theo ${variable}:<br>`;
      html += `<pre>${currentExpr}</pre> ⟶ <pre>${derived}</pre>`;

      // Mô tả quy tắc cơ bản
      html += explainRule(currentExpr);

      currentExpr = derived;
    } catch (e) {
      html += `<p style="color:red">Không thể tính đạo hàm ở bước ${i}: ${e.message}</p>`;
      break;
    }
  }

  stepsDiv.innerHTML = html;
}

// ----------------------------
// Hàm mô tả quy tắc đạo hàm
// ----------------------------
function explainRule(expr) {
  expr = expr.toLowerCase();

  if (expr.includes('sin')) return `<div>Áp dụng: (sin u)' = cos(u) · u'</div>`;
  if (expr.includes('cos')) return `<div>Áp dụng: (cos u)' = -sin(u) · u'</div>`;
  if (expr.includes('tan')) return `<div>Áp dụng: (tan u)' = (1 + tan²(u)) · u'</div>`;
  if (expr.includes('exp') || expr.includes('e^')) return `<div>Áp dụng: (e^u)' = e^u · u'</div>`;
  if (expr.includes('ln')) return `<div>Áp dụng: (ln u)' = u'/u</div>`;
  if (expr.includes('/')) return `<div>Áp dụng: (u/v)' = (u'v - uv') / v²</div>`;
  if (expr.includes('*')) return `<div>Áp dụng: (u·v)' = u'v + uv'</div>`;
  if (expr.includes('^')) return `<div>Áp dụng: (xⁿ)' = n·xⁿ⁻¹</div>`;
  return `<div>Áp dụng: Quy tắc tổng/hiệu (u ± v)' = u' ± v'</div>`;
}

// ----------------------------
// Vẽ đồ thị
// ----------------------------
function drawPlot(expr, derivative, variable) {
  try {
    const f = mathjs.parse(expr).compile();
    const fprime = mathjs.parse(derivative).compile();
    const xVals = mathjs.range(-5, 5, 0.1).toArray();

    const yVals = xVals.map(x => f.evaluate({ [variable]: x }));
    const yPrimeVals = xVals.map(x => fprime.evaluate({ [variable]: x }));

    const data = [
      { x: xVals, y: yVals, type: 'scatter', name: 'f(x)', line: { width: 2 } },
      { x: xVals, y: yPrimeVals, type: 'scatter', name: "f'(x)", line: { width: 2, dash: 'dot' } }
    ];

    const layout = {
      title: 'Đồ thị hàm gốc và đạo hàm',
      xaxis: { title: variable },
      yaxis: { title: 'Giá trị' },
      height: 400
    };

    Plotly.newPlot(plotDiv, data, layout);
  } catch (e) {
    plotDiv.innerHTML = `<p style="color:red">Không thể vẽ đồ thị: ${e.message}</p>`;
  }
}
// ======================
// PHẦN CHAT CỦA AI HQD
// ======================

function sendMessage() {
  const input = document.getElementById('userInput');
  const chatbox = document.getElementById('chatbox');
  const msg = input.value.trim();
  if (msg === "") return;

  // Hiển thị tin nhắn người dùng
  const userDiv = document.createElement('div');
  userDiv.className = 'user-msg';
  userDiv.textContent = msg;
  chatbox.appendChild(userDiv);
  input.value = '';

  // Tự động cuộn xuống
  chatbox.scrollTop = chatbox.scrollHeight;

  // Trả lời sau 0.5 giây
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-msg';
    botDiv.innerHTML = getHQDResponse(msg);
    chatbox.appendChild(botDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }, 500);
}

// --------------------------
// Câu trả lời giả lập HQD
// --------------------------
function getHQDResponse(input) {
  input = input.toLowerCase();

  if (input.includes("xin chào") || input.includes("hello"))
    return "Chào bạn 👋! Tôi là <strong>AI HQD</strong>, trợ lý toán học của bạn. Bạn muốn tôi giúp gì hôm nay?";

  if (input.includes("ai tạo ra") || input.includes("ai là người tạo ra"))
    return "Tôi được lập trình bởi <strong>bạn</strong> — người sáng tạo của dự án <strong>HQD AI Math</strong> 🧠✨";

  if (input.includes("tên gì") || input.includes("bạn là ai"))
    return "Tôi là <strong>AI HQD</strong>, một trợ lý học toán thông minh do bạn thiết kế để giúp mọi người học dễ hơn 😄";

  if (input.includes("đạo hàm") || input.includes("giải"))
    return "Nếu bạn muốn tôi giải đạo hàm, hãy nhập hàm vào ô bên trên và nhấn nút <strong>Giải đạo hàm</strong> nhé 📘";

  if (input.includes("cảm ơn"))
    return "Không có gì đâu 💙 Rất vui được giúp bạn!";

  if (input.includes("tạm biệt"))
    return "Tạm biệt bạn 👋! Hẹn gặp lại trong buổi học toán tiếp theo nhé!";

  // Trả lời mặc định
  return "Hmm... tôi chưa hiểu câu hỏi đó 😅<br>Hãy thử hỏi lại bằng cách khác, ví dụ: <em>‘Đạo hàm của sin(x^2) là gì?’</em>";
}

