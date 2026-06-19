# SIG Desa Cibulakan Cianjur

**Sistem Informasi Geografis** berbasis web untuk pemetaan lokasi-lokasi di Desa Cibulakan, Kecamatan Cianjur, Kabupaten Cianjur, Jawa Barat.

Aplikasi ini memungkinkan masyarakat umum menjelajahi peta interaktif, melihat detail lokasi, serta memberikan ulasan dan rating. Admin dan Operator Desa dapat mengelola data lokasi, kategori, komentar, dan pengguna melalui dashboard khusus.

---

## Fitur Utama

### Publik (Tanpa Login)
- **Peta Interaktif** — Jelajahi lokasi di peta Leaflet dengan marker cluster dan heatmap
- **Pencarian & Filter** — Cari lokasi berdasarkan nama, alamat, wilayah, atau kategori
- **Detail Lokasi** — Info lengkap: foto, kategori, alamat, rating, komentar, rute
- **WhatsApp** — Tombol chat langsung ke pemilik lokasi
- **Google Maps** — Tombol buka di Google Maps & lihat rute
- **SEO Friendly** — Meta tags, Open Graph, JSON-LD, sitemap.xml

### Staff (Admin & Operator Desa)
- **Dashboard** — Statistik total lokasi, kategori, kecamatan, desa, komentar, pengguna; diagram pie kategori; grouped bar chart kategori per kecamatan; progress bar ringkasan kategori
- **Peta Interaktif** — Tambah, edit, hapus lokasi langsung dari peta
- **Manajemen Lokasi** — CRUD lokasi dengan foto, deskripsi (rich text), alamat, koordinat
- **Manajemen Kategori** — Kelola kategori dengan ikon & warna kustom (Admin saja)
- **Notifikasi** — Lihat aktivitas komentar terbaru, dikelompokkan per lokasi
- **Manajemen Pengguna** — Kelola akun staff (Admin saja)

### Fitur Teknis
- **Role-based Access** — Tiga level: `admin`, `operator_desa`, `user`
- **Unified Login** — Satu form login untuk semua role; nama untuk publik, email untuk staff
- **Auto Migrasi Akun** — Pengguna lama tanpa password otomatis diperbarui saat login pertama
- **Rich Text Editor** — Tiptap editor untuk deskripsi lokasi (bold, italic, list, heading, link, dll.)
- **GPS & Reverse Geocode** — Deteksi lokasi otomatis dari koordinat
- **Radius Search** — Cari lokasi dalam radius tertentu (Haversine formula)
- **Routing** — Petunjuk arah antar lokasi via OSRM
- **Sitemap XML** — Otomatis generate sitemap untuk SEO
- **Animasi Halus** — Fade-up stagger, panel slide, card transitions
- **Responsive** — Tampilan mobile-friendly dengan layout adaptif

---

## Tech Stack

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| PHP | ^8.2 | Runtime |
| Laravel | ^12.0 | Framework |
| Laravel Sanctum | ^4.0 | API Auth |
| Laravel Socialite | ^5.28 | Google OAuth |
| Intervention Image | ^3.0 | Manipulasi foto |
| MySQL | — | Database |

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | ^19.2 | UI Framework |
| Vite | ^8.0 | Build tool |
| Tailwind CSS | ^3.4 | Styling |
| React Router | ^7.17 | Routing |
| Leaflet | ^1.9 | Peta interaktif |
| Recharts | ^3.8 | Grafik dashboard |
| Axios | ^1.17 | HTTP client |
| Tiptap | ^3.27 | Rich text editor |
| Lucide React | ^1.18 | Ikon |
| SweetAlert2 | ^11.26 | Dialog |
| react-helmet-async | ^3.0 | SEO meta |

