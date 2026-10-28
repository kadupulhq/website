---
title: Memulihkan berkas RRD yang rusak
description: Cara membedakan arsip round-robin yang rusak dari yang salah konfigurasi, cara memeriksa berkas, bagaimana dump dan restore memperbaikinya, dan riwayat apa yang dapat Anda pertahankan ketika berkas harus dibangun ulang.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji terisolasi.
sidebar:
  order: 25
---

:::caution[Validasi sebelum penggunaan]
Kode sumber tersedia, namun belum ada rilis atau jalur migrasi Kadupul
yang didukung secara resmi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Kerusakan berkas yang sesungguhnya jarang terjadi. Sebagian besar berkas yang dilaporkan rusak sebenarnya utuh dan
hanya berselisih dengan basis data, atau tidak dapat ditulis oleh poller, atau berhenti menerima
nilai karena alasan yang tidak ada hubungannya dengan berkas tersebut. Cari tahu situasi mana yang
Anda hadapi sebelum menyentuh apa pun, karena perbaikan untuk satu masalah dapat memperburuk masalah lainnya.

:::danger[Pertahankan berkas asli]
**Salin berkas sebelum setiap perbaikan di halaman ini.** Pulihkan ke berkas kandidat terpisah
dan periksa sebelum mengganti berkas produksi. Menyusutkan atau menghapus arsip
akan membuang riwayat yang tersimpan. Mengubah nilai maksimum memengaruhi validasi masukan di masa mendatang; hal ini
tidak menghapus sampel tersimpan secara retroaktif. Tidak ada fitur batalkan otomatis dalam berkas RRD.
:::

## 1. Identifikasi kegagalan

| Apa yang Anda lihat | Biasanya berarti | Buka |
|---|---|---|
| Grafik menampilkan kesalahan alih-alih gambar | Berkas hilang, tidak terbaca, atau direktori tidak dapat ditulisi | Langkah 2 |
| Grafik kosong tetapi tidak ada kesalahan | Tidak ada nilai yang dapat digunakan dalam rentang yang dipilih, atau masalah definisi grafik | [Mengatasi data yang hilang](/id/guides/troubleshoot-missing-data/) |
| Grafik berhenti pada waktu tertentu dan tidak pernah berlanjut | Poller, izin berkas, atau heartbeat | Langkah 3 |
| Grafik memiliki data tetapi polanya berubah tanpa ada perubahan konfigurasi | Berkas dan basis data berselisih | Langkah 4 |
| Semua nilai yang tersimpan berstatus tidak diketahui | Pengumpulan, pewaktuan, batas ambang, atau konfigurasi sumber data perlu diperiksa | [Mengatasi data yang hilang](/id/guides/troubleshoot-missing-data/) |
| `rrdtool` menolak membaca berkas | Jalur hilang, kegagalan akses, format tidak kompatibel, atau kerusakan | Langkah 2 dan 3, lalu 5 |

Kadupul mengubah kasus pertama menjadi pesan yang dapat dibaca daripada gambar yang rusak,
membedakan direktori yang tidak dapat ditulisi dari berkas yang tidak dapat ditulisi, dan melaporkan berkas
yang hilang sebagai kemungkinan poller yang belum berjalan. Pesan tersebut merupakan petunjuk, bukan
diagnosis mutlak: penghapusan, perubahan jalur, atau pemulihan yang tidak tuntas juga dapat menyebabkannya hilang.

## 2. Periksa berkas

Dua tampilan tersedia di halaman sumber data itu sendiri, keduanya dapat diaktifkan per sesi.
Tampilan debug mencetak perintah `rrdtool create` yang akan dikeluarkan Kadupul untuk sumber
data ini hari ini. Tampilan info adalah yang terpenting di sini: tampilan ini membaca berkas dengan
`rrdtool info`, membaca definisi sumber data dari basis data, dan mencetak
perbedaannya. Jika perbedaan dapat diselaraskan tanpa membangun ulang, tampilan ini mencetak perintah
`rrdtool tune` atau `rrdtool resize` yang sesuai, sebagai teks untuk Anda jalankan
secara manual alih-alih menjalankannya langsung.

