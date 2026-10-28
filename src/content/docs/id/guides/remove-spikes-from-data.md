---
title: Menghapus lonjakan dari data
description: Pratinjau koreksi lonjakan, pertahankan salinan pemulihan, dan verifikasi perubahan pada sampel RRD yang disimpan.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji terisolasi.
sidebar:
  order: 19
---

:::caution[Validasi sebelum penggunaan]
Kode sumber tersedia, namun belum ada rilis atau jalur migrasi Kadupul
yang didukung secara resmi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

:::danger[Tindakan ini menulis ulang riwayat data; pemulihan memerlukan cadangan]
Penghapusan lonjakan mengekstrak arsip, mengedit nilai, memulihkan berkas sementara pendamping,
dan menggantikan berkas asli setelah validasi. Tidak ada pembatalan otomatis. Simpan
dan verifikasi salinan pemulihan, jalankan `--dryrun` terlebih dahulu, dan pastikan sampel target
sudah benar sebelum menerapkan perubahan.
:::

Lonjakan (spike) di sini berarti satu atau dua sampel data yang nilainya jauh lebih besar daripada data lain di
sekelilingnya, sehingga sumbu vertikal grafik menyesuaikan skala ke nilai tersebut dan meratakan sisa grafik
ke garis dasar. Pengukuran tersebut salah, dan tampilannya sangat mengganggu.

## Dari mana asalnya

Sebagian besar lonjakan pada sumber data berbasis penghitung (counter) merupakan anomali aritmetika, bukan pengukuran riil.
Sumber data counter menyimpan laju yang dihitung dari selisih antara dua
pembacaan. Apa pun yang membuat pembacaan kedua jauh lebih besar daripada pembacaan pertama,
relatif terhadap selang waktu di antara keduanya, dapat menghasilkan laju palsu. Reset counter,
penanganan wrap counter yang salah, re-index antarmuka yang memindahkan pembacaan ke sumber
data yang keliru, atau kesalahan stempel waktu dapat memicu hal ini. Kondisi wrap counter normal
bukanlah bukti adanya sampel buruk; verifikasi tipe sumber data dan data pembacaan masukannya.

Lihat [Sumber data dan RRA](/id/concepts/data-sources-and-rras/) untuk memahami bagaimana laju data
dihitung.

Perbaiki penyebab utamanya jika memungkinkan. Menghapus lonjakan hanyalah perbaikan kosmetik; tindakan ini tidak mencegah
terjadinya lonjakan berikutnya.

## Empat metode

Alat ini bekerja pada keseluruhan berkas: mengekstrak setiap arsip dalam berkas RRD, menentukan
nilai mana yang akan diganti, dan memulihkan hasilnya.

| Metode | Apa yang dipilih | Memerlukan jendela waktu |
|---|---|---|
| `stddev` | Nilai yang berjarak lebih dari N deviasi standar dari rata-rata | Tidak |
| `variance` | Nilai yang melebihi N persen di atas rata-rata setelah pencilan dibuang | Tidak |
| `float` | Semua data di dalam jendela waktu yang ditentukan | Ya |
| `fill` | Sampel tidak diketahui dan bernilai nol di dalam jendela waktu yang ditentukan | Ya |

`stddev` dan `variance` mencari anomali secara otomatis. `float` dan `fill` menjalankan apa yang Anda perintahkan dalam
rentang waktu yang ditentukan, dan keduanya akan langsung gagal jika Anda tidak memberikan batas awal dan akhir.

`fill` tidak terbatas pada data yang hilang: metode ini dapat menggantikan nilai nol hasil pengukuran dengan
nilai bukan nol. Jangan menggunakannya pada rentang waktu yang memuat pembacaan nol atau status diam yang valid,
kecuali perubahan tersebut memang disengaja.

Metode varians membuang N sampel tertinggi dan terendah sebelum menghitung
nilai rata-rata pembanding, di mana N adalah pengaturan outlier. Hal inilah yang mencegah
nilai lonjakan itu sendiri menaikkan batas ambang deteksi.

Apa pun yang dipilih akan diganti, dan ada tiga nilai pengganti yang tersedia.

