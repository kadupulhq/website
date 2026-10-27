---
title: Waktu dan interval
description: Interval polling, langkah RRD, heartbeat, dan penyimpangan jam, serta mengapa stempel waktu pada sampel menentukan lebih banyak hal dari yang diperkirakan.
sidebar:
  order: 7
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
---

Pengumpulan data melibatkan tiga jam: ritme peluncur, interval polling di dalam setiap pemanggilan, dan langkah RRD. Semuanya memerlukan pengaturan yang kompatibel.

| Nilai | Pemilik | Cara penggunaan |
|---|---|---|
| Interval peluncur | Cron, Task Scheduler, atau `cactid.php` | Harus cocok dengan `cron_interval`, ditafsirkan oleh `poller.php` sebagai 60 atau 300 detik |
| Interval polling | Putaran pengumpulan | `poller.php` menghitung jumlah putaran bulat per interval peluncur |
| Langkah | Berkas RRD | Interval normalisasi dasar, ditetapkan dari profil sumber data saat pembuatan |
| Heartbeat | Bidang di dalam RRD | Jeda maksimum yang diizinkan antar-pembaruan; pembuatan membaca definisi bidang |

Sebagai contoh, peluncur 60 detik dan interval polling 10 detik menghasilkan enam putaran per pemanggilan. Peluncur 300 detik dan interval polling 300 detik menghasilkan satu putaran. Jangan pernah mengonfigurasi interval peluncur lebih rendah daripada interval polling: 60/300 menghasilkan nol putaran. Gunakan satu penjadwal, dan hentikan sebelum menjalankan perintah manual `--force`. Lihat [Pemasangan](/id/start/install/).

Mengedit profil tidak secara otomatis memigrasikan berkas yang ada. Heartbeat dapat disesuaikan; perubahan langkah memerlukan migrasi terencana menggunakan alat yang didukung RRDtool terpasang. Periksa definisi basis data dan keluaran `rrdtool info` setelahnya.

## Ketika nilainya cocok

Sumber data yang langkahnya sama dengan interval polling memenuhi syarat pada setiap putaran, bergantung pada status perangkat, isi cache, dan batas waktu eksekusi. Konfigurasi bawaan menggunakan 300 detik untuk keduanya. Kelayakan tidak menjamin pembacaan yang berhasil.

## Ketika langkah lebih panjang daripada interval

Pengumpul PHP menggunakan `rrd_next_step` pada setiap baris daftar kerja ketika beberapa jadwal aktif memerlukannya. Pengumpul memilih baris yang bernilai nol atau di bawahnya, lalu memperbarui hitungan mundur untuk cakupan pengumpul dan host miliknya. Baris yang langkahnya sama dengan interval polling tetap bernilai nol. Baris lain berkurang sebesar interval polling; jika terjadi underflow, reset bergantung pada mode pemanggilan: putaran sub-peluncur normal disetel ulang ke langkah dikurangi interval, sedangkan interval yang sama dan jalur semua-host disetel ulang ke langkah penuh. Jangan berasumsi bahwa langkah sepuluh menit selalu berarti setiap dua pemanggilan lima menit; periksa baris jatuh tempo dan stempel waktu aktual.

Dengan mengaktifkan opsi **Seimbangkan Beban Proses**, pembuatan cache menetapkan pergeseran ke sumber data berturut-turut pada suatu perangkat menggunakan langkah dan interval polling. Bidang dari sumber yang sama berbagi pergeseran yang sama. Hal ini dapat menyebarkan tugas ke berbagai putaran, tetapi tidak menjamin waktu eksekusi yang sama: latensi perangkat, waktu habis, dan skrip berbeda-beda. Peluncur juga menyelaraskan hitungan mundur bidang yang tidak konsisten di dalam satu sumber data.

Sebelum menyimpulkan bahwa suatu item rusak karena tidak menghasilkan apa pun selama satu putaran, periksa status jatuh tempo dan putaran berikutnya. Lihat [Cache poller](/id/concepts/the-poller-cache/) untuk batas pembangunan ulang.

## Ketika langkah lebih pendek daripada interval

Langkah yang lebih pendek tidak dapat menciptakan pengukuran yang tidak pernah diambil oleh pengumpul. Kadupul memberikan peringatan saat membuat cache jika pengumpulan terlalu lambat untuk langkah tersebut; perbaiki pengaturan polling dan bangun ulang cache yang terpengaruh.

Ketidakcocokan ini tidak selalu menghasilkan grafik berbentuk sisir. RRDtool dapat menormalkan pembaruan yang lebih jarang ke dalam langkah-langkah yang lebih kecil jika heartbeat mengizinkan, tetapi hal itu tidak memulihkan detail pengukuran yang hilang.

