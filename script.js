/* --------------------------------------------------------------------
   script.js - AI HQD (Derivative Assistant)
   - Dependencies loaded by index.html: math.js, MathJax, Plotly
   - Matches ids/classes in the provided index.html & style.css
   -------------------------------------------------------------------- */

/* ===========================
   Utility helpers
   =========================== */
function $(id) { return document.getElementById(id); }
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function nowISO(){ return (new Date()).toISOString(); }

/* Safe evaluate with math.js - returns null on error */
function compileAndEval(expr, scope = {}) {
  try {
    const node = math.parse(expr);
    const code = node.compile();
    return code.evaluate(scope);
  } catch (e) {
    return null;
  }
}

/* Render LaTeX using MathJax (waits if not ready) */
async function renderLaTeX(targetEl, texString){
  if(!targetEl) return;
  if(!texString) { targetEl.innerHTML = ""; return; }
  // surround with display math
  targetEl.innerHTML = `\\(${texString}\\)`;
  if(window.MathJax && MathJax.typesetPromise) {
    try { await MathJax.typesetPromise([targetEl]); } catch(e){ /* ignore */ }
  }
}

/* Simplify text safe */
function safeSimplify(expr){
  try {
    return math.simplify(expr).toString();
  } catch(e){
    return expr;
  }
}

/* Convert expression (string or node) to TeX using mathjs parse */
function toTexFromString(expr){
  try {
    const node = math.parse(String(expr));
    if(typeof node.toTex === 'function') return node.toTex({parenthesis:'keep'});
    return escapeHtml(String(expr));
  } catch(e){
    return escapeHtml(String(expr));
  }
}

/* Save history to localStorage */
function saveToHistory(record){
  try {
    const key = 'AI_HQD_history_v1';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(record);
    // keep recent 200
    localStorage.setItem(key, JSON.stringify(arr.slice(0,200)));
  } catch(e){}
}

/* Get history */
function getHistory(){
  try {
    const key = 'AI_HQD_history_v1';
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}

/* Populate example buttons (if any) */
function wireExamples(){
  document.querySelectorAll('.example-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const e = btn.dataset.expr || btn.textContent.trim();
      $('exprInput').value = e;
    });
  });
}

/* ===========================
   Step generator (pedagogical)
   - Uses a pragmatic approach:
     * Final derivative computed by math.derivative + simplify
     * Step texts produced by analyzing parse tree + sub-derivatives
   - Each step = { text: '...', latex: '...' }
   =========================== */

