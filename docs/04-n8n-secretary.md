<div align="center">

[⬅️ 📙 03 Node-RED](03-node-red.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📓 05 แอป AI Agent ➡️](05-agent-app.md)

</div>

# 📕 04 · n8n: สร้างเลขาส่วนตัวด้วย AI Agent 🟣

**เวลา:** 14.00–15.10 (สอน 15 นาที + Lab 4 55 นาที)
**ผลลัพธ์:** เลขาส่วนตัวที่ (1) รับแจ้งเตือนจากระบบอื่น (2) คุยผ่านแชทและจัดการงานให้ (3) ส่งสรุปประจำเช้าเอง

---

## ⚖️ 1. n8n ต่างจาก Node-RED อย่างไร

| | Node-RED | n8n |
|---|---|---|
| ถนัด | IoT, event ความถี่สูง, edge | งานธุรกิจ, เชื่อม SaaS (Gmail, Calendar, Sheets, LINE, Slack…) |
| AI | เรียก API เอง | มีโหนด **AI Agent**, Chat Model, Memory, Tools สำเร็จรูป |
| Credential | เขียนเอง | จัดการ OAuth / API key ให้ในหน้า Credentials |
| ประวัติการรัน | debug panel | **Executions** เก็บทุกครั้ง ย้อนดูข้อมูลแต่ละโหนดได้ |
| License | Apache 2.0 | Sustainable Use License (ใช้ในองค์กรได้ ห้ามนำไปขายเป็นบริการ) |

**ใช้คู่กันได้ดี:** Node-RED อยู่ใกล้อุปกรณ์ → ส่ง event สำคัญเข้า n8n → n8n จัดการคน/เอกสาร/การแจ้งเตือน

## 🫀 2. กายวิภาคของ AI Agent ใน n8n

```text
   [Chat Trigger] ──▶ [ AI Agent ] ──▶ ตอบกลับ
                        │   │   │
          ┌─────────────┘   │   └──────────────┐
   [Chat Model]        [Memory]           [Tools ...]
   Anthropic Claude    Simple Memory       Data Table, HTTP Request,
                       (จำ N ข้อความ)        Google Calendar, Gmail, Workflow
```

| ส่วน | หน้าที่ | ข้อแนะนำ |
|---|---|---|
| **Chat Model** | สมอง | Anthropic Chat Model → `claude-opus-5-5` (ถ้าต้องการประหยัดหรือเร็วขึ้น พิจารณา Sonnet 5.5 / Haiku 5.5 ตามนโยบายองค์กร) |
| **System message** | บุคลิก + กติกา | เขียนให้ชัดว่า **ทำอะไรได้ / ห้ามทำอะไร / ต้องยืนยันก่อนทำอะไร** |
| **Memory** | ความจำในบทสนทนา | Simple Memory ใช้ session จาก Chat Trigger อัตโนมัติ |
| **Tools** | มือและขา | **ตั้งชื่อและคำอธิบายให้ชัด** — agent เลือกเครื่องมือจากคำอธิบาย |

> [!TIP]
> 💡 **คำอธิบายเครื่องมือ = prompt** ถ้า agent เรียกเครื่องมือผิด ให้แก้ description ก่อนแก้อย่างอื่น

---

## 🧪 Lab 4 (55 นาที)

### 🔔 4A · Workflow "notify" — ประตูรับแจ้งเตือน (10 นาที)

ทุกระบบ (Node-RED, Agent App) จะส่งแจ้งเตือนผ่านประตูเดียวนี้ → เปลี่ยนช่องทางทีหลังได้โดยไม่แก้ระบบต้นทาง

