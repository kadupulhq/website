---
title: Pengumpulan data jarak jauh
description: Mengapa pengumpulan didistribusikan dan penyimpanan tidak, apa yang dimiliki kolektor jarak jauh, dan berapa biaya untuk memiliki salinan kedua dari konfigurasi.
banner:
  content: Kadupul berada dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian terisolasi.
sidebar:
  order: 9
---

:::caution[Perilaku proxy RRDtool yang diwarisi]
Penerapan proxy RRDtool tidak didukung di Kadupul. Gunakan penyimpanan RRDtool lokal
(`storage_location = 0`). Pengaturan proxy, deskripsi protokol, dan alur kerja di halaman ini
mendokumentasikan perilaku yang diwarisi, bukan jalur penerapan atau migrasi yang didukung.
Lihat [Proxy RRDtool](/id/reference/rrdproxy/).
:::

Pengumpulan adalah bagian yang tidak muat dalam satu mesin. Sebagian besar proses polling dihabiskan
untuk menunggu perangkat merespons, dan waktu menunggu tidak dapat dikompresi. Anda dapat melakukan
tumpang tindih waktu tunggu tersebut dengan lebih banyak proses dan thread, hingga titik di mana host
pengumpul kehabisan CPU atau waktu bolak-balik (round trip) ke lokasi yang jauh mendominasi segalanya.

Kolektor jarak jauh adalah kode yang sama dengan id kolektor berbeda, yang melakukan polling pada
sebagian perangkat. Setiap perangkat menentukan kolektor yang bertanggung jawab untuknya. Penugasan itu
adalah partisi penjadwalan normal. Jaga agar penugasan perangkat dan cache poller yang direplikasi tetap
konsisten; pilihan penjadwalan ini bukan bukti bahwa setiap penulisan hasil menegakkan kepemilikan kolektor.

Untuk pertanyaan tentang *kapan* harus menggunakannya, lihat
[Menskalakan poller](/id/guides/scale-the-poller/). Halaman ini membahas tentang apa itu kolektor.

## Mengapa kolektor membawa databasenya sendiri

Kolektor yang membaca daftar kerjanya dari database pusat melalui jaringan akan berhenti mengumpulkan
data saat jaringan terputus. Itu kebalikan dari tujuan Anda menggunakan kolektor jarak jauh.

Jadi kolektor membawa database lokal yang menyimpan salinan konfigurasinya sendiri: pengaturan,
templat, metode input data, kueri data, bagian dari cache pollernya, perangkatnya, konfigurasi plugin,
serta tabel pengguna dan izin. Salinan itu dikirim dari instalasi utama. Perlakukan instalasi utama
sebagai otoritas konfigurasi, sementara kolektor mempertahankan status operasional lokal dan pengaturan mesin.

Pengaturan jalur dikecualikan dari salinan, bersama dengan statistik per putaran yang disimpan instalasi
utama untuk dirinya sendiri. Jalur adalah properti mesin, bukan instalasi secara keseluruhan.

## Replikasi bersifat berkala, sehingga konfigurasi tertinggal

Poller utama memeriksa kolektor jarak jauh yang aktif dengan host database non-lokal dan interval
sinkronisasi bukan nol. Kolektor jatuh tempo jika belum pernah disinkronkan, intervalnya telah berlalu,
atau ditandai memerlukan sinkronisasi. Interval nol mengecualikannya dari pemeriksaan berkala ini,
bahkan saat ditandai memerlukan sinkronisasi.

Nilai default global adalah dua jam; kolektor dapat memiliki intervalnya sendiri. Ini bukan jaminan
bahwa setiap perubahan menunggu dua jam: operasi perangkat dan plugin juga memiliki jalur replikasi
terarah. Penyebaran yang berhasil bergantung pada operasi tersebut, konektivitas, dan tabel yang dipilih.
Periksa konfigurasi dan cache aktual kolektor daripada berasumsi adanya konsistensi langsung atau
penundaan tetap.

Replikasi penuh dapat diminta dari kolektor utama dengan `php cli/poller_replicate.php`, saat kolektor
jarak jauh yang diaktifkan dikonfigurasi. Perintah ini mereplikasi setiap kolektor jarak jauh yang aktif
kecuali `--poller=N` memilih satu kolektor tertentu.
Lihat [Menskalakan poller](/id/guides/scale-the-poller/) dan
[Migrasi ke perangkat keras baru](/id/guides/migrate-to-new-hardware/) untuk konteks operasional.

