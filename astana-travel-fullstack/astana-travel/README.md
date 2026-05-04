# ASTANA HAJJ & UMROH TRAVEL - Website Fullstack

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken)
- **PDF**: jsPDF
- **Upload**: Multer

## Cara Install & Run

### 1. Clone / Setup Project
```bash
cd astana-travel/frontend
npm install
```

### 2. Setup Database PostgreSQL
```bash
# Buat database
createdb astana_travel

# Copy env
cp .env.example .env
# Edit DATABASE_URL di .env
```

### 3. Jalankan Prisma Migration
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka http://localhost:3000

### 5. Login Admin
- Email: admin@astana.com
- Password: admin123

## Struktur Folder
```
astana-travel/
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   │   ├── page.tsx   # Homepage
│   │   │   ├── paket/     # Halaman Paket
│   │   │   ├── daftar/    # Form Pendaftaran
│   │   │   ├── invoice/   # Invoice
│   │   │   ├── tracking/  # Tracking Jamaah
│   │   │   ├── kontak/    # Kontak
│   │   │   ├── admin/     # Dashboard Admin
│   │   │   └── api/       # API Routes
│   │   ├── components/    # Reusable Components
│   │   └── lib/           # Utilities
│   ├── prisma/            # Database Schema
│   └── public/            # Static Assets
```

## API Endpoints

### Public
- `GET /api/packages` - List paket
- `POST /api/registrations` - Daftar baru
- `GET /api/invoice/:id` - Get invoice
- `GET /api/tracking` - Track by invoice+WA
- `POST /api/payments` - Upload bukti bayar

### Admin (JWT Required)
- `POST /api/admin/login` - Login
- `GET /api/admin/registrations` - Semua pendaftar
- `PUT /api/admin/payments/:id/verify` - Verifikasi bayar
- `GET /api/admin/stats` - Statistik
- `POST /api/admin/settings` - Update pengaturan
