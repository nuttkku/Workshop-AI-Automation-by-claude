<div align="center">

⬅️ &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📘 01 การพัฒนาในยุค AI ➡️](01-ai-native-dev.md)

</div>

# 🛠️ 00 · เตรียมเครื่องก่อนอบรม

> [!WARNING]
> ⏳ ทำให้เสร็จ **ก่อนวันอบรม** — การดาวน์โหลด Docker image ผ่าน Wi‑Fi โรงแรมพร้อมกัน 30 เครื่องคือสาเหตุอันดับ 1 ที่ lab ล่ม

## 💻 1. ติดตั้งโปรแกรม

| โปรแกรม | ใช้ทำอะไร | ตรวจว่าใช้ได้ |
|---|---|---|
| [VS Code](https://code.visualstudio.com/) | editor หลัก | เปิดโปรแกรมได้ |
| Claude Code (VS Code extension) | ผู้ช่วยพัฒนา AI ใน editor | ค้นหา "Claude Code" ใน Extensions → Install → Sign in |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | รันบริการทุกตัวแบบ container | `docker --version` และ `docker compose version` |
| [GitHub Desktop](https://desktop.github.com/) | จัดการ Git แบบกดปุ่ม | Sign in ด้วยบัญชี GitHub |
| [Node.js LTS](https://nodejs.org/) | รัน Agent App นอก Docker (ทางเลือก) | `node -v` |
| Git | GitHub Desktop ติดตั้งมาให้แล้ว | `git --version` |

**Windows:** Docker Desktop ต้องเปิด WSL 2 (ตัวติดตั้งจะถาม) · ถ้าเครื่องบริษัทล็อก virtualization ให้แจ้ง IT ล่วงหน้า

## 🔑 2. บัญชีและ key

- **บัญชี Claude** (Pro / Max / Team / Enterprise) สำหรับ sign in ใน Claude Code
- **Anthropic API key** สำหรับ Node-RED, n8n และ Agent App → สร้างที่ https://platform.claude.com → API Keys
  - ตั้ง **spend limit** ของ workspace ไว้ก่อน (เช่น 10 USD) — เป็นนิสัยที่ดีของงานองค์กร
- **บัญชี GitHub**
- (ทางเลือก) **Telegram** สำหรับ Lab 4 ส่วนต่อยอด

> [!CAUTION]
> 🔐 API key = รหัสผ่านบัตรเครดิต ห้าม commit ห้ามวางในแชทกลุ่ม ห้ามใส่ในภาพหน้าจอ

## 📥 3. ดึง image ล่วงหน้า (สำคัญมาก)

```bash
git clone <url-ของ-repo-นี้>
cd Workshop-AI-Automation-by-claude
cp .env.example .env
docker compose pull
docker compose build
```

## 🧪 4. ทดสอบ stack

```bash
docker compose up -d
docker compose ps        # ทุกบริการต้องเป็น running / healthy
```

เปิด http://localhost:1880 (Node-RED), http://localhost:5678 (n8n), http://localhost:3000 (Agent App) ได้ครบ = พร้อม

ปิดเมื่อทดสอบเสร็จ: `docker compose down` (ข้อมูลยังอยู่ใน volume)

## 🆘 5. ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `port is already allocated` | มีโปรแกรมอื่นใช้พอร์ตนั้น → แก้ตัวเลขซ้ายใน `ports:` ของ `docker-compose.yml` เช่น `"15678:5678"` |
| Docker Desktop ค้าง "Starting…" | Windows: `wsl --update` แล้ว restart เครื่อง |
| n8n เปิดแล้วขึ้นหน้า setup owner | ปกติ — สร้างบัญชี owner ในเครื่องตัวเอง (ไม่ได้ส่งไปไหน) |
| Agent App ตอบ `401` | `ANTHROPIC_API_KEY` ใน `.env` ผิดหรือยังไม่ได้ใส่ → แก้แล้ว `docker compose up -d --force-recreate agent-app` |
| Claude Code ไม่เห็นไฟล์ | เปิด VS Code ด้วย **File → Open Folder** ที่ราก repo ไม่ใช่เปิดไฟล์เดี่ยว |

---

<div align="center">

⬅️ &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📘 01 การพัฒนาในยุค AI ➡️](01-ai-native-dev.md)

</div>
