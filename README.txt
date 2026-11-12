SIMFAQ V568 — PENYESUAIAN JUDUL NOTIFIKASI & MIGRASI OTOMATIS
Tanggal: 12 November 2026
Baseline aplikasi: SIMFAQ V567 Push Monitoring

PERUBAHAN DATABASE YANG SUDAH DITERAPKAN
1. Judul notifikasi nilai ujian dibuat dinamis:
   - Nilai Ujian — [Nama Peserta] | [Materi]
   - Perubahan Nilai — [Nama Peserta] | [Materi]
2. Migrasi otomatis Pra Tashih ke Tashih memakai judul:
   - Peserta Tashih Baru — [Nama Peserta]
   Mekanisme migrasi dan aturan kelulusan tidak diubah.
3. Ditambahkan notifikasi khusus ketika peserta Tashih berhasil masuk ke daftar Wisuda:
   - Peserta Wisuda Baru — [Nama Peserta]
4. Penerima notifikasi Wisuda mengikuti routing modul Wisuda yang sudah ada:
   - akun aktif lembaga asal peserta;
   - pengurus organisasi yang memiliki izin modul Wisuda.
   - Migrasi Pra Tashih ke Tashih: akun aktif lembaga asal dan pengurus organisasi yang memiliki izin modul Ujian.
5. Pencegahan notifikasi ganda untuk peserta migrasi Wisuda: notifikasi generik peserta wisuda pada transaksi migrasi yang sama digantikan notifikasi khusus migrasi.

MIGRASI SUPABASE YANG SUDAH TERCATAT
- 20261112151343_add_named_exam_and_graduation_migration_notifications
- 20261112151406_avoid_duplicate_graduation_migration_notifications
- route_exam_migration_notifications_by_permission (routing migrasi ujian ke pengurus berizin modul Ujian)

FILE PAKET
- index.html: baseline V567 dengan metadata versi diperbarui menjadi V568. Tidak ada perubahan alur UI.
- sw.js: dipertahankan sama dengan V567 (cache v6); tidak perlu perubahan Service Worker untuk format judul karena judul dibentuk di database.

STATUS DAN BATASAN
- Perubahan fungsi/trigger database sudah diterapkan pada proyek Supabase SIMFAQ.
- Paket HTML/Service Worker ini belum diunggah ke hosting aplikasi. Metadata V568 akan tampil setelah index.html paket ini dipasang di hosting.
- Belum dilakukan uji transaksi nilai atau migrasi nyata pada data peserta. Tidak ada data peserta/nilai yang diubah sebagai bagian revisi ini.
- Uji berikutnya perlu memakai satu peserta uji yang disetujui, memastikan notifikasi aplikasi dan push diterima oleh penerima yang tepat, lalu memeriksa tidak ada duplikasi.
- Tidak ada perubahan pada skema tabel, RLS, aturan kelulusan, nomor ujian, gelombang, riwayat nilai, atau data peserta.