## Tiga mode koneksi

Kolektor memutuskan saat memulai bagaimana ia akan berperilaku, berdasarkan apakah database pusat
merespons dan apakah ia menyimpan sampel yang belum terkirim.

| Mode | Kondisi | Perilaku |
|---|---|---|
| Online | Database pusat terhubung dan tidak ada backlog Boost lokal yang terdeteksi | Penulisan hasil menargetkan database pusat |
| Offline | Koneksi pusat gagal atau dipaksa offline | Pengumpulan menggunakan buffering lokal, jika layanan lokal tetap sehat |
| Pemulihan | Database pusat terhubung dan baris Boost lokal masih ada | Sampel baru tetap lokal sementara proses latar belakang mencoba mentransfer backlog |

Offline bukanlah status kesalahan. Ini adalah perilaku yang dirancang untuk kolektor yang tautannya
terputus, dan itulah mengapa kolektor memiliki database lokal. Pengumpulan berlanjut terhadap konfigurasi
yang tersedia secara lokal. Kapasitas database lokal, akses perangkat, kesehatan penjadwal, dan kredensial
yang dapat digunakan tetap diperlukan; mode offline tidak menjamin pengumpulan tanpa gangguan atau pengiriman akhir.

## Bagaimana hasil mencapai instalasi utama

Hasil pengumpulan tidak berpindah sebagai penulisan RRD. Hasil tersebut berpindah sebagai baris database.

Penulisan RRD yang ditangguhkan diperlukan bila ada lebih dari satu kolektor, dan penambahan kolektor
jarak jauh yang aktif menyebabkan poller utama mengaktifkan pembaruan yang ditangguhkan. Jalur startup
juga mengaktifkan Boost sistem dan pengalihan saat ada beberapa rekaman kolektor. Pengaturan ini sendiri
tidak memvalidasi penerapan yang berfungsi.
Lihat [Penulisan volume tinggi](/id/concepts/high-volume-writes/) untuk mengetahui fungsi mode tersebut.

Saat online, kolektor memasukkan sampelnya langsung ke tabel buffer pusat. Instalasi utama memindahkannya
ke file RRD sesuai jadwalnya sendiri, persis seperti yang dilakukannya untuk sampel yang dikumpulkannya
sendiri. Sampel kolektor tidak diperlakukan khusus setelah tiba.

Saat offline dan selama pemulihan, sampel menumpuk di antrean Boost lokal. Ketika database pusat dapat
dijangkau kembali, `poller_recovery.php` memasukkan baris yang di-buffer ke dalam antrean Boost pusat,
memperbarui output dari baris yang sudah ada di sana.

Pemulihan menghapus baris lokal hanya setelah penyisipan pusat untuk paketnya berhasil, dan hanya jika
baris lokal masih cocok dengan apa yang dikirim. Penyisipan yang gagal, sampel yang terlalu besar, atau
baris yang diubah selama pembersihan meninggalkan sampel lokal di tempatnya untuk percobaan berikutnya.
Halaman ini tidak menetapkan prosedur pemulihan multi-kolektor yang divalidasi.

Penyisipan pemulihan membawa pengenal sumber data, nama, stempel waktu, dan nilai; operasi tersebut tidak
memeriksa baris-baris tersebut terhadap penugasan kolektor. Jangan mengandalkan penolakan serah terima
universal untuk melindungi dari penugasan basi atau produsen yang tumpang tindih. Validasi penugasan dan
status cache sebelum mengaktifkan pengumpulan.

## Penyimpanan tidak terdistribusi

Alur kerja berbasis proxy yang diwarisi menjaga file RRD tetap terpusat dan mengharapkan kolektor
menjangkaunya melalui proxy RRDtool. Alur kerja tersebut tidak didukung di Kadupul; jangan anggap itu
sebagai panduan penerapan. Jalur penyimpanan multi-kolektor yang divalidasi menggunakan RRDtool lokal
harus didokumentasikan sebelum merekomendasikan penggantian.

