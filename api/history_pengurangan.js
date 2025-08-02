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

  console.log('REQUEST:', req.method, req.body || req.query);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('Database:', db.databaseName);
    const historyCol = db.collection('history_pengurangan');

    if (req.method === 'POST') {
      // Tambah history pengurangan (hanya admin)
      const { jumlah, deskripsi, tahun } = req.body;
      
      if (!jumlah || !deskripsi || !tahun) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }

      const history = {
        id: Date.now().toString(),
        jumlah: parseFloat(jumlah),
        deskripsi: deskripsi,
        tanggal: new Date(),
        tahun: tahun
      };

      await historyCol.insertOne(history);
      
      console.log('History pengurangan ditambahkan:', history);
      res.status(200).json({ message: 'History pengurangan berhasil ditambahkan', data: history });

    } else if (req.method === 'GET') {
      // Ambil history pengurangan berdasarkan tahun (admin & user)
      const { tahun } = req.query;
      
      if (!tahun) {
        return res.status(400).json({ error: 'Tahun harus diisi' });
      }

      const history = await historyCol.find({ tahun: tahun }).sort({ tanggal: -1 }).toArray();
      
      console.log('History pengurangan diambil untuk tahun:', tahun, 'Count:', history.length);
      res.status(200).json(history);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}; 