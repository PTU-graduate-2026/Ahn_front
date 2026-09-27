import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, CircleX, History, Loader, RotateCcw } from "lucide-react";
import { getFileStatus, type FileStatus } from "../services/_private/SbomApi";
import Topbar from "./IntroduceScreen/Topbar";

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif";

// 인라인 스타일로는 keyframes를 못 만들어서 <style>로 넣음
// (움직임 줄이기 설정한 사용자는 애니메이션 끔)
const animationCss = `
@keyframes zcs-spin { to { transform: rotate(360deg); } }
@keyframes zcs-slide { 0% { left: -40%; } 100% { left: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .zcs-spin, .zcs-slide { animation: none !important; }
}
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    color: "#0f172a",
    fontFamily: font,
  },
  content: {
    display: "flex",
    justifyContent: "center",
    padding: "64px 24px",
  },
  panel: {
    width: "100%",
    maxWidth: 560,
    padding: "36px 36px 28px",
    boxSizing: "border-box",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "-0.3px",
  },
  description: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.7,
  },

  // 진행 중 표시 (실제 진행률이 없어서 흐르는 막대)
  progressTrack: {
    position: "relative",
    height: 6,
    marginTop: 24,
    overflow: "hidden",
    borderRadius: 999,
    background: "#e2e8f0",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    width: "40%",
    height: "100%",
    borderRadius: 999,
    background: "#1f4e8c",
    animation: "zcs-slide 1.4s ease-in-out infinite",
  },

  // 단계 목록
  steps: {
    listStyle: "none",
    margin: "24px 0 0",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepDone: { background: "#16a34a", color: "#fff" },
  stepActive: { background: "rgba(31, 78, 140, 0.1)", color: "#1f4e8c" },
  stepWait: { background: "#f1f5f9", color: "#94a3b8", fontSize: 12, fontWeight: 800 },
  stepTitle: {
    fontSize: 14,
    fontWeight: 800,
    lineHeight: "24px",
  },
  stepDesc: {
    marginTop: 1,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5,
  },

  meta: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    marginTop: 26,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },
  metaItem: {
    padding: "12px 14px",
    minWidth: 0,
  },
  metaDivider: {
    borderLeft: "1px solid #e2e8f0",
  },
  metaLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  footerNote: {
    color: "#94a3b8",
    fontSize: 12,
  },
  buttonRow: {
    display: "flex",
    gap: 8,
    marginLeft: "auto",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid #173357",
    background: "#173357", // ZCS 어두운 파란색
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },
};

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function ScanLoadingScreen() {
  const navigate = useNavigate();
  const { fileSeq } = useParams();
  const [status, setStatus] = useState<FileStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!fileSeq) return;
    let isMounted = true;
    let timerId: number | undefined;

    const checkStatus = async () => {
      try {
        const response = await getFileStatus(fileSeq);
        const nextStatus = response?.data as FileStatus;
        if (!isMounted) return;

        setStatus(nextStatus);

        if (nextStatus?.status === "DONE") {
          navigate(`/scan-result/${fileSeq}`, { replace: true });
          return;
        }

        if (nextStatus?.status === "FAILED") {
          setErrorMessage("분석에 실패했습니다. 파일 형식이나 백엔드 로그를 확인해주세요.");
          return;
        }

        timerId = window.setTimeout(checkStatus, 1000);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage("분석 상태를 확인하지 못했습니다. 백엔드 서버를 확인해주세요.");
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [fileSeq, navigate]);

  const isFailed = status?.status === "FAILED" || Boolean(errorMessage);

  // 경과 시간 (실패하면 멈춤)
  useEffect(() => {
    if (isFailed) return;
    const id = window.setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, [isFailed]);

  // 서버가 알려주는 건 "분석 중/완료/실패"뿐이라 중간 단계는 한 묶음으로 표시
  const steps = [
    {
      title: "파일 업로드",
      desc: "서버에 파일 저장 완료",
      state: "done" as const,
    },
    {
      title: "구성요소 추출 · 취약점 분석",
      desc: isFailed
        ? "이 단계에서 분석이 중단되었습니다."
        : "Syft로 구성요소를 추출하고 Grype로 알려진 취약점(CVE)을 찾고 있습니다.",
      state: isFailed ? ("failed" as const) : ("active" as const),
    },
    {
      title: "결과 화면으로 이동",
      desc: isFailed
        ? "파일을 확인한 뒤 다시 업로드해주세요."
        : "분석이 끝나면 자동으로 이동합니다.",
      state: "wait" as const,
    },
  ];

  const renderStepIcon = (state: "done" | "active" | "failed" | "wait", index: number) => {
    if (state === "done")
      return (
        <span style={{ ...styles.stepIcon, ...styles.stepDone }}>
          <Check size={14} strokeWidth={3} />
        </span>
      );
    if (state === "failed")
      return (
        <span style={{ ...styles.stepIcon, background: "#fee2e2", color: "#b91c1c" }}>
          <CircleX size={14} />
        </span>
      );
    if (state === "active")
      return (
        <span style={{ ...styles.stepIcon, ...styles.stepActive }}>
          <Loader size={14} className="zcs-spin" style={{ animation: "zcs-spin 1s linear infinite" }} />
        </span>
      );
    return <span style={{ ...styles.stepIcon, ...styles.stepWait }}>{index + 1}</span>;
  };

  return (
    <main style={styles.page}>
      <style>{animationCss}</style>
      <Topbar />

      <div style={styles.content}>
        <section style={styles.panel} aria-live="polite">
          <div
            style={{
              ...styles.iconCircle,
              background: isFailed ? "#fee2e2" : "rgba(31, 78, 140, 0.08)",
              color: isFailed ? "#b91c1c" : "#1f4e8c",
            }}
          >
            {isFailed ? (
              <CircleX size={28} />
            ) : (
              <Loader size={28} className="zcs-spin" style={{ animation: "zcs-spin 1.2s linear infinite" }} />
            )}
          </div>

          <h1 style={styles.title}>
            {isFailed ? "분석을 완료하지 못했습니다" : "파일을 분석하고 있습니다"}
          </h1>
          <p style={styles.description}>
            {isFailed
              ? errorMessage
              : "파일 크기에 따라 수십 초에서 몇 분 정도 걸릴 수 있습니다. 완료되면 결과 화면으로 자동 이동합니다."}
          </p>

          {!isFailed && (
            <div style={styles.progressTrack} role="progressbar" aria-label="분석 진행 중">
              <div className="zcs-slide" style={styles.progressBar} />
            </div>
          )}

          <ol style={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} style={styles.step}>
                {renderStepIcon(step.state, index)}
                <div>
                  <div
                    style={{
                      ...styles.stepTitle,
                      color: step.state === "wait" ? "#94a3b8" : step.state === "failed" ? "#b91c1c" : "#0f172a",
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={styles.stepDesc}>{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>

          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <div style={styles.metaLabel}>파일</div>
              <div style={styles.metaValue} title={status?.fileName}>
                {status?.fileName ?? `#${fileSeq ?? "-"}`}
              </div>
            </div>
            <div style={{ ...styles.metaItem, ...styles.metaDivider }}>
              <div style={styles.metaLabel}>현재 상태</div>
              <div style={{ ...styles.metaValue, color: isFailed ? "#b91c1c" : "#1f4e8c" }}>
                {isFailed ? "실패" : status ? "분석 중" : "확인 중"}
              </div>
            </div>
            <div style={{ ...styles.metaItem, ...styles.metaDivider }}>
              <div style={styles.metaLabel}>경과 시간</div>
              <div style={{ ...styles.metaValue, fontVariantNumeric: "tabular-nums" }}>
                {formatElapsed(elapsed)}
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            {!isFailed && (
              <span style={styles.footerNote}>다른 화면으로 이동해도 분석은 계속 진행됩니다.</span>
            )}
            <div style={styles.buttonRow}>
              <button type="button" style={styles.button} onClick={() => navigate("/history")}>
                <History size={16} />
                히스토리
              </button>
              {isFailed && (
                <button type="button" style={styles.primaryButton} onClick={() => navigate("/upload")}>
                  <RotateCcw size={16} />
                  다시 업로드
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
