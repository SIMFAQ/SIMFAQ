PAKET PWA SIMFAQ - BASIS V542 (REVISI TERPADU)

Perubahan:
- Tombol Update Aplikasi pada dashboard menangani instalasi PWA dan pemeriksaan pembaruan.
- Service Worker menerima perintah pembaruan dari tombol dan menggunakan cache v2.
- Dashboard menawarkan aktivasi notifikasi; izin resmi tetap diminta hanya setelah pengguna menekan tombol.
- Push Subscription disinkronkan ke akun yang sedang login menggunakan mekanisme V542 yang telah ada.
- Peringatan offline umum dihilangkan. Kegagalan jaringan pada permintaan tulis Supabase ditampilkan melalui peringatan internal SIMFAQ.
- Notifikasi dalam aplikasi memakai nuansa Islami, santun, sejuk, dan profesional; isi notifikasi tidak diubah.
- Card dashboard dan kartu sambutan mendapat efek 3D glossy tanpa mengubah grid, ukuran, atau fungsi.
- Notifikasi push OS mempertahankan judul dan isi payload; tampilan visual native tetap mengikuti sistem operasi.

Pemasangan:
1. Cadangkan file yang sedang aktif di repository GitHub.
2. Ganti index.html dengan file index.html dari paket ini.
3. Ganti sw.js dan README-PWA.txt; pertahankan manifest.webmanifest dan folder icons yang ada.
4. Commit perubahan, lalu tunggu GitHub Pages selesai menerbitkan.
5. Uji pada Android/Chrome: instalasi, tombol update, izin notifikasi, CRUD saat online/offline, serta notifikasi push.

Catatan:
- PWA tidak dapat memberikan izin notifikasi secara otomatis. Pengguna harus menekan Izinkan Notifikasi dan menyetujui dialog resmi Android/Chrome.
- Tampilan notifikasi sistem operasi tidak sepenuhnya dapat dikustomisasi oleh aplikasi web.
- Database, tabel, data pengguna, RLS, dan Edge Function tidak diubah dalam revisi file ini.
