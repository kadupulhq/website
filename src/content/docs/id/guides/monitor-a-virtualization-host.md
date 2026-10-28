---
title: Memantau host virtualisasi
description: Apa yang diekspos hypervisor melalui SNMP, apa yang disertakan untuk ESXi, dan mengapa menghitung mesin tamu (guest), CPU, serta memori pada lingkungan tervirtualisasi lebih sulit dari yang terlihat.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 27
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau
jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Paket ESXi yang disertakan mengumpulkan metrik host dan jumlah inventaris tamu.
Paket ini tidak menyediakan pengukuran CPU, memori, atau kontensi (contention) per tamu. Verifikasi
objek yang diekspos oleh versi hypervisor Anda sebelum memilih grafik.

## Apa yang disertakan

Satu templat perangkat hypervisor disertakan: **ESXi Device**. Ini adalah paket perangkat, sehingga
`install/templates/ESXi_Device.xml.gz` berisi skrip dan file kueri datanya.
Ikuti [Mengimpor dan mengekspor templat](/id/guides/import-and-export-templates/) dan verifikasi bahwa
impor selesai, termasuk penerapan file. Pilih templat perangkat,
periksa penemuan, dan buat grafik yang diinginkan secara eksplisit; mengimpor paket
atau sekadar mengaitkan templat perangkat tidak secara otomatis membuatnya.

| Disertakan | Tujuan |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Menemukan prosesor dan membaca beban per prosesor |
| `resource/snmp_queries/esxi_hw.xml` | Menemukan komponen perangkat keras dan membaca statusnya |
| `resource/snmp_queries/interface.xml` | Kueri statistik antarmuka standar |
| `resource/script_server/host_disk.xml` | Partisi terpasang, melalui tabel penyimpanan Host Resources |
| `scripts/ss_esxi_vhosts.php` | Dibundel di dalam `install/templates/ESXi_Device.xml.gz`; menghitung tamu, tamu menyala, dan status tools tamu |
| `scripts/ss_multicpu_avg.php` | Merata-ratakan beban semua prosesor menjadi satu angka |
| `scripts/ss_hstats.php` | Membaca statistik polling yang sudah disimpan Kadupul untuk perangkat |
| `scripts/ss_host_disk.php` | Mendukung kueri partisi |

Tidak ada paket perangkat khusus yang disediakan untuk Hyper-V, KVM/libvirt, Xen, atau Proxmox dalam
rilis ini. Templat generik Linux/Windows dapat mencakup metrik host yang didukung oleh agen
mereka; pengumpulan khusus hypervisor memerlukan templat dan pengumpul yang sesuai. Lihat
[Menulis skrip pengumpulan data](/id/guides/write-a-data-collection-script/).

## Nyalakan agen terlebih dahulu

