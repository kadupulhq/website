---
title: Templat
description: Bagaimana satu definisi mencakup seratus perangkat, dan apa yang terjadi saat Anda mengubahnya.
sidebar:
  order: 3
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
---

Templat hadir agar penambahan switch keseratus membutuhkan upaya yang sama dengan penambahan switch kedua. Ada empat jenis templat, dan semuanya tersusun secara bertingkat.

Untuk alur urutan praktis, ikuti [Menggunakan dan memvalidasi templat](/id/guides/template-workflow/).

**Templat data** menentukan apa yang dikumpulkan dan bagaimana menyimpannya: bidang data, tipe data, batasan nilai, profil penyimpanan, dan metode input mana yang mengambil nilai angka. Bidang per objek dan berkas RRD yang ada dapat berbeda dari templat saat ini; templat bukanlah jaminan tata letak fisik berkas.

**Templat grafik** menentukan cara menggambar: item apa saja, dalam urutan mana, warna apa, baris legenda mana, dan apa yang tertera pada sumbu.

**Templat perangkat** menggabungkan kueri data dan templat grafik yang sesuai untuk suatu kelas perangkat keras, sehingga memilih templat yang tepat saat menambahkan perangkat akan menyelesaikan sebagian besar pekerjaan.

**Kueri data** menangani kasus ketika Anda tidak mengetahui sebelumnya berapa banyak entitas yang ada. Suatu switch memiliki sejumlah port yang ditemukan dengan menelusuri perangkat, dan kueri data mencatat hasil terindeks untuk pembuatan grafik. Penemuan saja tidak secara otomatis membuat jumlah grafik atau sumber data yang tetap.

## Bagaimana hierarki tersusun

Keempat jenis ini bukanlah empat lapisan dari hal yang sama. Masing-masing mengarahkan ke lapisan di bawahnya secara hierarkis.

| Jenis | Mengarah ke | Menghasilkan |
|---|---|---|
| Templat perangkat | Templat grafik dan kueri data | Tidak ada secara langsung. Ini adalah daftar opsi untuk suatu perangkat |
| Kueri data | Definisi grafik dan pemetaan untuk hasil terindeks | Baris yang ditemukan; pembuatan grafik yang dipilih dapat membuat atau menggunakan kembali sumber data |
| Templat grafik | Bidang templat data saat suatu item memerlukan data | Grafik yang dapat mereferensikan beberapa sumber data |
| Templat data | Metode input dan profil penyimpanan | Metadata sumber data; berkas RRD dibuat saat jalur penulisan membutuhkannya |

Item templat pembawa data merujuk ke bidang templat; item yang diinstansiasi dipetakan ke bidang lokal. Item teks dan konstanta tidak memerlukan referensi sumber data. Pembuatan grafik menyelesaikan pemetaan tersebut, dan penerapan ulang templat atau perubahan item di kemudian hari juga dapat mengubahnya. Pembuatan grafik dapat menggunakan kembali sumber data yang kompatibel alih-alih membuat berkas baru untuk setiap grafik.

## Berbasis templat atau per objek

Banyak bidang pada tingkat grafik dan sumber data memiliki tanda bendera pendamping pada baris templat. Untuk bidang-bidang tersebut, bendera mengatur penyebaran normal ke elemen turunan terkait. Bidang lain, item grafik, dan pemetaan input memiliki aturan propagasi terpisah.

| Bendera | Arti | Saat menyimpan |
|---|---|---|
| Nonaktif | Bidang diatur oleh templat | Dituliskan ke setiap elemen turunan, menimpa nilai yang ada sebelumnya |
| Aktif | Bidang bersifat per objek | Dibiarkan tidak berubah pada setiap elemen turunan |

Bendera berlaku per bidang. Suatu templat grafik dapat menyebarkan label sumbunya ke grafik terkait sambil membiarkan judul dan batas vertikal ditentukan oleh pembuatnya. Kombinasi tersebut merupakan hal biasa, bukan pengecualian.

Dua karakteristik dari rancangan ini kerap menimbulkan kekeliruan.

Bendera berada pada templat dan hanya menentukan apa yang dilakukan oleh proses penyimpanan berikutnya. Menandai suatu bidang sebagai per objek setelah propagasi menimpanya tidak memulihkan apa pun. Nilai individual lama telah hilang; bendera hanya melindungi nilai di masa mendatang.

