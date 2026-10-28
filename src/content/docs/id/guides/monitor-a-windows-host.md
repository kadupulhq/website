---
title: Memantau Host Windows
description: Membuat grafik CPU, disk, antarmuka, dan uptime di Windows melalui layanan SNMP, objek sumber daya host mana yang membawa data, dan apa yang harus dilakukan saat SNMP tidak tersedia.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 14
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Windows melalui SNMP menyediakan antarmuka, prosesor, penyimpanan, dan beberapa penghitung. Agen Microsoft bawaan tidak mengekspos objek beban, memori, dan disk dari templat net-snmp UCD. Memori masih dapat digambarkan dari baris penyimpanan jika agen mengeksposnya. Agen pihak ketiga dapat menyediakan objek lain; periksa agen yang sebenarnya sebelum memilih templat.

## Apa yang disediakan layanan SNMP

Layanan SNMP Windows sudah usang dan bersifat opsional. Untuk Windows 10 dan 11, Microsoft mendokumentasikan instalasinya melalui fitur opsional atau fitur Windows; kesalahan nama fitur DISM lama tidak dengan sendirinya membuktikan bahwa layanan tersebut tidak tersedia. Periksa instruksi yang sesuai dengan edisi Windows Anda. Lihat [panduan instalasi SNMP Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Periksa subtree mana saja yang diekspos oleh agen terinstal Anda:

| Area | Subtree | Menyediakan |
|---|---|---|
| Sistem | `.1.3.6.1.2.1.1` | Deskripsi, uptime, kontak, nama, lokasi |
| Antarmuka | `.1.3.6.1.2.1.2` dan `.1.3.6.1.2.1.31` | Lalu lintas, kesalahan, status |
| Sumber daya host | `.1.3.6.1.2.1.25` | Prosesor, penyimpanan, jumlah proses, pengguna yang masuk |
| LAN Manager | `.1.3.6.1.4.1.77` | Data layanan dan berbagi Windows |

Templat Windows bawaan Kadupul membaca tiga area pertama. Tidak ada dalam kumpulan paket yang membaca subtree LAN Manager.

Dua item konfigurasi pada host menentukan apakah Anda menerima data: string community dan daftar manajer tempat agen menerima paket. Host yang disetel untuk menerima SNMP hanya dari satu alamat manajer hanya akan merespons manajer tersebut dan membuang yang lainnya.

Periksa setiap area dari host poller sebelum membuat grafik. Ganti host dan community contoh dengan nilai yang Anda konfigurasikan; `public` hanya untuk tujuan ilustrasi.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Walk kedua membaca beban prosesor, yang ketiga membaca daftar deskripsi penyimpanan. Jika perintah pertama berfungsi dan dua lainnya tidak mengembalikan apa pun, periksa pembatasan akses, dukungan agen, dan kesalahan SNMP yang dikembalikan.

## Menambahkan perangkat

Impor `install/templates/Windows_Device.xml.gz` jika templat tidak ada, sesuai dengan [Mengimpor dan mengekspor templat](/id/guides/import-and-export-templates/). Pilih templat perangkat Windows, verifikasi penemuan kueri, lalu buat grafik yang diinginkan secara eksplisit. Paket ini berisi tiga kueri data dan templat grafik terkait.

| Kueri data | Didukung oleh | Membaca |
|---|---|---|
| SNMP - Statistik antarmuka | `resource/snmp_queries/interface.xml` | `IF-MIB`, ditelusuri langsung |
| SNMP - Dapatkan informasi prosesor | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` melalui `scripts/ss_host_cpu.php` |
| SNMP - Dapatkan titik mount | `resource/script_server/host_disk.xml` | `hrStorageTable` melalui `scripts/ss_host_disk.php` |

Kueri disk dan prosesor adalah kueri server skrip terlepas dari namanya. Keduanya berjalan dalam proses server skrip PHP terpisah yang persisten dan melakukan panggilan SNMP dengan kredensial rekaman perangkat. Kueri antarmuka adalah kueri SNMP murni. Konsekuensi praktisnya adalah kegagalan server skrip PHP menghentikan pengumpulan disk dan CPU di Windows sementara grafik antarmuka terus berjalan.

## Apa yang Anda dapatkan tanpa kueri data

Dua templat grafik masing-masing membaca satu OID tetap.

| Grafik | OID | Disimpan sebagai |
|---|---|---|
| Host MIB - Proses | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Host MIB - Pengguna yang masuk | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |
| Durasi waktu aktif | `scripts/ss_hstats.php` | Rekaman Kadupul |

Dua lainnya tidak membaca apa pun dari perangkat. Grafik uptime dan waktu polling memanggil `scripts/ss_hstats.php` dan mengembalikan kolom dari rekaman perangkat Kadupul sendiri: `snmp_sysUpTimeInstance` untuk uptime, durasi polling yang direkam untuk waktu polling. Keduanya membaca pengukuran yang disimpan, bukan respons SNMP langsung.

## Tabel sumber daya host

### Prosesor

`hrProcessorLoad` di bawah `.1.3.6.1.2.1.25.3.3.1.2` mengembalikan satu entri per prosesor logis yang diekspos agen. Penelusuran (walk) menyediakan indeks; jangan berasumsi jumlah baris selalu cocok dengan jumlah thread perangkat keras yang diiklankan.

Nilainya sudah berupa persentase. MIB mendefinisikannya sebagai rata-rata selama satu menit terakhir. Lihat [definisi Host Resources MIB](https://www.rfc-editor.org/rfc/rfc2790.html).

### Penyimpanan

Kueri penyimpanan yang disertakan menggunakan `hrStorageTable` di bawah `.1.3.6.1.2.1.25.2.3.1`. Kueri ini membaca enam kolom.

| Kolom | OID | Arah |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Indeks |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Indeks dan label yang ditampilkan |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Input, pengali |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Output |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Output |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Output |

Ukuran dan ruang yang digunakan adalah jumlah unit alokasi, bukan bita. Skrip mengalikan setiap nilai dengan ukuran unit alokasi yang di-cache untuk indeks tersebut saat kedua nilai valid.

Dua hal sering menimbulkan masalah di Windows.

**Tabel ini bukan daftar hard disk.** Agen melaporkan apa pun yang dianggapnya sebagai penyimpanan. Tergantung pada agennya, memori fisik dan memori virtual dapat muncul di samping drive tetap. Label seperti `C:\`, `D:\`, `Physical Memory`, dan `Virtual Memory` adalah contoh, bukan baris yang dijamin. Pilih baris yang ingin Anda buat grafiknya.

**Nilai penyimpanan yang besar atau tidak valid memerlukan verifikasi.** MIB mendefinisikan ukuran dan penggunaan sebagai Integer32 non-negatif. Agen yang mengembalikan nilai negatif berada di luar rentang tersebut. Skrip saat ini menggunakan `(abs(value) + 2147483647) * allocation_units`, yang tidak mewakili reinterpretasi 32-bit unsigned. Perlakukan nilai yang terpengaruh sebagai tidak dapat diandalkan dan lakukan reindeks setelah memperbaiki penemuan. Lihat [cacat konversi penyimpanan](https://github.com/kadupulhq/kadupul/issues/243).

## Perbedaan Windows dengan Linux

| Karakteristik | Linux dengan net-snmp | Agen bawaan Windows / templat bawaan |
|---|---|---|
| Rata-rata beban | `.1.3.6.1.4.1.2021.10.1.3` | Tidak ada objek rata-rata beban UCD |
| Memori | `.1.3.6.1.4.1.2021.4` | Dapat digambarkan dari baris `hrStorage` yang diekspos |
| CPU | Persentase UCD atau `hrProcessorLoad` | Hanya `hrProcessorLoad` |
| Daftar disk | Dideklarasikan oleh Anda via `dskTable` atau `hrStorage` | Hanya `hrStorage`, tanpa filter |
| I/O disk | `diskIOTable` | Tidak ada bawaan yang membaca ini |
| Nama antarmuka | Nama kernel, pendek | Deskripsi adaptor yang panjang, sering duplikat |

Agen Microsoft bawaan tidak menyediakan subtree UCD `.1.3.6.1.4.1.2021`. Lihat [Memecahkan masalah data yang hilang](/id/guides/troubleshoot-missing-data/).

### Antarmuka

Kueri antarmuka identik dengan yang digunakan switch. Urutan preferensi indeksnya adalah `ifName`, lalu `ifDescr`, lalu `ifHwAddr`, lalu `ifIndex`. Kueri memilih bidang pertama yang ada dan unik pada setiap antarmuka yang ditemukan.

Windows adalah platform tempat hal ini paling sering gagal. Dua NIC yang identik dapat mengembalikan `ifDescr` yang sama, dan beberapa agen membiarkan `ifName` kosong. Ketika kueri kembali ke `ifIndex`, riwayat antarmuka Anda terikat pada nomor yang bebas diubah oleh Windows.

Lihat [Memantau switch](/id/guides/monitor-a-switch/) dan [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/).

## Saat SNMP tidak tersedia

Banyak instalasi Windows tidak mengaktifkan layanan SNMP. Penggantinya adalah input skrip.

Dua fakta menentukan cara Anda menulis skrip.

**Skrip berjalan di mesin tempat poller berjalan.** Menjangkau host Windows adalah tugas skrip Anda: WinRM, agen, endpoint HTTP, berbagi jaringan, atau apa pun yang Anda gunakan.

**Keluarkan pengukuran pada output standar.** Jalur perintah eksternal poller PHP tidak menggunakan status keluar sebagai nilai pengukuran. Keluarkan angka, atau `U` untuk tidak ada pengukuran dalam siklus ini. Jangan keluarkan `0` saat Anda bermaksud menyatakan bahwa pengukuran gagal.

Jika Anda memerlukan nilai per antarmuka, per disk, atau per layanan alih-alih angka tunggal, mekanisme skrip yang sama menyediakan bentuk terindeks. `resource/script_queries/host_cpu.xml` adalah contoh praktis yang memanggil skrip PHP alih-alih server skrip.

Lihat [Menulis skrip pengumpulan data](/id/guides/write-a-data-collection-script/) untuk kontrak output dan batasan penamaan.

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Deskripsi sistem terbaca, tidak ada hal lain yang dikumpulkan | Periksa dukungan objek, batasan akses, dan kesalahan SNMP tertentu |
| Tidak ada respons sama sekali dari host yang sedang online | Daftar manajer agen yang diterima atau aturan firewall host pada UDP 161 |
| Daftar partisi berisi memori | Diharapkan; agen melaporkan memori sebagai penyimpanan |
| Volume besar muncul negatif atau tidak diketahui | Nilai agen tidak valid atau unit alokasi usang; periksa bug konversi yang diketahui |
| Disk dan CPU berhenti, antarmuka terus berjalan | Server skrip gagal; kueri antarmuka tidak menggunakannya |
| Templat Net-snmp ditetapkan, setiap pengukuran tidak diketahui | Agen yang dipilih tidak menyediakan objek UCD yang diperlukan untuk templat tersebut |
| Riwayat antarmuka mengikuti adaptor yang salah setelah perubahan | Indeks kembali ke `ifIndex` karena nama kosong atau duplikat |
| Uptime mengulangi nilai lama | Periksa apakah rekaman perangkat kedaluwarsa; helper tidak mengekstrapolasi uptime |
