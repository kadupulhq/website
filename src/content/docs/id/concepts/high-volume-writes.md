---
title: Penulisan volume tinggi
description: Mengapa pembaruan RRD dibatasi oleh jumlah penulisan bukan ukuran penulisan, apa keuntungan pengelompokannya, dan apa kerugiannya terhadap kesegaran data.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 10
---

Pembaruan RRD menyentuh banyak file dan dapat dibatasi oleh latensi penyimpanan dan operasi I/O,
bukan hanya lebar pita transfer. Penulisan yang ditangguhkan, juga disebut Boost, mengumpulkan sampel
dalam database dan mengelompokkan pembaruan untuk setiap file. Ukur performa penulis dan database
sebelum memilihnya: celah pada grafik saja tidak secara langsung menunjukkan hambatan penyimpanan.

## Jalur default

Kolektor memasukkan hasil ke dalam antrean transit `poller_output`. Modul penulis mengelompokkan sampel
berdasarkan file dan stempel waktu, memperbarui RRD, dan melacak konfirmasi sebelum menghapus sampel
yang memenuhi syarat. Penulisan yang gagal dapat meninggalkan baris untuk dicoba kembali, sehingga
antrean tidak terbatas pada putaran polling saat ini saja.

Dalam versi yang ditinjau, antrean ini menggunakan InnoDB. Pemeriksaan awal pengumpulan menolak
antrean MEMORY; restart database tidak secara inheren membuang baris yang telah di-commit seperti
halnya pada tabel MEMORY. Ketahanan tetap bergantung pada konfigurasi database, kesehatan penyimpanan,
dan pencadangan. Lihat [Tingkatkan versi dengan aman](/id/guides/upgrade-safely/) untuk pemeriksaan
migrasi antrean dan penyimpanan.

Sebagai perkiraan beban kasar, 10.000 file berbeda yang diperbarui setiap 300 detik menyiratkan rata-rata
sekitar 33 pembaruan file per detik. Penulisan aktual datang secara beruntun; beberapa bidang sumber data
dapat berbagi satu file, langkah waktu dapat berbeda, dan jumlah perintah tidak sama dengan jumlah I/O
disk fisik. Bandingkan latensi penulis terukur dan usia antrean dengan jendela polling yang tersedia.

## Apa yang diubah oleh pemrosesan batch

Dengan penulisan yang ditangguhkan diaktifkan, pengumpulan menempatkan sampel di `poller_output_boost`
untuk diproses nanti. Penulis batch mengelompokkan sampel berdasarkan sumber data dalam urutan stempel
waktu dan dapat mengirim beberapa stempel waktu dalam satu perintah pembaruan RRDtool. Dua belas sampel
mungkin muat dalam satu perintah, tetapi ini tidak menjamin satu penulisan disk fisik.

Panjang argumen maksimum yang dikonfigurasi membatasi string pembaruan; defaultnya adalah 2.000.
Pengaturan ini memengaruhi pembentukan batch. Jangan menyimpulkan batasan sistem operasi tertentu dari
pengaturan ini: penulisan lokal yang dikonfirmasi menggunakan aliran perintah RRDtool, dan mekanisme
transportasi aktual serta ukuran perintah yang didukung adalah faktor penentu.

Penjadwal biasanya memenuhi syarat ketika timer-nya habis (default 60 menit) atau perkiraan jumlah baris
buffer melebihi ambang batas yang dikonfigurasi (default 1.000.000). Perkiraan baris mencakup tabel aktif
dan arsip. Pemanggilan penjadwal tetap harus terjadi, dan pemeriksaan proses, persiapan, atau kegagalan
penulis dapat menunda pekerjaan. Eksekusi paksa, pengurasan setelah penonaktifan, dan pembaruan grafik
berdasarkan permintaan adalah jalur tambahan; nilai default bukan merupakan jaminan kesegaran data satu jam.

Interval yang bernilai nol atau bukan bilangan bulat positif akan diganti dengan 120 menit; nilai
default standarnya adalah 60 menit.

## Rotasi, dan mengapa rotasi itu ada

Penyiapan batch membuat tabel kosong yang cocok dengan buffer aktif, lalu menukar nama dengan satu
pernyataan `RENAME TABLE`. Tabel aktif lama menjadi arsip dengan stempel waktu dan produsen menargetkan
tabel pengganti. Ini memisahkan batch dari penyisipan data baru, meskipun penguncian database dan perebutan
sumber daya masih dapat menunda pengumpulan.

