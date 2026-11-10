PAKET PWA SIMFAQ V550 - PERAPIAN PAGINATION DAN OPTIMASI PEMUATAN

Perubahan V550 (mencakup seluruh fitur V549):
- Panel visual Diagnostik Notifikasi Push di menu Notifikasi dihilangkan. Pencatatan diagnostik lokal push tetap dipertahankan di belakang layar.
- Pagination daftar hanya memiliki satu pasang tombol Sebelumnya/Berikutnya di bawah daftar.
- Daftar peserta ujian, riwayat peserta, nomor ujian, remedial, notifikasi, riwayat login, kegiatan, dan pemilih peserta kartu ujian mengambil 51 baris sebagai penanda halaman berikutnya, tetapi menampilkan maksimal 50 baris.
- Query daftar tidak lagi meminta count exact; tombol Berikutnya ditentukan dari keberadaan baris ke-51.
- Pemeriksaan notifikasi belum dibaca tidak lagi menghitung seluruh baris untuk kebutuhan tampilan.
- Cache Service Worker dinaikkan ke V9.

Tidak ada perubahan database, skema, RLS, Edge Function, push subscription, atau data operasional.

Pemasangan:
1. Ganti index.html dan sw.js dengan file dari paket ini.
2. Pertahankan manifest.webmanifest, offline.html, dan folder icons (paket juga menyertakannya).
3. Commit/publish GitHub Pages.
4. Buka ulang SIMFAQ dan pastikan Service Worker V9 aktif.
5. Uji daftar dengan lebih dari 50 data: halaman pertama harus menampilkan 50 baris, tombol Berikutnya berpindah ke data berikutnya, dan tombol Sebelumnya kembali.
6. Pastikan tombol pagination hanya muncul sekali dan berada di bawah daftar.
7. Uji satu notifikasi push nyata untuk memastikan fungsi push V549 tetap berjalan.

Catatan teknis:
- Baris ke-51 hanya digunakan sebagai indikator ada/tidaknya halaman berikutnya; baris tersebut tidak ditampilkan.
- Proses cetak “Semua Peserta” tetap mengambil seluruh hasil filter saat proses cetak dijalankan; pagination tidak membatasi isi dokumen cetak.
- Penghitungan agregat dashboard/laporan yang memang memerlukan jumlah total tidak diubah.
- Pemeriksaan sintaks JavaScript tidak menggantikan uji runtime terhadap Supabase dan perangkat Android.
