---
title: Sumber data dan arsip round-robin
description: Data apa yang disimpan, cara kerja retensi, dan alasan mengapa pengeditan profil tidak memigrasikan file RRD yang sudah ada.
sidebar:
  order: 2
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
---

Sumber data Kadupul mengelompokkan pengukuran dari waktu ke waktu dan biasanya dipetakan ke satu file RRD. Setiap bidang bernama di dalam file tersebut juga disebut sumber data (DS) oleh RRDtool. Bedakan objek aplikasi dari bidang-bidangnya saat membandingkan jumlah atau pengaturan.

Satu file tidak selalu berarti satu angka. Sumber data dapat membawa beberapa bidang, dan antarmuka adalah contoh umumnya: bita masuk dan bita keluar berbagi satu file yang sama, dikumpulkan sebagai item kerja terpisah, dan ditulis bersama sebagai satu pembaruan. Hal yang mereka bagi bersama adalah satu step, serangkaian arsip, dan masa retensi. Anda tidak dapat menyimpan salah satunya lebih lama daripada yang lain, karena retensi merupakan properti dari file dan bukan properti dari bidang.

## Apa yang ada di dalam file

File RRD terdiri dari header dan dua daftar.

Daftar pertama adalah bidang: nama, tipe, heartbeat, serta nilai minimum dan maksimum untuk masing-masing bidang. Daftar kedua adalah arsip: fungsi konsolidasi, berapa banyak step data mentah yang masuk ke dalam satu slot, berapa banyak slot yang tersedia, dan seberapa banyak data yang boleh bernilai unknown sebelum slot itu sendiri dianggap unknown.

Proses pembuatan merekam definisi-definisi ini ke dalam file. Metadata basis data dan definisi file aktual nantinya dapat berbeda; periksalah file menggunakan `rrdtool info` alih-alih menganggap template saat ini mendeskripsikannya secara persis.

<span id="the-decisions-that-are-permanent"></span>

## Keputusan pembuatan dan pemeliharaan selanjutnya

File RRD dialokasikan saat pembuatan. Pengeditan profil tidak memigrasikan file yang sudah ada. RRDtool menyediakan operasi penyesuaian dan perubahan ukuran yang dapat mempertahankan data yang tersimpan, namun membutuhkan validasi terpisah dan cadangan. Jalur pembuatan normal memeriksa keberadaan file yang sudah ada dan kembali tanpa menggantinya. Perlindungan tersebut tidak melarang penyesuaian atau migrasi eksplisit. Menyimpan template saja tidak memperbarui tata letak file yang sudah ada.

Empat pilihan direkam pada saat tersebut.

**Step.** Seberapa sering suatu nilai diharapkan tiba, biasanya 300 detik. RRDtool menormalisasi pembaruan ke batas step; pembacaan yang lebih sering tidak dibuang begitu saja. Apakah pembaruan yang lebih lambat menghasilkan data unknown bergantung pada aturan heartbeat dan konsolidasi. Step biasanya berasal dari profil sumber data. Pembuatan file membaca step yang tersimpan pada sumber data dan arsip dari profil yang dirujuk, jadi verifikasi keduanya saat mengubah metadata atau merencanakan migrasi.

**Tipe sumber data.** Lihat di bawah. Ini adalah tipe yang dapat gagal secara diam-diam.

**Batasan.** Nilai minimum dan maksimum membatasi nilai yang dapat diterima; untuk tipe DS penghasil laju, batas tersebut berlaku untuk laju yang dihitung, bukan total penghitung mentah. Data di luar jangkauan menjadi unknown alih-alih dipotong. Nilai maksimum berbasis kueri dapat menyelesaikan placeholder kecepatan antarmuka; tidak semua sumber antarmuka secara otomatis mendapatkan batas kecepatan tautan yang benar. Periksa satuan template dan definisi file aktual.

Pembuatan memiliki cabang normalisasi khusus. Untuk nilai maksimum literal pada atau di bawah batas minimum, GAUGE dan ABSOLUTE menggunakan maksimum yang tidak ditentukan; tipe lain menggunakan nilai minimum ditambah satu. Substitusi kueri mengambil cabang terpisah. Pemeriksaan nol/nol selanjutnya hanya mengubah nilai maksimum, dan normalisasi sebelumnya mungkin telah mengubahnya. Jangan perlakukan ini sebagai validator umum atau berasumsi kedua batas menjadi tidak ditentukan.

