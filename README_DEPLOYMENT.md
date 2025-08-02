# 🚀 Panduan Deployment Backend ke Server

## 📋 Status Saat Ini

### ✅ Yang Sudah Siap:
- **Database**: MongoDB di server `103.242.104.213:27017`
- **Data**: 55 siswa sudah dimigrasi dari Cloud ke server
- **Collections**: `siswa`, `history_pengurangan`, `saldo_awal`
- **Frontend**: Sudah diupdate untuk mengakses server Anda

### 🔧 Konfigurasi:
- **Backend URL**: `http://103.242.104.213:3000`
- **Database**: `mongodb://admin:passwordkuat@103.242.104.213:27017/?authSource=admin`
- **Database Name**: `pembukuansekolah`

## 🚀 Cara Deploy ke Server

### 1. Upload File ke Server
```bash
# Upload folder backend-node ke server Anda
scp -r backend-node/ user@103.242.104.213:/path/to/your/server/
```

### 2. Install Dependencies di Server
```bash
cd /path/to/your/server/backend-node
npm install
```

### 3. Jalankan Server
```bash
# Development
npm run dev

# Production
npm start
```

### 4. Test API
```bash
# Health check
curl http://103.242.104.213:3000/health

# Test siswa API
curl http://103.242.104.213:3000/api/siswa

# Test history API
curl http://103.242.104.213:3000/api/history_pengurangan?tahun=2025
```

## 📱 Frontend Configuration

Frontend sudah diupdate untuk mengakses server Anda:
```dart
// lib/backend/mongodb_service.dart
static const String baseUrl = 'http://103.242.104.213:3000/api';
```

## 🔧 Maintenance

### Menghapus Data Dummy
```bash
# Masuk ke MongoDB server
mongo mongodb://admin:passwordkuat@103.242.104.213:27017/?authSource=admin

# Pilih database
use pembukuansekolah

# Hapus data dummy
db.history_pengurangan.deleteMany({deskripsi: "Pengurangan awal untuk test"})
db.saldo_awal.deleteMany({tahun: "2025"})
```

### Backup Database
```bash
# Export database
mongodump --uri="mongodb://admin:passwordkuat@103.242.104.213:27017/?authSource=admin" --db=pembukuansekolah --out=./backup
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/siswa` | Ambil semua data siswa |
| POST | `/api/siswa` | Tambah siswa baru |
| PATCH | `/api/edit_nama` | Edit nama siswa |
| PATCH | `/api/pembayaran_bulan` | Update pembayaran mingguan |
| PATCH | `/api/pembayaran_harian` | Update pembayaran harian |
| DELETE | `/api/siswa_delete` | Hapus siswa |
| GET | `/api/history_pengurangan` | Ambil history pengurangan |
| POST | `/api/history_pengurangan` | Tambah history pengurangan |
| GET | `/api/saldo_awal` | Ambil saldo awal tahun |
| POST | `/api/saldo_awal` | Set saldo awal tahun |
| GET | `/health` | Health check |

## 🛠️ Troubleshooting

### Server tidak bisa diakses
1. Cek firewall: `sudo ufw status`
2. Buka port 3000: `sudo ufw allow 3000`
3. Cek service: `sudo systemctl status your-app`

### Database connection error
1. Cek MongoDB service: `sudo systemctl status mongod`
2. Cek connection string
3. Cek network connectivity

### API error
1. Cek log server: `tail -f /var/log/your-app.log`
2. Restart server: `npm restart`
3. Cek dependencies: `npm install` 