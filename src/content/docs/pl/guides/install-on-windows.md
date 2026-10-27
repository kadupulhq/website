---
title: "Instalacja z hosta Windows"
description: "Oceń Kadupul w systemie Linux na Windows i poznaj blokady natywnego Windows."
banner:
  content: "Kadupul jest w fazie pre-alpha. Tej procedury platformowej nie zweryfikowano od początku do końca. Tłumaczenie robocze oczekuje na weryfikację językową."
---

## Wybierz środowisko wykonania

Obecny `main` wymaga PHP 8.4+, `pcntl` i `posix`; natywny PHP Windows nie spełnia tych wymagań uniksowych. Nie omijaj kontroli platformy Composera. Użyj maszyny wirtualnej Linux lub oceń WSL 2 na wersji Windows wspieranej przez Microsoft. To instalacje Linux na hoście Windows, nie zweryfikowane natywne wdrożenia IIS. Zobacz ograniczenia PHP.

## Przygotuj Linux i zainstaluj

Dla WSL uruchom to w PowerShell administratora i zrestartuj system, jeśli zostaniesz poproszony:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Potwierdź wersję 2. Utwórz konto Linux i wykonaj instalację wewnątrz Linux dla bazy, rozszerzeń PHP, zasobów, serwera WWW i harmonogramu. Kod i RRD trzymaj w systemie plików Linux, poza `/mnt/c/`. Zobacz poradniki Microsoft o WSL i systemach plików.

## Sprawdź cykl życia i odtwarzanie

Używaj dedykowanych kont bez podwyższonych uprawnień i jednego mechanizmu uruchamiania zbierania. Sprawdź zaufanie do pamięci masowej, polling, znaczniki wykresów i uruchamianie po restarcie hosta lub zamknięciu WSL. Nie zakładaj, że sesja pulpitu utrzymuje zbieranie. Wykonuj wspólne kopie bazy, konfiguracji i RRD. Destrukcyjna konserwacja RRD i automatyczne lokalne usuwanie/archiwizowanie pozostają niedostępne w natywnym Windows; działanie Linux ich nie weryfikuje. Zobacz wymagania i kopie zapasowe.

[Ograniczenia PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Instalacja](/pl/start/install/) · [Poradnik WSL Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install) · [Systemy plików](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Wymagania](/pl/reference/requirements/) · [Kopie zapasowe](/pl/guides/back-up-and-restore/)

Podstawę aplikacji sprawdzono 26 października 2026 r.: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
