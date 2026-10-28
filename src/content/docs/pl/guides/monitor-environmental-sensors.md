---
title: Monitorowanie czujników środowiskowych
description: Przedstawiaj na wykresach temperaturę, wilgotność, przepływ powietrza, moc i stan zasilacza UPS przez SNMP, znajduj właściwe OID w MIB producenta i stosuj ustawienia wykresów pasujące do pomiaru, a nie licznika.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 23
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich
wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

Temperatura, wilgotność i moc chwilowa to pomiary, zazwyczaj przechowywane jako
`GAUGE`. Skumulowana energia lub sumy zdarzeń mogą wymagać typu licznika (`COUNTER`).
Sprawdź jednostki, tożsamość i semantykę każdego obiektu przed wybraniem szablonu.

Sprawdź, co już jest dostarczane, zanim napiszesz cokolwiek samodzielnie.

## Co zawiera instalacja

W natywnym katalogu zapytań znajdują się tylko cztery definicje zapytań o dane,
i żadna z nich nie dotyczy parametrów środowiskowych.

| Dostarczone zapytanie SNMP | Zakres |
|---|---|
| `interface.xml` | Interfejsy sieciowe |
| `host_disk.xml` | Pamięć masowa Host Resources |
| `net-snmp_disk.xml` | Zadeklarowane partycje UCD |
| `net-snmp_devio.xml` | We/Wy urządzeń blokowych UCD |

Obsługa czujników jest dostarczana dwoma innymi sposobami.

**Zapytania serwera skryptów, dołączone do pakietu urządzenia Net-SNMP.** Zaimportuj
`install/templates/NetSNMP_Device.xml.gz`, aby wdrożyć trzy pliki XML zapytań lmSensors
w `resource/script_server/`. Skrypt pomocniczy
`scripts/ss_netsnmp_lmsensors.php` istnieje również w repozytorium kodu.

| Zapytanie | Tabela |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Skrypt pomocniczy używa kolumn indeksu, nazwy i odczytu. Zapytanie indeksuje według liczbowego
`sensorDevice`; `sensorName` dostarcza nazwę wyświetlaną, którą skrypt skraca do
18 znaków. Nazwy nie gwarantują unikalnej tożsamości czujnika.

