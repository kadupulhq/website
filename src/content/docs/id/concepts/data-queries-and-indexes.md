---
title: Kueri data dan indeks
description: Bagaimana satu penelusuran perangkat menjadi banyak sumber data, apa sebenarnya indeks itu, dan apa yang terjadi saat perangkat menomori ulang dirinya sendiri.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 5
---

Sumber data biasa mengharuskan Anda mengetahui apa yang Anda ukur sebelum mengonfigurasinya.
Pendekatan tersebut berfungsi baik untuk beban rata-rata sistem. Namun, tidak berfungsi untuk port
switch, disk, sensor suhu, atau mesin virtual, karena daftarnya berubah dan Anda tidak dapat
mengendalikannya secara langsung.

Kueri data menemukan objek yang tersedia. Pembuatan grafik — baik secara manual maupun melalui
otomatisasi yang dikonfigurasi — memilih objek mana yang mendapatkan sumber data; eksekusi kueri
saja tidak serta-merta membuat setiap kemungkinan grafik.

## Apa yang dimuat oleh definisi kueri

Kueri data adalah deskripsi XML dengan tiga bagian: di mana daftar item berada, apa yang harus dibaca
tentang masing-masing item, dan bagaimana menentukan item mana yang sesuai dengan apa.

Kueri antarmuka yang disertakan bersama Kadupul merupakan contoh praktis. Kueri ini menelusuri
`.1.3.6.1.2.1.2.2.1.1` untuk menghitung antarmuka, lalu membaca sekumpulan bidang bernama pada
setiap posisi yang dikembalikan. Setiap bidang mendeklarasikan sebuah arah (direction).

| Arah | Arti | Contoh antarmuka |
|---|---|---|
| `input` | Dibaca untuk identifikasi dan penamaan. Tidak dikumpulkan dari waktu ke waktu | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Nilai yang layak dikumpulkan pada setiap siklus | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Keduanya | `ifOperStatus`, `ifAdminStatus` |

Bidang juga mendeklarasikan cara membaca nilai. Sebagian besar mengambil nilai apa adanya; beberapa
menerapkan ekspresi reguler untuk mengekstrak angka dari enumerasi SNMP, dan yang lain meminta agar
nilai didekodekan sebagai teks bukan sebagai byte mentah.

Menjalankan kueri akan menyimpan satu baris per indeks per bidang: perangkat, kueri, nama bidang,
nilai, dan posisi asal nilai tersebut. Tabel tersebut adalah jawaban atas pertanyaan "apa yang dimiliki
perangkat ini?", yang disimpan dalam cache hingga eksekusi berikutnya. Pemilihan grafik memanfaatkan
cache tersebut, namun alat pembuat grafik juga dapat melampirkan atau menjalankan ulang kueri. Periksa
hasil penemuan sebelum menambahkan grafik.

## Indeks adalah masalah identitas

Posisi dalam tabel SNMP bukanlah sebuah nama. Itu adalah nomor slot yang diberikan oleh agen, dan
agen menyusun ulang slot setelah reboot, pemasangan ulang kartu, pembaruan firmware, atau perubahan
konfigurasi yang menghapus antarmuka. Jika sumber data hanya mengingat "slot 3", pada hari slot 3
berubah menjadi port yang berbeda, riwayat tiga bulan akan diam-diam menempel pada objek yang salah.

Kadupul menyimpan jenis indeks dan nilai pengenal, bersama dengan indeks SNMP yang saat ini diselesaikan.
Reindeksasi menggunakan identitas tersebut untuk mencari posisi tabel saat ini; jenis indeks yang
ditimpa secara manual memiliki penanganan terpisah.

Pada setiap eksekusi kueri, sistem mencari slot saat ini untuk nilai bidang tersebut.