## Heartbeat tidak selalu dua kali lipat langkah

Heartbeat adalah interval maksimum yang diizinkan antar-pembaruan sebelum input dianggap tidak diketahui. Pembuatan RRD membaca heartbeat dari definisi bidang sumber data, yang dapat mewarisi pengaturan profil atau templat. Ini bukanlah masa tenggang tambahan yang ditambahkan ke langkah; periksa bidang dan berkas aktual jika berbeda dari profil.

Profil bawaan tidak mengikuti satu aturan tunggal.

| Profil | Langkah | Heartbeat | Batas interval pembaruan |
|---|---|---|---|
| Lima menit | 300 | 600 | 10 menit |
| Satu menit | 60 | 600 | 10 menit |
| Tiga puluh detik | 30 | 1200 | 20 menit |

Ini adalah nilai profil bawaan, bukan pengatur waktu deteksi pemadaman. Input yang secara eksplisit tidak diketahui dapat menimbulkan celah sebelum heartbeat kedaluwarsa; normalisasi dan ambang batas arsip memengaruhi apa yang terlihat. Heartbeat yang lebih besar mentoleransi jeda yang lebih panjang antar-pembaruan valid. Pada atau di bawah interval pembaruan normal, tidak ada toleransi terhadap keterlambatan.

Periksa berkas fisik serta profilnya. RRD yang ada dapat berbeda dari definisi basis data yang diubah; audit berkas melaporkan penyimpangan tersebut. Tinjau [definisi heartbeat RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) dan [referensi penyelarasan](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) sebelum merencanakan perubahan berkas.

## Apa yang disimpan berbeda dari apa yang dikirimkan perangkat

RRDtool menormalkan pembaruan ke dalam batas langkah yang tetap. Nilai di antara batas-batas tersebut dapat berkontribusi pada lebih dari satu titik data primer. Heartbeat, nilai tidak diketahui eksplisit, dan batas memengaruhi input yang valid; konsolidasi arsip menerapkan ambang data tidak diketahuinya sendiri. Suatu langkah tidak perlu berisi sampel mentah terpisah untuk menyimpan nilai yang diketahui.

Nilai penghitung menjadi laju terhadap waktu yang berlalu, tunduk pada reset penghitung, penanganan pembungkus, dan batasan nilai. Nilai pengukur juga dinormalkan terhadap waktu. Lonjakan singkat dapat tereduksi atau terlewatkan sama sekali karena pengambilan sampel; nilai yang stabil atau pembaruan yang selaras dengan batas langkah tidak selalu dikurangi. Pengaturan arsip tidak dapat merekonstruksi detail yang tidak pernah dikumpulkan atau hilang selama normalisasi.

## Jam mana yang menentukan

Untuk pengumpulan biasa via `cmd.php`, pernyataan SQL `CURRENT_TIMESTAMP()` memasok stempel waktu keluaran saat suatu batch disisipkan. Ini bukanlah stempel waktu yang disediakan perangkat atau pengukuran tepat saat perangkat menjawab. Backend pengumpulan lainnya dan jalur waktu nyata harus diperiksa secara terpisah.

Pengumpul PHP menyangga hasilnya dan menulisnya dalam batch, melakukan pengosongan saat terjadi pergantian perangkat atau saat buffer penuh. Stempel waktu dievaluasi sekali per batch, sehingga setiap nilai dalam satu batch membawa waktu yang sama.

Konsekuensinya tidak selalu terlihat jelas, sehingga penting untuk diuraikan.

**Jam perangkat tidak membubuhkan stempel waktu pada sampel SNMP ini.** Pengumpul menggunakan waktu penyisipan basis data. Waktu perangkat mungkin masih penting untuk skrip atau arti dari metrik tertentu, sehingga ini bukan alasan untuk mengabaikan sinkronisasi jam.

**Jam yang salah pada pengumpul atau basis datanya akan menggeser data.** Nilai akan tercatat pada slot yang salah, dan pada berkas yang sudah terisi sebagian, pembaruan yang waktunya tidak lebih baru dari rekaman terakhir akan ditolak mentah-mentah. Jika stempel waktu mundur ke belakang pembaruan terakhir berkas, pembaruan baru tidak dapat memajukan berkas tersebut sampai stempel waktunya melampaui rekaman itu. Periksa jam basis data, jam pengumpul, dan stempel waktu berkas; mengubah jam pengumpul saja tidak selalu mengubah stempel waktu yang dihasilkan basis data.

**Waktu di dalam siklus berubah menjadi jitter.** Perangkat yang dipolling menjelang akhir proses panjang diberi stempel waktu lebih lambat daripada perangkat yang dipolling pada awal proses, meskipun keduanya berada dalam siklus yang sama. Pada pengumpul yang berbeban tinggi, jitter tersebut dapat menjadi bagian signifikan dari interval, dan merupakan salah satu cara heartbeat yang terlalu sempit mulai menimbulkan kekosongan data.