function analyzeNodeForSteps(node, variable){
  // node: mathjs Node object
  // returns an array of step objects describing rules to apply for this node
  const steps = [];
  if(!node) return steps;

  // helper add
  const add = (txt, latex) => steps.push({ text: txt, latex: latex || '' });

  // check type
  const type = node.type; // 'OperatorNode', 'FunctionNode', 'SymbolNode', 'ConstantNode', 'ParenthesisNode'
  if(type === 'ConstantNode'){
    add(`Đây là một hằng số → đạo hàm bằng 0.`, `\\frac{d}{d${variable}}\\left(${toTexFromString(node.toString())}\\right)=0`);
    return steps;
  }
  if(type === 'SymbolNode'){
    if(node.name === variable) {
      add(`Đây là biến ${variable} → đạo hàm bằng 1.`, `\\frac{d}{d${variable}}${toTexFromString(variable)}=1`);
    } else {
      add(`Biến ${node.name} không phải ${variable} → coi như hằng → đạo hàm 0.`, `\\frac{d}{d${variable}}${toTexFromString(node.toString())}=0`);
    }
    return steps;
  }
  if(type === 'ParenthesisNode'){
    add(`Lấy đạo hàm nội dung trong ngoặc.`, ``);
    return steps.concat( analyzeNodeForSteps(node.content, variable) );
  }
  if(type === 'OperatorNode'){
    const op = node.op;
    if(op === '+' || op === '-'){
      add(`Áp dụng quy tắc tổng/hiệu: (u ± v)' = u' ± v'.`, `\\frac{d}{d${variable}}(u \\pm v)=u'\\pm v'`);
      // add sub steps for arguments
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }
    if(op === '*'){
      // product rule
      add(`Áp dụng quy tắc nhân: (u·v)' = u'·v + u·v'. Nếu nhiều nhân tử thì lấy tổng các trường hợp đạo hàm từng nhân tử.`, `\\frac{d}{d${variable}}(uv)=u'v+uv'`);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }
    if(op === '/'){
      add(`Áp dụng quy tắc thương: (u/v)' = (u'v - u v')/v².`, `\\frac{d}{d${variable}}\\left(\\frac{u}{v}\\right)=\\frac{u'v-uv'}{v^2}`);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }
    if(op === '^'){
      add(`Áp dụng quy tắc lũy thừa hoặc dạng tổng quát f(x)^{g(x)}.`, ``);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }
  }
  if(type === 'FunctionNode'){
    const fnName = (node.fn && (node.fn.name || node.name)) || '';
    // common functions: sin cos tan exp log sqrt
    if(/sin/i.test(fnName)){
      add(`Hàm sin(u) → đạo hàm là cos(u)·u' (quy tắc hợp).`, `\\frac{d}{d${variable}}\\sin(u)=\\cos(u)u'`);
    } else if(/cos/i.test(fnName)){
      add(`Hàm cos(u) → đạo hàm là -sin(u)·u' (quy tắc hợp).`, `\\frac{d}{d${variable}}\\cos(u)=-\\sin(u)u'`);
    } else if(/tan/i.test(fnName)){
      add(`Hàm tan(u) → đạo hàm là u'/cos^2(u).`, ``);
    } else if(/exp|e/.test(fnName)){
      add(`Hàm exp(u) hoặc e^{u} → đạo hàm là e^{u}·u' (quy tắc hợp).`, ``);
    } else if(/log|ln/i.test(fnName)){
      add(`Hàm ln(u) → đạo hàm là u'/u.`, ``);
    } else if(/sqrt/i.test(fnName)){
      add(`Hàm sqrt(u) → đạo hàm là u'/(2 sqrt(u)).`, ``);
    } else {
      add(`Áp dụng quy tắc hợp cho hàm ${fnName}.`, ``);
    }
    // analyze arguments
    node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
    return steps;
  }

  // fallback
  add(`Không nhận diện rõ dạng biểu thức — dùng math.js để tính đạo hàm và rút gọn.`, ``);
  return steps;
}

/* Create step-by-step explanation for a full expression string */
function generateSteps(exprText, variable, order = 1){
  const steps = [];
  // Step 0: show original
  steps.push({ text: `Bước 0: Biểu thức ban đầu: ${escapeHtml(exprText)}`, latex: `\\displaystyle ${toTexFromString(exprText)}` });

  // parse using mathjs for analyzing structure
  let parsed;
  try { parsed = math.parse(exprText); }
  catch(e) {
    steps.push({ text: `Không thể phân tích biểu thức: ${escapeHtml(e.message)}`, latex: '' });
    return steps;
  }

  // iterate derivative orders
  let currentExpr = exprText;
  for(let k=1;k<=order;k++){
    steps.push({ text: `--- Đạo hàm bậc ${k} ---`, latex: '' });

    // analyze structure for pedagogical steps
    const analysis = analyzeNodeForSteps(parsed, variable);
    // push unique meaningful analysis (avoid duplicates)
    analysis.forEach(a=>{
      if(!a || !a.text) return;
      steps.push({ text: a.text, latex: a.latex || '' });
    });

    // show symbolic differentiation of the current expression using math.js
    try{
      // compute derivative symbolically
      const derNode = math.derivative(currentExpr, variable);
      const derStr = derNode.toString();
      const derSimpl = safeSimplify(derStr);

      steps.push({ text: `Tính đạo hàm bậc ${k}: ${escapeHtml(derStr)}`, latex: toTexFromString(derStr) });
      steps.push({ text: `Rút gọn: ${escapeHtml(derSimpl)}`, latex: toTexFromString(derSimpl) });

      // prepare for next iteration
      currentExpr = derSimpl;
      parsed = math.parse(currentExpr);
    } catch(err){
      // fallback: try simple mathjs diff with error capture
      steps.push({ text: `Lỗi khi lấy đạo hàm tự động: ${escapeHtml(err.message)}`, latex: '' });
      break;
    }
  }

  // summary step
  try {
    const final = safeSimplify(currentExpr);
    steps.push({ text: `Kết luận: Đạo hàm (rút gọn) là ${escapeHtml(final)}`, latex: toTexFromString(final) });
  } catch(e){ /* ignore */ }

  return steps;
}