1. เปิด http://localhost:5678 → สร้างบัญชี owner (ครั้งแรก)
2. **Create Workflow** → ตั้งชื่อ `notify`
3. เพิ่มโหนด **Webhook**: Method `POST`, Path `notify`, Respond `Immediately`
4. เพิ่มโหนดส่งข้อความ (เลือก 1):
   - **Telegram → Send Message** (สร้างบอทกับ `@BotFather` → ได้ token → หา chat id ด้วยการส่งข้อความหาบอทแล้วเปิด `https://api.telegram.org/bot<TOKEN>/getUpdates`)
     Text: `{{ $json.body.title }}\n{{ $json.body.message }}\n— จาก {{ $json.body.source }}`
   - **LINE Messaging API** ผ่านโหนด HTTP Request (push message ด้วย Channel access token)
   - ไม่มีทั้งคู่: ใช้โหนด **No Operation** แล้วดูผลในแท็บ **Executions** ก็พอสำหรับวันนี้
5. **Publish/Activate** workflow (ต้องเปิดใช้งาน production URL `/webhook/notify` จึงทำงาน — ระหว่างทดสอบในหน้า editor จะเป็น `/webhook-test/notify`)
6. ทดสอบ:
   ```bash
   curl -X POST http://localhost:5678/webhook/notify -H "content-type: application/json" \
     -d '{"source":"curl","title":"ทดสอบ","message":"สวัสดีจาก workshop"}'
   ```
7. กลับไป Node-RED กดปุ่ม inject ของ flow A อีกครั้ง → ถ้า PM2.5 สูง จะมีข้อความเข้ามา (ถ้าอากาศดี ให้ลองแก้เกณฑ์ใน switch เป็น `> 0` เพื่อทดสอบ)

### 💬 4B · เลขาส่วนตัวแบบแชท (25 นาที)

1. สร้าง workflow ใหม่ `secretary`
2. **Data Table** (เมนู Overview → Data tables → Create) ชื่อ `tasks` คอลัมน์: `title` (string), `due` (date), `priority` (string), `status` (string)
3. เพิ่มโหนด **When chat message received** (Chat Trigger)
4. เพิ่มโหนด **AI Agent** ต่อจาก Chat Trigger
   - **Chat Model** → Anthropic Chat Model → สร้าง credential ด้วย API key → เลือก model `claude-opus-5-5`
   - **Memory** → Simple Memory (Context window length 10)
   - **System Message** → คัดลอกจาก [labs/n8n/secretary-system-prompt.md](../labs/n8n/secretary-system-prompt.md)
5. เพิ่ม **Tools** ให้ agent:

   | Tool | ตั้งค่า | Description (สำคัญ!) |
   |---|---|---|
   | Data Table → *Insert row* | table `tasks`, ให้ model กรอกค่าแต่ละคอลัมน์ (ปุ่ม ✨ "Let the model define this parameter") | "เพิ่มงานใหม่ลงรายการงาน" |
   | Data Table → *Get rows* | table `tasks` | "ดูรายการงานทั้งหมดหรือกรองตามสถานะ" |
   | Data Table → *Update row* | table `tasks` | "เปลี่ยนสถานะงาน" |
   | HTTP Request Tool | GET `http://node-red:1880/air/latest` | "ดูคุณภาพอากาศล่าสุดพร้อมคำแนะนำ" |
   | HTTP Request Tool (ตัวที่ 2) | POST `http://localhost:5678/webhook/notify`, Body JSON มี `title`, `message` ให้ model กรอก, `source` = `secretary` | "ส่งแจ้งเตือนเข้ามือถือ ใช้เมื่อผู้ใช้ขอเท่านั้น" |

6. กด **Open chat** (ล่างกลาง) แล้วลอง:
   - "เพิ่มงาน เตรียมสไลด์ประชุมบอร์ด ส่งวันศุกร์ ด่วน"
   - "สัปดาห์นี้มีงานอะไรบ้าง เรียงตามความด่วน"
   - "อากาศเป็นยังไง ออกไปข้างนอกตอนเที่ยงได้ไหม"
   - "ส่งรายการงานด่วนเข้ามือถือหน่อย"
