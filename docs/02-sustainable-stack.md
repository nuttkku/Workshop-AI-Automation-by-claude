<div align="center">

[⬅️ 📘 01 การพัฒนาในยุค AI](01-ai-native-dev.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📙 03 Node-RED ➡️](03-node-red.md)

</div>

# 📗 02 · ความยั่งยืนของสิ่งที่พัฒนา: GitHub Desktop + Docker Desktop

**เวลา:** 10.50–12.00 (สอน 35 นาที + Lab 2 35 นาที)
**ผลลัพธ์:** แอปจาก Lab 1 อยู่บน GitHub และรันด้วย `docker compose up` ได้บนเครื่องใครก็ได้

---

## ♻️ 1. ทำไม "ยั่งยืน" ถึงสำคัญกว่า "เสร็จเร็ว"

AI ทำให้ **สร้าง** ง่ายขึ้น 10 เท่า แต่ไม่ได้ทำให้ **ดูแล** ง่ายขึ้นเอง ระบบในองค์กรตายด้วยสาเหตุเดิม ๆ:

| อาการ | ชื่อเรียก | ยาแก้วันนี้ |
|---|---|---|
| "รันได้แค่เครื่องพี่คนนั้น" | Works on my machine | **Docker** |
| "พี่คนนั้นลาออก ไม่มีใครรู้วิธีรัน" | Bus factor = 1 | **README + CLAUDE.md + compose** |
| "แก้แล้วพัง ย้อนไม่ได้" | No version control | **Git (GitHub Desktop)** |
| "ไฟล์ final_v3_จริง.zip" | Shadow versioning | **Git branch + commit** |
| "key หลุดใน repo" | Secret leakage | **.env + .gitignore** |
| "อัปเดตแล้วพังเพราะ version เปลี่ยน" | Dependency drift | **pin version ใน Dockerfile / compose / lockfile** |

> [!IMPORTANT]
> 🌱 **นิยามความยั่งยืนของวันนี้:** คนใหม่ที่ไม่เคยเห็นโปรเจกต์ **clone → อ่าน README → รันได้ ภายใน 15 นาที** และเปิด Claude Code แล้วทำงานต่อได้ทันทีเพราะมี CLAUDE.md

### 🎁 "ชุดส่งมอบขั้นต่ำ" ของทุกโปรเจกต์ (Minimum Handover Kit)

```text
README.md            ← ทำอะไร / รันยังไง / ใครดูแล
CLAUDE.md            ← ข้อตกลงและคำสั่ง สำหรับ AI และคนใหม่
.env.example         ← ตัวแปรที่ต้องใช้ (ไม่มีค่าจริง)
.gitignore           ← กัน .env, node_modules, ข้อมูลจริง
Dockerfile           ← วิธีสร้าง image ของแอป
docker-compose.yml   ← วิธีรันทั้งระบบ (แอป + DB + บริการอื่น)
```

---

## 🐙 2. Git ผ่าน GitHub Desktop (15 นาที)

### 💡 แนวคิด 5 คำ

| คำ | ความหมายแบบบ้าน ๆ |
|---|---|
| **Repository** | โฟลเดอร์โปรเจกต์ที่ "จำประวัติได้" |
| **Commit** | จุดบันทึกเกม (save point) พร้อมข้อความว่าเปลี่ยนอะไร |
| **Branch** | ทางแยกเพื่อทดลองโดยไม่กระทบของหลัก |
| **Push / Pull** | ส่งขึ้น / ดึงลงจาก GitHub |
| **Pull Request (PR)** | ขอรวม branch เข้าของหลัก พร้อมให้คนอื่นรีวิว |

### 👣 ขั้นตอนใน GitHub Desktop

1. **File → Add local repository** → เลือกโฟลเดอร์ `my-tasklog` → ถ้ายังไม่ใช่ repo กด **create a repository**
2. ตรวจแท็บ **Changes** — ต้อง **ไม่เห็น** `.env` และ `node_modules` (ถ้าเห็น → ให้ Claude สร้าง `.gitignore`)
3. ใส่ Summary → **Commit to main**
4. **Publish repository** → เลือก Private (ข้อมูลองค์กร) → Publish
5. ทดลอง branch: **Current branch → New branch** `feature/export-csv` → ให้ Claude ทำฟีเจอร์ → commit → **Push** → **Create Pull Request**

### 🤝 Claude Code + Git ช่วยกันอย่างไร

| ให้ Claude ทำ | ให้คนทำ |
|---|---|
| เขียน commit message จาก diff | ตัดสินใจว่าจะ commit อะไร |
| เขียน PR description | กด merge |
| อธิบาย diff ของคนอื่น / รีวิว PR | ตัดสินว่ารับหรือไม่รับ |
| แก้ merge conflict ตามที่อธิบาย | ตรวจผลหลังแก้ conflict |

