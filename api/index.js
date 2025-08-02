require('dotenv').config();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
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
}; 