### Integrasi Eksternal
| API | Fungsi |
|-----|--------|
| [API Wilayah Indonesia](https://github.com/emsifa/api-wilayah-indonesia) | Data provinsi, kabupaten, kecamatan, desa |
| [Nominatim](https://nominatim.org/) | Reverse geocoding (alamat dari koordinat) |
| [OSRM](https://project-osrm.org/) | Routing / petunjuk arah |
| Google OAuth | Login dengan Google (deprecated, masih ada di kode) |

---

## Persyaratan Sistem

- PHP >= 8.2
- Composer >= 2.x
- Node.js >= 20
- npm >= 10
- MySQL >= 8.0
- Extension PHP: `BCMath`, `Ctype`, `Fileinfo`, `JSON`, `Mbstring`, `OpenSSL`, `PDO`, `Tokenizer`, `XML`, `GD` (untuk Intervention Image)

---

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url> zonasi-gis-app
cd zonasi-gis-app
```

### 2. Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Copy environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=zonasi_db
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrasi (dengan seeder)
php artisan migrate --seed

# Buat storage symlink
php artisan storage:link
```

### 3. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment (jika belum ada)
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

### 4. Jalankan Aplikasi

Buka **dua terminal** secara terpisah:

```bash
# Terminal 1 — Backend
cd backend
php artisan serve
# → http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5175
```

Akses aplikasi di **http://localhost:5175**

---

## Konfigurasi

### File `.env` Backend

```env
APP_NAME="Sistem Zonasi Geografis"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zonasi_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5175,localhost:3000,127.0.0.1:5175
CORS_ALLOWED_ORIGINS=http://localhost:5175,http://localhost:3000
FRONTEND_URL=http://localhost:5175

FILESYSTEM_DISK=public
```

### File `.env` Frontend

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=https://zonasi-gis.example.com
```

---

## Struktur Database

| Tabel | Keterangan |
|-------|------------|
| `users` | Pengguna (admin, operator_desa, user) dengan role & wilayah akses |
| `provinsis` | Data provinsi (sinkron dari API Wilayah) |
| `kabupatens` | Data kabupaten |
| `kecamatans` | Data kecamatan |
| `desas` | Data desa |
| `kategoris` | Kategori lokasi (ikon, warna) |
| `lokasis` | Data lokasi utama dengan koordinat & alamat |
| `foto_lokasis` | Foto-foto dari setiap lokasi |
| `komentars` | Rating & ulasan pengguna per lokasi |
| `personal_access_tokens` | Token API Sanctum |

---

## Role & Hak Akses

| Role | Dashboard | Peta | Lokasi | Kategori | Users | Notifikasi | Peta Publik |
|------|-----------|------|--------|----------|-------|------------|-------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Operator Desa** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (terbatas) | ✅ |
| **User** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

- **Admin**: Akses penuh ke seluruh fitur
- **Operator Desa**: Hanya melihat data di desa/kecamatannya sendiri
- **User**: Hanya bisa melihat peta publik, detail lokasi, dan memberikan komentar

---

## API Endpoints

### Publik (No Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/login` | Login (public dengan nama, staff dengan email) |
| POST | `/api/register-public` | Registrasi pengguna publik |
| GET | `/api/map/lokasi` | Data lokasi untuk peta publik |
| GET | `/api/lokasi/{id}` | Detail lokasi |
| GET | `/api/lokasi/{id}/komentar` | Komentar per lokasi |
| GET | `/api/wilayah/provinsi` | Daftar provinsi |
| GET | `/api/wilayah/kabupaten` | Daftar kabupaten |
| GET | `/api/wilayah/kecamatan` | Daftar kecamatan |
| GET | `/api/wilayah/desa` | Daftar desa |
| GET | `/api/wilayah/geocode` | Forward geocode (cari koordinat) |
| GET | `/api/routing` | Rute antar titik (OSRM) |

### Authenticated (Sanctum Token)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Profil user saat ini |
| GET | `/api/dashboard` | Data dashboard (stats + chart) |
| GET | `/api/notifikasi` | Komentar terbaru per lokasi |
| GET | `/api/kecamatan` | Daftar kecamatan |
| GET | `/api/desa` | Daftar desa |
| POST | `/api/wilayah/lokasi-saya` | Reverse geocode lokasi |
| GET/POST | `/api/lokasi` | CRUD lokasi |
| POST | `/api/lokasi/{id}/komentar` | Tambah komentar |
| DELETE | `/api/komentar/{id}` | Hapus komentar (pemilik saja) |
| POST | `/api/lokasi/radius-search` | Cari lokasi dalam radius |

### Admin Only

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST/PUT/DELETE | `/api/users` | CRUD pengguna |
| GET/POST/PUT/DELETE | `/api/kategori` | CRUD kategori |

---

## Struktur Proyek

```
zonasi-gis-app/
├── backend/                     # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/     # API Controllers
│   │   │   └── Middleware/           # AdminMiddleware
│   │   ├── Models/                   # Eloquent Models
│   │   └── Providers/                # Service Providers
│   ├── config/                      # Konfigurasi
│   ├── database/
│   │   ├── migrations/              # Schema database
│   │   └── seeders/                 # Data awal
│   ├── routes/
│   │   ├── api.php                  # API Routes
│   │   └── web.php                  # Web Routes (sitemap)
│   └── storage/app/public/lokasi   # Upload foto
│
├── frontend/                    # React 19 + Vite
│   └── src/
│       ├── api/                     # Axios client & API functions
│       ├── components/
│       │   ├── common/              # Shared components
│       │   ├── layout/              # AppLayout, Sidebar, Header
│       │   └── map/                 # MapPicker
│       ├── contexts/                # AuthContext
│       ├── pages/
│       │   ├── auth/                # Login, OAuth callback
│       │   ├── dashboard/           # DashboardPage
│       │   ├── kategori/            # KategoriPage (CRUD)
│       │   ├── lokasi/              # LokasiPage, LokasiDetailPage
│       │   ├── map/                 # PetaPage, PublicPetaPage
│       │   ├── notifikasi/          # NotifikasiPage
│       │   └── users/              # UsersPage (CRUD)
│       ├── utils/                  # iconPaths, helpers
│       ├── App.jsx                 # Router utama
│       ├── index.css               # Tailwind + custom styles
│       └── main.jsx                # Entry point
│
└── dokumentasi.md
```

---

## Alur Login

### Unified Login
- **Input berisi `@`** → Login sebagai Admin/Operator Desa (email + password)
- **Input tanpa `@`** → Login sebagai User publik (nama + password)
- Jika user publik sudah terdaftar tanpa password (dari sistem lama), password otomatis diperbarui saat login pertama

### Redirect Berdasarkan Role
| Role | Redirect |
|------|----------|
| `admin` | `/dashboard` |
| `operator_desa` | `/dashboard` |
| `user` | `/` (Peta Publik) |

---

## Halaman Detail Lokasi

- **Mobile**: Map di atas (40vh), konten di bawah
- **Desktop (lg+)**: Map kiri (full height), konten kanan (scroll)
- Menampilkan: foto (lightbox), kategori, rating, alamat, deskripsi (HTML), kecamatan/desa (sembunyi jika kosong), komentar, form rating
- Tombol: Google Maps, Lihat Rute, WhatsApp, Telepon

---

## SEO Implementation

- `react-helmet-async` untuk dynamic title & meta tags
- Open Graph & Twitter Card untuk social sharing
- JSON-LD structured data (`WebApplication` di homepage, `Place` di detail lokasi)
- `sitemap.xml` otomatis dari backend (endpoint `/sitemap.xml`)
- `robots.txt` di folder `public/`

---

## Pengembangan

```bash
# Backend — jalankan server
cd backend && php artisan serve

# Backend — migrasi database
php artisan migrate

# Frontend — development mode
cd frontend && npm run dev

# Frontend — build production
npm run build

# Frontend — preview build
npm run preview
```
