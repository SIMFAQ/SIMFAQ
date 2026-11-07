PAKET PWA SIMFAQ - DRAFT V543

Isi paket:
- index.html: aplikasi satu file HTML dengan metadata PWA dan registrasi Service Worker.
- manifest.webmanifest: identitas dan pengaturan instalasi PWA.
- sw.js: Service Worker untuk navigasi offline terbatas dan notifikasi push.
- offline.html: halaman informasi ketika halaman aplikasi belum pernah tersimpan dan jaringan terputus.
- icons/: ikon 192x192 dan 512x512, standar dan maskable, dibuat dari logo yang diunggah pengguna.

Pemasangan GitHub Pages:
1. Cadangkan index.html yang saat ini aktif.
2. Unggah/replace index.html dan tambahkan manifest.webmanifest, sw.js, offline.html, serta folder icons/ pada folder publik yang sama (root repo SIMFAQ).
3. Pastikan GitHub Pages melayani URL /SIMFAQ/ melalui HTTPS.
4. Buka https://simfaq.github.io/SIMFAQ/ dan uji DevTools > Application > Manifest dan Service Workers.
5. Uji login, modul, cetak, upload foto, push notification, logout, dan mode offline sebelum menyatakan siap produksi.

Batasan penting:
- Aplikasi SIMFAQ tetap memerlukan internet untuk Supabase, autentikasi, database, Storage, dan Realtime. Cache navigasi hanya menyimpan dokumen HTML aplikasi; ini bukan mode offline penuh.
- Service Worker tidak mencegat API Supabase atau CDN pihak ketiga.
- Push notification memerlukan izin browser, subscription, dan backend push yang valid.
- Ini paket draft; belum dipublikasikan ke GitHub dan belum diuji langsung di perangkat/browser produksi.
- Logo asli di Supabase tidak diubah.
