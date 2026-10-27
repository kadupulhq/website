---
title: Baca grafik pertama
description: Arti sebenarnya dari garis-garis tersebut, dan tiga kesalahan yang membuat orang salah membacanya.
sidebar:
  order: 4
banner:
  content: "Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini."
---

Grafik di sini bukanlah gambaran langsung dari data mentah Anda. Ini adalah visualisasi dari ringkasan data Anda, dan memahami ringkasan mana yang ditampilkan merupakan hal yang sangat penting.

## Apa yang sedang Anda lihat

Setiap grafik digambar dari arsip round-robin. Arsip ini menyimpan sampel terbaru pada resolusi penuh dan sampel lama yang dikonsolidasikan ke dalam wadah (bucket) yang lebih kasar. Saat Anda memperkecil tampilan hingga rentang satu tahun, Anda tidak melihat setiap sampel lima menit. Anda melihat satu nilai per wadah, yang dipilih oleh fungsi konsolidasi.

Fungsi tersebut biasanya adalah rata-rata (average). Fungsi ini juga bisa berupa maksimum atau minimum. Hal ini lebih penting daripada apa pun di halaman ini.

Untuk permintaan grafik on-demand biasa, Kadupul menyusun perintah RRDtool dari konfigurasi grafik dan menjalankannya terhadap berkas-berkas di disk. Tiga jenis baris dimasukkan ke dalam perintah tersebut dan memahami fungsinya masing-masing akan sangat membantu.

| Bagian | Fungsinya |
|---|---|
| Definisi | Menyebutkan berkas, sumber data di dalamnya, dan fungsi konsolidasi |
| Elemen gambar | Mengubah satu deret data menjadi garis, area berwarna, atau pita dalam tumpukan |
| Elemen legenda | Mencetak satu angka, yang dihitung di seluruh jendela waktu yang sedang Anda lihat |

Seluruh susunan ini dijelaskan dalam [Cara grafik digambar](/id/concepts/how-graphs-are-drawn/). Anda belum perlu menguasainya hari ini. Anda hanya perlu mengetahui bahwa definisi grafik dan rentang waktu yang diminta menentukan gambar yang dihasilkan. Penembolokan (caching) dan jalur grafik real-time dapat berperilaku secara berbeda.

## Mulai dengan empat jam terakhir

Mulailah dengan jendela waktu terkini yang pendek. Arsip yang dipilih bergantung pada masa retensi, ukuran langkah (step), dan resolusi grafik; rentang empat jam tidak menjamin data mentah atau data yang belum dikonsolidasikan. Bahkan arsip yang paling halus pun memuat nilai yang dinormalisasi terhadap waktu. Gunakan perintah debug grafik dan `rrdtool info` untuk memeriksa fungsi yang diminta dan langkah arsip yang tersedia sebelum membandingkan nilai.

Dua karakteristik pada grafik yang baru dibuat adalah normal, tetapi sering kali membuat pengguna khawatir.

**Garis dapat berakhir sebelum waktu sekarang.** Wadah data saat ini mungkin belum lengkap. Waktu pengumpulan, penyangga (buffering), dan normalisasi juga dapat menunda titik akhir yang terlihat. Periksa apakah stempel waktu pembaruan terus maju daripada menganggap jeda waktu tetap sebagai bukti kesehatan sistem.

**Bagian awal mungkin hilang.** Sumber data yang dibuat satu jam lalu hanya memiliki data selama satu jam dan kosong selama sebelas bulan sisanya. Arsip dialokasikan secara penuh saat pertama kali dibuat, sehingga bagian yang kosong tersebut adalah ruang penyimpanan nyata yang menunggu untuk digunakan.

## Perluas rentang waktu dan amati perubahan puncaknya

Perluas rentang waktu menjadi satu minggu. Nilai puncak dapat menyusut ketika grafik memilih rata-rata yang lebih kasar. Sebagai contoh, jika utilisasi mencapai 100% selama lima menit dan nol selama 55 menit sisanya, rata-rata per jamnya adalah sekitar 8,3%. Lonjakan empat menit dalam satu jam yang sebaliknya menganggur menghasilkan rata-rata sekitar 6,7%. Puncak singkat mungkin sudah dihaluskan di dalam interval pengambilan sampel aslinya.

Konsolidasi membuang detail. Jika riwayat beresolusi halus telah kedaluwarsa, memperbesar kembali tampilan tidak akan dapat merekonstruksinya dari arsip rata-rata.