Dari shell, langkah awal yang sama:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Header menyediakan informasi langkah, waktu pembaruan terakhir, setiap nama sumber data beserta tipenya,
heartbeat, batas minimum dan maksimum, serta setiap arsip beserta fungsi konsolidasi, jumlah baris,
dan resolusinya. Jika perintah ini menghasilkan kesalahan, simpan pesan kesalahan tersebut dan periksa jalur,
izin, serta kompatibilitas RRDtool sebelum menyimpulkan adanya kerusakan. Eksekusi `info` yang
berhasil membaca metadata; periksa juga keluaran `fetch` dan uji dump untuk memeriksa data riwayat.

## 3. Periksa penyebab mekanis terlebih dahulu

| Pemeriksaan | Mengapa harus dilakukan sebelum perbaikan |
|---|---|
| Kepemilikan dan izin berkas | Berkas yang dibuat oleh root selama pemeliharaan tidak dapat ditulis oleh poller sejak saat itu |
| Kepemilikan dan izin direktori | Poller tidak dapat membuat berkas pengganti di direktori yang tidak dapat ditulisi |
| Ruang disk bebas dan inode | Sistem berkas yang penuh menghasilkan penulisan terpotong yang tampak seperti kerusakan berkas |
| Apakah ada proses penulisan kedua | Pembaruan bersamaan atau di luar urutan dapat gagal atau membatalkan snapshot pemeliharaan; periksa log |

Jalankan pemeliharaan sebagai akun yang memiliki dan memperbarui berkas RRD, serta pertahankan izin,
pemilik, dan grupnya. Hentikan semua proses penulisan sebelum menyalin atau mengganti berkas, termasuk
pengumpul jarak jauh, tugas terjadwal, dan pemeliharaan manual. Kuras antrean tulis yang tertunda hanya setelah
produsen datanya berhenti. Perintah shell biasa tidak memperoleh kunci penyimpanan Kadupul.
Lihat [persyaratan penyimpanan](/id/reference/requirements/) dan prosedur penghentian sementara di
[Pencadangan dan pemulihan](/id/guides/back-up-and-restore/).

## 4. Baca temuan pemeriksa

Kadupul dapat memeriksa sumber data yang terhubung ke grafik pada perangkat yang diaktifkan secara berkala dan
mencatat apa yang ditemukannya; ini bukan inventarisasi setiap berkas di disk. Fitur ini dinonaktifkan
secara bawaan. Antarmuka memberi tahu lokasi untuk mengaktifkannya: Configuration -> Settings -> Data.

| Pengaturan | Bawaan | Dampak |
|---|---|---|
| Enable RRDfile Check | off | Tidak ada yang diperiksa hingga pengaturan ini diaktifkan |
| Check Frequency | 4 hours | Juga menyediakan opsi 1 hour, 24 hours, atau berjalan setelah setiap siklus boost |
| Number of RRDfile Check Processes | 1 process | Membagi daftar berkas ke beberapa proses pekerja paralel |
| RRDChecker Timeout | 1 hour | Proses akan dihentikan paksa jika melewati batas waktu ini |

Temuan dikumpulkan dalam daftar yang memuat perangkat, sumber data, ID sumber data internal,
pesan, dan tanggal. Anda dapat memfilter berdasarkan usia data, mencari teksnya, dan
membersihkan daftar tersebut setelah Anda menindaklanjutinya.

Pesan-pesan yang dapat dicatat, dan arti masing-masing pesan:

| Pesan | Arti |
|---|---|
| RRDfile does not exist | Berkas tidak pernah dibuat, dipindahkan, dihapus, atau jalur yang dikonfigurasi berubah |
| RRDfile is not writable | Pengguna poller tidak dapat menulis ke berkas tersebut |
| RRDfile modify time older than hour | Tidak ada data yang ditulis setidaknya selama satu jam |
| Last update value in RRDfile is older than 1 hour | Stempel pembaruan terakhir pada berkas itu sendiri sudah usang, yang merupakan bukti lebih kuat daripada waktu modifikasi |
| The RRDfile step does not match the Data Source Profile step | Berkas dibuat di bawah interval waktu yang berbeda |
| There are more, or less, Data Sources in the database than in the RRDfile | Templat mengalami penambahan atau pengurangan bidang setelah berkas dibuat |
| The Data Source '...' exists in RRDfile, but not in database | Menyebutkan nama bidang, dilihat dari sisi berkas |
| Data Source name '...' exists in the Database, but not in RRDfile | Menyebutkan bidang yang coba ditulis oleh poller tetapi tidak memiliki wadah di berkas |
| The RRDfile Minimal Heart... is lower than polling interval | Pemeriksa menandai heartbeat yang kurang dari atau sama dengan interval polling; sampel yang terlambat bisa menjadi tidak diketahui |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Heartbeat berkas lebih rendah daripada heartbeat profil; pemeriksaan ini tidak memperingatkan nilai yang lebih besar |
| Stale values for last 24 hours, or last hour | Setiap sampel yang dibaca kembali dalam jendela waktu tersebut bernilai tidak diketahui |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Kegagalan pengumpulan data parsial |
| No data returned, maybe corrupted Data Source | Perintah fetch terhadap berkas tidak mengembalikan data apa pun |

