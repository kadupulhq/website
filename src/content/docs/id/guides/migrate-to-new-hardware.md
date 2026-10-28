---
title: Migrasi ke perangkat keras baru
description: Memindahkan instalasi yang sedang berjalan ke server lain tanpa kehilangan riwayat data, dalam urutan yang menjaga setiap langkah tetap dapat diverifikasi.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 20
---

:::caution[Perilaku proxy RRDtool warisan]
Penerapan proxy RRDtool tidak didukung di Kadupul. Gunakan penyimpanan RRDtool lokal
(`storage_location = 0`). Pengaturan proxy, deskripsi protokol, dan alur kerja pada
halaman ini mendokumentasikan perilaku warisan, bukan penerapan atau jalur migrasi
resmi yang didukung. Lihat [Proxy RRDtool](/id/reference/rrdproxy/).
:::

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur
migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Migrasi adalah proses pemulihan ke mesin yang berbeda dari mesin asal cadangan. Semua hal
dalam [Pencadangan dan Pemulihan](/id/guides/back-up-and-restore/) berlaku di sini; halaman
ini hanya mencakup perbedaan yang muncul karena tujuan bukan mesin sumber.

Tiga hal berbeda, dan masing-masing membawa potensi kegagalan tersendiri.

| Perbedaan | Dampak kerusakan |
|---|---|
| Jalur berkas berbeda | Jalur berkas tersimpan di basis data dan di cache poller |
| ID pengguna dan grup berbeda | Akses berkas dan pemeriksaan kepercayaan penyimpanan dapat gagal |
| Versi runtime berbeda | Ekstensi, perilaku basis data, dan kompatibilitas RRD dapat berbeda |

## Sebelum Anda menyentuh apa pun

Siapkan mesin tujuan terlebih dahulu dan bawa ke kondisi di mana instalasi baru dapat berjalan:
server basis data aktif, ekstensi PHP yang diperlukan terpasang, RRDtool tersedia, pengumpul
yang dipilih dapat digunakan, dan server web telah dikonfigurasi. Pastikan poller, tugas terjadwal,
replikasi jarak jauh, dan notifikasi keluar tetap dinonaktifkan. Jangan jalankan penginstal. Anda
akan mengganti basis data, dan skema yang baru terpasang setengah jauh lebih sulit didiagnosis
daripada skema yang kosong.

Cocokkan revisi aplikasi dan dependensi secara tepat, termasuk perubahan lokal dan plugin.
Tabel `version` pada basis data mencatat versi skema, bukan setiap perubahan kode sumber;
hanya mencocokkan nilai tersebut tidaklah cukup. Pengalihan penginstal dapat mengindikasikan
ketidakcocokan skema atau pemulihan yang tidak lengkap. Pasang kode yang sama persis dengan yang
Anda tinggalkan, migrasikan, pastikan berfungsi, lalu tingkatkan versi sebagai langkah terpisah
menggunakan [Meningkatkan versi dengan aman](/id/guides/upgrade-safely/).

Tentukan jalur instalasi sekarang. Menjaganya tetap identik di kedua mesin akan menghilangkan
sebagian besar pekerjaan di bawah ini. Jika tidak memungkinkan, baca bagian jalur sebelum memulai.

## Urutan operasi

Setiap langkah memvalidasi langkah sebelumnya, jadi jangan ubah urutannya.

1. **Hentikan semua produser di sumber dan tujuan.** Hentikan pengumpulan data dan pemeliharaan: terjadwal, jarak jauh, yang dipicu web, dan manual; biarkan proses yang sedang berjalan selesai. Lakukan flush pada penulisan yang ditangguhkan hanya setelah produser berhenti. Pertahankan baris antrean yang belum dikonfirmasi bersama dengan cadangan basis data dan RRD yang cocok; jangan gunakan truncate.
2. **Ambil cadangan.** Basis data, pohon RRD, konfigurasi, diambil bersamaan. Aturan konsistensi dalam [Pencadangan dan Pemulihan](/id/guides/back-up-and-restore/) adalah inti dari keseluruhan prosedur ini.
3. **Pindahkan pohon RRD.** Lihat petunjuk di bawah.
4. **Pindahkan basis data.**
5. **Pindahkan kode, konfigurasi, dan semua yang ditunjuk oleh konfigurasi.** Ini mencakup `plugins/`, `scripts/`, `resource/`, dan berkas lokal apa pun yang dipanggil oleh metode input data.
6. **Terapkan kembali konfigurasi tujuan setelah pemulihan akhir.** Perbaiki jalur, endpoint basis data, kepemilikan layanan, dan pengaturan kepercayaan penyimpanan numerik.
7. **Bangun ulang cache poller.**
8. **Jalankan pemeriksaan penyimpanan sebagai setiap akun layanan, lalu mulai pengumpulan hanya di tujuan.** Pantau berkas representatif dan kedalaman antrean yang tertahan.

