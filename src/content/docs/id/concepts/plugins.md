---
title: Plugin
description: Mengapa permukaan ekstensi adalah daftar titik panggilan bernama, apa yang diwarisi plugin dengan berjalan di dalam proses, dan apa yang dicegah dan tidak dicegah oleh pengaman.
banner:
  content: Kadupul berada dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian terisolasi.
sidebar:
  order: 11
---

Plugin adalah kode yang disertakan aplikasi ke dalam prosesnya sendiri dan dipanggil pada titik-titik
bernama. Setiap properti lain dari model plugin mengikuti satu kalimat itu.

Untuk hal-hal yang perlu dibaca sebelum menginstal plugin pihak ketiga, lihat
[Instal dan periksa plugin](/id/guides/install-and-vet-plugins/).

## Mengapa berjalan di dalam proses

Lihat fungsi plugin: menambahkan kolom ke daftar yang sedang dirender aplikasi, mengubah opsi grafik
sebelum digambar, bertindak saat perangkat dihapus, atau melampirkan tab. Masing-masing tindakan itu
adalah pengeditan terhadap sesuatu yang disimpan aplikasi di memori pada saat itu.

Pekerja yang terisolasi akan membutuhkan antarmuka eksplisit dan validasi hasilnya. Hal itu dapat
mempertahankan isolasi hak istimewa, tetapi itu bukan mekanisme yang digunakan di sini: file plugin
disertakan dan fungsinya dipanggil di dalam proses aplikasi.

## Apa yang diwarisi plugin

Kode plugin berjalan sebagai akun sistem operasi pemanggil, dengan akses ke koneksi database proses
dan izin sistem file. Pemanggil web mungkin juga memiliki sesi; pemanggil CLI tidak selalu memilikinya.
Mekanisme plugin tidak menyediakan identitas terpisah, sandbox, atau verifikasi tanda tangan.

Izin pengguna dan grup mengatur akses aplikasi; izin tersebut tidak membendung kode PHP plugin yang
sewenang-wenang. Izin database, izin sistem file, dan batasan proses tetap membatasi apa yang dapat
dilakukan proses tersebut. Tinjau plugin sebelum instalasi dan jaga agar hak istimewa akun aplikasi
tetap terbatas.

## Dua gaya pemanggilan

| Gaya | Aplikasi | Plugin yang tidak mengembalikan apa pun |
|---|---|---|
| Pemberitahuan | Meneruskan argumen, mengabaikan hasil | Nilai kembali tidak digunakan; efek samping dan pengecualian tetap penting |
| Transformasi | Meneruskan nilai, menggunakan apa yang kembali | Dapat mengganti nilai dengan null dan merusak pemanggil di hilir |

Gaya transformasi adalah apa yang memungkinkan plugin menambahkan tombol, memperluas daftar tindakan,
atau mengubah grafik. Ini juga tempat di mana plugin menjadi saling terikat: dua plugin pada titik yang
sama masing-masing melihat output dari plugin sebelumnya dalam urutan plugin yang dikonfigurasi.

Dispatcher hanya memperingatkan tentang array yang menjadi non-array, atau nilai yang sebelumnya tidak
kosong menjadi mirip null, ketika ada beberapa baris hook yang cocok. Pemeriksaan itu bukan validasi
lengkap dari kontrak hook; satu plugin dapat merusak nilai tanpa peringatan ini.

## Pendaftaran adalah status, bukan penemuan

Hook berada di dalam tabel: plugin mana, nama hook mana, file mana, fungsi mana, diaktifkan atau tidak.
Rutinitas instalasi, peningkatan, dan penyiapan dapat mendaftarkan hook; pendaftaran tidak terbatas
pada instalasi pertama.

Alternatifnya adalah penemuan pada saat permintaan, yang berarti memindai direktori plugin dan
menyertakan kode setiap plugin untuk menanyakan apa yang diinginkannya. Satu halaman mencapai banyak
titik hook. Menyertakan semuanya untuk mengetahui bahwa tidak ada yang terpasang adalah solusi yang
mahal, sehingga aplikasi menanyakan tabel, menyimpan jawabannya dalam cache untuk permintaan tersebut,
dan hanya menyertakan file yang disebutkan oleh baris yang cocok.

