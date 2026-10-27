---
title: "Shigarwa daga mai masaukin Windows"
description: "Tantance Kadupul a Linux cikin Windows kuma ka gane matsalolin Windows na asali."
banner:
  content: "Kadupul yana kafin alfa. Ba a tabbatar da wannan hanyar dandalin daga farko zuwa ƙarshe ba. Fassarar daftari ce mai jiran dubawar harshe."
---

## Zaɓi yanayin gudanarwa

`main` na yanzu yana buƙatar PHP 8.4+, `pcntl` da `posix`; PHP na asalin Windows ba ya cika waɗannan bukatun Unix. Kada a kauce wa binciken dandali na Composer. Yi amfani da Linux VM ko gwada WSL 2 a sigar Windows da Microsoft ke tallafawa. Waɗannan shigarwar Linux ne a kan Windows, ba ingantattun shigarwar IIS na asali ba. Duba iyakokin PHP.

## Shirya Linux sannan a shigar

Ga WSL, gudanar da wannan a PowerShell na mai gudanarwa sannan a sake kunnawa idan an nema:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Tabbatar da siga 2. Kammala asusun Linux sannan a bi shigarwa a cikin Linux don ma’ajiyar bayanai, ƙarin PHP, albarkatu, sabar yanar gizo da jadawali. Riƙe lamba da RRD a tsarin fayilolin Linux, ba a ƙarƙashin `/mnt/c/` ba. Duba jagororin Microsoft na WSL da tsarin fayiloli.

## Duba zagayen rayuwa da maidowa

Yi amfani da asusu na musamman marasa izinin sama da hanya guda ta fara tattarawa. Tabbatar da amincewar ajiya, polling, lokutan graf da sake farawa bayan kunna host ko rufe WSL. Kada a ɗauka zaman tebur yana ci gaba da tattarawa. Yi kwafin ma’ajiyar bayanai, saituna da RRD tare. Gyaran RRD mai iya lalata bayanai da gogewa/ajiyar gida ta atomatik ba sa samuwa a Windows na asali; aikin Linux ba ya tabbatar da su. Duba bukatu da kwafin ajiya.

[Iyakokin PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Shigarwa](/ha/start/install/) · [Jagorar Microsoft WSL](https://learn.microsoft.com/en-us/windows/wsl/install) · [Tsarin fayiloli](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Bukatu](/ha/reference/requirements/) · [Kwafin ajiya](/ha/guides/back-up-and-restore/)

An duba tushen manhajar a ranar 26 Oktoba 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