## Membawa pohon RRD

Berkas RRD adalah berkas biner dengan tata letak internal yang bergantung pada arsitektur tempat
ia ditulis. Salinan biner membutuhkan arsitektur dan format RRDtool yang kompatibel; kesamaan nama
sistem operasi atau ukuran word size saja bukanlah bukti. Ketidakcocokan dapat menyebabkan kesalahan
baca. Validasi berkas yang disalin menggunakan RRDtool milik mesin tujuan.

Jika Anda tidak yakin keduanya cocok, lakukan konversi alih-alih menyalin langsung. Perintah dump
dan restore milik RRDtool menghasilkan format teks portabel; Kadupul menggunakan pasangan perintah
yang sama secara internal saat harus menulis ulang arsip.

Pada sumber, dengan proses penulisan dihentikan, gunakan direktori penahapan (staging) privat baru:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Transfer berkas XML yang telah selesai dengan aman. Pulihkan pada tujuan ke berkas kandidat baru:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Ulangi untuk setiap berkas yang memerlukan konversi dan periksa status keluar setiap perintah. Jangan
memasang dump parsial atau kandidat yang belum diverifikasi. RRDtool mendokumentasikan XML sebagai
[format transfer antar-arsitektur](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Pastikan sebelum Anda memutuskan mengambil jalur lambat ini. Salin satu berkas, jalankan `rrdtool info`
padanya di tujuan, dan bandingkan step, arsip, waktu pembaruan terakhir, dan nama sumber data. Bandingkan
juga hasil `fetch` pada interval data yang diketahui terisi. Ulangi untuk tata letak arsip representatif
sebelum memindahkan seluruh pohon data, lalu verifikasi inventaris berkas lengkap. Lihat
[Pemulihan RRD](/id/guides/recover-a-corrupted-rrd/) untuk validasi kandidat dan persyaratan kepemilikan.

Bagaimanapun Anda memindahkannya, pertahankan struktur direktori secara persis. Subdirektori bersarang
di bawah direktori RRA bukanlah sekadar hiasan; jalur setiap berkas dicatat per sumber data, dan
meratakan pohon akan merusak semuanya.

## Basis data

Proses dump dan restore. Dua hal yang harus diperiksa di sisi tujuan.

Periksa set karakter tabel, kolasi, dan mesin penyimpanan yang dipulihkan, bukan hanya pengaturan
default server. Pertahankan definisi sumber dan verifikasi kompatibilitas dengan versi basis data
tujuan sebelum cutover.

**Antrean pengumpul bukanlah cache yang dapat dibuang.** Antrean `poller_output` saat ini harus
menggunakan InnoDB. Pemeriksaan awal penyimpanan menolak antrean MEMORY. Pertahankan barisnya serta
antrean boost dan realtime sampai sampel dikonfirmasi; cadangan RRD mungkin belum memuat pengukuran
tersebut. Jangan berasumsi tabel MEMORY yang dipulihkan itu kosong: dump logis dapat memuat perintah
insert yang mengisinya kembali.

Dengan proses penulisan dihentikan dan cadangan tersimpan, antrean non-InnoDB warisan dapat dikonversi
secara eksplisit:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Jalankan pemeriksaan penyimpanan di bawah setiap akun web dan poller aktual. Pemeriksaan ini menguji
akses penyimpanan lokal dan antrean yang dipilih; keberhasilan sebagai root tidak membuktikan akses
layanan. Remote collector daring biasanya menargetkan antrean utama; gunakan `--local` hanya saat
sengaja memeriksa antrean lokal mereka. Tabel runtime/cache lainnya memerlukan rencana pelestarian
atau pembangunan ulang yang eksplisit. Lihat [persyaratan penyimpanan](/id/reference/requirements/).

## Jalur pada mesin tujuan

Di sinilah migrasi sering kali bermasalah, karena sebagian besar hal ini tidak terlihat sampai putaran
pengumpulan pertama berjalan.

**Jalur RRA.** Jalur sumber data standar menggunakan token `<path_rra>`. Pada revisi ini, bootstrap
menurunkan `$config['rra_path']` dari direktori aplikasi ditambah `/rra`; ini bukan pengaturan
basis data umum untuk memilih direktori lokal sembarang. Konfirmasikan jalur efektif sebelum memindahkan
berkas. Jalur kustom absolut harus diperiksa dan diperbaiki satu per satu. Pertahankan tata letak
direktori bersarang.

**Cache poller menyimpan jalur absolut.** Saat cache dibangun, token diperluas dan jalur lengkap
dituliskan ke dalam baris cache. Ubah direktori RRA, dan cache akan tetap mengarah ke direktori lama.
Poller akan terus berjalan tanpa menulis apa pun yang dapat Anda temukan. Bangun ulang cache tersebut:

```sh
php cli/rebuild_poller_cache.php
```

**Pengaturan yang menyimpan jalur.** Masing-masing disimpan di basis data, sehingga masing-masing
datang dari mesin lama yang mengarah ke tata letak mesin lama. Periksa semuanya sebelum putaran pertama:
biner RRDtool, biner pengumpul dan berkas konfigurasinya, biner PHP, perkakas SNMP, jalur log, font
default, dan direktori cadangan penghapusan lonjakan (spike removal). Tinjau juga jalur dan nilai
lingkungan dalam berkas konfigurasi, unit layanan, tugas terjadwal, dan server web.

**Metode input data menyimpan baris perintah.** Metode ini menggunakan token untuk root instalasi,
sehingga pemindahan yang mempertahankan tata letak tidak memerlukan perubahan apa pun. Pemindahan
yang mengubahnya mengharuskan setiap entri diperiksa. Hal yang sama berlaku untuk berkas XML sumber
daya di balik kueri data.

**Pengumpul jarak jauh memiliki berkas konfigurasinya sendiri**, yang menyimpan kredensial basis data
dan ID pengumpulnya sendiri. Berkas ini tidak ada dalam dump pusat. Jika basis data pusat berpindah,
perbarui titik akhir yang relevan dan validasi koneksi setiap pengumpul. Replikasi penuh adalah operasi
terpisah, yang dijalankan pada pengumpul utama hanya jika pengumpul jarak jauh yang aktif dikonfigurasi:

```sh
php cli/poller_replicate.php
```

Tanpa remote collector yang aktif, perintah ini akan keluar dengan pesan kesalahan. Jangan masukkan
ini ke dalam migrasi pengumpul tunggal sebagai pemeriksaan keberhasilan wajib. Validasi konfigurasi
dan replikasi jarak jauh sebelum mengizinkan pengumpulan jarak jauh dilanjutkan kembali.

## Kepemilikan dan izin berkas

Poller menulis berkas RRD sebagai akun yang menjalankannya. Antarmuka web membacanya sebagai akun
server web. Salinan yang mempertahankan ID numerik di seluruh mesin dengan entri `/etc/passwd` yang
berbeda akan menghasilkan berkas yang dimiliki oleh akun yang salah.

Grafik yang berhenti pada saat migrasi dapat mengindikasikan masalah izin, jalur kedaluwarsa, pengumpulan
yang terlewat, stempel waktu, atau sampel yang ditolak. Periksa log poller dan antrean yang tertahan
sebelum memilih perbaikan; grafik saja tidak mengidentifikasi penyebabnya.

Periksa kepemilikan direktori RRA itu sendiri dan subdirektori bersarang, bukan hanya berkas sampel.
Berkas baru dibuat di direktori tersebut selama pengumpulan, sehingga direktori yang tidak dapat
ditulisi oleh poller akan gagal untuk sumber data yang belum ada pada saat migrasi, bahkan jika berkas
yang ada baik-baik saja. Petakan ulang `rrd_maintenance_trusted_uids` dan `rrd_maintenance_trusted_gids`
dalam `include/config.php` ke identitas numerik aktual tujuan dan periksa leluhur direktori tepercaya.
Lihat [persyaratan penyimpanan](/id/reference/requirements/).

## Cutover dengan kehilangan data minimal

RRD menolak pembaruan pada atau sebelum stempel waktu pembaruan terakhirnya. Hal ini membatasi pemutaran
ulang; bukan berarti setiap migrasi harus kehilangan sampel. Ukuran celah data bergantung pada waktu
pengambilan sampel, waktu henti (downtime), dan pengukuran antrean mana yang berhasil dipertahankan.
Prosedur ini menggunakan satu pemilik pengumpulan dan tidak menggabungkan riwayat uji coba yang
dikumpulkan secara independen ke dalam kumpulan arsip akhir.

1. Lakukan gladi bersih penuh sebelumnya dengan cadangan dari hari sebelumnya. Salin semuanya, perbaiki setiap jalur, dan uji pembaruan terhadap perangkat fixture yang terisolasi dengan notifikasi dinonaktifkan. Catat perubahan tujuan sebagai prosedur yang dapat diulang. Hentikan proses tulis uji coba setelah pengujian selesai.
2. Jaga agar lingkungan uji coba tetap terisolasi. Ganti basis data dan RRD-nya dengan cadangan akhir yang cocok; jangan mencampurkan baris uji coba atau sampel antrean ke dalam pemulihan tersebut.
3. Untuk cutover, hentikan produser sumber dan lakukan flush atau pertahankan sampel yang tertunda, lalu ambil dan transfer cadangan akhir. Terapkan kembali penyesuaian tujuan: memulihkan basis data akan mengembalikan jalur sumber ke dalam `settings`, dan memulihkan berkas konfigurasi juga dapat menimpa titik akhir uji coba serta pengaturan kepercayaan.
4. Bangun ulang cache poller, jalankan pemeriksaan penyimpanan, verifikasi inventaris berkas, dan aktifkan pengumpulan tujuan hanya setelah pemeriksaan tersebut berhasil.

Ukur durasi gladi bersih dan sediakan waktu untuk validasi serta rollback. Biarkan sumber tetap
berhenti sampai cutover berhasil atau rollback terkontrol memilihnya kembali sebagai pemilik pengumpulan data.

## Verifikasi dalam urutan ini

1. Antarmuka web memuat halaman tanpa pengalihan ke penginstal. Selidiki ketidakcocokan kode/skema, konektivitas basis data, atau pemulihan yang tidak lengkap jika terjadi pengalihan.
2. Perangkat uji merespons upaya pengumpulan baru; status "up" yang dipulihkan saja bisa jadi usang.
3. Waktu pembaruan terakhir berkas RRD bertambah maju setelah putaran pengumpulan pertama. Periksa berkas pada disk, bukan grafiknya.
4. Grafik yang ditarik selama satu jam terakhir menampilkan garis utuh tanpa celah.

Jika langkah 3 gagal, periksa jalur, izin, preflight penyimpanan, kedalaman antrean, dan kesalahan RRDtool.
Jika langkah 4 gagal, periksa nilai yang tertahan, definisi grafik, rentang waktu yang dipilih, dan akses
akun web. Satu berkas yang berhasil tidak serta-merta memverifikasi setiap perangkat, metode input data,
atau pengumpul jarak jauh.

## Jebakan umum

**Jangan jalankan kedua instalasi pada pohon RRD yang sama.** Dua poller yang menulis berkas yang
sama akan menghasilkan pembaruan yang ditolak dan celah data, bukan data yang tergabung.

**Jangan pulihkan pohon RRD yang lebih lama di atas basis data yang lebih baru.** Berkas tidak akan
mengisi mundur data yang hilang. Pengumpulan dilanjutkan pada waktu sekarang dan interval di antara
keduanya akan menjadi lubang permanen.

**Cadangan memuat kredensial perangkat dalam bentuk teks polos.** Memindahkan perangkat keras berarti
kredensial tersebut melintasi jaringan dan berada di dua mesin. Batasi akses cadangan dan enkripsi
transfernya. Pertahankan salinan rollback yang dilindungi sampai pengujian penerimaan dan kebijakan
retensi mengizinkan dekomisioning; jangan menghapusnya selama cutover.

**Tabel plugin ada di basis data; kode plugin tidak.** Memulihkan basis data tanpa mencocokkan kode
plugin dan dependensinya dapat merusak halaman, hook, atau tugas plugin. Periksa setiap plugin yang
dibutuhkan secara eksplisit.

**Penyimpanan proxy yang ada berada di luar prosedur migrasi ini.** Penerapan proxy tidak didukung.
Temukan dan cadangkan berkas RRD aktual, lalu validasi migrasi terpisah ke penyimpanan lokal pada
salinan terisolasi. Direktori `rra/` lokal mungkin hanya berisi berkas sisa.

**Lakukan dekomisioning mesin lama paling akhir, dan jangan pada hari yang sama.** Biarkan mesin
lama mati atau dengan semua produser dinonaktifkan, dan pertahankan cadangan yang cocok sampai
pemeriksaan pengumpulan, pembuatan grafik, remote collector, dan plugin sistem baru berhasil dilewati.
Tetapkan periode observasi berdasarkan beban kerja dan kebijakan rollback; satu siklus arsip terpendek
bukanlah bukti bahwa setiap subsistem berfungsi normal.