| Pengganti | Hasil |
|---|---|
| `last` | Nilai baik terakhir yang diketahui. Pilihan bawaan. |
| `avg` | Rata-rata terhitung untuk bidang/arsip; perhitungannya tergantung pada metode yang dipilih. |
| `nan` | Nilai tidak diketahui untuk metode statistik; lihat batasan metode jendela di bawah ini. |

Nilai tidak diketahui mencatat bahwa pengukuran yang valid tidak tersedia. `last` dan `avg`
memasukkan nilai yang dapat terlihat seperti hasil pengukuran riil bagi orang yang membaca grafik di kemudian hari.
Pilihlah nilai pengganti dengan cermat dan verifikasi hasil penyimpanan yang sebenarnya.

**Metode jendela dengan NaN:** dengan `--avgnan=nan`, `float` mengganti setiap nilai yang diketahui
dalam jendela menjadi tidak diketahui, dan `fill` mengganti nilai nol atau non-numerik dalam
jendela menjadi tidak diketahui. Metode statistik dengan batas waktu opsional hanya mengganti
pencilan yang terdeteksi, sehingga tidak sama dengan mengosongkan seluruh jendela waktu.

## Pratinjau, lalu terapkan

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Uji coba (dry run) mengekstrak RRD dan menganalisisnya tanpa menulis ulang berkas produksi. Operasi ini tetap
memerlukan direktori kerja yang valid dan izin pemeliharaan. Pratinjau tidak mengunci
berkas hingga proses penerapan akhir: sampel baru atau perubahan opsi dapat mengubah
hasilnya. Contoh dengan jendela waktu tetap menggunakan seleksi statistik; perintah tersebut tidak menghapus
semua nilai dalam jendela waktu itu.

Argumen waktu menerima stempel waktu Unix atau teks tanggal. Teks yang
tidak dapat diurai akan ditolak sebelum penulisan berkas dimulai. Gunakan stempel waktu Unix jika
penafsiran zona waktu berpotensi membingungkan.

## Apa yang sebenarnya terjadi pada berkas

Hal penting yang perlu diketahui sebelum Anda menjalankannya pada data berharga:

1. Berkas diekstrak menjadi XML di dalam direktori cadangan.
2. Komentar dihapus dan setiap arsip dipindai untuk analisis statistik.
3. Nilai yang dipilih diganti di dalam XML.
4. Berkas asli disalin ke dalam direktori cadangan.
5. XML yang telah diedit dipulihkan ke berkas sementara berdampingan, divalidasi, dan diganti namanya
   menimpa berkas asli dengan mempertahankan pemilik, grup, dan izinnya.

Langkah 4 adalah jaring pengaman dan bukan pilihan opsional: jika penyalinan gagal, pemulihan
tidak akan dijalankan. Salinan cadangan itulah, dan bukan argumen baris perintah, tempat Anda
memulihkan data jika terjadi masalah. Namanya didasarkan pada berkas asli dan dapat diberi akhiran unik untuk menghindari
penimpaan artefak yang sudah ada. `--backup` secara eksplisit meminta snapshot
pemulihan persisten. Periksa jalur yang dilaporkan dan verifikasi salinannya sebelum Anda
mengandalkannya.

Operasi ini memerlukan direktori POSIX lokal tepercaya dan penguncian pemeliharaan;
hanya memiliki izin tulis saja tidak cukup. Alat ini menolak media penyimpanan yang tidak didukung dan
endpoint rrdcached yang terkonfigurasi. Hentikan proses penulisan eksternal, yang tidak terikat pada
protokol penguncian Kadupul. Jalankan sebagai akun layanan pengelola penyimpanan yang dituju.
Lihat [persyaratan instalasi](/id/reference/requirements/) untuk akses penyimpanan.

## Pengaturan yang mengontrol nilai bawaan

Argumen baris perintah memiliki prioritas tertinggi. Parameter apa pun yang Anda lewatkan diambil dari
pengaturan sistem, dan pengaturan per pengguna menimpa pengaturan sistem ketika alat ini
dijalankan dari antarmuka web.

