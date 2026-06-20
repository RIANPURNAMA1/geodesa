# Dokumentasi Deployment

## Informasi Domain & Server

| Item | Nilai |
|------|-------|
| Domain | `geodesa.mendunia.id` |
| Frontend | `https://geodesa.mendunia.id` |
| Backend API | `https://api.geodesa.mendunia.id` (subdomain) |
| Server | VPS (Ubuntu 22.04 / 24.04 LTS) |
| Web Server | Nginx |
| Database | MySQL 8.0+ |
| PHP | 8.2+ |
| Node.js | 20+ |

---

## 1. Persiapan VPS

### 1.1 Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.3 Install PHP 8.2 + Extensions

```bash
sudo apt install php8.2-fpm php8.2-mysql php8.2-mbstring \
  php8.2-xml php8.2-curl php8.2-gd php8.2-zip \
  php8.2-bcmath php8.2-json php8.2-tokenizer php8.2-common -y

sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
```

### 1.4 Install MySQL

```bash
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql

# Amankan MySQL
sudo mysql_secure_installation
```

### 1.5 Install Composer

```bash
cd /tmp
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

### 1.6 Install Node.js & npm

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node -v  # verifikasi
npm -v   # verifikasi
```

### 1.7 Install Certbot (SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## 2. Persiapan Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE zonasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zonasi_user'@'localhost' IDENTIFIED BY 'P4ssw0rd_Kuat!';
GRANT ALL PRIVILEGES ON zonasi_db.* TO 'zonasi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Deployment Backend (Laravel)

### 3.1 Upload Kode ke Server

```bash
# Buat direktori
sudo mkdir -p /var/www/geodesa
sudo chown -R $USER:$USER /var/www/geodesa

# Clone atau upload kode backend
cd /var/www/geodesa
git clone <repository-url> backend
# atau upload via SCP / FTP
```

### 3.2 Install Dependencies & Konfigurasi

```bash
cd /var/www/gis-cibulakan/backend

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Copy environment
cp .env.example .env
nano .env
```

### 3.3 Konfigurasi `.env` Backend

```env
APP_NAME="SIG Desa Cibulakan Cianjur"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.geodesa.mendunia.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zonasi_db
DB_USERNAME=zonasi_user
DB_PASSWORD=P4ssw0rd_Kuat!

SANCTUM_STATEFUL_DOMAINS=geodesa.mendunia.id
CORS_ALLOWED_ORIGINS=https://geodesa.mendunia.id
FRONTEND_URL=https://geodesa.mendunia.id

SESSION_DRIVER=file
SESSION_DOMAIN=.geodesa.mendunia.id

FILESYSTEM_DISK=public
```

### 3.4 Generate Key & Migrate

```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

### 3.5 Optimasi Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3.6 Set Permission

```bash
sudo chown -R www-data:www-data /var/www/geodesa/backend
sudo chmod -R 755 /var/www/geodesa/backend/storage
sudo chmod -R 755 /var/www/geodesa/backend/bootstrap/cache
```

---

## 4. Deployment Frontend (React + Vite)

### 4.1 Upload & Install

```bash
cd /var/www/geodesa

# Clone atau upload frontend
git clone <repository-url> frontend
# atau upload via SCP / FTP

