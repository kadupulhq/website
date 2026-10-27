---
title: Meningkatkan Versi Secara Aman
description: Simulasikan peningkatan, simpan cadangan yang cocok, periksa status penyimpanan dan skema, serta rencanakan pemulihan (rollback) terkoordinasi.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 8
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi resmi. Ujilah prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Peningkatan versi mengubah tiga hal pada waktu yang berbeda dan dengan tingkat reversibilitas yang berbeda.

| Perubahan | Dapat dibatalkan (reversibel) | Caranya |
|---|---|---|
| Kode, dependensi, dan konfigurasi | Dari salinan yang disimpan | Pulihkan revisi dan pengaturan yang cocok |
| Skema basis data dan sampel dalam antrean | Dari cadangan yang cocok | Pulihkan basis data; tidak ada migrasi balik otomatis |
| Berkas RRD | Dari cadangan yang cocok | Pulihkan riwayat yang disimpan; sampel yang tidak ada dalam cadangan tidak dapat dibuat ulang melalui rollback |

Prosedur ini ada untuk menjaga agar ketiga hal tersebut tetap selaras.

## Sebelum Anda mulai

**Lakukan pencadangan penuh.** Ketiga komponen, konsisten satu sama lain. Ikuti [Pencadangan dan pemulihan](/id/guides/back-up-and-restore/). Hentikan semua proses penulisan sebelum pengambilan akhir dan simpan cadangan yang dilindungi sampai peningkatan versi diterima.

**Catat revisi saat ini dan versi skema.** Sertakan dependensi, perubahan lokal, plugin, dan konfigurasi. Beberapa revisi kode sumber dapat melaporkan versi skema yang sama. Simulasikan revisi target pada salinan terisolasi yang dipulihkan.

**Periksa setiap plugin.** Periksa deklarasi kompatibilitas, kode, dan dependensinya, lalu uji fungsi yang Anda butuhkan terhadap revisi target. Deklarasi versi minimum saja tidak menjamin kompatibilitas. Lihat [Validasi plugin](/id/guides/install-and-vet-plugins/).

**Periksa runtime.** Versi PHP, ekstensi PHP, dan versi server basis data. Periksa [persyaratan](/id/reference/requirements/) target sebelum penerapan. Jangan berasumsi bahwa CLI skema melakukan setiap pemeriksaan penginstal web.

**Pastikan akun basis data dapat mengubah skema.** Saat runtime, akun hanya perlu membaca dan menulis di dalam basis datanya sendiri. Pada saat peningkatan versi, akun juga perlu membuat, mengubah, dan menghapus tabel serta indeks. Instalasi yang memperketat hak akses setelah penyiapan akan menemukan kendala di sini.

**Hentikan setiap produsen.** Hentikan pengumpulan terjadwal, pengumpul jarak jauh, pengumpulan yang dipicu web, dan pemeliharaan manual; tunggu hingga pekerjaan yang sedang berjalan selesai. Kosongkan penulisan yang tertunda hanya setelah produsen berhenti, dan pertahankan baris antrean yang belum diakui bersama cadangan yang cocok. Biarkan produsen tetap dihentikan selama penerapan dan validasi skema.

## Mengganti aplikasi

Penyalinan tumpang-tindih memiliki batasan tertentu:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Tanpa tanda titik tersebut, `cp -a /path/to/new-release /path/to/kadupul` akan membuat `kadupul/new-release/` dan membiarkan setiap berkas aplikasi lama tepat di tempat semula. Peningkatan versi tampak berhasil, antarmuka masih menjalankan kode lama, dan tanda masalah pertama adalah migrasi skema menolak mencocokkan versi yang Anda kira sudah Anda ganti.

Penyalinan tumpang-tindih tetap mempertahankan berkas yang tidak ada di struktur pohon baru, termasuk berkas aplikasi yang sudah usang. Tindakan ini dapat menimpa jalur yang cocok, jadi periksalah artefak alih-alih berasumsi konfigurasi atau data dikecualikan. Lebih disukai menggunakan struktur pohon bertahap yang telah ditinjau dengan dependensi, konfigurasi, dan plugin yang cocok. Jika beralih rilis melalui symlink, validasi jalur RRA efektif dan akses penyimpanan sebelum pengalihan; bootstrap saat ini menurunkannya dari direktori aplikasi ditambah `/rra`. Pengalihan symlink saja bukanlah rollback basis data.

**Periksa apa yang sebenarnya Anda jalankan sebelum melanjutkan.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Jika perintah tersebut tidak melaporkan rilis yang baru saja Anda terapkan, hentikan. Semua langkah setelah titik ini mengasumsikan kode yang dimaksud telah diterapkan. Bandingkan juga revisi sumber atau checksum artefak dengan catatan rilis; string versi saja tidak cukup.