Pemeriksaan ini secara otomatis mengoreksi nilai langkah dan heartbeat yang tercatat di basis data agar sesuai dengan profil,
yang menyelesaikan pergeseran antara profil dan baris sumber data tetapi tidak menyentuh
berkas fisiknya. Ketidakcocokan jumlah antara berkas dan basis data dilaporkan, bukan
diperbaiki secara otomatis, karena salah satu sisi bisa menjadi pihak yang salah.

## 5. Dump, edit, pulihkan

RRDtool dapat membuat serialisasi berkas yang terbaca menjadi XML dan membangun kembali kandidat darinya.
Hal ini dapat membantu mengatasi ketidakcocokan struktural yang diketahui, namun tidak merekonstruksi sampel yang hilang
atau menjamin bahwa berkas yang rusak dapat diurai. Kadupul juga menggunakan alat bantu dump/restore
untuk perubahan struktural. Alat bantu pemulihan lokal membuat berkas sementara yang berdampingan dan
mengganti nama di atas berkas tujuan setelah berhasil; ini bukan pengganti cadangan.

Dengan proses penulisan yang dihentikan, jalankan ini sebagai pemilik berkas RRD. Ganti jalur contoh dengan
jalur sumber data sebenarnya. Direktori kerja privat dibuat di samping sumber data agar
kandidat berada pada sistem berkas yang sama:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Pilih rentang fetch dan fungsi konsolidasi yang memuat data tersimpan yang valid;
satu jam terakhir hanyalah sebuah contoh. Bandingkan nama sumber data asli dan kandidat,
langkah, arsip, stempel waktu pembaruan terakhir, dan nilai sampel. Proses dump/restore yang tidak diubah
dapat mengubah susunan biner berkas, jadi bandingkan nilainya alih-alih menuntut hash berkas yang identik.

Pertahankan salinan asli. Hanya setelah validasi selesai, pulihkan mode izin,
pemilik, dan grup yang diperlukan pada berkas kandidat dan ganti namanya ke jalur produksi saat proses penulisan tetap dihentikan. Pastikan
bahwa akun poller dapat membaca dan memperbaruinya sebelum melanjutkan pengumpulan data. Contoh ini
berhenti sebelum pemasangan agar kandidat yang terbaca tetapi keliru tidak terpasang.

Berkas XML dan kandidat memerlukan ruang disk tambahan. Dump yang gagal dapat menyisakan
XML parsial; jangan pulihkan berkas tersebut. Periksa akses, ruang bebas, dan kesalahan yang dilaporkan. Jika berkas asli
tidak dapat di-dump setelah pemeriksaan tersebut, pulihkan cadangan yang diketahui bagus. Opsi
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) milik RRDtool memungkinkan penimpaan
berkas tujuan; contoh bertahap ini sengaja menggunakan tujuan baru.

## 6. Apa yang bertahan dan apa yang hilang

| Kerusakan | Riwayat dapat dipulihkan |
|---|---|
| Berkas tidak dapat ditulisi, selebihnya utuh | Riwayat yang tersimpan tetap utuh. Pembaruan yang terlewat tidak dapat dipulihkan hanya dengan memperbaiki izin |
| Heartbeat, nilai minimum, atau maksimum salah | Ya. `rrdtool tune` mengubah header tanpa menyentuh nilai tersimpan |
| Langkah salah | Memerlukan konversi eksplisit dan tervalidasi; hanya mengubah profil basis data tidak mengonversi berkas |
| Sumber data tidak ada di dalam berkas | Bidang yang ada mempertahankan riwayatnya. Bidang baru dimulai dalam keadaan kosong |
| Arsip dihapus atau tidak pernah dibuat | Tidak. Resolusi yang tidak pernah disimpan tidak dapat direkonstruksi |
| Baris arsip berkurang akibat pengecilan ukuran | Tidak. Baris yang dibuang langsung hilang pada saat perintah dijalankan |
| Berkas terpotong, dump gagal | Tidak. Pulihkan dari cadangan |
| Header utuh, ujung berkas terpotong | Jangan menganggap header yang terbaca menjamin dump yang lengkap; gunakan cadangan terverifikasi jika dump gagal |

