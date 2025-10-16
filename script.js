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
/* ------------------------------
  AI HQD - script.js (Nâng cao)
  - Chat hiểu ngôn ngữ tự nhiên (rule-based)
  - Giải đạo hàm chi tiết, xuất LaTeX
  - Vẽ đồ thị
  - Fallback math.js
  ------------------------------- */

/* === Quick setup: math.js instance === */
const mathConfig = {number: 'number', precision: 14};
const mathjs = math.create(math.all, mathConfig);

/* === DOM elements === */
const exprInput = document.getElementById('expr');
const variableInput = document.getElementById('variable');
const orderSelect = document.getElementById('order');
const deriveBtn = document.getElementById('deriveBtn');
const clearBtn = document.getElementById('clearBtn');

const showStepsCheckbox = document.getElementById('showSteps');
const useLatexCheckbox = document.getElementById('useLatex');
const simplifyCheckbox = document.getElementById('simplifyResult');

const exampleBtns = document.querySelectorAll('.example');

const derivativePre = document.getElementById('derivative');
const derivativeLatex = document.getElementById('derivative-latex');
const stepsDiv = document.getElementById('steps');
const plotDiv = document.getElementById('plot');

const chatbox = document.getElementById('chatbox');      // chat panel
const userInputChat = document.getElementById('userInput');

/* === Helpers === */
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function safeTex(node){
  try { return node.toTex ? node.toTex({parenthesis:'auto'}) : escHtml(node.toString()); }
  catch(e){ return escHtml(node.toString()); }
}
function joinStepsHtml(steps){
  if(!steps || steps.length===0) return '<div class="step">Không có bước nào.</div>';
  return steps.map((st,i)=> {
    const text = st.text ? escHtml(st.text) : '';
    const latex = st.latex || '';
    let html = `<div class="step"><strong>Bước ${i+1}:</strong> ${text}`;
    if(latex && useLatexCheckbox.checked){
      html += `<div style="margin-top:6px;">\$begin:math:text$${latex}\\$end:math:text$</div>`;
    } else if(latex){
      html += `<div style="margin-top:6px; font-family:monospace; color:#374151">${escHtml(latex)}</div>`;
    }
    html += `</div>`;
    return html;
  }).join('');
}

/* === Example button behavior === */
exampleBtns.forEach(b => b.addEventListener('click', ()=> { exprInput.value = b.textContent.trim(); }));

/* === Core: Differentiation engine with step traces ===
   This is an improved, modular version of the earlier rule-based derivative,
   focusing on readability of steps and LaTeX outputs.
*/
function cloneNode(n){ return n ? n.cloneDeep() : null; }
const parse = s => mathjs.parse(String(s));
const ONE = parse('1');
const ZERO = parse('0');

function pushStep(arr, text, latex){
  arr.push({text: text || '', latex: latex || ''});
}

