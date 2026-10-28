---
title: Menskalakan poller
description: Hal yang perlu diubah saat pengumpulan data tidak lagi selesai dalam intervalnya, dan cara mengetahui batas mana yang sebenarnya Anda capai.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 6
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur
migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Menskalakan poller bermuara pada satu pertanyaan: apakah suatu putaran pengumpulan data
selesai sebelum putaran berikutnya dimulai? Semua pembahasan di bawah ini bertujuan untuk
menjawab pertanyaan tersebut dan mengembalikan jawabannya menjadi ya.

Bacalah [Arsitektur](/id/concepts/architecture/) terlebih dahulu jika Anda belum memahami
bagian mana yang bertugas melakukan pengumpulan.

## Dua jam kerja

Terdapat dua interval dan keduanya bukanlah pengaturan yang sama.

| | Penjelasan | Nilai yang diizinkan |
|---|---|---|
| Interval peluncur | Seberapa sering sistem operasi memulai pengumpul, dari cron atau layanan `cactid` | 60 atau 300 detik |
| Interval poller | Irama dasar pengumpulan data; langkah sumber data individual bisa lebih panjang | 10, 15, 20, 30, 60, atau 300 detik |

Ketika interval poller lebih pendek daripada interval peluncur, satu kali peluncuran akan
menjalankan beberapa putaran pengumpulan dalam suatu perulangan (loop). Jumlah putaran adalah
interval peluncur dibagi interval poller.

Anggaran waktu untuk seluruh peluncuran dihitung dari kedua angka tersebut: jumlah putaran
dikalikan interval poller, dikurangi dua detik. Itulah waktu jam dinding aktual yang dijadikan
tolok ukur durasi proses.

## Hal yang terjadi ketika proses melebihi batas waktu

Tiga hal berbeda terjadi dan menghasilkan tiga baris log yang berbeda.

**Proses dipotong paksa.** Saat waktu yang berlalu melebihi batas anggaran, poller mencatat
bahwa batas waktu eksekusi maksimum terlampaui, menuliskan statistiknya, lalu keluar. Pekerjaan
yang belum sempat menghasilkan sampel dapat meninggalkan celah (gap). Sampel yang telah diterima
ke dalam antrean persisten dapat tetap tertunda untuk operasi penulisan RRD berikutnya yang
berhasil; proses yang melebihi batas tidak berarti setiap pengukuran yang belum di-flush dibuang.
Periksalah kedalaman antrean dan log bersamaan dengan grafik, serta jangan menghapus baris yang
tertahan hanya agar putaran berikutnya terlihat bersih.

**Putaran berikutnya mendeteksi sisa kerusakan.** Saat memulai, poller menghitung baris proses
yang tidak pernah ditutup dan memperingatkan bahwa proses terdeteksi melebihi siklus polling.
Selidiki catatan proses yang belum selesai atau kedaluwarsa serta proses turunan yang benar-benar
masih berjalan; peringatan itu sendiri tidak langsung menunjukkan akar masalahnya.

**Kedua jam mengalami pergeseran (drift).** Jika waktu yang berlalu sejak putaran terakhir melebihi
yang diizinkan oleh anggaran, poller memperingatkan bahwa peluncur tidak sinkron dengan interval
poller. Masalah ini biasanya bersumber dari peluncur, bukan poller: entri cron dengan frekuensi
yang salah, layanan yang berhenti, atau host yang sempat tertidur (sleep).

Jalur-jalur ini memanggil helper pemberitahuan admin. Pengiriman bergantung pada penerima yang
dikonfigurasi, kontrol notifikasi, dan transportasi surat yang berfungsi; peringatan log tidak
membuktikan bahwa email telah terkirim. Lihat [Pemberitahuan email](/id/guides/send-email-notifications/).

