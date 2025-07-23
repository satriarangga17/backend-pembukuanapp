require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('pembukuansekolah');
    const siswaCol = db.collection('siswa');
    const nama = req.query.nama || (req.body && req.body.nama);
    if (!nama) return res.status(400).json({ error: 'Parameter nama wajib diisi' });
    console.log('REQUEST DELETE SISWA:', nama);
    const result = await siswaCol.deleteOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Siswa dihapus' });
    } else {
      res.status(404).json({ error: 'Gagal hapus siswa' });
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  } finally {
    await client.close();
  }
}; 