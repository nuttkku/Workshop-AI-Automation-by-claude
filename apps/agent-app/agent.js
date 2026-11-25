// The agent loop: ask Claude → run the tools it asks for → send results back → repeat
// until Claude answers in plain text. Written by hand (not the SDK tool runner) so the
// whole loop is visible for teaching.
import Anthropic from "@anthropic-ai/sdk";
import { tools, executeTool } from "./tools.js";

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const MAX_STEPS = 10; // guardrail: never loop forever

// Kept static so the prompt prefix can be cached across turns.
const SYSTEM = `คุณคือ "น้องอุทยาน" ผู้ช่วยส่วนตัวของเจ้าหน้าที่อุทยานวิทยาศาสตร์
- ตอบภาษาไทย สั้น กระชับ เป็นกันเอง
- ใช้เครื่องมือเมื่อต้องการข้อมูลจริง ห้ามเดาข้อมูลงานหรือคุณภาพอากาศ
- ก่อนตอบเรื่องกำหนดส่งหรือ "วันนี้" ให้เรียก get_current_time
- ส่งแจ้งเตือน (send_notification) เฉพาะเมื่อผู้ใช้ขอ หรือมีเรื่องด่วนจริง และบอกผู้ใช้ทุกครั้งที่ส่ง
- ถ้าเครื่องมือล้มเหลว ให้บอกผู้ใช้ตรง ๆ ว่าทำไม่สำเร็จเพราะอะไร`;

function textOf(content) {
  return content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Runs one user turn. `messages` is the session history and is appended to in place
 * (append-only: earlier turns are never edited).
 * Returns the final reply plus a trace of every tool call, for the UI.
 */
export async function runAgent(messages, userText) {
  const last = messages.at(-1);
  if (last?.role === "user") {
    // Previous turn ended on tool results (step limit hit): add to that user turn.
    last.content.push({ type: "text", text: userText });
  } else {
    messages.push({ role: "user", content: [{ type: "text", text: userText }] });
  }

  const trace = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // If a safety classifier declines, the API retries on Anthropic's recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      cache_control: { type: "ephemeral" },
      system: SYSTEM,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "refusal") {
      return { reply: "ขออภัย คำขอนี้ไม่สามารถดำเนินการได้", trace };
    }
    if (response.stop_reason !== "tool_use") {
      return { reply: textOf(response.content), trace };
    }

    const toolUses = response.content.filter((b) => b.type === "tool_use");
    // Run independent tool calls in parallel; return all results in ONE user message.
    const results = await Promise.all(
      toolUses.map(async (call) => {
        const started = Date.now();
        try {
          const output = await executeTool(call.name, call.input);
          trace.push({ tool: call.name, input: call.input, output, ms: Date.now() - started });
          return { type: "tool_result", tool_use_id: call.id, content: output };
        } catch (err) {
          trace.push({ tool: call.name, input: call.input, error: err.message, ms: Date.now() - started });
          return { type: "tool_result", tool_use_id: call.id, content: err.message, is_error: true };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }

  return { reply: `หยุดทำงานเพราะเกิน ${MAX_STEPS} ขั้นตอนที่กำหนดไว้`, trace };
}