/* differentiate(node, varName) => { node: derivativeNode, steps: [ {text, latex} ... ] }
   - covers constants, symbols, +,-,*,/,^, many functions, and falls back to mathjs for unknowns.
*/
function differentiate(node, varName){
  const steps = [];

  // Constant
  if(node.isConstantNode){
    pushStep(steps, `Đạo hàm của hằng ${node.value} là 0.`, `\\frac{d}{d${varName}}(${safeTex(node)})=0`);
    return {node: ZERO, steps};
  }

  // Symbol
  if(node.isSymbolNode){
    if(node.name === varName){
      pushStep(steps, `Đạo hàm của biến ${varName} theo ${varName} là 1.`, `\\frac{d}{d${varName}}${safeTex(node)}=1`);
      return {node: ONE, steps};
    } else {
      pushStep(steps, `Biến ${node.name} không phải ${varName} → coi là hằng → đạo hàm = 0.`, `\\frac{d}{d${varName}}${safeTex(node)}=0`);
      return {node: ZERO, steps};
    }
  }

  // Parenthesis
  if(node.isParenthesisNode){
    const inner = differentiate(node.content, varName);
    pushStep(inner.steps, `Áp dụng đạo hàm cho nội dung trong ngoặc.`, ``);
    return { node: inner.node, steps: inner.steps };
  }

  // Operator nodes
  if(node.isOperatorNode){
    const op = node.op;

    // Sum / Subtraction
    if(op === '+' || op === '-'){
      const A = differentiate(node.args[0], varName);
      const B = differentiate(node.args[1], varName);
      pushStep(steps, `Quy tắc tổng/hiệu: (A ${op} B)' = A' ${op} B'.`, `\\frac{d}{d${varName}}(A ${op} B)=A' ${op} B'`);
      steps.push(...A.steps, ...B.steps);
      const res = new mathjs.OperatorNode(op, node.fn, [A.node, B.node]);
      return {node: res, steps};
    }

    // Multiplication (product rule; supports n factors)
    if(op === '*'){
      const factors = node.args;
      if(factors.length === 2){
        const u = factors[0], v = factors[1];
        const du = differentiate(u, varName);
        const dv = differentiate(v, varName);
        pushStep(steps, `Quy tắc nhân: (uv)' = u'v + uv'.`, `\\frac{d}{d${varName}}(uv)=u'v+uv'`);
        steps.push(...du.steps, ...dv.steps);
        const term1 = new mathjs.OperatorNode('*','multiply',[du.node, cloneNode(v)]);
        const term2 = new mathjs.OperatorNode('*','multiply',[cloneNode(u), dv.node]);
        const sum = new mathjs.OperatorNode('+','add',[term1, term2]);
        return {node: sum, steps};
      } else {
        // many factors: sum of partial derivatives
        pushStep(steps, `Nhân nhiều nhân tử: đạo hàm bằng tổng các trường hợp lấy đạo hàm từng nhân tử.` , ``);
        let partials = [];
        for(let i=0;i<factors.length;i++){
          const dfi = differentiate(factors[i], varName);
          steps.push(...dfi.steps);
          const parts = factors.map((f,j)=> j===i ? dfi.node : cloneNode(f));
          // multiply parts left to right
          let prod = parts[0];
          for(let k=1;k<parts.length;k++) prod = new mathjs.OperatorNode('*','multiply',[prod, parts[k]]);
          partials.push(prod);
        }
        let sum = partials[0];
        for(let s=1;s<partials.length;s++) sum = new mathjs.OperatorNode('+','add',[sum, partials[s]]);
        return {node: sum, steps};
      }
    }

    // Division (quotient rule)
    if(op === '/'){
      const u = node.args[0], v = node.args[1];
      const du = differentiate(u, varName);
      const dv = differentiate(v, varName);
      pushStep(steps, `Quy tắc chia: (u/v)' = (u'v - u v') / v^2.`, `\\frac{d}{d${varName}}\\left(\\frac{u}{v}\\right)=\\frac{u'v-uv'}{v^2}`);
      steps.push(...du.steps, ...dv.steps);
      const numerLeft = new mathjs.OperatorNode('*','multiply',[du.node, cloneNode(v)]);
      const numerRight = new mathjs.OperatorNode('*','multiply',[cloneNode(u), dv.node]);
      const numer = new mathjs.OperatorNode('-','subtract',[numerLeft, numerRight]);
      const denom = new mathjs.OperatorNode('^','pow',[cloneNode(v), parseSafe('2')]);
      const frac = new mathjs.OperatorNode('/','divide',[numer, denom]);
      return {node: frac, steps};
    }

    // Power ^
    if(op === '^'){
      const base = node.args[0], exponent = node.args[1];

      // x^n
      if(base.isSymbolNode && base.name === varName && exponent.isConstantNode){
        const n = Number(exponent.value);
        pushStep(steps, `Quy tắc lũy thừa: d/d${varName}(${varName}^${n}) = ${n} ${varName}^{${n-1}}.`, `\\frac{d}{d${varName}}${safeTex(node)}=${n}${safeTex(base)}^{${n-1}}`);
        const coef = parseSafe(String(n));
        const pow = new mathjs.OperatorNode('^','pow',[cloneNode(base), parseSafe(String(n-1))]);
        const res = new mathjs.OperatorNode('*','multiply',[coef, pow]);
        return {node: res, steps};
      }

      // a^x where a constant, exponent is var
      if(base.isConstantNode && exponent.isSymbolNode && exponent.name === varName){
        pushStep(steps, `d/dx a^x = a^x ln(a).`, `\\frac{d}{d${varName}}${safeTex(node)}=${safeTex(node)}\\ln(${safeTex(base)})`);
        const lnA = new mathjs.FunctionNode(new mathjs.SymbolNode('log'), [cloneNode(base)]);
        const res = new mathjs.OperatorNode('*','multiply',[cloneNode(node), lnA]);
        return {node: res, steps};
      }

      // general f(x)^g(x)
      pushStep(steps, `Trường hợp tổng quát: dùng dạng exp(g ln f). (d(a^b) = a^b ( b' ln a + b a'/a )).`, ``);
      const da = differentiate(base, varName);
      const db = differentiate(exponent, varName);
      steps.push(...da.steps, ...db.steps);
      const lnA = new mathjs.FunctionNode(new mathjs.SymbolNode('log'), [cloneNode(base)]);
      const term1 = new mathjs.OperatorNode('*','multiply',[db.node, lnA]);
      const aPrimeOverA = new mathjs.OperatorNode('/','divide',[da.node, cloneNode(base)]);
      const term2 = new mathjs.OperatorNode('*','multiply',[cloneNode(exponent), aPrimeOverA]);
      const inside = new mathjs.OperatorNode('+','add',[term1, term2]);
      const full = new mathjs.OperatorNode('*','multiply',[cloneNode(node), inside]);
      return {node: full, steps};
    }
  }

  // Function nodes
  if(node.isFunctionNode){
    const fnName = (node.fn && node.fn.name) ? node.fn.name : (node.name || '');
    const arg = node.args[0];
    const dArg = differentiate(arg, varName);
    // push inner steps first
    steps.push(...dArg.steps);

    // sin
    if(fnName === 'sin'){
      pushStep(steps, `Đạo hàm sin(u) = cos(u) * u'.`, `\\frac{d}{d${varName}}\\sin(u)=\\cos(u)u'`);
      const cosu = new mathjs.FunctionNode(new mathjs.SymbolNode('cos'), [cloneNode(arg)]);
      const res = new mathjs.OperatorNode('*','multiply',[cosu, dArg.node]);
      return {node: res, steps};
    }
    if(fnName === 'cos'){
      pushStep(steps, `Đạo hàm cos(u) = -sin(u) * u'.`, `\\frac{d}{d${varName}}\\cos(u)=-\\sin(u)u'`);
      const sinu = new mathjs.FunctionNode(new mathjs.SymbolNode('sin'), [cloneNode(arg)]);
      const negSinu = new mathjs.OperatorNode('-', 'unaryMinus', [sinu]);
      const res = new mathjs.OperatorNode('*','multiply',[negSinu, dArg.node]);
      return {node: res, steps};
    }
    if(fnName === 'tan'){
      pushStep(steps, `Đạo hàm tan(u) = u' / cos^2(u).`, `\\frac{d}{d${varName}}\\tan(u)=\\frac{u'}{\\cos^2(u)}`);
      const cosu = new mathjs.FunctionNode(new mathjs.SymbolNode('cos'), [cloneNode(arg)]);
      const cosu2 = new mathjs.OperatorNode('^','pow',[cosu, parseSafe('2')]);
      const inv = new mathjs.OperatorNode('/','divide',[parseSafe('1'), cosu2]);
      const res = new mathjs.OperatorNode('*','multiply',[inv, dArg.node]);
      return {node: res, steps};
    }
    if(fnName === 'exp'){
      pushStep(steps, `Đạo hàm exp(u) = exp(u) * u'.`, `\\frac{d}{d${varName}}e^{u}=e^{u}u'`);
      const expu = new mathjs.FunctionNode(new mathjs.SymbolNode('exp'), [cloneNode(arg)]);
      const res = new mathjs.OperatorNode('*','multiply',[expu, dArg.node]);
      return {node: res, steps};
    }
    if(fnName === 'log' || fnName === 'ln'){
      pushStep(steps, `Đạo hàm ln(u) = u' / u.`, `\\frac{d}{d${varName}}\\ln(u)=\\frac{u'}{u}`);
      const res = new mathjs.OperatorNode('/','divide',[dArg.node, cloneNode(arg)]);
      return {node: res, steps};
    }
    if(fnName === 'sqrt'){
      pushStep(steps, `Đạo hàm sqrt(u) = u'/(2 sqrt(u)).`, ``);
      const sqrtu = new mathjs.FunctionNode(new mathjs.SymbolNode('sqrt'), [cloneNode(arg)]);
      const denom = new mathjs.OperatorNode('*','multiply',[parseSafe('2'), sqrtu]);
      const res = new mathjs.OperatorNode('/','divide',[dArg.node, denom]);
      return {node: res, steps};
    }

    // inverse trig (asin, acos, atan)
    if(fnName === 'asin' || fnName === 'arcsin'){
      pushStep(steps, `Đạo hàm arcsin(u) = u' / sqrt(1-u^2).`, ``);
      const denom = new mathjs.FunctionNode(new mathjs.SymbolNode('sqrt'), [new mathjs.OperatorNode('-', 'subtract', [parseSafe('1'), new mathjs.OperatorNode('^','pow',[cloneNode(arg), parseSafe('2')])])]);
      const res = new mathjs.OperatorNode('/','divide',[dArg.node, denom]);
      return {node: res, steps};
    }
    if(fnName === 'atan' || fnName === 'arctan'){
      pushStep(steps, `Đạo hàm arctan(u) = u' / (1+u^2).`, ``);
      const denom = new mathjs.OperatorNode('+','add',[parseSafe('1'), new mathjs.OperatorNode('^','pow',[cloneNode(arg), parseSafe('2')])]);
      const res = new mathjs.OperatorNode('/','divide',[dArg.node, denom]);
      return {node: res, steps};
    }

    // fallback: attempt to use mathjs derivative for this function shape
    try {
      pushStep(steps, `Dùng quy tắc hợp: (f(u))' = f'(u) u'. (Sử dụng math.js để tìm f')`, ``);
      const uPlaceholder = 'u';
      const funcStr = `${fnName}(${uPlaceholder})`;
      const fPrimeNode = mathjs.derivative(funcStr, uPlaceholder);
      // replace 'u' with arg expression
      const fPrimeStr = fPrimeNode.toString().replace(/\bu\b/g, `(${arg.toString()})`);
      const fPrimeParsed = parse(fPrimeStr);
      const res = new mathjs.OperatorNode('*','multiply',[fPrimeParsed, dArg.node]);
      return {node: res, steps};
    } catch(e){
      // final fallback
      pushStep(steps, `Không thể xử lý hàm ${fnName} bằng luật thủ công. Thử dùng math.js trực tiếp.`, ``);
      try {
        const der = mathjs.derivative(node.toString(), varName);
        pushStep(steps, `math.js trả về: ${der.toString()}`, `\\text{math.js: }${escHtml(der.toString())}`);
        return {node: der, steps};
      } catch(err){
        pushStep(steps, `Không thể tính đạo hàm cho hàm này.`, ``);
        return {node: ZERO, steps};
      }
    }
  }

  // Fallback: math.js derivative on the string
  try {
    pushStep(steps, `Không khớp mẫu thủ công. Sử dụng math.js để lấy đạo hàm.`, ``);
    const der = mathjs.derivative(node.toString(), varName);
    pushStep(steps, `math.js trả về: ${der.toString()}`, `\\text{math.js: }${escHtml(der.toString())}`);
    return {node: der, steps};
  } catch(e) {
    pushStep(steps, `Không thể tính đạo hàm cho biểu thức này.`, ``);
    return {node: ZERO, steps};
  }
}