Pilihan itu memiliki biaya yang perlu diketahui. Tabel dapat berbeda dari sistem file. Direktori
plugin yang dihapus secara manual meninggalkan baris-barisnya di database. Panggilan balik pemberitahuan
yang hilang dapat menghasilkan peringatan debounced; dispatcher transformasi tidak memiliki peringatan
serupa untuk panggilan balik yang hilang. Log yang tenang tidak membuktikan pendaftaran berfungsi baik.

Urutan berasal dari urutan pendaftaran plugin dan dapat disesuaikan. Oleh karena itu, rantai
transformasi diurutkan oleh sesuatu yang dikendalikan administrator.

## Apa yang dapat dijangkau plugin

| Kemampuan | Catatan |
|---|---|
| Membuat tabelnya sendiri | Dicatat, sehingga pencopotan pemasangan dapat menghapusnya |
| Menambahkan kolom ke tabel yang ada, termasuk tabel inti | Dicatat, sehingga pencopotan pemasangan dapat menghapusnya |
| Mendaftarkan ranah izin | Bagian antarmuka baru yang dikontrol aksesnya |
| Mendeklarasikan ketergantungan pada plugin lain | Versi diperiksa sebelum instalasi |
| Berjalan di kolektor jarak jauh | Pengiriman tergantung pada hook, gaya, kemampuan, dan status koneksi |

Perubahan skema yang dicatat adalah alasan mengapa pencopotan pemasangan bersifat merusak. Aplikasi
dapat menghapus tabel dan kolom yang dilacak, termasuk datanya. Aplikasi juga memanggil panggilan balik
pencopotan plugin sebelum pembersihan. Panggilan balik itu dapat membuat perubahan lain; perubahan yang
tidak dilacak tidak otomatis dikembalikan, dan direktori sumber plugin tetap ada.

Ranah yang didaftarkan oleh plugin dimiliki oleh pengguna dan grup dengan cara yang sama seperti ranah
inti. Ranah baru juga dapat memberikan akses ke administrator utama dan pengguna sesi saat ini ketika
pendaftaran memintanya. Tinjau izin yang dihasilkan setelah instalasi dan peningkatan; jangan berasumsi
bahwa kebijakan yang ada mencakup permukaan baru.
Lihat [Izin dan akses](/id/concepts/permissions-and-access/).

## Apa yang sebenarnya dilindungi pengaman

Ada pengaman, dan membacanya memberi tahu Anda apa model ancamannya.

File yang dinamai hook diselesaikan di dalam direktori plugin itu sendiri. Jalur yang keluar dari
direktori tersebut ditolak dan dicatat sebagai peristiwa keamanan. Nama direktori plugin dibatasi pada
huruf, angka, garis bawah, dan tanda hubung. Pendaftaran hook dan ranah hanya diterima dari fungsi
yang namanya terlihat seperti rutinitas instalasi, peningkatan, atau penyiapan; panggilan dari tempat
lain ditolak dan dicatat.

Pengaman jalur membatasi file mana yang dapat disertakan oleh baris hook. Pemeriksaan pendaftaran hanya
memeriksa nama fungsi pemanggil untuk kata instal, peningkatan, atau penyiapan; pemeriksaan ini tidak
mengotentikasi operasi siklus hidup. Kode plugin dapat menggunakan nama seperti itu pada pemuatan
halaman biasa, jadi konvensi ini bukan batas keamanan.

Pengaman tidak berbuat apa-apa terhadap apa yang dilakukan kode plugin itu sendiri setelah berjalan.
Pengaman bukan batas penahanan dan tidak dibangun sebagai batas penahanan.

## Dinonaktifkan bukan berarti mati

