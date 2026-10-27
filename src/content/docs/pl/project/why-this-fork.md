---
title: "Dlaczego istnieje ten fork"
description: "Niezależne priorytety rozwoju i kryteria akceptacji migracji na lata 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź procedury w odizolowanej instalacji testowej. Tłumaczenie robocze czeka na weryfikację językową."
---

Kadupul to niezależny fork Cacti z własnymi decyzjami dotyczącymi rozwoju, wydań i wsparcia. Te priorytety kierują planowaniem na lata 2026–2027; nie są datami dostawy ani dowodami gotowości produkcyjnej.

## Priorytety rozwoju

Gałąź aplikacji `main` wymaga PHP 8.4+ i łączy usługi Symfony 7.4 ze starszymi ścieżkami WWW, pollera i CLI. Linia utrzymaniowa `lts/1.2` ma osobne wymagania. Migracja ma jasno określać granice przypadków użycia, autoryzację, obsługę błędów i weryfikację, zachowując wymagane kontrakty zbierania i wykresów. Nowoczesna usługa lub zaliczone testy nie dowodzą migracji całego przepływu. Zobacz architekturę.

## Zgodność i migracja

Zachowanie wtyczek, szablonów, schematów i historii RRD to cel wydania wymagający dowodów dla konkretnych wersji. Każda migracja musi wskazać aktywną ścieżkę zapisu, zachować odpowiednie poprawki utrzymaniowe i uwzględnić pracę w kolejce lub w toku. Przećwicz instalację, odtwarzanie i zmiany schematu na odizolowanej kopii ze spójnymi kopiami zapasowymi. Obecnie nie ma zweryfikowanej migracji produkcyjnej. Zobacz zgodność i status.

Te priorytety opisują Kadupul, nie plany innego projektu ani umowę z jego opiekunami. Kadupul nie jest powiązany z The Cacti Group ani przez niego zatwierdzony.

[Architektura](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Zgodność](/pl/project/compatibility-with-cacti/) · [Status](/pl/project/status/)

Podstawę aplikacji sprawdzono 26 października 2026 r.: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