**Zona waktu basis data berada di tengah-tengah alur bolak-balik.** Stempel waktu ditulis sebagai stempel waktu basis data dan diubah kembali menjadi waktu absolut oleh basis data saat dibaca. Penanganan zona waktu sesi yang tidak konsisten dapat mengubah interpretasi tersebut. Verifikasi pengaturan sesi tulis/baca dan konversi epoch saat mendiagnosis pergeseran; mengubah zona waktu tampilan saja tidak membuktikan bahwa riwayat tersimpan telah bergeser.

## Hasil pembacaan dirangkai berdasarkan stempel waktu

Sumber data dengan lebih dari satu bidang, seperti antarmuka dengan byte masuk dan byte keluar, dapat menggunakan item daftar kerja SNMP terpisah atau skrip yang mengembalikan beberapa nilai bernama. Bidang yang diurai dikelompokkan berdasarkan sumber data dan stempel waktu untuk pembaruan RRD.

Kumpulan yang belum lengkap akan ditahan alih-alih ditulis sebagian, hingga jumlah bidang yang diharapkan terpenuhi. Ini adalah pemeriksaan perakitan, bukan jaminan bahwa setiap bidang berisi nilai numerik yang valid; nilai tidak diketahui eksplisit tetap dapat ditulis. Biasanya kedua bagian berada dalam batch yang sama dan berbagi stempel waktu, sehingga proses ini transparan. Batch yang dimasukkan dalam detik stempel waktu yang sama juga dapat cocok. Ketika bidang menerima stempel waktu yang berbeda, grup dapat tetap tidak lengkap dan tidak menghasilkan pembaruan. Kode saat ini mempertahankan grup yang tidak lengkap lintas siklus, lalu mencatatnya dan menghentikannya setelah `5 * max(60, poller_interval)` detik. Batas halaman pembacaan diperluas untuk mencakup grup stempel waktu terakhirnya.

Pembaruan juga diurutkan secara kronologis menaik sebelum ditulis, karena berkas tidak akan menerima nilai yang lebih lama dari pembaruan terakhirnya.

## Penulisan yang ditunda mempertahankan stempel waktunya

Ketika penulisan RRD ditunda dan diterapkan secara massal nanti, stempel waktu yang tercatat ikut terbawa bersama nilainya dan batch ditulis dalam urutan kronologis. Stempel waktu tengah hari dipertahankan ketika pembaruan dicoba pada pukul satu; waktu tersebut tidak digantikan oleh waktu pengosongan buffer. RRDtool tetap menormalkan pembaruan yang diterima ke dalam batas langkahnya.

Antrean yang menumpuk dapat memajukan berkas melalui stempel waktu antrean yang lebih baru daripada pembaruan terakhirnya. Antrean tersebut tidak dapat mengisi kembali celah historis sebelum stempel waktu itu. Penulis Boost memfilter sampel pada atau sebelum pembaruan terakhir berkas, sehingga antrean yang terkuras tidak membuktikan bahwa setiap sampel telah diterapkan. Lihat [Penulisan bervolume tinggi](/id/concepts/high-volume-writes/) dan [referensi pembaruan RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Penulisan yang ditunda tetap bergantung pada penyimpanan yang berhasil dan urutan waktu yang valid; penulisan ini tidak menjamin pemulihan dari setiap kegagalan. Periksa keluaran yang tertahan dan ditolak saat antrean tidak kunjung berkurang.

## Ketika siklus tidak selesai tepat waktu

Pengumpul PHP memeriksa waktu eksekusi yang telah berlalu di antara tugas-tugas dan mengakhiri loop itemnya segera setelah melebihi interval polling, dengan mencatat peringatan. Ini bukanlah interupsi paksa tepat pada batas waktu: operasi yang sedang berlangsung dapat melampaui batas sebelum pemeriksaan tersebut. Item yang belum terjangkau tidak menghasilkan nilai pada siklus tersebut. Jeda antara pembaruan yang valid dapat dijembatani jika ambang batas heartbeat dan arsip mengizinkan. Kelebihan waktu yang berulang adalah bukti untuk menyelidiki kapasitas, waktu habis, dan kesalahan pengumpulan, bukan bukti bahwa setiap celah data memiliki penyebab yang sama.

[Penskalaan poller](/id/guides/scale-the-poller/) membahas apa yang harus dilakukan. Urutan eksekusi serta mekanisme perlindungan dijelaskan dalam [Siklus hidup poller](/id/reference/poller-lifecycle/).