| Hasil | Apa yang terjadi |
|---|---|
| Slot yang sama | Tidak ada yang perlu dilakukan |
| Slot berbeda | Sumber data dipetakan ulang ke slot baru, dan grafiknya mengikuti |
| Nilai tidak lagi ada | Penanganan yatim (orphan) tergantung pada kueri dan jalur kode; verifikasi flag yang dihasilkan dan OID polling daripada berasumsi bahwa pengumpulan terhenti |

Reindeksasi biasanya mempertahankan sumber data dan riwayat yang ada. Opsi `index_transient`
memperlakukan identitas yang hilang sebagaimana diharapkan dan melewati penandaan yatim standar.
`index_orphan_removal` menghapus entri polling yang terpengaruh dan keluaran Boost; opsi ini tidak
menghapus sumber data atau file RRD itu sendiri.

Penanganan yatim saat ini memiliki kelemahan: ketika sebuah identitas menghilang dan tidak ada sumber
lain yang mengubah indeks, cabang tanpa perubahan dapat membersihkan kembali flag yatim sambil tetap
membiarkan indeks sebelumnya dan OID polling berada di tempatnya. Jangan mengandalkan penyamaran
yatim otomatis untuk mencegah pengumpulan dari indeks port yang digunakan kembali. Verifikasi identitas
yang disimpan terhadap data penemuan dan nonaktifkan sumber data yang terpengaruh hingga terselesaikan.

## Memilih bidang untuk dijadikan kunci

Tidak semua bidang dapat dijadikan kunci yang andal. Definisi kueri menyediakan daftar preferensi
yang berurutan; Kadupul menelusurinya dan mengambil kandidat pertama yang lolos dari serangkaian pemeriksaan.

| Pemeriksaan | Mengapa ini ada |
|---|---|
| Bidang bertipe `input` atau `input-output` | Bidang pengidentifikasi harus tersedia dalam penemuan |
| Tidak ada dua indeks yang berbagi nilai yang sama | Kunci duplikat tidak dapat mengidentifikasi satu baris secara unik |
| Jumlah nilai berbeda sama dengan jumlah indeks | Menolak cakupan kandidat yang tidak lengkap |

Pemeriksaan ini memiliki pengecualian: satu kandidat yang dideklarasikan dikembalikan secara langsung,
dan OID indeks mentah diterima secara terpisah. `index_type=nonunique` melewati penolakan duplikat
tetapi tidak melewati pemeriksaan jumlah nilai yang berbeda. Periksa bidang yang dipilih dan nilai
yang di-cache; label tipe XML saja bukanlah bukti validasi.

Kueri antarmuka lebih memilih `ifName`, lalu `ifDescr`, kemudian alamat perangkat keras, dan
terakhir indeks mentah. Urutan tersebut disengaja. `ifName` pendek dan stabil di sebagian besar
platform. `ifDescr` stabil tetapi terkadang memuat nomor slot dalam teksnya, yang menggagalkan tujuan.
Indeks mentah berada di urutan terakhir karena menjadikannya kunci hampir tidak lebih baik daripada
tidak menggunakan kunci sama sekali.

Inilah bagian yang kerap mengejutkan pengguna. Pilihan dibuat per perangkat per eksekusi, dari data
terkini perangkat tersebut. Nilai cache yang hilang atau nama duplikat dapat membuat `ifName` tidak
sesuai dan menyebabkan pengalihan ke `ifDescr`. Bidang kosong tidak dengan sendirinya membuktikan
pemeriksaan mana yang gagal; periksa baris penemuan yang sebenarnya. Dua switch yang identik dapat
berakhir dengan kunci bidang yang berbeda, dan perangkat dapat mengubah bidang yang digunakannya antar
eksekusi. Kadupul mencatat peringatan ketika bidang yang dipilih berubah, karena itulah saat di mana
kesalahan pemetaan ulang dapat terjadi.

Bidang yang dipilih biasanya juga memberi nama pada grafik, melalui format judul yang mereferensikannya.
Jika judul grafik Anda berubah pola di seluruh perangkat armada Anda, bidang pengurutan adalah tempat
pertama untuk diperiksa.

