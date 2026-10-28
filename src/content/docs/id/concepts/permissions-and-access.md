---
title: Izin dan akses
description: Mengapa akses dibagi menjadi dua sistem independen, mengapa izin disimpan sebagai default ditambah pengecualian, dan mengapa pohon terlihat berbeda untuk setiap akun.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Validasi prosedur ini pada instalasi uji yang terisolasi. Draf terjemahan, menunggu peninjauan oleh orang yang fasih dalam bahasa ini.
sidebar:
  order: 8
---

Akses memiliki pemeriksaan terpisah untuk realm dan kebijakan objek. Realm mengontrol fungsi antarmuka
mana yang boleh digunakan oleh suatu akun; kebijakan objek menentukan grafik, perangkat, templat, dan
pohon mana yang diizinkan. Suatu permintaan dapat bergantung pada keduanya. Pemberian izin realm tidak
dengan sendirinya memberikan akses ke grafik, dan pemberian izin grafik tidak dengan sendirinya memberikan
fungsi Konsol. Status akun, mode autentikasi, dan pengaturan tampilan juga berpengaruh.

Halaman ini menjelaskan mengapa model ini dirancang demikian. Untuk mekanisme praktis dalam membangun akun,
lihat [Kelola pengguna dan izin](/id/guides/manage-users-and-permissions/).

## Mengapa dua sistem

Kedua pertanyaan tersebut bukanlah jenis pertanyaan yang sama.

Mengakses halaman berkaitan dengan kode. Akun diizinkan menjalankan editor perangkat atau tidak, dan
hanya ada satu jawaban untuk seluruh instalasi. Melihat perangkat berkaitan dengan data. Ada ribuan
perangkat dan jawabannya berbeda untuk masing-masing perangkat.

Menggabungkannya berarti mengelola izin per halaman per objek, yang merupakan hasil kali dari dua daftar
yang sama-sama berkembang. Memisahkannya menghasilkan satu daftar bagian antarmuka yang tetap dan ringkas,
serta satu set aturan per objek. Biaya dari pemisahan ini adalah keduanya harus dikonfigurasi; akun yang
salah dikonfigurasi pada salah satunya akan tampak bermasalah dengan cara yang sama.

## Realm adalah daftar bernomor tetap

Realm mengidentifikasi izin antarmuka berdasarkan nomor. Pemetaan inti menghubungkan halaman dengan realm,
sementara plugin dapat mendaftarkan realm tambahan. Periksa realm dan identitas yang diperlukan untuk rute
yang sebenarnya, alih-alih memperlakukan akses halaman sebagai keputusan otorisasi objek yang lengkap.

Digunakan nomor, bukan nama file, karena sebuah realm mencakup beberapa halaman dan halaman dapat diubah
namanya. Nomor tersebut tetap bertahan; daftar file di baliknya adalah pemetaan yang dapat berubah tanpa
menyentuh akun mana pun.

Realm akun berasal dari akun itu sendiri dan dari grup aktif tempat ia bergabung, digabungkan sebagai sebuah
union. Peran (roles) adalah kumpulan nomor realm yang diterapkan dalam satu tindakan. Sebuah peran menuliskan
nomor-nomornya ke akun dan selesai: peran adalah titik awal, bukan tautan dinamis, sehingga akun yang dibuat
dari suatu peran tidak berubah ketika peran tersebut diperbarui.

Plugin menambahkan realm mereka sendiri, disimpan secara terpisah dan dipegang oleh akun persis seperti
realm inti. Oleh karena itu, plugin menghadirkan permukaan baru yang dikontrol aksesnya yang harus ditinjau
secara eksplisit oleh kebijakan Anda. Lihat [Plugin](/id/concepts/plugins/).

## Objek disimpan sebagai default ditambah pengecualian

Empat jenis objek membawa izin: grafik, perangkat, templat grafik, dan pohon.

Untuk setiap jenis, sebuah akun (atau grup) memegang satu kebijakan default dan daftar pengecualian. Suatu
pengecualian adalah satu baris tunggal: siapa, objek mana, jenis apa. Baris tersebut identik di kedua mode
kebijakan. Kebijakanlah yang menentukan apa arti baris tersebut.

Ini adalah keputusan mendasar dalam keseluruhan model. Hanya penyimpangan dari default yang disimpan dalam
tabel pengecualian. Default Izinkan (Allow) tanpa pengecualian dapat memberikan akses kebijakan yang luas
tanpa baris pengecualian; baris akun, default, dan realm tetap ada. Lima perangkat yang diizinkan secara
eksplisit di bawah default perangkat Tolak (Deny) memerlukan lima pengecualian perangkat, meskipun pemberian
izin dan metode grafik lainnya dapat memengaruhi visibilitas. Ke arah mana pun lingkungan cenderung, data
yang disimpan tetap seukuran bagian yang relevan, bukan seukuran seluruh armada perangkat.

## Mengapa kedua mode kebijakan ada