prompt: *"ดูการเปลี่ยนแปลงที่ยังไม่ commit แล้วแบ่งเป็น commit ย่อยตามเรื่อง เสนอข้อความ commit แต่ยังไม่ต้อง commit"*

**นิสัย commit ที่ดีเมื่อทำงานกับ AI:** commit **ก่อน** ให้ AI แก้ก้อนใหญ่ทุกครั้ง → ถ้าผลไม่ถูกใจ กด **Discard changes** ได้ทันที

---

## 🐳 3. Docker Desktop (20 นาที)

### 💡 แนวคิด 6 คำ

| คำ | ความหมาย |
|---|---|
| **Image** | "แม่พิมพ์" ที่มีระบบปฏิบัติการย่อ + runtime + แอป |
| **Container** | "ชิ้นงาน" ที่ถูกรันจากแม่พิมพ์ (สร้าง/ลบได้ไม่เสียดาย) |
| **Dockerfile** | สูตรสร้าง image |
| **Volume** | ที่เก็บข้อมูลถาวร ไม่หายเมื่อลบ container |
| **Port mapping** | `"3000:3000"` = พอร์ตเครื่องเรา : พอร์ตใน container |
| **Compose** | ไฟล์เดียวบรรยายทั้งระบบหลายบริการ |

### 🔍 อ่าน docker-compose.yml ของ repo นี้

เปิด [docker-compose.yml](../docker-compose.yml) แล้วชี้ให้เห็น:

- `image: nodered/node-red:5.0` — **pin major version** กันอัปเดตแล้วพัง
- `volumes: node_red_data:/data` — flow ไม่หายแม้ลบ container
- `env_file: .env` — ความลับอยู่นอก repo
- `restart: unless-stopped` — เครื่อง reboot แล้วกลับมาเอง
- บริการคุยกันด้วย **ชื่อบริการ** เช่น agent-app เรียก `http://n8n:5678` (ไม่ใช่ localhost)

### ⌨️ คำสั่งที่ใช้บ่อย

```bash
docker compose up -d            # เปิดทั้งระบบ (เบื้องหลัง)
docker compose ps               # ดูสถานะ
docker compose logs -f n8n      # ดู log ของบริการ n8n แบบต่อเนื่อง
docker compose restart node-red
docker compose down             # ปิด (ข้อมูลใน volume ยังอยู่)
docker compose down -v          # ปิด + ลบข้อมูลทั้งหมด ⚠️
docker compose up -d --build    # สร้าง image ใหม่หลังแก้โค้ด
```

ใน **Docker Desktop** ดูได้ทั้งหมดแบบกดปุ่ม: Containers → คลิกชื่อ → Logs / Exec / Stats

### 💾 Backup = ส่วนหนึ่งของความยั่งยืน

```bash
# สำรอง volume ของ n8n เป็นไฟล์ .tar.gz
docker run --rm -v ai-workshop_n8n_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/n8n-backup.tar.gz -C /data .
```

และที่ดีกว่า: **export workflow/flow เป็น JSON แล้ว commit เข้า Git** (Node-RED: Export → Download, n8n: Download) — ทำให้ระบบอัตโนมัติก็มีประวัติและรีวิวได้เหมือนโค้ด

---

## 🧪 Lab 2 · ทำให้แอปจาก Lab 1 "ยั่งยืน" (35 นาที)

ใช้การ์ด **L2-1 ถึง L2-3** ใน [prompts/prompt-cards.md](../prompts/prompt-cards.md)

1. **Commit แรก** ผ่าน GitHub Desktop (ก่อนให้ AI แก้อะไรเพิ่ม)
2. ให้ Claude สร้าง `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example`, `.gitignore`
3. `docker compose up -d --build` → เปิดเบราว์เซอร์ทดสอบ
4. **ทดสอบความถาวรของข้อมูล:** เพิ่มงาน 2 รายการ → `docker compose down` → `up -d` อีกครั้ง → ข้อมูลต้องยังอยู่ (ถ้าหาย → ให้ Claude แก้ volume)
5. ให้ Claude ปรับ `README.md` ให้มีหัวข้อ: ทำอะไร / วิธีรัน / ตัวแปร / ผู้ดูแล
6. Commit → Publish ขึ้น GitHub (Private)
7. **การทดสอบจริง:** จับคู่กับเพื่อน แลก URL repo (เชิญเป็น collaborator) → เพื่อน clone แล้วรันตาม README **โดยไม่ถามเรา** ได้ไหม?

**เช็กลิสต์ผ่าน Lab:**
- [ ] repo มีครบ Minimum Handover Kit
- [ ] `.env` ไม่อยู่ใน GitHub
- [ ] ข้อมูลไม่หายหลัง `down`/`up`
- [ ] เพื่อนรันได้จาก README อย่างเดียว

---

<div align="center">

[⬅️ 📘 01 การพัฒนาในยุค AI](01-ai-native-dev.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; [📙 03 Node-RED ➡️](03-node-red.md)

</div>
