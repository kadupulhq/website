---
title: Memantau Server Linux
description: Membuat grafik CPU, memori, disk, dan beban pada host Linux melalui net-snmp, apa yang harus diekspos oleh snmpd, dan cara menggunakan skrip saat SNMP tidak mencukupi.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 3
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Host Linux yang menjalankan net-snmp memberi Anda sebagian besar metrik tanpa kode tambahan apa pun. Tugasnya adalah membuat `snmpd` mengekspos subtree yang benar dan mengetahui mana dari dua MIB disk yang tumpang tindih yang sedang Anda amati.

## Apa yang harus diekspos snmpd

Kadupul melakukan polling pada empat area. Berikan identitas pemantauan subtree yang diperlukan untuk grafik yang dipilih; tidak setiap penerapan memerlukan setiap subtree.

| Area | Subtree | Menyediakan |
|---|---|---|
| Sistem | `.1.3.6.1.2.1.1` | Deskripsi, uptime, kontak, nama, lokasi |
| Antarmuka | `.1.3.6.1.2.1.2` dan `.1.3.6.1.2.1.31` | Lalu lintas, kesalahan, status |
| Sumber daya host | `.1.3.6.1.2.1.25` | Proses, pengguna yang masuk, penyimpanan, prosesor |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Rata-rata beban, memori, waktu CPU, I/O disk, partisi yang dideklarasikan |

Beberapa distribusi mengirimkan `snmpd.conf` default yang memberikan tampilan yang hanya mencakup subtree sistem. Perangkat akan merespons, melaporkan deskripsi sistem, dan tidak mengumpulkan apa pun. Kombinasi ini adalah kegagalan awal paling umum pada host Linux dan tampak persis seperti masalah templat.

Periksa area yang diperlukan dari host poller menggunakan identitas SNMP yang sama yang dikonfigurasikan pada perangkat. Contoh-contoh ini menggunakan community ilustratif; ganti dengan nilai yang Anda konfigurasikan. OID numerik menghindari kebutuhan definisi simbolis MIB lokal.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Jika hanya perintah pertama yang berhasil, selidiki respons pastinya: tampilan terbatas, modul agen tidak tersedia, konteks SNMP berbeda, atau tabel kosong dapat menjelaskan hasilnya. Verifikasi konfigurasi agen dan akses sebelum mengubah templat Kadupul.

## Menambahkan perangkat

Paket bawaan `install/templates/NetSNMP_Device.xml.gz` berisi templat perangkat Net-SNMP dan dependensinya. Impor jika templat tidak ada, lalu pilih saat menambahkan perangkat. Konfirmasikan indeks kueri dan buat grafik yang diinginkan secara eksplisit; memilih templat perangkat tidak membuktikan bahwa pengumpulan berfungsi. Lihat [Mengimpor templat](/id/guides/import-and-export-templates/) dan [Grafik pertama Anda](/id/start/first-graph/).

## Apa yang Anda dapatkan tanpa kueri data

Templat data OID tetap ini disertakan dalam paket. Satu grafik dapat menggabungkan beberapa di antaranya; ketersediaan tergantung pada agen target. Mereka tidak memerlukan penemuan indeks.

| Grafik | OID | Disimpan sebagai |
|---|---|---|
| Rata-rata beban 1 menit | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Rata-rata beban 5 menit | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Rata-rata beban 15 menit | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Total memori | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memori bebas | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memori buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memori cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU pengguna | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU sistem | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU idle | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interupsi | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Pergantian konteks | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Proses | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Pengguna yang masuk | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Objek memori dinyatakan dalam kilobita. Grafik memori yang disertakan menerapkan konversi sehingga sumbu ditampilkan dalam bita. Jika Anda membuat grafik sendiri dari OID ini, konversi tersebut menjadi tanggung jawab Anda.