| Mode | Arti | Perilaku saat perangkat ditambahkan |
|---|---|---|
| Izinkan, dengan pengecualian | Objek dari jenis tersebut kecuali pengecualian yang tercantum | Kebijakan perangkat mengizinkan objek baru; pemeriksaan lain tetap berlaku |
| Tolak, dengan pengecualian | Hanya objek yang tercantum dari jenis tersebut | Sumber ini tidak memberikan perangkat baru; sumber lain atau izin grafik dapat mengizinkan akses |

Kebijakan default berbeda dalam cara menangani objek baru. Pilihlah cakupan kebijakan dan perilaku saat
terjadi kegagalan secara cermat; tidak satu pun dari keduanya yang menggambarkan seluruh pemeriksaan akses
dari suatu permintaan.

"Semua orang di tim jaringan, kecuali dua rak milik bagian keuangan" adalah dua baris di bawah Izinkan
dan empat ribu baris di bawah Tolak. "Kontraktor ini, dan hanya lima perangkat ini" adalah lima baris di
bawah Tolak dan empat ribu baris di bawah Izinkan. Memaksakan satu mode saja berarti separuh dari semua
kebijakan nyata hanya dapat ditulis dengan mendaftarkan seluruh armada, dan daftar sepanjang itu tidak
akan pernah terpelihara.

Default Izinkan mencakup objek yang baru ditambahkan dari jenisnya kecuali jika dikecualikan. Default Tolak
memerlukan pengecualian eksplisit dari sumber tersebut. Ini adalah aturan semantik kebijakan default, bukan
jaminan penanganan kesalahan. Tinjau pengguna/grup lain dan metode izin grafik sebelum menyimpulkan bahwa
default Tolak pada perangkat menyembunyikan grafiknya.

## Akses adalah gabungan, dan tidak ada penolakan

Akses efektif dievaluasi untuk kebijakan akun itu sendiri dan untuk setiap grup aktif tempat ia bergabung.
Untuk akses grafik, terapkan metode grafik yang dipilih dalam setiap sumber terlebih dahulu, lalu gabungkan
hasilnya. Di bawah metode Restriktif, izin perangkat dalam satu grup dan izin templat dalam grup lain tidak
membentuk pasangan yang disyaratkan.

Tidak ada penolakan grup yang mengesampingkan pemberian izin dari sumber lain. Pengecualian di bawah default
Izinkan hanya menghapus kontribusi dari sumber tersebut; ini bukan penolakan global. Menghapus pengecualian
tersebut memperluas akses, tidak seperti menghapus izin di bawah Tolak. Ini adalah penyederhanaan yang
disengaja: model dengan izin dan penolakan memerlukan aturan prioritas, dan aturan prioritas membuat sistem
izin mustahil diaudit hanya dengan membacanya.

Konsekuensinya patut dinyatakan dengan jelas.

Mencabut akses berarti menghapusnya dari akun dan dari setiap grup yang memberikannya. Menghapusnya di satu
tempat tidak berpengaruh jika tempat lain masih memberikannya.

Menonaktifkan grup akan menghapus izinnya dari setiap anggota sekaligus, menjadikan grup sebagai sarana
pencabutan yang jauh lebih baik daripada rentetan pengeditan individual.

Anda tidak dapat menjawab "apa yang dapat dilihat akun ini?" hanya dengan melihat satu baris. Anda harus
menggabungkan empat kebijakan dan empat daftar milik akun dengan data serupa dari setiap grup.

## Mengapa izin grafik memiliki empat metode

Grafik memiliki tiga identitas. Grafik adalah dirinya sendiri, milik sebuah perangkat, dan dibangun dari
sebuah templat grafik. Ketiganya dapat membawa izin, sehingga model harus memutuskan kombinasi mana yang
berlaku. Keputusan tersebut adalah satu pengaturan untuk seluruh instalasi.

| Metode | Pertanyaan yang diajukan | Kumpulan pengecualian yang dikonsultasikan |
|---|---|---|
| Permisif | Apakah salah satu dari ketiganya diizinkan? | Tiga |
| Restriktif | Apakah grafik diizinkan, atau apakah perangkat dan templat keduanya diizinkan dalam satu sumber? | Tiga |
| Berbasis perangkat | Apakah grafik atau perangkat diizinkan? | Dua |
| Berbasis templat grafik | Apakah grafik atau templat diizinkan? | Dua |

Aturan-aturan ini menggambarkan pemeriksaan otorisasi yang diimplementasikan. Pemberian izin grafik langsung
tetap berlaku di keempat metode; memilih Berbasis perangkat tidak membatalkannya. Ukur performa dengan
kebijakan dan armada nyata alih-alih berasumsi bahwa jumlah kumpulan pengecualian dapat memprediksi biaya kueri.

Permisif adalah default, dan merupakan pengaturan yang kerap mengejutkan para administrator. Di bawah mode
permisif, mengizinkan sebuah templat grafik akan mengizinkan setiap grafik yang dibangun darinya, di setiap
perangkat, termasuk perangkat yang tidak pernah diberikan hak aksesnya kepada akun tersebut. Model bekerja
persis seperti yang didokumentasikan. Hanya saja, deskripsi tersebut sering kali berbeda dari intuisi kebanyakan orang.

