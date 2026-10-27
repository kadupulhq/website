---
title: Arsitektur
description: Empat komponen bergerak, dan bagian mana yang biasanya mengalami kegagalan.
sidebar:
  order: 1
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
---

:::caution[Perilaku proxy RRDtool warisan]
Penyebaran proxy RRDtool tidak didukung di Kadupul. Gunakan penyimpanan RRDtool lokal
(`storage_location = 0`). Pengaturan proxy, deskripsi protokol, dan alur kerja
pada halaman ini mendokumentasikan perilaku warisan, bukan metode penyebaran atau jalur migrasi yang didukung.
Lihat [Proxy RRDtool](/id/reference/rrdproxy/).
:::

Aplikasi web, basis data, pengumpulan terjadwal, dan penyimpanan RRD milik Kadupul memiliki
tugas yang berbeda, tetapi jalur eksekusinya saling bersinggungan. Mengetahui operasi mana yang gagal
membantu mempersempit penyelidikan; antarmuka yang berfungsi bukan bukti bahwa pengumpulan data berjalan baik.

**Antarmuka web** adalah aplikasi PHP. Komponen ini mengelola konfigurasi serta merender atau
menyajikan grafik dari cache. Beberapa tindakan web juga memicu pengumpulan data, seperti permintaan grafik
waktu nyata, dan permintaan grafik reguler dapat memicu pembaruan RRD yang tertunda.

**Basis data** menyimpan konfigurasi, izin, status operasional, cache poller,
dan antrean pengukuran. Nilai yang dikumpulkan dapat tetap berada di sana saat menunggu penulisan RRD
atau percobaan ulang; basis data bukan sekadar tempat penyimpanan konfigurasi.

**Poller** mengoordinasikan tugas terjadwal dan proses pengumpul turunan. Hasil pengumpulan melewati
antrean basis data sebelum proses penulisan normal atau yang ditangguhkan memperbarui berkas RRD.

**Berkas RRD** menyimpan deret historis yang dibatasi. Sumber data biasanya memiliki satu RRD
yang memuat bidang-bidangnya; pembuatan grafik dapat menggunakan kembali sumber yang ada, dan membuat metadata
tidak menjamin bahwa berkas fisiknya sudah ada.

## Batas antarkomponen

| Batas | Apa yang melewatinya | Pengangkut |
|---|---|---|
| Antarmuka ke basis data | Konfigurasi, sesi, otorisasi, tugas dalam cache, dan data operasional | SQL; basis data dapat berada di host jarak jauh |
| Antarmuka ke berkas | Pembacaan grafik, gambar cache, serta pembaruan atau pembuatan RRD sesuai permintaan yang memenuhi syarat | Sistem berkas dan RRDtool |
| Poller ke basis data | Daftar tugas, nilai terkumpul, antrean tertahan, status, dan hitungan mundur | SQL |
| Pengumpulan ke perangkat | SNMP, skrip pengumpulan, dan pemeriksaan keterjangkauan | Perintah jaringan atau lokal; pengumpulan yang dipicu web juga dimungkinkan |
| Penulis ke berkas | Sampel terkelompok, kemungkinan mencakup beberapa stempel waktu per pembaruan | Perintah RRDtool dan pipa terkonfirmasi |
| Server basis data ke berkas RRD | Tidak ada pembaruan RRD langsung dalam jalur normal aplikasi | Kode penulis aplikasi mengoordinasikan kedua penyimpanan tersebut |

Baris basis data mengaitkan sumber data dengan perangkat dan jalur berkas yang dikonfigurasikan.
Berkas RRDtool mendeskripsikan deret data dan arsip; berkas tersebut tidak menggantikan pemetaan aplikasi.
Lalu lintas jaringan tidak terbatas pada polling perangkat: koneksi basis data, pengumpul
jarak jauh, dan integrasi terkonfigurasi lainnya juga dapat melintasi host.

