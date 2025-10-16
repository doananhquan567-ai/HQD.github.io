// script.js (nâng cấp giải từng bước chi tiết)
// Yêu cầu math.js đã load trong index.html

// Utility
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function toTex(node) {
  try {
    // mathjs Node has toTex method
    return node.toTex ? node.toTex({parenthesis: 'auto'}) : escapeHtml(node.toString());
  } catch (e) {
    return escapeHtml(node.toString());
  }
}
function pushStep(steps, text, latex) {
  steps.push({text, latex});
}
function cloneNode(n) { return n ? n.cloneDeep() : null; }

// Một số helper để dễ tạo node
const parse = (s) => math.parse(String(s));
const one = parse('1');
const zero = parse('0');

// Hàm chính: tính đạo hàm node, trả về {node, steps}
function differentiate(node, varName) {
  const steps = [];

  // Constant
  if (node.isConstantNode) {
    pushStep(steps, `Đạo hàm của hằng ${node.value} là 0.`, `\\frac{d}{d${varName}}(${toTex(node)})=0`);
    return { node: zero, steps };
  }

  // Symbol (biến)
  if (node.isSymbolNode) {
    if (node.name === varName) {
      pushStep(steps, `Đạo hàm của biến ${varName} theo ${varName} là 1.`, `\\frac{d}{d${varName}}${toTex(node)}=1`);
      return { node: one, steps };
    } else {
      pushStep(steps, `Biến ${node.name} không phải ${varName} → xem như hằng: đạo hàm = 0.`, `\\frac{d}{d${varName}}${toTex(node)}=0`);
      return { node: zero, steps };
    }
  }

  // Parenthesis
  if (node.isParenthesisNode) {
    const inner = differentiate(node.content, varName);
    pushStep(inner.steps, `Áp dụng đạo hàm cho biểu thức trong ngoặc.`, ``);
    return { node: inner.node, steps: inner.steps };
  }

  // Operator nodes
  if (node.isOperatorNode) {
    const op = node.op;
    // sum/diff
    if (op === '+' || op === '-') {
      const A = differentiate(node.args[0], varName);
      const B = differentiate(node.args[1], varName);
      pushStep(steps, `Quy tắc tổng/hiệu: (A ${op} B)' = A' ${op} B'.`, `\\frac{d}{d${varName}}(A ${op} B)=A' ${op} B'`);
      steps.push(...A.steps);
      steps.push(...B.steps);
      const newNode = new math.OperatorNode(op, node.fn, [A.node, B.node]);
      return { node: newNode, steps };
    }

    // multiplication (could be multiple factors)
    if (op === '*') {
      // handle more than 2 factors by extending product rule
      const factors = node.args;
      // if only two, standard product rule
      if (factors.length === 2) {
        const u = factors[0], v = factors[1];
        const du = differentiate(u, varName);
        const dv = differentiate(v, varName);
        pushStep(steps, `Quy tắc nhân: (u v)' = u' v + u v'.`, `\\frac{d}{d${varName}}(uv)=u'v+uv'`);
        steps.push(...du.steps);
        steps.push(...dv.steps);
        const term1 = new math.OperatorNode('*','multiply',[du.node, cloneNode(v)]);
        const term2 = new math.OperatorNode('*','multiply',[cloneNode(u), dv.node]);
        const sum = new math.OperatorNode('+','add',[term1, term2]);
        return { node: sum, steps };
      } else {
        // nhiều nhân tử: (f1*f2*...*fn)' = sum_{i} (f1*...*fi'*...*fn)
        pushStep(steps, `Quy tắc nhân nhiều nhân tử: đạo hàm bằng tổng các trường hợp lấy đạo hàm một thừa số và nhân giữ lại các thừa số còn lại.`, ``);
        const partials = [];
        for (let i=0;i<factors.length;i++){
          const di = differentiate(factors[i], varName);
          steps.push(...di.steps);
          const others = factors.map((f,j) => (j===i? di.node : cloneNode(f)));
          // multiply all others
          let prod = others[0];
          for (let k=1;k<others.length;k++){
            prod = new math.OperatorNode('*','multiply',[prod, others[k]]);
          }
          partials.push(prod);
        }
        // sum partials
        let sum = partials[0];
        for (let s=1;s<partials.length;s++){
          sum = new math.OperatorNode('+','add',[sum, partials[s]]);
        }
        return { node: sum, steps };
      }
    }

    // division
    if (op === '/') {
      const u = node.args[0], v = node.args[1];
      const du = differentiate(u, varName);
      const dv = differentiate(v, varName);
      pushStep(steps, `Quy tắc chia: (u/v)' = (u' v - u v') / v^2.`, `\\frac{d}{d${varName}}\\left(\\frac{u}{v}\\right)=\\frac{u'v-uv'}{v^2}`);
      steps.push(...du.steps);
      steps.push(...dv.steps);
      const numerLeft = new math.OperatorNode('*','multiply',[du.node, cloneNode(v)]);
      const numerRight = new math.OperatorNode('*','multiply',[cloneNode(u), dv.node]);
      const numer = new math.OperatorNode('-','subtract',[numerLeft, numerRight]);
      const denom = new math.OperatorNode('^','pow',[cloneNode(v), math.parse('2')]);
      const frac = new math.OperatorNode('/','divide',[numer, denom]);
      return { node: frac, steps };
    }

    // power ^
    if (op === '^') {
      const base = node.args[0], exponent = node.args[1];

      // case x^n where n constant
      if (base.isSymbolNode && base.name === varName && exponent.isConstantNode) {
        const n = Number(exponent.value);
        pushStep(steps, `Quy tắc lũy thừa: d/d${varName}(${varName}^{${n}}) = ${n} ${varName}^{${n-1}}.`, `\\frac{d}{d${varName}}${toTex(node)}=${n}${toTex(base)}^{${n-1}}`);
        const coef = parse(String(n));
        const pow = new math.OperatorNode('^','pow',[cloneNode(base), parse(String(n-1))]);
        const res = new math.OperatorNode('*','multiply',[coef, pow]);
        return { node: res, steps };
      }

      // case constant^x or a^x
      if (base.isConstantNode && exponent.isSymbolNode && exponent.name === varName) {
        // d/dx a^x = a^x * ln(a)
        pushStep(steps, `Quy tắc: d/d${varName}(a^{${varName}}) = a^{${varName}} \\ln(a).`, `\\frac{d}{d${varName}}${toTex(node)}=${toTex(node)}\\ln(${toTex(base)})`);
        const lnA = new math.FunctionNode(new math.SymbolNode('log'), [cloneNode(base)]);
        const res = new math.OperatorNode('*','multiply',[cloneNode(node), lnA]);
        return { node: res, steps };
      }

      // general f(x)^g(x): use formula a^b -> a^b*(b'*ln(a) + b*a'/a)
      pushStep(steps, `Trường hợp tổng quát: d(a(x)^{b(x)}) = a^b ( b' ln a + b * a'/a ).`, `\\text{d}(a^b)=a^b\\left(b'\\ln a + b\\frac{a'}{a}\\right)`);
      const da = differentiate(base, varName);
      const db = differentiate(exponent, varName);
      steps.push(...da.steps);
      steps.push(...db.steps);
      const lnA = new math.FunctionNode(new math.SymbolNode('log'), [cloneNode(base)]);
      const term1 = new math.OperatorNode('*','multiply',[db.node, lnA]);
      const aPrimeOverA = new math.OperatorNode('/','divide',[da.node, cloneNode(base)]);
      const term2 = new math.OperatorNode('*','multiply',[cloneNode(exponent), aPrimeOverA]);
      const inside = new math.OperatorNode('+','add',[term1, term2]);
      const full = new math.OperatorNode('*','multiply',[cloneNode(node), inside]);
      return { node: full, steps };
    }
  }

  // Function nodes (sin, cos, tan, exp, log, sqrt, etc.)
  if (node.isFunctionNode) {
    const fn = node.fn && node.fn.name ? node.fn.name : (node.name || '');
    const arg = node.args[0];
    const dArg = differentiate(arg, varName);
    // push inner steps first
    steps.push(...dArg.steps);

    // sin
    if (fn === 'sin') {
      pushStep(steps, `Đạo hàm sin(u) = cos(u) * u'.`, `\\frac{d}{d${varName}}\\sin(u)=\\cos(u)\\cdot u'`);
      const cosu = new math.FunctionNode(new math.SymbolNode('cos'), [cloneNode(arg)]);
      const res = new math.OperatorNode('*','multiply',[cosu, dArg.node]);
      return { node: res, steps };
    }
    if (fn === 'cos') {
      pushStep(steps, `Đạo hàm cos(u) = -sin(u) * u'.`, `\\frac{d}{d${varName}}\\cos(u)=-\\sin(u)\\cdot u'`);
      const sinu = new math.FunctionNode(new math.SymbolNode('sin'), [cloneNode(arg)]);
      const negSinu = new math.OperatorNode('-', 'unaryMinus', [sinu]);
      const res = new math.OperatorNode('*','multiply',[negSinu, dArg.node]);
      return { node: res, steps };
    }
    if (fn === 'tan') {
      pushStep(steps, `Đạo hàm tan(u) = (1/\\cos^2(u)) * u'.`, `\\frac{d}{d${varName}}\\tan(u)=\\frac{1}{\\cos^2(u)}\\cdot u'`);
      const cosu = new math.FunctionNode(new math.SymbolNode('cos'), [cloneNode(arg)]);
      const cosu2 = new math.OperatorNode('^','pow',[cosu, parse('2')]);
      const inv = new math.OperatorNode('/','divide',[parse('1'), cosu2]);
      const res = new math.OperatorNode('*','multiply',[inv, dArg.node]);
      return { node: res, steps };
    }
    // sec = 1/cos
    if (fn === 'sec') {
      pushStep(steps, `Đạo hàm sec(u) = sec(u)tan(u) * u'.`, ``);
      const secu = new math.FunctionNode(new math.SymbolNode('sec'), [cloneNode(arg)]);
      const tanu = new math.FunctionNode(new math.SymbolNode('tan'), [cloneNode(arg)]);
      const res = new math.OperatorNode('*','multiply',[new math.OperatorNode('*','multiply',[secu, tanu]), dArg.node]);
      return { node: res, steps };
    }
    if (fn === 'csc') {
      pushStep(steps, `Đạo hàm csc(u) = -csc(u)cot(u) * u'.`, ``);
      const cscu = new math.FunctionNode(new math.SymbolNode('csc'), [cloneNode(arg)]);
      const cotu = new math.FunctionNode(new math.SymbolNode('cot'), [cloneNode(arg)]);
      const neg = new math.OperatorNode('-', 'unaryMinus', [new math.OperatorNode('*','multiply',[cscu, cotu])]);
      const res = new math.OperatorNode('*','multiply',[neg, dArg.node]);
      return { node: res, steps };
    }
    if (fn === 'cot') {
      pushStep(steps, `Đạo hàm cot(u) = -csc^2(u) * u'.`, ``);
      const cscu = new math.FunctionNode(new math.SymbolNode('csc'), [cloneNode(arg)]);
      const cscu2 = new math.OperatorNode('^','pow',[cscu, parse('2')]);
      const neg = new math.OperatorNode('-', 'unaryMinus', [cscu2]);
      const res = new math.OperatorNode('*','multiply',[neg, dArg.node]);
      return { node: res, steps };
    }

    // inverse trig
    if (fn === 'asin' || fn === 'arcsin') {
      pushStep(steps, `Đạo hàm arcsin(u) = u' / sqrt(1-u^2).`, `\\frac{d}{d${varName}}\\arcsin(u)=\\frac{u'}{\\sqrt{1-u^2}}`);
      const denom = new math.FunctionNode(new math.SymbolNode('sqrt'), [new math.OperatorNode('-', 'subtract',[parse('1'), new math.OperatorNode('^','pow',[cloneNode(arg), parse('2')])])]);
      const res = new math.OperatorNode('/', 'divide', [dArg.node, denom]);
      return { node: res, steps };
    }
    if (fn === 'acos' || fn === 'arccos') {
      pushStep(steps, `Đạo hàm arccos(u) = - u' / sqrt(1-u^2).`, ``);
      const denom = new math.FunctionNode(new math.SymbolNode('sqrt'), [new math.OperatorNode('-', 'subtract',[parse('1'), new math.OperatorNode('^','pow',[cloneNode(arg), parse('2')])])]);
      const res = new math.OperatorNode('*','multiply',[new math.OperatorNode('-', 'unaryMinus', [new math.OperatorNode('/', 'divide', [dArg.node, denom])]), parse('1')]);
      return { node: res, steps };
    }
    if (fn === 'atan' || fn === 'arctan') {
      pushStep(steps, `Đạo hàm arctan(u) = u' / (1+u^2).`, ``);
      const denom = new math.OperatorNode('+','add',[parse('1'), new math.OperatorNode('^','pow',[cloneNode(arg), parse('2')])]);
      const res = new math.OperatorNode('/', 'divide', [dArg.node, denom]);
      return { node: res, steps };
    }

    // exp
    if (fn === 'exp') {
      pushStep(steps, `Đạo hàm exp(u) = exp(u) * u'.`, `\\frac{d}{d${varName}}e^{u}=e^{u}u'`);
      const expu = new math.FunctionNode(new math.SymbolNode('exp'), [cloneNode(arg)]);
      const res = new math.OperatorNode('*','multiply',[expu, dArg.node]);
      return { node: res, steps };
    }
    // log/ln
    if (fn === 'log' || fn === 'ln') {
      pushStep(steps, `Đạo hàm ln(u) = u' / u. (với log tham số: log(u,b) xử lý riêng)`, `\\frac{d}{d${varName}}\\ln(u)=\\frac{u'}{u}`);
      const res = new math.OperatorNode('/','divide',[dArg.node, cloneNode(arg)]);
      return { node: res, steps };
    }

    // sqrt
    if (fn === 'sqrt') {
      pushStep(steps, `Đạo hàm sqrt(u) = u' / (2 sqrt(u)).`, ``);
      const sqrtu = new math.FunctionNode(new math.SymbolNode('sqrt'), [cloneNode(arg)]);
      const denom = new math.OperatorNode('*','multiply',[parse('2'), sqrtu]);
      const res = new math.OperatorNode('/','divide',[dArg.node, denom]);
      return { node: res, steps };
    }

    // fallback: try math.derivative on function form and apply chain rule
    try {
      pushStep(steps, `Áp dụng quy tắc hợp: (f(u))' = f'(u) * u' (dùng math.js để tìm f').`, ``);
      // build placeholder u and compute derivative of f(u) w.r.t u
      const uPlaceholder = 'u';
      const funcStr = `${fn}(${uPlaceholder})`;
      const fPrime = math.derivative(funcStr, uPlaceholder); // derivative f'(u)
      // replace u by actual arg in fPrime
      const fPrimeReplacedStr = fPrime.toString().replace(/\bu\b/g, `(${arg.toString()})`);
      const fPrimeNode = parse(fPrimeReplacedStr);
      const res = new math.OperatorNode('*','multiply',[fPrimeNode, dArg.node]);
      return { node: res, steps };
    } catch (e) {
      pushStep(steps, `Chưa hỗ trợ đạo hàm cho hàm "${fn}". Thử dùng math.js trực tiếp.`, ``);
      try {
        const der = math.derivative(node.toString(), varName);
        pushStep(steps, `math.js trả về đạo hàm: ${der.toString()}`, `\\text{math.js: } ${escapeHtml(der.toString())}`);
        return { node: der, steps };
      } catch (err) {
        pushStep(steps, `Không thể tính đạo hàm cho dạng này.`, ``);
        return { node: zero, steps };
      }
    }
  }

  // Fallback: dùng math.js derivative
  try {
    pushStep(steps, `Không khớp mẫu thủ công, dùng math.js để tính đạo hàm biểu thức.`, ``);
    const der = math.derivative(node.toString(), varName);
    pushStep(steps, `math.js trả về: ${der.toString()}`, `\\text{math.js: } ${escapeHtml(der.toString())}`);
    return { node: der, steps };
  } catch (err) {
    pushStep(steps, `Không thể tính đạo hàm cho biểu thức này.`, ``);
    return { node: zero, steps };
  }
}