## Izin dikompilasi ke dalam kueri

Penyaringan izin daftar grafik dimasukkan langsung ke dalam kueri database. Halaman yang menampilkan dua puluh
dari empat ribu grafik tidak dapat mengambil empat ribu baris lalu membuang baris yang tidak boleh dilihat
oleh akun, karena perhitungan total akan salah, batas halaman akan rusak, dan beban kerja akan meningkat
seiring ukuran armada alih-alih ukuran halaman.

Oleh karena itu, kebijakan dan daftar pengecualian diubah menjadi klausul join dan where yang diserahkan
ke database. Model izin dirancang sebagian agar mampu bertahan dalam penerjemahan tersebut. Kumpulan ID dan
flag default dapat dikompilasi dengan mulus ke dalam SQL. Logika per objek yang arbitrer tidak dapat melakukannya.

Jalur grafik memiliki pintasan untuk izin grafik yang luas, termasuk default Izinkan grafik milik pengguna
tanpa pengecualian grafik. Jangan menggeneralisasikannya ke setiap jenis objek atau setiap rute. Pemeriksaan
realm, status akun, dan tampilan tetap memerlukan verifikasi; optimalisasi kueri izin bukanlah pengganti
pengujian akses.

## Pohon adalah sumbu terpisah

Izin pohon dan izin grafik diperiksa secara independen. Diberikan akses ke suatu pohon tidak memberikan akses
ke isinya. Memiliki izin atas suatu grafik tidak mengharuskan memiliki akses ke suatu pohon.

Pohon adalah presentasi objek, bukan kontainer yang memiliki objek tersebut. Grafik yang sama dapat muncul
di lima pohon berbeda. Jika pohon memberikan hak atas isinya, maka mengedit pohon sama dengan mengedit izin,
dan siapa pun yang diizinkan mengatur grafik akan diizinkan memublikasikannya.

Apa yang dilakukan pohon adalah menyembunyikan cabang yang kosong. Suatu cabang ditampilkan jika memuat
sesuatu yang boleh dilihat oleh akun, dan pemeriksaan dilakukan secara rekursif: cabang yang semua subcabangnya
kosong untuk akun ini akan disembunyikan. Dua orang yang membuka pohon yang sama akan melihat struktur yang
berbeda, dan tidak ada yang melihat placeholder yang mengisyaratkan apa yang dimiliki pihak lain.

Pemeriksaan kekosongan tersebut memerlukan sumber daya komputasi. Pemeriksaan menelusuri cabang dan mengajukan
pertanyaan grafik dan perangkat secara rekursif untuk apa yang ditemukannya. Pohon yang dalam digabungkan
dengan metode izin grafik yang mahal berinteraksi dengan buruk, yang merupakan alasan lain mengapa metode
yang lebih sederhana ada.

Konsekuensi audit lebih penting daripada konsekuensi performa. **Tampilan pohon bukanlah laporan tentang apa
yang dapat diakses oleh suatu akun.** Tampilan tersebut adalah laporan tentang apa yang dapat diakses oleh
suatu akun *dan telah ditempatkan seseorang di pohon tersebut*. Untuk mengaudit akses, periksa kebijakan dan
verifikasi permintaan yang diizinkan dan ditolak secara nyata. Tampilan Kebijakan Efektif berasal dari
implementasi yang terpisah dari pemeriksaan otorisasi, sehingga label dan tooltip-nya tidak boleh menjadi
satu-satunya bukti. Lihat [Audit siapa yang dapat melihat apa](/id/guides/audit-who-can-see-what/).

## Caching, dan mengapa perubahan berlaku pada saat-saat tak terduga

Jawaban izin di-cache di dalam sesi, karena alternatifnya adalah mengajukan pertanyaan yang sama pada setiap
halaman. Perubahan yang dilakukan administrator menandai jawaban cache akun yang terpengaruh sebagai basi,
dan halaman berikutnya yang dimuat oleh akun tersebut akan membangunnya kembali alih-alih menunggu login baru.

Menonaktifkan akun akan menghapus kredensial login persisten, izin yang di-cache, dan sesi sisi server.
Permintaan yang dilindungi juga memeriksa status aktif/terkunci; halaman yang sudah dimuat di browser tidak
dihapus seketika. Rute yang mendukung tamu dapat menyelesaikan identitas tamu terpisah saat dikonfigurasi,
sehingga respons yang berhasil saja tidak membuktikan bahwa akun yang dinonaktifkan tetap memiliki akses.

Verifikasi perubahan menggunakan sesi yang ada maupun sesi baru, periksa akses yang dipertahankan serta yang
dicabut, dan catat konten serta identitas respons. Jangan gunakan status HTTP saja sebagai bukti otorisasi,
atau berasumsi bahwa setiap konsumen cache memperbarui datanya secara identik.
