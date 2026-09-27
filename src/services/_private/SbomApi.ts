import { axiosInstance } from "./ApiConfig";

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

// 회원 정보는 로그인 토큰으로 서버가 알아내므로 membSeq를 따로 보내지 않는다
export const uploadSbomFile = async (file: File) => {
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
  const response = await axiosInstance.get(`/files/${fileSeq}/fixed-zip`, {
    responseType: "blob",
  });
  return response;
};

export const getFileHistory = async () => {
  const response = await axiosInstance.get("/files");
  return response.data;
};

export const getFileStatus = async (fileSeq: string | number) => {
  const response = await axiosInstance.get(`/files/${fileSeq}/status`);
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await axiosInstance.get("/dashboard/summary");
  return response.data;
};
