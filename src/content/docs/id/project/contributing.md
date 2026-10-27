---
title: Berkontribusi
description: Kebutuhan proyek, standar rekayasa yang mendasari setiap perubahan, dan tolok ukur penilaiannya.
banner:
  content: Kadupul masih dalam tahap pra-alfa. Kode tersedia, tetapi belum ada rilis yang didukung untuk produksi atau jalur migrasi yang tervalidasi. Jangan gunakan dalam lingkungan produksi.
sidebar:
  order: 6
---

Kode sumber tersedia secara terbuka dan repositori mendokumentasikan proses kontribusi. Baca [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) sebelum memulai. Diskusikan perubahan substansial di pelacak masalah terlebih dahulu.

## Standar dasar

Pastikan setiap pull request tetap terfokus pada satu tujuan. Reproduksi bug sebelum memperbaikinya, verifikasi perilaku yang diubah, dan sertakan perintah validasi beserta hasilnya. Pertahankan antarmuka publik kecuali perubahan tersebut mencakup migrasi yang terdokumentasi.

## Standar rekayasa

Patuhi aturan untuk cabang yang sedang Anda ubah. Periksa panduan kontributor dan konfigurasi CI saat ini daripada mengasumsikan kedua cabang menggunakan aturan yang sama.

### Gaya penulisan kode

Pada cabang `main`, berkas PHP yang diedit mengikuti PHP-FIG PER-CS 2.0. Format ulang setiap berkas yang terpengaruh dalam commit terpisah khusus spasi putih dan periksa dengan `tests/tools/check_php_style.sh`. Cabang `lts/1.2` mempertahankan format hulu bawaan.

### Analisis statis

Jalankan pemeriksaan yang diwajibkan oleh cabang target. Situs ini tidak memaksakan tingkat PHPStan, antarmuka logging, atau migrasi pemuatan otomatis yang belum diadopsi oleh repositori.

### Pengujian

Verifikasi perilaku yang diubah oleh patch. Sertakan kasus regresi untuk perbaikan bug dan tunjukkan perintah yang digunakan. Lolosnya pengujian yang tidak terkait tidak membuktikan kebenaran perbaikan tersebut.

### Dependensi

Jelaskan alasan dependensi diperlukan, periksa lisensinya, dan perbarui manifes serta berkas kunci yang sesuai. Ikuti aturan dependensi dan validasi repositori.

### Commit dan pull request

Gunakan Conventional Commits dan tandatangani setiap commit dengan `git commit -s` di bawah [Developer Certificate of Origin](https://developercertificate.org/). Pisahkan perubahan format dari perubahan perilaku fungsional agar masing-masing dapat ditinjau secara independen.

## Struktur kode warisan belum memenuhi standar ini

Struktur kode masih memuat pola implementasi dan format bawaan lama. Penyesuaian dikendalikan oleh aturan cabang target, bukan melalui penulisan ulang proyek secara membabi buta.

### Aturan mana yang berlaku?

Ikuti `CONTRIBUTING.md` pada cabang target. Pada `main`, aturan PER-CS untuk berkas yang diedit berlaku; pada `lts/1.2`, pertahankan gaya warisan.

## Dokumentasi

Verifikasi pernyataan terhadap implementasi kode dan gunakan materi yang lisensinya mengizinkan pencantuman. Jangan menyalin teks pihak ketiga tanpa memeriksa lisensinya. Laporkan temuan keamanan melalui [proses pelaporan rahasia](/id/project/security/).

## Kompatibilitas

Antarmuka plugin, templat, kompatibilitas basis data, dan data RRD merupakan target rilis. Dokumentasikan setiap perubahan antarmuka dan berikan bukti migrasi serta kompatibilitas. Lihat [Kompatibilitas dengan Cacti](/id/project/compatibility-with-cacti/).
