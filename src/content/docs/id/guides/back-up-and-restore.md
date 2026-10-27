---
title: Pencadangan dan Pemulihan
description: Tiga komponen harus dicadangkan bersama agar pencadangan lengkap, dan urutan pemulihannya sangat penting.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 7
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Satu set pemulihan Kadupul yang lengkap memiliki tiga bagian. Pencadangan parsial dapat memulihkan konfigurasi atau pengukuran, tetapi tidak dapat mereproduksi keseluruhan instalasi.

| Bagian | Apa yang disimpan | Di mana lokasinya |
|---|---|---|
| Basis data | Perangkat, templat, pengguna, izin, cache poller, dan jalur setiap berkas RRD | MySQL atau MariaDB |
| Berkas RRD | Pengukuran yang dipertahankan dan arsip terkonsolidasi | Direktori RRA, secara default `rra/` di bawah instalasi |
| Konfigurasi | Kredensial basis data, jalur, konfigurasi pengumpul, kode plugin dan skrip | `include/config.php`, berkas konfigurasi spine, `plugins/`, `scripts/`, `resource/` |

## Hal yang dapat dipulihkan dari pencadangan basis data saja

Basis data menyimpan definisi grafik dan konfigurasi pemantauan, sedangkan berkas RRD menyimpan arsip riwayat grafik. Dengan Boost yang diaktifkan, pembacaan terbaru juga dapat berada di antrean basis data hingga di-flush ke berkas. Pertahankan antrean tersebut sebagai bagian dari pencadangan basis data. Lihat [Arsitektur](/id/concepts/architecture/).

Jika Anda hanya memulihkan basis data saja, Anda akan mendapatkan sistem yang mengenali empat ratus perangkat, memiliki semua grafik yang terdefinisi, tetapi menampilkan setiap grafik dalam keadaan kosong. Sistem akan mulai mengumpulkan data lagi sejak poller dijalankan, dan seluruh riwayat sebelumnya hilang.

## Hal yang hilang dari pencadangan RRD saja

Berkas RRD berisi sumber data bernama, definisi arsip, dan nilai, tetapi tidak memuat metadata lengkap perangkat, kueri, grafik, dan izin Kadupul yang diperlukan untuk menghubungkan kembali nilai-nilai tersebut ke aplikasi.

Pemetaan dari "byte masuk pada port 3 di switch 12" ke suatu jalur pada disk berada di basis data, dalam sebuah kolom pada sumber data. Jika Anda hanya memulihkan struktur direktori berkas saja, Anda akan memiliki beberapa ribu berkas penuh angka tanpa cara untuk mengetahui berkas mana yang memuat data apa selain merekayasa balik berkas-berkas tersebut secara manual.

Keduanya adalah satu kesatuan pencadangan. Perlakukan keduanya seperti itu.

## Konsistensi di antara keduanya

Di sinilah sebagian besar prosedur pencadangan diam-diam keliru.

Poller menulis ke berkas RRD secara terus-menerus. Berkas yang disalin saat pembaruan sedang berlangsung dapat tertangkap di tengah-tengah penulisan. Basis data juga sedang ditulis pada saat yang sama. Jika Anda mengekstrak basis data pada pukul 02:00 dan mulai menyalin berkas pada pukul 02:20, kedua bagian tersebut menggambarkan momen yang berbeda, dan setiap sumber data yang dibuat atau dihapus di antara rentang waktu tersebut akan mengalami ketidakcocokan.

Penulisan RRD yang ditunda membuat situasi semakin buruk dan lebih menantang. Dalam mode tersebut, poller tidak menulis ke berkas RRD pada setiap putaran. Hasil pengukuran terakumulasi dalam tabel basis data yang tahan lama dan di-flush secara massal nanti. Jadi basis data secara sah dapat mendahului berkas RRD hingga selama interval flush, menyimpan pengukuran nyata yang tidak ada di tempat lain pada disk.

Pilihlah salah satu cara berikut, dalam urutan prioritas menurun:

**Snapshot terkoordinasi.** Gunakan prosedur pencadangan atau penghentian sementara yang didukung mesin basis data dan koordinasikan dengan snapshot dari seluruh penyimpanan RRD serta konfigurasi aplikasi. Snapshot sistem berkas saja tidak menciptakan konsistensi di seluruh volume terpisah, pengumpul jarak jauh, antrean yang tertunda, atau basis data yang aktif.

**Pencadangan logis yang dihentikan sementara.** Nonaktifkan peluncur terjadwal dan produsen lainnya, tunggu pengumpul yang sedang berjalan hingga selesai, lalu flush penulisan yang tertunda dan tunggu proses pekerja flush. Pastikan perubahan konfigurasi, pemeliharaan, dan penulis RRD lainnya tetap dihentikan selama pengambilan cadangan. Jeda pengumpulan dapat meninggalkan sampel yang hilang; kemunculannya bergantung pada heartbeat dan konsolidasi.

