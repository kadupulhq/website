---
title: Cache poller
description: Mengapa pengumpul membaca daftar kerja yang telah dihitung sebelumnya alih-alih konfigurasi Anda, dan mengapa hal itu menjadi alasan umum mengapa perubahan tampaknya tidak berpengaruh apa-apa.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 6
---

[Arsitektur](/id/concepts/architecture/) memperkenalkan cache poller dalam satu kalimat:
daftar kerja telah dihitung sebelumnya, dan pengumpul membaca daftar tersebut alih-alih
mengevaluasi konfigurasi Anda pada setiap siklus. Halaman ini membahas apa arti keputusan
tersebut sebenarnya dalam praktik.

## Apa yang seharusnya harus dilakukan oleh pengumpul

Menentukan apa yang harus dikumpulkan untuk satu nilai memerlukan penyelesaian seluruh
rantai dependensi. Sumber data menunjuk ke suatu perangkat dan template data. Template
menunjuk ke input data. Input data memiliki bidang, beberapa di antaranya ditimpa per
perangkat dan beberapa diwarisi dari template. Jika sumber data berasal dari kueri data,
indeks saat ini harus diselesaikan melalui cache kueri. Kemudian kredensial SNMP harus
diambil dari perangkat, kecuali jika ada bidang yang menimpanya.

Itu berarti beberapa operasi join untuk satu nilai tunggal. Penginstalan sederhana
memiliki puluhan ribu nilai dan menjalankan satu siklus setiap lima menit. Melakukan
penyelesaian ini pada saat pengumpulan data akan membuat basis data, bukan jaringan,
yang menentukan berapa banyak perangkat yang dapat Anda pantau.

Oleh karena itu, resolusi hanya terjadi sekali ketika terjadi perubahan, dan hasilnya
ditulis secara mendatar.

## Apa yang disimpan oleh cache

Cache menghitung instruksi pengumpulan data sebelumnya. Ini mengurangi evaluasi konfigurasi
yang berulang, tetapi tidak menghilangkan join atau pembacaan status perangkat secara langsung.

| Disimpan dalam baris | Alasan keberadaannya |
|---|---|
| Pengumpul mana yang memilikinya | Setiap pengumpul hanya memilih baris miliknya sendiri |
| Tindakan: SNMP, skrip, atau server skrip | Menentukan jalur kode mana yang dijalankan |
| Nama host, versi SNMP, port, batas waktu, komunitas, atau kredensial | Bidang koneksi yang di-cache; status host langsung juga dibaca |
| OID, atau baris perintah skrip lengkap | Sudah disubstitusi, siap dijalankan |
| Jalur ke file RRD | Sudah diselesaikan |
| Nama bidang di dalam file tersebut dan berapa banyak bidang dalam pembacaan lengkap | Memungkinkan output dicocokkan dan divalidasi |
| Step, dan hitungan mundur hingga waktu berikutnya item ini jatuh tempo | Lihat [Waktu dan interval](/id/concepts/time-and-intervals/) |

`cmd.php` menggabungkan `poller_item` ke `host`, memfilter perangkat yang dinonaktifkan,
dan menggunakan bidang perangkat langsung untuk pemeriksaan ketersediaan dan pengindeksan
ulang. OID, perintah, dan metadata RRD yang di-cache tetap harus cocok dengan sumber data yang dituju.

Kredensial yang di-cache adalah snapshot, tetapi menyimpan kredensial yang diubah melalui
API perangkat biasanya menyegarkan cache yang terpengaruh. Pengeditan basis data langsung
mengabaikan jalur tersebut dan dapat meninggalkan snapshot yang kedaluwarsa. Verifikasi
cache yang sebenarnya daripada menganggap setiap perubahan kredensial memerlukan pembangunan ulang manual.

Jalur RRD juga merupakan snapshot. Memindahkan file atau mengubah lokasi file membuat
setiap baris yang di-cache tetap menunjuk ke lokasi lama.

