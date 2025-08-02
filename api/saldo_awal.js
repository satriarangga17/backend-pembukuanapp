require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'pembukuansekolah';

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const saldoCol = db.collection('saldo_awal');

    if (req.method === 'POST') {
      // Set saldo awal tahun (untuk carry over balance)
      const { tahun, saldo, isManual = false } = req.body;
      
      if (!tahun || saldo === undefined) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }

      // Jika saldo manual, validasi tidak boleh lebih dari total pemasukan siswa
      if (isManual) {
        const siswaCol = db.collection('siswa');
        const semuaSiswa = await siswaCol.find().toArray();
        
        let totalPemasukanSiswa = 0;
        
        for (const siswa of semuaSiswa) {
          if (siswa.pembayaran) {
            for (const [bulanTahun, pembayaranBulan] of Object.entries(siswa.pembayaran)) {
              if (bulanTahun.startsWith(tahun + '-')) {
                if (Array.isArray(pembayaranBulan)) {
                  const totalBulan = pembayaranBulan.reduce((sum, nilai) => {
                    if (typeof nilai === 'number') {
                      return sum + nilai;
                    } else if (nilai === true) {
                      return sum + 1000;
                    }
                    return sum;
                  }, 0);
                  totalPemasukanSiswa += totalBulan;
                }
              }
            }
          }
        }
        
        // Jika ada data siswa, saldo manual tidak boleh lebih dari total pemasukan
        if (totalPemasukanSiswa > 0 && parseFloat(saldo) > totalPemasukanSiswa) {
          return res.status(400).json({ 
            error: `Saldo manual tidak boleh lebih dari total pemasukan siswa (Rp ${totalPemasukanSiswa.toLocaleString()})` 
          });
        }
      }

      // Update atau insert saldo awal tahun
      await saldoCol.updateOne(
        { tahun: tahun },
        { 
          $set: { 
            tahun: tahun, 
            saldo: parseFloat(saldo),
            isManual: isManual, // Flag untuk menandai saldo manual
            tanggalUpdate: new Date()
          } 
        },
        { upsert: true }
      );
      
      console.log('Saldo awal tahun diset:', { tahun, saldo, isManual });
      res.status(200).json({ message: 'Saldo awal tahun berhasil diset', tahun, saldo, isManual });

    } else if (req.method === 'GET') {
      // Ambil saldo awal tahun
      const { tahun } = req.query;
      
      if (!tahun) {
        return res.status(400).json({ error: 'Tahun harus diisi' });
      }

      // Cek apakah ada saldo manual untuk tahun ini
      const saldoManual = await saldoCol.findOne({ tahun: tahun, isManual: true });
      
      if (saldoManual) {
        // Jika ada saldo manual, gunakan itu
        console.log('Menggunakan saldo manual tahun', tahun, ':', saldoManual.saldo);
        res.status(200).json({ tahun, saldo: saldoManual.saldo, isManual: true });
      } else {
        // Jika tidak ada saldo manual, hitung dari total pemasukan siswa
        const siswaCol = db.collection('siswa');
        const semuaSiswa = await siswaCol.find().toArray();
        
        let totalPemasukan = 0;
        
        for (const siswa of semuaSiswa) {
          if (siswa.pembayaran) {
            // Loop semua bulan dalam tahun tersebut
            for (const [bulanTahun, pembayaranBulan] of Object.entries(siswa.pembayaran)) {
              if (bulanTahun.startsWith(tahun + '-')) {
                if (Array.isArray(pembayaranBulan)) {
                  // Hitung total dari array pembayaran (bisa boolean atau number)
                  const totalBulan = pembayaranBulan.reduce((sum, nilai) => {
                    if (typeof nilai === 'number') {
                      return sum + nilai;
                    } else if (nilai === true) {
                      return sum + 1000; // Default nilai jika boolean true
                    }
                    return sum;
                  }, 0);
                  totalPemasukan += totalBulan;
                }
              }
            }
          }
        }
        
        console.log('Total pemasukan tahun', tahun, ':', totalPemasukan);
        res.status(200).json({ tahun, saldo: totalPemasukan, isManual: false });
      }

    } else {
      res.status(405).json({ error: 'Method tidak diizinkan' });
    }

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}; 