cd frontend
npm install
```

### 4.2 Konfigurasi `.env` Frontend

```bash
nano .env
```

```env
VITE_API_URL=https://api.geodesa.mendunia.id/api
VITE_APP_URL=https://geodesa.mendunia.id
```

### 4.3 Build Production

```bash
npm run build
```

Hasil build berada di direktori `dist/`.

---

## 5. Konfigurasi Nginx

### 5.1 Backend API — Subdomain `api.geodesa.mendunia.id`

Buat file `/etc/nginx/sites-available/api.geodesa.mendunia.id`:

```nginx
server {
    listen 80;
    server_name api.geodesa.mendunia.id;

    root /var/www/gis-cibulakan/backend/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Upload lebih besar untuk foto
    client_max_body_size 20M;
}
```

### 5.2 Frontend SPA — Domain Utama

Buat file `/etc/nginx/sites-available/geodesa.mendunia.id`:

```nginx
server {
    listen 80;
    server_name geodesa.mendunia.id;

    root /var/www/gis-cibulakan/frontend/dist;
    index index.html;

    # SPA — semua route diarahkan ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 6M;
        add_header Cache-Control "public, immutable";
    }

    # robots.txt
    location /robots.txt {
        alias /var/www/gis-cibulakan/frontend/public/robots.txt;
    }

    client_max_body_size 10M;
}
```

### 5.3 Aktifkan Site

```bash
sudo ln -s /etc/nginx/sites-available/api.geodesa.mendunia.id /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/geodesa.mendunia.id /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 6. SSL (HTTPS) dengan Certbot

```bash
# Install SSL untuk kedua domain
sudo certbot --nginx -d geodesa.mendunia.id
sudo certbot --nginx -d api.geodesa.mendunia.id

# Verifikasi auto-renewal
sudo certbot renew --dry-run
```

Setelah SSL terpasang, Nginx config akan otomatis diperbarui dengan sertifikat.

---

## 7. Firewall

```bash
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 8. Verifikasi Deployment

| URL | Fungsi | Status |
|-----|--------|--------|
| `https://geodesa.mendunia.id` | Frontend SPA | ✅ |
| `https://api.geodesa.mendunia.id` | Backend API | ✅ |
| `https://api.geodesa.mendunia.id/api/me` | Cek auth | ✅ |
| `https://geodesa.mendunia.id/sitemap.xml` | Sitemap SEO | (akan redirect ke backend) |

**Catatan**: Sitemap diakses dari backend (`api.geodesa.mendunia.id/sitemap.xml`), bukan dari frontend.

Tambahkan baris di `robots.txt` frontend:

```
Sitemap: https://api.geodesa.mendunia.id/sitemap.xml
```

---

## 9. Maintenance

### Backup Database

```bash
# Backup harian via cron
mysqldump -u zonasi_user -p zonasi_db > /backup/zonasi_db_$(date +%Y%m%d).sql
```

### Update Aplikasi

```bash
# Backend
cd /var/www/gis-cibulakan/backend
git pull
composer install --optimize-autoloader --no-dev
php artisan migrate
php artisan config:cache
php artisan route:cache

# Frontend
cd /var/www/gis-cibulakan/frontend
git pull
npm install
npm run build
```

### Logs

```bash
# Laravel log
tail -f /var/www/gis-cibulakan/backend/storage/logs/laravel.log

# Nginx error log
tail -f /var/log/nginx/error.log
```

---

## 10. Troubleshooting

### 10.1 File Upload Tidak Bekerja
```bash
# Pastikan storage link terbuat
php artisan storage:link

# Pastikan permission benar
sudo chown -R www-data:www-data /var/www/gis-cibulakan/backend/storage
```

### 10.2 502 Bad Gateway
```bash
# Cek PHP-FPM berjalan
sudo systemctl status php8.2-fpm
sudo systemctl restart php8.2-fpm
```

### 10.3 Halaman Kosong / White Screen
```bash
# Cek APP_DEBUG di .env
# APP_DEBUG=true untuk sementara

# Cek logs
tail -f /var/www/gis-cibulakan/backend/storage/logs/laravel.log
```

### 10.4 CORS Error
Pastikan di `.env` backend:
```env
SANCTUM_STATEFUL_DOMAINS=geodesa.mendunia.id
CORS_ALLOWED_ORIGINS=https://geodesa.mendunia.id
FRONTEND_URL=https://geodesa.mendunia.id
```

Kemudian jalankan:
```bash
php artisan config:clear
php artisan config:cache
```

### 10.5 SPA Refresh 404
Pastikan Nginx frontend config sudah memiliki:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