7. เปิดแท็บ **Executions** → คลิกการรันล่าสุด → ดูว่า agent เรียก tool อะไร ด้วย input อะไร (**นี่คือวิธี debug agent**)

### 🌅 4C · สรุปประจำเช้า (Daily Brief) อัตโนมัติ (15 นาที)

1. workflow ใหม่ `daily-brief`
2. **Schedule Trigger** → ทุกวัน 07:30 (ทดสอบด้วยปุ่ม Execute workflow)
3. ขนานกัน 2 สาย:
   - **Data Table → Get rows** (tasks ที่ status ≠ done)
   - **HTTP Request** GET `http://node-red:1880/air/latest`
4. **Merge** (Append) → **Aggregate** (รวมเป็นรายการเดียว)
5. **Anthropic → Message a model** (หรือ Basic LLM Chain + Anthropic Chat Model)
   prompt: `เขียนสรุปเช้านี้สำหรับหัวหน้างาน ไม่เกิน 8 บรรทัด: งานที่ใกล้กำหนด งานด่วน และคำแนะนำเรื่องอากาศ\nข้อมูล: {{ JSON.stringify($json) }}`
6. ส่งต่อ **HTTP Request** POST `http://localhost:5678/webhook/notify` (body: `source`, `title` = "สรุปเช้านี้", `message` = ข้อความจาก Claude) หรือส่ง Telegram ตรง
7. Activate

**เช็กลิสต์ผ่าน Lab:**
- [ ] `curl` ไป `/webhook/notify` แล้วเห็นใน Executions (หรือเข้ามือถือ)
- [ ] คุยกับเลขาแล้วเพิ่ม/ดู/อัปเดตงานได้จริงใน Data Table
- [ ] Daily brief รันมือแล้วได้สรุปที่อ่านรู้เรื่อง
- [ ] **Download** ทั้ง 3 workflow เป็น JSON เก็บใน `labs/n8n/` ของ repo ตัวเอง แล้ว commit (⚠️ ตรวจว่าไม่มี token ติดไปในไฟล์)

---

## 🚀 ต่อยอด (การบ้าน)

### 📱 คุยกับเลขาผ่าน Telegram แทนหน้าเว็บ

Telegram Trigger ต้องการ **HTTPS URL สาธารณะ** → ใช้ Cloudflare quick tunnel:

```bash
docker run --rm --network ai-workshop_default cloudflare/cloudflared:latest tunnel --url http://n8n:5678
```

นำ `https://xxxx.trycloudflare.com/` ไปใส่ `WEBHOOK_URL` ใน `.env` → `docker compose up -d n8n` → เปลี่ยน Chat Trigger เป็น **Telegram Trigger** และใช้ `{{ $json.message.chat.id }}` เป็น session key ของ memory

> [!NOTE]
> quick tunnel เหมาะกับการทดลองเท่านั้น ระบบจริงใช้ named tunnel / reverse proxy ขององค์กร

### 📧 เชื่อม Gmail + Google Calendar 📅

1. Google Cloud Console → สร้าง OAuth Client (Web application)
2. Authorized redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
3. เปิด Gmail API และ Google Calendar API
4. n8n → Credentials → Google OAuth2 → ใส่ Client ID/Secret → Sign in
5. เพิ่ม **Gmail Tool** (Get many: unread 24 ชม.) และ **Google Calendar Tool** (Get many: วันนี้) ให้ agent และ daily brief

### 🙋 Human-in-the-loop

สำหรับการกระทำที่ย้อนไม่ได้ (ส่งอีเมลออกนอกองค์กร ลบนัดหมาย) ให้ agent **ร่าง** แล้วส่งปุ่มอนุมัติผ่าน Telegram/Slack ก่อน (n8n มีโหนด *Send and Wait for Response*)

---

<div align="center">

[⬅️ 📙 03 Node-RED](03-node-red.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📓 05 แอป AI Agent ➡️](05-agent-app.md)

</div>
