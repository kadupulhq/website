---
title: Mengelola retensi data
description: Pilih retensi dan resolusi, perkirakan ruang penyimpanan, dan rencanakan perubahan pada berkas RRD yang ada.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji terisolasi.
sidebar:
  order: 24
---

:::caution[Validasi sebelum penggunaan]
Kode sumber tersedia, namun belum ada rilis atau jalur migrasi Kadupul
yang didukung secara resmi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Retensi dikonfigurasi saat pembuatan berkas dan tetap tidak berubah selama pembaruan normal. Mengedit
profil di kemudian hari hanya mengubah bentuk berkas berikutnya dan membiarkan setiap berkas yang sudah ada
persis seperti sebelumnya. Tentukan hal ini dengan benar sebelum Anda membuat sepuluh ribu sumber
data, karena perubahan di kemudian hari memerlukan pemeliharaan berkas eksplisit atau migrasi.

Baca [Sumber data dan arsip](/id/concepts/data-sources-and-rras/) terlebih dahulu jika
istilah langkah (step), heartbeat, arsip, dan konsolidasi belum Anda pahami.

## Apa yang dimuat dalam profil

Profil sumber data adalah kebijakan retensi. Satu profil, satu pola penyimpanan.

| Bidang | Arti |
|---|---|
| Interval polling (step) | Seberapa sering nilai diharapkan masuk, dalam detik |
| Heartbeat | Interval maksimum yang diizinkan antar pembaruan sebelum masukan dianggap tidak diketahui |
| Faktor X-Files | Berapa banyak jendela konsolidasi yang boleh bernilai tidak diketahui sebelum nilai terkonsolidasi menjadi tidak diketahui |
| Fungsi konsolidasi | Fungsi mana di antara `AVERAGE`, `MIN`, `MAX`, `LAST` yang dipertahankan |
| Arsip | Satu baris per resolusi, masing-masing dengan tingkat agregasi dan jumlah baris |
| Bawaan | Apakah sumber data baru akan memilih profil ini |

Langkah secara bawaan mengikuti interval poller. Profil yang langkahnya lebih halus daripada
interval polling tidak dapat mengembalikan detail yang tidak pernah disampel. Apakah barisnya
bernilai tidak diketahui tergantung pada heartbeat dan normalisasi RRDtool.

## Apa yang disertakan secara bawaan

Tiga profil disediakan langsung saat instalasi. Ketiganya mempertahankan keempat fungsi konsolidasi.

| Profil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Profil 5 Menit adalah profil bawaan.

Masing-masing memiliki empat arsip. Tingkat agregasi dinyatakan sebagai pengali langkah,
sehingga resolusi sebenarnya adalah pengali dikalikan langkah profil, dan rentang waktu yang dicakup adalah
resolusi tersebut dikalikan jumlah baris.

### 5 Minute Collection

| Arsip | Pengali | Baris | Resolusi | Rentang waktu |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 menit | sekitar 2 hari |
| Weekly | 6 | 700 | 30 menit | sekitar 14 hari |
| Monthly | 24 | 775 | 2 jam | sekitar 64 hari |
| Yearly | 288 | 797 | 1 hari | sekitar 2 tahun 2 bulan |

### 1 Minute Collection

| Arsip | Pengali | Baris | Resolusi | Rentang waktu |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 menit | sekitar 2 hari |
| Weekly | 15 | 1440 | 15 menit | 15 hari |
| Monthly | 60 | 8784 | 1 jam | sekitar 366 hari |
| Yearly | 720 | 7305 | 12 jam | sekitar 10 tahun |

### 30 Second Collection

| Arsip | Pengali | Baris | Resolusi | Rentang waktu |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 detik | sekitar 1 hari |
| Weekly | 30 | 1346 | 15 menit | sekitar 14 hari |
| Monthly | 120 | 1445 | 1 jam | sekitar 60 hari |
| Yearly | 480 | 4380 | 4 jam | 2 tahun |

Nama-nama tersebut adalah label, bukan perilaku yang dipaksakan. Tidak ada yang mengharuskan arsip bernama
"Yearly" menyimpan data tepat satu tahun.

