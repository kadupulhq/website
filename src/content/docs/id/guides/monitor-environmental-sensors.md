---
title: Memantau sensor lingkungan
description: Buat grafik suhu, kelembapan, aliran udara, daya, dan status UPS melalui SNMP, temukan OID yang tepat pada MIB vendor, dan terapkan pengaturan grafik yang sesuai untuk pengukuran, bukan penghitung.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 23
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau
jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Suhu, kelembapan, dan daya sesaat adalah pengukuran, yang biasanya disimpan sebagai
`GAUGE`. Energi kumulatif atau total peristiwa mungkin memerlukan tipe penghitung (`COUNTER`).
Periksa satuan, identitas, dan semantik setiap objek sebelum memilih templat.

Periksa apa yang sudah disertakan sebelum Anda menulis sendiri.

## Apa yang disertakan

Hanya empat definisi kueri data yang berada di direktori kueri bawaan,
dan tidak ada satu pun yang berkaitan dengan lingkungan.

| Kueri SNMP yang disertakan | Cakupan |
|---|---|
| `interface.xml` | Antarmuka jaringan |
| `host_disk.xml` | Penyimpanan Host Resources |
| `net-snmp_disk.xml` | Partisi yang dideklarasikan UCD |
| `net-snmp_devio.xml` | I/O perangkat blok UCD |

Cakupan sensor disediakan melalui dua jalur lain.

**Kueri server skrip, dibundel dalam paket perangkat Net-SNMP.** Impor
`install/templates/NetSNMP_Device.xml.gz` untuk menerapkan tiga file XML kueri lmSensors
di bawah `resource/script_server/`. Skrip pembantu
`scripts/ss_netsnmp_lmsensors.php` juga tersedia dalam checkout kode sumber.

| Kueri | Tabel |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Helper menggunakan kolom indeks, nama, dan pembacaan. Kueri mengindeks pada nilai numerik
`sensorDevice`; `sensorName` menyediakan nama tampilan yang dipotong helper menjadi
18 karakter. Nama tidak menjamin identitas sensor yang unik.

