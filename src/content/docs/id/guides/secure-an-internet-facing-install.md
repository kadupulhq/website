---
title: Mengamankan instalasi yang terhubung ke Internet
description: Hal yang perlu diubah sebelum sistem pemantauan dengan akses shell ke jaringan Anda melayani permintaan dari internet publik.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 9
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur
migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Mari kita mulai dengan jawaban yang jujur: tempatkan sistem ini di belakang VPN. Kadupul menyimpan
kredensial SNMP untuk setiap perangkat yang dipantau dalam bentuk teks polos (cleartext), dan menjalankan
perintah pada host-nya sendiri sebagai bagian dari pengoperasian normal. Tidak ada konfigurasi yang
menjadikannya aman untuk dibuka langsung ke internet publik.

Pemeriksaan di bawah ini membantu menilai instalasi yang terisolasi. Panduan ini tidak membentuk
penerapan publik yang didukung atau aman secara mutlak; perhatikan batasan status proyek di atas
saat menafsirkan hasilnya.

## TLS

Lakukan terminasi TLS pada server web atau proxy di depannya. Kadupul tidak mendengarkan (listen)
pada soketnya sendiri.

Kemudian aktifkan pengaturan yang mengalihkan permintaan HTTP biasa ke HTTPS. Pengaturan ini secara
default dinonaktifkan (`off`). Tanpa pengalihan ini, formulir masuk disajikan melalui HTTP dan kata
sandi akan dikirimkan melintasi jaringan dalam bentuk teks polos sebelum tindakan pengamanan lainnya berfungsi.

Aplikasi menyetel tanda Secure pada cookie sesi ketika PHP menerima nilai non-kosong pada
`$_SERVER['HTTPS']` selain `off`. Di belakang proxy yang melakukan terminasi TLS, konfigurasikan
server web tepercaya atau lapisan FastCGI untuk merepresentasikan HTTPS dengan benar, dan verifikasi
header `Set-Cookie` yang dihasilkan di peramban.

`$proxy_headers` mengontrol resolusi alamat klien. Pengaturan ini tidak menyetel variabel server
HTTPS atau mengaktifkan cookie Secure. Percayai hanya header alamat yang disetel oleh proxy Anda,
hapus salinan yang disediakan klien, dan cegah akses langsung ke backend. Terapkan pengalihan
HTTP-ke-HTTPS pada proxy publik sebelum kredensial dikirimkan.

