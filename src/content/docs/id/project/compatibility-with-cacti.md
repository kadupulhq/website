---
title: "Kompatibilitas dengan Cacti"
description: "Cakupan, bukti verifikasi, dan batas kompatibilitas untuk perencanaan 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul masih pra-alfa. Validasi prosedur pada instalasi uji terisolasi. Draf terjemahan menunggu tinjauan bahasa."
---

Kompatibilitas merupakan sasaran rilis, bukan klaim bahwa semua versi, plugin, atau templat Cacti bekerja tanpa perubahan. Kadupul tetap pra-alfa. Evaluasi revisi sumber yang tepat dan komponen yang digunakan sebelum mengandalkan perilakunya.

## Apa yang dicakup

Periksa hook plugin, perilaku argumen/hasil, dan izin; identitas templat, pemetaan input, serta propagasi; semantik skema, nilai bawaan, dan referensi; serta jalur RRD yang ada, bidang, arsip, dan nilai tersimpan. Profil basis data yang cocok tidak membuktikan tata letak berkas RRD sama. Plugin berjalan sebagai kode aplikasi tepercaya, bukan dalam sandbox. Lihat templat dan evaluasi plugin.

## Maknanya dalam praktik

Catat cabang/revisi aplikasi, PHP dan dependensi terkunci, versi plugin, keadaan skema, serta konfigurasi penyimpanan. Uji pengumpulan, rendering grafik, otorisasi, kegagalan, dan pemulihan pada salinan hasil pemulihan yang terisolasi. Sertakan kolektor jarak jauh dan pekerjaan latar belakang bila digunakan. Dokumentasikan perbedaan yang disengaja dan celah tersisa; tes hanya mencakup jalur yang dijalankan. Lihat latihan peningkatan dan pencadangan.

## Apa yang tidak dijamin

Tidak ada jaminan menyeluruh untuk kompatibilitas biner, skema, atau plugin, tidak ada rilis produksi yang didukung, dan tidak ada jalur migrasi produksi tervalidasi. Mengembalikan kode saja tidak membatalkan perubahan skema atau RRD; pemulihan mungkin memerlukan set cadangan yang cocok. Gunakan sumber proyek yang dipelihara dan catat asalnya, alih-alih menganggap arsip proyek lain membentuk bundel Kadupul teruji. Kadupul tidak berafiliasi dengan atau mendapat dukungan resmi dari The Cacti Group. Lihat status.

[Templat](/id/concepts/templates/) · [Evaluasi plugin](/id/guides/install-and-vet-plugins/) · [Latihan peningkatan](/id/guides/upgrade-safely/) · [Cadangan](/id/guides/back-up-and-restore/) · [Status](/id/project/status/)

Dasar aplikasi diperiksa pada 26 Oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
