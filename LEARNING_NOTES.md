# Safelink 프론트엔드 학습 노트

> 면접/포트폴리오용 — "왜 이 기술을 썼고, 어떤 문제를 어떻게 해결했나"를 중심으로 정리.

---

## 0. 프로젝트 개요

**Safelink (Zero Check SBOM)**: SBOM/ZIP 파일을 업로드하면 구성요소(라이브러리)를 식별하고 알려진 취약점(CVE)·라이선스 위험을 시각화해주는 보안 분석 서비스.

**프론트엔드 역할**: 파일 업로드 → 분석 대기 → 결과 시각화(취약점 테이블, 위험도 차트, 정책 판정, PDF 리포트) + 로그인/회원가입/OAuth 처리.

**기술 스택**
- React 18 + TypeScript
- Vite (번들러)
- React Router DOM v7 (라우팅)
- Axios (HTTP 클라이언트)
- Recharts (차트 시각화)
- jsPDF + jspdf-autotable (PDF 생성)
- lucide-react (아이콘)

---

## 1. 프로젝트 구조 설계

```
src/
├── Screens/         # 페이지 단위 컴포넌트 (라우터에 직접 연결되는 것들)
│   ├── LoginScreen/ # 로그인, 회원가입, 비밀번호 재설정, 아이디 찾기
│   ├── IntroduceScreen/  # 소개 페이지 (Topbar, Middle, Bottom으로 분리)
│   ├── FileUploadScreen.tsx
│   ├── ScanLoadingScreen.tsx
│   ├── ScanResultScreen.tsx
│   ├── AnalysisHistoryScreen.tsx
│   └── DashboardScreen.tsx
├── components/      # 재사용 가능한 UI 조각
│   ├── scan/        # 스캔 결과 관련 컴포넌트들
│   │   ├── ScanSummaryCards.tsx   # 요약 카드 (CRITICAL/HIGH/MEDIUM/LOW 개수)
│   │   ├── RiskOverview.tsx       # 위험도 차트
│   │   ├── VulnerabilityTable.tsx # 취약점 목록 테이블
│   │   ├── ComponentTable.tsx     # 구성요소 테이블
│   │   ├── PolicyDecisionPanel.tsx # 정책 판정 (BLOCK/REVIEW/PASS)
│   │   ├── FixPlanPanel.tsx       # 자동수정 계획
│   │   └── PriorityFixes.tsx      # 우선순위 수정 항목
│   └── FileDropInput.tsx          # 드래그&드롭 파일 입력
├── hooks/
│   └── useScanResult.ts  # 스캔 결과 데이터 fetching 커스텀 훅
├── services/_private/    # 백엔드 API 호출 함수
│   ├── ApiConfig.ts      # axios 인스턴스 + BASE_URL 설정
│   ├── SbomApi.ts        # SBOM 관련 API 함수 + 타입 정의
│   ├── Auth/GoogleAuthApi.ts
│   ├── Login/LoginApi.ts
│   ├── SignUp/SignUpApi.ts
│   ├── PasswordReset/PasswordResetApi.ts
│   └── FindId/FindIdApi.ts
├── navigation/
│   ├── Router.tsx        # 라우트 정의
│   └── ProtectedRoute.tsx # 인증 게이트 (비로그인 시 /login으로 리다이렉트)
└── utils/
    ├── currentUser.ts    # localStorage 기반 로그인 상태 관리
    ├── scanResultUtils.ts # 스캔 결과 가공 유틸
    └── generatePdfReport.ts # jsPDF PDF 생성 로직
```

**왜 이렇게 나눴나**: Screens는 "페이지", components는 "재사용 가능한 블록"으로 역할을 명확히 분리함. 예를 들어 `ScanResultScreen`은 여러 scan/ 컴포넌트를 조합하는 컨테이너 역할만 하고, 각 컴포넌트는 props만 받아서 화면을 그리는 역할만 함. 덕분에 특정 컴포넌트만 수정하거나 재사용하기 쉬움.

