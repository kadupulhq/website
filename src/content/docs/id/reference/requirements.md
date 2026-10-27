---
title: "Persyaratan"
description: "Persyaratan runtime, penyimpanan, dan penerapan untuk perencanaan 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini."
---

Diperiksa pada 26 Oktober 2026 terhadap revisi aplikasi yang ditautkan di bawah. Acuan ini untuk perencanaan 2026–2027; bukan komitmen rilis atau dukungan.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Runtime

`main` memerlukan PHP 8.4 atau lebih baru dan menggabungkan Symfony 7.4 dengan titik masuk lama. Jalur `lts/1.2` memiliki persyaratan tersendiri. Instal MySQL atau MariaDB, RRDtool, dan kolektor PHP atau build Spine yang kompatibel. Untuk build dari kode sumber, gunakan versi dalam `mise.toml` melalui `mise exec`; instal dependensi yang dikunci tanpa memperbaruinya.

## PHP

Manifes memerlukan ekstensi berikut selain PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Penginstal memeriksa secara terpisah antara lain `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard`, dan `zlib`. Pada Unix, penginstal memeriksa `posix` dan `pcntl` untuk CLI; pada Windows, `com_dotnet`. Lolos penginstal tidak membuktikan bahwa persyaratan Composer terpenuhi. Periksa PHP CLI dan web secara terpisah. Atur `date.timezone`; penginstal menyarankan `memory_limit=400M` dan `max_execution_time=60`, atau nilai tanpa batas. Ekstensi opsional `snmp` memungkinkan kueri dalam proses; `gettext` mengaktifkan katalog terjemahan.

## Basis data

Gunakan rilis MySQL atau MariaDB yang dipelihara vendornya dan validasi dengan revisi tujuan. Ambang lama penginstal untuk MySQL 5.6 dan MariaDB 10.0 tidak membuktikan dukungan 2026–2027. Pada `main`, `poller_output`, `poller_output_boost`, dan `poller_output_realtime` menggunakan InnoDB; beberapa tabel koordinasi masih menggunakan MEMORY. Jangan konversi semua tabel ke satu mesin. Isi `mysql.time_zone_name` dan berikan akun aplikasi akses SELECT ke tabel itu.

## RRDtool

Konfigurasikan jalur absolut berkas yang dapat dieksekusi dan samakan versi yang dikonfigurasi dengan versi terpasang. `DCOUNTER` dan `DDERIVE` memerlukan RRDtool 1.5 atau lebih baru. Penyimpanan lokal Unix memerlukan pemeriksaan identitas POSIX dan `flock` direktori yang berfungsi. Hentikan proses penulisan eksternal dan daemon cache sebelum pemeliharaan eksklusif. Jalur proxy lama tersedia, tetapi bukan jaminan penerapan yang tervalidasi.

## net-snmp

Instal alat Net-SNMP jika PHP `snmp` tidak tersedia atau dinonaktifkan. Atur `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk`, dan `path_snmptrap` ke jalur program masing-masing. Uji jalur yang dipilih dengan versi SNMP perangkat, termasuk SNMPv3 melalui IPv6 bila sesuai; penginstal lama tidak menyarankan PHP `snmp` untuk kombinasi itu.

## Server web

Jalankan PHP melalui runtime web yang dikonfigurasi dan gunakan TLS. Pertahankan rute lama bersama `/app.php/...`; jangan pindahkan seluruh akar dokumen ke `public/` selama halaman lama masih diperlukan. Konfigurasikan PATH_INFO untuk titik masuk kompatibilitas. Nginx mengabaikan `.htaccess`; terapkan aturan penolakan eksplisit untuk kode sumber, konfigurasi, dependensi, alat, pengujian, rahasia, dan status runtime sebelum penanganan PHP. Sesuaikan awalan URL dengan `$url_path`.

## Penjadwal

Gunakan satu mekanisme peluncuran: cron, Task Scheduler, atau layanan daemon kolektor yang disertakan. Sesuaikan frekuensinya dengan interval peluncuran yang dikonfigurasi. Pengumpulan dengan interval kurang dari satu menit berjalan di dalam interval tersebut; cron saja tidak menyediakan jadwal seperti itu. Jalankan pemeriksaan sebagai akun poller dengan peluncur rutin dihentikan agar tidak tumpang tindih.

## Sistem berkas

Berikan akses ke jalur RRD efektif, log, cache, dan direktori runtime Symfony hanya kepada akun yang memerlukan. Direktori RRD bawaan adalah `rra/`. Akun Unix web/poller yang terpisah memerlukan ID numerik eksplisit dalam `rrd_maintenance_trusted_uids` dan, untuk grup yang dapat menulis, `rrd_maintenance_trusted_gids`, di `include/config.php`. Semua anggota grup tersebut harus tepercaya. Izin biasa tetap berlaku; penyimpanan yang dapat ditulis semua orang ditolak. Gunakan pengaturan kepercayaan yang sama pada semua proses penulisan dan periksa kedua akun sebelum peningkatan versi.

## Hak istimewa

Jalankan proses web dan poller dengan akun khusus tanpa hak istimewa. ICMP mentah memerlukan hak sistem operasi tambahan; gunakan pemeriksaan TCP, UDP, atau SNMP bila hak itu tidak tersedia. Jangan jalankan seluruh aplikasi sebagai root untuk mengaktifkan ping. Windows belum memiliki validasi ACL yang diperlukan untuk pemeliharaan destruktif RRD lokal; pembaruan biasa menggunakan konfirmasi sinkron RRDtool. Bukti throughput Unix tidak memvalidasi kapasitas Windows.

## Tentang versi PHP

Untuk perencanaan 2026–2027, PHP 8.4 mendapat dukungan aktif hingga 31 Desember 2026 dan perbaikan keamanan hingga 31 Desember 2028. PHP 8.5 mendapat dukungan aktif hingga 31 Desember 2027 dan perbaikan keamanan hingga 31 Desember 2029. Ini adalah tanggal proyek PHP, bukan matriks kompatibilitas Kadupul. Uji runtime baru dengan dependensi terkunci sebelum mengadopsinya. Versi minimum PHP Symfony yang lebih rendah tidak menurunkan batas minimum 8.4 Kadupul. Periksa kembali jadwal resmi dan revisi tujuan sebelum penerapan.

[Penyetelan basis data](/id/guides/tune-database-performance/) · [Integrasi RRDtool](/id/reference/rrdtool-integration/) · [SNMP](/id/reference/snmp/) · [Tata letak berkas](/id/reference/file-layout/) · [Instalasi](/id/start/install/) · [Prasyarat peningkatan penyimpanan](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versi PHP yang didukung](https://www.php.net/supported-versions.php)