/* ===========================
   UI rendering functions
   =========================== */

function showStepsOnUI(steps){
  const container = $('stepsContainer');
  if(!container) return;
  if(!steps || !steps.length){
    container.innerHTML = '<div class="muted">Không có bước giải.</div>'; return;
  }
  const html = steps.map((s,i)=>{
    const stepNum = i+1;
    const text = s.text ? escapeHtml(s.text) : '';
    const latex = s.latex ? s.latex : '';
    let block = `<div class="step-block"><strong>Bước ${stepNum}:</strong> ${text}`;
    if(latex){
      block += `<div class="step-latex" data-tex="${escapeHtml(latex)}">\\(${escapeHtml(latex)}\\)</div>`;
    }
    block += `</div>`;
    return block;
  }).join('');
  container.innerHTML = html;
  // render MathJax for all step-latex nodes
  container.querySelectorAll('.step-latex').forEach(async el => {
    el.innerHTML = el.getAttribute('data-tex');
  });
  if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]).catch(()=>{});
}

/* Show final result */
async function showResultOnUI(finalExpr, finalTex, steps){
  // text
  const resTextEl = $('resultText');
  const resLatexEl = $('resultLatex');
  if(resTextEl) resTextEl.textContent = finalExpr || '—';
  if(resLatexEl) await renderLaTeX(resLatexEl, finalTex || '');

  // steps
  showStepsOnUI(steps || []);
}

/* ===========================
   Plotting f and f' with Plotly
   =========================== */
function safePlot(originalExpr, derivativeExpr, variable='x', xMin=-6, xMax=6){
  const root = $('plotRoot');
  if(!root) return;
  // try compiling (math.js) and sample
  let compiledF, compiledG;
  try {
    compiledF = math.parse(originalExpr).compile();
    compiledG = math.parse(derivativeExpr).compile();
  } catch(e){
    root.innerHTML = `<div class="error">Không thể phân tích biểu thức để vẽ đồ thị: ${escapeHtml(e.message)}</div>`;
    return;
  }

  // prepare samples
  const samples = [];
  const step = (xMax - xMin) / 240; // ~240 points
  for(let t = xMin; t <= xMax + 1e-9; t += step) samples.push(Number(t.toFixed(6)));

  const xs = samples;
  const ys = xs.map(x => {
    try {
      const v = compiledF.evaluate({ [variable]: x });
      if(typeof v === 'number' && isFinite(v)) return v;
      return null;
    } catch(e){ return null; }
  });
  const yps = xs.map(x => {
    try {
      const v = compiledG.evaluate({ [variable]: x });
      if(typeof v === 'number' && isFinite(v)) return v;
      return null;
    } catch(e){ return null; }
  });

  const traces = [
    { x: xs, y: ys, mode: 'lines', name: 'f(x)', line: { color: '#0f4b8a', width: 2 } },
    { x: xs, y: yps, mode: 'lines', name: "f'(x)", line: { color: '#eab308', width: 2, dash: 'dot' } }
  ];

  const layout = {
    margin: { t: 20, b: 40, l: 50, r: 20 },
    xaxis: { title: variable, gridcolor: '#eef4ff' },
    yaxis: { title: 'Giá trị', gridcolor: '#eef4ff' },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    height: 340
  };

  Plotly.react(root, traces, layout, {responsive: true});
}

/* ===========================
   Chat mini (rule-based) + history
   =========================== */

