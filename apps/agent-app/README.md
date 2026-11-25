# 🤖 Agent App — "น้องอุทยาน"

แอปแชทที่มี AI agent (Claude API + tool use) สำหรับ Lab 5 · เนื้อหาการสอนอยู่ที่ [docs/05-agent-app.md](../../docs/05-agent-app.md)

## 🚀 รัน

ผ่าน Docker (แนะนำ — รันพร้อม Node-RED และ n8n):

```bash
# จากราก repo
docker compose up -d --build agent-app
```

รันตรงด้วย Node.js 22+:

```bash
cd apps/agent-app
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start      # PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."; npm start
```

เปิด http://localhost:3000

## ⚙️ ตัวแปรแวดล้อม

| ตัวแปร | ค่าเริ่มต้น | ความหมาย |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | จำเป็น |
| `CLAUDE_MODEL` | `claude-opus-5-5` | โมเดลที่ใช้ |
| `NODE_RED_URL` | `http://localhost:1880` | ใช้กับ `get_air_quality` |
| `N8N_NOTIFY_URL` | `http://localhost:5678/webhook/notify` | ใช้กับ `send_notification` |
| `DATA_DIR` | `./data` | ที่เก็บ `tasks.json` |
| `PORT` | `3000` | |

## 🔧 เครื่องมือของ agent

| ชื่อ | ทำอะไร |
|---|---|
| `get_current_time` | วันเวลาปัจจุบัน (Asia/Bangkok) |
| `list_tasks` / `add_task` / `update_task_status` | จัดการงานใน `tasks.json` |
| `get_air_quality` | อ่านสรุปคุณภาพอากาศจาก Node-RED (`/air/latest`) |
| `send_notification` | ส่งแจ้งเตือนผ่าน n8n webhook `notify` |

เพิ่มเครื่องมือใหม่: เพิ่ม entry ใน `registry` ของ [tools.js](tools.js) (description + strict schema + `run`) — ไม่ต้องแก้ไฟล์อื่น
