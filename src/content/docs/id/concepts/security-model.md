---
title: Model keamanan
description: Di mana data yang tidak tepercaya memasuki Kadupul, proses mana yang berjalan dengan hak istimewa apa, apa yang dapat dilakukan akun database, dan batas mana yang diberlakukan kode daripada diasumsikan.
banner:
  content: Kadupul berada dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian terisolasi.
sidebar:
  order: 12
---

Sistem pemantauan adalah hal yang canggung untuk dipertahankan, karena tiga alasan yang tidak ada
hubungannya dengan kualitas kode.

Sistem ini menyimpan kredensial untuk semua yang dipantaunya. Komunitas SNMP, nama pengguna dan frasa
sandi v3, serta apa pun yang dibutuhkan perangkat disimpan sehingga poller dapat menggunakannya tanpa
pengawasan. Tidak ada manusia yang mengetikkannya setiap lima menit.

Sistem ini menjalankan perintah sesuai jadwal. Mengumpulkan nilai yang tidak diekspos SNMP berarti
menjalankan skrip, dan definisi skrip tersebut adalah konfigurasi, disimpan dalam database dan dapat
diedit melalui antarmuka.

Sistem ini memproses data yang dihasilkan mesin yang dipantaunya. Deskripsi antarmuka, titik mount disk,
nama sensor: semuanya berasal dari perangkat, dan semuanya berakhir di database, di judul grafik, dan
dalam argumen yang diserahkan ke program lain. Sakelar (switch) yang disusupi adalah sumber input, bukan
hanya korban.

Tak satu pun dari ini adalah cacat. Ini adalah tuntutan pekerjaan. Berikut adalah tempat di mana
masing-masing mendarat dalam arsitektur.

## Di mana input yang tidak tepercaya masuk

Empat titik masuk, dalam urutan perkiraan seberapa besar operator mengendalikannya.

| Titik masuk | Sumber | Ke mana tujuannya |
|---|---|---|
| Parameter HTTP | Siapa pun yang dapat mencapai server web | Database, output halaman, dan SQL |
| Nilai SNMP | Perangkat yang dipolling | `host_snmp_cache`, judul grafik, batas RRD, argumen skrip |
| Output skrip | Skrip lokal, atau apa pun yang diajak berkomunikasi | `poller_output`, lalu file RRD |
| Templat dan paket yang diunggah | Siapa pun yang memegang ranah impor | Baris templat, dan untuk paket, file di disk |

### Parameter HTTP

Pembantu permintaan berada di `lib/html_utility.php`. `get_filter_request_var()` secara default
melakukan validasi bilangan bulat, tetapi juga memiliki kasus khusus untuk nilai kosong, tidak
terdefinisi, dan regex. Pemanggil masih perlu memeriksa apakah suatu nilai diperlukan dan sesuai untuk
operasi tersebut. Pemfilteran tidak menetapkan otorisasi.

`set_request_var()` menyimpan nilai dalam cache di `$_CACTI_REQUEST` dan mencerminkannya ke dalam
array permintaan. `get_nfilter_request_var()` membaca cache tersebut atau permintaan mentah dan tidak
memvalidasi atau menulis nilai itu sendiri. Pembacaan selanjutnya dapat melihat nilai yang disimpan
sebelumnya, dan urutan pembacaan sangat penting.

Dengan `log_validation` diaktifkan, `get_request_var()` mencatat pembacaan permintaan tertentu yang
tidak di-cache. Pembacaan superglobal langsung dan `get_nfilter_request_var()` tidak semuanya tercakup.
Ini adalah bantuan diagnostik, bukan audit atau penegakan validasi lengkap.

### Nilai SNMP

Penemuan kueri data menyimpan nilai terindeks yang dipilih di `host_snmp_cache`; hasil polling SNMP
biasa mengikuti jalur sampel. `data_query_format_record()` di `lib/data_query.php` menerapkan dua
transformasi sebelum penyimpanan: peta opsional `rewrite_value` dari definisi kueri, dan `bin2hex()`
pada nilai apa pun yang pengkodeannya tidak dapat diidentifikasi oleh `mb_detect_encoding()`. Yang
kedua itu adalah perlindungan terhadap string oktet biner, bukan terhadap konten berbahaya.