Jalur normal `get sensorReading` mengembalikan nilai mentah: miliderajat untuk objek suhu
lama, milivolt untuk tegangan, dan RPM untuk kipas. Grafik termal
menerapkan CDEF `Divide by 1000`. Grafik tegangan tidak memiliki CDEF meskipun labelnya Volts,
sebuah [cacat penskalaan yang terkonfirmasi](https://github.com/kadupulhq/kadupul/issues/247).

Jalur terpisah `query sensorReading` menskalakan suhu dan tegangan, dan mencoba
konversi tegangan bertanda menggunakan konstanta yang salah 4294967294. Jalur ini juga dapat
[melempar pengecualian pada pembacaan yang tidak tersedia](https://github.com/kadupulhq/kadupul/issues/248).
Jangan menyimpulkan satuan yang disimpan dari output penemuan ini.

Helper masih menggunakan kolom suhu lama `.2.1.3`. Versi upstream saat ini dari
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
menghentikan penggunaan objek tak bertanda tersebut dan beralih ke kolom bertanda `.2.1.4`; verifikasi dukungan
dan perilaku suhu negatif pada agen sebenarnya sebelum menyesuaikan templat.

**Paket perangkat, disediakan sebagai arsip yang dapat diimpor.** Beberapa membawa
XML kueri mereka sendiri dan menulisnya ke direktori kueri pada saat impor. Paket yang relevan di sini:

| Paket | Yang dihadirkan |
|---|---|
| SNMP UPS | Kueri jalur input dan output UPS-MIB, ditambah templat OID tetap untuk baterai, runtime, suhu, dan alarm |
| AKCP Device | Kueri skrip untuk sensor suhu, kelembapan, aliran udara, dan 4-20 mA |
| APC InfraStruXure PDU | Kueri untuk statistik pemutus arus dan fase |
| APC InfraStruXure InRow CRAC | Kueri untuk statistik unit dan grup, termasuk suhu, kelembapan, aliran udara, dan kecepatan kipas |
| BayTech PDU | Kueri stopkontak dan kueri sirkuit tiga fase, dengan arus, tegangan, daya, dan suhu |

Periksa paket yang sesuai sebelum menulis kueri secara manual. Ikuti
[Mengimpor dan mengekspor templat](/id/guides/import-and-export-templates/), verifikasi penerapan file
dan penemuan, lalu buat grafik yang diinginkan secara eksplisit. Keberadaan paket
tidak membuktikan kompatibilitas perangkat atau penskalaan yang benar; kekurangan UPS dan
lmSensors di bawah ini memerlukan perhatian.

## Dua bentuk yang diambil oleh sensor

Untuk pengumpulan SNMP, bedakan objek skalar dari instans tabel terindeks.

**OID tetap.** Nilai skalar tunggal pada satu alamat, alamat yang sama pada setiap
perangkat dari jenis tersebut. Suhu baterai. Total daya output. Gunakan sumber data OID
tetap: SNMP get terhadap OID literal, dan satu sumber data per pembacaan.

**Tabel.** Jumlah pembacaan yang tidak diketahui yang ditemukan per perangkat. Probe rak,
colokan daya, pengukuran per fase. Gunakan kueri data, yang menelusuri tabel,
mempelajari indeks, dan memungkinkan Anda memilih baris mana yang menjadi grafik.

Paket UPS yang disertakan menggunakan keduanya. Ikuti struktur objek MIB: perangkat
yang hanya memiliki satu probe arus mungkin masih mengeksposnya sebagai baris tabel terindeks.

| Pembacaan UPS | Bentuk | OID |
|---|---|---|
| Suhu baterai | Tetap | `.1.3.6.1.2.1.33.1.2.7.0` |
| Perkiraan sisa runtime | Tetap | `.1.3.6.1.2.1.33.1.2.3.0` |
| Waktu menggunakan baterai | Tetap | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tegangan baterai | Tetap | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarm aktif | Tetap | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tegangan, arus, daya, frekuensi input | Kueri | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tegangan, arus, daya, beban output | Kueri | `.1.3.6.1.2.1.33.1.4.4.1` |

Setiap sumber data tersebut bertipe `GAUGE`. Tidak ada yang berupa counter. Arsip
templat yang disertakan mendeklarasikan langkah 60 detik dan heartbeat 600 detik, minimum
nol, dan tanpa maksimum, kecuali suhu, yang tidak memiliki batas minimum. Periksa profil yang diimpor
dan konfigurasi RRD aktual; deklarasi ini tidak menentukan ritme polling yang sedang berjalan.
Pembacaan negatif yang valid juga membutuhkan sumbu grafik yang dapat menampilkannya.

## Menemukan OID

Jalani pemindaian pada perangkat sebelum Anda menulis apa pun. Anda mencari tiga hal: sebuah
tabel pembacaan, tabel label paralel, dan faktor pengali apa pun yang dipilih
vendor, ditambah objek validitas/status jika tersedia.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Ganti host dan community contoh dengan nilai yang dikonfigurasi dan jalankan probe dari poller.
Muat MIB yang cocok beserta dependensinya untuk memeriksa nama, satuan, dan semantiknya;
dokumentasi vendor juga dapat menjelaskan OID numerik. Nilai ambang batas
atau kode status di sekitarnya tidak dapat dipertukarkan dengan sebuah pengukuran.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

Definisi MIB adalah tempat di mana penskalaan didokumentasikan. Vendor yang melaporkan
sepersepuluh derajat akan menyatakannya dalam deskripsi atau klausul satuan objek, dan
dalam dokumentasi pendukung. Menebak dari satu pembacaan saja dapat mengubah 23,5 derajat
menjadi angka 235 pada grafik.

MIB standar mencakup lebih banyak hal daripada yang diperkirakan orang. UPS-MIB pada `.1.3.6.1.2.1.33` bersifat
generik di berbagai vendor. ENTITY-SENSOR-MIB memberikan nilai sensor beserta bidang
skala dan presisinya sendiri. Periksa MIB tersebut sebelum beralih ke subtree enterprise.

Bandingkan penemuan di seluruh reboot yang representatif dan pergantian probe dalam instalasi pengujian.
Dua penelusuran yang tidak berubah saja tidak membuktikan stabilitas indeks. Catat identitas
sensor yang stabil jika tersedia sebelum membuat grafik permanen.

## Membangun sumber data OID tetap

Sensor OID tetap memerlukan templat data yang menggunakan metode input SNMP get, dengan
OID sebagai nilai literal dan satu item sumber data di dalamnya. Atur tipenya ke `GAUGE`,
berikan nilai nyata pada batas minimum hanya jika sensor benar-benar tidak dapat turun di bawahnya,
dan biarkan batas maksimum tidak terdefinisi kecuali vendor mendokumentasikan batas atasnya.

Nilai di luar batas sumber data RRD akan menjadi unknown. Atur batas tersebut dalam
satuan mentah yang disimpan, bukan satuan grafik yang telah dikonversi; jika tidak, pembacaan
yang valid dapat hilang sebelum CDEF tampilan diterapkan.

## Membangun kueri data

Kueri memerlukan OID indeks, cara untuk mengubah setiap OID yang ditelusuri menjadi indeks, dan satu
bidang untuk setiap kolom yang Anda inginkan.

Kueri output UPS adalah contoh praktis yang ringkas. Kueri mengindeks pada tabel jalur,
menguraikan indeks dari akhir setiap OID yang dikembalikan dengan ekspresi reguler, dan
mendeklarasikan satu bidang input untuk indeks dan empat bidang output untuk tegangan,
arus, daya, dan beban. Definisi output mencakup metode, sumber, arah, dan
OID kolom. OID kolom dapat menjadi akar penelusuran indeks yang valid; kesesuaian
antara parser kueri dan OID aktual yang dikembalikan adalah hal yang paling krusial. Lihat [Kueri data dan indeks](/id/concepts/data-queries-and-indexes/) untuk mengetahui
bagaimana indeks dipilih dan disimpan.

Pilih metode reindeks secara sengaja. Pilihannya adalah: none, saat uptime
berkurang, saat jumlah indeks berubah, dan Verifikasi Semua Bidang (Verify All Fields). Tabel sensor
adalah contoh di mana metode yang lebih lemah gagal: cabut satu probe dari unit rak dan pasang
probe lain, dan jumlahnya mungkin tidak berubah sementara setiap pembacaan di balik indeks tersebut kini menjadi milik
sensor yang berbeda. Verifikasi penuh membutuhkan biaya transaksi SNMP pada setiap siklus.
Verifikasi bidang identitas mana yang dapat diperiksa oleh kueri: indeks numerik yang tidak berubah
atau label yang terpotong/duplikat tidak dapat membuktikan bahwa probe fisik adalah probe yang sama.
Segarkan penemuan dan tinjau asosiasi grafik setelah dilakukan penggantian.

## Menskalakan nilai

Tentukan di mana konversi dilakukan, dan terapkan hanya di satu tempat.

| Di mana | Kapan menggunakannya |
|---|---|
| Dalam skrip pengumpulan | Gunakan kontrak kolektor yang terdokumentasi; saat ini lmSensors get mengembalikan satuan mentah |
| Dalam CDEF pada item grafik | Nilai mentah layak disimpan, dan satuan tampilan adalah pilihan presentasi |

CDEF adalah jawaban umum untuk pengali vendor. Paket yang disertakan membawa
definisi seperti `Divide By 10`, yang dibangun dari sumber data saat ini, angka `10`, dan
pembagian. Terapkan hanya pada objek yang memiliki satuan mentah terkait.

Paket UPS memiliki [CDEF daya dan waktu yang salah](https://github.com/kadupulhq/kadupul/issues/249):
seri On Battery-nya membagi detik dengan 6000 alih-alih 60, dan seri Watt input/output
membagi watt dengan 10. Untuk agen yang sesuai, 600 detik harus ditampilkan sebagai 10 menit dan 1000 watt sebagai
1000 watt. Tegangan baterai dan arus jalur memang memerlukan pembagian dengan 10; estimasi runtime sudah dalam menit. Lihat
[satuan objek UPS pada RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Menyimpan pembacaan mentah dan membaginya pada grafik menjaga file RRD tetap murni dan
memungkinkan Anda memperbaiki pengali tampilan tanpa menulis ulang riwayat mentah,
asalkan sampel bertahan dari batas sumber data dan retensi. Konversi di sisi pengumpul
mengubah satuan yang disimpan dan dapat mengurangi presisi; dokumentasikan hal tersebut. Pembacaan mentah
tanpa penjelasan tidak boleh disajikan sebagai satuan teknis yang terverifikasi.

Jangan menerapkan konversi dua kali. CDEF pada grafik yang skripnya telah menskalakan
nilainya dapat menghasilkan pembacaan yang tampak masuk akal namun sepenuhnya salah.

## Memberikan pengaturan grafik yang sesuai untuk pengukuran

Pilih pengaturan untuk pengukuran alih-alih menyalin default lalu lintas jaringan secara membabi buta.

| Pengaturan | Lalu lintas jaringan | Sensor |
|---|---|---|
| Tipe sumber data | `COUNTER` | `GAUGE` |
| Nilai dasar | 1000, agar sumbu terbaca dalam k dan M | Tetap 1000, tetapi awalan tersebut tidak bermakna pada derajat |
| Skala otomatis | Diinginkan, karena rentangnya tidak diketahui | Biasanya tidak diinginkan, karena rentangnya diketahui |
| Batas atas dan bawah | Tergantung pada mode skala otomatis | Pilih rentang terlihat yang bermanfaat |

Tetapkan batas atas dan bawah yang eksplisit serta label vertikal yang menyebutkan satuan
sebenarnya. Grafik suhu UPS yang disertakan melakukan hal ini: batas bawah 0, batas atas
100, dan `C` sebagai label vertikal.

Opsi skala otomatis adalah serangkaian pilihan, bukan sekadar sakelar sederhana. Opsi yang digunakan
oleh grafik suhu bawaan meneruskan batas bawah dengan `--alt-autoscale-max`; opsi ini
tidak meneruskan batas atas tersimpan sebesar 100. Tanpa batas yang kaku, pembacaan di luar rentang
dapat memperluas batas yang diteruskan. Batas yang dikonfigurasi tidak secara otomatis terkunci. Pilih varian
yang mempertahankan batas yang Anda inginkan:

| Opsi | Pengaruh |
|---|---|
| Skala otomatis mengabaikan batas | Kedua ujung mengambang. Gunakan saat Anda tidak tahu rentangnya |
| Skala otomatis menerima batas bawah | Meneruskan batas bawah; maksimum mengikuti data |
| Skala otomatis menerima batas atas | Meneruskan batas atas; minimum mengikuti data |
| Skala otomatis dengan kedua batas | Meneruskan kedua batas; ekspansi masih bergantung pada mode kaku |

Ada juga opsi batas kaku (rigid boundaries) yang menghentikan sumbu berekspansi ketika suatu
nilai berada di luar batas yang Anda tetapkan. Aktifkan ketika sumbu tetap lebih penting
daripada melihat penyimpangan sementara, dan biarkan nonaktif jika tidak demikian, karena grafik
kaku dapat memotong lonjakan di luar rentang yang ditampilkan. Ini tidak menghapus sampel yang
disimpan. Lihat [referensi batas grafik RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Untuk derajat atau persen di mana awalan SI akan membingungkan pembaca, pertimbangkan eksponen satuan 0.
Basis 1000 mengontrol langkah awalan; ini tidak dengan sendirinya menonaktifkan awalan atau mengonversi satuan pengukuran.

### Konsolidasi lebih penting di sini daripada pada lalu lintas

Penghitung antarmuka yang dirata-ratakan selama satu jam masih memberi tahu Anda secara kasar apa yang terjadi.
Suhu yang dirata-ratakan selama satu jam menyembunyikan lonjakan sepuluh menit yang sebenarnya kritis.
Pastikan profil penyimpanan di balik sumber data ini menyimpan arsip `MAX`,
dan konfigurasikan seri yang diplot untuk membaca konsolidasi `MAX` yang sesuai.
Maksimum legenda pada seri `AVERAGE` tidak dapat mengembalikan puncak aslinya.

Bahkan arsip MAX hanya menyimpan puncak yang ada dalam sampel yang terkumpul; arsip ini
tidak dapat memulihkan lonjakan di antara polling atau nilai yang ditolak sebelum penyimpanan. Lihat
[Mengelola retensi data](/id/guides/manage-data-retention/) dan
[Sumber data dan arsip](/id/concepts/data-sources-and-rras/).

## Ketika tidak ada MIB yang layak digunakan

Banyak perangkat lingkungan menggunakan Modbus, protokol serial, atau API HTTP,
dan agen SNMP-nya tidak mengekspos hal yang berguna. Perangkat tersebut memerlukan input data skrip. Skrip
berjalan pada host poller, bukan pada perangkat, dan menjangkau perangkat adalah tugas
skrip tersebut. Lihat [Menulis skrip pengumpulan data](/id/guides/write-a-data-collection-script/) untuk melihat
kontrak output-nya.

Kembalikan `U` daripada `0` saat sensor tidak dapat dijangkau. Probe yang offline
bukanlah probe yang membaca suhu nol derajat.

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Suhu digambarkan sepuluh atau seratus kali terlalu besar | Pengali vendor belum dibagi |
| Suhu digambarkan sepuluh kali terlalu kecil | Dibagi dua kali, sekali dalam skrip dan sekali dalam CDEF |
| Jalur tegangan terbaca miliaran | Integer SNMP tak bertanda yang menyimpan nilai negatif, tanpa koreksi |
| Grafik sensor menjadi datar setelah probe diganti | Tabel diindeks ulang dan sumber data sekarang mengarah ke sensor yang berbeda |
| Pembacaan di atas ambang batas muncul sebagai celah kosong | Batas maksimum diatur pada sumber data dan nilai riil melampauinya |
| Sumbu berlabel k atau M pada pembacaan derajat | Nilai dasar dan pengaturan satuan diwarisi dari templat lalu lintas |
| Suatu lonjakan tidak terlihat pada tampilan mingguan | Periksa konsolidasi yang dipilih, resolusi yang dipertahankan, interval, dan sampel yang ditolak |
| Kueri tidak mengembalikan indeks | Periksa OID yang dikembalikan, kecocokan parser, izin akses, dan dukungan; akar kolom bisa valid |
| Kueri lmSensors tidak menemukan apa pun di host Linux | Periksa dukungan agen, akses, baris sensor yang terekspos, dan kode kesalahan SNMP |