Tinjau konfigurasi agen yang ada dan gunakan petunjuk untuk versi ESXi Anda.
Catatan paket menyertakan reset pabrik; ini bukan prasyarat rutin dan
akan menghapus konfigurasi SNMP yang ada. Untuk pengaturan berbasis community, perintah
berikut mengatur nilai agen; ganti contoh dan pertahankan community yang diperlukan
saat menyetel daftar community.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Perintah pertama menampilkan konfigurasi; perintah terakhir mengaktifkan agen. Opsi community
menggantikan daftar yang dikonfigurasi. Periksa akses firewall yang diperlukan dari poller
dan lihat [referensi perintah SNMP ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Perintah-perintah ini mengonfigurasi polling berbasis community; mereka tidak mengonfigurasi SNMPv3.
Verifikasi dari mesin tempat poller berjalan sebelum menambahkan perangkat.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Jika perintah pertama berfungsi dan yang ketiga tidak menghasilkan apa-apa, periksa kesalahan SNMP,
kebijakan akses, dan dukungan agen; walk kosong saja tidak dapat memastikan penyebabnya. Skrip
tamu yang disertakan menggunakan SNMPv1, sehingga pengujian v2c yang berhasil tidak memvalidasi jalur
pengumpulannya. Walk tamu yang kosong menghasilkan hitungan nol, belum tentu celah pada grafik;
lihat [bug hasil kosong](https://github.com/kadupulhq/kadupul/issues/245).

## Apa yang diekspos oleh host

| Area | Subtree | Memberikan Anda |
|---|---|---|
| Prosesor | `.1.3.6.1.2.1.25.3.3.1` | Beban untuk setiap prosesor yang diekspos oleh agen |
| Komponen perangkat keras | `.1.3.6.1.2.1.25.3.2.1` | Indeks komponen, deskripsi, dan status |
| Penyimpanan | `.1.3.6.1.2.1.25.2.3.1` | Datastore dan sistem file lokal, sebagaimana dilaporkan oleh agen |
| Antarmuka | `.1.3.6.1.2.1.2` dan `.1.3.6.1.2.1.31` | Lalu lintas, kesalahan, status |
| Inventaris tamu | `.1.3.6.1.4.1.6876` | Status daya dan status tools per tamu |

Empat yang pertama adalah tabel standar Host Resources dan antarmuka, sama dengan yang
diberikan oleh host Linux. Lihat [Memantau server Linux](/id/guides/monitor-a-linux-server/)
untuk mengetahui cara kerjanya dan tabel disk mana yang harus dipilih.

Yang kelima adalah subtree vendor yang digunakan oleh skrip penghitung tamu yang disertakan.

## Templat grafik

| Grafik | Sumber | Membaca |
|---|---|---|
| ESXi - CPU | Kueri data | Beban untuk satu prosesor yang ditemukan |
| ESXi - MultiCPU Average | Skrip | Rata-rata beban setiap prosesor |
| ESXi - Hardware | Kueri data | Status satu komponen yang ditemukan |
| ESXi - VHosts | Skrip | Jumlah tamu dan status tools tamu |
| Host MIB - Processes | OID tetap | Jumlah proses pada host |
| Host MIB - Logged in Users | OID tetap | Jumlah sesi login pada host |
| Device - Uptime | Skrip | Uptime sebagaimana terakhir dicatat oleh Kadupul |
| Device - Polling Time | Skrip | Berapa lama waktu yang dibutuhkan Kadupul untuk mem-poll perangkat ini |
| Grafik antarmuka | Kueri data | Lalu lintas, kesalahan, paket, status per antarmuka |

Kueri prosesor membaca beban per entri yang ditemukan. Jangan berasumsi bahwa jumlah
barisnya cocok dengan jumlah thread perangkat keras host: pola indeks paket hanya menerima indeks
satu atau dua digit dan menolak 100 atau lebih besar, bahkan pada host dengan sedikit CPU.
Bandingkan penemuan dengan walk mentah; lihat [bug indeks CPU](https://github.com/kadupulhq/kadupul/issues/246).
Skrip rata-rata menelusuri beban prosesor secara independen dan merata-ratakan baris yang dikembalikan.

Device - Uptime dan Device - Polling Time membaca catatan perangkat Kadupul yang tersimpan.
Helper uptime mengembalikan uptime SNMP yang disimpan tanpa mengekstrapolasi waktu yang telah berlalu;
waktu polling menggambarkan kerja pengumpulan Kadupul. Nilai lama yang tersimpan tidak membuktikan
keterjangkauan saat ini. Jika pengumpulan berhenti, helper ini tidak menghasilkan sampel baru.

## Masalah penghitungan

Ini adalah bagian yang membuat virtualisasi berbeda dari server fisik, dan tidak ada
yang diselesaikan hanya dengan templat grafik.

**Tamu berpindah tempat.** Tamu yang bermigrasi ke host lain menghilang dari inventaris host pertama
dan muncul di host kedua. Sampel yang diambil pada waktu yang berbeda dapat secara sementara
menghitung ganda atau melewatkan tamu tersebut. Perubahan jumlah saja tidak membuktikan migrasi: gunakan
identitas inventaris hypervisor dan peristiwa untuk menjelaskannya.

**Sumber daya dibagi bersama, sehingga atribusi per tamu adalah perkiraan.** Host melaporkan
beban prosesor fisik. Host tidak melaporkan tamu mana yang menyebabkannya. Membagi CPU host
dengan jumlah tamu menghasilkan angka yang benar secara aritmatika tetapi tidak menjawab pertanyaan yang bermakna.

**Overcommit membuat alokasi dan penggunaan menjadi besaran yang berbeda.** CPU virtual yang ditetapkan
dapat melebihi inti fisik, dan memori yang dialokasikan dapat melebihi memori fisik secara sengaja. Grafik
sumber daya yang dialokasikan menggambarkan provisi daripada permintaan yang diukur.
Bandingkan dengan kapasitas fisik, batas yang dikonfigurasi, dan penggunaan aktual.

**Kontensi (contention) tidak muncul dalam tabel ini.** Pengukuran yang memberi tahu Anda bahwa tamu
sedang kekurangan sumber daya – waktu yang dihabiskan untuk menunggu prosesor fisik dan memori yang
direklamasi host darinya – tidak ada dalam apa yang dikumpulkan templat ini. Host dengan 60 persen
CPU dengan tamu yang mengalami kontensi parah terlihat identik di sini dengan host pada 60 persen CPU dengan
tamu yang berjalan lancar.

**Pengukuran tamu dan host menjawab pertanyaan yang berbeda.** Pemanfaatan tamu saja
mungkin tidak menjelaskan penundaan penjadwalan host. Korelasikan pengukuran tamu/aplikasi
dengan metrik kontensi hypervisor daripada menurunkan atribusi dari beban host.

### Apa yang harus dilakukan sebagai gantinya

| Pertanyaan | Di mana jawabannya berada |
|---|---|
| Apakah host jenuh | Beban prosesor host, langsung dari host |
| Apakah tamu jenuh | Di dalam tamu, ditambah metrik kontensi yang dimiliki hypervisor |
| Berapa banyak tamu yang berjalan | Inventaris tamu host, sebagai hitungan |
| Apakah lingkungan kehabisan kapasitas | Bukan dari grafik ini. Memerlukan data penempatan yang tidak diekspos host |
| Apakah tamu berpindah | Identitas inventaris hypervisor dan peristiwa migrasi; langkah hitungan saja tidak cukup |

Pantau tamu sebagai perangkat mereka sendiri untuk segala hal tentang tamu, dan pantau host
untuk segala hal tentang host. Hindari membangun grafik per tamu dari angka tingkat host:
angka-angka tersebut adalah turunan, tampak meyakinkan, dan salah dengan cara yang tidak dapat dideteksi orang lain di kemudian hari.

## Jebakan dalam penghitungan tamu yang disertakan

Skrip inventaris tamu penting dipahami sebelum Anda mengandalkan output-nya.

**Skrip ini melakukan walk secara eksklusif dengan SNMP versi 1 dan string community saja.** Versinya telah ditetapkan
dalam skrip dan kredensial v3 pada perangkat tidak diteruskan. Perangkat yang dikonfigurasi untuk
v3 dapat mengumpulkan melalui jalur lain sementara pengumpulan tamu gagal. Pengumpulan tamu mungkin
masih berhasil jika agen tersebut secara independen menerima community tersimpan melalui v1;
memilih v3 pada perangkat tidak dengan sendirinya menentukan hasilnya. Walk tamu yang kosong
dikembalikan sebagai nol. Periksa ketidaksesuaian protokol ini tanpa menurunkan kebijakan keamanan
agen untuk mengakomodasi helper.

**Hitungan berasal dari tabel status daya.** Angka yang dilaporkan sebagai total tamu
adalah jumlah entri yang dikembalikan oleh penelusuran subtree status daya, bukan dari
objek inventaris terpisah. Tamu yang dicantumkan host tetapi tidak memiliki entri status daya
tidak akan dihitung.

**Status menyala dicocokkan berdasarkan teks status.** Setelah pemangkasan spasi dan konversi huruf kecil,
hanya `powered on` dan `poweredon` yang menambah hitungan tamu yang berjalan. Representasi lain
tidak menambahkannya; bandingkan respons mentah agen sebelum mengartikan angka nol.

**Klasifikasi tools tamu memiliki cacat yang telah dikonfirmasi.** Teks literal `not installed`
dihitung sebagai berjalan karena kecocokan dimulai pada offset nol. Teks yang tidak dikenal
juga dianggap berjalan. Jangan memperlakukan hitungan tersebut sebagai bukti tools yang sehat;
lihat [bug status tools](https://github.com/kadupulhq/kadupul/issues/244).

**Skrip melakukan walk tiga kali per panggilan.** Skrip membaca tabel status daya dua kali, lalu tabel
tools, sehingga perhitungannya sendiri bukanlah snapshot inventaris atomik. Pada host
dengan banyak tamu, ukur biaya pengumpulan ini. Jika poller terbatas, ini adalah kandidat untuk interval yang lebih panjang sebelum
mempertimbangkan penambahan thread. Lihat [Penskalaan poller](/id/guides/scale-the-poller/).

Skrip biasanya memancarkan kelima nilai bernama, termasuk nol untuk walk kosong.
Walk yang gagal dapat menghasilkan sampel yang lengkap secara sintaksis tetapi menyesatkan.
Untuk output yang tidak lengkap, pemroses output PHP memeriksa bidang yang diperlukan oleh
sumber data terkait dan menahan grup stempel waktu yang tidak lengkap; pemroses tidak
serta merta langsung membuangnya. Lihat [Cache poller](/id/concepts/the-poller-cache/).

## Jebakan pada bagian lainnya

**Rata-rata prosesor menyembunyikan ketidakseimbangan.** Host dengan satu inti mentok pada 100% dan 63 inti menganggur
akan menghasilkan rata-rata yang rendah. Pertahankan grafik per prosesor yang tervalidasi jika hal itu penting. Helper
rata-rata juga mengembalikan `load:0` untuk walk kosong, tidak dapat dibedakan dari CPU menganggur yang sebenarnya;
korelasikan dengan status pengumpulan dan bug hasil kosong yang diketahui.

**Indeks prosesor bersifat posisional.** Indeks ditemukan dengan menelusuri tabel
prosesor. Jika indeks agen berubah, verifikasi pemetaan identitas sebelum memercayai kontinuitasnya.
Batasan satu atau dua digit dalam paket adalah cacat penemuan yang terpisah.

**Entri penyimpanan adalah apa pun yang disebut agen sebagai penyimpanan.** Bersiaplah melihat datastore bercampur dengan
hal-hal yang tidak Anda inginkan, dalam unit alokasi yang perlu dikalikan. Ini adalah
perilaku Host Resources, bukan keanehan ESXi. Verifikasi unit alokasi dalam cache sebelum
menginterpretasikan byte; skrip bersama memiliki [cacat konversi yang diketahui](https://github.com/kadupulhq/kadupul/issues/243)
untuk sampel negatif yang tidak valid atau pengganda yang hilang.

**Nama antarmuka pada hypervisor stabil sampai suatu saat tidak stabil lagi.** Pembaruan driver atau
rekonfigurasi dapat mengubah penomoran mereka. Lihat [Memantau switch](/id/guides/monitor-a-switch/) untuk
mengetahui bagaimana indeks dipilih dan mengapa itu penting.

**Skrip berjalan pada host poller.** Skrip menghubungi hypervisor secara langsung, menggunakan
ID perangkat yang diteruskan oleh perintah yang tersimpan di cache. Helper tamu dan rata-rata CPU mengambil
baris perangkat saat ini pada setiap panggilan; perubahan community tidak memerlukan pembangunan ulang
argumen perintah tersebut. Kolektor lain mungkin menyematkan kredensial dalam item kerja mereka.
Lihat [Cache poller](/id/concepts/the-poller-cache/).

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Semuanya terkumpul kecuali hitungan tamu | Perangkat dikonfigurasi untuk SNMPv3 dan skrip tamu menggunakan v1 |
| Jumlah tamu tepat, jumlah menyala bernilai nol | Periksa teks status daya yang tepat dan apakah walk kedua berhasil |
| Jumlah tamu turun ke nol dan pulih kembali | Periksa walk yang gagal/kosong; helper dapat memancarkan satu baris penuh berisi nol |
| Grafik prosesor terhenti setelah perubahan perangkat keras | Periksa indeks yang berubah dan pembatasan bawaan ke indeks satu atau dua digit |
| CPU host datar dan rendah saat tamu lambat | Periksa kegagalan pengumpulan dan kontensi; walk rata-rata yang kosong dilaporkan sebagai nol |
| Grafik datastore menyertakan partisi yang tidak diminta | Agen melaporkannya sebagai penyimpanan |
| Grafik uptime terlihat salah setelah poller mati | Grafik melaporkan nilai terakhir yang dicatat Kadupul, bukan pembacaan langsung |
| Total tamu di seluruh host melonjak selama pemeliharaan | Tamu yang bermigrasi sempat dihitung dua kali, atau tidak dihitung sama sekali |
