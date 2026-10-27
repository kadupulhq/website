---
title: "Mengapa fork ini ada"
description: "Prioritas pengembangan independen dan kriteria penerimaan migrasi untuk 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul masih pra-alfa. Validasi prosedur pada instalasi uji terisolasi. Draf terjemahan menunggu tinjauan bahasa."
---

Kadupul adalah fork Cacti independen dengan keputusan pengembangan, rilis, dan dukungan sendiri. Prioritas berikut memandu perencanaan 2026–2027; bukan tanggal pengiriman atau bukti kesiapan produksi.

## Prioritas pengembangan

Cabang aplikasi `main` memerlukan PHP 8.4+ dan menggabungkan layanan Symfony 7.4 dengan jalur web, poller, dan CLI lama. Jalur pemeliharaan `lts/1.2` memiliki persyaratan terpisah. Migrasi bertujuan memperjelas batas kasus penggunaan, otorisasi, penanganan kegagalan, dan verifikasi sambil mempertahankan kontrak pengumpulan serta grafik yang diperlukan. Layanan modern atau rangkaian tes yang lulus tidak membuktikan seluruh alur sudah dimigrasi. Lihat arsitektur.

## Kompatibilitas dan migrasi

Mempertahankan plugin, templat, skema, dan riwayat RRD merupakan sasaran rilis yang membutuhkan bukti per versi. Setiap migrasi harus menetapkan jalur tulis aktif, mempertahankan perbaikan pemeliharaan yang berlaku, dan memperhitungkan pekerjaan mengantre atau berjalan. Latih instalasi, pemulihan, dan perubahan skema pada salinan terisolasi dengan cadangan konsisten. Saat ini tidak ada jalur migrasi produksi tervalidasi. Lihat kompatibilitas dan status.

Prioritas ini menjelaskan Kadupul, bukan rencana proyek lain atau kesepakatan dengan pemeliharanya. Kadupul tidak berafiliasi dengan atau mendapat dukungan resmi dari The Cacti Group.

[Arsitektur](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Kompatibilitas](/id/project/compatibility-with-cacti/) · [Status](/id/project/status/)

Dasar aplikasi diperiksa pada 26 Oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
