require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('pembukuansekolah');
    const siswaCol = db.collection('siswa');
    const body = req.body || req.query;
    const { namaLama, namaBaru } = body;
    if (!namaLama || !namaBaru) {
      return res.status(400).json({ error: 'Parameter wajib diisi' });
    }
    console.log('REQUEST EDIT NAMA:', namaLama, '->', namaBaru);
    const result = await siswaCol.updateOne(
      { nama: { $regex: `^${namaLama}$`, $options: 'i' } },
      { $set: { nama: namaBaru } }
    );
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Nama siswa diupdate' });
    } else {
      res.status(404).json({ error: 'Gagal edit nama siswa' });
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  } finally {
    await client.close();
  }
}; 