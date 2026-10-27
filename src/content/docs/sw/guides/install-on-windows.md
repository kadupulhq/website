---
title: "Kusakinisha kutoka mwenyeji wa Windows"
description: "Tathmini Kadupul kwenye Linux ndani ya Windows na uelewe vizuizi vya Windows asilia."
banner:
  content: "Kadupul iko kabla ya alfa. Utaratibu huu wa jukwaa haujathibitishwa kutoka mwanzo hadi mwisho. Rasimu ya tafsiri inasubiri ukaguzi wa lugha."
---

## Chagua mazingira ya utekelezaji

`main` ya sasa inahitaji PHP 8.4+, `pcntl` na `posix`; PHP asilia ya Windows haiwezi kutimiza mahitaji hayo ya Unix. Usipite ukaguzi wa jukwaa wa Composer. Tumia mashine pepe ya Linux, au tathmini WSL 2 kwenye toleo la Windows linaloungwa mkono na Microsoft. Haya ni masakinisho ya Linux yanayohostiwa na Windows, si uwekaji asilia wa IIS uliothibitishwa. Soma mipaka ya PHP.

## Andaa Linux, kisha sakinisha

Kwa WSL, endesha hivi kwenye PowerShell ya msimamizi na uwashe upya ukiombwa:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Thibitisha toleo 2. Kamilisha akaunti ya Linux, kisha fuata usakinishaji ndani ya Linux kwa hifadhidata, viendelezi vya PHP, rasilimali, seva ya wavuti na kipangaji. Weka msimbo na RRD kwenye mfumo wa faili wa Linux, si chini ya `/mnt/c/`. Soma miongozo ya Microsoft ya WSL na mifumo ya faili.

## Kagua mzunguko wa maisha na urejeshaji

Tumia akaunti maalumu zisizo na haki za juu na kianzishaji kimoja cha ukusanyaji. Thibitisha uaminifu wa hifadhi, ukusanyaji, mihuri ya muda ya grafu na kuanza tena baada ya kuwasha mwenyeji upya au kuzima WSL. Usidhani kipindi cha eneo-kazi kinaendeleza ukusanyaji. Hifadhi nakala ya hifadhidata, usanidi na RRD pamoja. Matengenezo yanayoweza kuharibu RRD na ufutaji/uhifadhi wa ndani wa kiotomatiki bado hayapatikani kwenye Windows asilia; tabia ya Linux haiyathibitishi. Soma mahitaji na nakala rudufu.

[Mipaka ya PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Usakinishaji](/sw/start/install/) · [Mwongozo wa Microsoft WSL](https://learn.microsoft.com/en-us/windows/wsl/install) · [Mifumo ya faili](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Mahitaji](/sw/reference/requirements/) · [Nakala rudufu](/sw/guides/back-up-and-restore/)

Msingi wa programu umekaguliwa tarehe 26 Oktoba 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
