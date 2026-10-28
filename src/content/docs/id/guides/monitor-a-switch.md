---
title: Memantau Switch
description: Menemukan port switch, membuat grafik penghitung yang tepat, dan memilih indeks sehingga riwayat port tetap terkait dengan port setelah penggantian kartu.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 2
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Switch adalah kasus penggunaan klasik untuk kueri data. Anda tidak tahu sebelumnya berapa banyak port yang ada, jumlahnya dapat berubah, dan setiap port memerlukan sumber datanya sendiri. Lihat [Templat](/id/concepts/templates/) untuk mengetahui cara kerja kueri data; halaman ini membahas konfigurasi yang benar.

## Sebelum Anda mulai

Pastikan perangkat merespons dari kolektor yang ditetapkan, sebaiknya di bawah pengguna poller. Gunakan kredensial hanya-baca yang Anda konfigurasikan. OID numerik menghindari ketergantungan pada nama MIB yang diinstal secara lokal.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Gunakan SNMP v2c atau v3. Penghitung antarmuka 64-bit adalah objek SMIv2 dan tidak dapat ditanyakan melalui v1. Perangkat v1 hanya akan memberi Anda penghitung 32-bit dan tidak ada yang lain.

## Memilih templat perangkat

Templat perangkat menentukan kueri data dan templat grafik apa yang ditawarkan saat Anda menambahkan perangkat. Kadupul mewarisi kumpulan templat yang disediakan Cacti, yang mencakup templat perangkat SNMP generik dan sekumpulan templat khusus vendor.

Penemuan port berasal dari sumber yang sama terlepas dari pilihan Anda: kueri data antarmuka yang ditentukan dalam `resource/snmp_queries/interface.xml`. Jika tidak ada templat yang cocok dengan perangkat keras Anda, pilih templat generik dan kaitkan kueri antarmuka dengannya.

## Menjalankan kueri data

Kueri melintasi `ifIndex` untuk menemukan port, dan membaca `ifNumber` untuk mengetahui berapa banyak yang diharapkan. Kueri kemudian mengumpulkan sekumpulan bidang per port.

| Bidang | OID | Digunakan untuk |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Posisi dalam tabel SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nama pendek port, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Deskripsi lebih panjang |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Deskripsi antarmuka yang Anda konfigurasikan |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Alamat MAC port |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Kecepatan dalam bit/detik, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Kecepatan dalam Mbit/detik |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up atau Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Penghitung bita 32-bit |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Penghitung bita 64-bit |

Jalankan kueri sekali pada perangkat. Kueri ini mengembalikan tabel port yang ditemukan. Baca tabel ini sebelum membuat grafik, karena ini menjadi dasar setiap keputusan berikutnya.

## Memilih penghitung 64-bit

Kueri antarmuka menawarkan beberapa templat grafik lalu lintas. Yang utama:

| Templat grafik | Membaca |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Hal yang sama, dengan garis persentil ke-95 |
| In/Out Bits (64-bit, BW) | Hal yang sama, relatif terhadap kecepatan antarmuka |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Gunakan templat 64-bit kecuali Anda memiliki alasan khusus untuk tidak menggunakannya. Penghitung oktet 32-bit mencapai batas atas pada 4294967295. Port gigabit di bawah beban penuh mengisinya dalam waktu sekitar 34 detik. Dengan langkah 300 detik, poller tidak dapat membedakan satu luapan dari tujuh luapan, dan `COUNTER` hanya memperbaiki satu luapan di antara dua sampel. Grafik tidak terlihat rusak secara jelas; grafik hanya menampilkan nilai yang selalu terlalu rendah.

Verifikasi bahwa penghitung benar-benar terisi sebelum membuat ratusan grafik.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Walk yang kosong atau gagal memerlukan penyelidikan: periksa kesalahan yang dilaporkan, tampilan akses, dan dukungan agen.

## Memeriksa maksimum yang disimpan setelah perubahan kecepatan

Saat sumber data menggunakan maksimum berdasarkan kecepatan kueri, pembuatan mengambil kecepatan dari data penemuan yang di-cache. `ifHighSpeed` lebih disukai, `ifSpeed` digunakan jika yang pertama tidak ada, dan default yang dikonfigurasi berlaku jika keduanya bernilai nol.

Nilai tersebut ditulis ke dalam file. Port yang ditemukan pada 100 Mbps dan kemudian dinegosiasikan lebih tinggi dapat mempertahankan batas atas di bawah lalu lintas sebenarnya, dan RRDtool akan mencatat laju di atas batas tersebut sebagai tidak diketahui. Bandingkan kecepatan yang di-cache, definisi sumber data, dan file aktual dengan `rrdtool info`.

## Keputusan indeks

Di sinilah riwayat hilang saat terjadi kesalahan.

