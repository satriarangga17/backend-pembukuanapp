# 🔐 Setup Environment Variables

## Langkah-langkah Setup:

### 1. Copy Environment Template
```bash
cp env_template.txt .env
```

### 2. Edit File .env
Buka file `.env` dan sesuaikan nilai-nilainya:

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://pembukansekolah:Q5pJRyMnIvKyIVEE@pembukuansekolah.eo1yevy.mongodb.net/?retryWrites=true&w=majority&appName=pembukuansekolah

# Database Name
DB_NAME=pembukuansekolah

# Server Port (optional)
PORT=3000

# Environment
NODE_ENV=production
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Jalankan Server
```bash
npm start
```

## 🔒 Keamanan

- ✅ File `.env` sudah ditambahkan ke `.gitignore`
- ✅ Connection string tidak lagi hardcoded di source code
- ✅ Environment variables digunakan di semua API files

## 📝 Catatan

- Jangan commit file `.env` ke repository
- File `env_template.txt` bisa di-commit sebagai template
- Semua API files sudah diupdate untuk menggunakan `process.env.MONGO_URI` 