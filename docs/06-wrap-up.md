<div align="center">

[⬅️ 📓 05 แอป AI Agent](05-agent-app.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; 🎉 จบหลักสูตร

</div>

# 📒 06 · สรุป: เลือกเครื่องมืออย่างสถาปนิก 🏛️

**เวลา:** 16.15–16.30

---

## 🗺️ 1. ภาพสถาปัตยกรรมที่สร้างวันนี้

```text
 ┌──────────── Docker Compose (รันได้ทุกที่) ────────────┐   ┌──────── GitHub ────────┐
 │                                                       │   │ README / CLAUDE.md     │
 │  Open-Meteo ─▶ Node-RED ──(PM2.5 สูง)──▶ n8n notify ─┼──▶│ docker-compose.yml     │
 │                 │  ▲ /air/latest          ▲   │       │   │ flows.json / workflows │
 │                 │  │                      │   ▼       │   └────────────────────────┘
 │                 │  └──── Agent App ───────┘ Telegram   │
 │                 ▼        (Claude + tools)              │
 │              Claude API ◀───── n8n secretary / brief   │
 └───────────────────────────────────────────────────────┘
          ▲ ทั้งหมดสร้าง แก้ และอธิบายด้วย Claude Code บน VS Code
```

## 🧭 2. ตารางตัดสินใจ: งานแบบนี้ใช้อะไร

| ลักษณะงาน | แนะนำ | เหตุผล |
|---|---|---|
| ค่าจากเซนเซอร์/เครื่องจักร, ต้องตอบสนองทันที | **Node-RED** | เบา ใกล้อุปกรณ์ โปรโตคอล IoT ครบ |
| เชื่อมอีเมล ปฏิทิน ชีต แชท ของทีม | **n8n workflow** | connector สำเร็จรูป จัดการ credential ให้ |
| ผู้ช่วยแชทใช้ภายในทีม | **n8n AI Agent** | สร้างเร็ว ดูประวัติใน Executions |
| บริการให้ผู้ใช้จำนวนมาก / ภายนอก / ต้อง audit | **Agent App (โค้ด)** | ควบคุมสิทธิ์ test และ deploy ได้เต็มที่ |
| งานที่ขั้นตอนชัดเจน ไม่ต้องตัดสินใจ | **ไม่ต้องใช้ AI** | ถูกกว่า เร็วกว่า คาดเดาได้ |

## ✅ 3. Governance checklist ก่อนขึ้นระบบจริง

**ข้อมูลและความเป็นส่วนตัว**
- [ ] ระบุชนิดข้อมูลที่ส่งเข้า AI และผ่านการพิจารณาตาม PDPA / นโยบายองค์กร
- [ ] ส่งเฉพาะข้อมูลที่จำเป็น ปิดบังข้อมูลส่วนบุคคลเมื่อทำได้

**ความปลอดภัย**
- [ ] ความลับอยู่ใน `.env` / secret manager เท่านั้น — ไม่อยู่ใน Git, flow, workflow ที่ export
- [ ] Node-RED / n8n มีรหัสผ่าน ไม่เปิดพอร์ตสู่อินเทอร์เน็ตตรง ๆ
- [ ] Agent มีเฉพาะเครื่องมือที่จำเป็น (least privilege) และขออนุมัติก่อนทำสิ่งที่ย้อนไม่ได้
- [ ] ทดสอบ prompt injection ผ่านข้อมูล (อีเมล เอกสาร ชื่องาน)

**ค่าใช้จ่าย**
- [ ] ตั้ง spend limit ที่ Claude Console
- [ ] จำกัดจำนวนรอบของ agent และอัตราการเรียกจากระบบอัตโนมัติ
- [ ] เลือกระดับ effort/โมเดลตามงาน วัดผลจากงานจริงก่อนลดหรือเพิ่ม

**ความยั่งยืน**
- [ ] Minimum Handover Kit ครบ (README, CLAUDE.md, .env.example, Dockerfile, compose)
- [ ] flow/workflow export เป็น JSON และอยู่ใน Git
- [ ] มีผู้ดูแลหลักและผู้ดูแลสำรอง (bus factor ≥ 2)
- [ ] มีแผน backup volume และทดสอบ restore แล้ว
- [ ] pin เวอร์ชัน image / dependency

## 🚀 4. ก้าวต่อไป (30 วันหลังอบรม)

| สัปดาห์ | ทำอะไร |
|---|---|
| 1 | เลือก **งานซ้ำ ๆ 1 งาน** ของหน่วยงาน ทำเป็น Node-RED หรือ n8n workflow |
| 2 | ใส่ Minimum Handover Kit + ให้เพื่อนร่วมงานลองรันจาก README |
| 3 | เพิ่ม AI ในขั้นตอนที่ต้อง "อ่าน/สรุป/จัดหมวด" วัดเวลาที่ประหยัดได้ |
| 4 | นำเสนอผลต่อหัวหน้า: เวลาที่ลดลง, ค่าใช้จ่าย AI ต่อเดือน, ความเสี่ยงและการควบคุม |

## 📚 5. แหล่งเรียนรู้

- Claude Code docs: https://code.claude.com/docs
- Claude API docs: https://platform.claude.com/docs
- Node-RED: https://nodered.org/docs
- n8n: https://docs.n8n.io (หัวข้อ Advanced AI)
- Docker: https://docs.docker.com/compose
- GitHub Desktop: https://docs.github.com/desktop

---

<div align="center">

[⬅️ 📓 05 แอป AI Agent](05-agent-app.md) &nbsp;·&nbsp; [🏠 หน้าหลัก](../README.md) &nbsp;·&nbsp; 🎉 จบหลักสูตร

</div>
