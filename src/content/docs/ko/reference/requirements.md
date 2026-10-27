---
title: "요구 사항"
description: "2026–2027년 계획을 위한 실행 환경, 저장소 및 배포 요구 사항입니다."
sidebar:
  order: 1
banner:
  content: "Kadupul은 프리알파 단계입니다. 격리된 테스트 설치에서 절차를 검증하세요. 이 번역은 초안이며 해당 언어에 능숙한 검토자의 검토가 필요합니다."
---

2026년 10월 26일 아래 애플리케이션 리비전을 기준으로 확인했습니다. 2026–2027년 계획을 위한 기준이며 릴리스 또는 지원 약속이 아닙니다.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## 실행 환경

`main`은 PHP 8.4 이상을 요구하며 Symfony 7.4와 기존 진입점을 함께 사용합니다. `lts/1.2` 계열의 요구 사항은 별도입니다. MySQL 또는 MariaDB, RRDtool, PHP 수집기 또는 호환되는 Spine 빌드를 설치하세요. 소스 빌드에서는 `mise exec`를 통해 `mise.toml`의 버전을 사용하고, 종속성을 업데이트하지 말고 잠금 파일에 지정된 버전으로 설치하세요.

## PHP

매니페스트는 PHP 외에 다음 확장을 요구합니다.

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

설치 프로그램은 `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard`, `zlib` 등을 별도로 확인합니다. Unix에서는 `posix`와 CLI용 `pcntl`을, Windows에서는 `com_dotnet`을 확인합니다. 설치 프로그램을 통과해도 Composer 요구 사항 충족이 입증되지는 않습니다. CLI PHP와 웹 PHP를 각각 확인하세요. `date.timezone`을 설정하세요. 설치 프로그램은 `memory_limit=400M`과 `max_execution_time=60` 또는 무제한 값을 권장합니다. 선택적 `snmp` 확장은 프로세스 내부 질의를, `gettext`는 번역 카탈로그를 활성화합니다.

## 데이터베이스

공급업체가 유지 관리하는 MySQL 또는 MariaDB 릴리스를 사용하고 대상 리비전에서 검증하세요. 설치 프로그램의 오래된 MySQL 5.6 및 MariaDB 10.0 기준은 2026–2027년 지원을 입증하지 않습니다. 현재 `main`의 `poller_output`, `poller_output_boost`, `poller_output_realtime`은 InnoDB를 사용하지만 일부 조정용 테이블은 여전히 MEMORY를 사용합니다. 모든 테이블을 하나의 엔진으로 변환하지 마세요. `mysql.time_zone_name`을 채우고 애플리케이션 계정에 해당 테이블의 SELECT 권한을 부여하세요.

## RRDtool

실행 파일의 절대 경로를 설정하고 설정된 버전을 설치된 바이너리와 일치시키세요. `DCOUNTER`와 `DDERIVE`는 RRDtool 1.5 이상을 요구합니다. Unix 로컬 저장소에는 POSIX 신원 확인과 정상적으로 작동하는 디렉터리 `flock`이 필요합니다. 독점 유지 관리 전에 외부 쓰기 프로세스와 캐시 데몬을 중지하세요. 기존 프록시 경로는 존재하지만 검증된 배포를 보장하지 않습니다.

## net-snmp

PHP `snmp`가 없거나 비활성화된 경우 Net-SNMP 도구를 설치하세요. `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk`, `path_snmptrap`에 해당 실행 파일의 경로를 설정하세요. 장치의 SNMP 버전으로 선택한 경로를 테스트하고, 해당하는 경우 IPv6를 통한 SNMPv3도 확인하세요. 기존 설치 프로그램은 이 조합에서 PHP `snmp` 사용을 권장하지 않습니다.

## 웹 서버

설정된 웹 실행 환경을 통해 PHP를 실행하고 TLS를 사용하세요. `/app.php/...`와 함께 기존 경로를 유지하세요. 기존 페이지가 남아 있는 동안 전체 문서 루트를 `public/`으로 변경하지 마세요. 호환 진입점에는 PATH_INFO를 설정하세요. Nginx는 `.htaccess`를 무시합니다. PHP 처리보다 먼저 소스, 설정, 종속성, 도구, 테스트, 비밀 정보, 실행 상태에 대한 명시적 접근 거부 규칙을 적용하세요. URL 접두사는 `$url_path`와 일치해야 합니다.

## 스케줄러

cron, 작업 스케줄러, 제공되는 수집기 데몬 서비스 중 하나만 사용하세요. 실행 주기를 설정된 시작 간격에 맞추세요. 1분 미만 간격의 수집은 해당 간격 안에서 실행되며 cron만으로는 이런 주기를 제공할 수 없습니다. 중복 실행을 피하려면 정기 시작 기능을 중지한 뒤 폴러 계정으로 점검하세요.

## 파일 시스템

실제 RRD 경로, 로그, 캐시, Symfony 실행 디렉터리는 필요한 계정에만 접근을 허용하세요. 기본 RRD 디렉터리는 `rra/`입니다. Unix 웹 계정과 폴러 계정을 분리하면 `include/config.php`의 `rrd_maintenance_trusted_uids`에 숫자 ID를 명시해야 하며, 쓰기 가능한 그룹은 `rrd_maintenance_trusted_gids`에도 지정해야 합니다. 지정된 그룹의 모든 구성원을 신뢰할 수 있어야 합니다. 일반 권한도 여전히 적용되며 누구나 쓸 수 있는 저장소는 거부됩니다. 모든 쓰기 프로세스에 동일한 신뢰 설정을 사용하고 업그레이드 전에 두 계정을 모두 확인하세요.

## 권한

웹 프로세스와 폴러를 전용 비특권 계정으로 실행하세요. 원시 ICMP에는 추가 운영 체제 권한이 필요합니다. 해당 권한이 없으면 TCP, UDP 또는 SNMP 검사를 사용하세요. ping을 활성화하려고 전체 애플리케이션을 root로 실행하지 마세요. Windows에는 로컬 RRD의 파괴적 유지 관리에 필요한 ACL 검증이 없습니다. 일반 업데이트는 RRDtool의 동기 확인 응답을 사용합니다. Unix 처리량 증거로 Windows 용량을 검증할 수는 없습니다.

## PHP 버전에 관하여

2026–2027년 계획에서 PHP 8.4는 2026년 12월 31일까지 활성 지원을, 2028년 12월 31일까지 보안 수정을 받습니다. PHP 8.5는 각각 2027년 12월 31일과 2029년 12월 31일까지입니다. 이는 PHP 프로젝트의 일정이며 Kadupul 호환성 표가 아닙니다. 새 실행 환경을 도입하기 전에 잠긴 종속성으로 테스트하세요. Symfony 자체의 낮은 PHP 최소 요구 사항이 Kadupul의 최소 버전 8.4를 낮추지는 않습니다. 배포 전에 공식 일정과 대상 리비전을 다시 확인하세요.

[데이터베이스 튜닝](/ko/guides/tune-database-performance/) · [RRDtool 통합](/ko/reference/rrdtool-integration/) · [SNMP](/ko/reference/snmp/) · [파일 구조](/ko/reference/file-layout/) · [설치](/ko/start/install/) · [저장소 업그레이드 사전 요구 사항](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [지원되는 PHP 버전](https://www.php.net/supported-versions.php)