**Arsip.** Berapa banyak sampel yang harus disimpan pada resolusi apa, dan fungsi konsolidasi mana yang digunakan untuk masing-masing arsip. Hal inilah yang menentukan apakah Anda dapat menjawab pertanyaan dua tahun kemudian.

## Tipe sumber data

| Tipe | Menyimpan | Cocok untuk |
|---|---|---|
| `GAUGE` | Tingkat nilai, dinormalisasi ke step file | Suhu, rata-rata beban, memori yang digunakan, kedalaman antrean |
| `COUNTER` | Laju perubahan per detik, mengoreksi pembungkusan penghitung pada 32 atau 64 bit | Oktet antarmuka, jumlah paket dan kesalahan |
| `DERIVE` | Laju perubahan per detik, diizinkan bernilai negatif | Penghitung yang dapat berkurang atau disetel ulang secara sah |
| `ABSOLUTE` | Nilai sebagaimana diberikan, dibagi dengan waktu sejak pembacaan terakhir | Penghitungan yang disetel ulang oleh perangkat setiap kali dibaca |
| `COMPUTE` | Nilai yang dihitung dari bidang lain dalam file yang sama alih-alih dikumpulkan | Bidang turunan, seperti total atau rasio |

Kadupul mengekspos `DCOUNTER` dan `DDERIVE` jika versi RRDtool yang dikonfigurasi adalah 1.5 atau lebih baru. Keduanya menerima penghitung angka pecahan; DCOUNTER juga mendeteksi arah penghitungan dan reset, sehingga bukan sekadar COUNTER dengan desimal. Tabel tersebut menjelaskan semantik RRDtool, bukan bukti bahwa setiap tipe didukung oleh setiap editor atau jalur pembuatan Kadupul; validasi definisi yang dihasilkan, terutama untuk ekspresi COMPUTE. Lihat [referensi pembuatan RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) hulu.

### Kesalahan dalam memilih tipe

Contoh-contoh ini mengilustrasikan ketidakcocokan; keterlihatannya bergantung pada data dan batasan.

`GAUGE` pada penghitung yang terus bertambah membuat grafik tingkat nilainya, bukan throughput. Nilai dapat naik hingga pembungkusan atau reset; hal ini mungkin terlihat tetapi tidak selalu tampak salah secara jelas dalam rentang waktu yang singkat.

`COUNTER` menafsirkan penurunan menggunakan koreksi pembungkusan, sehingga reset dapat menjadi laju positif yang besar atau ditolak oleh nilai maksimumnya. `DERIVE` dengan nilai minimum nol menolak laju negatif, termasuk pembungkusan asli; pilih tipe ini hanya jika kompromi tersebut sesuai dengan metrik. Nilai maksimum tidak membedakan setiap reset dari pembungkusan yang sah.

`COUNTER` pada gauge adalah kesalahan yang berbahaya. Nilai yang disimpan menjadi perubahan pada gauge dibagi dengan waktu yang berlalu. Perangkat yang stabil pada suhu 40 derajat mencatat nol. Kenaikan satu derajat selama lima menit mencatat 0,0033. Grafiknya mungkin tampak masuk akal saat mengukur perubahan alih-alih suhu. Laju tersebut berguna hanya jika nilai itu memang besaran yang Anda maksudkan; nilai itu tidak mewakili tingkat gauge asli.

`ABSOLUTE` pada penghitung yang tidak disetel ulang saat dibaca merupakan kelas kegagalan diam-diam yang sama ke arah sebaliknya, menghasilkan nilai yang berskala dengan berapa lama perangkat telah aktif.

Aturan yang disarankan adalah menentukan tipe berdasarkan cara perangkat menghasilkan angka tersebut, bukan dari apa arti angka tersebut. Apakah suatu pembacaan berupa laju merupakan properti dari penghitung, bukan dari metrik.

## Heartbeat

Heartbeat adalah waktu maksimum yang diizinkan antara pembaruan untuk suatu bidang sebelum RRDtool memperlakukan interval tersebut sebagai unknown. Waktu ini diukur antara pembaruan, bukan sebagai waktu tambahan yang ditambahkan setelah step.

