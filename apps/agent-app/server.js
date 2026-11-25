import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { runAgent } from "./agent.js";

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());
app.use(express.static("public"));

// sessionId -> { messages, busy }. In-memory on purpose: restart = fresh conversations.
const sessions = new Map();

function getSession(id) {
  if (!sessions.has(id)) sessions.set(id, { messages: [], busy: false });
  return sessions.get(id);
}

function errorReply(err) {
  if (err instanceof Anthropic.AuthenticationError) return [500, "API key ไม่ถูกต้อง — ตรวจ ANTHROPIC_API_KEY ใน .env"];
  if (err instanceof Anthropic.RateLimitError) return [429, "เรียก API ถี่เกินไป รอสักครู่แล้วลองใหม่"];
  if (err instanceof Anthropic.APIConnectionError) return [502, "เชื่อมต่อ Claude API ไม่ได้ — ตรวจอินเทอร์เน็ต"];
  if (err instanceof Anthropic.APIError) return [502, `Claude API error ${err.status}: ${err.message}`];
  return [500, err.message];
}

app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body ?? {};
  if (typeof sessionId !== "string" || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "ต้องมี sessionId และ message" });
  }

  const session = getSession(sessionId);
  if (session.busy) return res.status(409).json({ error: "กำลังตอบข้อความก่อนหน้าอยู่" });

  session.busy = true;
  try {
    const { reply, trace } = await runAgent(session.messages, message.trim());
    for (const t of trace) console.log(`[tool] ${t.tool} ${JSON.stringify(t.input)} ${t.error ? "ERROR " + t.error : "ok"} (${t.ms}ms)`);
    res.json({ reply, trace });
  } catch (err) {
    console.error(err);
    const [status, error] = errorReply(err);
    res.status(status).json({ error });
  } finally {
    session.busy = false;
  }
});

app.post("/api/reset", (req, res) => {
  sessions.delete(req.body?.sessionId);
  res.json({ ok: true });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Agent app on http://localhost:${PORT}`));