Ini adalah kesalahan pertama dari tiga kesalahan umum, dan yang paling sering menimbulkan perdebatan.

**Membaca nilai rata-rata sebagai nilai puncak.** Jika Anda memperhatikan saturasi, lihatlah grafik yang dibangun berdasarkan nilai maksimum, bukan rata-rata. Hal itu hanya berfungsi jika arsip menyimpan nilai maksimum. Jika hanya tersisa rata-rata kasar, puncak asli tidak dapat direkonstruksi. Arsip MAX mempertahankan nilai maksimum dari titik-titik input yang dinormalisasi terhadap waktu, bukan puncak sesaat yang tidak teramati di antara siklus polling.

Ada perilaku fallback tersembunyi yang perlu diketahui di sini. Jika sebuah item grafik meminta nilai maksimum dan berkas tidak memilikinya, helper pemilihan Kadupul dapat beralih ke fungsi pertama yang tersedia, atau AVERAGE saat tidak dapat menentukan fungsi yang tersedia. Gambarnya terlihat normal, tetapi menjawab pertanyaan yang berbeda.

**Membaca celah kosong sebagai angka nol.** Celah mewakili nilai terplot yang tidak diketahui (unknown). Penyebabnya meliputi pembaruan yang terlewat, input eksplisit yang tidak diketahui, nilai yang ditolak, dan ekspresi grafik. Celah tersebut tidak secara khusus mengidentifikasi perangkat yang sedang down.

Heartbeat adalah waktu maksimum yang diizinkan di antara pembaruan, bukan waktu ekstra yang ditambahkan ke langkah. Sebagai contoh, langkah 300 detik dengan heartbeat 600 detik mengizinkan paling lama 600 detik di antara pembaruan, bukan 900. Ambang batas data tidak diketahui pada arsip juga memengaruhi celah yang terlihat. Lihat [RRDtool’s data-source definitions](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) dan [Waktu dan interval](/id/concepts/time-and-intervals/).

Waspadalah terhadap grafik bertumpuk di sini. Beberapa templat mengganti nilai yang tidak diketahui dengan angka nol dalam ekspresi grafiknya. Pada grafik semacam itu, gangguan layanan dan periode menganggur sengaja terlihat sama. Periksa tampilan yang tidak bertumpuk sebelum menyimpulkan bahwa suatu layanan berhenti bekerja.

**Membandingkan dua grafik dengan skala vertikal yang berbeda.** Dua grafik yang bersisian masing-masing akan menyesuaikan skala dengan datanya sendiri. Lonjakan kecil dan lonjakan besar dapat terlihat persis sama. Periksa sumbu sebelum menyimpulkan apa pun.

Saat Anda melihat sumbu, periksa juga basis bilangannya. Grafik dapat memberi label dalam ribuan (1000) atau dalam kelipatan 1024. Angka yang disimpan identik; hanya labelnya yang berubah. Perbedaannya bergantung pada awalan: 1024 dibandingkan 1000 berselisih 2,4% untuk pangkat pertama dan semakin melebar pada awalan yang lebih besar. Periksa juga bit versus bita (byte), ekspresi grafik, dan konsolidasi; perbedaan persentase saja tidak dapat mengidentifikasi penyebabnya.

## Membaca legenda

Legenda memuat angka-angka yang lebih penting daripada bentuk kurvanya. Nilai “Saat ini” (Current) biasanya merupakan reduksi LAST dari deret yang dipilih, yang tidak harus berupa pengukuran yang diambil persis pada detik Anda melihat grafik. Rata-rata dan maksimum dihitung di seluruh jendela waktu yang sedang Anda lihat, bukan di sepanjang waktu, sehingga nilainya berubah saat Anda mengubah zoom.

Item legenda bawaan mencakup minimum, maksimum, rata-rata, dan terakhir yang diberi label saat ini. Dua hal mengenai legenda ini sering kali mengejutkan pengguna.

**Angka legenda adalah reduksi dari apa yang digambar, bukan dari apa yang disimpan.** Nilai maksimum yang dicetak di atas deret yang dibaca dengan rata-rata adalah nilai maksimum dari rata-rata turunan tersebut pada resolusi yang dipilih. Ini bukan sampel mentah terbesar yang pernah diambil sepanjang masa. Pada tautan yang sibuk, keduanya adalah angka yang sangat berbeda, dan keduanya merupakan jawaban sah atas pertanyaan yang berbeda.