Mengubah interval poller atau memindahkan sumber data ke profil retensi lain
tidak secara otomatis mengubah bentuk berkas yang ada. RRDtool juga menyediakan operasi
[`tune` struktural](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), termasuk opsi
langkah; validasi perilaku konversi untuk versi terinstal dan tata letak
arsip Anda alih-alih mengasumsikan perubahan interval tanpa kehilangan data. Lihat
[Sumber data dan arsip](/id/concepts/data-sources-and-rras/) dan
[Mengelola retensi data](/id/guides/manage-data-retention/). Menaikkan nilai maksimum dengan `tune`
aman dilakukan; menurunkannya akan mencatat setiap nilai berikutnya di atas batas baru sebagai tidak diketahui.

## 7. Bangun ulang sambil mempertahankan data yang ada

Kadupul menyertakan utilitas splice yang dapat mengisi berkas baru dari berkas lama yang masih
terbaca. Perlakukan hasilnya sebagai kandidat: utilitas ini dapat mengisi celah dan mengganti nilai nol yang sah,
sehingga bukan salinan sempurna tanpa perubahan dari riwayat yang terukur. Jalankan dari direktori utama aplikasi pada
kolektor data utama, menggunakan salinan terisolasi di direktori tepercaya yang dapat ditulisi.

Buat `new.rrd` dengan struktur yang diinginkan di dalam direktori privat `$work`
dari langkah 5, lalu lakukan pratinjau penggabungan:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Kedua berkas masukan harus sudah ada dan lolos pemeriksaan izin tulis utilitas.
Berkas baru menyediakan struktur dasar. Tanpa `--finrrd`, keluarannya adalah jalur berkas baru
ditambah `.new`; gunakan jalur keluaran baru yang eksplisit untuk menghindari penimpaan
kandidat sebelumnya. `--dryrun` mengurai dan menggabungkan data menggunakan XML sementara dan penyimpanan SQLite
(jika tersedia), tetapi melewati pemulihan RRD akhir. Ini tidak membuktikan bahwa pemulihan
akhir pasti berhasil. Hapus `--dryrun` untuk menghasilkan berkas kandidat terpisah.
Hindari `--owner` selama pratinjau dan jalankan sebagai akun layanan yang diperlukan; periksa
kepemilikan aktual berkas keluaran sebelum pemasangan.

:::caution[Operasi splice memperlakukan nol sebagai celah kosong]
Penggabungan menelusuri berkas baru dan, untuk setiap slot yang memuat nilai tidak diketahui **atau nol**, mencari
nilai terdekat yang cocok di berkas lama dan menuliskan nilai tersebut. Nilai nol asli di
berkas baru karena itu akan digantikan oleh data lama. Pada metrik apa pun yang secara sah bernilai nol untuk
jangka waktu lama (port yang tidak aktif, antrean yang kosong, penghitung dalam kondisi diam), periksa
hasilnya dengan saksama sebelum menerapkannya. Nilai tidak diketahui dari berkas lama juga diisi menggunakan
nilai sebelumnya, sehingga keluaran gabungan dapat menciptakan kontinuitas semu di atas data yang hilang.
:::

Setelah penyambungan, letakkan berkas di tempat yang diharapkan oleh sumber data, dengan izin kepemilikan yang
dibutuhkan poller, dan pastikan grafik dapat digambar dengan benar.

## 8. Mengisi celah dan pertimbangan risikonya

| Utilitas | Apa yang ditulisnya |
|---|---|
| `cli/batchgapfix.php` | Mengisi rentang tanggal di banyak perangkat secara paralel, menggunakan nilai terakhir yang diketahui atau nilai rata-rata |
| `cli/float_rrdfiles.php` | Menggeser rentang pada grafik terpilih melalui alur dump dan restore yang sama |

