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
/* AI HQD v6 — script.js
   - Đăng cấp: Khảo sát SGK đầy đủ (miền xác định, đạo hàm, cực trị, bảng xét dấu, điểm uốn, đồ thị)
   - Dependencies (loaded in index.html): math.js, Plotly, MathJax
*/

/* ---------- Helper DOM ---------- */
const $ = id => document.getElementById(id);
const exprInput = $('exprInput');
const variableInput = $('variableInput');
const orderSelect = $('orderSelect');
const deriveBtn = $('deriveBtn');
const analyzeBtn = $('analyzeBtn');
const clearBtn = $('clearBtn');
const resultText = $('resultText');
const resultLatex = $('resultLatex');
const stepsContainer = $('stepsContainer');
const tableContainer = $('tableContainer');
const plotRoot = $('plotRoot');
const xMinEl = $('xMin');
const xMaxEl = $('xMax');
document.querySelectorAll('.example-btn').forEach(b=>b.addEventListener('click',()=> exprInput.value=b.dataset.expr));

/* ---------- Math rendering ---------- */
async function renderMathIn(el){
  if(!window.MathJax || !MathJax.typesetPromise) {
    // fallback: show raw string
    return;
  }
  try { await MathJax.typesetPromise([el]); } catch(e){ /* ignore */ }
}

/* ---------- Safe evaluate helpers ---------- */
function compileExpr(expr){
  try { return math.parse(String(expr)).compile(); } catch(e){ return null; }
}
function safeEvalCompiled(compiled, variable, x){
  try {
    const v = compiled.evaluate({ [variable]: x });
    if(typeof v === 'number' && isFinite(v)) return v;
    return null;
  } catch(e){ return null; }
}

/* ---------- Numeric utilities ---------- */
function linspace(a,b,n){
  const out=[]; if(n<=1){out.push(a);return out;}
  const step=(b-a)/(n-1);
  for(let i=0;i<n;i++) out.push(a+step*i);
  return out;
}
function bisectionRoot(func, a, b, tol=1e-7, maxIt=60){
  let fa=func(a), fb=func(b);
  if(fa===null || fb===null) return null;
  if(Math.abs(fa) < tol) return a;
  if(Math.abs(fb) < tol) return b;
  if(fa*fb>0) return null;
  let lo=a, hi=b;
  for(let i=0;i<maxIt;i++){
    const mid=(lo+hi)/2;
    const fm=func(mid);
    if(fm===null){ lo=mid; continue; }
    if(Math.abs(fm) < tol) return mid;
    if(fa*fm <= 0){ hi = mid; fb = fm; } else { lo = mid; fa = fm; }
  }
  return (lo+hi)/2;
}
function findRootsNumeric(expr, variable='x', xmin=-50, xmax=50, samples=2000){
  const node = math.parse(expr);
  const compiled = node.compile();
  const xs = linspace(xmin,xmax,samples);
  const roots=[];
  let prev = null, prevX = null;
  for(let i=0;i<xs.length;i++){
    const x = xs[i];
    const y = safeEvalCompiled(compiled, variable, x);
    if(y===null){ prev=null; prevX=null; continue; }
    if(prev!==null){
      if(y===0) roots.push(x);
      else if(prev*y < 0){
        const r = bisectionRoot(t => safeEvalCompiled(compiled, variable, t), prevX, x);
        if(r!==null) roots.push(r);
      }
    }
    prev = y; prevX = x;
  }
  // unique
  const uniq=[];
  roots.forEach(r=>{ if(!uniq.some(u=>Math.abs(u-r)<1e-6)) uniq.push(Number(r.toFixed(8))); });
  return uniq.sort((a,b)=>a-b);
}

/* ---------- Domain detection (basic) ---------- */
function estimateDomain(expr){
  // heuristic: detect denominators, even roots, log
  const issues = [];
  try {
    const node = math.parse(expr);
    node.traverse(function(n, path, parent){
      if(n && n.type === 'OperatorNode' && n.op === '/'){
        // denominator might cause exclusions - attempt to find zeros symbolically for simple cases
        const denom = n.args[1];
        issues.push({ type:'denom', node: denom.toString() });
      }
      if(n && n.type === 'FunctionNode'){
        const name = n.fn && (n.fn.name||n.name) || '';
        if(/log|ln/i.test(name)) issues.push({type:'log', node: n.args[0].toString()});
        if(/sqrt/i.test(name)) issues.push({type:'sqrt', node: n.args[0].toString()});
      }
    });
  } catch(e){}
  if(!issues.length) return { text: "\\(\\mathbb{R}\\)", exclusions: [] };
  // produce readable text
  const excl = issues.filter(i=>i.type==='denom').map(i=>i.node);
  let text = "Tập xác định: ℝ";
  if(excl.length) text += " trừ các nghiệm của mẫu (" + excl.join(', ') + ")";
  return { text: text, exclusions: excl };
}

