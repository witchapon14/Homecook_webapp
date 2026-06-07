# Deploy Frontend to Vercel and Backend to Render

เป้าหมายคือให้ iPad เปิดเว็บผ่าน URL จริง เช่น `https://your-app.vercel.app` โดยข้อมูลเก็บใน PostgreSQL บน Render

## Architecture

```text
iPad Safari
  -> Vercel Frontend
  -> Render Backend API
  -> Render PostgreSQL
```

## Files Prepared

- `vercel.json`: ตั้งค่า Vercel ให้ build React/Vite และ publish โฟลเดอร์ `dist`
- `render.yaml`: ตั้งค่า Render Blueprint สำหรับ FastAPI backend และ PostgreSQL database
- `.env.example`: ตัวอย่าง env สำหรับ frontend
- `backend/.env.example`: ตัวอย่าง env สำหรับ backend
- `docker-compose.yml`: PostgreSQL สำหรับ local development

## Deployment Order

ทำตามลำดับนี้จะง่ายที่สุด เพราะ frontend ต้องรู้ URL backend ก่อน และ backend ต้องรู้ URL frontend ทีหลังสำหรับ CORS

1. Push project ขึ้น GitHub
2. Deploy backend + PostgreSQL บน Render
3. Deploy frontend บน Vercel โดยใส่ `VITE_API_BASE` เป็น URL backend จาก Render
4. กลับไปแก้ `FRONTEND_ORIGINS` บน Render ให้เป็น URL frontend จาก Vercel
5. ทดสอบบน iPad ด้วย URL ของ Vercel

## 1. Push to GitHub

สร้าง repo บน GitHub แล้ว push project นี้ขึ้นไป

```bash
git init
git add .
git commit -m "Prepare inventory app for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Deploy Backend on Render

วิธีที่แนะนำคือใช้ `render.yaml` เป็น Blueprint

1. เข้า Render
2. เลือก New
3. เลือก Blueprint
4. เลือก GitHub repo นี้
5. Render จะอ่าน `render.yaml` และสร้าง 2 อย่าง:
   `restaurant-inventory-api`
   `restaurant-inventory-db`

ค่าใน `render.yaml` ที่เตรียมไว้:

```yaml
rootDir: backend
buildCommand: pip install -r requirements.txt
startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

หลัง backend deploy เสร็จ ให้เปิด:

```text
https://YOUR_RENDER_SERVICE.onrender.com/health
```

ถ้าเห็น:

```json
{"status":"ok","date":"YYYY-MM-DD"}
```

แปลว่า backend ใช้งานได้

## 3. Deploy Frontend on Vercel

1. เข้า Vercel
2. Import GitHub repo นี้
3. Framework Preset ควรเป็น `Vite`
4. Build Command ใช้ `npm run build`
5. Output Directory ใช้ `dist`
6. เพิ่ม Environment Variable:

```text
VITE_API_BASE=https://YOUR_RENDER_SERVICE.onrender.com
```

Deploy แล้ว Vercel จะได้ URL เช่น:

```text
https://restaurant-inventory.vercel.app
```

## 4. Update CORS on Render

กลับไปที่ Render service `restaurant-inventory-api`

เปิด Environment แล้วตั้ง:

```text
FRONTEND_ORIGINS=https://restaurant-inventory.vercel.app
```

จากนั้นกด Manual Deploy หรือ Restart service

ถ้าต้องการรองรับทั้ง production และ preview URL หลายตัว ให้คั่นด้วย comma:

```text
FRONTEND_ORIGINS=https://restaurant-inventory.vercel.app,https://restaurant-inventory-git-main-yourname.vercel.app
```

## 5. Test on iPad

เปิด Safari บน iPad:

```text
https://restaurant-inventory.vercel.app
```

ถ้าต้องการให้เหมือนแอป:

1. กด Share
2. เลือก Add to Home Screen
3. ตั้งชื่อ เช่น `Inventory ร้านอาหาร`

## PostgreSQL Notes

ตอนนี้ backend ต้องใช้ PostgreSQL เท่านั้น ถ้าไม่มี `DATABASE_URL` แอปจะไม่ start

Render Blueprint จะสร้าง `DATABASE_URL` ให้อัตโนมัติจาก database:

```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: restaurant-inventory-db
      property: connectionString
```

## Local Development with PostgreSQL

รัน PostgreSQL local:

```bash
docker compose up -d
```

ตั้ง env backend:

```bash
cd backend
export DATABASE_URL=postgresql://restaurant_inventory_user:restaurant_inventory_password@localhost:5432/restaurant_inventory
export FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

รัน frontend:

```bash
export VITE_API_BASE=http://127.0.0.1:8000
npm run dev
```

## Backup

บน PostgreSQL จริง แนะนำใช้ Render PostgreSQL backup/snapshot เป็นหลัก

ในแอปยังมีปุ่ม Backup ซึ่งจะ export ข้อมูลเป็น Excel snapshot จากตาราง:

- `ingredients`
- `purchases`
- `purchase_items`

ไฟล์ runtime บน Render อาจไม่ถาวร จึงควรใช้ Render database backup สำหรับข้อมูล production
