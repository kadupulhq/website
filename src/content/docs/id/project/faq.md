---
title: Pertanyaan yang Sering Diajukan
description: Jawaban ringkas untuk pertanyaan awal yang sering diajukan pengguna baru dan pengguna Cacti, disertai tautan ke halaman penjelasan lengkap.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Kode tersedia, tetapi belum ada rilis yang didukung untuk produksi atau jalur migrasi yang tervalidasi. Jangan gunakan dalam lingkungan produksi.
sidebar:
  order: 7
---

Jawaban ringkas. Masing-masing menautkan ke halaman yang membahas topik tersebut secara menyeluruh.

## Proyek

### Bisakah saya memasangnya hari ini?

Kode sumber tersedia untuk pengembangan dan pengujian terisolasi. Belum ada rilis resmi yang didukung maupun jalur pemasangan produksi yang tervalidasi.

Halaman pemasangan dan panduan praktis memerlukan validasi terhadap kode aktual yang Anda gunakan. Lihat [Status proyek](/id/project/status/).

### Apakah proyek ini siap untuk produksi?

Tidak. Repositori mengklasifikasikan Kadupul sebagai pra-alfa dan belum siap untuk produksi. Status rilis tidak menunjukkan apakah ada pihak yang telah menerapkan kode pengembangan.

### Apakah ini pengganti langsung untuk Cacti?

Kadupul adalah fork independen dengan prioritas pengembangan dan saluran dukungan mandiri. Proyek ini berstatus pra-alfa; migrasi memerlukan validasi terhadap versi dan ekstensi yang digunakan. Lihat [Beralih dari Cacti](/id/guides/coming-from-cacti/).

### Mengapa membuat proyek terpisah?

Kadupul menyediakan ruang untuk mengganti subsistem, meningkatkan batas dasar bahasa pemrograman, dan menyesuaikan antarmuka internal di bawah kebijakan rilis sendiri. Lihat [Alasan fork ini dibuat](/id/project/why-this-fork/).

### Dari versi Cacti mana proyek ini difork?

Aplikasi ini diturunkan dari Cacti 1.2.31. Repositori mengelola lini cabang `main` dan `lts/1.2` dengan tujuan rilis yang berbeda. Lihat [Status proyek](/id/project/status/).

### Siapa yang mengelolanya?

Proyek Kadupul mengelola repositori ini. Gunakan pelacak masalah dan [proses kontribusi](/id/project/contributing/) untuk berpartisipasi dalam pekerjaan proyek.

### Apakah ada peta jalan, jadwal rilis, atau kebijakan dukungan?

Repositori memiliki sasaran rilis, kebijakan penomoran versi, dan alur kontribusi. Belum ada rilis produksi yang didukung secara resmi. Lihat [Status proyek](/id/project/status/) untuk membedakan antara versi terencana dan artefak yang telah dipublikasikan.

### Apakah berafiliasi dengan The Cacti Group?

Tidak. Kadupul tidak berafiliasi dengan atau didukung oleh The Cacti Group. Proyek ini mendeskripsikan dirinya sebagai fork dari Cacti karena itu adalah pernyataan faktual tentang asal usul kodenya. Cacti adalah proyek dan nama dagang mereka.

### Apa arti dari nama ini?

Kadupul adalah nama dalam bahasa Sinhala untuk kaktus yang bunganya mekar di malam hari. Cacti mengambil namanya dari famili tanaman secara keseluruhan; Kadupul adalah salah satu spesies di dalamnya. Nama ini mencerminkan asal usul proyek tanpa mengklaim mewakili keseluruhannya. Penjelasan lebih panjang ada di [Apa itu Kadupul](/id/start/what-kadupul-is/).

## Beralih dari Cacti

### Apakah plugin saya akan berfungsi?

Itulah sasaran kami. API plugin merupakan salah satu dari empat target kompatibilitas utama. Kemampuan memuat dan menjalankan plugin Cacti tanpa perubahan harus dibuktikan untuk versi yang digunakan.

Kompatibilitas adalah tujuan rekayasa, bukan jaminan mutlak untuk semua plugin. Periksa plugin dan versi yang sebenarnya Anda andalkan sebelum merencanakan migrasi. Lihat [Kompatibilitas dengan Cacti](/id/project/compatibility-with-cacti/) dan [Beralih dari Cacti](/id/guides/coming-from-cacti/).

### Apakah berkas RRD saya akan tetap berfungsi?

Mempertahankan riwayat RRD merupakan tujuan kompatibilitas yang mendasar. Berkas-berkas tersebut menyimpan rekaman historis yang tidak dapat dibuat ulang. Uji pembacaan berkas pada salinan data sebelum melakukan migrasi apa pun.

Setiap prosedur migrasi yang meminta Anda membuang dan membuatnya kembali dari awal adalah sesuatu yang harus Anda tolak. Lihat [Beralih dari Cacti](/id/guides/coming-from-cacti/).

### Apakah templat dan basis data saya akan terbawa?

