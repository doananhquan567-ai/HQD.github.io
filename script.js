function explainDerivativeSGK(expr, variable) {
  const steps = [];
  steps.push({
    title: "Bước 1",
    content: `Xét hàm số \\( y = ${expr} \\). Ta cần tìm đạo hàm của \\( y \\) theo \\( ${variable} \\).`
  });

  const derivative = math.derivative(expr, variable).toString();
  const simplified = math.simplify(derivative).toString();

  steps.push({
    title: "Bước 2",
    content: "Áp dụng các quy tắc đạo hàm cơ bản và tính từng phần theo thứ tự."
  });

  steps.push({
    title: "Bước 3",
    content: `Thực hiện phép đạo hàm: \\( y' = ${toTexFromString(derivative)} \\)`
  });

  steps.push({
    title: "Bước 4",
    content: `Rút gọn biểu thức: \\( y' = ${toTexFromString(simplified)} \\)`
  });

  steps.push({
    title: "Kết luận",
    content: `Vậy đạo hàm của \\( y = ${expr} \\) là: \\( y' = ${toTexFromString(simplified)} \\).`
  });

  return steps;
}
function generateSteps(expr, variable){
  try {
    return explainDerivativeSGK(expr, variable);
  } catch(e) {
    console.error("Error generating SGK steps:", e);
    return [{title: "Lỗi", content: "Không thể sinh lời giải chi tiết cho biểu thức này."}];
  }
}
function showStepsOnUI(steps){
  const container = document.getElementById('stepsContainer');
  container.innerHTML = '<h3>📘 Lời giải chi tiết (Chuẩn SGK)</h3>';
  steps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `<b>${s.title}.</b> ${s.content}`;
    container.appendChild(div);
  });
  if(window.MathJax) MathJax.typeset(); // làm công thức hiển thị đẹp
}