Ini adalah bagian yang paling sering mengejutkan orang, jadi perlu ditegaskan secara langsung:
**Kolektor jarak jauh mendistribusikan waktu tunggu, bukan penulisan.** Jika batasan yang Anda hadapi
adalah disk di bawah pohon RRD, kapasitas pengumpulan tambahan tidak menghilangkan batasan tersebut.
Lebih banyak sampel yang masuk dapat meningkatkan beban database pusat dan backlog penulis.

## Apa lagi yang mengalir kembali

Kolektor memiliki status operasional perangkatnya: keterjangkauan, kesalahan terakhir, waktu bolak-balik,
jumlah polling, ketersediaan. Kolektor menulis data tersebut secara lokal saat melakukan polling dan
mendorong kolom operasional yang dipilih ke instalasi utama secara massal. Ini memperbarui kolom-kolom
tersebut, bukan seluruh baris konfigurasi perangkat.

Jadi apa yang ditampilkan instalasi utama untuk keterjangkauan perangkat adalah pandangan kolektor,
pada saat pengiriman sukses terakhir. Kolektor yang offline memiliki pandangan terkini tentang perangkatnya
sendiri yang tidak dapat dilihat oleh siapa pun di instalasi utama.

Instalasi utama melacak kolektor dengan cara yang sama seperti kolektor melacak perangkat. Pembantu
keaktifan menganggap kolektor jarak jauh yang diaktifkan aktif hanya jika stempel waktu status terakhirnya
kurang dari dua kali interval polling yang dikonfigurasi. Pemeriksaan ini tidak membuktikan pengiriman
sampel, replikasi yang berhasil, atau grafik terkini.

## Mode kegagalan

| Apa yang gagal | Apa yang terjadi | Apa yang Anda perhatikan |
|---|---|---|
| Tautan ke instalasi utama | Kolektor dapat melanjutkan secara lokal selama database dan penjadwalnya sehat | Grafik tertunda dan antrean bertambah; pengiriman dan kehilangan harus diperiksa |
| Kolektor itu sendiri | Perangkat yang ditetapkan mungkin tidak lagi dipolling | Sampel hilang; diagnosis status penjadwal, perangkat, dan kolektor |
| Replikasi | Kolektor menjalankan konfigurasi yang lebih lama | Perubahan tampaknya tidak berlaku |
| Database pusat | Proses jarak jauh dapat memasuki mode offline jika koneksi gagal | Penyerapan pusat terganggu; buffering jarak jauh bergantung pada kesehatan lokal |
| Penugasan yang tumpang tindih atau basi | Lebih dari satu produsen dapat mengirimkan sampel terkait | Tidak ada penolakan universal; periksa penugasan, stempel waktu, dan kesalahan penulisan |

Buffering dapat mengubah beberapa pemadaman menjadi penundaan, tetapi tidak membuat pengiriman bebas
dari kehilangan. Periksa usia antrean, kapasitas database, kesalahan pemulihan, dan stempel waktu RRD
yang dihasilkan. Grafik datar saja tidak dapat membedakan pemadaman perangkat dari pengiriman yang
tertunda atau gagal.

## Berapa biayanya

Dibandingkan dengan poller pusat tunggal:

**Anda mendapatkan** waktu bolak-balik perangkat paralel di seluruh mesin, polling yang terjadi dekat
dengan perangkat daripada melalui WAN, dan kemampuan untuk melanjutkan pengumpulan lokal saat instalasi
utama tidak dapat dijangkau, tunduk pada batas pemulihan dan kesehatan lokal di atas.

**Anda membayar** dengan replikasi konfigurasi yang dapat tertinggal, database kedua untuk dioperasikan,
dipantau, dan dicadangkan per kolektor, mode penulisan tangguhan yang tidak lagi opsional, dan database
pusat yang sekarang menerima penulisan bersamaan dari setiap kolektor.

Ringkasan jujurnya adalah bahwa kolektor jarak jauh adalah mesin tambahan yang sekarang harus Anda
kelola. Satu poller dengan lebih banyak proses adalah pengaturan. Kolektor adalah infrastruktur, dengan
databasenya sendiri, kredensialnya sendiri, jamnya sendiri, dan versinya sendiri tentang kebenaran
selama replikasi belum berjalan.
