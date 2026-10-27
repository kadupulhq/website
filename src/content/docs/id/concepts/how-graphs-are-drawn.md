---
title: Bagaimana grafik digambar
description: Jalur dari berkas round-robin ke gambar yang dirender, dan mengapa angka tersimpan yang sama dapat menghasilkan gambar yang sangat berbeda.
sidebar:
  order: 4
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
---

Permintaan gambar standar dapat merangkai perintah RRDtool dari konfigurasi grafik dan membaca berkas RRD yang dirujuk. Gambar dalam cache yang valid juga dapat memenuhi permintaan, dan pemrosesan Boost sesuai permintaan dapat memperbarui berkas sebelum rendering. Lihat [Penulisan bervolume tinggi](/id/concepts/high-volume-writes/) untuk batasan kesegaran data.

## Urutan operasi

Untuk permintaan yang berlanjut ke pembuatan perintah:

1. Tentukan jendela waktu yang diminta dan konfigurasi grafik.
2. Perkirakan resolusi dari profil basis data dan pilih fungsi konsolidasi.
3. Keluarkan referensi `DEF` yang telah dideplikasi untuk bidang dan fungsi yang diperlukan.
4. Keluarkan ekspresi `CDEF` dan `VDEF` yang dirujuk.
5. Keluarkan item penggambaran dan pencetakan dalam urutan yang dikonfigurasi, beserta opsi dan perubahan plugin yang berlaku.
6. Biarkan RRDtool membaca berkas sebenarnya dan merender hasilnya.

## Memilih arsip

Kadupul membaca baris profil basis data saat menghitung rentang arsip dan opsi grafik. Perkiraan otomatisnya mempertimbangkan waktu langkah dikali jumlah langkah dikali jumlah baris, cakupan yang diminta, dan jumlah langkah arsip; pemilihan arsip eksplisit mengikuti jalur terpisah. Perhitungan profil ini tidak memeriksa setiap arsip fisik dalam setiap berkas dan dapat berbeda dari berkas yang ada setelah perubahan profil.

