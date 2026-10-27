---
title: "Apa itu Kadupul"
description: "Pengumpulan, penyimpanan, arsitektur, dan batas proyek untuk perencanaan 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji terisolasi. Draf terjemahan ini menunggu peninjauan orang yang fasih dalam bahasa ini."
---

Kadupul adalah aplikasi pemantauan jaringan dan pembuatan grafik. Aplikasi ini mengumpulkan pengukuran melalui SNMP dan skrip, menyimpan deret waktu dalam berkas RRD, serta membuat grafik dengan RRDtool. Ikhtisar ini diperiksa pada 26 Oktober 2026 terhadap revisi aplikasi yang ditautkan di bawah.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Status proyek untuk 2026–2027

Kadupul masih pra-alfa, tanpa rilis produksi yang didukung atau jalur migrasi produksi yang tervalidasi. Gunakan instalasi uji terisolasi. Tanggal dalam dokumentasi ini merupakan konteks perencanaan, bukan komitmen pengiriman. Periksa status proyek sebelum memilih revisi untuk dievaluasi.

[Status proyek](/id/project/status/)

## Pengumpulan dan penjadwalan

Penjadwal eksternal memulai poller. Poller membaca daftar pengumpulan yang disiapkan, memanggil kolektor PHP atau build Spine yang kompatibel, lalu memproses hasilnya. Interval pengumpulan dapat dikonfigurasi; lima menit hanyalah contoh, bukan aturan umum. Peluncur dapat menjalankan beberapa siklus lebih pendek di dalam intervalnya. Batas waktu, percobaan ulang, dan latensi perangkat menghabiskan anggaran waktu tersebut.

[Siklus poller](/id/reference/poller-lifecycle/)

## Retensi dan penyimpanan

Berkas RRD memiliki tata letak penyimpanan yang dipilih saat dibuat. Pengukuran terbaru dapat menyimpan lebih banyak detail daripada nilai lama yang dikonsolidasikan; retensi dibatasi arsip yang dikonfigurasi. Tidak semua sampel disimpan selamanya. Nilai tidak diketahui mewakili pengamatan yang hilang atau tidak dapat digunakan, bukan nol. Antrean basis data, log, dan statistik dapat bertambah meskipun berkas RRD yang ada tetap berukuran tetap.

[Sumber data dan arsip](/id/concepts/data-sources-and-rras/)

## Grafik dan istilah bersama

Perangkat adalah titik akhir yang dipantau. Kueri data menemukan item seperti antarmuka. Sumber data menjelaskan pengukuran dan penyimpanannya; grafik menjelaskan cara menampilkannya. Templat menggunakan ulang definisi, dan pohon mengatur navigasi. Semuanya merupakan rekaman terpisah: periksa pilihan penghapusan dan dependensinya sebelum menghapus. Grafik dibuat sesuai permintaan dari data yang dipertahankan; cache gambar dapat menggunakan kembali hasil yang telah dirender.

[Glosarium](/id/reference/glossary/)

## Komponen instalasi

Instalasi yang berfungsi menggabungkan aplikasi web PHP, MySQL atau MariaDB, penyimpanan RRD, RRDtool, dan peluncur pengumpulan. Kredensial perangkat dan konfigurasi berada dalam basis data atau berkas konfigurasi terlindungi. Cadangkan kode, konfigurasi, antrean basis data, dan riwayat RRD sebagai satu set yang konsisten, lalu latih pemulihannya. Dump basis data saja tidak memulihkan grafik historis.

[Pencadangan dan pemulihan](/id/guides/back-up-and-restore/)

## Main dan migrasi Symfony

Cabang aplikasi `main` memerlukan PHP 8.4 atau lebih baru dan menggabungkan layanan Symfony 7.4 dengan titik masuk web, poller, dan CLI lama. Jalur pemeliharaan `lts/1.2` memiliki persyaratan terpisah. Rute yang dimigrasi hidup berdampingan dengan rute lama; keberadaan layanan Symfony tidak membuktikan alur lama sudah dihentikan. Checkout sumber memerlukan dependensi PHP terkunci dan aset browser yang dihasilkan. Gunakan runtime dalam `mise.toml` aplikasi.

[Panduan migrasi](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Akun, plugin, dan akses penyimpanan

Visibilitas perangkat dan grafik bergantung pada izin pengguna dan grup. Plugin berjalan sebagai kode aplikasi tepercaya dengan akses akun proses; plugin tidak diisolasi dalam sandbox. Tinjau asal, hook, serta perilaku instalasi dan penghapusannya sebelum mengaktifkan. Penulis RRD lokal pada Unix memerlukan pemeriksaan identitas POSIX dan pengaturan kepercayaan eksplisit jika akun web dan poller berbeda. Windows tidak mendukung pemeliharaan destruktif RRD lokal.

[Evaluasi plugin](/id/guides/install-and-vet-plugins/)

## Kegunaan dan batasan

Evaluasi Kadupul untuk antarmuka jaringan, penghitung perangkat, sensor lingkungan, serta pengukuran lain yang tersedia melalui metode pengumpulan yang dapat Anda validasi. Perangkat lunak ini dihosting sendiri dan memerlukan pemeliharaan basis data, web, serta penjadwal. Polling numerik inti bukan penyimpanan log, sistem pelacakan terdistribusi, atau mesin kueri label berkardinalitas tinggi serbaguna. Peringatan ambang memerlukan plugin yang sesuai; verifikasi kompatibilitasnya dan jangan menganggap peringatan langsung berfungsi setelah instalasi.

## Asal, nama, dan kompatibilitas

Kadupul adalah fork Cacti independen berlisensi GPL-3.0-or-later, tanpa afiliasi atau dukungan dari The Cacti Group. Nama Sinhala-nya, කඩුපුල්, merujuk pada *Epiphyllum oxypetalum*, kaktus berbunga malam. Mempertahankan antarmuka plugin, templat, skema, dan riwayat RRD yang ada merupakan sasaran rilis yang memerlukan bukti untuk setiap revisi sumber dan kombinasi plugin.

[Kompatibilitas](/id/project/compatibility-with-cacti/)

## Mulai dengan satu perangkat terverifikasi

Ikuti instalasi, perangkat pertama, dan grafik pertama secara berurutan. Periksa log, stempel waktu pengumpulan, dan nilai yang dapat digunakan sebelum mempercayai gambar. Ukur durasi siklus dan pekerjaan dalam antrean dengan perangkat Anda sebelum memperluas. Gunakan konsep untuk memahami desain dan persyaratan untuk mengetahui prasyarat.

[Instalasi](/id/start/install/) · [Perangkat pertama](/id/start/first-device/) · [Grafik pertama](/id/start/first-graph/) · [Konsep](/id/concepts/architecture/) · [Persyaratan](/id/reference/requirements/)
