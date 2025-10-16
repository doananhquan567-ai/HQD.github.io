const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", () => {
  const input = userInput.value.trim();
  if (input === "") return;

  addMessage("user", input);
  userInput.value = "";

  setTimeout(() => {
    const reply = solveMath(input);
    addMessage("ai", reply);
  }, 500);
});

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add(sender === "user" ? "user-message" : "ai-message");
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function solveMath(input) {
  try {
    // Trường hợp nhập phép tính số học
    if (input.match(/^[0-9+\-*/().\s]+$/)) {
      return "📘 Kết quả là: " + eval(input);
    }

    // Trường hợp nhập phương trình dạng ax + b = c
    if (input.includes("=") && input.includes("x")) {
      const parts = input.replace(/\s/g, "").split("=");
      const left = parts[0];
      const right = parseFloat(parts[1]);
      const match = left.match(/([0-9]*)x([+\-][0-9]+)/);

      if (match) {
        const a = parseFloat(match[1] || 1);
        const b = parseFloat(match[2]);
        const x = (right - b) / a;
        return `🧮 Nghiệm của phương trình là: x = ${x}`;
      }
    }

    return "🤔 Xin lỗi, tôi chưa hiểu dạng bài này.";
  } catch (e) {
    return "❌ Có lỗi khi xử lý phép toán!";
  }
}