Perintah `DEF` yang dihasilkan menentukan berkas, nama sumber data, dan fungsi konsolidasi. RRDtool memilih arsip yang tersedia pada resolusi yang sesuai dan dapat mengonsolidasikan data lebih lanjut untuk lebar grafik dan jendela waktu. Perkiraan aplikasi bukanlah jaminan bahwa arsip fisik tertentu dibaca. Lihat dokumentasi hulu [definisi data RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Memperlebar jendela atau mengubah lebar gambar dapat mengubah resolusi yang ditampilkan. Deret yang lebih kasar berbasis rata-rata dapat menyembunyikan lonjakan singkat meskipun arsip yang lebih halus masih menyimpannya. Bandingkan tata letak fisik berkas dan perintah yang dijalankan, bukan hanya profilnya. Lihat [Sumber data dan arsip round-robin](/id/concepts/data-sources-and-rras/).

Ketika pemanggil tidak memberikan waktu akhir, perender normal pada awalnya menggunakan pergeseran waktu eksekusi terakhir poller utama relatif terhadap waktu sekarang, kembali ke interval polling jika nilai tersebut tidak tersedia atau berada di masa depan. Kode berikutnya juga memiliki mekanisme fallback interval konsolidasi, tetapi itu bukan standar universal. Waktu akhir yang eksplisit mengesampingkan inisialisasi normal ini; grafik yang berakhir sebelum sekarang tidak dengan sendirinya membuktikan arsip mana yang dipilih atau bahwa sampel terbaru telah ditulis.

## Item grafik

Grafik adalah daftar item yang berurutan. Pembuatan perintah dapat menghilangkan item, menggunakan kembali definisi, atau memperluas satu item menjadi beberapa instruksi. Urutan penggambaran berpengaruh pada lebih dari sekadar tata letak visual.

| Item | Menggambar | Catatan |
|---|---|---|
| `AREA` | Area terisi dari sumbu hingga ke nilai | Area berikutnya menimpa area sebelumnya |
| `STACK` | Area terisi mulai dari bagian atas item sebelumnya | Dikeluarkan sebagai area dengan bendera stack |
| `LINE1`, `LINE2`, `LINE3` | Garis dengan ketebalan satu, dua, atau tiga piksel | Dapat dibuat putus-putus |
| `LINE:STACK` | Garis yang digambar di atas total tumpukan kumulatif | |
| `TICK` | Tanda centang di sepanjang tepi plot | Berguna untuk status, bukan besaran |
| `GPRINT` | Tidak ada. Mencetak satu angka ke dalam legenda | |
| `COMMENT` | Tidak ada. Mencetak teks legenda harfiah | Komentar panjang dibungkus barisnya |
| `HRULE` | Garis horizontal pada nilai tetap | |
| `VRULE` | Garis vertikal pada waktu tetap | |
| `TEXTALIGN` | Tidak ada. Mengatur perataan untuk teks legenda berikutnya | |

Daftar lengkap, termasuk kolom konfigurasi mana yang berlaku untuk jenis mana, terdapat di [Item grafik](/id/reference/graph-items/).

`AREA` dan `STACK` adalah pasangan yang paling sering disalahpahami. Suatu area dimulai dari nol, sehingga dua area saling bertumpuk dan area yang lebih tinggi menutupi yang lebih rendah. Suatu tumpukan dimulai dari tempat item sebelumnya berakhir, sehingga tinggi tampak dari pita kedua adalah nilainya sendiri, tetapi tepi atasnya adalah total kumulatif. Bacalah grafik bertumpuk sebagai ketinggian pita, bukan sebagai posisi sumbu Y absolut, atau Anda akan salah menafsirkan setiap deret kecuali yang paling bawah.

`HRULE` menerima nilai yang dapat berisi substitusi templat. Karakter non-numerik dihapus dari hasil akhir, dan jika tidak ada angka yang tersisa, aturan akan digambar pada angka nol alih-alih menggagalkan render. Garis di posisi nol bisa jadi disengaja atau merupakan akibat dari substitusi yang gagal. Periksa perintah yang diselesaikan sebelum mengambil kesimpulan. Filter numerik juga dapat mengubah string yang berisi unit atau notasi numerik yang tidak didukung.

`VRULE` menerima stempel waktu Unix atau pasangan `hours:minutes`. Komponen jam negatif ditafsirkan sebagai pergeseran mundur dari sekarang alih-alih waktu jam dinding.

## Dua tugas, satu kata

Istilah fungsi konsolidasi digunakan untuk dua tujuan berbeda, dan empat nama yang sama, `AVERAGE`, `MIN`, `MAX`, dan `LAST`, muncul di kedua tempat.

Tugas pertama adalah pemilihan arsip. Suatu `DEF` menyebutkan berkas, sumber data di dalamnya, dan fungsi konsolidasi. Fungsi tersebut membatasi rumpun arsip yang diminta. Mintalah `MAX` maka RRDtool membutuhkan data konsolidasi tersimpan yang cocok, bergantung pada fallback aplikasi yang dijelaskan di bawah ini dan pemilihan resolusi.

Tugas kedua adalah aritmetika legenda. Suatu `GPRINT` mereduksi seluruh jendela yang digambar menjadi satu angka tercetak, dan fungsinya menentukan cara perhitungannya. Reduksi tersebut terjadi pada deret yang sudah dibaca; ini adalah agregasi presentasi, bukan penyimpanan fisik.

Jadi, `GPRINT` yang menampilkan `MAX` pada `DEF` yang dibaca dengan `AVERAGE` mencetak nilai terbesar dari deret rata-rata tersebut sepanjang jendela yang dirender, bukan sampel mentah terbesar secara mutlak. Lima menit hanyalah contoh; resolusi efektif bervariasi. Itu adalah angka yang berbeda, dan pada jalur yang sibuk perbedaannya sangat besar. Kedua pembacaan tersebut valid. Namun kemungkinan hanya satu yang sesuai dengan maksud Anda.

## Fallback tersembunyi

Untuk jenis item yang menggunakan pembantu fungsi terbaik, Kadupul membaca fungsi konsolidasi berkas dan menggunakan fungsi yang diminta jika ada, atau fungsi pertama yang dilaporkan. Jika tidak ada yang diperoleh untuk sumber data lokal yang valid, pembantu akan kembali ke AVERAGE. Varian GPRINT tetap mengikuti jalur terpisah dan tidak menggunakan pembantu ini, jadi ini bukan jaminan universal bahwa setiap fungsi yang hilang akan diperbaiki.

Oleh karena itu, item gambar yang meminta `MAX` dapat berakhir dengan membaca rata-rata jika berkasnya hanya berisi arsip AVERAGE. Periksa `DEF` yang dihasilkan dan keluaran `rrdtool info`. Pemeliharaan arsip dapat mengubah tata letak yang ada, tetapi menambahkan arsip tidak dapat merekonstruksi puncak historis yang dibuang oleh perhitungan rata-rata sebelumnya. Lihat [Mengelola retensi data](/id/guides/manage-data-retention/).

## GPRINT meminjam arsip tetangganya

Sebuah `GPRINT` biasa tidak memiliki arsip sendiri. Ia menggunakan kembali fungsi konsolidasi dari item `AREA`, `STACK`, garis, atau `TICK` yang paling baru cocok sebelumnya, berdasarkan nama sumber data dan identitas bidang templat lokal. Jika tidak ada kecocokan sebelumnya, ia menggunakan pembantu fungsi terbaik dengan fungsinya sendiri yang dikonfigurasi. Varian tetap menggunakan fungsi yang dikonfigurasi secara langsung.

Artinya, mengubah urutan item dalam templat grafik dapat mengubah apa yang dilaporkan legenda tanpa ada yang mengedit legenda tersebut. Tempatkan `LINE` yang membaca `MAX` di atas blok `GPRINT` maka legenda terkait dapat merangkum nilai maksimum. Pindahkan ke bawah, maka item sebelumnya yang cocok atau fallback yang akan menentukan deret input. Jika angka pada legenda berubah setelah pengeditan templat yang tidak terkait, periksa urutan item terlebih dahulu.

## CDEF dan VDEF

Keduanya mengubah data sebelum digambar. Keduanya tidak dapat dipertukarkan.

| | CDEF | VDEF |
|---|---|---|
| Menghasilkan | Deret data, satu nilai per slot waktu | Nilai skalar dan, untuk beberapa fungsi, waktu terkait |
| Dapat digambar sebagai garis atau area | Ya | Skalar dapat memberikan tingkat konstan |
| Dibangun dari | Fungsi, operator aritmetika, CDEF lain, sumber data khusus, konstanta | Satu fungsi yang diterapkan pada satu referensi |
| Bersarang | CDEF dapat merujuk ke CDEF lain | VDEF tidak boleh berisi operasi aritmetika |

CDEF adalah ekspresi tumpukan yang dievaluasi dalam notasi Polandia terbalik. Kosakatanya luas dan tercantum secara lengkap dalam [Item grafik](/id/reference/graph-items/): aritmetika, operator perbandingan dan kondisi, trigonometri, agregasi lintas sumber data, manipulasi tumpukan, dan fungsi waktu yang memberi tahu posisi definisi pada sumbu X. `UN` dan `UNKN` adalah operator yang layak dipelajari sejak awal. Mengganti nilai tidak diketahui dengan nol dapat menghindari celah visual tetapi menyembunyikan pengukuran yang hilang; buat pilihan presentasi tersebut secara sadar.

CDEF juga membaca referensi khusus alih-alih nama sumber data tetap. Satu referensi mengarah ke sumber data item saat ini, membuat satu CDEF dapat digunakan kembali di setiap item dalam templat. Referensi lainnya mengarah ke semua sumber data pada grafik, atau ke semua sumber data yang serupa, memungkinkan pembuatan garis total tanpa menyebutkan sumber masukannya satu per satu.

VDEF mereduksi deret menjadi nilai skalar: maksimum, minimum, rata-rata, deviasi standar, nilai pertama, nilai terakhir, total, persentil, atau kemiringan, titik potong, dan korelasi dari regresi kuadrat terkecil. RRDtool tidak mendukung aritmetika di dalam VDEF, jadi ketika VDEF memerlukan input komputasi, Kadupul membangunnya di atas CDEF item alih-alih pada sumber data mentah. Itulah jalur yang ditentukan: lakukan perhitungan dalam CDEF, lalu reduksi hasilnya dalam VDEF.

Suatu `GPRINT` yang didukung oleh VDEF tidak memerlukan argumen fungsi konsolidasi: VDEF telah menyediakan hasil reduksi. VDEF juga dapat menyediakan nilai skalar untuk penggambaran; RRDtool mendukung garis berbasis VDEF. Lihat dokumentasi hulu [elemen grafik](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

Ekspor CSV memilih jenis gambar yang didukung sebagai kolom deret; item legenda tidak diekspor sebagai kolom yang setara. Berbeda dengan deskripsi sebelumnya, kode saat ini tidak serta-merta melewati item gambar berbasis VDEF. Kode dapat mengeluarkan `XPORT` yang tidak valid dari VDEF skalar: pengujian RRDtool yang terisolasi berhasil merender garis VDEF tetapi menolak ekspor tersebut. Lihat [bug aplikasi #273](https://github.com/kadupulhq/kadupul/issues/273). Gunakan item gambar berbasis deret untuk ekspor dan verifikasi kolom yang dihasilkan.

## Mengapa data yang sama terlihat berbeda

Setiap pilihan di bawah ini mengubah tampilan gambar tanpa mengubah satu pun sampel tersimpan.

| Pilihan | Dampak |
|---|---|
| Rentang jendela dan lebar gambar | Dapat mengubah pemilihan arsip dan konsolidasi tambahan |
| Fungsi konsolidasi pada `DEF` | Membaca nilai puncak, palung, rata-rata, atau nilai terakhir |
| Fungsi konsolidasi yang hilang | Beberapa jalur item mengganti fungsi lain; yang lain bisa gagal |
| `AREA` versus `STACK` | Ketinggian absolut versus ketinggian kumulatif |
| Urutan item | Penimpaan gambar, urutan tumpukan, dan arsip yang dipinjam oleh `GPRINT` |
| Basis 1000 atau 1024 | Mengubah label sumbu. Nilai dasarnya identik |
| Mode skala otomatis, batas kaku, skala logaritma | Mengubah sumbu Y, yang mengubah persepsi visual besarnya perubahan |

Ketika grafik tidak sesuai, bandingkan perintah yang dirender, identitas dan tata letak fisik berkas, status cache, serta kesegaran sampel. Pemeriksaan aspek presentasi ini berguna, tetapi tidak mengesampingkan kesalahan pengumpulan, penyimpanan, atau pemetaan. Untuk panduan langkah demi langkah tentang proses investigasi ini, lihat [Memecahkan masalah data yang hilang](/id/guides/troubleshoot-missing-data/).
