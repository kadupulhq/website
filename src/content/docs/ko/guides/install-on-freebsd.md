---
title: "FreeBSD에 설치"
description: "격리 평가를 위해 FreeBSD 서비스, PHP 확장 및 로컬 저장소를 준비합니다."
banner:
  content: "Kadupul은 프리알파입니다. 이 플랫폼 절차는 처음부터 끝까지 검증되지 않았습니다. 언어 검토가 필요한 번역 초안입니다."
---

## 호스트 선택 및 준비

FreeBSD 지원 릴리스 표의 버전을 사용하고 2027년까지 업그레이드를 계획하세요. OS 지원은 Kadupul 호환성의 증거가 아닙니다. Packages and Ports 안내에 따라 PHP 8.4+, MySQL 또는 MariaDB, RRDtool, Net-SNMP 및 웹 서버를 설치하세요. `php84-extensions` 기본값은 전체 확장 목록이 아닙니다. 종속성 설치 전에 CLI용 `pcntl` 등 부족한 모듈을 설치하세요.

## 실행 환경 확인 및 서비스 설정

선택한 CLI 인터프리터와 도구를 확인하세요.

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

웹 PHP는 별도로 확인하세요. 패키지 PHP-FPM은 `php_fpm` 서비스를 활성화하기 전에 풀과 웹 서버 연결을 설정하세요. FreeBSD는 systemd가 아닌 rc 서비스를 사용하므로 서비스 안내를 따르세요. 데이터베이스, 설정, 스키마 및 브라우저 자산은 설치 안내를 따르세요. 도구 버전을 애플리케이션의 `mise.toml`과 맞추세요. 고정 버전은 mise 실행 환경 설치기가 FreeBSD에서 작동한다는 증거가 아닙니다.

## 서비스 계정으로 예약 및 검증

절대 실행 경로와 설정된 간격의 cron 시작 기능 하나를 사용하고 Linux systemd 유닛은 설치하지 마세요. 수집 전에 각 웹/폴러 계정으로 POSIX 신원, 디렉터리 잠금, 소유권 및 명시적 UID/GID 신뢰를 검증하세요. jail에서는 내부 네트워크, 마운트 및 필요한 권한을 확인하세요. 겹치지 않는 주기를 한 번 실행하고 보존된 큐 행과 그래프 타임스탬프를 검사한 뒤 일관된 백업 복원을 연습하세요. 프로세스 시작 성공만으로는 부족합니다. 요구 사항과 백업을 참고하세요.

[지원되는 FreeBSD 릴리스](https://www.freebsd.org/security/) · [Packages 및 Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [FreeBSD 서비스](https://docs.freebsd.org/en/books/handbook/config/) · [설치](/ko/start/install/) · [요구 사항](/ko/reference/requirements/) · [백업](/ko/guides/back-up-and-restore/)

2026년 10월 26일 확인한 애플리케이션 기준: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