## Migrasi skema

Basis data membawa versinya sendiri, terpisah dari versi dalam kode. Mengganti kode tidak mengubah versi tersebut.

Halaman terautentikasi lawas akan mengarahkan ke penginstal jika versi kode dan versi basis data tidak cocok. Ini bukan perlindungan universal untuk setiap endpoint atau CLI, dan string versi yang cocok tidak membuktikan bahwa setiap migrasi telah selesai. Periksa status skema secara langsung.

Penginstal dan CLI menjalankan langkah-langkah migrasi yang berurutan. Sebelum peningkatan skema normal, periksa antrean persisten dan akses penyimpanan akun layanan. Jika antrean `poller_output` yang diwarisi bukan InnoDB, konversikan secara eksplisit dengan penulis yang dihentikan dan cadangan yang tetap disimpan:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Kemudian jalankan ini di bawah setiap akun web dan poller yang sebenarnya:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Kedua flag tersebut merupakan operasi terpisah dan tidak dapat digabungkan. Konversi antrean mempertahankan sampel yang tertunda; jangan memotong baris hanya untuk melewati pemeriksaan. Selesaikan kepemilikan dan konfigurasi UID/GID numerik tepercaya menggunakan [persyaratan penyimpanan](/id/reference/requirements/). Pengumpul jarak jauh daring biasanya memilih antrean utama; gunakan `--local` hanya untuk pemeriksaan atau konversi antrean lokal yang disengaja. Setelah pemeriksaan tersebut lolos, jalankan peningkatan skema dari direktori root aplikasi:

```sh
php cli/upgrade_database.php
```

Jalankan sebagai akun layanan yang dikonfigurasi dengan akses sistem berkas dan hak istimewa basis data yang diperlukan. Pemeriksaan root yang berhasil tidak membuktikan akses akun layanan. Ada opsi `--forcever` untuk mengatur versi awal secara eksplisit, yang disediakan untuk menjalankan ulang migrasi selama pengujian pra-rilis. Opsi ini bukan bagian dari peningkatan normal dan menggunakannya untuk melewati langkah yang gagal akan membuat skema bermigrasi setengah jalan.

Catat status keluar dan keluarannya, lalu verifikasi versi basis data dan perubahan skema yang diperlukan. CLI saat ini dapat menolak versi awal warisan yang tidak dikenal atau tidak didukung namun tetap keluar dengan kode 0; status shell yang sukses saja tidak cukup. Jika migrasi gagal di tengah jalan, biarkan produsen tetap dihentikan dan pulihkan set cadangan yang cocok alih-alih mencoba melewati langkah yang gagal.

## Hal yang merusak plugin

Pemeriksaan plugin pada penginstal web dapat menonaktifkan plugin yang tidak kompatibel atau hilang. Jangan berasumsi bahwa CLI skema melakukan pemeriksaan siklus hidup plugin yang sama.

**Versi minimum yang dideklarasikan berada di atas versi inti baru.** Dinonaktifkan. Ini adalah kasus normal dan merupakan hal yang seharusnya tertangkap oleh pemeriksaan pra-peningkatan Anda.

**Direktori plugin, berkas penyiapannya, atau berkas deklarasinya hilang.** Dinonaktifkan. Plugin yang berkasnya dihapus sementara masih ditandai aktif di basis data termasuk dalam kasus ini.

**Plugin tidak memiliki berkas deklarasi sama sekali.** Ini dapat menyebabkan kegagalan pemeriksaan kompatibilitas penginstal. Ujilah paket plugin kompatibel yang terpelihara alih-alih berasumsi dapat diaktifkan kembali tanpa perubahan.

Ada kasus keempat yang bukan merupakan kerusakan. Fungsionalitas yang dulunya merupakan plugin dan kini telah dipindahkan ke inti akan dihapus langsung, bukan dinonaktifkan: hook dan entri izinnya dicabut dan barisnya dihapus. Jika Anda melihat plugin menghilang alih-alih berubah menjadi abu-abu, periksa log migrasi dan disposisi plugin tertentu tersebut sebelum menyimpulkan bahwa fitur yang setara telah tersedia.

Menonaktifkan plugin berbeda dengan mencopot pemasangannya. Hook dan migrasi plugin dapat mengubah tabel dan izinnya sendiri; simpan kode dan data plugin yang cocok serta verifikasi jalur peningkatan spesifiknya. Jangan menjanjikan pelestarian data secara universal.

## Perencanaan rollback

Tentukan rollback sebelum Anda mulai, karena keputusannya berbeda tergantung pada seberapa jauh Anda melangkah.