Hal sebaliknya justru lebih berbahaya. Menonaktifkan bendera pada bidang yang telah berstatus per objek selama bertahun-tahun membuat satu penyimpanan menimpa bidang tersebut pada semua turunan sekaligus dengan nilai templat, yang sering kali berupa teks sementara yang tidak pernah diperiksa.

### Tidak semua bidang memiliki bendera

Suatu bidang hanya berpartisipasi jika terdapat bendera untuknya. Pada tingkat sumber data, empat bidang memilikinya dan dua bidang sengaja tidak memilikinya.

| Bidang | Bendera | Perilaku |
|---|---|---|
| Nama | Ya | Berbasis templat atau per objek |
| Aktif | Ya | Berbasis templat atau per objek |
| Langkah | Ya | Berbasis templat atau per objek |
| Profil penyimpanan | Ya | Berbasis templat atau per objek |
| Metode input | Tidak, selalu berbasis templat | Handler penyimpanan templat secara eksplisit memperbarui baris sumber data terkait |
| Jalur ke berkas RRD | Tidak, tidak pernah berbasis templat | Penyebaran templat normal mengecualikannya; penerapan ulang templat mempertahankan jalur yang ada |

Pelestarian jalur melindungi keterikatan historis yang ada selama perubahan templat reguler. Ini tidak berarti jalur tidak dapat diedit atau dipindahkan melalui operasi administratif lainnya. Tinjau identitas berkas sebelum mengubahnya.

Semua bidang pada item sumber data memiliki bendera: nama bidang, tipenya, heartbeat, nilai minimum, nilai maksimum, dan bidang input yang memasoknya.

## Input grafik bekerja ke arah sebaliknya

Suatu templat grafik dapat mendeklarasikan input bernama yang mengaitkan beberapa item grafik ke satu bidang yang dapat diedit, sehingga mengedit satu nilai pada grafik akan memperbarui setiap item yang membagikannya. Itulah mekanisme di balik pengaturan warna tunggal atau legenda yang mengendalikan sekelompok item terkait.

Nilai yang didorongnya bukan berasal dari templat. Mekanisme ini membaca nilai saat ini dari item lain yang termasuk dalam input tersebut dan menyebarkannya. Oleh karena itu, input grafik menyebar ke samping di antara item grafik itu sendiri alih-alih turun dari templat, itulah sebabnya mengedit input dapat mengubah grafik yang tidak disentuh langsung oleh templat.

## Apa yang disebarkan dan kapan

| Perubahan | Menjangkau objek yang ada | Cara |
|---|---|---|
| Bidang templat grafik, berbasis templat | Ya, saat disimpan | Ditulis ke setiap grafik yang berasal dari templat tersebut |
| Bidang templat grafik, per objek | Tidak | Objek turunan mempertahankan nilainya sendiri |
| Tampilan item grafik | Ya, saat disimpan | Warna, transparansi, tipe item, ketebalan garis, garis putus-putus, CDEF, VDEF, pergeseran, fungsi konsolidasi, perataan, teks, dan format legenda |
| Item grafik ditambahkan, dihapus, atau diarahkan ulang ke bidang lain | Bergantung pada operasi | Pencocokan, penambahan, penghapusan, dan pemetaan ulang menggunakan jalur berbeda; verifikasi pemetaan item lokal yang dihasilkan |
| Bidang templat data, berbasis templat | Ya, saat disimpan | Ditulis ke setiap sumber data yang berasal dari templat tersebut |
| Nilai bidang input templat data | Jika berbasis templat | Bendera templat dan turunan, bidang indeks kueri, dan aturan host membatasi propagasi |
| Profil penyimpanan, langkah, arsip templat data | Hanya basis data | Berkas fisik yang ada mempertahankan struktur saat dibuat |
| Bidang ditambahkan ke templat data | Hanya basis data | Berkas fisik yang ada tidak memiliki ruang untuk menyimpannya |
| Isi templat perangkat | Sinkronisasi terpisah | Mengedit relasi saja tidak secara otomatis menyinkronkan setiap perangkat yang ada |

Propagasi basis data bergantung pada jalur penyimpanan dan aturan penggantian. Memperbarui metadata templat tidak dengan sendirinya memigrasikan berkas RRD yang ada; pemeliharaan berkas adalah operasi terpisah. Beberapa kontrol struktural bersifat hanya-baca pada editor templat data yang sedang digunakan. Lihat [Membuat templat kustom](/id/guides/create-custom-templates/).