// Safe parse helper (wrap parse in try)
function parseSafe(s){
  try { return mathjs.parse(String(s)); } catch(e) { return mathjs.parse('0'); }
}

/* === High-level solve flow for derivative with multi-step explanation ===
   Input: expression string, variable string, order integer
   Output: { final: string, stepsHtml: string, latex: string, derivNode: Node }
*/
function solveDerivativeDetailed(exprText, variable, order){
  const out = { final: '', stepsHtml: '', latex: '', derivNode: null };
  try {
    let current = parseSafe(exprText);
    let allSteps = [];

    pushStep(allSteps, `Bắt đầu với biểu thức: ${exprText}`, `\\displaystyle ${escHtml(exprText).replace(/\\n/g,' ')}`);

    for(let i=1;i<=order;i++){
      const res = differentiate(current, variable);  // res.node and res.steps
      // label
      pushStep(allSteps, `Đạo hàm bậc ${i}: áp dụng với biểu thức hiện tại.`, `\\text{Bậc }${i}`);
      // append steps from res
      res.steps.forEach(s => allSteps.push(s));
      // compute simplified node for next iteration
      try {
        current = mathjs.simplify(res.node);
      } catch(e) {
        current = res.node;
      }
    }

    // final simplification
    let finalNode;
    try { finalNode = mathjs.simplify(current); } catch(e){ finalNode = current; }
    out.final = finalNode.toString();
    out.derivNode = finalNode;
    // latex
    try { out.latex = finalNode.toTex ? finalNode.toTex({parenthesis:'keep'}) : escHtml(finalNode.toString()); } catch(e){ out.latex = escHtml(finalNode.toString()); }

    out.stepsHtml = joinStepsHtml(allSteps);
    return out;
  } catch(e){
    return { final: 'Lỗi khi xử lý: ' + e.message, stepsHtml: `<div class="step error">Lỗi: ${escHtml(e.message)}</div>`, latex: '', derivNode: null };
  }
}

