---
title: "Instalasi"
description: "Kebutuhan yang diperlukan Kadupul untuk berjalan, serta urutan penyusunannya."
sidebar:
  order: 2
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini."
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Selesaikan panduan ini sekali, secara berurutan. Setiap langkah diakhiri dengan pemeriksaan. Lakukan pemeriksaan sebelum melanjutkan: setiap kegagalan yang tercantum di sini mudah ditemukan sekarang, tetapi akan memakan biaya besar jika baru ditemukan setelah poller berjalan selama seminggu.

## Hal yang Anda butuhkan terlebih dahulu

Kadupul adalah aplikasi PHP yang menyimpan konfigurasi di MySQL atau MariaDB dan menyimpan pengukuran dalam berkas RRD di disk. Halaman ini menjelaskan instalasi server utama baru dari sumber `main` saat ini, bukan peningkatan versi atau lini LTS yang diarsipkan. Empat hal harus sudah ada sebelum aplikasi ini dapat berjalan.

| Komponen | Mengapa dibutuhkan |
|---|---|
| PHP 8.4 atau lebih baru, pada rilis dengan dukungan keamanan | Menjalankan antarmuka web dan poller |
| MySQL atau MariaDB | Menyimpan perangkat, templat, pengguna, dan cache poller |
| RRDtool | Membuat serta memperbarui arsip round-robin, dan merender grafik |
| net-snmp | Menyediakan alat klien dan pustaka yang digunakan untuk mengueri perangkat |

