import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, CircleX, History, Loader, RotateCcw } from "lucide-react";
import { getFileStatus, type FileStatus } from "../services/_private/SbomApi";
import Topbar from "./IntroduceScreen/Topbar";
import { animationCss, formatElapsed, styles } from "./ScanLoadingScreen";

// 여러 파일을 한 번에 올렸을 때 보여주는 분석 진행 화면.
// 파일 하나일 때의 ScanLoadingScreen과 같은 모양(진행 막대, 경과 시간)에 파일별 상태 목록을 더했다.
// 주소: /scan-loading?seqs=8,9,10

type FileState = {
  fileSeq: number;
  fileName?: string;
  status: "ANALYZING" | "DONE" | "FAILED";
};

const isFinished = (status: string) => status === "DONE" || status === "FAILED";

const rowButton: React.CSSProperties = {
  marginLeft: "auto",
  flexShrink: 0,
  background: "none",
  border: "none",
  padding: 0,
  color: "#1f4e8c",
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "underline",
  cursor: "pointer",
};

export default function MultiScanLoadingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seqsParam = searchParams.get("seqs") ?? "";

  // 주소의 번호 목록 (숫자가 아닌 값과 중복은 버린다)
  const seqs = useMemo(
    () =>
      Array.from(
        new Set(
          seqsParam
            .split(",")
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0),
        ),
      ),
    [seqsParam],
  );

  const [files, setFiles] = useState<Record<number, FileState>>({});
  const [connectionError, setConnectionError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // 이미 끝난 파일은 다시 조회하지 않기 위해 기억해둔다
  const finishedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (seqs.length === 0) return;
    finishedRef.current = new Set();
    let isMounted = true;
    let timerId: number | undefined;

    const checkStatuses = async () => {
      const pending = seqs.filter((seq) => !finishedRef.current.has(seq));
      let failedToConnect = false;

      const updates = await Promise.all(
        pending.map(async (seq) => {
          try {
            const response = await getFileStatus(seq);
            const data = response?.data as FileStatus | undefined;
            const status = data?.status === "DONE" || data?.status === "FAILED" ? data.status : "ANALYZING";
            return { fileSeq: seq, fileName: data?.fileName, status } as FileState;
          } catch {
            failedToConnect = true;
            return null;
          }
        }),
      );
      if (!isMounted) return;

      setConnectionError(failedToConnect);
      setFiles((prev) => {
        const next = { ...prev };
        updates.forEach((update) => {
          if (!update) return;
          next[update.fileSeq] = { ...update, fileName: update.fileName ?? prev[update.fileSeq]?.fileName };
          if (isFinished(update.status)) finishedRef.current.add(update.fileSeq);
        });
        return next;
      });

      if (finishedRef.current.size < seqs.length) {
        timerId = window.setTimeout(checkStatuses, 1000);
      }
    };

    checkStatuses();
    return () => {
      isMounted = false;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [seqs]);

  const rows: FileState[] = seqs.map((seq) => files[seq] ?? { fileSeq: seq, status: "ANALYZING" });
  const doneCount = rows.filter((row) => row.status === "DONE").length;
  const failedCount = rows.filter((row) => row.status === "FAILED").length;
  const allFinished = rows.length > 0 && doneCount + failedCount === rows.length;
  const hasFailure = failedCount > 0;

  // 경과 시간 (전부 끝나면 멈춤)
  useEffect(() => {
    if (allFinished) return;
    const id = window.setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, [allFinished]);

  // 전부 성공하면 잠깐 완료 상태를 보여준 뒤 히스토리로 이동한다 (실패가 있으면 남아서 알려준다)
  useEffect(() => {
    if (!allFinished || hasFailure) return;
    const id = window.setTimeout(() => navigate("/history", { replace: true }), 1500);
    return () => window.clearTimeout(id);
  }, [allFinished, hasFailure, navigate]);

  if (seqs.length === 0) {
    return (
      <main style={styles.page}>
        <Topbar />
        <div style={styles.content}>
          <section style={styles.panel}>
            <h1 style={styles.title}>분석할 파일을 찾지 못했습니다</h1>
            <p style={styles.description}>업로드 화면에서 파일을 다시 선택해주세요.</p>
            <div style={styles.footer}>
              <div style={styles.buttonRow}>
                <button type="button" style={styles.primaryButton} onClick={() => navigate("/upload")}>
                  <RotateCcw size={16} />
                  업로드로 이동
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const renderIcon = (state: FileState["status"]) => {
    if (state === "DONE")
      return (
        <span style={{ ...styles.stepIcon, ...styles.stepDone }}>
          <Check size={14} strokeWidth={3} />
        </span>
      );
    if (state === "FAILED")
      return (
        <span style={{ ...styles.stepIcon, background: "#fee2e2", color: "#b91c1c" }}>
          <CircleX size={14} />
        </span>
      );
    return (
      <span style={{ ...styles.stepIcon, ...styles.stepActive }}>
        <Loader size={14} className="zcs-spin" style={{ animation: "zcs-spin 1s linear infinite" }} />
      </span>
    );
  };

  const title = !allFinished
    ? `${rows.length}개 파일을 분석하고 있습니다`
    : hasFailure
      ? "일부 파일을 분석하지 못했습니다"
      : "분석이 완료되었습니다";

  const description = !allFinished
    ? "파일 크기에 따라 수십 초에서 몇 분 정도 걸릴 수 있습니다. 모두 끝나면 분석 히스토리로 자동 이동합니다."
    : hasFailure
      ? `${failedCount}개 파일의 분석이 실패했습니다. 파일 형식이나 백엔드 로그를 확인한 뒤 다시 업로드해주세요.`
      : "분석 히스토리로 이동합니다.";

  return (
    <main style={styles.page}>
      <style>{animationCss}</style>
      <Topbar />

      <div style={styles.content}>
        <section style={styles.panel} aria-live="polite">
          <div
            style={{
              ...styles.iconCircle,
              background: allFinished && hasFailure ? "#fee2e2" : "rgba(31, 78, 140, 0.08)",
              color: allFinished && hasFailure ? "#b91c1c" : "#1f4e8c",
            }}
          >
            {allFinished ? (
              hasFailure ? <CircleX size={28} /> : <Check size={28} strokeWidth={3} />
            ) : (
              <Loader size={28} className="zcs-spin" style={{ animation: "zcs-spin 1.2s linear infinite" }} />
            )}
          </div>

          <h1 style={styles.title}>{title}</h1>
          <p style={styles.description}>{description}</p>
          {connectionError && !allFinished && (
            <p style={{ ...styles.description, color: "#b45309" }}>
              분석 상태를 확인하지 못했습니다. 백엔드 서버 연결을 확인하는 중입니다.
            </p>
          )}

          {!allFinished && (
            <div style={styles.progressTrack} role="progressbar" aria-label="분석 진행 중">
              <div className="zcs-slide" style={styles.progressBar} />
            </div>
          )}

          <ol style={styles.steps}>
            {rows.map((row) => (
              <li key={row.fileSeq} style={styles.step}>
                {renderIcon(row.status)}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      ...styles.stepTitle,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: row.status === "FAILED" ? "#b91c1c" : "#0f172a",
                    }}
                    title={row.fileName}
                  >
                    {row.fileName ?? `#${row.fileSeq}`}
                  </div>
                  <div style={styles.stepDesc}>
                    {row.status === "DONE" ? "분석 완료" : row.status === "FAILED" ? "분석 실패" : "구성요소 추출 · 취약점 분석 중"}
                  </div>
                </div>
                {row.status === "DONE" && (
                  <button type="button" style={rowButton} onClick={() => navigate(`/scan-result/${row.fileSeq}`)}>
                    결과 보기
                  </button>
                )}
              </li>
            ))}
          </ol>

          <div style={styles.meta}>
            <div style={styles.metaItem}>
              <div style={styles.metaLabel}>전체 파일</div>
              <div style={styles.metaValue}>{rows.length}개</div>
            </div>
            <div style={{ ...styles.metaItem, ...styles.metaDivider }}>
              <div style={styles.metaLabel}>완료</div>
              <div
                style={{
                  ...styles.metaValue,
                  fontVariantNumeric: "tabular-nums",
                  color: hasFailure ? "#b91c1c" : "#1f4e8c",
                }}
              >
                {doneCount + failedCount} / {rows.length}
                {hasFailure ? ` (실패 ${failedCount})` : ""}
              </div>
            </div>
            <div style={{ ...styles.metaItem, ...styles.metaDivider }}>
              <div style={styles.metaLabel}>경과 시간</div>
              <div style={{ ...styles.metaValue, fontVariantNumeric: "tabular-nums" }}>{formatElapsed(elapsed)}</div>
            </div>
          </div>

          <div style={styles.footer}>
            {!allFinished && (
              <span style={styles.footerNote}>다른 화면으로 이동해도 분석은 계속 진행됩니다.</span>
            )}
            <div style={styles.buttonRow}>
              <button type="button" style={styles.button} onClick={() => navigate("/history")}>
                <History size={16} />
                히스토리
              </button>
              {allFinished && hasFailure && (
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
