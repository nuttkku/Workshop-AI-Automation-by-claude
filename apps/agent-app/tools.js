// Tools the agent can call. Each entry pairs a schema (what Claude sees)
// with a run() function (what actually happens on our side).
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || "./data";
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const NODE_RED_URL = process.env.NODE_RED_URL || "http://localhost:1880";
const N8N_NOTIFY_URL = process.env.N8N_NOTIFY_URL || "http://localhost:5678/webhook/notify";

async function loadTasks() {
  try {
    return JSON.parse(await readFile(TASKS_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function saveTasks(tasks) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// strict: true requires every property in `required` and additionalProperties: false
function schema(properties = {}) {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

const registry = {
  get_current_time: {
    description: "Get the current date and time in Asia/Bangkok. Use before reasoning about deadlines or 'today'.",
    input_schema: schema(),
    run: async () =>
      new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "full", timeStyle: "short" }),
  },

  list_tasks: {
    description: "List the user's tasks, optionally filtered by status.",
    input_schema: schema({
      status: { type: "string", enum: ["todo", "doing", "done", "all"] },
    }),
    run: async ({ status }) => {
      const tasks = await loadTasks();
      const filtered = status === "all" ? tasks : tasks.filter((t) => t.status === status);
      return JSON.stringify(filtered);
    },
  },

  add_task: {
    description: "Add a new task. Use an empty string for due when there is no deadline.",
    input_schema: schema({
      title: { type: "string" },
      due: { type: "string", description: "YYYY-MM-DD, or empty string" },
      priority: { type: "string", enum: ["low", "normal", "high"] },
    }),
    run: async ({ title, due, priority }) => {
      const tasks = await loadTasks();
      const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      const task = { id, title, due: due || null, priority, status: "todo", createdAt: new Date().toISOString() };
      tasks.push(task);
      await saveTasks(tasks);
      return JSON.stringify(task);
    },
  },

  update_task_status: {
    description: "Change the status of a task by id.",
    input_schema: schema({
      id: { type: "integer" },
      status: { type: "string", enum: ["todo", "doing", "done"] },
    }),
    run: async ({ id, status }) => {
      const tasks = await loadTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`No task with id ${id}`);
      task.status = status;
      await saveTasks(tasks);
      return JSON.stringify(task);
    },
  },

  get_air_quality: {
    description: "Get the latest air-quality summary prepared by the Node-RED flow (PM2.5, PM10, AQI and advice).",
    input_schema: schema(),
    run: async () => {
      const res = await fetch(`${NODE_RED_URL}/air/latest`);
      if (!res.ok) throw new Error(`Node-RED responded ${res.status}`);
      return await res.text();
    },
  },

  send_notification: {
    description:
      "Send a notification to the user's phone through the n8n 'notify' workflow. Only send when the user asks for it or something is urgent.",
    input_schema: schema({
      title: { type: "string" },
      message: { type: "string" },
    }),
    run: async ({ title, message }) => {
      const res = await fetch(N8N_NOTIFY_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "agent-app", title, message }),
      });
      if (!res.ok) throw new Error(`n8n responded ${res.status} — is the 'notify' workflow active?`);
      return "sent";
    },
  },
};

export const tools = Object.entries(registry).map(([name, t]) => ({
  name,
  description: t.description,
  input_schema: t.input_schema,
  strict: true,
}));

export async function executeTool(name, input) {
  const tool = registry[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.run(input);
}