/* === UI handlers for main Derive button === */
deriveBtn.addEventListener('click', () => {
  const expr = exprInput.value.trim();
  const variable = variableInput.value.trim() || 'x';
  const order = parseInt(orderSelect.value || '1');

  if(!expr){
    alert('Vui lòng nhập biểu thức!');
    return;
  }

  // Solve
  const solved = solveDerivativeDetailed(expr, variable, order);

  // Optionally simplify again as text
  let finalText = solved.final;
  if(simplifyCheckbox.checked){
    try { finalText = mathjs.simplify(solved.final).toString(); } catch(e){ /* ignore */ }
  }

  derivativePre.textContent = finalText;
  if(useLatexCheckbox.checked && solved.latex){
    derivativeLatex.innerHTML = `\$begin:math:text$ ${solved.latex} \\$end:math:text$`;
    if(window.MathJax) MathJax.typesetClear(), MathJax.typesetPromise && MathJax.typesetPromise();
  } else derivativeLatex.innerHTML = '';

  if(showStepsCheckbox.checked){
    stepsDiv.innerHTML = solved.stepsHtml;
    if(window.MathJax) MathJax.typesetPromise && MathJax.typesetPromise();
  } else {
    stepsDiv.innerHTML = '<div class="step">Lời giải từng bước bị ẩn (bỏ chọn "Hiển thị từng bước").</div>';
  }

  // draw plot if possible
  try{
    const derivNode = solved.derivNode || parseSafe(finalText);
    drawPlotSafe(parseSafe(expr), derivNode, variable);
  }catch(e){
    plotDiv.innerHTML = `<p class="error">Không thể vẽ đồ thị: ${escHtml(e.message)}</p>`;
  }
});