**Periksa deret mana yang digunakan oleh legenda.** Entri GPRINT biasa dapat mewarisi deret dari item gambar sebelumnya; item khusus minimum, maksimum, rata-rata, dan terakhir memiliki penanganan terpisah. Mengubah urutan item dalam templat grafik dapat mengubah angka yang dilaporkan legenda tanpa ada yang menyunting konfigurasi legenda itu sendiri. Jika sebuah angka berubah setelah pengeditan templat yang tidak terkait, periksa urutan item terlebih dahulu.

## Ketika grafik terlihat tidak benar

Periksa jalur pengumpulan data dengan urutan berikut; gangguan dapat terjadi pada lebih dari satu tahap.

1. Apakah perangkat merespons saat ini?
2. Apakah poller berjalan, dan selesai di dalam intervalnya?
3. Apakah berkas RRD memiliki waktu pembaruan terkini?
4. Apakah grafik membaca sumber data yang Anda duga?

Secara konkret:

**Langkah 1.** Jalankan perintah `snmpget` yang sama seperti saat Anda menambahkan perangkat, dari pengumpul yang ditetapkan. Jika gagal, selesaikan kegagalan pengumpulan data tersebut sebelum menilai grafik.

**Langkah 2.** Cari ringkasan akhir putaran poller. Jika tidak ada, periksa penjadwalan, tujuan log yang dikonfigurasi, dan kegagalan poller yang berhenti lebih awal. Eksekusi yang melebihi interval dapat menunda pembaruan; bandingkan celah pembaruan yang dihasilkan dengan heartbeat.

**Langkah 3.** Tanyakan langsung ke RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

Perintah `last` melaporkan stempel waktu pembaruan terakhir, termasuk pembaruan dengan nilai tidak diketahui; penulisan yang disangga dapat menundanya. Gunakan `lastupdate` dan `fetch` untuk memeriksa nilai seperti yang dijelaskan dalam panduan perangkat. `info` memberi tahu Anda tentang langkah, heartbeat, jenis sumber data, dan arsip mana saja yang ada. Jika berkas tidak memiliki arsip nilai maksimum, hal itu menjelaskan pertanyaan mengenai puncak di atas.

**Langkah 4.** Aktifkan mode debug grafik dan baca perintah yang dihasilkan grafik. Perintah tersebut menyebutkan nama berkas, sumber data di dalamnya, dan fungsi konsolidasi untuk masing-masing sumber data. Grafik yang mengarah ke sumber data yang berbeda dari yang Anda duga sering terjadi setelah templat diterapkan kembali atau antarmuka diindeks ulang.

## Gejala umum dan artinya

| Gejala | Biasanya |
|---|---|
| Garis datar di angka nol | Bisa berupa angka nol nyata atau ekspresi yang mengganti nilai tidak diketahui dengan nol |
| Garis berhenti, lalu lanjut kembali | Nilai tidak diketahui menginterupsi deret yang digambar; periksa pengumpulan data dan ekspresi grafik |
| Celah-celah kecil di seluruh grafik | Poller selesai terlambat, atau heartbeat diatur terlalu dekat dengan ukuran langkah |
| Puncak terlihat pada empat jam, hilang pada satu minggu | Periksa resolusi arsip dan konsolidasi sebelum berasumsi terjadi kehilangan data atau kegagalan pengumpulan |
| Maksimum pada legenda lebih rendah dari puncak yang digambar | Legenda mereduksi deret yang berbeda dari yang Anda duga |
| Seluruh grafik kosong, tanpa kesalahan | Tidak ada sumber data di belakangnya, atau belum ada data yang terkumpul |
| Nilai terpaut jauh hingga kelipatan sepuluh | Jenis sumber data salah, atau penghitung 32-bit bergulir (wrapping) |
| Dua grafik dari satu tautan sedikit berbeda | Basis sumbu berbeda, atau fungsi konsolidasi berbeda |

[Memecahkan masalah data hilang](/id/guides/troubleshoot-missing-data/) menelusuri alur ini secara lebih mendalam. [Menyesuaikan tampilan grafik](/id/guides/tune-graph-appearance/) membahas cara mengubah tampilan grafik setelah Anda memercayai data yang disajikannya.

Itulah seluruh panduan awal. Anda telah memiliki instalasi yang berfungsi, perangkat yang merespons, dan grafik yang dapat Anda baca. Dari sini, [Panduan penggunaan](/id/guides/monitor-a-switch/) memandu tugas-tugas spesifik, dan [Konsep](/id/concepts/architecture/) menjelaskan mengapa sistem bekerja seperti itu.