Dari sana nilai tersebut bergerak. Nilai memberi nama grafik melalui `substitute_snmp_query_data()`.
Nilai dapat menetapkan maksimum RRD, karena templat data dapat mendeklarasikan batas maksimumnya sebagai
`|query_ifSpeed|`. Nilai menjadi argumen untuk kueri skrip, di mana `get_script_query_path()`
meneruskan setiap bagian melalui `cacti_escapeshellarg()` terlebih dahulu.

Pelepasan karakter (escaping) dan validator RRDtool yang dijelaskan dalam
[Integrasi RRDtool](/id/reference/rrdtool-integration/) adalah batas di sini. Data perangkat harus tetap
diperlakukan sebagai tidak tepercaya. Validasi dan pelepasan karakter adalah properti dari setiap titik
panggilan; keberadaan fungsi pembantu bukan bukti bahwa setiap konsumen menggunakannya dengan benar.
Periksa struktur perintah dan argumen yang disubstitusikan.

### Output skrip

Cabang `popen()` dari `exec_poll()` membaca dengan `fgets(..., 8192)`, mengembalikan paling banyak
8.191 byte atau baris baru pertama. Fallback `shell_exec()`-nya memiliki perilaku output yang berbeda,
dan pengumpulan server skrip mengikuti jalur lain.

`prepare_validate_result()` mengenali nilai numerik dan tidak diketahui, bentuk heksadesimal, dan
beberapa struktur output multi-bidang. Fungsi ini juga dapat menghapus teks untuk mendapatkan nilai
numerik; ini bukan filter skalar ketat yang universal. Penguraian selanjutnya dan validasi RRDtool juga
penting. Lihat [Metode input data](/id/reference/data-input-methods/).

Pemeriksaan output tidak membatasi skrip yang telah dieksekusi di dalam sandbox. Tinjau perintah, daftar
putih input, dan hak istimewa sistem operasi sebelum mengaktifkan pengumpulan.

### Templat dan paket

Dua mekanisme berbeda berbagi satu ranah.

**Impor templat** adalah XML biasa tanpa tanda tangan. Ini membuat templat, kueri data, dan metode
input data. Metode input data adalah baris perintah, jadi ini adalah jalur dari file yang diunggah ke
sesuatu yang akan dieksekusi poller. `lib/import.php` menjalankan `cacti_input_string_is_safe()`
pada setiap `input_string` yang diimpor dan menolak metode tersebut jika mengandung karakter meta
shell, dengan mencatat:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

**Impor paket** ditandatangani. `import_read_package_data()` membaca kunci publik yang disematkan
pada paket dan membandingkannya dengan tiga kunci yang dikompilasi ke dalam `lib/import.php`: dua
kunci Cacti dan kunci Kadupul. Kunci lainnya akan gagal. Paket tanpa elemen `<publickey>` dibaca
sebagai mengklaim kunci Cacti yang lebih lama, dan kemudian harus menghasilkan tanda tangan yang
terverifikasi terhadap kunci tersebut. `import_read_package_data()` menolak kunci apa pun di bawah
2048 bit sebelum mencoba verifikasi, yang mana kunci lama (pada 512 bit) tidak memenuhi syarat. Setiap
file yang ada membawa tanda tangannya sendiri, yang diverifikasi secara terpisah.

Paket kemudian dapat menulis file yang dipilih. Nama yang diterima dimulai dengan `scripts/` atau
`resource/`, secara opsional di bawah awalan `plugins/<name>/` yang valid. Pengimpor menolak byte
NUL, traversal direktori, dan jalur absolut serta memverifikasi penahanan di bawah akar instalasi; hanya
berisi nama direktori saja tidak cukup. Izin tulis tujuan juga mengontrol apakah penulisan berhasil.
Paket yang lolos verifikasi dengan sengaja menulis PHP yang dapat dieksekusi ke dalam pohon instalasi.
Verifikasi tanda tangan menetapkan identitas penandatanganan dan integritas yang diterima, bukan bahwa
kodenya tidak berbahaya. Otorisasi ranah, penahanan jalur, file yang dipilih, izin sistem file, dan
kebijakan daftar putih perintah juga penting.

Kedua mekanisme berada di balik ranah 17. Peran standar Editor Templat memegang ranah 17 dan ranah 2
(Metode Input Data). Akun dengan izin tersebut dapat menentukan perintah pengumpulan, tunduk pada
validasi dan penanganan daftar putih. Itulah tujuan peran tersebut, dan ada baiknya diketahui sebelum
memberikannya. Lihat [Mengimpor dan mengekspor templat](/id/guides/import-and-export-templates/) untuk
alur kerja yang divalidasi dan batasan yang diketahui.