Sebelum menjalankan contoh berikut, selesaikan langkah penghentian sementara tersebut dan verifikasi status antrean/pekerja. Nilai kembali nol dari `poller_boost.php --force` saja bukan bukti bahwa flush telah selesai: proses Boost yang sudah terdaftar dapat menyebabkannya keluar tanpa melakukan pekerjaan. Koordinasikan layanan rrdcached atau penyimpanan jarak jauh secara terpisah.

Contoh Bash ini mengasumsikan penyimpanan lokal, akun basis data yang dikonfigurasi dalam berkas opsi klien pribadi, dan direktori RRA yang berisi semua RRD terkelola. Ganti setiap jalur. Buat inventaris jalur RRD absolut kustom, target tautan simbolis, konfigurasi eksternal, dan pengumpul jarak jauh, lalu cadangkan semuanya secara terpisah juga.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

Arsip aplikasi mencakup konfigurasi dan kode yang cocok. Catat revisi sumber, versi basis data dan RRDtool, jalur penyimpanan aktual, serta status penghentian/flush penulis bersama set cadangan tersebut. Contoh ini mengecualikan log biasa, cache, dan metadata Git; tinjau pengecualian tersebut untuk instalasi Anda.

Hanya set cadangan yang berhasil diambil dan diverifikasi checksum-nya yang menerima nama direktori akhir. Perintah yang gagal masih dapat meninggalkan berkas terpotong di dalam `.partial-*`; `set -e` menghentikan perintah berikutnya tetapi tidak menghapus keluaran yang sudah dibuat. Jangan mempromosikan direktori tersebut menjadi cadangan yang selesai. Checksum mendeteksi perubahan di kemudian hari, bukan kelengkapan logis; uji pemulihan tetap diperlukan.

