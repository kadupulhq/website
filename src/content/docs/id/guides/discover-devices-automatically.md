---
title: Menemukan perangkat secara otomatis
description: Pindai rentang jaringan, cocokkan perangkat yang ditemukan ke sebuah templat, dan biarkan aturan membangun grafik serta cabang hierarki, dengan pembuatan perangkat dinonaktifkan untuk putaran penemuan awal.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini dalam instalasi pengujian yang terisolasi. Ini adalah draf terjemahan yang menunggu peninjauan oleh penutur fasih.
sidebar:
  order: 15
---

:::caution[Validasi sebelum penggunaan]
Kode sumber telah tersedia, tetapi belum ada rilis Kadupul yang didukung atau
jalur migrasi. Uji prosedur ini pada salinan terisolasi dengan cadangan sebelum
mengandalkannya. Lihat [status proyek](/id/project/status/).
:::

Otomatisasi terdiri dari dua mesin terpisah yang sering kali tertukar. Penemuan (discovery) menelusuri
rentang alamat dan menentukan apa yang dianggap sebagai perangkat. Aturan menentukan apa yang dibangun untuk
perangkat tersebut setelah perangkat itu ada. Anda dapat menjalankan salah satunya tanpa yang lain, dan sebagian besar masalah
yang dihadapi pengguna dalam otomatisasi berasal dari mengaktifkan keduanya sekaligus dan baru
menyadari konsekuensinya belakangan.

## Menentukan rentang

Rentang jaringan adalah daftar yang dipisahkan dengan koma. Setiap entri menggunakan salah satu dari tiga bentuk.

| Bentuk | Contoh | Catatan |
|---|---|---|
| CIDR | `192.168.1.0/24` | Juga menerima subnet mask bertitik, `192.168.1.0/255.255.255.0` |
| Karakter wildcard | `192.168.*.*` | Dikonversi secara internal ke CIDR yang setara |
| Alamat tunggal | `192.168.1.10` | Memindai tepat alamat tersebut |

Rentang awal-ke-akhir yang ditulis seperti `192.168.1.10-192.168.1.50` akan ditolak dengan
kesalahan. Format ini tidak didukung.

