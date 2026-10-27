---
title: "Instalacja na FreeBSD"
description: "Przygotuj usługi FreeBSD, rozszerzenia PHP i lokalną pamięć do odizolowanej oceny."
banner:
  content: "Kadupul jest w fazie pre-alpha. Tej procedury platformowej nie zweryfikowano od początku do końca. Tłumaczenie robocze oczekuje na weryfikację językową."
---

## Wybierz i przygotuj host

Użyj wydania z tabeli wspieranych wersji FreeBSD i zaplanuj aktualizacje do 2027 r. Wsparcie systemu nie dowodzi zgodności Kadupul. Zainstaluj PHP 8.4+, MySQL lub MariaDB, RRDtool, Net-SNMP i serwer WWW według podręcznika Packages and Ports. Domyślne `php84-extensions` nie obejmuje wszystkich rozszerzeń aplikacji; doinstaluj brakujące moduły, w tym `pcntl` dla CLI, przed zależnościami.

## Sprawdź środowisko i skonfiguruj usługi

Sprawdź wybrany interpreter CLI i narzędzia:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Sprawdź PHP WWW osobno. Dla PHP-FPM z pakietu skonfiguruj pulę i połączenie serwera WWW przed włączeniem `php_fpm`. FreeBSD używa usług rc, nie systemd; skorzystaj z podręcznika usług. Wykonaj instalację bazy, konfiguracji, schematu i zasobów przeglądarki. Dopasuj narzędzia do `mise.toml` aplikacji; przypięte wersje nie dowodzą działania instalatorów środowisk mise na FreeBSD.

## Zaplanuj i sprawdź jako konta usług

Użyj jednego uruchamiacza cron z bezwzględnymi ścieżkami i skonfigurowanym odstępem; nie instaluj jednostki systemd Linux. Przed zbieraniem sprawdź tożsamość POSIX, blokowanie katalogów, własność i jawne zaufanie UID/GID jako każde konto WWW/pollera. W jailach sprawdź sieć, montowania i uprawnienia od wewnątrz. Wykonaj cykl bez nakładania zadań, sprawdź zachowane wiersze kolejki i znaczniki wykresów, potem przećwicz odtworzenie spójnych kopii. Sam start procesu nie wystarczy. Zobacz wymagania i kopie zapasowe.

[Wspierane wersje FreeBSD](https://www.freebsd.org/security/) · [Pakiety i porty](https://docs.freebsd.org/en/books/handbook/ports/) · [Usługi FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Instalacja](/pl/start/install/) · [Wymagania](/pl/reference/requirements/) · [Kopie zapasowe](/pl/guides/back-up-and-restore/)

Podstawę aplikacji sprawdzono 26 października 2026 r.: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