---

## 2. 라우팅 & 인증 보호 (React Router + ProtectedRoute)

### 왜 React Router를 썼나
React는 기본적으로 SPA(Single Page Application) — 페이지 이동 시 실제로 새 HTML을 받아오는 게 아니라 JavaScript가 화면을 바꾸는 구조. React Router가 이 URL 변경 → 컴포넌트 교체를 담당함.

### ProtectedRoute 패턴
로그인이 필요한 페이지에 직접 URL로 접근하면 `/login`으로 막는 게이트.

```tsx
// navigation/ProtectedRoute.tsx
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

```tsx
// Router.tsx에서 사용
<Route
  path="/upload"
  element={
    <ProtectedRoute>
      <FileUploadScreen />
    </ProtectedRoute>
  }
/>
```

**어떻게 동작하나**: `isLoggedIn()`이 `localStorage`에 `membSeq`가 있는지 확인. 없으면 `Navigate`로 로그인 페이지로 보냄. `replace`를 쓰는 이유 — replace가 없으면 브라우저 히스토리에 "차단된 URL"이 남아서, 로그인 후 뒤로가기를 누르면 다시 차단 페이지로 돌아가는 문제가 생김. replace를 쓰면 히스토리에서 그 항목을 덮어써서 자연스러운 흐름이 됨.

**면접 포인트**: "클라이언트 사이드 라우트 보호는 진짜 보안이 아님을 알고 있습니다. localStorage에서 값만 지우면 뚫리기 때문에 실제 데이터 보호는 백엔드 API에서 인증 토큰을 검증하는 것이 핵심이고, 프론트의 ProtectedRoute는 UX를 위한 첫 번째 장벽입니다."

---

## 3. API 계층 설계 (Axios + ApiConfig)

### BASE_URL 환경 분기

```ts
// services/_private/ApiConfig.ts
export const BASE_URL = import.meta.env.PROD
  ? "/api"         // 배포: nginx가 /api/ → 백엔드로 프록시
  : "http://localhost:18080/api";  // 로컬 개발: 직접 연결

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,  // 2분 (SBOM 분석이 오래 걸릴 수 있어서)
});
```

**왜 이렇게 했나**: 하드코딩하면 배포할 때마다 URL을 직접 고쳐야 함. `import.meta.env.PROD`는 Vite가 `npm run build`를 실행할 때 `true`로 바뀌는 환경변수 — 개발/배포 환경을 코드 변경 없이 자동으로 분기.

**배포에서 `/api`로 쓰는 이유**: 프로덕션에선 프론트(Nginx)와 백엔드가 같은 도메인에 올라가고, nginx가 `/api/` 경로를 백엔드 포트로 프록시함. 상대 경로를 쓰면 CORS 문제가 없음.

### API 함수 분리 (`services/_private/`)

기능별로 파일을 나눔 — `SbomApi.ts`, `LoginApi.ts`, `GoogleAuthApi.ts`, `SignUpApi.ts` 등. 한 파일에 다 몰아넣지 않은 이유: 파일이 커지면 어디에 어떤 함수가 있는지 찾기 어렵고, 여러 명이 같은 파일을 동시에 수정할 때 충돌이 잦아짐.

---

## 4. 커스텀 훅 (useScanResult)

**뭘 했나**: 스캔 결과 화면에서 필요한 데이터(취약점 목록, 구성요소 목록, 수정안, 정책 판정)를 한 곳에서 관리하는 커스텀 훅.

**왜 커스텀 훅으로 뺐나**: `ScanResultScreen.tsx` 안에 API 호출 + 상태 관리 + UI 렌더링이 다 있으면 컴포넌트가 너무 길어지고 로직을 재사용할 수 없음. 커스텀 훅으로 데이터 로직을 빼면 컴포넌트는 "어떻게 보여줄지"만 담당하고, 훅은 "데이터를 어떻게 가져올지"만 담당함(관심사 분리).

```ts
// hooks/useScanResult.ts
export const useScanResult = (fileSeq?: string) => {
  const [results, setResults] = useState<ScanResult[]>([]);
  // ...

  useEffect(() => {
    const loadResults = async () => {
      // 필수 데이터 (스캔결과 + 구성요소)를 Promise.all로 병렬 요청
      const [scanResponse, componentResponse] = await Promise.all([
        getScanResults(fileSeq),
        getComponents(fileSeq),
      ]);

      // 선택적 데이터 (수정안, 정책판정)는 실패해도 화면 전체가 죽지 않게 별도 try/catch
      try {
        const [fixPlanResponse, policyResponse] = await Promise.all([
          getFixPlan(fileSeq),
          getPolicyResult(fileSeq),
        ]);
        // ...
      } catch (extraResultError) {
        // 실패해도 빈 배열/null로 처리, 핵심 결과는 그대로 표시
        setFixPlan([]);
        setPolicyResult(null);
      }
    };
  }, [fileSeq]);

  return { results, components, fixPlan, policyResult, loading, error, downloadFixedProjectZip };
};
```

**핵심 설계 포인트**:
- `Promise.all`로 병렬 요청 — 순서대로 하면 각 요청이 끝날 때까지 기다려야 하지만, `Promise.all`은 동시에 날려서 전체 대기 시간을 줄임.
- 필수/선택 데이터를 분리 — 수정안이나 정책 판정 API가 실패해도 취약점 목록은 보여줄 수 있음. 모두 같은 try/catch 안에 넣으면 선택 데이터 실패가 전체 화면을 죽임.

**면접 포인트**: "React에서 데이터 fetching 로직을 어떻게 관리하나"라는 질문에 커스텀 훅 패턴을 실제 사례로 설명할 수 있음. `Promise.all`과 에러 격리 설계도 같이 말하면 좋음.

---

## 5. 폴링 패턴 (ScanLoadingScreen)

**뭘 했나**: 파일 업로드 후 백엔드 분석이 끝날 때까지 1초마다 상태를 체크하다가 DONE이 되면 자동으로 결과 화면으로 이동.

**왜 폴링인가**: WebSocket이나 SSE(Server-Sent Events)를 쓰면 백엔드도 같이 구현해야 함. 분석이 짧으면 몇 번 안 체크하고 끝나기 때문에 단순한 폴링으로도 충분한 UX를 낼 수 있다고 판단.

```tsx
useEffect(() => {
  let isMounted = true;
  let timerId: number | undefined;

  const checkStatus = async () => {
    const response = await getFileStatus(fileSeq);
    const nextStatus = response?.data as FileStatus;
    if (!isMounted) return;  // 컴포넌트가 언마운트됐으면 상태 업데이트 안 함

    setStatus(nextStatus);

    if (nextStatus?.status === "DONE") {
      navigate(`/scan-result/${fileSeq}`, { replace: true });
      return;
    }
    if (nextStatus?.status === "FAILED") {
      setErrorMessage("...");
      return;
    }

    timerId = window.setTimeout(checkStatus, 1000);  // 1초 후 재귀 호출
  };

  checkStatus();

  return () => {
    isMounted = false;
    if (timerId) window.clearTimeout(timerId);  // cleanup
  };
}, [fileSeq, navigate]);
```

**중요한 패턴 두 가지**:
- `isMounted` 플래그: 사용자가 로딩 화면을 나가면 컴포넌트가 언마운트되는데, 이때 아직 날아가 있는 API 응답이 돌아오면 이미 사라진 컴포넌트의 상태를 업데이트하려다 메모리 누수/에러 발생. `isMounted`를 체크해서 막음.
- cleanup 함수(`return () => {...}`): useEffect의 return에 cleanup을 넣으면 컴포넌트가 언마운트될 때 자동으로 실행됨. `clearTimeout`으로 남아있는 타이머를 취소해서 언마운트 후에도 API를 계속 호출하는 상황을 방지.

**면접 포인트**: "비동기 요청의 메모리 누수를 어떻게 처리하나"라고 물으면 이 패턴을 실제 사례로 들 수 있음.

---

## 6. 인증 상태 관리 (localStorage)

```ts
// utils/currentUser.ts
const MEMBER_SEQ_KEY = "zcs_memb_seq";
const MEMBER_NAME_KEY = "zcs_memb_name";

