---
title: "Czym jest Kadupul"
description: "Odpytuj urządzenia przez SNMP i skrypty, zapisuj pomiary w plikach RRD i twórz wykresy."
banner:
  content: "Kadupul jest w fazie pre-alpha. Kod jest dostępny, ale nie ma wspieranego wydania produkcyjnego ani zweryfikowanej ścieżki migracji. Nie używaj go w środowisku produkcyjnym."
---

Kadupul to niezależny fork Cacti. Regularnie odpytuje urządzenia i używa RRDtool do przechowywania oraz prezentowania pomiarów.

Ta strona jest podsumowaniem. Szczegóły znajdziesz na pełnej stronie w języku angielskim. [English](/start/what-kadupul-is/)

## Czym jest Kadupul

PHP zapewnia interfejs i instalator. MySQL lub MariaDB przechowuje konfigurację, użytkowników i pamięć podręczną kolektora. Pliki RRD zachowują pomiary zgodnie ze skonfigurowanymi okresami retencji i zasadami konsolidacji, a nie wszystkie dane na zawsze. Skrypty zbierające dane działają z uprawnieniami swojego konta systemowego.

## Pierwsze kroki

Zacznij od odizolowanej instalacji testowej, dodaj urządzenie i sprawdź, czy dane napływają, zanim zaczniesz czytać wykresy. Zachowuj kopie zapasowe i testuj odtwarzanie.

- [Instalacja](/pl/start/install/)
- [Dodaj pierwsze urządzenie](/pl/start/first-device/)
- [Odczytaj pierwszy wykres](/pl/start/first-graph/)
