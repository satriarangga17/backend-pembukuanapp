require('dotenv').config();
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'pembukuansekolah';

module.exports = async function handler(req, res) {
  console.log('REQUEST:', req.method, req.body || req.query);

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
    const db = client.db(dbName);
    const siswaCol = db.collection('siswa');
    const body = req.body || req.query;
    const { nama, bulanTahun, minggu, hari, nominal } = body;
    
    if (!nama || !bulanTahun || minggu === undefined || hari === undefined || nominal === undefined) {
      console.log('PARAMS ERROR:', { nama, bulanTahun, minggu, hari, nominal });
      return res.status(400).json({ error: 'Parameter wajib diisi', params: { nama, bulanTahun, minggu, hari, nominal } });
    }

    // Pastikan field pembayaranHarian.bulanTahun.minggu ada
    let siswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    if (!siswa) {
      console.log('SISWA NOT FOUND:', nama);
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }

    // Inisialisasi struktur data jika belum ada
    if (!siswa.pembayaranHarian) {
      await siswaCol.updateOne(
        { nama: { $regex: `^${nama}$`, $options: 'i' } },
        { $set: { pembayaranHarian: {} } }
      );
      // Ambil data siswa yang sudah diupdate
      siswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    }

    if (!siswa.pembayaranHarian[bulanTahun]) {
      await siswaCol.updateOne(
        { nama: { $regex: `^${nama}$`, $options: 'i' } },
        { $set: { [`pembayaranHarian.${bulanTahun}`]: {} } }
      );
      // Ambil data siswa yang sudah diupdate
      siswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    }

    if (!siswa.pembayaranHarian[bulanTahun]?.[minggu.toString()]) {
      await siswaCol.updateOne(
        { nama: { $regex: `^${nama}$`, $options: 'i' } },
        { $set: { [`pembayaranHarian.${bulanTahun}.${minggu}`]: [0, 0, 0, 0, 0, 0, 0] } }
      );
      // Ambil data siswa yang sudah diupdate
      siswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    }

    // Update pembayaran harian
    const key = `pembayaranHarian.${bulanTahun}.${minggu}.${hari}`;
    const result = await siswaCol.updateOne(
      { nama: { $regex: `^${nama}$`, $options: 'i' } },
      { $set: { [key]: nominal } }
    );

    // Hitung total minggu dan update pembayaran per bulan
    const updatedSiswa = await siswaCol.findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    const harianMinggu = updatedSiswa.pembayaranHarian[bulanTahun]?.[minggu.toString()] || [];
    const totalMinggu = harianMinggu.reduce((sum, val) => sum + (val || 0), 0);
    
    // Update total minggu di pembayaran per bulan
    const pembayaranKey = `pembayaran.${bulanTahun}.${minggu}`;
    await siswaCol.updateOne(
      { nama: { $regex: `^${nama}$`, $options: 'i' } },
      { $set: { [pembayaranKey]: totalMinggu } }
    );

    console.log('UPDATE SUCCESS:', nama, bulanTahun, minggu, hari, nominal);
    res.status(200).json({ message: 'Pembayaran harian diupdate', totalMinggu: totalMinggu });
  } catch (e) {
    console.log('SERVER ERROR:', e);
    res.status(500).json({ error: e.toString(), stack: e.stack });
  } finally {
    await client.close();
  }
}; 