## Bagaimana profil menjadi berkas

Saat pembuatan, arsip dan fungsi konsolidasi profil dibaca dan
diubah menjadi perintah create. Langkah diambil dari nilai tersimpan `rrd_step`
milik sumber data, yang biasanya diisi dari profilnya. Setiap item sumber data yang disertakan menyumbang satu baris definisi
yang memuat nama, tipe, heartbeat, nilai minimum, dan nilai maksimum. Setiap arsip
menyumbang satu baris per fungsi konsolidasi, yang memuat fungsi, faktor X-Files, pengali, dan jumlah baris.

Empat arsip dikalikan empat fungsi konsolidasi menghasilkan enam belas definisi arsip
dalam berkas. Perkalian inilah yang menghabiskan ruang disk.

Jika berkas sudah ada, jalur pembuatan normal berhenti tanpa menulis ulang berkas tersebut.
Pengeditan profil tidak memigrasikan berkas secara otomatis. Alat pemeliharaan eksplisit
merupakan operasi terpisah yang dijelaskan di bawah ini.

## Memilih kebijakan

Tiga pertanyaan, dalam urutan ini:

**Apa pertanyaan paling mendetail yang akan Anda tanyakan?** Hal ini menentukan langkah. Langkah
30 detik menjawab "apa yang terjadi selama lonjakan 90 detik tersebut". Langkah 5 menit
tidak akan pernah bisa menjawabnya, untuk berkas apa pun yang dibuat di bawahnya. Langkah yang lebih halus membutuhkan kerja poller
pada setiap siklus dan menyita lebih banyak ruang disk.

**Seberapa jauh ke belakang Anda akan menanyakannya?** Hal ini menentukan jumlah baris arsip harian. Sebagian besar
instalasi membutuhkan beberapa hari pada resolusi penuh dan setelah itu cukup puas
dengan data yang lebih kasar.

**Pertanyaan mana yang bertahan setelah konsolidasi?** Hal ini menentukan fungsi konsolidasi.
`AVERAGE` menjawab apa yang lazim terjadi. `MAX` menjawab seberapa parah puncak yang tercapai.
`MIN` menjawab apakah pernah terjadi penurunan. `LAST` menjawab berapa nilai akhir pada
jendela tersebut, yang penting untuk pembacaan yang merupakan status, bukan laju.

Menghilangkan satu dari empat fungsi konsolidasi akan mengurangi muatan nilai yang disimpan pada
berkas baru sebesar seperempat di setiap resolusi. Ini juga merupakan
penyesalan yang paling sering disampaikan pengelola di kemudian hari. Pertahankan `MAX` kecuali Anda yakin tidak ada orang
yang akan menanyakan nilai puncak.

## Menentukan ukuran penyimpanan disk

Ukuran sebuah berkas diperoleh langsung dari angka-angka yang Anda pilih. Berdasarkan rumus ukuran yang digunakan
dalam antarmuka:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Antarmuka menggunakan 284 dan 300 bita sebagai perkiraan overhead tetap. Anggap ini
sebagai perkiraan ukuran, bukan deskripsi pasti untuk setiap format berkas RRDtool.
Setiap nilai yang disimpan berukuran 8 bita, dan total baris adalah jumlah hitungan baris di seluruh
definisi arsip profil sebelum dikalikan dengan fungsi konsolidasi.
Ukur berkas representatif dengan RRDtool terinstal sebelum menentukan kapasitas penyimpanan.

Untuk berkas dengan sumber data tunggal dan keempat fungsi konsolidasi:

| Profil | Total baris | Perkiraan ukuran berkas |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Kalikan dengan jumlah sumber data yang Anda rencanakan, bukan dengan jumlah grafik. Satu
grafik dapat menggabungkan bidang dari satu berkas atau beberapa berkas. Hitung berkas RRD sebenarnya
dan item sumber data di dalam masing-masing berkas.

