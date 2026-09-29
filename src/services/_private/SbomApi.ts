import { axiosInstance } from "./ApiConfig";
import { isLoggedIn } from "../../utils/currentUser";

export type ScanResult = {
  resultSeq: number;
  fileSeq: number;
  vulnId?: string;
  cveId?: string;
  source?: string;
  pkgName: string;
  pkgType?: string;
  pkgVersion: string;
  severity: string;
  fixedVer?: string;
  scanDt?: string;
};

export type SbomComponent = {
  componentSeq: number;
  fileSeq: number;
  pkgName: string;
  pkgVersion?: string;
  pkgType?: string;
  license?: string;
};

export type FixPlanItem = {
  pkgName: string;
  pkgType?: string;
  currentVersion?: string;
  targetVersion?: string;
  severity?: string;
  vulnId?: string;
  autoApplicable: boolean;
  targetFile?: string;
  action: string;
};

export type FileHistoryItem = {
  fileSeq: number;
  fileName: string;
  fileSize?: number;
  status?: string;
  uploadDate?: string;
  componentCount?: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
  totalFindings?: number;
  policyDecision?: "BLOCK" | "REVIEW" | "PASS" | string;
  policyDecisionLabel?: string;
  policySummary?: string;
};

export type FileStatus = {
  fileSeq: number;
  fileName?: string;
  status: "ANALYZING" | "DONE" | "FAILED" | string;
  uploadDate?: string;
  scanCount?: number;
  componentCount?: number;
};

export type DashboardSummary = {
  totalFiles: number;
  doneCount: number;
  failedCount: number;
  analyzingCount: number;
  totalComponents: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  latestFiles: FileHistoryItem[];
  riskyFiles: FileHistoryItem[];
};

export type PolicyRuleResult = {
  ruleCode: string;
  level: "BLOCK" | "REVIEW" | "PASS" | string;
  title: string;
  message: string;
};

export type PolicyResult = {
  fileSeq: number;
  decision: "BLOCK" | "REVIEW" | "PASS" | string;
  decisionLabel: string;
  summary: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  missingFixCount: number;
  violations: PolicyRuleResult[];
  passedRules: PolicyRuleResult[];
};

// membSeq 파라미터는 더 이상 서버로 보내지 않는다 (호출부 호환을 위해 시그니처만 유지).
// 서버가 로그인 세션에서 회원을 식별하므로, 여기서 보낸 값은 무시된다.
export const uploadSbomFile = async (file: File, _membSeq?: number) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "업로드 실패",
    };
  }
};

export const getScanResults = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/scan-results`);
  return response.data;
};

export const getComponents = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/components`);
  return response.data;
};

export const getFixPlan = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/fix-plan`);
  return response.data;
};

export const getPolicyResult = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/policy-result`);
  return response.data;
};

export const downloadFixedZip = async (fileSeq: string | number) => {
  // 격리 빌드검증 워커가 실제로 npm install/mvn compile을 돌려보는 단계가 추가되면서
  // 응답이 오래 걸릴 수 있음(워커 자체 빌드 타임아웃만 2분, npm+java 둘 다 있으면 최대 4분+).
  // 공용 axios 기본 타임아웃(120000ms, ApiConfig.ts)보다 짧으면 백엔드가 아직 처리 중인데도
  // 프론트가 먼저 포기하고 "만들지 못했습니다" 오류를 띄우는 문제가 있어 이 요청만 넉넉하게 늘림.
  const response = await axiosInstance.get(`/files/${fileSeq}/fixed-zip`, {
    responseType: "blob",
    timeout: 300000,
  });
  return response;
};

export const getFileHistory = async () => {
  if (!isLoggedIn()) throw new Error("로그인이 필요합니다.");

  // membSeq를 쿼리로 보내지 않는다 - 서버가 세션 쿠키로 회원을 식별한다.
  const response = await axiosInstance.get("/files");
  return response.data;
};

export const getFileStatus = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/status`);
  return response.data;
};

export const getDashboardSummary = async () => {
  if (!isLoggedIn()) throw new Error("로그인이 필요합니다.");

  const response = await axiosInstance.get("/dashboard/summary");
  return response.data;
};