| Pengaturan | Bawaan | Apa yang dilakukannya |
|---|---|---|
| Removal method | Variance with outliers removed | Metode penghapusan yang digunakan |
| Replacement method | Last known good | Nilai pengganti untuk data yang dihapus |
| Number of standard deviations | 10 | Batas ambang untuk metode `stddev` |
| Variance percentage | 1000 | Batas ambang untuk metode `variance` |
| Variance number of outliers | 5 | Sampel tertinggi dan terendah yang dibuang sebelum dirata-rata |
| Max kills per RRA | 5 | Batas maksimal yang diharapkan; saat ini belum ditegakkan secara ketat |
| RRDfile backup directory | `cache/spikekill/` under the install | Lokasi penyimpanan hasil dump dan salinan cadangan |
| Backup retention | 3 months | Berapa lama salinan cadangan disimpan |

Tersedia juga mode batch: jadwal berkala (setiap 6, 12, 24, atau 48 jam), waktu
acuan, dan daftar templat grafik yang akan diproses. Mode batch dinonaktifkan secara bawaan.
Mengaktifkannya berarti sistem akan mengedit arsip tanpa ada orang yang memverifikasi
hasilnya secara langsung. Batasi daftar templat dengan sangat ketat jika Anda memutuskan untuk mengaktifkannya.

## Jebakan

**Batas ambang bawaan sengaja dibuat sangat longgar.** Sepuluh deviasi standar dan
varians 1000 persen mencakup rentang yang sangat lebar. Eksekusi yang tidak mendeteksi lonjakan kemungkinan besar
bukanlah sebuah kegagalan; alat tersebut hanya memberi tahu bahwa nilai Anda berada dalam batas yang Anda tentukan. Perketat
ambang batas daripada mengganti metode secara asal-asalan.

**Max kills per RRA hanya membatasi metode statistik.** Untuk `stddev` dan
`variance`, hitungan mencakup semua sumber data dalam satu arsip dan disetel ulang pada
arsip berikutnya. Metode jendela `float` dan `fill` mengganti setiap nilai yang cocok di dalam
jendela. Total ringkasan mencakup penggantian dengan NaN. Tinjau pratinjau lengkap
dan gunakan jendela waktu yang sempit.

**Nilai terkonsolidasi tidak dapat dikembalikan secara akurat.** Arsip yang lebih lama menyimpan satu nilai per
periode, yang sudah dirata-rata sebelumnya. Mengganti nilai tersebut tidak memulihkan pengukuran
asli untuk periode tersebut; penggantian itu hanya memasukkan nilai perkiraan yang masuk akal. Semakin jauh ke masa lalu,
koreksi tersebut semakin mendekati tebakan belaka.

**Direktori cadangan harus dikonfigurasi dan tepercaya.** Hasil ekstraksi dan
salinan pemulihan disimpan di sana. Direktori yang hilang, tidak aman, atau tidak dapat diverifikasi akan ditolak; jangan
mengubah izin direktori menjadi dapat ditulis oleh siapa saja hanya untuk melewati pesan kesalahan.

**Simpan catatan perubahan Anda sendiri selain log aplikasi.** Catat operator,
perintah, rentang waktu, jalur cadangan, dan pemeriksaan sebelum serta sesudah operasi. Ringkasan jumlah data saja
bukan bukti yang memadai mengenai perubahan yang telah terjadi.

**Jalankan sebagai akun layanan yang sesuai.** Penggantian yang berhasil mempertahankan kepemilikan
dan izin berkas. Pengguna root bukan jalan pintas untuk melewati pemeriksaan keamanan direktori;
pastikan proses polling normal tetap dapat memperbarui berkas yang dihasilkan.

**Menghapus lonjakan tidak memperbaiki grafik jika sumber datanya salah.** Jika sebuah
re-index antarmuka memindahkan nilai pembacaan ke sumber data yang salah, lonjakan tersebut hanyalah sebuah
gejala. Lihat [Mengatasi data yang hilang](/id/guides/troubleshoot-missing-data/)
sebelum Anda mulai mengedit arsip data.
