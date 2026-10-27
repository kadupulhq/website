---
title: "Windows 호스트에서 설치"
description: "Windows에 호스팅된 Linux에서 Kadupul을 평가하고 네이티브 Windows 제한을 이해합니다."
banner:
  content: "Kadupul은 프리알파입니다. 이 플랫폼 절차는 처음부터 끝까지 검증되지 않았습니다. 언어 검토가 필요한 번역 초안입니다."
---

## 실행 환경 선택

현재 `main`은 PHP 8.4+, `pcntl`, `posix`를 요구하며 네이티브 Windows PHP는 이러한 Unix 확장 요구 사항을 충족하지 못합니다. Composer 플랫폼 검사를 우회하지 마세요. Linux VM을 사용하거나 Microsoft 지원 Windows에서 WSL 2를 평가하세요. 이는 Windows가 호스팅하는 Linux 설치이며 검증된 네이티브 IIS 배포가 아닙니다. PHP 플랫폼 제한을 참고하세요.

## Linux 준비 후 설치

WSL에서는 관리자 PowerShell로 다음을 실행하고 요청하면 재부팅하세요.

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

버전 2인지 확인하세요. Linux 계정 설정을 마치고 Linux 안에서 설치 안내에 따라 데이터베이스, PHP 확장, 자산, 웹 서버 및 스케줄러를 구성하세요. 코드와 RRD는 `/mnt/c/` 아래가 아닌 Linux 파일 시스템에 보관하세요. Microsoft의 WSL 및 파일 시스템 안내를 참고하세요.

## 수명 주기와 복구 확인

전용 비특권 계정과 하나의 수집 시작 기능을 사용하세요. 저장소 신뢰, 폴링, 그래프 타임스탬프 및 호스트 재부팅이나 WSL 종료 후 재시작 동작을 검증하세요. 데스크톱 세션이 수집을 계속 유지한다고 가정하지 마세요. 데이터베이스, 설정 및 RRD를 함께 백업하세요. 네이티브 Windows의 파괴적 RRD 유지 관리와 자동 로컬 삭제/보관은 여전히 사용할 수 없으며 Linux 동작이 이를 검증하지는 않습니다. 요구 사항과 백업을 참고하세요.

[PHP 제한](https://www.php.net/manual/en/pcntl.installation.php) · [설치](/ko/start/install/) · [Microsoft WSL 안내](https://learn.microsoft.com/en-us/windows/wsl/install) · [파일 시스템](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [요구 사항](/ko/reference/requirements/) · [백업](/ko/guides/back-up-and-restore/)

2026년 10월 26일 확인한 애플리케이션 기준: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