Keduanya menciptakan data pengukuran rekayasa. Tidak ada data yang dikumpulkan pada stempel waktu tersebut, dan setelahnya
tidak ada apa pun di dalam berkas yang membedakan nilai rekayasa dari nilai asli. Gunakan utilitas ini saat Anda
yakin bahwa celah tersebut bukan karena gangguan pemadaman: misalnya poller dihentikan untuk pemeliharaan, atau jendela migrasi.
Jangan pernah menggunakannya pada data yang menjadi dasar kalkulasi kapasitas atau penagihan. Kehati-hatian yang sama berlaku untuk
[menghapus lonjakan](/id/guides/remove-spikes-from-data/).

## 9. Debugging otomatis satu sumber data

Untuk sumber data yang berperilaku aneh, Kadupul dapat menjalankan pemeriksaan debug selama beberapa
siklus polling berikutnya dan memberikan laporan: apakah berkas ada, apakah berkas dan
direktorinya dapat ditulisi, akun mana yang memilikinya dibandingkan dengan akun yang menjalankan poller,
apakah sumber data aktif, apakah berkas cocok dengan definisi sumber data,
apakah stempel pembaruan terakhir berubah setelah polling, dan apakah nilainya dapat digunakan. Tindakan
perbaikannya sangat terbatas. Utilitas ini hanya menjalankan rekomendasi `rrdtool tune` yang dihasilkan dari
perbandingan tersebut, menolak dan mencatat alasannya jika daftarnya kosong atau berkas
tidak dapat ditulisi. Fitur ini tidak membuat ulang berkas, menambah sumber data, atau mengubah arsip.

## 10. Penghapusan merupakan bahaya tersendiri

Kadupul melacak berkas arsip yang sumber datanya sudah tidak ada lagi dan menawarkan opsi untuk
menghapusnya. Fitur ini juga dapat disetel untuk bertindak otomatis saat sumber data dihapus, dengan dua
metode: hapus permanen, atau pindahkan ke direktori arsip.

:::danger[Penghapusan bersifat permanen]
Metode hapus akan membuang berkas dari disk secara permanen. Tidak ada tempat sampah dan data
tidak disimpan di dalam basis data. Jika Anda tidak sepenuhnya yakin bahwa setiap berkas yang terdaftar benar-benar yatim,
atur metodenya ke arsipkan, yang akan memindahkan berkas ke direktori yang Anda tentukan, lalu bersihkan
direktori tersebut secara manual di lain waktu.
:::

Sebuah berkas dapat tampak yatim padahal sebenarnya tidak. Sumber data yang dipindahkan ke jalur baru, proses
pemulihan yang baru selesai sebagian, atau perangkat yang dibangun kembali dengan ID baru dapat meninggalkan berkas yang
tidak dirujuk oleh apa pun. Periksa daftar tersebut dengan catatan perubahan Anda sendiri sebelum melanjutkan.

## Mode kegagalan

| Gejala | Penyebab |
|---|---|
| Perbaikan berhasil, tetapi grafik tetap kosong | Periksa akses, rentang waktu yang dipilih, pengumpulan data, dan definisi grafik |
| `rrdtool dump` menghasilkan kesalahan pada berkas | Periksa jalur, izin akses, media penyimpanan, dan format sebelum menyimpulkan kerusakan berkas |
| Tune telah diterapkan, tetapi tidak ada yang berubah | Perubahan header tidak mengisi sampel tidak diketahui di masa lalu secara retroaktif; verifikasi definisi berkas dan basis data |
| Muncul celah-celah sempit di mana-mana setelah perubahan interval | Berkas masih membawa nilai langkah dan heartbeat lama |
| Berkas sambungan memiliki data lama pada slot yang seharusnya bernilai nol di berkas baru | Sesuai rancangan. Operasi splice mengisi nilai nol dan nilai tidak diketahui |
| Daftar temuan pemeriksa terus bertambah dan tidak pernah berkurang | Temuan dicatat hingga dibersihkan secara manual; mengatasi penyebab tidak menghapus daftarnya |

Cadangkan direktori arsip dan basis data secara bersamaan, dalam satu jadwal terpadu, dan uji
proses pemulihannya. Pemulihan terbatas pada apa yang tersimpan dalam cadangan pada saat pembuatannya. Lihat
[Pencadangan dan pemulihan](/id/guides/back-up-and-restore/).
