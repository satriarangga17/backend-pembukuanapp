# Backend Node.js untuk Pembukuan (Vercel)

API siswa, pembayaran, edit nama, dan hapus siswa. Terhubung ke MongoDB Atlas. Siap deploy ke Vercel.

## Endpoint
- GET    `/api/siswa`           : List semua siswa
- POST   `/api/siswa`           : Tambah siswa
- PATCH  `/api/pembayaran_bulan`: Update pembayaran per bulan/minggu
- PATCH  `/api/edit_nama`       : Edit nama siswa
- DELETE `/api/siswa_delete`    : Hapus siswa (query: ?nama=...)

## Cara Deploy
1. Set env `MONGO_URI` di Vercel (dari MongoDB Atlas)
2. Deploy ke Vercel (import dari GitHub atau upload manual)
3. Ganti baseUrl di Flutter ke URL Vercel Anda

## Catatan
- Semua endpoint sudah CORS ready
- Tidak perlu Express, cukup serverless function (Vercel) 