export const setCurrentUser = (membSeq: number, membNm?: string) => {
  window.localStorage.setItem(MEMBER_SEQ_KEY, String(membSeq));
  if (membNm) window.localStorage.setItem(MEMBER_NAME_KEY, membNm);
};

export const isLoggedIn = () => getCurrentMembSeq() !== null;
export const clearCurrentUser = () => { /* localStorage에서 제거 */ };
```

**왜 Context API나 Redux 같은 전역 상태 관리 없이 localStorage만 썼나**: 이 앱에서 "인증 상태"는 사실상 `membSeq`가 localStorage에 있냐 없냐 하나로 결정됨. 복잡한 전역 상태를 관리할 필요가 없어서 오버엔지니어링을 피한 선택. 단, localStorage 기반이라 새로고침해도 로그인이 유지되고, 브라우저 탭 간에 상태가 공유됨.

**트레이드오프**: localStorage는 XSS 취약점이 있으면 스크립트가 값을 탈취할 수 있음. 보안이 중요한 서비스에서는 HttpOnly 쿠키 + 서버 세션 방식이 더 안전. 이 점을 인지하고 있다는 것도 면접에서 말할 수 있음.

> **후속 조치**: 실제로 백엔드가 이 `membSeq`를 그대로 신뢰해서 남의 데이터를 조회할 수 있는 문제가 있었음. 서버에 세션 기반 인증을 붙이고 프론트도 맞춰 고친 내용은 [11번 섹션](#11-서버-세션-인증으로-전환-membseq-직접-전송-제거) 참고.

---

## 7. PDF 리포트 생성 (jsPDF)

**뭘 했나**: 스캔 결과 화면에서 "PDF 다운로드" 버튼을 누르면 취약점 목록, 구성요소 목록, 요약 통계가 담긴 PDF 파일을 생성해서 다운로드.

**왜 백엔드가 아니라 프론트에서 만들었나**: 백엔드에서 PDF를 만들려면 서버에 PDF 라이브러리를 추가하고 API 엔드포인트를 만들고 파일을 전송하는 과정이 필요함. jsPDF는 브라우저에서 실행되는 라이브러리라 서버 리소스를 안 쓰고 클라이언트 측에서 바로 생성/다운로드 가능. 분석 결과를 이미 프론트가 들고 있어서 별도 요청 없이 바로 쓸 수 있다는 것도 이유.

**한글 처리**:
```ts
// jsPDF 기본 폰트는 한글 미지원 → NanumGothic 폰트를 CDN에서 동적으로 로드
async function loadKoreanFont(doc: jsPDF): Promise<void> {
  const res = await fetch(NANUM_FONT_URL);
  const buf = await res.arrayBuffer();
  // base64로 변환해서 jsPDF에 등록
  const base64 = btoa(binary);
  doc.addFileToVFS("NanumGothic.ttf", base64);
  doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
}
```

**어떻게 다운로드되나**: `jsPDF`가 PDF 바이너리를 만들고 `doc.save("파일명.pdf")`를 호출하면 브라우저가 자동으로 다운로드 다이얼로그를 열어줌. 서버로 전송 없이 메모리 안에서만 처리.

---

## 8. TypeScript 타입 정의 (SbomApi.ts)

API 응답 형태를 TypeScript 타입으로 미리 정의해두면 두 가지 이점이 있음.

```ts
// services/_private/SbomApi.ts
export type ScanResult = {
  resultSeq: number;
  fileSeq: number;
  vulnId?: string;      // ?는 Optional — 없을 수도 있음
  cveId?: string;
  pkgName: string;
  severity: string;
  // ...
};