## Apa yang berjalan dengan hak istimewa apa

| Proses | Dimulai oleh | Berjalan sebagai | Pekerjaan |
|---|---|---|---|
| Antarmuka web | Server web | Pengguna server web | Membaca dan menulis database, merender grafik melalui RRDtool, menulis file RRD sesuai permintaan, menulis file paket selama impor |
| `poller.php` | Penjadwal atau layanan | Akun layanan/penjadwal | Membaca cache poller, meluncurkan kolektor, menulis file RRD |
| `cmd.php` | Poller atau jalur pengumpulan waktu nyata | Akun peluncur | Melakukan SNMP get dan perintah pengumpulan |
| `script_server.php` | Kolektor | Akun peluncur | Menyertakan file PHP dan memanggil fungsi dalam prosesnya sendiri |
| RRDtool | Proses web atau poller | Mana yang memanggilnya | Membaca dan menulis file di bawah `rra/` |

Dua di antaranya perlu dilihat lebih dekat:

**Server skrip bukan sandbox.** Ini menyertakan file target ke dalam proses PHP yang berjalan lama dan
memanggil fungsi di dalamnya. Fungsi tersebut berbagi proses, memori, dan koneksi databasenya.
Pemeriksaan di `script_server.php` memutuskan apakah panggilan terjadi: `realpath()` dari file yang
disertakan harus diselesaikan di bawah `$config['base_path']` atau `$config['scripts_path']`, fungsi
harus ada setelah disertakan, `ReflectionFunction::isInternal()` harus false, dan file yang
mendefinisikan fungsi juga harus berada di bawah akar yang diizinkan. Setelah lolos, kode berjalan
dengan hak istimewa penuh poller. Metode Server Skrip adalah cara menjalankan PHP di dalam Kadupul,
bukan cara menjalankan PHP di sebelahnya.

**Proses web dapat menulis file RRD.** Permintaan grafik dapat memicu pembaruan Boost sesuai permintaan
dan pembuatan file. Peringatan yang menunda pembuatan satu direktori ke poller tidak membuat akses tulis
web menjadi sepenuhnya opsional. Pemeriksaan awal penyimpanan dan koordinasi pemeliharaan juga memeriksa
akses akun dan konfigurasi UID/GID numerik tepercaya. Pembuatan yang dijalankan sebagai root mencoba
mencocokkan kepemilikan penyimpanan, tetapi kegagalan dapat dicatat dalam log. Lihat
[Meningkatkan dengan aman](/id/guides/upgrade-safely/).

Akun web dan poller terjadwal dapat berbeda. Pengumpulan waktu nyata yang diluncurkan dari permintaan
web dapat mewarisi akun web, sehingga eksekusi perintah tidak dibatasi pada identitas poller terjadwal.
Integrasi Spine yang diwarisi memerlukan validasi terpisah terhadap biner aktual; halaman ini tidak
menetapkan build yang didukung.

## Apa yang dibutuhkan akun database

Proses yang menggunakan konfigurasi database yang sama biasanya berbagi akunnya. Kolektor jarak jauh
dapat memiliki kredensial lokal dan pusat yang terpisah; konfigurasi khusus penerapan mungkin berbeda.
Periksa izin aktual untuk setiap akun yang dikonfigurasi.

| Persyaratan | Alasan |
|---|---|
| DML penuh pada skema Kadupul | Operasi biasa |
| DDL pada skema Kadupul | Peningkatan dan operasi runtime seperti rotasi tabel Boost, tabel sementara, dan perubahan siklus hidup plugin |
| `SELECT` pada `mysql.time_zone_name` | Daftar zona waktu situs dan kolektor data membaca tabel itu secara langsung |

Jangan menghapus hak istimewa DDL dengan asumsi bahwa hanya peningkatan yang membutuhkannya. Aplikasi
tidak secara universal beralih ke identitas migrasi terpisah; pemisahan akun memerlukan validasi khusus
penerapan dari semua jalur runtime yang terpengaruh.