## Mendeteksi bahwa reindeksasi diperlukan

Menjalankan ulang kueri data terhadap setiap perangkat pada setiap siklus akan memakan biaya besar dan
sebagian besar sia-sia, karena sebagian besar perangkat tidak menomori ulang apa pun selama bertahun-tahun.
Sebagai gantinya, setiap pasangan perangkat dan kueri membawa metode reindeksasi, yang merupakan asersi
murah yang diperiksa selama pengumpulan data normal. Ketika asersi gagal, reindeksasi dimasukkan ke dalam antrean.

| Metode | Apa yang diperiksa | Batasan dan biaya |
|---|---|---|
| Tidak ada | Tidak ada asersi otomatis | Kueri yang dijalankan ulang harus berasal dari tindakan manual atau eksplisit lainnya |
| Waktu aktif (Uptime) | Waktu aktif tidak mengalami kemunduran | Memerlukan SNMP yang berfungsi; melewatkan perubahan tanpa rollback waktu aktif |
| Jumlah Indeks | Jumlah saat ini cocok dengan indeks yang di-cache | OID penghitung bisa murah; tanpanya implementasi menghitung hasil penelusuran atau skrip. Perubahan dengan jumlah yang sama dapat terlewatkan |
| Verifikasi Semua | Nilai kunci yang diketahui masih cocok pada indeks yang di-cache | Beban bertambah seiring ukuran kumpulan cache; tidak menjamin deteksi indeks yang baru ditambahkan atau perubahan semantik yang mempertahankan nilai tersebut |

"Verifikasi Semua" memeriksa asersi selama polling; ini tidak menjalankan ulang seluruh kueri penemuan
secara tanpa syarat pada setiap siklus. Ukur biayanya pada perangkat representatif sebelum penggunaan luas.
Waktu aktif adalah default yang umum, tetapi tidak memberikan asersi apa pun saat SNMP dinonaktifkan.
Definisi kueri dapat menyediakan sumber waktu aktif atau penghitungannya sendiri.

## Reindeksasi bersifat asinkron

Asersi yang gagal tidak langsung melakukan reindeksasi seketika itu juga. Asersi tersebut menulis sebuah
perintah, dan lintasan terpisah setelah siklus pengumpulan mengambil perintah tersebut dan menjalankan
ulang kueri. Konsekuensi praktisnya penting untuk dipahami.

Siklus pendeteksi masih dapat menggunakan cache lama, sehingga suatu nilai dapat mendarat pada deret
yang salah sebelum reindeksasi selesai. Penekanan lonjakan terkait waktu aktif menggantikan output nilai
tunggal dengan tidak diketahui saat flag-nya disetel; ini bukan jaminan untuk semua output multinilai
atau setiap perubahan indeks.

Reindeksasi tidak akan berjalan pada perangkat yang mati atau dinonaktifkan. Perangkat yang mengalami
penomoran ulang saat tidak dapat dijangkau masih memerlukan asersi atau eksekusi ulang eksplisit setelah
dapat dijangkau kembali. Polling pertama yang berhasil saja tidak membuktikan bahwa pemetaan ulang telah
selesai. Opsi `--force` tidak mengabaikan pemeriksaan status mati/nonaktif.

Setelah kueri dijalankan ulang, sumber data yang berpindah akan ditulis ulang entri cache poller-nya,
yang secara efektif mengarahkan kembali pengumpulan data. Mekanisme tersebut adalah
[Cache poller](/id/concepts/the-poller-cache/), dan eksekusi ulang kueri adalah salah satu dari sedikit
hal yang memperbaruinya secara otomatis.

Untuk sisi operasional — menambahkan kueri ke perangkat dan membaca hasilnya —, lihat
[Memantau switch](/id/guides/monitor-a-switch/).
