const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const siswa = require('./api/siswa');
const editNama = require('./api/edit_nama');
const pembayaranBulan = require('./api/pembayaran_bulan');
const siswaDelete = require('./api/siswa_delete');
const pembayaranHarian = require('./api/pembayaran_harian');
const historyPengurangan = require('./api/history_pengurangan');
const saldoAwal = require('./api/saldo_awal');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pembukuan Backend API is running!',
    version: '1.0.0',
    endpoints: [
      '/api/siswa',
      '/api/pembayaran_bulan',
      '/api/pembayaran_harian',
      '/api/history_pengurangan',
      '/api/saldo_awal',
      '/api/edit_nama',
      '/api/siswa_delete'
    ]
  });
});

// API Routes
app.get('/api/siswa', siswa);
app.post('/api/siswa', siswa);
app.patch('/api/edit_nama', editNama);
app.patch('/api/pembayaran_bulan', pembayaranBulan);
app.delete('/api/siswa_delete', siswaDelete);
app.patch('/api/pembayaran_harian', pembayaranHarian);
app.post('/api/history_pengurangan', historyPengurangan);
app.get('/api/history_pengurangan', historyPengurangan);
app.post('/api/saldo_awal', saldoAwal);
app.get('/api/saldo_awal', saldoAwal);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`);
}); 