Gunakan rentang yang tidak tumpang tindih, termasuk di seluruh jaringan yang dapat berjalan secara bersamaan.
Tabel kerja memiliki kunci unik global pada alamat IP; duplikat dapat
menolak seluruh batch penyisipan, mengabaikan alamat lain dalam batch tersebut. Lihat
[masalah #207](https://github.com/kadupulhq/kadupul/issues/207).

Semuanya berjalan pada IPv4. Perhitungan rentang menggunakan konversi bilangan bulat 32-bit di seluruh alur,
sehingga tidak ada jalur IPv6 di sini.

Alamat jaringan dan broadcast dikecualikan. Sebuah `/24` memindai 254 alamat, dari
`.1` hingga `.254`. Entri alamat tunggal memindai satu alamat. Alamat yang oktet terakhirnya adalah 255
juga dilewati selama pemindaian.

Sebelum pemindaian dimulai, setiap alamat dalam rentang ditulis ke dalam tabel kerja, satu
baris per alamat, dan thread mengambil baris darinya. Sebuah `/16` menulis 65534 baris sebelum
ping pertama dilakukan. Ini adalah beban nyata, dan itulah sebabnya pemindaian rentang besar yang jarang terisi
berjalan lambat meskipun tidak ada perangkat yang merespons.

Lampirkan kumpulan opsi SNMP ke setiap rentang. Mode master mencatat kesalahan dan melewati
rentang yang ID set SNMP-nya bernilai nol. Pemindaian bertarget tidak menerapkan perlindungan yang sama;
memulainya secara langsung tidak membuat opsi SNMP yang hilang menjadi dapat digunakan.

## Mengatur kecepatan pemindaian

| Pengaturan | Fungsinya | Nilai default |
|---|---|---|
| Discovery Threads | Worker paralel yang mengambil alamat | 1 |
| Run Limit | Penemuan dihentikan setelah durasi ini | 20 minutes |
| Schedule Type | Manual, harian, mingguan, bulanan, atau bulanan pada hari tertentu | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP, atau SNMP | Dari pengaturan global |
| Ping Retries, Timeout | Beban kegagalan per alamat | Dari pengaturan global |

Thread dan batas waktu eksekusi (run limit) berinteraksi buruk jika tidak diperhitungkan dengan cermat. Lima puluh thread
terhadap `/16` dianggap sebagai port scan oleh sistem deteksi intrusi mana pun.
Satu thread terhadap rentang yang sama akan mencapai batas waktu dan dimatikan di tengah jalan,
meninggalkan hasil parsial yang tampak seperti hasil lengkap.

Sesuaikan ukuran rentang sehingga pemindaian selesai dalam batas waktu dengan jumlah thread
yang dapat ditoleransi jaringan Anda. Beberapa rentang kecil lebih baik daripada satu rentang besar, karena masing-masing memiliki
jadwal dan batas waktunya sendiri.

## Apa yang dilakukan pemindaian per alamat

1. Menyelesaikan nama host. Server DNS alternatif dapat diberikan sebagai daftar yang dipisahkan spasi; jika
   tidak ada yang diatur, resolver poller sendiri yang digunakan. Pencarian NetBIOS adalah alternatif
   opsional ketika DNS tidak menghasilkan apa-apa.
2. Memeriksa apakah alamat atau nama tersebut sudah menjadi perangkat. Jika ya, alamat
   ditandai selesai. Ini menekan perangkat yang sudah ada yang ditemukan melalui nilai tersebut; namun,
   ini bukan jaminan terhadap pembuatan bersamaan atau alias yang berbeda.
3. Melakukan ping, menggunakan metode yang dikonfigurasi. Metode SNMP melewati ping terpisah.
4. Jika ping merespons, atau metode SNMP dipilih, coba SNMP dan kumpulkan `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact`, dan uptime.
5. Mencocokkan data sistem yang dikumpulkan dengan aturan perangkat.

Alamat yang merespons ping tetapi tidak merespons SNMP dicatat sebagai ditemukan dan hidup. Alamat
yang merespons SNMP tetapi tidak cocok dengan aturan perangkat mana pun dicatat sebagai ditemukan, dengan
data sistemnya, dan tidak ada yang dibuat. Keduanya masuk ke dalam daftar perangkat yang ditemukan.

Penekanan duplikat aktif secara default. Jika sebuah `sysName` telah terlihat pada
alamat lain dalam catatan penemuan tersimpan dari jaringan ini, atau ada pada perangkat dengan
hostname berbeda, alamat tersebut dilewati. Ini adalah default yang tepat untuk router dengan banyak
antarmuka berakar dan keliru untuk perangkat identik di balik alamat NAT terpisah;
opsi sysName yang sama tersedia untuk menonaktifkan perilaku ini.

Perangkat yang sudah ada dapat menjalankan kembali kueri datanya selama pemindaian. Fitur ini dinonaktifkan
secara default, dan berlaku untuk perangkat yang dicatat dalam keadaan aktif atau sedang memulihkan diri. Penemuan menggunakan
status tersimpan mereka untuk keputusan ini; penemuan tidak melakukan probe ulang secara langsung terhadap perangkat yang ada.

## Aturan perangkat menentukan templat

Aturan perangkat memetakan data sistem ke templat perangkat. Setiap aturan membawa pola untuk
`sysDescr`, `sysObjectID`, dan `sysName`. Pencocok memfilter setiap bidang sistem
yang dikembalikan perangkat dalam keadaan tidak kosong; pola aturan kosong cocok dengan nilai apa pun. Aturan
dievaluasi secara berurutan dan kecocokan pertama yang menang.

Gunakan substring literal sederhana dan verifikasi templat yang dipilih dalam hasil penemuan.
Pencocok SQL saat ini membungkus pola regex dalam karakter literal `/`,
sehingga pola berakar seperti `^Linux.*fixture$` akan gagal meskipun operator regex database
dapat mencocokkannya secara langsung. Alternatif substring tidak memperbaiki kasus tersebut. Lihat
[masalah #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE`
juga memperlakukan `%` dan `_` sebagai wildcard.

Tidak ada kecocokan berarti tidak ada perangkat. Alamat dicatat dalam daftar perangkat yang ditemukan
bersama data sistem apa pun yang berhasil dikumpulkan, dan daftar tersebut adalah tempat Anda menulis aturan
yang sebelumnya terlewatkan.

Tempatkan aturan spesifik di atas aturan umum. Aturan yang cocok dengan substring `Linux` yang diletakkan
di atas aturan vendor akan mengambil setiap perangkat yang menyebutkan Linux dalam
deskripsinya.

## Pratinjau penemuan sebelum mengaktifkan pembuatan

Opsi pembuatan perangkat pada rentang baru dinonaktifkan secara default. Biarkan nonaktif
untuk putaran awal, dan nonaktifkan opsi untuk menjalankan ulang kueri data perangkat yang ada.
Putaran ini tetap memperbarui catatan penemuan, statistik pemindaian, serta log, dan dapat mengirimkan
pemberitahuan yang dikonfigurasi. Ini tidak mempratinjau eksekusi aturan grafik atau hierarki.

Jalankan pemindaian, lalu periksa daftar perangkat yang ditemukan. Daftar ini menunjukkan penemuan yang tercatat,
data SNMP yang terkumpul, dan templat yang cocok jika tersedia. Perangkat
yang ada, duplikat yang ditekan, dan alamat yang dilewati tidak harus muncul di sana.
Tinjau output debug per alamat dan juga daftarnya.

Paksa pemindaian dari baris perintah alih-alih menunggu jadwal:

```bash
php poller_automation.php --network=3 --force --debug
```

Flag debug mencetak keputusan per alamat saat proses berlangsung. Proses master,
yang meluncurkan rentang aktif yang jadwalnya telah tiba, adalah mode terpisah:

```bash
php poller_automation.php -M
```

Perintah bertarget dengan `--force` juga menjalankan jaringan yang dinonaktifkan. Menambahkan `--force` ke
mode master mengabaikan pemeriksaan jadwal dan juga dapat meluncurkan jaringan yang dinonaktifkan.
Gunakan bentuk bertarget saat memvalidasi satu rentang.

Periksa tiga hal dalam hasil pemindaian sebelum mengaktifkan pembuatan:

- Jumlah perangkat sesuai dengan yang Anda harapkan. Jumlah yang jauh lebih tinggi daripada daftar aset Anda
  biasanya berarti rentang tersebut lebih luas daripada yang diperkirakan.
- Templat yang dipilih sudah tepat. Kolom dengan templat generik yang sama untuk
  semuanya berarti aturan Anda tidak cocok.
- Tidak ada perangkat penting yang hilang. Untuk perangkat yang hilang, periksa ekspansi rentang, penyelesaian worker,
  penekanan duplikat dan perangkat yang ada, kebijakan ping, serta hasil SNMP.
  Ketidakhadiran dalam daftar saja tidak membuktikan bahwa perangkat tersebut tidak dapat dijangkau.

## Aturan grafik dan hierarki

Setelah perangkat ada, aturan grafik dan aturan hierarki menentukan apa yang dibangun di atasnya.
Penemuan dapat memanggil otomatisasi ini setelah membuat perangkat, dan CLI dapat
menerapkannya ke perangkat yang ada. Aturan grafik dan hierarki individual harus diaktifkan.
Pengalih otomatisasi grafik/hierarki global mengatur hook pembuatan tertentu;
keduanya bukan larangan menyeluruh terhadap otomatisasi CLI eksplisit.

Aturan grafik memiliki tiga bagian: perangkat mana yang menjadi sasarannya, indeks ditemukan mana
dalam kueri data yang menjadi sasarannya, dan jenis grafik apa yang akan dibuat. Kedua bagian
pencocokan dibangun dari item aturan, dan sebuah item aturan terdiri dari bidang, operator, dan
pola, yang digabungkan dengan `AND` atau `OR` menggunakan tanda kurung.

| Grup operator | Anggota |
|---|---|
| Substring | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Kesetaraan | matches, is not equal to |
| Numerik | is less than, less than or equal, greater than, greater than or equal |
| Keberadaan | is unknown, is not unknown, is empty, is not empty |
| Pola | matches regular expression, does not match regular expression |

Bagian ini menjadi klausa SQL `WHERE`. Operator ekspresi reguler mengikuti
dialek regex database, bukan PCRE; sehingga pola yang berfungsi dalam
`preg_match` belum tentu berfungsi di sini. Perbandingan numerik terhadap pola
numerik diteruskan tanpa tanda kutip; hal lainnya diberi tanda kutip, dan database
menerapkan aturan konversi tipenya. Uji filter numerik terhadap nilai aktual yang tersimpan di
cache; nilai-nilai ini biasanya disimpan sebagai teks. Operator substring menggunakan SQL `LIKE`,
di mana `%` dan `_` berfungsi sebagai wildcard.

Dua perilaku ini penting dipahami sebelum Anda men-debug aturan yang tidak berjalan:

**Filter perangkat/objek yang kosong tidak cocok dengan apa pun, tetapi filter indeks yang kosong
cocok dengan semua indeks dalam cache.** Filter pemilihan perangkat beralih ke kondisi false
ketika tidak memiliki item kecocokan. Namun, begitu aturan grafik cocok dengan sebuah perangkat,
menghapus semua kondisi indeks grafiknya membuat kueri data tidak terfilter.
Misalnya, menghapus kondisi `ifDescr = eth0` juga dapat membuat grafik untuk `lo`.
Nonaktifkan aturan saat mengedit kondisi indeksnya.

**Aturan yang merujuk ke bidang yang tidak ditemukan perangkat akan ditinggalkan.** Jika sebuah
aturan memfilter bidang kueri data yang tidak ada dalam cache perangkat tersebut, proses mencatat
peringatan yang menyebutkan nama bidang tersebut dan berhenti memproses aturan itu untuk perangkat tersebut. Penyebab
umumnya adalah aturan yang ditulis untuk satu kueri data dievaluasi pada perangkat yang
kuerinya menghasilkan rangkaian bidang yang berbeda.

Halaman edit aturan mencantumkan objek dan grafik kandidat. Tinjau daftar tersebut sebelum
mengaktifkan aturan dan setelah mengeditnya. Daftar tersebut adalah pratinjau seleksi, bukan simulasi
eksekusi penuh: pemeriksaan sumber data, deteksi grafik yang ada, hook pembuatan,
dan penyisipan hierarki tetap berlangsung selama eksekusi. CLI tidak memiliki opsi dry-run.

Aturan hierarki memiliki tipe daun perangkat dan grafik yang terpisah serta pohon
tujuan dan induk yang dipilih. Langkah header dapat menggunakan string tetap atau nilai dari
bidang perangkat/grafik. Header yang diturunkan dari bidang menerapkan penggantian regex PHP case-insensitive;
urutan literal `\n` dalam hasil akan membaginya menjadi header bersarang yang berurutan.
Sintaks penggantian ini berbeda dari regex SQL yang digunakan untuk pencocokan objek.
Header dan daun yang ada digunakan kembali pada pohon dan induk yang sama; mengubah
jalur dapat menambahkan penempatan baru tanpa menghapus penempatan lama.

## Menerapkan aturan pada perangkat yang sudah ada

Penemuan bukan satu-satunya pintu masuk. Aturan dapat dijalankan terhadap perangkat yang sudah ada di
dalam sistem, yang dipilih berdasarkan id, nama host, atau deskripsi:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Nama host dan deskripsi dicocokkan sebagai ekspresi reguler jika nilainya valid,
dan selalu juga sebagai substring. Setidaknya satu dari ketiga pemilih diperlukan;
memanggilnya tanpa pemilih akan keluar dengan kesalahan. Ketika pemilih digabungkan,
mereka disatukan dengan `AND`. Gunakan ID perangkat positif yang dipisahkan spasi untuk seleksi
yang ketat; ID yang dipisahkan koma tidak didukung. Pola masih bisa luas,
dan alternatif SQL `LIKE` memperlakukan `%` dan `_` sebagai wildcard.

Kueri pemilih tidak secara otomatis mengecualikan perangkat yang dinonaktifkan. Opsi `--debug`
menambahkan diagnostik tetapi tetap melakukan pembuatan. Tidak adanya perangkat yang cocok adalah operasi tanpa hasil
yang berhasil, sehingga status keluar saja tidak membuktikan bahwa ada sesuatu yang dibuat.

Untuk setiap perangkat yang cocok, eksekusi melakukan tiga hal secara berurutan:

1. Mencoba pembuatan untuk templat grafik terlampir yang belum memiliki grafik pada
   perangkat, tunduk pada kelayakan templat dan pemeriksaan sumber data.
2. Menjalankan aturan grafik yang diaktifkan untuk kueri data terlampir menggunakan cache indeks yang
   tersimpan. Langkah ini sendiri tidak menjalankan ulang penemuan; segarkan kueri data terlebih dahulu
   jika cache hilang atau usang.
3. Menerapkan aturan hierarki daun perangkat yang diaktifkan.

Pembuatan grafik baru dapat memanggil aturan hierarki daun grafik ketika otomatisasi
hierarki global diaktifkan. CLI tidak menerapkan kembali aturan tersebut ke grafik yang ditemukannya
sudah dibuat. Oleh karena itu, aturan daun grafik yang baru atau diubah tidak mengisi ulang grafik
yang ada hanya karena CLI dijalankan kembali. Lihat
[masalah #211](https://github.com/kadupulhq/kadupul/issues/211). Verifikasi penempatannya
secara terpisah; jangan menghapus dan membuat ulang grafik historis hanya untuk memicu hook pembuatan.

Eksekusi berulang menekan grafik non-indeks yang ada berdasarkan perangkat dan templat grafik.
Grafik terindeks diperiksa berdasarkan perangkat, kueri data, jenis grafik, dan indeks. Ini
mencegah pembuatan duplikat dalam eksekusi berurutan; ini bukan jaminan konkurensi.
Periksa daftar grafik dan hierarki setelah proses selesai, beserta pesan log `AUTOM8` untuk
grafik yang dilewati, data tidak valid, atau kegagalan pembuatan.

Satu hal dilewati dengan cukup hening hingga membingungkan: templat grafik dengan bidang
yang ditandai dapat ditimpa (overridable) yang tidak memiliki nilai default tidak memenuhi syarat untuk otomatisasi. Eksekusi
mencatat bahwa templat tidak ditambahkan karena bidang overridable tidak memiliki default, lalu beralih
ke proses berikutnya. Jika templat yang Anda harapkan tidak pernah muncul, itulah hal pertama yang harus diperiksa. Lihat
[Templat](/id/concepts/templates/) untuk memahami apa itu bidang overridable.

## Jebakan

**Menonaktifkan aturan tidak membatalkan pekerjaannya.** Ini tidak menghapus grafik atau entri
hierarki yang sudah dibuat. Penghapusan perangkat memiliki perilaku pembersihan terpisah untuk
grafik dan sumber data; tinjau opsi penghapusan sebelum menghapus perangkat.

**Pemindaian yang dimatikan tampak seperti pemindaian bersih.** Batas waktu eksekusi menghentikan
penemuan di titik mana pun proses berada. Total yang dicatat adalah total pekerjaan yang
telah selesai, dan tidak ada yang menandai hasilnya sebagai parsial. Bandingkan jumlah alamat yang dipindai
dengan ukuran rentang keseluruhan.

**Aturan dijalankan terhadap cache kueri data, bukan terhadap perangkat.** Aturan grafik yang
tidak cocok dengan apa pun sering kali berarti kueri data tidak pernah dijalankan, atau dijalankan dan tidak menemukan indeks.
Periksa tabel indeks yang ditemukan sebelum menulis ulang aturan.

**Email pemberitahuan mencakup penemuan yang ada dan yang baru.** Rentang dapat mengirim email
saat selesai, mengelompokkan penemuan yang dicatat berdasarkan apakah setiap IP muncul
dalam snapshot prapemindaian. Ini bukan bukti bahwa setiap alamat yang diminta benar-benar telah dipindai.

## Mode kegagalan

| Gejala | Penyebab umum |
|---|---|
| Pemindaian tidak menemukan apa pun pada rentang terisi | Ping diblokir, kegagalan SNMP, pengecualian, atau penekanan duplikat |
| Rentang menolak untuk memindai, kesalahan dalam log | Tidak ada set opsi SNMP yang dilampirkan |
| Perangkat ditemukan tetapi tidak ada yang dibuat | Sakelar pembuatan nonaktif, atau tidak ada aturan perangkat yang cocok |
| Semua perangkat mendapatkan templat generik yang sama | Urutan aturan, dengan aturan umum di atas aturan spesifik |
| Hanya sebagian alamat yang dipindai | Batas waktu tercapai, atau rentang yang tumpang tindih menolak batch alamat |
| Satu perangkat per router alih-alih satu per antarmuka, atau sebaliknya | Pengaturan penekanan duplikat untuk sysName yang sama |
| Aturan tidak cocok dan log memperingatkan tentang kolom | Aturan memfilter bidang yang tidak dikembalikan oleh kueri data perangkat ini |
| Templat grafik tidak pernah dibuat oleh aturan | Nilai default wajib hilang, output sumber data tidak valid, atau kegagalan pembuatan |
| Grafik tak terduga untuk antarmuka tambahan | Filter indeks grafik kosong atau lebih luas dari yang diinginkan |
| Aturan hierarki baru tidak menempatkan grafik yang ada | CLI tidak mengisi ulang aturan daun grafik untuk grafik yang sudah ada |