/* Clear button */
clearBtn.addEventListener('click', () => {
  exprInput.value = '';
  derivativePre.textContent = '—';
  derivativeLatex.innerHTML = '';
  stepsDiv.innerHTML = 'Nhấn "Tính đạo hàm" để xem các bước.';
  plotDiv.innerHTML = '';
});

/* === Plot function (safe evaluate with try/catch) === */
function drawPlotSafe(fNode, fprimeNode, variable){
  plotDiv.innerHTML = ''; // clear
  try{
    const fCompiled = fNode.compile();
    const gCompiled = fprimeNode.compile();

    // build x array
    const xs = mathjs.range(-6,6,0.12).toArray();
    const ys = xs.map(x => {
      try { const val = fCompiled.evaluate({[variable]: x}); return (isFinite(val) ? val : null); }
      catch(e){ return null; }
    });
    const yps = xs.map(x => {
      try { const val = gCompiled.evaluate({[variable]: x}); return (isFinite(val) ? val : null); }
      catch(e){ return null; }
    });

    const trace1 = { x: xs, y: ys, mode: 'lines', name:'f(x)', line:{width:2} };
    const trace2 = { x: xs, y: yps, mode: 'lines', name:"f'(x)", line:{dash:'dot',width:2} };
    const layout = { title:'Đồ thị f(x) (màu liền) và f\'(x) (gạch)', xaxis:{title:variable}, yaxis:{title:'Giá trị'}, height:380, margin:{t:40} };
    Plotly.newPlot(plotDiv, [trace1, trace2], layout, {responsive:true});
  }catch(e){
    plotDiv.innerHTML = `<p class="error">Không thể vẽ đồ thị: ${escHtml(e.message)}</p>`;
  }
}

