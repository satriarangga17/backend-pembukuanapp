require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

module.exports = async function handler(req, res) {
  console.log('REQUEST:', req.method, req.body || req.query); // log awal

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PATCH') {
    console.log('METHOD NOT ALLOWED:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('pembukuansekolah');
    const siswaCol = db.collection('siswa');
    const body = req.body || req.query;
    const { nama, bulanTahun, minggu, status } = body;
    if (!nama || !bulanTahun || minggu === undefined || status === undefined) {
      console.log('PARAMS ERROR:', { nama, bulanTahun, minggu, status });
      return res.status(400).json({ error: 'Parameter wajib diisi', params: { nama, bulanTahun, minggu, status } });
    }
    // Pastikan field pembayaran.bulanTahun ada, jika tidak, tambahkan
    const siswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    if (!siswa) {
      console.log('SISWA NOT FOUND:', nama);
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }
    if (!siswa.pembayaran || !siswa.pembayaran[bulanTahun]) {
      // Tambahkan array pembayaran baru untuk bulanTahun
      const pembayaranBaru = siswa.pembayaran || {};
      pembayaranBaru[bulanTahun] = [false, false, false, false];
      await siswaCol.updateOne(
        { nama: { $regex: `^${nama}$`, $options: 'i' } },
        { $set: { [`pembayaran.${bulanTahun}`]: [false, false, false, false] } }
      );
      console.log('ADD NEW BULAN:', nama, bulanTahun);
    }
    // Update pembayaran minggu
    const key = `pembayaran.${bulanTahun}.${minggu}`;
    const result = await siswaCol.updateOne(
      { nama: { $regex: `^${nama}$`, $options: 'i' } },
      { $set: { [key]: status } }
    );
    if (result.modifiedCount > 0) {
      console.log('UPDATE SUCCESS:', nama, bulanTahun, minggu, status);
      res.status(200).json({ message: 'Pembayaran diupdate' });
    } else {
      console.log('UPDATE FAILED:', nama, bulanTahun, minggu, status);
      res.status(404).json({ error: 'Siswa tidak ditemukan atau tidak berubah' });
    }
  } catch (e) {
    console.log('SERVER ERROR:', e);
    res.status(500).json({ error: e.toString(), stack: e.stack });
  } finally {
    await client.close();
  }
}; 