export type PolicyResult = {
  decision: "BLOCK" | "REVIEW" | "PASS" | string;  // Union 타입 — 정해진 값 중 하나
  violations: PolicyRuleResult[];
  // ...
};
```

1. **자동완성**: 컴포넌트에서 `result.`을 치면 어떤 필드가 있는지 IDE가 바로 보여줌 — 백엔드 API 응답 구조를 외울 필요 없음.
2. **런타임 전에 에러 감지**: `result.pkgNm`처럼 오타를 치면 빌드 전에 TypeScript가 잡아줌. 순수 JS라면 런타임에 `undefined`로 조용히 통과해서 나중에 화면에서 이상하게 보임.

**면접 포인트**: "TypeScript를 왜 씁니까"라는 질문에 단순히 "타입이 있어서 안전합니다"보다는 이 두 가지 이점을 구체적인 사례로 설명하면 더 설득력 있음.

---

## 9. 트러블슈팅 기록

| 문제 | 원인 | 해결 |
|------|------|------|
| Google 로그인 후 대시보드 진입 안 됨 | `googleLoginApiCall`이 `membSeq`를 받아도 `setCurrentUser()`를 호출 안 함 | 로그인 성공 응답에서 `setCurrentUser(membSeq)` 호출 추가 |
| 파일 업로드 후 분석 결과 페이지가 빈 화면 | `useScanResult` 훅에서 `fileSeq`가 `undefined`일 때 API를 호출하는 버그 | `if (!fileSeq) return;` 조건 추가 |
| PDF에 한글이 네모로 깨짐 | jsPDF 기본 폰트가 한글 미지원 | NanumGothic 폰트를 CDN에서 로드해 등록 |
| 개발 환경에서 CORS 에러 | 프론트(3000)와 백엔드(18080) 포트가 달라서 브라우저가 차단 | 백엔드 Spring Security에 `http://localhost:3000` CORS 허용 추가 |
| 배포 후 API 호출 실패 | BASE_URL이 `localhost:18080`으로 하드코딩됨 | `import.meta.env.PROD`로 환경 분기 |
| 로딩 화면에서 나갔다가 돌아오면 중복 폴링 | cleanup 없이 타이머가 계속 쌓임 | useEffect cleanup에 `clearTimeout` 추가 |
| localStorage의 membSeq를 서버가 그대로 신뢰 | 쿼리 파라미터로 membSeq를 직접 보내고 서버가 검증 없이 사용 | withCredentials + 서버 세션 쿠키로 전환, membSeq 직접 전송 제거 ([11번](#11-서버-세션-인증으로-전환-membseq-직접-전송-제거)) |

---

## 10. 면접에서 쓸 수 있는 포인트

**"컴포넌트 구조를 어떻게 설계했나"**
> Screens(페이지)와 components(재사용 블록)를 분리하고, scan 결과 화면처럼 복잡한 화면은 역할별로 컴포넌트를 나눠서 `ScanResultScreen`이 조합만 하게 했습니다.

**"인증 처리를 어떻게 했나"**
> ProtectedRoute 패턴으로 비로그인 사용자를 로그인 페이지로 리다이렉트했습니다. 클라이언트 보호는 UX를 위한 첫 번째 장벽이고, 실제 데이터 보호는 백엔드 API 인증에서 한다는 점을 알고 있습니다.

**"비동기 처리에서 신경 쓴 부분이 있나"**
> 분석 결과를 여러 API에서 가져오는데, 필수 데이터(`Promise.all` 병렬 요청)와 선택적 데이터를 try/catch로 분리해서 선택 데이터가 실패해도 화면이 죽지 않게 했습니다. 또한 폴링 컴포넌트에서 `isMounted` 플래그와 `clearTimeout`으로 언마운트 후 메모리 누수를 방지했습니다.

**"PDF를 왜 프론트에서 만들었나"**
> 분석 결과 데이터를 프론트가 이미 들고 있어서 별도 API 요청 없이 바로 생성할 수 있고, 서버 리소스를 쓰지 않아도 됩니다. jsPDF로 클라이언트 사이드에서 생성했고, 한글 지원을 위해 NanumGothic 폰트를 동적으로 로드했습니다.

**"TypeScript를 쓰면서 실제로 도움이 된 사례가 있나"**
> API 응답 타입을 `SbomApi.ts`에 미리 선언해두니 컴포넌트에서 필드 이름 오타를 빌드 전에 잡을 수 있었고, IDE 자동완성으로 백엔드 응답 구조를 기억 안 해도 개발 속도가 빨라졌습니다.

---

## 11. 서버 세션 인증으로 전환 (membSeq 직접 전송 제거)

**뭘 했나**: 백엔드 코드 리뷰 중, `getFileHistory`/`getDashboardSummary`가 `localStorage`에서 꺼낸 `membSeq`를 쿼리 파라미터로 그대로 서버에 보내고, 서버는 그 값을 검증 없이 믿는다는 걸 확인함(6번 섹션에서 이미 트레이드오프로 짚었던 부분이 실제로 뚫려 있었음). 서버에 `HttpSession` 기반 인증을 붙이면서 프론트도 함께 고침.

- `ApiConfig.ts`의 `axiosInstance`에 `withCredentials: true` 추가 → 로그인 성공 시 서버가 심어주는 세션 쿠키(`JSESSIONID`)가 이후 모든 요청에 자동으로 실림.
- `SbomApi.ts`의 `getFileHistory`/`getDashboardSummary`에서 `params: { membSeq }`를 제거 — 이제 회원 식별은 서버가 세션으로 함.
- `uploadSbomFile`도 `formData.append("membSeq", ...)` 부분을 제거 (파라미터는 기존 호출부 호환을 위해 시그니처만 남기고 무시).

**왜 이렇게 했나**: 클라이언트가 보낸 값을 서버가 그대로 믿는 구조에서는, devtools로 `localStorage`의 `zcs_memb_seq` 값을 바꾸는 것만으로 다른 사용자 행세가 가능함. 세션 쿠키는 브라우저가 자동으로만 붙이고 JS로 값을 조작할 수 없어서(값 자체가 서버 메모리에 있고 쿠키는 세션 ID만 담음), 이 문제를 근본적으로 막음.

**어떻게 동작하나**: 로그인/구글로그인 성공 시 서버가 `HttpSession`에 `membSeq`를 저장하고 `Set-Cookie`로 세션 ID를 내려줌. `withCredentials: true`가 켜져 있으면 axios가 이후 요청마다 그 쿠키를 자동으로 담아 보냄 → 서버는 쿠키의 세션 ID로 세션을 찾아 `membSeq`를 꺼냄. CORS도 `allowCredentials(true)` + 특정 origin만 허용하도록 같이 좁혀야 했음(와일드카드 `*` origin은 쿠키 전송과 함께 쓸 수 없어서 브라우저가 차단함).

**알아둘 한계**: `localStorage`의 `membSeq`/`membNm`은 여전히 남아있음 — 화면에 "OO님 환영합니다" 같은 걸 표시하는 용도로만 쓰고, 더 이상 인증/권한 판단에는 안 씀. `isLoggedIn()`(ProtectedRoute가 쓰는)도 여전히 클라이언트 값 기준이라 "UX용 첫 번째 장벽"일 뿐이고, 실제 데이터 보호는 서버 세션 + 소유권 검증이 함 — 6번 섹션에서 이미 예상했던 역할 분담 그대로.

**면접에서 말할 포인트**: "localStorage에 저장한 membSeq를 그대로 쿼리 파라미터로 보내던 구조를, 서버 세션 쿠키 기반으로 바꿨습니다. 클라이언트 값을 신뢰하지 않는 방향으로 프론트/백엔드를 함께 고친 경험이고, CORS를 와일드카드에서 특정 origin으로 좁혀야 했던 이유(쿠키 전송과 와일드카드 origin은 브라우저 정책상 같이 못 씀)도 직접 겪었습니다."

---

## 12. CSRF 토큰 쿠키 연동 (백엔드 CSRF 재활성화 대응)

**뭘 했나**: 백엔드가 세션 쿠키 인증에 맞춰 CSRF 보호를 재활성화하면서, 프론트도 그에 맞춰 두 가지를 추가함.

- `ApiConfig.ts`의 `axiosInstance`에 `withXSRFToken: true` 추가.
- `App.tsx`에 앱 마운트 시 `GET /csrf`를 한 번 호출하는 `useEffect` 추가(워밍업 호출).

**왜 이렇게 했나**: Spring Security는 `XSRF-TOKEN` 쿠키를 응답에 실어주고, 프론트는 그 값을 읽어서 `X-XSRF-TOKEN` 헤더로 되돌려 보내야 상태 변경 요청(POST/PUT/DELETE)이 통과됨. axios는 같은 origin일 때만 이 쿠키를 자동으로 읽는데, 로컬 개발은 프론트(5173)/백엔드(18080) 포트가 달라 cross-origin 취급이라 `withXSRFToken: true`를 명시적으로 켜야 함. 또한 로그인 자체가 CSRF 검사 대상인 POST라서, 앱을 막 켠 시점엔 토큰 쿠키가 아직 없어 첫 로그인 요청이 항상 막히는 문제가 있었음 — 그래서 로그인 시도 전에 미리 쿠키를 받아두는 워밍업 호출이 필요했음.

**어떻게 동작하나**: 앱이 뜨자마자 `GET /csrf`를 호출 → 백엔드가 `Set-Cookie: XSRF-TOKEN=...`을 내려줌 → 이후 로그인을 포함한 모든 POST 요청에서 axios가 이 쿠키 값을 읽어 `X-XSRF-TOKEN` 헤더로 자동 첨부 → 백엔드가 쿠키 값과 헤더 값이 일치하는지 확인하고 통과시킴.

**알아둘 한계**: 워밍업 호출이 실패해도 앱 자체는 계속 뜨도록 조용히 무시하게 해뒀음(네트워크 일시 오류 등으로 앱 진입 자체가 막히지 않게). 다만 이 경우 실제 로그인 시도는 CSRF 토큰이 없어 403으로 막히므로, 사용자 입장에서는 "로그인이 안 된다"로만 보이고 원인이 CSRF 워밍업 실패라는 건 콘솔/네트워크 탭을 봐야 알 수 있음 — 에러 메시지 개선의 여지가 있음.

**면접에서 말할 포인트**: "백엔드가 CSRF 보호를 SPA 쿠키 방식으로 재활성화하면서, 프론트에서도 로그인 전에 토큰 쿠키를 미리 받아두는 워밍업 호출을 추가했습니다. axios가 cross-origin에서는 XSRF 쿠키를 자동으로 안 읽는다는 걸 로컬 개발 중(프론트/백엔드 포트가 다름) 직접 겪고 `withXSRFToken` 옵션으로 해결했습니다."

---

## 13. 앱 시작 시 서버 세션 유효성 확인 (로그인 표시-실제 상태 불일치 수정)

**뭘 했나**: 배포 후 라이브로 확인하다가, `localStorage`엔 로그인 표시가 남아있는데 서버 세션은 없어져서(만료 등) 화면은 로그인된 것처럼 보이면서 데이터 요청은 다 실패하는 상태를 목격함. `App.tsx`에서 라우터를 그리기 전에 `GET /session`으로 실제 세션이 유효한지 먼저 확인하고, 아니면 로그인 표시(`localStorage`)를 지우도록 고침.

```tsx
if (isLoggedIn()) {
  try { await axiosInstance.get("/session"); }
  catch { clearCurrentUser(); }
}
setReady(true); // 확인 끝난 뒤에야 <Router />를 그림
```

**왜 이렇게 했나**: `isLoggedIn()`이 보는 `localStorage` 값은 사용자가 로그아웃을 누르지 않는 한 영원히 남아있어서, "클라이언트가 기억하는 상태"와 "서버가 실제로 인증하는 상태"가 어긋날 수 있음(11번 섹션에서 이미 이 역할 분담을 예상했었는데, 실제로 어긋나는 상황을 라이브에서 처음 봄). 확인 없이 바로 라우터를 그리면 `ProtectedRoute`가 낡은 로그인 표시만 보고 보호된 화면을 그대로 보여주고, 그 화면의 API 호출들이 전부 401로 실패하는 혼란스러운 상태가 됨.

**어떻게 동작하나**: `ready` 상태가 `false`인 동안은 아무것도 렌더링하지 않고, 세션 확인이 끝난 뒤에만 `<Router />`를 그림. 그래서 `ProtectedRoute`가 라우팅을 결정하는 시점엔 이미 `localStorage`가 실제 상태와 일치해 있음 — 세션이 없었다면 이 시점엔 이미 지워져 있어서 정상적으로 로그인 화면으로 보내짐.

**알아둘 한계**: 로그인된 사용자는 앱 첫 로딩 때마다 세션 확인 요청이 하나 추가됨(체감 지연은 미미). `ready`가 `false`인 동안 빈 화면만 보이는데, 로딩 스피너를 넣으면 더 자연스러움 — 지금은 범위 밖으로 남겨둠.

**면접에서 말할 포인트**: "배포 후 라이브 테스트 중에 클라이언트가 기억하는 로그인 상태와 실제 서버 세션이 어긋나는 걸 목격했습니다. 보안 자체는 서버가 지키고 있어서 데이터가 새지는 않았지만, 화면 상태가 진실과 안 맞으면 사용자가 헷갈린다고 판단해서 앱 시작 시 세션을 한 번 검증하고 라우팅하도록 고쳤습니다."

---

## 14. 루트 경로(`/`)를 로그인 강제 화면에서 공개 랜딩 페이지로 변경

**뭘 했나**: 기존엔 `/`가 `ProtectedRoute`로 감싼 `DashboardScreen`이라서, 로그인 안 한 사용자가 사이트에 처음 들어오면 곧바로 로그인 화면으로 튕겨나갔음. 이미 만들어져 있던 `Introduce`(소개) 화면을 `/`의 실제 컴포넌트로 바꿔서, 로그인 여부와 상관없이 누구나 먼저 소개 페이지를 보게 함. 로그인은 `Introduce`의 상단 네비게이션(`Topbar`)에 있는 "로그인" 버튼으로 별도로 하게 됨.

```tsx
// Router.tsx
<Route path="/" element={<Introduce />} />   // 이전: <ProtectedRoute><DashboardScreen /></ProtectedRoute>
```

로그인 후 이동할 곳이 없어지면 안 되므로, 로그인 성공 시 이동 경로를 `/`에서 `/dashboard`로 바꿈(`login.tsx`). 로그인된 상태에서 쓰는 "홈" 버튼들(`AnalysisHistoryScreen`, `ScanResultScreen`)도 전부 `/dashboard`로 맞춤.

**왜 이렇게 했나**: 대부분의 서비스는 로그인 안 해도 메인 화면(소개, 마케팅 페이지 등)은 볼 수 있고, 로그인은 필요한 시점에 따로 하는 구조임. 로그인부터 강제하면 서비스가 뭘 하는 곳인지도 모른 채 로그인 화면부터 보게 돼서 이탈하기 쉬움. `Introduce` 화면이 이미 만들어져 있었는데 `/intro` 경로로만 접근 가능하고 정작 `/`에는 안 쓰이고 있었던 것도 낭비였음.

**알아둘 한계**: `Topbar`의 "파일 입력"/"저장소"/"대시보드" 메뉴는 여전히 보호된 라우트라서, 비로그인 상태로 클릭하면 `/login`으로 튕김 — 이건 의도된 동작(둘러보기는 자유롭게, 실제 기능은 로그인 필요).