/* === Chat functionality (smart rule-based + math queries) === */
function appendChatUser(text){
  const d = document.createElement('div'); d.className='user-msg'; d.textContent = text; chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
}
function appendChatBot(html){
  const d = document.createElement('div'); d.className='bot-msg'; d.innerHTML = html; chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
}

/* Basic NLP heuristics to detect math questions and extract expressions */
function analyzeChatMessage(msg){
  // Normalize
  const t = msg.trim();
  const low = t.toLowerCase();

  // direct conversational
  if(/ai tạo ra|ai là người tạo|who created|who made/i.test(low)){
    return { type:'text', answer: 'Tôi là AI HQD — do bạn (người thiết kế) tạo ra và nâng cấp. Mình là bản demo chạy cục bộ; bạn có thể kết nối API để thông minh hơn.'};
  }
  if(/tên|bạn là ai|what is your name/i.test(low)){
    return { type:'text', answer: 'Mình là AI HQD — trợ lý toán học của bạn. Mời bạn thử hỏi một bài đạo hàm!'};
  }
  if(/cảm ơn|thanks/i.test(low)) return {type:'text', answer:'Rất vui được giúp! Nếu muốn mình giải bài nào nữa cứ nhập.'};
  if(/tạm biệt|chào tạm biệt|bye/i.test(low)) return {type:'text', answer:'Tạm biệt! Chúc bạn học tốt 😊'};

  // check if user asked "đạo hàm của <expr>" or "derive <expr>" or "d/dx <expr>"
  let m;
  if(m = low.match(/d\/d([a-z])\s*(.*)/i)){ // d/dx expression
    const varName = m[1];
    const expr = m[2].trim();
    return { type:'derive', expr, variable: varName, order:1 };
  }
  if(m = low.match(/đạo hàm của\s+(.+)/i)) {
    const expr = m[1].trim();
    return { type:'derive', expr, variable:'x', order:1 };
  }
  if(m = low.match(/derive\s+(.+)/i)) {
    const expr = m[1].trim();
    return { type:'derive', expr, variable:'x', order:1 };
  }
  // detect expressions directly (like "sin(x^2)" or "x^3 + 2*x")
  // heuristic: contains parentheses or ^ or * or / or sin|cos|ln|exp or digits and x
  if(/[+\-*/^]|\b(sin|cos|tan|ln|log|exp|sqrt|asin|acos|atan)\b/i.test(low) && /[a-z0-9]/i.test(low)){
    // assume user input an expression and may want derivative; ask clarification if ambiguous?
    return { type:'maybeExpr', expr: t };
  }

  // fallback: generic help
  return { type:'text', answer: "Mình chưa chắc hiểu. Bạn có thể hỏi ví dụ: 'Đạo hàm của sin(x^2) là gì?' hoặc 'Ai tạo ra bạn?'."};
}

