<div align="center">

[⬅️ 📗 02 ความยั่งยืน](02-sustainable-stack.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📕 04 n8n เลขาส่วนตัว ➡️](04-n8n-secretary.md)

</div>

# 📙 03 · Node-RED: ระบบอัตโนมัติแบบ flow 🔴

**เวลา:** 13.10–14.00 (สอน 15 นาที + Lab 3 35 นาที)
**ผลลัพธ์:** flow ที่ดึงข้อมูลจริง → ให้ Claude วิเคราะห์ → ตัดสินใจ → ส่งต่อระบบอื่น และเปิดเป็น API ให้แอปอื่นเรียกได้

---

## 🪜 1. ระบบอัตโนมัติ 3 ระดับ (กรอบคิดของช่วงบ่าย)

| ระดับ | ลักษณะ | ใครตัดสินใจ | เครื่องมือวันนี้ |
|---|---|---|---|
| **Rule-based** | ถ้า A แล้วทำ B ทุกครั้ง | กติกาที่คนเขียน | Node-RED |
| **AI-assisted** | ขั้นตอนตายตัว แต่มีบางขั้นให้ AI อ่าน/สรุป/จัดหมวด | คนออกแบบเส้นทาง AI ทำงานในช่อง | Node-RED + Claude, n8n |
| **Agentic** | บอกเป้าหมาย AI เลือกเองว่าจะเรียกเครื่องมือไหน กี่ครั้ง | AI (ภายในกรอบที่เราให้) | n8n AI Agent, Agent App |

> [!IMPORTANT]
> 🏛️ **หลักสถาปนิก:** เลือกระดับ **ต่ำที่สุด** ที่แก้ปัญหาได้ ระดับยิ่งสูง ยิ่งยืดหยุ่น แต่ยิ่งแพง ช้า และคาดเดายาก

## 🔴 2. Node-RED คืออะไร เหมาะกับอะไร

- เครื่องมือ low-code แบบลากเส้นต่อกล่อง (flow-based) จาก IBM ปัจจุบันอยู่ใน OpenJS Foundation
- จุดแข็ง: **IoT / OT / โรงงาน / เซนเซอร์** (MQTT, Modbus, OPC-UA, Serial), เบา รันบน Raspberry Pi ได้, ตอบสนอง event ทันที
- ข้อความที่ไหลในเส้นเรียกว่า **`msg`** ข้อมูลหลักอยู่ที่ **`msg.payload`**

### 🧩 โหนดหลักที่ใช้วันนี้

| โหนด | หน้าที่ |
|---|---|
| **inject** | ปล่อยข้อความเอง/ตามเวลา (ตัวตั้งเวลา) |
| **http request** | เรียก API ภายนอก |
| **function** | เขียน JavaScript แปลงข้อมูล (`return msg`) |
| **switch** | แยกทางตามเงื่อนไข |
| **http in / http response** | สร้าง API endpoint ของเราเอง |
| **debug** | ดูข้อมูลในแผงขวา (เครื่องมือ debug ที่สำคัญที่สุด) |
| **mqtt in / out** | รับ/ส่งข้อมูลกับอุปกรณ์ IoT |

### 🗃️ เก็บสถานะ

- `flow.set("key", value)` / `flow.get("key")` — ใช้ร่วมกันใน tab เดียว
- `global.set/get` — ใช้ร่วมกันทุก tab
- `env.get("ANTHROPIC_API_KEY")` — อ่านตัวแปรจาก `.env` (ไม่เขียน key ลงใน flow)

## ✨ 3. เรียก Claude จาก Node-RED

Node-RED ไม่มี SDK ให้ใช้ จึงเรียก Claude API ด้วย HTTP ตรง:

```text
POST https://api.anthropic.com/v1/messages
headers:  x-api-key, anthropic-version: 2026-10-21, content-type: application/json
body:     { model, max_tokens, system, messages: [{ role: "user", content: "..." }] }
```

คำตอบอยู่ใน `msg.payload.content` ซึ่งเป็น **อาร์เรย์ของ block** — ให้กรองเฉพาะ `type === "text"` เสมอ (block แรกอาจเป็น `thinking`)

ใช้ `output_config: { effort: "low" }` กับงานสั้น ๆ อย่างการสรุป 3 บรรทัด → เร็วขึ้นและประหยัดขึ้น

