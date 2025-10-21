* { box-sizing: border-box; font-family: "Segoe UI", sans-serif; }
body { margin: 0; background: #f8fafc; color: #1e293b; }

header {
  background: #0f172a;
  color: #f8fafc;
  text-align: center;
  padding: 25px 10px;
  border-bottom: 4px solid #eab308;
}
header h1 { margin: 0; font-size: 2rem; }
header p { margin-top: 5px; opacity: 0.8; }

main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 30px;
}
.input-panel, .output-panel {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.input-panel input, select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #94a3b8;
  font-size: 1rem;
  outline: none;
}
.input-row {
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
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn.blue  { background: #2563eb; color: white; }
.btn.gold  { background: #eab308; color: white; }
.btn.gray  { background: #e2e8f0; }
.btn:hover { opacity: 0.85; }

.math-box {
  background: #f1f5f9;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.3rem;
  text-align: center;
  color: #111827;
}
.steps-box {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
}
.plot { width: 100%; height: 400px; }

footer {
  text-align: center;
  padding: 15px;
  background: #0f172a;
  color: white;
  border-top: 4px solid #eab308;
  font-size: 0.9rem;
}
@media (max-width: 900px) {
  main { grid-template-columns: 1fr; }
}
