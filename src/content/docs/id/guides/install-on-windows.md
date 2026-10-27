---
title: "Memasang dari host Windows"
description: "Evaluasi Kadupul dalam Linux di Windows dan pahami penghalang Windows native."
banner:
  content: "Kadupul masih pra-alfa. Prosedur platform ini belum divalidasi dari awal hingga akhir. Draf terjemahan menunggu tinjauan bahasa."
---

## Pilih lingkungan eksekusi

`main` saat ini memerlukan PHP 8.4+, `pcntl`, dan `posix`; PHP Windows native tidak memenuhi persyaratan Unix tersebut. Jangan lewati pemeriksaan platform Composer. Gunakan VM Linux atau evaluasi WSL 2 pada versi Windows yang didukung Microsoft. Ini instalasi Linux pada host Windows, bukan penerapan IIS native tervalidasi. Lihat batas PHP.

## Siapkan Linux lalu instal

Untuk WSL, jalankan ini di PowerShell administrator dan mulai ulang jika diminta:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Pastikan versi 2. Selesaikan pengaturan akun Linux, lalu ikuti instalasi di dalam Linux untuk basis data, ekstensi PHP, aset, server web, dan penjadwal. Simpan kode serta RRD dalam sistem berkas Linux, bukan di `/mnt/c/`. Lihat panduan Microsoft tentang WSL dan sistem berkas.

## Periksa siklus hidup dan pemulihan

Gunakan akun khusus tanpa hak istimewa dan satu peluncur pengumpulan. Verifikasi kepercayaan penyimpanan, polling, waktu grafik, dan perilaku mulai ulang setelah host reboot atau WSL dimatikan. Jangan menganggap sesi desktop menjaga pengumpulan tetap berjalan. Cadangkan basis data, konfigurasi, dan RRD bersama. Pemeliharaan RRD destruktif serta pembersihan/pengarsipan lokal otomatis tetap tidak tersedia pada Windows native; perilaku Linux tidak memvalidasinya. Lihat persyaratan dan cadangan.

[Batas PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Instalasi](/id/start/install/) · [Panduan WSL Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install) · [Sistem berkas](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Persyaratan](/id/reference/requirements/) · [Cadangan](/id/guides/back-up-and-restore/)

Dasar aplikasi diperiksa pada 26 Oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
