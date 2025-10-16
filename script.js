function analyzeNodeForSteps(node, variable){
  const steps = [];
  if(!node) return steps;

  const add = (txt, latex) => steps.push({ text: txt, latex: latex || '' });

  const type = node.type;

  // 1️⃣ Hằng số
  if(type === 'ConstantNode'){
    add(`Biểu thức là một hằng số nên đạo hàm bằng 0.`, 
        `\\frac{d}{d${variable}}(${toTexFromString(node.toString())}) = 0`);
    return steps;
  }

  // 2️⃣ Biến số
  if(type === 'SymbolNode'){
    if(node.name === variable){
      add(`Biểu thức là biến ${variable}, nên đạo hàm bằng 1.`,
          `\\frac{d}{d${variable}}${toTexFromString(variable)} = 1`);
    } else {
      add(`Biểu thức là biến ${node.name}, không phụ thuộc vào ${variable}, nên coi là hằng → đạo hàm bằng 0.`,
          `\\frac{d}{d${variable}}${toTexFromString(node.toString())} = 0`);
    }
    return steps;
  }

  // 3️⃣ Dấu ngoặc
  if(type === 'ParenthesisNode'){
    add(`Ta lấy đạo hàm phần biểu thức bên trong dấu ngoặc.`,
        ``);
    return steps.concat(analyzeNodeForSteps(node.content, variable));
  }

  // 4️⃣ Toán tử
  if(type === 'OperatorNode'){
    const op = node.op;

    // Tổng / Hiệu
    if(op === '+' || op === '-'){
      add(`Biểu thức là tổng (hoặc hiệu) của hai hàm số.  
Theo quy tắc: Đạo hàm của tổng bằng tổng các đạo hàm; đạo hàm của hiệu bằng hiệu các đạo hàm.`,
          `\\frac{d}{d${variable}}(u \\pm v) = u' \\pm v'`);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }

    // Tích
    if(op === '*'){
      add(`Biểu thức là tích của hai (hoặc nhiều) hàm số.  
Theo quy tắc nhân: Đạo hàm của tích bằng đạo hàm của hàm thứ nhất nhân với hàm thứ hai, cộng với hàm thứ nhất nhân với đạo hàm của hàm thứ hai.`,
          `\\frac{d}{d${variable}}(uv) = u'v + uv'`);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }

    // Thương
    if(op === '/'){
      add(`Biểu thức là thương của hai hàm số.  
Theo quy tắc thương: Đạo hàm của thương bằng (đạo hàm của tử nhân với mẫu, trừ đi tử nhân với đạo hàm của mẫu) chia cho bình phương của mẫu.`,
          `\\frac{d}{d${variable}}\\left(\\frac{u}{v}\\right) = \\frac{u'v - uv'}{v^2}`);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }

    // Lũy thừa
    if(op === '^'){
      add(`Biểu thức là lũy thừa.  
Nếu số mũ là hằng, ta áp dụng công thức:  
\\( (x^n)' = n·x^{n-1} \\).  
Nếu số mũ cũng phụ thuộc vào ${variable}, ta dùng quy tắc tổng quát cho hàm dạng \\( f(x)^{g(x)} \\).`,
          ``);
      node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
      return steps;
    }
  }

  // 5️⃣ Hàm số
  if(type === 'FunctionNode'){
    const fnName = (node.fn && (node.fn.name || node.name)) || '';

    if(/sin/i.test(fnName)){
      add(`Biểu thức là hàm sin.  
Theo bảng đạo hàm cơ bản: \\( (\\sin u)' = \\cos u · u' \\).`,
          `\\frac{d}{d${variable}}\\sin(u) = \\cos(u)u'`);
    } else if(/cos/i.test(fnName)){
      add(`Biểu thức là hàm cos.  
Theo bảng đạo hàm cơ bản: \\( (\\cos u)' = -\\sin u · u' \\).`,
          `\\frac{d}{d${variable}}\\cos(u) = -\\sin(u)u'`);
    } else if(/tan/i.test(fnName)){
      add(`Biểu thức là hàm tan.  
Theo bảng đạo hàm cơ bản: \\( (\\tan u)' = \\dfrac{u'}{\\cos^2 u} \\).`,
          `\\frac{d}{d${variable}}\\tan(u) = \\frac{u'}{\\cos^2(u)}`);
    } else if(/exp|e/.test(fnName)){
      add(`Biểu thức là hàm mũ cơ số e.  
Theo bảng đạo hàm cơ bản: \\( (e^u)' = e^u · u' \\).`,
          `\\frac{d}{d${variable}}e^{u} = e^{u}u'`);
    } else if(/log|ln/i.test(fnName)){
      add(`Biểu thức là hàm logarit tự nhiên (ln).  
Theo bảng đạo hàm cơ bản: \\( (\\ln u)' = \\dfrac{u'}{u} \\).`,
          `\\frac{d}{d${variable}}\\ln(u) = \\frac{u'}{u}`);
    } else if(/sqrt/i.test(fnName)){
      add(`Biểu thức là căn bậc hai.  
Theo bảng đạo hàm cơ bản: \\( (\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}} \\).`,
          `\\frac{d}{d${variable}}\\sqrt{u} = \\frac{u'}{2\\sqrt{u}}`);
    } else {
      add(`Biểu thức là hàm ${fnName}(u).  
Ta áp dụng quy tắc đạo hàm hàm hợp: Đạo hàm của hàm ngoài nhân với đạo hàm của phần trong.`,
          ``);
    }

    node.args.forEach(arg => steps.push(...analyzeNodeForSteps(arg, variable)));
    return steps;
  }

  // 6️⃣ Trường hợp khác
  add(`Biểu thức chưa nhận diện được rõ dạng.  
Ta sẽ để hệ thống tự tính đạo hàm và rút gọn.`,
      ``);
  return steps;
}
