---
title: Tambahkan perangkat pertama
description: Mulai polling pada satu perangkat, dan pastikan data tiba sebelum Anda membangun hal lain di atasnya.
sidebar:
  order: 3
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini."
---

Tambahkan satu perangkat, pastikan perangkat tersebut merespons, dan barulah melanjutkan. Sebagian besar masalah pada sistem pemantauan bermula dari perangkat yang sebenarnya tidak pernah merespons sejak awal.

Pilihlah perangkat yang risikonya rendah jika terjadi kesalahan. Sakelar (switch) milik Anda sendiri, pada jaringan yang Anda kendalikan, dengan SNMP yang sudah diaktifkan. Jangan mulai dengan perangkat yang sedang ditanyakan orang lain kepada Anda.

## Sebelum Anda mulai

Untuk contoh SNMP ini, perangkat harus merespons kueri dari pengumpul (collector) yang ditetapkan untuknya. Jalankan pemeriksaan pada pengumpul tersebut, sebaiknya sebagai pengguna poller; permintaan dari laptop Anda dapat melalui jalur firewall yang berbeda. Ganti contoh alamat dan string komunitas dengan kredensial baca-saja (read-only) yang dikonfigurasi pada perangkat Anda. OID numerik di bawah ini juga berfungsi meskipun berkas nama MIB lokal tidak terpasang.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Jika perintah tersebut mengembalikan string deskripsi, lanjutkan. Jika waktu habis (timeout), perbaiki masalah itu terlebih dahulu. Sebanyak apa pun konfigurasi pada antarmuka web tidak akan membuat perangkat yang tidak dapat dijangkau memberikan respons.

Kemudian periksa tabel yang sebenarnya ingin Anda buatkan grafiknya, karena perangkat bisa saja merespons `sysDescr` tetapi tetap menolak kueri tabel antarmuka.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

OID kedua adalah kolom `ifDescr`. Anda mengharapkan satu baris per antarmuka yang diekspos. Hasil yang kosong dapat berarti tampilan SNMP dibatasi atau tabel tidak didukung; kesalahan otorisasi menunjukkan masalah kredensial atau kebijakan akses. Periksa pesan kesalahan yang dikembalikan sebelum mengubah perangkat atau konfigurasi Kadupul.

Dua fakta tentang versi SNMP menentukan keputusan nantinya, jadi tentukan hal tersebut sekarang.

| Versi | Pengaruhnya bagi Anda |
|---|---|
| v1 | Tidak mendukung Counter64. Tautan cepat dapat menyebabkan penghitung oktet 32-bit bergulir (wrap) berkali-kali di antara siklus polling, membuat laju data menjadi ambigu |
| v2c | Mendukung Counter64 saat agen menyediakannya; string komunitas dikirim dalam teks biasa (clear text) |
| v3 | Mendukung autentikasi dan enkripsi dengan `authPriv`; memilih v3 saja tidak secara otomatis mengaktifkan keduanya |

Utamakan v3 dengan `authPriv` jika didukung, atau v2c pada jaringan manajemen yang terisolasi. Pilih jenis grafik antarmuka 64-bit sekaligus versi SNMP yang sesuai. Jika perangkat hanya mendukung v1, pertimbangkan interval polling dan laju lalu lintas pada tabel penanganan masalah di bagian bawah halaman ini. Dokumen [SNMP](/id/reference/snmp/) membahas bidang kredensial secara lengkap.

## Tentukan tiga hal sebelum membuka formulir

**Kredensial.** Tepat seperti yang Anda uji di atas, termasuk nomor port jika berbeda dari nilai bawaan.

**Metode ketersediaan.** Ini adalah cara Kadupul menentukan apakah perangkat aktif (up), dan terpisah dari apakah proses pengumpulan data berhasil. Pilihan bawaan yang tersedia meliputi: tidak ada (none), ping, waktu aktif SNMP (SNMP uptime), deskripsi SNMP (SNMP description), SNMP getNext, serta dua kombinasi ping dengan waktu aktif SNMP (satu memerlukan keduanya dan satu lagi menerima salah satunya).

Utamakan metode SNMP untuk perangkat yang Anda polling melalui SNMP. Metode ini menguji langsung layanan yang menjadi tumpuan Anda. Ping ICMP memerlukan raw socket, yang membutuhkan hak istimewa yang biasanya tidak dimiliki oleh akun web dan poller; sehingga perangkat yang merespons perintah `ping` dari shell Anda mungkin tetap dilaporkan down pada antarmuka web. Ping TCP ke port yang Anda ketahui terbuka dapat menghindari masalah tersebut.

**Templat perangkat.** Pilih templat yang sesuai dengan perangkat keras.

## Menambahkan perangkat

1. Pada halaman lawas **Perangkat** (`host.php`), pilih **Tambah**. Pembuatan perangkat dan penyiapan grafik masih menggunakan halaman ini selama masa migrasi ke Symfony. Masukkan deskripsi, nama host atau alamat IP, pengumpul yang ditetapkan, versi SNMP, dan kredensial.
2. Atur metode ketersediaan yang Anda pilih.
3. Pilih templat perangkat.
4. Simpan, pastikan perangkat dalam status aktif (enabled), dan periksa panel ketersediaan/SNMP-nya. Catatan yang tersimpan di basis data bukan bukti bahwa pengumpulan data telah berhasil.

