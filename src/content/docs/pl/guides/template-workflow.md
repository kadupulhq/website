---
title: "Używanie i weryfikacja szablonów"
description: "Wybierz tożsamości, sprawdź podgląd importu i propagację bez utraty historii RRD."
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekuje na weryfikację językową."
---

## Wybierz właściwe definicje

Szablony urządzeń oferują szablony wykresów i zapytania o dane; szablony danych określają wejścia pomiarów i przechowywanie. Powiel podobny szablon, gdy potrzebujesz osobnej tożsamości, i sprawdź współdzielone zależności. Kopia nie uniezależnia każdego powiązanego wejścia czy profilu. Przed zmianą używanych definicji zachowaj eksport i spójny zestaw kopii bazy i RRD. Zobacz pojęcia szablonów.

## Podgląd, potem świadome zastosowanie

W odizolowanej instalacji sprawdź pochodzenie XML, docelowe tożsamości i wybrany profil przechowywania. W katalogu aplikacji uruchom podgląd zwykłego XML szablonu:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

Obecny `main` zwraca niezerowy status dla nieczytelnego wejścia, błędnego XML i zarejestrowanych błędów obiektów. Sprawdź też diagnostykę i wyniki obiektów; import może aktualizować istniejące tożsamości. Import pakietów ma odrębną ścieżkę zapisu plików. Zobacz import i eksport.

## Sprawdź obiekty pochodne i historię

Po zastosowaniu sprawdź reprezentatywne urządzenia, lokalne mapowania elementów wykresów, nadpisania i zebrane wartości. Zmiany powiązań szablonów urządzeń wymagają osobnej synchronizacji. Zapis szablonu danych nie zmienia struktury istniejących RRD; sprawdź rzeczywisty plik przed zmianą kroku, heartbeat lub retencji. Zatrzymaj procesy zapisujące przed skoordynowanym odtwarzaniem i w razie potrzeby przywróć spójny zestaw kopii. Zobacz własne szablony i retencję.

[Pojęcia szablonów](/pl/concepts/templates/) · [Import i eksport](/pl/guides/import-and-export-templates/) · [Własne szablony](/pl/guides/create-custom-templates/) · [Retencja](/pl/guides/manage-data-retention/)

Podstawę aplikacji sprawdzono 26 października 2026 r.: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
