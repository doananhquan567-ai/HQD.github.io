// ===============================
// SCRIPT.JS - Phiên bản SGK chuẩn
// ===============================

// Hàm chuyển chuỗi sang dạng LaTeX (để hiển thị công thức đẹp)
function toTexFromString(expr){
  try {
    return math.parse(expr).toTex({parenthesis: 'auto'});
  } catch {
    return expr;
  }
}

// Hàm sinh lời giải theo phong cách SGK
function explainDerivativeSGK(expr, variable) {
  const steps = [];
  let derivative = '';
  let simplified = '';

  steps.push({
    title: "Bước 1",
    content: `Xét hàm số \\( y = ${toTexFromString(expr)} \\).<br>
    Ta cần tính đạo hàm của \\( y \\) theo \\( ${variable} \\).`
  });

  try {
    derivative = math.derivative(expr, variable).toString();
    simplified = math.simplify(derivative).toString();
  } catch (e) {
    steps.push({
      title: "Lỗi",
      content: "Không thể tính đạo hàm. Hãy kiểm tra lại biểu thức nhập vào."
    });
    return steps;
  }

  steps.push({
    title: "Bước 2",
    content: `Áp dụng các quy tắc đạo hàm cơ bản:<br>
    - Đạo hàm của tổng bằng tổng các đạo hàm.<br>
    - Đạo hàm của tích và thương theo các công thức quen thuộc.<br>
    - Nếu là hàm hợp, ta dùng quy tắc chuỗi.`
  });

  steps.push({
    title: "Bước 3",
    content: `Thực hiện phép đạo hàm từng phần:<br>
    \\[
    y' = ${toTexFromString(derivative)}
    \\]`
  });

  if (derivative !== simplified) {
    steps.push({
      title: "Bước 4",
      content: `Rút gọn biểu thức vừa thu được:<br>
      \\[
      y' = ${toTexFromString(simplified)}
      \\]`
    });
  }

  steps.push({
    title: "Kết luận",
    content: `Vậy đạo hàm của \\( y = ${toTexFromString(expr)} \\) là:<br>
    \\[
    y' = ${toTexFromString(simplified || derivative)}
    \\]
    <br>✅ <b>Đáp số:</b> \\( y' = ${toTexFromString(simplified || derivative)} \\)`
  });

  return steps;
}

// Sinh các bước
function generateSteps(expr, variable){
  try {
    return explainDerivativeSGK(expr, variable);
  } catch(e) {
    console.error("Error generating SGK steps:", e);
    return [{title: "Lỗi", content: "Không thể sinh lời giải chi tiết cho biểu thức này."}];
  }
}

// Hiển thị lời giải trên giao diện
function showStepsOnUI(steps){
  const container = document.getElementById('stepsContainer');
  container.innerHTML = '<h3>📘 Lời giải chi tiết (Chuẩn SGK)</h3>';
  steps.forEach(s => {
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `<p><b>${s.title}:</b> ${s.content}</p>`;
    container.appendChild(div);
  });

  if (window.MathJax) MathJax.typeset(); // Làm công thức hiển thị đẹp
}

// Xử lý khi người dùng nhập và bấm nút "Giải"
function solveDerivative(){
  const expr = document.getElementById('exprInput').value.trim();
  const variable = document.getElementById('varInput').value.trim() || 'x';

  if(!expr){
    alert("Vui lòng nhập biểu thức cần đạo hàm!");
    return;
  }

  const steps = generateSteps(expr, variable);
  showStepsOnUI(steps);
}

// Khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function(){
  const solveBtn = document.getElementById('solveBtn');
  if(solveBtn) solveBtn.addEventListener('click', solveDerivative);
});