Periksa profil yang dikonfigurasi dan file aktual. Profil lima menit bawaan menggunakan heartbeat 600 detik, profil satu menit juga menggunakan 600 detik, dan profil tiga puluh detik menggunakan 1.200 detik. Oleh karena itu, toleransi kehilangan polling tidak dapat digambarkan dengan satu hitungan tetap; normalisasi dan konsolidasi juga memengaruhi interval grafik mana yang menjadi unknown.

Heartbeat berlaku per bidang, bukan per file. Nilai profil menjadi acuan metadata, tetapi pembuatan file membaca heartbeat item lokal, yang mungkin berbeda dari profil. Profil bawaan tidak menggunakan rasio tunggal, dan alasan di balik masing-masing profil, beserta akibat dari heartbeat yang disetel terlalu dekat dengan step, dibahas dalam [Waktu dan interval](/id/concepts/time-and-intervals/).

## Konsolidasi

Saat pembaruan tiba, RRDtool juga mengonsolidasikannya ke dalam kelompok yang lebih kasar; sistem tidak menunggu arsip paling detail kedaluwarsa. Fungsinya dipilih per arsip, dan setiap fungsi menjawab pertanyaan yang berbeda.

- `AVERAGE` merangkum titik data primer yang berkontribusi.
- `MAX` menyimpan nilai terbesarnya.
- `MIN` menyimpan nilai terkecilnya.
- `LAST` menyimpan nilai terakhirnya berdasarkan aturan konsolidasi RRDtool.

Fungsi-fungsi ini beroperasi pada titik data primer yang dinormalisasi, belum tentu pembacaan mentah aslinya. Arsip MAX tidak dapat memulihkan puncak seketika yang telah dirata-ratakan dalam interval primer; MIN bukanlah detektor yang dapat diandalkan untuk setiap gangguan pemadaman.

Sebuah file menyimpan satu arsip per fungsi per resolusi, sehingga mempertahankan keempat fungsi pada empat resolusi berarti enam belas arsip dan empat kali payload nilai dibandingkan hanya mempertahankan rata-rata dengan jumlah baris yang sama. Beban header dan status persiapan juga menggunakan ruang penyimpanan. Ketiga profil bawaan memilih empat fungsi; tentukan retensi sesuai dengan pertanyaan dan persyaratan kapasitas pada penerapan Anda.

Jika Anda hanya menyimpan rata-rata, Anda tidak dapat menanyakan tentang nilai puncak di kemudian hari. Nilai puncak tersebut tidak pernah dicatat. Ini adalah penyesalan paling umum dalam instalasi jangka panjang, dan tidak dapat diperbaiki secara retroaktif.

Beberapa jalur item penggambaran mengganti fungsi yang tersedia saat fungsi yang diminta tidak ada; jalur lain dapat gagal. Verifikasi DEF yang dihasilkan dan arsip aktual seperti yang dijelaskan dalam [Cara grafik digambar](/id/concepts/how-graphs-are-drawn/).

## Unknown adalah nilai nyata

RRD membedakan nol dari unknown. Nol dapat berupa tingkat yang dilaporkan atau laju yang dihitung, seperti penghitung yang tidak berubah. Unknown dapat dihasilkan dari pembaruan yang hilang, berakhirnya heartbeat, masukan unknown eksplisit, batasan yang ditolak, atau data konsolidasi yang tidak mencukupi. Mengganti unknown dengan nol dapat membuat pengukuran yang hilang atau tidak valid terlihat seperti kondisi menganggur.

Unknown merambat melalui konsolidasi di bawah ambang batas yang ditetapkan per arsip. Profil bawaan menetapkannya pada setengah: slot kasar yang dibangun dari masukan yang sebagian hilang tetap berupa angka nyata hingga lebih dari separuh masukannya bernilai unknown, pada saat itulah seluruh slot menjadi unknown. Visibilitas bergantung pada perataan bucket, heartbeat, normalisasi, konsolidasi, dan penyajian grafik. Tidak ada durasi gangguan universal yang menjamin jeda muncul atau hilang di setiap arsip.

Unknown juga merupakan hasil yang dihasilkan oleh batasan. Pembacaan di atas batas maksimum yang dikonfigurasi tidak dipotong ke nilai maksimum. Reset penghitung dapat menghasilkan laju di luar jangkauan dan jeda, tetapi batasan tidak menangkap setiap kejadian reset. Data unknown saja tidak dapat mengidentifikasi penyebabnya; bandingkan kesalahan pengumpulan dan stempel waktu.