Normalna ścieżka `get sensorReading` zwraca wartości surowe: milistopnie dla starszego obiektu
temperatury, miliwolty dla napięcia i obr./min (RPM) dla wentylatorów. Wykres termiczny
stosuje CDEF `Divide by 1000`. Wykres napięcia nie ma CDEF pomimo etykiety Volts,
co stanowi [potwierdzony błąd skalowania](https://github.com/kadupulhq/kadupul/issues/247).

Osobna ścieżka `query sensorReading` skaluje temperaturę i napięcie oraz próbuje
konwersji napięcia ze znakiem przy użyciu niepoprawnej stałej 4294967294. Może również
[zgłosić wyjątek przy niedostępnych odczytach](https://github.com/kadupulhq/kadupul/issues/248).
Nie należy wnioskować o przechowywanych jednostkach na podstawie tych danych wykrywania.

Skrypt nadal używa przestarzałej kolumny temperatury `.2.1.3`. Aktualna wersja upstream
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
wycofuje ten obiekt bez znaku na rzecz kolumny ze znakiem `.2.1.4`; zweryfikuj obsługę
i zachowanie przy ujemnych temperaturach na rzeczywistym agencie przed dostosowaniem szablonu.

**Pakiety urządzeń, dostarczane jako archiwa do zaimportowania.** Kilka z nich zawiera własne
pliki XML zapytań i zapisuje je w katalogach zapytań podczas importu. Te istotne w tym kontekście:

| Pakiet | Co wnosi |
|---|---|
| SNMP UPS | Zapytania o linie wejściowe i wyjściowe UPS-MIB oraz szablony stałych OID dla baterii, czasu podtrzymania, temperatury i alarmów |
| AKCP Device | Zapytania skryptowe dla czujników temperatury, wilgotności, przepływu powietrza i 4-20 mA |
| APC InfraStruXure PDU | Zapytania o statystyki wyłączników i faz |
| APC InfraStruXure InRow CRAC | Zapytania o statystyki jednostek i grup, w tym temperaturę, wilgotność, przepływ powietrza i prędkość wentylatorów |
| BayTech PDU | Zapytanie o gniazda i obwody trójfazowe, z prądem, napięciem, mocą i temperaturą |

Przejrzyj pasujący pakiet przed ręcznym pisaniem zapytania. Postępuj zgodnie z
[Importowanie i eksportowanie szablonów](/pl/guides/import-and-export-templates/), sprawdź wdrożenie plików
i wykrywanie, a następnie jawnie utwórz pożądane wykresy. Obecność pakietu
nie dowodzi kompatybilności urządzenia ani prawidłowego skalowania; wady zasilaczy UPS i
lmSensors opisane poniżej wymagają uwagi.

## Dwie formy, jakie przyjmuje czujnik

W przypadku zbierania danych SNMP należy odróżnić obiekty skalarne od instancji w tabelach indeksowanych.

**Stałe OID.** Jedna wartość skalarna pod jednym adresem, ten sam adres na każdym
urządzeniu tego typu. Temperatura baterii. Całkowita moc wyjściowa. Użyj źródła danych o stałym
OID: żądanie SNMP get wobec dosłownego OID i jedno źródło danych na odczyt.

**Tabela.** Nieznana liczba odczytów wykrywanych na urządzeniu. Sondy w szafach rack,
listwy zasilające, pomiary poszczególnych faz. Użyj zapytania o dane, które przeszukuje tabelę,
poznaje indeks i pozwala wybrać, które wiersze staną się wykresami.

Dostarczony pakiet UPS używa obu podejść. Postępuj zgodnie ze strukturą obiektów MIB: urządzenie
z tylko jedną sondą prądową może nadal udostępniać ją jako wiersz w indeksowanej tabeli.

| Odczyt UPS | Forma | OID |
|---|---|---|
| Temperatura baterii | Stałe | `.1.3.6.1.2.1.33.1.2.7.0` |
| Szacowany pozostały czas pracy | Stałe | `.1.3.6.1.2.1.33.1.2.3.0` |
| Czas pracy na baterii | Stałe | `.1.3.6.1.2.1.33.1.2.2.0` |
| Napięcie baterii | Stałe | `.1.3.6.1.2.1.33.1.2.5.0` |
| Aktywne alarmy | Stałe | `.1.3.6.1.2.1.33.1.6.1.0` |
| Napięcie, prąd, moc, częstotliwość wejściowa | Zapytanie | `.1.3.6.1.2.1.33.1.3.3.1` |
| Napięcie, prąd, moc, obciążenie wyjściowe | Zapytanie | `.1.3.6.1.2.1.33.1.4.4.1` |

Każde z tych źródeł danych to `GAUGE`. Żadne nie jest licznikiem. Dostarczone
archiwum szablonów deklaruje 60-sekundowy krok i 600-sekundowy heartbeat, minimum równe
zero i brak maksimum, z wyjątkiem temperatury, która nie ma minimum. Sprawdź zaimportowany
profil i rzeczywistą konfigurację RRD; deklaracje te nie przesądzają o rzeczywistej częstotliwości odpytywania.
Prawidłowy ujemny odczyt wymaga również osi wykresu, która go wyświetli.

## Znajdź identyfikatory OID

Przeszukaj urządzenie przed napisaniem czegokolwiek. Szukasz trzech rzeczy:
tabeli odczytów, równoległej tabeli etykiet oraz mnożnika wybranego przez
producenta, a także obiektów poprawności/stanu, jeśli są dostępne.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Zastąp przykładowy host i community string wartościami ze swojej konfiguracji i wykonaj próby z poziomu pollera.
Załaduj odpowiedni MIB wraz z zależnościami, aby sprawdzić nazwy, jednostki i semantykę;
dokumentacja producenta również wyjaśnia numeryczne OID. Wartość progowa
lub kod stanu w sąsiedztwie nie są równoważne pomiarowi.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

To w definicji MIB udokumentowane jest skalowanie. Producent raportujący
dziesiąte części stopnia określi to w opisie obiektu lub klauzuli jednostek oraz
w dołączonej dokumentacji. Zgadywanie na podstawie jednego odczytu może zamienić 23,5 stopnia
w wykres o wartości 235.

Standardowe MIB obejmują więcej, niż można by przypuszczać. UPS-MIB pod `.1.3.6.1.2.1.33` jest
uniwersalna dla różnych producentów. ENTITY-SENSOR-MIB podaje wartość czujnika wraz z
własnymi polami skali i precyzji. Sprawdź je przed sięgnięciem po gałąź producenta.

Porównaj wyniki wykrywania po restartach i zmianach sond w instalacji testowej.
Dwa niezmienione przejścia nie dowodzą stabilności indeksu. Zapisz stabilne
tożsamości czujników, jeśli są dostępne, przed utworzeniem długoterminowych wykresów.

## Zbuduj źródło danych o stałym OID

Czujnik o stałym OID wymaga szablonu danych wykorzystującego wejście SNMP get, z
OID jako wartością dosłowną i jednym elementem źródła danych. Ustaw typ na `GAUGE`,
przypisz wartość rzeczywistą do minimum tylko wtedy, gdy czujnik naprawdę nie może spaść poniżej tej wartości,
i pozostaw maksimum niezdefiniowane, chyba że producent podaje limit górny.

Wartości wykraczające poza granice źródła danych RRD stają się nieznane. Ustaw te granice
w przechowywanych jednostkach surowych, a nie przeliczonych jednostkach wykresu; w przeciwnym razie prawidłowe
odczyty mogą zostać utracone przed zastosowaniem CDEF wyświetlania.

## Zbuduj zapytanie o dane

Zapytanie wymaga OID indeksu, sposobu na przekształcenie każdego przejrzanego OID w indeks oraz jednego
pola na każdą pożądaną kolumnę.

Zapytanie wyjścia UPS to zwięzły przykład praktyczny. Indeksuje tabelę linii,
wyodrębnia indeks z końca każdego zwróconego OID za pomocą wyrażenia regularnego oraz
deklaruje jedno pole wejściowe dla indeksu i cztery pola wyjściowe dla napięcia,
prądu, mocy i obciążenia. Definicje wyjściowe obejmują metodę, źródło, kierunek i
OID kolumny. OID kolumny może być prawidłowym korzeniem przeszukiwania indeksu; zgodność
pomiędzy parserem zapytania a rzeczywiście zwróconymi OID jest sprawą kluczową. Zobacz [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/), aby dowiedzieć się,
jak wybierany i przechowywany jest indeks.

Wybierz metodę ponownego indeksowania w sposób przemyślany. Dostępne opcje to: brak, przy spadku
czasu pracy (uptime), przy zmianie liczby indeksów oraz Weryfikacja wszystkich pól (Verify All Fields). Tabele czujników
to przypadek, w którym słabsze metody zawodzą: odłącz jedną sondę od jednostki w szafie i podłącz
inną, a liczba może się nie zmienić, podczas gdy każdy odczyt za indeksem należy teraz do
innego czujnika. Pełna weryfikacja obciąża SNMP w każdym cyklu.
Sprawdź, które pola tożsamości może zweryfikować zapytanie: niezmienione indeksy liczbowe
lub zduplikowane/skrócone etykiety nie dowodzą, że sonda fizyczna jest tą samą sondą.
Odśwież wykrywanie i przejrzyj powiązania wykresów po każdej wymianie.

## Skaluj wartość

Zdecyduj, gdzie następuje konwersja, i umieść ją tylko w jednym miejscu.

| Gdzie | Kiedy stosować |
|---|---|
| W skrypcie zbierającym | Stosuj udokumentowany kontrakt modułu zbierającego; lmSensors get zwraca obecnie jednostki surowe |
| W CDEF w elemencie wykresu | Warto zachować wartość surową, a wyświetlana jednostka to kwestia prezentacji |

CDEF jest typową odpowiedzią na mnożnik producenta. Dostarczone pakiety zawierają
definicje takie jak `Divide By 10`, zbudowane z bieżącego źródła danych, wartości `10` i
dzielenia. Stosuj je tylko do obiektów z odpowiadającą im jednostką surową.

Pakiet UPS ma [niepoprawne CDEF dla mocy i czasu](https://github.com/kadupulhq/kadupul/issues/249):
jego seria On Battery dzieli sekundy przez 6000 zamiast przez 60, a serie watów wejściowych/wyjściowych
dzielą waty przez 10. W przypadku zgodnego agenta 600 sekund powinno być wyświetlane jako 10 minut, a 1000 watów jako
1000 watów. Napięcie baterii i prąd linii wymagają podziału przez 10; szacowany czas pracy jest już w minutach. Zobacz
[jednostki obiektów UPS w RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Przechowywanie surowego odczytu i dzielenie na wykresie pozwala zachować integralność pliku RRD oraz
umożliwia skorygowanie mnożnika wyświetlania bez przepisywania surowej historii,
o ile próbki mieściły się w granicach źródła danych i retencji. Konwersja po stronie modułu zbierającego
zmienia przechowywaną jednostkę i może prowadzić do utraty precyzji; udokumentuj to. Niewyjaśnione surowe
odczyty nie powinny być przedstawiane jako zweryfikowane jednostki inżynierskie.

Nie stosuj konwersji podwójnie. CDEF na wykresie, którego skrypt już przeskalował
wartość, może dać prawdopodobny, ale całkowicie błędny odczyt.

## Ustawienia wykresu dopasowane do pomiaru

Wybierz ustawienia dla pomiaru zamiast ślepo kopiować wartości domyślne dla ruchu sieciowego.

| Ustawienie | Ruch sieciowy | Czujnik |
|---|---|---|
| Typ źródła danych | `COUNTER` | `GAUGE` |
| Wartość bazowa | 1000, aby oś wskazywała k i M | Nadal 1000, ale przedrostek traci sens przy stopniach |
| Autoskalowanie | Pożądane, ponieważ zakres jest nieznany | Zwykle niepożądane, ponieważ zakres jest znany |
| Górny i dolny limit | Zależą od trybu autoskalowania | Wybierz użyteczny widoczny zakres |

Ustaw jawny dolny i górny limit oraz etykietę pionową określającą rzeczywistą
jednostkę. Dostarczony wykres temperatury UPS tak właśnie robi: dolny limit 0, górny
limit 100 i `C` jako etykieta pionowa.

Opcja autoskalowania to zestaw wyborów, a nie prosty przełącznik. Opcja, z której korzysta
dostarczony wykres temperatury, przekazuje dolny limit z `--alt-autoscale-max`; nie
przekazuje zapisanego górnego limitu 100. Bez sztywnych granic odczyt spoza zakresu
może rozszerzyć przekazany limit. Skonfigurowany limit nie jest automatycznie zablokowany. Wybierz wariant,
który zachowuje granicę, na której Ci zależy:

| Opcja | Efekt |
|---|---|
| Autoskalowanie ignorujące limity | Oba końce pływają. Używaj, gdy nie masz pojęcia o zakresie |
| Autoskalowanie akceptujące dolny limit | Przekazuje dolny limit; maksimum podąża za danymi |
| Autoskalowanie akceptujące górny limit | Przekazuje górny limit; minimum podąża za danymi |
| Autoskalowanie z obydwoma limitami | Przekazuje oba limity; rozszerzenie nadal zależy od trybu sztywnego |

Istnieje również opcja sztywnych granic (rigid boundaries), która zapobiega rozszerzaniu osi, gdy
wartość wykracza poza ustawione limity. Włącz ją, gdy stała oś jest ważniejsza
niż dostrzeżenie anomalii, i pozostaw wyłączoną, gdy tak nie jest, ponieważ sztywny
wykres może uciąć skok poza wyświetlanym zakresem. Nie powoduje to usunięcia zapisanej
próbki. Zobacz [dokumentację limitów wykresów RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

W przypadku stopni lub procentów, gdzie przedrostki SI wprowadzałyby w błąd, rozważ wykładnik jednostki równy 0.
Podstawa 1000 kontroluje kroki przedrostków; sama w sobie nie wyłącza przedrostków ani nie konwertuje jednostek miary.

### Konsolidacja ma tutaj większe znaczenie niż w przypadku ruchu sieciowego

Licznik interfejsu uśredniony w ciągu godziny nadal orientacyjnie mówi o tym, co się wydarzyło.
Temperatura uśredniona w ciągu godziny ukrywa dziesięciominutowy skok, który miał kluczowe znaczenie.
Upewnij się, że profil pamięci masowej dla tych źródeł danych przechowuje archiwum `MAX`,
i skonfiguruj wykreślaną serię tak, aby odczytywała odpowiednią konsolidację `MAX`.
Wartość maksymalna w legendzie obliczona z serii `AVERAGE` nie przywraca pierwotnego szczytu.

Nawet archiwum MAX zachowuje tylko te wartości szczytowe, które znalazły się w pobranych próbkach;
nie odtworzy ono skoku między cyklami odpytywania ani wartości odrzuconych przed zapisaniem. Zobacz
[Zarządzanie retencją danych](/pl/guides/manage-data-retention/) i
[Źródła danych i archiwa](/pl/concepts/data-sources-and-rras/).

## Gdy brakuje użytecznego MIB

Wiele urządzeń środowiskowych komunikuje się przez Modbus, interfejs szeregowy lub API HTTP,
a ich agent SNMP nie udostępnia niczego przydatnego. W takich sytuacjach potrzebne jest wejście danych w postaci skryptu.
Skrypt działa na hoście pollera, a nie na urządzeniu, i połączenie z urządzeniem leży w gestii
skryptu. Zobacz [Napisz skrypt do zbierania danych](/pl/guides/write-a-data-collection-script/), aby poznać
kontrakt wyjściowy.

Zwracaj `U` zamiast `0`, gdy czujnik jest nieosiągalny. Sonda, która przeszła w tryb offline,
to nie sonda wskazująca zero stopni.

## Typowe usterki

| Symptom | Zwykła przyczyna |
|---|---|
| Temperatura na wykresie jest dziesięć lub sto razy za duża | Mnożnik producenta nie został podzielony |
| Temperatura na wykresie jest dziesięć razy za mała | Podzielono dwukrotnie: raz w skrypcie i raz w CDEF |
| Szyna napięciowa wskazuje miliardy | Niepoprawiona liczba całkowita SNMP bez znaku zawierająca wartość ujemną |
| Wykresy czujników stają się płaskie po wymianie sondy | Tabela została przeindeksowana i źródło danych wskazuje na inny czujnik |
| Odczyty powyżej progu pojawiają się jako luki | Ustawiono maksimum w źródle danych i rzeczywiste wartości je przekraczają |
| Oś oznaczona jako k lub M przy odczycie stopni | Wartość bazowa i ustawienia jednostek odziedziczone z szablonu ruchu sieciowego |
| Odchylenie jest niewidoczne w widoku tygodniowym | Sprawdź wybraną konsolidację, zachowaną rozdzielczość, interwał i odrzucone próbki |
| Zapytanie nie zwraca żadnych indeksów | Sprawdź zwrócone OID, dopasowanie parsera, uprawnienia i obsługę; korzeń kolumny może być prawidłowy |
| Zapytania lmSensors nic nie znajdują na hoście Linux | Sprawdź obsługę agenta, dostęp, widoczne wiersze czujników i dokładne błędy SNMP |