/* ---------- Sign chart and variation table ---------- */
function buildSignAndVariation(expr, variable='x', xmin=-10, xmax=10){
  // find critical points: roots of derivative
  let derStr;
  try { derStr = math.derivative(expr, variable).toString(); } catch(e){ derStr = null; }
  const critical = derStr ? findRootsNumeric(derStr, variable, xmin, xmax, 1200) : [];
  // include singular points from denominator
  const domainInfo = estimateDomain(expr);
  const excludeCandidates = [];
  domainInfo.exclusions.forEach(s => {
    try {
      const vals = findRootsNumeric(s, variable, xmin, xmax, 800);
      vals.forEach(v=> excludeCandidates.push(v));
    } catch(e){}
  });
  const special = [...new Set([...critical, ...excludeCandidates])].sort((a,b)=>a-b);

  // intervals
  const cuts = [-Infinity, ...special, Infinity];
  const compiledDer = derStr ? math.parse(derStr).compile() : null;
  const intervalResults = [];
  for(let i=0;i<cuts.length-1;i++){
    const a = cuts[i], b = cuts[i+1];
    let test;
    if(!isFinite(a) && isFinite(b)) test = b - 1;
    else if(isFinite(a) && !isFinite(b)) test = a + 1;
    else if(!isFinite(a) && !isFinite(b)) test = 0;
    else test = (a + b)/2;
    let sign = '0';
    if(compiledDer){
      const v = safeEvalCompiled(compiledDer, variable, test);
      if(v === null) sign = '0'; else sign = (v>0?'+':(v<0?'-':'0'));
    }
    intervalResults.push({ left:a, right:b, test, sign });
  }

  // Build HTML table similar to SGK style
  // row1: x (breakpoints)
  // row2: sign of f'
  // row3: arrows for f
  let html = `<table class="variation-table"><tr><th>${variable}</th>`;
  // headings: -∞, x1, x2, ..., +∞
  const headings = [ '-∞', ...special.map(v=>v.toFixed(4)), '+∞' ];
  headings.forEach(h => html += `<th>${h}</th>`);
  html += `</tr><tr><td>f'(${variable})</td>`;
  intervalResults.forEach(ir => html += `<td>${ir.sign}</td>`);
  html += `</tr><tr><td>f(${variable})</td>`;
  intervalResults.forEach(ir => html += `<td>${ir.sign === '+' ? '↗' : ir.sign === '-' ? '↘' : '•'}</td>`);
  html += `</tr></table>`;

  return { html, critical, domainInfo, intervalResults };
}

/* ---------- Render SGK style steps ---------- */
function showDerivativeSteps(expr, variable='x', order=1){
  try {
    const node = math.parse(expr);
    let cur = node;
    const steps = [];
    for(let k=1;k<=order;k++){
      const der = math.derivative(cur, variable);
      const derStr = der.toString();
      const derSimp = math.simplify(derStr).toString();
      steps.push({
        step: k,
        raw: derStr,
        simp: derSimp,
        texRaw: math.parse(derStr).toTex ? math.parse(derStr).toTex() : escapeHtml(derStr),
        texSimp: math.parse(derSimp).toTex ? math.parse(derSimp).toTex() : escapeHtml(derSimp),
      });
      cur = math.parse(derSimp);
    }
    // Final simplified expression
    const final = cur.toString();
    // Build HTML
    let html = `<div class="sgk-header"><strong>AI HQD kính chào</strong> — Giám đốc sản xuất: <strong>Anh Quân Đẹp Trai</strong></div>`;
    html += `<div class="step-block"><strong>Bước 0:</strong> Biểu thức ban đầu: \\(${math.parse(expr).toTex()}\\)</div>`;
    steps.forEach((s,i)=>{
      html += `<div class="step-block"><strong>Bước ${i+1}:</strong> Đạo hàm (chưa rút gọn): \\(${s.texRaw}\\)</div>`;
      html += `<div class="step-block"><strong>Rút gọn:</strong> \\(${s.texSimp}\\)</div>`;
    });
    html += `<div class="step-block"><strong>Kết luận:</strong> Đạo hàm bậc ${order} (rút gọn): \\(${math.parse(final).toTex()}\\)</div>`;
    stepsContainer.innerHTML = html;
    resultText.textContent = final;
    resultLatex.innerHTML = `\\(${math.parse(final).toTex()}\\)`;
    renderMathIn(stepsContainer);
  } catch(e){
    stepsContainer.innerHTML = `<div class="error">Lỗi khi tính đạo hàm: ${escapeHtml(e && e.message)}</div>`;
  }
}