| Titik kegagalan | Cara rollback |
|---|---|
| Kode diganti, tidak ada operasi pengubah status atau penulis yang berjalan | Pulihkan kode, dependensi, dan konfigurasi sebelumnya setelah memastikan status tidak berubah |
| Konversi antrean atau migrasi dimulai, termasuk kegagalan parsial | Hentikan penulis dan pulihkan cadangan kode, konfigurasi, basis data, dan RRD yang cocok |
| Migrasi selesai, aplikasi berperilaku tidak normal | Hentikan penulis dan pulihkan set cadangan yang cocok; perhitungkan sampel yang dikumpulkan setelah pencadangan |
| Hanya plugin yang rusak | Biarkan tetap dinonaktifkan sambil menilai perbaikan versus rollback terkoordinasi terhadap kriteria penerimaan |

Aturan di balik tabel ini: kode dan skema di-rollback bersama-sama atau tidak sama sekali. Kode lama terhadap skema baru bukanlah kondisi yang didukung. Jangan mengandalkan pemeriksaan versi web untuk mencegah setiap operasi yang tidak kompatibel.

Beri batasan waktu untuk diri Anda sendiri. Tentukan sebelumnya berapa lama Anda akan menghabiskan waktu untuk proses debug sebelum memutuskan memulihkan cadangan, dan patuhi itu. Cadangan menjadi semakin kurang berguna semakin lama sistem berjalan dalam kondisi setengah ditingkatkan.

## Mengapa berkas RRD adalah bagian yang tidak boleh hilang

Jangan berasumsi bahwa penerapan, pemeliharaan, atau pengumpulan yang dilanjutkan akan membiarkan berkas RRD tidak berubah. Cadangkan berkas tersebut bersama dengan basis data dan pulihkan set yang cocok saat mengembalikan perubahan status. Sampel antrean yang disimpan mungkin belum ada dalam berkas-berkas tersebut. Cadangan RRD yang diverifikasi dapat memulihkan riwayat yang tertangkap; sampel yang hilang tidak dapat direkonstruksi hanya dengan memulihkan skema atau kode. Lihat [Sumber data dan arsip round-robin](/id/concepts/data-sources-and-rras/) mengenai alasan resolusi di dalamnya juga tidak dapat direkonstruksi.

Tiga cara spesifik yang menyebabkan hilangnya berkas RRD selama peningkatan versi:

**Menerapkan dengan mengganti direktori instalasi.** Direktori RRA secara default merupakan subdirektori dari instalasi. Menghapus direktori lama dan membongkar direktori baru di tempatnya dapat menghapus pengukuran yang disimpan. Pertahankan struktur RRA melalui pengaturan penyimpanan yang telah diuji sebelum mengganti aplikasi. Validasi `$config['rra_path']` yang efektif, jalur bersarang, dan pemeriksaan kepercayaan akun layanan; revisi ini tidak menyediakan pengaturan basis data umum untuk root RRA lokal yang arbitrer.

**Menerapkan dari checkout atau paket yang menguasai seluruh struktur pohon.** Kegagalan yang sama, terjadi secara otomatis. Konfirmasikan apa yang dianggap dapat dihapus oleh metode penerapan Anda.

**Memperbaiki izin dengan perubahan kepemilikan secara rekursif.** Tidak berbahaya bagi data tetapi dapat menyebabkan poller tidak dapat menulis, yang muncul sebagai sistem yang membuat grafik riwayat dengan sempurna namun tidak mengumpulkan data baru apa pun.

## Setelah peningkatan versi

1. Periksa keluaran peningkatan, versi basis data, dan perubahan skema yang diperlukan, lalu pastikan antarmuka berhasil dimuat. Tidak adanya pengalihan saja belum cukup membuktikan keberhasilan.
2. Selesaikan peningkatan kode/konfigurasi pengumpul jarak jauh yang direncanakan dan validasi target basis datanya sementara produsennya tetap dihentikan.
3. Ulangi pemeriksaan penyimpanan akun layanan, lanjutkan pengumpul yang ditentukan, dan verifikasi waktu pembaruan terakhir RRD representatif serta nilai tersimpan yang dapat digunakan.
4. Periksa berkas log untuk baris statistik eksekusi dan bandingkan waktu yang berlalu dengan catatan sebelumnya. Rilis baru dapat mengubah beban pengumpulan.
5. Aktifkan kembali plugin yang dinonaktifkan, satu per satu, setelah memasang versi yang menyatakan kompatibilitas dengan inti baru.
6. Periksa kedalaman antrean yang dipertahankan, pengumpulan jarak jauh, dan pekerjaan plugin selama jendela penerimaan yang disepakati. Simpan cadangan rollback sampai pemeriksaan tersebut lolos.
