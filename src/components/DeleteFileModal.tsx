import { AlertTriangle, FileText, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { deleteFile, type FileHistoryItem } from "../services/_private/SbomApi";
import { getErrorMessage } from "../services/_private/ApiConfig";
import { scanResultStyles as styles } from "../styles/scanResult";

type DeleteFileModalProps = {
  files: FileHistoryItem[];
  onClose: () => void;
  // 삭제에 성공한 파일 번호들 (일부만 성공해도 호출됨)
  onDeleted: (fileSeqs: number[]) => void;
};

type DeleteFailure = { file: FileHistoryItem; message: string };

// 목록에 파일 이름을 몇 개까지 보여줄지 (나머지는 "외 N개")
const MAX_LISTED = 5;

// 분석 히스토리 삭제 확인 모달 (한 개 / 여러 개 공용).
// 브라우저 기본 confirm/alert 대신 화면 가운데에 서비스 디자인에 맞춘 모달을 띄우고,
// 실패 메시지(분석 중 파일 등)도 모달 안에서 보여준다.
export function DeleteFileModal({ files, onClose, onDeleted }: DeleteFileModalProps) {
  // 일부만 실패하면 실패한 파일만 남겨서 다시 시도할 수 있게 한다
  const [targets, setTargets] = useState(files);
  const [failures, setFailures] = useState<DeleteFailure[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 실수로 Enter를 눌러 바로 삭제되지 않도록 처음 포커스는 "취소"에 둔다.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  const deleteOne = async (file: FileHistoryItem): Promise<DeleteFailure | null> => {
    try {
      const result = await deleteFile(file.fileSeq);
      if (result?.success === false) {
        return { file, message: result.message || "삭제하지 못했습니다." };
      }
      return null;
    } catch (err) {
      return { file, message: await getErrorMessage(err, "삭제하지 못했습니다.") };
    }
  };

  const handleDelete = async () => {
    if (submitting) return;
    setFailures([]);
    setSubmitting(true);

    // 서버에 한꺼번에 몰리지 않도록 하나씩 순서대로 지운다
    const failed: DeleteFailure[] = [];
    for (const file of targets) {
      const failure = await deleteOne(file);
      if (failure) failed.push(failure);
    }

    const failedSeqs = new Set(failed.map((f) => f.file.fileSeq));
    const deletedSeqs = targets.map((f) => f.fileSeq).filter((seq) => !failedSeqs.has(seq));
    if (deletedSeqs.length > 0) onDeleted(deletedSeqs);

    setSubmitting(false);
    if (failed.length === 0) {
      onClose();
      return;
    }
    setTargets(failed.map((f) => f.file));
    setFailures(failed);
  };

  const isSingle = targets.length === 1;
  const listed = targets.slice(0, MAX_LISTED);
  const hiddenCount = targets.length - listed.length;
  const deletedCount = files.length - targets.length;

  // document.body에 포털로 그린다 (WithdrawModal과 같은 이유로, 부모 레이아웃과 무관하게 화면 정중앙에 고정).
  return createPortal(
    <div style={styles.modalOverlay} onClick={submitting ? undefined : onClose}>
      <div
        style={{ ...styles.modalCard, maxWidth: 460 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-file-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 id="delete-file-title" style={styles.modalTitle}>
            {isSingle ? "분석 기록 삭제" : `분석 기록 ${targets.length}개 삭제`}
          </h2>
          <button
            type="button"
            style={styles.modalCloseButton}
            onClick={onClose}
            disabled={submitting}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={localStyles.fileList}>
            {listed.map((file, index) => (
              <div
                key={file.fileSeq}
                style={{ ...localStyles.fileRow, ...(index > 0 ? localStyles.fileRowDivider : {}) }}
              >
                <FileText size={18} color="#173357" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={localStyles.fileName} title={file.fileName}>
                    {file.fileName}
                  </div>
                  <div style={localStyles.fileMeta}>
                    #{file.fileSeq}
                    {file.totalFindings ? ` · 취약점 ${file.totalFindings}건` : ""}
                    {file.componentCount ? ` · 구성요소 ${file.componentCount.toLocaleString()}개` : ""}
                  </div>
                </div>
              </div>
            ))}
            {hiddenCount > 0 && (
              <div style={{ ...localStyles.fileRowDivider, ...localStyles.moreRow }}>
                외 {hiddenCount}개
              </div>
            )}
          </div>

          <div style={styles.errorBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={16} />
              <strong>삭제하면 되돌릴 수 없습니다.</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
              <li>업로드한 원본 파일이 서버에서 삭제됩니다.</li>
              <li>취약점 결과, 구성요소, 정책 판정 기록이 함께 삭제됩니다.</li>
            </ul>
          </div>

          {failures.length > 0 && (
            <div style={styles.errorBox}>
              <strong>
                {deletedCount > 0
                  ? `${deletedCount}개는 삭제했지만 ${failures.length}개는 삭제하지 못했습니다.`
                  : `${failures.length}개를 삭제하지 못했습니다.`}
              </strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                {failures.map((f) => (
                  <li key={f.file.fileSeq}>
                    {f.file.fileName}: {f.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button
            ref={cancelRef}
            type="button"
            style={styles.button}
            onClick={onClose}
            disabled={submitting}
          >
            {failures.length > 0 ? "닫기" : "취소"}
          </button>
          <button
            type="button"
            style={{
              ...styles.button,
              background: "#dc2626",
              borderColor: "#dc2626",
              color: "#ffffff",
              ...(submitting ? styles.disabledButton : {}),
            }}
            onClick={handleDelete}
            disabled={submitting}
          >
            <Trash2 size={16} />
            {submitting
              ? "삭제 중..."
              : failures.length > 0
                ? "다시 시도"
                : isSingle
                  ? "삭제"
                  : `${targets.length}개 삭제`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const localStyles: Record<string, CSSProperties> = {
  fileList: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
  },
  fileRowDivider: {
    borderTop: "1px solid #e2e8f0",
  },
  moreRow: {
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },
  fileName: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
  },
};
