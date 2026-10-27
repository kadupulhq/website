---
title: "Fífisílẹ̀ láti ẹ̀rọ Windows"
description: "Dán Kadupul wò nínú Linux lórí Windows, kí o sì mọ ìdènà Windows abinibi."
banner:
  content: "Kadupul ṣì wà ṣáájú alfa. A kò tíì ṣàyẹ̀wò gbogbo ìlànà pẹpẹ yìí láti ìbẹ̀rẹ̀ dé òpin. Àkọ́kọ́ àtúmọ̀ yìí ń dúró de àyẹ̀wò èdè."
---

## Yan àyíká ìṣiṣẹ́

`main` tó wà nísinsìnyí nílò PHP 8.4+, `pcntl` àti `posix`; PHP Windows abinibi kò lè pé àwọn ohun Unix wọ̀nyí. Má ṣe fo àyẹ̀wò pẹpẹ Composer. Lo Linux VM tàbí dán WSL 2 wò lórí ẹ̀dà Windows tí Microsoft ń tì lẹ́yìn. Àgbékalẹ̀ Linux tí Windows gbàlejò ni wọ̀nyí, kì í ṣe IIS abinibi tí a ti ṣàyẹ̀wò. Wo ààlà PHP.

## Pèsè Linux kí o sì fi sílẹ̀

Fún WSL, ṣiṣẹ́ èyí nínú PowerShell alábòójútó, kí o sì tún ẹ̀rọ bẹ̀rẹ̀ bí a bá béèrè:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Jẹ́rìí ẹ̀dà 2. Pari àkọọ́lẹ̀ Linux, kí o sì tẹ̀lé fífisílẹ̀ nínú Linux fún ibùdó dátà, àfikún PHP, ohun èlò, sáfà wẹ́ẹ̀bù àti ètò àkókò. Pa kóòdù àti RRD mọ́ nínú ètò fáìlì Linux, kì í ṣe lábẹ́ `/mnt/c/`. Wo ìtọ́sọ́nà Microsoft fún WSL àti ètò fáìlì.

## Ṣàyẹ̀wò ìyípo iṣẹ́ àti ìmúpadàbọ̀

Lo àkọọ́lẹ̀ pàtó tí kò ní àṣẹ gíga àti ọ̀nà ìbẹ̀rẹ̀ kíkó dátà kan. Ṣàyẹ̀wò ìgbẹ́kẹ̀lé ìpamọ́, polling, àkókò àwòrán àti ìtúnbẹ̀rẹ̀ lẹ́yìn tí host tún bẹ̀rẹ̀ tàbí WSL ti pa. Má ṣe rò pé ìjókòó desktop ń pa kíkó dátà mọ́. Ṣe ẹ̀dà ààbò ibùdó dátà, ìṣètò àti RRD pọ̀. Ìtọ́jú RRD tó lè pa dátà run àti píparẹ́/fífipamọ́ abẹ́lé láìfọwọ́sí ṣì kò sí lórí Windows abinibi; iṣẹ́ Linux kò jẹ́rìí wọn. Wo ohun tí a nílò àti ẹ̀dà ààbò.

[Ààlà PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Fífisílẹ̀](/yo/start/install/) · [Ìtọ́sọ́nà Microsoft WSL](https://learn.microsoft.com/en-us/windows/wsl/install) · [Ètò fáìlì](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Ohun tí a nílò](/yo/reference/requirements/) · [Ẹ̀dà ààbò](/yo/guides/back-up-and-restore/)

A ṣàyẹ̀wò ìpìlẹ̀ ètò ní ọjọ́ 26 Oṣù Kẹwàá 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
