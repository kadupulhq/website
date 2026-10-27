---
title: "Memasang di FreeBSD"
description: "Siapkan layanan FreeBSD, ekstensi PHP, dan penyimpanan lokal untuk evaluasi terisolasi."
banner:
  content: "Kadupul masih pra-alfa. Prosedur platform ini belum divalidasi dari awal hingga akhir. Draf terjemahan menunggu tinjauan bahasa."
---

## Pilih dan siapkan host

Gunakan rilis dalam tabel FreeBSD yang didukung dan rencanakan peningkatannya hingga 2027. Dukungan OS tidak membuktikan kompatibilitas Kadupul. Instal PHP 8.4+, MySQL atau MariaDB, RRDtool, Net-SNMP, dan server web menurut buku Packages and Ports. Bawaan `php84-extensions` bukan seluruh daftar ekstensi aplikasi; instal modul yang kurang, termasuk `pcntl` untuk CLI, sebelum dependensi.

## Periksa runtime dan atur layanan

Periksa interpreter CLI serta alat terpilih:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Periksa PHP web terpisah. Untuk paket PHP-FPM, atur pool dan koneksi server web sebelum mengaktifkan `php_fpm`. FreeBSD memakai layanan rc, bukan systemd; ikuti buku layanan. Ikuti instalasi untuk basis data, konfigurasi, skema, dan aset browser. Cocokkan alat dengan `mise.toml` aplikasi; versi yang dipatok tidak membuktikan pemasang runtime mise berfungsi pada FreeBSD.

## Jadwalkan dan verifikasi sebagai akun layanan

Gunakan satu peluncur cron dengan jalur absolut dan interval terkonfigurasi; jangan instal unit systemd Linux. Validasi identitas POSIX, kunci direktori, kepemilikan, dan kepercayaan UID/GID eksplisit sebagai setiap akun web/poller sebelum pengumpulan. Untuk jail, periksa jaringan, mount, dan izin di dalam jail. Jalankan satu siklus tanpa tumpang tindih, periksa baris antrean yang dipertahankan dan waktu grafik, lalu latih pemulihan cadangan konsisten. Proses yang berhasil mulai belum cukup. Lihat persyaratan dan cadangan.

[Rilis FreeBSD didukung](https://www.freebsd.org/security/) · [Packages dan Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Layanan FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Instalasi](/id/start/install/) · [Persyaratan](/id/reference/requirements/) · [Cadangan](/id/guides/back-up-and-restore/)

Dasar aplikasi diperiksa pada 26 Oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