// Render steps as HTML with LaTeX
function renderSteps(steps) {
  if (!steps || steps.length === 0) return '<div class="step">Không có bước nào.</div>';
  return steps.map((s,i) => {
    const tex = s.latex ? `$${s.latex}$` : (s.text ? `$${escapeTex(s.text)}$` : '');
    // show plain text then LaTeX (if available)
    let html = `<div class="step"><strong>Bước ${i+1}:</strong> ${escapeHtml(s.text || '')}`;
    if (s.latex) html += `<div style="margin-top:6px;">${tex}</div>`;
    html += `</div>`;
    return html;
  }).join('');
}

// Escape for putting text into a LaTeX inline safely (very simple)
function escapeTex(str) {
  return String(str).replace(/%/g,'\\%').replace(/_/g,'\\_').replace(/</g,'\\lt ').replace(/>/g,'\\gt ');
}

// Main UI handling
document.getElementById('deriveBtn').addEventListener('click', () => {
  const exprText = document.getElementById('expr').value.trim();
  const varName = document.getElementById('variable').value.trim() || 'x';
  const outDer = document.getElementById('derivative');
  const outDerLatex = document.getElementById('derivative-latex');
  const outSteps = document.getElementById('steps');

  if (!exprText) {
    outDer.textContent = 'Vui lòng nhập biểu thức.';
    outDerLatex.innerHTML = '';
    outSteps.innerHTML = '';
    return;
  }

  try {
    // parse expression
    const parsed = math.parse(exprText);

    // differentiate
    const { node: derNode, steps } = differentiate(parsed, varName);

    // simplify derivative for nicer presentation
    let simplified;
    try {
      simplified = math.simplify(derNode).toString();
    } catch (e) {
      simplified = derNode.toString();
    }

    outDer.textContent = simplified;
    // LaTeX: try node.toTex
    let derTex = '';
    try {
      derTex = derNode.toTex ? derNode.toTex({parenthesis: 'keep'}) : '';
    } catch (e) {
      derTex = '';
    }
    if (derTex) {
      outDerLatex.innerHTML = `\\(\\displaystyle ${derTex}\\)`;
    } else {
      outDerLatex.innerHTML = '';
    }

    // steps
    outSteps.innerHTML = renderSteps(steps);

    // re-render MathJax
    if (window.MathJax) {
      MathJax.typesetClear();
      MathJax.typesetPromise();
    }
  } catch (err) {
    outDer.textContent = 'Lỗi khi phân tích biểu thức. Kiểm tra cú pháp.';
    outDerLatex.innerHTML = '';
    outSteps.innerHTML = `<div class="step">Chi tiết lỗi: ${escapeHtml(err.toString())}</div>`;
  }
});

// Clear
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('expr').value = '';
  document.getElementById('derivative').textContent = '—';
  document.getElementById('derivative-latex').innerHTML = '';
  document.getElementById('steps').innerHTML = 'Nhấn "Tính đạo hàm" để xem các bước.';
});