Dua puluh ribu sumber data pada profil bawaan berukuran sekitar 1,8 GB. Dua puluh ribu
yang sama pada profil 1 Menit berukuran sekitar 13 GB. Rasio ini mencerminkan
resolusi sekaligus rentang waktu retensi profil yang berbeda, bukan hanya langkahnya.
Pengumpulan data yang lebih sering juga meningkatkan beban tulis disk. Lihat [Operasi tulis volume tinggi](/id/concepts/high-volume-writes/) sebelum memilih
langkah halus dalam skala besar.

Editor profil dan editor arsip menampilkan ukuran terhitung saat Anda mengubah angka-angkanya.
Gunakan fasilitas tersebut. Perhitungan aritmetika ini sangat mudah meleset hingga empat kali lipat.

## Dampak dan batasan mengubah profil

Bagian inilah yang sering kali menyebabkan hilangnya data riwayat.

| Perubahan | Dampak pada berkas baru | Dampak pada berkas lama |
|---|---|---|
| Menambah atau menghapus arsip | Diterapkan | Tidak ada |
| Mengubah jumlah baris | Diterapkan | Tidak ada |
| Mengubah tingkat agregasi | Diterapkan | Tidak ada |
| Menambah atau menghapus fungsi konsolidasi | Diterapkan | Tidak ada |
| Mengubah langkah | Sumber data baru mewarisinya; pembuatan memakai langkah tersimpan | Tidak ada migrasi berkas otomatis |
| Mengubah heartbeat | Pembuatan memakai metadata item sumber data tersimpan; lihat di bawah | Tidak ada penyesuaian berkas otomatis |
| Menghapus profil | Ditolak selama templat atau sumber data merujuknya, dan untuk profil bawaan | Tidak ada |

**Mengubah heartbeat pada profil yang sedang digunakan hanya memperbarui metadata.** Menyimpan heartbeat
baru akan menyimpannya pada profil dan pada item sumber data templat serta
sumber data lokal yang menggunakan profil tersebut; templat lain tidak diubah.

Penyimpanan tersebut tidak menyetel berkas RRD yang sudah ada. Cadangkan metadata maupun berkas,
dan bandingkan profil, item templat, item sumber data lokal, serta keluaran aktual
`rrdtool info` setelah pemeliharaan heartbeat.

Utilitas `cli/update_heartbeat.php` milik pengumpul utama dapat menyetel berkas yang ada
dan memperbarui metadata. Mulailah dengan `--help`, `--list-heartbeats`,
`--list-data-templates`, dan `--list-profiles`. Heartbeat baru harus didukung
dan minimal dua kali lipat interval poller yang dikonfigurasi. Gunakan `--data-template-id` untuk
membatasi pilihan; utilitas ini tidak menyediakan opsi uji coba (dry-run).

Tanpa `--force`, profil yang dipilih harus sudah memiliki heartbeat
yang diminta. Dengan `--force`, nilai profil bersama juga akan berubah, jadi periksa
semua penggunanya sebelum melanjutkan. `--prev-heartbeat` memfilter nilai basis data, bukan
heartbeat yang dibaca dari setiap berkas RRD: setelah penyimpanan web parsial, memilih nilai berkas
lama mungkin tidak cocok dengan apa pun. Verifikasi pilihan dan periksa berkas
yang dihasilkan. Pengujian terisolasi berhasil menyetel berkas yang ada dari 600 ke 900
setelah metadata profilnya diselaraskan.

Dua jebakan lain berada tepat di sampingnya.

**Editor membatasi perubahan struktural setelah profil digunakan.** Begitu
sumber data nyata menggunakan suatu profil, langkah, faktor X-Files, fungsi konsolidasi,
jumlah baris arsip, dan tingkat agregasi menjadi hanya-baca di editor;
kontrol penambahan/penghapusan arsip juga disembunyikan. Gandakan profil dan
edit salinannya. Pembatasan antarmuka ini bukan merupakan validasi sisi server
terhadap permintaan yang dikirimkan.

**Petakan ulang referensi sebelum menghapus profil.** Daftar menonaktifkan pemilihan
ketika sebuah templat atau sumber data lokal menggunakan profil, dan server menolak
menghapus profil yang masih dirujuk.

## Memindahkan sumber data antar profil