## Penentuan ukuran

Untuk tata letak yang tidak berubah, payload nilai arsip adalah total slot di seluruh arsip, dikalikan jumlah bidang, dikalikan delapan bita. Ukuran total file dan penerapan juga mencakup header, status persiapan, alokasi sistem file, antrean, dan cadangan. Pemeliharaan tata letak eksplisit dapat mengubah ukuran file.

Ketiga profil bawaan memiliki perbedaan yang lebih besar daripada yang disiratkan oleh namanya.

| Profil | Step | Slot per bidang | Payload per bidang | Biaya relatif |
|---|---|---|---|---|
| Pengumpulan 5 Menit | 300 dtk | 11.488 | sekitar 90 KiB | 1 |
| Pengumpulan 30 Detik | 30 dtk | 40.284 | sekitar 315 KiB | 3,5 |
| Pengumpulan 1 Menit | 60 dtk | 81.716 | sekitar 640 KiB | 7 |

Sumber data antarmuka dua bidang melipatgandakan masing-masing nilai tersebut. Sepuluh ribu antarmuka pada profil lima menit memiliki payload nilai arsip sekitar 1,8 GB. Sepuluh ribu antarmuka yang sama pada profil satu menit mendekati 13 GB, dan alasannya bukan hanya karena step itu sendiri; profil tersebut juga menyimpan arsip bulanan yang jauh lebih dalam dan arsip tahunan sepuluh tahun.

Cakupan sebenarnya dari setiap arsip perlu diperiksa berdasarkan namanya. Arsip profil lima menit diberi label Harian, Mingguan, Bulanan, dan Tahunan, dan rentang yang ditampungnya adalah 50 jam, 14,6 hari, 64,6 hari, dan 2,2 tahun. Nama-nama tersebut menjelaskan prasetel grafik yang disesuaikan ukurannya untuk setiap arsip, bukan retensi. Jika Anda perlu menjawab pertanyaan tentang bulan April lalu pada resolusi lima menit, label akan memberi tahu Anda bahwa Anda bisa, sementara arsip tidak dapat menyediakannya.

Beban penulisan juga berubah mengikuti profil, dan dampaknya tiba jauh sebelum disk mengalaminya. Pada irama pengumpulan penuh, step tiga puluh detik menghasilkan interval sampel sepuluh kali lebih banyak daripada step lima menit. Pengelompokan, bidang bersama, pemilihan pekerjaan yang jatuh tempo, dan percobaan ulang yang gagal memengaruhi jumlah penulisan perintah dan penulisan fisik; keduanya bukan rasio tetap. Lihat [Penulisan bervolume tinggi](/id/concepts/high-volume-writes/).

## Bidang mana yang masuk ke dalam file

Sumber data yang dibangun dari template data hanya mendapatkan bidang di dalam file untuk bidang yang dirujuk oleh beberapa item grafik dalam jalur pembuatan normal. Kode pembaruan dapat mengecualikan bidang template yang tidak dirujuk; apakah bidang tersebut dikumpulkan bergantung pada metode input dan cache, bukan semata-mata apakah suatu garis terlihat. Sumber data tanpa template mendapatkan setiap bidang, dengan alasan bahwa mungkin tidak ada grafik yang memintanya.

Sebuah rujukan tidak harus menggambar garis yang terlihat: periksa pemetaan item grafik serta cache dan definisi file. Menambahkan bidang template saja tidak membuktikan bahwa pengumpulan, pemetaan grafik, dan penyimpanan semuanya telah siap. Membangun ulang cache menangani metadata pengumpulan; tindakan ini tidak menambahkan bidang ke RRD yang sudah ada.

Hal ini juga berarti menambahkan bidang ke template tidak secara otomatis menambahkannya ke file yang sudah ada, bahkan setelah item grafik merujuknya. Menambahkan bidang memerlukan pemeliharaan atau migrasi eksplisit. Bergantung pada versi RRDtool yang terpasang, penyesuaian dapat menambahkan sumber data sambil mempertahankan data yang sudah ada; menghapus dan membuat ulang file akan menghilangkan riwayatnya. Lihat [Mengelola retensi data](/id/guides/manage-data-retention/) untuk opsi pemeliharaan dan pemeriksaannya.
