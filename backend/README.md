# Backend Laravel - Sistem Zonasi Geografis

## Instalasi

```bash
cd backend

# Install dependencies
composer install

# Copy env
cp .env.example .env

# Generate key
php artisan key:generate

# Edit .env - sesuaikan database
DB_DATABASE=zonasi_db
DB_USERNAME=root
DB_PASSWORD=

# Buat database
mysql -u root -e "CREATE DATABASE zonasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Jalankan migrasi + seeder
php artisan migrate --seed

# Buat symlink storage
php artisan storage:link

# Jalankan server
php artisan serve --port=8000
```

## Akun Default
- **Admin**: admin@zonasi.id / password
- **Operator**: operator@zonasi.id / password

## Endpoint Utama
- POST   /api/login
- POST   /api/logout
- GET    /api/me
- GET    /api/dashboard
- GET    /api/kecamatan
- GET    /api/desa
- GET    /api/kategori
- GET    /api/lokasi
- GET    /api/map/lokasi
- POST   /api/lokasi/radius-search
- GET    /api/users  (admin only)