## Templat perangkat memiliki jalur sinkronisasi eksplisit

Mengedit keterkaitan templat perangkat akan mengubah apa yang ditawarkan kepada perangkat baru. Perangkat yang ada memerlukan operasi penerapan ulang atau sinkronisasi terpisah. Alat operasi massal biasanya memilih perangkat dalam status Up atau Recovering, kecuali pemanggil menyertakan perangkat yang mati; periksa cakupan seleksi sebelum berasumsi setiap perangkat telah diperbarui.

Sinkronisasi menambahkan relasi templat grafik yang hilang, menyegarkan kueri data yang dipilih, dan dapat menghapus relasi templat grafik yang tidak lagi diperlukan. Tindakan ini tidak secara langsung menghapus grafik yang ada hanya karena templatnya dihapus dari templat perangkat. Operasi ini juga memanggil hook otomatisasi dan plugin, sehingga dapat memicu aturan otomatisasi grafik yang telah dikonfigurasi.

Periksa relasi perangkat dan grafik yang dihasilkan setelah sinkronisasi. Hasil tersebut belum tentu merupakan gabungan permanen dari setiap versi templat yang pernah diterapkan sepanjang waktu.

## Indeks dan penyebab pergeseran port

Suatu kueri data harus menentukan entitas mana yang ditemukan yang cocok dengan sumber data yang ada. Itulah indeks. Indeks numerik dapat berubah setelah perubahan perangkat keras atau konfigurasi. Bidang stabil yang tepat membantu mempertahankan identitas, tetapi nama antarmuka juga dapat diubah atau digunakan kembali. Verifikasi keunikan, persistensi, dan perilaku pengindeksan ulang pada perangkat aktual; tidak ada satu nama bidang pun yang menjamin kesinambungan secara mutlak.

Keputusan ini tampak sepele saat diambil dan menjadi mahal ketika salah. Keputusan ini diambil per perangkat per proses alih-alih sekali untuk keseluruhan kueri, sehingga dua switch identik dapat terindeks berdasarkan bidang yang berbeda. Cara pemilihan bidang, apa yang terjadi ketika indeks hilang, dan biaya mendeteksi penomoran ulang dibahas dalam [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/).

## Mengubah templat di kemudian hari

Perubahan grafik memengaruhi rendering berikutnya setelah penyimpanan dan propagasi terkait selesai. Penggantian nilai dan cache gambar dapat memengaruhi apa yang dilihat pengguna, jadi jangan berasumsi setiap grafik langsung berubah seketika. Periksa grafik turunan representatif dan pemetaan itemnya; lihat [Menyesuaikan tampilan grafik](/id/guides/tune-graph-appearance/).

Menyimpan templat data tidak secara otomatis membentuk ulang berkas RRD yang ada. Definisi dan arsip sumber data aktual berkas dapat berbeda dari profil basis data. Periksa keduanya sebelum pemeliharaan; membuat berkas pengganti hanyalah salah satu opsi.

Bergantung pada perubahannya, penyesuaian yang didukung RRDtool, perubahan ukuran arsip, atau operasi dump/restore yang terkontrol dapat mempertahankan sebagian atau seluruh riwayat data yang ada. Prosedur tersebut memiliki batasan dan memerlukan cadangan serta verifikasi; prosedur tersebut tidak merekonstruksi data yang tidak pernah disimpan. Menghapus dan membuat ulang berkas akan menghilangkan riwayatnya. Lihat [Mengelola retensi data](/id/guides/manage-data-retention/) dan [Sumber data dan arsip round-robin](/id/concepts/data-sources-and-rras/).

## Hal lain yang juga disebut templat

Ada empat objek lain yang menggunakan istilah ini tetapi tidak berperilaku seperti empat jenis di atas. Templat warna adalah palet bernama yang diterapkan ke item grafik. Templat agregat menjelaskan cara menggabungkan beberapa grafik menjadi satu. Templat otomatisasi mencocokkan perangkat yang ditemukan ke templat perangkat. Definisi preset grafik menyediakan format legenda yang dapat digunakan kembali.

Tak satu pun dari hal tersebut berada dalam tingkatan yang dijelaskan di sini. Memahaminya bermanfaat terutama agar hasil pencarian yang menyebutkan templat dapat dipahami sesuai konteks yang benar.
