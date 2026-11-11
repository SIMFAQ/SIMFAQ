PAKET PWA SIMFAQ V551 — PENYELARASAN NOTIFIKASI PEMBAYARAN

V551 berbasis V550 dan mempertahankan fitur-fitur sebelumnya.

Perubahan utama:
- Isi notifikasi pembayaran dibuat satu sumber di database sehingga notifikasi aplikasi dan push membaca pesan yang sama.
- Pembayaran terkonfirmasi menampilkan nominal yang diterima, total tagihan, total pembayaran terkumpul, status lunas/sebagian, dan sisa tagihan aktual.
- Sisa Rp0 ditampilkan sebagai LUNAS; sisa di atas Rp0 ditampilkan sebagai DIBAYAR SEBAGIAN.
- Tanggal pada daftar Notifikasi menggunakan Asia/Jakarta (WIB); timestamp tetap disimpan UTC.
- Cache Service Worker dinaikkan ke V10.

Pemasangan:
1. Ganti index.html dan sw.js dengan file dari paket ini.
2. Pertahankan manifest.webmanifest, offline.html, dan folder icons (paket juga menyertakannya).
3. Publish paket ke hosting aplikasi.
4. Pastikan Service Worker V10 aktif setelah aplikasi dimuat ulang.
5. Uji satu tagihan yang dibayar lunas dan satu tagihan yang dibayar sebagian. Pastikan pesan pada menu Notifikasi dan push menunjukkan sisa yang sama.

Catatan:
- Perubahan fungsi database public.notify_institution_event telah diterapkan pada proyek Supabase terkait.
- ID notifikasi UUID tetap menggunakan ID dari tabel notifications; tidak dibuat ID tambahan.
- Uji end-to-end push pada Android masih diperlukan. Respons sukses dari layanan push bukan bukti bahwa Android sudah menampilkan notifikasi.

V552: Service Worker V11 menambahkan acknowledgment push bertanda tangan setelah showNotification() berhasil. Lihat CHANGELOG-V552.txt.
Backend Supabase untuk durable outbox, retry, delivery tracking, dan acknowledgment telah diterapkan langsung pada proyek; paket ini berisi berkas aplikasi/PWA, bukan kredensial atau file konfigurasi rahasia.