Terdapat tindakan massal pada templat data untuk mengubah profil. Tindakan ini menulis ulang
profil, langkah, dan heartbeat yang tersimpan pada templat, dan sengaja dibatasi
hanya pada baris templat. Sumber data yang sudah ada tidak disertakan.

Jadi urutan untuk migrasi sebenarnya adalah:

1. Buat profil baru dan periksa ukuran terhitungnya.
2. Arahkan templat data ke profil baru tersebut.
3. Terima bahwa semua yang dibuat mulai sekarang akan menggunakan bentuk baru.
4. Putuskan secara terpisah apa yang harus dilakukan terhadap berkas yang sudah ada.

Langkah keempat memiliki beberapa opsi, tergantung pada perubahan dan versi RRDtool yang terinstal.

**Biarkan apa adanya.** Struktur retensi yang berbeda dapat hidup berdampingan. Pastikan metadata
polling setiap sumber data yang ada konsisten dengan berkasnya; sekadar mengubah referensi
profil di basis data tidak akan memigrasikan langkah, bidang, atau arsipnya.

**Bangun ulang.** Hapus dan buat ulang sumber data. Cepat, tetapi riwayat data akan hilang.

**Sambung (Splice).** Utilitas baris perintah splice menggabungkan berkas lama ke dalam berkas baru dan
dapat mengubah resolusi saat melakukannya, asalkan berkas baru sudah memiliki
langkah yang tepat. Utilitas ini memiliki mode uji coba (dry run). Gunakan pada salinan cadangan sebelum
menerapkannya pada data penting Anda.

**Pemeliharaan RRDtool.** Tergantung pada versi terinstal dan perubahan yang diinginkan,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) atau
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) dapat memodifikasi
berkas yang ada sambil mempertahankan data yang tersimpan. Hentikan proses penulisan yang bersaing, simpan
cadangan, dan verifikasi hasilnya pada salinan. Operasi ini tidak menciptakan kembali detail
yang sudah dibuang oleh konsolidasi.

## Profil eksternal

Sumber data dapat disetel ke profil eksternal, yang mencatat langkah nol.
Hal ini menandakan bahwa berkas dikelola di luar alur normal, dan daftar sumber data
menampilkannya sebagai eksternal alih-alih mencantumkan interval waktu. Gunakan untuk berkas yang ditulis oleh
proses lain. Jangan menggunakannya untuk mengartikan "tanpa kebijakan", karena retensinya tetaplah
sesuai dengan konfigurasi awal saat berkas dibuat; hanya saja tidak dideskripsikan di tempat yang dapat Anda lihat.

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Pengeditan profil tampaknya tidak berpengaruh | Perilaku yang diharapkan. Berkas yang ada mempertahankan bentuk saat dibuat |
| Jumlah baris dan tingkat agregasi tidak dapat diedit | Profil sedang digunakan oleh setidaknya satu sumber data. Gandakan profil |
| Antarmuka menampilkan satu nilai heartbeat, tetapi berkas berperilaku lain | Heartbeat profil diubah dan berkas tidak pernah disetel |
| Pembuatan sumber data baru gagal, log mencatat tidak ada arsip yang ditetapkan | Profil dihapus saat sumber data masih merujuk kepadanya |
| Arsip paling halus dipenuhi nilai tidak diketahui | Periksa pembaruan yang terlewat, heartbeat, dan aturan konsolidasi |
| Grafik mingguan memiliki celah data setiap beberapa jam | Heartbeat terlalu dekat dengan langkah untuk poller yang mengalami keterlambatan |
| Puncak data yang terlihat kemarin hilang pada tampilan bulanan | Hanya `AVERAGE` yang disimpan, atau arsip `MAX` dibuang untuk menghemat ruang |
| Kapasitas disk membengkak empat kali lebih cepat dari perkiraan | Perkiraan menghitung arsip tetapi melewatkan fungsi konsolidasi |
| Resolusi yang diinginkan tidak ada pada menu tarik-turun arsip baru | Editor menawarkan arsip paling halus pada langkah profil, lalu hanya pilihan yang lebih kasar dari arsip yang ada |
