import { useEffect, useState } from "react";
import {
  downloadFixedZip,
  getComponents,
  getFixPlan,
  getPolicyResult,
  getScanResults,
  type FixPlanItem,
  type PolicyResult,
  type SbomComponent,
  type ScanResult,
} from "../services/_private/SbomApi";
import { getErrorMessage } from "../services/_private/ApiConfig";

// Content-Disposition 헤더에서 파일명을 꺼낸다 (한글 파일명은 filename*=UTF-8''... 형식)
const getDownloadFileName = (header?: string) => {
  if (!header) return null;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded) return decodeURIComponent(encoded[1]);
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
};

export const useScanResult = (fileSeq?: string) => {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [components, setComponents] = useState<SbomComponent[]>([]);
  const [fixPlan, setFixPlan] = useState<FixPlanItem[]>([]);
  const [policyResult, setPolicyResult] = useState<PolicyResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fileSeq) return;

    const loadResults = async () => {
      try {
        setLoading(true);
        const [scanResponse, componentResponse] = await Promise.all([
          getScanResults(fileSeq),
          getComponents(fileSeq),
        ]);
        setResults(scanResponse.data?.results ?? []);
        setComponents(componentResponse.data?.components ?? []);

        try {
          const [fixPlanResponse, policyResponse] = await Promise.all([
            getFixPlan(fileSeq),
            getPolicyResult(fileSeq),
          ]);
          setFixPlan(fixPlanResponse.data?.fixes ?? []);
          setPolicyResult(policyResponse.data ?? null);
        } catch (extraResultError) {
          console.warn("수정안 또는 정책 판정 API를 불러오지 못했습니다.", extraResultError);
          setFixPlan([]);
          setPolicyResult(null);
        }
      } catch (e) {
        console.error(e);
        setError("분석 결과를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [fileSeq]);

  const downloadFixedProjectZip = async () => {
    if (!fileSeq || isDownloading) return;

    try {
      setIsDownloading(true);
      const response = await downloadFixedZip(fileSeq);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        getDownloadFileName(response.headers["content-disposition"]) ?? `fixed-project-${fileSeq}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error(downloadError);
      // 서버가 알려주는 실패 이유(ZIP 업로드가 아님, 자동 수정 대상 없음 등)를 그대로 보여준다
      alert(
        await getErrorMessage(
          downloadError,
          "수정된 ZIP을 만들지 못했습니다. ZIP 파일 업로드인지, 자동 수정 가능한 항목이 있는지 확인해주세요.",
        ),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    results,
    components,
    fixPlan,
    policyResult,
    isDownloading,
    loading,
    error,
    downloadFixedProjectZip,
  };
};