Templat dirancang untuk dapat diimpor tanpa modifikasi. Skema basis data dirancang untuk tetap dikenali dan dapat dimigrasikan tanpa ekspor ke format perantara. Ini adalah target yang membutuhkan validasi nyata, sama seperti plugin dan berkas RRD.

### Di mana terdapat perbedaan antara Kadupul dan Cacti, bagaimana saya mengetahuinya?

Melalui dokumentasi tertulis. Skenario buruk yang ingin dihindari proyek bukanlah perbedaan itu sendiri, yang memang menjadi tujuan dari sebuah fork, melainkan perbedaan yang tidak terdokumentasi, yang mengubah setiap pembaruan sistem menjadi penyelidikan melelahkan.

### Apakah ini berfungsi dengan Spine?

Kadupul akan mengelola fork Spine bersamaan dengan pengumpul data PHP. Lokasi repositori dan build yang tervalidasi belum didokumentasikan di sini. Spine dikompilasi dan dipasang secara terpisah. Integrasi bawaan mencakup pengaturan `poller_type` dan jalur sistem, baris perintah poller induk, pengaturan yang dibaca Spine, serta tabel yang ditulisnya.

Validasi versi Kadupul dan Spine Anda secara bersamaan sebelum pengalihan sistem. Laporkan masalah di [pelacak masalah Kadupul](https://github.com/kadupulhq/kadupul/issues). Lihat [Spine, pengumpul data C](/id/reference/spine/) untuk panduan kompilasi dan konfigurasi.

### Apakah ini kompatibel dengan proxy RRDtool?

Kadupul tidak menggunakan daemon proxy milik organisasi Cacti. Gunakan penyimpanan RRDtool lokal. Halaman [Referensi proxy RRDtool](/id/reference/rrdproxy/) mencatat protokol klien bawaan; ini bukan opsi penerapan yang didukung. Solusi pengganti milik Kadupul harus dibangun dan divalidasi sebelum implementasi proxy didokumentasikan secara resmi.

### Apa saja yang dibutuhkan untuk menjalankannya?

Server web dengan PHP, MySQL atau MariaDB, RRDtool, serta penjadwal untuk menjalankan poller secara berkala. Versi dan ekstensi yang diperlukan tercantum di [Persyaratan sistem](/id/reference/requirements/).

## Ketentuan lisensi

### Di bawah lisensi apa perangkat lunak ini didistribusikan?

GPL-3.0-or-later.

### Cacti menyatakan GPL-2. Bagaimana sebuah fork bisa berlisensi GPL-3?

Lisensi aplikasi yang diwariskan secara eksplisit mengizinkan penggunaan GPL versi 2 atau versi yang lebih baru. Kadupul menggunakan opsi versi yang lebih baru untuk distribusinya. Dependensi pihak ketiga mempertahankan ketentuan lisensi aslinya. Lihat [Lisensi](/id/project/license/).

### Apa lisensi untuk dokumentasi ini?

CC BY-SA 4.0. Kode situs ini tetap berada di bawah GPL-3.0-or-later bersama bagian proyek lainnya. Anda dapat menggunakan kembali teks ini jika Anda mencantumkan kredit ke proyek dan melisensikan karya turunan Anda dengan ketentuan yang sama.

### Dari mana halaman-halaman ini berasal?

Halaman-halaman ini mendeskripsikan perilaku yang dibuktikan langsung dari kode sumber aplikasi. Prosa pihak ketiga memerlukan peninjauan lisensi mandiri sebelum digunakan kembali.

Ketentuan tersebut berlaku sama untuk setiap kontribusi. Perubahan dokumentasi mendasarkan klaimnya pada fakta kode sumber. Lihat [Berkontribusi](/id/project/contributing/).

## Berpartisipasi

### Bagaimana cara melaporkan kerentanan keamanan?

Secara rahasia, melalui GitHub Security Advisories pada repositori yang bersangkutan. Bukan melalui pembukaan issue publik.

Kode yang belum dirilis secara resmi mungkin telah diterapkan dan mengandung kerentanan. Laporkan secara privat terlepas dari status rilisnya. Lihat [Kebijakan keamanan](/id/project/security/).

### Kerentanan yang saya temukan di sini mungkin memengaruhi Cacti juga. Apa yang terjadi selanjutnya?

Laporkan secara rahasia kepada Kadupul dan sertakan rincian yang Anda ketahui tentang kode bersama tersebut. Pengelola Kadupul menangani triase dan perbaikan untuk Kadupul berdasarkan [kebijakan keamanan repositori](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Bagaimana cara saya berkontribusi?

Baca [Berkontribusi](/id/project/contributing/) dan panduan kontributor pada cabang target Anda. Diskusikan perubahan substansial sebelum mengimplementasikannya.

### Saya menemukan kesalahan di situs web ini.

Bagus sekali. Setiap halaman di sini ditulis berdasarkan kode sumber, dan setiap ketidakakuratan dinilai berdasarkan fakta konkret. Setiap halaman menyediakan tautan untuk menyunting.