## Apa yang menulisnya

Cache dipelihara secara bertahap oleh operasi yang mengetahui bahwa mereka telah mengubah sesuatu.

| Operasi | Baris yang ditulis ulang |
|---|---|
| Menyimpan perangkat | Perubahan pada bidang koneksi, pengumpul, atau status nonaktif memicu pushout; bidang pengumpulan yang tidak berubah dapat menggunakan jalur penyimpanan cepat |
| Menyimpan sumber data | Baris sumber data tersebut |
| Membuat grafik dan sumber data dari template | Baris yang baru dibuat |
| Menjalankan kueri data yang memindahkan atau menyelesaikan indeks | Hanya sumber data yang berubah |
| Membangun ulang lewat CLI | Perangkat aktif yang diproses oleh worker; cacat penerusan `--host-id` saat ini mencegah ketergantungan pada isolasi perangkat |

Menulis ulang bukanlah penyisipan buta. Baris untuk sumber data yang sedang dibangun ulang
awalnya ditandai sebagai tidak ada, kemudian set baru ditulis, dan apa pun yang masih
ditandai tidak ada akan dihapus. Begitulah cara menghapus baris untuk bidang yang tidak
ada lagi. Pembersihan buffer dibatasi oleh ID pengumpul dan sumber data. Hal ini melindungi
sumber yang tidak terkait dalam jalur normal yang ditargetkan; ini bukan jaminan terhadap
pembangunan ulang bersamaan atau kegagalan penulisan basis data. Verifikasi baris yang
dihasilkan setelah pembangunan ulang, termasuk perangkat terdekat yang tidak terpengaruh saat menyelidiki cakupan.

## Baris yang tidak pernah ditulis

Beberapa konfigurasi tidak menghasilkan baris cache baru. Periksa log serta grafiknya.

Pembangun melewati perangkat yang dinonaktifkan, tetapi tindakan massal **Nonaktifkan**
mempertahankan baris cache yang ada dan pengumpulan memfilter perangkat tersebut keluar.
Pembangunan ulang saat dinonaktifkan dapat menghapus baris. Tindakan massal **Aktifkan**
menggunakan kembali cache yang terisi atau menginisialisasinya saat kosong; penyimpanan
perangkat tambahan umumnya tidak diperlukan. Cache parsial atau usang yang ada masih memerlukan penyelidikan.

Item SNMP yang perangkatnya tidak memiliki konfigurasi SNMP yang dapat digunakan tidak
menghasilkan apa pun. Tidak ada versi, versi di luar jangkauan, atau komunitas kosong
pada versi 1 atau 2 membuat baris dilewati alih-alih ditulis sebagai baris yang akan
gagal di setiap siklus.

Saat daftar putih input dikonfigurasi, file yang hilang atau input yang ditolak mencegah
baris baru untuk input tersebut. Pembangunan ulang yang dilakukan tetap membersihkan
baris-baris usangnya. Tanpa konfigurasi `input_whitelist`, pemeriksaan ini mengizinkan
input; ini bukan perlindungan yang selalu aktif. Tinjau perintah yang ditolak dan
kebijakan yang dikonfigurasi sebelum mengubah daftar putih.

Antarmuka masih dapat menampilkan sumber data yang cachenya kosong. Grafiknya dapat
mempertahankan riwayat lama atau menampilkan celah; garis nol datar bukan indikator
yang andal. Kredensial yang hilang dan input yang ditolak adalah kondisi konfigurasi yang harus diselesaikan.

## Mengapa suatu perubahan tampaknya tidak berpengaruh apa-apa

Tiga mekanisme berbeda menghasilkan gejala yang sama.

**Baris tidak dibangun ulang.** Anda mengubah sesuatu yang menurut antarmuka tidak
memengaruhi pengumpulan data, atau Anda mengubahnya di luar antarmuka. Cache masih
menyimpan jawaban lama. Pembangunan ulang dapat menyegarkan bidang yang di-cache
setelah konfigurasi yang dimaksudkan diverifikasi.

