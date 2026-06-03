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
- Database: SQLite สำหรับรันทดลองทันที

> Production สามารถเปลี่ยนเป็น PostgreSQL/MySQL ได้โดยตั้งค่า `DATABASE_URL` ให้ SQLAlchemy รองรับ เช่น `postgresql://user:pass@host/dbname`

## Run Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
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

## Backup

กดปุ่ม Backup ในหน้าแอป หรือเรียก:

```bash
curl -X POST http://localhost:8000/backup
```

ไฟล์จะถูกเก็บใน:

```text
backend/backups/
```