function chatReplyMini(question){
  const q = String(question || '').toLowerCase();
  if(!q) return "Bạn chưa nhập câu hỏi.";
  if(q.includes('ai tạo') || q.includes('who created')) return "Tôi là AI HQD — do bạn thiết kế, với mã nguồn và logic toán học (math.js) được tích hợp.";
  if(q.includes('tên') || q.includes('bạn là ai')) return "Mình là AI HQD — trợ lý giải đạo hàm và trợ giúp học toán.";
  if(q.includes('đạo hàm của') || q.includes('d/dx') || q.includes('derive')) {
    // try to extract expression
    let m = q.match(/đạo hàm của\s+(.+)/) || q.match(/d\/dx\s*(.+)/) || q.match(/derive\s+(.+)/);
    if(m && m[1]) return `Bạn có thể nhập biểu thức vào ô 'Nhập biểu thức' và nhấn 'Tính đạo hàm'. Ví dụ: ${m[1].trim()}`;
    return "Bạn muốn tính đạo hàm hàm nào? Nhập nó vào ô bên trái rồi nhấn 'Tính đạo hàm'.";
  }
  if(q.includes('quy tắc nhân')) return "Quy tắc nhân: (u·v)' = u'·v + u·v'. Áp dụng khi biểu thức là tích hai hàm.";
  if(q.includes('quy tắc thương')) return "Quy tắc thương: (u/v)' = (u'·v − u·v') / v².";
  if(q.includes('cảm ơn')) return "Rất vui được giúp! Nếu cần giải thêm hãy gửi bài tiếp theo.";
  return "Mình chưa hiểu rõ. Ví dụ: 'Đạo hàm của sin(x^2)' hoặc 'Ai tạo ra bạn?'";
}

/* append chat log mini in mini-chat box (no complex UI) */
function wireMiniChat(){
  const send = $('miniChatSend'), input = $('miniChatInput');
  if(!send || !input) return;
  send.addEventListener('click', ()=>{
    const q = input.value.trim();
    if(!q) return;
    const ans = chatReplyMini(q);
    // quick UI: temporarily show alert-like bubble in steps area
    const sc = $('stepsContainer');
    if(sc){
      const node = document.createElement('div');
      node.className = 'mini-chat-response';
      node.style.padding = '10px';
      node.style.marginTop = '8px';
      node.style.background = '#f1f7ff';
      node.style.borderRadius = '8px';
      node.innerHTML = `<strong>HQD:</strong> ${escapeHtml(ans)}`;
      sc.prepend(node);
      setTimeout(()=> { if(node.parentNode) node.parentNode.removeChild(node); }, 6000);
    }
    input.value = '';
  });
}

/* Save session result to history and show small toast (we'll keep minimal) */
function persistResult(expr, variable, order, result, latex, steps){
  const rec = { expr, variable, order, result, latex, steps, timestamp: nowISO() };
  saveToHistory(rec);
}

/* ===========================
   Wire UI actions & init
   =========================== */