Objek CPU yang terdaftar adalah persentase usang, bukan penghitung kumulatif waktu CPU. Jangan berasumsi bahwa ketiga objek ini saja mencakup setiap status prosesor. Net-SNMP mengusangkannya demi penghitung mentah; penghitung mentah memerlukan penghitungan rasio dan persentase yang tepat, bukan penyisipan langsung ke dalam templat gauge. Lihat [UCD-SNMP MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Apa yang membutuhkan kueri data

| Kueri | Menemukan | Didukung oleh |
|---|---|---|
| SNMP - Dapatkan titik mount | Apa pun yang disebut agen sebagai penyimpanan | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Dapatkan partisi yang dipantau | Hanya partisi yang dideklarasikan dalam `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Dapatkan informasi prosesor | Satu entri per CPU | Beban prosesor sumber daya host |
| Net-SNMP - Dapatkan I/O perangkat | Perangkat blok | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Statistik antarmuka | Antarmuka jaringan | `IF-MIB` |

### Kueri disk mana yang harus digunakan

Keduanya bukan dua tampilan dari data yang sama.

Kueri sumber daya host menelusuri apa pun yang dilaporkan agen sebagai penyimpanan. Pada sebagian besar host Linux, ini mencakup memori fisik, swap, mount tmpfs, dan sistem berkas nyata dalam satu daftar. Ukuran dikembalikan dalam unit alokasi, dan kueri membaca ukuran unit alokasi sebagai bidang terpisah sehingga grafik dapat mengalikan nilainya. Anda mendapatkan segalanya tanpa mengonfigurasi apa pun, tetapi juga daftar panjang entri yang tidak Anda inginkan.

Kueri net-snmp membaca tabel disk UCD, yang diisi oleh direktif `disk` atau `includeAllDisks`. Pilih partisi eksplisit atau penemuan luas; keduanya adalah kebijakan yang berbeda.

```
disk /      10%
disk /var   10%
```

Sebagai alternatif, `includeAllDisks 10%` mengisi disk yang ditemukan saat agen dimulai. Nilai 10% mengonfigurasi ambang ruang bebas; ini bukan filter pemilihan dan tidak mengonfigurasi peringatan Kadupul dengan sendirinya. Muat ulang atau mulai ulang agen lalu tinjau indeksnya. Kueri kosong juga dapat mencerminkan masalah akses atau ketersediaan modul. Lihat [konfigurasi snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Pilih kueri sumber daya host saat Anda menginginkan kelengkapan dan siap melakukan penyaringan. Pilih kueri net-snmp dengan entri `disk` eksplisit saat Anda menginginkan daftar bertarget. `includeAllDisks` memperluas daftar tersebut; periksa kembali indeks setelah agen dimulai ulang.

### Antarmuka

Kueri data antarmuka pada server berperilaku persis sama seperti pada switch, dengan satu catatan: `ifDescr` di Linux adalah nama antarmuka kernel, yang dapat berubah setelah reboot atau pembaruan driver. Lihat [Memantau switch](/id/guides/monitor-a-switch/) untuk detail pemilihan indeks.

## Saat SNMP tidak mencukupi

Beberapa metrik tidak memiliki MIB yang dapat digunakan. Kedalaman antrean, penghitung aplikasi, atau angka dalam file memerlukan input skrip.

Dua fakta menentukan cara Anda menulis skrip.

**Skrip berjalan di mesin tempat poller berjalan, bukan di host yang dipantau.** Menjangkau target adalah tugas skrip Anda: SSH, panggilan HTTP, agen, atau mekanisme apa pun yang sudah Anda terapkan.

**Poller membaca output standar dan tidak ada yang lain.** Status keluar tidak dievaluasi.

Kontrak output:

| Output | Arti |
|---|---|
| `42` atau `3.7` | Nilai tunggal untuk sumber data tunggal |
| `U` | Tidak ada nilai untuk siklus ini, dicatat sebagai tidak diketahui (unknown) |
| `in:1420 out:980` | Beberapa nilai, satu per sumber data |

Untuk bentuk multi-nilai, pasangan dipisahkan oleh spasi tunggal dan nama dipisahkan dari nilai dengan titik dua. Parser menghitung pembatas terhadap spasi, sehingga spasi internal tambahan dapat menyebabkan validasi gagal. Poller PHP memangkas spasi tambahan di akhir. Keluarkan format kanonik dengan spasi tunggal dan alihkan diagnostik dari stdout.

Nama sumber data RRD internal yang diterima oleh editor templat cocok dengan `[a-zA-Z0-9_]{1,19}`; tanda hubung tidak diterima di sana. Label output skrip harus cocok dengan nama bidang input data dan dipetakan ke item internal yang dimaksudkan. Seluruh baris output disimpan dalam kolom 512 karakter. Lihat [Skrip pengumpulan](/id/guides/write-a-data-collection-script/) untuk kontrak poller PHP yang diaudit.

Kembalikan `U` daripada `0` saat Anda tidak dapat mengukur sesuatu. Nol adalah pengukuran dan akan digambarkan seperti itu. Lihat [Sumber data dan RRA](/id/concepts/data-sources-and-rras/) untuk mengetahui alasan keduanya dipisahkan.

### Server skrip

Skrip sederhana berjalan sekali per sumber data per interval. Untuk skrip yang ditulis dalam PHP, bentuk server skrip memanggil fungsi dalam proses PHP persisten terpisah, mengurangi overhead startup interpreter.

### Jebakan daftar izin (whitelist)

Saat file daftar izin input data digunakan, poller membandingkan string perintah setiap input data dengan yang direkam. String perintah yang berubah tanpa menghasilkan kembali daftar izin berhenti membuat entri cache poller, dan sumber data menjadi hening tanpa kesalahan pada grafik. Log melaporkan hal ini, UI tidak.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Ganti `42` dengan ID metode input data yang diaudit, bukan ID perangkat. Pembaruan tanpa `--id` menerima string perintah saat ini di seluruh inventaris input. Audit perubahan sebelumnya. Setelah memperbarui, verifikasi pengaktifan sumber dan entri cache poller yang efektif.

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Deskripsi sistem terbaca, tidak ada hal lain yang dikumpulkan | Tampilan `snmpd` terbatas pada subtree sistem |
| Kueri partisi net-snmp tidak menemukan indeks | Tidak ada baris `disk` atau `includeAllDisks` di `snmpd.conf` |
| Partisi sumber daya host mencakup RAM dan tmpfs | Diharapkan; agen melaporkannya sebagai penyimpanan |
| Grafik memori meleset dengan faktor 1024 | Membangun dari OID mentah tanpa konversi |
| Skrip mengembalikan nilai pada baris perintah, poller mencatat unknown | Ketidakcocokan output/pemetaan, kesalahan pembatas internal, atau nama internal tidak valid |
| Skrip berfungsi manual tetapi gagal melalui poller | Berjalan sebagai pengguna poller dengan lingkungan dan izinnya |