## Hal yang ditentukan oleh templat perangkat

Templat perangkat mengaitkan templat grafik dan kueri data dengan perangkat. Kueri data menelusuri tabel pada perangkat, seperti daftar antarmukanya, dan menghasilkan satu indeks per baris. Menerapkan templat juga menjalankan kueri data tersebut untuk mengisi indeks-indeks ini. Saat otomatisasi grafik dinonaktifkan, keterkaitan tersebut tidak secara otomatis membuat grafik. Saat otomatisasi grafik diaktifkan, hook templat/kueri dapat membuat grafik berdasarkan aturan yang cocok; periksa grafik yang ada sebelum menambahkan duplikat.

Mengubah templat dapat memperbarui keterkaitan dan menjalankan hook tersebut kembali. Tindakan ini tidak mengatur ulang grafik atau sumber data yang sudah ada. Periksa templat yang dipilih dan indeks yang dikueri sebelum menerapkannya ke perangkat yang sudah memiliki riwayat data.

Adanya indeks-indeks inilah yang membuat Anda dapat memilih antarmuka dari daftar alih-alih mengetikkan OID secara manual. [Templat](/id/concepts/templates/) dan [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/) membahas kedua konsep ini secara mendalam.

## Membaca panel status

Ketika perangkat disimpan dengan metode ketersediaan SNMP, Kadupul membuka sesi dan melaporkan hasilnya. Ini adalah pemeriksaan penting yang sering kali dilewati orang.

| Tampilan | Artinya |
|---|---|
| Kueri sistem dan waktu aktif berhasil | Panel dapat membaca metadata dasar SNMP. Ini belum membuktikan keberhasilan pengumpulan antarmuka |
| Lokasi atau Kontak kosong | Bidang metadata opsional ini mungkin belum dikonfigurasi; nilai kosong saja bukan merupakan kegagalan pengumpulan data |
| SNMP tidak digunakan | Tidak ada komunitas atau nama pengguna pada perangkat, atau versi diatur ke tidak ada (none) |
| Kesalahan sesi SNMP | Pembuatan sesi gagal; periksa kesalahan yang ditampilkan, kredensial, protokol, dan pengaturan koneksi |
| Kesalahan sistem SNMP | Pembacaan `sysDescr` gagal; periksa kesalahan yang dikembalikan, tampilan agen, kredensial, dan keterjangkauan |
| Kesalahan host SNMP | Baik deskripsi maupun waktu aktif tidak memberikan respons |
| Waktu aktif ditampilkan sebagai `U` | Waktu aktif tidak dapat dibaca. Beberapa perangkat memang tidak melaporkan nilai ini |

Jika metode ketersediaan menyertakan ping, hasil ping terpisah akan muncul di bawahnya. Bacalah keduanya. Perangkat bisa saja lolos pada satu uji dan gagal pada uji lainnya, dan uji yang gagal memberi tahu Anda bagian mana yang perlu diperiksa.

Deskripsi sistem yang kosong tidak membuktikan bahwa pengumpulan data gagal. Kode program dapat mengakomodasi agen dengan deskripsi kosong tetapi memiliki waktu aktif yang dapat digunakan. Perangkat yang dinonaktifkan akan melewati pemeriksaan ketersediaan, dan metode ketersediaan non-SNMP tidak menampilkan panel SNMP ini. Selanjutnya, verifikasi kueri aktual dan cache poller.

## Membuat sumber data dan grafik

Untuk perangkat baru tanpa grafik yang dibuat secara otomatis, langkah berikutnya adalah membuat grafik beserta sumber datanya. Periksa **Daftar Sumber Data** dan **Lihat Cache Poller** pada halaman perangkat daripada mengasumsikan keduanya kosong.

Dari halaman perangkat, pilih **Buat Grafik untuk Perangkat ini**. Untuk sebuah switch, ini berarti menjalankan kueri data antarmuka, memilih antarmuka yang Anda butuhkan, dan menentukan jenis grafik untuknya. Pilihlah dua atau tiga antarmuka, jangan langsung semua empat puluh delapan port. Anda sedang membuktikan bahwa jalur data berfungsi, dan kelompok kecil pertama jauh lebih mudah diperiksa pada langkah berikutnya.

Grafik berindeks mengaitkan sumber data dengan antarmuka yang dipilih dan menyiapkan entri cache poller untuknya; sumber data kompatibel yang sudah ada dapat digunakan kembali. Respons pembuatan grafik belum menjadi bukti bahwa proses polling berjalan. Pastikan cache memuat perangkat yang diharapkan, OID antarmuka, dan jalur berkas RRD.

## Memastikan data sedang dikumpulkan

