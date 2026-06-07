# Restaurant Inventory Workflow

Web application สำหรับบริหาร Inventory ร้านอาหารตาม workflow บันทึกวัตถุดิบที่ซื้อเข้าร้านรายวัน เหมาะกับเจ้าของร้านที่อยากกรอกจากกระดาษย้อนหลังแบบง่าย ๆ

## Features

- Master Data วัตถุดิบ: เพิ่ม แก้ไข ลบ กำหนดหน่วยนับ
- บันทึกรายการซื้อหลายรายการต่อวัน
- คำนวณยอดต่อรายการและยอดรวมแบบ real-time
- เปิดประวัติย้อนหลัง ค้นหาตามวันที่ ช่วงเวลา และชื่อวัตถุดิบ
- Dashboard รายวันและรายเดือน
- รายงานรายวัน รายสัปดาห์ รายเดือน รายปี พร้อมกราฟ
- Export Excel
- Backup ฐานข้อมูล
- Responsive design เน้นใช้งานบนมือถือ

## Tech Stack

- Frontend: React + Tailwind CSS + Recharts
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL

แอปนี้ตั้งใจใช้ PostgreSQL ทั้ง local และ production โดยต้องตั้งค่า `DATABASE_URL`

## Run Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
export DATABASE_URL=postgresql://restaurant_inventory_user:restaurant_inventory_password@localhost:5432/restaurant_inventory
export FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

## Run Frontend

เปิด terminal อีกหน้าที่ root project:

```bash
npm install
export VITE_API_BASE=http://127.0.0.1:8000
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Database Tables

```text
ingredients
- id
- name
- unit
- created_at

purchases
- id
- purchase_date
- total_amount
- created_at
- updated_at

purchase_items
- id
- purchase_id
- ingredient_id
- quantity
- unit
- unit_price
- amount
```

## Local PostgreSQL

ถ้ามี Docker สามารถเปิด PostgreSQL local ได้ด้วย:

```bash
docker compose up -d
```

## Backup

กดปุ่ม Backup ในหน้าแอป หรือเรียก:

```bash
curl -X POST http://localhost:8000/backup
```

ระบบจะ export backup เป็น Excel snapshot และเก็บใน:

```text
backend/backups/
```

## Deploy

ดูขั้นตอน deploy ไป Vercel + Render เพื่อใช้งานบน iPad ได้ที่ [DEPLOY.md](./DEPLOY.md)