PHP juga membutuhkan ekstensi yang disyaratkan oleh [manifes aplikasi](https://github.com/kadupulhq/kadupul/blob/main/composer.json), termasuk `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix`, dan `sqlite3`. Pasang ekstensi tersebut untuk runtime baris perintah maupun web. [Persyaratan](/id/reference/requirements/) membedakan antara kebutuhan Composer dan pemeriksaan terpisah milik penginstal.

## Langkah 1: instal runtime

Instal PHP beserta ekstensinya, server basis data Anda, RRDtool, dan net-snmp dari paket distribusi Anda.

**Periksa hasilnya.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` harus mencantumkan ekstensi yang diperlukan. Ekstensi PHP `snmp` bersifat opsional jika alat baris perintah net-snmp tersedia. Composer memeriksa ekstensi yang diperlukannya sendiri selama pemasangan dependensi; penginstal web memiliki pemeriksaan ekstensi terpisah. Mekanisme fallback runtime tidak menghapus persyaratan Composer.

Konfigurasi PHP baris perintah dan server web dapat berbeda. Periksa keduanya. Penginstal merekomendasikan `memory_limit` minimal 400M dan `max_execution_time` minimal 60 detik; penginstal juga menerima nilai tanpa batas (`-1` dan `0`). Nilai di bawah rekomendasi tersebut menghasilkan peringatan, sedangkan `date.timezone` yang hilang merupakan kesalahan. Atur zona waktu eksplisit, seperti `UTC`, dan gunakan `php --ini` untuk mengidentifikasi konfigurasi baris perintah.

## Langkah 2: buat basis data dan penggunanya

Buat satu basis data kosong, dan satu pengguna dengan hak akses ke basis data tersebut. Untuk basis data lokal, jalankan perintah SQL ini sebagai administrator basis data, ganti contoh kata sandi sebelum penggunaan:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Gunakan host akun basis data yang cocok jika PHP terhubung dari mesin lain.

Server basis data juga membutuhkan tabel zona waktu yang terisi, dan pengguna Kadupul membutuhkan akses baca ke tabel tersebut di dalam basis data `mysql`. Itu adalah satu-satunya izin di luar skemanya sendiri. Tidak ada indikasi bawaan dari sebuah sistem pemantauan yang menyarankan hal ini, dan ini bukan hal yang opsional; pemeriksaan di bawah ini akan gagal tanpanya.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Periksa hasilnya.** Masuk sebagai pengguna basis data Kadupul dan jalankan:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Jumlah bukan nol yang dikembalikan tanpa kesalahan izin adalah hasil yang diharapkan. Nilai nol berarti tabel belum pernah dimuat; pesan kesalahan berarti pengguna tidak dapat membacanya. Keduanya menghentikan penginstal.

Empat pengaturan dari server itu sendiri cukup penting untuk diperbaiki sekarang.

| Pengaturan | Diinginkan | Alasan |
|---|---|---|
| `max_allowed_packet` | 16M atau lebih | Sinkronisasi besar antara server utama dan pengumpul jarak jauh |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Deskripsi perangkat memuat karakter multi-bita |
| `innodb_file_per_table` | On | Menjaga ruang tabel tetap terpisah dan mudah dikelola |
| `innodb_buffer_pool_size` | Sekitar seperempat dari memori sistem | Menjaga working set tetap berada di dalam memori |

Penginstal melaporkan pembacaannya sendiri terhadap pengaturan ini dan menandai apa yang kurang, sehingga Anda tidak perlu menerima tabel ini begitu saja. Dokumen [Penyetelan kinerja basis data](/id/guides/tune-database-performance/) membahas lebih jauh setelah Anda memiliki beban kerja.

## Langkah 3: buka paket, perbaiki kepemilikan, dan sajikan

Tempatkan aplikasi di lokasi yang dapat disajikan oleh server web Anda, lalu putuskan pengguna sistem mana yang memilikinya. Keputusan tersebut lebih penting daripada lokasinya. Dua proses menulis di sini: server web, dan apa pun yang menjadwalkan poller. Jalankan keduanya sebagai pengguna yang sama. Jalankan poller tanpa hak istimewa dan berikan kedua proses akses yang mereka butuhkan. Kepemilikan atau mode izin yang salah dapat mencegah pembaruan nantinya bahkan saat grafik berhasil dirender.

### Jika Anda mengkloning repositori alih-alih mengekstrak rilis

Checkout Git membutuhkan dependensi PHP sekaligus aset peramban yang dihasilkan. Dengan runtime `mise.toml` dari repositori yang terpasang, jalankan dari akar repositori:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer mengisi `include/vendor/` dan memulihkan berkas kompatibilitas yang disematkan. Build npm membuat aset di bawah `include/js/`, `include/fa/`, dan `include/vendor/flag-icons/`. Composer saja tidak cukup untuk instalasi dari kode sumber.

Bundel offline dengan dependensi lengkap adalah artefak build terpisah. Arsip sumber GitHub generik bukanlah bundel tersebut. Ikuti [prosedur build dan verifikasi offline](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) ketika host target tidak memiliki akses internet.

Siapkan jalur yang dapat ditulis setelah memasang dependensi:

| Grup | Direktori | Dapat ditulis saat |
|---|---|---|
| Selama instalasi | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Hanya saat menginstal atau meningkatkan versi |
| Selama instalasi | `include/vendor/csrf/`, atau lokasi `path_csrf_secret` yang dikonfigurasi | Penginstal harus membuat rahasia khusus instalasi; pertahankan setelahnya |
| Selalu | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, direktori sementara sistem | Selama masa pakai instalasi |
| Runtime Symfony | `var/cache`, dan `var/log` jika pencatatan berkas dikonfigurasi | Untuk runtime PHP dan pengguna cache-warming |

Direktori RRD juga harus dapat ditulis selama masa pakai instalasi. Direktori ini menyimpan riwayat Anda, jadi berikan perhatian seperti yang Anda berikan pada direktori basis data.

Migrasi saat ini masih membutuhkan rute login lama, penginstal, dan plugin. Untuk instalasi gabungan ini, sajikan akar repositori dengan aturan eksplisit yang menolak akses ke direktori privat, konfigurasi, dependensi, dan status runtime. Jangan alihkan seluruh instalasi ke `public/`: hal itu akan menghapus rute lama yang masih digunakan. Titik akhir terpisah Symfony memiliki perutean berbeda; lihat [petunjuk migrasi](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Untuk Nginx, mulailah dari [aturan lokasi Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) repositori, menyesuaikan akar dan upstream PHP-FPM. Pertahankan aturan penolakan sebelum penanganan generik PHP dan pertahankan PATH_INFO untuk `/app.php/...`. Nginx tidak membaca `.htaccess`. Jaga agar berkas RRD, log, dan rahasia tidak dapat diakses melalui HTTP; verifikasi konfigurasi server aktual alih-alih berasumsi izin berkas mencegah penyajiannya.

**Periksa hasilnya.** Beralihlah menjadi pengguna poller, tulis sebuah berkas ke dalam setiap direktori grup-selalu, lalu hapus berkas tersebut. Izin yang tampak benar di `ls -l` masih dapat ditolak oleh SELinux atau AppArmor, dan menulis berkas adalah satu-satunya pemeriksaan yang memastikannya. Kemudian minta sebuah berkas di bawah direktori log melalui HTTP. Anda mengharapkan respons penolakan.

## Langkah 4: tulis berkas konfigurasi

Untuk instalasi baru, salin berkas konfigurasi yang disediakan:

```bash
cp include/config.php.dist include/config.php
```

Jangan menimpa konfigurasi instalasi yang sudah ada. Atur host, nama, pengguna, dan kata sandi basis data dari langkah 2. Dua nilai lain penting pada instalasi pertama: `url_path`, jalur tempat aplikasi disajikan dengan garis miring di awal dan di akhir, serta `poller_id`, yang bernilai `1` pada server utama dan nilai lain hanya pada pengumpul jarak jauh.

Biarkan blok pengumpul jarak jauh tetap dikomentari. Anda belum membangunnya sekarang; dokumen [Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/) membahasnya saat Anda siap. Setiap pengaturan lain memiliki nilai bawaan yang berfungsi, jadi bacalah [Konfigurasi](/id/reference/configuration/) sebelum mengubah salah satunya.

Konfigurasikan `APP_SECRET` khusus penerapan di lingkungan proses PHP untuk fitur Symfony yang menggunakannya. Bootstrap menetapkan nilai bawaan `APP_ENV=prod` dan `APP_DEBUG=0` serta tidak memuat berkas `.env`. Ini terpisah dari rahasia CSRF penginstal lama.

**Periksa hasilnya.** Periksa sintaksis tanpa menampilkan kredensial:

```bash
php -l include/config.php
```

Impor skema pada langkah berikutnya sebelum membuka penginstal di peramban.

## Langkah 5: impor skema

Penginstal mengharapkan tabel sudah ada sebelumnya. Muat skema yang disertakan ke dalam basis data yang Anda buat:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Lakukan ini sekali, terhadap basis data kosong. Ini bukan skrip peningkatan versi; mengimpornya ke dalam basis data yang sudah terisi dapat gagal atau meninggalkan data yang bertentangan dan tidak lengkap.

## Langkah 6: jalankan penginstal

Buka situs di peramban dan selesaikan langkah-langkahnya. Penginstal menelusuri urutan tetap, dan setiap langkah menjadi prasyarat langkah berikutnya:

1. Sambutan dan lisensi.
2. Pemeriksaan dependensi: versi dan ekstensi PHP, pengaturan PHP dari langkah 1 untuk baris perintah maupun server web, tabel zona waktu, dan pengaturan basis data dari langkah 2. Pesan kesalahan memblokir tombol berikutnya. Peringatan tidak memblokir, tetapi bacalah.
3. Jenis instalasi: server utama baru, atau pengumpul jarak jauh.
4. Pemeriksaan izin: direktori dari langkah 3, diuji dengan menulis ke dalamnya.
5. Lokasi biner: jalur ke PHP, RRDtool, dan alat net-snmp.
6. Profil sumber data dan interval peluncur.
7. Pemilihan templat: templat perangkat mana yang akan dimuat.
8. Konversi tabel, konfirmasi, dan instalasi itu sendiri.

Butir 6 dalam daftar tersebut adalah hal yang sulit diubah nantinya. Profil yang Anda pilih menentukan step dan kumpulan arsip yang ditulis ke dalam setiap berkas RRD yang dibuat setelahnya, dan menyunting profil tidak memigrasikan berkas yang sudah ada. Perubahan retensi membutuhkan migrasi terpisah yang teruji; tindakan tersebut tidak selalu mengharuskan pembuangan riwayat data. Jika nilai puncak penting, pastikan profil mempertahankan nilai maksimum dan bukan hanya rata-rata: bacalah [Sumber data dan arsip round-robin](/id/concepts/data-sources-and-rras/) sebelum mengeklik melewatinya. Interval peluncur yang ditawarkan di sana adalah satu menit atau lima menit. Profil sumber data menentukan interval pengumpulan; peluncur dan profil harus dikonfigurasi secara konsisten.

## Langkah 7: ubah kredensial bawaan

Skema bawaan menyediakan akun administrator bernama `admin` dengan kata sandi `admin`, yang ditandai sehingga login pertama memaksa perubahan. Skema ini juga menyertakan akun tamu yang dinonaktifkan. Ubahlah kata sandi sebelum instans dapat dijangkau oleh orang lain, yang berarti sebelum Anda menghubungkannya ke jaringan yang dapat dirutekan oleh pihak lain.

## Langkah 8: jadwalkan poller

Poller harus dimulai dari luar. Konfigurasikan interval pengumpulan dan interval peluncurnya secara konsisten; poller mendukung interval peluncur satu menit atau lima menit dan memiliki pelindung terhadap proses biasa yang tiba terlalu dini. Untuk peluncur satu menit, pasang entri ini di crontab pengguna poller tanpa hak istimewa, mengganti `php` dan jalur aplikasi dengan jalur absolutnya:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

atau jalankan daemon `cactid.php` yang disediakan menggunakan `service/cactid.service`, yang disesuaikan dengan jalur instalasi dan pengguna tanpa hak istimewa Anda. Gunakan satu peluncur: nonaktifkan cron job atau timer saat menggunakan daemon.

Sesuaikan jadwal aktual dengan interval peluncur yang dikonfigurasi. Untuk profil pengumpulan kurang dari satu menit, poller yang diluncurkan menjalankan siklus pengumpulan di dalam interval tersebut; jangan mencoba mengekspresikan irama sub-menit dengan entri cron ini.

**Periksa hasilnya.** Jalankan satu siklus secara manual sebagai pengguna poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` melewati pelindung waktu proses yang terlalu dini. Gunakan pemeriksaan manual ini dengan penjadwal dihentikan agar tidak tumpang tindih dengan jadwal yang berjalan. Pemeriksaan ini tidak melewati pemeliharaan lain atau pemeriksaan keamanan. Anda mengharapkan penyelesaian yang bersih dengan baris ringkasan. Kemudian aktifkan penjadwal dan biarkan selama dua interval; pastikan eksekusi lain berjalan lancar tanpa Anda.

## Masalah yang mungkin terjadi

Berikut adalah kegagalan yang umumnya dialami pada instalasi pertama.

| Gejala | Penyebab | Tempat memeriksa |
|---|---|---|
| Penginstal terhenti pada pengaturan PHP yang tampak benar | Server web dan baris perintah membaca berkas `php.ini` yang berbeda | `php --ini`, dan berkas yang dilaporkan oleh SAPI web |
| Penginstal terhenti pada zona waktu | Tabel zona waktu belum dimuat, atau pengguna Kadupul tidak dapat membacanya | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Langkah izin gagal pada direktori yang terlihat dapat ditulis | Pemilik salah, atau SELinux dan AppArmor | Tulis berkas sebagai pengguna poller |
| Instalasi selesai, tidak ada data yang masuk | Poller tidak pernah dijadwalkan | Jalankan `poller.php --force --debug` secara manual |
| Data muncul beberapa siklus, kemudian terhenti | Poller berjalan sebagai pengguna yang salah, meninggalkan berkas yang tidak dapat diperbarui pengguna web | Pemilik berkas di dalam direktori RRD |
| Grafik penuh dengan celah kecil | Interval terjadwal dan interval yang dikonfigurasi tidak sesuai | Crontab, bandingkan dengan interval yang dikonfigurasi |
| Composer menolak instalasi | PHP di bawah 8.4 atau ekstensi yang disyaratkan manifes hilang | `php -v`, `php -m`, dan output kesalahan Composer |
| Poller tidak dapat menjalankan lebih dari satu proses | `pcntl` atau `posix` hilang | `php -m` |

Dokumen [Pencatatan log](/id/reference/logging/) membahas tempat masing-masing mencatat aktivitasnya. Dokumen [Mengatasi masalah data yang hilang](/id/guides/troubleshoot-missing-data/) membahas kasus ketika instalasi berjalan baik tetapi satu perangkat bermasalah.

## Sebelum Anda mengeksposnya

Poller berjalan sebagai pengguna sistem dan mengeksekusi RRDtool serta skrip pengumpulan Anda. Perlakukan instalasi ini sebagai sesuatu yang menjalankan perintah sistem, karena memang demikian adanya.

- Sajikan melalui TLS.
- Jangan biarkan kata sandi administrator bawaan tetap digunakan, bahkan untuk sesaat pun.
- Batasi pengguna basis data hanya pada basis datanya sendiri.
- Jauhkan direktori RRD dan log dari akar dokumen.
- Biarkan akun tamu tetap dinonaktifkan kecuali Anda memutuskan sebaliknya.

Dokumen [Mengamankan instalasi yang menghadap internet](/id/guides/secure-an-internet-facing-install/) memuat panduan selebihnya. Berikutnya: [Tambahkan perangkat pertama](/id/start/first-device/).