Opsi `--single-transaction` mencakup tabel transaksional, bukan snapshot konsisten dari tabel plugin non-transaksional atau perubahan skema bersamaan. Biarkan penulis dan perubahan skema tetap dihentikan, atau gunakan metode pencadangan yang sesuai dengan mesin basis data. Lanjutkan pengumpulan data hanya setelah memastikan pengambilan cadangan telah selesai dan penyimpanan dapat digunakan. Lihat [dokumentasi mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) untuk persyaratan transaksi dan hak istimewa. Kelalaian pada resep sebelumnya dilacak di [website #12](https://github.com/kadupulhq/website/issues/12).

**Terima perbedaan waktu dan catatlah.** Bagian mana pun yang Anda ambil terlebih dahulu adalah bagian yang lebih lama, dan urutan mana pun tidak membuat pasangan aktif menjadi konsisten dengan sendirinya. Catat rentang waktunya; itulah yang membuat hasilnya dapat dipulihkan.

Jika Anda mengekstrak basis data terlebih dahulu dan menyalin berkas kemudian, berkas menjadi lebih baru. Sumber data yang dihapus dalam rentang waktu tersebut masih ada dalam dump tetapi berkasnya sudah hilang, meninggalkan referensi yang akan dibuat ulang oleh poller. Sumber data yang dibuat dalam rentang waktu tersebut tiba sebagai berkas yang tidak diketahui oleh basis data, yang tidak akan aktif.

Jika Anda menyalin berkas terlebih dahulu dan mengekstrak basis data kemudian, basis data menjadi lebih baru. Sumber data yang dibuat dalam rentang waktu tersebut ada dalam dump tanpa berkas di belakangnya, yang akan dibuat ulang oleh poller dalam keadaan kosong.

Urutan mana pun dapat menghilangkan riwayat sebelum rentang waktu jika berkas yang dibutuhkan dihapus sebelum sempat disalin. Ini juga dapat menangkap berkas yang tertulis sebagian atau sampel antrean yang tidak konsisten. Mencatat perbedaan waktu mendokumentasikan suatu batasan; itu tidak membuat pasangan yang tidak konsisten menjadi lengkap atau menjamin pemulihan.

## Hal dalam cadangan yang tidak Anda duga

Kredensial perangkat berada di basis data dalam teks biasa. Cache poller memuat community string SNMP serta nama pengguna, kata sandi, dan passphrase SNMPv3 sebagai kolom biasa, karena pengumpul membutuhkannya pada setiap putaran. Berkas konfigurasi memuat kata sandi basis data.

Oleh karena itu, cadangan Kadupul adalah penyimpanan kredensial untuk setiap perangkat yang Anda pantau. Enkripsikan saat tidak aktif, batasi siapa yang dapat membacanya, dan jangan mengunggahnya ke ruang berbagi berkas untuk umum.

## Urutan pemulihan

Urutan sangat penting karena setiap langkah bergantung pada langkah sebelumnya.

1. **Pulihkan konfigurasi terlebih dahulu.** Tanpa kredensial basis data dan jalur RRA, hal lainnya tidak dapat diperiksa. Jika pemulihan dilakukan ke perangkat keras yang berbeda, perbaiki jalurnya sekarang alih-alih nanti.

2. **Pulihkan struktur direktori RRD.** Tempatkan di lokasi yang ditentukan oleh konfigurasi. Periksa kepemilikan dan mode izin: poller menulis berkas-berkas ini sebagai pengguna poller, dan antarmuka web membacanya sebagai pengguna server web. Pemulihan yang mempertahankan konten tetapi tidak mempertahankan kepemilikan akan menghasilkan sistem yang menampilkan grafik dengan baik tetapi tidak mengumpulkan data baru sama sekali.

3. **Pulihkan basis data.** Tabel versi dalam dump harus cocok dengan kode yang Anda pulihkan. Pastikan semua peluncur dan penulis tetap dinonaktifkan sampai komponen yang dipulihkan telah diperiksa bersama-sama. Dump dari rilis lama yang dipulihkan ke kode baru akan mengarahkan antarmuka web ke penginstal, yang merupakan perilaku yang benar namun bukan hal yang Anda inginkan di tengah proses pemulihan. Pulihkan kode yang cocok terlebih dahulu.

4. **Bangun ulang cache poller.** Cache merupakan data turunan, dan pemulihan adalah situasi yang tepat di mana cache tersebut bisa menjadi usang. Pembangunan ulang hanya membutuhkan satu kali eksekusi dan menghilangkan berbagai gejala yang membingungkan.

5. **Mulai poller, lalu periksa satu berkas.** Pastikan waktu pembaruan terakhir berkas RRD bergerak maju setelah eksekusi pertama. Jika grafik terisi hingga titik pemulihan kemudian mendatar, periksa hasil pengumpulan, antrean, stempel waktu, jalur, dan izin. Grafik yang mendatar saja tidak menunjukkan penyebabnya secara spesifik.

## Jebakan yang harus diwaspadai

**Berkas RRD menolak pembaruan di masa lalu.** Berkas RRD tidak akan menerima sampel pada atau sebelum stempel waktu yang sudah dimilikinya. Memulihkan kumpulan berkas yang lebih lama terhadap basis data yang lebih baru tidak akan secara otomatis mengisi kembali sampel yang hilang. Antrean tertunda yang dipertahankan atau sumber lain mungkin berisi pembacaan yang dapat dipulihkan, tetapi pemutaran ulang memerlukan validasi terpisah dan pengurutan stempel waktu. Tanpa pembacaan tersebut, pengumpulan akan berlanjut dengan adanya celah data. Ini juga alasan mengapa Anda tidak dapat menggabungkan dua cadangan hanya dengan menyalin berkas di antara keduanya.

**Periksa apakah jalur yang disimpan diberi token sebelum menulis ulang apa pun.** Sumber data yang dibuat secara otomatis menyimpan jalurnya sebagai `<path_rra>/name.rrd`, dan token tersebut diperluas saat pembacaan dari pengaturan jalur RRD. Untuk jalur tersebut, memindahkan instalasi berarti mengubah pengaturan dan membangun ulang cache poller, bukan menulis ulang baris basis data. Jalur yang dimasukkan secara manual disimpan secara harfiah dan memang perlu ditulis ulang. Periksa sebelum Anda menjalankan pembaruan di seluruh tabel, karena menulis ulang jalur bertoken menjadi jalur absolut adalah perubahan yang membuat pemindahan berikutnya menjadi jauh lebih sulit.

**Pengumpul jarak jauh memiliki berkas konfigurasi tersendiri.** Masing-masing menyimpan kredensial basis data dan ID pengumpulnya sendiri. Keduanya tidak berada dalam cadangan basis data pusat. Amankan berkas tersebut per host.

**Data plugin berada di basis data yang sama.** Plugin membuat tabelnya sendiri saat instalasi, sehingga dump basis data lengkap mencakup tabel-tabel tersebut. Kode plugin tidak berada di dalam basis data. Jika Anda memulihkan basis data tanpa direktori `plugins/` yang cocok, instalasi akan menonaktifkan plugin yang tidak dapat ditemukannya.

**Cadangan yang belum pernah Anda pulihkan hanyalah sebuah hipotesis.** Lakukan pemulihan ke instans uji secara berkala. Modus kegagalan yang paling sering ditemukan melalui cara ini bukanlah kerusakan data, melainkan cadangan yang ternyata hanya pernah mengambil satu dari tiga komponen yang dibutuhkan.