`include/config.php` berisi kredensial database dan kolektor jarak jauh juga dapat menyimpan kredensial
pusat `$rdatabase_*`. Izin sistem file, aturan akses HTTP, konfigurasi penangan PHP, dan perlindungan
cadangan semuanya penting. PHP biasanya mengeksekusi file daripada menyajikan kode sumbernya, tetapi itu
bukan pengganti untuk melindunginya dari pengungkapan langsung. Lihat
[Mengamankan instalasi yang menghadap internet](/id/guides/secure-an-internet-facing-install/).

Kredensial perangkat disimpan dengan cara yang sama. `host.snmp_community`, `host.snmp_password`,
dan `host.snmp_priv_passphrase` adalah kolom biasa, yang ditulis oleh `api_device_save()` melalui
`form_input_validate()` tanpa langkah enkripsi, dan disalin ke baris `poller_item` untuk dibaca oleh
poller. Akses baca ke tabel yang relevan dapat mengekspos kredensial perangkat yang disimpan; ini tidak
menyiratkan akses ke setiap sumber kredensial eksternal yang memungkinkan. Kata sandi pengguna adalah
pengecualian: `compat_password_hash()` menggunakan `password_hash()` PHP dengan
`PASSWORD_DEFAULT`, dan hash MD5 lama yang masih terverifikasi di-hash ulang pada login berikutnya.

## Ditegakkan, dan sekadar konvensional

Ini adalah perbedaan yang paling penting saat memikirkan suatu perubahan.

### Mekanisme kode dan cakupannya

| Batas | Mekanisme |
|---|---|
| Otentikasi | Halaman antarmuka umum menggunakan `include/auth.php`; titik akhir khusus memiliki penanganan sendiri |
| CSRF | Bootstrap web bersama mengonfigurasi penanganan token; array token yang salah format ditolak. Periksa setiap titik akhir daripada berasumsi cakupan universal |
| Skrip khusus CLI | `include/cli_check.php` menjawab `404` dan keluar saat SAPI bukan `cli` |
| Lokasi XML kueri data | `cacti_path_is_within()` terhadap `<base_path>/resource`, dicatat dan ditolak jika tidak |
| Keaslian paket | Tanda tangan terhadap kunci yang disertakan, minimum 2048 bit, tanda tangan per file |
| Penempatan file paket | Nama tidak valid ditolak; awalan skrip/sumber daya yang diizinkan dan penahanan akar yang diselesaikan diperiksa |
| Target server skrip | Penahanan `realpath()`, ditambah pemeriksaan fungsi di atas |
| Argumen shell | Pelepasan karakter, pembantu perintah terstruktur, dan validator jika diterapkan; periksa titik panggilan aktual |
| Argumen RRDtool | Validator karakter kontrol dan bentuk dalam `lib/functions.php` |
| SQL | Pembantu prepared mengikat nilai; SQL dinamis, pengidentifikasi, dan panggilan non-prepared masih memerlukan tinjauan |
| Pemanggil agen jarak jauh | Alamat sumber harus cocok dengan baris yang aktif di `poller`, berdasarkan IP persis atau pencarian balik yang dikonfirmasi |

### Tanggung jawab penerapan dan titik panggilan