Ada kasus keempat yang bukan merupakan kelebihan batas waktu. Jika poller dimulai kembali lebih
awal dari yang diperkirakan, poller mencatat bahwa ia dikonfigurasi untuk berjalan terlalu sering
dan keluar tanpa mengumpulkan data. `--force` mengabaikan pemeriksaan waktu tersebut; gunakan
hanya selama diagnosis terkontrol dengan peluncuran terjadwal dan manual lainnya dihentikan. Opsi
ini tidak menambah kapasitas atau membuat pengumpulan data yang tumpang tindih menjadi aman.

## Baris statistik

Setiap putaran yang selesai menulis satu baris statistik ke log. Baris tersebut memuat waktu
yang berlalu, metode pengumpulan, jumlah proses dan thread, jumlah perangkat, perangkat per
proses, sumber data, dan berkas RRD yang diproses.

Pantau tren waktu yang berlalu, latensi ekor (tail latency), kedalaman antrean, dan pembaruan yang
gagal. Selidiki bahkan putaran tunggal yang mendekati batas anggaran jika menyebabkan celah data;
pertumbuhan yang berkelanjutan membantu mengidentifikasi kapan kapasitas atau perilaku pengumpulan
perlu disesuaikan.

## Proses dan thread

Dua setelan dengan fungsi yang berbeda.

| Setelan | Unit kerja yang dibagi | Pengumpul yang menggunakannya |
|---|---|---|
| Proses | Perangkat, dibagi menjadi rentang ID perangkat yang berurutan | Keduanya |
| Thread | Item di dalam satu perangkat | Hanya Spine |

Konsekuensi yang sering disalahpahami adalah: **suatu proses mendapatkan alokasi seluruh perangkat
secara utuh.** Satu perangkat dengan lima ribu sumber data tidak dapat dipecah ke beberapa proses.
Perangkat tersebut dialokasikan ke satu proses dan proses tersebut akan memakan waktu selama yang
dibutuhkan. Menambahkan proses tidak akan mengubah situasi tersebut.

Kedua nilai ini diatur per pengumpul data, bukan secara global. Nilai pada halaman pengaturan
merupakan preset yang diterapkan saat pengumpul data baru dibuat. Mengubah preset tidak akan
mengubah pengumpul yang sudah ada.

Terdapat juga jumlah thread per perangkat, yang merupakan cara untuk membagi satu perangkat besar.
Setelan ini hanya berlaku untuk pengumpul berbasis C.

Balance Process Load menggunakan akumulasi jumlah item untuk menentukan batas antar perangkat utuh
berdasarkan urutan ID perangkat. Fitur ini tidak memecah satu perangkat atau menjamin jumlah item
yang persis sama, dan jumlah item tidak mencerminkan waktu eksekusi. Bandingkan waktu per proses
sebelum dan sesudah mengaktifkannya pada beban kerja representatif yang terisolasi.

## Pengumpul PHP dibandingkan dengan pengumpul C

Pengumpul PHP, `cmd.php`, disertakan bersama aplikasi. Kadupul berencana memelihara fork Spine,
tetapi lokasi kode sumber dan build tervalidasi belum didokumentasikan. Gunakan PHP sampai bukti
tersebut tersedia. Perbandingan Spine, pengaturan thread, dan perintah di bawah ini menjelaskan
perilaku turunan, bukan penerapan Kadupul yang sudah tersedia atau didukung secara resmi.

| | Pengumpul PHP | Spine |
|---|---|---|
| Paralelisme | Hanya proses | Proses dan thread |
| Pengaturan thread | Dipaksa bernilai 1 terlepas dari konfigurasi | Dihormati |
| Server skrip | Satu per proses, tidak dapat dikonfigurasi | 1 hingga 15 per proses, dapat dikonfigurasi |
| Batas waktu skrip | Tidak diterapkan | Diterapkan, default 25 detik |
| Instalasi | Disertakan bersama kode | Rencana fork; belum ada build Kadupul tervalidasi yang terdokumentasi |

Pembatasan thread secara paksa perlu dinyatakan dengan jelas: jika pengumpul diatur ke PHP,
variabel thread runtime disetel ke 1; hal ini tidak menimpa pengaturan thread pengumpul yang
tersimpan. Menskalakan pengumpul PHP mungkin memerlukan lebih banyak proses, dan panduan dalam
kode sumber menyarankan untuk berada pada atau di bawah dua kali lipat jumlah inti CPU.

