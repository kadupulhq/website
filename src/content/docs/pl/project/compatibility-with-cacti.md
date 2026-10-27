---
title: "Zgodność z Cacti"
description: "Zakres, dowody weryfikacji i ograniczenia zgodności przy planowaniu na lata 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź procedury w odizolowanej instalacji testowej. Tłumaczenie robocze czeka na weryfikację językową."
---

Zgodność jest celem wydania, nie twierdzeniem, że każda wersja, wtyczka czy szablon Cacti działa bez zmian. Kadupul pozostaje pre-alpha. Oceń dokładną rewizję źródłową i używane komponenty, zanim polegasz na ich zachowaniu.

## Co to obejmuje

Sprawdź hooki wtyczek, argumenty, wartości zwracane i uprawnienia; tożsamości szablonów, mapowania wejść i propagację; semantykę schematów, wartości domyślnych i referencji oraz istniejące ścieżki RRD, pola, archiwa i zachowane wartości. Zgodny profil bazy nie dowodzi identycznego układu pliku RRD. Wtyczki działają jako zaufany kod aplikacji, nie w piaskownicy. Zobacz szablony i ocenę wtyczek.

## Co oznacza w praktyce

Zapisz gałąź i rewizję aplikacji, PHP i zablokowane zależności, wersje wtyczek, stan schematu i konfigurację pamięci masowej. Sprawdź zbieranie, renderowanie wykresów, autoryzację, błędy i odtwarzanie na odizolowanej odtworzonej kopii. Uwzględnij zdalne kolektory i pracę w tle, jeśli są używane. Udokumentuj zamierzone różnice i pozostałe luki; testy pokrywają tylko wykonane ścieżki. Zobacz próbę aktualizacji i kopie zapasowe.

## Czego nie gwarantuje

Nie ma ogólnej gwarancji zgodności binarnej, schematu czy wtyczek, wspieranego wydania produkcyjnego ani zweryfikowanej migracji do produkcji. Cofnięcie samego kodu nie cofa zmian schematu lub RRD; odzyskanie może wymagać spójnego zestawu kopii. Używaj utrzymywanych źródeł projektu i zapisuj pochodzenie zamiast uznawać archiwa innego projektu za przetestowany pakiet Kadupul. Kadupul nie jest powiązany z The Cacti Group ani przez niego zatwierdzony. Zobacz status.

[Szablony](/pl/concepts/templates/) · [Ocena wtyczek](/pl/guides/install-and-vet-plugins/) · [Próba aktualizacji](/pl/guides/upgrade-safely/) · [Kopie zapasowe](/pl/guides/back-up-and-restore/) · [Status](/pl/project/status/)

Podstawę aplikacji sprawdzono 26 października 2026 r.: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
