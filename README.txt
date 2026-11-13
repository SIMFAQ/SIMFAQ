SIMFAQ V569 — FORM HASIL UJIAN TERPADU
Tanggal: 13 November 2026
Baseline: V568 NOTIFIKASI & MIGRASI

PERUBAHAN APLIKASI
1. Ditambahkan satu halaman baca-saja “Hasil Ujian” yang dipakai bersama untuk Pra Tashih dan Tashih.
2. Klik notifikasi nilai tersimpan/perubahan nilai (related_table exam_scores) membuka halaman hasil peserta dan menyorot materi yang memicu notifikasi.
3. Klik notifikasi seluruh materi selesai (related_table exam_sessions) membuka halaman hasil peserta yang sama.
4. Halaman menampilkan foto peserta, nama, NIS, nomor ujian, lembaga, jenis ujian, gelombang, rincian materi, nilai, batas minimal, status tiap materi, status keseluruhan, serta pesan/doa Islami.
5. Rincian nilai remedial mengikuti urutan dan pemilihan nilai terbaru yang digunakan fungsi refresh_exam_result. Batas minimal dibaca dari aturan ujian berstatus ACTIVE pada periode dan jenis ujian peserta; snapshot aturan sesi tidak digunakan.
6. Halaman hanya menampilkan data; tidak mengubah nilai, penilaian, finalisasi, penguncian, atau data peserta.

PERUBAHAN DATABASE
- Migration: link_exam_completion_push_to_result_form
- Notifikasi EXAM_MATERIAL_COMPLETE sekarang menunjuk langsung ke exam_sessions.id, sehingga klik push dapat membuka sesi/peserta yang tepat.
- Judul notifikasi penyelesaian memuat nama peserta.
- Pemicu notifikasi penyelesaian, penerima, deduplikasi, dan fungsi penyimpanan nilai tidak diubah.

FILE
- index.html: implementasi halaman hasil dan integrasi klik notifikasi.
- sw.js: dipertahankan dari V568; format payload klik push yang ada sudah membawa related_table dan related_id.

PEMERIKSAAN
- 71 blok JavaScript inline lolos node --check.
- sw.js lolos node --check.
- Integritas ZIP diperiksa setelah paket dibuat.
- Tidak ada transaksi nilai, migrasi peserta, atau penulisan data uji yang dijalankan.
- Belum dilakukan uji klik push langsung pada perangkat Android.

CATATAN PENGUJIAN
Setelah paket V569 dipasang pada hosting, lakukan uji terkontrol untuk satu notifikasi nilai Pra Tashih, satu notifikasi nilai Tashih, dan satu notifikasi seluruh materi selesai. Pastikan akun penerima dapat membaca foto dan hasil peserta sesuai cakupan izinnya.