---

## 🧪 Lab 3 (35 นาที)

### 1️⃣ ขั้นที่ 1 — Import flow ตัวอย่าง (5 นาที)

1. เปิด http://localhost:1880
2. เมนู ☰ → **Import** → **select a file to import** → เลือก [labs/node-red/flows.json](../labs/node-red/flows.json) → Import
3. กด **Deploy** (มุมขวาบน)

### 2️⃣ ขั้นที่ 2 — Flow A: คุณภาพอากาศ + Claude (10 นาที) 🌫️

1. กดปุ่มสี่เหลี่ยมหน้าโหนด **"ทุก 30 นาที"**
2. ดูแผง **Debug** (ไอคอนแมลงด้านขวา) → ต้องเห็นสรุปภาษาไทยจาก Claude
3. ดับเบิลคลิกโหนด **"สร้างคำขอถึง Claude"** อ่านโค้ด → ลองแก้ `system` ให้ตอบเป็นภาษาอังกฤษ หรือเพิ่ม "แนะนำกิจกรรมกลางแจ้งที่เหมาะสม" → Deploy → ทดสอบใหม่
4. ส่วน **PM2.5 > 37.5** → ส่งต่อ n8n จะใช้ได้หลังทำ Lab 4 (ตอนนี้ error ได้ ไม่เป็นไร)

### 3️⃣ ขั้นที่ 3 — Flow B: API ของเราเอง (5 นาที) 🔌

```bash
# ค่าล่าสุดที่ Claude สรุป (Agent App ใน Lab 5 จะเรียก URL นี้)
curl http://localhost:1880/air/latest

# จำลองเซนเซอร์ส่งค่า
curl -X POST http://localhost:1880/sensor -H "content-type: application/json" -d '{"device":"lab-1","temp":38}'
```

Windows PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:1880/sensor -ContentType "application/json" -Body '{"device":"lab-1","temp":38}'
```

### 4️⃣ ขั้นที่ 4 — ให้ Claude Code สร้าง flow ให้ (15 นาที) 🪄

Node-RED flow คือไฟล์ JSON → **Claude Code เขียนให้ได้** ใช้การ์ด **L3-1** ใน [prompts/prompt-cards.md](../prompts/prompt-cards.md) ตัวอย่างโจทย์:

- รับข้อความร้องเรียนผ่าน `POST /complaint` → Claude จัดหมวด (ไฟฟ้า/แอร์/ความสะอาด/อื่น ๆ) และระดับความเร่งด่วน → ตอบกลับเป็น JSON
- ทุกเช้า 08:00 ดึงอัตราแลกเปลี่ยน/ราคาน้ำมัน → Claude สรุปเป็นข่าวสั้น
- (สาย IoT) จำลองเซนเซอร์ 3 ตัวส่งค่าทุก 10 วินาที → ถ้าค่าผิดปกติ 3 ครั้งติด → แจ้งเตือน

Import ไฟล์ที่ได้ → Deploy → ทดสอบ → **Export กลับมา commit เข้า Git**

**เช็กลิสต์ผ่าน Lab:**
- [ ] เห็นสรุปจาก Claude ใน Debug
- [ ] `curl /air/latest` ได้ข้อมูล
- [ ] มี flow ที่ Claude Code สร้าง 1 flow และใช้งานได้
- [ ] export flow เป็น JSON เก็บใน repo ของตัวเอง

### 🛡️ ข้อควรระวังสำหรับ production

- Node-RED editor **ไม่มีรหัสผ่านโดยค่าเริ่มต้น** → ตั้ง `adminAuth` ใน `settings.js` ก่อนเปิดให้คนอื่นเข้าถึง
- จำกัดอัตราการเรียก AI (โหนด **delay** โหมด rate limit) กันค่าใช้จ่ายพุ่งเมื่อเซนเซอร์ส่งค่าถี่ผิดปกติ
- ส่งข้อมูลเข้า AI เฉพาะที่จำเป็น (data minimization)

---

<div align="center">

[⬅️ 📗 02 ความยั่งยืน](02-sustainable-stack.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📕 04 n8n เลขาส่วนตัว ➡️](04-n8n-secretary.md)

</div>