Konfigurasi Spine dan perilaku perintah memerlukan validasi terhadap biner pasti yang sedang diuji.
Kode sumber aplikasi PHP saja tidak membuktikan urutan pencarian konfigurasi, perilaku thread, atau
efek sampingnya.

Contoh turunan untuk evaluasi Spine yang terisolasi, bukan perintah Kadupul yang tervalidasi:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` dimaksudkan untuk mencegah penulisan hasil. Opsi ini tetap menghubungi perangkat
dan menjalankan skrip pengumpulan; validasikan efek sampingnya dalam pengujian terisolasi terlebih dahulu.

## Koneksi basis data

Thread membutuhkan sumber daya. Setiap thread Spine mempertahankan koneksi basis datanya sendiri,
demikian pula setiap server skrip.

```
estimated worker connections = processes * (threads + script_servers)
```

Ini adalah perkiraan dalam bantuan pengaturan aplikasi, bukan batas atas yang terukur. Jumlahkan
di seluruh pengumpul dan tambahkan kapasitas untuk proses induk poller, permintaan web, pemeliharaan,
dan klien lainnya. Ukur puncak koneksi aktual dan koneksi yang ditolak sebelum menentukan batas
basis data; menaikkan batas tersebut juga mengonsumsi memori dan sumber daya.

Habisnya koneksi dapat menyebabkan sampel data hilang, tetapi celah yang berotasi bukanlah diagnosis
tunggal. Konfirmasikan hal ini dengan metrik koneksi basis data dan log kesalahan aplikasi.

## Penulisan RRD yang ditangguhkan

Terdapat mode yang menghentikan poller menulis ke berkas RRD pada setiap putaran. Hasil pengumpulan
akan terakumulasi dalam tabel basis data dan di-flush secara massal, baik berdasarkan pengatur waktu
atau saat grafik meminta berkas tersebut. Mode ini menukar banyak operasi penulisan kecil dengan
sedikit operasi penulisan besar.

Dua fakta penting secara operasional:

- Mode ini wajib digunakan jika Anda memiliki pengumpul data jarak jauh (remote collector). Ini
  bukan sekadar saran, melainkan kondisi yang disyaratkan oleh perangkat lunak.
- Tabel buffer bersifat persisten dan bukan di memori (in-memory), sehingga sampel yang belum di-flush
  dapat bertahan dari restart. Ini juga berarti berkas RRD Anda tertinggal di belakang basis data Anda.
  Lihat [Pencadangan dan Pemulihan](/id/guides/back-up-and-restore/) sebelum Anda mengambil snapshot apa pun.

Antrean utama dalam proses `poller_output` juga menggunakan InnoDB pada revisi ini. Pemeriksaan awal
penyimpanan menolak antrean MEMORY; menaikkan batas heap-table tidak menyelesaikan penolakan tersebut.
Dengan produser dihentikan dan cadangan yang cocok dipertahankan, konversikan antrean warisan yang
tidak sesuai secara eksplisit, lalu periksa penyimpanan di bawah setiap akun layanan:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Ini adalah operasi terpisah. Pertahankan baris yang tertunda dan pantau ruang disk basis data serta
usia antrean selain jumlah baris. Lihat [Meningkatkan versi dengan aman](/id/guides/upgrade-safely/)
untuk pemilihan antrean, pemeriksaan kepercayaan akun layanan, dan prasyarat restart.

## Kapan harus beralih ke remote collector

Pengumpul data jarak jauh (remote data collector) adalah mesin kedua yang menjalankan kode yang
sama dengan ID pengumpul berbeda, melakukan polling terhadap sebagian perangkat, dan menuliskan
kembali hasilnya ke basis data pusat.

Beralihlah ke arsitektur ini jika hambatan berada di sisi pengumpulan dan bukan di sisi penyimpanan:

- CPU host poller mengalami saturasi selama putaran pengumpulan dan menganggur (idle) di antara putaran.
- Latensi round-trip ke sekelompok perangkat mendominasi durasi proses, dan kelompok tersebut berada
  di balik satu tautan jaringan.
- Suatu lokasi berada di ujung jaringan WAN yang tidak ingin Anda lalui untuk polling langsung.
- Anda memerlukan pengumpulan data di lokasi terisolasi, dan telah memvalidasi buffering offline
  serta pemulihan untuk pengumpul tersebut sebelum mengandalkannya.

Remote collector tidak menghilangkan batas penulisan basis data pusat atau RRD. Ukur kapasitas
penerimaan dan flushing pusat sebelum meningkatkan throughput pengumpulan; produser tambahan dapat
memperparah antrean yang sudah ada.

Setiap pengumpul memiliki jumlah proses dan thread sendiri, kredensial basis data sendiri, dan
interval sinkronisasi yang secara default adalah dua jam. Terdapat alat baris perintah untuk
memaksa sinkronisasi penuh daripada menunggu.

Instalasi pusat dapat mereplikasi situs web dan kode plugin ke pengumpul jarak jauh sehingga mereka
dapat memperbarui diri secara otomatis. Replikasi tersebut dapat dimatikan jika Anda menerapkan
kode melalui metode lain.

## Batas mana yang Anda capai

Gunakan tabel ini untuk menyusun hipotesis, lalu verifikasi dengan log dan pengukuran metrik.
Beberapa batas dapat terjadi secara bersamaan. Opsi Spine belum tervalidasi di sini.

| Pengamatan | Batasan | Tindakan penyesuaian |
|---|---|---|
| Peringatan launcher tidak sinkron, tetapi poller cepat | Keterlambatan jadwal, overrun sebelumnya, atau gangguan host | Periksa riwayat peluncuran dan status proses |
| Waktu proses konstan, satu perangkat selalu terlambat | Respons lambat, skrip berat, atau konsentrasi beban kerja | Ukur waktu metode input dan tinjau batas waktu/percobaan ulang |
| Waktu proses berbanding lurus dengan jumlah perangkat, CPU saturasi | Beban kerja CPU pengumpul tinggi | Ukur apakah penambahan proses membantu; pertimbangkan penempatan pengumpul |
| Waktu proses berbanding lurus dengan jumlah perangkat, CPU idle | Menunggu jaringan, skrip, atau basis data | Ukur sumber tunggu sebelum mengubah konkurensi |
| Sampel hilang secara bergantian pada perangkat yang berbeda | Masalah koneksi, timeout, atau kegagalan pengumpulan | Periksa log kesalahan, metrik koneksi, dan antrean yang tertahan |
| Waktu proses baik, penulisan RRD lambat, disk sibuk | Penyimpanan | Gunakan penulisan RRD yang ditangguhkan atau disk yang lebih cepat |
| Semua lambat termasuk antarmuka web | Basis data | Perbesar ukuran buffer pool, lalu tingkatkan kapasitas host basis data |

Dua jebakan yang perlu diperhatikan.

**Mengubah interval dasar tidak sama dengan mengubah setiap langkah sumber data.**
Sesuaikan profil, langkah item yang di-cache, dan definisi heartbeat/langkah RRD. Membangun ulang
cache tidak mengubah struktur berkas RRD yang sudah ada. Lihat
[Retensi data](/id/guides/manage-data-retention/) dan
[Waktu dan interval](/id/concepts/time-and-intervals/).

**Interval yang lebih cepat melipatgandakan segalanya.** Mengubah interval dari 300 detik ke 60
detik tidak membuat beban kerja lima kali lebih ringan. Sumber yang dikonfigurasi untuk irama yang
lebih cepat akan dikumpulkan lebih sering; sumber yang mempertahankan langkah lebih panjang tidak
perlu dijalankan pada setiap putaran dasar. Ukurlah beban kerja yang dihasilkan daripada berasumsi
bahwa setiap putaran memiliki beban yang sama.