Setiap sumber data menyimpan dua hal tentang portnya: bidang mana yang mengidentifikasinya (jenis indeks) dan nilai bidang tersebut. Pada setiap reindeksasi, sumber data menemukan kembali port dengan menanyakan indeks SNMP mana yang saat ini memiliki nilai tersebut di bidang tersebut. Sumber data mengikuti nilai, bukan posisi tabel.

Jadi pertanyaannya adalah bidang mana yang membawa nilai tersebut.

Kueri antarmuka mendeklarasikan urutan preferensi: `ifName`, lalu `ifDescr`, lalu `ifHwAddr`, lalu `ifIndex`. Kadupul biasanya memilih di antara kandidat yang memiliki nilai yang cukup berbeda dan tidak ada duplikat.

| Bidang | Bertahan dari | Gagal saat |
|---|---|---|
| `ifName` | Reboot, penggantian kartu, penomoran ulang | Agen membiarkannya kosong atau mengulanginya di seluruh anggota stack |
| `ifDescr` | Biasanya stabil pada perangkat keras switch | Pada server, nama kernel yang rentan terhadap perubahan |
| `ifHwAddr` | Reboot | Kartu yang diganti memiliki MAC baru, yang merupakan kasus yang ingin Anda lindungi |
| `ifIndex` | Tidak ada yang dapat diandalkan | Penggantian kartu, reboot, atau perubahan firmware memberi nomor ulang tabel |

Jika kueri kembali ke `ifIndex`, perlakukan itu sebagai temuan dan bukan hasil normal. Riwayat port Anda kemudian terikat pada nomor yang bebas ditetapkan ulang oleh switch.

## Metode reindeksasi

Diatur per perangkat per kueri data. Ini menentukan kapan Kadupul membaca kembali bidang indeks.

| Metode | Dipicu oleh | Biaya |
|---|---|---|
| None | Tidak ada; manual atau skrip saja | Tidak ada |
| Uptime | Uptime SNMP perangkat berjalan mundur | Satu perbandingan per siklus |
| Index Count | Jumlah indeks yang ditemukan berubah | Satu hitungan per siklus |
| Verify All | Pemeriksaan identitas yang di-cache gagal | Memeriksa indeks yang diketahui selama polling |

Uptime adalah default dan cocok untuk sebagian besar switch, karena reboot adalah peristiwa yang menomori ulang indeks. Index Count menangkap kartu yang ditambahkan atau dilepas tanpa reboot. Verify All dapat mendeteksi perubahan identitas pada indeks yang diketahui, tetapi tidak menjamin penemuan port baru.

Untuk menjalankan kembali perangkat dan kueri yang dipilih, ganti kedua ID dengan ID yang terinstal. Abaikan `--qid` untuk menjalankan kembali semua kueri untuk perangkat tersebut:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` memperluas eksekusi ke semua perangkat yang diaktifkan. Hindari eksekusi reindeksasi yang tumpang tindih. `--force` melewati pendaftaran proses dan menyegarkan cache judul.

## Saat port menghilang

Jangan berasumsi port yang hilang secara otomatis menghentikan pengumpulan data. Kode reindeksasi saat ini dapat mengatur ulang bendera yatim piatu dan mempertahankan OID polling lama saat identitas tidak terselesaikan dan tidak ada sumber yang mengubah indeks. Bandingkan identitas yang disimpan dengan cache penemuan baru dan nonaktifkan sumber yang terpengaruh hingga pencocokan dikonfirmasi. Lihat [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/).

## Sasis besar (large chassis)

Dua pengaturan per perangkat menjadi penting setelah jumlah port meningkat: periksa OID yang dikonfigurasi per permintaan SNMP dan jumlah thread per perangkat. Dukungan batching dan paralelisme efektif bergantung pada kolektor dan agen; PHP `cmd.php` dan Spine tidak menawarkan perilaku threading yang identik.

Ubah satu pengaturan dalam satu waktu dan amati durasi siklus poller.

## Mode kegagalan

| Gejala | Penyebab |
|---|---|
| Grafik dibuat, setiap pengukuran tidak diketahui | Penghitung 64-bit tidak diimplementasikan, atau perangkat menggunakan SNMP v1 |
| Penghitung melompat ke nilai yang tidak masuk akal | Penghitung 32-bit meluap lebih dari sekali per interval |
| Celah hanya terjadi pada beban tinggi | Maksimum RRD terkunci pada kecepatan penemuan yang kedaluwarsa |
| Riwayat port ditetapkan ke port yang salah setelah pemeliharaan | Identitas tidak stabil, pemetaan kedaluwarsa, atau penanganan yatim piatu belum terselesaikan |
| Poller mencatat peringatan tentang indeks SNMP yang tidak valid | Sumber data dibiarkan tanpa indeks; lakukan reindeks, hapus, atau nonaktifkan |
| Port ditemukan, tidak ada yang dikumpulkan | Sumber data dengan indeks kosong tidak membuat entri cache poller |