Aplikasi menerapkan HttpOnly dan SameSite=Strict pada cookie sesinya. Verifikasi perilaku cookie
dan pengalihan yang sebenarnya pada batas penerapan; flag ini tidak menjamin bahwa semua cookie
lain memiliki konfigurasi yang sama. Lihat
[referensi konfigurasi sesi PHP](https://www.php.net/manual/en/session.configuration.php).

## Kredensial default

Skema bawaan berisi satu akun administratif bernama `admin` dengan hash kata sandi berupa MD5
dari string `admin`. Akun ini ditandai untuk mewajibkan perubahan kata sandi pada saat masuk
pertama kali. Pastikan perubahan tersebut benar-benar dilakukan dan jangan hanya berasumsi. Perintah
yang mewajibkannya akan dilewati dalam autentikasi web basic, di mana server web telah menentukan
siapa pengguna tersebut.

Selanjutnya, periksa kredensial yang bukan merupakan akun pengguna:

- Akun basis data secara default adalah `cactiuser` dengan kata sandi `cactiuser` dalam templat konfigurasi yang disertakan.
- Subsistem otomatisasi menyertakan opsi SNMP default yang berisi community string `public` dan `private`, serta pasangan nama pengguna dan kata sandi SNMPv3. Ini adalah nilai default pemindaian, bukan konfigurasi perangkat Anda, tetapi merupakan string yang akan dicoba pertama kali oleh penemuan otomatis Anda.

Kebijakan kata sandi dapat dikonfigurasi. Nilai default memerlukan delapan karakter dan kombinasi
huruf besar-kecil. Kedaluwarsa kata sandi dan penguncian akun setelah kegagalan berulang kali tersedia
dan keduanya dinonaktifkan secara default. Pada instalasi yang menghadap ke internet, aktifkan penguncian akun.

## Hak istimewa basis data

Contoh instalasi menggunakan hak istimewa dengan cakupan basis data ditambah akses tabel zona waktu.
Ganti nama akun/basis data ilustratif ini dan tinjau pemberian izin untuk tugas penerapan dan pemeliharaan aktual:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Pemberian izin kedua tersebut bukanlah pilihan opsional. Penanganan zona waktu membaca tabel tersebut,
dan penginstal memeriksa akses serta data zona waktu yang terisi. Tinjau izin tambahan terhadap kebutuhan
pemeliharaan dan pengumpul yang sebenarnya sebelum menghapusnya; contoh ini bukan bukti bahwa setiap
penerapan membutuhkan hak istimewa yang persis sama.

Catatan cakupan yang penting:

- Ikat (bind) basis data ke localhost, atau ke antarmuka privat, dan bukan ke alamat yang dilayani oleh server web.
- Berikan setiap pengumpul data jarak jauh akun basis datanya sendiri. Kredensial mereka berada di basis data pusat dan di berkas konfigurasi mereka sendiri; akun terpisah meningkatkan akuntabilitas dan kemudahan pencabutan izin. Akun terpisah tidak secara otomatis mengisolasi pengumpul yang disusupi jika izinnya masih memungkinkan penulisan ke pusat.
- Koneksi mendukung TLS, yang dikonfigurasi dengan kunci, sertifikat, dan jalur CA dalam berkas konfigurasi. Gunakan selalu saat basis data tidak berada di host yang sama.
- Buat berkas konfigurasi dapat dibaca oleh pengguna server web dan tidak dapat ditulis oleh pengguna layanan web maupun poller selama pengoperasian normal. Pertahankan kepemilikannya di bawah akun administratif. Penyiapan poller jarak jauh secara khusus memeriksa apakah ia dapat memperbarui berkas tersebut; jangan berasumsi setiap instalasi server primer memerlukan izin tulis sementara yang sama.
- Rahasia CSRF dapat disimpan dalam berkas alih-alih di basis data. Jika Anda menggunakan opsi tersebut, berkas harus berada di luar document root. Hal ini merupakan persyaratan wajib, bukan saran.

## Jauhkan direktori data dari document root

Dalam penerapan di tingkat root repositori, data privat dan direktori kode sumber dapat berada di
bawah root yang disajikan web. Beberapa direktori memuat aturan penolakan `.htaccess`; lakukan
inventarisasi checkout aktual dan konfigurasi server daripada berasumsi setiap jalur sudah terlindungi.
Migrasi framework parsial saat ini juga berarti bahwa mengalihkan seluruh situs ke `public/` tanpa
rute warisan bukanlah prosedur penerapan yang lengkap.

Berkas-berkas tersebut hanya berfungsi di Apache, dan hanya jika konfigurasi mengizinkan override
di direktori tersebut. Pada nginx, berkas tersebut tidak berpengaruh. Pada Apache yang salah konfigurasi,
berkas tersebut tidak berfungsi. Penolakan akses yang tidak berfungsi di depan direktori log berarti
siapa pun dapat membaca log aplikasi Anda, yang memuat nama perangkat, nama pengguna, teks kueri,
dan perincian kesalahan. Apache mendokumentasikan perilaku override yang diperlukan dalam
[panduan `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Lakukan kedua langkah berikut:

**Verifikasi jalur penyimpanan sebelum memindahkan data.** Tujuan log dapat dikonfigurasi, tetapi
`include/global.php` menyetel dasar RRA ke direktori `rra` instalasi; tidak ada pengaturan antarmuka
pengguna umum untuk direktori RRA. Tata letak penyimpanan yang di-mount terpisah dapat mempertahankan
jalur yang diharapkan tersebut, tetapi penempatan sistem berkas saja tidak mencegah akses HTTP melalui
direktori yang disajikan atau symlink. Periksa jalur sumber data yang ada, izin layanan, cadangan,
dan penolakan HTTP secara bersamaan. Jangan merelokasi pohon cache tanpa memverifikasi bagaimana
konsumen menyelesaikan berkas. Lihat [Migrasi ke perangkat keras baru](/id/guides/migrate-to-new-hardware/)
dan [Meningkatkan versi dengan aman](/id/guides/upgrade-safely/).

**Tolak jalur privat di server web.** Sesuaikan
[contoh Nginx root repositori](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
dari kode sumber ke prefiks URL dan server aktual; aturan penolakan harus diutamakan daripada penanganan
PHP generik. Daftar ini merupakan panduan inventarisasi, bukan konfigurasi server siap pakai:

| Direktori | Alasan |
|---|---|
| `rra/` | Berkas pengukuran |
| `log/` | Log aplikasi, termasuk kueri dan perincian kesalahan |
| `cache/` | Periksa akses aset yang dimaksudkan; blokir eksekusi PHP di jalur cache |
| `scripts/` | Kode pengumpulan tidak boleh disajikan atau dipanggil langsung melalui HTTP |
| `cli/` | Alat baris perintah yang tidak boleh diakses melalui HTTP |
| `mibs/`, `contrib/`, `docs/` | Sumber daya internal dan dokumentasi |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Internal aplikasi, status, dan perkakas |
| Dotfiles, manifes dependensi, PHP bootstrap/include internal | Metadata repositori dan titik masuk internal |

Pertahankan aset publik yang diperlukan seperti `include/js` dan `include/themes`; pemblokiran
menyeluruh pada semua file include dapat merusak antarmuka pengguna. Verifikasi penolakan menggunakan
jalur uji yang tidak berbahaya dan pastikan respons tidak membocorkan kode sumber atau konten berkas.
Jangan menguji dengan mengambil rahasia nyata ke terminal atau log.

Tersedia juga berkas opsional berisi header respons keamanan untuk aset statis. Respons PHP mengatur
headernya sendiri dalam kode; berkas statis tidak melakukannya, kecuali Anda mengaktifkan berkas
tersebut atau menaruh direktif yang sama dalam konfigurasi server.

Content Security Policy (CSP) dapat dikonfigurasi. Kebijakan skrip default mengizinkan JavaScript
inline tanpa nonce, karena plugin membutuhkannya. Mode nonce yang lebih ketat yang ditampilkan di
Pengaturan hanya bersifat report-only. Implementasi header juga menerima penegakan `nonce`, meskipun
[bantuan Pengaturan sudah usang](https://github.com/kadupulhq/kadupul/issues/265). Penegakan dan mode
report-only adalah dua hal yang berbeda; periksa header dan uji semua halaman/plugin yang diperlukan
sebelum mengubah mode. Penegakan yang diterapkan bukan bukti kompatibilitas nonce secara menyeluruh.

## Poller mengeksekusi perintah

Inilah bagian yang mengubah model ancaman secara signifikan.

Pengumpulan data bukan hanya SNMP. Metode input data dapat mendefinisikan baris perintah, dan poller
akan menjalankannya. Baris perintah disimpan dalam cache poller dan dieksekusi oleh pengumpul pada
setiap interval, sebagai pengguna sistem operasi pengumpul tersebut. Input server skrip PHP menggunakan
proses PHP terpisah yang berumur panjang. Perintah eksternal dan input server skrip adalah jalur yang
berbeda; jangan berasumsi setiap skrip berjalan di dalam server tersebut atau bahwa pengumpul C telah
divalidasi untuk checkout ini.

Perlakukan izin berikut sebagai permukaan konfigurasi dengan hak istimewa tinggi untuk eksekusi kode.
Efek pastinya bergantung pada fitur yang diaktifkan dan kontrol validasi:

| Izin | Alasan |
|---|---|
| Metode Input Data | Menentukan baris perintah secara langsung |
| Impor Templat | Templat atau paket yang diimpor dapat memuat metode input data |
| Administrasi Plugin | Kode plugin berjalan di dalam aplikasi |
| Pengaturan / Utilitas | Mengontrol jalur ke biner yang dieksekusi |

Jangan berikan izin tersebut kepada siapa pun yang belum memiliki akses shell pada host tersebut.
Pengguna baca-saja yang dapat melihat grafik adalah hal yang sama sekali berbeda, dan itulah peran
yang seharusnya dimiliki oleh hampir setiap akun.

Dua kontrol tersedia dan keduanya layak digunakan:

**Pembatasan metakarakter.** Metakarakter shell dalam string perintah input data diblokir secara default.
Terdapat pengaturan untuk mengizinkannya, yang disediakan untuk definisi lama yang menggunakan pipeline shell.
Biarkan opsi ini nonaktif. Jika Anda memiliki definisi yang membutuhkannya, pindahkan pipeline ke dalam
skrip di bawah direktori scripts dan panggil skrip tersebut.

**Daftar putih input.** Berkas yang disebutkan dalam berkas konfigurasi, yang memuat string perintah
yang disetujui berdasarkan metode input data. Jika disetel, grafik dan sumber data tidak dapat dibuat
dari metode input data yang string perintahnya tidak ada dalam daftar. Mengubah perintah yang disetujui
membuat perbandingan gagal sampai daftar putih yang ditinjau diperbarui. Pembuatan ulang adalah langkah
baris perintah, dan itulah poin utamanya: ini memerlukan akses shell pada host, bukan sesi administratif
di peramban.

Pemeriksaan berjalan kembali saat cache poller dibangun ulang. Input data yang gagal tidak akan
menghasilkan item poller, dan setiap baris yang ditinggalkannya akan dihapus pada pembangunan
ulang/flush berikutnya yang terkonfirmasi. Ini membatasi pembuatan dan pengisian cache; ini bukan
mekanisme pembatalan instan untuk pekerjaan yang sedang berjalan atau bukti bahwa setiap pengumpul
memuat ulang daftar putih yang diubah sebelum setiap eksekusi. Verifikasi status cache yang telah
di-commit dan perilaku pengumpul setelah perubahan kebijakan.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Perintah `--update` tanpa cakupan menerima definisi perintah saat ini ke dalam daftar putih; jangan
gunakan ini sebagai pengganti peninjauan manual. Lindungi daftar putih dan direktori induknya dari
penulisan oleh pengguna layanan. Fitur ini mati kecuali dikonfigurasi. Lihat
[Menulis skrip pengumpulan data](/id/guides/write-a-data-collection-script/) untuk perincian seleksi dan output.
Hal ini meningkatkan biaya peretasan administratif di sisi peramban, karena memasukkan perintah baru
ke dalam pengumpulan kini juga memerlukan akses tulis sistem berkas pada host poller. Langkah ini tetap
bukan pengganti untuk membatasi siapa yang memegang izin dalam tabel di atas, karena penyerang yang dapat
menjangkau string perintah yang sudah disetujui tidak perlu menambahkan yang baru.

## Autentikasi

Empat metode disediakan. Ketersediaannya bergantung pada ekstensi PHP yang ada.

| Metode | Tempat pengguna diperiksa | Catatan |
|---|---|---|
| Bawaan (Built-in) | Basis data lokal | Kata sandi, kebijakan, dan penguncian ditangani secara lokal |
| Web basic | Server web | Kadupul memercayai apa pun yang dinyatakan server mengenai identitas pengguna |
| LDAP | Direktori tunggal | Memerlukan ekstensi PHP LDAP |
| Beberapa domain LDAP/AD | Beberapa direktori | Persyaratan yang sama |

Pemilih Pengaturan menampilkan metode terotentikasi ini, bukan mode nol warisan. Bootstrap autentikasi
mencoba memigrasikan konfigurasi tanpa autentikasi lama kembali ke autentikasi lokal, tetapi fungsi
bantu otorisasi tingkat rendah masih memuat percabangan mode nol. Verifikasi metode yang tersimpan,
identitas yang dikonfigurasi, dan rute yang benar-benar dilindungi daripada memperlakukan pilihan UI
yang tidak ada sebagai bukti universal.

Hal-hal yang perlu diperiksa:

- **Web basic mendelegasikan validasi identitas.** Kadupul membaca variabel identitas yang diautentikasi server saat mode ini dipilih dan tetap menerapkan pemetaan akun, status aktif, dan aturan otorisasi. Identitas yang hilang tidak otomatis menjadikannya administrator. Konfigurasikan server untuk mengautentikasi setiap rute yang dimaksud dan cegah klien memasok variabel identitas tepercaya; verifikasi rute gambar/ekspor dan perilaku tamu secara terpisah.
- **Dukungan untuk "tetap masuk"** diaktifkan secara default. Token persisten dibuat saat pengguna memilih opsi tersebut setelah autentikasi, bukan otomatis untuk setiap sesi. Token ini kedaluwarsa setelah sembilan puluh hari tidak digunakan. Pada instalasi yang menghadap ke internet, tentukan secara sadar apakah Anda menginginkannya.
- **Atur pengguna tamu (guest) ke nobody**, kecuali jika Anda secara khusus ingin mengizinkan tampilan grafik anonim. Defaultnya adalah tanpa pengguna, yang merupakan pilihan tepat; pastikan nilai ini tidak diubah selama penyiapan.
- **Tempatkan autentikasi multifaktor (MFA) di depannya.** Tidak ada MFA di dalam aplikasi. Proxy yang sadar identitas atau gateway SSO adalah tempat yang tepat untuk menerapkannya.

## Titik akhir pengumpul data jarak jauh

Jika Anda menjalankan remote collector, instalasi pusat mengekspos titik akhir yang mereka hubungi.
Titik akhir ini tidak mengautentikasi dengan sesi pengguna. Mekanisme ini mengotorisasi dengan menyelesaikan
alamat pemanggil dan mencocokkannya dengan nama host pengumpul yang terdaftar, mencatat kegagalan di
bawah kategori keamanan.

Dua hal penting yang menjadi konsekuensi. Pertama, titik akhir tersebut tidak boleh dijangkau dari
internet publik; batasi di server web hanya untuk alamat pengumpul. Kedua, alamat klien yang diperiksa
adalah yang diturunkan dari permintaan, sehingga kepercayaan forwarded-header yang dikonfigurasi
sebelumnya berlaku di sini juga. Memercayai header yang tidak Anda kendalikan memungkinkan pemanggil
memalsukan alamat pengumpul.

Secara terpisah, pengaturan yang mengizinkan sertifikat self-signed dan ketidakcocokan nama host saat
server pusat berbicara dengan pengumpul diaktifkan secara default. Terbitkan sertifikat asli untuk
pengumpul Anda dan nonaktifkan opsi ini.

## Daftar periksa minimum

1. TLS diterminasi, HTTP dialihkan sebelum masuk, status HTTPS PHP dikonfigurasi oleh server tepercaya, dan cookie Secure diverifikasi. Header alamat klien dibatasi hanya pada yang disetel dan dibersihkan oleh proxy.
2. Kata sandi admin default diubah dan dikonfirmasi. Penguncian akun diaktifkan.
3. Hak istimewa basis data ditinjau untuk peran instalasi, pemeliharaan, dan pengumpul; akses zona waktu diverifikasi dan akses jaringan basis data dibatasi hanya untuk klien yang diperlukan.
4. Jalur penyimpanan diverifikasi, direktori privat dan metadata ditolak di server web, serta aset statis yang diperlukan tetap berfungsi normal.
5. Berkas konfigurasi tidak dapat ditulis saat runtime. Berkas rahasia CSRF, jika digunakan, berada di luar document root.
6. Metode Input Data, Impor Templat, dan Administrasi Plugin tidak diberikan kepada siapa pun tanpa shell pada host poller. Pembatasan metakarakter diaktifkan. Daftar putih input dikonfigurasi.
7. Titik akhir pengumpul jarak jauh dibatasi berdasarkan alamat. Pemeriksaan sertifikat diaktifkan.
8. MFA diterapkan pada proxy di depan seluruh sistem.
