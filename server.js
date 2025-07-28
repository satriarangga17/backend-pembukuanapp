require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const siswa = require('./api/siswa');
const pembayaranBulan = require('./api/pembayaran_bulan');
const pembayaranHarian = require('./api/pembayaran_harian');
const editNama = require('./api/edit_nama');
const siswaDelete = require('./api/siswa_delete');

const app = express();
app.use(bodyParser.json());

app.get('/api/siswa', siswa);
app.post('/api/siswa', siswa);
app.patch('/api/pembayaran_bulan', pembayaranBulan);
app.patch('/api/pembayaran_harian', pembayaranHarian);
app.patch('/api/edit_nama', editNama);
app.delete('/api/siswa_delete', siswaDelete);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 