# PHP2Shell (CVE-2026-109618 / CVE-2026-109619) 테스트용 SBOM

- PHP **인터프리터 자체** 취약점 → `composer.lock`으로는 안 잡힘 (composer.lock엔 라이브러리만 있음)
- 그래서 PHP 런타임이 들어간 SBOM으로 테스트
- 수정 버전: 8.2.35 / 8.3.36 / 8.4.27 / 8.5.12 (그 이전 전부 영향, CVSS v4 9.2)

| 파일 | 내용 | 기대 |
|---|---|---|
| php-runtime-8.3.20-vulnerable.cdx.json | php 8.3.20 (CPE 포함) | CVE-2026-109618/109619 탐지 (Grype DB에 반영됐을 때) + 과거 PHP CVE |
| php-runtime-8.3.36-patched.cdx.json | php 8.3.36 | 두 CVE는 안 나와야 함 (전/후 비교용) |
| php-debian12-container.cdx.json | Debian 12 + php8.2 패키지 8.2.7-1~deb12u1 | Debian 보안 데이터 기준 PHP CVE 다수 (두 CVE는 Debian 반영 여부에 따라) |

- 주의: 공개(10/21) 후 며칠밖에 안 돼서 Grype DB(NVD·Debian 데이터)에 아직 없을 수 있음 → 안 나오면 DB 반영 지연