/* ---------- Plot f and f' with annotations ---------- */
function plotWithAnnotations(expr, variable='x', xmin=-6, xmax=6){
  // compile
  let fNode, f1Node;
  try{
    fNode = math.parse(expr).compile();
    f1Node = math.parse(math.derivative(expr, variable).toString()).compile();
  } catch(e){
    plotRoot.innerHTML = `<div class="error">Không thể phân tích biểu thức để vẽ đồ thị.</div>`;
    return;
  }

  const xs = linspace(xmin, xmax, Math.max(120, Math.floor((xmax-xmin)/0.05)));
  const ys = xs.map(x=> { const v=safeEvalCompiled(fNode, variable, x); return (v===null?NaN:v); });
  const y1s = xs.map(x=> { const v=safeEvalCompiled(f1Node, variable, x); return (v===null?NaN:v); });

  const traceF = { x: xs, y: ys, mode:'lines', name:'f(x)', line:{color:'#0f4b8a',width:2} };
  const traceF1 = { x: xs, y: y1s, mode:'lines', name:"f'(x)", line:{dash:'dot',width:2,color:'#eab308'} };

  // find local roots (f'=0) to annotate critical points
  const crits = findRootsNumeric(math.derivative(expr, variable).toString(), variable, xmin, xmax, 1500).slice(0,50);
  const critPoints = crits.map(cx => {
    const y = safeEvalCompiled(fNode, variable, cx); return { x: cx, y };
  }).filter(p=>p.y!==null && isFinite(p.y));

  const annotations = critPoints.map(p=>({
    x:p.x, y:p.y, text: `(${Number(p.x).toFixed(2)}, ${Number(p.y).toFixed(2)})`, showarrow:true, arrowhead:2, ax:0, ay:-30
  }));

  const layout = {
    margin:{t:30,b:40,l:50,r:20},
    xaxis:{title:variable, gridcolor:'#eef4ff'},
    yaxis:{title:'Giá trị', gridcolor:'#eef4ff'},
    shapes:[],
    annotations
  };

  Plotly.react(plotRoot, [traceF, traceF1], layout, {responsive:true});
}

/* ---------- UI wiring ---------- */
deriveBtn.addEventListener('click', ()=> {
  const expr = exprInput.value.trim();
  const variable = (variableInput.value || 'x').trim();
  const order = Number(orderSelect.value || 1);
  if(!expr){ resultText.textContent = '⚠️ Vui lòng nhập biểu thức.'; return; }
  showDerivativeSteps(expr, variable, order);
  // clear table & plot placeholders
  tableContainer.innerHTML = '—';
  plotRoot.innerHTML = '';
});

analyzeBtn.addEventListener('click', ()=> {
  const expr = exprInput.value.trim();
  const variable = (variableInput.value || 'x').trim();
  if(!expr){ resultText.textContent = '⚠️ Vui lòng nhập hàm số.'; return; }

  // domain
  const dom = estimateDomain(expr);
  // build sign & variation
  const xmin = Number(xMinEl.value||-6), xmax = Number(xMaxEl.value||6);
  const varObj = buildSignAndVariation(expr, variable, xmin, xmax);

  // display
  let html = `<div class="sgk-header"><strong>AI HQD kính chào</strong> — Giám đốc sản xuất: <strong>Anh Quân Đẹp Trai</strong></div>`;
  html += `<div class="step-block"><strong>Tập xác định:</strong> ${dom.text}</div>`;
  html += `<div class="step-block"><strong>Đạo hàm:</strong> \\(${math.parse(math.derivative(expr, variable).toString()).toTex()}\\)</div>`;
  html += `<div class="step-block"><strong>Bảng xét dấu & biến thiên:</strong></div>`;
  html += varObj.html;
  stepsContainer.innerHTML = html;
  tableContainer.innerHTML = varObj.html;
  resultText.textContent = 'Xem bảng biến thiên và đồ thị bên dưới.';
  resultLatex.innerHTML = `\\( f'(x) = ${math.parse(math.derivative(expr, variable).toString()).toTex()} \\)`;
  renderMathIn(stepsContainer);
  renderMathIn(tableContainer);

  // plot with annotations
  plotWithAnnotations(expr, variable, xmin, xmax);
});

document.getElementById('plotUpdate').addEventListener('click', ()=> {
  const expr = exprInput.value.trim();
  const variable = (variableInput.value || 'x').trim();
  const xmin = Number(xMinEl.value || -6), xmax = Number(xMaxEl.value || 6);
  if(!expr) return;
  plotWithAnnotations(expr, variable, xmin, xmax);
});

clearBtn.addEventListener('click', ()=> {
  exprInput.value = '';
  resultText.textContent = '—';
  resultLatex.innerHTML = '';
  stepsContainer.innerHTML = 'Nhấn "Tính đạo hàm" hoặc "Khảo sát & Vẽ đồ thị SGK".';
  tableContainer.innerHTML = '—';
  plotRoot.innerHTML = '';
});

/* ---------- Util ---------- */
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