Tunggulah beberapa siklus pengumpulan data yang dijadwalkan, lalu periksa stempel waktu maupun nilainya. Grafik yang kosong dapat menandakan normalisasi awal, nilai tidak diketahui (unknown), atau kegagalan pengumpulan. Dua kali pembacaan penghitung diperlukan untuk menghitung laju lalu lintas, tetapi dua kali eksekusi poller belum tentu menjamin terciptanya wadah (bucket) arsip yang lengkap dan valid.

Periksa tiga hal berikut secara berurutan.

**Poller telah berjalan.** Cari ringkasan akhir putaran pada log yang dikonfigurasi. Jika tidak ada, periksa penjadwalan, tujuan log dan izin aksesnya, serta apakah poller keluar sebelum selesai. Lihat [Pencatatan log](/id/reference/logging/).

**Berkas ada dan baru diperbarui.** Salin jalur RRD yang sebenarnya dari sumber data atau cache poller; jangan menebaknya dari nama host. Jalur dan nama berkas dapat disesuaikan. Lihat [Tata letak berkas](/id/reference/file-layout/). Tanyakan kepada RRDtool kapan berkas terakhir kali ditulis:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Stempel waktu harus bertambah maju pada operasi penulisan yang berhasil. Stempel waktu terbaru masih bisa disertai nilai yang tidak diketahui, dan penulisan yang disangga (buffered) dapat menunda pembaruan stempel waktu pada disk. Untuk `rrdcached` atau Boost, periksa juga status flush komponen tersebut.

**Nilai bukan tidak diketahui.** `lastupdate` menampilkan nilai terbaru yang dimasukkan; untuk sebuah penghitung, ini adalah nilai akumulasi penghitung, bukan laju lalu lintas yang dihitung. Periksa baris-baris yang telah selesai dari `fetch` untuk memastikan adanya laju nilai terhingga. Waktu mulai, penyelarasan langkah, heartbeat, batasan nilai, dan ambang data tidak diketahui pada arsip semuanya memengaruhi kapan baris yang dapat digunakan muncul. Jangan mendiagnosis kerusakan hanya dari dua baris pertama. Jika nilai tidak diketahui terus berlanjut, periksa nilai yang terkumpul, jenis sumber data, heartbeat, dan kesalahan poller.

## Masalah awal yang umum

| Gejala | Penyebab umum |
|---|---|
| Berhasil disimpan, tetapi pencarian deskripsi sistem melaporkan kesalahan | Periksa kredensial, tampilan agen, dan keterjangkauan pengumpul; deskripsi kosong saja bukan bukti yang cukup |
| Kesalahan sesi SNMP dari Kadupul, tetapi `snmpget` berhasil dari laptop Anda | Jalur firewall berbeda, atau agen membatasi akses berdasarkan alamat IP sumber |
| Perangkat berstatus down, tetapi data SNMP tetap masuk | Ketersediaan diatur ke ping ICMP, yang tidak dapat membuka raw socket |
| Deskripsi muncul, tetapi data tidak ada | Poller tidak dijadwalkan, atau berjalan sebagai pengguna yang tidak memiliki izin tulis ke direktori RRD |
| Kueri data tidak mengembalikan antarmuka apa pun | Tampilan agen mengecualikan tabel antarmuka, atau perangkat perlu diindeks ulang |
| Nilai pertama tidak diketahui, kemudian normal | Normal untuk penghitung. Diperlukan dua kali pembacaan untuk menghasilkan laju data |
| Nilai tidak diketahui terus berlanjut | Kegagalan pengumpulan, nilai tidak valid, ketidakcocokan jenis/batasan, masalah heartbeat atau normalisasi arsip |
| Data muncul beberapa saat, lalu terputus-putus | Poller membutuhkan waktu lebih lama dari intervalnya, atau perangkat membatasi laju permintaan SNMP |
| Laju penghitung tidak masuk akal | Penggulungan (wrapping) 32-bit berulang kali, reset penghitung, satuan atau pengaturan sumber data; gunakan penghitung 64-bit pada tautan cepat |
| Grafik antarmuka memetakan port yang salah setelah perangkat dimulai ulang | Indeks bergeser. Kueri data memerlukan metode pengindeksan ulang yang mampu mendeteksinya |

Poin terakhir patut dipahami sebelum Anda mengelola ratusan switch: indeks antarmuka SNMP tidak dijamin stabil setelah perangkat di-reboot atau modul diganti. Metode pengindeksan ulang pada kueri data adalah mekanisme yang menjaga agar grafik tetap mengarah ke port fisik yang sama. [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/) menjelaskan pilihan-pilihan yang tersedia.

Ketika satu perangkat telah berhasil mengumpulkan data secara bersih, tambahkan sisanya secara massal alih-alih satu per satu. [Temukan perangkat secara otomatis](/id/guides/discover-devices-automatically/) dan alat baris perintah dalam [Alat baris perintah](/id/reference/command-line-tools/) keduanya jauh lebih efisien daripada mengulang langkah di halaman ini lima puluh kali.

Berikutnya: [Baca grafik pertama](/id/start/first-graph/).