Beberapa jenis hook didaftarkan dalam keadaan aktif pada saat instalasi: jenis yang menyediakan
halaman pengaturan, array konfigurasi, dan definisi formulir. Sebuah plugin harus dapat dikonfigurasi
sebelum diaktifkan, jadi hook tersebut tetap berjalan dalam kedua kondisi.

Oleh karena itu, plugin yang dinonaktifkan masih memiliki kode yang disertakan dan dieksekusi pada
beberapa pemuatan halaman. Penonaktifan adalah sakelar fitur, dan URL plugin langsung juga perlu
ditinjau. Jika Anda mencurigai adanya kode berbahaya, isolasi instalasi dan tinjau prosedur penghapusan
sebelum memanggil pencopotan pemasangan, yang dengan sendirinya mengeksekusi kode plugin. Menghapus file
sumber saja tidak membersihkan pendaftaran atau membatalkan perubahan database.

## Kolektor jarak jauh mendapatkan permukaan yang lebih sempit

Plugin mendeklarasikan kemampuannya dalam file informasinya: apakah berfungsi saat kolektor dapat
menjangkau instalasi utama, apakah berfungsi saat tidak dapat, dan apakah berpartisipasi dalam pengumpulan.

Pada kolektor, hook yang terdaftar diperiksa terhadap persyaratan kemampuan. Hook transformasi yang
tidak terdaftar tetap dikirimkan; hook pemberitahuan yang tidak terdaftar dapat dikirimkan saat online
atau saat plugin mendeklarasikan dukungan manajemen/tampilan offline. Hook yang dilewati tidak dicatat
secara universal. Ini adalah logika perutean, bukan daftar izin menyeluruh atau batas isolasi; periksa
dispatcher dan status koneksi yang tepat untuk hook yang Anda gunakan.

Alasannya adalah bahwa kolektor merupakan lingkungan yang berbeda. Konfigurasinya adalah replika yang
mungkin berusia beberapa jam, dan mungkin tidak memiliki tautan ke database pusat sama sekali. Hook
yang ditulis dengan asumsi bahwa database pusat hanya berjarak satu kueri adalah salah di sana, sehingga
model tersebut mengharuskan plugin menyatakan asumsi apa yang dibuatnya daripada menyimpulkannya.
Lihat [Pengumpulan data jarak jauh](/id/concepts/remote-data-collection/).

## Poller adalah tempat termahal untuk memasang hook

Hook pada jalur polling berjalan saat titik panggilannya tercapai. Frekuensinya tergantung pada
peristiwa, proses, dan perutean kolektor; tidak setiap hook berjalan di setiap proses di setiap siklus.
Kode yang lambat pada jalur yang sering dilalui menghabiskan interval polling dan dapat menyebabkan
celah pada grafik.

Hook pada halaman dirender sekali untuk satu orang yang memang sedang menunggu. Keduanya terlihat sama
dalam tabel pendaftaran dan berbeda beberapa tingkat besaran dalam biaya sumber daya.

## Mengapa permukaannya terlihat tidak merata

API hook mengekspos titik panggilan dengan tujuan dan bentuk argumen yang berbeda.

Itulah mengapa daftarnya luas dan tidak teratur, mengapa beberapa titik memberi Anda nilai untuk diubah
dan yang lain hanya memberi tahu bahwa suatu peristiwa terjadi, dan mengapa argumen berbeda dalam
bentuk dari satu hook ke hook berikutnya. Versi inti minimum yang dideklarasikan tidak memastikan
kompatibilitas dengan setiap hook: periksa argumen dan ekspektasi pengembalian setiap titik panggilan,
dan uji plugin pada versi target. Keterbatasan kompatibilitas CLI dan pemberian ranah yang
didokumentasikan dalam [Instal dan periksa plugin](/id/guides/install-and-vet-plugins/) juga berlaku;
instalasi yang berhasil saja bukan bukti kompatibilitas.

Pelajaran praktisnya: sebuah plugin terikat pada versi inti tempat plugin itu ditulis, jauh lebih
erat daripada yang disarankan oleh versi minimum yang dideklarasikan. Periksa kembali plugin sebelum
peningkatan inti, bukan setelahnya.