/* Main chat send function */
function sendMessage(){
  const msg = (userInputChat.value || '').trim();
  if(!msg) return;
  appendChatUser(msg);
  userInputChat.value = '';

  const analysis = analyzeChatMessage(msg);

  setTimeout(()=> {
    if(analysis.type === 'text'){
      appendChatBot(analysis.answer);
      return;
    }
    if(analysis.type === 'derive' || analysis.type === 'maybeExpr'){
      // if maybeExpr, ask clarifying question (we can assume derivative by default)
      const expr = analysis.expr;
      const variable = analysis.variable || 'x';
      const order = analysis.order || 1;

      appendChatBot(`<em>Đang phân tích biểu thức: <strong>${escHtml(expr)}</strong> ...</em>`);

      // compute
      const solved = solveDerivativeDetailed(expr, variable, order);
      // build rich HTML: final + latex + steps
      let html = `<div><strong>Kết quả (rút gọn):</strong><div class="output" style="margin-top:6px">${escHtml(solved.final)}</div></div>`;
      if(solved.latex && useLatexCheckbox.checked) html += `<div style="margin-top:6px;">\$begin:math:text$${solved.latex}\\$end:math:text$</div>`;
      if(solved.stepsHtml) html += `<div style="margin-top:10px;"><strong>Lời giải tóm tắt:</strong>${solved.stepsHtml}</div>`;
      appendChatBot(html);
      if(window.MathJax) MathJax.typesetPromise && MathJax.typesetPromise();
      // also update main UI with this solved result (optional)
      derivativePre.textContent = solved.final;
      derivativeLatex.innerHTML = solved.latex ? `\$begin:math:text$${solved.latex}\\$end:math:text$` : '';
      stepsDiv.innerHTML = solved.stepsHtml;
      if(window.MathJax) MathJax.typesetPromise && MathJax.typesetPromise();
      // plot
      try { drawPlotSafe(parseSafe(expr), solved.derivNode || parseSafe(solved.final), variable); } catch(e){}
      return;
    }
    // fallback
    appendChatBot("Xin lỗi, tôi chưa rõ. Bạn thử hỏi cụ thể hơn: 'Đạo hàm của x^2' hoặc 'Ai tạo ra bạn?'.");
  }, 500);
}

/* Enter key on chat input */
if(userInputChat) userInputChat.addEventListener('keydown', (ev)=>{
  if(ev.key === 'Enter') sendMessage();
});

/* === Optional: Integrate OpenAI (client-side) - DANGER WARNING
   - You can enable this by adding an input field for API key (NOT recommended publicly).
   - If you want to integrate properly, do it on server-side.
   Below is commented example of how you WOULD call the OpenAI API (POST) from the client,
   but DO NOT expose your API key in frontend code.
*/
/*
async function callOpenAIApi(prompt, apiKey){
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // example
      messages: [{role:'user', content: prompt}],
      max_tokens: 800
    })
  });
  const obj = await res.json();
  return obj;
}
*/

/* === Initialize small greeting === */
(function init(){
  // ensure MathJax is rendered for static content
  if(window.MathJax) MathJax.typesetPromise && MathJax.typesetPromise();
})();