Pekerja (workers) memproses arsip saat ini dan arsip yang dipertahankan. Proses induk memeriksa penyelesaian
dan status proses anak; eksekusi yang gagal atau tidak dapat diverifikasi mempertahankan arsip untuk dicoba
kembali. Selama pembersihan yang memenuhi syarat, arsip kosong dapat dihapus dan sampel yang tersisa dapat
dimasukkan kembali ke dalam buffer aktif sebelum menghapus arsip. Arsip yang tidak kosong tidak dibuang
begitu saja karena proses telah berakhir. Periksa antrean aktif dan arsip saat mendiagnosis penumpukan data.

Ini adalah penanganan percobaan ulang, bukan jaminan ketahanan terhadap crash universal. Kesalahan database,
aktivitas bersamaan, kerusakan penyimpanan, dan konsistensi pencadangan masih memerlukan validasi di
lingkungan yang dioperasikan.

## Mengapa melihat grafik dapat memperbarui filenya

Jalur grafik normal dapat mencoba pembaruan sesuai permintaan untuk setiap sumber data yang dirujuk oleh
grafik sebelum merendernya. Jalur ini tidak menguras setiap sampel yang tertunda secara tanpa syarat:
pemeriksaan kolektor, jalur waktu nyata/sumber/kesalahan, batas polling aktif, batas kueri, dan kegagalan
pembaruan memengaruhi apa yang dieksekusi. Sampel baru atau yang gagal dapat tetap berada dalam antrean.

Oleh karena itu, grafik yang terlihat terkini tidak membuktikan bahwa seluruh struktur pohon RRD telah
terkini, dan meminta grafik tidak menjamin pemutaran ulang data berhasil. Periksa kesalahan penulisan,
usia antrean, dan stempel waktu RRD yang sebenarnya. Cadangan yang hanya mencakup file mengabaikan sampel
database yang tertunda; lihat [Cadangkan dan pulihkan](/id/guides/back-up-and-restore/).

## Apa yang dikorbankan

**Kesegaran file.** Sampel tetap berada di database sampai berhasil diproses. Instalasi berbasis timer
yang sehat dapat mengalami jeda sekitar satu interval pengurasan; modul penulis yang gagal atau kurang
kapasitas dapat tertinggal lebih lama. Cadangkan antrean dan file yang tertunda secara konsisten.

**Jadwal kedua.** Pantau polling dan pengurasan secara terpisah. Amati baris aktif, arsip yang dipertahankan,
usia sampel tertua, pekerja yang gagal, dan throughput modul penulis. Tabel aktif tidak harus kosong selama
produsen masih memasukkan data, dan rotasi saja dapat membuatnya terlihat lebih kecil tanpa menyelesaikan
pembaruan RRD apa pun.

**Urutan waktu.** File RRD tidak menerima stempel waktu yang lebih lama setelah pembaruan yang lebih baru.
Jalur Boost modern melewati pembaruan masa lalu, dan jalur lama memfilter stempel waktu terhadap pembaruan
terakhir file. Perintah yang dikonfirmasi berhasil dapat mengabaikan data lama; pengiriman yang terlambat
tidak menjamin sampel muncul di grafik.

**Permukaan operasional.** Ada buffer database, proses pengurasan dengan batas memori, pekerja paralel
opsional, dan arsip yang dipertahankan atau sampel yang dimasukkan kembali ke antrean untuk dipantau.
Kegagalan penulis lokal umumnya mempertahankan sampel untuk dicoba lagi, namun ini tidak menjamin
keutuhan tanpa kehilangan data secara menyeluruh. Untuk jalur pemulihan jarak jauh, lihat
[Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/).

## Kapan fitur ini layak digunakan

Pertimbangkan penulisan yang ditangguhkan ketika pengukuran menunjukkan modul penulis RRD menjadi hambatan
utama dan database memiliki kapasitas untuk buffering dan kueri batch. Fitur ini tidak menghilangkan latensi
perangkat atau memperbaiki database yang kelebihan beban. Bandingkan throughput, usia antrean, kesegaran file,
dan penggunaan sumber daya sebelum dan sesudah mengaktifkannya.

Poller utama secara otomatis mengaktifkan pembaruan yang ditangguhkan ketika pengumpul data jarak jauh yang
aktif dikonfigurasi. Pengaturan itu saja tidak serta-merta membentuk penyebaran penyimpanan atau pemulihan
jarak jauh yang tervalidasi; gunakan batasan dalam
[Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/).

## Fitur berbeda dengan nama yang sama

Gambar grafik yang dirender juga dapat di-cache. Caching gambar mengurangi beban rendering berulang; penulisan
yang ditangguhkan mengelompokkan sampel database ke dalam pembaruan RRD. Pengaturannya terpisah, tetapi jalur
eksekusinya berinteraksi: permintaan grafik dapat memeriksa sampel yang tertunda sebelum menggunakan gambar
yang di-cache, dan pembaruan yang berhasil dapat memicu gambar baru untuk dirender. Evaluasi kesegaran gambar
secara terpisah dari kesegaran antrean dan file RRD.
