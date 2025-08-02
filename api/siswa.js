require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'pembukuansekolah';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('Database:', db.databaseName);
    const siswaCol = db.collection('siswa');
    const siswa = await siswaCol.find().toArray();
    console.log('HASIL QUERY SISWA:', siswa);

    if (req.method === 'GET') {
      siswa.forEach(e => delete e._id);
      res.status(200).json(siswa);
    } else if (req.method === 'POST') {
      const { nama, pembayaran } = req.body || req.query;
      if (!nama) return res.status(400).json({ error: 'Nama wajib diisi' });
      await siswaCol.insertOne({ nama, pembayaran: pembayaran || [0, 0, 0, 0, 0] });
      res.status(200).json({ message: 'Siswa ditambahkan' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  } finally {
    await client.close();
  }
}; 