Cadangkan status basis data, sampel tertunda, dan berkas RRD secara konsisten. Pemulihan
hanya pada basis data tidak mengembalikan konten historis RRD, dan pemulihan hanya pada berkas
akan melewatkan konfigurasi serta sampel yang belum dicatat ke disk. Memindahkan berkas tanpa menyesuaikan jalur
dapat menyebabkan galat berkas hilang atau penulisan tertahan; ini bukan kegagalan pengumpulan senyap
yang terjamin. Lihat [Pencadangan dan Pemulihan](/id/guides/back-up-and-restore/) dan
[Migrasi ke perangkat keras baru](/id/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Mengapa riwayat jangka panjang menggunakan berkas RRD

Riwayat grafik jangka panjang disimpan dalam RRD, tetapi antrean pengukuran berada di basis data.
Antrean normal yang sedang diproses menggunakan InnoDB pada revisi ini, dan penulisan yang ditangguhkan
menyimpan sampel dalam tabel Boost. Penulisan yang gagal atau pengiriman jarak jauh yang tertunda dapat memperbesar
antrean tersebut. Lihat [Operasi penulisan volume tinggi](/id/concepts/high-volume-writes/).

RRD mengalokasikan sejumlah baris tertentu pada resolusi yang dipilih. Pembaruan reguler
menggunakan kembali ruang tersebut alih-alih menambahkan riwayat tanpa batas. Ukuran berkas dibatasi
selama tata letak tidak berubah; menambahkan sumber data, mengubah tata letak, menyimpan salinan pemulihan,
atau menumpuk antrean tetap meningkatkan total kebutuhan penyimpanan.

Komprominya adalah retensi yang telah ditentukan sebelumnya. Begitu riwayat terperinci kedaluwarsa atau
dikonsolidasikan, perubahan tata letak di kemudian hari tidak dapat membuat ulang detail yang telah dibuang. Lihat
[Sumber data dan arsip round-robin](/id/concepts/data-sources-and-rras/).

Konfigurasi dan status operasional menggunakan basis data karena aplikasi memerlukan pembaruan bersama
dan kueri relasional. Ini tidak berarti setiap relasi ditegakkan oleh kunci asing (foreign key)
pada basis data, atau penyimpanan baris harus membesar selamanya;
hal ini menggambarkan pembagian tanggung jawab dalam aplikasi ini.

## Dua jalur yang berbagi dua bagian

Permintaan halaman atau grafik biasa umumnya mengikuti alur ini:

1. Peramban mengirimkan permintaan; PHP memuat konfigurasi dan terhubung ke basis data.
2. Permintaan menerapkan autentikasi dan otorisasi ranah atau objek yang relevan.
3. Tindakan pada konsol membaca atau memperbarui konfigurasi dan dapat memicu pekerjaan tambahan.
4. Permintaan grafik dapat memeriksa sampel Boost yang tertunda dan cache gambar, atau menyusun
   perintah RRDtool dan membaca berkas yang dikonfigurasi. Lihat
   [Cara grafik digambar](/id/concepts/how-graphs-are-drawn/).
5. Permintaan grafik waktu nyata dapat menjalankan pengumpul waktu nyata dan menggunakan data
   sementara yang terpisah. Grafik yang datar saja tidak membuktikan bahwa berkas kosong atau bahwa
   pengumpulan dan perenderan berhasil.

Polling terjadwal umumnya mengikuti alur ini:

1. Penjadwal memulai poller, yang memeriksa status aktif, waktu, dan penyimpanan.
2. Poller memilih tugas yang jatuh tempo dari cache poller dan meluncurkan proses pengumpul turunan.
3. Proses turunan menanyai perangkat atau menjalankan skrip pengumpulan dan menempatkan hasil di basis data.
4. Penulis yang sesuai memproses sampel terkelompok, menggunakan antrean tertunda jika dikonfigurasi,
   dan mempertahankan kegagalan yang dapat dicoba kembali.
5. Status operasional dan status penjadwalan diperbarui di basis data.

Lihat [Siklus hidup poller](/id/reference/poller-lifecycle/) untuk urutan dan penanganan kegagalan.
Jalur-jalur ini berbagi sumber daya basis data dan penyimpanan serta dapat bersaing untuk mendapatkannya. Memulai ulang
server web tidak memperbaiki poller yang dijadwalkan secara terpisah, tetapi permintaan web dapat berpartisipasi
dalam pengumpulan dan penulisan; lakukan diagnosis pada proses yang benar-benar bermasalah.

## Proses apa yang berjalan sebagai pengguna mana

| Proses | Berjalan sebagai | Dimulai oleh |
|---|---|---|
| Aplikasi web PHP | Akun server web atau pool PHP-FPM | Server web |
| Poller terjadwal | Akun terkonfigurasi milik penjadwal | cron, Task Scheduler, atau layanan terkonfigurasi |
| RRDtool | Biasanya mewarisi akun dari proses yang meluncurkannya | Jalur web, poller, atau pemeliharaan |
| Skrip pengumpulan | Biasanya mewarisi akun pengumpulnya | Pengumpulan terjadwal atau yang dipicu web |

Semua akun penulis yang berpartisipasi memerlukan akses yang memadai ke penyimpanan yang dikonfigurasikan.
Pembuatan sumber data biasa hanya menuliskan metadata; RRD dapat dibuat nanti saat
penulis membutuhkannya. Berkas yang hilang dapat mengindikasikan bahwa pengumpulan belum mencapai titik tersebut,
selain kemungkinan adanya kegagalan jalur, kepercayaan, izin, atau pembuatan berkas.

Beberapa jalur pembuatan yang dijalankan sebagai root mencoba menerapkan pemilik dan grup direktori RRA.
Upaya ini dapat gagal dan mencatat galat; tindakan tersebut bukan pengganti konfigurasi akun layanan yang benar.
Kepemilikan non-root mengikuti aturan sistem operasi, termasuk pewarisan grup direktori dan ACL. Validasi
izin penyimpanan dan pengaturan numerik UID/GID tepercaya pada setiap akun penulis web dan poller. Lihat
[Meningkatkan versi dengan aman](/id/guides/upgrade-safely/).

Implementasi PHP ICMP yang ditinjau memanggil utilitas ping milik sistem operasi.
Kemampuannya mengirimkan probe bergantung pada utilitas tersebut dan kebijakan OS; keberadaan pembantu
UID efektif warisan tidak berarti setiap probe ICMP menaikkan hak akses PHP ke root. Jangan jalankan
aplikasi sebagai root hanya untuk mengaktifkan ping. Periksa perintah aktual, akun, dan keluaran galat;
pemeriksaan TCP atau UDP memiliki semantik keterjangkauan yang berbeda.

## Daftar tugas telah dihitung sebelumnya

Cache poller menyimpan instruksi pengumpulan yang telah diselesaikan agar setiap eksekusi tidak perlu
menurunkan setiap perintah dari relasi templat. Operasi konfigurasi dapat membangun ulang entri yang
terdampak; alat rekonstruksi eksplisit tersedia saat dibutuhkan.

Perubahan pada bidang yang disimpan di cache harus mencapai entri tersebut sebelum pengumpulan menggunakannya.
Pengaturan lain dibaca secara terpisah, sehingga tidak semua perubahan konfigurasi memerlukan pembangunan ulang
cache manual. Periksa konten cache, galat pengumpulan, dan status replikasi jarak jauh daripada langsung
mengasumsikan satu penyebab tunggal. Lihat [Cache poller](/id/concepts/the-poller-cache/) dan
[Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/).

## Titik yang biasanya mengalami kegagalan

| Gejala | Pemeriksaan yang berguna |
|---|---|
| Antarmuka berfungsi, grafik datar | Penjadwal berjalan, galat pengumpulan, antrean, kesegaran sampel, dan jendela grafik |
| Poller berjalan, berkas tidak bertambah | Konfirmasi/galat penulis, kepercayaan dan izin penyimpanan, penumpukan data tertunda |
| Satu sumber data datar | Respons perangkat, baris cache, pemetaan berkas, sampel tak dikenal, dan ekspresi penggambaran |
| Perubahan konfigurasi tampak tidak berpengaruh | Hasil penyimpanan, penggantian templat, entri cache yang terpengaruh, dan replikasi |
| Celah data berkala | Pengaturan waktu, heartbeat, batas waktu (timeout), ketersediaan perangkat, dan kegagalan penulisan |
| Bentuk grafik tidak terduga | Perintah yang dihasilkan, pilihan CDEF/CF, data berkas aktual, cache gambar, dan pemetaan |
| Riwayat port tampak terpasang pada antarmuka lain | Identitas kueri, penomoran ulang, dan hasil pengindeksan ulang |
| Akun dapat melihat konsol tetapi tidak ada grafik | Ranah halaman grafik, otorisasi objek, dan identitas grafik yang diminta |
| Pengumpul berbeda satu sama lain | Penugasan, konfigurasi terplikasi, penimpaan lokal, dan status koneksi |
| Semuanya lambat | Waktu tunggu basis data, perebutan penulis/penyimpanan, waktu proses pengumpul, dan beban kerja web |
| Metadata sumber data ada tetapi berkas fisik tidak | Pengumpulan/penulisan pertama, jalur terkonfigurasi, galat kepercayaan dan pembuatan |

Ini adalah titik awal penyelidikan, bukan diagnosis pasti. Ikuti bukti yang ada melewati batas komponen
yang relevan dan verifikasi hasilnya setelah melakukan perubahan. Lihat
[Memecahkan masalah data yang hilang](/id/guides/troubleshoot-missing-data/).
