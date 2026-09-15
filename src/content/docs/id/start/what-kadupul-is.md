---
title: "Apa itu Kadupul"
description: "Ambil pengukuran dari perangkat melalui SNMP dan skrip, simpan dalam berkas RRD, lalu buat grafik."
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Kode tersedia, tetapi belum ada rilis yang didukung untuk produksi atau jalur migrasi yang tervalidasi. Jangan gunakan dalam lingkungan produksi."
---

Kadupul adalah proyek turunan independen dari Cacti. Perangkat diperiksa secara berkala dan RRDtool digunakan untuk menyimpan serta menampilkan pengukuran.

Halaman ini merupakan ringkasan. Baca halaman lengkap dalam bahasa Inggris untuk perinciannya. [English](/start/what-kadupul-is/)

## Apa itu Kadupul

PHP menyediakan antarmuka dan pemasang. MySQL atau MariaDB menyimpan konfigurasi, pengguna, dan cache pengumpul. Berkas RRD menyimpan pengukuran sesuai masa retensi dan aturan konsolidasi yang dikonfigurasi, bukan semua data selamanya. Skrip pengumpulan berjalan dengan izin akun sistemnya.

## Mulai di sini

Mulailah dengan instalasi uji yang terisolasi, tambahkan perangkat, dan pastikan data diterima sebelum membaca grafik. Simpan cadangan dan uji pemulihannya.

- [Instalasi](/id/start/install/)
- [Tambahkan perangkat pertama](/id/start/first-device/)
- [Baca grafik pertama](/id/start/first-graph/)