**Baris tidak pernah dibuat.** Dibahas di atas. Pembangunan ulang menyelesaikan ini
juga, tetapi hanya setelah kondisi yang mendasarinya diperbaiki, dan diagnostik sering
muncul di log alih-alih pada grafik.

**Nilai dikumpulkan lalu dibuang.** Output bernilai banyak dipetakan melalui definisi
bidang template, dan bidang yang tidak dirujuk dapat dilewati selama penguraian. Periksa
nama bidang yang diharapkan, pemetaan, dan asosiasi grafik; aturan ini tidak membuang
semua sampel numerik secara membabi buta tanpa referensi grafik. Pembangunan ulang cache
tidak dapat memperbaiki kontrak output yang salah.

## Instrumen tumpul

Untuk satu perangkat, gunakan **Isi Ulang Cache Poller** pada halaman perangkat
klasiknya. Tindakan tersebut memanggil jalur `push_out_host()` yang dicakup oleh
perangkat. Periksa baris dan diagnostik yang dihasilkan setelahnya.

Skrip induk `rebuild_poller_cache.php` saat ini menerima `--host-id`, tetapi tidak
meneruskan filter tersebut ke perintah worker-nya. Oleh karena itu, pembangunan ulang
CLI untuk satu perangkat dapat membangun ulang perangkat aktif lainnya. Jangan
mengandalkan opsi tersebut untuk isolasi sampai cacat aplikasi ini diperbaiki.

Pembangunan ulang CLI secara luas tersedia dari root aplikasi, dijalankan sebagai pengguna poller:

```bash
php cli/rebuild_poller_cache.php
```

Ini memproses perangkat yang diaktifkan; ini bukan perbaikan untuk setiap sumber yang
tidak memiliki host atau dinonaktifkan. Tindakan ini menulis ke tabel pengumpulan dan
dapat memakan waktu. Hindari pembangunan ulang yang tumpang tindih dan jangan menghentikannya.
Opsi `--force` CLI mengesampingkan pengaman registrasi prosesnya, jadi ini bukan opsi
perbaikan rutin.

Membangun ulang menyegarkan status turunan; tindakan ini tidak memperbaiki keterjangkauan
perangkat, memindahkan file RRD, memperbaiki perintah input yang ditolak, atau memulihkan
riwayat yang hilang. Periksa cache yang dihasilkan, log, dan pengumpulan berikutnya
sebelum menyatakan perbaikan selesai.

Kadupul mencatat kapan cache terakhir berubah, yang memungkinkan bagian lain dari
sistem mengetahui bahwa mereka perlu membacanya kembali.

## Beberapa pengumpul

Dengan lebih dari satu pengumpul, setiap baris dimiliki secara tepat oleh salah satu
dari mereka, dan baris-baris tersebut didorong ke basis data pengumpul itu sendiri
serta basis data pusat.

Jika pengumpul jarak jauh tidak dapat dijangkau saat Anda menyimpan perubahan,
perubahan tersebut mendarat secara terpusat dan bukan dari jarak jauh, dan Kadupul
menyatakannya demikian: meminta sinkronisasi penuh setelah pengumpul kembali aktif.
Hingga sinkronisasi tersebut, pengumpul jarak jauh menjalankan daftar kerja yang lebih
lama daripada yang ditampilkan antarmuka kepada Anda. Ketidaksesuaian khusus pengumpul
adalah alasan untuk memeriksa status replikasi, konektivitas, dan cache lokal masing-masing pengumpul.

Urutan dalam putaran penuh, termasuk di mana cache dibaca dan kapan perintah pengindeksan
ulang diselesaikan, ada di [Siklus hidup poller](/id/reference/poller-lifecycle/).
Untuk penskalaan pengumpul, lihat [Skalakan poller](/id/guides/scale-the-poller/).
