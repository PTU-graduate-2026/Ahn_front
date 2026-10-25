# 단일 의존성 파일 업로드 테스트

## ok/ — 분석 성공 (구성요소 / 취약점이 나와야 정상)
| 파일 | 들어있는 패키지 | 기대 결과 |
|---|---|---|
| package-lock.json | lodash 4.17.15, minimist 1.2.0 | 취약점 여러 건 |
| yarn.lock | lodash 4.17.15 | 취약점 여러 건 |
| requirements.txt | django 2.2.0, requests 2.19.0 | 취약점 여러 건 |
| requirements-safe.txt | requests 2.32.3 | 취약점 적음(2건 내외), 정책 통과 |
| pom.xml | log4j-core 2.14.1 | Critical (Log4Shell) |
| gradle.lockfile | log4j-api / log4j-core 2.14.1 | Critical |
| go.mod | golang.org/x/text v0.3.0 | 취약점 있음 |
| Cargo.lock | smallvec 1.6.0 | 취약점 있음 |
| log4j-core-2.14.1.jar | log4j-core 2.14.1 (가짜 jar) | Critical |

- 재빌드 직후 첫 업로드는 Grype DB를 받는 중이라 여러 개를 동시에 올리면 일부가 실패할 수 있음 (DB 받은 뒤 다시 올리면 정상)
- 모두 "수정된 ZIP 다운로드" 버튼이 비활성화 + 안내 문구가 떠야 정상

## reject/ — 업로드 단계에서 거절 (알림 메시지 확인)
| 파일 | 기대 메시지 |
|---|---|
| package.json | package-lock.json(또는 yarn.lock)을 올려달라는 안내 |
| build.gradle | gradle.lockfile을 올려달라는 안내 |
| notes.txt | 지원하지 않는 파일 형식입니다 |
