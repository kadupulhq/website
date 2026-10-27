---
title: "Menggunakan dan memvalidasi templat"
description: "Pilih identitas, pratinjau impor, dan periksa propagasi tanpa kehilangan riwayat RRD."
banner:
  content: "Kadupul masih pra-alfa. Validasi prosedur di instalasi uji terisolasi. Draf terjemahan menunggu tinjauan bahasa."
---

## Pilih definisi yang tepat

Templat perangkat menawarkan templat grafik dan kueri data; templat data menentukan input pengukuran dan penyimpanan. Duplikasi yang paling mirip saat memerlukan identitas terpisah, lalu periksa dependensi bersama. Duplikasi tidak membuat setiap input atau profil rujukan menjadi mandiri. Simpan ekspor serta cadangan basis data/RRD yang konsisten sebelum mengubah definisi terpakai. Lihat konsep templat.

## Pratinjau lalu terapkan dengan sengaja

Di instalasi terisolasi, periksa sumber XML, identitas tujuan, dan profil penyimpanan terpilih. Dari akar aplikasi, pratinjau XML templat biasa:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

`main` saat ini mengembalikan status bukan nol untuk input tidak terbaca, XML rusak, dan kegagalan objek yang tercatat. Periksa diagnostik dan hasil tiap objek juga; impor dapat memperbarui identitas yang sudah ada. Impor paket memiliki jalur penulisan berkas tersendiri. Lihat impor dan ekspor.

## Periksa objek turunan dan riwayat

Setelah penerapan, periksa perangkat perwakilan, pemetaan item grafik lokal, penggantian individual, dan nilai terkumpul. Perubahan asosiasi templat perangkat memerlukan operasi sinkronisasi terpisah. Menyimpan templat data tidak membentuk ulang RRD yang ada; periksa berkas sebenarnya sebelum mengubah langkah, heartbeat, atau retensi. Hentikan penulis sebelum pemulihan terkoordinasi dan pulihkan set cadangan konsisten bila perlu. Lihat templat khusus dan retensi.

[Konsep templat](/id/concepts/templates/) · [Impor dan ekspor](/id/guides/import-and-export-templates/) · [Templat khusus](/id/guides/create-custom-templates/) · [Retensi](/id/guides/manage-data-retention/)

Dasar aplikasi diperiksa pada 26 Oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
