SIMFAQ V569 — KOREKSI FOTO & ROUTING NOTIFIKASI HASIL UJIAN

Perubahan pada index.html:
1. Pengambilan foto Form Hasil Ujian memakai query terpisah ke participant_media berdasarkan media_id, mengikuti pola Form Penilaian V559.
2. Klik notifikasi dalam aplikasi untuk jenis Nilai Ujian / Perubahan Nilai / hasil ujian / seluruh materi selesai diarahkan langsung ke Form Hasil Ujian.
3. Konteks notifikasi disimpan pada metadata notifikasi agar dapat menentukan sesi ujian yang benar.
4. Jika metadata relasi tidak ikut pada payload push, aplikasi mengambil related_table, related_id, dan event_type dari baris notifikasi milik akun yang sedang masuk.

Perubahan pada sw.js:
1. Jika notifikasi push diklik saat tidak ada jendela aplikasi yang terbuka, metadata notifikasi diteruskan melalui parameter URL agar setelah aplikasi dibuka dan sesi siap, navigasi tetap menuju Form Hasil Ujian.

Tidak diubah:
- Data peserta, foto, nilai, sesi ujian, dan aturan ujian di Supabase.
- Trigger/migrasi database.
- Distribusi notifikasi dan daftar penerima.
- Modul lain yang tidak terkait.

Pemeriksaan statis:
- 71 blok JavaScript inline pada index.html lolos node --check.
- sw.js lolos node --check.
- Tidak ada pengujian perangkat nyata pada tahap ini.

Pemasangan:
Unggah index.html dan sw.js dari paket ini ke GitHub/hosting aplikasi. Keduanya perlu diperbarui bersama karena sw.js sekarang meneruskan konteks notifikasi saat aplikasi belum terbuka.
