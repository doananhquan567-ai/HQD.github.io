* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

body {
  margin: 0;
  background: linear-gradient(135deg, #e2e8f0, #f8fafc);
  color: #1e293b;
}

.header {
  text-align: center;
  background: #0f172a;
  color: #f8fafc;
  padding: 20px 10px;
  border-bottom: 4px solid #eab308;
}
.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}
.header p {
  margin: 5px 0 0;
  opacity: 0.8;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 30px;
}

.input-panel, .output-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 20px;
}

input, select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #94a3b8;
  font-size: 1rem;
  outline: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.button-row {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn.primary { background: #2563eb; color: white; }
.btn.primary:hover { background: #1d4ed8; }
.btn.gold { background: #eab308; color: white; }
.btn.gold:hover { background: #facc15; }
.btn.ghost { background: #e2e8f0; }
.btn.ghost:hover { background: #cbd5e1; }

.math-output {
  font-size: 1.3rem;
  color: #111827;
  background: #f1f5f9;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
}

.steps-box, .plot-box {
  margin-top: 25px;
}
.plot {
  width: 100%;
  height: 400px;
}

.footer {
  text-align: center;
  padding: 15px;
  background: #0f172a;
  color: white;
  font-size: 0.9rem;
  border-top: 4px solid #eab308;
}
