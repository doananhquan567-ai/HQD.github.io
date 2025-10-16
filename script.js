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