| Batas | Mengapa tidak ditegakkan |
|---|---|
| Pemfilteran permintaan | Halaman memilih `get_filter_request_var()` atau tidak. `log_validation` melaporkan, tidak memblokir |
| Pelepasan output | `html_escape()` dan `html_purify()` diterapkan per titik panggilan |
| Otorisasi per halaman | Pemeriksaan ranah menggunakan `$user_auth_realm_filenames`, diindeks berdasarkan nama file. Halaman yang tidak dipetakan tidak menerima pemeriksaan ranah positif dari peta itu saja. Pemeriksaan tambahan mungkin berlaku; halaman plugin harus mendaftarkan dan menegakkan kebijakannya sendiri |
| Penolakan direktori | File `.htaccess` di bawah `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, dan `cache/*` adalah arahan Apache. Di bawah nginx, atau di bawah Apache dengan `AllowOverride` nonaktif, tidak ada yang berlaku |
| Header keamanan pada file statis | `.htaccess.dist` dikirimkan tanpa diubah namanya. Emisi header PHP tergantung pada jalur dan pengaturan; respons statis tergantung pada konfigurasi server/proxy |
| Pemisahan pengguna web dan poller | Konvensi, bukan persyaratan |
| Izin pada `include/config.php` | Ditetapkan oleh siapa pun yang menginstalnya |

Stub pengalihan `index.php` di `resource/` dan subdirektorinya menghentikan daftar direktori.
Ini bukan kontrol akses dan tidak menghentikan permintaan langsung untuk file bernama.

## Titik akhir yang merespons sebelum otentikasi

Ini adalah contoh titik masuk khusus, bukan inventaris lengkap titik akhir publik. Ketiadaan penyertaan
umum tidak membuktikan ketiadaan otentikasi atau otorisasi di tempat lain dalam jalur permintaan.

| File | Perilaku |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Permukaan login itu sendiri |
| `csp_report.php` | Menerima laporan pelanggaran CSP browser |
| `service_check.php` | Menjawab `success` atau `fail` setelah satu kueri terhadap `version`. Pemeriksaan keaktifan tanpa otentikasi |
| `link.php` | Memuat baris tautan eksternal, lalu memeriksa `is_realm_allowed($page['id'] + 10000)` sendiri |
| `remote_agent.php` | RPC kolektor data, diotorisasi oleh alamat sumber |

`remote_agent.php` adalah yang paling penting untuk dipikirkan. Otorisasinya adalah
`remote_client_authorized()`, yang membandingkan `get_client_addr()` dengan nama host dan alamat di
tabel `poller`. Tidak ada rahasia bersama. Pemanggil yang alamatnya cocok dengan baris kolektor data
yang diaktifkan dapat memanggil tindakan agen: melakukan polling data, menjalankan kueri data, melakukan
ping ke perangkat, melakukan SNMP get dan walk, meminta data grafik, dan menjalankan penemuan jaringan.
Dua perlindungan membentuk ini: Pertama, fungsi mengembalikan false langsung ketika paling banyak satu
baris kolektor yang aktif dikembalikan, sehingga kasus itu ditolak oleh fungsi ini. Kedua, ketika
pencocokan berdasarkan nama host dan bukan IP persis, pencarian balik dikonfirmasi oleh pencarian maju
sebelum diterima.

`get_client_addr()` membaca `REMOTE_ADDR` dan tidak ada yang lain kecuali `$proxy_headers` diatur
di `include/config.php`. Default yang dikirimkan adalah `null`. Mengaktifkan header proxy yang
didukung mengubah sumber berurutan dari mana alamat klien yang valid dipilih. Gunakan hanya header yang
dikendalikan oleh proxy ingress tepercaya, dan cegah klien melewati atau memberikan nilai itu sendiri.
Ini adalah satu baris konfigurasi yang paling mengubah arti dari setiap keputusan berbasis alamat dalam
sistem, termasuk otorisasi agen jarak jauh dan alamat yang dicatat dalam log.

## Akses tamu

Pengaturan `guest_user` menamai akun yang izinnya digunakan untuk halaman grafik tanpa login.
Secara default tidak ada pengguna, dan melihat grafik kemudian membutuhkan otentikasi seperti hal
lainnya. Mengaturnya mempublikasikan apa yang dapat dilihat akun tersebut kepada siapa saja yang dapat
mencapai server web. Itu adalah tujuan dari fitur tersebut. Akun tersebut masih ada dalam catatan
pengguna; pengaturan tamu adalah apa yang membuat izin grafik yang berlaku dapat digunakan tanpa login
normal. Verifikasi permintaan aktual dan izin objek, bukan hanya nama akun yang dikonfigurasi.

## Cara memikirkan suatu perubahan

Ajukan tiga pertanyaan secara berurutan:

Proses mana yang akan menjalankan ini, dan sebagai pengguna mana? Jawaban untuk metode input data
biasanya adalah akun sistem operasi kolektor yang meluncurkannya; pengumpulan yang dipicu web dapat
berbeda dari pengumpulan terjadwal.

Apa yang disentuh data dalam perjalanannya? Nilai dari perangkat yang hanya mendarat di file RRD telah
melewati satu batas. Nilai yang sama dalam judul grafik telah melewati dua batas, dan dalam argumen
skrip, tiga batas.

Apakah batas yang saya andalkan diberlakukan atau konvensional? Jika konvensional, kode yang Anda tulis
adalah penegakannya.

Bacaan terkait: [Izin dan akses](/id/concepts/permissions-and-access/) untuk model otorisasi itu
sendiri, [Metode input data](/id/reference/data-input-methods/) untuk kontrak eksekusi dan daftar putih
input, dan [Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/) untuk apa yang dilakukan
kolektor data dengan kepercayaan yang diberikan kepadanya.
