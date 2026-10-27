---
title: Współtworzenie
description: Czego projekt potrzebuje, standardy inżynieryjne stosowane przy tworzeniu zmian oraz kryteria ich oceny.
banner:
  content: Kadupul jest w fazie pre-alpha. Kod jest dostępny, ale nie ma wspieranego wydania produkcyjnego ani zweryfikowanej ścieżki migracji. Nie używaj go w środowisku produkcyjnym.
sidebar:
  order: 6
---

Kod źródłowy jest dostępny, a repozytorium dokumentuje proces współtworzenia. Przeczytaj [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) przed rozpoczęciem pracy. Wszelkie istotne zmiany omów najpierw w systemie śledzenia zgłoszeń.

## Standard

Każdy pull request powinien skupiać się na jednym celu. Odtwórz błąd przed jego naprawieniem, zweryfikuj zmienione zachowanie oraz dołącz polecenia walidacji i ich wyniki. Zachowaj interfejsy publiczne, chyba że zmiana zawiera udokumentowaną migrację.

## Standardy inżynieryjne

Przestrzegaj zasad obowiązujących w gałęzi, którą modyfikujesz. Sprawdź aktualny przewodnik dla współtwórców oraz konfigurację CI, zamiast zakładać, że obie gałęzie używają tych samych reguł.

### Styl

W gałęzi `main` edytowane pliki PHP muszą być zgodne z PHP-FIG PER-CS 2.0. Każdy zmieniony plik sformatuj w osobnym commicie zawierającym wyłącznie zmiany białych znaków i sprawdź go za pomocą `tests/tools/check_php_style.sh`. Gałąź `lts/1.2` zachowuje formatowanie nadrzędne.

### Analiza statyczna

Uruchom kontrole wymagane przez gałąź docelową. Ta witryna nie narzuca poziomu PHPStan, interfejsu logowania ani migracji autoladowania, których repozytorium nie przyjęło.

### Testy

Zweryfikuj zachowanie zmienione przez łatkę. Dołącz przypadek regresji dla poprawki błędu i wskaż użyte polecenia. Przejście niepowiązanych testów nie potwierdza poprawności poprawki.

### Zależności

Wyjaśnij, dlaczego zależność jest potrzebna, sprawdź jej licencję i zaktualizuj odpowiedni manifest oraz plik blokady. Postępuj zgodnie z zasadami zarządzania zależnościami i walidacji w repozytorium.

### Commity i pull requesty

Używaj Conventional Commits i podpisuj każdy commit za pomocą `git commit -s` zgodnie z [Developer Certificate of Origin](https://developercertificate.org/). Oddziel formatowanie od zmian zachowania, aby każdą część można było sprawdzić niezależnie.

## Odziedziczone drzewo nie spełnia tych standardów

Drzewo zawiera odziedziczone formatowanie i wzorce implementacji. Dostosowanie jest kontrolowane przez reguły gałęzi docelowej, a nie przez globalne przepisanie projektu.

### Która reguła ma pierwszeństwo?

Stosuj `CONTRIBUTING.md` z gałęzi docelowej. W gałęzi `main` obowiązuje reguła PER-CS dla edytowanych plików; w `lts/1.2` zachowaj styl odziedziczony.

## Dokumentacja

Weryfikuj twierdzenia w oparciu o implementację i używaj materiałów, których licencja zezwala na ich włączenie. Nie kopiuj prozy podmiotów trzecich bez sprawdzenia jej licencji. Zgłaszaj ustalenia dotyczące bezpieczeństwa za pośrednictwem [poufnego procesu zgłaszania](/pl/project/security/).

## Kompatybilność

Interfejsy wtyczek, szablony, kompatybilność bazy danych i dane RRD to cele wydań. Udokumentuj każdą zmianę interfejsu i przedstaw dowody dotyczące migracji oraz zgodności. Zobacz [Zgodność z Cacti](/pl/project/compatibility-with-cacti/).
