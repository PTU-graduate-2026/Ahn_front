import React, { useMemo, useRef, useState } from "react";
import { ArrowRight, CloudUpload, FileArchive, FileCode, X } from "lucide-react";
import { fileUploadStyles as s } from "../styles/fileUpload";

type Props = {
  accept?: string;
  multiple?: boolean;
  isUploading?: boolean;
  onFilesChange?: (files: File[]) => void;
  onAnalyze?: (files: File[]) => void;
};

// accept와 맞춘 안내 칩 (형식 추가하면 같이 수정)
const formats = ["SPDX", "CycloneDX", "JSON · XML · YAML", "ZIP"];

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export default function FileInputBox({
  accept = ".json,.xml,.spdx,.cdx,.yaml,.zip",
  multiple = true,
  isUploading = false,
  onFilesChange,
  onAnalyze,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const zoneStyle = useMemo(
    () => ({ ...s.dropZone, ...(isDragging ? s.dropZoneActive : {}) }),
    [isDragging],
  );

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);

    // 중복(이름+사이즈) 제거
    const next = [...files];
    for (const f of list) {
      const exists = next.some((x) => x.name === f.name && x.size === f.size);
      if (!exists) next.push(f);
    }

    const finalFiles = multiple ? next : next.slice(0, 1);
    setFiles(finalFiles);
    onFilesChange?.(finalFiles);
  };

  const onPick = () => inputRef.current?.click();

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setIsDragging(false);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files?.length) return;
    addFiles(e.dataTransfer.files);
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onFilesChange?.(next);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesChange?.([]);
  };

  return (
    <div style={s.dropCard}>
      {/* 영역 전체를 눌러도 파일 선택 (키보드 Enter/Space도) */}
      <div
        style={zoneStyle}
        role="button"
        tabIndex={0}
        aria-label="분석할 파일 선택"
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPick();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div style={s.dropIcon}>
          <CloudUpload size={28} />
        </div>
        <div style={s.dropTitle}>
          {isDragging ? "여기에 놓으면 추가됩니다" : "파일을 끌어다 놓거나 클릭해서 선택하세요"}
        </div>
        <div style={s.dropHelper}>SBOM 파일 또는 프로젝트 압축 파일 · 여러 개 선택 가능</div>
        <button
          type="button"
          style={s.pickButton}
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
        >
          파일 선택
        </button>
        <div style={s.formatRow}>
          {formats.map((format) => (
            <span key={format} style={s.formatChip}>
              {format}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          style={{ display: "none" }}
        />
      </div>

      {files.length > 0 && (
        <>
          <div style={s.listHeader}>
            <span>선택한 파일 {files.length}개</span>
            <button type="button" style={s.textButton} onClick={clearAll} disabled={isUploading}>
              전체 비우기
            </button>
          </div>

          <div style={s.fileList}>
            {files.map((f, idx) => {
              const isLast = idx === files.length - 1;
              const isZip = f.name.toLowerCase().endsWith(".zip");
              return (
                <div
                  key={`${f.name}-${f.size}-${idx}`}
                  style={{ ...s.fileRow, ...(isLast ? s.fileRowLast : {}) }}
                >
                  <div style={s.fileIcon}>{isZip ? <FileArchive size={18} /> : <FileCode size={18} />}</div>
                  <div style={s.fileMeta}>
                    <div style={s.fileName} title={f.name}>
                      {f.name}
                    </div>
                    <div style={s.fileSize}>
                      {formatSize(f.size)} · {isZip ? "프로젝트 압축" : "SBOM"}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={s.removeBtn}
                    aria-label={`${f.name} 제거`}
                    disabled={isUploading}
                    onClick={() => removeAt(idx)}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={s.actionRow}>
            <button
              type="button"
              style={{ ...s.primaryBtn, ...(isUploading ? s.primaryBtnDisabled : {}) }}
              disabled={isUploading}
              onClick={() => onAnalyze?.(files)}
            >
              {isUploading ? (
                "업로드 및 분석 중..."
              ) : (
                <>
                  {files.length}개 파일 분석 시작 <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