function initApp(){
  // get elements
  const deriveBtn = $('deriveBtn');
  const clearBtn = $('clearBtn');
  const exprInput = $('exprInput');
  const variableInput = $('variableInput');
  const orderSelect = $('orderSelect');
  const showSteps = $('showSteps');
  const resultText = $('resultText');
  const resultLatex = $('resultLatex');
  const stepsContainer = $('stepsContainer');
  const plotUpdate = $('plotUpdate');
  const xMinEl = $('xMin');
  const xMaxEl = $('xMax');

  wireExamples();
  wireMiniChat();

  // derive
  deriveBtn && deriveBtn.addEventListener('click', async ()=>{
    const expr = (exprInput.value || '').trim();
    const variable = (variableInput.value || 'x').trim() || 'x';
    const order = Number(orderSelect.value || 1);
    const wantSteps = !!(showSteps && showSteps.checked);

    if(!expr){
      resultText.textContent = '⚠️ Vui lòng nhập biểu thức.';
      resultLatex.innerHTML = '';
      stepsContainer.innerHTML = '<div class="muted">Chưa có bước giải.</div>';
      return;
    }

    // compute derivative using math.js; use try/catch
    try{
      // compute derivative iteratively for order
      let cur = expr;
      const steps = wantSteps ? generateSteps(expr, variable, order) : [];
      for(let i=0;i<order;i++){
        const derNode = math.derivative(cur, variable);
        const derStr = derNode.toString();
        cur = safeSimplify(derStr);
      }
      const final = cur;
      const finalTex = toTexFromString(final);

      // show
      await showResultOnUI(final, finalTex, steps);

      // save history
      persistResult(expr, variable, order, final, finalTex, steps);

      // draw plot
      const xMin = Number(xMinEl.value || -6);
      const xMax = Number(xMaxEl.value || 6);
      safePlot(expr, final, variable, xMin, xMax);

    } catch(err){
      resultText.textContent = `❌ Lỗi khi tính đạo hàm: ${err.message || err}`;
      resultLatex.innerHTML = '';
      stepsContainer.innerHTML = `<div class="error">Không thể tính đạo hàm: ${escapeHtml(String(err))}</div>`;
      // clear plot
      try { Plotly.purge('plotRoot'); } catch(e){}
    }
  });

  // clear
  clearBtn && clearBtn.addEventListener('click', ()=>{
    if($('exprInput')) $('exprInput').value = '';
    if($('resultText')) $('resultText').textContent = '—';
    if($('resultLatex')) $('resultLatex').innerHTML = '';
    if($('stepsContainer')) $('stepsContainer').innerHTML = 'Nhấn "Tính đạo hàm" để xem bước giải.';
    try{ Plotly.purge('plotRoot'); } catch(e){}
  });

  // plot update
  plotUpdate && plotUpdate.addEventListener('click', ()=>{
    const expr = (exprInput.value || '').trim();
    const variable = (variableInput.value || 'x').trim() || 'x';
    if(!expr) return;
    // compute derivative quickly
    try {
      const der = safeSimplify(math.derivative(expr, variable).toString());
      const xmin = Number(xMinEl.value || -6), xmax = Number(xMaxEl.value || 6);
      safePlot(expr, der, variable, xmin, xmax);
    } catch(e){
      // ignore
    }
  });

  // Tour modal handlers (already have inline but ensure accessible)
  const tourBtn = $('tourBtn'), tourModal = $('tourModal'), tourClose = $('tourClose'), tourGotIt = $('tourGotIt');
  if(tourBtn && tourModal){
    tourBtn.addEventListener('click', ()=> { tourModal.style.display='flex'; tourModal.setAttribute('aria-hidden','false'); });
  }
  if(tourClose) tourClose.addEventListener('click', ()=> { tourModal.style.display='none'; tourModal.setAttribute('aria-hidden','true'); });
  if(tourGotIt) tourGotIt.addEventListener('click', ()=> { tourModal.style.display='none'; tourModal.setAttribute('aria-hidden','true'); });

  // mini chat wired above
  // load recent history summary into steps area top
  const hist = getHistory();
  if(hist && hist.length){
    const container = $('stepsContainer');
    const first = hist[0];
    const node = document.createElement('div');
    node.style.marginBottom = '10px';
    node.style.padding = '8px';
    node.style.background = '#f8fbff';
    node.style.borderRadius = '8px';
    node.innerHTML = `<strong>Lần gần nhất:</strong> ${escapeHtml(first.expr)} → ${escapeHtml(first.result)} <div style="font-size:12px;color:#6b7280">${escapeHtml(first.timestamp)}</div>`;
    if(container) container.prepend(node);
  }
}

/* initialize when DOM ready */
document.addEventListener('DOMContentLoaded', function(){
  // ensure math and Plotly are available
  const ready = () => {
    try { initApp(); }
    catch(e){ console.error('Init error', e); }
  };

  // If math is present proceed, else wait small time
  if(typeof math === 'undefined') {
    console.error('math.js không được load. Hãy chắc đã load CDN math.js trong index.html');
    setTimeout(ready, 800);
  } else {
    ready();
  }
});
